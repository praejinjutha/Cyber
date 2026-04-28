import "../admin.css";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiEye,
  FiMail,
  FiUser,
  FiClipboard,
  FiBarChart2,
  FiUsers,
  FiTrendingUp,
  FiActivity,
} from "react-icons/fi";
import { supabase } from "../lib/supabase";

function clampInt(n, a, b) {
  return Math.max(a, Math.min(b, Math.floor(n)));
}

function safeNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function mean(arr) {
  if (!arr.length) return null;
  return arr.reduce((s, x) => s + x, 0) / arr.length;
}

function sampleStdDev(arr) {
  if (arr.length < 2) return null;
  const m = mean(arr);
  const variance =
    arr.reduce((s, x) => s + Math.pow(x - m, 2), 0) / (arr.length - 1);
  return Math.sqrt(variance);
}

function formatNumber(v, digits = 2) {
  if (v == null || !Number.isFinite(v)) return "—";
  return Number(v).toFixed(digits);
}

/* =========================
   Math helpers for p-value
   ========================= */

function gammaln(x) {
  const cof = [
    76.18009172947146,
    -86.50532032941677,
    24.01409824083091,
    -1.231739572450155,
    0.001208650973866179,
    -0.000005395239384953,
  ];

  let y = x;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);

  let ser = 1.000000000190015;
  for (let j = 0; j < cof.length; j++) {
    y += 1;
    ser += cof[j] / y;
  }

  return -tmp + Math.log(2.5066282746310005 * ser / x);
}

function betacf(a, b, x) {
  const MAXIT = 100;
  const EPS = 3e-7;
  const FPMIN = 1e-30;

  let qab = a + b;
  let qap = a + 1;
  let qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d;
  let h = d;

  for (let m = 1; m <= MAXIT; m++) {
    let m2 = 2 * m;

    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    h *= d * c;

    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c;
    h *= del;

    if (Math.abs(del - 1) < EPS) break;
  }

  return h;
}

function ibeta(x, a, b) {
  if (x < 0 || x > 1) return NaN;
  if (x === 0 || x === 1) return x;

  const bt = Math.exp(
    gammaln(a + b) - gammaln(a) - gammaln(b) + a * Math.log(x) + b * Math.log(1 - x)
  );

  if (x < (a + 1) / (a + b + 2)) {
    return (bt * betacf(a, b, x)) / a;
  }

  return 1 - (bt * betacf(b, a, 1 - x)) / b;
}

function studentTCdf(t, df) {
  if (!Number.isFinite(t) || !Number.isFinite(df) || df <= 0) return NaN;
  if (t === 0) return 0.5;

  const x = df / (df + t * t);
  const a = df / 2;
  const b = 0.5;
  const ib = ibeta(x, a, b);

  if (t > 0) {
    return 1 - 0.5 * ib;
  }
  return 0.5 * ib;
}

function pairedTTest(rows) {
  if (!rows || rows.length < 2) {
    return {
      n: rows?.length || 0,
      preMean: null,
      postMean: null,
      gainMean: null,
      sdDiff: null,
      t: null,
      df: null,
      p: null,
      significant: false,
      hasEnoughData: false,
    };
  }

  const pres = rows.map((x) => x.pretest_score);
  const posts = rows.map((x) => x.posttest_score);
  const diffs = rows.map((x) => x.posttest_score - x.pretest_score);

  const preMean = mean(pres);
  const postMean = mean(posts);
  const gainMean = mean(diffs);
  const sdDiff = sampleStdDev(diffs);
  const n = diffs.length;
  const df = n - 1;

  if (sdDiff == null || sdDiff === 0) {
    return {
      n,
      preMean,
      postMean,
      gainMean,
      sdDiff,
      t: null,
      df,
      p: null,
      significant: false,
      hasEnoughData: false,
    };
  }

  const t = gainMean / (sdDiff / Math.sqrt(n));
  const cdf = studentTCdf(Math.abs(t), df);
  const p = 2 * (1 - cdf);

  return {
    n,
    preMean,
    postMean,
    gainMean,
    sdDiff,
    t,
    df,
    p,
    significant: Number.isFinite(p) ? p < 0.05 : false,
    hasEnoughData: true,
  };
}

const PAGE_SIZE = 10;

export default function DataAdmin() {
  // =========================
  // List states
  // =========================
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // =========================
  // Group analysis states
  // =========================
  const [groupPairs, setGroupPairs] = useState([]);
  const [groupLoading, setGroupLoading] = useState(true);
  const [groupErr, setGroupErr] = useState("");

  // =========================
  // Filter states
  // =========================
  const [q, setQ] = useState("");
  const [onlyCompleted, setOnlyCompleted] = useState(false);

  // =========================
  // Modal states
  // =========================
  const [selected, setSelected] = useState(null);

  // =========================
  // Score states (shown only in popup)
  // =========================
  const [scoreLoading, setScoreLoading] = useState(false);
  const [scoreErr, setScoreErr] = useState("");

  const [pretestSummary, setPretestSummary] = useState(null);
  const [programPostSummary, setProgramPostSummary] = useState(null);
  const [scoresByUnit, setScoresByUnit] = useState({});

  // =========================
  // Pagination
  // =========================
  const [page, setPage] = useState(1);

  // =========================
  // Load student list + group paired scores
  // =========================
  useEffect(() => {
    let alive = true;

    async function loadAll() {
      setLoading(true);
      setGroupLoading(true);
      setErr("");
      setGroupErr("");

      try {
        const [
          studentsRes,
          pretestsRes,
          finalsRes,
        ] = await Promise.all([
          supabase
            .from("v_admin_students")
            .select(
              "user_id, email, first_name, last_name, full_name, age, created_at, updated_at, profile_completed"
            )
            .order("email", { ascending: true }),

          supabase
            .from("pretest_results")
            .select("user_id, total_score"),

          supabase
            .from("final_test_results")
            .select("user_id, first_total_score"),
        ]);

        if (!alive) return;

        const { data: studentsData, error: studentsErr } = studentsRes;
        const { data: pretestsData, error: pretestsErr } = pretestsRes;
        const { data: finalsData, error: finalsErr } = finalsRes;

        if (studentsErr) {
          setErr(studentsErr.message || "โหลดข้อมูลผู้เรียนไม่สำเร็จ");
          setRows([]);
        } else {
          const mapped = (studentsData || []).map((x) => ({
            id: x.user_id,
            user_id: x.user_id,
            email: x.email || "—",
            name: x.full_name || "ยังไม่ระบุชื่อ",
            age: x.age ?? null,
            profile_completed: !!x.profile_completed,
          }));
          setRows(mapped);
        }

        if (pretestsErr || finalsErr) {
          const parts = [];
          if (pretestsErr) parts.push(`pretest: ${pretestsErr.message}`);
          if (finalsErr) parts.push(`posttest: ${finalsErr.message}`);
          setGroupErr(`โหลดข้อมูล t-test ไม่สำเร็จบางส่วน (${parts.join(" | ")})`);
          setGroupPairs([]);
        } else {
          const preMap = new Map();
          const postMap = new Map();

          for (const row of pretestsData || []) {
            const score = safeNumber(row.total_score);
            if (row.user_id && score != null && !preMap.has(row.user_id)) {
              preMap.set(row.user_id, score);
            }
          }

          for (const row of finalsData || []) {
            const score = safeNumber(row.first_total_score);
            if (row.user_id && score != null && !postMap.has(row.user_id)) {
              postMap.set(row.user_id, score);
            }
          }

          const allUserIds = new Set([...preMap.keys(), ...postMap.keys()]);
          const pairs = [];

          for (const userId of allUserIds) {
            const pre = preMap.get(userId);
            const post = postMap.get(userId);

            if (pre != null && post != null) {
              pairs.push({
                user_id: userId,
                pretest_score: pre,
                posttest_score: post,
              });
            }
          }

          setGroupPairs(pairs);
        }
      } catch (e) {
        if (!alive) return;
        console.error("ADMIN load error:", e);
        setErr("โหลดข้อมูลไม่สำเร็จ");
        setGroupErr("โหลดข้อมูล t-test ไม่สำเร็จ");
        setRows([]);
        setGroupPairs([]);
      } finally {
        if (!alive) return;
        setLoading(false);
        setGroupLoading(false);
      }
    }

    loadAll();

    return () => {
      alive = false;
    };
  }, []);

  // =========================
  // Search / filter
  // =========================
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();

    let base = rows;
    if (onlyCompleted) {
      base = base.filter((x) => x.profile_completed);
    }

    return base.filter((x) => {
      if (!s) return true;
      return (
        (x.email || "").toLowerCase().includes(s) ||
        (x.name || "").toLowerCase().includes(s)
      );
    });
  }, [rows, q, onlyCompleted]);

  // =========================
  // Group t-test (based on current filtered list)
  // =========================
  const filteredUserIds = useMemo(() => {
    return new Set(filtered.map((x) => x.user_id));
  }, [filtered]);

  const visiblePairs = useMemo(() => {
    return groupPairs.filter((x) => filteredUserIds.has(x.user_id));
  }, [groupPairs, filteredUserIds]);

  const groupStats = useMemo(() => {
    return pairedTTest(visiblePairs);
  }, [visiblePairs]);

  // =========================
  // Pagination calculations
  // =========================
  const pageCount = useMemo(() => {
    return Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  }, [filtered.length]);

  const safePage = useMemo(() => {
    return clampInt(page, 1, pageCount);
  }, [page, pageCount]);

  const paged = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);

  useEffect(() => {
    setPage(1);
  }, [q, onlyCompleted]);

  const pageStart = useMemo(() => {
    return !filtered.length ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  }, [safePage, filtered.length]);

  const pageEnd = useMemo(() => {
    return Math.min(safePage * PAGE_SIZE, filtered.length);
  }, [safePage, filtered.length]);

  const pageWindow = useMemo(() => {
    const N = pageCount;
    const cur = clampInt(safePage, 1, N);
    const windowSize = 5;

    let start = Math.max(1, cur - Math.floor(windowSize / 2));
    let end = Math.min(N, start + windowSize - 1);
    start = Math.max(1, end - windowSize + 1);

    const nums = [];
    for (let i = start; i <= end; i++) nums.push(i);

    return { nums, cur };
  }, [safePage, pageCount]);

  // =========================
  // Load popup scores when selected changes
  // =========================
  useEffect(() => {
    if (!selected?.user_id) {
      setScoreLoading(false);
      setScoreErr("");
      setPretestSummary(null);
      setProgramPostSummary(null);
      setScoresByUnit({});
      return;
    }

    let alive = true;

    async function loadSelectedStudentScores() {
      try {
        setScoreLoading(true);
        setScoreErr("");
        setPretestSummary(null);
        setProgramPostSummary(null);
        setScoresByUnit({});

        // -------------------------
        // 1) Pretest summary
        // -------------------------
        const { data: pretestResult, error: pretestErr } = await supabase
          .from("pretest_results")
          .select("total_score")
          .eq("user_id", selected.user_id)
          .limit(1)
          .maybeSingle();

        if (!alive) return;

        if (pretestErr) {
          console.error("ADMIN pretest load error:", pretestErr);
          setScoreErr(`โหลดคะแนน pretest ไม่สำเร็จ: ${pretestErr.message}`);
        }

        setPretestSummary({
          done: pretestResult?.total_score != null,
          score: pretestResult?.total_score ?? null,
          max: 48,
        });

        // -------------------------
        // 2) Final / Post summary
        // -------------------------
        const { data: finalResult, error: finalErr } = await supabase
          .from("final_test_results")
          .select("first_total_score")
          .eq("user_id", selected.user_id)
          .limit(1)
          .maybeSingle();

        if (!alive) return;

        if (finalErr) {
          console.error("ADMIN final load error:", finalErr);
        }

        setProgramPostSummary({
          done: finalResult?.first_total_score != null,
          score: finalResult?.first_total_score ?? null,
          max: 48,
        });

        // -------------------------
        // 3) Unit posttests (first submitted only)
        // -------------------------
        const tasks = Array.from({ length: 8 }, (_, i) => i + 1).map(async (unit) => {
          const { data: posttest, error: posttestErr } = await supabase
            .from("posttests")
            .select("id")
            .eq("unit", unit)
            .eq("is_active", true)
            .maybeSingle();

          if (posttestErr) {
            return { unit, ok: false, error: posttestErr };
          }

          if (!posttest?.id) {
            return { unit, ok: true, attempt: null };
          }

          const { data: firstAttempt, error: attemptErr } = await supabase
            .from("posttest_attempts")
            .select("total_score, max_score, submitted_at")
            .eq("user_id", selected.user_id)
            .eq("posttest_id", posttest.id)
            .not("submitted_at", "is", null)
            .order("submitted_at", { ascending: true })
            .limit(1)
            .maybeSingle();

          if (attemptErr) {
            return { unit, ok: false, error: attemptErr };
          }

          if (firstAttempt) {
            return {
              unit,
              ok: true,
              attempt: {
                score: firstAttempt.total_score,
                max: firstAttempt.max_score,
              },
            };
          }

          return { unit, ok: true, attempt: null };
        });

        const results = await Promise.all(tasks);

        if (!alive) return;

        const map = {};
        const unitErrors = [];

        for (const r of results) {
          if (!r.ok) {
            unitErrors.push(r);
            continue;
          }

          if (r.attempt) {
            map[r.unit] = r.attempt;
          }
        }

        setScoresByUnit(map);

        if (unitErrors.length > 0) {
          setScoreErr("โหลดคะแนนบางส่วนไม่สำเร็จ");
        }
      } catch (e) {
        if (!alive) return;
        console.error("ADMIN score load error:", e);
        setScoreErr("โหลดคะแนนไม่สำเร็จ");
      } finally {
        if (!alive) return;
        setScoreLoading(false);
      }
    }

    loadSelectedStudentScores();

    return () => {
      alive = false;
    };
  }, [selected]);

  return (
    <div className="edu-app">
      <div className="edu-topbar">
        <div className="edu-topbar__inner">
          <div className="edu-topbar__brand">
            <div className="edu-brandtext">
              <div className="edu-brandtext__title">Admin Dashboard</div>
              <div className="edu-brandtext__subtitle">จัดการข้อมูลผู้เรียน</div>
            </div>
          </div>

          <div className="edu-topbar__right">
            <Link to="/admin/login" className="edu-btn" style={{ textDecoration: "none" }}>
              ออกจากหน้า Admin
            </Link>

            <Link
              to="/login"
              className="edu-btn edu-btn--ghost"
              style={{ textDecoration: "none" }}
            >
              ไปหน้า Student
            </Link>
          </div>
        </div>
      </div>

      <div className="edu-layout">
        <div className="edu-hero">
          <div className="edu-hero__card">
            <div className="edu-hero__title">สรุปรายชื่อผู้เรียน</div>

            <div className="edu-stats" style={{ marginTop: 14 }}>
              <div className="edu-stat">
                <div className="edu-stat__label">จำนวนผู้เรียนที่แสดง</div>
                <div className="edu-stat__value">{loading ? "…" : filtered.length}</div>
              </div>

              <div className="edu-stat">
                <div className="edu-stat__label">ผู้เรียนที่ใช้คำนวณ t-test</div>
                <div className="edu-stat__value">
                  {groupLoading ? "…" : groupStats.n}
                </div>
              </div>
            </div>

            {!!err && (
              <div style={{ marginTop: 12, color: "#ef4444", fontSize: 13 }}>{err}</div>
            )}

            {!!groupErr && (
              <div style={{ marginTop: 8, color: "#ef4444", fontSize: 13 }}>{groupErr}</div>
            )}
          </div>
        </div>

        <div className="edu-panel" style={{ marginBottom: 20 }}>
          <div className="edu-panel__head">
            <div className="edu-panel__title">วิเคราะห์ผลรวมผู้เรียน (Paired t-test)</div>
          </div>

          <div
            style={{
              padding: "18px 20px 20px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 14,
            }}
          >
            <div
              className="edu-emptyBox"
              style={{
                padding: "14px 16px",
                textAlign: "left",
                background: "#f8fafc",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "#475569",
                  fontSize: 13,
                  marginBottom: 8,
                }}
              >
                <FiUsers />
                จำนวนคู่ข้อมูล
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#0f172a" }}>
                {groupLoading ? "…" : groupStats.n}
              </div>
              <div style={{ marginTop: 6, fontSize: 12, color: "#94a3b8" }}>
                เฉพาะคนที่มีคะแนน pretest และ posttest ครบ
              </div>
            </div>

            <div
              className="edu-emptyBox"
              style={{
                padding: "14px 16px",
                textAlign: "left",
                background: "#f8fafc",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "#475569",
                  fontSize: 13,
                  marginBottom: 8,
                }}
              >
                <FiClipboard />
                ค่าเฉลี่ยก่อนเรียน
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#0f172a" }}>
                {groupLoading ? "…" : formatNumber(groupStats.preMean, 2)}
              </div>
              <div style={{ marginTop: 6, fontSize: 12, color: "#94a3b8" }}>
                Mean Pretest
              </div>
            </div>

            <div
              className="edu-emptyBox"
              style={{
                padding: "14px 16px",
                textAlign: "left",
                background: "#f8fafc",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "#475569",
                  fontSize: 13,
                  marginBottom: 8,
                }}
              >
                <FiBarChart2 />
                ค่าเฉลี่ยหลังเรียน
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#0f172a" }}>
                {groupLoading ? "…" : formatNumber(groupStats.postMean, 2)}
              </div>
              <div style={{ marginTop: 6, fontSize: 12, color: "#94a3b8" }}>
                Mean Posttest
              </div>
            </div>

            <div
              className="edu-emptyBox"
              style={{
                padding: "14px 16px",
                textAlign: "left",
                background: "#f8fafc",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "#475569",
                  fontSize: 13,
                  marginBottom: 8,
                }}
              >
                <FiTrendingUp />
                ค่าเฉลี่ยที่เพิ่มขึ้น
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#0f172a" }}>
                {groupLoading ? "…" : formatNumber(groupStats.gainMean, 2)}
              </div>
              <div style={{ marginTop: 6, fontSize: 12, color: "#94a3b8" }}>
                Posttest - Pretest
              </div>
            </div>

            <div
              className="edu-emptyBox"
              style={{
                padding: "14px 16px",
                textAlign: "left",
                background: "#f8fafc",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "#475569",
                  fontSize: 13,
                  marginBottom: 8,
                }}
              >
                <FiActivity />
                ค่า t
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#0f172a" }}>
                {groupLoading ? "…" : formatNumber(groupStats.t, 4)}
              </div>
              <div style={{ marginTop: 6, fontSize: 12, color: "#94a3b8" }}>
                df = {groupLoading ? "…" : groupStats.df ?? "—"}
              </div>
            </div>

            <div
              className="edu-emptyBox"
              style={{
                padding: "14px 16px",
                textAlign: "left",
                background: "#f8fafc",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "#475569",
                  fontSize: 13,
                  marginBottom: 8,
                }}
              >
                <FiActivity />
                ค่า p และผลสรุป
              </div>

              {groupLoading ? (
                <div style={{ fontSize: 24, fontWeight: 700, color: "#0f172a" }}>…</div>
              ) : groupStats.hasEnoughData ? (
                <>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "#0f172a" }}>
                    {formatNumber(groupStats.p, 6)}
                  </div>

                  <div style={{ marginTop: 10 }}>
                    <span
                      className={`edu-badge ${
                        groupStats.significant ? "edu-badge--success" : ""
                      }`}
                      style={{ fontSize: 12 }}
                    >
                      {groupStats.significant
                        ? "มีนัยสำคัญทางสถิติ (p < .05)"
                        : "ไม่มีนัยสำคัญทางสถิติ"}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "#64748b" }}>
                    ข้อมูลไม่พอสำหรับคำนวณ
                  </div>
                  <div style={{ marginTop: 6, fontSize: 12, color: "#94a3b8" }}>
                    ต้องมีอย่างน้อย 2 คน และคะแนนต้องไม่เหมือนกันทุกคน
                  </div>
                </>
              )}
            </div>
          </div>

          <div style={{ padding: "0 20px 18px", fontSize: 12, color: "#94a3b8" }}>
            * ระบบนี้ใช้ paired t-test จากคะแนนก่อนเรียนและหลังเรียนของผู้เรียนคนเดิม
            และจะคำนวณตามข้อมูลที่กำลังแสดงจาก filter ปัจจุบัน
          </div>
        </div>

        <div className="edu-panel">
          <div className="edu-panel__head">
            <div className="edu-panel__title">รายการผู้เรียน</div>
          </div>

          <div
            className="edu-lessons__toolbar"
            style={{
              display: "flex",
              gap: 20,
              flexWrap: "wrap",
              paddingBottom: 15,
            }}
          >
            <input
              className="edu-input"
              placeholder="ค้นหา: อีเมล หรือ ชื่อ"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ flex: "0 0 350px" }}
            />

            <label
              className="edu-chip"
              style={{
                cursor: "pointer",
                background: "none",
                border: "none",
                display: "flex",
                alignItems: "center",
              }}
            >
              <input
                type="checkbox"
                checked={onlyCompleted}
                onChange={(e) => setOnlyCompleted(e.target.checked)}
                style={{ width: 18, height: 18, marginRight: 10 }}
              />
              <span style={{ fontSize: 14, color: "#64748b" }}>
                เฉพาะคนที่ “กรอกโปรไฟล์แล้ว”
              </span>
            </label>
          </div>

          <div className="edu-tableWrap">
            <div className="edu-tableHead">
              <div className="edu-th">อีเมลผู้ใช้งาน</div>
              <div className="edu-th">สถานะโปรไฟล์</div>
              <div className="edu-th" style={{ textAlign: "right" }}>
                เรียกดู
              </div>
            </div>

            <div className="edu-tableBody">
              {loading && <div className="edu-emptyRow">กำลังโหลดข้อมูล…</div>}

              {!loading &&
                paged.map((s) => (
                  <div key={s.user_id} className="edu-tr">
                    <div className="edu-td">
                      <span style={{ fontWeight: 500, color: "#334155" }}>{s.email}</span>
                    </div>

                    <div className="edu-td">
                      <span
                        className={`edu-badge ${
                          s.profile_completed ? "edu-badge--success" : ""
                        }`}
                      >
                        {s.profile_completed ? "กรอกชื่อแล้ว" : "ยังไม่กรอก"}
                      </span>
                    </div>

                    <div className="edu-td">
                      <button
                        className="edu-mini--solid"
                        onClick={() => setSelected(s)}
                        title="ดูรายละเอียด"
                      >
                        <FiEye size={20} />
                      </button>
                    </div>
                  </div>
                ))}

              {!loading && filtered.length === 0 && (
                <div className="edu-emptyRow">ไม่พบข้อมูลผู้เรียน</div>
              )}
            </div>
          </div>

          <div className="edu-pager">
            <div className="edu-pager__left">
              แสดง {pageStart}-{pageEnd} จาก {filtered.length} คน
            </div>

            <div className="edu-pager__right">
              <button
                className="edu-pagerBtn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
              >
                ←
              </button>

              <div className="edu-pagerNums">
                {pageWindow.nums.map((n) => (
                  <button
                    key={n}
                    className={`edu-pagerNum ${safePage === n ? "is-active" : ""}`}
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>

              <button
                className="edu-pagerBtn"
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                disabled={safePage >= pageCount}
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>

      {selected && (
        <div
          className="edu-modalOverlay"
          onMouseDown={(e) => e.target === e.currentTarget && setSelected(null)}
        >
          <div className="edu-modal">
            <div className="edu-modal__head">
              <div className="edu-modal__title">ข้อมูลผู้เรียนอย่างละเอียด</div>
            </div>

            <div className="edu-modal__sub" style={{ padding: "20px" }}>
              <div
                className="edu-modal__name"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  color: "#1e293b",
                  fontSize: "1.2rem",
                }}
              >
                <div
                  style={{
                    background: "#eff6ff",
                    padding: 8,
                    borderRadius: 10,
                    display: "flex",
                  }}
                >
                  <FiUser color="#2563eb" />
                </div>
                <strong>{selected.name}</strong>
              </div>

              <div
                style={{
                  marginTop: 15,
                  color: "#64748b",
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: 15,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <FiMail size={16} /> {selected.email}
                </div>

                <div className="edu-badge" style={{ fontSize: 12 }}>
                  อายุ: {selected.age || "—"} ปี
                </div>
              </div>
            </div>

            <div className="edu-modal__grid" style={{ padding: "0 20px 20px" }}>
              {!!scoreErr && (
                <div style={{ marginBottom: 12, color: "#ef4444", fontSize: 13 }}>
                  {scoreErr}
                </div>
              )}

              <div className="edu-modalCard" style={{ marginBottom: 16 }}>
                <div
                  className="edu-modalCard__title"
                  style={{
                    marginBottom: 15,
                    fontSize: 14,
                    color: "#475569",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <FiClipboard />
                    คะแนนก่อนเรียน
                  </span>

                  <span style={{ fontSize: 12, color: "#94a3b8" }}>
                    {scoreLoading ? "กำลังโหลด..." : "แสดงใน Admin"}
                  </span>
                </div>

                <div
                  className="edu-emptyBox"
                  style={{
                    padding: "12px 15px",
                    textAlign: "left",
                    background: "#f8fafc",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <span style={{ fontWeight: 600, color: "#334155" }}>Pretest รวม</span>

                  {scoreLoading ? (
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>…</span>
                  ) : pretestSummary?.done ? (
                    <span className="edu-badge edu-badge--success" style={{ fontSize: 11 }}>
                      ทำแล้ว • {pretestSummary.score}/{pretestSummary.max}
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>ยังไม่ทำ</span>
                  )}
                </div>
              </div>

              <div className="edu-modalCard" style={{ marginBottom: 16 }}>
                <div
                  className="edu-modalCard__title"
                  style={{
                    marginBottom: 15,
                    fontSize: 14,
                    color: "#475569",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <FiBarChart2 />
                    คะแนนสรุปหลังเรียน
                  </span>

                  <span style={{ fontSize: 12, color: "#94a3b8" }}>
                    {scoreLoading ? "กำลังโหลด..." : "แสดงใน Admin"}
                  </span>
                </div>

                <div
                  className="edu-emptyBox"
                  style={{
                    padding: "12px 15px",
                    textAlign: "left",
                    background: "#f8fafc",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <span style={{ fontWeight: 600, color: "#334155" }}>Post-test / Final</span>

                  {scoreLoading ? (
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>…</span>
                  ) : programPostSummary?.done ? (
                    <span className="edu-badge edu-badge--success" style={{ fontSize: 11 }}>
                      ทำแล้ว • {programPostSummary.score}/{programPostSummary.max}
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>ยังไม่ทำ</span>
                  )}
                </div>
              </div>

              <div className="edu-modalCard">
                <div
                  className="edu-modalCard__title"
                  style={{
                    marginBottom: 15,
                    fontSize: 14,
                    color: "#475569",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <span>สถานะบทเรียน (Posttest ครั้งแรก • Unit 1-8)</span>

                  <span style={{ fontSize: 12, color: "#94a3b8" }}>
                    {scoreLoading ? "กำลังโหลดคะแนน…" : "แสดงผลใน Admin"}
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  {Array.from({ length: 8 }, (_, i) => i + 1).map((u) => {
                    const s = scoresByUnit[u];
                    const done = !!s;

                    return (
                      <div
                        key={u}
                        className="edu-emptyBox"
                        style={{
                          padding: "12px 15px",
                          textAlign: "left",
                          background: "#f8fafc",
                          borderRadius: "10px",
                          border: "1px solid #e2e8f0",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <span style={{ fontWeight: 600, color: "#334155" }}>Unit {u}</span>

                        {scoreLoading ? (
                          <span style={{ fontSize: 11, color: "#94a3b8" }}>…</span>
                        ) : done ? (
                          <span
                            className="edu-badge edu-badge--success"
                            style={{ fontSize: 11 }}
                          >
                            ทำแล้ว • {s.score}/{s.max}
                          </span>
                        ) : (
                          <span style={{ fontSize: 11, color: "#94a3b8" }}>ยังไม่ทำ</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div style={{ marginTop: 12, fontSize: 12, color: "#94a3b8" }}>
                  *คะแนนที่แสดงคือ “การส่งครั้งแรก (First submit)” ของแต่ละหน่วย ตามเวลา
                  submitted_at
                </div>
              </div>
            </div>

            <div className="edu-modal__foot" style={{ padding: "15px 20px" }}>
              <button
                className="edu-btn edu-btn--primary"
                onClick={() => setSelected(null)}
                style={{ width: "100%", padding: "12px" }}
              >
                ปิดหน้าต่างรายละเอียด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}