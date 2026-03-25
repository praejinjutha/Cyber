// src/pages/Unit8/Learn6.jsx
// Unit 8 – เรื่องที่ 6: อคติของระบบปัญญาประดิษฐ์และการใช้งานอย่างรับผิดชอบ
// Video-based Concept Introduction + Micro-lesson + Interactive Simulation Workshop + Immediate Feedback

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

import logo from "../../assets/logo.png";

import "../../main.css";
import "../Unit1/learn.css";
import "../../lesson.css";

import {
  FiChevronLeft,
  FiChevronRight,
  FiFileText,
  FiHome,
  FiLogOut,
  FiUser,
  FiCheckCircle,
  FiAlertTriangle,
  FiRotateCcw,
  FiPlayCircle,
  FiCpu,
  FiShield,
} from "react-icons/fi";

/* -------------------------------------------------- */
/* สถานการณ์จำลอง: AI Bias / Responsible Use         */
/* -------------------------------------------------- */

const SCENARIOS = [
  {
    id: "ai1",
    title: "AI สรุปว่าผู้สมัครคนหนึ่งไม่น่าเหมาะสม",
    story:
      "ระบบ AI ที่ช่วยคัดกรองผู้สมัครงานให้คะแนนผู้สมัครคนหนึ่งต่ำมาก แต่คุณพบว่าโปรไฟล์ของเขามีความสามารถใกล้เคียงกับคนอื่น เพียงแต่ใช้ภาษาหรือรูปแบบการเขียนต่างออกไป",
    correct: "REVIEW",
    explain:
      "AI อาจเรียนรู้จากข้อมูลเดิมที่มีอคติหรือมีรูปแบบจำกัด จึงไม่ควรเชื่อผลลัพธ์ทันที ควรให้มนุษย์ตรวจสอบเพิ่มเติมก่อนตัดสินใจ",
  },
  {
    id: "ai2",
    title: "AI สร้างภาพเหมารวมเกี่ยวกับคนบางกลุ่ม",
    story:
      "คุณพิมพ์ให้ AI สร้างภาพอาชีพบางประเภท แต่ผลลัพธ์กลับแสดงเพศหรือบุคลิกลักษณะซ้ำ ๆ แบบเหมารวม",
    correct: "QUESTION",
    explain:
      "นี่เป็นตัวอย่างของอคติจากข้อมูลฝึกสอนหรือรูปแบบที่ AI เคยเรียนรู้ ผู้ใช้ควรตั้งคำถามกับผลลัพธ์ ไม่เหมารวมว่าเป็นความจริงเสมอไป",
  },
  {
    id: "ai3",
    title: "เพื่อนจะใส่ข้อมูลส่วนตัวลงใน AI",
    story:
      "เพื่อนของคุณจะนำชื่อจริง เบอร์โทรศัพท์ และข้อมูลสุขภาพของคนในครอบครัวไปให้ AI ช่วยวิเคราะห์ เพราะคิดว่าสะดวกและรวดเร็ว",
    correct: "PROTECT",
    explain:
      "ไม่ควรใส่ข้อมูลส่วนบุคคลหรือข้อมูลอ่อนไหวลงใน AI โดยไม่จำเป็น เพราะอาจกระทบความเป็นส่วนตัวและความปลอดภัยของเจ้าของข้อมูล",
  },
  {
    id: "ai4",
    title: "AI ตอบคำถามเหมือนมั่นใจมาก",
    story:
      "คุณใช้ AI ช่วยหาข้อมูลเพื่อทำรายงาน แล้วระบบตอบอย่างมั่นใจมาก แต่ไม่มีแหล่งอ้างอิง และบางส่วนดูคลาดเคลื่อนจากที่คุณเคยเรียน",
    correct: "VERIFY",
    explain:
      "AI อาจตอบผิดหรือแต่งข้อมูลขึ้นได้ แม้คำตอบจะดูน่าเชื่อถือ จึงควรตรวจสอบกับแหล่งข้อมูลที่น่าเชื่อถือก่อนนำไปใช้จริง",
  },
];

const DECISION_OPTIONS = [
  { id: "REVIEW", label: "ให้มนุษย์ตรวจสอบผลลัพธ์ก่อนตัดสินใจ" },
  { id: "QUESTION", label: "ตั้งคำถามกับผลลัพธ์และดูว่า AI กำลังเหมารวมหรือไม่" },
  { id: "PROTECT", label: "หลีกเลี่ยงการใส่ข้อมูลส่วนบุคคลหรือข้อมูลอ่อนไหว" },
  { id: "VERIFY", label: "ตรวจสอบข้อมูลจากแหล่งที่น่าเชื่อถือเพิ่มเติม" },
  { id: "TRUST", label: "เชื่อผลลัพธ์ของ AI ทันทีเพราะระบบตอบเร็ว" },
];

function decisionLabel(id) {
  const found = DECISION_OPTIONS.find((o) => o.id === id);
  return found ? found.label : "-";
}

export default function Learn6() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("ผู้เรียน");

  const [step, setStep] = useState("intro"); // intro | lesson | task
  const [index, setIndex] = useState(0);
  const active = useMemo(() => SCENARIOS[index], [index]);

  const [decision, setDecision] = useState("");
  const [submitted, setSubmitted] = useState(false);

  /* -------------------------------------------------- */
  /* โหลดโปรไฟล์                                        */
  /* -------------------------------------------------- */
  useEffect(() => {
    let alive = true;

    (async () => {
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
          `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || "ผู้เรียน"
        );
      }

      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [navigate]);

  /* -------------------------------------------------- */
  /* Logic                                              */
  /* -------------------------------------------------- */
  const canSubmit = Boolean(decision);
  const isCorrect = submitted && decision === active.correct;
  const canNext = submitted && index < SCENARIOS.length - 1;
  const isLast = index === SCENARIOS.length - 1;

  const resetTask = () => {
    setDecision("");
    setSubmitted(false);
  };

  useEffect(() => {
    resetTask();
  }, [index]);

  const startLesson = () => {
    setStep("lesson");
  };

  const startTask = () => {
    setIndex(0);
    setDecision("");
    setSubmitted(false);
    setStep("task");
  };

  const goPrevScenario = () => {
    if (index <= 0) return;
    setIndex((v) => v - 1);
  };

  const goNextScenario = () => {
    if (index >= SCENARIOS.length - 1) return;
    setIndex((v) => v + 1);
  };

  return (
    <div className="edu-app">
      {/* TOPBAR */}
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
        {/* HERO */}
        <section className="edu-hero" aria-label="Unit 8 header">
          <div className="edu-hero__card">
            <div className="edu-hero__title">
              Unit 8: การใช้สื่อและเนื้อหาออนไลน์อย่างรับผิดชอบ
            </div>
            <div className="edu-hero__sub">
              เรื่องที่ 6: อคติของระบบปัญญาประดิษฐ์และการใช้งานอย่างรับผิดชอบ
            </div>

            <div className="edu-lessons__toolbar">
              <button
                className="edu-btn edu-btn--back"
                type="button"
                onClick={() => {
                  if (step === "task") {
                    setStep("lesson");
                  } else if (step === "lesson") {
                    setStep("intro");
                  } else {
                    navigate(-1);
                  }
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
        </section>

        {/* CONTENT */}
        <section className="edu-panel1">
          <div
            className="edu-panel1__head"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
            }}
          >
            <div
              className="edu-panel1__title"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "flex-start",
                gap: 10,
                width: "auto",
              }}
            >
              {step === "intro" ? (
                <>
                  <FiPlayCircle aria-hidden="true" />
                  <span>เกริ่นแนวคิด: AI ทำงานอย่างไร</span>
                </>
              ) : step === "lesson" ? (
                <>
                  <FiFileText aria-hidden="true" />
                  <span>Micro-lesson: เข้าใจอคติ AI และการใช้ AI อย่างรับผิดชอบ</span>
                </>
              ) : (
                <>
                  <FiCpu aria-hidden="true" />
                  <span>Interactive Simulation Workshop</span>
                </>
              )}
            </div>
          </div>

          {/* INTRO */}
          {step === "intro" && (
            <div className="edu-card">
              <div className="edu-card__title" style={{ fontWeight: 900 }}>
                Video-based Concept Introduction
              </div>

              <div
                className="edu-callout"
                style={{
                  marginTop: 12,
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                }}
              >
                <FiPlayCircle style={{ marginTop: 2 }} />
                <div style={{ lineHeight: 1.7 }}>
                  <b>ชวนคิดก่อนเรียน:</b> AI ไม่ได้ “คิด” แบบมนุษย์ แต่ทำงานโดยเรียนรู้จากข้อมูลจำนวนมาก
                  แล้วใช้รูปแบบที่เคยเห็นมาคาดเดา ตอบคำถาม หรือสร้างผลลัพธ์ใหม่
                  ดังนั้น ถ้าข้อมูลที่ AI เคยเรียนรู้มีความไม่สมดุล AI ก็อาจตอบแบบมีอคติหรือไม่เป็นกลางได้
                </div>
              </div>

              <div style={{ marginTop: 14, lineHeight: 1.7 }}>
                <b>ตัวอย่างที่เข้าใจง่าย:</b> ถ้า AI เคยเห็นภาพตัวอย่างอาชีพบางแบบซ้ำ ๆ
                เช่น หมอเป็นผู้ชายหรือพยาบาลเป็นผู้หญิง
                ระบบอาจสร้างคำตอบหรือภาพที่เหมารวมตามข้อมูลเดิม
                ทั้งที่ในความจริงคนทุกเพศสามารถทำอาชีพนั้นได้
              </div>

              <div className="edu-callout">
                <b>สิ่งที่ผู้เรียนควรรู้จากบทนี้</b>
                <ul
                  style={{
                    marginTop: 8,
                    paddingLeft: 20,
                    listStylePosition: "inside",
                  }}
                >
                  <li>AI ทำงานจากข้อมูลและรูปแบบที่เคยเรียนรู้</li>
                  <li>AI อาจมีอคติได้ หากข้อมูลเดิมไม่สมดุลหรือไม่หลากหลาย</li>
                  <li>ผู้ใช้ต้องตรวจสอบผลลัพธ์ ไม่เชื่อทันทีทุกคำตอบ</li>
                  <li>ควรใช้ AI โดยเคารพข้อมูลส่วนบุคคลและรับผิดชอบต่อสังคม</li>
                </ul>
              </div>

              <div className="edu-lessonActions">
                <button
                  className="edu-btn edu-btn--primary"
                  type="button"
                  onClick={startLesson}
                >
                  ไปต่อบทเรียนย่อย <FiChevronRight />
                </button>
              </div>
            </div>
          )}

          {/* LESSON */}
          {step === "lesson" && (
            <div className="edu-card">
              <div className="edu-card__title" style={{ fontWeight: 900 }}>
                หลักคิดสำคัญเกี่ยวกับ AI สำหรับวัย 15–18 ปี
              </div>

              <ul
                style={{
                  marginTop: 12,
                  paddingLeft: 22,
                  listStylePosition: "inside",
                  lineHeight: 1.8,
                }}
              >
                <li>
                  <b>AI เรียนรู้จากข้อมูล</b> ไม่ได้เข้าใจโลกแบบมนุษย์ แต่คาดเดาจากสิ่งที่เคยเห็น
                </li>
                <li>
                  <b>ผลลัพธ์ของ AI ไม่ได้ถูกต้องเสมอไป</b> บางครั้งอาจผิด พลาด หรือแต่งข้อมูลขึ้นได้
                </li>
                <li>
                  <b>AI อาจมีอคติ</b> หากข้อมูลที่ใช้ฝึกมีความไม่หลากหลายหรือมีการเหมารวม
                </li>
                <li>
                  <b>ผู้ใช้ต้องมีวิจารณญาณ</b> ตรวจสอบข้อมูลก่อนเชื่อ แชร์ หรือใช้ตัดสินใจเรื่องสำคัญ
                </li>
              </ul>

              <div className="edu-callout">
                <b>ตัวอย่างสถานการณ์ที่ AI อาจมีอคติ</b>
                <ul
                  style={{
                    marginTop: 8,
                    paddingLeft: 20,
                    listStylePosition: "inside",
                    lineHeight: 1.75,
                  }}
                >
                  <li>คัดเลือกคนจากรูปแบบข้อมูลเดิมที่ไม่เป็นธรรม</li>
                  <li>สร้างภาพหรือข้อความที่เหมารวมเรื่องเพศ เชื้อชาติ หรืออาชีพ</li>
                  <li>แนะนำคำตอบโดยไม่สะท้อนมุมมองที่หลากหลาย</li>
                </ul>
              </div>

              <div
                className="edu-callout"
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                }}
              >
                <FiShield style={{ marginTop: 2 }} />
                <div style={{ lineHeight: 1.7 }}>
                  <b>แนวทางใช้ AI อย่างรับผิดชอบ</b>
                  <ul
                    style={{
                      marginTop: 8,
                      paddingLeft: 20,
                      listStylePosition: "inside",
                    }}
                  >
                    <li>ไม่ใส่ข้อมูลส่วนบุคคลหรือข้อมูลอ่อนไหวโดยไม่จำเป็น</li>
                    <li>ตรวจสอบคำตอบจากแหล่งข้อมูลที่น่าเชื่อถือ</li>
                    <li>ไม่ใช้ AI เพื่อทำร้าย หลอกลวง หรือทำให้คนอื่นเสียหาย</li>
                    <li>รู้ว่า AI เป็น “เครื่องมือช่วยคิด” ไม่ใช่ผู้ตัดสินแทนทั้งหมด</li>
                  </ul>
                </div>
              </div>

              <div className="edu-callout">
                <b>หลักคิดสั้น ๆ ก่อนใช้ AI:</b> ถามตัวเองเสมอว่า
                ข้อมูลนี้จริงไหม เป็นธรรมไหม กระทบใครบ้าง
                และเราได้ปกป้องข้อมูลส่วนตัวของตนเองและผู้อื่นหรือยัง
              </div>

              <div className="edu-lessonActions">
                <button
                  className="edu-btn"
                  type="button"
                  onClick={() => setStep("intro")}
                >
                  <FiChevronLeft />
                  ย้อนดูเกริ่นนำ
                </button>

                <button
                  className="edu-btn edu-btn--primary"
                  type="button"
                  onClick={startTask}
                >
                  เริ่มกิจกรรมจำลอง <FiChevronRight />
                </button>
              </div>
            </div>
          )}

          {/* TASK */}
          {step === "task" && (
            <div className="edu-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  flexWrap: "wrap",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <div style={{ fontWeight: 900 }}>
                  สถานการณ์ {index + 1}/{SCENARIOS.length}
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    className="edu-btn"
                    type="button"
                    onClick={goPrevScenario}
                    disabled={index === 0}
                  >
                    <FiChevronLeft /> ก่อนหน้า
                  </button>

                  <button
                    className="edu-btn edu-btn--danger"
                    type="button"
                    onClick={resetTask}
                    title="ล้างคำตอบของสถานการณ์นี้"
                  >
                    <FiRotateCcw /> รีเซ็ต
                  </button>

                  <button
                    className="edu-btn edu-btn--primary"
                    type="button"
                    onClick={() => setStep("lesson")}
                  >
                    <FiFileText /> กลับไปทบทวนบทเรียน
                  </button>
                </div>
              </div>

              <div className="edu-card__title" style={{ fontWeight: 900 }}>
                {active.title}
              </div>

              <p style={{ marginTop: 6, lineHeight: 1.7 }}>{active.story}</p>

              <div style={{ marginTop: 12 }}>
                <div style={{ fontWeight: 900, marginBottom: 8 }}>
                  คุณคิดว่าควรทำอย่างไร
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {DECISION_OPTIONS.map((d) => {
                    const isActive = decision === d.id;

                    return (
                      <button
                        key={d.id}
                        type="button"
                        className="edu-pill"
                        onClick={() => setDecision(d.id)}
                        disabled={submitted}
                        style={{
                          cursor: submitted ? "not-allowed" : "pointer",
                          opacity: submitted && !isActive ? 0.7 : 1,
                          borderColor: isActive ? "rgba(37,99,235,.35)" : undefined,
                          background: isActive ? "rgba(37,99,235,.10)" : undefined,
                        }}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {submitted && (
                <div style={{ marginTop: 14 }}>
                  {isCorrect ? (
                    <div
                      className="edu-ok"
                      style={{ display: "flex", gap: 10, alignItems: "flex-start" }}
                    >
                      <FiCheckCircle style={{ marginTop: 2 }} />
                      <div>
                        <div style={{ fontWeight: 900 }}>ถูกต้อง ✅</div>
                        <div style={{ marginTop: 6, lineHeight: 1.65 }}>
                          คุณเลือก: <b>{decisionLabel(decision)}</b>
                        </div>
                        <div style={{ marginTop: 8, lineHeight: 1.7 }}>
                          {active.explain}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="edu-warn"
                      style={{ display: "flex", gap: 10, alignItems: "flex-start" }}
                    >
                      <FiAlertTriangle style={{ marginTop: 2 }} />
                      <div>
                        <div style={{ fontWeight: 900 }}>ยังไม่ตรง ❗</div>
                        <div style={{ marginTop: 6, lineHeight: 1.65 }}>
                          คุณเลือก: <b>{decisionLabel(decision)}</b>
                        </div>
                        <div style={{ marginTop: 4, lineHeight: 1.65 }}>
                          คำตอบที่เหมาะสมกว่า: <b>{decisionLabel(active.correct)}</b>
                        </div>
                        <div style={{ marginTop: 8, lineHeight: 1.7 }}>
                          {active.explain}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  className="edu-btn edu-btn--primary"
                  type="button"
                  disabled={!canSubmit || submitted}
                  onClick={() => setSubmitted(true)}
                  title={!canSubmit ? "เลือกคำตอบก่อน" : "ตรวจคำตอบ"}
                >
                  ตรวจคำตอบ
                </button>

                {canNext && (
                  <button className="edu-btn" type="button" onClick={goNextScenario}>
                    ถัดไป <FiChevronRight />
                  </button>
                )}

                {submitted && isLast && (
                  <button
                    className="edu-btn edu-btn--ghost"
                    type="button"
                    onClick={() => navigate("/unit8/learn")}
                  >
                    เสร็จสิ้น <FiChevronRight />
                  </button>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}