// src/pages/Unit3/Learn1.jsx
// ✅ Unit 3 - เรื่องที่ 1: ภาพลักษณ์ดิจิทัลและผลกระทบของโพสต์
// ตามแผน: Video-based Concept Introduction → Micro-lesson → Interactive Concept Checking → Immediate Feedback
// ✅ อัปเดต: เติม “ตัวอย่างโพสต์ในชีวิตจริง” + “เปรียบเทียบผลกระทบแบบ timeline” ให้ครบเนื้อหา

import { useEffect, useMemo, useState } from "react"; // ✅ React hooks
import { useLocation, useNavigate } from "react-router-dom"; // ✅ Router helpers
import { supabase } from "../../lib/supabase"; // ✅ Supabase auth/profile

import logo from "../../assets/logo.png"; // ✅ Brand logo

// ✅ วิดีโอของ Unit 3 เรื่องที่ 1
// ⭐ ให้คุณใส่ไฟล์จริงไว้ที่ src/assets/learn3.1.mp4
import learnVideo from "../../assets/learn3.1.mp4";

// ✅ CSS
import "../../main.css";
import "../Unit1/learn.css"; // ⭐ ใช้ CSS เดียวกับ Unit1/Unit2 ตามโปรเจกต์คุณ

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
} from "react-icons/fi";

/* ------------------------------------------------------------------ */
/* ✅ ตัวอย่างสถานการณ์/โพสต์ (เติมเนื้อหาให้ครบตามแผน)                */
/* ------------------------------------------------------------------ */
const EXAMPLES = [
  {
    id: "ex1",
    title: "เคส A: โพสต์ดราม่าในกลุ่มเพื่อน",
    postMock:
      "โพสต์สตอรี่: “บางคนก็ชอบทำตัวเด่นเกิน 🤡” + แท็กเพื่อนในห้อง (คนเริ่มเดากันว่าใคร)",
    shortImpact: [
      "เพื่อนบางคนคอมเมนต์แรง/ดราม่าในแชท",
      "เจ้าตัวที่โดนพาดพิงรู้สึกเสียหน้า เกิดทะเลาะ/บล็อกกัน",
      "ครูหรือผู้ปกครองอาจเห็นผ่านการแชร์ต่อ",
    ],
    longImpact: [
      "ถูกแคป/ส่งต่อ ทำให้ภาพลักษณ์ดูเป็นคนชอบดราม่าหรือบูลลี่",
      "เวลาสมัครกิจกรรม/ชมรม/ทุน คนอาจลังเลเพราะภาพที่เห็น",
      "ความสัมพันธ์ระยะยาวเสีย (เพื่อนใหม่/รุ่นน้องรู้เรื่องจากโพสต์เก่า)",
    ],
  },
  {
    id: "ex2",
    title: "เคส B: โพสต์ที่ดูปกติ แต่มีรอยเท้าดิจิทัลสะสม",
    postMock:
      "โพสต์/เช็คอินบ่อย ๆ: “อยู่ร้านเดิมอีกแล้ว 😋” + รูปหน้าร้าน + เวลา + สถานที่ (ทำซ้ำหลายครั้ง)",
    shortImpact: [
      "เพื่อนทัก/แซวว่าไปที่เดิมบ่อย",
      "คนรู้ว่าตอนนี้อยู่แถวไหน (โดยไม่ตั้งใจ)",
    ],
    longImpact: [
      "คนอื่นเดา “แพทเทิร์นชีวิต” ได้จากโพสต์สะสม (ไปไหน เวลาไหน)",
      "ความเป็นส่วนตัวลดลง เสี่ยงถูกตาม/ถูกรบกวน",
      "ภาพลักษณ์อาจถูกตีความผิด (เช่น ดูเที่ยวบ่อย/ไม่โฟกัสเรียน) แม้ความจริงไม่ใช่",
    ],
  },
];

/* ------------------------------------------------------------------ */
/* ✅ QUIZ: 3 ข้อ (Interactive Concept Checking + Immediate Feedback)  */
/* โฟกัสเรื่องที่ 1:                                                   */
/* - เข้าใจ “ภาพลักษณ์ดิจิทัล” + “รอยเท้าดิจิทัล”                      */
/* - แยกผลกระทบระยะสั้น vs ระยะยาวจาก “ตัวอย่างจริง”                    */
/* ------------------------------------------------------------------ */
const QUIZ = [
  {
    id: "q1",
    prompt:
      "จากเคส A (โพสต์ดราม่าในกลุ่มเพื่อน) ข้อใดเป็น “ผลกระทบระยะสั้น” ที่เกิดขึ้นได้ทันทีหลังโพสต์มากที่สุด?",
    answer: "A",
    choices: [
      { id: "A", label: "A) เพื่อนคอมเมนต์แรง/เกิดดราม่าในแชททันที" },
      { id: "B", label: "B) เวลาสมัครทุนในอนาคต คนลังเลเพราะภาพลักษณ์" },
      { id: "C", label: "C) คนเดาแพทเทิร์นชีวิตจากโพสต์สะสมหลายเดือน" },
    ],
    feedback: {
      A: "ถูกต้อง ✅ ดราม่า/คอมเมนต์/ทะเลาะกันทันทีหลังโพสต์ = ผลกระทบระยะสั้น (เกิดเร็ว เห็นผลทันที)",
      B: "ยังไม่ตรง ❌ นี่เป็นผลกระทบระยะยาว เพราะตามมาในอนาคตและมีผลต่อโอกาส",
      C: "ยังไม่ตรง ❌ นี่เป็นผลกระทบระยะยาวจากการสะสมรอยเท้าดิจิทัล (ไม่ใช่เกิดทันที)",
    },
  },
  {
    id: "q2",
    prompt:
      "จากเคส B (เช็คอิน/โพสต์สถานที่ซ้ำ ๆ) สิ่งที่สะท้อน “รอยเท้าดิจิทัล” ได้ชัดที่สุดคือข้อใด?",
    answer: "B",
    choices: [
      { id: "A", label: "A) เพื่อนทักแซวในคอมเมนต์ 1–2 ครั้ง" },
      { id: "B", label: "B) ข้อมูลที่สะสมจนคนเดาได้ว่าไปไหน/เวลาไหนเป็นประจำ" },
      { id: "C", label: "C) รูปอาหาร 1 รูปที่โพสต์ครั้งเดียว" },
    ],
    feedback: {
      A: "ยังไม่สุด ❌ การถูกแซวเป็นผลกระทบระยะสั้น แต่ “รอยเท้าดิจิทัล” คือร่องรอยที่สะสม/หลงเหลือ",
      B: "ถูกต้อง ✅ รอยเท้าดิจิทัลคือ ‘ร่องรอยสะสม’ ที่ทำให้คนอื่นมองเห็นแพทเทิร์นหรือข้อมูลบางอย่างจากอดีตได้",
      C: "ยังไม่ชัด ❌ โพสต์ครั้งเดียวอาจเป็นข้อมูลหนึ่งชิ้น แต่รอยเท้าดิจิทัลเด่นชัดเมื่อมีการสะสม/เชื่อมโยง",
    },
  },
  {
    id: "q3",
    prompt:
      "ข้อใดอธิบาย “ภาพลักษณ์ดิจิทัล” ได้ถูกต้องที่สุด?",
    answer: "C",
    choices: [
      { id: "A", label: "A) ตัวตนจริงทั้งหมดของเรา 100% บนโลกออนไลน์" },
      { id: "B", label: "B) สิ่งที่เราเห็นเกี่ยวกับตัวเองเท่านั้น" },
      { id: "C", label: "C) ภาพที่คนอื่นรับรู้และใช้ตัดสินเรา จากสิ่งที่ปรากฏออนไลน์" },
      { id: "D", label: "D) มีเฉพาะคนดังเท่านั้นที่มีภาพลักษณ์ดิจิทัล" },
    ],
    feedback: {
      A: "ยังไม่ตรง ❌ ภาพลักษณ์ดิจิทัลไม่ใช่ตัวตนทั้งหมด แต่เป็น ‘ภาพที่คนอื่นรับรู้’ จากหลักฐานออนไลน์",
      B: "ยังไม่ตรง ❌ จุดสำคัญคือ “คนอื่นตีความ” ไม่ใช่แค่เราเห็นเอง",
      C: "ถูกต้อง ✅ ภาพลักษณ์ดิจิทัลคือภาพที่คนอื่นรับรู้และนำไปตัดสินเรา จากโพสต์/คอมเมนต์/โปรไฟล์/สิ่งที่ถูกแชร์ต่อ",
      D: "ไม่ใช่ ❌ ทุกคนมีภาพลักษณ์ดิจิทัลได้ ไม่จำเป็นต้องเป็นคนดัง",
    },
  },
];

const Learn1Unit3 = () => {
  // ✅ Router helpers
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ อ่าน query mode เผื่อใช้ต่อ (เหมือน Unit1/Unit2)
  const mode = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    return sp.get("mode") || "all";
  }, [location.search]);

  // ✅ UI state
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");

  /**
   * ✅ step flow
   * - "video"  : วิดีโอ
   * - "summary": Micro-lesson (นิยาม + ตัวอย่าง + timeline)
   * - "quiz"   : mini quiz (3 ข้อ)
   */
  const [step, setStep] = useState("video");

  // ✅ placeholder result (เผื่อใช้ต่อ/เก็บ log)
  const [summaryResult, setSummaryResult] = useState(null);

  /* ------------------------------------------------------------------ */
  /* ✅ QUIZ STATE                                                      */
  /* ------------------------------------------------------------------ */
  const [answers, setAnswers] = useState({}); // ✅ เก็บคำตอบ: { [qid]: choiceId }
  const [submitted, setSubmitted] = useState(false); // ✅ submit แล้วหรือยัง (โชว์ feedback)

  // ✅ เลือกคำตอบ
  const choose = (qid, choiceId) => {
    setAnswers((prev) => ({ ...prev, [qid]: choiceId }));
  };

  // ✅ ส่งคำตอบเพื่อดู feedback
  const submitQuiz = () => {
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ ไปหน้าถัดไปหลังทำ quiz เสร็จ: เรื่องที่ 1 → เรื่องที่ 2
const goNextAfterQuiz = () => {
  navigate("/unit3/learn", { replace: true });
};


  // ✅ โหลดชื่อผู้เรียน
  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);

      // 1) เช็ค session
      const { data } = await supabase.auth.getSession();
      const u = data.session?.user;

      // ✅ ถ้าไม่ล็อกอิน ให้กลับหน้า login
      if (!u) {
        navigate("/login", { replace: true });
        return;
      }

      // 2) ดึงชื่อจาก student_profiles
      const { data: profile } = await supabase
        .from("student_profiles")
        .select("first_name,last_name")
        .eq("user_id", u.id)
        .maybeSingle();

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

  // ✅ title ใน panel ให้เปลี่ยนตาม step
  const panelTitle = useMemo(() => {
    if (step === "video") return "บทนำ: ภาพลักษณ์ดิจิทัลและผลกระทบของโพสต์";
    if (step === "summary") return "นิยาม + ตัวอย่างจริง + เปรียบเทียบผลกระทบ";
    return "mini quiz";
  }, [step]);

  /* ------------------------------------------------------------------ */
  /* ✅ QUIZ UI helpers (ยึดสไตล์จาก Unit2/Learn1 ที่คุณให้มา)           */
  /* ------------------------------------------------------------------ */
  const softText = { fontSize: 13, opacity: 0.8 };

  // ✅ กล่องพื้นหลังของวิวข้อสอบ
  const boxStyle = {
    borderRadius: 16,
    border: "1px solid rgba(0,0,0,0.08)",
    background: "rgba(255,255,255,0.55)",
    padding: 14,
  };

  // ✅ ปุ่มตัวเลือกทรง pill
  const pillStyle = (active) => ({
    borderRadius: 999,
    border: active ? "1px solid rgba(59,130,246,0.45)" : "1px solid rgba(0,0,0,0.10)",
    background: active ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.70)",
    padding: "8px 12px",
    fontSize: 13,
    fontWeight: 800,
    cursor: "pointer",
  });

  // ✅ เช็คตอบครบหรือยัง
  const allAnswered = useMemo(() => Object.keys(answers).length === QUIZ.length, [answers]);

  // ✅ คะแนนรวม
  const score = useMemo(() => {
    let s = 0;
    for (const q of QUIZ) {
      if (answers[q.id] === q.answer) s += 1;
    }
    return s;
  }, [answers]);

  // ✅ Helper UI style สำหรับกล่องเนื้อหา
  const infoCardStyle = {
    borderRadius: 14,
    border: "1px solid rgba(0,0,0,0.08)",
    background: "rgba(255,255,255,0.55)",
    padding: 12,
  };

  // ✅ Helper UI style สำหรับหัวข้อย่อย
  const sectionTitleStyle = { fontWeight: 950, marginBottom: 6 };

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
              <div className="edu-brandtext__subtitle">Unit 3</div>
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
        <section className="edu-hero" aria-label="Unit 3 header">
          <div className="edu-hero__card">
            <div className="edu-hero__row">
              <div className="edu-hero__headline">
                {/* ✅ Title */}
                <div className="edu-hero__title">Unit 3: การจัดการรอยเท้าดิจิทัลและตัวตนออนไลน์</div>
<div className="edu-hero__sub">เรื่องที่ 1	ภาพลักษณ์ดิจิทัลและผลกระทบของโพสต์
</div>
                {/* ✅ Toolbar buttons */}
                <div className="edu-lessons__toolbar">
                  <button
                    className="edu-btn edu-btn--back"
                    type="button"
                    onClick={() => {
                      // ✅ ปุ่มกลับแบบ step-by-step
                      if (step === "quiz") {
                        setStep("summary");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        return;
                      }
                      if (step === "summary") {
                        setStep("video");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        return;
                      }

                      // ✅ ถ้าอยู่หน้า video แล้วกดกลับ → ถอยกลับ 1 หน้า
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

              {/* ✅ meta placeholder */}
              <div className="edu-lessons__meta">{/* เว้นไว้ */}</div>
            </div>
          </div>
        </section>

        {/* ✅ CONTENT */}
        <section className="edu-panel1">
          {/* ✅ Panel header */}
          <div className="edu-panel1__head">
            <div className="edu-panel1__title">
              <FiFileText aria-hidden="true" />
              {panelTitle}
            </div>
          </div>

          {/* ✅ STEP 1: วิดีโอ (Video-based Concept Introduction) */}
          {step === "video" && (
            <div className="edu-videoStage">
              {/* ✅ วิดีโอ */}
              <video className="edu-video" src={learnVideo} controls playsInline />

              {/* ✅ ไปต่อ */}
              <div className="edu-videoActions">
                <button
                  className="edu-btn edu-btn--ghost"
                  type="button"
                  onClick={() => {
                    setStep("summary");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  title="ไปต่อ"
                >
                  ถัดไป <FiChevronRight aria-hidden="true" />
                </button>
              </div>
            </div>
          )}

          {/* ✅ STEP 2: Micro-lesson (นิยาม + ตัวอย่าง + timeline เปรียบเทียบ) */}
          {step === "summary" && (
            <div style={{ padding: 16 }}>
              <div className="edu-card">
                <div className="edu-card__title">เนื้อหาสำคัญ (ให้อ่านได้ครบ แม้ไม่ได้ดูวิดีโอ)</div>

                <div className="edu-card__body" style={{ display: "grid", gap: 12 }}>
                  {/* ✅ นิยาม */}
                  <div style={infoCardStyle}>
                    <div style={sectionTitleStyle}>1) คำสำคัญที่ต้องรู้</div>

                    <div style={{ display: "grid", gap: 10 }}>
                      <div>
                        <div style={{ fontWeight: 900 }}>ภาพลักษณ์ดิจิทัล (Digital Image)</div>
                        <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>
                          คือ “ภาพที่คนอื่นรับรู้และใช้ตัดสินเรา” จากสิ่งที่ปรากฏออนไลน์ เช่น โพสต์ คอมเมนต์ รูปโปรไฟล์ และสิ่งที่ถูกแชร์ต่อ
                        </div>
                      </div>

                      <div>
                        <div style={{ fontWeight: 900 }}>รอยเท้าดิจิทัล (Digital Footprint)</div>
                        <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>
                          คือ “ร่องรอยที่หลงเหลือ/สะสม” จากการใช้งานออนไลน์ เช่น โพสต์เก่า รูปที่ถูกแคป ประวัติการคอมเมนต์ หรือสิ่งที่คนอื่นแท็กเรา
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ✅ ตัวอย่างโพสต์ชีวิตจริง (2 เคส) */}
                  <div style={infoCardStyle}>
                    <div style={sectionTitleStyle}>2) ตัวอย่างโพสต์ในชีวิตจริงที่ส่งผลต่อภาพลักษณ์</div>

                    <div style={{ display: "grid", gap: 12 }}>
                      {EXAMPLES.map((ex) => (
                        <div
                          key={ex.id}
                          style={{
                            borderRadius: 14,
                            border: "1px solid rgba(0,0,0,0.08)",
                            background: "rgba(255,255,255,0.65)",
                            padding: 12,
                          }}
                        >
                          <div style={{ fontWeight: 950 }}>{ex.title}</div>

                          {/* ✅ ตัวอย่างโพสต์ (mock) */}
                          <div
                            style={{
                              marginTop: 8,
                              borderRadius: 12,
                              border: "1px dashed rgba(0,0,0,0.18)",
                              background: "rgba(255,255,255,0.75)",
                              padding: 10,
                              fontSize: 13,
                              lineHeight: 1.55,
                            }}
                          >
                            <div style={{ fontWeight: 900, marginBottom: 4 }}>ตัวอย่างโพสต์</div>
                            {ex.postMock}
                          </div>

                          {/* ✅ ผลกระทบสั้น/ยาว */}
                          <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
                            <div
                              style={{
                                borderRadius: 12,
                                border: "1px solid rgba(59,130,246,0.18)",
                                background: "rgba(59,130,246,0.07)",
                                padding: 10,
                              }}
                            >
                              <div style={{ fontWeight: 900 }}>ผลกระทบระยะสั้น (เกิดเร็ว/ทันที)</div>
                              <ul style={{ margin: "6px 0 0 18px", fontSize: 13, opacity: 0.9, lineHeight: 1.6 }}>
                                {ex.shortImpact.map((t, i) => (
                                  <li key={`${ex.id}-s-${i}`}>{t}</li>
                                ))}
                              </ul>
                            </div>

                            <div
                              style={{
                                borderRadius: 12,
                                border: "1px solid rgba(245,158,11,0.20)",
                                background: "rgba(245,158,11,0.08)",
                                padding: 10,
                              }}
                            >
                              <div style={{ fontWeight: 900 }}>ผลกระทบระยะยาว (ตามมาในอนาคต)</div>
                              <ul style={{ margin: "6px 0 0 18px", fontSize: 13, opacity: 0.9, lineHeight: 1.6 }}>
                                {ex.longImpact.map((t, i) => (
                                  <li key={`${ex.id}-l-${i}`}>{t}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ✅ เปรียบเทียบแบบ Timeline (โพสต์เดียวกัน) */}
                  <div style={infoCardStyle}>
                    <div style={sectionTitleStyle}>3) เปรียบเทียบ “ทันทีหลังโพสต์” vs “ระยะยาว” (Timeline)</div>

                    <div
                      style={{
                        borderRadius: 14,
                        border: "1px solid rgba(16,185,129,0.20)",
                        background: "rgba(16,185,129,0.08)",
                        padding: 12,
                      }}
                    >
                      <div style={{ fontWeight: 950, marginBottom: 6 }}>
                        ตัวอย่าง Timeline (ยกจากเคส A แบบเข้าใจง่าย)
                      </div>

                      <div style={{ display: "grid", gap: 10 }}>
                        <div
                          style={{
                            borderRadius: 12,
                            border: "1px solid rgba(0,0,0,0.08)",
                            background: "rgba(255,255,255,0.70)",
                            padding: 10,
                          }}
                        >
                          <div style={{ fontWeight: 900 }}>⏱ 0–1 ชั่วโมงหลังโพสต์ (ผลระยะสั้น)</div>
                          <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4, lineHeight: 1.6 }}>
                            คนเริ่มคอมเมนต์/แชร์ → ดราม่าไว → ความสัมพันธ์ตึงเครียด → อาจถูกผู้ใหญ่เรียกคุย
                          </div>
                        </div>

                        <div
                          style={{
                            borderRadius: 12,
                            border: "1px solid rgba(0,0,0,0.08)",
                            background: "rgba(255,255,255,0.70)",
                            padding: 10,
                          }}
                        >
                          <div style={{ fontWeight: 900 }}>📅 หลายสัปดาห์/หลายเดือน (เริ่มเห็นผลสะสม)</div>
                          <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4, lineHeight: 1.6 }}>
                            โพสต์ถูกแคปเก็บไว้/ถูกหยิบมาพูดซ้ำ → คนจำภาพว่า “ชอบดราม่า” แม้เรื่องจบไปแล้ว
                          </div>
                        </div>

                        <div
                          style={{
                            borderRadius: 12,
                            border: "1px solid rgba(0,0,0,0.08)",
                            background: "rgba(255,255,255,0.70)",
                            padding: 10,
                          }}
                        >
                          <div style={{ fontWeight: 900 }}>🎓 ตอนสมัครกิจกรรม/ทุน/งาน (ผลระยะยาว)</div>
                          <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4, lineHeight: 1.6 }}>
                            คนที่ไม่เคยรู้จักเราอาจเห็นโพสต์เก่า → ตัดสินจากสิ่งที่เห็น → โอกาสลดลง ทั้งที่ตัวจริงอาจไม่ใช่แบบนั้นแล้ว
                          </div>
                        </div>
                      </div>

                      <div style={{ fontSize: 13, opacity: 0.9, marginTop: 10, lineHeight: 1.6 }}>
                        ✅ สรุป: “ผลระยะสั้น” มักเห็นเร็ว แต่ “ผลระยะยาว” คือสิ่งที่ตามมาจากรอยเท้าดิจิทัลที่ยังหลงเหลือ/ถูกส่งต่อได้
                      </div>
                    </div>
                  </div>

                  {/* ✅ กรอบคิดจำง่าย */}
                  <div
                    style={{
                      borderRadius: 14,
                      border: "1px solid rgba(99,102,241,0.20)",
                      background: "rgba(99,102,241,0.08)",
                      padding: 12,
                    }}
                  >
                    <div style={{ fontWeight: 950 }}>กรอบคิดก่อนโพสต์ (จำง่าย)</div>
                    <div style={{ fontSize: 13, opacity: 0.92, marginTop: 6, lineHeight: 1.65 }}>
                      1) ถ้ามีคนแคปไปแชร์ต่อ จะเป็นยังไง? <br />
                      2) ถ้าคนที่เราไม่คาดคิดมาเห็น (ครู/ผู้ปกครอง/นายจ้าง) จะตีความยังไง? <br />
                      3) ถ้าอีก 2 ปีเรากลับมาอ่านโพสต์นี้เอง… ยังโอเคอยู่ไหม?
                    </div>
                  </div>
                </div>

                {/* ✅ ปุ่มไปทำ quiz */}
                <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    className="edu-btn edu-btn--primary"
                    type="button"
                    onClick={() => {
                      // ✅ ไปหน้า quiz และรีเซ็ตสถานะ
                      setSummaryResult({ done: true, at: Date.now(), mode });
                      setAnswers({});
                      setSubmitted(false);
                      setStep("quiz");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    title="ไปทำข้อสอบ"
                  >
                    ไปทำข้อสอบ (mini quiz) <FiChevronRight aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ✅ STEP 3: QUIZ (Interactive Concept Checking + Immediate Feedback) */}
          {step === "quiz" && (
            <div style={{ padding: 16 }}>
              <div style={boxStyle}>
                {/* ✅ Quiz header */}
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 950, marginBottom: 6 }}>mini quiz</div>
                    <div style={softText}>
                      ตอบจาก “ตัวอย่างจริง” เพื่อแยกผลกระทบระยะสั้น/ระยะยาว และเข้าใจภาพลักษณ์ดิจิทัล
                    </div>
                  </div>

                  <div style={{ fontSize: 12, opacity: 0.8, alignSelf: "center" }}>
                    ตอบแล้ว {Object.keys(answers).length} / {QUIZ.length}
                  </div>
                </div>

                {/* ✅ summary หลัง submit */}
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
                    const picked = answers[q.id];

                    // ✅ สถานะถูก/ผิดหลัง submit
                    const isCorrect = submitted && picked === q.answer;
                    const isWrong = submitted && picked && picked !== q.answer;

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
                        <div style={{ fontWeight: 900, marginBottom: 6 }}>
                          {idx + 1}. {q.prompt}
                        </div>

                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
                          {q.choices.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                // ✅ เลือกคำตอบ
                                choose(q.id, c.id);

                                // ✅ ถ้าเคย submit แล้ว และเปลี่ยนคำตอบ ให้ต้อง submit ใหม่เพื่อดู feedback ใหม่
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

                        {/* ✅ Feedback เฉพาะเมื่อกด submit */}
                        {submitted && (
                          <div style={{ marginTop: 10 }}>
                            {/* ✅ ถูก */}
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

                            {/* ✅ ผิด */}
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

                            {/* ✅ ยังไม่เลือก */}
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
                  <button
                    className="edu-btn edu-btn--back"
                    type="button"
                    onClick={() => {
                      setStep("summary");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    title="กลับไปดูเนื้อหา"
                  >
                    <FiChevronLeft aria-hidden="true" /> กลับไปดูเนื้อหา
                  </button>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button
                      className="edu-btn edu-btn--primary"
                      type="button"
                      onClick={submitQuiz}
                      disabled={!allAnswered}
                      title={!allAnswered ? "ตอบให้ครบทุกข้อก่อนนะ" : "ส่งคำตอบเพื่อดู feedback"}
                    >
                      ส่งคำตอบ <FiChevronRight aria-hidden="true" />
                    </button>

                    {/* ✅ ให้ไปต่อได้เมื่อ submit แล้ว */}
                    {submitted && (
                      <button
                        className="edu-btn edu-btn--ghost"
                        type="button"
                        onClick={goNextAfterQuiz}
                        title="ไปเรื่องที่ 2"
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

export default Learn1Unit3; // ✅ export default เพื่อให้ import ใน App.jsx ได้
