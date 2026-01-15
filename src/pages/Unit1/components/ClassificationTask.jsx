// src/pages/Unit1/components/ClassificationTask.jsx
import { useMemo, useState, useEffect } from "react";
import {
  FiCheckCircle,
  FiXCircle,
  FiChevronRight,
  FiRefreshCw,
} from "react-icons/fi";
import { CLASSIFY_CARDS } from "../data/classifyCards";

/**
 * ✅ ClassificationTask
 * กิจกรรม 1.2 : จำแนกข้อมูล "ข้อมูลทั่วไป" vs "ข้อมูลอ่อนไหว"
 *
 * Props:
 * - onComplete(result): ส่งผลลัพธ์รวมให้ parent (Learn.jsx) เอาไป save progress
 * - onNext(): ไปขั้นถัดไป (1.3)
 */
export default function ClassificationTask({ onNext, onComplete }) {
  /**
   * placed:
   * {
   *   [cardId]: "general" | "sensitive"
   * }
   */
  const [placed, setPlaced] = useState({});

  /**
   * feedbackMap:
   * {
   *   [cardId]: {
   *     isCorrect: boolean,
   *     message: string,
   *     reason: string
   *   }
   * }
   */
  const [feedbackMap, setFeedbackMap] = useState({});

  /** ทำครบทุกใบแล้วหรือยัง */
  const [done, setDone] = useState(false);

  /** ✅ เก็บคะแนนเพื่อเอาไปแสดงผลบนหน้า */
  const [score, setScore] = useState(null); // { correct: number, total: number, percent: number }

  /** การ์ดทั้งหมด */
  const cards = useMemo(() => CLASSIFY_CARDS || [], []);

  /** จำนวนที่ตอบแล้ว */
  const countPlaced = useMemo(() => Object.keys(placed).length, [placed]);

  /** ตอบครบทุกใบ */
  const isAllAnswered = useMemo(
    () => countPlaced >= cards.length,
    [countPlaced, cards.length]
  );

  /**
   * ✅ เมื่อผู้เรียนตอบครบทุกการ์ด
   * - คำนวณคะแนน
   * - ส่งผลลัพธ์ให้ parent
   */
  useEffect(() => {
    // ✅ ยังตอบไม่ครบ: รีเซ็ตสถานะคะแนน/done เพื่อไม่ให้โชว์คะแนนค้าง
    if (!isAllAnswered) {
      setDone(false);
      setScore(null);
      return;
    }

    const results = cards.map((c) => {
      const userAnswer = placed[c.id];
      const correctAnswer = c.bucket; // ✅ ใช้ bucket จาก data
      const isCorrect = userAnswer === correctAnswer;

      return {
        id: c.id,
        label: c.label,
        userAnswer,
        correctAnswer,
        isCorrect,
      };
    });

    const correctCount = results.filter((r) => r.isCorrect).length;
    const total = cards.length;
    const percent = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    // ✅ อัปเดตคะแนนเพื่อแสดงผล
    setScore({ correct: correctCount, total, percent });

    setDone(true);

    // ✅ ส่งผลลัพธ์ให้ parent เก็บ progress
    onComplete?.({
      unit: "1.2",
      completed: true,
      total,
      correct: correctCount,
      percent,
      results,
      placed,
    });
  }, [isAllAnswered, cards, placed, onComplete]);

  /**
   * ✅ ผู้เรียนเลือกคำตอบให้การ์ด
   */
  function handleSelect(card, choice) {
    // บันทึกคำตอบ
    setPlaced((prev) => ({
      ...prev,
      [card.id]: choice,
    }));

    const isCorrect = choice === card.bucket;

    // ข้อความ feedback
    const message = isCorrect
      ? `✅ ถูกต้อง! “${card.label}” เป็นข้อมูลแบบ ${
          card.bucket === "sensitive" ? "อ่อนไหว" : "ทั่วไป"
        }`
      : `❌ ยังไม่ถูกนะ ลองคิดอีกที: “${card.label}” ควรเป็น ${
          card.bucket === "sensitive" ? "ข้อมูลอ่อนไหว" : "ข้อมูลทั่วไป"
        }`;

    // เหตุผล (ใช้จาก data เป็นหลัก)
    const reason = card.why
      ? card.why
      : card.bucket === "sensitive"
      ? "เพราะข้อมูลนี้ถ้าหลุด อาจสร้างความเสียหายสูง หรือใช้ยืนยันตัวตน/เข้าถึงบัญชีได้"
      : "เพราะข้อมูลนี้ยังไม่อ่อนไหวมาก แต่ถ้ารวมกับข้อมูลอื่นก็อาจระบุตัวตนได้";

    setFeedbackMap((prev) => ({
      ...prev,
      [card.id]: {
        isCorrect,
        message,
        reason,
      },
    }));
  }

  /**
   * ✅ เริ่มทำใหม่
   */
  function resetAll() {
    setPlaced({});
    setFeedbackMap({});
    setDone(false);
    setScore(null); // ✅ ล้างคะแนนด้วย
  }

  /**
   * ✅ helper: ใช้เช็คปุ่มที่ถูกเลือก
   */
  function isSelected(cardId, choice) {
    return placed?.[cardId] === choice;
  }

  return (
    <div className="edu-taskStage">
      {/* ===== Intro ===== */}
      <div className="edu-taskIntro">
        <div className="edu-taskIntro__desc">
          คลิกเลือกให้แต่ละการ์ดว่าเป็น “ข้อมูลทั่วไป” หรือ “ข้อมูลอ่อนไหว”
          แล้วดู feedback ทันที
        </div>

        <div className="edu-taskIntro__meta">
          ความคืบหน้า: <b>{countPlaced}</b> / <b>{cards.length}</b>
          {/* ✅ แสดงคะแนนเมื่อทำครบ */}
          {done && score && (
            <>
              {" "}
              • คะแนน: <b>{score.correct}</b> / <b>{score.total}</b> (
              <b>{score.percent}%</b>)
            </>
          )}
        </div>

        {/* ✅ (ทางเลือก) ทำเป็นบล็อกสรุปแยกให้เด่นขึ้น */}
        {done && score && (
          <div
            className="edu-taskIntro__meta"
            style={{ marginTop: 8, opacity: 0.95 }}
          >
            ✅ สรุปผล: ได้ <b>{score.correct}</b> จาก <b>{score.total}</b> ข้อ (
            <b>{score.percent}%</b>)
          </div>
        )}
      </div>

      {/* ===== Cards ===== */}
      <div className="edu-taskGrid">
        {cards.map((card) => {
          const fb = feedbackMap?.[card.id];

          return (
            <div key={card.id} className="edu-taskCard">
              {/* เนื้อการ์ด */}
              <div className="edu-taskCard__body">
                <div className="edu-taskCard__label">{card.label}</div>
                {card.example && (
                  <div className="edu-taskCard__example">{card.example}</div>
                )}
              </div>

              {/* ปุ่มเลือก */}
              <div className="edu-taskCard__actions">
                <button
                  type="button"
                  className={[
                    "edu-pill",
                    isSelected(card.id, "general") ? "is-active" : "",
                  ].join(" ")}
                  onClick={() => handleSelect(card, "general")}
                >
                  ข้อมูลทั่วไป
                </button>

                <button
                  type="button"
                  className={[
                    "edu-pill",
                    isSelected(card.id, "sensitive") ? "is-active" : "",
                  ].join(" ")}
                  onClick={() => handleSelect(card, "sensitive")}
                >
                  ข้อมูลอ่อนไหว
                </button>
              </div>

              {/* feedback */}
              {fb && (
                <div
                  className={[
                    "edu-taskCard__feedback",
                    fb.isCorrect ? "ok" : "warn",
                  ].join(" ")}
                >
                  <div className="edu-taskCard__feedbackRow">
                    {fb.isCorrect ? (
                      <FiCheckCircle aria-hidden="true" />
                    ) : (
                      <FiXCircle aria-hidden="true" />
                    )}

                    <div className="edu-taskCard__feedbackText">
                      <div className="edu-taskCard__feedbackMsg">{fb.message}</div>
                      <div className="edu-taskCard__feedbackReason">
                        {fb.reason}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ===== Footer ===== */}
      <div className="edu-taskFooter">
        <button
          type="button"
          className="edu-btn edu-btn--back"
          onClick={resetAll}
          title="เริ่มทำใหม่"
        >
          <FiRefreshCw aria-hidden="true" />
          เริ่มใหม่
        </button>

        <button
          type="button"
          className="edu-btn edu-btn--ghost"
          onClick={onNext}
          disabled={!done}
          title={!done ? "ทำให้ครบทุกการ์ดก่อน" : "ไป 1.3"}
        >
          ถัดไป <FiChevronRight aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
