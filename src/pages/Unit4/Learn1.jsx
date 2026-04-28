

import { useEffect, useMemo, useState } from "react"; // ✅ React hooks
import { useLocation, useNavigate } from "react-router-dom"; // ✅ Router helpers
import { supabase } from "../../lib/supabase"; // ✅ Supabase auth/profile

import logo from "../../assets/logo.png"; // ✅ Brand logo

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
} from "react-icons/fi";

/* ------------------------------------------------------------------ */
/* ✅ MICRO-LESSON CONTENT (ตามโจทย์ที่คุณให้)                           */
/* ------------------------------------------------------------------ */
const MICRO_LESSON = {
  keywords: [
    {
      title: "ข้อความ/พฤติกรรมที่ไม่สุภาพ",
      desc: "คำพูดหรือการกระทำที่ทำให้คนอื่นรู้สึกถูกดูถูก อับอาย หรือถูกลดคุณค่า (เช่น ด่า เหน็บแรง ประจาน)",
      cue: "สังเกต: มีคำหยาบ/เสียดสีแรง/ดูถูกตัวตน",
    },
    {
      title: "การกลั่นแกล้งออนไลน์ (Cyberbullying)",
      desc: "การทำร้าย/กดดัน/ทำให้อับอายผ่านออนไลน์อย่างต่อเนื่อง หรือเจตนาชัดเจน (เช่น ล้อชื่อ-รูปร่าง, ปล่อยข่าวลือ, ทำมีมล้อเลียน)",
      cue: "สังเกต: ทำซ้ำ/รวมกลุ่มรุม/ตั้งใจให้เสียหาย",
    },
    {
      title: "การยั่วยุให้เกิดความขัดแย้ง (Provocation)",
      desc: "การพูดหรือทำเพื่อให้คนอื่นเดือด/เถียง/แตกคอกัน (เช่น ปั่นให้ทะเลาะ, โพสต์แขวะให้คนเดา, ปลุกดราม่า)",
      cue: "สังเกต: จงใจ ‘ปั่น’ ให้ไฟลุก",
    },
  ],
  compare: {
    goodTitle: "การสื่อสารเชิงสร้างสรรค์ (Constructive)",
    badTitle: "การสื่อสารที่ก่อปัญหา (Harmful)",
    good: [
      "โฟกัสที่ ‘พฤติกรรม/เหตุการณ์’ ไม่โจมตีตัวตน",
      "ใช้ภาษาสุภาพ ชัดเจน และมีเหตุผล",
      "เสนอทางออก/ขอความร่วมมือ",
      "ยอมรับความต่าง และฟังอีกฝ่าย",
    ],
    bad: [
      "โจมตีตัวตน/ประจาน/เหยียด/ล้อเลียน",
      "ประชด เสียดสีแรง ใช้คำหยาบ",
      "ชวนคนอื่นรุม/แท็กให้คนมาโจมตี",
      "ปั่นให้ทะเลาะ/ขยายดราม่า",
    ],
  },
  framework: {
    title: "กรอบคิดก่อนพิมพ์ (จำง่าย)",
    lines: [
      "1) ถ้าข้อความนี้ถูกแคปไปแชร์ต่อ… จะยังโอเคไหม?",
      "2) ถ้าคนที่เราไม่อยากให้เห็น (ครู/ผู้ปกครอง) มาอ่าน… จะคิดยังไง?",
      "3) เรากำลัง ‘แก้ปัญหา’ หรือกำลัง ‘เพิ่มไฟ’ กันแน่?",
    ],
  },
};

/* ------------------------------------------------------------------ */
/* ✅ ACTIVITY: ให้ผู้เรียน “ระบุ” ว่าอะไรไม่เหมาะสม                    */
/* - Interactive Concept Checking + Immediate Feedback                 */
/* ------------------------------------------------------------------ */
const CHECK_ITEMS = [
  {
    id: "c1",
    type: "ข้อความ",
    text: "“โง่ปะเนี่ย ทำไมทำแบบนี้อะ 😂” (คอมเมนต์ใต้โพสต์เพื่อนต่อหน้าคนอื่น)",
    isInappropriate: true,
    why: "เป็นการดูถูก/ลดคุณค่า ทำให้อีกฝ่ายอับอาย แม้ใส่อีโมจิก็ยังสื่อความไม่สุภาพ",
    safer: "“เราว่าตรงนี้อาจพลาดนิดนึง ลองดูวิธีนี้ไหม?”",
  },
  {
    id: "c2",
    type: "ข้อความ",
    text: "“โอเค เราไม่เห็นด้วยนะ เพราะ… (ให้เหตุผล) ถ้าอยากคุยต่อมาคุยในแชทได้”",
    isInappropriate: false,
    why: "สื่อสารสุภาพ มีเหตุผล และชวนคุยต่อแบบลดการปะทะในที่สาธารณะ",
    safer: "ตัวอย่างดีแล้ว ✅ (ถ้าจะให้ดีขึ้น: ใช้คำสั้นลง + ถามความเห็นอีกฝ่าย)",
  },
  {
    id: "c3",
    type: "พฤติกรรม",
    text: "แท็กเพื่อนหลายคนให้มารุมต่อว่าอีกฝ่ายในคอมเมนต์",
    isInappropriate: true,
    why: "เป็นการชวนรุม/เพิ่มแรงกดดัน เสี่ยงบานปลายเป็นการกลั่นแกล้งออนไลน์",
    safer: "หยุดแท็ก-หยุดต่อว่า → คุยส่วนตัว/รายงาน/ขอผู้ใหญ่ช่วย",
  },
  {
    id: "c4",
    type: "ข้อความ",
    text: "“ใครบางคนในห้องชอบทำตัวเด่นเกิน 🤡” (โพสต์ลอย ๆ ให้คนเดา)",
    isInappropriate: true,
    why: "เป็นการเหน็บ/ยั่วยุให้เกิดความขัดแย้ง คนอื่นเดาแล้วอาจเกิดดราม่าและประจานกัน",
    safer: "ถ้ามีปัญหา: คุยตรง ๆ แบบสุภาพ หรือปรึกษาครู/ผู้ใหญ่ที่ไว้ใจ",
  },
  {
    id: "c5",
    type: "พฤติกรรม",
    text: "หยุดตอบโต้ทันที แล้วใช้ปุ่ม Report/Block เมื่อโดนด่าหรือคุกคาม",
    isInappropriate: false,
    why: "เป็นการป้องกันตัว ลดโอกาสดราม่าบานปลาย และรักษาความปลอดภัย",
    safer: "ดีแล้ว ✅ (เพิ่มเติม: เก็บหลักฐานก่อน report หากจำเป็น)",
  },
];

/* ------------------------------------------------------------------ */
/* ✅ MINI QUIZ (เสริมความเข้าใจแบบรวดเร็ว)                             */
/* ------------------------------------------------------------------ */
const QUIZ = [
  {
    id: "q1",
    prompt: "ข้อใดเข้าข่าย “ยั่วยุให้เกิดความขัดแย้ง” มากที่สุด?",
    answer: "B",
    choices: [
      { id: "A", label: "A) ถามด้วยเหตุผลว่าไม่เห็นด้วยเพราะอะไร" },
      { id: "B", label: "B) โพสต์แขวะลอย ๆ ให้คนเดา แล้วรอดูดราม่า" },
      { id: "C", label: "C) ขอคุยส่วนตัวเพื่อเคลียร์ความเข้าใจ" },
    ],
    feedback: {
      A: "ยังไม่ใช่ ❌ นี่เป็นการสื่อสารเชิงเหตุผล",
      B: "ถูกต้อง ✅ โพสต์แขวะลอย ๆ มักตั้งใจปั่นให้คนเดาและทะเลาะกัน",
      C: "ยังไม่ใช่ ❌ การคุยส่วนตัวช่วยลดการปะทะในที่สาธารณะ",
    },
  },
  {
    id: "q2",
    prompt:
      "ถ้าเจอคอมเมนต์ด่าแรง ๆ ใต้โพสต์เรา วิธีตอบสนองที่ปลอดภัยและเหมาะสมที่สุดคือข้อใด?",
    answer: "C",
    choices: [
      { id: "A", label: "A) ด่ากลับให้สะใจ" },
      { id: "B", label: "B) แคปแล้วโพสต์ประจานอีกฝ่ายทันที" },
      { id: "C", label: "C) หยุดตอบโต้ เก็บหลักฐาน (ถ้าจำเป็น) แล้ว Report/Block" },
    ],
    feedback: {
      A: "ไม่แนะนำ ❌ ด่ากลับทำให้ไฟลุกและเสี่ยงบานปลาย",
      B: "ไม่แนะนำ ❌ ประจานอาจทำให้กลายเป็นการกลั่นแกล้งกลับและลามหนักขึ้น",
      C: "ถูกต้อง ✅ ลดการปะทะ + ปกป้องตัวเอง + ใช้เครื่องมือแพลตฟอร์มให้ถูกทาง",
    },
  },
  {
    id: "q3",
    prompt: "ข้อใดคือ ‘การสื่อสารเชิงสร้างสรรค์’ มากที่สุด?",
    answer: "A",
    choices: [
      { id: "A", label: "A) ชี้ปัญหาแบบสุภาพ + เสนอทางออก" },
      { id: "B", label: "B) ล้อเลียนให้คนอื่นขำ" },
      { id: "C", label: "C) แท็กเพื่อนมารุมเพื่อให้ชนะ" },
    ],
    feedback: {
      A: "ถูกต้อง ✅ โฟกัสแก้ปัญหาและเคารพกัน",
      B: "ยังไม่ใช่ ❌ ล้อเลียนทำให้คนอื่นอับอายและเสี่ยงเกิดความขัดแย้ง",
      C: "ยังไม่ใช่ ❌ เป็นการชวนรุม เพิ่มแรงกดดันและดราม่า",
    },
  },
];

export default function Learn1Unit4() {
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
   * - "check"  : Activity (Interactive checking + feedback)
   * - "quiz"   : Mini quiz
   */
  const [step, setStep] = useState("lesson"); // ✅ เริ่มที่ Micro-lesson (เอาวิดีโอออกแล้ว)

  // =========================================================
  // ✅ ACTIVITY STATE
  // =========================================================
  const [pickedChecks, setPickedChecks] = useState({}); // ✅ { [id]: true/false }
  const [checkSubmitted, setCheckSubmitted] = useState(false);

  const toggleCheck = (id, val) => {
    setPickedChecks((prev) => ({ ...prev, [id]: val }));
  };

  const submitCheck = () => {
    setCheckSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const checkAllAnswered = useMemo(() => {
    return Object.keys(pickedChecks).length === CHECK_ITEMS.length;
  }, [pickedChecks]);

  const checkScore = useMemo(() => {
    let s = 0;
    for (const it of CHECK_ITEMS) {
      const userVal = pickedChecks[it.id];
      if (typeof userVal === "boolean" && userVal === it.isInappropriate) s += 1;
    }
    return s;
  }, [pickedChecks]);

  // =========================================================
  // ✅ QUIZ STATE
  // =========================================================
  const [answers, setAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const choose = (qid, choiceId) => {
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

  // ✅ ไปเรื่องที่ 2
  const goNext = () => {
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
    if (step === "lesson") return "เข้าใจคำสำคัญ + แยกการสื่อสารสร้างสรรค์ vs ก่อปัญหา";
    if (step === "check") return "กิจกรรม: ระบุข้อความ/พฤติกรรมที่ไม่เหมาะสม";
    return "mini quiz";
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
     <div className="edu-hero__sub">เรื่องที่ 1	การสื่อสารออนไลน์อย่างเหมาะสมและปลอดภัย</div>

                <div className="edu-lessons__toolbar">
                  <button
                    className="edu-btn edu-btn--back"
                    type="button"
                    onClick={() => {
                      // ✅ ปุ่มกลับแบบ step-by-step
                      if (step === "quiz") {
                        setStep("check");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        return;
                      }
                      if (step === "check") {
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

          {/* ✅ STEP 1: Micro-lesson */}
          {step === "lesson" && (
            <div style={{ padding: 16 }}>
              <div className="edu-card">
                <div className="edu-card__title">สรุปเนื้อหา (อ่านให้ครบก่อนทำกิจกรรมนะ)</div>

                <div className="edu-card__body" style={{ display: "grid", gap: 12 }}>
                  {/* ✅ คำสำคัญ */}
                  <div style={infoCardStyle}>
                    <div style={sectionTitleStyle}>1) ความหมายของข้อความ/พฤติกรรมที่ไม่เหมาะสม</div>
                    <div style={{ display: "grid", gap: 10 }}>
                      {MICRO_LESSON.keywords.map((k, idx) => (
                        <div
                          key={`kw-${idx}`}
                          style={{ borderBottom: "1px dashed rgba(0,0,0,0.10)", paddingBottom: 10 }}
                        >
                          <div style={{ fontWeight: 950 }}>{k.title}</div>
                          <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4, lineHeight: 1.6 }}>{k.desc}</div>
                          <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>{k.cue}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ✅ เปรียบเทียบ Constructive vs Harmful */}
                  <div style={infoCardStyle}>
                    <div style={sectionTitleStyle}>2) แยกแยะ “สื่อสารเชิงสร้างสรรค์” vs “สื่อสารที่ก่อปัญหา”</div>

                    <div style={{ display: "grid", gap: 10 }}>
                      <div
                        style={{
                          borderRadius: 12,
                          border: "1px solid rgba(16,185,129,0.20)",
                          background: "rgba(16,185,129,0.08)",
                          padding: 10,
                        }}
                      >
                        <div style={{ fontWeight: 950 }}>{MICRO_LESSON.compare.goodTitle}</div>
                        <ul style={{ margin: "6px 0 0 18px", fontSize: 13, opacity: 0.9, lineHeight: 1.6 }}>
                          {MICRO_LESSON.compare.good.map((t, i) => (
                            <li key={`good-${i}`}>{t}</li>
                          ))}
                        </ul>
                      </div>

                      <div
                        style={{
                          borderRadius: 12,
                          border: "1px solid rgba(245,158,11,0.22)",
                          background: "rgba(245,158,11,0.08)",
                          padding: 10,
                        }}
                      >
                        <div style={{ fontWeight: 950 }}>{MICRO_LESSON.compare.badTitle}</div>
                        <ul style={{ margin: "6px 0 0 18px", fontSize: 13, opacity: 0.9, lineHeight: 1.6 }}>
                          {MICRO_LESSON.compare.bad.map((t, i) => (
                            <li key={`bad-${i}`}>{t}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* ✅ กรอบคิดก่อนพิมพ์ */}
                  <div
                    style={{
                      borderRadius: 14,
                      border: "1px solid rgba(99,102,241,0.20)",
                      background: "rgba(99,102,241,0.08)",
                      padding: 12,
                    }}
                  >
                    <div style={{ fontWeight: 950 }}>{MICRO_LESSON.framework.title}</div>
                    <div style={{ fontSize: 13, opacity: 0.92, marginTop: 6, lineHeight: 1.65 }}>
                      {MICRO_LESSON.framework.lines.map((l, i) => (
                        <div key={`fw-${i}`}>{l}</div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ✅ ไปกิจกรรม */}
                <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    className="edu-btn edu-btn--primary"
                    type="button"
                    onClick={() => {
                      setPickedChecks({});
                      setCheckSubmitted(false);
                      setStep("check");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    เริ่มทำกิจกรรม<FiChevronRight aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ✅ STEP 2: Activity */}
          {step === "check" && (
            <div style={{ padding: 16 }}>
              <div style={boxStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 950, marginBottom: 6 }}>กิจกรรม: ระบุสิ่งที่ไม่เหมาะสม</div>
                    <div style={softText}>เลือกให้ครบทุกข้อว่า “ไม่เหมาะสม” หรือ “เหมาะสม” แล้วกดส่ง เพื่อรับ feedback ทันที</div>
                  </div>

                  <div style={{ fontSize: 12, opacity: 0.8, alignSelf: "center" }}>
                    ตอบแล้ว {Object.keys(pickedChecks).length} / {CHECK_ITEMS.length}
                  </div>
                </div>

                {/* ✅ สรุปคะแนนกิจกรรมหลัง submit */}
                {checkSubmitted && (
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
                          คุณได้ {checkScore} / {CHECK_ITEMS.length} คะแนน
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ✅ รายการสถานการณ์ */}
                <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
                  {CHECK_ITEMS.map((it, idx) => {
                    const picked = pickedChecks[it.id];
                    const hasPicked = typeof picked === "boolean";

                    const isCorrect = checkSubmitted && hasPicked && picked === it.isInappropriate;
                    const isWrong = checkSubmitted && hasPicked && picked !== it.isInappropriate;

                    return (
                      <div
                        key={it.id}
                        style={{
                          borderRadius: 14,
                          border: "1px solid rgba(0,0,0,0.08)",
                          background: "rgba(255,255,255,0.55)",
                          padding: 12,
                        }}
                      >
                        <div style={{ fontWeight: 900, marginBottom: 6 }}>
                          {idx + 1}. ({it.type}) {it.text}
                        </div>

                        {/* ✅ ปุ่มเลือก */}
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
                          <button
                            type="button"
                            onClick={() => {
                              toggleCheck(it.id, true);
                              if (checkSubmitted) setCheckSubmitted(false);
                            }}
                            style={pillStyle(picked === true)}
                            aria-pressed={picked === true}
                          >
                            ไม่เหมาะสม
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              toggleCheck(it.id, false);
                              if (checkSubmitted) setCheckSubmitted(false);
                            }}
                            style={pillStyle(picked === false)}
                            aria-pressed={picked === false}
                          >
                            เหมาะสม
                          </button>
                        </div>

                        {/* ✅ Feedback หลัง submit */}
                        {checkSubmitted && (
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
                                  <div style={{ fontSize: 13, opacity: 0.88, marginTop: 4, lineHeight: 1.6 }}>{it.why}</div>
                                  <div style={{ fontSize: 13, opacity: 0.92, marginTop: 8, lineHeight: 1.6 }}>
                                    <b>ทางเลือกที่ปลอดภัยกว่า:</b> {it.safer}
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
                                    ยังไม่ตรง (เฉลย: {it.isInappropriate ? "ไม่เหมาะสม" : "เหมาะสม"})
                                  </div>
                                  <div style={{ fontSize: 13, opacity: 0.88, marginTop: 4, lineHeight: 1.6 }}>{it.why}</div>
                                  <div style={{ fontSize: 13, opacity: 0.92, marginTop: 8, lineHeight: 1.6 }}>
                                    <b>ทางเลือกที่ปลอดภัยกว่า:</b> {it.safer}
                                  </div>
                                </div>
                              </div>
                            )}

                            {!hasPicked && (
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
                                  <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>เลือก “ไม่เหมาะสม/เหมาะสม” ก่อนนะ</div>
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
                    <FiChevronLeft aria-hidden="true" /> กลับไปดูเนื้อหา
                  </button>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button
                      className="edu-btn edu-btn--primary"
                      type="button"
                      onClick={submitCheck}
                      disabled={!checkAllAnswered}
                      title={!checkAllAnswered ? "ตอบให้ครบทุกข้อก่อนนะ" : "ส่งคำตอบเพื่อดู feedback"}
                    >
                      ส่งคำตอบ <FiChevronRight aria-hidden="true" />
                    </button>

                    {checkSubmitted && (
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
                        mini quiz <FiChevronRight aria-hidden="true" />
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
                    <div style={{ fontSize: 18, fontWeight: 950, marginBottom: 6 }}>mini quiz</div>
                    <div style={softText}>ทบทวน: จำแนกสิ่งยั่วยุ/กลั่นแกล้ง/สื่อสารสร้างสรรค์ และเลือกการตอบสนองที่ปลอดภัย</div>
                  </div>

                  <div style={{ fontSize: 12, opacity: 0.8, alignSelf: "center" }}>
                    ตอบแล้ว {Object.keys(answers).length} / {QUIZ.length}
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
                          คุณได้ {quizScore} / {QUIZ.length} คะแนน
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
                                choose(q.id, c.id);
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
                                    {q.feedback?.[picked] ?? "ลองกลับไปทบทวน แล้วเลือกใหม่ได้เลย"}
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
                                  <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>เลือก 1 ตัวเลือกก่อนนะ</div>
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
                      setStep("check");
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
                      title={!quizAllAnswered ? "ตอบให้ครบทุกข้อก่อนนะ" : "ส่งคำตอบเพื่อดู feedback"}
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
