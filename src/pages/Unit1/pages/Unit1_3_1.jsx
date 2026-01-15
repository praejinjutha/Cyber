// src/pages/Unit1/pages/Unit1_3_1.jsx
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import {
  FiAlertTriangle,
  FiCheckCircle,
  FiChevronRight,
  FiRefreshCw,
  FiInfo,
} from "react-icons/fi";

/**
 * ✅ Unit 1 - เรื่องที่ 3.1
 * - โจทย์: จัดระดับความเสี่ยง (ต่ำ/กลาง/สูง) ของข้อมูลแต่ละประเภท
 * - Feedback: อธิบาย "ทำไม" + ผลกระทบระยะสั้น/ระยะยาว
 * - ไม่บันทึก progress: ทำใหม่ได้ทุกครั้ง
 *
 * Props:
 * - onNext(): ไปหน้าถัดไป
 */
export default function Unit1_3_1({ onNext }) {
  /**
   * ✅ บริบทเดียวตลอดกิจกรรม
   */
  const scenario = useMemo(
    () => ({
      title: "สถานการณ์: ตั้งค่าไม่เหมาะสม",
      desc:
        "คุณโพสต์รูป/สตอรี่ในโซเชียล แล้ว “เปิดสาธารณะ” โดยไม่เช็กว่ามีข้อมูลส่วนบุคคลหลุดไปด้วย " +
        "(เช่น ป้ายชื่อโรงเรียน, เช็กอินสถานที่, เบอร์โทร, รูปบัตร/เอกสาร ฯลฯ)",
      hint:
        "เป้าหมายคือประเมินความเสี่ยงจาก “ประเภทข้อมูล” + “บริบทที่เปิดเผย” แล้วคาดการณ์ผลกระทบระยะสั้น/ยาว",
    }),
    []
  );

  /**
   * ✅ รายการข้อมูลให้จัดระดับความเสี่ยง
   */
  const items = useMemo(
    () => [
      {
        id: "school_tag",
        label: "ป้ายชื่อโรงเรียน / ป้ายชื่อหน้าห้อง (เห็นชื่อโรงเรียนชัด)",
        correct: "mid",
        why: "บอกตัวตน/สถานที่ที่คุณไปเป็นประจำ ทำให้คนไม่หวังดี “ระบุตัวคุณได้ง่ายขึ้น”",
        shortImpact: "โดนทักแชทแปลก ๆ / คนรู้ว่าคุณเรียนที่ไหน",
        longImpact: "เสี่ยงถูกสะกดรอย/แอบอ้างเป็นคนรู้จัก/เจาะข้อมูลต่อยอด",
      },
      {
        id: "checkin_location",
        label: "เช็กอินสถานที่แบบเรียลไทม์ (บอกตำแหน่งตอนนี้)",
        correct: "high",
        why: "เป็นข้อมูลเชิงพิกัด/พฤติกรรม ทำให้เดาเส้นทางและเวลาที่คุณอยู่/ไม่อยู่บ้านได้",
        shortImpact: "เสี่ยงถูกตามไปที่สถานที่จริง",
        longImpact: "เกิดแพตเทิร์นพฤติกรรม → ถูกสะกดรอย/วางแผนล่อซื้อ/โจรกรรม",
      },
      {
        id: "phone",
        label: "เบอร์โทรศัพท์",
        correct: "mid",
        why: "ใช้ติดต่อยืนยันตัวตน/สมัครบริการได้ และถูกนำไปสแปมหรือหลอกลวงได้ง่าย",
        shortImpact: "โทร/ข้อความสแปมเพิ่มขึ้น",
        longImpact: "เสี่ยงถูกฟิชชิง, ยึดบัญชี (ถ้าใช้เป็นเบอร์ผูกล็อกอิน/OTP)",
      },
      {
        id: "email",
        label: "อีเมล",
        correct: "mid",
        why: "เป็นประตูเข้าสู่หลายบัญชี (reset password) และเป็นเป้าฟิชชิงยอดฮิต",
        shortImpact: "อีเมลหลอกลวง/สแปมเพิ่มขึ้น",
        longImpact: "เสี่ยงถูกยึดบัญชีอื่น ๆ ผ่านการรีเซ็ตรหัส/ลิงก์ปลอม",
      },
      {
        id: "student_id",
        label: "รูปบัตรนักเรียน/บัตรพนักงาน (เห็นเลข/ชื่อ/หน่วยงาน)",
        correct: "high",
        why: "เป็นข้อมูลระบุตัวตนชัดเจน และเอาไปแอบอ้าง/ทำวิศวกรรมสังคมได้",
        shortImpact: "มีคนเอาข้อมูลไปอ้างตัว/แกล้งโทรหาเพื่อนหรือครู",
        longImpact: "ถูกสวมรอย/ยกระดับการหลอกลวงให้แนบเนียนขึ้น (social engineering)",
      },
      {
        id: "id_card",
        label: "บัตรประชาชน/พาสปอร์ต/เอกสารราชการ (เห็นเลขชัด)",
        correct: "high",
        why: "ข้อมูลอ่อนไหวมาก ใช้ยืนยันตัวตน ทำธุรกรรม หรือผูกบริการต่าง ๆ ได้",
        shortImpact: "เสี่ยงโดนเอาข้อมูลไปทำเอกสารปลอม/สมัครบริการ",
        longImpact: "สวมรอยตัวตน, ปัญหาทางกฎหมาย/การเงินตามมา",
      },
      {
        id: "password",
        label: "รหัสผ่าน / รหัสผ่านที่เผลอพิมพ์ติดในแชท",
        correct: "high",
        why: "คือ “กุญแจดอกหลัก” ถ้าหลุดคือเข้าบัญชีได้ทันที",
        shortImpact: "บัญชีถูกเข้าถึง/ถูกเปลี่ยนรหัส",
        longImpact: "โดนยึดบัญชีถาวร, ถูกใช้หลอกคนอื่นต่อ (ลามเป็นวงกว้าง)",
      },
      {
        id: "otp",
        label: "OTP / รหัสยืนยัน 2 ชั้น (2FA) ที่มีคนขอ",
        correct: "high",
        why: "OTP คือกุญแจชั่วคราวสำหรับเข้าบัญชี/ทำธุรกรรม การให้คนอื่น = เปิดประตูเอง",
        shortImpact: "บัญชี/ธุรกรรมถูกเข้าถึงทันที",
        longImpact: "เสียเงิน/เสียบัญชี/เสียความน่าเชื่อถือ เพราะคนร้ายใช้บัญชีคุณทำต่อ",
      },
      {
        id: "address",
        label: "ที่อยู่บ้าน (เลขที่/ซอย/จุดสังเกตชัด)",
        correct: "high",
        why: "เป็นข้อมูลตำแหน่งถาวรและละเอียด มีความเสี่ยงด้านความปลอดภัยชีวิตและทรัพย์สิน",
        shortImpact: "โดนส่งของก่อกวน/คนแปลกหน้ามาหา",
        longImpact: "เสี่ยงถูกคุกคาม/สะกดรอย/ลักทรัพย์",
      },
    ],
    []
  );

  /**
   * ✅ state: คำตอบผู้เรียน
   * selections: { [id]: "low" | "mid" | "high" }
   */
  const [selections, setSelections] = useState({});

  /**
   * ✅ state: ตรวจคำตอบแล้วหรือยัง
   */
  const [submitted, setSubmitted] = useState(false);

  /**
   * ✅ state: เปิด/ปิด popup วิธีคิด
   */
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  /**
   * ✅ label แสดงผล
   */
  const riskLabel = useMemo(
    () => ({
      low: "ต่ำ",
      mid: "กลาง",
      high: "สูง",
    }),
    []
  );

  /**
   * ✅ เช็กว่าตอบครบไหม
   */
  const isComplete = useMemo(() => {
    return items.every((it) => Boolean(selections[it.id]));
  }, [items, selections]);

  /**
   * ✅ คะแนนรวมเพื่อให้เห็นภาพรวม
   */
  const score = useMemo(() => {
    const total = items.length;
    const correctCount = items.reduce((acc, it) => {
      return acc + (selections[it.id] === it.correct ? 1 : 0);
    }, 0);
    return { total, correctCount };
  }, [items, selections]);

  /**
   * ✅ popup: ESC ปิด + ล็อก scroll ตอนเปิด
   */
  useEffect(() => {
    if (!isHelpOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") setIsHelpOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isHelpOpen]);

  /**
   * ✅ รีเซ็ตกิจกรรม
   */
  const resetAll = () => {
    setSelections({});
    setSubmitted(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /**
   * ✅ เลือกความเสี่ยงให้ item หนึ่งข้อ
   */
  const pickRisk = (id, value) => {
    setSelections((prev) => ({ ...prev, [id]: value }));
  };

  /**
   * ✅ ปุ่มแบบชิพ: ใช้ edu-pill ที่มีอยู่แล้ว
   */
  const Pill = ({ active, children, onClick }) => {
    return (
      <button
        type="button"
        className={["edu-pill", active ? "is-active" : ""].join(" ")}
        onClick={onClick}
        aria-pressed={active}
      >
        {children}
      </button>
    );
  };

  return (
    // ✅ ใช้ผิวรวมของระบบเดิม (อ่านง่าย + กลาสเบา ๆ ตามไฟล์เดิม)
    <section className="edu-panel1">

      
        <div className="edu-u1task__footer">
  {!submitted && !isComplete ? (
    <span className="edu-pill" style={{ cursor: "default" }}>
      ยังเลือกไม่ครบ
    </span>
  ) : (
    <span /> // กัน layout กระโดด
  )}

  <button
    type="button"
    className="edu-btn edu-btn--next"
    onClick={() => setIsHelpOpen(true)}
    aria-haspopup="dialog"
    aria-expanded={isHelpOpen}
    title="วิธีคิด"
    style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
  >
    <FiInfo aria-hidden="true" />
    <span>วิธีคิด</span>
  </button>
</div>


       

{/* รายการข้อ (ใช้ edu-taskGrid แบ่งซ้าย/ขวา) */}
<div className="edu-taskGrid" style={{ marginTop: 12 }}>
{items.map((it, idx) => {
  const picked = selections[it.id];
  const isRight = submitted && picked === it.correct;
  const isWrong = submitted && picked && picked !== it.correct;

  const isLast = idx === items.length - 1;

  // ====== การ์ดข้อคำถาม (เหมือนเดิม) ======
  const questionCard = (
    <div className="edu-taskCard">
      <div className="edu-taskCard__body">
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div className="edu-taskCard__label">
              #{idx + 1} • {it.label}
            </div>

            {!picked && !submitted ? (
              <div className="edu-taskCard__example">
                เลือกระดับความเสี่ยงสำหรับข้อนี้
              </div>
            ) : null}
          </div>

          {submitted ? (
            <div style={{ flex: "0 0 auto" }}>
              {isRight ? (
                <span
                  className="edu-pill"
                  style={{
                    cursor: "default",
                    borderColor: "rgba(22,163,74,.35)",
                    background: "rgba(22,163,74,.12)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <FiCheckCircle aria-hidden="true" /> ถูก
                </span>
              ) : isWrong ? (
                <span
                  className="edu-pill"
                  style={{
                    cursor: "default",
                    borderColor: "rgba(220,38,38,.35)",
                    background: "rgba(220,38,38,.12)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <FiAlertTriangle aria-hidden="true" /> ยังไม่ถูก
                </span>
              ) : (
                <span className="edu-pill" style={{ cursor: "default" }}>
                  ยังไม่เลือก
                </span>
              )}
            </div>
          ) : null}
        </div>
      </div>

      <div className="edu-taskCard__actions">
        <Pill active={picked === "low"} onClick={() => pickRisk(it.id, "low")}>
          ต่ำ
        </Pill>
        <Pill active={picked === "mid"} onClick={() => pickRisk(it.id, "mid")}>
          กลาง
        </Pill>
        <Pill active={picked === "high"} onClick={() => pickRisk(it.id, "high")}>
          สูง
        </Pill>
      </div>

      {submitted ? (
        <div
          className={[
            "edu-taskCard__feedback",
            isRight ? "ok" : isWrong ? "warn" : "",
          ].join(" ")}
        >
          <div className="edu-taskCard__feedbackRow">
            <div style={{ minWidth: 0 }}>
              <div className="edu-taskCard__feedbackMsg">
                คำตอบอ้างอิง: {riskLabel[it.correct]} • คุณเลือก:{" "}
                {picked ? riskLabel[picked] : "-"}
              </div>

              <div className="edu-taskCard__feedbackReason">
                <b>ทำไม:</b> {it.why}
                <br />
                <b>ระยะสั้น:</b> {it.shortImpact}
                <br />
                <b>ระยะยาว:</b> {it.longImpact}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );

  // ====== การ์ดสถานะ (เหมือนเดิม) ======
  const statusCard = (
    <div className="edu-taskCard">
      <div className="edu-taskCard__body">
        <div className="edu-taskCard__label">สถานะของคุณ</div>

        {!submitted ? (
          <div className="edu-taskCard__example" style={{ marginTop: 6 }}>
            เลือกให้ครบทุกข้อ แล้วกด “ตรวจคำตอบ”
          </div>
        ) : (
          <div className="edu-taskCard__example" style={{ marginTop: 6 }}>
            ผลรวม: ทำได้ {score.correctCount} / {score.total}
          </div>
        )}
      </div>

      <div className="edu-taskCard__actions">
        {!submitted ? (
          <>
            <button
              type="button"
              className="edu-btn edu-btn--primary"
              onClick={() => {
                setSubmitted(true);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              disabled={!isComplete}
              title={!isComplete ? "เลือกให้ครบทุกข้อก่อน" : "ตรวจคำตอบ"}
              style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              <FiCheckCircle aria-hidden="true" />
              ตรวจคำตอบ
            </button>

            <button
              type="button"
              className="edu-btn edu-btn--danger"
              onClick={resetAll}
              style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              <FiRefreshCw aria-hidden="true" />
              เริ่มใหม่
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="edu-btn edu-btn--danger"
              onClick={resetAll}
              style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              <FiRefreshCw aria-hidden="true" />
              ทำใหม่ (ทบทวน)
            </button>

            <button
              type="button"
              className="edu-btn edu-btn--ghost"
              onClick={() => {
                onNext?.();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              ต่อไป
              <FiChevronRight aria-hidden="true" />
            </button>
          </>
        )}
      </div>
    </div>
  );

  // ✅ ถ้าเป็นข้อสุดท้าย: span เต็มแถว แล้วแบ่ง 2 คอลัมน์ข้างใน
  if (isLast) {
    return (
      <div
        key={it.id}
        style={{
          gridColumn: "1 / -1",          // สำคัญ: ให้กินเต็มแถวของ edu-taskGrid
          display: "grid",
          gridTemplateColumns: "1.2fr .8fr", // ซ้ายใหญ่ ขวาเล็ก (ปรับได้)
          gap: 12,
          alignItems: "start",
        }}
      >
        {questionCard}
        {statusCard}
      </div>
    );
  }

  // ข้ออื่น ๆ เหมือนเดิม
  return <div key={it.id}>{questionCard}</div>;
})}

</div>

      {/* =========================
          Popup วิธีคิด (ไม่สร้าง class ใหม่ ใช้ inline style + ปุ่มเดิม)
      ========================= */}
{createPortal(
  isHelpOpen ? (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="u1-31-help-title"
      onMouseDown={() => setIsHelpOpen(false)}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2147483647, // ✅ สูงสุด กันโดนทับ
        background: "rgba(0,0,0,0.72)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          width: "min(760px, 100%)",
          maxHeight: "85vh",
          overflow: "auto",
          padding: 16,
          borderRadius: 18,
          background: "rgba(248,250,252,0.98)", // ✅ บังคับให้สว่างชัวร์
          border: "1px solid rgba(15,23,42,.16)",
          boxShadow: "0 22px 70px rgba(0,0,0,.55)",
          color: "#0f172a", // ✅ บังคับสีตัวอักษรให้เห็นชัวร์
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            paddingBottom: 10,
            borderBottom: "1px solid rgba(15,23,42,.12)",
            marginBottom: 12,
          }}
        >
          <div
            id="u1-31-help-title"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              fontWeight: 900,
              fontSize: 16,
            }}
          >
            <FiInfo aria-hidden="true" />
            วิธีคิดแบบง่าย
          </div>
        </div>

        <div style={{ display: "grid", gap: 10, lineHeight: 1.7, color: "#334155" }}>
          <div>• ถามตัวเองว่า “ข้อมูลนี้ระบุตัวฉันได้แค่ไหน” และ “เอาไปใช้ทำอะไรได้บ้าง”</div>
          <div>• ถ้าเอาไป “เข้าบัญชี/ทำธุรกรรม/ยืนยันตัวตน” ได้ → มักเป็นความเสี่ยงสูง</div>
          <div>• ถ้าเป็น “ตำแหน่ง/พฤติกรรม” (เช็กอิน, ที่อยู่) → กระทบความปลอดภัยชีวิต/ทรัพย์สิน</div>
          <div>• ตรวจคำตอบแล้วอ่าน “ผลกระทบระยะสั้น/ยาว” เพื่อเชื่อมกับชีวิตจริง</div>
        </div>

        <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            className="edu-btn edu-btn--primary"
            onClick={() => setIsHelpOpen(false)}
          >
            เข้าใจแล้ว
          </button>
        </div>
      </div>
    </div>
  ) : null,
  document.body
)}



    </section>
  );
}
