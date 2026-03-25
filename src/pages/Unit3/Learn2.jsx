// src/pages/Unit3/Learn2.jsx
// ✅ Unit 3 - เรื่องที่ 2: การรับรู้ภาพลักษณ์จากบริบทและผู้ชม
// รูปแบบการเรียน: Scenario-based Learning + Interactive Concept Checking + Immediate Feedback Learning
//
// ✅ โครงหน้า: ให้เหมือน Unit2 (topbar/hero/panel) และใช้ CSS เดิมของโปรเจกต์

import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

import logo from "../../assets/logo.png";

// ✅ CSS เดิม (จัดวางเหมือนเดิม)
import "../../main.css";
import "../Unit1/learn.css"; // ถ้าโปรเจกต์คุณใช้ learn.css ของ Unit1/2 อยู่แล้ว

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
/* ✅ SCENARIO GALLERY (โพสต์เดียวกัน แต่บริบท/ผู้ชมเปลี่ยนผล)          */
/* ------------------------------------------------------------------ */
const SCENARIOS = [
  {
    id: "s1",
    title: "โพสต์บ่นครู/ด่าแรงในสตอรี่",
    subtitle: "ข้อความแรง + อารมณ์ล้วน ๆ",
    post:
      "วันนี้โคตรเซ็ง ครูบางคนก็... (ใช้คำหยาบ/ดูถูก) ไม่อยากเรียนแล้วอะ",
    contextHints: {
      time: "ช่วงเปิดเทอม",
      place: "IG Story",
      privacy: "สาธารณะ/เพื่อนเห็นต่อได้",
    },
    // ✅ คำตอบที่ “เหมาะสม” ในมุมความเสี่ยงภาพลักษณ์
    expected: {
      audience: "EMPLOYER",
      factors: ["CONTEXT", "TIME", "SPACE"],
      impact: "HIGH",
    },
    feedback: {
      correct:
        "ใช่เลย ✅ มุม “นายจ้าง/องค์กร” มักตีความเรื่องวินัย อารมณ์ การสื่อสาร และความเป็นมืออาชีพได้แรงกว่าที่เราคิด โดยเฉพาะถ้าเป็นสาธารณะ + ช่วงเวลาใกล้สมัครงาน",
      explainAudience:
        "เพื่อนอาจมองว่าแค่ระบาย แต่ครู/นายจ้าง/คนทั่วไปอาจมองว่าไม่เคารพผู้อื่น ควบคุมอารมณ์ไม่ได้ หรือสร้างปัญหาในที่ทำงาน",
      explainFactors:
        "ปัจจัยที่ทำให้แรงขึ้น: (1) บริบทคำพูดและถ้อยคำ (2) เวลาใกล้สอบ/สมัครงาน (3) พื้นที่เผยแพร่กว้าง — แคป/แชร์ต่อได้",
    },
  },
  {
    id: "s2",
    title: "โพสต์รูปปาร์ตี้/เครื่องดื่มลงหน้าโปรไฟล์",
    subtitle: "รูปสนุกกับเพื่อน แต่ติดภาพเครื่องดื่ม",
    post:
      "เมื่อคืนสุดจัด! 🎉🍻 (แท็กโลเคชัน/แฮชแท็ก) สนุกมากกก",
    contextHints: {
      time: "คืนวันเสาร์",
      place: "โปรไฟล์สาธารณะ",
      privacy: "Public",
    },
    expected: {
      audience: "TEACHER",
      factors: ["SPACE", "CONTEXT"],
      impact: "MEDIUM",
    },
    feedback: {
      correct:
        "ถูกต้อง ✅ มุม “ครู/ผู้ใหญ่ในโรงเรียน” อาจมองเรื่องความเหมาะสม/กฎระเบียบ และเพราะโพสต์อยู่ในพื้นที่ public จึงมีโอกาสถูกตีความผิดหรือถูกแชร์ต่อ",
      explainAudience:
        "เพื่อนอาจมองว่าสนุกปกติ แต่ครู/ผู้ปกครองอาจมองว่าไม่เหมาะกับวัย/ภาพลักษณ์นักเรียน โดยเฉพาะถ้าตั้งเป็นสาธารณะ",
      explainFactors:
        "ปัจจัยหลัก: (1) พื้นที่เผยแพร่ public (คนเห็นหลากหลาย) (2) บริบทภาพ (มีเครื่องดื่ม/แท็กโลเคชันชัด)",
    },
  },
  {
    id: "s3",
    title: "แชร์มีมล้อเลียนคนอื่นในกลุ่ม",
    subtitle: "ตั้งใจขำ แต่เสี่ยงดราม่า",
    post:
      "มีมนี้เหมือนคนนั้นเลย 555 (แท็กชื่อ/พาดพิงคนอื่น)",
    contextHints: {
      time: "ระหว่างพักเที่ยง",
      place: "กลุ่มแชท/กลุ่มเพื่อน",
      privacy: "Group (แต่ส่งต่อได้)",
    },
    expected: {
      audience: "PUBLIC",
      factors: ["CONTEXT", "SPACE"],
      impact: "MEDIUM",
    },
    feedback: {
      correct:
        "ใช่ ✅ แม้อยู่ในกลุ่ม แต่ “ส่งต่อ/แคป” ได้ และบริบทเป็นการพาดพิงคนอื่น ทำให้เสี่ยงต่อภาพลักษณ์เรื่องการเคารพผู้อื่น/การกลั่นแกล้ง",
      explainAudience:
        "เพื่อนบางคนอาจขำ แต่คนทั่วไป/คนที่ถูกพาดพิงอาจมองว่าเป็นการบูลลี่ ทำให้เกิดดราม่าหรือเสียความสัมพันธ์",
      explainFactors:
        "ปัจจัยหลัก: (1) บริบทพาดพิงคนอื่น (2) พื้นที่กลุ่มที่ส่งต่อได้ ทำให้ผลกระทบขยายวง",
    },
  },
];

/* ------------------------------------------------------------------ */
/* ✅ ตัวเลือกการ “เช็คคอนเซ็ปต์”                                     */
/* ------------------------------------------------------------------ */
const AUDIENCES = [
  { id: "FRIEND", label: "เพื่อน" },
  { id: "TEACHER", label: "ครู/ผู้ใหญ่ในโรงเรียน" },
  { id: "EMPLOYER", label: "นายจ้าง/องค์กร" },
  { id: "PUBLIC", label: "บุคคลทั่วไป" },
];

const FACTORS = [
  { id: "CONTEXT", label: "บริบท/ถ้อยคำ/ภาพรวมโพสต์" },
  { id: "TIME", label: "เวลา (ช่วงเรียน/สอบ/สมัครงาน)" },
  { id: "SPACE", label: "พื้นที่เผยแพร่ (Public/Group/Private)" },
];

const IMPACTS = [
  { id: "LOW", label: "ต่ำ" },
  { id: "MEDIUM", label: "ปานกลาง" },
  { id: "HIGH", label: "สูง" },
];

export default function Learn2Unit3() {
  // ✅ Router helpers
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ อ่าน mode เผื่อระบบใช้ต่อ (เหมือน Unit2)
  const mode = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    return sp.get("mode") || "all";
  }, [location.search]);

  // ✅ User/Profile state
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("ผู้เรียน");

  // ✅ Step flow
  // - "intro"    : อธิบายสั้น ๆ + กรอบคิด
  // - "scenario" : เลือกสถานการณ์
  // - "check"    : ทำ concept checking + feedback
  const [step, setStep] = useState("intro");

  // ✅ Scenario state
  const [selectedScenarioId, setSelectedScenarioId] = useState(SCENARIOS[0]?.id);
  const selectedScenario = useMemo(
    () => SCENARIOS.find((s) => s.id === selectedScenarioId) || SCENARIOS[0],
    [selectedScenarioId]
  );

  // ✅ Answers state
  const [pickedAudience, setPickedAudience] = useState("");
  const [pickedFactors, setPickedFactors] = useState([]); // multi-select
  const [pickedImpact, setPickedImpact] = useState("");

  // ✅ Submit state
  const [submitted, setSubmitted] = useState(false);

  // ✅ Helper: toggle multi-select factor
  const toggleFactor = (id) => {
    setPickedFactors((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      return [...prev, id];
    });

    // ✅ ถ้าเคย submit แล้ว เปลี่ยนคำตอบ -> ต้องกดตรวจใหม่
    if (submitted) setSubmitted(false);
  };

  // ✅ Reset เมื่อเปลี่ยน scenario
  useEffect(() => {
    setPickedAudience("");
    setPickedFactors([]);
    setPickedImpact("");
    setSubmitted(false);
  }, [selectedScenarioId]);

  // ✅ Load profile (เหมือน Unit2)
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);

        // 1) session
        const { data } = await supabase.auth.getSession();
        const u = data.session?.user;
        if (!u) {
          navigate("/login", { replace: true });
          return;
        }

        // 2) profile
        const { data: profile } = await supabase
          .from("student_profiles")
          .select("first_name,last_name")
          .eq("user_id", u.id)
          .maybeSingle();

        if (!alive) return;

        const full = `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim();
        setStudentName(full || "ผู้เรียน");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [navigate]);

  // ✅ Title บน panel ให้เปลี่ยนตาม step
  const panelTitle = useMemo(() => {
    if (step === "intro") return "โพสต์เดียวกัน คนละผู้ชมตีความไม่เหมือนกัน";
    if (step === "scenario") return "เลือกสถานการณ์";
    return "Interactive Concept Checking";
  }, [step]);

  // ✅ ตรวจครบหรือยัง
  const readyToCheck = useMemo(() => {
    return Boolean(pickedAudience && pickedImpact && pickedFactors.length > 0);
  }, [pickedAudience, pickedImpact, pickedFactors]);

  // ✅ ตรวจคำตอบ (Immediate feedback)
  const result = useMemo(() => {
    if (!submitted) return null;

    const expected = selectedScenario?.expected;
    if (!expected) return { ok: false, reason: "ไม่พบเฉลยของสถานการณ์" };

    // audience ต้องตรง
    const okAudience = pickedAudience === expected.audience;

    // impact ต้องตรง
    const okImpact = pickedImpact === expected.impact;

    // factors: ต้องมีครบตาม expected (อนุญาตให้เลือกเกินได้ แต่ต้องครอบคลุม)
    const expectedSet = new Set(expected.factors);
    const pickedSet = new Set(pickedFactors);
    let okFactors = true;
    for (const f of expectedSet) {
      if (!pickedSet.has(f)) okFactors = false;
    }

    const ok = okAudience && okImpact && okFactors;

    return {
      ok,
      okAudience,
      okImpact,
      okFactors,
    };
  }, [submitted, selectedScenario, pickedAudience, pickedImpact, pickedFactors]);

  // ✅ กดตรวจคำตอบ
  const submitCheck = () => {
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ ไปเรื่องถัดไป / หรือกลับหน้า Learn ของ Unit3 (ตามที่คุณต้องการ)
  const goFinish = () => {
    navigate("/unit3/learn", { replace: true, state: { from: "unit3-learn2", mode } });
  };

  // ✅ UI helper style แบบ “ไม่ชน CSS เดิม” (ใช้ inline นิดเดียวสำหรับกิจกรรม)
  const boxStyle = {
    borderRadius: 16,
    border: "1px solid rgba(0,0,0,0.08)",
    background: "rgba(255,255,255,0.55)",
    padding: 14,
  };

  const pillBtn = (active) => ({
    borderRadius: 999,
    border: active ? "1px solid rgba(59,130,246,0.45)" : "1px solid rgba(0,0,0,0.10)",
    background: active ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.70)",
    padding: "8px 12px",
    fontSize: 13,
    fontWeight: 900,
    cursor: "pointer",
  });

  const miniLabel = {
    fontSize: 12,
    opacity: 0.8,
    marginTop: 6,
    lineHeight: 1.6,
  };

  return (
    <div className="edu-app">
      {/* ✅ TOPBAR (เหมือนเดิม) */}
      <header className="edu-topbar">
        <div className="edu-topbar__inner">
          {/* ✅ Brand */}
          <div className="homebar__brand" role="banner">
            <img src={logo} alt="LearnSecure logo" className="homebar__logo" />
            <div className="edu-brandtext">
              <div className="edu-brandtext__title">LearnSecure</div>
              <div className="edu-brandtext__subtitle">Unit 3</div>
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
              <FiLogOut aria-hidden="true" /> ออกจากระบบ
            </button>
          </div>
        </div>
      </header>

      <main className="edu-layout">
        {/* ✅ HERO (เหมือนเดิม) */}
        <section className="edu-hero" aria-label="Unit 3 header">
          <div className="edu-hero__card">
            <div className="edu-hero__row">
              <div className="edu-hero__headline">
                <div className="edu-hero__title">
                  Unit 3: การจัดการรอยเท้าดิจิทัลและตัวตนออนไลน์
                </div>
                <div className="edu-hero__sub">เรื่องที่ 2	การรับรู้ภาพลักษณ์จากบริบทและผู้ชม
</div>

                <div className="edu-lessons__toolbar">
                  <button
                    className="edu-btn edu-btn--back"
                    type="button"
                    onClick={() => {
                      // ✅ กลับแบบ step-by-step
                      if (step === "check") {
                        setStep("scenario");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        return;
                      }
                      if (step === "scenario") {
                        setStep("intro");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        return;
                      }
                      navigate(-1);
                    }}
                  >
                    <FiChevronLeft aria-hidden="true" /> กลับ
                  </button>

                  <button
                    className="edu-btn edu-btn--ghost"
                    type="button"
                    onClick={() => navigate("/main")}
                    style={{ marginLeft: 8 }}
                  >
                    <FiHome aria-hidden="true" /> กลับหน้าหลัก
                  </button>
                </div>
              </div>

              <div className="edu-lessons__meta">{/* เว้นไว้ */}</div>
            </div>
          </div>
        </section>

        {/* ✅ CONTENT PANEL (เหมือนเดิม) */}
        <section className="edu-panel1">
          <div className="edu-panel1__head">
            <div className="edu-panel1__title">
              <FiFileText aria-hidden="true" />
              {panelTitle}
            </div>
          </div>

          {/* ========================================================= */}
          {/* ✅ STEP 1: INTRO                                           */}
          {/* ========================================================= */}
          {step === "intro" && (
            <div style={{ padding: 16 }}>
              <div style={boxStyle}>
                <div style={{ fontSize: 18, fontWeight: 950, marginBottom: 8 }}>
                  โพสต์เดียวกัน “แต่คนละผู้ชม” ผลที่เกิดขึ้นไม่เท่ากัน
                </div>

                <div style={{ fontSize: 13, opacity: 0.9, lineHeight: 1.75 }}>
                  เวลาคุณโพสต์ เราไม่ได้คุมได้ว่า “ใครเห็น” และ “เขาตีความยังไง”
                  เพราะแต่ละคนมีบทบาท/ความคาดหวังต่างกัน เช่น เพื่อน ครู นายจ้าง หรือคนทั่วไป
                </div>

                <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                  <div>
                    <div style={{ fontWeight: 950 }}>3 ปัจจัยที่ทำให้การตีความเปลี่ยน</div>
                    <div style={miniLabel}>
                      1) <b>บริบท</b> (คำพูด/รูป/น้ำเสียง/พาดพิงคนอื่น) <br />
                      2) <b>เวลา</b> (ช่วงสอบ/ช่วงสมัครงาน/เวลาที่คนอ่อนไหว) <br />
                      3) <b>พื้นที่เผยแพร่</b> (Public/Group/Private — แคป/แชร์ต่อได้แค่ไหน)
                    </div>
                  </div>

                  <div
                    style={{
                      padding: 12,
                      borderRadius: 14,
                      border: "1px solid rgba(16,185,129,0.22)",
                      background: "rgba(16,185,129,0.10)",
                    }}
                  >
                    <div style={{ fontWeight: 950 }}>กรอบคิดจำง่าย</div>
                    <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>
                      ก่อนโพสต์ให้ถามตัวเอง: <b>“ใครเห็น?”</b> + <b>“เขาอาจคิดอะไร?”</b> +{" "}
                      <b>“ผลกระทบจะสั้นหรือยาว?”</b>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    className="edu-btn edu-btn--primary"
                    type="button"
                    onClick={() => {
                      setStep("scenario");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    ไปเลือกสถานการณ์ <FiChevronRight aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* ✅ STEP 2: SCENARIO GALLERY                                 */}
          {/* ========================================================= */}
          {step === "scenario" && (
            <div style={{ padding: 16 }}>
              <div style={boxStyle}>
                <div style={{ display: "grid", gap: 12 }}>
                  <div style={{ fontSize: 13, opacity: 0.9, lineHeight: 1.7 }}>
                    เลือก 1 สถานการณ์ แล้วลองคิดว่า “ผู้ชมคนไหน” จะตีความแรงที่สุด
                    และปัจจัยอะไรที่ทำให้ภาพลักษณ์กระทบมากขึ้น
                  </div>

                  <div style={{ display: "grid", gap: 10 }}>
                    {SCENARIOS.map((s) => {
                      const active = s.id === selectedScenarioId;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setSelectedScenarioId(s.id)}
                          style={{
                            textAlign: "left",
                            borderRadius: 14,
                            border: active
                              ? "1px solid rgba(16,185,129,0.35)"
                              : "1px solid rgba(0,0,0,0.08)",
                            background: active ? "rgba(16,185,129,0.10)" : "rgba(255,255,255,0.55)",
                            padding: 12,
                            cursor: "pointer",
                          }}
                        >
                          <div style={{ fontWeight: 950 }}>{s.title}</div>
                          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
                            {s.subtitle}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* ✅ Preview */}
                  <div
                    style={{
                      padding: 12,
                      borderRadius: 14,
                      border: "1px solid rgba(0,0,0,0.08)",
                      background: "rgba(255,255,255,0.55)",
                    }}
                  >
                    <div style={{ fontWeight: 950, marginBottom: 6 }}>ตัวอย่างโพสต์</div>
                    <div style={{ fontSize: 13, lineHeight: 1.7 }}>{selectedScenario.post}</div>

                    <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ ...pillBtn(true), cursor: "default" }}>
                        เวลา: {selectedScenario.contextHints.time}
                      </span>
                      <span style={{ ...pillBtn(true), cursor: "default" }}>
                        พื้นที่: {selectedScenario.contextHints.place}
                      </span>
                      <span style={{ ...pillBtn(true), cursor: "default" }}>
                        ความเป็นส่วนตัว: {selectedScenario.contextHints.privacy}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <button
                      className="edu-btn edu-btn--back"
                      type="button"
                      onClick={() => {
                        setStep("intro");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      <FiChevronLeft aria-hidden="true" /> กลับไปดูบทนำ
                    </button>

                    <button
                      className="edu-btn edu-btn--primary"
                      type="button"
                      onClick={() => {
                        setStep("check");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      ไปทำกิจกรรม <FiChevronRight aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* ✅ STEP 3: INTERACTIVE CONCEPT CHECKING + FEEDBACK          */}
          {/* ========================================================= */}
          {step === "check" && (
            <div style={{ padding: 16 }}>
              <div style={boxStyle}>
                <div style={{ display: "grid", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 950 }}>
                      เลือก “ผู้ชม” + “ปัจจัย” + “ระดับผลกระทบ”
                    </div>
                    <div style={{ fontSize: 13, opacity: 0.85, marginTop: 6, lineHeight: 1.7 }}>
                      เป้าหมายคือฝึกมองมุมคนอื่น: ใครเห็นโพสต์นี้แล้ว “ตีความหนักสุด”
                      และเพราะอะไร (บริบท/เวลา/พื้นที่เผยแพร่)
                    </div>
                  </div>

                  {/* ✅ Scenario box */}
                  <div
                    style={{
                      padding: 12,
                      borderRadius: 14,
                      border: "1px solid rgba(0,0,0,0.08)",
                      background: "rgba(255,255,255,0.55)",
                    }}
                  >
                    <div style={{ fontWeight: 950 }}>{selectedScenario.title}</div>
                    <div style={{ fontSize: 13, marginTop: 6, lineHeight: 1.7 }}>
                      {selectedScenario.post}
                    </div>
                    <div style={{ marginTop: 10, fontSize: 12, opacity: 0.85 }}>
                      บริบท: {selectedScenario.contextHints.time} • {selectedScenario.contextHints.place} •{" "}
                      {selectedScenario.contextHints.privacy}
                    </div>
                  </div>

                  {/* ✅ 1) Audience */}
                  <div>
                    <div style={{ fontWeight: 950 }}>1) ผู้ชมคนไหน “ตีความแรงสุด”?</div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
                      {AUDIENCES.map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => {
                            setPickedAudience(a.id);
                            if (submitted) setSubmitted(false);
                          }}
                          style={pillBtn(pickedAudience === a.id)}
                          aria-pressed={pickedAudience === a.id}
                        >
                          {a.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ✅ 2) Factors */}
                  <div>
                    <div style={{ fontWeight: 950 }}>2) ปัจจัยไหนทำให้การตีความ “แรงขึ้น” ? (เลือกได้หลายข้อ)</div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
                      {FACTORS.map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => toggleFactor(f.id)}
                          style={pillBtn(pickedFactors.includes(f.id))}
                          aria-pressed={pickedFactors.includes(f.id)}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ✅ 3) Impact */}
                  <div>
                    <div style={{ fontWeight: 950 }}>3) ผลกระทบต่อภาพลักษณ์โดยรวม</div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
                      {IMPACTS.map((i) => (
                        <button
                          key={i.id}
                          type="button"
                          onClick={() => {
                            setPickedImpact(i.id);
                            if (submitted) setSubmitted(false);
                          }}
                          style={pillBtn(pickedImpact === i.id)}
                          aria-pressed={pickedImpact === i.id}
                        >
                          {i.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ✅ Feedback (Immediate) */}
                  {submitted && result && (
                    <div style={{ marginTop: 4 }}>
                      {result.ok ? (
                        <div
                          style={{
                            display: "flex",
                            gap: 10,
                            alignItems: "flex-start",
                            padding: 12,
                            borderRadius: 14,
                            border: "1px solid rgba(16,185,129,0.25)",
                            background: "rgba(16,185,129,0.10)",
                          }}
                        >
                          <FiCheckCircle aria-hidden="true" />
                          <div>
                            <div style={{ fontWeight: 950 }}>ถูกต้อง ✅</div>
                            <div style={{ fontSize: 13, opacity: 0.9, marginTop: 6, lineHeight: 1.7 }}>
                              {selectedScenario.feedback.correct}
                            </div>
                            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 8, lineHeight: 1.7 }}>
                              <b>ทำไมผู้ชมนี้ถึงสำคัญ:</b> {selectedScenario.feedback.explainAudience}
                            </div>
                            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 8, lineHeight: 1.7 }}>
                              <b>ปัจจัยที่ทำให้แรงขึ้น:</b> {selectedScenario.feedback.explainFactors}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            gap: 10,
                            alignItems: "flex-start",
                            padding: 12,
                            borderRadius: 14,
                            border: "1px solid rgba(245,158,11,0.25)",
                            background: "rgba(245,158,11,0.10)",
                          }}
                        >
                          <FiAlertTriangle aria-hidden="true" />
                          <div>
                            <div style={{ fontWeight: 950 }}>ยังไม่ตรง ❌ ลองดู hint แล้วปรับคำตอบได้</div>

                            <div style={{ fontSize: 13, opacity: 0.9, marginTop: 6, lineHeight: 1.7 }}>
                              Hint: โพสต์เดียวกัน “ผลแรงสุด” มักเกิดเมื่อผู้ชมมีความคาดหวังสูง
                              (เช่น ครู/นายจ้าง) และโพสต์อยู่ในพื้นที่ที่คนเห็นได้กว้างหรือถูกส่งต่อได้ง่าย
                            </div>

                            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 8, lineHeight: 1.7 }}>
                              <b>แนวคิดสำคัญ:</b> เลือก “ผู้ชม” ก่อน แล้วค่อยดูว่า
                              ปัจจัย (บริบท/เวลา/พื้นที่) อะไรทำให้การตีความแรงขึ้น
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ✅ Footer actions */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                      marginTop: 6,
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      className="edu-btn edu-btn--back"
                      type="button"
                      onClick={() => {
                        setStep("scenario");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      <FiChevronLeft aria-hidden="true" /> กลับไปเลือกสถานการณ์
                    </button>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <button
                        className="edu-btn edu-btn--primary"
                        type="button"
                        onClick={submitCheck}
                        disabled={!readyToCheck}
                        title={!readyToCheck ? "เลือกให้ครบ: ผู้ชม + ปัจจัย + ระดับผลกระทบ" : "ตรวจคำตอบเพื่อดู feedback"}
                      >
                        ตรวจคำตอบ <FiChevronRight aria-hidden="true" />
                      </button>

                      {/* ✅ ให้ไปต่อได้เมื่อ submit แล้ว (ตามที่คุณต้องการ) */}
                      {submitted && (
                        <button
                          className="edu-btn edu-btn--ghost"
                          type="button"
                          onClick={goFinish}
                          title="กลับหน้า Learn ของ Unit 3"
                        >
                          เสร็จสิ้น <FiChevronRight aria-hidden="true" />
                        </button>
                      )}
                    </div>
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
