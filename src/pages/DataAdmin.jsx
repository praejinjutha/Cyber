import "../admin.css";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiEye, FiMail, FiUser } from "react-icons/fi";
import { supabase } from "../lib/supabase";

/**
 * ฟังก์ชันช่วย Clamp ค่าตัวเลขสำหรับ Pagination
 * - ป้องกัน page หลุดช่วง เช่น ติดลบ หรือเกินจำนวนหน้า
 */
function clampInt(n, a, b) {
  return Math.max(a, Math.min(b, Math.floor(n)));
}

export default function DataAdmin() {
  // =========================
  // State Management: ตารางรายชื่อ (Admin list)
  // =========================
  const [rows, setRows] = useState([]); // เก็บรายการผู้เรียนทั้งหมดที่ดึงมาจาก view
  const [loading, setLoading] = useState(true); // สถานะโหลดรายชื่อ
  const [err, setErr] = useState(""); // error สำหรับโหลดรายชื่อ

  // =========================
  // State: ค้นหา / ฟิลเตอร์
  // =========================
  const [q, setQ] = useState(""); // search query
  const [onlyCompleted, setOnlyCompleted] = useState(false); // filter เฉพาะกรอกโปรไฟล์แล้ว

  // =========================
  // State: Modal (Popup) เลือกผู้เรียน
  // =========================
  const [selected, setSelected] = useState(null); // ข้อมูลผู้เรียนที่กดดูรายละเอียด

  // =========================
  // State: คะแนนรายบทของผู้เรียนที่เลือก (ดึงแบบ "ครั้งแรกที่ submit" เหมือน DashScore)
  // =========================
  const [scoresLoading, setScoresLoading] = useState(false); // สถานะกำลังโหลดคะแนน
  const [scoresErr, setScoresErr] = useState(""); // error ของการโหลดคะแนนรายบท
  const [scoresByUnit, setScoresByUnit] = useState({}); // { 1: {score,max}, 2: {...}, ... }

  // =========================
  // Pagination
  // =========================
  const PAGE_SIZE = 10; // จำนวนแถวต่อหน้า
  const [page, setPage] = useState(1); // หน้าปัจจุบัน

  // =========================
  // Data Fetching: โหลดรายชื่อผู้เรียนทั้งหมดสำหรับ Admin
  // =========================
  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setErr("");

      // ดึงข้อมูลจาก view v_admin_students
      const { data, error } = await supabase
        .from("v_admin_students")
        .select(
          "user_id, email, first_name, last_name, full_name, age, created_at, updated_at, profile_completed"
        )
        .order("email", { ascending: true });

      // ถ้า component unmount แล้ว ไม่ต้อง set state
      if (!alive) return;

      if (error) {
        // ถ้ามี error ให้แสดงข้อความและเคลียร์รายการ
        setErr(error.message || "โหลดข้อมูลไม่สำเร็จ");
        setRows([]);
      } else {
        // map โครงสร้างให้เหมาะกับ UI
        const mapped = (data || []).map((x) => ({
          id: x.user_id, // key สำหรับ list
          user_id: x.user_id, // เก็บ user id ไว้ใช้งาน
          email: x.email || "—", // ถ้าไม่มีอีเมล แสดง —
          name: x.full_name || "ยังไม่ระบุชื่อ", // ชื่อเต็ม (ถ้าไม่มีให้ fallback)
          age: x.age ?? null, // อายุ
          profile_completed: !!x.profile_completed, // สถานะกรอกโปรไฟล์
        }));
        setRows(mapped);
      }

      setLoading(false);
    }

    load();

    // cleanup
    return () => {
      alive = false;
    };
  }, []);

  // =========================
  // Logic: Filtering & Search
  // =========================
  const filtered = useMemo(() => {
    // ทำ search แบบ case-insensitive
    const s = q.trim().toLowerCase();

    // base คือ rows ทั้งหมด
    let base = rows;

    // ถ้าเลือกเฉพาะกรอกโปรไฟล์แล้ว
    if (onlyCompleted) {
      base = base.filter((x) => x.profile_completed);
    }

    // filter ตามคำค้น: email หรือ name
    return base.filter((x) => {
      if (!s) return true;
      return (
        (x.email || "").toLowerCase().includes(s) ||
        (x.name || "").toLowerCase().includes(s)
      );
    });
  }, [rows, q, onlyCompleted]);

  // =========================
  // Logic: Pagination
  // =========================
  const pageCount = useMemo(() => {
    // อย่างน้อยต้องมี 1 หน้าเสมอ (กันหาร 0 / UI พัง)
    return Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  }, [filtered.length]);

  const paged = useMemo(() => {
    // clamp หน้าปัจจุบันให้อยู่ในช่วง 1..pageCount
    const p = clampInt(page, 1, pageCount);

    // คำนวณ index เริ่มต้นสำหรับ slice
    const start = (p - 1) * PAGE_SIZE;

    // คืนรายการเฉพาะหน้าปัจจุบัน
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page, pageCount]);

  // ถ้าค้นหา/ติ๊ก filter ใหม่ ให้กลับไปหน้า 1
  useEffect(() => {
    setPage(1);
  }, [q, onlyCompleted]);

  // ค่าขอบเขตการแสดงผล เช่น "แสดง 1-10 จาก 58 คน"
  const pageStart = useMemo(() => {
    return !filtered.length ? 0 : (page - 1) * PAGE_SIZE + 1;
  }, [page, filtered.length]);

  const pageEnd = useMemo(() => {
    return Math.min(page * PAGE_SIZE, filtered.length);
  }, [page, filtered.length]);

  // สร้างหน้าต่างตัวเลข pagination (แสดง 5 หน้า)
  const pageWindow = useMemo(() => {
    const N = pageCount;
    const cur = clampInt(page, 1, N);
    const windowSize = 5;

    let start = Math.max(1, cur - Math.floor(windowSize / 2));
    let end = Math.min(N, start + windowSize - 1);

    // ปรับ start ใหม่ให้ได้จำนวนปุ่มตาม windowSize
    start = Math.max(1, end - windowSize + 1);

    const nums = [];
    for (let i = start; i <= end; i++) nums.push(i);

    return { nums, start, end, N, cur };
  }, [page, pageCount]);

  // =========================
  // Data Fetching: โหลดคะแนน Posttest รายบท (ครั้งแรก) สำหรับ user ที่ selected
  // - ทำงานเมื่อเปิด modal (selected เปลี่ยน)
  // - ใช้ logic เหมือน DashScore และ "ไม่ไปแก้ DashScore"
  // =========================
  useEffect(() => {
    // ถ้ายังไม่ได้เลือกใคร ก็เคลียร์ state คะแนน
    if (!selected?.user_id) {
      setScoresByUnit({});
      setScoresErr("");
      setScoresLoading(false);
      return;
    }

    let alive = true;

    const fetchScoresForSelected = async () => {
      try {
        setScoresLoading(true);
        setScoresErr("");
        setScoresByUnit({});

        const userId = selected.user_id;

        // ทำเป็น Promise.all เพื่อดึงครบ 8 บทเร็วขึ้น
        const tasks = Array.from({ length: 8 }, (_, i) => i + 1).map(
          async (unit) => {
            // 1) หา posttest id ของ unit นั้น
            const { data: posttest, error: posttestErr } = await supabase
              .from("posttests")
              .select("id")
              .eq("unit", unit)
              .eq("is_active", true)
              .maybeSingle();

            if (posttestErr) {
              // คืนค่าแบบ error เฉพาะ unit (ไม่ throw เพื่อไม่ให้พังทั้งชุด)
              return { unit, ok: false, error: posttestErr };
            }

            if (!posttest?.id) {
              // ไม่พบ posttest ของ unit นั้น
              return { unit, ok: true, attempt: null };
            }

            // 2) หา “ครั้งแรกที่ submit” ของ user นี้ ใน posttest นั้น
            const { data: firstAttempt, error: attemptErr } = await supabase
              .from("posttest_attempts")
              .select("total_score, max_score, submitted_at")
              .eq("user_id", userId)
              .eq("posttest_id", posttest.id)
              .not("submitted_at", "is", null)
              .order("submitted_at", { ascending: true })
              .limit(1)
              .maybeSingle();

            if (attemptErr) {
              return { unit, ok: false, error: attemptErr };
            }

            // ถ้ามี attempt แรก ก็คืนคะแนนกลับ
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

            // ถ้ายังไม่เคย submit
            return { unit, ok: true, attempt: null };
          }
        );

        // รันพร้อมกัน
        const results = await Promise.all(tasks);

        if (!alive) return;

        // สร้าง map คะแนนตาม unit
        const map = {};
        const errors = [];

        for (const r of results) {
          if (!r.ok) {
            // เก็บ error ไว้โชว์รวม ๆ
            errors.push(r);
            continue;
          }

          if (r.attempt) {
            map[r.unit] = r.attempt;
          }
        }

        // set state คะแนน
        setScoresByUnit(map);

        // ถ้ามี error บาง unit ให้แสดงข้อความเตือน (แต่ยังโชว์ unit ที่ดึงได้)
        if (errors.length) {
          setScoresErr("บางบทโหลดคะแนนไม่สำเร็จ (กรุณาลองใหม่หรือตรวจสอบฐานข้อมูล)");
        }
      } catch (e) {
        if (!alive) return;
        setScoresErr("โหลดคะแนนไม่สำเร็จ");
      } finally {
        if (!alive) return;
        setScoresLoading(false);
      }
    };

    fetchScoresForSelected();

    return () => {
      alive = false;
    };
  }, [selected]);

  // =========================
  // Render
  // =========================
  return (
    <div className="edu-app">
      {/* Topbar */}
      <div className="edu-topbar">
        <div className="edu-topbar__inner">
          <div className="edu-topbar__brand">
            <div className="edu-brandtext">
              <div className="edu-brandtext__title">Admin Dashboard</div>
              <div className="edu-brandtext__subtitle">จัดการข้อมูลผู้เรียน</div>
            </div>
          </div>

          <div className="edu-topbar__right">
            {/* ปุ่มนำทางออกจากหน้า admin */}
            <Link
              to="/admin/login"
              className="edu-btn"
              style={{ textDecoration: "none" }}
            >
              ออกจากหน้า Admin
            </Link>

            {/* ปุ่มไปหน้า student */}
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
        {/* Hero / Summary Stats */}
        <div className="edu-hero">
          <div className="edu-hero__card">
            <div className="edu-hero__title">สรุปรายชื่อผู้เรียน</div>

            <div className="edu-stats" style={{ marginTop: 14 }}>
              <div className="edu-stat">
                <div className="edu-stat__label">จำนวนผู้เรียน</div>
                <div className="edu-stat__value">
                  {loading ? "…" : filtered.length}
                </div>
              </div>
            </div>

            {/* error ของโหลดรายชื่อ */}
            {!!err && (
              <div style={{ marginTop: 12, color: "#ef4444", fontSize: 13 }}>
                {err}
              </div>
            )}
          </div>
        </div>

        {/* Main Content Panel */}
        <div className="edu-panel">
          <div className="edu-panel__head">
            <div className="edu-panel__title">รายการผู้เรียน</div>
          </div>

          {/* Toolbar & Search */}
          <div
            className="edu-lessons__toolbar"
            style={{
              display: "flex",
              gap: 20,
              flexWrap: "wrap",
              paddingBottom: 15,
            }}
          >
            {/* ช่องค้นหา */}
            <input
              className="edu-input"
              placeholder="ค้นหา: อีเมล หรือ ชื่อ"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ flex: "0 0 350px" }}
            />

            {/* checkbox filter */}
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

          {/* Table Area */}
          <div className="edu-tableWrap">
            {/* Table header */}
            <div className="edu-tableHead">
              <div className="edu-th">อีเมลผู้ใช้งาน</div>
              <div className="edu-th">สถานะโปรไฟล์</div>
              <div className="edu-th" style={{ textAlign: "right" }}>
                เรียกดู
              </div>
            </div>

            {/* Table body */}
            <div className="edu-tableBody">
              {/* แถวโหลด */}
              {loading && <div className="edu-emptyRow">กำลังโหลดข้อมูล…</div>}

              {/* แถวข้อมูล */}
              {!loading &&
                paged.map((s) => (
                  <div key={s.user_id} className="edu-tr">
                    {/* Column 1: Email */}
                    <div className="edu-td">
                      <span style={{ fontWeight: "500", color: "#334155" }}>
                        {s.email}
                      </span>
                    </div>

                    {/* Column 2: Status Badge */}
                    <div className="edu-td">
                      <span
                        className={`edu-badge ${
                          s.profile_completed ? "edu-badge--success" : ""
                        }`}
                      >
                        {s.profile_completed ? "กรอกชื่อแล้ว" : "ยังไม่กรอก"}
                      </span>
                    </div>

                    {/* Column 3: Action Button (ดูรายละเอียด) */}
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

              {/* ไม่พบข้อมูล */}
              {!loading && filtered.length === 0 && (
                <div className="edu-emptyRow">ไม่พบข้อมูลผู้เรียน</div>
              )}
            </div>
          </div>

          {/* Pagination Footer */}
          <div className="edu-pager">
            <div className="edu-pager__left">
              แสดง {pageStart}-{pageEnd} จาก {filtered.length} คน
            </div>

            <div className="edu-pager__right">
              {/* ปุ่มย้อนกลับ */}
              <button
                className="edu-pagerBtn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                ←
              </button>

              {/* กลุ่มตัวเลขหน้า */}
              <div className="edu-pagerNums">
                {pageWindow.nums.map((n) => (
                  <button
                    key={n}
                    className={`edu-pagerNum ${
                      page === n ? "is-active" : ""
                    }`}
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>

              {/* ปุ่มถัดไป */}
              <button
                className="edu-pagerBtn"
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                disabled={page >= pageCount}
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================
          Popup (Modal) แสดงรายละเอียด
      ========================= */}
      {selected && (
        <div
          className="edu-modalOverlay"
          onMouseDown={(e) =>
            e.target === e.currentTarget && setSelected(null)
          }
        >
          <div className="edu-modal">
            {/* หัว modal */}
            <div className="edu-modal__head">
              <div className="edu-modal__title">ข้อมูลผู้เรียนอย่างละเอียด</div>
            </div>

            {/* ข้อมูลพื้นฐาน */}
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

            {/* =========================
                ส่วนคะแนน Posttest รายบท (Unit 1-8) สำหรับ Admin
                - โชว์ “ครั้งแรกที่ submit” เหมือน DashScore
            ========================= */}
            <div className="edu-modal__grid" style={{ padding: "0 20px 20px" }}>
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

                  {/* สถานะโหลดคะแนน */}
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>
                    {scoresLoading ? "กำลังโหลดคะแนน…" : "แสดงผลใน Admin"}
                  </span>
                </div>

                {/* error บาง unit */}
                {!!scoresErr && (
                  <div style={{ marginBottom: 12, color: "#ef4444", fontSize: 13 }}>
                    {scoresErr}
                  </div>
                )}

                {/* grid unit */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  {Array.from({ length: 8 }, (_, i) => i + 1).map((u) => {
                    // คะแนนของ unit นี้ (ถ้ามี)
                    const s = scoresByUnit[u];

                    // done เมื่อมี score object
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
                        {/* label ซ้าย */}
                        <span style={{ fontWeight: "600", color: "#334155" }}>
                          Unit {u}
                        </span>

                        {/* status ขวา */}
                        {scoresLoading ? (
                          <span style={{ fontSize: 11, color: "#94a3b8" }}>
                            …
                          </span>
                        ) : done ? (
                          <span
                            className="edu-badge edu-badge--success"
                            style={{ fontSize: 11 }}
                          >
                            ทำแล้ว • {s.score}/{s.max}
                          </span>
                        ) : (
                          <span style={{ fontSize: 11, color: "#94a3b8" }}>
                            ยังไม่ทำ
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* หมายเหตุความหมายของคะแนน */}
                <div style={{ marginTop: 12, fontSize: 12, color: "#94a3b8" }}>
                  *คะแนนที่แสดงคือ “การส่งครั้งแรก (First submit)” ของแต่ละบท ตามเวลา submitted_at
                </div>
              </div>
            </div>

            {/* ปุ่มปิด modal */}
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
