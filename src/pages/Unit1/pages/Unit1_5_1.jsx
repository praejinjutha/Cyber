// src/pages/Unit1/pages/Unit1_5_1.jsx

import { useMemo, useState } from "react";

// ✅ Icons
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiChevronRight,
  FiInfo,
  FiMapPin,
  FiMonitor,
  FiShield,
} from "react-icons/fi";

/**
 * ✅ Unit 1 - 5.1 (รวม 5.2 + 5.3)
 * เป้าหมาย:
 * - ให้ผู้เรียน “ชี้สัญญาณผิดปกติ” จากข้อความแจ้งเตือน/อีเมล
 * - และ “เห็นระดับความเสี่ยง” ผ่าน feedback (ไม่ต้องแยกหน้า 5.3)
 *
 * Props:
 * - onNext(): ไปหน้า 5.4 (Unit1_5_2)
 * - mode: เผื่ออนาคต
 */
export default function Unit1_5_1({ onNext, mode = "all" }) {
  /**
   * ✅ เคสฝึก (เหมือนสถานการณ์จริง)
   * - signals: จุดที่ถือว่า “ผิดปกติ” และระดับความเสี่ยง
   * - เราออกแบบให้ผู้เรียน “กดเลือก checkbox” เพื่อชี้จุดที่น่าสงสัย
   */
  const CASES = useMemo(
    () => [
      {
        id: "c1",
        title: "แจ้งเตือน: มีการเข้าสู่ระบบจากอุปกรณ์ใหม่",
        channel: "In-app notification",
        body: "เราเห็นการเข้าสู่ระบบบัญชีของคุณจากอุปกรณ์ใหม่: Windows (Chrome) เมื่อ 2 นาทีที่แล้ว",
        meta: {
          time: "2 นาทีที่แล้ว",
          location: "Russia (Moscow)",
          device: "Windows • Chrome",
        },
        // ✅ “คำตอบ” ที่เราต้องการให้เด็กชี้
        signals: [
          {
            id: "s1",
            label: "ตำแหน่ง (Location) แปลก: Russia (Moscow)",
            risk: "high",
            why: "ถ้าไม่ใช่เรา แปลว่ามีคนพยายามเข้าถึงบัญชีจริง ๆ",
          },
          {
            id: "s2",
            label: "อุปกรณ์ใหม่ที่เราไม่รู้จัก",
            risk: "medium",
            why: "อาจเป็นเราหรือไม่ใช่เรา ต้องตรวจสอบรายการอุปกรณ์/เซสชัน",
          },
          {
            id: "s3",
            label: "เวลาเกิดเหตุ ‘เมื่อ 2 นาทีที่แล้ว’ (สดมาก)",
            risk: "medium",
            why: "ยิ่งใหม่ ยิ่งต้องรีบเช็คเพื่อหยุดก่อนความเสียหายลาม",
          },
        ],
        decoys: [
          {
            id: "d1",
            label: "ข้อความแจ้งเตือนมีคำว่า Windows/Chrome",
            why: "การบอกชนิดอุปกรณ์เป็นเรื่องปกติ ไม่ได้แปลว่าอันตรายเสมอไป",
          },
        ],
      },
      {
        id: "c2",
        title: "อีเมล: ขอรีเซ็ตรหัสผ่าน",
        channel: "Email",
        body: "เราได้รับคำขอรีเซ็ตรหัสผ่านของคุณ หากเป็นคุณให้กดปุ่ม Reset Password",
        meta: {
          from: "security@faceb00k-support.com",
          subject: "Reset your password now",
        },
        signals: [
          {
            id: "s1",
            label: "อีเมลผู้ส่งดูแปลก (โดเมนเพี้ยน faceb00k-support)",
            risk: "high",
            why: "โดเมนปลอมคือสัญญาณคลาสสิกของ phishing",
          },
          {
            id: "s2",
            label: "เรายังไม่ได้กดลืมรหัสผ่านเอง",
            risk: "high",
            why: "มีคนพยายามยึดบัญชี หรือหลอกให้กดลิงก์",
          },
        ],
        decoys: [
          {
            id: "d1",
            label: "หัวข้ออีเมลมีคำว่า Reset password",
            why: "หัวข้อแบบนี้เจอได้ปกติ ต้องดู ‘โดเมน/บริบท’ มากกว่า",
          },
        ],
      },
      {
        id: "c3",
        title: "SMS: พัสดุติดปัญหา ให้กรอกข้อมูล",
        channel: "SMS",
        body: "พัสดุของคุณติดปัญหา กรุณากรอกที่อยู่ใหม่ที่ลิงก์นี้: http://short.ly/ab12",
        meta: {
          time: "วันนี้ 09:12",
          hint: "http://short.ly/ab12",
        },
        signals: [
          {
            id: "s1",
            label: "ลิงก์สั้น/ไม่เห็นโดเมนจริง (short link)",
            risk: "high",
            why: "ซ่อนปลายทางจริง เสี่ยงพาไปเว็บปลอม",
          },
          {
            id: "s2",
            label: "เรายังไม่ได้สั่งของ/ไม่มีเลขพัสดุอ้างอิง",
            risk: "medium",
            why: "ข้อความกว้าง ๆ แบบนี้มักส่งหว่าน",
          },
        ],
        decoys: [
          {
            id: "d1",
            label: "ข้อความบอกว่า ‘พัสดุติดปัญหา’",
            why: "คำพูดแบบนี้ใช้ได้ทั้งจริงและปลอม ต้องดู ‘ลิงก์/ข้อมูลอ้างอิง’",
          },
        ],
      },
    ],
    []
  );

  // ✅ index เคสปัจจุบัน
  const [idx, setIdx] = useState(0);

  // ✅ เก็บสิ่งที่ผู้เรียนเลือกเป็น “สัญญาณผิดปกติ”
  const [picked, setPicked] = useState({}); // { [signalId]: true }

  // ✅ โหมดเฉลย/feedback
  const [showFeedback, setShowFeedback] = useState(false);

  // ✅ เคสปัจจุบัน
  const current = CASES[idx];

  /**
   * ✅ รวมรายการทั้งหมดให้แสดง (signals + decoys)
   * - ให้ผู้เรียน “เลือก” ว่าอันไหนผิดปกติ
   */
  const choices = useMemo(() => {
    const real = current.signals.map((s) => ({
      key: `sig:${s.id}`,
      kind: "signal",
      id: s.id,
      label: s.label,
      why: s.why,
      risk: s.risk,
    }));

    const fake = current.decoys.map((d) => ({
      key: `dec:${d.id}`,
      kind: "decoy",
      id: d.id,
      label: d.label,
      why: d.why,
      risk: null,
    }));

    // ✅ สลับลำดับเล็กน้อย (คงที่ตามเคส)
    return [...real, ...fake];
  }, [current]);

  /**
   * ✅ helper: ตรวจว่าผู้เรียนเลือกอะไรบ้าง
   */
  const pickedIds = useMemo(() => {
    return Object.entries(picked)
      .filter(([, v]) => v)
      .map(([k]) => k);
  }, [picked]);

  /**
   * ✅ สรุปผล
   * - correct: เลือกสัญญาณจริงถูก
   * - missed: ไม่ได้เลือกสัญญาณจริง
   * - falsePositive: เลือกตัวหลอก
   */
  const result = useMemo(() => {
    const realIds = new Set(current.signals.map((s) => `sig:${s.id}`));
    const decIds = new Set(current.decoys.map((d) => `dec:${d.id}`));

    const correct = pickedIds.filter((k) => realIds.has(k));
    const falsePositive = pickedIds.filter((k) => decIds.has(k));
    const missed = [...realIds].filter((k) => !pickedIds.includes(k));

    return { correct, falsePositive, missed };
  }, [current, pickedIds]);

  /**
   * ✅ สรุประดับความเสี่ยงจาก “สัญญาณจริงที่เลือกได้ถูก”
   * - ถ้าเลือก high อย่างน้อย 1 -> high
   * - else ถ้าเลือก medium อย่างน้อย 1 -> medium
   * - else ถ้าเลือกได้แต่ low หรือไม่เลือก -> low (ในชุดนี้เราใช้ med/high เป็นหลัก)
   */
  const inferredRisk = useMemo(() => {
    // ✅ หา risk ของสัญญาณที่เลือกถูก
    const correctSignalIds = result.correct.map((k) => k.replace("sig:", ""));
    const matchedSignals = current.signals.filter((s) =>
      correctSignalIds.includes(s.id)
    );

    if (matchedSignals.some((s) => s.risk === "high")) return "high";
    if (matchedSignals.some((s) => s.risk === "medium")) return "medium";
    return "low";
  }, [current, result.correct]);

  /**
   * ✅ label + ข้อความอธิบาย risk
   */
  const riskMeta = useMemo(() => {
    if (inferredRisk === "high") {
      return {
        label: "ความเสี่ยง: สูง",
        hint: "มีโอกาสเป็นการพยายามยึดบัญชี/หลอกให้กดลิงก์ ควรรีบตรวจและล็อกบัญชี",
        icon: <FiAlertTriangle aria-hidden="true" />,
      };
    }

    if (inferredRisk === "medium") {
      return {
        label: "ความเสี่ยง: กลาง",
        hint: "ยังไม่ชัวร์ว่าเป็นเราหรือไม่ ควรตรวจอุปกรณ์/เซสชัน และเพิ่มความปลอดภัย",
        icon: <FiInfo aria-hidden="true" />,
      };
    }

    return {
      label: "ความเสี่ยง: ต่ำ",
      hint: "ยังไม่เห็นสัญญาณอันตรายชัด แต่ควรมีนิสัยตรวจสอบก่อนคลิก/ก่อนแชร์",
      icon: <FiShield aria-hidden="true" />,
    };
  }, [inferredRisk]);

  /**
   * ✅ รีเซ็ตเมื่อเปลี่ยนเคส
   */
  const goNextCase = () => {
    // ✅ ถ้ายังมีเคสถัดไป -> ไปต่อ
    if (idx < CASES.length - 1) {
      setIdx((v) => v + 1);
      setPicked({});
      setShowFeedback(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // ✅ ถ้าจบทุกเคส -> ไปหน้าถัดไป (Unit1_5_2)
    onNext?.();
  };

  return (
    <div className="edu-card" style={{ padding: 16 }}>
      {/* ✅ Intro */}
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div className="edu-chip" aria-hidden="true">
          <FiShield />
        </div>

        <div>
          <div className="edu-h2" style={{ marginBottom: 6 }}>
            เลือกสิ่งที่ “น่าสงสัย” จากข้อความด้านล่าง แล้วระบบจะบอกระดับความเสี่ยงให้ทันที
          </div>

        </div>
      </div>

      {/* ✅ Case header */}
      <div className="edu-divider" style={{ margin: "16px 0" }} />

      <div className="edu-row" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <span className="edu-badge">{current.channel}</span>
        <span className="edu-badge">
          เคส {idx + 1}/{CASES.length}
        </span>
      </div>

      <div className="edu-h3" style={{ marginTop: 10 }}>
        {current.title}
      </div>

      {/* ✅ Message card */}
      <div className="edu-glasscard signal-card" style={{ marginTop: 10, padding: 14 }}>
        {/* ✅ title strip (optional) */}
        <div className="signal-card__top">
          <span className="signal-card__dot" aria-hidden="true" />
          <div className="signal-card__label">ข้อความแจ้งเตือน</div>
        </div>

        {/* ✅ body */}
        <div className="edu-body signal-body" style={{ marginTop: 10 }}>
          {current.body}
        </div>

        {/* ✅ meta as pills (แทน grid เดิม) */}
        <div className="signal-meta" style={{ marginTop: 12 }}>
          {/* ✅ location */}
          {current.meta?.location && (
            <span className="signal-pill signal-pill--location">
              <FiMapPin aria-hidden="true" />
              <span className="signal-pill__text">{current.meta.location}</span>
            </span>
          )}

          {/* ✅ device */}
          {current.meta?.device && (
            <span className="signal-pill signal-pill--device">
              <FiMonitor aria-hidden="true" />
              <span className="signal-pill__text">{current.meta.device}</span>
            </span>
          )}

          {/* ✅ time */}
          {current.meta?.time && (
            <span className="signal-pill signal-pill--time">
              <FiInfo aria-hidden="true" />
              <span className="signal-pill__text">{current.meta.time}</span>
            </span>
          )}

          {/* ✅ from */}
          {current.meta?.from && (
            <span className="signal-pill signal-pill--from">
              <FiInfo aria-hidden="true" />
              <span className="signal-pill__text">From: {current.meta.from}</span>
            </span>
          )}

          {/* ✅ subject */}
          {current.meta?.subject && (
            <span className="signal-pill signal-pill--subject">
              <FiInfo aria-hidden="true" />
              <span className="signal-pill__text">Subject: {current.meta.subject}</span>
            </span>
          )}

          {/* ✅ hint */}
          {current.meta?.hint && (
            <span className="signal-pill signal-pill--hint">
              <FiInfo aria-hidden="true" />
              <span className="signal-pill__text">{current.meta.hint}</span>
            </span>
          )}
        </div>
      </div>

      {/* ✅ Task choices */}
      <div className="edu-h4" style={{ marginTop: 16 }}>
        เลือกข้อที่คุณคิดว่า “ผิดปกติ/น่าสงสัย”
      </div>

      <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
        {choices.map((c) => {
          const key = c.key;
          const checked = !!picked[key];

          return (
            <label
              key={key}
              className="edu-choice"
              style={{
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
                padding: 12,
                borderRadius: 14,
                cursor: showFeedback ? "not-allowed" : "pointer",
                opacity: showFeedback ? 0.8 : 1,
              }}
            >
              {/* ✅ checkbox */}
              <input
                type="checkbox"
                checked={checked}
                disabled={showFeedback}
                onChange={(e) => {
                  // ✅ กันแก้หลังเฉลย
                  if (showFeedback) return;

                  // ✅ toggle
                  setPicked((prev) => ({
                    ...prev,
                    [key]: e.target.checked,
                  }));
                }}
                style={{ marginTop: 2 }}
              />

              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div className="edu-body">{c.label}</div>
                  {/* ✅ tag เล็ก ๆ ว่าเป็น “ชิ้นส่วนอะไร” (ไม่เฉลย) */}
                  {!showFeedback && (
                    <span className="edu-pill" aria-hidden="true">
                      เลือกได้
                    </span>
                  )}
                </div>

                {/* ✅ เฉลยแล้วค่อยแสดงเหตุผล */}
                {showFeedback && (
                  <div className="edu-muted" style={{ marginTop: 6 }}>
                    {c.why}
                  </div>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {/* ✅ Actions */}
      <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
        {!showFeedback ? (
          <>
            <button
              className="edu-btn edu-btn--primary"
              type="button"
              onClick={() => {
                // ✅ “บังคับให้คิด” นิดนึง: อย่างน้อยต้องเลือก 1 ข้อ
                if (pickedIds.length === 0) {
                  alert("ลองเลือกอย่างน้อย 1 ข้อก่อนนะ (อันไหนน่าสงสัย?)");
                  return;
                }

                setShowFeedback(true);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              title="ดูผลลัพธ์"
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
          <button
            className="edu-btn edu-btn--ghost"
            type="button"
            onClick={goNextCase}
            title="ถัดไป/ไปบทถัดไป"
          >
            {idx < CASES.length - 1 ? "ถัดไป" : "ไปฝึกวิธีรับมือ"}
            <FiChevronRight aria-hidden="true" />
          </button>
        )}
      </div>

      {/* ✅ Feedback */}
      {showFeedback && (
        <div className="edu-glasscard" style={{ marginTop: 16, padding: 14 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {/* ✅ success / warning */}
            {result.missed.length === 0 && result.falsePositive.length === 0 ? (
              <FiCheckCircle aria-hidden="true" />
            ) : (
              <FiAlertTriangle aria-hidden="true" />
            )}

            <div className="edu-h4" style={{ margin: 0 }}>
              Feedback: คุณชี้ได้ {result.correct.length} จุด • พลาด {result.missed.length} • เผลอเลือกมั่ว{" "}
              {result.falsePositive.length}
            </div>
          </div>

          <div className="edu-divider" style={{ margin: "12px 0" }} />

          {/* ✅ Risk summary (แทนหน้า 5.3) */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div className="edu-chip" aria-hidden="true">
              {riskMeta.icon}
            </div>
            <div>
              <div className="edu-h4" style={{ margin: 0 }}>
                {riskMeta.label}
              </div>
              <div className="edu-muted">{riskMeta.hint}</div>
            </div>
          </div>

          {/* ✅ Hint สั้น ๆ แบบ “พี่สอนน้อง” */}
          <div className="edu-callout" style={{ marginTop: 12 }}>
            <div className="edu-body" style={{ marginBottom: 6 }}>
              จำง่าย ๆ:
            </div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>Location/Device แปลก = ต้องสงสัยก่อนเสมอ</li>
              <li>โดเมนเพี้ยน/ลิงก์สั้น = อย่ารีบกด</li>
              <li>ถ้า “เราไม่ได้ทำเอง” = ความเสี่ยงจะพุ่งทันที</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
