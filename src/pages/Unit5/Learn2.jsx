// src/pages/Unit5/Learn2Unit5.jsx
// ✅ Unit 5 - เรื่องที่ 2: การสังเกตอคติและการชี้นำในเนื้อหาข่าว
// Flow: Micro-lesson → Signal Identification Task → Interactive Concept Checking
// ✅ ใช้ CSS ตามที่ผู้ใช้กำหนด: main.css + Unit1/learn.css (ไม่ใช้ lesson.css/styles.css)

import { useEffect, useMemo, useState } from "react"; // ✅ React hooks
import { useLocation, useNavigate } from "react-router-dom"; // ✅ Router helpers
import { supabase } from "../../lib/supabase"; // ✅ Supabase auth/profile

import logo from "../../assets/logo.png"; // ✅ Brand logo

// ✅ (เพิ่ม) รูปตัวอย่างข่าว “พาดหัวแรง/ภาษาชี้นำ”
// ⭐ ให้วางไฟล์จริงไว้ที่: src/assets/unit5/dara.jpg
import daraImg from "../unit5/dara.png";

// ✅ CSS (ตามที่สั่ง)
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
  FiEye,
  FiFlag,
  FiImage,
} from "react-icons/fi";

/* ------------------------------------------------------------------ */
/* ✅ Micro-lesson (สั้น กระชับ)                                        */
/* - โฟกัส: อคติ/ชี้นำในข่าว คืออะไร + สัญญาณที่เจอบ่อย                 */
/* - ไม่ยาว (เดี๋ยวไปฝึกจากตัวอย่างจริงใน Task)                        */
/* ------------------------------------------------------------------ */
const MICRO_LESSON = {
  title: "อคติ & การชี้นำในข่าว",
  points: [
    {
      icon: "🎯",
      head: "อคติในข่าว (Bias)",
      body:
        "การนำเสนอที่ “เอียงไปด้านหนึ่ง” เช่น เลือกเล่าเฉพาะมุมที่ทำให้คนเชื่อแบบเดียว หรือใช้คำที่ทำให้คนรู้สึกชอบ/เกลียดทันที",
    },
    {
      icon: "🧲",
      head: "การชี้นำ (Framing / Leading)",
      body:
        "การใช้พาดหัว/คำบางคำเพื่อ “ลากอารมณ์” เช่น โกรธ กลัว สะใจ หรือทำให้ตัดสินก่อนอ่านรายละเอียด",
    },
    {
      icon: "🔍",
      head: "สัญญาณที่ควรจับตา",
      body:
        "คำแรง/เหมารวม, คำเร้าอารมณ์, เล่าด้านเดียว, ตัดคำพูดบางช่วง, ใช้คำว่า 'ชัดๆ', 'แน่นอน', 'หมดอนาคต' โดยไม่มีหลักฐานรองรับ",
    },
  ],
  quickRule:
    "จำง่าย: ถ้าอ่านแล้ว “อารมณ์นำก่อนเหตุผล” ให้หยุด แล้วมองหาคำ/มุมที่กำลังชี้นำเราอยู่",
};

/* ------------------------------------------------------------------ */
/* ✅ Signal Identification Task                                        */
/* - ให้ผู้เรียน “ไฮไลต์/เลือกสัญญาณ” จากตัวอย่างพาดหัวหรือข้อความข่าว  */
/* - ใช้รูปแบบ: เลือกได้หลายข้อ (multi-select) + feedback ทันที          */
/* ------------------------------------------------------------------ */
const SIGNAL_TASKS = [
  {
    id: "t1",
    title: "ตัวอย่าง 1: พาดหัวเร้าอารมณ์",
    text:
      "ด่วน!! คนไทยต้องรู้! วิธีนี้ทำให้ “รวยทันที” ใครไม่ทำถือว่าพลาดชีวิต!",
    signals: [
      { id: "s1", label: "คำเร้าอารมณ์/เร่งด่วน (ด่วน!! คนไทยต้องรู้!)", correct: true },
      { id: "s2", label: "สัญญาณเหมารวม (คนไทยต้องรู้)", correct: true },
      { id: "s3", label: "อ้างผลลัพธ์เกินจริง (รวยทันที)", correct: true },
      { id: "s4", label: "มีแหล่งอ้างอิงชัดเจน", correct: false },
    ],
    explain:
      "ข้อนี้ชี้นำด้วยความเร่งด่วน + เหมารวม + สัญญาผลลัพธ์เกินจริง ทำให้คนรีบเชื่อก่อนตรวจสอบ",
  },
  {
    id: "t2",
    title: "ตัวอย่าง 2: เล่าด้านเดียว",
    text:
      "นักเรียนกลุ่มนี้ทำผิดอีกแล้ว! พฤติกรรมแย่มาก สังคมรับไม่ได้",
    signals: [
      { id: "s1", label: "ใช้คำตัดสิน/โจมตี (ทำผิดอีกแล้ว, แย่มาก)", correct: true },
      { id: "s2", label: "เหมารวม (สังคมรับไม่ได้)", correct: true },
      { id: "s3", label: "มีข้อมูลอีกฝ่าย/บริบทครบถ้วน", correct: false },
      { id: "s4", label: "นำเสนอข้อเท็จจริงแบบเป็นกลาง", correct: false },
    ],
    explain:
      "ประโยคนี้กดอารมณ์และตัดสินก่อนให้ข้อมูลครบ ทำให้คนอ่านเอนเอียงตามผู้เขียน",
  },
  {
    id: "t3",
    title: "ตัวอย่าง 3: เลือกคำชี้นำ",
    text:
      "ชัดๆ! เขาทำแบบนี้เพราะเห็นแก่ตัวแน่นอน ไม่ต้องเดาก็รู้",
    signals: [
      { id: "s1", label: "ใช้คำยืนยันแบบไม่มีหลักฐาน (ชัดๆ, แน่นอน)", correct: true },
      { id: "s2", label: "เดาเจตนาคนอื่นแทนข้อเท็จจริง", correct: true },
      { id: "s3", label: "อ้างอิงข้อมูล/หลักฐานจากแหล่งที่ตรวจสอบได้", correct: false },
      { id: "s4", label: "ให้หลายมุมมอง/เปิดให้ตรวจสอบ", correct: false },
    ],
    explain:
      "นี่คือการชี้นำด้วยความมั่นใจปลอม (พูดเหมือนรู้แน่) แต่ไม่มีหลักฐานรองรับ",
  },
];

/* ------------------------------------------------------------------ */
/* ✅ Interactive Concept Checking (Mini Quiz)                          */
/* - 3 ข้อ: แยกอคติ/ชี้นำ และเลือกวิธีตอบสนองที่เหมาะสม                */
/* ------------------------------------------------------------------ */
const QUIZ = [
  {
    id: "q1",
    prompt:
      "ข้อใดเป็นตัวอย่างของ “คำเร้าอารมณ์/ชี้นำ” ที่พบบ่อยในพาดหัวข่าว?",
    answer: "A",
    choices: [
      { id: "A", label: "A) “ด่วน!! ช็อกทั้งประเทศ!”" },
      { id: "B", label: "B) “รายงานอ้างอิงจากประกาศวันที่…”" },
      { id: "C", label: "C) “มีข้อมูลจากหลายฝ่ายและเอกสารแนบ”" },
    ],
    feedback: {
      A: "ถูกต้อง ✅ คำแบบ 'ด่วน/ช็อก' กระตุ้นอารมณ์ให้รีบเชื่อก่อนตรวจสอบ",
      B: "ยังไม่ใช่ ❌ นี่เป็นสัญญาณที่ดี เพราะระบุที่มาชัด",
      C: "ยังไม่ใช่ ❌ นี่เป็นแนวทางนำเสนอที่สมดุลมากกว่า",
    },
  },
  {
    id: "q2",
    prompt:
      "ถ้าเนื้อหาเล่าเรื่องแบบ ‘ด้านเดียว’ สิ่งที่ควรทำเพื่อเช็กอคติคือข้อใด?",
    answer: "B",
    choices: [
      { id: "A", label: "A) เชื่อทันทีเพราะเขียนมั่นใจ" },
      { id: "B", label: "B) หาอีกแหล่ง/อีกมุมมองเพื่อเทียบ" },
      { id: "C", label: "C) ดูจำนวนแชร์ว่าเยอะไหม" },
    ],
    feedback: {
      A: "ไม่ควร ❌ ความมั่นใจในคำพูดไม่ใช่หลักฐาน",
      B: "ถูกต้อง ✅ การเทียบหลายแหล่งช่วยลดการโดนชี้นำจากมุมเดียว",
      C: "ยังไม่ตรง ❌ แชร์เยอะไม่รับประกันว่าถูกหรือเป็นกลาง",
    },
  },
  {
    id: "q3",
    prompt:
      "อ่านข่าวแล้วรู้สึกโกรธ/กลัวทันที สิ่งแรกที่ควรทำคืออะไร?",
    answer: "C",
    choices: [
      { id: "A", label: "A) แชร์ต่อเพื่อเตือนคนอื่นทันที" },
      { id: "B", label: "B) คอมเมนต์แรง ๆ กลับไป" },
      { id: "C", label: "C) หยุดก่อน แล้วมองหาคำ/มุมที่กำลังชี้นำเรา" },
    ],
    feedback: {
      A: "เสี่ยง ❌ อารมณ์พาไปแชร์ผิดได้ง่าย",
      B: "ไม่แนะนำ ❌ ยิ่งทำให้ความขัดแย้งบานปลาย",
      C: "ถูกต้อง ✅ แยกอารมณ์ออกจากข้อเท็จจริงก่อน แล้วค่อยตรวจสอบ",
    },
  },
];

const Learn2Unit5 = () => {
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
   * - "micro" : Micro-lesson
   * - "task"  : Signal Identification Task
   * - "quiz"  : Interactive Concept Checking
   */
  const [step, setStep] = useState("micro");

  /* ---------------------------
     ✅ TASK STATE (multi-select)
     --------------------------- */
  const [taskIdx, setTaskIdx] = useState(0); // ✅ task ปัจจุบัน
  const [taskPicked, setTaskPicked] = useState({}); // ✅ { [taskId]: Array(ids) }
  const [taskChecked, setTaskChecked] = useState(false); // ✅ กดตรวจแล้วหรือยัง

  // ✅ toggle เลือกสัญญาณ
  const toggleSignal = (taskId, signalId) => {
    setTaskPicked((prev) => {
      const next = { ...prev };
      const cur = new Set(next[taskId] || []);
      if (cur.has(signalId)) cur.delete(signalId);
      else cur.add(signalId);
      next[taskId] = Array.from(cur);
      return next;
    });
  };

  // ✅ ตรวจคำตอบของ task
  const checkTask = () => {
    setTaskChecked(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ ไป task ถัดไป
  const nextTask = () => {
    setTaskChecked(false);
    setTaskIdx((i) => Math.min(SIGNAL_TASKS.length - 1, i + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ ไป quiz หลังจบ task
  const goQuiz = () => {
    setStep("quiz");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ---------------------------
     ✅ QUIZ STATE
     --------------------------- */
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const choose = (qid, choiceId) => {
    setAnswers((prev) => ({ ...prev, [qid]: choiceId }));
  };

  const submitQuiz = () => {
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const allAnswered = useMemo(() => Object.keys(answers).length === QUIZ.length, [answers]);

  const score = useMemo(() => {
    let s = 0;
    for (const q of QUIZ) {
      if (answers[q.id] === q.answer) s += 1;
    }
    return s;
  }, [answers]);

  // ✅ ไปหน้าถัดไปหลังทำ quiz เสร็จ
  const goNextAfterQuiz = () => {
    navigate("/unit5/learn", { replace: true });
  };

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
    if (step === "micro") return "อคติ & การชี้นำ";
    if (step === "task") return "จับสัญญาณจากตัวอย่าง";
    return "mini quiz";
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
  });

  // ✅ (เพิ่ม) style สำหรับรูป: ลดขนาด แต่ “ไม่ตัดรูป”
  const imageStyleNoCrop = {
    width: "100%",
    maxWidth: 560, // ✅ อยากเล็กลงปรับเป็น 480/520 ได้
    height: "auto",
    borderRadius: 14,
    border: "1px solid rgba(0,0,0,0.08)",
    display: "block",
    margin: "0 auto",
  };

  const currentTask = SIGNAL_TASKS[taskIdx];
  const pickedList = taskPicked[currentTask.id] || [];
  const pickedSet = new Set(pickedList);

  // ✅ คำนวณผล task ตอนกดตรวจ
  const taskResult = useMemo(() => {
    const signals = currentTask.signals;
    const correctIds = new Set(signals.filter((s) => s.correct).map((s) => s.id));
    const picked = pickedSet;

    let correctPicked = 0;
    let wrongPicked = 0;

    picked.forEach((id) => {
      if (correctIds.has(id)) correctPicked += 1;
      else wrongPicked += 1;
    });

    const missed = Array.from(correctIds).filter((id) => !picked.has(id)).length;

    return {
      correctPicked,
      wrongPicked,
      missed,
      totalCorrect: correctIds.size,
    };
  }, [currentTask, pickedSet]);

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
<div className="edu-hero__sub">เรื่องที่ 2	การสังเกตอคติและการชี้นำในเนื้อหาข่าว
</div>

                <div className="edu-lessons__toolbar">
                  <button
                    className="edu-btn edu-btn--back"
                    type="button"
                    onClick={() => {
                      if (step === "quiz") {
                        setStep("task");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        return;
                      }
                      if (step === "task") {
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

          {/* =========================
              ✅ STEP 1: MICRO-LESSON
              ========================= */}
          {step === "micro" && (
            <div style={{ padding: 16 }}>
              <div className="edu-card">
                <div className="edu-card__title">{MICRO_LESSON.title}</div>

                <div className="edu-card__body" style={{ display: "grid", gap: 12 }}>
                  {MICRO_LESSON.points.map((p, i) => (
                    <div
                      key={`ml-${i}`}
                      style={{
                        borderRadius: 14,
                        border: "1px solid rgba(0,0,0,0.08)",
                        background: "rgba(255,255,255,0.60)",
                        padding: 12,
                      }}
                    >
                      <div style={{ fontWeight: 950 }}>
                        {p.icon} {p.head}
                      </div>
                      <div style={{ fontSize: 13, opacity: 0.92, marginTop: 6, lineHeight: 1.65 }}>
                        {p.body}
                      </div>
                    </div>
                  ))}

                  <div
                    style={{
                      borderRadius: 14,
                      border: "1px solid rgba(16,185,129,0.22)",
                      background: "rgba(16,185,129,0.08)",
                      padding: 12,
                    }}
                  >
                    <div style={{ fontWeight: 950 }}>
                      <FiEye style={{ marginRight: 8 }} />
                      กฎจำเร็ว
                    </div>
                    <div style={{ fontSize: 13, opacity: 0.92, marginTop: 6, lineHeight: 1.65 }}>
                      {MICRO_LESSON.quickRule}
                    </div>
                  </div>

                  {/* ✅ (เพิ่ม) รูปตัวอย่าง “อคติ/ชี้นำที่เห็นได้ทันที” */}
                  <div
                    style={{
                      borderRadius: 14,
                      border: "1px solid rgba(59,130,246,0.20)",
                      background: "rgba(59,130,246,0.08)",
                      padding: 12,
                    }}
                  >
                    <div style={{ fontWeight: 950 }}>
                      <FiImage style={{ marginRight: 8 }} />
                      ตัวอย่างภาพข่าว (จับสัญญาณจากสิ่งที่เห็น)
                    </div>

                    <div style={{ fontSize: 13, opacity: 0.9, marginTop: 6, lineHeight: 1.65 }}>
                      ดูรูปนี้แล้วลองสังเกตว่า “อะไรทำให้เรารู้สึกอยากเชื่อ/อยากตัดสินทันที”
                    </div>

                    <div style={{ marginTop: 10 }}>
                      <img src={daraImg} alt="ตัวอย่างพาดหัวข่าวเร้าอารมณ์/ชี้นำ" style={imageStyleNoCrop} />
                    </div>

                    <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
                      <div style={{ fontSize: 13, opacity: 0.92, lineHeight: 1.6 }}>
                        ✅ สิ่งที่ให้ “จับสัญญาณ” จากรูป:
                      </div>
                      <div style={{ fontSize: 13, opacity: 0.92, lineHeight: 1.6 }}>
                        • ตัวอักษรใหญ่/คำที่ชวนตื่นเต้น → กระตุ้นอารมณ์ก่อนเหตุผล
                      </div>
                      <div style={{ fontSize: 13, opacity: 0.92, lineHeight: 1.6 }}>
                        • การเลือกมุมเล่า/ภาพประกอบ → ทำให้เราเอนเอียงได้
                      </div>
                      <div style={{ fontSize: 13, opacity: 0.92, lineHeight: 1.6 }}>
                        • โทนคำที่ “สรุปแทนผู้อ่าน” → ทำให้ตัดสินเร็วโดยไม่ดูข้อมูลครบ
                      </div>
                      <div style={{ fontSize: 12, opacity: 0.78, marginTop: 2 }}>
                        *หมายเหตุ: รูปนี้ใช้เพื่อฝึก “จับสัญญาณการชี้นำ” ไม่ใช่ฟันธงว่าข่าวจริง/ปลอม*
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    className="edu-btn edu-btn--primary"
                    type="button"
                    onClick={() => {
                      // ✅ reset task state ก่อนเริ่ม
                      setTaskIdx(0);
                      setTaskChecked(false);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                      setStep("task");
                    }}
                    title="ไปฝึกจับสัญญาณ"
                  >
                    ไปฝึกจับสัญญาณ <FiChevronRight aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =========================
              ✅ STEP 2: SIGNAL IDENTIFICATION TASK
              ========================= */}
          {step === "task" && (
            <div style={{ padding: 16 }}>
              <div style={boxStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 950, marginBottom: 6 }}>
                      <FiFlag style={{ marginRight: 8 }} />
                      Task {taskIdx + 1} / {SIGNAL_TASKS.length}: {currentTask.title}
                    </div>
                    <div style={softText}>เลือก “สัญญาณอคติ/ชี้นำ” ที่คุณพบ (เลือกได้หลายข้อ)</div>
                  </div>

                  <div style={{ fontSize: 12, opacity: 0.8, alignSelf: "center" }}>
                    เลือกแล้ว {pickedList.length} ข้อ
                  </div>
                </div>

                {/* ✅ ข้อความตัวอย่าง */}
                <div
                  style={{
                    marginTop: 12,
                    borderRadius: 14,
                    border: "1px dashed rgba(0,0,0,0.20)",
                    background: "rgba(255,255,255,0.70)",
                    padding: 12,
                    fontSize: 14,
                    fontWeight: 900,
                    lineHeight: 1.6,
                  }}
                >
                  “{currentTask.text}”
                </div>

                {/* ✅ ตัวเลือกสัญญาณ */}
                <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {currentTask.signals.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        toggleSignal(currentTask.id, s.id);
                        if (taskChecked) setTaskChecked(false);
                      }}
                      style={pillStyle(pickedSet.has(s.id))}
                      aria-pressed={pickedSet.has(s.id)}
                      title={s.label}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                {/* ✅ ตรวจคำตอบ */}
                <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    className="edu-btn edu-btn--primary"
                    type="button"
                    onClick={checkTask}
                    disabled={pickedList.length === 0}
                    title={pickedList.length === 0 ? "เลือกอย่างน้อย 1 ข้อก่อนนะ" : "ตรวจคำตอบ"}
                  >
                    ตรวจคำตอบ <FiChevronRight aria-hidden="true" />
                  </button>

                  <button
                    className="edu-btn edu-btn--ghost"
                    type="button"
                    onClick={() => {
                      // ✅ รีเซ็ตเฉพาะ task นี้
                      setTaskPicked((prev) => ({ ...prev, [currentTask.id]: [] }));
                      setTaskChecked(false);
                    }}
                    title="ล้างตัวเลือก"
                  >
                    ล้างตัวเลือก
                  </button>
                </div>

                {/* ✅ Feedback ของ task */}
                {taskChecked && (
                  <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "flex-start",
                        padding: 10,
                        borderRadius: 12,
                        border: "1px solid rgba(59,130,246,0.20)",
                        background: "rgba(59,130,246,0.08)",
                      }}
                    >
                      <FiCheckCircle aria-hidden="true" />
                      <div>
                        <div style={{ fontWeight: 950 }}>ผลการจับสัญญาณ</div>
                        <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4, lineHeight: 1.6 }}>
                          ✅ เลือกถูก {taskResult.correctPicked} / {taskResult.totalCorrect} ข้อ
                          <br />
                          ⚠️ เลือกผิด {taskResult.wrongPicked} ข้อ
                          <br />
                          🧩 พลาดไป {taskResult.missed} ข้อ
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        borderRadius: 12,
                        border: "1px solid rgba(16,185,129,0.22)",
                        background: "rgba(16,185,129,0.08)",
                        padding: 10,
                        fontSize: 13,
                        lineHeight: 1.65,
                        fontWeight: 800,
                      }}
                    >
                      {currentTask.explain}
                    </div>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {taskIdx < SIGNAL_TASKS.length - 1 ? (
                        <button className="edu-btn edu-btn--ghost" type="button" onClick={nextTask}>
                          ไปตัวอย่างถัดไป <FiChevronRight aria-hidden="true" />
                        </button>
                      ) : (
                        <button className="edu-btn edu-btn--ghost" type="button" onClick={goQuiz}>
                          mini quiz <FiChevronRight aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================
              ✅ STEP 3: QUIZ
              ========================= */}
          {step === "quiz" && (
            <div style={{ padding: 16 }}>
              <div style={boxStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 950, marginBottom: 6 }}>
                      mini quiz (เช็กความเข้าใจ)
                    </div>
                    <div style={softText}>ตอบให้ครบ แล้วกด “ส่งคำตอบ” เพื่อดูเฉลย</div>
                  </div>

                  <div style={{ fontSize: 12, opacity: 0.8, alignSelf: "center" }}>
                    ตอบแล้ว {Object.keys(answers).length} / {QUIZ.length}
                  </div>
                </div>

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

                <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
                  {QUIZ.map((q, idx) => {
                    const picked = answers[q.id];
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
                                choose(q.id, c.id);
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

                        {submitted && (
                          <div style={{ marginTop: 10 }}>
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
                                    {q.feedback?.[picked] ?? "ลองทบทวนแล้วเลือกใหม่ได้"}
                                  </div>
                                </div>
                              </div>
                            )}

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
                      setStep("task");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    title="กลับไปทำ Task"
                  >
                    <FiChevronLeft aria-hidden="true" /> กลับ
                  </button>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button
                      className="edu-btn edu-btn--primary"
                      type="button"
                      onClick={submitQuiz}
                      disabled={!allAnswered}
                      title={!allAnswered ? "ตอบให้ครบทุกข้อก่อนนะ" : "ส่งคำตอบเพื่อดูเฉลย"}
                    >
                      ส่งคำตอบ <FiChevronRight aria-hidden="true" />
                    </button>

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

export default Learn2Unit5;
