import "../admin.css";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiEye } from "react-icons/fi";  // Import FiEye

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function mean(arr) {
  if (!arr.length) return 0;
  return arr.reduce((s, x) => s + x, 0) / arr.length;
}

function buildMockStudents() {
  const rng = mulberry32(20260108);
  const first = ["กานต์", "นที", "พลอย", "พิม", "ธนา", "อิงฟ้า", "ภัทร", "ณิชา", "ศุภ", "ธัญ", "วร", "พีร", "ปุณ", "นลิน", "ศิริ", "ชญา"];
  const last = ["ศรีสุข", "ใจดี", "พงศ์พัฒนา", "ทองดี", "สุวรรณ", "เจริญชัย", "ศิริวงศ์", "ตั้งใจ", "วัฒนกุล", "ภักดี", "สกุลไทย", "บุญมี"];

  const out = [];
  for (let i = 1; i <= 40; i++) {
    const id = `S${String(i).padStart(3, "0")}`;
    const name = `${first[Math.floor(rng() * first.length)]} ${last[Math.floor(rng() * last.length)]}`;

    const pre = Math.round(clamp(rng() * 18 + 10, 0, 40)); // 10-28
    const post = Math.round(clamp(pre + (rng() * 10 + 4), 0, 40)); // ดีกว่า pre

    const lessons = Array.from({ length: 8 }).map(() => Math.round(clamp(rng() * 5 + 5, 0, 10))); // 5-10

    const surveyDone = rng() > 0.2;
    const survey = surveyDone
      ? {
          sat: Math.round(clamp(rng() * 2 + 3, 1, 5)),
          ux: Math.round(clamp(rng() * 3 + 2, 1, 5)),
          comment: rng() > 0.66 ? "ชอบการเรียนเป็นขั้นตอน" : rng() > 0.33 ? "อยากให้เพิ่มตัวอย่าง" : "เข้าใจง่ายดี",
        }
      : null;

    out.push({ id, name, pre, post, lessons, survey });
  }
  return out;
}

function clampInt(n, a, b) {
  return Math.max(a, Math.min(b, Math.floor(n)));
}

export default function DataAdmin() {
  const students = useMemo(() => buildMockStudents(), []);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null);
  const [pValue, setPValue] = useState(0.005); // Set default p-value for the example

  // Pagination
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return students.filter((x) => {
      if (!s) return true;
      return x.id.toLowerCase().includes(s) || x.name.toLowerCase().includes(s);
    });
  }, [students, q]);

  const pageCount = useMemo(() => {
    return Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  }, [filtered.length]);

  const paged = useMemo(() => {
    const p = clampInt(page, 1, pageCount);
    const start = (p - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page, pageCount]);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [q]);

  // Keep page within range
  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
    if (page < 1) setPage(1);
  }, [page, pageCount]);

  const stats = useMemo(() => {
    const preAvg = mean(filtered.map((x) => x.pre));
    const postAvg = mean(filtered.map((x) => x.post));
    const lessonAvg = mean(filtered.map((x) => mean(x.lessons)));
    const surveyDone = filtered.filter((x) => !!x.survey).length;
    return { preAvg, postAvg, lessonAvg, surveyDone };
  }, [filtered]);

  // close modal on ESC
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") setSelected(null);
    }
    if (selected) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selected]);

  const selectedComputed = useMemo(() => {
    if (!selected) return null;
    const lessonSum = selected.lessons.reduce((a, b) => a + b, 0);
    const lessonAvg = mean(selected.lessons);
    return { lessonSum, lessonAvg };
  }, [selected]);

  const pageStart = useMemo(() => {
    if (!filtered.length) return 0;
    return (page - 1) * PAGE_SIZE + 1;
  }, [page, filtered.length]);

  const pageEnd = useMemo(() => {
    return Math.min(page * PAGE_SIZE, filtered.length);
  }, [page, filtered.length]);

  // Small page number window (1..N)
  const pageWindow = useMemo(() => {
    const N = pageCount;
    const cur = clampInt(page, 1, N);
    const windowSize = 5;
    let start = Math.max(1, cur - Math.floor(windowSize / 2));
    let end = Math.min(N, start + windowSize - 1);
    start = Math.max(1, end - windowSize + 1);
    const nums = [];
    for (let i = start; i <= end; i++) nums.push(i);
    return { nums, start, end, N, cur };
  }, [page, pageCount]);

  return (
    <div className="edu-app">
      {/* Topbar */}
      <div className="edu-topbar">
        <div className="edu-topbar__inner">
          <div className="edu-topbar__brand">
            <div className="edu-brandtext">
              <div className="edu-brandtext__title">Admin Dashboard</div>
              <div className="edu-brandtext__subtitle">รายงานผลผู้เรียน (Mock UI)</div>
            </div>
          </div>

          <div className="edu-topbar__right">
            <Link to="/admin/login" className="edu-btn" style={{ textDecoration: "none" }}>
              ออกจากหน้า Admin
            </Link>
            <Link to="/login" className="edu-btn edu-btn--ghost" style={{ textDecoration: "none" }}>
              ไปหน้า Student
            </Link>
          </div>
        </div>
      </div>

      <div className="edu-layout">
        {/* Hero */}
        <div className="edu-hero">
          <div className="edu-hero__card">
            <div className="edu-hero__row">
              <div className="edu-hero__headline">
                <div className="edu-hero__title">สรุปข้อมูลผู้เรียน</div>
                <div className="edu-hero__sub">ตารางแบบ dashboard: รายชื่อ ~40 คน, Pre/Post, คะแนน 8 บท, แบบสอบถาม (ยังไม่ต่อ Supabase)</div>
              </div>

              <div className="edu-modes">
                <div className="edu-mode">
                  <div className="edu-mode__left">
                    <div className="edu-mode__icon">📦</div>
                    <div>
                      <div className="edu-mode__title">แหล่งข้อมูล</div>
                      <div className="edu-mode__desc">Mock (local) — พร้อมค่อยเปลี่ยนเป็น Supabase</div>
                    </div>
                  </div>
                  <div className="edu-mode__right">
                    <span className="edu-badge">Demo</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="edu-stats" style={{ marginTop: 14 }}>
              <div className="edu-stat">
                <div className="edu-stat__label">ผู้เรียน (แสดงผล)</div>
                <div className="edu-stat__value">{filtered.length}</div>
                <div className="edu-stat__hint">จากทั้งหมด {students.length} คน</div>
              </div>
              <div className="edu-stat">
                <div className="edu-stat__label">Pretest เฉลี่ย</div>
                <div className="edu-stat__value">{stats.preAvg.toFixed(1)} / 40</div>
                <div className="edu-stat__hint">ค่าเฉลี่ยกลุ่มที่กำลังแสดง</div>
              </div>
              <div className="edu-stat">
                <div className="edu-stat__label">Posttest เฉลี่ย</div>
                <div className="edu-stat__value">{stats.postAvg.toFixed(1)} / 40</div>
                <div className="edu-stat__hint">ค่าเฉลี่ยกลุ่มที่กำลังแสดง</div>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Move “right column” up here */}
        <div className="edu-adminTopRow">
          <div className="edu-panel">
            <div className="edu-panel__head">
              <div className="edu-panel__title">สรุปการวิเคราะห์</div>
              <span className="edu-badge">Mock</span>
            </div>

            <ul className="edu-todo">
              <li className="edu-todo__item">
                <span>
                  <span className="edu-dot" />
                  Paired t-test (Pre vs Post)
                  <div className="edu-note">ตัวเลขตัวอย่างไว้โชว์หน้าตา</div>
                </span>
                <span className="edu-badge">t = 5.32</span>
              </li>
              <li className="edu-todo__item">
                <span>
                  <span className="edu-dot" />
                  p-value
                  <div className="edu-note">สรุปนัยสำคัญทางสถิติ</div>
                </span>


                <span className={`edu-badge ${pValue < 0.05 ? "edu-badge--success" : "edu-badge--danger"}`}>
  p-value = {pValue} {pValue < 0.05 ? "ผ่านอย่างมีนัยสำคัญ" : "ไม่ผ่านนัยสำคัญ"}
</span>

              </li>
            </ul>

            <div className="edu-note">ต่อไปถ้าจะคำนวณจริง: พอมี pre/post ของแต่ละคนครบ แล้วค่อยทำสูตรจริงได้ทันที</div>
          </div>
        </div>

        {/* Table (full width) */}
        <div className="edu-panel">
          <div className="edu-panel__head">
            <div className="edu-panel__title">รายการผู้เรียน</div>
          </div>

          {/* Toolbar */}
          <div className="edu-lessons__toolbar" style={{ marginTop: 0 }}>
            <input
              className="edu-input"
              placeholder="ค้นหา: รหัส (S001) หรือ ชื่อผู้เรียน"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ maxWidth: 420 }}
            />
          </div>

          {/* Table */}
          <div className="edu-tableWrap" style={{ marginTop: 12 }}>
            <div className="edu-tableHead">
              <div className="edu-th edu-th--id">รหัส</div>
              <div className="edu-th edu-th--name">ผู้เรียน</div>
              <div className="edu-th">Pre</div>
              <div className="edu-th">Post</div>
              <div className="edu-th edu-th--wide">คะแนนรวม 8 บท</div>
              <div className="edu-th edu-th--act">รายละเอียด</div>
            </div>

            <div className="edu-tableBody" role="list">
              {paged.map((s) => {
                const lessonSum = s.lessons.reduce((a, b) => a + b, 0);
                const pct = Math.round((lessonSum / 80) * 100);

                return (
                  <div key={s.id} className="edu-tr" role="listitem">
                    <div className="edu-td edu-td--id">
                      <span className="edu-idPill">{s.id}</span>
                    </div>

                    <div className="edu-td edu-td--name">
                      <div className="edu-stu">
                        <div className="edu-stu__meta">
                          <div className="edu-stu__name" title={s.name}>
                            {s.name}
                          </div>
                          <div className="edu-stu__sub">
                            <span className="edu-chip is-muted">avg {mean(s.lessons).toFixed(1)}/10</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="edu-td">
                      <span className="edu-badge">{s.pre}/40</span>
                    </div>

                    <div className="edu-td">
                      <span className="edu-badge">{s.post}/40</span>
                    </div>

                    <div className="edu-td edu-td--wide">
                      <div className="edu-sum">
                        
                        <div className="edu-sum__meta">
                          <span className="edu-sum__num">
                            {lessonSum}/80 <span className="edu-note" style={{ margin: 0 }}></span>
                          </span>
                          
                        </div>
                      </div>
                    </div>

                    <div className="edu-td edu-td--act">
                      <button className="edu-mini edu-mini--solid" onClick={() => setSelected(s)}>
                        <FiEye />
                      </button>
                    </div>
                  </div>
                );
              })}

              {filtered.length === 0 && <div className="edu-emptyRow">ไม่พบข้อมูลจากตัวกรองนี้ ลองล้างตัวกรองหรือค้นหาใหม่อีกครั้ง</div>}
            </div>
          </div>

          {/* ✅ Pagination footer */}
          <div className="edu-pager">
            <div className="edu-pager__left">
              <span className="edu-note" style={{ margin: 0 }}>
                แสดง {pageStart}-{pageEnd} จาก {filtered.length} คน
              </span>
            </div>

            <div className="edu-pager__right">
              <button className="edu-pagerBtn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                ← ก่อนหน้า
              </button>

              <div className="edu-pagerNums" role="navigation" aria-label="Pagination">
                {pageWindow.start > 1 && (
                  <>
                    <button className={`edu-pagerNum ${page === 1 ? "is-active" : ""}`} onClick={() => setPage(1)}>
                      1
                    </button>
                    <span className="edu-pagerEll">…</span>
                  </>
                )}

                {pageWindow.nums.map((n) => (
                  <button key={n} className={`edu-pagerNum ${page === n ? "is-active" : ""}`} onClick={() => setPage(n)}>
                    {n}
                  </button>
                ))}

                {pageWindow.end < pageWindow.N && (
                  <>
                    <span className="edu-pagerEll">…</span>
                    <button className={`edu-pagerNum ${page === pageWindow.N ? "is-active" : ""}`} onClick={() => setPage(pageWindow.N)}>
                      {pageWindow.N}
                    </button>
                  </>
                )}
              </div>

              <button className="edu-pagerBtn" onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={page >= pageCount}>
                ถัดไป →
              </button>
            </div>
          </div>

          <div className="edu-note" style={{ marginTop: 10 }}>
            *คลิก “ดูรายละเอียด” เพื่อเปิด popup ดูคะแนนรายบทและแบบสอบถาม (ปิดได้ด้วย Esc)
          </div>
        </div>
      </div>

      {/* Modal */}
      {selected && selectedComputed && (
        <div
          className="edu-modalOverlay"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
        >
          <div className="edu-modal" role="dialog" aria-modal="true" aria-label={`รายละเอียดผู้เรียน ${selected.id}`}>
            <div className="edu-modal__head">
              <div className="edu-modal__title">
                รายละเอียดผู้เรียน <span className="edu-idPill" style={{ marginLeft: 8 }}>{selected.id}</span>
              </div>
            </div>

            <div className="edu-modal__sub">
              <div className="edu-modal__name">{selected.name}</div>
              <div className="edu-modal__chips">
                <span className="edu-chip is-muted">Pre {selected.pre}/40</span>
                <span className="edu-chip is-muted">Post {selected.post}/40</span>
                <span className="edu-chip is-muted">avg บท {selectedComputed.lessonAvg.toFixed(1)}/10</span>
              </div>
            </div>

            <div className="edu-modal__grid">
              {/* Lessons */}
              <div className="edu-modalCard">
                <div className="edu-modalCard__head">
                  <div className="edu-modalCard__title">คะแนนรายบท (1–8)</div>
                  <div className="edu-modalCard__right">
                    <span className="edu-chip is-muted">รวม {selectedComputed.lessonSum}/80</span>
                    <span className="edu-chip is-muted">{selectedComputed.pct80}%</span>
                  </div>
                </div>

                

                <div className="edu-note" style={{ marginTop: 10 }}>
                  *ตอนต่อ Supabase จริง สามารถโชว์เวลาทำบท, จำนวนครั้งที่ทำ, หรือคะแนนย่อยได้ในส่วนนี้
                </div>
              </div>

              {/* Survey */}
              <div className="edu-modalCard">
                <div className="edu-modalCard__head">
                  <div className="edu-modalCard__title">แบบสอบถาม</div>
                  {selected.survey ? <span className="edu-chip is-ok">ทำแล้ว</span> : <span className="edu-chip is-muted">ยังไม่ทำ</span>}
                </div>

                {selected.survey ? (
                  <div className="edu-survey">
                    <div className="edu-survey__kpis">
                      <div className="edu-surveyKpi">
                        <div className="edu-surveyKpi__label">ความพึงพอใจ</div>
                        <div className="edu-surveyKpi__value">{selected.survey.sat}/5</div>
                      </div>
                      <div className="edu-surveyKpi">
                        <div className="edu-surveyKpi__label">ใช้งานง่าย</div>
                        <div className="edu-surveyKpi__value">{selected.survey.ux}/5</div>
                      </div>
                    </div>

                    <div className="edu-survey__comment">
                      <div className="edu-survey__label">ความคิดเห็น</div>
                      <div className="edu-survey__text">“{selected.survey.comment}”</div>
                    </div>
                  </div>
                ) : (
                  <div className="edu-emptyBox">
                    ยังไม่มีข้อมูลแบบสอบถามสำหรับผู้เรียนคนนี้
                    <div className="edu-note" style={{ marginTop: 6 }}>
                      *ในอนาคต: อาจใส่ปุ่ม “ส่งแจ้งเตือนทำแบบสอบถาม” ได้
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="edu-modal__foot">
              <div className="edu-note" style={{ margin: 0 }}>
                ปิดได้ด้วยปุ่ม “ปิด”, คลิกพื้นหลัง, หรือกด Esc
              </div>
              <button className="edu-btn edu-btn--primary" onClick={() => setSelected(null)}>
                เสร็จสิ้น
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
