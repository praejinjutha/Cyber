// src/pages/Unit8/Learn2Unit8.jsx
// ✅ Unit 8 - เรื่องที่ 2: ความเป็นกลางและอคติของเนื้อหาออนไลน์
// ✅ Flow: Micro-lesson → Signal Identification Task → Interactive Concept Checking → Immediate Feedback Learning
// ✅ ใช้เฉพาะ main.css + Unit1/learn.css
// ✅ ไม่เพิ่ม class CSS ใหม่
// ✅ ใช้ภาพตัวอย่างเพื่อการเรียนรู้เรื่องการนำเสนอของสื่อ
// ✅ ภาพไม่ได้ใช้เพื่อยืนยันข้อเท็จจริงของเหตุการณ์

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

import logo from "../../assets/logo.png";

// ✅ ภาพตัวอย่างตามที่กำหนด
import imgEmotion from "../unit8/ชี้นำอารมณ์.jpg";
import imgStrong from "../unit8/ใช้คำแรง.jpg";
import imgFeeling from "../unit8/ชี้นำความรู้สึก.jpg";
import imgNeutral from "../unit8/ใช้คำกลาง.jpg";
import imgMislead from "../unit8/เข้าใจผิดได้.jpg";

// ✅ CSS ตามที่กำหนด
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
  FiImage,
  FiSearch,
  FiFlag,
  FiLayers,
} from "react-icons/fi";

/* ------------------------------------------------------------------ */
/* ✅ MICRO-LESSON                                                     */
/* เน้น: ความเป็นกลาง / อคติ / ภาพและพาดหัว / หลายมุมมอง              */
/* ------------------------------------------------------------------ */
const MICRO_LESSON = {
  title: "ความเป็นกลางและอคติของเนื้อหาออนไลน์",
  points: [
    {
      icon: "⚖️",
      head: "ความเป็นกลาง คืออะไร",
      body:
        "ความเป็นกลางคือการนำเสนอข้อมูลโดยไม่รีบพาผู้อ่านไปเชื่อด้านใดด้านหนึ่งเร็วเกินไป และเปิดพื้นที่ให้เห็นข้อมูลหรือมุมมองที่เกี่ยวข้องอย่างรอบด้าน",
    },
    {
      icon: "🧭",
      head: "อคติในเนื้อหาออนไลน์ คืออะไร",
      body:
        "อคติคือการนำเสนอที่เอนเอียงไปด้านหนึ่ง เช่น เลือกเล่าเฉพาะบางส่วน ใช้คำที่ทำให้คนรู้สึกชอบหรือไม่ชอบทันที หรือใช้ภาพประกอบที่พาผู้ชมตีความไปในทิศทางหนึ่ง",
    },
    {
      icon: "📰",
      head: "ภาษา พาดหัว และภาพ มีผลต่อความคิดเรา",
      body:
        "แม้เนื้อหาจะดูน่าเชื่อถือ แต่พาดหัว คำบางคำ หรือภาพประกอบ อาจทำให้เรารู้สึกโกรธ กลัว ตื่นเต้น หรือเชื่อก่อนตรวจสอบได้ จึงต้องสังเกตทั้งข้อความและภาพไปพร้อมกัน",
    },
    {
      icon: "🔄",
      head: "ด้านเดียว vs หลายมุมมอง",
      body:
        "เนื้อหาที่เสนอด้านเดียวมักทำให้เราเห็นเรื่องนั้นแบบแคบลง ส่วนเนื้อหาที่มีหลายมุมมองจะช่วยให้ตัดสินใจได้รอบคอบขึ้น เช่น มีข้อมูลอีกฝ่าย มีบริหน่วย และไม่รีบด่วนสรุปแทนผู้อ่าน",
    },
  ],
  quickRule:
    "จำง่าย: ถ้าเนื้อหาทำให้รู้สึกแรงทันที ลองถามต่อว่า “ข้อมูลครบหรือยัง” และ “ยังมีมุมไหนที่เราไม่ได้เห็นอีกหรือเปล่า”",
};

/* ------------------------------------------------------------------ */
/* ✅ SIGNAL IDENTIFICATION TASK                                       */
/* ใช้ทั้งข้อความและภาพตัวอย่าง เพื่อให้ผู้เรียนจับสัญญาณอคติ         */
/* ------------------------------------------------------------------ */
const SIGNAL_TASKS = [
  {
    id: "t1",
    title: "ตัวอย่าง 1: พาดหัวและองค์ประกอบภาพที่กระตุ้นอารมณ์",
    prompt:
      "ดูภาพตัวอย่าง แล้วเลือก “สัญญาณ” ที่อาจทำให้ผู้ชมรู้สึกหรือคิดไปในทิศทางหนึ่ง",
    image: imgFeeling,
    alt: "ตัวอย่างภาพที่ชี้นำความรู้สึกของผู้ชม",
    signals: [
      {
        id: "s1",
        label: "ภาพและข้อความถูกออกแบบให้สร้างอารมณ์ร่วมกับผู้ชม",
        correct: true,
      },
      {
        id: "s2",
        label: "การใช้คำที่ทำให้รู้สึกสะเทือนใจหรือดราม่า",
        correct: true,
      },
      {
        id: "s3",
        label: "เป็นการรายงานข้อมูลแบบเป็นกลางทั้งหมด",
        correct: false,
      },
      {
        id: "s4",
        label: "เนื้อหานี้ไม่มีผลต่อความรู้สึกของผู้ชมเลย",
        correct: false,
      },
    ],
    explain:
      "ภาพและข้อความสามารถทำงานร่วมกันเพื่อสร้างอารมณ์ร่วมได้ เช่น ความสงสาร ความโกรธ หรือความเห็นใจ ซึ่งอาจทำให้ผู้ชมตัดสินเรื่องจากความรู้สึกมากกว่าข้อมูล",
  },

  {
    id: "t2",
    title: "ตัวอย่าง 2: การใช้คำแรง vs คำกลาง",
    prompt:
      "ดูภาพ 2 แบบนี้ แล้วเลือกสัญญาณที่สะท้อนความแตกต่างของการนำเสนอ",
    compare: [imgStrong, imgNeutral],
    compareAlt: ["ตัวอย่างพาดหัวใช้คำแรง", "ตัวอย่างพาดหัวใช้คำกลาง"],
    signals: [
      {
        id: "s1",
        label: "พาดหัวที่ใช้คำแรงอาจทำให้ผู้อ่านรู้สึกก่อนคิด",
        correct: true,
      },
      {
        id: "s2",
        label: "การใช้คำกลางทำให้ผู้อ่านตีความจากข้อมูลมากขึ้น",
        correct: true,
      },
      {
        id: "s3",
        label: "ทั้งสองพาดหัวไม่มีผลต่อความรู้สึกของผู้อ่าน",
        correct: false,
      },
      {
        id: "s4",
        label: "การใช้คำแรงทำให้ข่าวมีความถูกต้องมากขึ้น",
        correct: false,
      },
    ],
    explain:
      "คำที่ใช้ในพาดหัวมีผลต่อการรับรู้ของผู้อ่าน พาดหัวที่ใช้คำแรงอาจทำให้เกิดอารมณ์ทันที ในขณะที่คำกลางมักเปิดพื้นที่ให้ผู้อ่านคิดจากข้อมูลมากกว่า",
  },

 {
  id: "t3",
  title: "ตัวอย่าง 3: พาดหัวที่อาจชวนให้เข้าใจไปทางหนึ่ง",
  prompt:
    "ดูภาพตัวอย่าง แล้วเลือกสัญญาณที่อาจทำให้ผู้ชมตีความข่าวเร็วเกินไป",
  image: imgMislead,
  alt: "ตัวอย่างพาดหัวข่าวน้ำมันไทยราคาพุ่ง",
  signals: [
    {
      id: "s1",
      label: "ใช้คำว่า “พุ่ง” ซึ่งอาจทำให้รู้สึกว่าราคาเพิ่มขึ้นมาก",
      correct: true,
    },
    {
      id: "s2",
      label: "การใช้เครื่องหมายคำถาม (?) เพื่อกระตุ้นความสงสัย",
      correct: true,
    },
    {
      id: "s3",
      label: "เป็นการนำเสนอข้อมูลอย่างเป็นกลางโดยไม่มีการชี้นำ",
      correct: false,
    },
    {
      id: "s4",
      label: "พาดหัวนี้ทำให้เราเข้าใจข้อมูลทั้งหมดทันทีโดยไม่ต้องอ่านข่าว",
      correct: false,
    },
  ],
  explain:
    "พาดหัวข่าวบางครั้งใช้คำที่กระตุ้นความสนใจ เช่นคำว่า 'พุ่ง' หรือใช้เครื่องหมายคำถาม เพื่อดึงดูดให้คนคลิกอ่าน แต่ผู้ชมควรอ่านเนื้อหาทั้งหมดและตรวจสอบข้อมูลก่อนสรุปเรื่อง",
}
];

/* ------------------------------------------------------------------ */
/* ✅ INTERACTIVE CONCEPT CHECKING                                     */
/* ------------------------------------------------------------------ */
const QUIZ = [
  {
    id: "q1",
    prompt:
      "ข้อใดใกล้เคียง “การนำเสนออย่างเป็นกลาง” มากที่สุด",
    answer: "B",
    choices: [
      { id: "A", label: "A) ใช้คำแรงเพื่อให้คนสนใจและรีบเชื่อ" },
      {
        id: "B",
        label:
          "B) ให้ข้อมูลหลายด้าน และไม่รีบด่วนสรุปแทนผู้อ่าน",
      },
      { id: "C", label: "C) เลือกเล่าเฉพาะมุมที่ทำให้คนเห็นด้วยกับผู้เขียน" },
    ],
    feedback: {
      A: "ยังไม่ใช่ ❌ คำแรงอาจดึงอารมณ์มากกว่าช่วยให้เข้าใจเรื่องอย่างรอบด้าน",
      B: "ถูกต้อง ✅ การนำเสนออย่างเป็นกลางควรเปิดให้เห็นข้อมูลที่เกี่ยวข้องหลายด้านและไม่รีบชี้นำผู้อ่าน",
      C: "ยังไม่ใช่ ❌ การเลือกเล่าเฉพาะด้านหนึ่งทำให้เนื้อหาเอนเอียงได้",
    },
  },
  {
    id: "q2",
    prompt:
      "ถ้าเนื้อหาออนไลน์นำเสนอเพียงฝ่ายเดียว สิ่งที่ควรทำมากที่สุดคืออะไร",
    answer: "C",
    choices: [
      { id: "A", label: "A) เชื่อตามทันทีเพราะดูมั่นใจ" },
      {
        id: "B",
        label: "B) แชร์ต่อเพื่อให้คนอื่นรับรู้ก่อน",
      },
      {
        id: "C",
        label:
          "C) หาอีกแหล่งหรืออีกมุมมองมาเทียบก่อนตัดสินใจ",
      },
    ],
    feedback: {
      A: "ไม่ควร ❌ ความมั่นใจของผู้พูดไม่ใช่หลักฐานว่าข้อมูลครบหรือเป็นกลาง",
      B: "ไม่ควร ❌ หากข้อมูลยังไม่ครบ การแชร์ต่ออาจทำให้ความเข้าใจผิดกระจายออกไป",
      C: "ถูกต้อง ✅ การเทียบหลายแหล่งช่วยให้เห็นว่ามีข้อมูลหรือมุมใดถูกละไว้หรือไม่",
    },
  },
  {
    id: "q3",
    prompt:
      "ข้อใดเป็นตัวอย่างของอคติที่อาจเกิดจาก “ภาพประกอบ” มากกว่าข้อความ",
    answer: "A",
    choices: [
      {
        id: "A",
        label:
          "A) ใช้ภาพสีหน้าดราม่าหรือภาพมุมใกล้เพื่อทำให้เหตุการณ์ดูรุนแรงขึ้น",
      },
      {
        id: "B",
        label: "B) ระบุวันเวลาและแหล่งที่มาของข้อมูลอย่างชัดเจน",
      },
      {
        id: "C",
        label: "C) นำข้อมูลจากหลายฝ่ายมาเรียงเปรียบเทียบกัน",
      },
    ],
    feedback: {
      A: "ถูกต้อง ✅ ภาพประกอบสามารถชี้นำความรู้สึกและการตีความของผู้ชมได้ แม้ยังไม่ได้อ่านเนื้อหาทั้งหมด",
      B: "ยังไม่ใช่ ❌ การระบุแหล่งที่มาเป็นสัญญาณที่ช่วยให้ตรวจสอบได้ดีขึ้น",
      C: "ยังไม่ใช่ ❌ การเปรียบเทียบหลายฝ่ายมักช่วยให้เห็นภาพรอบด้านมากขึ้น",
    },
  },
  {
    id: "q4",
    prompt:
      "เมื่ออ่านเนื้อหาแล้วรู้สึกโกรธหรือเชื่อทันที คำถามใดควรถามตัวเองก่อน",
    answer: "B",
    choices: [
      { id: "A", label: "A) ใครแชร์เรื่องนี้เป็นคนแรก" },
      {
        id: "B",
        label:
          "B) เนื้อหานี้ให้ข้อมูลครบหลายมุมแล้วหรือยัง และมีอะไรที่เราไม่ได้เห็นอีก",
      },
      { id: "C", label: "C) เรื่องนี้น่าส่งต่อแค่ไหน" },
    ],
    feedback: {
      A: "ยังไม่พอ ❌ การรู้ว่าใครแชร์ก่อนอาจช่วยได้บางส่วน แต่ยังไม่พอสำหรับการประเมินความเป็นกลาง",
      B: "ถูกต้อง ✅ คำถามนี้ช่วยให้เราชะลออารมณ์และกลับมามองเรื่องอย่างรอบด้านมากขึ้น",
      C: "ยังไม่ควรคิดถึงการส่งต่อก่อน ❌ ควรตรวจสอบและประเมินเนื้อหาให้รอบด้านก่อน",
    },
  },
];

const Learn2Unit8 = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");

  /**
   * step flow
   * - micro : Micro-lesson
   * - task  : Signal Identification Task
   * - quiz  : Interactive Concept Checking + Immediate Feedback
   */
  const [step, setStep] = useState("micro");

  /* ---------------------------
     ✅ TASK STATE
     --------------------------- */
  const [taskIdx, setTaskIdx] = useState(0);
  const [taskPicked, setTaskPicked] = useState({});
  const [taskChecked, setTaskChecked] = useState(false);

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

  const checkTask = () => {
    setTaskChecked(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const nextTask = () => {
    setTaskChecked(false);
    setTaskIdx((i) => Math.min(SIGNAL_TASKS.length - 1, i + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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

  const allAnswered = useMemo(
    () => Object.keys(answers).length === QUIZ.length,
    [answers]
  );

  const score = useMemo(() => {
    let s = 0;
    for (const q of QUIZ) {
      if (answers[q.id] === q.answer) s += 1;
    }
    return s;
  }, [answers]);

  const goNextAfterQuiz = () => {
    navigate("/unit8/learn", { replace: true });
  };

  /* ---------------------------
     ✅ LOAD PROFILE
     --------------------------- */
  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);

      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      if (!user) {
        navigate("/login", { replace: true });
        return;
      }

      const { data: profile } = await supabase
        .from("student_profiles")
        .select("first_name,last_name")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!alive) return;

      if (profile) {
        setStudentName(
          `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim()
        );
      }

      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [navigate]);

  const panelTitle = useMemo(() => {
    if (step === "micro") return "ความเป็นกลาง & อคติของเนื้อหาออนไลน์";
    if (step === "task") return "Signal Identification Task";
    return "Interactive Concept Checking";
  }, [step]);

  const softText = { fontSize: 13, opacity: 0.82 };

  const boxStyle = {
    borderRadius: 16,
    border: "1px solid rgba(0,0,0,0.08)",
    background: "rgba(255,255,255,0.55)",
    padding: 14,
  };

  const pillStyle = (active) => ({
    borderRadius: 999,
    border: active
      ? "1px solid rgba(59,130,246,0.45)"
      : "1px solid rgba(0,0,0,0.10)",
    background: active
      ? "rgba(59,130,246,0.12)"
      : "rgba(255,255,255,0.70)",
    padding: "8px 12px",
    fontSize: 13,
    fontWeight: 800,
    cursor: "pointer",
  });

  const imageStyleNoCrop = {
    width: "100%",
    maxWidth: 620,
    height: "auto",
    borderRadius: 14,
    border: "1px solid rgba(0,0,0,0.08)",
    display: "block",
    margin: "0 auto",
  };

  const compareImageStyle = {
    width: "100%",
    maxWidth: 520,
    height: "auto",
    borderRadius: 14,
    border: "1px solid rgba(0,0,0,0.08)",
    display: "block",
  };

  const noteBoxStyle = {
    borderRadius: 12,
    border: "1px solid rgba(245,158,11,0.22)",
    background: "rgba(245,158,11,0.08)",
    padding: 10,
    fontSize: 12,
    lineHeight: 1.6,
    opacity: 0.92,
  };

  const currentTask = SIGNAL_TASKS[taskIdx];
  const pickedList = taskPicked[currentTask.id] || [];
  const pickedSet = new Set(pickedList);

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
          <div className="homebar__brand" role="banner">
            <img src={logo} alt="LearnSecure logo" className="homebar__logo" />
            <div className="edu-brandtext">
              <div className="edu-brandtext__title">LearnSecure</div>
              <div className="edu-brandtext__subtitle">Unit 8</div>
            </div>
          </div>

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
        <section className="edu-hero" aria-label="Unit 8 header">
          <div className="edu-hero__card">
            <div className="edu-hero__row">
              <div className="edu-hero__headline">
                <div className="edu-hero__title">
                  Unit 8: การมีส่วนร่วมอย่างรับผิดชอบในสังคมออนไลน์
                </div>
                <div className="edu-hero__sub">
                  เรื่องที่ 2 ความเป็นกลางและอคติของเนื้อหาออนไลน์
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
                      <div
                        style={{
                          fontSize: 13,
                          opacity: 0.92,
                          marginTop: 6,
                          lineHeight: 1.68,
                        }}
                      >
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
                    <div
                      style={{
                        fontSize: 13,
                        opacity: 0.92,
                        marginTop: 6,
                        lineHeight: 1.68,
                      }}
                    >
                      {MICRO_LESSON.quickRule}
                    </div>
                  </div>

                  {/* ✅ ภาพตัวอย่างเปิดหน่วย */}
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
                      ตัวอย่างภาพที่ชวนให้เราคิดไปทางหนึ่ง
                    </div>

                    <div
                      style={{
                        fontSize: 13,
                        opacity: 0.92,
                        marginTop: 6,
                        lineHeight: 1.65,
                      }}
                    >
                      ลองดูภาพนี้แล้วถามตัวเองว่า “อะไรในภาพทำให้เรารู้สึกกังวล
                      หรือรีบคิดตามเนื้อหาเร็วขึ้น”
                    </div>

                    <div style={{ marginTop: 10 }}>
                      <img
                        src={imgEmotion}
                        alt="ตัวอย่างภาพที่อาจชี้นำการตีความของผู้ชม"
                        style={imageStyleNoCrop}
                      />
                    </div>

                    <div style={{ marginTop: 10 }}>
                      <div style={noteBoxStyle}>
                        *หมายเหตุ: ภาพนี้ใช้เพื่อฝึกสังเกตการนำเสนอของสื่อ
                        ไม่ได้ใช้เพื่อยืนยันข้อเท็จจริงของเหตุการณ์*
                      </div>
                    </div>

                    <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
                      <div style={{ fontSize: 13, opacity: 0.92, lineHeight: 1.6 }}>
                        ✅ สิ่งที่ลองสังเกตจากภาพ:
                      </div>
                      <div style={{ fontSize: 13, opacity: 0.92, lineHeight: 1.6 }}>
                        • พาดหัวทำให้รู้สึกอย่างไร
                      </div>
                      <div style={{ fontSize: 13, opacity: 0.92, lineHeight: 1.6 }}>
                        • การรวมหลายภาพไว้ด้วยกันทำให้เราคิดเชื่อมโยงอะไรบ้าง
                      </div>
                      <div style={{ fontSize: 13, opacity: 0.92, lineHeight: 1.6 }}>
                        • ถ้าจะเข้าใจเรื่องนี้ให้รอบด้าน ควรหาอะไรเพิ่ม
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    className="edu-btn edu-btn--primary"
                    type="button"
                    onClick={() => {
                      setTaskIdx(0);
                      setTaskChecked(false);
                      setStep("task");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    ไปทำกิจกรรมจับสัญญาณ <FiChevronRight aria-hidden="true" />
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
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 950, marginBottom: 6 }}>
                      <FiFlag style={{ marginRight: 8 }} />
                      Task {taskIdx + 1} / {SIGNAL_TASKS.length}: {currentTask.title}
                    </div>
                    <div style={softText}>{currentTask.prompt}</div>
                  </div>

                  <div style={{ fontSize: 12, opacity: 0.8, alignSelf: "center" }}>
                    เลือกแล้ว {pickedList.length} ข้อ
                  </div>
                </div>

                {/* ✅ ภาพเดี่ยว */}
                {currentTask.image && (
                  <div style={{ marginTop: 12 }}>
                    <img
                      src={currentTask.image}
                      alt={currentTask.alt}
                      style={imageStyleNoCrop}
                    />
                    <div style={{ marginTop: 8 }}>
                      <div style={noteBoxStyle}>
                        *ภาพตัวอย่างใช้เพื่อฝึกสังเกตการนำเสนอของสื่อ
                        ไม่ได้ใช้เพื่อยืนยันข้อเท็จจริงของข่าว*
                      </div>
                    </div>
                  </div>
                )}

                {/* ✅ ภาพเปรียบเทียบ */}
                {currentTask.compare && (
                  <div
                    style={{
                      marginTop: 12,
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        borderRadius: 14,
                        border: "1px solid rgba(0,0,0,0.08)",
                        background: "rgba(255,255,255,0.65)",
                        padding: 10,
                      }}
                    >
                      <div style={{ fontWeight: 900, marginBottom: 8 }}>
                        ตัวอย่าง A
                      </div>
                      <img
                        src={currentTask.compare[0]}
                        alt={currentTask.compareAlt?.[0] || "ตัวอย่าง A"}
                        style={compareImageStyle}
                      />
                    </div>

                    <div
                      style={{
                        borderRadius: 14,
                        border: "1px solid rgba(0,0,0,0.08)",
                        background: "rgba(255,255,255,0.65)",
                        padding: 10,
                      }}
                    >
                      <div style={{ fontWeight: 900, marginBottom: 8 }}>
                        ตัวอย่าง B
                      </div>
                      <img
                        src={currentTask.compare[1]}
                        alt={currentTask.compareAlt?.[1] || "ตัวอย่าง B"}
                        style={compareImageStyle}
                      />
                    </div>

                    <div style={{ gridColumn: "1 / -1" }}>
                      <div style={noteBoxStyle}>
                        *ภาพตัวอย่างใช้เพื่อฝึกสังเกตความต่างของการนำเสนอ
                        ไม่ได้ใช้เพื่อยืนยันข้อเท็จจริงของเหตุการณ์*
                      </div>
                    </div>
                  </div>
                )}

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

                {/* ✅ ปุ่ม */}
                <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  

                  <button
                    className="edu-btn edu-btn--danger"
                    type="button"
                    onClick={() => {
                      setTaskPicked((prev) => ({ ...prev, [currentTask.id]: [] }));
                      setTaskChecked(false);
                    }}
                  >
                    ล้างตัวเลือก
                  </button>

                  <button
                    className="edu-btn edu-btn--primary"
                    type="button"
                    onClick={checkTask}
                    disabled={pickedList.length === 0}
                    title={pickedList.length === 0 ? "เลือกอย่างน้อย 1 ข้อก่อนนะ" : "ตรวจคำตอบ"}
                  >
                    ตรวจคำตอบ <FiChevronRight aria-hidden="true" />
                  </button>
                </div>

                {/* ✅ Feedback */}
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
                        <div
                          style={{
                            fontSize: 13,
                            opacity: 0.92,
                            marginTop: 4,
                            lineHeight: 1.6,
                          }}
                        >
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
                        lineHeight: 1.68,
                        fontWeight: 800,
                      }}
                    >
                      {currentTask.explain}
                    </div>

                    <div
                      style={{
                        borderRadius: 12,
                        border: "1px solid rgba(0,0,0,0.08)",
                        background: "rgba(255,255,255,0.70)",
                        padding: 10,
                        fontSize: 13,
                        lineHeight: 1.68,
                      }}
                    >
                      <div style={{ fontWeight: 900, marginBottom: 4 }}>
                        คำถามชวนคิดต่อ
                      </div>
                      เนื้อหาที่ดูน่าสนใจมาก อาจไม่ได้ผิดเสมอไป
                      แต่เราควรถามต่อว่า “เนื้อหานี้ยังขาดข้อมูลจากมุมไหน”
                      และ “เรากำลังตัดสินจากข้อมูลหรือจากอารมณ์เป็นหลัก”
                    </div>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {taskIdx < SIGNAL_TASKS.length - 1 ? (
                        <button
                          className="edu-btn edu-btn--ghost"
                          type="button"
                          onClick={nextTask}
                        >
                          ไปตัวอย่างถัดไป <FiChevronRight aria-hidden="true" />
                        </button>
                      ) : (
                        <button
                          className="edu-btn edu-btn--ghost"
                          type="button"
                          onClick={goQuiz}
                        >
                          ไปทำแบบเช็กความเข้าใจ <FiChevronRight aria-hidden="true" />
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
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 950, marginBottom: 6 }}>
                      <FiLayers style={{ marginRight: 8 }} />
                      Interactive Concept Checking
                    </div>
                    <div style={softText}>
                      ตอบให้ครบ แล้วกด “ส่งคำตอบ” เพื่อดูเฉลยและคำอธิบายทันที
                    </div>
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
                                  <div
                                    style={{
                                      fontSize: 13,
                                      opacity: 0.88,
                                      marginTop: 4,
                                      lineHeight: 1.65,
                                    }}
                                  >
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
                                  <div style={{ fontWeight: 900 }}>
                                    ยังไม่ตรง (เฉลย: {q.answer})
                                  </div>
                                  <div
                                    style={{
                                      fontSize: 13,
                                      opacity: 0.88,
                                      marginTop: 4,
                                      lineHeight: 1.65,
                                    }}
                                  >
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

                {/* ✅ Immediate Feedback Learning */}
                {submitted && (
                  <div style={{ marginTop: 14 }}>
                    <div
                      style={{
                        borderRadius: 14,
                        border: "1px solid rgba(59,130,246,0.20)",
                        background: "rgba(59,130,246,0.08)",
                        padding: 12,
                      }}
                    >
                      <div style={{ fontWeight: 950, marginBottom: 6 }}>
                        <FiSearch style={{ marginRight: 8 }} />
                        Immediate Feedback Learning
                      </div>
                      <div style={{ fontSize: 13, lineHeight: 1.7, opacity: 0.94 }}>
                        บทเรียนนี้ไม่ได้ต้องการให้เรา “ไม่เชื่อทุกอย่าง”
                        แต่ต้องการให้เรา “ไม่รีบเชื่อจากมุมเดียว”
                        เมื่อเจอเนื้อหาออนไลน์ที่ใช้ภาษา พาดหัว หรือภาพที่ทำให้รู้สึกแรง
                        ควรหยุดคิดสักนิด แล้วถามว่า
                        เนื้อหานี้กำลังชี้นำเราไหม มีข้อมูลอีกด้านหรือไม่
                        และเราควรหาอะไรเพิ่มก่อนตัดสินใจ
                      </div>
                    </div>
                  </div>
                )}

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

export default Learn2Unit8;