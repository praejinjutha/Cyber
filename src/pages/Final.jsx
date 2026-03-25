import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import {
  FiClipboard,
  FiClock,
  FiAlertTriangle,
  FiSlash,
  FiShieldOff,
  FiChevronRight,
  FiArrowLeft,
} from "react-icons/fi";

const UNIT_TIME_SECONDS = 180; // 3 นาทีต่อหน่วย
const UNIT_PASS_SCORE = 2.0;
const TOTAL_UNITS = 8;
const MAX_TAB_SWITCHES = 2;

export default function Final() {
  const navigate = useNavigate();

  const spinnerStyle = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  `;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [msg, setMsg] = useState("");

  const [userId, setUserId] = useState("");
  const [finalTestId, setFinalTestId] = useState(null);
  const [attemptId, setAttemptId] = useState(null);

  const [items, setItems] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const [currentUnit, setCurrentUnit] = useState(1);
  const [unitStartedAt, setUnitStartedAt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(UNIT_TIME_SECONDS);

  const [showRulesModal, setShowRulesModal] = useState(true);
  const [examStarted, setExamStarted] = useState(false);

  const [processingPopup, setProcessingPopup] = useState({
    open: false,
    title: "",
    description: "",
  });

  const [scoreSnapshot, setScoreSnapshot] = useState({
    firstTotalScore: null,
    latestTotalScore: null,
    maxScore: null,
    firstSubmittedAt: null,
    latestSubmittedAt: null,
  });

  const disqualifiedRef = useRef(false);
  const autoMovingRef = useRef(false);
  const finalizingRef = useRef(false);
  const processingRef = useRef(false);

  const openProcessingPopup = (title, description) => {
    processingRef.current = true;
    setProcessingPopup({
      open: true,
      title,
      description,
    });
  };

  const closeProcessingPopup = () => {
    processingRef.current = false;
    setProcessingPopup({
      open: false,
      title: "",
      description: "",
    });
  };

  const groupedByUnit = useMemo(() => {
    const map = {};
    items.forEach((it) => {
      const unit = Number(it.unit);
      if (!map[unit]) map[unit] = [];
      map[unit].push(it);
    });
    return map;
  }, [items]);

  const totalUnits = TOTAL_UNITS;
  const safeCurrentUnit = Math.min(
    Math.max(Number(currentUnit) || 1, 1),
    TOTAL_UNITS
  );
  const currentItems = groupedByUnit[safeCurrentUnit] || [];
  const totalQuestions = useMemo(() => items.length, [items]);

  const answeredCount = useMemo(() => {
    let count = 0;
    items.forEach((it) => {
      const a = answers[it.id];
      if (it.type === "single" && a) count++;
      if (it.type === "multi" && Array.isArray(a) && a.length > 0) count++;
      if (it.type === "short" && String(a || "").trim().length > 0) count++;
    });
    return count;
  }, [items, answers]);

  const progressPercent = useMemo(() => {
    if (!totalQuestions) return 0;
    return Math.round((answeredCount / totalQuestions) * 100);
  }, [answeredCount, totalQuestions]);

  const initAnswerByType = (type) => {
    if (type === "multi") return [];
    return "";
  };

  const isAnswered = (item) => {
    const val = answers[item.id];
    if (item.type === "multi") return Array.isArray(val) && val.length > 0;
    if (item.type === "short") return String(val || "").trim().length > 0;
    return !!val;
  };

  const round2 = (n) =>
    Math.round((Number(n) + Number.EPSILON) * 100) / 100;

  const getDefaultPointByType = (type) => {
    if (type === "single") return 0.5;
    if (type === "multi") return 1.0;
    if (type === "short") return 1.5;
    return 1;
  };

  const getItemPoint = (item) => {
    const dbPoint = Number(item?.points);
    if (Number.isFinite(dbPoint) && dbPoint > 0) return dbPoint;
    return getDefaultPointByType(item?.type);
  };

  const calcMultiPartialScore = (picked, correct, maxScore = 1.0) => {
    const pickedArr = Array.isArray(picked) ? picked : [];
    const correctArr = Array.isArray(correct) ? correct : [];

    const pickedSet = new Set(pickedArr);
    const correctSet = new Set(correctArr);

    const totalCorrect = correctSet.size;
    if (totalCorrect === 0) return 0;

    const correctPicked = [...pickedSet].filter((x) => correctSet.has(x)).length;
    const wrongPicked = [...pickedSet].filter((x) => !correctSet.has(x)).length;

    const rawRatio = (correctPicked - wrongPicked) / totalCorrect;
    const clampedRatio = Math.max(0, Math.min(1, rawRatio));

    return round2(clampedRatio * maxScore);
  };

  const formatTime = (seconds) => {
    const safe = Math.max(0, Number(seconds) || 0);
    const mm = String(Math.floor(safe / 60)).padStart(2, "0");
    const ss = String(safe % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const calculateRemainingSeconds = (startedAtIso, totalSeconds = UNIT_TIME_SECONDS) => {
    if (!startedAtIso) return totalSeconds;
    const startedMs = new Date(startedAtIso).getTime();
    const nowMs = Date.now();
    const diff = Math.floor((nowMs - startedMs) / 1000);
    return Math.max(0, totalSeconds - diff);
  };

  const saveAnswerToDb = async (item, value) => {
    if (!attemptId) return;

    let safeValue = value;
    if (item.type === "multi") {
      safeValue = Array.isArray(value) ? value : [];
    } else {
      safeValue = value == null ? "" : value;
    }

    const { error } = await supabase.from("final_test_answers").upsert(
      [
        {
          attempt_id: attemptId,
          item_id: item.id,
          answer: { type: item.type, value: safeValue },
        },
      ],
      { onConflict: "attempt_id,item_id" }
    );

    if (error) {
      console.error("autosave error:", error);
    }
  };

  const saveCurrentUnitAnswers = async () => {
    if (!attemptId || currentItems.length === 0) return;

    const rows = currentItems.map((it) => {
      let safeValue = answers[it.id];
      if (it.type === "multi") {
        safeValue = Array.isArray(safeValue) ? safeValue : [];
      } else {
        safeValue = safeValue == null ? "" : safeValue;
      }

      return {
        attempt_id: attemptId,
        item_id: it.id,
        answer: { type: it.type, value: safeValue },
      };
    });

    const { error } = await supabase
      .from("final_test_answers")
      .upsert(rows, { onConflict: "attempt_id,item_id" });

    if (error) throw error;
  };

const runAiGradeShort = async (attemptIdParam) => {
  const { data, error: sessionErr } = await supabase.auth.getSession();
  if (sessionErr) throw sessionErr;

  const session = data?.session;
  const token = session?.access_token;

  console.log("session:", session);
  console.log("token exists:", !!token);

  if (!token) {
    throw new Error("No access token");
  }

  const res = await supabase.functions.invoke("grade-final-test", {
    body: { attempt_id: attemptIdParam },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log("grade-final-test response raw:", res);

  const { data: responseData, error } = res;
  if (error) {
    console.error("grade-final-test full error:", error);
    throw error;
  }

  return responseData;
};

  const fetchAnswersAfterAi = async (attemptIdParam) => {
    const { data, error } = await supabase
      .from("final_test_answers")
      .select("item_id, score, ai_feedback")
      .eq("attempt_id", attemptIdParam);

    if (error) throw error;
    return data || [];
  };

  const buildScoresFromLockedUnits = async ({
    attemptIdParam,
    lockedUnits = [],
    forceZeroFromUnit = null,
  }) => {
    const aiRows = await fetchAnswersAfterAi(attemptIdParam);
    const aiMap = {};

    aiRows.forEach((r) => {
      aiMap[r.item_id] = {
        score: Number(r.score) || 0,
        feedback: r.ai_feedback || "",
      };
    });

    let totalScore = 0;
    let maxScore = 0;

    const sectionScores = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0,
    };

    const passMap = {
      1: false,
      2: false,
      3: false,
      4: false,
      5: false,
      6: false,
      7: false,
      8: false,
    };

    const answersPayload = {};

    items.forEach((it) => {
      const unit = Number(it.unit);
      const point = getItemPoint(it);
      const userAnswer = answers[it.id];

      maxScore = round2(maxScore + point);
      answersPayload[`q${it.order_index}`] = userAnswer ?? "";

      let score = 0;

      const isLocked = lockedUnits.includes(unit);
      const isForcedZero =
        forceZeroFromUnit != null && unit >= Number(forceZeroFromUnit);

      if (isLocked && !isForcedZero) {
        if (it.type === "single") {
          const correct = it.correct_answer?.value;
          score = userAnswer === correct ? point : 0;
        } else if (it.type === "multi") {
          const correct = Array.isArray(it.correct_answer?.value)
            ? it.correct_answer.value
            : [];
          score = calcMultiPartialScore(userAnswer, correct, point);
        } else if (it.type === "short") {
          const ai = aiMap[it.id];
          score = ai ? Math.max(0, Math.min(point, Number(ai.score) || 0)) : 0;
          score = round2(score);
        }
      } else {
        score = 0;
      }

      score = round2(score);
      totalScore = round2(totalScore + score);
      sectionScores[unit] = round2((Number(sectionScores[unit]) || 0) + score);
    });

    Object.keys(sectionScores).forEach((unitKey) => {
      const unit = Number(unitKey);
      passMap[unit] = Number(sectionScores[unit]) >= UNIT_PASS_SCORE;
    });

    return {
      totalScore,
      maxScore,
      sectionScores,
      passMap,
      answersPayload,
    };
  };

  const setSingle = async (item, choiceId) => {
    setAnswers((prev) => ({ ...prev, [item.id]: choiceId }));
    await saveAnswerToDb(item, choiceId);
  };

  const toggleMulti = async (item, choiceId) => {
    const current = Array.isArray(answers[item.id]) ? answers[item.id] : [];
    const exists = current.includes(choiceId);
    const next = exists
      ? current.filter((x) => x !== choiceId)
      : [...current, choiceId];

    setAnswers((prev) => ({ ...prev, [item.id]: next }));
    await saveAnswerToDb(item, next);
  };

  const setShort = async (item, text) => {
    setAnswers((prev) => ({ ...prev, [item.id]: text }));
    await saveAnswerToDb(item, text);
  };

  const upsertFinalResultRecord = async ({
    attemptIdParam,
    totalScore,
    answersPayload,
    sectionScores,
    passMap,
    submittedAtIso,
  }) => {
    if (!userId || !finalTestId) {
      throw new Error("missing userId/finalTestId");
    }

    const { data: existingResult, error: resultCheckErr } = await supabase
      .from("final_test_results")
      .select("id, first_attempt_id")
      .eq("user_id", userId)
      .eq("final_test_id", finalTestId)
      .maybeSingle();

    if (resultCheckErr) throw resultCheckErr;

    const latestPayload = {
      attempt_id: attemptIdParam,
      total_score: totalScore,
      answers: answersPayload,
      section_scores: sectionScores,
      pass_map: passMap,
      latest_attempt_id: attemptIdParam,
      latest_total_score: totalScore,
      latest_answers: answersPayload,
      latest_section_scores: sectionScores,
      latest_pass_map: passMap,
      latest_submitted_at: submittedAtIso,
    };

    if (!existingResult) {
      const { error: insertErr } = await supabase
        .from("final_test_results")
        .insert({
          user_id: userId,
          final_test_id: finalTestId,
          ...latestPayload,
          first_attempt_id: attemptIdParam,
          first_total_score: totalScore,
          first_answers: answersPayload,
          first_section_scores: sectionScores,
          first_pass_map: passMap,
          first_submitted_at: submittedAtIso,
        });

      if (insertErr) throw insertErr;
      return;
    }

    const { error: updateErr } = await supabase
      .from("final_test_results")
      .update({
        ...latestPayload,
      })
      .eq("id", existingResult.id);

    if (updateErr) throw updateErr;
  };

  const loadFinalScoreSnapshot = async (userIdParam, finalTestIdParam) => {
    if (!userIdParam || !finalTestIdParam) return null;

    const { data, error } = await supabase
      .from("final_test_results")
      .select(`
        first_total_score,
        latest_total_score,
        first_submitted_at,
        latest_submitted_at
      `)
      .eq("user_id", userIdParam)
      .eq("final_test_id", finalTestIdParam)
      .maybeSingle();

    if (error) throw error;

    return {
      firstTotalScore: data?.first_total_score ?? null,
      latestTotalScore: data?.latest_total_score ?? null,
      firstSubmittedAt: data?.first_submitted_at ?? null,
      latestSubmittedAt: data?.latest_submitted_at ?? null,
    };
  };

  const finalizeFinalTest = async () => {
    if (finalizingRef.current) return;
    finalizingRef.current = true;
    setSubmitting(true);

    try {
      if (!userId || !finalTestId || !attemptId) {
        setMsg("ข้อมูลระบบยังไม่พร้อม กรุณารีเฟรชแล้วลองใหม่");
        return;
      }

      const rows = items.map((it) => {
        let safeValue = answers[it.id];

        if (it.type === "multi") {
          safeValue = Array.isArray(safeValue) ? safeValue : [];
        } else {
          safeValue = safeValue == null ? "" : safeValue;
        }

        return {
          attempt_id: attemptId,
          item_id: it.id,
          answer: { type: it.type, value: safeValue },
        };
      });

      const { error: upsertErr } = await supabase
        .from("final_test_answers")
        .upsert(rows, { onConflict: "attempt_id,item_id" });

      if (upsertErr) throw upsertErr;

      openProcessingPopup(
        "กรุณารอสักครู่",
        "AI กำลังตรวจคำตอบอัตนัยและสรุปผลการสอบปลายคอร์สของคุณ"
      );
      setMsg("ขณะนี้ AI กำลังประมวลผลคำตอบปลายคอร์ส กรุณาอย่าออกจากหน้านี้");

      await new Promise((resolve) => setTimeout(resolve, 50));
      await runAiGradeShort(attemptId);

      const aiRows = await fetchAnswersAfterAi(attemptId);
      const aiMap = {};

      aiRows.forEach((r) => {
        aiMap[r.item_id] = {
          score: Number(r.score) || 0,
          feedback: r.ai_feedback || "",
        };
      });

      let totalScore = 0;
      let maxScore = 0;

      const sectionScores = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
        7: 0,
        8: 0,
      };

      const answersPayload = {};
      const perItem = {};

      items.forEach((it) => {
        const userAnswer = answers[it.id];
        const point = getItemPoint(it);

        maxScore = round2(maxScore + point);
        answersPayload[`q${it.order_index}`] = userAnswer ?? "";

        let score = 0;
        let feedback = "";

        if (it.type === "single") {
          const correct = it.correct_answer?.value;
          score = userAnswer === correct ? point : 0;
        } else if (it.type === "multi") {
          const correct = Array.isArray(it.correct_answer?.value)
            ? it.correct_answer.value
            : [];
          score = calcMultiPartialScore(userAnswer, correct, point);
        } else if (it.type === "short") {
          const ai = aiMap[it.id];
          score = ai ? Math.max(0, Math.min(point, Number(ai.score) || 0)) : 0;
          score = round2(score);
          feedback = ai?.feedback || "";
        }

        score = round2(score);
        totalScore = round2(totalScore + score);
        sectionScores[it.unit] = round2(
          (Number(sectionScores[it.unit]) || 0) + score
        );

        perItem[it.id] = {
          score,
          maxScore: point,
          feedback,
          unit: it.unit,
          orderIndex: it.order_index,
          type: it.type,
        };
      });

      const passMap = {
        1: Number(sectionScores[1]) >= UNIT_PASS_SCORE,
        2: Number(sectionScores[2]) >= UNIT_PASS_SCORE,
        3: Number(sectionScores[3]) >= UNIT_PASS_SCORE,
        4: Number(sectionScores[4]) >= UNIT_PASS_SCORE,
        5: Number(sectionScores[5]) >= UNIT_PASS_SCORE,
        6: Number(sectionScores[6]) >= UNIT_PASS_SCORE,
        7: Number(sectionScores[7]) >= UNIT_PASS_SCORE,
        8: Number(sectionScores[8]) >= UNIT_PASS_SCORE,
      };

      const allUnitsPassed = Object.values(passMap).every(Boolean);
      const nowIso = new Date().toISOString();

      const { error: updateAttemptErr } = await supabase
        .from("final_test_attempts")
        .update({
          total_score: totalScore,
          max_score: maxScore,
          section_scores: sectionScores,
          pass_map: passMap,
          status: "submitted",
          submitted_at: nowIso,
          meta: {
            passed_all_units: allUnitsPassed,
          },
        })
        .eq("id", attemptId);

      if (updateAttemptErr) throw updateAttemptErr;

      await upsertFinalResultRecord({
        attemptIdParam: attemptId,
        totalScore,
        answersPayload,
        sectionScores,
        passMap,
        submittedAtIso: nowIso,
      });

      const snapshot = await loadFinalScoreSnapshot(userId, finalTestId);

      setResult({
        totalScore,
        maxScore,
        sectionScores,
        passMap,
        perItem,
        passedAllUnits: allUnitsPassed,
      });

      setScoreSnapshot({
        firstTotalScore: snapshot?.firstTotalScore ?? totalScore,
        latestTotalScore: snapshot?.latestTotalScore ?? totalScore,
        maxScore,
        firstSubmittedAt: snapshot?.firstSubmittedAt ?? nowIso,
        latestSubmittedAt: snapshot?.latestSubmittedAt ?? nowIso,
      });

      closeProcessingPopup();
      setMsg("ส่งคำตอบสำเร็จ ✅ กรุณาตรวจสอบผลคะแนน แล้วกดปุ่มกลับหน้าหลัก");
      setRedirecting(true);
    } catch (error) {
      console.error("finalizeFinalTest error:", error);
      closeProcessingPopup();
      setMsg(`ส่งคำตอบไม่สำเร็จ ❌ ${error.message || ""}`);
    } finally {
      setSubmitting(false);
      finalizingRef.current = false;
    }
  };

  const disqualifyAttempt = async (reason = "left_exam_page") => {
    if (
      disqualifiedRef.current ||
      finalizingRef.current ||
      !attemptId ||
      !userId ||
      !finalTestId
    ) {
      return;
    }

    disqualifiedRef.current = true;
    setRedirecting(true);

    try {
      openProcessingPopup(
        "ระบบกำลังยุติการสอบ",
        "ตรวจพบการออกจากหน้าแบบทดสอบ ระบบกำลังบันทึกผลและสรุปคะแนนของคุณ"
      );

      await new Promise((resolve) => setTimeout(resolve, 50));

      const { data: attemptRow, error: attemptReadErr } = await supabase
        .from("final_test_attempts")
        .select("meta, current_unit, flag_count")
        .eq("id", attemptId)
        .single();

      if (attemptReadErr) throw attemptReadErr;

      try {
        await saveCurrentUnitAnswers();
      } catch (saveErr) {
        console.error("saveCurrentUnitAnswers before disqualify error:", saveErr);
      }

      try {
        await runAiGradeShort(attemptId);
      } catch (aiErr) {
        console.error("grade-final-test on disqualify error:", aiErr);
      }

      const prevMeta = attemptRow?.meta || {};
      const lockedUnits = Array.isArray(prevMeta.locked_units)
        ? prevMeta.locked_units
        : [];

      const currentUnitFromDb = Math.min(
        Math.max(Number(attemptRow?.current_unit || safeCurrentUnit) || 1, 1),
        TOTAL_UNITS
      );

      const {
        totalScore,
        maxScore,
        sectionScores,
        passMap,
        answersPayload,
      } = await buildScoresFromLockedUnits({
        attemptIdParam: attemptId,
        lockedUnits,
        forceZeroFromUnit: currentUnitFromDb,
      });

      const nowIso = new Date().toISOString();

      const { error: attemptErr } = await supabase
        .from("final_test_attempts")
        .update({
          status: "timed_out",
          timed_out_at: nowIso,
          is_flagged: true,
          total_score: totalScore,
          max_score: maxScore,
          section_scores: sectionScores,
          pass_map: passMap,
          submitted_at: nowIso,
          meta: {
            ...prevMeta,
            reason,
            disqualified_at_unit: currentUnitFromDb,
          },
        })
        .eq("id", attemptId);

      if (attemptErr) throw attemptErr;

      await upsertFinalResultRecord({
        attemptIdParam: attemptId,
        totalScore,
        answersPayload,
        sectionScores,
        passMap,
        submittedAtIso: nowIso,
      });

      setMsg(
        "ตรวจพบการออกจากหน้าแบบทดสอบ ระบบยุติการสอบและนับคะแนนเฉพาะหน่วยที่ส่งผ่านแล้ว"
      );

      window.setTimeout(() => {
        navigate("/main", { replace: true });
      }, 1200);
    } catch (error) {
      console.error("disqualifyAttempt error:", error);
      setMsg("ระบบกำลังพาคุณกลับหน้าหลัก...");
      window.setTimeout(() => {
        navigate("/main", { replace: true });
      }, 800);
    }
  };

  const handleVisibilityViolation = async () => {
    if (!attemptId || redirecting || processingRef.current || finalizingRef.current) {
      return;
    }

    try {
      const { data: attemptRow, error } = await supabase
        .from("final_test_attempts")
        .select("flag_count, meta")
        .eq("id", attemptId)
        .single();

      if (error) throw error;

      const currentFlagCount = Number(attemptRow?.flag_count || 0);
      const nextFlagCount = currentFlagCount + 1;
      const prevMeta = attemptRow?.meta || {};

      const { error: updateErr } = await supabase
        .from("final_test_attempts")
        .update({
          flag_count: nextFlagCount,
          is_flagged: nextFlagCount > 0,
          meta: {
            ...prevMeta,
            visibility_violations: nextFlagCount,
          },
        })
        .eq("id", attemptId);

      if (updateErr) throw updateErr;

      if (nextFlagCount > MAX_TAB_SWITCHES) {
        await disqualifyAttempt("tab_switch_over_limit");
      } else {
        setMsg(
          `คำเตือน: ตรวจพบการสลับแท็บ/ออกจากหน้าจอ ${nextFlagCount}/${MAX_TAB_SWITCHES} ครั้ง หากเกินกำหนดระบบจะยุติการสอบทันที`
        );
      }
    } catch (error) {
      console.error("handleVisibilityViolation error:", error);
    }
  };

  const goToNextUnit = async (isAuto = false) => {
    if (
      submitting ||
      redirecting ||
      autoMovingRef.current ||
      finalizingRef.current
    ) {
      return;
    }

    if (!isAuto) {
      for (const item of currentItems) {
        if (!isAnswered(item)) {
          setMsg("กรุณาตอบให้ครบทั้ง 3 ข้อก่อนไปหน่วยถัดไป");
          return;
        }
      }
    }

    autoMovingRef.current = true;
    setSubmitting(true);
    setMsg("");

    try {
      const isLastUnit = safeCurrentUnit >= TOTAL_UNITS;

      if (isAuto && !isLastUnit) {
        openProcessingPopup(
          "หมดเวลาในหน่วยนี้",
          `ระบบกำลังบันทึกคำตอบของหน่วย ${safeCurrentUnit} และพาคุณไปหน่วยถัดไปอัตโนมัติ`
        );
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      await saveCurrentUnitAnswers();

      if (isLastUnit) {
        await finalizeFinalTest();
        return;
      }

      const nextUnit = safeCurrentUnit + 1;
      const nowIso = new Date().toISOString();

      const { data: attemptBeforeUpdate, error: readAttemptErr } = await supabase
        .from("final_test_attempts")
        .select("meta")
        .eq("id", attemptId)
        .single();

      if (readAttemptErr) throw readAttemptErr;

      const prevMeta = attemptBeforeUpdate?.meta || {};
      const prevLockedUnits = Array.isArray(prevMeta.locked_units)
        ? prevMeta.locked_units
        : [];

      const nextLockedUnits = [...new Set([...prevLockedUnits, safeCurrentUnit])]
        .map(Number)
        .filter((u) => u >= 1 && u <= TOTAL_UNITS)
        .sort((a, b) => a - b);

      const { error: updateErr } = await supabase
        .from("final_test_attempts")
        .update({
          current_unit: nextUnit,
          unit_started_at: nowIso,
          meta: {
            ...prevMeta,
            locked_units: nextLockedUnits,
          },
        })
        .eq("id", attemptId);

      if (updateErr) throw updateErr;

      setCurrentUnit(nextUnit);
      setUnitStartedAt(nowIso);
      setTimeLeft(UNIT_TIME_SECONDS);

      if (isAuto) {
        closeProcessingPopup();
        setMsg(`หมดเวลาหน่วย ${safeCurrentUnit} ระบบพาไปหน่วย ${nextUnit} อัตโนมัติ`);
      }
    } catch (error) {
      console.error("goToNextUnit error:", error);
      closeProcessingPopup();
      setMsg(`บันทึกหน่วยไม่สำเร็จ ❌ ${error.message || ""}`);
    } finally {
      setSubmitting(false);
      autoMovingRef.current = false;
    }
  };

  const handleStartExam = () => {
    setShowRulesModal(false);
    setExamStarted(true);
  };

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setMsg("");

        const {
          data: { user },
          error: userErr,
        } = await supabase.auth.getUser();

        if (userErr) {
          console.error(userErr);
          navigate("/login", { replace: true });
          return;
        }

        if (!user) {
          navigate("/login", { replace: true });
          return;
        }

        setUserId(user.id);

        const { data: profile, error: profileErr } = await supabase
          .from("student_profiles")
          .select("first_name,last_name")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profileErr) {
          console.error(profileErr);
          navigate("/profile", { replace: true });
          return;
        }

        const hasProfile =
          !!profile &&
          !!String(profile.first_name || "").trim() &&
          !!String(profile.last_name || "").trim();

        if (!hasProfile) {
          navigate("/profile", { replace: true });
          return;
        }

        const { data: pretestRow, error: pretestErr } = await supabase
          .from("pretest_results")
          .select("pass_map")
          .eq("user_id", user.id)
          .maybeSingle();

        if (pretestErr) {
          console.error(pretestErr);
          setMsg("ตรวจสอบสิทธิ์เข้า Final ไม่สำเร็จ");
          return;
        }

        if (!pretestRow) {
          navigate("/pretest", { replace: true });
          return;
        }

        const parsePassMap = (raw) => {
          if (!raw) return new Set();
          let obj = raw;

          if (typeof raw === "string") {
            try {
              obj = JSON.parse(raw);
            } catch {
              return new Set();
            }
          }

          if (typeof obj !== "object" || obj === null) return new Set();

          const passed = new Set();
          Object.entries(obj).forEach(([key, value]) => {
            const unitNo = Number(key);
            if (!Number.isInteger(unitNo)) return;

            const isPassed =
              value === true ||
              value === "true" ||
              value === 1 ||
              value === "1";

            if (isPassed) passed.add(unitNo);
          });

          return passed;
        };

        const calcPercent = (total, max) => {
          const safeTotal = Number(total) || 0;
          const safeMax = Number(max) || 0;
          if (safeMax <= 0) return 0;
          return Math.round((safeTotal / safeMax) * 100);
        };

        const extractLatestAttemptByUnit = (rows) => {
          const latestMap = new Map();

          for (const row of rows || []) {
            const related = row?.posttests;
            const unit = Array.isArray(related) ? related[0]?.unit : related?.unit;
            const unitNo = Number(unit);

            if (!Number.isInteger(unitNo)) continue;
            if (!row?.submitted_at) continue;

            const currentTime = new Date(row.submitted_at).getTime();
            const prev = latestMap.get(unitNo);

            if (!prev) {
              latestMap.set(unitNo, row);
              continue;
            }

            const prevTime = new Date(prev.submitted_at).getTime();
            if (currentTime > prevTime) {
              latestMap.set(unitNo, row);
            }
          }

          return latestMap;
        };

        const buildLatestScoreMap = (latestMap) => {
          const resultMap = {};
          for (const [unitNo, row] of latestMap.entries()) {
            const total = Number(row?.total_score) || 0;
            const max = Number(row?.max_score) || 0;
            const percent = calcPercent(total, max);

            resultMap[unitNo] = {
              total,
              max,
              percent,
              submittedAt: row?.submitted_at || null,
              passed: percent >= 60,
            };
          }
          return resultMap;
        };

        const { data: attemptRows, error: postErr } = await supabase
          .from("posttest_attempts")
          .select(`
            total_score,
            max_score,
            submitted_at,
            posttests!inner (
              unit,
              is_active
            )
          `)
          .eq("user_id", user.id)
          .not("submitted_at", "is", null)
          .eq("posttests.is_active", true);

        if (postErr) {
          console.error(postErr);
          setMsg("ตรวจสอบสิทธิ์เข้า Final ไม่สำเร็จ");
          return;
        }

        const pretestPassedSet = parsePassMap(pretestRow?.pass_map);
        const latestMap = extractLatestAttemptByUnit(attemptRows || []);
        const latestScoreMap = buildLatestScoreMap(latestMap);

        const masteredSet = new Set([...pretestPassedSet]);
        Object.entries(latestScoreMap).forEach(([unitKey, info]) => {
          const unitNo = Number(unitKey);
          if (info?.percent >= 60) {
            masteredSet.add(unitNo);
          }
        });

        const allLessonsPassed = masteredSet.size >= TOTAL_UNITS;

        if (!allLessonsPassed) {
          navigate("/lessons?mode=adaptive", { replace: true });
          return;
        }

        const { data: finalTest, error: finalTestErr } = await supabase
          .from("final_tests")
          .select("id, title, version, total_units, time_per_unit_seconds")
          .eq("is_active", true)
          .single();

        if (finalTestErr || !finalTest) {
          console.error(finalTestErr);
          if (alive) setMsg("ไม่พบชุดข้อสอบ Final");
          return;
        }

        const timePerUnit =
          Number(finalTest.time_per_unit_seconds) > 0
            ? Number(finalTest.time_per_unit_seconds)
            : UNIT_TIME_SECONDS;

        const { data: inProgressAttempts, error: inProgressErr } = await supabase
          .from("final_test_attempts")
          .select(
            "id, status, current_unit, unit_started_at, meta, attempt_no, started_at"
          )
          .eq("user_id", user.id)
          .eq("final_test_id", finalTest.id)
          .eq("status", "in_progress")
          .order("started_at", { ascending: false })
          .limit(1);

        if (inProgressErr) {
          console.error(inProgressErr);
          if (alive) setMsg("โหลดสถานะการทำข้อสอบไม่สำเร็จ");
          return;
        }

        let currentAttempt =
          Array.isArray(inProgressAttempts) && inProgressAttempts.length > 0
            ? inProgressAttempts[0]
            : null;

        if (!currentAttempt) {
          const { data: existingAttempt, error: existingAttemptErr } = await supabase
            .from("final_test_attempts")
            .select(
              "id, status, current_unit, unit_started_at, meta, attempt_no, started_at"
            )
            .eq("user_id", user.id)
            .eq("final_test_id", finalTest.id)
            .order("started_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (existingAttemptErr) {
            console.error(existingAttemptErr);
            if (alive) setMsg("โหลดข้อมูลการทำ Final ไม่สำเร็จ");
            return;
          }

          if (existingAttempt) {
            currentAttempt = existingAttempt;
          } else {
            const nowIso = new Date().toISOString();

            const { data: createdAttempt, error: createAttemptErr } = await supabase
              .from("final_test_attempts")
              .insert({
                final_test_id: finalTest.id,
                user_id: user.id,
                attempt_no: 1,
                status: "in_progress",
                current_unit: 1,
                unit_started_at: nowIso,
                started_at: nowIso,
                flag_count: 0,
                meta: {
                  source: "frontend",
                  locked_units: [],
                  visibility_violations: 0,
                },
              })
              .select(
                "id, status, current_unit, unit_started_at, meta, attempt_no, started_at"
              )
              .single();

            if (createAttemptErr || !createdAttempt) {
              console.error(createAttemptErr);
              if (alive) {
                setMsg(
                  `สร้าง attempt ไม่สำเร็จ: ${
                    createAttemptErr?.message || "unknown error"
                  }`
                );
              }
              return;
            }

            currentAttempt = createdAttempt;
          }
        }

        const { data: itemsData, error: itemsErr } = await supabase
          .from("final_test_items")
          .select(
            "id, unit, order_index, type, prompt, choices, points, correct_answer"
          )
          .eq("final_test_id", finalTest.id)
          .order("order_index", { ascending: true });

        if (itemsErr) {
          console.error(itemsErr);
          if (alive) setMsg("โหลดข้อสอบไม่สำเร็จ");
          return;
        }

        const normalizedItems = (itemsData || []).map((it) => ({
          ...it,
          unit: Number(it.unit),
          choices: Array.isArray(it.choices) ? it.choices : [],
        }));

        const initialAnswers = {};
        normalizedItems.forEach((it) => {
          initialAnswers[it.id] = initAnswerByType(it.type);
        });

        const { data: savedAnswers, error: savedAnswersErr } = await supabase
          .from("final_test_answers")
          .select("item_id, answer")
          .eq("attempt_id", currentAttempt.id);

        if (savedAnswersErr) {
          console.error(savedAnswersErr);
          if (alive) setMsg("โหลดคำตอบที่เคยบันทึกไว้ไม่สำเร็จ");
          return;
        }

        (savedAnswers || []).forEach((row) => {
          const item = normalizedItems.find((it) => it.id === row.item_id);
          if (!item) return;

          const savedValue = row.answer?.value;

          if (item.type === "multi") {
            initialAnswers[row.item_id] = Array.isArray(savedValue) ? savedValue : [];
          } else {
            initialAnswers[row.item_id] = savedValue ?? "";
          }
        });

        if (!alive) return;

        const loadedUnit = Math.min(
          Math.max(Number(currentAttempt.current_unit || 1) || 1, 1),
          TOTAL_UNITS
        );

        setFinalTestId(finalTest.id);
        setAttemptId(currentAttempt.id);
        setItems(normalizedItems);
        setAnswers(initialAnswers);
        setCurrentUnit(loadedUnit);
        setUnitStartedAt(currentAttempt.unit_started_at || new Date().toISOString());
        setTimeLeft(
          calculateRemainingSeconds(
            currentAttempt.unit_started_at || new Date().toISOString(),
            timePerUnit
          )
        );
      } catch (error) {
        console.error("Final page load error:", error);
        if (alive) {
          setMsg(`โหลดข้อสอบไม่สำเร็จ ❌ ${error?.message || ""}`);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [navigate]);

  useEffect(() => {
    if (!examStarted || !unitStartedAt || redirecting) return;

    const interval = setInterval(() => {
      const remain = calculateRemainingSeconds(unitStartedAt);
      setTimeLeft(remain);

      if (remain <= 0 && !autoMovingRef.current && !finalizingRef.current) {
        clearInterval(interval);
        goToNextUnit(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [examStarted, unitStartedAt, safeCurrentUnit, redirecting]);

  useEffect(() => {
    if (!examStarted || showRulesModal || redirecting) return;

    const onVisibilityChange = () => {
      if (
        document.hidden &&
        !redirecting &&
        !processingRef.current &&
        !finalizingRef.current
      ) {
        handleVisibilityViolation();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [examStarted, showRulesModal, redirecting, attemptId]);

  if (loading) {
    return (
      <div
        className="bg"
        style={{
          minHeight: "100dvh",
          display: "block",
          overflowY: "auto",
          paddingTop: "72px",
          paddingBottom: "32px",
          paddingLeft: "16px",
          paddingRight: "16px",
          boxSizing: "border-box",
        }}
      >
        <div
          className="shell"
          style={{
            width: "100%",
            maxWidth: "920px",
            margin: "0 auto",
          }}
        >
          <div
            className="card"
            style={{
              marginTop: "0",
              padding: "24px",
              borderRadius: "20px",
              boxSizing: "border-box",
            }}
          >
            <h1 className="title">Final</h1>
            <p className="subtitle">กำลังโหลดข้อสอบ...</p>
            {msg && <div className="alert" style={{ marginTop: 12 }}>{msg}</div>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg"
      style={{
        minHeight: "100dvh",
        display: "block",
        overflowY: "auto",
        paddingTop: "72px",
        paddingBottom: "32px",
        paddingLeft: "16px",
        paddingRight: "16px",
        boxSizing: "border-box",
      }}
    >
      <div
        className="shell"
        style={{
          width: "100%",
          maxWidth: "920px",
          margin: "0 auto",
        }}
      >
        <div
          className="card"
          style={{
            marginTop: "0",
            padding: "24px",
            borderRadius: "20px",
            boxSizing: "border-box",
            position: "relative",
          }}
        >
          <style>{spinnerStyle}</style>

          {processingPopup.open && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.55)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10000,
                padding: 16,
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: 560,
                  background: "#fff",
                  borderRadius: 20,
                  padding: 24,
                  boxSizing: "border-box",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
                }}
              >
                <h2 style={{ marginTop: 0, marginBottom: 12 }}>
                  {processingPopup.title || "กรุณารอสักครู่"}
                </h2>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      border: "5px solid #e5e7eb",
                      borderTop: "5px solid #4f7cff",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ lineHeight: 1.7, color: "#333", fontSize: 15 }}>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>
                      ระบบกำลังประมวลผลข้อมูลของคุณ
                    </div>
                    <div>{processingPopup.description}</div>
                  </div>
                </div>

                <div
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    background: "#fff3cd",
                    color: "#7a5900",
                    fontWeight: 700,
                    lineHeight: 1.6,
                  }}
                >
                  กรุณาอย่ารีเฟรช ปิดหน้า หรือสลับแท็บระหว่างประมวลผล
                </div>
              </div>
            </div>
          )}

          {showRulesModal && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(15, 23, 42, 0.8)",
                backdropFilter: "blur(12px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
                padding: 20,
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: 540,
                  background: "#ffffff",
                  borderRadius: 24,
                  padding: "40px",
                  boxSizing: "border-box",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.3)",
                }}
              >
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                  <div
                    style={{
                      background: "#eff6ff",
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 16px",
                      color: "#3b82f6",
                    }}
                  >
                    <FiClipboard size={24} />
                  </div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      color: "#1e293b",
                    }}
                  >
                    ข้อกำหนดก่อนเริ่มทำ Final
                  </h2>
                  <p style={{ color: "#64748b", fontSize: 14, marginTop: 6 }}>
                    โปรดตรวจสอบรายละเอียดและกติกาให้ครบถ้วน
                  </p>
                </div>

                <div style={{ display: "grid", gap: "20px" }}>
                  {[
                    {
                      icon: <FiClock size={18} />,
                      title: "ระบบเวลา",
                      desc: "แบ่งเป็น 8 หน่วย หน่วยละ 3 ข้อ (3 นาทีต่อหน่วย)",
                    },
                    {
                      icon: <FiSlash size={18} />,
                      title: "เงื่อนไขการส่ง",
                      desc: "ไม่สามารถย้อนกลับหน่วยเดิมได้ และไม่อนุญาตให้วางข้อความ",
                    },
                    {
                      icon: <FiShieldOff size={18} />,
                      title: "การป้องกันการทุจริต",
                      desc: "สลับหน้าจอเกิน 2 ครั้ง ระบบจะยุติการสอบทันที",
                    },
                  ].map((rule, index) => (
                    <div key={index} style={{ display: "flex", gap: 16 }}>
                      <div
                        style={{
                          marginTop: 2,
                          color: "#6366f1",
                          background: "#f5f3ff",
                          padding: 8,
                          borderRadius: 10,
                          display: "flex",
                          height: "fit-content",
                        }}
                      >
                        {rule.icon}
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: "#334155",
                          }}
                        >
                          {rule.title}
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: "#64748b",
                            marginTop: 2,
                          }}
                        >
                          {rule.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    marginTop: 32,
                    padding: "18px",
                    borderRadius: 16,
                    background: "#fff1f2",
                    border: "1px solid #ffe4e6",
                    display: "flex",
                    gap: 12,
                  }}
                >
                  <FiAlertTriangle
                    size={20}
                    color="#e11d48"
                    style={{ flexShrink: 0, marginTop: 2 }}
                  />
                  <div style={{ fontSize: 13.5, lineHeight: 1.6, color: "#9f1239" }}>
                    <strong style={{ display: "block", marginBottom: 2 }}>
                      ประกาศสำคัญ:
                    </strong>
                    ระบบจะบันทึก <b>"คะแนนครั้งแรก"</b> เป็นสำคัญ เพื่อใช้ในการวิเคราะห์
                    ค่าทางสถิติ (t-test) กรุณาทำในขณะที่ท่านพร้อมที่สุด
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1.5fr",
                    gap: 12,
                    marginTop: 32,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => navigate("/main", { replace: true })}
                    style={{
                      padding: "12px",
                      borderRadius: 12,
                      border: "1px solid #e2e8f0",
                      background: "white",
                      color: "#64748b",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <FiArrowLeft size={16} /> ยกเลิก
                  </button>
                  <button
                    type="button"
                    onClick={handleStartExam}
                    style={{
                      padding: "12px",
                      borderRadius: 12,
                      border: "none",
                      background: "#1e293b",
                      color: "white",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    ฉันพร้อมเริ่มทำแบบทดสอบ <FiChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="topRow" style={{ alignItems: "flex-start" }}>
            <div>
              <h1 className="title">Final ({totalQuestions} ข้อ)</h1>
              <p className="subtitle">
                แบบทดสอบปลายคอร์ส • ทำต่อจากครั้งเดิมได้ • หน่วย {safeCurrentUnit} /{" "}
                {totalUnits}
              </p>
            </div>

            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div
                style={{
                  minWidth: 110,
                  textAlign: "center",
                  padding: "10px 14px",
                  borderRadius: 12,
                  background: timeLeft <= 30 ? "#ffe5e5" : "#f5f7fb",
                  border: "1px solid #d9deea",
                  fontWeight: 800,
                  fontSize: 20,
                }}
              >
                {formatTime(timeLeft)}
              </div>

              <button
                className="btn btn-ghost"
                onClick={() => navigate("/main")}
                disabled={submitting || (examStarted && !result)}
                type="button"
              >
                กลับหน้าหลัก
              </button>
            </div>
          </div>

          <div
            style={{
              marginTop: 12,
              marginBottom: 18,
              padding: 12,
              borderRadius: 12,
              background: "#f5f7fb",
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 6 }}>
              ความคืบหน้า: {answeredCount} / {totalQuestions} ข้อ ({progressPercent}
              %)
            </div>

            <div
              style={{
                width: "100%",
                height: 10,
                background: "#dde3ee",
                borderRadius: 999,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${progressPercent}%`,
                  height: "100%",
                  background: "#4f7cff",
                }}
              />
            </div>

            <div style={{ marginTop: 8, fontSize: 13, color: "#666" }}>
              ระบบล็อกการทำข้อสอบเป็นรายหน่วย หากออกจากหน้าแบบทดสอบเกินกำหนด
              ระบบจะยุติการสอบและนับคะแนนเฉพาะหน่วยที่ส่งผ่านแล้ว
            </div>
          </div>

          {items.length === 0 ? (
            <div style={{ padding: 20 }}>
              ไม่พบข้อสอบ
              {msg && <div className="alert" style={{ marginTop: 12 }}>{msg}</div>}
            </div>
          ) : (
            <form
              className="form"
              onSubmit={(e) => {
                e.preventDefault();
                goToNextUnit(false);
              }}
            >
              {currentItems.map((q, idx) => (
                <div key={q.id} className="qCard">
                  <div className="qHead">
                    <div className="qNo">
                      ข้อ {idx + 1} <span style={{ opacity: 0.7 }}>• หน่วย {q.unit}</span>
                    </div>
                    <div
                      className="qText"
                      onCopy={(e) => e.preventDefault()}
                      onCut={(e) => e.preventDefault()}
                      onContextMenu={(e) => e.preventDefault()}
                    >
                      {q.prompt}
                    </div>
                  </div>

                  {q.type === "single" && (
                    <div className="choices">
                      {q.choices.map((c) => (
                        <label
                          key={c.id}
                          className={`choice ${answers[q.id] === c.id ? "active" : ""}`}
                          style={{
                            opacity: submitting || redirecting ? 0.7 : 1,
                            pointerEvents:
                              submitting || redirecting ? "none" : "auto",
                          }}
                        >
                          <input
                            type="radio"
                            name={q.id}
                            value={c.id}
                            checked={answers[q.id] === c.id}
                            onChange={() => setSingle(q, c.id)}
                            disabled={submitting || redirecting}
                          />
                          <span>{c.label}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {q.type === "multi" && (
                    <div className="choices">
                      {q.choices.map((c) => {
                        const checked =
                          Array.isArray(answers[q.id]) &&
                          answers[q.id].includes(c.id);

                        return (
                          <label
                            key={c.id}
                            className={`choice ${checked ? "active" : ""}`}
                            style={{
                              opacity: submitting || redirecting ? 0.7 : 1,
                              pointerEvents:
                                submitting || redirecting ? "none" : "auto",
                            }}
                          >
                            <input
                              type="checkbox"
                              name={`${q.id}-${c.id}`}
                              value={c.id}
                              checked={checked}
                              onChange={() => toggleMulti(q, c.id)}
                              disabled={submitting || redirecting}
                            />
                            <span>{c.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {q.type === "short" && (
                    <div style={{ marginTop: 12 }}>
                      <textarea
                        value={answers[q.id] || ""}
                        onChange={(e) => setShort(q, e.target.value)}
                        onCopy={(e) => e.preventDefault()}
                        onCut={(e) => e.preventDefault()}
                        onContextMenu={(e) => e.preventDefault()}
                        disabled={submitting || redirecting}
                        rows={4}
                        placeholder="พิมพ์คำตอบของคุณ..."
                        style={{
                          width: "100%",
                          borderRadius: 12,
                          border: "1px solid #d9deea",
                          padding: 12,
                          fontSize: 15,
                          resize: "vertical",
                          boxSizing: "border-box",
                        }}
                      />
                      <div style={{ marginTop: 6, fontSize: 12, color: "#777" }}>
                        ไม่อนุญาตให้วางข้อความในข้อนี้
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {!result && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                    marginTop: 20,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ fontSize: 13, color: "#666" }}>
                    {safeCurrentUnit < TOTAL_UNITS
                      ? `เมื่อทำครบหน่วย ${safeCurrentUnit} แล้ว กด "ถัดไป" เพื่อไปหน่วย ${
                          safeCurrentUnit + 1
                        }`
                      : `เมื่อทำครบหน่วยสุดท้ายแล้ว กด "ส่งข้อสอบ Final"`}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || redirecting || finalizingRef.current}
                    style={{
                      padding: "12px 18px",
                      borderRadius: 12,
                      border: "none",
                      background: "#1e293b",
                      color: "#fff",
                      fontSize: 14,
                      fontWeight: 700,
                      cursor:
                        submitting || redirecting || finalizingRef.current
                          ? "not-allowed"
                          : "pointer",
                      opacity:
                        submitting || redirecting || finalizingRef.current ? 0.7 : 1,
                    }}
                  >
                    {submitting
                      ? "กำลังบันทึก..."
                      : safeCurrentUnit < TOTAL_UNITS
                      ? "ถัดไป"
                      : "ส่งข้อสอบ Final"}
                  </button>
                </div>
              )}

              {result && (
                <div className="resultBox">
                  <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>
                    สรุปผลการทำ Final
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 12,
                      marginBottom: 16,
                    }}
                  >
                    <div
                      style={{
                        padding: 14,
                        borderRadius: 12,
                        background: "#fff7e6",
                        border: "1px solid #f3d19c",
                      }}
                    >
                      <div style={{ fontWeight: 700, marginBottom: 6 }}>
                        คะแนนครั้งแรก
                      </div>
                      <div style={{ fontSize: 24, fontWeight: 800 }}>
                        {scoreSnapshot.firstTotalScore != null
                          ? Number(scoreSnapshot.firstTotalScore).toFixed(2)
                          : "-"}{" "}
                        / {Number(scoreSnapshot.maxScore ?? result.maxScore).toFixed(2)}
                      </div>
                    </div>

                    <div
                      style={{
                        padding: 14,
                        borderRadius: 12,
                        background: "#eef6ff",
                        border: "1px solid #bcd8ff",
                      }}
                    >
                      <div style={{ fontWeight: 700, marginBottom: 6 }}>
                        คะแนนครั้งล่าสุด
                      </div>
                      <div style={{ fontSize: 24, fontWeight: 800 }}>
                        {scoreSnapshot.latestTotalScore != null
                          ? Number(scoreSnapshot.latestTotalScore).toFixed(2)
                          : Number(result.totalScore).toFixed(2)}{" "}
                        / {Number(scoreSnapshot.maxScore ?? result.maxScore).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: 10 }}>
                    คะแนนรอบนี้: <b>{Number(result.totalScore).toFixed(2)}</b> /{" "}
                    {Number(result.maxScore).toFixed(2)}
                  </div>

                  <div style={{ marginTop: 8 }}>
                    {Object.entries(result.sectionScores).map(([unit, score]) => (
                      <div key={unit}>
                        หน่วย {unit}: {Number(score).toFixed(2)}/3.00{" "}
                        {result.passMap[unit] ? "✅ ผ่าน" : "❌ ไม่ผ่าน"}
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: 10, fontWeight: 700 }}>
                    ผลรวมทั้งฉบับ:{" "}
                    {result.passedAllUnits
                      ? "✅ ผ่านครบทุกหน่วย"
                      : "❌ ยังไม่ผ่านครบทุกหน่วย"}
                  </div>

                  <div style={{ marginTop: 14, fontSize: 13, color: "#666" }}>
                    ระบบบันทึกคะแนน 2 ค่า คือ คะแนนครั้งแรก และคะแนนครั้งล่าสุด
                  </div>
                </div>
              )}

              {msg && <div className="alert">{msg}</div>}
            </form>
          )}
        </div>

        <div className="footerNote" style={{ marginTop: 16, marginBottom: 8 }}>
          Final จะสรุปผลการเรียนรู้ปลายคอร์ส โดยคิดคะแนนเป็นรายหน่วย หน่วยละ 3 ข้อ
          และผ่านเมื่อได้อย่างน้อย 2.0 คะแนนต่อหน่วย
        </div>
      </div>
    </div>
  );
}