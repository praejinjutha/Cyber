// src/pages/Unit8/Learn4.jsx
// Unit 8 – เรื่องที่ 4: จริยธรรมในการใช้และเผยแพร่เนื้อหาออนไลน์
// Micro-lesson + Interactive Classification-based Learning + Scenario-based Learning + Immediate Feedback

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

// Assets
import logo from "../../assets/logo.png";

// Styles
import "../../main.css";
import "../Unit1/learn.css";

// Icons
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
/* ✅ สถานการณ์จริยธรรมออนไลน์                         */
/* -------------------------------------------------- */
const SCENARIOS = [
  {
    id: "e1",
    title: "โพสต์ภาพเพื่อนโดยไม่ได้ขออนุญาต",
    story:
      "คุณถ่ายรูปเพื่อนตอนเผลอหลับในห้องเรียน แล้วโพสต์ลงสตอรี่พร้อมแคปชันแซวขำ ๆ โดยไม่ได้ถามเจ้าตัวก่อน",
    correctIssue: "RIGHTS",
    correctImpact: "FEELING",
    explain:
      "แม้จะตั้งใจแค่แซวเล่น แต่การเอารูปคนอื่นไปโพสต์โดยไม่ขออนุญาต เป็นการไม่เคารพสิทธิและความเป็นส่วนตัวของผู้อื่น และอาจทำให้เจ้าตัวอับอายหรือเสียความรู้สึกได้",
  },
  {
    id: "e2",
    title: "แชร์ข่าวด่วนโดยยังไม่ตรวจสอบ",
    story:
      "คุณเห็นโพสต์ข่าวด่วนเกี่ยวกับเหตุการณ์สำคัญในสังคมและรีบแชร์ต่อทันที เพราะคิดว่าคนอื่นควรรู้เร็วที่สุด แต่ยังไม่ได้ตรวจสอบว่าเป็นข้อมูลจริงหรือไม่",
    correctIssue: "RESPONSIBILITY",
    correctImpact: "MISUNDERSTAND",
    explain:
      "นี่เป็นเรื่องของความรับผิดชอบต่อสังคม เพราะการแชร์ข้อมูลที่ยังไม่ตรวจสอบอาจทำให้คนอื่นเข้าใจผิด ตื่นตระหนก หรือส่งต่อข้อมูลผิด ๆ ต่อไปอีก",
  },
  {
    id: "e3",
    title: "คอมเมนต์ล้อรูปร่างคนอื่นใต้คลิป",
    story:
      "คุณเข้าไปคอมเมนต์ล้อรูปร่างของคนในคลิปสาธารณะ เพราะเห็นหลายคนก็พิมพ์แซวเหมือนกัน",
    correctIssue: "BOTH",
    correctImpact: "HARM",
    explain:
      "สถานการณ์นี้กระทบทั้งสิทธิของผู้อื่นและความรับผิดชอบต่อสังคม เพราะเป็นการทำร้ายศักดิ์ศรีของเจ้าของคลิป และยังทำให้บรรยากาศออนไลน์เป็นพื้นที่ที่ไม่ปลอดภัย",
  },
  {
    id: "e4",
    title: "แชร์อินโฟกราฟิกพร้อมให้เครดิต",
    story:
      "คุณเจอภาพอินโฟกราฟิกที่มีประโยชน์มาก จึงแชร์ต่อพร้อมระบุแหล่งที่มาและไม่ตัดลายน้ำออก",
    correctIssue: "NO_PROBLEM",
    correctImpact: "POSITIVE",
    explain:
      "นี่เป็นตัวอย่างของการใช้และเผยแพร่เนื้อหาอย่างมีจริยธรรม เพราะให้เครดิตเจ้าของผลงาน เคารพสิทธิ และช่วยเผยแพร่ข้อมูลอย่างเหมาะสม",
  },
];

const ISSUE_OPTIONS = [
  { id: "RIGHTS", label: "เคารพสิทธิผู้อื่น" },
  { id: "RESPONSIBILITY", label: "ความรับผิดชอบต่อสังคม" },
  { id: "BOTH", label: "ทั้งสองประเด็น" },
  { id: "NO_PROBLEM", label: "ไม่ใช่ปัญหาจริยธรรม" },
];

const IMPACT_OPTIONS = [
  { id: "FEELING", label: "ทำให้ผู้อื่นอับอายหรือเสียความรู้สึก" },
  { id: "MISUNDERSTAND", label: "ทำให้คนอื่นเข้าใจผิดหรือแชร์ข้อมูลผิด" },
  { id: "HARM", label: "ทำร้ายศักดิ์ศรีและทำให้พื้นที่ออนไลน์ไม่ปลอดภัย" },
  { id: "POSITIVE", label: "เป็นการใช้งานออนไลน์อย่างเหมาะสมและสร้างสรรค์" },
];

function issueLabel(id) {
  const found = ISSUE_OPTIONS.find((o) => o.id === id);
  return found ? found.label : "-";
}

function impactLabel(id) {
  const found = IMPACT_OPTIONS.find((o) => o.id === id);
  return found ? found.label : "-";
}

export default function Learn4() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("ผู้เรียน");

  const [step, setStep] = useState("lesson"); // lesson | task

  const [index, setIndex] = useState(0);
  const active = useMemo(() => SCENARIOS[index], [index]);

  const [issueType, setIssueType] = useState("");
  const [impactType, setImpactType] = useState("");
  const [submitted, setSubmitted] = useState(false);

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

  const canSubmit = Boolean(issueType && impactType);
  const issueCorrect = submitted && issueType === active.correctIssue;
  const impactCorrect = submitted && impactType === active.correctImpact;
  const allCorrect = submitted && issueCorrect && impactCorrect;
  const canNext = submitted && index < SCENARIOS.length - 1;

  const resetTask = () => {
    setIssueType("");
    setImpactType("");
    setSubmitted(false);
  };

  useEffect(() => {
    resetTask();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

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
              เรื่องที่ 4: จริยธรรมในการใช้และเผยแพร่เนื้อหาออนไลน์
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
                  ? "เรียนรู้จริยธรรมดิจิทัลแบบสั้นและเข้าใจง่าย"
                  : "กิจกรรม: จำแนกประเด็นจริยธรรมจากสถานการณ์"}
              </span>
            </div>
          </div>

{/* LESSON */}
{step === "lesson" && (
  <div className="edu-card">
    <ul style={{ marginTop: 0, paddingLeft: 22, listStylePosition: "inside" }}>
      <li>
        <b>เคารพสิทธิผู้อื่น</b> = ไม่ละเมิดความเป็นส่วนตัว ไม่เอาผลงานหรือรูปคนอื่นไปใช้แบบไม่เหมาะสม
      </li>
      <li>
        <b>รับผิดชอบต่อสังคม</b> = ไม่แชร์ข้อมูลมั่ว ไม่คอมเมนต์หรือโพสต์อะไรที่ทำร้ายคนอื่นและสังคม
      </li>
      <li>
        <b>คิดก่อนโพสต์</b> = สิ่งที่กำลังจะลงนั้นจริงไหม เหมาะไหม และกระทบใครบ้าง
      </li>
    </ul>

    <div className="edu-callout">
      <b>จำง่าย:</b> ก่อนโพสต์หรือแชร์ ให้ถามตัวเองว่า
      <b> ละเมิดสิทธิใครไหม?</b> <b>ทำให้ใครเดือดร้อนไหม?</b>{" "}
      <b>ถ้าคนอื่นทำแบบนี้กับเรา เราจะโอเคไหม?</b>
    </div>

    {/* 🔽 แทรกตรงนี้ */}
    <div className="edu-callout">
      <b>ตัวอย่างประเด็นจริยธรรมที่พบบ่อย</b>
      <ul style={{ marginTop: 6, paddingLeft: 20 }}>
        <li>การละเมิดความเป็นส่วนตัวของผู้อื่น</li>
        <li>การเผยแพร่ข้อมูลส่วนบุคคลโดยไม่ปิดบัง</li>
        <li>การแชร์เนื้อหาของผู้อื่นโดยไม่ขออนุญาต</li>
        <li>การเผยแพร่ข้อมูลที่อาจทำให้ผู้อื่นเสียหาย</li>
      </ul>
    </div>
    {/* 🔼 จบส่วนที่เพิ่ม */}

    <div className="edu-lessonActions">
      <button className="edu-btn edu-btn--primary" onClick={() => setStep("task")}>
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
                  <button className="edu-btn" onClick={goPrevScenario} disabled={index === 0}>
                    <FiChevronLeft /> ก่อนหน้า
                  </button>

                  <button className="edu-btn" onClick={resetTask} title="ล้างคำตอบของสถานการณ์นี้">
                    <FiRotateCcw /> รีเซ็ต
                  </button>
                </div>
              </div>

              <div className="edu-card__title" style={{ fontWeight: 900 }}>
                {active.title}
              </div>
              <p style={{ marginTop: 6, lineHeight: 1.65 }}>{active.story}</p>

              <div style={{ marginTop: 14 }}>
                <div style={{ fontWeight: 900, marginBottom: 8 }}>
                  1) สถานการณ์นี้เข้าข่ายประเด็นใดมากที่สุด?
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {ISSUE_OPTIONS.map((item) => {
                    const isActive = issueType === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setIssueType(item.id)}
                        disabled={submitted}
                        className="edu-pill"
                        style={{
                          cursor: submitted ? "not-allowed" : "pointer",
                          opacity: submitted && !isActive ? 0.7 : 1,
                          borderColor: isActive ? "rgba(37,99,235,.35)" : undefined,
                          background: isActive ? "rgba(37,99,235,.10)" : undefined,
                        }}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginTop: 14 }}>
                <div style={{ fontWeight: 900, marginBottom: 8 }}>
                  2) ผลกระทบที่อาจเกิดขึ้นคืออะไร?
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {IMPACT_OPTIONS.map((item) => {
                    const isActive = impactType === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setImpactType(item.id)}
                        disabled={submitted}
                        className="edu-pill"
                        style={{
                          cursor: submitted ? "not-allowed" : "pointer",
                          opacity: submitted && !isActive ? 0.7 : 1,
                          borderColor: isActive ? "rgba(37,99,235,.35)" : undefined,
                          background: isActive ? "rgba(37,99,235,.10)" : undefined,
                        }}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {submitted && (
                <div style={{ marginTop: 14 }}>
                  {allCorrect ? (
                    <div className="edu-ok" style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <FiCheckCircle style={{ marginTop: 2 }} />
                      <div>
                        <div style={{ fontWeight: 900 }}>ถูกต้อง ✅</div>
                        <div style={{ marginTop: 6, lineHeight: 1.65 }}>
                          ประเด็นจริยธรรม: <b>{issueLabel(active.correctIssue)}</b>
                        </div>
                        <div style={{ marginTop: 4, lineHeight: 1.65 }}>
                          ผลกระทบ: <b>{impactLabel(active.correctImpact)}</b>
                        </div>
                        <div style={{ marginTop: 8, lineHeight: 1.65 }}>{active.explain}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="edu-warn" style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <FiAlertTriangle style={{ marginTop: 2 }} />
                      <div>
                        <div style={{ fontWeight: 900 }}>ยังไม่ถูกทั้งหมด ❗</div>
                        <div style={{ marginTop: 6, lineHeight: 1.65 }}>
                          คุณเลือกประเด็น: <b>{issueLabel(issueType)}</b>
                        </div>
                        <div style={{ marginTop: 4, lineHeight: 1.65 }}>
                          เฉลยประเด็น: <b>{issueLabel(active.correctIssue)}</b>
                        </div>
                        <div style={{ marginTop: 8, lineHeight: 1.65 }}>
                          คุณเลือกผลกระทบ: <b>{impactLabel(impactType)}</b>
                        </div>
                        <div style={{ marginTop: 4, lineHeight: 1.65 }}>
                          เฉลยผลกระทบ: <b>{impactLabel(active.correctImpact)}</b>
                        </div>
                        <div style={{ marginTop: 8, lineHeight: 1.65 }}>{active.explain}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  className="edu-btn edu-btn--primary"
                  disabled={!canSubmit || submitted}
                  onClick={() => setSubmitted(true)}
                  title={!canSubmit ? "เลือกคำตอบให้ครบก่อน" : "ตรวจคำตอบ"}
                >
                  ตรวจคำตอบ
                </button>

                {canNext && (
                  <button className="edu-btn" onClick={goNextScenario}>
                    ถัดไป <FiChevronRight />
                  </button>
                )}

                {submitted && index === SCENARIOS.length - 1 && (
                  <button className="edu-btn edu-btn--ghost" onClick={() => navigate("/unit8/learn")}>
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