
// src/pages/Unit1/PosttestRun.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import "./posttest.css";
import { FiChevronLeft, FiCheckCircle, FiAlertTriangle, FiSend } from "react-icons/fi";

export default function PosttestRun() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [posttestId, setPosttestId] = useState(null);
  const [passScore, setPassScore] = useState(0);

  const [attemptId, setAttemptId] = useState(null);
  const [items, setItems] = useState([]);

  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [showSolutions, setShowSolutions] = useState(true);

  // =========================
  // Helper: Scroll ไปบนสุด
  // =========================
  const scrollToTop = () => {
    // หมายเหตุ: เผื่อบาง browser / iOS
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  const initAnswerForItem = (item) => {
    if (item.type === "single") return { type: "single", value: "" };
    if (item.type === "multi") return { type: "multi", value: [] };
    if (item.type === "ordering") {
      return { type: "ordering", value: (item.choices || []).map((c) => c.id) };
    }
    if (item.type === "short") return { type: "short", value: "" };
    return { type: item.type, value: "" };
  };

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);

        const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
        if (sessionErr) console.error("getSession error:", sessionErr);

        const user = sessionData.session?.user;
        if (!user) {
          navigate("/login", { replace: true });
          return;
        }

        const { data: posttest, error: posttestError } = await supabase
          .from("posttests")
          .select("id, unit, title, pass_score")
          .eq("unit", 1)
          .eq("is_active", true)
          .single();

        if (posttestError || !posttest) {
          console.error("posttest load error:", posttestError);
          return;
        }

        const { data: attempt, error: attemptError } = await supabase
          .from("posttest_attempts")
          .insert({
            posttest_id: posttest.id,
            user_id: user.id,
            meta: { unit: 1, created_from: "frontend" },
          })
          .select("id, attempt_no")
          .single();

        if (attemptError || !attempt) {
          console.error("attempt create error:", attemptError);
          return;
        }

        const { data: itemsData, error: itemsError } = await supabase
          .from("posttest_items")
          .select("id, order_index, type, prompt, choices, points, correct_answer")
          .eq("posttest_id", posttest.id)
          .order("order_index", { ascending: true });

        if (itemsError) {
          console.error("items load error:", itemsError);
          return;
        }

        const normalizedItems = (itemsData || []).map((it) => ({
          ...it,
          choices: Array.isArray(it.choices) ? it.choices : [],
        }));

        const initialAnswers = {};
        normalizedItems.forEach((it) => {
          initialAnswers[it.id] = initAnswerForItem(it);
        });

        if (!alive) return;

        setPosttestId(posttest.id);
        setPassScore(Number(posttest.pass_score) || 0);
        setAttemptId(attempt.id);
        setItems(normalizedItems);
        setAnswers(initialAnswers);

        console.log("Posttest loaded:", {
          posttestId: posttest.id,
          attemptId: attempt.id,
          attemptNo: attempt.attempt_no,
          items: normalizedItems.length,
        });
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [navigate]);

  const totalQuestions = useMemo(() => items.length, [items]);

  const totalMaxScore = useMemo(() => {
    return items.reduce((sum, it) => sum + (Number(it.points) > 0 ? Number(it.points) : 1), 0);
  }, [items]);

  const setSingle = (itemId, choiceId) => {
    setAnswers((prev) => ({ ...prev, [itemId]: { type: "single", value: choiceId } }));
  };

  const toggleMulti = (itemId, choiceId) => {
    setAnswers((prev) => {
      const current = Array.isArray(prev[itemId]?.value) ? prev[itemId].value : [];
      const exists = current.includes(choiceId);
      const next = exists ? current.filter((x) => x !== choiceId) : [...current, choiceId];
      return { ...prev, [itemId]: { type: "multi", value: next } };
    });
  };

  const setShort = (itemId, text) => {
    setAnswers((prev) => ({ ...prev, [itemId]: { type: "short", value: text } }));
  };

  const moveOrdering = (itemId, fromIndex, toIndex) => {
    setAnswers((prev) => {
      const current = Array.isArray(prev[itemId]?.value) ? [...prev[itemId].value] : [];
      if (toIndex < 0 || toIndex >= current.length) return prev;
      const [moved] = current.splice(fromIndex, 1);
      current.splice(toIndex, 0, moved);
      return { ...prev, [itemId]: { type: "ordering", value: current } };
    });
  };

  const unansweredCount = useMemo(() => {
    let count = 0;

    items.forEach((it) => {
      const a = answers[it.id];
      if (!a) return count++;

      if (it.type === "single" && !a.value) count++;
      if (it.type === "multi" && (!Array.isArray(a.value) || a.value.length === 0)) count++;
      if (it.type === "ordering" && (!Array.isArray(a.value) || a.value.length === 0)) count++;
      if (it.type === "short" && String(a.value || "").trim().length === 0) count++;
    });

    return count;
  }, [items, answers]);

  const answeredCount = useMemo(() => totalQuestions - unansweredCount, [totalQuestions, unansweredCount]);

  const progressPercent = useMemo(() => {
    if (!totalQuestions) return 0;
    return Math.round((answeredCount / totalQuestions) * 100);
  }, [answeredCount, totalQuestions]);

  const isChoiceCorrect = (it, a) => {
    const correct = it.correct_answer;
    if (!correct || typeof correct !== "object") return false;
    const correctValue = correct.value;

    if (it.type === "single") return !!a?.value && a.value === correctValue;

    if (it.type === "multi") {
      const picked = Array.isArray(a?.value) ? [...a.value].sort() : [];
      const corr = Array.isArray(correctValue) ? [...correctValue].sort() : [];
      return picked.length === corr.length && picked.every((v, i) => v === corr[i]);
    }

    if (it.type === "ordering") {
      const picked = Array.isArray(a?.value) ? a.value : [];
      const corr = Array.isArray(correctValue) ? correctValue : [];
      return picked.length === corr.length && picked.every((v, i) => v === corr[i]);
    }

    return false;
  };

  const runAiGradeShort = async (attemptId) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) throw new Error("No session");

    const { data, error } = await supabase.functions.invoke("grade-posttest", {
      body: { attempt_id: attemptId },
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    if (error) throw error;
    return data;
  };

  const fetchAnswersAfterAi = async (attemptId) => {
    const { data, error } = await supabase
      .from("posttest_answers")
      .select("item_id, score, ai_feedback")
      .eq("attempt_id", attemptId);

    if (error) {
      console.error("fetchAnswersAfterAi error:", error);
      return [];
    }
    return data || [];
  };

  const submitAll = async () => {
    if (!attemptId || !posttestId || items.length === 0) {
      console.log("submit blocked:", { attemptId, posttestId, itemsLen: items.length });
      return;
    }

    // =========================
    // 1) กดส่งแล้วเด้งขึ้นไปบนสุดทันที
    // =========================
    scrollToTop();

    setSubmitting(true);
    console.log("submit start:", { attemptId, posttestId, totalMaxScore });

    try {
      const rows = items.map((it) => {
        const currentAns = answers[it.id];
        let safeValue = currentAns?.value;

        if (it.type === "multi" || it.type === "ordering") safeValue = Array.isArray(safeValue) ? safeValue : [];
        else safeValue = safeValue == null ? "" : safeValue;

        return {
          attempt_id: attemptId,
          item_id: it.id,
          answer: { type: it.type, value: safeValue },
        };
      });

      const { error: upsertError } = await supabase
        .from("posttest_answers")
        .upsert(rows, { onConflict: "attempt_id,item_id" });

      if (upsertError) throw upsertError;

      try {
        await runAiGradeShort(attemptId);
        await new Promise((r) => setTimeout(r, 1200));
      } catch (aiErr) {
        console.error("AI grading skipped/failed:", aiErr);
      }

      const aiRows = await fetchAnswersAfterAi(attemptId);
      const aiMap = {};
      aiRows.forEach((r) => {
        aiMap[r.item_id] = { score: Number(r.score) || 0, feedback: r.ai_feedback || "" };
      });

      let finalScore = 0;
      const perItem = {};

      items.forEach((it) => {
        const a = answers[it.id];
        const maxScore = Number(it.points) > 0 ? Number(it.points) : 1;

        perItem[it.id] = { type: it.type, score: 0, maxScore, isCorrect: null, feedback: "" };

        if (it.type === "short") {
          const ai = aiMap[it.id];
          if (ai) {
            const aiScore = Math.max(0, Math.min(maxScore, Number(ai.score) || 0));
            perItem[it.id].score = aiScore;
            perItem[it.id].isCorrect = aiScore > 0;
            perItem[it.id].feedback = ai.feedback || "";
            finalScore += aiScore;
          } else {
            perItem[it.id].isCorrect = false;
            perItem[it.id].feedback = "ไม่พบผลการตรวจจาก AI";
          }
          return;
        }

        const ok = isChoiceCorrect(it, a);
        perItem[it.id].isCorrect = !!ok;
        perItem[it.id].score = ok ? maxScore : 0;
        finalScore += perItem[it.id].score;
      });

      const payload = {
        total_score: Number(finalScore) || 0,
        max_score: Number(totalMaxScore) || 0,
        pass: (Number(finalScore) || 0) >= (Number(passScore) || 0),
        submitted_at: new Date().toISOString(),
      };

      console.log("attempt update payload:", payload);

      const { data: updData, error: updErr } = await supabase
        .from("posttest_attempts")
        .update(payload)
        .eq("id", attemptId)
        .select("id, total_score, max_score, pass, submitted_at")
        .single();

      if (updErr) throw updErr;

      console.log("attempt updated:", updData);

      setResult({ score: finalScore, total: totalMaxScore, perItem });
      setSubmitted(true);
    } catch (e) {
      console.error("submit error:", e);
    } finally {
      setSubmitting(false);
      console.log("submit end:", { attemptId });
    }
  };

  const backToLearnWithScore = () => {
    navigate("/unit1/learn", {
      replace: true,
      state: {
        posttestResult: {
          score: result?.score ?? 0,
          maxScore: result?.total ?? totalMaxScore,
        },
      },
    });
  };

  return (
    <div className="pt-page">
      {/* =========================
          2) Popup ระหว่างกำลังส่ง/คำนวณคะแนน (submitting)
          CSS คุณแก้ไฟล์แยกแล้ว: ใช้ class ตามนี้ได้เลย
      ========================= */}
      {submitting && (
        <div className="pt-popupOverlay" role="dialog" aria-modal="true" aria-label="กำลังประมวลผลคะแนน">
          <div className="pt-popup">
            <div className="pt-popup__spinner" aria-hidden="true" />
            <div className="pt-popup__title">ระบบกำลังคำนวณคะแนน…</div>
            <div className="pt-popup__desc">กรุณารอสักครู่ ระบบกำลังบันทึกคำตอบและตรวจคำตอบด้วย AI</div>
            <div className="pt-popup__hint">อย่าปิดหน้านี้ระหว่างประมวลผลนะครับ</div>
          </div>
        </div>
      )}

      <header className="pt-topbar">
        <div className="pt-topbar__inner">
          <div className="pt-title">
            <span className="pt-title__icon">
              <FiCheckCircle aria-hidden="true" />
            </span>
            <div className="pt-title__text">
              <div className="pt-title__h">Posttest</div>
              <div className="pt-title__sub">Unit 1</div>
            </div>
          </div>

          <div className="pt-actions">
            <button
              className="pt-btn pt-btn--ghost"
              type="button"
              onClick={() => {
                if (submitted) backToLearnWithScore();
                else navigate(-1);
              }}
              disabled={submitting}
            >
              <FiChevronLeft aria-hidden="true" />
              กลับ
            </button>
          </div>
        </div>
      </header>

      <main className="pt-container">
        <section className="pt-card pt-card--summary">
          {loading ? (
            <div className="pt-loading">
              <div className="pt-loading__dot" />
              <div>กำลังโหลดข้อสอบ...</div>
            </div>
          ) : items.length === 0 ? (
            <div className="pt-empty">
              <FiAlertTriangle aria-hidden="true" />
              <div>
                <div className="pt-empty__h">ไม่พบข้อสอบของ Unit 1</div>
              </div>
            </div>
          ) : (
            <div className="pt-summary">
              <div className="pt-summary__info">
                <div className="pt-summary__h">
                  มีข้อสอบทั้งหมด <strong>{totalQuestions}</strong> ข้อ
                </div>
                <div className="pt-summary__p">
                  ตอบแล้ว <strong>{answeredCount}</strong> / {totalQuestions}
                </div>
                {submitted && result && (
                  <div className="pt-summary__p" style={{ marginTop: 6, color: "#059669", fontWeight: "bold" }}>
                    คะแนนรวม: <strong>{result.score}</strong> / {result.total}
                  </div>
                )}
              </div>

              <div className="pt-summary__progress">
                <div className="pt-progress">
                  <div className="pt-progress__bar" style={{ width: `${progressPercent}%` }} />
                </div>
                <div className="pt-progress__label">{progressPercent}%</div>
              </div>
            </div>
          )}
        </section>

        {!loading && items.length > 0 && (
          <section className="pt-questions">
            {items.map((q) => (
              <article key={q.id} className="pt-card pt-q">
                <div className="pt-q__head">
                  <div className="pt-q__badge">ข้อ {q.order_index}</div>
                  <div className="pt-q__meta">
                    <span className="pt-q__type">{q.type}</span>
                    {typeof q.points === "number" && <span className="pt-q__pts">{q.points} pts</span>}
                  </div>
                </div>

                <div className="pt-q__prompt">{q.prompt}</div>

                {submitted && showSolutions && result?.perItem?.[q.id] && (
                  <div
                    className={`pt-q__result-box ${result.perItem[q.id].isCorrect ? "is-correct" : "is-wrong"}`}
                    style={{
                      marginTop: 15,
                      padding: 12,
                      borderRadius: 8,
                      backgroundColor: result.perItem[q.id].isCorrect ? "#ecfdf5" : "#fef2f2",
                      border: `1px solid ${result.perItem[q.id].isCorrect ? "#10b981" : "#ef4444"}`,
                    }}
                  >
                    {q.type !== "short" ? (
                      <div style={{ fontWeight: 600, color: result.perItem[q.id].isCorrect ? "#065f46" : "#991b1b" }}>
                        {result.perItem[q.id].isCorrect ? "✅ ถูกต้อง" : "❌ ยังไม่ถูกต้อง"}
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontWeight: 600, color: result.perItem[q.id].isCorrect ? "#065f46" : "#991b1b" }}>
                          คะแนนจาก AI: {result.perItem[q.id].score} / {result.perItem[q.id].maxScore}
                        </div>

                        {result.perItem[q.id].feedback && (
                          <div style={{ opacity: 0.9, marginTop: 6, fontSize: "0.95rem", fontStyle: "italic", color: "#374151" }}>
                            💡 คำแนะนำ: {result.perItem[q.id].feedback}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {q.type === "single" && (
                  <div className="pt-options">
                    {q.choices.map((c) => {
                      const checked = answers[q.id]?.value === c.id;
                      return (
                        <label key={c.id} className={`pt-opt ${checked ? "is-selected" : ""} ${submitted ? "is-disabled" : ""}`}>
                          <span className="pt-opt__control">
                            <input
                              className="pt-opt__input"
                              type="radio"
                              name={`single-${q.id}`}
                              value={c.id}
                              checked={checked}
                              onChange={() => setSingle(q.id, c.id)}
                              disabled={submitting || submitted}
                            />
                            <span className="pt-opt__fake" aria-hidden="true" />
                          </span>
                          <span className="pt-opt__label">{c.label}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {q.type === "multi" && (
                  <div className="pt-options">
                    {q.choices.map((c) => {
                      const selected = Array.isArray(answers[q.id]?.value) ? answers[q.id]?.value.includes(c.id) : false;
                      return (
                        <label key={c.id} className={`pt-opt ${selected ? "is-selected" : ""} ${submitted ? "is-disabled" : ""}`}>
                          <span className="pt-opt__control">
                            <input
                              className="pt-opt__input"
                              type="checkbox"
                              value={c.id}
                              checked={selected}
                              onChange={() => toggleMulti(q.id, c.id)}
                              disabled={submitting || submitted}
                            />
                            <span className="pt-opt__fake" aria-hidden="true" />
                          </span>
                          <span className="pt-opt__label">{c.label}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {q.type === "ordering" && (
                  <div className="pt-order">
                    {(answers[q.id]?.value || []).map((choiceId, idx) => {
                      const label = q.choices.find((x) => x.id === choiceId)?.label || choiceId;
                      const isFirst = idx === 0;
                      const isLast = idx === (answers[q.id]?.value?.length || 0) - 1;

                      return (
                        <div key={`${q.id}-${choiceId}`} className="pt-orderRow">
                          <div className="pt-orderRow__index">{idx + 1}</div>
                          <div className="pt-orderRow__label">{label}</div>
                          <div className="pt-orderRow__actions">
                            <button
                              className="pt-btn pt-btn--mini"
                              type="button"
                              onClick={() => moveOrdering(q.id, idx, idx - 1)}
                              disabled={submitting || submitted || isFirst}
                            >
                              ↑
                            </button>
                            <button
                              className="pt-btn pt-btn--mini"
                              type="button"
                              onClick={() => moveOrdering(q.id, idx, idx + 1)}
                              disabled={submitting || submitted || isLast}
                            >
                              ↓
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {q.type === "short" && (
                  <div className="pt-short">
                    <textarea
                      className="pt-textarea"
                      placeholder="พิมพ์คำตอบของคุณ..."
                      value={answers[q.id]?.value || ""}
                      onChange={(e) => setShort(q.id, e.target.value)}
                      disabled={submitting || submitted}
                      rows={4}
                    />
                  </div>
                )}
              </article>
            ))}
          </section>
        )}

        {!loading && items.length > 0 && (
          <footer className="pt-footer">
            <div className="pt-footer__inner">
              <div className="pt-footer__note">
                {!submitted ? "กดส่งทีเดียว ระบบจะบันทึกคำตอบทั้งหมดลงฐานข้อมูล" : "ตรวจคำตอบเสร็จแล้ว กดถัดไปเพื่อกลับหน้าเรียน"}
              </div>

              <button
                className="pt-btn pt-btn--primary"
                type="button"
                onClick={() => {
                  if (!submitted) submitAll();
                  else backToLearnWithScore();
                }}
                disabled={submitting}
              >
                <FiSend aria-hidden="true" />
                {submitting ? "กำลังส่ง..." : submitted ? "ถัดไป" : "ส่งข้อสอบ"}
              </button>
            </div>
          </footer>
        )}
      </main>
    </div>
  );
}

