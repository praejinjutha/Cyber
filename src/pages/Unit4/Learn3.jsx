// src/pages/Unit4/Learn3.jsx
// ✅ Unit 4 - เรื่องที่ 3: การตอบสนองต่อความขัดแย้งออนไลน์อย่างเหมาะสม
// Flow: Micro-lesson → Interactive Response Picking → Immediate Feedback → Mini quiz
// ✅ เงื่อนไข: ใช้ class ที่มีอยู่แล้วเท่านั้น (ไม่เพิ่ม class ใหม่)
// ✅ ปรับภาษา: สั้น คม ชัด ไม่เลี่ยน
// ✅ เป้าหมาย UX: เห็นชัดว่า “ต้องกดอะไรต่อ” และ “ต้องทำกี่ขั้น”

import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

import logo from "../../assets/logo.png";

// ✅ CSS (ใช้ชุดเดียวกับโปรเจกต์)
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
} from "react-icons/fi";

/* ------------------------------------------------------------------ */
/* ✅ MICRO-LESSON CONTENT                                              */
/* ------------------------------------------------------------------ */
const MICRO_LESSON = {
  hook: {
    title: "ออนไลน์เริ่มตึง? เป้าหมายไม่ใช่ “ชนะ”",
    desc: "เป้าหมายคือ “ลดความตึงเครียด” + “ป้องกันตัว” + “ไม่พลาดทิ้งหลักฐาน”",
  },
  rules: [
    {
      title: "อย่าตอบตอนกำลังเดือด",
      desc: "ตอบตอนอารมณ์ขึ้น = พลาดง่าย (หลุดคำแรง / เผลอเปิดข้อมูลส่วนตัว / เรื่องบานปลาย)",
      cue: "ทริค: เว้น 10 วินาที + อ่านทวนก่อนกดส่ง",
    },
    {
      title: "คุยที่ประเด็น ไม่โจมตีคน",
      desc: "โจมตีตัวตน = ไฟลุกไว แต่คุยที่ประเด็น = ลดปะทะ",
      cue: "ใช้คำว่า: “ประเด็นคือ…” “เราขอเช็กว่า…”",
    },
    {
      title: "เริ่มตึงเมื่อไหร่ ย้ายไปคุยส่วนตัว",
      desc: "คุยต่อหน้าคนเยอะ = แข่งกันเอาชนะง่าย",
      cue: "พูดสั้น ๆ: “คุยในแชทได้ไหม”",
    },
    {
      title: "ถ้าเข้าข่ายคุกคาม: เก็บหลักฐาน + Report/Block",
      desc: "ไม่ต้องสู้ด้วยคำด่า ใช้เครื่องมือแพลตฟอร์มให้ถูกทาง",
      cue: "จำไว้: ถ้าจำเป็นให้แคปก่อน แล้วค่อยบล็อก/รายงาน",
    },
  ],
  ladder: {
    title: "บันได 4 ขั้น (จำง่าย)",
    lines: [
      "1) Pause: หยุดก่อน ไม่โต้ทันที",
      "2) Clarify: ถาม/สรุปให้ชัด (ถ้ายังคุยกันได้)",
      "3) De-escalate: ใช้คำสุภาพ + ชวนคุยส่วนตัว",
      "4) Protect: เก็บหลักฐาน + Report/Block (ถ้าคุกคาม)",
    ],
  },
  scripts: {
    title: "ประโยคใช้ได้ทันที",
    items: [
      "“ขอคุยที่ประเด็นนะ เราเข้าใจว่า… ถูกไหม?”",
      "“คุยในแชทได้ไหม จะได้ไม่ตึงต่อหน้า”",
      "“ถ้าเริ่มแรง เราขอหยุดคุยก่อนนะ”",
      "“เราจะเก็บหลักฐาน แล้วรายงานตามระบบนะ”",
    ],
  },
};

/* ------------------------------------------------------------------ */
/* ✅ ACTIVITY: เลือก “วิธีตอบสนองที่เหมาะสุด” ในแต่ละสถานการณ์         */
/* - Interactive Concept Checking + Immediate Feedback                 */
/* ------------------------------------------------------------------ */
const SCENARIOS = [
  {
    id: "s1",
    situation: "มีคนคอมเมนต์ว่า “เอ๋อปะ ทำงานแค่นี้ก็พลาด” ใต้โพสต์คุณต่อหน้าคนอื่น",
    choices: [
      {
        id: "A",
        label: "A) ด่ากลับให้จบ",
        ok: false,
        why: "ด่ากลับ = ไฟลุก + เสี่ยงโดนรายงานทั้งคู่",
        safer: "หยุดโต้ → ตอบสั้นสุภาพ/ไม่ตอบ → เก็บหลักฐาน → Report/Block ถ้าเริ่มคุกคาม",
      },
      {
        id: "B",
        label: "B) ตอบสั้น ๆ วางขอบเขต แล้วคุยที่งาน",
        ok: true,
        why: "วางขอบเขต + ดึงกลับมาที่ประเด็น ช่วยลดการปะทะ",
        safer: "ถ้ายังตึง: “คุยในแชทได้ไหม” หรือหยุดคุย",
      },
      {
        id: "C",
        label: "C) แคปแล้วโพสต์ประจานให้คนรุม",
        ok: false,
        why: "ประจาน/ชวนรุม = เรื่องบาน + เสี่ยงผิดกติกาแพลตฟอร์ม",
        safer: "เก็บหลักฐานไว้เงียบ ๆ แล้วใช้ Report/Block แทน",
      },
    ],
  },
  {
    id: "s2",
    situation: "เพื่อนพิมพ์ประชดในกลุ่มว่า “บางคนก็ทำตัวเด่นเกินนะ” แล้วคนอื่นเริ่มเดา",
    choices: [
      {
        id: "A",
        label: "A) โต้ในกลุ่มว่า “หมายถึงใคร พูดตรง ๆ”",
        ok: false,
        why: "ลากคุยกลางกลุ่ม = จุดชนวนไว",
        safer: "ย้ายไปคุยส่วนตัว: “เมื่อกี้หมายถึงเราไหม ถ้ามีอะไรคุยกันได้นะ”",
      },
      {
        id: "B",
        label: "B) ทักแชทส่วนตัวไปคุยตรง ๆ แบบสุภาพ",
        ok: true,
        why: "ตัดดราม่าที่สาธารณะ + เปิดทางคุยแบบไม่เสียหน้า",
        safer: "ถ้าอีกฝ่ายยังแรง: หยุดคุย + ขอผู้ดูแล/ครูช่วย",
      },
      {
        id: "C",
        label: "C) แท็กทุกคนถามให้ชัดในกลุ่ม",
        ok: false,
        why: "แท็กคนเยอะ = เพิ่มแรงกดดัน + เรื่องใหญ่ขึ้น",
        safer: "คุยส่วนตัว หรือให้แอดมินช่วยเตือนกติกากลุ่ม",
      },
    ],
  },
  {
    id: "s3",
    situation: "เจอคนแปลกหน้าส่งข้อความคุกคาม/ข่มขู่ใน DM",
    choices: [
      {
        id: "A",
        label: "A) ส่งพิกัด/ข้อมูลจริงเพื่อโชว์ว่าไม่กลัว",
        ok: false,
        why: "อันตรายมาก ❌ เปิดข้อมูลส่วนตัว = เสี่ยงถูกตามตัว/ทำร้าย",
        safer: "อย่าให้ข้อมูลส่วนตัวเด็ดขาด + เก็บหลักฐาน + Report/Block",
      },
      {
        id: "B",
        label: "B) ตอบสั้น ๆ แล้วเก็บหลักฐาน Report/Block",
        ok: true,
        why: "ตัดการปะทะ + ป้องกันตัว + ใช้ระบบแพลตฟอร์ม",
        safer: "ถ้ารุนแรง: แจ้งผู้ใหญ่/ผู้ดูแล/หน่วยงานที่เกี่ยวข้อง",
      },
      {
        id: "C",
        label: "C) โต้ยาว ๆ อธิบายว่าเขาผิด",
        ok: false,
        why: "คุยกับคนคุกคาม = ยิ่งคุยยิ่งโดนปั่น และเสียเวลา",
        safer: "หยุดคุย + Report/Block",
      },
    ],
  },
  {
    id: "s4",
    situation: "ถกเถียงในคอมเมนต์ เริ่มเสียงแข็ง แต่ยังไม่ถึงขั้นด่า",
    choices: [
      {
        id: "A",
        label: "A) สรุปประเด็น + ถามต่อสุภาพ และชวนไปคุยแชท",
        ok: true,
        why: "คุมโทน + ลดปะทะ + เปิดทางคุยต่อแบบปลอดภัย",
        safer: "ถ้าเริ่มแรง: “เราขอหยุดคุยก่อนนะ”",
      },
      {
        id: "B",
        label: "B) ประชดกลับให้เจ็บ ๆ จะได้หยุด",
        ok: false,
        why: "ประชด = ไฟลุกไว",
        safer: "ใช้คำกลาง ๆ และชวนคุยส่วนตัว",
      },
      {
        id: "C",
        label: "C) เปิดข้อมูลส่วนตัวของอีกฝ่ายให้เขาเงียบ",
        ok: false,
        why: "ผิดร้ายแรง ❌ เสี่ยงละเมิดความเป็นส่วนตัวและผิดกฎ/กฎหมาย",
        safer: "หยุดคุย + แจ้งผู้ดูแล",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* ✅ MINI QUIZ                                                         */
/* ------------------------------------------------------------------ */
const QUIZ = [
  {
    id: "q1",
    prompt: "ข้อไหนคือ ‘สัญญาณว่าควรหยุดตอบโต้’ ชัดที่สุด?",
    answer: "C",
    choices: [
      { id: "A", label: "A) อีกฝ่ายไม่เห็นด้วย แต่ยังคุยสุภาพ" },
      { id: "B", label: "B) อีกฝ่ายขอให้ยกตัวอย่างเพิ่ม" },
      { id: "C", label: "C) เริ่มด่า/คุกคาม/ชวนคนมารุม" },
    ],
    feedback: {
      A: "ยังพอคุยที่ประเด็นได้ ❌",
      B: "ยังไม่ใช่สัญญาณหยุด ❌",
      C: "ถูกต้อง ✅ เข้าข่ายคุกคาม = หยุดโต้ + ป้องกันตัว",
    },
  },
  {
    id: "q2",
    prompt: "ถ้าจะลดดราม่าในที่สาธารณะ วิธีไหนเหมาะสุด?",
    answer: "B",
    choices: [
      { id: "A", label: "A) โต้กลับในคอมเมนต์ให้ชนะ" },
      { id: "B", label: "B) ย้ายไปคุยส่วนตัว/แชท" },
      { id: "C", label: "C) แท็กเพื่อนให้ช่วยเถียง" },
    ],
    feedback: {
      A: "ไม่แนะนำ ❌ มีคนดู = ไฟลุกง่าย",
      B: "ถูกต้อง ✅ ลดแรงเสียดทานและไม่เสียหน้ากัน",
      C: "ไม่แนะนำ ❌ เพิ่มคน = เพิ่มความตึงเครียด",
    },
  },
  {
    id: "q3",
    prompt: "เจอ DM คุกคาม ข้อไหนปลอดภัยสุด?",
    answer: "A",
    choices: [
      { id: "A", label: "A) เก็บหลักฐาน แล้ว Report/Block" },
      { id: "B", label: "B) ส่งข้อมูลจริงให้รู้ว่าเราไม่กลัว" },
      { id: "C", label: "C) โต้กลับยาว ๆ อธิบายว่าเขาผิด" },
    ],
    feedback: {
      A: "ถูกต้อง ✅ ป้องกันตัว + ใช้ระบบแพลตฟอร์ม",
      B: "อันตรายมาก ❌ เปิดข้อมูลส่วนตัวเสี่ยงสุด ๆ",
      C: "ไม่แนะนำ ❌ ยิ่งคุยยิ่งโดนปั่น/ลากยาว",
    },
  },
];

export default function Learn3Unit4() {
  // =========================================================
  // ✅ Router helpers
  // =========================================================
  const navigate = useNavigate();
  const location = useLocation();

  // =========================================================
  // ✅ อ่าน query mode เผื่อใช้ต่อ (เหมือน Unit1/2/3)
  // =========================================================
  const mode = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    return sp.get("mode") || "all";
  }, [location.search]);

  // =========================================================
  // ✅ UI state
  // =========================================================
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");

  /**
   * ✅ step flow
   * - "lesson" : Micro-lesson
   * - "pick"   : Activity (เลือกวิธีตอบสนอง + feedback)
   * - "quiz"   : Mini quiz
   */
  const [step, setStep] = useState("lesson");

  // =========================================================
  // ✅ ACTIVITY STATE
  // =========================================================
  const [picks, setPicks] = useState({}); // ✅ { [scenarioId]: "A"|"B"|"C" }
  const [pickSubmitted, setPickSubmitted] = useState(false);

  const choosePick = (sid, choiceId) => {
    setPicks((prev) => ({ ...prev, [sid]: choiceId }));
  };

  const submitPicks = () => {
    setPickSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const picksAllAnswered = useMemo(() => {
    return Object.keys(picks).length === SCENARIOS.length;
  }, [picks]);

  const pickScore = useMemo(() => {
    let s = 0;
    for (const sc of SCENARIOS) {
      const picked = picks[sc.id];
      const found = sc.choices.find((c) => c.id === picked);
      if (found?.ok) s += 1;
    }
    return s;
  }, [picks]);

  // =========================================================
  // ✅ QUIZ STATE
  // =========================================================
  const [answers, setAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const chooseQuiz = (qid, choiceId) => {
    setAnswers((prev) => ({ ...prev, [qid]: choiceId }));
  };

  const submitQuiz = () => {
    setQuizSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const quizAllAnswered = useMemo(() => {
    return Object.keys(answers).length === QUIZ.length;
  }, [answers]);

  const quizScore = useMemo(() => {
    let s = 0;
    for (const q of QUIZ) {
      if (answers[q.id] === q.answer) s += 1;
    }
    return s;
  }, [answers]);

  // ✅ ไปเรื่องถัดไป (แก้ path ได้ตาม routing โปรเจกต์)
  const goNext = () => {
    // หมายเหตุ: ถ้าโปรเจกต์คุณใช้ path อื่น ให้เปลี่ยนตรงนี้บรรทัดเดียว
    navigate("/unit4/learn", { replace: true });
  };

  // =========================================================
  // ✅ โหลดชื่อผู้เรียน
  // =========================================================
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

      if (profile) {
        setStudentName(`${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim());
      }

      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [navigate]);

  // =========================================================
  // ✅ title ใน panel ให้เปลี่ยนตาม step
  // =========================================================
  const panelTitle = useMemo(() => {
    if (step === "lesson") return "ลดความตึงเครียด + ป้องกันตัว เมื่อเริ่มมีดราม่า";
    if (step === "pick") return "กิจกรรม: เลือกวิธีตอบสนองที่เหมาะสุด";
    return "Mini quiz";
  }, [step]);

  // =========================================================
  // ✅ Styles (ยึด pattern เดิมของคุณ)
  // =========================================================
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

  const tabStyle = (active) => ({
    borderRadius: 999,
    border: active ? "1px solid rgba(99,102,241,0.45)" : "1px solid rgba(0,0,0,0.10)",
    background: active ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.65)",
    padding: "8px 12px",
    fontSize: 12,
    fontWeight: 900,
    cursor: "pointer",
    opacity: active ? 1 : 0.85,
  });

  const infoCardStyle = {
    borderRadius: 14,
    border: "1px solid rgba(0,0,0,0.08)",
    background: "rgba(255,255,255,0.55)",
    padding: 12,
  };

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
              <div className="edu-brandtext__subtitle">Unit 4</div>
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
                <div className="edu-userchip__name">{loading ? "กำลังโหลด..." : studentName || "ผู้เรียน"}</div>
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
        <section className="edu-hero" aria-label="Unit 4 header">
          <div className="edu-hero__card">
            <div className="edu-hero__row">
              <div className="edu-hero__headline">
                <div className="edu-hero__title">Unit 4 : การสื่อสารและมารยาทดิจิทัล</div>
<div className="edu-hero__sub">เรื่องที่ 3	การตอบสนองต่อความขัดแย้งออนไลน์อย่างเหมาะสม

</div>
                <div className="edu-lessons__toolbar">
                  <button
                    className="edu-btn edu-btn--back"
                    type="button"
                    onClick={() => {
                      // ✅ ปุ่มกลับแบบ step-by-step
                      if (step === "quiz") {
                        setStep("pick");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        return;
                      }
                      if (step === "pick") {
                        setStep("lesson");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        return;
                      }
                      // ✅ ถ้าอยู่ lesson แล้วกดกลับ → ถอยกลับ 1 หน้า
                      navigate(-1);
                    }}
                  >
                    <FiChevronLeft aria-hidden="true" />
                    กลับ
                  </button>

                  <button className="edu-btn edu-btn--ghost" type="button" onClick={() => navigate("/main")} style={{ marginLeft: 8 }}>
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
          <div className="edu-panel1__head" style={{ alignItems: "flex-start" }}>
            <div className="edu-panel1__title">
              <FiFileText aria-hidden="true" />
              {panelTitle}
            </div>

            {/* ✅ ตัวช่วย “ต้องกดอะไรต่อ” */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
              <button
                type="button"
                style={tabStyle(step === "lesson")}
                onClick={() => {
                  setStep("lesson");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                1) เนื้อหา
              </button>

              <button
                type="button"
                style={tabStyle(step === "pick")}
                onClick={() => {
                  setStep("pick");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                2) กิจกรรม
              </button>

              <button
                type="button"
                style={tabStyle(step === "quiz")}
                onClick={() => {
                  setStep("quiz");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                3) Quiz
              </button>
            </div>
          </div>

          {/* ✅ STEP 1: Micro-lesson */}
          {step === "lesson" && (
            <div style={{ padding: 16 }}>
              <div className="edu-card">
                <div className="edu-card__title">อ่าน 2 นาที แล้วไปทำกิจกรรม</div>

                <div className="edu-card__body" style={{ display: "grid", gap: 12 }}>
                  {/* ✅ Hook */}
                  <div
                    style={{
                      borderRadius: 14,
                      border: "1px solid rgba(99,102,241,0.20)",
                      background: "rgba(99,102,241,0.08)",
                      padding: 12,
                      display: "flex",
                      gap: 10,
                      alignItems: "flex-start",
                    }}
                  >
                    <FiShield aria-hidden="true" />
                    <div>
                      <div style={{ fontWeight: 950 }}>{MICRO_LESSON.hook.title}</div>
                      <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4, lineHeight: 1.6 }}>{MICRO_LESSON.hook.desc}</div>
                    </div>
                  </div>

                  {/* ✅ กติกาหลัก */}
                  <div style={infoCardStyle}>
                    <div style={sectionTitleStyle}>กติกาหลัก 4 ข้อ</div>
                    <div style={{ display: "grid", gap: 10 }}>
                      {MICRO_LESSON.rules.map((r, idx) => (
                        <div
                          key={`r-${idx}`}
                          style={{
                            borderBottom: "1px dashed rgba(0,0,0,0.10)",
                            paddingBottom: 10,
                          }}
                        >
                          <div style={{ fontWeight: 950 }}>
                            {idx + 1}) {r.title}
                          </div>
                          <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4, lineHeight: 1.6 }}>{r.desc}</div>
                          <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>{r.cue}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ✅ บันได 4 ขั้น */}
                  <div style={infoCardStyle}>
                    <div style={sectionTitleStyle}>{MICRO_LESSON.ladder.title}</div>
                    <div style={{ fontSize: 13, opacity: 0.92, lineHeight: 1.7 }}>
                      {MICRO_LESSON.ladder.lines.map((l, i) => (
                        <div key={`lad-${i}`}>{l}</div>
                      ))}
                    </div>
                  </div>

                  {/* ✅ ประโยคพร้อมใช้ */}
                  <div style={infoCardStyle}>
                    <div style={sectionTitleStyle}>{MICRO_LESSON.scripts.title}</div>
                    <ul style={{ margin: "6px 0 0 18px", fontSize: 13, opacity: 0.92, lineHeight: 1.7 }}>
                      {MICRO_LESSON.scripts.items.map((t, i) => (
                        <li key={`sc-${i}`}>{t}</li>
                      ))}
                    </ul>
                  </div>

                  {/* ✅ กล่องสรุป “ทำอะไรต่อ” */}
                  <div
                    style={{
                      borderRadius: 14,
                      border: "1px solid rgba(16,185,129,0.20)",
                      background: "rgba(16,185,129,0.08)",
                      padding: 12,
                    }}
                  >
                    <div style={{ fontWeight: 950 }}>ขั้นต่อไป</div>
                    <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4, lineHeight: 1.6 }}>
                      ไปที่ <b>กิจกรรม</b> → เลือกคำตอบให้ครบทุกสถานการณ์ → กด <b>ส่งคำตอบ</b> เพื่อดู feedback
                    </div>
                  </div>
                </div>

                {/* ✅ ไปกิจกรรม */}
                <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    className="edu-btn edu-btn--primary"
                    type="button"
                    onClick={() => {
                      setPicks({});
                      setPickSubmitted(false);
                      setStep("pick");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    ไปทำกิจกรรม <FiChevronRight aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ✅ STEP 2: Activity */}
          {step === "pick" && (
            <div style={{ padding: 16 }}>
              <div style={boxStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 950, marginBottom: 6 }}>กิจกรรม: เลือกวิธีตอบสนอง</div>
                    <div style={softText}>
                      เลือก <b>คำตอบเดียว</b> ต่อสถานการณ์ แล้วกด <b>ส่งคำตอบ</b> เพื่อดู feedback
                    </div>
                  </div>

                  <div style={{ fontSize: 12, opacity: 0.8, alignSelf: "center" }}>
                    ทำแล้ว {Object.keys(picks).length} / {SCENARIOS.length}
                  </div>
                </div>

                {/* ✅ สรุปคะแนนกิจกรรมหลัง submit */}
                {pickSubmitted && (
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
                        <div style={{ fontWeight: 950 }}>สรุปคะแนนกิจกรรม</div>
                        <div style={{ fontSize: 13, opacity: 0.9, marginTop: 2 }}>
                          ได้ {pickScore} / {SCENARIOS.length} คะแนน
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ✅ รายการสถานการณ์ */}
                <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
                  {SCENARIOS.map((sc, idx) => {
                    const picked = picks[sc.id];
                    const pickedObj = sc.choices.find((c) => c.id === picked);
                    const isCorrect = pickSubmitted && pickedObj?.ok;
                    const isWrong = pickSubmitted && picked && !pickedObj?.ok;

                    return (
                      <div
                        key={sc.id}
                        style={{
                          borderRadius: 14,
                          border: "1px solid rgba(0,0,0,0.08)",
                          background: "rgba(255,255,255,0.55)",
                          padding: 12,
                        }}
                      >
                        <div style={{ fontWeight: 950, marginBottom: 8 }}>
                          {idx + 1}. สถานการณ์: <span style={{ fontWeight: 900, opacity: 0.95 }}>{sc.situation}</span>
                        </div>

                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
                          {sc.choices.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                choosePick(sc.id, c.id);
                                if (pickSubmitted) setPickSubmitted(false);
                              }}
                              style={pillStyle(picked === c.id)}
                              aria-pressed={picked === c.id}
                            >
                              {c.label}
                            </button>
                          ))}
                        </div>

                        {/* ✅ Feedback หลัง submit */}
                        {pickSubmitted && (
                          <div style={{ marginTop: 10 }}>
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
                                  <div style={{ fontWeight: 900 }}>ยังไม่ได้เลือก</div>
                                  <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>เลือก 1 ตัวเลือกก่อน</div>
                                </div>
                              </div>
                            )}

                            {isCorrect && pickedObj && (
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
                                  <div style={{ fontSize: 13, opacity: 0.88, marginTop: 4, lineHeight: 1.6 }}>{pickedObj.why}</div>
                                  <div style={{ fontSize: 13, opacity: 0.92, marginTop: 8, lineHeight: 1.6 }}>
                                    <b>ทำให้ดีขึ้น:</b> {pickedObj.safer}
                                  </div>
                                </div>
                              </div>
                            )}

                            {isWrong && pickedObj && (
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
                                  <div style={{ fontWeight: 900 }}>ยังไม่เหมาะ</div>
                                  <div style={{ fontSize: 13, opacity: 0.88, marginTop: 4, lineHeight: 1.6 }}>{pickedObj.why}</div>
                                  <div style={{ fontSize: 13, opacity: 0.92, marginTop: 8, lineHeight: 1.6 }}>
                                    <b>ทางที่ปลอดภัยกว่า:</b> {pickedObj.safer}
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
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                  <button
                    className="edu-btn edu-btn--back"
                    type="button"
                    onClick={() => {
                      setStep("lesson");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    <FiChevronLeft aria-hidden="true" /> กลับไปเนื้อหา
                  </button>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button
                      className="edu-btn edu-btn--primary"
                      type="button"
                      onClick={submitPicks}
                      disabled={!picksAllAnswered}
                      title={!picksAllAnswered ? "ตอบให้ครบทุกสถานการณ์ก่อน" : "ส่งคำตอบเพื่อดู feedback"}
                    >
                      ส่งคำตอบ <FiChevronRight aria-hidden="true" />
                    </button>

                    {pickSubmitted && (
                      <button
                        className="edu-btn edu-btn--ghost"
                        type="button"
                        onClick={() => {
                          setAnswers({});
                          setQuizSubmitted(false);
                          setStep("quiz");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        ไปทำ Quiz <FiChevronRight aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ✅ STEP 3: MINI QUIZ + Immediate Feedback */}
          {step === "quiz" && (
            <div style={{ padding: 16 }}>
              <div style={boxStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 950, marginBottom: 6 }}>Mini quiz</div>
                    <div style={softText}>ทบทวน: หยุดก่อน • คุยที่ประเด็น • ย้ายไปคุยส่วนตัว • ป้องกันตัวเมื่อคุกคาม</div>
                  </div>

                  <div style={{ fontSize: 12, opacity: 0.8, alignSelf: "center" }}>
                    ทำแล้ว {Object.keys(answers).length} / {QUIZ.length}
                  </div>
                </div>

                {quizSubmitted && (
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
                          ได้ {quizScore} / {QUIZ.length} คะแนน
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
                  {QUIZ.map((q, idx) => {
                    const picked = answers[q.id];
                    const isCorrect = quizSubmitted && picked === q.answer;
                    const isWrong = quizSubmitted && picked && picked !== q.answer;

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
                                chooseQuiz(q.id, c.id);
                                if (quizSubmitted) setQuizSubmitted(false);
                              }}
                              style={pillStyle(picked === c.id)}
                              aria-pressed={picked === c.id}
                            >
                              {c.label}
                            </button>
                          ))}
                        </div>

                        {quizSubmitted && (
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
                                    {q.feedback?.[picked] ?? "ดีมาก! คุณเลือกถูก"}
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
                                    {q.feedback?.[picked] ?? "ลองทบทวน แล้วเลือกใหม่ได้"}
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
                                  <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>เลือก 1 ตัวเลือกก่อน</div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                  <button
                    className="edu-btn edu-btn--back"
                    type="button"
                    onClick={() => {
                      setStep("pick");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    <FiChevronLeft aria-hidden="true" /> กลับไปกิจกรรม
                  </button>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button
                      className="edu-btn edu-btn--primary"
                      type="button"
                      onClick={submitQuiz}
                      disabled={!quizAllAnswered}
                      title={!quizAllAnswered ? "ตอบให้ครบทุกข้อก่อน" : "ส่งคำตอบเพื่อดู feedback"}
                    >
                      ส่งคำตอบ <FiChevronRight aria-hidden="true" />
                    </button>

                    {quizSubmitted && (
                      <button className="edu-btn edu-btn--ghost" type="button" onClick={goNext}>
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
}
