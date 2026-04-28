// src/pages/Unit5/Learn3Unit5.jsx
// ✅ Unit 5 - เรื่องที่ 3: การทำความเข้าใจเจตนาของผู้เผยแพร่เนื้อหา
// Flow: Micro-lesson → Scenario-based Learning → Immediate Feedback Learning
// ✅ ใช้ CSS ตามที่ผู้ใช้กำหนด: main.css + Unit1/learn.css (ไม่ใช้ lesson.css/styles.css)

import { useEffect, useMemo, useRef, useState } from "react"; // ✅ React hooks + refs
import { useLocation, useNavigate } from "react-router-dom"; // ✅ Router helpers
import { supabase } from "../../lib/supabase"; // ✅ Supabase auth/profile

import logo from "../../assets/logo.png"; // ✅ Brand logo

// ✅ (เพิ่ม) รูปตัวอย่างเจตนา (อยู่ใน src/assets/unit5/)
import imgInformative from "./Informative.webp";
import imgShare from "./Share-oriented.jpg";
import imgClickbait from "./Clickbait.png";
import imgEmotional from "./Emotional.jpg";
import imgAdvertising from "./Advertising.jpg";

// ✅ CSS (ตามที่สั่ง)
import "../../main.css";
import "../Unit1/learn.css";

// ✅ Icons
import {
  FiChevronLeft, // ✅ back
  FiChevronRight, // ✅ next
  FiFileText, // ✅ panel title icon
  FiHome, // ✅ home button
  FiLogOut, // ✅ logout
  FiUser, // ✅ user chip
  FiCheckCircle, // ✅ correct
  FiAlertTriangle, // ✅ warn
  FiInfo, // ✅ micro lesson
  FiFlag, // ✅ intent
  FiEye, // ✅ observe
  FiImage, // ✅ image label
} from "react-icons/fi";

/* ------------------------------------------------------------------ */
/* ✅ Micro-lesson (สั้น กระชับ)                                        */
/* - โฟกัส: เจตนาในการเผยแพร่ คืออะไร + สัญญาณภาษาที่บอกเจตนา           */
/* ------------------------------------------------------------------ */
const MICRO_LESSON = {
  title: "เจตนาของผู้เผยแพร่เนื้อหา (Intent)",
  points: [
    {
      icon: "🎯",
      head: "เจตนา คืออะไร?",
      body:
        "คือ “เป้าหมาย” ที่คนโพสต์อยากให้เราเกิดขึ้น เช่น อยากให้เราเชื่อ, คลิก, กลัว, ซื้อของ, หรือแชร์ต่อ",
    },
    {
      icon: "🧭",
      head: "เจตนาที่เจอบ่อย",
      body:
        "ให้ข้อมูล / ชวนแชร์ / ชวนคลิก / ปั่นอารมณ์ / ขายของ\n(บางโพสต์ปลอมตัวเป็นข่าว แต่จริง ๆ อยากให้เรากด/เชื่อ/ซื้อ)",
    },
    {
      icon: "🔍",
      head: "สัญญาณที่ชี้เจตนา",
      body:
        "คำเร่งด่วน, คำแรง, ตัวอักษรใหญ่, คำเหมารวม, คำยืนยันแบบไม่มีหลักฐาน, ปุ่ม/ลิงก์, โปร/ราคา/โลโก้แบรนด์, หรือกดดันให้แชร์/คลิกทันที",
    },
  ],
  quickRule:
    "จำง่าย: ถ้าเนื้อหา “เร่งให้รู้สึกก่อนคิด” ให้หยุด แล้วถามว่าเขาอยากให้เราทำอะไร",
};

/* ------------------------------------------------------------------ */
/* ✅ ตัวเลือกเจตนา (ใช้ร่วมกันทุก scenario)                            */
/* ------------------------------------------------------------------ */
const INTENT_CHOICES = [
  { id: "info", label: "ให้ข้อมูล" },
  { id: "share", label: "ชวนแชร์" },
  { id: "click", label: "ชวนคลิก" },
  { id: "emotion", label: "ปั่นอารมณ์" },
  { id: "sell", label: "ขายของ/โฆษณาแฝง" },
];

/* ------------------------------------------------------------------ */
/* ✅ Scenario-based Learning                                           */
/* - ใช้ “รูปจริง” เป็นเบาะแส                                           */
/* - ตอบแล้ว feedback ทันที (Immediate Feedback)                        */
/* ------------------------------------------------------------------ */
const SCENARIOS = [
  {
    id: "s1",
    title: "สถานการณ์ 1: โพสต์ให้ข้อมูล",
    image: imgInformative,
    question: "โพสต์นี้อยากให้เราทำอะไร?",
    correctId: "info",
    why:
      "โทนเป็นข้อมูล/อธิบายเป็นขั้นตอน มีโครงสร้างเหมือนอินโฟกราฟิก และไม่ได้เร่งให้กด/แชร์",
    clues: [
      "มีหัวข้อ/ขั้นตอน/ข้อมูลเป็นระบบ",
      "ไม่ได้ใช้คำเร้าอารมณ์ เช่น ด่วน/ช็อก/รับไม่ได้",
      "ไม่มีโปร/ราคา/ลิงก์ชวนกด",
    ],
  },
  {
    id: "s2",
    title: "สถานการณ์ 2: โพสต์ชวนแชร์",
    image: imgShare,
    question: "โพสต์นี้อยากให้เราทำอะไร?",
    correctId: "share",
    why:
      "มีลักษณะชวนส่งต่อ/บอกต่อให้คนอื่นรับรู้ หรือทำให้รู้สึกว่า ‘ควรแชร์’ เพื่อช่วยคนอื่น",
    clues: [
      "ข้อความแนวเตือน/บอกต่อ",
      "ภาษาชวนให้ส่งต่อหรือแชร์ให้คนอื่นเห็น",
      "มักไม่เน้นหลักฐาน แต่เน้นให้ “กระจายต่อ”",
    ],
  },
  {
    id: "s3",
    title: "สถานการณ์ 3: พาดหัวชวนคลิก",
    image: imgClickbait,
    question: "โพสต์นี้อยากให้เราทำอะไร?",
    correctId: "click",
    why:
      "พาดหัวใหญ่และทำให้ค้างคาใจ/อยากรู้ต่อ มักใช้คำชวนสงสัยหรือกระตุ้นให้กดเข้าไปอ่าน",
    clues: [
      "ตัวอักษรใหญ่ + โทนเหมือน ‘ด่วน/ต้องดู’",
      "ตั้งคำถาม/ทิ้งปมให้สงสัย",
      "เป้าหมายหลักคือให้ ‘คลิกเข้าไป’",
    ],
  },
  {
    id: "s4",
    title: "สถานการณ์ 4: ปั่นอารมณ์ให้ตัดสินเร็ว",
    image: imgEmotional,
    question: "โพสต์นี้อยากให้เราทำอะไร?",
    correctId: "emotion",
    why:
      "ใช้โทน/ภาพ/คำที่ทำให้อารมณ์มาไว (ตกใจ โกรธ สงสาร สะใจ) เพื่อให้ตัดสินก่อนดูข้อเท็จจริงครบ",
    clues: [
      "คำ/โทนภาพชวนรู้สึกแรงทันที",
      "ทำให้รีบเชื่อ/รีบตัดสิน",
      "อารมณ์นำเหตุผล",
    ],
  },
  {
    id: "s5",
    title: "สถานการณ์ 5: ขายของ/โฆษณาแฝง (ปลอมตัวเป็นคอนเทนต์)",
    image: imgAdvertising,
    question: "โพสต์นี้อยากให้เราทำอะไร?",
    correctId: "sell",
    why:
      "มีโลโก้/แบรนด์/แพ็กเกจ/ราคา/โปรโมชันชัดเจน แม้เนื้อหาดูเหมือนข้อมูลหรืออันดับ แต่เจตนาหลักคือชวนให้ซื้อ/สนใจสินค้า",
    clues: [
      "มีแบรนด์/โลโก้เด่น",
      "มีคำแนวโปร/แพ็กเกจ/ราคา",
      "เป้าหมายคือให้ ‘ซื้อ/สนใจสินค้า’",
    ],
  },
];

const Learn3Unit5 = () => {
  // ✅ Router helpers
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ อ่าน query mode เผื่อใช้ต่อ
  const mode = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    return sp.get("mode") || "all";
  }, [location.search]);

  // ✅ UI state
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");

  /**
   * ✅ step flow
   * - "micro"     : Micro-lesson
   * - "scenario"  : Scenario-based Learning + Immediate Feedback
   */
  const [step, setStep] = useState("micro");

  /* ---------------------------
     ✅ SCENARIO STATE
     --------------------------- */
  const [scIdx, setScIdx] = useState(0); // ✅ scenario ปัจจุบัน
  const [picked, setPicked] = useState({}); // ✅ { [scenarioId]: choiceId }
  const [checked, setChecked] = useState(false); // ✅ แสดง feedback ของ scenario นี้หรือยัง

  // ✅ (เพิ่ม) ref สำหรับเลื่อนไปยัง feedback หลังเลือกคำตอบ
  const feedbackRef = useRef(null);

  // ✅ สถานการณ์ปัจจุบัน
  const current = SCENARIOS[scIdx];

  // ✅ เลือกคำตอบแล้วแสดง feedback ทันที
  const chooseIntent = (scenarioId, choiceId) => {
    setPicked((prev) => ({ ...prev, [scenarioId]: choiceId }));
    setChecked(true);
    // ❌ เดิม: เด้งขึ้นบนสุด
    // window.scrollTo({ top: 0, behavior: "smooth" });
    // ✅ ใหม่: ปล่อยให้ useEffect เลื่อนไปที่ feedback (หลัง DOM render เสร็จ)
  };

  // ✅ (เพิ่ม) เมื่อ feedback โผล่แล้ว ให้ scroll ไปที่กล่อง feedback
  useEffect(() => {
    if (step !== "scenario") return;
    if (!checked) return;

    // ✅ เลื่อนไปยัง feedback ที่อยู่ล่าง ๆ เพื่อดูเฉลย/เหตุผลทันที
    feedbackRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest",
    });
  }, [checked, step, scIdx]);

  // ✅ ไป scenario ถัดไป
  const nextScenario = () => {
    setChecked(false);
    setScIdx((i) => Math.min(SCENARIOS.length - 1, i + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ กลับ scenario ก่อนหน้า
  const prevScenario = () => {
    setChecked(false);
    setScIdx((i) => Math.max(0, i - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ คำตอบที่เลือกของ scenario ปัจจุบัน
  const pickedNow = picked[current.id];

  // ✅ ถูก/ผิด
  const isCorrect = pickedNow && pickedNow === current.correctId;

  // ✅ label ของคำตอบ (เพื่อโชว์เฉลย)
  const correctLabel = useMemo(() => {
    return INTENT_CHOICES.find((c) => c.id === current.correctId)?.label || "—";
  }, [current.correctId]);

  const pickedLabel = useMemo(() => {
    return INTENT_CHOICES.find((c) => c.id === pickedNow)?.label || "";
  }, [pickedNow]);

  // ✅ สรุปความคืบหน้า
  const progressText = useMemo(() => {
    return `${scIdx + 1} / ${SCENARIOS.length}`;
  }, [scIdx]);

  // ✅ โหลดชื่อผู้เรียน
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

      if (!alive) return;

      if (profile) {
        setStudentName(`${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim());
      }

      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [navigate]);

  // ✅ title ใน panel
  const panelTitle = useMemo(() => {
    if (step === "micro") return "เจตนาของผู้เผยแพร่";
    return "สถานการณ์: ดูรูป → เดาเจตนา → รับ feedback";
  }, [step]);

  // ✅ helper styles
  const softText = { fontSize: 13, opacity: 0.8 };

  const boxStyle = {
    borderRadius: 16,
    border: "1px solid rgba(0,0,0,0.08)",
    background: "rgba(255,255,255,0.55)",
    padding: 14,
  };

  const pillStyle = (active) => ({
    borderRadius: 999,
    border: active ? "1px solid rgba(59,130,246,0.45)" : "1px solid rgba(0,0,0,0.10)",
    background: active ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.70)",
    padding: "8px 12px",
    fontSize: 13,
    fontWeight: 800,
    cursor: "pointer",
    textAlign: "left",
    width: "100%",
  });

  // ✅ รูป: ลดขนาด “ไม่ตัดรูป” (ตามที่ผู้ใช้ชอบ)
  const imageStyleNoCrop = {
    width: "min(100%, 320px)",
maxWidth: "none",
    height: "auto",
    borderRadius: 14,
    border: "1px solid rgba(0,0,0,0.08)",
    display: "block",
    margin: "0 auto",
    background: "rgba(255,255,255,0.70)",
  };

  return (
    <div className="edu-app">
      {/* ✅ TOPBAR */}
      <header className="edu-topbar">
        <div className="edu-topbar__inner">
          {/* ✅ Brand */}
          <div className="homebar__brand" role="banner">
            <img src={logo} alt="LearnSecure logo" className="homebar__logo" />
            <div className="edu-brandtext">
              <div className="edu-brandtext__title">LearnSecure</div>
              <div className="edu-brandtext__subtitle">Unit 5</div>
            </div>
          </div>

          {/* ✅ Right actions */}
          <div className="edu-topbar__right">
            <div className="edu-userchip" title={studentName || "Student"}>
              <div className="edu-userchip__avatar" aria-hidden="true">
                <FiUser />
              </div>
              <div className="edu-userchip__meta">
                <div className="edu-userchip__name">
                  {loading ? "กำลังโหลด..." : studentName || "ผู้เรียน"}
                </div>
              </div>
            </div>

            <button
              className="edu-btn edu-btn--danger"
              type="button"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate("/login", { replace: true });
              }}
            >
              <FiLogOut aria-hidden="true" />
              ออกจากระบบ
            </button>
          </div>
        </div>
      </header>

      <main className="edu-layout">
        {/* ✅ HERO */}
        <section className="edu-hero" aria-label="Unit 5 header">
          <div className="edu-hero__card">
            <div className="edu-hero__row">
              <div className="edu-hero__headline">
                <div className="edu-hero__title">Unit 5: การรู้เท่าทันข่าวและข้อมูลออนไลน์</div>
<div className="edu-hero__sub">เรื่องที่ 3	การทำความเข้าใจเจตนาของผู้เผยแพร่เนื้อหา
</div>

                <div className="edu-lessons__toolbar">
                  <button
                    className="edu-btn edu-btn--back"
                    type="button"
                    onClick={() => {
                      if (step === "scenario") {
                        setStep("micro");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        return;
                      }
                      navigate(-1);
                    }}
                  >
                    <FiChevronLeft aria-hidden="true" />
                    กลับ
                  </button>

                  <button
                    className="edu-btn edu-btn--ghost"
                    type="button"
                    onClick={() => navigate("/main")}
                    style={{ marginLeft: 8 }}
                  >
                    <FiHome aria-hidden="true" />
                    กลับหน้าหลัก
                  </button>
                </div>
              </div>

              <div className="edu-lessons__meta">{/* เว้นไว้ */}</div>
            </div>
          </div>
        </section>

        {/* ✅ CONTENT */}
        <section className="edu-panel1">
          <div className="edu-panel1__head">
            <div className="edu-panel1__title">
              <FiFileText aria-hidden="true" />
              {panelTitle}
            </div>
          </div>

          <div className="edu-panel1__body">
            {/* ===================================================
                ✅ STEP: MICRO
               =================================================== */}
            {step === "micro" && (
              <div style={{ display: "grid", gap: 12 }}>
                <div style={boxStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 12,
                        display: "grid",
                        placeItems: "center",
                        background: "rgba(59,130,246,0.12)",
                        border: "1px solid rgba(59,130,246,0.18)",
                      }}
                      aria-hidden="true"
                    >
                      <FiInfo />
                    </div>
                    <div>
                      <div style={{ fontWeight: 900 }}>{MICRO_LESSON.title}</div>
                      <div style={softText}>
                        เป้าหมาย: ดูให้ทันว่าโพสต์อยากให้เรา “ทำอะไร” ก่อนอารมณ์พาไปคลิก/แชร์/ซื้อ
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gap: 10 }}>
                  {MICRO_LESSON.points.map((p, idx) => (
                    <div key={idx} style={boxStyle}>
                      <div style={{ fontWeight: 900, marginBottom: 6 }}>
                        {p.icon} {p.head}
                      </div>
                      <div style={{ whiteSpace: "pre-line" }}>{p.body}</div>
                    </div>
                  ))}
                </div>

                <div style={boxStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 12,
                        display: "grid",
                        placeItems: "center",
                        background: "rgba(16,185,129,0.10)",
                        border: "1px solid rgba(16,185,129,0.18)",
                      }}
                      aria-hidden="true"
                    >
                      <FiFlag />
                    </div>
                    <div>
                      <div style={{ fontWeight: 900 }}>กฎสั้น ๆ</div>
                      <div style={softText}>{MICRO_LESSON.quickRule}</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <button
                    className="edu-btn edu-btn--primary"
                    type="button"
                    onClick={() => {
                      // ✅ reset ให้เริ่มใหม่ดูสะอาด
                      setScIdx(0);
                      setChecked(false);
                      setPicked({});
                      window.scrollTo({ top: 0, behavior: "smooth" });
                      setStep("scenario");
                    }}
                  >
                    จำลองสถานการณ์ <FiChevronRight aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}

            {/* ===================================================
                ✅ STEP: SCENARIO + Immediate Feedback
               =================================================== */}
            {step === "scenario" && (
              <div style={{ display: "grid", gap: 12 }}>
                <div style={boxStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 12,
                        display: "grid",
                        placeItems: "center",
                        background: "rgba(245,158,11,0.12)",
                        border: "1px solid rgba(245,158,11,0.18)",
                      }}
                      aria-hidden="true"
                    >
                      <FiEye />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 900 }}>{current.title}</div>
                      <div style={softText}>ความคืบหน้า: {progressText}</div>
                    </div>

                    <button
                      className="edu-btn edu-btn--back"
                      type="button"
                      onClick={prevScenario}
                      disabled={scIdx === 0}
                      title="ย้อนสถานการณ์ก่อนหน้า"
                    >
                      <FiChevronLeft aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {/* ✅ รูปตัวอย่าง */}
                <div style={boxStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <FiImage aria-hidden="true" />
                    <div style={{ fontWeight: 900 }}>ภาพโพสต์/ข่าว (ใช้เป็นเบาะแส)</div>
                  </div>
                  <img src={current.image} alt={current.title} style={imageStyleNoCrop} />
                </div>

                {/* ✅ เบาะแสให้สังเกต */}
                <div style={boxStyle}>
                  <div style={{ fontWeight: 900, marginBottom: 6 }}>ให้ดูอะไรในรูปนี้?</div>
                  <ul style={{ margin: "6px 0 0 18px", fontSize: 13, opacity: 0.92, lineHeight: 1.65 }}>
                    {current.clues.map((c, i) => (
                      <li key={`clue-${current.id}-${i}`}>{c}</li>
                    ))}
                  </ul>
                </div>

                {/* ✅ คำถาม + choices */}
                <div style={boxStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 12,
                        display: "grid",
                        placeItems: "center",
                        background: "rgba(59,130,246,0.12)",
                        border: "1px solid rgba(59,130,246,0.18)",
                      }}
                      aria-hidden="true"
                    >
                      <FiFlag />
                    </div>
                    <div>
                      <div style={{ fontWeight: 900 }}>คำถาม</div>
                      <div style={softText}>{current.question}</div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gap: 10 }}>
                    {INTENT_CHOICES.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        style={pillStyle(pickedNow === c.id)}
                        onClick={() => chooseIntent(current.id, c.id)}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ✅ Feedback (Immediate) */}
                {checked && (
                  // ✅ (เพิ่ม) จุดหมาย scroll: เลื่อนมาที่ตรงนี้หลังเลือกคำตอบ
                  <div ref={feedbackRef} style={boxStyle}>
                    {isCorrect ? (
                      <div style={{ display: "grid", gap: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <FiCheckCircle aria-hidden="true" />
                          <div style={{ fontWeight: 900 }}>ถูกต้อง ✅</div>
                        </div>
                        <div style={softText}>เหตุผล: {current.why}</div>
                      </div>
                    ) : (
                      <div style={{ display: "grid", gap: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <FiAlertTriangle aria-hidden="true" />
                          <div style={{ fontWeight: 900 }}>ยังไม่ตรง ❌</div>
                        </div>

                        <div style={softText}>
                          คุณเลือก: <b>{pickedLabel || "—"}</b>
                        </div>
                        <div style={softText}>
                          เฉลยคือ: <b>{correctLabel}</b>
                        </div>
                        <div style={softText}>เหตุผล: {current.why}</div>

                        <div style={{ marginTop: 6, ...softText }}>
                          ทริคพี่สอนน้อง: ถามว่า “โพสต์นี้อยากให้เราทำอะไร?” แล้วหา “เบาะแส”
                          เช่น คำเร่ง/ตัวอักษรใหญ่/โปร/ราคา/ลิงก์/ภาษากดดันให้แชร์
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ✅ Navigation */}
                <div style={{ display: "flex", gap: 10, justifyContent: "space-between" }}>
                  <button
                    className="edu-btn edu-btn--back"
                    type="button"
                    onClick={() => {
                      setStep("micro");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    <FiChevronLeft aria-hidden="true" /> กลับ
                  </button>

                  <div style={{ display: "flex", gap: 10 }}>
                    {scIdx < SCENARIOS.length - 1 ? (
                      <button
                        className="edu-btn edu-btn--primary"
                        type="button"
                        onClick={nextScenario}
                        disabled={!pickedNow}
                        title={!pickedNow ? "เลือกคำตอบก่อนนะ" : "ไปต่อ"}
                      >
                        สถานการณ์ถัดไป <FiChevronRight aria-hidden="true" />
                      </button>
                    ) : (
                      <button
                        className="edu-btn edu-btn--ghost"
                        type="button"
                        onClick={() => navigate("/unit5/learn", { replace: true })}
                        disabled={!pickedNow}
                        title={!pickedNow ? "เลือกคำตอบก่อนนะ" : "กลับหน้ารวม Unit 5"}
                      >
                        เสร็จสิ้น <FiChevronRight aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ✅ debug */}
            {mode === "debug" && (
              <div style={{ marginTop: 14, ...softText }}>
                debug: step={step}, scIdx={scIdx}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Learn3Unit5;
