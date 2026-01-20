
// pages/Unit2/Learn1.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

import logo from "../../assets/logo.png";

// ✅ ใช้วิดีโอ (ตามโปรเจกต์คุณ)
import learnVideo from "../../assets/learn2.1.mp4";

// ✅ CSS
import "../../main.css";
import "../Unit1/learn.css"; // ⭐ ใช้ CSS เดียวกับ Unit1

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
/* ✅ QUIZ: 3 ข้อ (โฟกัส BO1-BO3 แบบสถานการณ์)                         */
/* - BO1: ระบุภัยคุกคามที่พบบ่อย (ฟิชชิ่ง/มัลแวร์/เว็บปลอม)           */
/* - BO2: อธิบายลักษณะสำคัญ + ผลกระทบต่อข้อมูล (อยู่ใน feedback)      */
/* - BO3: จำแนกจากสถานการณ์ตัวอย่าง                                    */
/* ------------------------------------------------------------------ */
const QUIZ = [
  {
    id: "q1",
    prompt:
      "คุณได้รับ SMS แจ้งว่า “พัสดุตีกลับ กรุณากดลิงก์เพื่อยืนยันข้อมูล” และลิงก์พาไปหน้าให้กรอกบัญชี/รหัสผ่าน แบบนี้เข้าข่ายภัยคุกคามแบบใด?",
    answer: "A",
    choices: [
      { id: "A", label: "A) ฟิชชิ่ง (Phishing/Smishing) ผ่านข้อความ" },
      { id: "B", label: "B) มัลแวร์ (Malware) ที่ทำลายไฟล์โดยตรง" },
      { id: "C", label: "C) โปรแกรมป้องกันไวรัส" },
      { id: "D", label: "D) การอัปเดตระบบปกติ" },
    ],
    feedback: {
      A: "ถูกต้อง ✅ นี่คือฟิชชิ่งผ่าน SMS (Smishing) หลอกให้กดลิงก์และกรอกข้อมูลสำคัญ เช่น รหัสผ่าน/OTP ทำให้บัญชีถูกยึดหรือข้อมูลรั่วไหลได้",
      B: "ยังไม่ตรง ❌ มัลแวร์มักมากับไฟล์/โปรแกรม/ลิงก์ที่ติดตั้งบางอย่าง แต่สถานการณ์นี้ชัดว่า “หลอกให้กรอกข้อมูล” ซึ่งเป็นฟิชชิ่ง",
      C: "ไม่ใช่ ❌ โปรแกรมป้องกันไวรัสเป็นเครื่องมือป้องกัน ไม่ใช่รูปแบบการโจมตี",
      D: "ไม่ใช่ ❌ ข้อความเร่งให้กดลิงก์และกรอกข้อมูล เป็นสัญญาณอันตรายของฟิชชิ่ง",
    },
  },
  {
    id: "q2",
    prompt:
      "คุณดาวน์โหลดไฟล์โปรแกรมจากเว็บที่ไม่น่าเชื่อถือ แล้วเครื่องเริ่มช้า มีป๊อปอัปเด้ง และมีไฟล์บางอย่างถูกเข้ารหัสเปิดไม่ได้ นี่น่าจะเป็นภัยคุกคามแบบใด?",
    answer: "B",
    choices: [
      { id: "A", label: "A) ฟิชชิ่ง (Phishing) เพื่อขโมยรหัสผ่าน" },
      { id: "B", label: "B) มัลแวร์ (Malware) เช่น Adware/Ransomware" },
      { id: "C", label: "C) เว็บไซต์ปลอมที่เลียนแบบหน้าตา" },
    ],
    feedback: {
      A: "ยังไม่ตรง ❌ ฟิชชิ่งจะเน้นหลอกให้กรอก/ส่งข้อมูลเอง แต่สถานการณ์นี้มีอาการติดตั้งแล้วเครื่องผิดปกติ + ไฟล์ถูกเข้ารหัส ซึ่งเข้ากับมัลแวร์มากกว่า",
      B: "ถูกต้อง ✅ อาการช้า + ป๊อปอัป (adware) และไฟล์ถูกเข้ารหัสเปิดไม่ได้ (ransomware) คือผลกระทบต่อ “ข้อมูล” ชัดมาก: ข้อมูลถูกล็อก/สูญหาย/ถูกขโมยได้",
      C: "ยังไม่ตรง ❌ เว็บไซต์ปลอมจะเน้นหลอกกรอกข้อมูลบนหน้าเว็บ แต่กรณีนี้เกิดหลังดาวน์โหลดและรันไฟล์ในเครื่อง",
    },
  },
  {
    id: "q3",
    prompt:
      "คุณจะล็อกอินธนาคาร แต่เว็บที่เปิดหน้าตาเหมือนมาก ทว่า URL สะกดแปลกๆ (เช่น bnak-xxx.com) และรีบให้กรอกข้อมูลบัตร/OTP ควรจัดเป็นภัยคุกคามแบบใด?",
    answer: "C",
    choices: [
      { id: "A", label: "A) มัลแวร์ที่ติดตั้งในเครื่องทันที" },
      { id: "B", label: "B) การอัปเดตความปลอดภัยของธนาคาร" },
      { id: "C", label: "C) เว็บไซต์ปลอม (Phishing website) เพื่อขโมยข้อมูล" },
    ],
    feedback: {
      A: "ยังไม่ตรง ❌ เว็บปลอมไม่ได้แปลว่าจะติดตั้งมัลแวร์ทันทีเสมอไป แต่ความเสี่ยงหลักคือหลอกให้กรอกข้อมูลจนบัญชี/เงินถูกยึด",
      B: "ไม่ใช่ ❌ URL แปลกและเร่งให้กรอกข้อมูลสำคัญเป็นสัญญาณเสี่ยง ควรหยุดและเข้าเว็บจากช่องทางทางการ",
      C: "ถูกต้อง ✅ เว็บไซต์ปลอม/ฟิชชิ่งเว็บไซต์: เลียนแบบเว็บจริงเพื่อขโมยรหัสผ่าน/OTP/ข้อมูลบัตร ทำให้ข้อมูลรั่วและบัญชีถูกยึดได้"
    },
  },
];

const Learn1Unit2 = () => {
  // ✅ Router helpers
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ อ่าน query mode เผื่อใช้ต่อ (เหมือน Unit1)
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
   * - "task21" : หน้าเนื้อหา/สรุป (placeholder)
   * - "quiz"   : mini quiz (3 ข้อ)
   */
  const [step, setStep] = useState("video");

  // ✅ placeholder result (เผื่อใช้ต่อ)
  const [task21Result, setTask21Result] = useState(null);

  /* ------------------------------------------------------------------ */
  /* ✅ QUIZ STATE                                                      */
  /* ------------------------------------------------------------------ */
  // ✅ เก็บคำตอบ: { [questionId]: "A" | "B" | "C" | "D" }
  const [answers, setAnswers] = useState({});
  // ✅ submit แล้วหรือยัง (โชว์ feedback)
  const [submitted, setSubmitted] = useState(false);

  // ✅ เลือกคำตอบ
  const choose = (qid, choiceId) => {
    setAnswers((prev) => ({ ...prev, [qid]: choiceId }));
  };

  // ✅ ส่งคำตอบ (ดู feedback รายข้อ)
  const submitQuiz = () => {
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

// ✅ ไปหน้าถัดไปหลังทำข้อสอบเสร็จ
const goNextAfterQuiz = () => {
  // ✅ แทรกหน้า “ตัวอย่างภาพ” ก่อน เพื่อให้เห็นชัดกว่าอ่านข้อความ
  navigate("/unit2/examples", { replace: true });
};


  // ✅ โหลดชื่อผู้เรียน
  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);

      // 1) เช็ค session
      const { data } = await supabase.auth.getSession();
      const u = data.session?.user;

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

  // ✅ title ใน panel1 ให้เปลี่ยนตาม step
  const panelTitle = useMemo(() => {
    if (step === "video") return "บทนำ: ความตระหนักด้านภัยคุกคามไซเบอร์";
    if (step === "task21") return "สรุป: ภัยคุกคามในชีวิตประจำวัน";
    return "mini quiz";
  }, [step]);

  /* ------------------------------------------------------------------ */
  /* ✅ QUIZ UI helpers (อิงสไตล์จาก snippet ที่คุณให้)                 */
  /* ------------------------------------------------------------------ */
  const softText = { fontSize: 13, opacity: 0.8 };

  // ✅ กล่องพื้นหลังของวิวข้อสอบ (เหมือน snippet)
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

  // ✅ คะแนน (ใช้สรุปหลัง submit)
  const score = useMemo(() => {
    let s = 0;
    for (const q of QUIZ) {
      if (answers[q.id] === q.answer) s += 1;
    }
    return s;
  }, [answers]);

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
              <div className="edu-brandtext__subtitle">Unit 2</div>
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
        <section className="edu-hero" aria-label="Unit 2 header">
          <div className="edu-hero__card">
            <div className="edu-hero__row">
              <div className="edu-hero__headline">
                {/* ✅ Title */}
                <div className="edu-hero__title">Unit 2: การปฏิบัติความปลอดภัยทางเทคนิคพื้นฐาน</div>

                {/* ✅ Toolbar buttons */}
                <div className="edu-lessons__toolbar">
                  <button
                    className="edu-btn edu-btn--back"
                    type="button"
                    onClick={() => {
                      // ✅ ปุ่มกลับแบบ step-by-step
                      if (step === "quiz") {
                        setStep("task21");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        return;
                      }
                      if (step === "task21") {
                        setStep("video");
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

          {/* ✅ STEP 1: วิดีโอ */}
          {step === "video" && (
            <div className="edu-videoStage">
              <video className="edu-video" src={learnVideo} controls playsInline />

              <div className="edu-videoActions">
                <button
                  className="edu-btn edu-btn--ghost"
                  type="button"
                  onClick={() => {
                    setStep("task21");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  title="ไปต่อ"
                >
                  ถัดไป <FiChevronRight aria-hidden="true" />
                </button>
              </div>
            </div>
          )}

          {/* ✅ STEP 2: สรุปเนื้อหา (แทน task placeholder เดิม) */}
          {step === "task21" && (
            <div style={{ padding: 16 }}>
              <div className="edu-card">
                <div className="edu-card__title">สรุปสั้น ๆ ก่อนทำข้อสอบ</div>

                <div className="edu-card__body" style={{ display: "grid", gap: 10 }}>
                  {/* ✅ ฟิชชิ่ง */}
                  <div>
                    <div style={{ fontWeight: 900 }}>1) ฟิชชิ่ง (Phishing)</div>
                    <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>
                      หลอกผ่านอีเมล/ข้อความ/แชท ให้กดลิงก์หรือกรอกข้อมูลสำคัญ เช่น รหัสผ่าน/OTP/ข้อมูลบัตร → เสี่ยงบัญชีถูกยึดและข้อมูลรั่ว
                    </div>
                  </div>

                  {/* ✅ มัลแวร์ */}
                  <div>
                    <div style={{ fontWeight: 900 }}>2) มัลแวร์ (Malware)</div>
                    <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>
                      โปรแกรมอันตรายที่มากับไฟล์/โปรแกรมเถื่อน/ลิงก์อันตราย → อาจขโมยข้อมูล, ทำเครื่องผิดปกติ, หรือเข้ารหัสไฟล์เรียกค่าไถ่
                    </div>
                  </div>

                  {/* ✅ เว็บไซต์ปลอม */}
                  <div>
                    <div style={{ fontWeight: 900 }}>3) เว็บไซต์ปลอม (Fake website)</div>
                    <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>
                      หน้าเว็บเลียนแบบเว็บจริง แต่ URL แปลก/สะกดคล้าย ๆ → หลอกกรอกรหัสผ่าน/OTP/ข้อมูลส่วนตัว ทำให้ข้อมูลรั่วและบัญชีถูกยึด
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    className="edu-btn edu-btn--primary"
                    type="button"
                    onClick={() => {
                      // ✅ ไปหน้า quiz และรีเซ็ตสถานะ
                      setTask21Result({ done: true, at: Date.now(), mode });
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

          {/* ------------------------------------------------------------------ */}
          {/* ✅ VIEW: QUIZ (ข้อสอบ 3 ข้อ)                                        */}
          {/* ------------------------------------------------------------------ */}
          {step === "quiz" && (
            <div style={{ padding: 16 }}>
              <div style={boxStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 950, marginBottom: 6 }}>mini quiz</div>
                    <div style={softText}>ตอบจาก “สถานการณ์” เพื่อฝึกจำแนกภัยคุกคามให้แม่น (โฟกัส BO1-BO3)</div>
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

                                // ✅ ถ้าเคย submit แล้ว และเปลี่ยนคำตอบ ให้กดส่งใหม่เพื่อดู feedback ใหม่
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

                {/* Footer actions */}
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
                      setStep("task21");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    title="กลับไปดูสรุป"
                  >
                    <FiChevronLeft aria-hidden="true" /> กลับไปดูสรุป
                  </button>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button
                      className="edu-btn edu-btn--primary"
                      type="button"
                      onClick={submitQuiz}
                      disabled={!allAnswered}
                      title={!allAnswered ? "ตอบให้ครบทุกข้อก่อนนะ" : "ส่งคำตอบเพื่อดู feedback"}
                    >
                      ส่งคำตอบ<FiChevronRight aria-hidden="true" />
                    </button>

                    {submitted && (
                      <button
                        className="edu-btn edu-btn--ghost"
                        type="button"
                        onClick={goNextAfterQuiz}
                        title="ไปหน้าถัดไป"
                      >
                        หน้าถัดไป <FiChevronRight aria-hidden="true" />
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

export default Learn1Unit2; // ✅ อย่าลืม export คอมโพเนนต์

