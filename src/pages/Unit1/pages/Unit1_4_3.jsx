// src/pages/Unit1/pages/Unit1_4_3.jsx

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FiCheckCircle,
  FiChevronRight,
  FiInfo,
  FiLock,
  FiShield,
  FiKey,
  FiAlertTriangle,
} from "react-icons/fi";

// ✅ ใช้ class จาก highlightTask.css (ของ Unit 1.3)


/**
 * ✅ Unit 1 - 4.3 (รวม 4.4 แล้ว) : คิด + เจ็บเบาๆ
 * - Step 1: เลือกประเภทบัญชี (Scenario)
 * - Step 2: เลือกวิธี MFA + Feedback (ทันที)
 * - Step 3: Quick decision (เลือก 1 ข้อ) -> บังคับให้ “คิด”
 * - Step 4: Simulation (กดครั้งเดียว วิ่งเอง) -> จบแล้วแสดง consequence (เจ็บเบาๆ)
 *
 * Props:
 * - onNext(): optional (ถ้าระบบคุณอยากไหลต่อ step อื่น)
 */
export default function Unit1_4_3({ onNext }) {
  // ✅ router
  const navigate = useNavigate();

  // ✅ Scenarios (ประเภทบัญชี)
  const SCENARIOS = useMemo(
    () => [
      {
        key: "social",
        title: "บัญชีโซเชียล",
        risk: "กลาง",
        detail:
          "เสี่ยงโดนยึดบัญชี/สวมรอยโพสต์หลอกเพื่อน หรือขโมยแชทและรูปส่วนตัว",
        recommended: ["authenticator", "prompt"],
        worstImpact: "ความเป็นส่วนตัว + ภาพลักษณ์เสียหาย",
      },
      {
        key: "email",
        title: "อีเมลหลัก",
        risk: "สูง",
        detail: "ใช้รีเซ็ตรหัสผ่านของหลายบริการ ถ้าโดนยึด = โดนลากทั้งระบบ",
        recommended: ["authenticator", "prompt"],
        worstImpact: "โดนรีเซ็ตรหัสผ่านต่อพ่วงหลายบัญชี",
      },
      {
        key: "finance",
        title: "การเงิน/ธนาคาร",
        risk: "สูงมาก",
        detail:
          "กระทบเงินจริงโดยตรง ต้องเน้นวิธีที่แข็งแรง + มีทางกู้คืนชัดเจน",
        recommended: ["authenticator", "prompt", "biometrics"],
        worstImpact: "เงินหาย/ธุรกรรมถูกสวมรอย",
      },
    ],
    []
  );

  // ✅ MFA methods (วิธี MFA)
  const METHODS = useMemo(
    () => [
      {
        key: "otp",
        label: "OTP (SMS/Email)",
        note: "สะดวก แต่แข็งแรงน้อยกว่า (เสี่ยงโดนดัก/ยึดเบอร์/ฟิชชิง)",
        weakPoint: "OTP อาจโดนดัก/ยึดซิม/หลอกเอาโค้ดได้",
      },
      {
        key: "authenticator",
        label: "Authenticator App",
        note: "แข็งแรงและนิยมสำหรับบัญชีเสี่ยงสูง ไม่พึ่ง SMS เป็นหลัก",
        weakPoint: "อย่าลืมทำ Backup Codes และกันมือถือหาย",
      },
      {
        key: "prompt",
        label: "Push Prompt",
        note: "สะดวกและค่อนข้างแข็งแรง (กดอนุมัติบนเครื่องที่ไว้ใจได้)",
        weakPoint: "ระวัง “กดอนุมัติแบบเผลอ” ถ้ามีแจ้งเตือนแปลกๆ",
      },
      {
        key: "biometrics",
        label: "Biometrics",
        note:
          "เร็วและปลอดภัยขึ้นเมื่อจับคู่กับอุปกรณ์/ระบบที่รองรับ (เหมาะกับการเงิน)",
        weakPoint: "ต้องมีวิธีกู้คืน/สำรองที่ชัดเจน",
      },
    ],
    []
  );

  // ✅ Simulation steps (แสดงเป็นรายการให้ดูเข้าใจง่าย)
  const SIM_STEPS = useMemo(
    () => [
      {
        key: "choose",
        title: "เลือกวิธี MFA",
        desc: "เลือกวิธีที่เหมาะกับบัญชีนี้เพื่อเริ่มตั้งค่า",
        icon: <FiShield aria-hidden="true" />,
      },
      {
        key: "verify",
        title: "ยืนยันตัวตน",
        desc: "ยืนยันว่าเป็นเจ้าของบัญชีจริง (รหัสผ่าน/แจ้งเตือน/โค้ด)",
        icon: <FiLock aria-hidden="true" />,
      },
      {
        key: "backup",
        title: "เก็บ Backup Codes / วิธีสำรอง",
        desc: "เก็บโค้ดสำรองในที่ปลอดภัย เผื่อเครื่องหาย/เปลี่ยนเครื่อง",
        icon: <FiKey aria-hidden="true" />,
      },
    ],
    []
  );

  // ✅ State: scenario/method
  const [scenarioKey, setScenarioKey] = useState("email");
  const [methodKey, setMethodKey] = useState("authenticator");

  // ✅ State: Quick decision (บังคับให้ “คิด” ก่อนเริ่ม)
  // - null = ยังไม่ตอบ
  // - "time" | "privacy" | "money" = ตัวเลือก
  const [impactChoice, setImpactChoice] = useState(null);

  // ✅ Simulation phase
  // - "idle" | "running" | "done"
  const [simPhase, setSimPhase] = useState("idle");
  const [simIndex, setSimIndex] = useState(0);

  // ✅ Derived: current scenario/method
  const scenario = useMemo(
    () => SCENARIOS.find((s) => s.key === scenarioKey) ?? SCENARIOS[0],
    [SCENARIOS, scenarioKey]
  );

  const method = useMemo(
    () => METHODS.find((m) => m.key === methodKey) ?? METHODS[0],
    [METHODS, methodKey]
  );

  // ✅ Recommended?
  const isRecommended = useMemo(
    () => scenario.recommended.includes(methodKey),
    [scenario.recommended, methodKey]
  );

  // ✅ Reset simulation when change scenario/method
  useEffect(() => {
    setSimPhase("idle");
    setSimIndex(0);
    setImpactChoice(null); // ✅ เปลี่ยนบริบท = ให้ตอบใหม่ (กันตอบค้างแล้วกดผ่าน)
  }, [scenarioKey, methodKey]);

  // ✅ Start simulation (กดครั้งเดียว)
  const startSimulation = () => {
    // ✅ กันกดซ้ำ
    if (simPhase === "running") return;

    // ✅ บังคับตอบ “Quick decision” ก่อนเริ่ม
    if (!impactChoice) return;

    setSimPhase("running");
    setSimIndex(0);
  };

  // ✅ Auto-run simulation
  useEffect(() => {
    if (simPhase !== "running") return;

    // ✅ วิ่งครบแล้ว -> done
    if (simIndex >= SIM_STEPS.length) {
      setSimPhase("done");
      return;
    }

    // ✅ หน่วงเวลาเลื่อนไป step ถัดไป
    const timer = setTimeout(() => {
      setSimIndex((prev) => prev + 1);
    }, 650);

    return () => clearTimeout(timer);
  }, [simPhase, simIndex, SIM_STEPS.length]);

  // ✅ Consequence (เจ็บเบาๆ) + วิธีแก้
  const consequence = useMemo(() => {
    // ✅ ถ้าเลือกถูกแนะนำ -> consequence เบาๆเชิงย้ำ
    if (isRecommended) {
      return {
        tone: "ok",
        title: "เลือกได้ดี — ลดความเสี่ยงได้จริง",
        lines: [
          `บัญชีนี้เสี่ยง: ${scenario.risk} → วิธีที่เลือก “${method.label}” เหมาะ`,
          `อย่าลืมทำ “Backup Codes” แล้วเก็บในที่ปลอดภัย (safe box/หลายล็อก)`,
        ],
        fix: [
          "เปิด MFA แล้วตรวจว่ามีวิธีสำรอง (Backup Codes/Recovery) ครบ",
          "ตั้งค่าการล็อกหน้าจอ + PIN/biometric บนอุปกรณ์หลัก",
        ],
      };
    }

    // ✅ ถ้าเลือกไม่แนะนำ -> consequence “เจ็บเบาๆ” ตาม scenario
    // ทำให้เด็กเห็นภาพว่า “พลาดแล้วเกิดอะไร”
    const base = {
      tone: "warn",
      title: "จำลองเหตุการณ์: เลือกได้ แต่มีจุดเสี่ยง",
      lines: [],
      fix: [],
    };

    // ✅ OTP กับบัญชีเสี่ยงสูง = ยกตัวอย่างชัดๆ
    if (methodKey === "otp") {
      if (scenarioKey === "finance") {
        base.lines = [
          "แฮกเกอร์ยึดเบอร์/สลับซิม → OTP ถูกดัก → ทำธุรกรรมแทนได้",
          "ผลลัพธ์: เงินอาจถูกโอนออก/ผูกบัญชีใหม่โดยที่คุณไม่ทันรู้ตัว",
        ];
        base.fix = [
          "เปลี่ยนเป็น Authenticator หรือ Push Prompt (ถ้ารองรับ)",
          "เปิดแจ้งเตือนธุรกรรม + ตั้งวงเงิน/จำกัดอุปกรณ์ที่ล็อกอินได้",
          "ทำ Backup Codes และเก็บในที่ปลอดภัย",
        ];
      } else if (scenarioKey === "email") {
        base.lines = [
          "โดนหลอกเอา OTP (phishing) หรือยึดเบอร์ → เข้ายึดอีเมลได้",
          "ผลลัพธ์: แฮกเกอร์รีเซ็ตรหัสผ่านบัญชีอื่นๆ ต่อพ่วงได้หลายบริการ",
        ];
        base.fix = [
          "เปลี่ยนเป็น Authenticator หรือ Push Prompt",
          "เช็ก Recovery email/เบอร์ ให้เป็นของคุณจริง",
          "เปิดแจ้งเตือนล็อกอินใหม่ทุกครั้ง",
        ];
      } else {
        base.lines = [
          "โดนหลอกเอา OTP → เข้ายึดโซเชียลได้",
          "ผลลัพธ์: สวมรอยโพสต์/แชทหลอกเพื่อน หรือขโมยรูปส่วนตัว",
        ];
        base.fix = [
          "เปลี่ยนเป็น Authenticator/Prompt เพื่อกันการดัก OTP",
          "เปิดแจ้งเตือนล็อกอินใหม่ + ตรวจอุปกรณ์ที่ล็อกอินค้าง",
        ];
      }

      return base;
    }

    // ✅ กรณีอื่นที่ไม่ได้อยู่ใน recommended (เช่น biometrics ใน email/social)
    base.lines = [
      `วิธี “${method.label}” ใช้ได้ แต่ไม่ใช่ตัวเลือกหลักสำหรับ ${scenario.title}`,
      `จุดเสี่ยง/ข้อควรระวัง: ${method.weakPoint}`,
    ];
    base.fix = [
      "ถ้าบัญชีนี้เสี่ยงสูง: เลือก Authenticator/Prompt เป็นหลัก",
      "อย่าลืมทำ Backup Codes และเก็บในที่ปลอดภัย",
    ];
    return base;
  }, [isRecommended, method.label, method.weakPoint, methodKey, scenario.title, scenario.risk, scenarioKey]);

  // ✅ Quick decision options (ตอบได้โดยไม่พิมพ์)
  // จงใจให้เป็น “คำตอบที่ดูง่าย” แล้วใช้ feedback ทำให้เด็กจับหลัก
  const IMPACT_OPTIONS = useMemo(
    () => [
      { key: "time", label: "เสียเวลา/รำคาญนิดหน่อย" },
      { key: "privacy", label: "เสียความเป็นส่วนตัว/โดนสวมรอย" },
      { key: "money", label: "เสียเงินจริง/โดนลากหลายบัญชี" },
    ],
    []
  );

  // ✅ ตรวจ “คำตอบที่เหมาะ” แบบง่ายๆ (ไม่ซีเรียส แต่ทำให้เด็กคิด)
  const impactExpected = useMemo(() => {
    if (scenarioKey === "finance") return "money";
    if (scenarioKey === "email") return "money";
    return "privacy";
  }, [scenarioKey]);

  const impactIsGood = useMemo(() => {
    if (!impactChoice) return false;
    // ✅ ตั้งใจให้เป็น soft-check: ถูก/ใกล้เคียง
    // - finance/email -> money
    // - social -> privacy
    return impactChoice === impactExpected;
  }, [impactChoice, impactExpected]);

  // ✅ ไปเรียนต่อ
  const goToLearn = () => {
    onNext?.();
    navigate("/unit1/learn");
  };

  return (
    <div className="u13">
      <div className="u13-panel">
        {/* ✅ Top hint */}
        <div className="u13-topline">
          <FiInfo aria-hidden="true" style={{ marginRight: 6 }} />
          เลือก MFA ให้เหมาะ + จำลองเปิดใช้งาน (มี “คิด” + “เจ็บเบาๆ”)
        </div>

        {/* ✅ Layout ซ้าย/ขวา แบบ Unit 1.3 */}
        <div className="u13-layout">
          {/* =========================
              LEFT: ScenarioGallery (เลือกบัญชี)
          ========================= */}
          <div className="u13-shell">
            <div className="u13-gallery">
              <div className="u13-header">
                <h3 className="u13-title">Step 1: เลือกประเภทบัญชี</h3>
                <p className="u13-desc">
                  เลือก “บัญชี” ก่อน แล้วค่อยเลือก “วิธี MFA” ให้เหมาะกับความเสี่ยง
                </p>
              </div>

              <div className="u13-grid">
                {SCENARIOS.map((s) => {
                  const active = scenarioKey === s.key;

                  return (
                    <button
                      key={s.key}
                      type="button"
                      className={`u13-card ${active ? "is-active" : ""}`}
                      onClick={() => setScenarioKey(s.key)}
                      title={s.title}
                    >
                      <div className="u13-card-row">
                        <div className="u13-iconbox">
                          <FiShield aria-hidden="true" />
                        </div>

                        <div style={{ flex: 1 }}>
                          <div className="u13-card-top">
                            <div className="u13-card-title">{s.title}</div>
                            {active ? (
                              <span className="u13-done">
                                <FiCheckCircle aria-hidden="true" /> เลือกแล้ว
                              </span>
                            ) : null}
                          </div>

                          <div className="u13-card-sub">
                            <b>เสี่ยง:</b> {s.risk}
                            <br />
                            {s.detail}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="u13-note">
              <b>ทริค:</b> บัญชีเสี่ยงสูง = “กุญแจหลายดอก” + ต้องมี “กุญแจสำรอง”
              (Backup Codes)
            </div>
          </div>

          {/* =========================
              RIGHT: Details + Task
          ========================= */}
          <div className="u13-rightCard">
            
            <div className="u13-head">
              <div className="u13-head__title">Step 2: เลือกวิธี MFA</div>
              <div className="u13-head__sub">
                บัญชี: <b>{scenario.title}</b> | ระดับเสี่ยง: <b>{scenario.risk}</b>
              </div>
            </div>


            <div className="u13-body">
              {/* ✅ Methods */}
              <div className="u13-hint">
                เลือกวิธีที่อยากใช้
              </div>

              <div className="u13-actions">
                {METHODS.map((m) => {
                  const active = methodKey === m.key;
                  const recommended = scenario.recommended.includes(m.key);

                  return (
                    <button
                      key={m.key}
                      type="button"
                      className={`u13-token ${active ? "is-selected" : ""}`}
                      onClick={() => setMethodKey(m.key)}
                      aria-pressed={active}
                      title={m.label}
                    >
                      {m.label} {recommended ? "" : ""}
                    </button>
                  );
                })}
              </div>

            


              {/* =========================
                  Step 3: Quick decision (คิด)
              ========================= */}
              <div style={{ marginTop: 14 }}>
                <div className="u13-head">
              <div className="u13-head__title">Step 3: คิดก่อนกด (เลือก 1 ข้อ)</div>
              <div className="u13-head__sub">
                ถ้าบัญชีนี้โดนยึด “ผลกระทบที่แย่สุด” คืออะไร?
              </div>
            </div>

                <div className="u13-actions">
                  {IMPACT_OPTIONS.map((opt) => {
                    const active = impactChoice === opt.key;

                    return (
                      <button
                        key={opt.key}
                        type="button"
                        className={`u13-token ${active ? "is-selected" : ""}`}
                        onClick={() => setImpactChoice(opt.key)}
                        aria-pressed={active}
                        title={opt.label}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>


              </div>

              {/* =========================
                  Step 4: Simulation (กดครั้งเดียว วิ่งเอง)
              ========================= */}
              <div style={{ marginTop: 14 }}>
                <div className="u13-head">
              <div className="u13-head__title">Step 4: Simulation เปิดใช้งาน MFA</div>
              <div className="u13-head__sub">
                กดครั้งเดียว ระบบจะไล่ขั้นตอนให้ดู แล้วจบพร้อม “ผลลัพธ์จำลอง”
              </div>
            </div>

                {/* ✅ รายการขั้นตอน */}
                <div style={{ marginTop: 8 }}>
                  {SIM_STEPS.map((st, idx) => {
                    const done =
                      simPhase === "done" || (simPhase === "running" && idx < simIndex);
                    const active = simPhase === "running" && idx === simIndex;

                    return (
                      <div
                        key={st.key}
                        className="u13-feedback"
                        style={{
                          marginTop: 10,
                          opacity: done || active || simPhase === "idle" ? 1 : 0.65,
                        }}
                      >
                        <div className="u13-feedback__row">
                          <div className="u13-feedback__icon">
                            {done ? (
                              <FiCheckCircle aria-hidden="true" />
                            ) : (
                              st.icon
                            )}
                          </div>

                          <div style={{ flex: 1 }}>
                            <div className="u13-feedback__title">
                              {idx + 1}. {st.title}{" "}
                              {active ? (
                                <span style={{ opacity: 0.75 }}> (กำลังทำ...)</span>
                              ) : null}
                            </div>
                            <div className="u13-feedback__meta">{st.desc}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ✅ ปุ่มควบคุม */}
                <div className="u13-actions" style={{ marginTop: 12 }}>
                  {simPhase === "idle" && (
                    <button
                      className="edu-btn edu-btn--next"
                      type="button"
                      onClick={startSimulation}
                      disabled={!impactChoice}
                      title={
                        impactChoice
                          ? "เริ่ม Simulation"
                          : "ต้องตอบคำถาม Step 3 ก่อน"
                      }
                    >
                      เริ่ม Simulation <FiChevronRight aria-hidden="true" />
                    </button>
                  )}

                  {simPhase === "running" && (
                    <button className="edu-btn edu-btn--next" type="button" disabled>
                      กำลังจำลอง... <FiChevronRight aria-hidden="true" />
                    </button>
                  )}
                </div>

                {/* ✅ Done + Consequence (เจ็บเบาๆ) */}
                {simPhase === "done" ? (
                  <div className={`u13-feedback ${consequence.tone}`} style={{ marginTop: 12 }}>
                    <div className="u13-feedback__row">
                      <div className="u13-feedback__icon">
                        {consequence.tone === "ok" ? (
                          <FiCheckCircle aria-hidden="true" />
                        ) : (
                          <FiAlertTriangle aria-hidden="true" />
                        )}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div className="u13-feedback__title">{consequence.title}</div>
                        <div className="u13-feedback__lists">
                          <div>
                            <div className="u13-feedback__label">ผลลัพธ์จำลอง</div>
                            <div className="u13-feedback__text pre">
                              {consequence.lines.map((x, i) => `• ${x}`).join("\n")}
                            </div>
                          </div>

                          <div>
                            <div className="u13-feedback__label">วิธีแก้/กันพลาดรอบหน้า</div>
                            <div className="u13-feedback__text pre">
                              {consequence.fix.map((x, i) => `• ${x}`).join("\n")}
                            </div>
                          </div>
                        </div>

                        <div className="u13-next">
                          <button
                            className="edu-btn edu-btn--ghost"
                            type="button"
                            onClick={goToLearn}
                            title="กลับไปเรียนต่อ"
                            style={{ marginTop: 12 }}
                          >
                            เสร็จสิ้น <FiChevronRight aria-hidden="true" />
                          </button>
                        </div>

                        <div className="u13-note">
                          <b>จำสั้นๆ:</b> บัญชีเสี่ยงสูง = เลือกวิธีแข็งแรง + ทำ Backup
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
