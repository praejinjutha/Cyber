// src/pages/Unit1/pages/Unit1_4_2.jsx

import { useMemo, useState } from "react";
import { FiCheckCircle, FiChevronRight, FiInfo } from "react-icons/fi";

/**
 * ✅ Unit 1 - 4.2: รูปแบบ MFA ที่ใช้แพร่หลาย (Interactive simulation)
 *
 * Flow:
 * - เลือกวิธี MFA → OTP / Authenticator / Prompt / Biometrics
 * - อ่านข้อดี/ข้อจำกัด
 * - mini task: เลือกวิธีที่ “เหมาะสุด” สำหรับสถานการณ์สั้น ๆ
 * - ไป 4.3 (รวม 4.4)
 *
 * Props:
 * - onNext(): ไปหน้าถัดไป
 */
export default function Unit1_4_2({ onNext }) {
  // ✅ ชุดข้อมูลวิธี MFA (สั้น ๆ แต่ชัด)
  const METHODS = useMemo(
    () => [
      {
        key: "otp",
        title: "OTP (SMS/Email)",
        pros: ["เริ่มใช้ได้ง่าย", "คุ้นเคย ใช้งานเร็ว"],
        cons: [
          "เสี่ยงโดนดัก/สวมรอยซิม (SIM swap) หรือโดนหลอกให้บอกรหัส",
          "ถ้ามือถือไม่อยู่กับตัว จะลำบาก",
        ],
        tip: "เหมาะกับความเสี่ยงต่ำ-กลาง หรือใช้ชั่วคราวก่อนอัปเกรด",
      },
      {
        key: "authenticator",
        title: "Authenticator App",
        pros: ["ปลอดภัยกว่า OTP", "ทำงานได้แม้ไม่มีสัญญาณ (บางแอป)"],
        cons: ["ต้องตั้งค่าครั้งแรก", "ต้องมีการสำรอง/ย้ายเครื่องให้ดี"],
        tip: "เหมาะกับอีเมล/โซเชียล/งานที่มีความเสี่ยงกลาง-สูง",
      },
      {
        key: "prompt",
        title: "Push Prompt (กดยืนยันในแอป)",
        pros: ["สะดวกมาก แค่กดยืนยัน", "ลดโอกาสพิมพ์รหัสผิด/โดนขโมยรหัส"],
        cons: ["ต้องระวัง ‘กดยืนยันมั่ว’ จากการโจมตีแบบ prompt bombing"],
        tip: "เหมาะกับระบบที่มีแอปรองรับ + ผู้ใช้มีวินัยอ่านรายละเอียดก่อนกด",
      },
      {
        key: "biometrics",
        title: "Biometrics (ลายนิ้วมือ/Face ID)",
        pros: ["เร็วและง่ายมาก", "ไม่ต้องจำรหัสเพิ่ม"],
        cons: [
          "มักเป็นแค่ ‘ตัวปลดล็อกเครื่อง’ ไม่ใช่ MFA เต็มรูปแบบในทุกระบบ",
          "ต้องมีวิธีสำรอง (PIN/Recovery) เสมอ",
        ],
        tip: "เหมาะเป็นชั้นเสริมบนอุปกรณ์ แต่ควรมีปัจจัยอื่นคู่กัน",
      },
    ],
    []
  );

  // ✅ เลือกดูรายละเอียด
  const [selectedKey, setSelectedKey] = useState("authenticator");

  // ✅ mini task: สถานการณ์สั้น ๆ ให้เลือกวิธีที่เหมาะสุด
  const MINI_SCENARIO =
    "คุณกำลังจะเปิด MFA ให้บัญชีอีเมลหลัก (ใช้รีเซ็ตรหัสทุกบริการ) และต้องการความปลอดภัยสูง";
  const correctKey = "authenticator"; // ตั้งเป็นค่าเริ่มต้นที่สมเหตุสมผลในบริบทหลักสูตร

  const [miniAnswer, setMiniAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // ✅ หา method ที่เลือก
  const selectedMethod = useMemo(
    () => METHODS.find((m) => m.key === selectedKey) ?? METHODS[0],
    [METHODS, selectedKey]
  );

  return (
    <div className="edu-card">
      {/* ✅ คำอธิบาย */}
      <div className="edu-card__body">
        <div className="edu-hint">
          <FiInfo aria-hidden="true" style={{ marginRight: 8 }} />
          เลือกวิธี MFA เพื่อดู “ข้อดี / ข้อจำกัด” แล้วทำ mini task ด้านล่าง
        </div>

        {/* ✅ ตัวเลือกวิธี MFA */}
        <div className="edu-grid" style={{ marginTop: 12 }}>
          {METHODS.map((m) => (
            <button
              key={m.key}
              type="button"
              className={`edu-pill ${selectedKey === m.key ? "is-active" : ""}`}
              onClick={() => setSelectedKey(m.key)}
              aria-pressed={selectedKey === m.key}
              title={`ดูรายละเอียด: ${m.title}`}
            >
              {m.title}
            </button>
          ))}
        </div>

        {/* ✅ รายละเอียดของวิธีที่เลือก */}
        <div className="edu-box" style={{ marginTop: 14 }}>
          <div className="edu-box__title">{selectedMethod.title}</div>

          <div className="edu-box__row" style={{ marginTop: 10 }}>
            <div className="edu-box__col">
              <div className="edu-label">ข้อดี</div>
              <ul className="edu-list">
                {selectedMethod.pros.map((p, idx) => (
                  <li key={idx}>{p}</li>
                ))}
              </ul>
            </div>

            <div className="edu-box__col">
              <div className="edu-label">ข้อจำกัด</div>
              <ul className="edu-list">
                {selectedMethod.cons.map((c, idx) => (
                  <li key={idx}>{c}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="edu-note" style={{ marginTop: 10 }}>
            <b>ทิป:</b> {selectedMethod.tip}
          </div>
        </div>

        {/* ✅ Mini task */}
        <div className="edu-box" style={{ marginTop: 14 }}>
          <div className="edu-label">Mini Task</div>
          <div style={{ marginTop: 6 }}>{MINI_SCENARIO}</div>

          <div className="edu-grid" style={{ marginTop: 12 }}>
            {METHODS.map((m) => (
              <button
                key={m.key}
                type="button"
                className={`edu-choice ${
                  miniAnswer === m.key ? "is-selected" : ""
                }`}
                onClick={() => {
                  setMiniAnswer(m.key);
                  setShowFeedback(true);
                }}
                title={`เลือก: ${m.title}`}
              >
                {m.title}
              </button>
            ))}
          </div>

          {/* ✅ Feedback ทันที */}
          {showFeedback && (
            <div className="edu-feedback" style={{ marginTop: 12 }}>
              {miniAnswer === correctKey ? (
                <div className="edu-feedback__ok">
                  <FiCheckCircle aria-hidden="true" /> ถูกต้อง: บัญชีอีเมลหลักควรใช้วิธีที่ปลอดภัยกว่า
                  OTP และไม่ผูกกับเบอร์โทรเป็นหลัก
                </div>
              ) : (
                <div className="edu-feedback__warn">
                  ยังไม่สุด: ลองนึกว่า “อีเมลหลัก” คือกุญแจสำรองของหลายบริการ
                  วิธีที่ปลอดภัยกว่า OTP จะเหมาะกว่า
                </div>
              )}
            </div>
          )}
        </div>

        {/* ✅ ไปต่อ */}
        <div className="edu-videoActions" style={{ marginTop: 14 }}>
          <button
            className="edu-btn edu-btn--ghost"
            type="button"
            onClick={() => {
              onNext?.();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            title="ไปกิจกรรม 4.3"
          >
            ถัดไป <FiChevronRight aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
