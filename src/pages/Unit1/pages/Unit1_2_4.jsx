// src/pages/Unit1/pages/Unit1_2_4.jsx
import { useMemo, useState } from "react";

/* ✅ Icons */
import {
  FiCheckCircle,
  FiAlertTriangle,
  FiChevronRight,
  FiRefreshCw,
  FiGlobe,
  FiUsers,
  FiLock,
  FiFileText,
} from "react-icons/fi";

/**
 * ✅ Unit 1.2.4 — Scenario decision (No typing reason)
 * แนวคิด:
 * - ผู้เรียน "เลือก" ระดับการเข้าถึง Public/Group/Private
 * - ระบบให้ feedback แบบสอน (ทำไม/ความเสี่ยง/วิธีทำให้ปลอดภัย)
 *
 * Props:
 * - onNext(): เรียกเมื่อทำครบและกด "ไปบทถัดไป"
 * - initialProgress (optional)
 * - onComplete(result) (optional): ให้ Learn2 เซฟ progress ได้
 */
export default function Unit1_2_4({ onNext, initialProgress, onComplete }) {
  /* ✅ ตัวเลือกการเข้าถึง */
  const ACCESS_OPTIONS = useMemo(
    () => [
      { value: "public", label: "Public (สาธารณะ)", icon: <FiGlobe aria-hidden="true" /> },
      { value: "group", label: "Group (จำกัดเฉพาะกลุ่ม)", icon: <FiUsers aria-hidden="true" /> },
      { value: "private", label: "Private (ส่วนบุคคล)", icon: <FiLock aria-hidden="true" /> },
    ],
    []
  );

  /**
   * ✅ 3 สถานการณ์ (ปรับเปลี่ยนได้ภายหลัง)
   * - เราทำให้ feedback “เยอะและสอน” ตามที่คุณต้องการ
   */
  const SCENARIOS_24 = useMemo(
    () => [
      {
        id: "s1",
        title: "เช็คอินหน้าร้าน เห็นป้ายทะเบียนชัด",
        subtitle: "กำลังจะโพสต์ลง IG / Facebook",
        scenarioText:
          "คุณถ่ายรูปเช็คอินหน้าร้าน แล้วเห็นป้ายทะเบียนรถชัดเจน พร้อมสถานที่และเวลาโพสต์",
        correctAccess: "private",
        teach: {
          why: "ป้ายทะเบียน + สถานที่/เวลา สามารถโยงกลับไปหาคนจริงได้ เสี่ยงถูกติดตามหรือคุกคาม",
          risks: ["ระบุตัวตนได้จากป้ายทะเบียน", "รู้พิกัด/สถานที่ที่ไป", "รู้ช่วงเวลาและพฤติกรรมการเดินทาง"],
          safer: ["ครอป/ปิดป้ายทะเบียน", "ปิด location หรือโพสต์แบบจำกัดคนเห็น", "โพสต์ดีเลย์หลังออกจากสถานที่"],
        },
      },
      {
        id: "s2",
        title: "โพสต์รูปเด็ก/นักเรียน เห็นหน้า + ป้ายชื่อ",
        subtitle: "อยากอัปลง Facebook เพื่อแชร์ความภูมิใจ",
        scenarioText:
          "ในรูปมีใบหน้าเด็กชัด และเห็นป้ายชื่อ/ชื่อโรงเรียนบนเสื้อ หรือป้ายชื่อห้อยคอ",
        correctAccess: "private",
        teach: {
          why: "ชื่อ + ใบหน้า (และอาจมีโรงเรียน) ทำให้ระบุตัวตนได้ง่าย เสี่ยงถูกนำไปใช้ไม่เหมาะสม",
          risks: ["ระบุตัวตนเด็กได้โดยตรง", "เชื่อมโยงไปถึงโรงเรียน/ห้อง/กลุ่มเพื่อนได้", "เสี่ยงต่อการนำภาพไปใช้ซ้ำหรือคุกคาม"],
          safer: ["เบลอหน้า/ป้ายชื่อ", "เลี่ยงโพสต์สาธารณะ", "แชร์เฉพาะกลุ่มผู้เกี่ยวข้อง (เช่น ผู้ปกครองห้องเดียวกัน)"],
        },
      },
      {
        id: "s3",
        title: "แชร์เอกสารรายชื่อ + เบอร์โทร + ที่อยู่จัดส่ง",
        subtitle: "ต้องส่งให้ทีมช่วยจัดส่งของ",
        scenarioText:
          "คุณมีไฟล์รวมรายชื่อผู้ปกครอง พร้อมเบอร์โทรและที่อยู่ เพื่อให้ทีมช่วยจัดส่งของให้ครบทุกคน",
        correctAccess: "private",
        teach: {
          why: "เบอร์โทร/ที่อยู่เป็นข้อมูลส่วนบุคคลความเสี่ยงสูง ถ้าลิงก์หลุดอาจถูกนำไปหลอกลวงหรือคุกคาม",
          risks: ["โดนโทร/ข้อความรบกวน", "เสี่ยงถูกหลอกลวง (phishing)", "เปิดเผยที่อยู่จริงเสี่ยงต่อความปลอดภัย"],
          safer: ["แชร์เฉพาะคนจำเป็นและตั้งสิทธิ์แบบเฉพาะบุคคล", "ห้ามใช้ลิงก์ anyone-with-link", "แยกข้อมูลเท่าที่ต้องใช้ (minimize)"],
        },
      },
    ],
    []
  );

  /* ✅ progress/state */
  const [selectedScenarioId, setSelectedScenarioId] = useState(
    initialProgress?.selectedScenarioId || SCENARIOS_24[0]?.id
  );
  const [picks, setPicks] = useState(initialProgress?.picks || {}); // { [scenarioId]: access }
  const [checked, setChecked] = useState(initialProgress?.checked || {}); // { [scenarioId]: true }
  const [verdict, setVerdict] = useState(initialProgress?.verdict || {}); // { [scenarioId]: { ok, ... } }

  const currentScenario = useMemo(() => {
    return SCENARIOS_24.find((s) => s.id === selectedScenarioId) || SCENARIOS_24[0];
  }, [SCENARIOS_24, selectedScenarioId]);

  const emitProgress = (next) => onComplete?.(next);

  /* ✅ ทำครบ/ผ่านครบ */
  const allDone = useMemo(() => SCENARIOS_24.every((s) => Boolean(checked[s.id])), [SCENARIOS_24, checked]);
  const allPassed = useMemo(() => SCENARIOS_24.every((s) => verdict?.[s.id]?.ok === true), [SCENARIOS_24, verdict]);
  const canGoNext = allDone && allPassed;

  const accessLabel = (v) => ACCESS_OPTIONS.find((o) => o.value === v)?.label || v;

  const scenarioStatus = (scenarioId) => {
    const isChecked = Boolean(checked[scenarioId]);
    const isOk = verdict?.[scenarioId]?.ok === true;
    return { isChecked, isOk };
  };

  /* ✅ เลือกระดับ (ล็อกถ้าตรวจแล้ว) */
  const handlePickAccess = (scenarioId, access) => {
    if (checked[scenarioId]) return;

    const next = {
      selectedScenarioId,
      picks: { ...picks, [scenarioId]: access },
      checked,
      verdict,
    };

    setPicks(next.picks);
    emitProgress(next);
  };

  /* ✅ ตรวจคำตอบ: เทียบ correctAccess อย่างเดียว */
  const handleCheck = (scenario) => {
    const userPick = picks[scenario.id];
    const ok = Boolean(userPick) && userPick === scenario.correctAccess;

    const nextVerdict = {
      ...verdict,
      [scenario.id]: {
        ok,
        picked: userPick || "",
        correctAccess: scenario.correctAccess,
        teach: scenario.teach,
        notes: ok
          ? ["เยี่ยมมาก! เลือกระดับเข้าถึงได้เหมาะกับความเสี่ยง ✅"]
          : [
              "ยังไม่เหมาะสมกับความเสี่ยงของสถานการณ์นี้",
              "ลองดูหัวข้อ “ทำไมถึงเป็นแบบนั้น” และ “ความเสี่ยง” ด้านล่าง แล้วค่อยปรับคำตอบ",
            ],
      },
    };

    const nextChecked = { ...checked, [scenario.id]: true };

    const next = {
      selectedScenarioId,
      picks,
      checked: nextChecked,
      verdict: nextVerdict,
    };

    setVerdict(nextVerdict);
    setChecked(nextChecked);
    emitProgress(next);
  };

  /* ✅ ทำใหม่เคสนี้ */
  const handleRetryScenario = (scenarioId) => {
    const nextChecked = { ...checked };
    const nextVerdict = { ...verdict };

    delete nextChecked[scenarioId];
    delete nextVerdict[scenarioId];

    const next = { selectedScenarioId, picks, checked: nextChecked, verdict: nextVerdict };

    setChecked(nextChecked);
    setVerdict(nextVerdict);
    emitProgress(next);
  };

  /* ✅ รีเซ็ตทั้งหมด */
  const handleResetAll = () => {
    const next = {
      selectedScenarioId: SCENARIOS_24[0]?.id,
      picks: {},
      checked: {},
      verdict: {},
    };

    setSelectedScenarioId(next.selectedScenarioId);
    setPicks(next.picks);
    setChecked(next.checked);
    setVerdict(next.verdict);
    emitProgress(next);
  };

  return (
    <div className="edu-page">
      <div className="u13">
        <div className="u13-panel">
          <div className="u13-topline">
            กิจกรรม : เลือก Public/Group/Private แล้วอ่าน feedback จากระบบ (ไม่ต้องพิมพ์เหตุผล)
          </div>

          <div className="u13-layout">
            {/* LEFT: Scenario Gallery */}
            <div className="u13-shell">
              <div className="u13-gallery">
                <div className="u13-header">
                  <h3 className="u13-title">Scenario Gallery</h3>
                  <p className="u13-desc">เลือก 1 สถานการณ์ แล้วตัดสินใจระดับการเข้าถึงที่เหมาะสม</p>
                </div>

                <div className="u13-grid">
                  {SCENARIOS_24.map((s) => {
                    const active = s.id === selectedScenarioId;
                    const st = scenarioStatus(s.id);

                    return (
                      <button
                        key={s.id}
                        type="button"
                        className={`u13-card ${active ? "is-active" : ""}`}
                        onClick={() => setSelectedScenarioId(s.id)}
                      >
                        <div className="u13-card-row">
                          <div className="u13-iconbox" aria-hidden="true">
                            <FiFileText />
                          </div>

                          <div style={{ minWidth: 0 }}>
                            <div className="u13-card-top">
                              <div className="u13-card-title">{s.title}</div>
                              {st.isChecked ? (
                                <span className="u13-done">
                                  <FiCheckCircle aria-hidden="true" />
                                  {st.isOk ? "ผ่านแล้ว" : "ทำแล้ว"}
                                </span>
                              ) : null}
                            </div>

                            <div className="u13-card-sub">{s.subtitle}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="u13-actions" style={{ marginTop: 12 }}>
                <button className="edu-btn edu-btn--next" type="button" onClick={handleResetAll}>
                  <FiRefreshCw aria-hidden="true" /> รีเซ็ตทั้งหมด
                </button>
              </div>
            </div>

            {/* RIGHT: Details */}
            <div className="u13-rightCard">
              <div className="u13-head">
                <div className="u13-head__title">{currentScenario?.title}</div>
                <div className="u13-head__sub">{currentScenario?.subtitle}</div>
              </div>

              <div className="u13-body">
                <div className="u13-hint">👉 สถานการณ์</div>
                <div className="u13-textbox">
                  <div className="u13-space">{currentScenario?.scenarioText}</div>
                </div>

                <div className="u13-hint" style={{ marginTop: 12 }}>
                  👉 เลือกระดับการเข้าถึงที่เหมาะสม
                </div>

                <div className="edu-taskCard__actions">
                  {ACCESS_OPTIONS.map((opt) => {
                    const picked = picks[currentScenario.id] === opt.value;
                    const locked = Boolean(checked[currentScenario.id]);

                    return (
                      <button
                        key={opt.value}
                        type="button"
                        className={`edu-pill ${picked ? "is-active" : ""}`}
                        onClick={() => handlePickAccess(currentScenario.id, opt.value)}
                        disabled={locked}
                        title={locked ? "ตรวจแล้ว (ล็อกคำตอบ) กดทำใหม่เคสนี้ถ้าต้องการแก้" : "เลือก"}
                      >
                        <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                          {opt.icon}
                          {opt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* ตรวจคำตอบ / ทำใหม่ */}
                <div className="u13-actions">
                  {!checked[currentScenario.id] ? (
                    <button
                      className="edu-btn edu-btn--primary"
                      type="button"
                      onClick={() => handleCheck(currentScenario)}
                      disabled={!picks[currentScenario.id]}
                      title={picks[currentScenario.id] ? "ตรวจคำตอบ" : "เลือกระดับก่อน"}
                    >
                      ตรวจคำตอบ <FiChevronRight aria-hidden="true" />
                    </button>
                  ) : (
                    <button
                      className="edu-btn edu-btn--next"
                      type="button"
                      onClick={() => handleRetryScenario(currentScenario.id)}
                      title="ปลดล็อกเพื่อทำใหม่เคสนี้"
                    >
                      <FiRefreshCw aria-hidden="true" /> ทำใหม่เคสนี้
                    </button>
                  )}
                </div>

                {/* Feedback (สอนเยอะ) */}
                {checked[currentScenario.id] ? (
                  <div className={`u13-feedback ${verdict?.[currentScenario.id]?.ok ? "ok" : "warn"}`}>
                    <div className="u13-feedback__row">
                      <div className="u13-feedback__icon" aria-hidden="true">
                        {verdict?.[currentScenario.id]?.ok ? <FiCheckCircle /> : <FiAlertTriangle />}
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div className="u13-feedback__title">
                          {verdict?.[currentScenario.id]?.ok ? "ผ่าน ✅" : "ยังไม่เหมาะ"}
                        </div>

                        <div className="u13-feedback__meta">
                          คุณเลือก: <b>{accessLabel(picks[currentScenario.id] || "-")}</b>
                          {" · "}
                          คำตอบที่เหมาะสม:{" "}
                          <b>{accessLabel(verdict?.[currentScenario.id]?.correctAccess || currentScenario.correctAccess)}</b>
                        </div>
                      </div>
                    </div>

                    <div className="u13-feedback__lists">
                      <div>
                        <div className="u13-feedback__label">ทำไมถึงเป็นแบบนั้น?</div>
                        <div className="u13-feedback__text">{verdict?.[currentScenario.id]?.teach?.why}</div>
                      </div>

                      <div>
                        <div className="u13-feedback__label">ความเสี่ยงที่มองเห็นได้</div>
                        <div className="u13-feedback__text pre">
                          {(verdict?.[currentScenario.id]?.teach?.risks || [])
                            .map((t) => `• ${t}`)
                            .join("\n")}
                        </div>
                      </div>

                      <div>
                        <div className="u13-feedback__label">ถ้าจะทำให้ปลอดภัยขึ้น ทำได้แบบนี้</div>
                        <div className="u13-feedback__text pre">
                          {(verdict?.[currentScenario.id]?.teach?.safer || [])
                            .map((t) => `• ${t}`)
                            .join("\n")}
                        </div>
                      </div>

                      <div>
                        <div className="u13-feedback__label">สรุปจากระบบ</div>
                        <div className="u13-feedback__text pre">
                          {(verdict?.[currentScenario.id]?.notes || []).map((t) => `• ${t}`).join("\n")}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* ปุ่มไปต่อ */}
                <div className="u13-next">
                  <button
                    className="edu-btn edu-btn--ghost"
                    type="button"
                    onClick={() => onNext?.()}
                    disabled={!canGoNext}
                    title={canGoNext ? "ไปบทถัดไป" : "ต้องทำให้ครบทุกสถานการณ์และผ่านทั้งหมดก่อน"}
                  >
                    เสร็จสิ้น
                  </button>
                </div>

                <div className="u13-note">
                  * ถ้ายังไม่ผ่าน: กด “ทำใหม่เคสนี้” แล้วลองเลือกระดับเข้าถึงใหม่ จากนั้นอ่าน feedback เพื่อจำหลักคิด
                </div>

                <div className="edu-result" style={{ marginTop: 12 }}>
                  <div className="edu-result__text">
                    ความคืบหน้า: <b>{Object.keys(checked).length}</b> / {SCENARIOS_24.length}
                    {" · "}
                    สถานะ:{" "}
                    <b>{canGoNext ? "พร้อมไปต่อ ✅" : allDone ? "ตรวจครบแล้วแต่ยังไม่ผ่านทั้งหมด" : "ยังทำไม่ครบ"}</b>
                  </div>
                </div>
              </div>
            </div>
            {/* END RIGHT */}
          </div>
        </div>
      </div>
    </div>
  );
}
