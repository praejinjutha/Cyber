// src/pages/Unit8/Learn5.jsx
// Unit 8 – เรื่องที่ 5: การตัดสินใจอย่างรับผิดชอบในโลกออนไลน์
// Scenario-based Learning + Practical Framework (Best-Practice) + Immediate Feedback

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

import logo from "../../assets/logo.png";

import "../../main.css";
import "../Unit1/learn.css";

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
} from "react-icons/fi";

/* -------------------------------------------------- */
/* สถานการณ์การตัดสินใจ                             */
/* -------------------------------------------------- */

const SCENARIOS = [
  {
    id: "d1",
    title: "พบข่าวที่ถูกแชร์จำนวนมาก",
    story:
      "คุณเห็นโพสต์ข่าวเกี่ยวกับเหตุการณ์สำคัญในสังคมที่ถูกแชร์ต่อจำนวนมาก แต่โพสต์นั้นไม่ได้ระบุแหล่งที่มาของข้อมูล",
    correct: "CHECK",
    explain:
      "การตรวจสอบแหล่งที่มาก่อนแชร์เป็นการตัดสินใจอย่างรับผิดชอบ เพราะช่วยลดโอกาสการเผยแพร่ข้อมูลที่ไม่ถูกต้องและลดผลกระทบต่อสังคม",
  },
  {
    id: "d2",
    title: "เห็นคลิปของเพื่อนกำลังถูกล้อ",
    story:
      "มีคนแชร์คลิปของเพื่อนคุณในกลุ่มออนไลน์ และมีหลายคนกำลังคอมเมนต์ล้อเลียน",
    correct: "NOT_SHARE",
    explain:
      "การไม่แชร์ต่อช่วยลดการขยายความเสียหาย เคารพศักดิ์ศรีของผู้อื่น และไม่ทำให้สถานการณ์แย่ลง",
  },
  {
    id: "d3",
    title: "เจอโพสต์ที่อาจสร้างความเข้าใจผิด",
    story:
      "คุณเห็นโพสต์ที่มีข้อมูลเกี่ยวกับเหตุการณ์ในสังคม แต่เนื้อหาดูเหมือนจะชี้นำและอาจทำให้คนเข้าใจผิด",
    correct: "VERIFY",
    explain:
      "ควรตรวจสอบข้อมูลจากหลายแหล่งก่อนตัดสินใจ เพราะการรีบแชร์อาจทำให้ความเข้าใจผิดขยายวงกว้างและกระทบต่อผู้อื่น",
  },
];

const DECISION_OPTIONS = [
  { id: "CHECK", label: "ตรวจสอบแหล่งที่มาของข้อมูลก่อนแชร์" },
  { id: "NOT_SHARE", label: "ไม่แชร์ต่อเพื่อลดผลกระทบต่อผู้อื่น" },
  { id: "VERIFY", label: "ค้นหาข้อมูลจากหลายแหล่งก่อนตัดสินใจ" },
  { id: "SHARE", label: "แชร์ต่อทันทีเพื่อให้คนอื่นรู้เร็ว" },
];

function decisionLabel(id) {
  const found = DECISION_OPTIONS.find((o) => o.id === id);
  return found ? found.label : "-";
}

export default function Learn5() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("ผู้เรียน");

  const [step, setStep] = useState("lesson"); // lesson | task
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
              เรื่องที่ 5: การตัดสินใจอย่างรับผิดชอบในโลกออนไลน์
            </div>

            <div className="edu-lessons__toolbar">
              <button
                className="edu-btn edu-btn--back"
                type="button"
                onClick={() => (step === "task" ? setStep("lesson") : navigate(-1))}
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
              <FiFileText aria-hidden="true" />
              <span>
                {step === "lesson"
                  ? "หลักการตัดสินใจอย่างรับผิดชอบ"
                  : "กิจกรรม: เลือกแนวทางการตัดสินใจ"}
              </span>
            </div>
          </div>

          {/* LESSON */}
          {step === "lesson" && (
            <div className="edu-card">
              <ul
                style={{
                  marginTop: 0,
                  paddingLeft: 22,
                  listStylePosition: "inside",
                }}
              >
                <li>
                  <b>คำนึงถึงผลกระทบต่อผู้อื่น</b>
                </li>
                <li>
                  <b>ตรวจสอบข้อมูลก่อนเผยแพร่</b>
                </li>
                <li>
                  <b>เคารพสิทธิและศักดิ์ศรีของผู้อื่น</b>
                </li>
                <li>
                  <b>คิดถึงผลระยะสั้นและระยะยาว</b>
                </li>
              </ul>

              <div className="edu-callout">
                <b>Framework การตัดสินใจ:</b>
                <ul
                  style={{
                    marginTop: 8,
                    paddingLeft: 20,
                    listStylePosition: "inside",
                  }}
                >
                  <li>ข้อมูลนี้ถูกต้องหรือไม่</li>
                  <li>เนื้อหานี้กระทบใครบ้าง</li>
                  <li>ถ้าเผยแพร่แล้วจะเกิดผลอะไร</li>
                </ul>
              </div>

              <div className="edu-callout">
<b>ตัวอย่างการเชื่อมเหตุผลกับผลลัพธ์</b>

<ul
  style={{
    marginTop: 8,
    paddingLeft: 20,
    listStylePosition: "inside",
  }}
>
<li>
ตรวจสอบข้อมูลก่อนแชร์ → ช่วยลดการเผยแพร่ข้อมูลที่ไม่ถูกต้องในสังคม
</li>

<li>
คำนึงถึงผลกระทบต่อผู้อื่น → ช่วยลดความเสียหายหรือความเดือดร้อนของบุคคลที่เกี่ยวข้อง
</li>

<li>
เคารพสิทธิและศักดิ์ศรีของผู้อื่น → ช่วยสร้างบรรยากาศออนไลน์ที่ปลอดภัยและเคารพกัน
</li>

<li>
พิจารณาผลระยะสั้นและระยะยาว → ช่วยให้การตัดสินใจรอบคอบและลดปัญหาที่อาจเกิดขึ้นภายหลัง
</li>
</ul>

</div>

              <div className="edu-callout">
                <b>หลักคิดสั้น ๆ:</b> ก่อนโพสต์หรือแชร์ ควรถามตัวเองว่า
                สิ่งนี้จริงหรือยัง กระทบใครหรือไม่ และการตัดสินใจของเราจะช่วยลดหรือเพิ่มปัญหาในสังคม
              </div>

              <div className="edu-lessonActions">
                <button
                  className="edu-btn edu-btn--primary"
                  type="button"
                  onClick={startTask}
                >
                  เริ่มกิจกรรม <FiChevronRight />
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
                    <FiFileText /> กลับไปทบทวนหลักการ
                  </button>
                </div>
              </div>

              <div className="edu-card__title" style={{ fontWeight: 900 }}>
                {active.title}
              </div>

              <p style={{ marginTop: 6, lineHeight: 1.65 }}>{active.story}</p>

              <div style={{ marginTop: 12 }}>
                <div style={{ fontWeight: 900, marginBottom: 8 }}>
                  คุณควรตัดสินใจอย่างไร
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
                        <div style={{ marginTop: 8, lineHeight: 1.65 }}>
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
                        <div style={{ marginTop: 8, lineHeight: 1.65 }}>
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
                  <button className="edu-btn edu-btn--ghost" type="button" onClick={goNextScenario}>
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