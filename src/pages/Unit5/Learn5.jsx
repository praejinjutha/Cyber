

import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

import logo from "../../assets/logo.png";

// ✅ รูปเคสตั้งต้น (วางไฟล์ไว้ที่: src/assets/process.png)
import processImg from "./process.png";

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
  FiSearch,
  FiCalendar,
  FiMessageSquare,
  FiRepeat,
  FiClipboard,
  FiLock,
} from "react-icons/fi";

/* ------------------------------------------------------------------ */
/* ✅ MICRO-LESSON (Tip)                                                */
/* - ย้ายไปอยู่ “ทีหลัง” เพื่อสรุปหลังจากทำเคสแล้ว                      */
/* ------------------------------------------------------------------ */
const MICRO = {
  title: "สรุปทิป: ตรวจข่าวแบบ “ยืดหยุ่น” แต่ไม่ข้ามสรุปเร็วเกินไป",
  bullets: [
    {
      icon: "✅",
      head: "ข้อ 1–4 สลับได้ / ข้ามได้",
      body: "อันไหนโป๊ะก่อน ตรวจอันนั้นก่อนเลย (เช่น วันที่เก่ามาก = จบได้เร็ว)",
    },
    {
      icon: "🔍",
      head: "เลือกตรวจเฉพาะที่จำเป็นก็ได้",
      body: "บางคนเริ่มเทียบแหล่งอื่นก่อน บางคนเริ่มดู URL/แหล่งที่มา—ได้หมด",
    },
    {
      icon: "⛔",
      head: "ข้อเดียวที่ห้ามข้าม",
      body: "ข้อ 5 (สรุปผล/แชร์หรือไม่แชร์) ต้องทำ “หลังจาก” ตรวจอย่างน้อย 1 อย่างจากข้อ 1–4 เสมอ",
    },
  ],
  rule:
    "กติกาเดียว: ห้ามสรุป/แชร์ (ข้อ 5) ถ้ายังไม่ได้ตรวจอะไรจากข้อ 1–4 เลย",
};

/* ------------------------------------------------------------------ */
/* ✅ PROCESS CHECKS (1–4)                                              */
/* - ผู้เรียนเลือกทำข้อไหนก่อนก็ได้                                     */
/* - แต่ละข้อ: 1 คำถาม + เลือกคำตอบ → feedback ทันที                   */
/* ------------------------------------------------------------------ */
const CHECKS = [
  {
    id: "source",
    icon: <FiSearch />,
    title: "1) ดูแหล่งที่มา",
    desc: "เช็กว่าใครเป็นผู้เผยแพร่ และมีตัวตนตรวจสอบได้ไหม",
    prompt: "จากรูปข่าวนี้ อะไรคือ “หลักฐาน” ที่ช่วยบอกว่าแหล่งที่มาน่าเชื่อถือกว่าเพจลอย ๆ ?",
    answer: "B",
    choices: [
      { id: "A", label: "A) มีรูปประกอบสวย ๆ เลยเชื่อได้" },
      { id: "B", label: "B) มีชื่อสื่อ/โลโก้บนหน้าเว็บ และเป็นเว็บไซต์ข่าวที่ระบุตัวตนชัด" },
      { id: "C", label: "C) มีคนแชร์เยอะ แปลว่าจริง" },
    ],
    feedback: {
      A: "ยังไม่พอ ❌ รูปสวยไม่ได้แปลว่าจริง ต้องดูแหล่งที่มา",
      B: "ถูกต้อง ✅ แหล่งข่าวที่มีตัวตนชัด ตรวจสอบได้ ช่วยเพิ่มความน่าเชื่อถือ",
      C: "ยังไม่ตรง ❌ แชร์เยอะไม่การันตีความจริง",
    },
  },
  {
    id: "date",
    icon: <FiCalendar />,
    title: "2) ดูวันที่เผยแพร่",
    desc: "เช็กข่าวเก่า/ใหม่ และบริบทเวลายังเกี่ยวข้องไหม",
    prompt: "การดู “วัน-เวลาเผยแพร่” ช่วยเรื่องความน่าเชื่อถือยังไงมากที่สุด?",
    answer: "A",
    choices: [
      { id: "A", label: "A) ช่วยแยกข่าวเก่า/ข่าวใหม่ ลดโอกาสแชร์ข่าวหมดบริบท" },
      { id: "B", label: "B) ถ้ามีวันที่ แปลว่าข่าวจริง 100%" },
      { id: "C", label: "C) ไม่สำคัญ เพราะอ่านพาดหัวก็พอ" },
    ],
    feedback: {
      A: "ถูกต้อง ✅ ข่าวเก่ามักถูกหยิบมาแชร์ใหม่จนเข้าใจผิด การดูวันที่ช่วยได้มาก",
      B: "ยังไม่ถูก ❌ มีวันที่ไม่ได้แปลว่าจริงเสมอ แต่เป็นจุดเริ่มตรวจสอบที่ดี",
      C: "ไม่ควร ❌ พาดหัวอาจชี้นำ ต้องดูข้อมูลประกอบ",
    },
  },
  {
    id: "language",
    icon: <FiMessageSquare />,
    title: "3) ดูภาษา/บริบท",
    desc: "สังเกตว่าเป็นภาษาข่าวหรือภาษาปั่นอารมณ์ และให้ข้อมูลครบไหม",
    prompt: "ข้อใดเป็นสัญญาณว่าเนื้อหานี้ “มีแนวโน้มเป็นภาษาข่าว” มากกว่าภาษาปั่นอารมณ์?",
    answer: "C",
    choices: [
      { id: "A", label: "A) ใช้คำว่า “ด่วน!! ช็อก!!” บ่อย ๆ" },
      { id: "B", label: "B) ชวนให้แชร์ทันทีเพื่อเตือนทุกคน" },
      { id: "C", label: "C) ให้ข้อมูลเชิงอธิบาย มีรายละเอียด และอ้างอิงหน่วยงาน/ผู้เชี่ยวชาญ" },
    ],
    feedback: {
      A: "ไม่ใช่ ❌ คำเร้าอารมณ์แบบนี้มักชี้นำ",
      B: "ไม่ใช่ ❌ การเร่งให้แชร์คือสัญญาณเสี่ยง",
      C: "ถูกต้อง ✅ ภาษาแบบอธิบาย + มีที่มา/หน่วยงานรองรับ มักน่าเชื่อถือกว่า",
    },
  },
  {
    id: "compare",
    icon: <FiRepeat />,
    title: "4) เทียบแหล่งอื่น",
    desc: "ค้นด้วย keyword แล้วเทียบหลายแหล่งเพื่อยืนยัน/เติมบริบท",
    prompt: "ถ้าจะ ‘เทียบแหล่งอื่น’ จากข่าวนี้ วิธีที่เหมาะสมที่สุดคือข้อใด?",
    answer: "B",
    choices: [
      { id: "A", label: "A) อ่านคอมเมนต์ใต้โพสต์ แล้วสรุปว่าคนส่วนใหญ่คิดยังไง" },
      { id: "B", label: "B) ใช้ keyword จากพาดหัว ไปค้นในสื่ออื่น/หน่วยงานที่เกี่ยวข้อง แล้วเทียบข้อมูล" },
      { id: "C", label: "C) ดูจำนวนยอดไลก์ของข่าวนี้" },
    ],
    feedback: {
      A: "ยังไม่ตรง ❌ คอมเมนต์ไม่ใช่หลักฐาน อาจมีอคติ/ข้อมูลผิด",
      B: "ถูกต้อง ✅ ค้นด้วย keyword แล้วเทียบหลายแหล่ง เป็นการตรวจสอบที่เป็นระบบ",
      C: "ยังไม่ตรง ❌ ไลก์เยอะไม่เท่ากับจริง",
    },
  },
];

/* ------------------------------------------------------------------ */
/* ✅ FINAL SUMMARY (ข้อ 5)                                             */
/* - ต้องทำอย่างน้อย 1 จากข้อ 1–4 ก่อนถึงจะปลดล็อก                      */
/* - ไม่มีพิมพ์ตอบ: ใช้คำถามแบบเลือกตอบ + feedback ทันที               */
/* ------------------------------------------------------------------ */
const FINAL = {
  id: "summary",
  icon: <FiClipboard />,
  title: "5) สรุปผล (ท้ายสุด)",
  desc: "ตัดสินใจแบบสั้น ๆ: เชื่อได้แค่ไหน และควรแชร์ไหม",
  prompt: "จากที่ตรวจสอบมาแล้ว ข้อใดเป็น “สรุปผล” ที่ดี (สั้น กระชับ มีเหตุผล)?",
  answer: "A",
  choices: [
    {
      id: "A",
      label:
        "A) แหล่งข่าวชัด มีวันเวลา และภาษาข่าว จึงน่าเชื่อถือค่อนข้างสูง แต่ถ้าจะแชร์ควรเทียบอีกแหล่งเพื่อยืนยัน",
    },
    { id: "B", label: "B) น่าเชื่อถือ 100% เพราะเป็นสื่อใหญ่" },
    { id: "C", label: "C) ไม่ต้องตรวจอะไร แค่รู้สึกว่าใช่ก็แชร์ได้" },
  ],
  feedback: {
    A: "ถูกต้อง ✅ มีเหตุผลจากการตรวจ และยังเผื่อความรอบคอบก่อนแชร์",
    B: "ยังไม่สุด ❌ สื่อใหญ่ช่วยเพิ่มความน่าเชื่อถือ แต่คำว่า 100% ไม่ใช่วิธีคิดที่ดี",
    C: "ไม่ควร ❌ ความรู้สึกไม่ใช่หลักฐาน",
  },
};

const Learn5Unit5 = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const mode = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    return sp.get("mode") || "all";
  }, [location.search]);

  // ✅ profile
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");

  /**
   * ✅ page step (ปรับลำดับใหม่)
   * - process (เริ่มก่อน)
   * - micro  (Tip สรุปทีหลัง)
   */
  const [step, setStep] = useState("process");

  /**
   * ✅ check states
   * - selected: { [checkId]: choiceId }
   * - checked : { [checkId]: boolean }  // to show feedback immediately after pick (or after explicit check)
   * - score   : { [checkId]: 0/1 }
   */
  const [selected, setSelected] = useState({});
  const [checked, setChecked] = useState({});
  const [score, setScore] = useState({});

  // ✅ final summary state
  const [finalSelected, setFinalSelected] = useState("");
  const [finalChecked, setFinalChecked] = useState(false);
  const [finalScore, setFinalScore] = useState(null);

  // ✅ load profile
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

  // ✅ title (ปรับให้ตรงกับลำดับใหม่)
  const panelTitle = useMemo(() => {
    if (step === "process") return "ตรวจข่าวจากรูป";
    return "สรุปหลักการตรวจสอบแบบยืดหยุ่น";
  }, [step]);

  // ✅ how many checks done (1–4)
  const doneCount = useMemo(() => {
    const ids = CHECKS.map((c) => c.id);
    return ids.filter((id) => Boolean(checked[id])).length;
  }, [checked]);

  const unlockedFinal = useMemo(() => doneCount >= 1, [doneCount]);

  // ✅ total score
  const totalScore = useMemo(() => {
    const base = CHECKS.reduce((acc, c) => acc + (score[c.id] ? 1 : 0), 0);
    const fin = finalScore ? 1 : 0; // finalScore = true/false/null
    return base + fin;
  }, [score, finalScore]);

  const totalMax = CHECKS.length + 1;

  // ✅ choose for check
  const choose = (checkId, choiceId) => {
    setSelected((prev) => ({ ...prev, [checkId]: choiceId }));

    // ✅ ให้ feedback ทันที (Immediate)
    setChecked((prev) => ({ ...prev, [checkId]: true }));

    const checkMeta = CHECKS.find((c) => c.id === checkId);
    const isCorrect = checkMeta?.answer === choiceId;
    setScore((prev) => ({ ...prev, [checkId]: isCorrect ? 1 : 0 }));
  };

  const resetCheck = (checkId) => {
    setSelected((prev) => {
      const next = { ...prev };
      delete next[checkId];
      return next;
    });
    setChecked((prev) => ({ ...prev, [checkId]: false }));
    setScore((prev) => {
      const next = { ...prev };
      delete next[checkId];
      return next;
    });
  };

  // ✅ final choose
  const chooseFinal = (choiceId) => {
    setFinalSelected(choiceId);
    setFinalChecked(true);

    const isCorrect = FINAL.answer === choiceId;
    setFinalScore(isCorrect);
  };

  const resetFinal = () => {
    setFinalSelected("");
    setFinalChecked(false);
    setFinalScore(null);
  };

  // ✅ back (ปรับตามลำดับใหม่: micro -> process -> navigate(-1))
  const handleBack = () => {
    if (step === "micro") {
      setStep("process");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    navigate(-1);
  };

  // ✅ finish (จบจริง ๆ หลังจากดู tip แล้ว)
  const finish = () => {
    navigate("/unit5/learn", { replace: true });
  };

  // ✅ UI helpers
  const softText = { fontSize: 13, opacity: 0.82 };
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

  const feedbackBox = (ok) => ({
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    padding: 10,
    borderRadius: 12,
    border: ok ? "1px solid rgba(16,185,129,0.25)" : "1px solid rgba(245,158,11,0.25)",
    background: ok ? "rgba(16,185,129,0.10)" : "rgba(245,158,11,0.10)",
  });

  return (
    <div className="edu-app">
      {/* ✅ TOPBAR */}
      <header className="edu-topbar">
        <div className="edu-topbar__inner">
          <div className="homebar__brand" role="banner">
            <img src={logo} alt="LearnSecure logo" className="homebar__logo" />
            <div className="edu-brandtext">
              <div className="edu-brandtext__title">LearnSecure</div>
              <div className="edu-brandtext__subtitle">Unit 5</div>
            </div>
          </div>

          <div className="edu-topbar__right">
            <div className="edu-userchip" title={studentName || "Student"}>
              <div className="edu-userchip__avatar" aria-hidden="true">
                <FiUser />
              </div>
              <div className="edu-userchip__meta">
                <div className="edu-userchip__name">{loading ? "กำลังโหลด..." : studentName || "ผู้เรียน"}</div>
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
                <div className="edu-hero__sub">เรื่องที่ 5	ขั้นตอนการตรวจสอบความน่าเชื่อถือของข้อมูล
</div>

                <div className="edu-lessons__toolbar">
                  <button className="edu-btn edu-btn--back" type="button" onClick={handleBack}>
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
              ✅ STEP 1: PROCESS (Flexible) — ขึ้นก่อน
              ========================= */}
          {step === "process" && (
            <div style={{ padding: 16 }}>
              <div style={boxStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 950, marginBottom: 6 }}>
                      ตรวจจากข่าว 1 ชิ้น (เลือกตรวจข้อไหนก่อนก็ได้)
                    </div>
                    <div style={softText}>
                      ทำข้อ 1–4 อย่างน้อย 1 ข้อ แล้วค่อยไปข้อ 5 (สรุปผล) — ตอนนี้ทำแล้ว {doneCount}/4
                    </div>
                  </div>

                  
                </div>

                {/* ✅ Case image */}
                <div
                  style={{
                    marginTop: 12,
                    borderRadius: 16,
                    border: "1px solid rgba(0,0,0,0.10)",
                    background: "rgba(255,255,255,0.70)",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={processImg}
                    alt="ข่าวตัวอย่างสำหรับตรวจสอบ"
                    style={{ width: "100%", height: "auto", display: "block" }}
                  />
                </div>

                {/* ✅ Checks 1–4 */}
                <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
                  {CHECKS.map((c) => {
                    const picked = selected[c.id];
                    const isChecked = Boolean(checked[c.id]);
                    const isCorrect = isChecked && picked === c.answer;

                    return (
                      <div
                        key={c.id}
                        style={{
                          borderRadius: 14,
                          border: "1px solid rgba(0,0,0,0.08)",
                          background: "rgba(255,255,255,0.60)",
                          padding: 12,
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span aria-hidden="true">{c.icon}</span>
                            <div>
                              <div style={{ fontWeight: 950 }}>{c.title}</div>
                              <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>{c.desc}</div>
                            </div>
                          </div>

                          <div style={{ fontSize: 12, opacity: 0.8, alignSelf: "center" }}>
                            {isChecked ? (isCorrect ? "✅ ผ่าน" : "⚠️ ลองใหม่ได้") : "ยังไม่ได้ทำ"}
                          </div>
                        </div>

                        <div style={{ marginTop: 10, fontWeight: 900 }}>{c.prompt}</div>

                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
                          {c.choices.map((ch) => (
                            <button
                              key={`${c.id}-${ch.id}`}
                              type="button"
                              onClick={() => choose(c.id, ch.id)}
                              style={pillStyle(picked === ch.id)}
                              aria-pressed={picked === ch.id}
                              title={ch.label}
                            >
                              {ch.label}
                            </button>
                          ))}


                        </div>

                        {isChecked && (
                          <div style={{ marginTop: 10 }}>
                            <div style={feedbackBox(isCorrect)}>
                              {isCorrect ? <FiCheckCircle aria-hidden="true" /> : <FiAlertTriangle aria-hidden="true" />}
                              <div>
                                <div style={{ fontWeight: 900 }}>{isCorrect ? "ถูกต้อง" : `ยังไม่ตรง (เฉลย: ${c.answer})`}</div>
                                <div style={{ fontSize: 13, opacity: 0.88, marginTop: 4, lineHeight: 1.6 }}>
                                  {c.feedback[picked]}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* ✅ Final Step 5 (Locked until at least 1 check done) */}
                  <div
                    style={{
                      borderRadius: 14,
                      border: "1px solid rgba(0,0,0,0.08)",
                      background: "rgba(255,255,255,0.60)",
                      padding: 12,
                      opacity: unlockedFinal ? 1 : 0.55,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span aria-hidden="true">{FINAL.icon}</span>
                        <div>
                          <div style={{ fontWeight: 950 }}>{FINAL.title}</div>
                          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>{FINAL.desc}</div>
                        </div>
                      </div>

                      <div style={{ fontSize: 12, opacity: 0.8, alignSelf: "center" }}>
                        {unlockedFinal ? "ปลดล็อกแล้ว" : "ล็อกอยู่"}
                      </div>
                    </div>

                    {!unlockedFinal && (
                      <div
                        style={{
                          marginTop: 10,
                          borderRadius: 12,
                          border: "1px solid rgba(0,0,0,0.10)",
                          background: "rgba(255,255,255,0.70)",
                          padding: 10,
                          display: "flex",
                          gap: 10,
                          alignItems: "center",
                        }}
                      >
                        <FiLock aria-hidden="true" />
                        <div style={{ fontSize: 13, fontWeight: 850, lineHeight: 1.6 }}>
                          ทำข้อ 1–4 อย่างน้อย <strong>1 ข้อ</strong> ก่อน เพื่อให้มี “หลักฐาน” แล้วค่อยสรุปผล (ข้อ 5)
                        </div>
                      </div>
                    )}

                    {unlockedFinal && (
                      <>
                        <div style={{ marginTop: 10, fontWeight: 900 }}>{FINAL.prompt}</div>

                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
                          {FINAL.choices.map((ch) => (
                            <button
                              key={`final-${ch.id}`}
                              type="button"
                              onClick={() => chooseFinal(ch.id)}
                              style={pillStyle(finalSelected === ch.id)}
                              aria-pressed={finalSelected === ch.id}
                              title={ch.label}
                            >
                              {ch.label}
                            </button>
                          ))}

                        </div>

                        {finalChecked && (
                          <div style={{ marginTop: 10 }}>
                            <div style={feedbackBox(finalSelected === FINAL.answer)}>
                              {finalSelected === FINAL.answer ? (
                                <FiCheckCircle aria-hidden="true" />
                              ) : (
                                <FiAlertTriangle aria-hidden="true" />
                              )}
                              <div>
                                <div style={{ fontWeight: 900 }}>
                                  {finalSelected === FINAL.answer ? "ถูกต้อง" : `ยังไม่ตรง (เฉลย: ${FINAL.answer})`}
                                </div>
                                <div style={{ fontSize: 13, opacity: 0.88, marginTop: 4, lineHeight: 1.6 }}>
                                  {FINAL.feedback[finalSelected]}
                                </div>
                              </div>
                            </div>

                            <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                              {/* ✅ ปรับ flow: ทำข้อ 5 เสร็จ -> ไปดู Tip สรุป */}
                              <button
                                className="edu-btn edu-btn--primary"
                                type="button"
                                onClick={() => {
                                  setStep("micro");
                                  window.scrollTo({ top: 0, behavior: "smooth" });
                                }}
                                title="ไปดูทิปสรุป"
                              >
                                สรุป <FiChevronRight aria-hidden="true" />
                              </button>

                             
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* ✅ Footer hint */}
                <div style={{ marginTop: 12, fontSize: 12, opacity: 0.75 }}>
                  เคล็ดลับ: ในชีวิตจริง “ไม่จำเป็นต้องทำครบทุกข้อ” แต่ห้ามสรุป/แชร์ ถ้ายังไม่ได้ตรวจอะไรจากข้อ 1–4 เลย
                </div>
              </div>
            </div>
          )}

          {/* =========================
              ✅ STEP 2: MICRO (Tip) — ย้ายไปทีหลัง
              ========================= */}
          {step === "micro" && (
            <div style={{ padding: 16 }}>
              <div className="edu-card">
                <div className="edu-card__title">{MICRO.title}</div>

                <div className="edu-card__body" style={{ display: "grid", gap: 12 }}>
                  {MICRO.bullets.map((b, i) => (
                    <div
                      key={`micro-${i}`}
                      style={{
                        borderRadius: 14,
                        border: "1px solid rgba(0,0,0,0.08)",
                        background: "rgba(255,255,255,0.60)",
                        padding: 12,
                      }}
                    >
                      <div style={{ fontWeight: 950 }}>
                        {b.icon} {b.head}
                      </div>
                      <div style={{ fontSize: 13, opacity: 0.92, marginTop: 6, lineHeight: 1.65 }}>
                        {b.body}
                      </div>
                    </div>
                  ))}

                  <div
                    style={{
                      borderRadius: 14,
                      border: "1px solid rgba(220,38,38,0.18)",
                      background: "rgba(220,38,38,0.08)",
                      padding: 12,
                    }}
                  >
                    <div style={{ fontWeight: 950 }}>กติกาเดียว</div>
                    <div style={{ fontSize: 13, opacity: 0.92, marginTop: 6, lineHeight: 1.65 }}>
                      {MICRO.rule}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button className="edu-btn edu-btn--ghost" type="button" onClick={finish}>
                    เสร็จสิ้น <FiChevronRight aria-hidden="true" />
                  </button>

                  
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Learn5Unit5;
