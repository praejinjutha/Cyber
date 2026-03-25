// src/pages/Unit3/Learn4.jsx
// Unit 3 – เรื่องที่ 4: การประเมินความเสี่ยงของรอยเท้าดิจิทัล
// Risk Assessment Learning (3-Dimension) + Scenario-based + Immediate Feedback

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
/* ✅ สถานการณ์ประเมินความเสี่ยง (3 สถานการณ์)       */
/* -------------------------------------------------- */
const SCENARIOS = [
  {
    id: "r1",
    title: "โพสต์ระบายอารมณ์ในบัญชีสาธารณะ",
    story:
      "คุณโพสต์ระบายอารมณ์เกี่ยวกับโรงเรียนด้วยถ้อยคำแรงในบัญชีที่ตั้งค่าเป็นสาธารณะ และมีคนแชร์ต่อออกไป",
    correct: "HIGH",
    explain:
      "คนเห็นเยอะ + พื้นที่สาธารณะ + เนื้อหาแรง/ลบ → เสี่ยงสูงต่อชื่อเสียง ความสัมพันธ์ และโอกาสในอนาคต",
  },
  {
    id: "r2",
    title: "แชร์มีมล้อเลียนในกลุ่มเพื่อน",
    story:
      "คุณแชร์มีมล้อเลียนเพื่อนแบบขำ ๆ ในกลุ่มปิดที่มีเพื่อนสนิทไม่กี่คน แต่มีโอกาสถูกแคป/ส่งต่อ",
    correct: "MEDIUM",
    explain:
      "คนเห็นจำกัด (กลุ่มปิด) แต่เป็นเนื้อหาล้อเลียน → เสี่ยงปานกลาง เพราะถูกส่งต่อแล้วกระทบความสัมพันธ์ได้",
  },
  {
    id: "r3",
    title: "คอมเมนต์สุภาพในเพจสาธารณะ",
    story:
      "คุณแสดงความคิดเห็นอย่างสุภาพ มีเหตุผล ใต้บทความความรู้ในเพจสาธารณะ โดยไม่พาดพิงหรือใช้คำหยาบ",
    correct: "LOW",
    explain:
      "แม้เป็นพื้นที่สาธารณะ แต่เนื้อหาสุภาพ/สร้างสรรค์ → เสี่ยงต่ำ",
  },
];

const RISK_LEVELS = [
  { id: "LOW", label: "ความเสี่ยงต่ำ" },
  { id: "MEDIUM", label: "ความเสี่ยงปานกลาง" },
  { id: "HIGH", label: "ความเสี่ยงสูง" },
];

const AUDIENCE_OPTIONS = [
  { id: "A1", label: "เห็นเฉพาะคนไม่กี่คน (เพื่อนสนิท/แชทส่วนตัว)", score: 1 },
  { id: "A2", label: "เห็นหลายคน (กลุ่มปิด/เพื่อนจำนวนหนึ่ง)", score: 2 },
  { id: "A3", label: "เห็นคนจำนวนมาก (สาธารณะ/แชร์ต่อได้ง่าย)", score: 3 },
];

const PLACE_OPTIONS = [
  { id: "P1", label: "พื้นที่ส่วนตัว (DM/แชทส่วนตัว)", score: 1 },
  { id: "P2", label: "พื้นที่กึ่งสาธารณะ (กลุ่ม/บัญชีล็อกบางส่วน)", score: 2 },
  { id: "P3", label: "พื้นที่สาธารณะ (เพจ/ไทม์ไลน์สาธารณะ/ค้นหาเจอ)", score: 3 },
];

const IMPACT_OPTIONS = [
  { id: "I1", label: "กระทบน้อย (แทบไม่มีผลตามมา)", score: 1 },
  { id: "I2", label: "กระทบความสัมพันธ์/ความรู้สึกคนอื่น", score: 2 },
  { id: "I3", label: "กระทบชื่อเสียง/โอกาสในอนาคต (เรียน/งาน/ทุน)", score: 3 },
];

function scoreToRisk(totalScore) {
  if (totalScore >= 8) return "HIGH";
  if (totalScore >= 5) return "MEDIUM";
  return "LOW";
}

function riskLabel(riskId) {
  const found = RISK_LEVELS.find((r) => r.id === riskId);
  return found ? found.label : "-";
}

export default function Learn4() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("ผู้เรียน");

  const [step, setStep] = useState("lesson"); // lesson | task

  // สถานการณ์
  const [index, setIndex] = useState(0);
  const active = useMemo(() => SCENARIOS[index], [index]);

  // 3D selections
  const [audienceId, setAudienceId] = useState("");
  const [placeId, setPlaceId] = useState("");
  const [impactId, setImpactId] = useState("");

  // ผู้เรียนเลือกระดับความเสี่ยง
  const [risk, setRisk] = useState("");

  // ส่งคำตอบแล้วหรือยัง
  const [submitted, setSubmitted] = useState(false);

  /* -------------------------------------------------- */
  /* ✅ โหลดโปรไฟล์                                     */
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
  /* ✅ คำนวณคะแนนจาก 3 มิติ                             */
  /* -------------------------------------------------- */
  const audience = useMemo(
    () => AUDIENCE_OPTIONS.find((o) => o.id === audienceId),
    [audienceId]
  );
  const place = useMemo(
    () => PLACE_OPTIONS.find((o) => o.id === placeId),
    [placeId]
  );
  const impact = useMemo(
    () => IMPACT_OPTIONS.find((o) => o.id === impactId),
    [impactId]
  );

  const totalScore = useMemo(() => {
    if (!audience || !place || !impact) return 0;
    return audience.score + place.score + impact.score;
  }, [audience, place, impact]);

  const suggestedRisk = useMemo(() => {
    if (!totalScore) return "";
    return scoreToRisk(totalScore);
  }, [totalScore]);

  /* -------------------------------------------------- */
  /* ✅ เงื่อนไข                                        */
  /* -------------------------------------------------- */
  const canSubmit = Boolean(audienceId && placeId && impactId && risk);
  const isCorrect = submitted && risk === active.correct;

  const canNext = submitted && index < SCENARIOS.length - 1;

  /* -------------------------------------------------- */
  /* ✅ รีเซ็ตต่อสถานการณ์                               */
  /* -------------------------------------------------- */
  const resetTask = () => {
    setAudienceId("");
    setPlaceId("");
    setImpactId("");
    setRisk("");
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
              <div className="edu-brandtext__subtitle">Unit 3</div>
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
        <section className="edu-hero" aria-label="Unit 3 header">
          <div className="edu-hero__card">
            <div className="edu-hero__title">
              Unit 3: การจัดการรอยเท้าดิจิทัลและตัวตนออนไลน์
            </div>
            <div className="edu-hero__sub">เรื่องที่ 4	การประเมินความเสี่ยงของรอยเท้าดิจิทัล
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
          {/* ✅ FIX แบบบังคับทับ CSS เดิม: ชิดกันแน่นอน */}
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
                  ? "ประเมินความเสี่ยงด้วย 3 มิติ"
                  : "กิจกรรม: ประเมินระดับความเสี่ยงจากสถานการณ์"}
              </span>
            </div>
          </div>

          {/* ============ LESSON ============ */}
          {step === "lesson" && (
            <div className="edu-card">
              <ul style={{ marginTop: 0 }}>
                <li>
                  <b>ใครเห็น</b> – คนเห็นมากแค่ไหน? (น้อย / หลายคน / เยอะมาก)
                </li>
                <li>
                  <b>อยู่ที่ไหน</b> – พื้นที่ส่วนตัวหรือสาธารณะ? (ส่วนตัว / กึ่งสาธารณะ / สาธารณะ)
                </li>
                <li>
                  <b>ส่งผลอะไร</b> – กระทบอะไรตามมา? (น้อย / ความสัมพันธ์ / ชื่อเสียง-อนาคต)
                </li>
              </ul>

              <div className="edu-callout">
                <b>ทริคจำเร็ว:</b> ถ้า <b>คนเห็นเยอะ</b> + <b>สาธารณะ</b> +{" "}
                <b>กระทบชื่อเสียง/อนาคต</b> → มักเป็น “ความเสี่ยงสูง”
              </div>

              <div className="edu-lessonActions">
                <button className="edu-btn edu-btn--primary" onClick={() => setStep("task")}>
                  เริ่มประเมินความเสี่ยง <FiChevronRight />
                </button>
              </div>
            </div>
          )}

          {/* ============ TASK ============ */}
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

              <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                <div>
                  <div style={{ fontWeight: 900, marginBottom: 6 }}>1) ใครเห็น?</div>
                  <select
                    className="edu-input"
                    value={audienceId}
                    onChange={(e) => setAudienceId(e.target.value)}
                    disabled={submitted}
                  >
                    <option value="">เลือกคนที่เห็น</option>
                    {AUDIENCE_OPTIONS.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div style={{ fontWeight: 900, marginBottom: 6 }}>2) อยู่ที่ไหน?</div>
                  <select
                    className="edu-input"
                    value={placeId}
                    onChange={(e) => setPlaceId(e.target.value)}
                    disabled={submitted}
                  >
                    <option value="">เลือกพื้นที่</option>
                    {PLACE_OPTIONS.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div style={{ fontWeight: 900, marginBottom: 6 }}>3) ส่งผลอะไร?</div>
                  <select
                    className="edu-input"
                    value={impactId}
                    onChange={(e) => setImpactId(e.target.value)}
                    disabled={submitted}
                  >
                    <option value="">เลือกผลกระทบ</option>
                    {IMPACT_OPTIONS.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="edu-callout" style={{ marginTop: 12 }}>
                <div style={{ fontWeight: 900, marginBottom: 4 }}>สรุปจาก 3 มิติ (ระบบช่วยประเมิน)</div>
                {!suggestedRisk ? (
                  <div>เลือกให้ครบทั้ง 3 ข้อก่อน แล้วระบบจะช่วยสรุประดับความเสี่ยงให้</div>
                ) : (
                  <div style={{ lineHeight: 1.7 }}>
                    คะแนนรวม: <b>{totalScore}/9</b> → แนวโน้มความเสี่ยง: <b>{riskLabel(suggestedRisk)}</b>
                    <div style={{ marginTop: 6, color: "#374151" }}>
                      * ยังไม่ใช่เฉลย เป็นแนวโน้มเพื่อช่วยคิด
                    </div>
                  </div>
                )}
              </div>

              <div style={{ marginTop: 12 }}>
                <div style={{ fontWeight: 900, marginBottom: 8 }}>เลือกระดับความเสี่ยงของสถานการณ์นี้</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {RISK_LEVELS.map((r) => {
                    const isActive = risk === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setRisk(r.id)}
                        disabled={submitted}
                        className="edu-pill"
                        style={{
                          cursor: submitted ? "not-allowed" : "pointer",
                          opacity: submitted && !isActive ? 0.7 : 1,
                          borderColor: isActive ? "rgba(37,99,235,.35)" : undefined,
                          background: isActive ? "rgba(37,99,235,.10)" : undefined,
                        }}
                      >
                        {r.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {submitted && (
                <div style={{ marginTop: 14 }}>
                  {isCorrect ? (
                    <div className="edu-ok" style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <FiCheckCircle style={{ marginTop: 2 }} />
                      <div>
                        <div style={{ fontWeight: 900 }}>ถูกต้อง ✅ คุณเลือก: {riskLabel(risk)}</div>
                        <div style={{ marginTop: 6, lineHeight: 1.65 }}>{active.explain}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="edu-warn" style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <FiAlertTriangle style={{ marginTop: 2 }} />
                      <div>
                        <div style={{ fontWeight: 900 }}>
                          ยังไม่ตรงเฉลย ❗ คุณเลือก: {riskLabel(risk)} | เฉลย: {riskLabel(active.correct)}
                        </div>
                        <div style={{ marginTop: 6, lineHeight: 1.65 }}>{active.explain}</div>
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
                  title={!canSubmit ? "เลือกให้ครบก่อน" : "ตรวจคำตอบ"}
                >
                  ตรวจคำตอบ
                </button>

                {canNext && (
                  <button className="edu-btn" onClick={goNextScenario}>
                    ถัดไป <FiChevronRight />
                  </button>
                )}

                {submitted && index === SCENARIOS.length - 1 && (
                  <button className="edu-btn edu-btn--ghost" onClick={() => navigate("/unit3/learn")}>
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
