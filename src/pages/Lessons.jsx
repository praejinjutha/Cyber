import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import logo from "../assets/logo.png";

import "../main.css";
import "../lesson.css";

import {
  FiUser,
  FiLogOut,
  FiActivity,
  FiHome,
  FiPlay,
  FiLock,
  FiCheck,
  FiCheckCircle,
} from "react-icons/fi";

/* =========================================================
   ✅ LESSON DATA (คงเดิม)
========================================================= */
const LESSONS = [
  { no: 1, title: "พื้นฐานความปลอดภัยไซเบอร์", desc: "รู้จักภัยคุกคามและหลักการสำคัญ" },
  { no: 2, title: "รหัสผ่านและการยืนยันตัวตน", desc: "ตั้งรหัสผ่านให้ปลอดภัย + MFA" },
  { no: 3, title: "Phishing และ Social Engineering", desc: "จับสัญญาณอีเมล/ลิงก์หลอก" },
  { no: 4, title: "ความปลอดภัยบนโซเชียลมีเดีย", desc: "ตั้งค่า Privacy และลดความเสี่ยง" },
  { no: 5, title: "ความปลอดภัยบนอุปกรณ์", desc: "อัปเดต ซอฟต์แวร์ แอนติไวรัส" },
  { no: 6, title: "ความปลอดภัยบนเครือข่าย", desc: "Wi-Fi, VPN, การใช้งานสาธารณะ" },
  { no: 7, title: "ข้อมูลส่วนบุคคลและ PDPA เบื้องต้น", desc: "แนวคิดข้อมูลส่วนบุคคล" },
  { no: 8, title: "สรุป + แนวทางปฏิบัติ", desc: "เช็กลิสต์และทบทวน" },
];

export default function Lessons() {
  const navigate = useNavigate();

  /* =========================================================
     ✅ BASIC STATE
  ========================================================= */
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");

  /* =========================================================
     ✅ TOOLTIP STATE (ใหม่)
     - hoveredUnitNo: เก็บว่า hover อยู่ที่ unit ไหน
  ========================================================= */
  const [hoveredUnitNo, setHoveredUnitNo] = useState(null);

  /* =========================================================
     ✅ MOCK LEARNING STATE (logic เดิม)
  ========================================================= */
  const pretestPassedSet = useMemo(() => new Set([1, 4, 6]), []);
  const learnedCompletedSet = useMemo(() => new Set([2]), []);

  const masteredSet = useMemo(() => {
    const s = new Set();
    pretestPassedSet.forEach((n) => s.add(n));
    learnedCompletedSet.forEach((n) => s.add(n));
    return s;
  }, [pretestPassedSet, learnedCompletedSet]);

  /* =========================================================
     ✅ ADAPTIVE PATH
  ========================================================= */
  const adaptivePath = useMemo(() => [2, 3, 5, 7, 8], []);

  const adaptivePathPassedCount = useMemo(() => {
    let count = 0;
    for (const n of adaptivePath) {
      if (masteredSet.has(n)) count++;
      else break;
    }
    return count;
  }, [adaptivePath, masteredSet]);

  const adaptiveUnlockedSet = useMemo(() => {
    const maxIndex = Math.min(adaptivePath.length - 1, adaptivePathPassedCount);
    return new Set(adaptivePath.slice(0, maxIndex + 1));
  }, [adaptivePath, adaptivePathPassedCount]);

  const nextTarget = useMemo(() => {
    for (const n of adaptivePath) {
      if (!masteredSet.has(n) && adaptiveUnlockedSet.has(n)) return n;
    }
    return null;
  }, [adaptivePath, masteredSet, adaptiveUnlockedSet]);

  /* =========================================================
     ✅ ROUTING
  ========================================================= */
  const goUnitByLessonNo = (lessonNo) => {
    const n = Math.min(8, Math.max(1, Number(lessonNo || 1)));
    navigate(n === 1 ? "/unit1/learn" : `/unit${n}/learn`);
  };

  /* =========================================================
     ✅ AUTH / PROFILE
  ========================================================= */
  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      const { data } = await supabase.auth.getSession();
      const u = data.session?.user;

      if (!u) {
        navigate("/login", { replace: true });
        return;
      }

      const { data: profile } = await supabase
        .from("student_profiles")
        .select("first_name,last_name")
        .eq("user_id", u.id)
        .maybeSingle();

      if (alive && profile) {
        setStudentName(`${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim());
      }

      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [navigate]);

  /* =========================================================
     ✅ ROADMAP DATA
  ========================================================= */
  const roadmapUnits = useMemo(() => {
    const posMap = {
      1: { top: "75%", left: "8%" },
      2: { top: "45%", left: "20%" },
      3: { top: "25%", left: "35%" },
      4: { top: "50%", left: "50%" },
      5: { top: "75%", left: "65%" },
      6: { top: "45%", left: "80%" },
      7: { top: "25%", left: "92%" },
      8: { top: "15%", left: "78%" },
    };

    return LESSONS.map((l) => {
      let status = "locked";

      if (masteredSet.has(l.no)) status = "completed";
      else if (nextTarget === l.no) status = "active";
      else if (adaptiveUnlockedSet.has(l.no)) status = "active";

      return {
        ...l,
        status,
        clickable: status !== "locked",
        pos: posMap[l.no],
      };
    });
  }, [adaptiveUnlockedSet, masteredSet, nextTarget]);

  return (
    <div className="edu-app ls-adaptive">
      {/* TOPBAR */}
      <header className="edu-topbar">
        <div className="edu-topbar__inner">
          <div className="homebar__brand">
            <img src={logo} alt="LearnSecure" className="homebar__logo" />
            <div>
              <div className="edu-brandtext__title">LearnSecure</div>
              <div className="edu-brandtext__subtitle">Adaptive Learning</div>
            </div>
          </div>

          <div className="edu-topbar__right">
            <div className="edu-userchip">
              <FiUser />
              <span>{loading ? "กำลังโหลด..." : studentName || "ผู้เรียน"}</span>
            </div>

            <button
              className="edu-btn edu-btn--danger"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate("/login", { replace: true });
              }}
            >
              <FiLogOut /> ออกจากระบบ
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <main className="edu-layout">
<section className="edu-hero">
  <div className="edu-hero__card">
    <div className="edu-hero__head">
      <div className="edu-hero__text">
        <h1>เส้นทางการเรียนแบบ Adaptive</h1>
        <p>
          ระบบจะเลือก “สิ่งที่ควรเรียนต่อ” ให้โดยอัตโนมัติ
          คุณไม่จำเป็นต้องไล่บทเอง
        </p>
      </div>

      <button
        className="edu-btn edu-btn--ghost"
        type="button"
        onClick={() => navigate("/main")}
      >
        <FiHome aria-hidden="true" /> กลับหน้าหลัก
      </button>
    </div>
  </div>
</section>


        {/* ROADMAP */}
        <section className="section roadmap-section">
          <div className="section__head">
            <div className="section__title" style={{ color: "white" }}>
              <FiActivity /> Learning Roadmap
            </div>
          </div>

          <div className="roadmap-container">
<svg className="roadmap-svg" viewBox="0 0 1000 350" preserveAspectRatio="none">
  {/* ขอบถนน */}
  <path
    d="M 80 280 Q 180 280 230 180 T 350 100 T 500 180 T 650 280 T 800 150 T 920 80 T 780 40"
    fill="none"
    stroke="rgba(255,255,255,0.12)"
    strokeWidth="54"
    strokeLinecap="round"
  />

  {/* พื้นถนน */}
  <path
    d="M 80 280 Q 180 280 230 180 T 350 100 T 500 180 T 650 280 T 800 150 T 920 80 T 780 40"
    fill="none"
    stroke="rgba(210,215,225,0.38)"
    strokeWidth="44"
    strokeLinecap="round"
  />

  {/* ✅ เส้นประ: ทำให้เด่นขึ้น + มี glow เบาๆ */}
  <path
    d="M 80 280 Q 180 280 230 180 T 350 100 T 500 180 T 650 280 T 800 150 T 920 80 T 780 40"
    fill="none"
    stroke="rgba(255,255,255,0.95)"
    strokeWidth="6"
    strokeDasharray="36 26"
    strokeLinecap="round"
    vectorEffect="non-scaling-stroke"
    shapeRendering="geometricPrecision"
    style={{
      filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.45))",
      opacity: 0.95
    }}
  />
</svg>


            {roadmapUnits.map((u) => (
              <div
  key={u.no}
  className={`roadmap-node-wrapper ${hoveredUnitNo === u.no ? "is-hovered" : ""}`}
  style={{ top: u.pos.top, left: u.pos.left }}
  onMouseEnter={() => setHoveredUnitNo(u.no)}
  onMouseLeave={() => setHoveredUnitNo(null)}
>

                {/* ✅ Tooltip (ใหม่) */}
                {hoveredUnitNo === u.no && (
                  <div className="unit-tooltip" role="tooltip">
                    <div className="unit-tooltip__title">
                      Unit {u.no}: {u.title}
                    </div>
                    <div className="unit-tooltip__desc">{u.desc}</div>
                    <div className="unit-tooltip__arrow" />
                  </div>
                )}

                <button
                  className={`unit-node unit-node--${u.status}`}
                  disabled={!u.clickable}
                  onClick={() => u.clickable && goUnitByLessonNo(u.no)}
                  aria-label={`Unit ${u.no} ${u.title}`}
                >
                  {u.status === "completed" && <FiCheck />}
                  {u.status === "active" && <FiPlay />}
                  {u.status === "locked" && <FiLock />}
                </button>

                <div className="unit-label">Unit {u.no}</div>
              </div>
            ))}
          </div>
        </section>

{nextTarget && (
  <section className="ls-nextBox">
    <div className="ls-nextBox__row">
      <div className="ls-nextBox__text">
        <h3>ภารกิจถัดไปที่แนะนำ</h3>
        <p>
          บทที่ {nextTarget}:{" "}
          {LESSONS.find((l) => l.no === nextTarget)?.title}
        </p>
      </div>

      <button
        className="ls-btn ls-btn--primary ls-nextBox__cta"
        type="button"
        onClick={() => goUnitByLessonNo(nextTarget)}
      >
        <FiPlay aria-hidden="true" /> เริ่มบทนี้
      </button>
    </div>
  </section>
)}



        {/* LEGEND */}
        <section className="ls-legend">
          <div><FiCheck /> ผ่านแล้ว (ทบทวนได้)</div>
          <div><FiPlay /> ภารกิจถัดไป / พร้อมเรียน</div>
          <div><FiLock /> ยังไม่ปลดล็อก</div>
        </section>

        {/* REVIEW */}
        <section className="ls-reviewMini">
          <h3><FiCheckCircle /> บทที่ผ่านแล้ว</h3>
          <div className="ls-reviewRow">
            {[...masteredSet].map((n) => {
              const l = LESSONS.find((x) => x.no === n);
              if (!l) return null;
              return (
                <button key={n} onClick={() => goUnitByLessonNo(n)}>
                  บท {n}: {l.title}
                </button>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
