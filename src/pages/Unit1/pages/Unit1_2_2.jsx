// src/pages/Unit1/Unit1_2_2.jsx
import { useMemo, useState } from "react";

/* ✅ Icons */
import { FiCheckCircle, FiXCircle, FiChevronRight, FiRefreshCw } from "react-icons/fi";

/* ✅ Data: 8 เคสสำหรับ Matching (ข้อมูล/บริบท/ระดับเข้าถึง) */
import { MATCHING_CASES } from "../data/matchingCases.js";


/**
 * ✅ Unit 1.2.2 — Matching Task
 * แนวคิด: ประเภทข้อมูล × บริบท × ระดับการเข้าถึง
 *
 * Flow:
 * - ผู้เรียนเลือก “ระดับการเข้าถึง” ให้ครบทุกเคส
 * - กดตรวจคำตอบ (submit) → แสดง feedback แบบอธิบายเหตุผล
 * - ปุ่มไปต่อ (2.3) จะกดได้เมื่อ submit แล้ว + ตอบครบทุกข้อ (กันมั่ว)
 *
 * Props:
 * - onNext(): ไปหน้าถัดไป (2.3)
 */
export default function Unit1_2_2({ onNext }) {
  /* ✅ ตัวเลือก “ระดับการเข้าถึง” */
  const ACCESS_OPTIONS = useMemo(
    () => [
      { value: "public", label: "Public (สาธารณะ)" },
      { value: "group", label: "Group (จำกัดเฉพาะกลุ่ม)" },
      { value: "private", label: "Private (ส่วนบุคคล)" },
    ],
    []
  );

  /* ✅ เก็บคำตอบผู้เรียน: { [caseId]: accessValue } */
  const [answers, setAnswers] = useState({});

  /* ✅ สถานะตรวจคำตอบแล้วหรือยัง */
  const [submitted, setSubmitted] = useState(false);

  /* ✅ เช็คว่าตอบครบทุกเคสหรือยัง */
  const allAnswered = useMemo(() => {
    return MATCHING_CASES.every((c) => Boolean(answers[c.id]));
  }, [answers]);

  /* ✅ คำนวณผล: ถูกกี่ข้อ + ถูกหมดไหม */
  const result = useMemo(() => {
    const total = MATCHING_CASES.length;

    /* ✅ นับจำนวนข้อที่ถูก */
    const correctCount = MATCHING_CASES.reduce((acc, c) => {
      const userPick = answers[c.id];
      const isCorrect = userPick === c.correct?.access;
      return acc + (isCorrect ? 1 : 0);
    }, 0);

    return {
      total,
      correctCount,
      allCorrect: total > 0 && correctCount === total,
    };
  }, [answers]);

  /**
   * ✅ เลือกคำตอบต่อเคส
   * - ถ้ายังไม่ submit: เปลี่ยนได้ปกติ
   * - ถ้า submit แล้ว: ล็อกไม่ให้เปลี่ยน (กันลองสุ่ม)
   */
  const handleChange = (caseId, value) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [caseId]: value }));
  };

  /** ✅ กดตรวจคำตอบ */
  const handleSubmit = () => {
    setSubmitted(true);
  };

  /** ✅ รีเซ็ตทำใหม่ */
  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
  };

  return (
    <div className="edu-page">
      {/* ✅ หัวข้อ */}
      <div className="edu-header">
        
        <p className="edu-subtitle">
          เลือกระดับการเข้าถึงให้เหมาะสมกับแต่ละเคส (ตอบให้ครบก่อนค่อยตรวจคำตอบนะ)
        </p>
      </div>

      {/* ✅ กล่องตาราง */}
      <div className="edu-card">
        <div className="edu-card__body">
          {/* ✅ ตาราง 3 คอลัมน์: ข้อมูล / บริบท / ระดับเข้าถึง */}
          <div className="edu-table-wrap">
            <table className="edu-table">
              <thead>
                <tr>
                  <th style={{ width: "38%" }}>ข้อมูล</th>
                  <th style={{ width: "38%" }}>บริบท</th>
                  <th style={{ width: "24%" }}>ระดับเข้าถึง</th>
                </tr>
              </thead>

              <tbody>
                {MATCHING_CASES.map((item) => {
                  /* ✅ เช็คความถูกต้องรายแถว */
                  const userPick = answers[item.id];
                  const isCorrect = userPick && userPick === item.correct?.access;

                  return (
                    <tr key={item.id} className="edu-table__row">
                      {/* ✅ คอลัมน์ข้อมูล */}
                      <td>
                        <div className="edu-cell-title">{item.data}</div>

                        {/* ✅ ถ้ามี field เสริม เช่น dataType ก็แสดงได้ (ไม่บังคับ) */}
                        {item.dataType ? (
                          <div className="edu-cell-meta">ประเภท: {item.dataType}</div>
                        ) : null}
                      </td>

                      {/* ✅ คอลัมน์บริบท */}
                      <td>
                        <div className="edu-cell-title">{item.context}</div>

                        {/* ✅ ถ้ามี field เสริม เช่น channel ก็แสดงได้ (ไม่บังคับ) */}
                        {item.channel ? <div className="edu-cell-meta">ช่องทาง: {item.channel}</div> : null}
                      </td>

                      {/* ✅ คอลัมน์ระดับเข้าถึง (ผู้เรียนเลือก) */}
                      <td>
                        <select
                          className="edu-select"
                          value={userPick || ""}
                          onChange={(e) => handleChange(item.id, e.target.value)}
                          disabled={submitted}
                          aria-label={`เลือกระดับเข้าถึงสำหรับเคส ${item.id}`}
                        >
                          <option value="">เลือก</option>
                          {ACCESS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>

                        {/* ✅ Feedback หลัง submit */}
                        {submitted ? (
                          <div className="edu-feedback">
                            {isCorrect ? (
                              <div className="edu-feedback__ok">
                                <FiCheckCircle aria-hidden="true" /> ถูกต้อง
                              </div>
                            ) : (
                              <div className="edu-feedback__bad">
                                <FiXCircle aria-hidden="true" />{" "}
                                {item.reason || "ยังไม่เหมาะสม ลองดูว่าข้อมูล/บริบทนี้เสี่ยงแค่ไหน"}
                              </div>
                            )}

                            {/* ✅ เฉลยสั้น ๆ หลังตรวจ (ถ้าคุณอยากซ่อนเฉลย ลบส่วนนี้ได้) */}
                            {!isCorrect && item.correct?.access ? (
                              <div className="edu-feedback__hint">
                                เฉลยที่เหมาะสม:{" "}
                                <b>
                                  {ACCESS_OPTIONS.find((o) => o.value === item.correct.access)?.label ||
                                    item.correct.access}
                                </b>
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ✅ แถบสรุปผลหลัง submit */}
          {submitted ? (
            <div className="edu-result">
              <div className="edu-result__text">
                คะแนน: <b>{result.correctCount}</b> / {result.total}
                {result.allCorrect ? " ✅ ผ่าน!" : " (ยังไม่ครบ ลองดู feedback แล้วจำแนกใหม่ได้)"}
              </div>
            </div>
          ) : null}
        </div>

        {/* ✅ ปุ่มด้านล่าง (สไตล์เดียวกับที่คุณใช้ใน 2.1) */}
        <div className="edu-card__footer">
          <div className="edu-actions">
            {/* ✅ ตรวจคำตอบ: ต้องตอบครบก่อน */}
            {!submitted ? (
              <button
                className="edu-btn edu-btn--primary"
                type="button"
                onClick={handleSubmit}
                disabled={!allAnswered}
                title={allAnswered ? "ตรวจคำตอบ" : "ตอบให้ครบทุกเคสก่อน"}
              >
                ตรวจคำตอบ
              </button>
            ) : (
              <button className="edu-btn edu-btn--next" type="button" onClick={handleReset} title="ทำใหม่">
                <FiRefreshCw aria-hidden="true" /> ทำใหม่
              </button>
            )}

            <div className="edu-taskFooter1">
              {/* ✅ ไป 2.3: ต้อง submit และตอบครบก่อน (กันข้ามแบบมั่ว) */}
              <button
                className="edu-btn edu-btn--ghost"
                type="button"
                onClick={() => onNext?.()}
                disabled={!(submitted && allAnswered)}
                title={submitted && allAnswered ? "ไป 2.3" : "ตรวจคำตอบให้ครบก่อน"}
              >
                ถัดไป <FiChevronRight aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
