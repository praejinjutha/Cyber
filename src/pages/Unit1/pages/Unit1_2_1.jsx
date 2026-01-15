// src/pages/Unit1/pages/Unit1_2_1.jsx
import { useEffect, useMemo, useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiCheckCircle,
  FiAlertTriangle,
  FiHelpCircle,
  
} from "react-icons/fi";

import { MdLightbulbOutline } from "react-icons/md";


/**
 * ✅ Unit1_2_1.jsx (2.1)
 * - ไฟล์เดียวจบ: การ์ด 3 ระดับ + ตัวอย่าง + mini quiz + ปุ่มไป 2.2
 * - ไม่สร้าง CSS แยก เพื่อลดโอกาส class ทับกัน
 * - ใช้ class เดิมของระบบ (edu-btn ฯลฯ) + inline style เฉพาะคอมโพเนนต์นี้
 *
 * Props:
 * - initialProgress: object | null (จาก localStorage/progress.js)
 * - onComplete(progress): เรียกเพื่อบันทึกความคืบหน้า
 * - onNext(): ไป 2.2
 */



export default function Unit1_2_1({ initialProgress, onComplete, onNext }) {
  /* ---------------------------------------------------------------------- */
  /* ✅ Data (อยู่ในไฟล์เดียวตามที่ขอ)                                       */
  /* ---------------------------------------------------------------------- */

  // ✅ 3 การ์ด: Public / Group / Private + ตัวอย่าง (เชื่อมไป 2.4: เช็คอิน/โพสต์รูป/แชร์เอกสาร)
const CARDS = useMemo(
  () => [
    {
      id: "public",
      title: "Public (สาธารณะ)",
      badge: "เข้าถึงได้ทั่วไป",
      meaning:
        "ข้อมูลที่ไม่สามารถระบุตัวตนรายบุคคลได้โดยตรง (Non-PII) และไม่ส่งผลกระทบต่อความปลอดภัย แม้บุคคลภายนอกจะเข้าถึงก็ไม่ก่อให้เกิดความเสี่ยง",
      examples: [
        "ภาพบรรยากาศกิจกรรมในมุมกว้างที่ไม่เห็นใบหน้าหรือป้ายชื่อชัดเจน",
        "สื่อประชาสัมพันธ์กิจกรรมทั่วไปที่ไม่มีข้อมูลติดต่อส่วนบุคคล",
      ],
      rule:
        " หากข้อมูลสามารถนำไปสืบค้นต่อจนระบุตัวตนได้โดยง่าย ไม่ควรตั้งค่าเป็น Public",
    },
    {
      id: "group",
      title: "Group (จำกัดเฉพาะกลุ่ม)",
      badge: "เฉพาะผู้มีส่วนเกี่ยวข้อง",
      meaning:
        "การแบ่งปันข้อมูลภายในกลุ่มที่มีวัตถุประสงค์เฉพาะ เช่น การเรียน การทำงาน หรือกิจกรรมที่ต้องมีการควบคุมสมาชิกและสิทธิ์การเข้าถึง",
      examples: [
        "ตารางปฏิบัติงานหรือกำหนดการส่งงานภายในกลุ่มปิด",
        "ภาพถ่ายกิจกรรมเฉพาะสมาชิกในห้องเรียนหรือชมรม",
      ],
      rule:
        " ควรจำกัดการเข้าถึงเฉพาะผู้ที่มีความจำเป็นต้องใช้ข้อมูล และสามารถระบุตัวผู้เข้าถึงได้",
    },
    {
      id: "private",
      title: "Private (ส่วนตัว)",
      badge: "เฉพาะบุคคลหรือผู้ได้รับอนุญาต",
      meaning:
        "ข้อมูลส่วนบุคคลหรือข้อมูลอ่อนไหว (Sensitive Data) ที่ผูกพันกับเอกลักษณ์เฉพาะตัว หากรั่วไหลอาจกระทบต่อสิทธิเสรีภาพ ความเป็นส่วนตัว หรือความปลอดภัยของบุคคล",
      examples: [
        "ผลการเรียน รายชื่อพร้อมเลขประจำตัวประชาชน หรือที่อยู่",
        "รหัสผ่าน เบอร์โทรศัพท์ส่วนตัว และเอกสารสำคัญทางการเงิน",
      ],
      rule:
        " ใช้หลักการรู้เฉพาะเท่าที่จำเป็น (Need-to-Know Basis) ยิ่งจำกัดการเข้าถึงให้แคบที่สุด ยิ่งลดความเสี่ยงได้มากขึ้น",
    },
  ],
  []
);



  // ✅ mini quiz 3 ข้อ (เบา ๆ แต่มี feedback)
  const QUIZ = useMemo(
    () => [
      {
        id: "q1",
        prompt:
          "โพสต์รูปบรรยากาศหน้าโรงเรียน แต่ไม่ได้ติดหน้าใครชัด และไม่มีป้ายชื่อ/แท็กคน",
        choices: [
          { id: "public", label: "Public" },
          { id: "group", label: "Group" },
          { id: "private", label: "Private" },
        ],
        answer: "public",
        why:
          "คนทั่วไปเห็นได้ แต่ไม่ได้ระบุตัวบุคคลชัด และไม่เผยข้อมูลส่วนตัว → มักจัดเป็น Public ได้",
      },
      {
        id: "q2",
        prompt: "แชร์ “ตารางเวร/ตารางส่งงาน” ลงในกลุ่มไลน์ห้องเรียน",
        choices: [
          { id: "public", label: "Public" },
          { id: "group", label: "Group" },
          { id: "private", label: "Private" },
        ],
        answer: "group",
        why:
          "เป็นข้อมูลสำหรับคนที่เกี่ยวข้องในบริบทเดียวกัน ไม่จำเป็นต้องให้คนทั้งโลกเห็น → เหมาะกับ Group",
      },
      {
        id: "q3",
        prompt:
          "ส่งลิงก์เอกสารคะแนนรายบุคคลที่เปิดดูได้เฉพาะเจ้าของและครูประจำวิชา",
        choices: [
          { id: "public", label: "Public" },
          { id: "group", label: "Group" },
          { id: "private", label: "Private" },
        ],
        answer: "private",
        why:
          "คะแนนรายบุคคลผูกกับตัวตนและกระทบความเป็นส่วนตัว → ควรจำกัดเป็น Private",
      },
    ],
    []
  );

  /* ---------------------------------------------------------------------- */
  /* ✅ Progress / State                                                     */
  /* ---------------------------------------------------------------------- */

  // ✅ เริ่มการ์ดใบไหน (ถ้ามี progress เดิม)
  const [cardIndex, setCardIndex] = useState(() => initialProgress?.cardIndex ?? 0);

  // ✅ โหมดหน้าจอ: "cards" | "quiz"
  const [view, setView] = useState(() => initialProgress?.view ?? "cards");

  // ✅ คำตอบ quiz: { [qId]: choiceId }
  const [answers, setAnswers] = useState(() => initialProgress?.answers ?? {});

  // ✅ แสดง feedback หลัง submit หรือไม่
  const [submitted, setSubmitted] = useState(() => initialProgress?.submitted ?? false);

  // ✅ sync เมื่อ initialProgress เปลี่ยน (กันกรณีโหลดช้าจาก supabase)
  useEffect(() => {
    if (!initialProgress) return;
    setCardIndex(initialProgress.cardIndex ?? 0);
    setView(initialProgress.view ?? "cards");
    setAnswers(initialProgress.answers ?? {});
    setSubmitted(initialProgress.submitted ?? false);
  }, [initialProgress]);

  // ✅ การ์ดปัจจุบัน
  const activeCard = useMemo(() => CARDS[cardIndex], [CARDS, cardIndex]);

  // ✅ คำนวณคะแนน quiz
  const score = useMemo(() => {
    let s = 0;
    for (const q of QUIZ) {
      if (answers[q.id] && answers[q.id] === q.answer) s += 1;
    }
    return s;
  }, [QUIZ, answers]);

  // ✅ ทำให้รู้ว่า “ตอบครบทุกข้อหรือยัง”
  const allAnswered = useMemo(() => QUIZ.every((q) => !!answers[q.id]), [QUIZ, answers]);

  // ✅ บันทึก progress ทุกครั้งที่ state สำคัญเปลี่ยน (แต่ไม่ถี่เกินจำเป็น)
  useEffect(() => {
    onComplete?.({
      cardIndex,
      view,
      answers,
      submitted,
      score, // เก็บไว้เผื่อใช้ต่อ
      completed: view === "quiz" && submitted && allAnswered, // เงื่อนไขเสร็จแบบเบา ๆ
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardIndex, view, answers, submitted]);

  /* ---------------------------------------------------------------------- */
  /* ✅ Handlers                                                             */
  /* ---------------------------------------------------------------------- */

  // ✅ ไปการ์ดก่อนหน้า
  const prevCard = () => {
    setSubmitted(false); // กัน feedback quiz ค้าง
    setCardIndex((i) => Math.max(0, i - 1));
  };

  // ✅ ไปการ์ดถัดไป
  const nextCard = () => {
    setSubmitted(false);
    setCardIndex((i) => Math.min(CARDS.length - 1, i + 1));
  };

  // ✅ เลือกคำตอบ quiz
  const choose = (qId, choiceId) => {
    setSubmitted(false); // เปลี่ยนคำตอบแล้วให้ submit ใหม่
    setAnswers((prev) => ({ ...prev, [qId]: choiceId }));
  };

  // ✅ ส่งคำตอบ quiz
  const submitQuiz = () => {
    setSubmitted(true);
    // ✅ บันทึก progress อีกรอบแบบชัวร์
    onComplete?.({
      cardIndex,
      view: "quiz",
      answers,
      submitted: true,
      score,
      completed: allAnswered,
    });
  };

  // ✅ ไปหน้า quiz
  const goQuiz = () => {
    setView("quiz");
    setSubmitted(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ กลับไปอ่านการ์ด
  const goCards = () => {
    setView("cards");
    setSubmitted(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ---------------------------------------------------------------------- */
  /* ✅ UI helpers                                                           */
  /* ---------------------------------------------------------------------- */

  // ✅ สไตล์กรอบหลัก (inline เพื่อไม่ชน CSS)
  const boxStyle = {
    border: "1px solid rgba(0,0,0,0.08)",
    background: "rgba(255,255,255,0.65)",
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
  };

  const softText = { opacity: 0.85, lineHeight: 1.6 };

  // ✅ สไตล์ป้าย badge
  const badgeStyle = (tone = "neutral") => {
    const map = {
      neutral: { bg: "rgba(2,132,199,0.10)", bd: "rgba(2,132,199,0.25)", tx: "#0f172a" },
      ok: { bg: "rgba(16,185,129,0.10)", bd: "rgba(16,185,129,0.25)", tx: "#0f172a" },
      warn: { bg: "rgba(245,158,11,0.10)", bd: "rgba(245,158,11,0.25)", tx: "#0f172a" },
    };
    const c = map[tone] || map.neutral;
    return {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "6px 10px",
      borderRadius: 999,
      border: `1px solid ${c.bd}`,
      background: c.bg,
      color: c.tx,
      fontWeight: 800,
      fontSize: 13,
      width: "fit-content",
    };
  };

  // ✅ สไตล์ปุ่มเลือกคำตอบ (pill)
  const pillStyle = (active) => ({
    borderRadius: 999,
    padding: "10px 12px",
    fontWeight: 800,
    border: active ? "1px solid rgba(34,197,94,0.35)" : "1px solid rgba(0,0,0,0.10)",
    background: active ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.7)",
    cursor: "pointer",
    transition: "0.15s ease",
  });

  /* ---------------------------------------------------------------------- */
  /* ✅ Render                                                               */
  /* ---------------------------------------------------------------------- */

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {/* ✅ Intro สั้น ๆ (ไม่เยอะตามที่สไตล์โปรเจกต์ต้องการ) */}
      <div style={{ ...boxStyle, padding: 14 }}>
        <div style={{ fontWeight: 900, fontSize: 15, marginBottom: 6 }}>
          “ข้อมูลเดียวกัน” แต่ “คนที่เห็นต่าง” = ความเสี่ยงต่าง
        </div>

      </div>

      {/* ------------------------------------------------------------------ */}
      {/* ✅ VIEW: CARDS                                                      */}
      {/* ------------------------------------------------------------------ */}
      {view === "cards" && (
        <div style={boxStyle}>
          {/* Header ของการ์ด */}
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 950, marginBottom: 6 }}>
                {activeCard.title}
              </div>

              <div style={badgeStyle(cardIndex === 0 ? "neutral" : cardIndex === 1 ? "warn" : "ok")}>
                <FiHelpCircle aria-hidden="true" />
                {activeCard.badge}
              </div>
            </div>

            <div style={{ fontSize: 12, opacity: 0.8, alignSelf: "center" }}>
              การ์ด {cardIndex + 1} / {CARDS.length}
            </div>
          </div>

          {/* เนื้อหา */}
          <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
            <div style={{ fontWeight: 900, fontSize: 13 }}>ความหมาย</div>
            <div style={softText}>{activeCard.meaning}</div>

            <div style={{ fontWeight: 900, fontSize: 13, marginTop: 6 }}>ตัวอย่าง</div>
            <ul style={{ margin: 0, paddingLeft: 18, ...softText }}>
              {activeCard.examples.map((ex, idx) => (
                <li key={idx} style={{ marginBottom: 6 }}>
                  {ex}
                </li>
              ))}
            </ul>

            <div
              style={{
                marginTop: 6,
                border: "1px solid rgba(0,0,0,0.08)",
                background: "rgba(255,255,255,0.6)",
                borderRadius: 14,
                padding: 12,
              }}
            >
              <div
  style={{
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontWeight: 900,
    fontSize: 12,
    padding: "4px 8px",
    borderRadius: 999,
    background: "rgba(250, 204, 21, 0.15)",
    color: "#92400e",
    marginBottom: 4,
  }}
>
  <MdLightbulbOutline style={{ color: "#facc15" }} />
  คิดสั้น ๆ
</div>

              <div style={softText}>{activeCard.rule}</div>
            </div>
          </div>

{/* Actions */}
<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 14,
    flexWrap: "wrap",
  }}
>
  {/* ปุ่มก่อนหน้า (มีตลอด ยกเว้นใบแรก disable) */}
  <button
    className="edu-btn edu-btn--back"
    type="button"
    onClick={prevCard}
    disabled={cardIndex === 0}
    title="ก่อนหน้า"
  >
    <FiChevronLeft aria-hidden="true" /> ก่อนหน้า
  </button>

  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
    {/* ✅ ปุ่มต่อไป: แสดงเฉพาะตอนยังไม่ถึงการ์ดสุดท้าย */}
    {cardIndex < CARDS.length - 1 && (
      <button
        className="edu-btn edu-btn--ghost"
        type="button"
        onClick={nextCard}
        title="ถัดไป"
      >
        ถัดไป <FiChevronRight aria-hidden="true" />
      </button>
    )}

    {/* ✅ ปุ่ม mini quiz: แสดงเฉพาะการ์ด 3/3 */}
    {cardIndex === CARDS.length - 1 && (
      <button
        className="edu-btn edu-btn--primary"
        type="button"
        onClick={goQuiz}
        title="ทำคำถามสั้น ๆ"
      >
        mini quiz <FiChevronRight aria-hidden="true" />
      </button>
    )}
  </div>
</div>

        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* ✅ VIEW: QUIZ                                                       */}
      {/* ------------------------------------------------------------------ */}
      {view === "quiz" && (
        <div style={boxStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 950, marginBottom: 6 }}>mini quiz</div>
              <div style={softText}>เลือกให้เหมาะกับ “คนที่ควรเห็น”</div>
            </div>

            <div style={{ fontSize: 12, opacity: 0.8, alignSelf: "center" }}>
              ตอบแล้ว {Object.keys(answers).length} / {QUIZ.length}
            </div>
          </div>

          <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
            {QUIZ.map((q, idx) => {
              const picked = answers[q.id];

              // ✅ สถานะถูก/ผิดหลัง submit
              const isCorrect = submitted && picked === q.answer;
              const isWrong = submitted && picked && picked !== q.answer;

              return (
                <div
                  key={q.id}
                  style={{
                    borderRadius: 14,
                    border: "1px solid rgba(0,0,0,0.08)",
                    background: "rgba(255,255,255,0.55)",
                    padding: 12,
                  }}
                >
                  <div style={{ fontWeight: 900, marginBottom: 6 }}>
                    {idx + 1}. {q.prompt}
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
                    {q.choices.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => choose(q.id, c.id)}
                        style={pillStyle(picked === c.id)}
                        aria-pressed={picked === c.id}
                        title={c.label}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>

                  {/* ✅ Feedback เฉพาะเมื่อกด submit */}
                  {submitted && (
                    <div style={{ marginTop: 10 }}>
                      {isCorrect && (
                        <div
                          style={{
                            display: "flex",
                            gap: 10,
                            alignItems: "flex-start",
                            padding: 10,
                            borderRadius: 12,
                            border: "1px solid rgba(16,185,129,0.25)",
                            background: "rgba(16,185,129,0.10)",
                          }}
                        >
                          <FiCheckCircle aria-hidden="true" />
                          <div>
                            <div style={{ fontWeight: 900 }}>ถูกต้อง</div>
                            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>{q.why}</div>
                          </div>
                        </div>
                      )}

                      {isWrong && (
                        <div
                          style={{
                            display: "flex",
                            gap: 10,
                            alignItems: "flex-start",
                            padding: 10,
                            borderRadius: 12,
                            border: "1px solid rgba(245,158,11,0.25)",
                            background: "rgba(245,158,11,0.10)",
                          }}
                        >
                          <FiAlertTriangle aria-hidden="true" />
                          <div>
                            <div style={{ fontWeight: 900 }}>ยังไม่ตรง</div>
                            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>{q.why}</div>
                          </div>
                        </div>
                      )}

                      {!picked && (
                        <div
                          style={{
                            display: "flex",
                            gap: 10,
                            alignItems: "flex-start",
                            padding: 10,
                            borderRadius: 12,
                            border: "1px solid rgba(220,38,38,0.18)",
                            background: "rgba(220,38,38,0.08)",
                          }}
                        >
                          <FiAlertTriangle aria-hidden="true" />
                          <div>
                            <div style={{ fontWeight: 900 }}>ยังไม่ได้เลือกคำตอบ</div>
                            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>
                              เลือก 1 ตัวเลือกก่อนนะ
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer actions */}
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
            <button className="edu-btn edu-btn--back" type="button" onClick={goCards} title="กลับไปดูการ์ด">
              <FiChevronLeft aria-hidden="true" /> กลับไปดูการ์ด
            </button>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                className="edu-btn edu-btn--primary"
                type="button"
                onClick={submitQuiz}
                disabled={!allAnswered}
                title={allAnswered ? "ตรวจคำตอบ" : "ตอบให้ครบก่อน"}
              >
                ตรวจคำตอบ
              </button>

              {/* ✅ ไป 2.2: ต้อง submit และตอบครบก่อน (กันข้ามแบบมั่ว) */}
              <button
                className="edu-btn edu-btn--ghost"
                type="button"
                onClick={() => onNext?.()}
                disabled={!(submitted && allAnswered)}
                title={submitted && allAnswered ? "ไป 2.2" : "ตรวจคำตอบให้ครบก่อน"}
              >
                ถัดไป <FiChevronRight aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* คะแนนเล็ก ๆ (ไม่รบกวน UI) */}
          {submitted && (
            <div style={{ marginTop: 10, fontSize: 12, opacity: 0.8 }}>
              คะแนน: {score}/{QUIZ.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
