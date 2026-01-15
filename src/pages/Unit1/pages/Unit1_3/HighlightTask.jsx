// src/pages/Unit1/pages/Unit1_3/HighlightTask.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiCheckCircle,
  FiAlertTriangle,
  FiChevronRight,
  FiRefreshCw,
} from "react-icons/fi";

import { SCENARIOS } from "../../data/scenarios";
import { tokenizeText, normalizeToken } from "../../utils/textTokenize";
import ScenarioGallery from "./ScenarioGallery";

// ✅ IMPORTANT: เรียกใช้ CSS จริงของ Unit 1.3
import "./highlightTask.css";

/**
 * ✅ HighlightTask (Unit 1.3) — ใช้ “ใน panel1” ของ Learn.jsx
 *
 * Props:
 * - initialProgress: progress ที่โหลดมา (ถ้ามี)
 * - onComplete(result): ส่ง progress ให้ Learn.jsx ไป saveU1_13
 * - onNext(): ไป 1.4
 */
export default function HighlightTask({ initialProgress, onComplete, onNext }) {
  /**
   * ==========================================
   * ✅ เป้าหมายการแก้บั๊ก (สำคัญมาก)
   * ==========================================
   * - เก็บ state แยกตาม scenarioId
   *   1) selectedById: ผู้เรียนเลือก token อะไรไว้ในแต่ละ scenario
   *   2) checkedById : scenario นี้กดตรวจแล้วหรือยัง
   *   3) feedbackById: ผลตรวจ + เหตุผลของ scenario นั้น
   *
   * - persist progress "ตลอดทาง" ไม่รอทำครบทั้งหมด
   * - hydrate (โหลด) จาก initialProgress แบบปลอดภัย:
   *   - โหลดครั้งแรก หรือโหลดเมื่อ initialProgress ใหม่กว่า local
   *   - กัน loop: onComplete -> parent setState -> ส่ง initialProgress กลับมา -> ทับ state เดิม
   */

  // ✅ scenario ปัจจุบัน
  const [currentId, setCurrentId] = useState(SCENARIOS[0]?.id);

  // ✅ ความคืบหน้า: ทำแล้ว (scenarioId -> true)
  const [doneMap, setDoneMap] = useState({});

  // ✅ ผลลัพธ์ต่อ scenario (scenarioId -> summary)
  const [resultMap, setResultMap] = useState({});

  // ✅ (แก้หลัก) เก็บการเลือก/ตรวจ/feedback แยกต่อ scenario
  const [selectedById, setSelectedById] = useState({}); // { [scenarioId]: { [tokenIdx]: true } }
  const [checkedById, setCheckedById] = useState({}); // { [scenarioId]: boolean }
  const [feedbackById, setFeedbackById] = useState({}); // { [scenarioId]: feedbackObject }

  // ✅ ใช้กันการ hydrate ทับ state ตอนผู้ใช้กำลังทำอยู่
  const hydratedOnceRef = useRef(false);

  // ✅ ใช้เทียบความใหม่ของ progress (กัน onComplete loop)
  const localUpdatedAtRef = useRef(0);

  /**
   * ✅ hydrate progress จาก Learn.jsx (initialProgress)
   * - โหลดครั้งแรก (hydratedOnceRef=false)
   * - หรือโหลดเมื่อ initialProgress.updatedAt ใหม่กว่า local
   */
  useEffect(() => {
    if (!initialProgress) return;

    // ✅ ถ้า progress มี timestamp ให้เทียบความใหม่
    const incomingUpdatedAt = Number(initialProgress.updatedAt || 0);
    const localUpdatedAt = Number(localUpdatedAtRef.current || 0);

    const shouldHydrate =
      !hydratedOnceRef.current || (incomingUpdatedAt && incomingUpdatedAt > localUpdatedAt);

    if (!shouldHydrate) return;

    // ✅ mark ว่า hydrate แล้ว
    hydratedOnceRef.current = true;
    localUpdatedAtRef.current = incomingUpdatedAt || Date.now();

    // ✅ load ทีละก้อน (มี fallback กันพัง)
    if (initialProgress?.currentId) setCurrentId(initialProgress.currentId);

    if (initialProgress?.doneMap) setDoneMap(initialProgress.doneMap);
    if (initialProgress?.resultMap) setResultMap(initialProgress.resultMap);

    if (initialProgress?.selectedById) setSelectedById(initialProgress.selectedById);
    if (initialProgress?.checkedById) setCheckedById(initialProgress.checkedById);
    if (initialProgress?.feedbackById) setFeedbackById(initialProgress.feedbackById);
  }, [initialProgress]);

  // ✅ หา scenario ปัจจุบัน
  const scenario = useMemo(
    () => SCENARIOS.find((s) => s.id === currentId) || SCENARIOS[0],
    [currentId]
  );

  // ✅ tokenize
  const tokens = useMemo(() => tokenizeText(scenario.content), [scenario.content]);

  // ✅ ชุดคำตอบ (normalized)
  const answerSet = useMemo(() => {
    const set = new Set();
    scenario.answerTokens.forEach((t) => set.add(normalizeToken(t)));
    return set;
  }, [scenario.answerTokens]);

  // ✅ index ของ token ที่ควรถูกเลือก
  const correctIndexSet = useMemo(() => {
    const set = new Set();
    tokens.forEach((t, idx) => {
      if (!t.clickable) return;
      const n = normalizeToken(t.text);
      if (!n) return;
      if (answerSet.has(n)) set.add(idx);
    });
    return set;
  }, [tokens, answerSet]);

  // ✅ progress (นับจำนวน scenario ที่ done)
  const doneCount = useMemo(() => Object.keys(doneMap).length, [doneMap]);
  const isAllDone = doneCount >= SCENARIOS.length;

  /**
   * ✅ ดึง state ของ scenario ปัจจุบันออกมาใช้งาน (derived state)
   * - ไม่ใช้ selectedMap/checked/feedback แบบชุดเดียวอีกต่อไป
   */
  const selectedMap = useMemo(() => {
    return selectedById?.[currentId] ?? {};
  }, [selectedById, currentId]);

  const checked = useMemo(() => {
    return Boolean(checkedById?.[currentId]);
  }, [checkedById, currentId]);

  const feedback = useMemo(() => {
    return feedbackById?.[currentId] ?? null;
  }, [feedbackById, currentId]);

  /**
   * ✅ helper: ส่ง progress ให้ parent เพื่อ save ลง localStorage
   * - เราจะ persist ตลอดทางเพื่อกัน “ย้อนกลับแล้วหาย / บางทีไม่ขึ้น”
   */
  function persistProgress(nextOverrides = {}) {
    // ✅ อัปเดต timestamp ทุกครั้งที่ persist (ใช้กัน loop + ใช้ตรวจความใหม่)
    const updatedAt = Date.now();
    localUpdatedAtRef.current = updatedAt;

    // ✅ สร้าง payload progress ให้ครบ
    const payload = {
      unit: "1.3",
      updatedAt,

      // ✅ สถานะรวม
      currentId,
      completed: isAllDone,
      totalScenarios: SCENARIOS.length,
      doneCount,

      // ✅ map ต่าง ๆ
      doneMap,
      resultMap,
      selectedById,
      checkedById,
      feedbackById,

      // ✅ เผื่ออยากเพิ่มฟิลด์อื่นในอนาคต
      ...nextOverrides,
    };

    // ✅ ส่งให้ parent (Learn.jsx) เพื่อ setState + saveU1_13
    onComplete?.(payload);
  }

  /**
   * ✅ Persist อัตโนมัติเมื่อ state สำคัญเปลี่ยน
   * - กันไม่ให้เรียกถี่เกิน: ที่นี่เรียกทุกเปลี่ยนแปลงหลัก ๆ ได้เลย
   * - ถ้าคุณกังวล performance ค่อยทำ debounce ภายหลัง
   */
  useEffect(() => {
    // ✅ ถ้าไม่เคย hydrate และไม่มีการทำอะไร ก็ไม่ต้อง persist
    // (แต่ถ้าคุณอยากให้ persist ตั้งแต่เริ่ม ก็ลบ if นี้ได้)
    if (!hydratedOnceRef.current && doneCount === 0) return;

    persistProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentId, doneMap, resultMap, selectedById, checkedById, feedbackById]);

  /**
   * ✅ toggle token ของ scenario ปัจจุบัน
   */
  function toggleToken(idx) {
    // ✅ ถ้ากดตรวจแล้ว ห้ามแก้
    if (checked) return;

    setSelectedById((prev) => {
      const next = { ...(prev || {}) };
      const currentSelected = { ...(next[currentId] || {}) };

      // ✅ toggle
      if (currentSelected[idx]) delete currentSelected[idx];
      else currentSelected[idx] = true;

      next[currentId] = currentSelected;
      return next;
    });
  }

  /**
   * ✅ ตรวจคำตอบ + feedback (ต่อ scenario ปัจจุบัน)
   */
  function checkAnswer() {
    // ✅ ป้องกันกดซ้ำ
    if (checked) return;

    const selectedIdx = Object.keys(selectedMap).map((k) => Number(k));
    const selectedSet = new Set(selectedIdx);

    const correctSelected = selectedIdx.filter((i) => correctIndexSet.has(i));
    const wrongSelected = selectedIdx.filter((i) => !correctIndexSet.has(i));
    const missed = [...correctIndexSet].filter((i) => !selectedSet.has(i));

    const isPerfect = wrongSelected.length === 0 && missed.length === 0;

    const missedTokens = missed.map((i) => tokens[i]?.text).filter(Boolean);
    const wrongTokens = wrongSelected.map((i) => tokens[i]?.text).filter(Boolean);

    // ✅ hints map (normalize key)
    const normalizedHints = {};
    Object.entries(scenario.tokenHints || {}).forEach(([k, v]) => {
      normalizedHints[normalizeToken(k)] = v;
    });

    const hintLines = [];
    missedTokens.forEach((t) => {
      const hint = normalizedHints[normalizeToken(t)];
      if (hint) hintLines.push(`- “${t}”: ${hint}`);
    });

    if (
      hintLines.length === 0 &&
      (!isPerfect || missedTokens.length || wrongTokens.length)
    ) {
      hintLines.push(
        "- ทริค: ข้อมูลส่วนบุคคลคือข้อมูลที่ “ระบุตัวเราได้” เช่น ชื่อ, เบอร์โทร, รหัสประจำตัว, โลเคชัน, ตารางเวลาเฉพาะเจาะจง"
      );
    }

    // ✅ สร้าง feedback object (เก็บไว้เพื่อกลับมาดูได้)
    const nextFeedback = {
      isPerfect,
      message: isPerfect
        ? "✅ เก่งมาก! เลือกได้ครบและถูกต้องเลย"
        : "❌ ยังไม่ครบ/มีบางจุดพลาด ลองดูคำแนะนำด้านล่างนะ",
      correctCount: correctSelected.length,
      wrongCount: wrongSelected.length,
      missedCount: missed.length,
      missedTokens,
      wrongTokens,
      hintLines,
    };

    // ✅ mark checked + feedback เฉพาะ scenario นี้
    setCheckedById((prev) => ({ ...(prev || {}), [currentId]: true }));
    setFeedbackById((prev) => ({ ...(prev || {}), [currentId]: nextFeedback }));

    // ✅ mark done (ให้ scenario นี้ถือว่า “ทำแล้ว” หลังตรวจ)
    setDoneMap((prev) => ({ ...(prev || {}), [scenario.id]: true }));

    // ✅ save result summary
    setResultMap((prev) => ({
      ...(prev || {}),
      [scenario.id]: {
        scenarioId: scenario.id,
        isPerfect,
        correctCount: correctSelected.length,
        wrongCount: wrongSelected.length,
        missedCount: missed.length,
      },
    }));
  }

  /**
   * ✅ ลองใหม่ฉากนี้
   * - เคลียร์การเลือก/ตรวจ/feedback ของ scenario นี้
   * - เอาออกจาก doneMap/resultMap เพื่อให้ต้องทำใหม่จริง ๆ
   */
  function resetCurrent() {
    // ✅ เคลียร์ selection ของ scenario นี้
    setSelectedById((prev) => {
      const next = { ...(prev || {}) };
      delete next[currentId];
      return next;
    });

    // ✅ เคลียร์ checked ของ scenario นี้
    setCheckedById((prev) => {
      const next = { ...(prev || {}) };
      delete next[currentId];
      return next;
    });

    // ✅ เคลียร์ feedback ของ scenario นี้
    setFeedbackById((prev) => {
      const next = { ...(prev || {}) };
      delete next[currentId];
      return next;
    });

    // ✅ เอา scenario นี้ออกจาก doneMap เพื่อไม่ให้ถือว่าทำครบ
    setDoneMap((prev) => {
      const next = { ...(prev || {}) };
      delete next[currentId];
      return next;
    });

    // ✅ เอา result ของ scenario นี้ออก
    setResultMap((prev) => {
      const next = { ...(prev || {}) };
      delete next[currentId];
      return next;
    });
  }

  /**
   * ✅ Reset ทั้งกิจกรรม (ถ้าคุณอยากมีปุ่ม “เริ่มใหม่ทั้งหมด” ในอนาคต)
   * - ตอนนี้ยังไม่เอาไปใช้ แต่คงไว้ได้
   */
  function resetAll() {
    setCurrentId(SCENARIOS[0]?.id);
    setDoneMap({});
    setResultMap({});
    setSelectedById({});
    setCheckedById({});
    setFeedbackById({});

    // ✅ persist ล้าง progress
    onComplete?.(null);
  }

  /**
   * ✅ ถ้าทำครบแล้ว คำนวณ perfectCount เพื่อโชว์/เก็บใน progress
   * - เราไม่ได้รอ “ทำครบแล้วค่อย onComplete” อีกต่อไป (persist ตลอดทางแล้ว)
   * - แต่ยังคงคำนวณค่าเพื่อให้ progress มีข้อมูลครบ
   */
  const perfectCount = useMemo(() => {
    const results = Object.values(resultMap || {});
    return results.filter((r) => r?.isPerfect).length;
  }, [resultMap]);

  return (
    // ✅ ครอบด้วย .u13 เพื่อให้ธีม CSS ของหน้า 1.3 ทำงานชัวร์
    <div className="u13">
      <div className="u13-panel">
        <div className="u13-topline">
          ความคืบหน้า: <b>{doneCount}/{SCENARIOS.length}</b>
          {/* ✅ โชว์ข้อมูลเสริม (optional) */}
          <span className="u13-topline__muted" style={{ marginLeft: 10 }}>
            (Perfect: <b>{perfectCount}</b>)
          </span>
        </div>

        <div className="u13-layout">
          <div className="u13-left">
            <ScenarioGallery
              scenarios={SCENARIOS}
              currentId={currentId}
              doneMap={doneMap}
              onSelect={(id) => {
                // ✅ เปลี่ยน scenario
                setCurrentId(id);
              }}
            />
          </div>

          <div className="u13-rightCard">
            <div className="u13-head">
              <div className="u13-head__title">{scenario.title}</div>
              <div className="u13-head__sub">{scenario.subtitle}</div>
            </div>

            <div className="u13-body">
              <div className="u13-hint">
                👉 คลิกไฮไลต์คำ/ข้อมูลที่คิดว่าเป็น <b>ข้อมูลส่วนบุคคล</b>
              </div>

              <div className="u13-textbox">
                {tokens.map((t, idx) => {
                  // ✅ ส่วนที่เป็นช่องว่าง/ขึ้นบรรทัด
                  if (!t.clickable) {
                    return (
                      <span key={`sp-${idx}`} className="u13-space">
                        {t.text}
                      </span>
                    );
                  }

                  // ✅ token นี้ถูกเลือกไหม (ดึงจาก selectedMap ของ scenario ปัจจุบัน)
                  const isSelected = Boolean(selectedMap?.[idx]);

                  return (
                    <button
                      key={`tk-${idx}`}
                      type="button"
                      disabled={checked}
                      onClick={() => toggleToken(idx)}
                      className={[
                        "u13-token",
                        isSelected ? "is-selected" : "",
                        checked ? "is-locked" : "",
                      ].join(" ")}
                      title={checked ? "ตรวจแล้ว" : "คลิกเพื่อไฮไลต์"}
                    >
                      {t.text}
                    </button>
                  );
                })}
              </div>

              <div className="u13-actions">
                <button
                  className="edu-btn edu-btn--primary"
                  type="button"
                  onClick={checkAnswer}
                  disabled={checked}
                >
                  ตรวจคำตอบ <FiChevronRight aria-hidden="true" />
                </button>

                <button
                  className="edu-btn edu-btn--back"
                  type="button"
                  onClick={resetCurrent}
                >
                  <FiRefreshCw aria-hidden="true" />
                  ลองใหม่
                </button>

              </div>

              {feedback && (
                <div className={`u13-feedback ${feedback.isPerfect ? "ok" : "warn"}`}>
                  <div className="u13-feedback__row">
                    <div className="u13-feedback__icon">
                      {feedback.isPerfect ? <FiCheckCircle /> : <FiAlertTriangle />}
                    </div>

                    <div className="u13-feedback__content">
                      <div className="u13-feedback__title">{feedback.message}</div>

                      <div className="u13-feedback__meta">
                        สรุป: ถูก {feedback.correctCount} | ผิด {feedback.wrongCount} | ตกหล่น{" "}
                        {feedback.missedCount}
                      </div>

                      {!feedback.isPerfect && (
                        <div className="u13-feedback__lists">
                          {feedback.missedTokens?.length > 0 && (
                            <div>
                              <div className="u13-feedback__label">ตกหล่น (ควรไฮไลต์):</div>
                              <div className="u13-feedback__text">
                                {feedback.missedTokens.map((t) => `“${t}”`).join(", ")}
                              </div>
                            </div>
                          )}

                          {feedback.wrongTokens?.length > 0 && (
                            <div>
                              <div className="u13-feedback__label">เลือกเกิน (ไม่จำเป็น):</div>
                              <div className="u13-feedback__text">
                                {feedback.wrongTokens.map((t) => `“${t}”`).join(", ")}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="u13-feedback__why">
                        <div className="u13-feedback__label">ทำไมถึงเป็นแบบนั้น?</div>
                        <div className="u13-feedback__text pre">
                          {(feedback.hintLines || []).join("\n")}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}


              <div
  className="edu-videoActions"
  style={{ marginTop: 24 }} // 👈 ปรับตัวเลขได้ตามต้องการ
>
  <button
    className="edu-btn edu-btn--ghost"
    type="button"
    onClick={onNext}
    disabled={!isAllDone}
    title={!isAllDone ? "ทำให้ครบก่อน" : "ไป 1.4"}
  >
    เสร็จสิ้น 
  </button>
</div>


              {!isAllDone && (
                <div className="u13-note">
                  * ทำครบทุกสถานการณ์ก่อน แล้วปุ่มไปต่อจะปลดล็อกเอง
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
