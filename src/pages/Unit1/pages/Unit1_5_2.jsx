// src/pages/Unit1/pages/Unit1_5_2.jsx

import { useMemo, useState } from "react";

// ✅ Icons
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiChevronRight,
  FiLock,
  FiLogOut,
  FiShield,
  FiXCircle,
} from "react-icons/fi";

/**
 * ✅ Unit 1 - 5.2 (ตารางข้อ 5.4)
 * เป้าหมาย:
 * - ฝึก “เลือกการตอบสนอง” เมื่อเจอสัญญาณผิดปกติ
 * - เป็น adaptive task (แต่ไม่ใช้ AI) -> ใช้ rule-based
 *
 * Props:
 * - onNext(): จบบท 5 -> กลับหน้า Unit1 learn list
 * - mode: เผื่ออนาคต
 */
export default function Unit1_5_2({ onNext, mode = "all" }) {
  /**
   * ✅ เคสต่อเนื่อง (จำลองแบบเจอสถานการณ์จริง)
   * - actions: ตัวเลือกการตอบสนอง (ติ๊กได้หลายข้อ)
   * - correct: ชุดที่แนะนำให้ทำ (สำคัญ)
   * - avoid: ชุดที่ไม่ควรทำ (อันตราย/พลาด)
   */
  const CASES = useMemo(
    () => [
      {
        id: "r1",
        title: "เจอแจ้งเตือน ‘เข้าสู่ระบบจากอุปกรณ์ใหม่’ และ Location แปลก",
        risk: "high",
        prompt:
          "ถ้าคุณไม่ใช่คนทำเอง คุณควรทำอะไร ‘ทันที’ เพื่อหยุดความเสียหาย?",
        actions: [
          { id: "a1", label: "เปลี่ยนรหัสผ่านทันที", type: "good" },
          { id: "a2", label: "ออกจากระบบทุกอุปกรณ์/ทุกเซสชัน", type: "good" },
          { id: "a3", label: "ตรวจรายการอุปกรณ์ที่ล็อกอินอยู่", type: "good" },
          { id: "a4", label: "กด ‘นี่ไม่ใช่ฉัน’ ในหน้าการแจ้งเตือน (ถ้ามี)", type: "good" },
          { id: "a5", label: "ปล่อยไว้ก่อน เดี๋ยวค่อยดู", type: "bad" },
          { id: "a6", label: "ส่งรหัสผ่านให้เพื่อนช่วยเช็ค", type: "bad" },
        ],
        correct: ["a1", "a2", "a3"],
        bonus: ["a4"],
        avoid: ["a5", "a6"],
        explain:
          "เคสนี้เสี่ยงสูง เพราะเป็นการเข้าถึงบัญชีจริง ๆ การเปลี่ยนรหัสผ่าน + ออกจากระบบทุกเครื่องช่วยตัดคนร้ายออกทันที",
      },
      {
        id: "r2",
        title: "ได้อีเมลให้กดลิงก์รีเซ็ตรหัสผ่าน แต่โดเมนผู้ส่งดูเพี้ยน",
        risk: "high",
        prompt: "คุณควรรับมือยังไงถึงจะปลอดภัยที่สุด?",
        actions: [
          { id: "b1", label: "ไม่กดลิงก์ในอีเมล", type: "good" },
          { id: "b2", label: "เข้าแอป/เว็บจริงเอง (พิมพ์เอง) เพื่อเช็คแจ้งเตือน", type: "good" },
          { id: "b3", label: "รายงานอีเมลเป็น phishing / spam", type: "good" },
          { id: "b4", label: "กดลิงก์แล้วกรอกข้อมูลเร็ว ๆ จะได้จบ", type: "bad" },
          { id: "b5", label: "ส่งต่ออีเมลนี้ให้เพื่อนกดดูให้", type: "bad" },
        ],
        correct: ["b1", "b2"],
        bonus: ["b3"],
        avoid: ["b4", "b5"],
        explain:
          "หลักคือ ‘อย่าคลิกลิงก์จากแหล่งที่ไม่น่าไว้ใจ’ ให้เข้าแอป/เว็บจริงเอง แล้วค่อยจัดการจากในระบบ",
      },
      {
        id: "r3",
        title: "เจอ SMS พัสดุติดปัญหาแนบลิงก์สั้น (short link)",
        risk: "medium",
        prompt:
          "เลือกวิธีตอบสนองที่เหมาะ (เน้นลดความเสี่ยงก่อน แล้วค่อยตรวจให้ชัวร์)",
        actions: [
          { id: "c1", label: "ไม่กดลิงก์สั้น", type: "good" },
          { id: "c2", label: "ตรวจจากแอป/เว็บขนส่งจริงด้วยเลขพัสดุ", type: "good" },
          { id: "c3", label: "บล็อก/รายงานเบอร์ที่ส่งข้อความ", type: "good" },
          { id: "c4", label: "กดลิงก์เพื่อดูว่าจริงไหม", type: "bad" },
        ],
        correct: ["c1", "c2"],
        bonus: ["c3"],
        avoid: ["c4"],
        explain:
          "เคสนี้ยังไม่ 100% ว่าปลอม แต่ ‘ลิงก์สั้น’ เสี่ยงสูง ให้ตรวจผ่านช่องทางจริงแทน",
      },
    ],
    []
  );

  // ✅ index เคสปัจจุบัน
  const [idx, setIdx] = useState(0);

  // ✅ เก็บ action ที่ผู้เรียนเลือก
  const [picked, setPicked] = useState({}); // { [actionId]: true }

  // ✅ โหมด feedback
  const [showFeedback, setShowFeedback] = useState(false);

  // ✅ เคสปัจจุบัน
  const current = CASES[idx];

  // ✅ รายการที่เลือก
  const pickedIds = useMemo(() => {
    return Object.entries(picked)
      .filter(([, v]) => v)
      .map(([k]) => k);
  }, [picked]);

  /**
   * ✅ ประเมินผลแบบ rule-based
   * - pass: เลือก correct ครบอย่างน้อย 2 ในชุดสำคัญ (หรือครบทั้งหมดก็ได้)
   * - penalty: ถ้าเลือก avoid -> ติดลบหนัก
   * - bonus: เลือก bonus -> เพิ่มคะแนน/คำชม
   */
  const evaluation = useMemo(() => {
    const correctSet = new Set(current.correct);
    const bonusSet = new Set(current.bonus || []);
    const avoidSet = new Set(current.avoid || []);

    const correctPicked = pickedIds.filter((id) => correctSet.has(id));
    const bonusPicked = pickedIds.filter((id) => bonusSet.has(id));
    const avoidPicked = pickedIds.filter((id) => avoidSet.has(id));

    // ✅ กติกาผ่าน: ถูกอย่างน้อย 2 ข้อจากชุดหลัก และไม่เลือกข้ออันตราย
    const pass =
      correctPicked.length >= Math.min(2, current.correct.length) &&
      avoidPicked.length === 0;

    return {
      pass,
      correctPicked,
      bonusPicked,
      avoidPicked,
    };
  }, [current, pickedIds]);

  // ✅ ไปเคสถัดไป / จบ
  const goNext = () => {
    if (idx < CASES.length - 1) {
      setIdx((v) => v + 1);
      setPicked({});
      setShowFeedback(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    onNext?.();
  };

  // ✅ Risk badge + icon
  const riskBadge = useMemo(() => {
    if (current.risk === "high") {
      return (
        <span className="edu-badge edu-badge--warn" title="เสี่ยงสูง">
          <FiAlertTriangle aria-hidden="true" />
          เสี่ยงสูง
        </span>
      );
    }
    return (
      <span className="edu-badge edu-badge--safe" title="เสี่ยงกลาง">
        <FiShield aria-hidden="true" />
        เสี่ยงกลาง
      </span>
    );
  }, [current.risk]);

  // ✅ helper: status text for each action (ตอนเฉลย)
  const getActionStatus = (actionId) => {
    if (current.avoid.includes(actionId)) {
      return { kind: "bad", icon: <FiXCircle aria-hidden="true" />, text: "ไม่ควรทำ (เพิ่มความเสี่ยง)" };
    }
    if (current.correct.includes(actionId)) {
      return { kind: "good", icon: <FiCheckCircle aria-hidden="true" />, text: "ควรทำ (สำคัญ)" };
    }
    if ((current.bonus || []).includes(actionId)) {
      return { kind: "bonus", icon: <FiCheckCircle aria-hidden="true" />, text: "ทำเพิ่มได้ (ดีมาก)" };
    }
    return { kind: "neutral", icon: null, text: "ทำได้ แต่ไม่ใช่หัวใจของเคสนี้" };
  };

  return (
    <div className="edu-card" style={{ padding: 16 }}>
      {/* ✅ Intro */}
      <div className="u54-intro">
        <div className="edu-chip" aria-hidden="true">
          <FiLock />
        </div>

        <div>
          <div className="edu-h2" style={{ marginBottom: 6 }}>
            ภารกิจ: เจอสัญญาณแล้ว “ต้องทำอะไรทันที”
          </div>
          <div className="edu-muted">
            เลือกได้หลายข้อ เพราะของจริงเรามักต้องทำหลายอย่างต่อเนื่อง (เน้น “หยุดความเสียหายก่อน”)
          </div>
        </div>
      </div>

      <div className="edu-divider" style={{ margin: "16px 0" }} />

      {/* ✅ Case header */}
      <div className="u54-header">
        {riskBadge}
        <span className="edu-badge">
          เคส {idx + 1}/{CASES.length}
        </span>
      </div>

      <div className="edu-h3" style={{ marginTop: 10 }}>
        {current.title}
      </div>

      {/* ✅ Prompt card (แบบ “มะกี้”) */}
      <div className="edu-glasscard u54-promptCard" style={{ marginTop: 10, padding: 14 }}>
        <div className="u54-promptTop">
          <span className="u54-dot" aria-hidden="true" />
          <div className="u54-promptLabel">โจทย์</div>
        </div>

        <div className="edu-body u54-promptText" style={{ marginTop: 10 }}>
          {current.prompt}
        </div>
      </div>

      {/* ✅ Actions list */}
      <div className="edu-h4" style={{ marginTop: 16 }}>
        เลือกสิ่งที่คุณจะทำ
      </div>

      <div className="u54-list" style={{ display: "grid", gap: 10, marginTop: 10 }}>
        {current.actions.map((a) => {
          const checked = !!picked[a.id];
          const status = showFeedback ? getActionStatus(a.id) : null;

          return (
            <label
              key={a.id}
              className={`edu-choice u54-choice ${showFeedback ? "u54-choice--locked" : ""}`}
              style={{
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
                padding: 12,
                borderRadius: 14,
                cursor: showFeedback ? "not-allowed" : "pointer",
                opacity: showFeedback ? 0.9 : 1,
              }}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={showFeedback}
                onChange={(e) => {
                  if (showFeedback) return;
                  setPicked((prev) => ({ ...prev, [a.id]: e.target.checked }));
                }}
                style={{ marginTop: 2 }}
              />

              <div style={{ flex: 1 }}>
                <div className="u54-choiceTop">
                  <div className="edu-body">{a.label}</div>

                  {/* ✅ ก่อนเฉลย: แปะ pill เล็ก ๆ ให้ดูเป็น UI */}
                  {!showFeedback && (
                    <span className="edu-pill" aria-hidden="true">
                      เลือกได้
                    </span>
                  )}
                </div>

                {/* ✅ เฉลยแล้ว: แปะสถานะให้ดูง่าย */}
                {showFeedback && (
                  <div className={`u54-status u54-status--${status.kind}`}>
                    <span className="u54-statusIcon">{status.icon}</span>
                    <span className="u54-statusText">{status.text}</span>
                  </div>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {/* ✅ Controls */}
      <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
        {!showFeedback ? (
          <>
            <button
              className="edu-btn edu-btn--primary"
              type="button"
              onClick={() => {
                if (pickedIds.length === 0) {
                  alert("เลือกอย่างน้อย 1 ข้อก่อนนะ แล้วค่อยตรวจคำตอบ");
                  return;
                }
                setShowFeedback(true);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              title="ตรวจคำตอบ"
            >
              ตรวจคำตอบ <FiChevronRight aria-hidden="true" />
            </button>

            <button
              className="edu-btn edu-btn--danger"
              type="button"
              onClick={() => setPicked({})}
              title="ล้างที่เลือก"
            >
              ล้างที่เลือก
            </button>
          </>
        ) : (
          <>
            <button className="edu-btn edu-btn--ghost" type="button" onClick={goNext} title="ไปต่อ">
              {idx < CASES.length - 1 ? "ไปเคสถัดไป" : "เสร็จสิ้น"}
              <FiChevronRight aria-hidden="true" />
            </button>

            <button
              className="edu-btn edu-btn--danger"
              type="button"
              onClick={() => {
                setPicked({});
                setShowFeedback(false);
              }}
              title="ลองใหม่"
            >
              ลองใหม่
            </button>
          </>
        )}
      </div>

      {/* ✅ Feedback */}
      {showFeedback && (
        <div className="edu-glasscard u54-feedback" style={{ marginTop: 16, padding: 14 }}>
          <div className="u54-feedbackTop">
            {evaluation.pass ? <FiCheckCircle aria-hidden="true" /> : <FiAlertTriangle aria-hidden="true" />}
            <div className="edu-h4" style={{ margin: 0 }}>
              {evaluation.pass ? "ผ่าน ✅ เลือกการตอบสนองได้เหมาะ" : "ยังไม่ผ่าน ❗ ลองปรับให้ปลอดภัยขึ้น"}
            </div>
          </div>

          <div className="edu-divider" style={{ margin: "12px 0" }} />

          <div className="edu-body" style={{ marginBottom: 10 }}>
            {current.explain}
          </div>

          <div className="edu-callout">
            <div className="edu-body" style={{ marginBottom: 8 }}>
              สรุปที่คุณทำ:
            </div>

            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>เลือกถูก (สำคัญ): {evaluation.correctPicked.length} ข้อ</li>
              <li>ตัวเลือกเสริม (ดีมาก): {evaluation.bonusPicked.length} ข้อ</li>
              <li>สิ่งที่ไม่ควรทำ: {evaluation.avoidPicked.length} ข้อ</li>
            </ul>

            {evaluation.avoidPicked.length > 0 && (
              <div className="edu-muted" style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center" }}>
                <FiLogOut aria-hidden="true" />
                ถ้าเลือก “ทำแบบเสี่ยง” ระบบจะถือว่ายังไม่ผ่าน เพราะของจริงมันพาเราเข้ากับดักได้
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
