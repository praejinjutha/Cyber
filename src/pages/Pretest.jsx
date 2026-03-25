import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const UNIT_TIME_SECONDS = 180; // 3 นาทีต่อบท
const UNIT_PASS_SCORE = 2.0;
const MULTI_PASS_SCORE = 0.67; // multi ต้องได้อย่างน้อย 2/3 แบบไม่เลือกมั่วเกิน
const TOTAL_UNITS = 8; // บังคับให้มี 8 หน่วย และหน่วย 8 คือบทสุดท้ายเสมอ

export default function Pretest() {
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
  const [pretestId, setPretestId] = useState(null);
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

  const createUnitScoreMap = () => ({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
  });

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
  const safeCurrentUnit = Math.min(Math.max(Number(currentUnit) || 1, 1), TOTAL_UNITS);
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

  const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

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

  const calculateRemainingSeconds = (startedAtIso) => {
    if (!startedAtIso) return UNIT_TIME_SECONDS;
    const startedMs = new Date(startedAtIso).getTime();
    const nowMs = Date.now();
    const diff = Math.floor((nowMs - startedMs) / 1000);
    return Math.max(0, UNIT_TIME_SECONDS - diff);
  };

  const saveAnswerToDb = async (item, value) => {
    if (!attemptId) return;

    let safeValue = value;
    if (item.type === "multi") {
      safeValue = Array.isArray(value) ? value : [];
    } else {
      safeValue = value == null ? "" : value;
    }

    const { error } = await supabase.from("pretest_answers").upsert(
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
      .from("pretest_answers")
      .upsert(rows, { onConflict: "attempt_id,item_id" });

    if (error) throw error;
  };

  const runAiGradeShort = async (attemptIdParam) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) throw new Error("No session");

    const { data, error } = await supabase.functions.invoke("grade-pretest", {
      body: { attempt_id: attemptIdParam },
    });

    if (error) throw error;
    return data;
  };

  const fetchAnswersAfterAi = async (attemptIdParam) => {
    const { data, error } = await supabase
      .from("pretest_answers")
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

    const sectionScores = createUnitScoreMap();
    const multiScores = createUnitScoreMap();

    const passMap = {
      1: true,
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

      if (it.type === "multi") {
        multiScores[unit] = round2((Number(multiScores[unit]) || 0) + score);
      }
    });

    Object.keys(sectionScores).forEach((unitKey) => {
      const unit = Number(unitKey);
      if (unit === 1) {
        passMap[unit] = true;
      } else {
        passMap[unit] =
          Number(sectionScores[unit]) >= UNIT_PASS_SCORE &&
          Number(multiScores[unit]) >= MULTI_PASS_SCORE;
      }
    });

    return {
      totalScore,
      maxScore,
      sectionScores,
      multiScores,
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

  const finalizePretest = async () => {
    if (finalizingRef.current) return;
    finalizingRef.current = true;

    try {
      if (!userId || !pretestId || !attemptId) {
        setMsg("ข้อมูลระบบยังไม่พร้อม กรุณารีเฟรชแล้วลองใหม่");
        return;
      }

      const { data: alreadyResult, error: alreadyErr } = await supabase
        .from("pretest_results")
        .select("id")
        .eq("user_id", userId)
        .eq("pretest_id", pretestId)
        .maybeSingle();

      if (alreadyErr) throw alreadyErr;

      if (alreadyResult) {
        setMsg("คุณทำ Pretest ไปแล้ว ✅ กำลังพาไปหน้าหลัก...");
        setRedirecting(true);
        window.setTimeout(() => navigate("/main", { replace: true }), 1000);
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
        .from("pretest_answers")
        .upsert(rows, { onConflict: "attempt_id,item_id" });

      if (upsertErr) throw upsertErr;

      openProcessingPopup(
        "กรุณารอสักครู่",
        "AI กำลังตรวจคำตอบอัตนัยและกำหนดเส้นทางการเรียนของคุณ"
      );
      setMsg("ขณะนี้ AI กำลังประมวลผลคำตอบและกำหนดเส้นทางการเรียน กรุณาอย่าออกจากหน้านี้");

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

      const sectionScores = createUnitScoreMap();
      const multiScores = createUnitScoreMap();
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
        sectionScores[it.unit] = round2((Number(sectionScores[it.unit]) || 0) + score);

        if (it.type === "multi") {
          multiScores[it.unit] = round2((Number(multiScores[it.unit]) || 0) + score);
        }

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
        1: true,
        2:
          Number(sectionScores[2]) >= UNIT_PASS_SCORE &&
          Number(multiScores[2]) >= MULTI_PASS_SCORE,
        3:
          Number(sectionScores[3]) >= UNIT_PASS_SCORE &&
          Number(multiScores[3]) >= MULTI_PASS_SCORE,
        4:
          Number(sectionScores[4]) >= UNIT_PASS_SCORE &&
          Number(multiScores[4]) >= MULTI_PASS_SCORE,
        5:
          Number(sectionScores[5]) >= UNIT_PASS_SCORE &&
          Number(multiScores[5]) >= MULTI_PASS_SCORE,
        6:
          Number(sectionScores[6]) >= UNIT_PASS_SCORE &&
          Number(multiScores[6]) >= MULTI_PASS_SCORE,
        7:
          Number(sectionScores[7]) >= UNIT_PASS_SCORE &&
          Number(multiScores[7]) >= MULTI_PASS_SCORE,
        8:
          Number(sectionScores[8]) >= UNIT_PASS_SCORE &&
          Number(multiScores[8]) >= MULTI_PASS_SCORE,
      };

      const { data: attemptBeforeUpdate, error: attemptBeforeUpdateErr } = await supabase
        .from("pretest_attempts")
        .select("meta")
        .eq("id", attemptId)
        .single();

      if (attemptBeforeUpdateErr) throw attemptBeforeUpdateErr;

      const prevMeta = attemptBeforeUpdate?.meta || {};

      const { error: updateAttemptErr } = await supabase
        .from("pretest_attempts")
        .update({
          total_score: totalScore,
          max_score: maxScore,
          section_scores: sectionScores,
          pass_map: passMap,
          status: "submitted",
          submitted_at: new Date().toISOString(),
          meta: {
            ...prevMeta,
            multi_scores: multiScores,
          },
        })
        .eq("id", attemptId);

      if (updateAttemptErr) throw updateAttemptErr;

      const { error: insertResultErr } = await supabase
        .from("pretest_results")
        .insert({
          user_id: userId,
          pretest_id: pretestId,
          attempt_id: attemptId,
          total_score: totalScore,
          answers: answersPayload,
          section_scores: sectionScores,
          pass_map: passMap,
        });

      if (insertResultErr) throw insertResultErr;

      setResult({
        totalScore,
        maxScore,
        sectionScores,
        multiScores,
        passMap,
        perItem,
      });

      closeProcessingPopup();
      setMsg("ส่งคำตอบสำเร็จ ✅ กำลังพาไปหน้าหลัก...");
      setRedirecting(true);

      window.setTimeout(() => {
        navigate("/main", { replace: true });
      }, 1500);
    } catch (error) {
      console.error("finalizePretest error:", error);
      closeProcessingPopup();
      setMsg(`ส่งคำตอบไม่สำเร็จ ❌ ${error.message || ""}`);
      setSubmitting(false);
    } finally {
      finalizingRef.current = false;
    }
  };

  const disqualifyAttempt = async (reason = "left_exam_page") => {
    if (disqualifiedRef.current || finalizingRef.current || !attemptId || !userId || !pretestId) {
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
        .from("pretest_attempts")
        .select("meta, current_unit")
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
        console.error("grade-pretest on disqualify error:", aiErr);
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
        multiScores,
        passMap,
        answersPayload,
      } = await buildScoresFromLockedUnits({
        attemptIdParam: attemptId,
        lockedUnits,
        forceZeroFromUnit: currentUnitFromDb,
      });

      const nowIso = new Date().toISOString();

      const { error: attemptErr } = await supabase
        .from("pretest_attempts")
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
            multi_scores: multiScores,
          },
        })
        .eq("id", attemptId);

      if (attemptErr) throw attemptErr;

      const { data: existingResult, error: resultCheckErr } = await supabase
        .from("pretest_results")
        .select("id")
        .eq("user_id", userId)
        .eq("pretest_id", pretestId)
        .maybeSingle();

      if (resultCheckErr) throw resultCheckErr;

      if (!existingResult) {
        const { error: insertErr } = await supabase
          .from("pretest_results")
          .insert({
            user_id: userId,
            pretest_id: pretestId,
            attempt_id: attemptId,
            total_score: totalScore,
            answers: answersPayload,
            section_scores: sectionScores,
            pass_map: passMap,
          });

        if (insertErr) throw insertErr;
      }

      setMsg("ตรวจพบการออกจากหน้าแบบทดสอบ ระบบยุติการสอบและนับคะแนนเฉพาะหน่วยที่ส่งผ่านแล้ว");

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

  const goToNextUnit = async (isAuto = false) => {
    if (submitting || redirecting || autoMovingRef.current || finalizingRef.current) return;

    if (!isAuto) {
      for (const item of currentItems) {
        if (!isAnswered(item)) {
          setMsg("กรุณาตอบให้ครบทั้ง 3 ข้อก่อนไปบทถัดไป");
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
          "หมดเวลาในบทนี้",
          `ระบบกำลังบันทึกคำตอบของหน่วย ${safeCurrentUnit} และพาคุณไปบทถัดไปอัตโนมัติ`
        );
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      await saveCurrentUnitAnswers();

      if (isLastUnit) {
        await finalizePretest();
        return;
      }

      const nextUnit = safeCurrentUnit + 1;
      const nowIso = new Date().toISOString();

      const { data: attemptBeforeUpdate, error: readAttemptErr } = await supabase
        .from("pretest_attempts")
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
        .from("pretest_attempts")
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
      setMsg(`บันทึกบทเรียนไม่สำเร็จ ❌ ${error.message || ""}`);
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

        const { data: alreadyResult, error: resultErr } = await supabase
          .from("pretest_results")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (resultErr) {
          console.error(resultErr);
          if (alive) setMsg("ตรวจสอบสถานะ Pretest ไม่สำเร็จ");
          return;
        }

        if (alreadyResult) {
          navigate("/main", { replace: true });
          return;
        }

        const { data: pretest, error: pretestErr } = await supabase
          .from("pretests")
          .select("id, title, version")
          .eq("is_active", true)
          .single();

        if (pretestErr || !pretest) {
          console.error(pretestErr);
          if (alive) setMsg("ไม่พบชุดข้อสอบ Pretest");
          return;
        }

        const { data: existingAttempt, error: existingAttemptErr } = await supabase
          .from("pretest_attempts")
          .select("id, status, current_unit, unit_started_at, meta")
          .eq("user_id", user.id)
          .eq("pretest_id", pretest.id)
          .maybeSingle();

        if (existingAttemptErr) {
          console.error(existingAttemptErr);
          if (alive) setMsg("โหลดสถานะการทำข้อสอบไม่สำเร็จ");
          return;
        }

        let currentAttempt = existingAttempt ?? null;

        if (!currentAttempt) {
          const nowIso = new Date().toISOString();

          const { data: createdAttempt, error: createAttemptErr } = await supabase
            .from("pretest_attempts")
            .insert({
              pretest_id: pretest.id,
              user_id: user.id,
              attempt_no: 1,
              status: "in_progress",
              current_unit: 1,
              unit_started_at: nowIso,
              started_at: nowIso,
              meta: { source: "frontend", locked_units: [] },
            })
            .select("id, status, current_unit, unit_started_at, meta")
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

        const { data: itemsData, error: itemsErr } = await supabase
          .from("pretest_items")
          .select("id, unit, order_index, type, prompt, choices, points, correct_answer")
          .eq("pretest_id", pretest.id)
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

        const { data: savedAnswers } = await supabase
          .from("pretest_answers")
          .select("item_id, answer")
          .eq("attempt_id", currentAttempt.id);

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

        setPretestId(pretest.id);
        setAttemptId(currentAttempt.id);
        setItems(normalizedItems);
        setAnswers(initialAnswers);
        setCurrentUnit(loadedUnit);
        setUnitStartedAt(currentAttempt.unit_started_at || new Date().toISOString());
        setTimeLeft(calculateRemainingSeconds(currentAttempt.unit_started_at));
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
        disqualifyAttempt("tab_switch_or_leave_page");
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [examStarted, showRulesModal, redirecting, attemptId, userId, pretestId, safeCurrentUnit]);

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
            <h1 className="title">Pretest</h1>
            <p className="subtitle">กำลังโหลดข้อสอบ...</p>
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
                background: "rgba(0,0,0,0.55)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
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
                  ข้อกำหนดก่อนเริ่มทำ Pretest
                </h2>

                <div style={{ lineHeight: 1.7, color: "#333", fontSize: 15 }}>
                  <div>1. แบบทดสอบนี้ทำได้เพียง 1 ครั้ง</div>
                  <div>2. ระบบจับเวลา บทละ 3 นาที</div>
                  <div>3. เมื่อไปบทถัดไปแล้วจะไม่สามารถย้อนกลับได้</div>
                  <div>
                    4. หากออกจากหน้าแบบทดสอบหรือสลับแท็บ ระบบจะยุติการสอบทันที และนับคะแนนเฉพาะหน่วยที่ส่งผ่านแล้ว
                  </div>
                  <div>5. ไม่อนุญาตให้คัดลอกโจทย์ หรือวางคำตอบในข้ออัตนัย</div>
                  <div>6. เมื่อหมดเวลา ระบบจะบันทึกคำตอบอัตโนมัติ</div>
                </div>

                <div
                  style={{
                    marginTop: 18,
                    padding: 12,
                    borderRadius: 12,
                    background: "#fff3cd",
                    color: "#7a5900",
                    fontWeight: 700,
                  }}
                >
                  กรุณาเตรียมตัวให้พร้อมก่อนเริ่ม เมื่อกดเริ่มแล้วระบบจะเริ่มจับเวลาและบังคับใช้กติกาทันที
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 12,
                    marginTop: 20,
                  }}
                >
                  <button
                    type="button"
                    className="btn"
                    onClick={() => navigate("/main", { replace: true })}
                  >
                    ยกเลิก
                  </button>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleStartExam}
                  >
                    ฉันเข้าใจและพร้อมเริ่มทำแบบทดสอบ
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="topRow" style={{ alignItems: "flex-start" }}>
            <div>
              <h1 className="title">Pretest ({totalQuestions} ข้อ)</h1>
              <p className="subtitle">
                ทำแบบทดสอบก่อนเรียนเพียง 1 ครั้ง • หน่วย {safeCurrentUnit} / {totalUnits}
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
                onClick={() => navigate("/profile")}
                disabled={submitting || redirecting || examStarted}
                type="button"
              >
                กลับไปโปรไฟล์
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
              ความคืบหน้า: {answeredCount} / {totalQuestions} ข้อ ({progressPercent}%)
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
              ระบบล็อกการทำข้อสอบตามหน่วย หากออกจากหน้าแบบทดสอบ ระบบจะยุติการสอบและนับคะแนนเฉพาะหน่วยที่ส่งผ่านแล้ว
            </div>
          </div>

          {items.length === 0 ? (
            <div style={{ padding: 20 }}>ไม่พบข้อสอบ</div>
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
                            pointerEvents: submitting || redirecting ? "none" : "auto",
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
                          Array.isArray(answers[q.id]) && answers[q.id].includes(c.id);

                        return (
                          <label
                            key={c.id}
                            className={`choice ${checked ? "active" : ""}`}
                            style={{
                              opacity: submitting || redirecting ? 0.7 : 1,
                              pointerEvents: submitting || redirecting ? "none" : "auto",
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
                        // onPaste={(e) => e.preventDefault()}
                        // onCopy={(e) => e.preventDefault()}
                        // onCut={(e) => e.preventDefault()}
                        // onContextMenu={(e) => e.preventDefault()}
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

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: 20,
                  gap: 12,
                }}
              >
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={submitting || redirecting || !examStarted}
                >
                  {redirecting
                    ? "กำลังพาไปหน้าหลัก..."
                    : submitting
                    ? "กำลังบันทึก..."
                    : safeCurrentUnit === totalUnits
                    ? "ส่งคำตอบ"
                    : "ไปบทถัดไป"}
                </button>
              </div>

              {result && (
                <div className="resultBox">
                  คะแนนรวม: <b>{Number(result.totalScore).toFixed(2)}</b> /{" "}
                  {Number(result.maxScore).toFixed(2)}
                  <div style={{ marginTop: 8 }}>
                    {Object.entries(result.sectionScores).map(([unit, score]) => (
                      <div key={unit}>
                        หน่วย {unit}: {Number(score).toFixed(2)}/3.00 • multi{" "}
                        {Number(result.multiScores?.[unit] || 0).toFixed(2)}{" "}
                        {result.passMap[unit] ? "✅ ผ่าน" : "❌ ไม่ผ่าน"}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {msg && <div className="alert">{msg}</div>}
            </form>
          )}
        </div>


      </div>
    </div>
  );
}