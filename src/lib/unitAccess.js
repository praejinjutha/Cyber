import { supabase } from "./supabase";

const PASS_PERCENT = 80;
const TOTAL_UNITS = 8;

function calcPercent(total, max) {
  const safeTotal = Number(total) || 0;
  const safeMax = Number(max) || 0;
  if (safeMax <= 0) return 0;
  return Math.round((safeTotal / safeMax) * 100);
}

function parsePassMap(raw) {
  if (!raw) return new Set();

  let obj = raw;

  if (typeof raw === "string") {
    try {
      obj = JSON.parse(raw);
    } catch {
      return new Set();
    }
  }

  if (typeof obj !== "object" || obj === null) return new Set();

  const passed = new Set();

  Object.entries(obj).forEach(([key, value]) => {
    const unitNo = Number(key);
    if (!Number.isInteger(unitNo)) return;

    const isPassed =
      value === true ||
      value === "true" ||
      value === 1 ||
      value === "1";

    if (isPassed) {
      passed.add(unitNo);
    }
  });

  return passed;
}

function extractLatestAttemptByUnit(rows) {
  const latestMap = new Map();

  for (const row of rows || []) {
    const related = row?.posttests;
    const unit = Array.isArray(related) ? related[0]?.unit : related?.unit;
    const unitNo = Number(unit);

    if (!Number.isInteger(unitNo)) continue;
    if (!row?.submitted_at) continue;

    const currentTime = new Date(row.submitted_at).getTime();
    const prev = latestMap.get(unitNo);

    if (!prev) {
      latestMap.set(unitNo, row);
      continue;
    }

    const prevTime = new Date(prev.submitted_at).getTime();
    if (currentTime > prevTime) {
      latestMap.set(unitNo, row);
    }
  }

  return latestMap;
}

export async function canAccessUnit(userId, unitNo) {
  const targetUnit = Number(unitNo);

  if (!Number.isInteger(targetUnit) || targetUnit < 1 || targetUnit > TOTAL_UNITS) {
    return { allowed: false, reason: "invalid_unit" };
  }

  // โหลด pretest
  const { data: pretestRow, error: pretestErr } = await supabase
    .from("pretest_results")
    .select("pass_map")
    .eq("user_id", userId)
    .maybeSingle();

  if (pretestErr) throw pretestErr;
  if (!pretestRow) {
    return { allowed: false, reason: "no_pretest" };
  }

  const pretestPassedSet = parsePassMap(pretestRow.pass_map);

  // ✅ ถ้าผ่านจาก pretest บทนี้แล้ว เข้าได้เลย
  if (pretestPassedSet.has(targetUnit)) {
    return { allowed: true, reason: "passed_by_pretest" };
  }

  // โหลด posttest attempts ล่าสุดของแต่ละ unit
  const { data: attemptRows, error: postErr } = await supabase
    .from("posttest_attempts")
    .select(`
      total_score,
      max_score,
      submitted_at,
      posttests!inner (
        unit,
        is_active
      )
    `)
    .eq("user_id", userId)
    .not("submitted_at", "is", null)
    .eq("posttests.is_active", true);

  if (postErr) throw postErr;

  const latestMap = extractLatestAttemptByUnit(attemptRows || []);

  // mastered = ผ่าน pretest + ผ่าน posttest ล่าสุด
  const masteredSet = new Set([...pretestPassedSet]);

  for (const [unitNoNum, row] of latestMap.entries()) {
    const total = Number(row?.total_score) || 0;
    const max = Number(row?.max_score) || 0;
    const percent = calcPercent(total, max);

    if (percent >= PASS_PERCENT) {
      masteredSet.add(unitNoNum);
    }
  }

  // ถ้าบทนี้ผ่าน posttest แล้ว ก็เข้าได้
  if (masteredSet.has(targetUnit)) {
    return { allowed: true, reason: "already_mastered" };
  }

  // หา "บทแรกที่ยังไม่ผ่าน"
  let nextTarget = null;
  for (let i = 1; i <= TOTAL_UNITS; i++) {
    if (!masteredSet.has(i)) {
      nextTarget = i;
      break;
    }
  }

  // ✅ เข้าได้เฉพาะบทแรกที่ยังไม่ผ่าน
  const allowed = targetUnit === nextTarget;

  return {
    allowed,
    reason: allowed ? "next_target" : "locked",
    nextTarget,
    masteredSet: [...masteredSet].sort((a, b) => a - b),
  };
}