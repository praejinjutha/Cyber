import { useEffect, useMemo, useRef, useState } from "react"; // ✅ React hooks
import { useLocation, useNavigate } from "react-router-dom"; // ✅ Router helpers
import { supabase } from "../../lib/supabase"; // ✅ Supabase auth/profile

import logo from "../../assets/logo.png"; // ✅ Brand logo

// ✅ วิดีโอของ Unit 5 เรื่องที่ 1
// ⭐ ให้คุณใส่ไฟล์จริงไว้ที่ src/assets/learn5.1.mp4 (ตอนนี้คุณใช้ learn3.1.mp4 อยู่)
import learnVideo from "../../assets/learn3.1.mp4";

// ✅ (เพิ่ม) รูป “ฐานข้อมูลให้จำแนกความน่าเชื่อถือของแหล่งข่าว (ไทย)”
import sourceThaiGood from "./source_th_good.png";
import sourceThaiGeneral from "./source_th_general.png";
import sourceThaiSuspicious from "./source_th_suspicious.png";

// ✅ CSS
import "../../main.css";
import "../Unit1/learn.css";

// ✅ Icons
import {
  FiChevronLeft,
  FiChevronRight,
  FiFileText,
  FiHome,
  FiLogOut,
  FiUser,
  FiCheckCircle,
  FiAlertTriangle,
  FiShield,
  FiTarget,
  FiPlayCircle,
  FiSearch,
  FiInfo,
} from "react-icons/fi";

/* ------------------------------------------------------------------ */
/* ✅ QUIZ: Interactive Concept Checking + Immediate Feedback           */
/* - เน้น “จำแนกระดับความน่าเชื่อถือของแหล่งข่าว”                       */
/* - ไม่ทวนแนวคิดยาว ๆ เพราะอยู่ใน slide/video แล้ว                     */
/* ------------------------------------------------------------------ */
const QUIZ = [
  {
    id: "q1",
    prompt:
      "ถ้าเห็นโพสต์ข่าวในโซเชียล สิ่งแรกที่ควรเช็กเพื่อประเมินความน่าเชื่อถือของ “แหล่งข่าว” คือข้อใด?",
    answer: "B",
    choices: [
      { id: "A", label: "A) จำนวนไลก์/แชร์เยอะไหม" },
      { id: "B", label: "B) ใครเป็นคน/องค์กรที่โพสต์ (มีตัวตนชัดไหม)" },
      { id: "C", label: "C) อ่านคอมเมนต์แล้วคนส่วนใหญ่เชื่อไหม" },
    ],
    feedback: {
      A: "ยังไม่ตรง ❌ แชร์เยอะไม่ได้แปลว่าจริง (แชร์ผิดก็เยอะได้) ให้ยึดตัวตน/ที่มาเป็นหลัก",
      B: "ถูกต้อง ✅ เริ่มจากดู 'ใครโพสต์' เพราะถ้ามีตัวตนชัด เราตรวจสอบ/รับผิดชอบย้อนกลับได้",
      C: "ยังไม่ตรง ❌ คอมเมนต์เป็นความเห็น ไม่ใช่หลักฐาน ให้ดูตัวตนและที่มา",
    },
  },
  {
    id: "q2",
    prompt:
      "ข้อใดเป็น “สัญญาณเสี่ยง” ที่ทำให้เราควรระวังว่าแหล่งข่าวอาจไม่น่าเชื่อถือ?",
    answer: "C",
    choices: [
      { id: "A", label: "A) มีวันที่เผยแพร่ชัดเจน" },
      { id: "B", label: "B) ระบุหน่วยงาน/เอกสารอ้างอิงให้ตรวจสอบได้" },
      { id: "C", label: "C) ไม่มีที่มาและเร่งให้กดลิงก์/แชร์ทันที" },
      { id: "D", label: "D) มีชื่อผู้เขียน/สำนักข่าวชัด" },
    ],
    feedback: {
      A: "ยังไม่ใช่ ❌ มีวันที่ชัดช่วยเช็กบริบท/ความใหม่ของข่าวได้",
      B: "ยังไม่ใช่ ❌ อ้างอิงตรวจสอบได้ = เพิ่มความน่าเชื่อถือ",
      C: "ถูกต้อง ✅ 'ไม่มีที่มา + เร่งให้กด/แชร์' เป็นสัญญาณแดง เพราะเสี่ยงข่าวปั่น/ลิงก์อันตราย",
      D: "ยังไม่ใช่ ❌ มีตัวตน/ผู้เขียนชัด เป็นสัญญาณที่ดี",
    },
  },
  {
    id: "q3",
    prompt:
      "ข่าวหนึ่งดูเหมือนจริง แต่เราไม่แน่ใจว่าถูกต้อง ควรทำอย่างไร “เหมาะสมที่สุด” ก่อนแชร์?",
    answer: "A",
    choices: [
      { id: "A", label: "A) เช็กแหล่งอ้างอิง + เทียบกับอีก 1–2 แหล่งที่น่าเชื่อถือ" },
      { id: "B", label: "B) แชร์ก่อน แล้วค่อยแก้ทีหลัง" },
      { id: "C", label: "C) เชื่อเพราะเพื่อนในกลุ่มแชร์มา" },
    ],
    feedback: {
      A: "ถูกต้อง ✅ ปลอดภัยสุดคือเช็กที่มา/หลักฐาน + เทียบหลายแหล่งก่อนตัดสินใจ",
      B: "ไม่แนะนำ ❌ แชร์ผิดแล้วแก้ทีหลัง ความเสียหายอาจเกิดไปแล้ว (คนแคป/ส่งต่อได้)",
      C: "ยังไม่ตรง ❌ 'เพื่อนแชร์' ไม่ใช่หลักฐาน ต้องตรวจสอบจากแหล่งที่เชื่อถือได้",
    },
  },
];

/* ------------------------------------------------------------------ */
/* ✅ COMPONENT                                                        */
/* ------------------------------------------------------------------ */
const Learn1Unit5 = () => {
  /* =========================
     ✅ Router helpers
     ========================= */
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ รองรับ query mode เผื่อใช้ต่อ
  const mode = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    return sp.get("mode") || "all";
  }, [location.search]);

  /* =========================
     ✅ UI state
     ========================= */
  const [loading, setLoading] = useState(true); // ✅ โหลดข้อมูลผู้เรียน
  const [studentName, setStudentName] = useState(""); // ✅ ชื่อผู้เรียนแสดงบน topbar

  /**
   * ✅ step flow
   * - "video"  : วิดีโอ (Concept Introduction + Slides)
   * - "prep"   : เตรียมทำแบบฝึก + “รูปฐานข้อมูล” ให้สังเกต
   * - "quiz"   : mini quiz + immediate feedback
   */
  const [step, setStep] = useState("video");

  // ✅ placeholder result (เผื่อใช้เก็บ log ต่อ)
  const [prepResult, setPrepResult] = useState(null);

  /* =========================
     ✅ QUIZ STATE
     ========================= */
  const [answers, setAnswers] = useState({}); // ✅ { [qid]: choiceId }
  const [submitted, setSubmitted] = useState(false); // ✅ submit แล้วหรือยัง

  // ✅ เลือกคำตอบ
  const choose = (qid, choiceId) => {
    setAnswers((prev) => ({ ...prev, [qid]: choiceId }));
  };

  // ✅ ส่งคำตอบเพื่อดู feedback
  const submitQuiz = () => {
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ ไปหน้าถัดไปหลังทำ quiz เสร็จ
  const goNextAfterQuiz = () => {
    navigate("/unit5/learn", { replace: true });
  };

  /* =========================
     ✅ LOAD PROFILE
     ========================= */
  useEffect(() => {
    let alive = true; // ✅ กัน setState หลัง unmount

    (async () => {
      setLoading(true);

      // ✅ 1) เช็ค session
      const { data } = await supabase.auth.getSession();
      const u = data.session?.user;

      // ✅ ถ้าไม่ล็อกอิน ให้กลับหน้า login
      if (!u) {
        navigate("/login", { replace: true });
        return;
      }

      // ✅ 2) ดึงชื่อจาก student_profiles
      const { data: profile } = await supabase
        .from("student_profiles")
        .select("first_name,last_name")
        .eq("user_id", u.id)
        .maybeSingle();

      // ✅ ถ้า component ถูกปิดไปแล้ว ไม่ต้อง setState
      if (!alive) return;

      // ✅ ตั้งชื่อแสดงผล
      if (profile) {
        setStudentName(`${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim());
      }

      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [navigate]);

  /* =========================
     ✅ UI computed
     ========================= */
  const panelTitle = useMemo(() => {
    if (step === "video") return "บทนำ";
    if (step === "prep") return "เตรียมทำแบบฝึก (ดูรูปประกอบ)";
    return "แบบฝึก: mini quiz + เฉลยทันที";
  }, [step]);

  const allAnswered = useMemo(() => Object.keys(answers).length === QUIZ.length, [answers]);

  const score = useMemo(() => {
    let s = 0;
    for (const q of QUIZ) {
      if (answers[q.id] === q.answer) s += 1;
    }
    return s;
  }, [answers]);

  /* =========================
     ✅ STYLES (inline)
     ========================= */
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
  });

  const infoCardStyle = {
    borderRadius: 14,
    border: "1px solid rgba(0,0,0,0.08)",
    background: "rgba(255,255,255,0.55)",
    padding: 12,
  };

  const sectionTitleStyle = { fontWeight: 950, marginBottom: 6 };

  /* =========================
     ✅ IMAGE DATASET (ฐานข้อมูลจากรูป)
     - ใช้เพื่อ “สังเกตตัวตนของแหล่งข่าว”
     ========================= */
  const SOURCE_IMAGES = useMemo(
    () => [
      {
        id: "good",
        title: "ตัวอย่าง A: สื่อ/องค์กรชัดเจน (ไทย)",
        img: sourceThaiGood,
        badge: "น่าเชื่อถือกว่า",
        icon: <FiCheckCircle aria-hidden="true" />,
        points: [
          "มีชื่อองค์กร/สำนักข่าวชัด",
          "มีเครดิต/ที่มา หรือข้อมูลอ้างอิงให้ตามต่อได้",
          "ดูแล้วตรวจสอบย้อนกลับได้ (มีตัวตนรับผิดชอบ)",
        ],
      },
      {
        id: "general",
        title: "ตัวอย่าง B: เพจทั่วไป / โพสต์ทั่วไป",
        img: sourceThaiGeneral,
        badge: "ต้องตรวจเพิ่ม",
        icon: <FiSearch aria-hidden="true" />,
        points: [
          "หน้าตาเหมือนข่าว แต่ยังไม่เห็นองค์กรชัด",
          "อาจเป็นเพจสรุป/แชร์ต่อ ไม่ใช่ต้นทาง",
          "ก่อนเชื่อควรหาต้นฉบับ/เทียบอีก 1–2 แหล่ง",
        ],
      },
      {
        id: "sus",
        title: "ตัวอย่าง C: แหล่งข่าวน่าสงสัย",
        img: sourceThaiSuspicious,
        badge: "สัญญาณเสี่ยง",
        icon: <FiAlertTriangle aria-hidden="true" />,
        points: [
          "ใช้คำเร่งอารมณ์/เร่งแชร์ เช่น “เตือน!!!/ด่วนมาก”",
          "ไม่เห็นแหล่งอ้างอิงที่ตรวจสอบได้",
          "ชื่อเพจ/ตัวตนไม่ชัด → ต้องหยุดก่อนและตรวจเพิ่ม",
        ],
      },
    ],
    []
  );

  // ✅ (เพิ่ม) state ให้ผู้เรียน “กดเลือกภาพที่คิดว่าน่าเชื่อถือที่สุด”
  // - ไม่ใช่ข้อสอบหลัก แต่เป็น warm-up ให้เกิดการ “ตัดสินใจจากสิ่งที่เห็น”
  const [pickedSourceId, setPickedSourceId] = useState(null);

  // ✅ (เพิ่ม) ref สำหรับเลื่อนไปที่กล่อง feedback
  const feedbackRef = useRef(null);

  // ✅ (เพิ่ม) สรุปข้อความตามการเลือก (ให้ระบบเป็นคน feedback ตามแนว LearnSecure)
  const pickedFeedback = useMemo(() => {
    if (!pickedSourceId) return null;

    if (pickedSourceId === "good") {
      return {
        tone: "good",
        title: "ดีมาก ✅ คุณเลือกแบบ “มีตัวตนชัด”",
        desc:
          "แหล่งข่าวที่มีชื่อองค์กรชัดและตรวจสอบย้อนกลับได้ มักน่าเชื่อถือกว่าพวกที่ไม่ระบุตัวตน",
      };
    }

    if (pickedSourceId === "general") {
      return {
        tone: "warn",
        title: "โอเคนะ ⚠️ แต่อย่าหยุดแค่นี้",
        desc:
          "เพจทั่วไปอาจโพสต์จริงก็ได้ แต่ก่อนแชร์ควรหาต้นทาง/เทียบแหล่งอื่นเพิ่ม เพื่อกันข้อมูลผิดพลาด",
      };
    }

    return {
      tone: "danger",
      title: "ระวังนะ 🔴 สัญญาณเสี่ยง",
      desc:
        "โพสต์ที่เร่งอารมณ์/ไม่ชัดว่าใครเป็นเจ้าของข้อมูล ควรหยุดก่อน ตรวจสอบกับแหล่งที่เชื่อถือได้",
    };
  }, [pickedSourceId]);

  // ✅ (เพิ่ม) กล่อง feedback style ตามโทน
  const feedbackBoxStyle = (tone) => {
    if (tone === "good") {
      return {
        borderRadius: 14,
        border: "1px solid rgba(16,185,129,0.25)",
        background: "rgba(16,185,129,0.10)",
        padding: 12,
      };
    }
    if (tone === "warn") {
      return {
        borderRadius: 14,
        border: "1px solid rgba(245,158,11,0.25)",
        background: "rgba(245,158,11,0.10)",
        padding: 12,
      };
    }
    return {
      borderRadius: 14,
      border: "1px solid rgba(220,38,38,0.18)",
      background: "rgba(220,38,38,0.08)",
      padding: 12,
    };
  };

  return (
    <div className="edu-app">
      {/* =========================
          ✅ TOPBAR
          ========================= */}
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
            {/* ✅ User chip */}
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

            {/* ✅ Logout */}
            <button
              className="edu-btn edu-btn--danger"
              type="button"
              onClick={async () => {
                // ✅ sign out
                await supabase.auth.signOut();
                // ✅ go login
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
        {/* =========================
            ✅ HERO
            ========================= */}
        <section className="edu-hero" aria-label="Unit 5 header">
          <div className="edu-hero__card">
            <div className="edu-hero__row">
              <div className="edu-hero__headline">
                <div className="edu-hero__title">Unit 5: การรู้เท่าทันข่าวและข้อมูลออนไลน์</div>
<div className="edu-hero__sub">เรื่องที่ 1	การประเมินความน่าเชื่อถือของแหล่งข่าวออนไลน์
</div>

                {/* ✅ Toolbar */}
                <div className="edu-lessons__toolbar">
                  <button
                    className="edu-btn edu-btn--back"
                    type="button"
                    onClick={() => {
                      // ✅ กลับแบบ step-by-step
                      if (step === "quiz") {
                        setStep("prep");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        return;
                      }
                      if (step === "prep") {
                        setStep("video");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        return;
                      }
                      // ✅ fallback: back browser
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

              {/* ✅ meta area (เผื่อใช้ต่อ) */}
              <div className="edu-lessons__meta" />
            </div>
          </div>
        </section>

        {/* =========================
            ✅ CONTENT PANEL
            ========================= */}
        <section className="edu-panel1">
          <div className="edu-panel1__head">
            <div className="edu-panel1__title">
              <FiFileText aria-hidden="true" />
              {panelTitle}
            </div>
          </div>

          {/* =========================================================
              ✅ STEP 1: VIDEO
              ========================================================= */}
          {step === "video" && (
            <div className="edu-videoStage">
              {/* ✅ Video player */}
              <video className="edu-video" src={learnVideo} controls playsInline />

              {/* ✅ Actions */}
              <div className="edu-videoActions">
                <button
                  className="edu-btn edu-btn--ghost"
                  type="button"
                  onClick={() => {
                    // ✅ go next step
                    setStep("prep");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  title="ไปหน้าถัดไป"
                >
                  ถัดไป <FiChevronRight aria-hidden="true" />
                </button>
              </div>
            </div>
          )}

          {/* =========================================================
              ✅ STEP 2: PREP (มีรูปฐานข้อมูล)
              ========================================================= */}
          {step === "prep" && (
            <div style={{ padding: 16 }}>
              <div className="edu-card">
                <div className="edu-card__body" style={{ display: "grid", gap: 12 }}>
                  {/* ✅ Goal */}
                  <div style={infoCardStyle}>
                    <div style={sectionTitleStyle}>
                      <FiTarget style={{ marginRight: 8 }} />
                      เป้าหมายของแบบฝึกนี้
                    </div>
                    <div style={{ fontSize: 13, opacity: 0.92, lineHeight: 1.65 }}>
                      คุณจะได้ฝึก “ดูตัวตนของแหล่งข่าว” จากสิ่งที่เห็นในภาพ เช่น
                      <strong> ชื่อองค์กร / ความเป็นสื่อ / ช่องทางตรวจสอบย้อนกลับ</strong>
                    </div>
                  </div>

                  {/* ✅ Rule */}
                  <div style={infoCardStyle}>
                    <div style={sectionTitleStyle}>
                      <FiPlayCircle style={{ marginRight: 8 }} />
                      กติกาง่าย ๆ ก่อนเริ่ม
                    </div>
                    <ul style={{ margin: "6px 0 0 18px", fontSize: 13, opacity: 0.92, lineHeight: 1.65 }}>
                      <li>ดู “ภาพตัวอย่าง” ด้านล่าง แล้วลองตัดสินใจด้วยตัวเอง</li>
                      <li>พอกดเลือก ระบบจะบอกเหตุผลให้ทันที (ไม่ต้องกลัวผิด)</li>
                      <li>ในชีวิตจริง ถ้าเจอโพสต์ชวนแชร์: <strong>หยุดก่อน</strong> แล้วค่อยตรวจสอบ</li>
                    </ul>
                  </div>

                  {/* ✅ (เพิ่ม) IMAGE DATASET SECTION */}
                  <div
                    style={{
                      borderRadius: 14,
                      border: "1px solid rgba(59,130,246,0.20)",
                      background: "rgba(59,130,246,0.08)",
                      padding: 12,
                    }}
                  >
                    <div style={{ fontWeight: 950 }}>
                      <FiInfo style={{ marginRight: 8 }} />
                      ชุดภาพฝึกสังเกต “ตัวตนของแหล่งข่าว”
                    </div>
                    <div style={{ fontSize: 13, opacity: 0.9, marginTop: 6, lineHeight: 1.65 }}>
                      ให้มองเหมือนคุณเป็นนักสืบข่าว: ดูว่า <strong>ใครเป็นคนโพสต์</strong> และ
                      <strong>ตรวจสอบย้อนกลับได้ไหม</strong>
                    </div>
                  </div>

                  {/* ✅ Cards: 3 images */}
                  <div style={{ display: "grid", gap: 12 }}>
                    {SOURCE_IMAGES.map((it) => {
                      const active = pickedSourceId === it.id;

                      return (
                        <div
                          key={it.id}
                          style={{
                            borderRadius: 16,
                            border: active
                              ? "1px solid rgba(59,130,246,0.45)"
                              : "1px solid rgba(0,0,0,0.08)",
                            background: active ? "rgba(59,130,246,0.08)" : "rgba(255,255,255,0.55)",
                            padding: 12,
                          }}
                        >
                          {/* ✅ Header row */}
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                            <div style={{ fontWeight: 950, display: "flex", alignItems: "center", gap: 8 }}>
                              {it.icon}
                              {it.title}
                            </div>

                            {/* ✅ Badge */}
                            <div
                              style={{
                                borderRadius: 999,
                                padding: "6px 10px",
                                fontSize: 12,
                                fontWeight: 900,
                                border: "1px solid rgba(0,0,0,0.10)",
                                background: "rgba(255,255,255,0.70)",
                                opacity: 0.95,
                              }}
                              title={it.badge}
                            >
                              {it.badge}
                            </div>
                          </div>

                          {/* ✅ Image (ลดขนาด แต่ไม่ตัดรูป) */}
                          <div style={{ marginTop: 10 }}>
                            <img
                              src={it.img}
                              alt={it.title}
                              style={{
                                width: "100%",
                                maxWidth: 560,
                                height: "auto",
                                borderRadius: 14,
                                border: "1px solid rgba(0,0,0,0.08)",
                                display: "block",
                                margin: "0 auto",
                              }}
                              loading="lazy"
                            />
                          </div>

                          {/* ✅ Checklist */}
                          <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
                            {it.points.map((p, i) => (
                              <div key={`${it.id}-p-${i}`} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                                <span style={{ fontWeight: 950, opacity: 0.7 }}>•</span>
                                <div style={{ fontSize: 13, opacity: 0.92, lineHeight: 1.55 }}>{p}</div>
                              </div>
                            ))}
                          </div>

                          {/* ✅ Pick button (warm-up) */}
                          <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <button
                              className="edu-btn edu-btn--ghost"
                              type="button"
                              onClick={() => {
                                // ✅ ผู้เรียนกดเลือกภาพนี้
                                setPickedSourceId(it.id);

                                // ✅ เด้งลงไปที่กล่อง feedback (ไม่ใช่ขึ้นบน)
                                setTimeout(() => {
                                  feedbackRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                                }, 0);
                              }}
                              title="ลองเลือกเพื่อดู feedback"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 8,
                                fontWeight: 900,
                              }}
                            >
                              <FiSearch aria-hidden="true" />
                              เลือกภาพนี้
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* ✅ (เพิ่ม) Feedback หลังเลือก */}
                  {pickedFeedback && (
                    <div ref={feedbackRef} style={feedbackBoxStyle(pickedFeedback.tone)}>
                      <div style={{ fontWeight: 950, display: "flex", alignItems: "center", gap: 8 }}>
                        <FiShield aria-hidden="true" />
                        {pickedFeedback.title}
                      </div>
                      <div style={{ fontSize: 13, opacity: 0.92, marginTop: 6, lineHeight: 1.65 }}>
                        {pickedFeedback.desc}
                      </div>
                      <div style={{ fontSize: 12, opacity: 0.78, marginTop: 6 }}>
                        *นี่เป็นการฝึกดู “ตัวตนของแหล่งข่าว” ไม่ใช่การตัดสินว่าเนื้อหาจริง/ปลอมทันที*
                      </div>
                    </div>
                  )}

                  {/* ✅ Ready */}
                  <div
                    style={{
                      borderRadius: 14,
                      border: "1px solid rgba(16,185,129,0.22)",
                      background: "rgba(16,185,129,0.08)",
                      padding: 12,
                    }}
                  >
                    <div style={{ fontWeight: 950 }}>
                      <FiShield style={{ marginRight: 8 }} />
                      พร้อมแล้วกดเริ่มทำแบบฝึกได้เลย
                    </div>
                    <div style={{ fontSize: 13, opacity: 0.9, marginTop: 6, lineHeight: 1.65 }}>
                      *เนื้อหาทั้งหมดที่ต้องใช้ตอบ อยู่ในวิดีโอ + การสังเกตรูปด้านบน*
                    </div>
                  </div>
                </div>

                {/* ✅ Actions */}
                <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    className="edu-btn edu-btn--primary"
                    type="button"
                    onClick={() => {
                      // ✅ เก็บผลว่าเข้า prep แล้ว (เผื่อ log)
                      setPrepResult({ done: true, at: Date.now(), mode, pickedSourceId });

                      // ✅ รีเซ็ต quiz state
                      setAnswers({});
                      setSubmitted(false);

                      // ✅ ไป quiz
                      setStep("quiz");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    title="เริ่มทำแบบฝึก"
                  >
                    เริ่มทำแบบฝึก <FiChevronRight aria-hidden="true" />
                  </button>

                  <button
                    className="edu-btn edu-btn--back"
                    type="button"
                    onClick={() => {
                      // ✅ กลับไปวิดีโอ
                      setStep("video");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    title="กลับไปดูวิดีโอ"
                  >
                    <FiChevronLeft aria-hidden="true" /> กลับไปดูวิดีโอ
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              ✅ STEP 3: QUIZ
              ========================================================= */}
          {step === "quiz" && (
            <div style={{ padding: 16 }}>
              <div style={boxStyle}>
                {/* ✅ Header */}
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 950, marginBottom: 6 }}>
                      mini quiz (เฉลยทันที)
                    </div>
                    <div style={softText}>ตอบให้ครบ แล้วกด “ส่งคำตอบ” เพื่อดู feedback ทันที</div>
                  </div>

                  <div style={{ fontSize: 12, opacity: 0.8, alignSelf: "center" }}>
                    ตอบแล้ว {Object.keys(answers).length} / {QUIZ.length}
                  </div>
                </div>

                {/* ✅ Score summary */}
                {submitted && (
                  <div style={{ marginTop: 12 }}>
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "center",
                        padding: 10,
                        borderRadius: 12,
                        border: "1px solid rgba(59,130,246,0.20)",
                        background: "rgba(59,130,246,0.08)",
                      }}
                    >
                      <FiCheckCircle aria-hidden="true" />
                      <div>
                        <div style={{ fontWeight: 950 }}>สรุปคะแนน</div>
                        <div style={{ fontSize: 13, opacity: 0.9, marginTop: 2 }}>
                          คุณได้ {score} / {QUIZ.length} คะแนน
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ✅ Questions */}
                <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
                  {QUIZ.map((q, idx) => {
                    const picked = answers[q.id]; // ✅ คำตอบที่เลือก
                    const isCorrect = submitted && picked === q.answer; // ✅ ถูก
                    const isWrong = submitted && picked && picked !== q.answer; // ✅ ผิด

                    return (
                      <div
                        key={q.id}
                        style={{
                          borderRadius: 14,
                          border: "1px solid rgba(0,0,0,0.08)",
                          background: "rgba(255,255,255,0.55)",
                          padding: 12,
                        }}
                      >
                        {/* ✅ Prompt */}
                        <div style={{ fontWeight: 900, marginBottom: 6 }}>
                          {idx + 1}. {q.prompt}
                        </div>

                        {/* ✅ Choices */}
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
                          {q.choices.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                // ✅ เลือกคำตอบ
                                choose(q.id, c.id);
                                // ✅ ถ้าเคย submit แล้ว ให้กลับมาสถานะยังไม่ submit เพื่อเลือกใหม่
                                if (submitted) setSubmitted(false);
                              }}
                              style={pillStyle(picked === c.id)}
                              aria-pressed={picked === c.id}
                              title={c.label}
                            >
                              {c.label}
                            </button>
                          ))}
                        </div>

                        {/* ✅ Feedback */}
                        {submitted && (
                          <div style={{ marginTop: 10 }}>
                            {/* ✅ Correct */}
                            {isCorrect && (
                              <div
                                style={{
                                  display: "flex",
                                  gap: 10,
                                  alignItems: "flex-start",
                                  padding: 10,
                                  borderRadius: 12,
                                  border: "1px solid rgba(16,185,129,0.25)",
                                  background: "rgba(16,185,129,0.10)",
                                }}
                              >
                                <FiCheckCircle aria-hidden="true" />
                                <div>
                                  <div style={{ fontWeight: 900 }}>ถูกต้อง</div>
                                  <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>
                                    {q.feedback?.[picked] ?? "ดีมาก! คุณเลือกคำตอบถูกต้อง"}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* ✅ Wrong */}
                            {isWrong && (
                              <div
                                style={{
                                  display: "flex",
                                  gap: 10,
                                  alignItems: "flex-start",
                                  padding: 10,
                                  borderRadius: 12,
                                  border: "1px solid rgba(245,158,11,0.25)",
                                  background: "rgba(245,158,11,0.10)",
                                }}
                              >
                                <FiAlertTriangle aria-hidden="true" />
                                <div>
                                  <div style={{ fontWeight: 900 }}>ยังไม่ตรง (เฉลย: {q.answer})</div>
                                  <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>
                                    {q.feedback?.[picked] ?? "ลองกลับไปทบทวน แล้วเลือกใหม่ได้เลย"}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* ✅ Not picked */}
                            {!picked && (
                              <div
                                style={{
                                  display: "flex",
                                  gap: 10,
                                  alignItems: "flex-start",
                                  padding: 10,
                                  borderRadius: 12,
                                  border: "1px solid rgba(220,38,38,0.18)",
                                  background: "rgba(220,38,38,0.08)",
                                }}
                              >
                                <FiAlertTriangle aria-hidden="true" />
                                <div>
                                  <div style={{ fontWeight: 900 }}>ยังไม่ได้เลือกคำตอบ</div>
                                  <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>
                                    เลือก 1 ตัวเลือกก่อนนะ
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* ✅ Footer actions */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    marginTop: 14,
                    flexWrap: "wrap",
                  }}
                >
                  {/* ✅ Back to prep */}
                  <button
                    className="edu-btn edu-btn--back"
                    type="button"
                    onClick={() => {
                      setStep("prep");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    title="กลับไปหน้าเตรียมทำแบบฝึก"
                  >
                    <FiChevronLeft aria-hidden="true" /> กลับ
                  </button>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {/* ✅ Submit */}
                    <button
                      className="edu-btn edu-btn--primary"
                      type="button"
                      onClick={submitQuiz}
                      disabled={!allAnswered}
                      title={!allAnswered ? "ตอบให้ครบทุกข้อก่อนนะ" : "ส่งคำตอบเพื่อดู feedback"}
                    >
                      ส่งคำตอบ <FiChevronRight aria-hidden="true" />
                    </button>

                    {/* ✅ Finish */}
                    {submitted && (
                      <button
                        className="edu-btn edu-btn--ghost"
                        type="button"
                        onClick={goNextAfterQuiz}
                        title="กลับไปหน้า Unit 5"
                      >
                        เสร็จสิ้น <FiChevronRight aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Learn1Unit5;
