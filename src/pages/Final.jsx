import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

import img1 from "../assets/1.png";
import img2 from "../assets/2.jpg";
import img3 from "../assets/3.png";
import img4 from "../assets/4.png";
import img5 from "../assets/5.png";
import img6 from "../assets/6.png";
import img7 from "../assets/7.jpg";

const getUnitTimeSeconds = (unit) => {
  const u = Number(unit);

  if ([1, 2, 3, 4, 6].includes(u)) return 360; // 6 นาที
  if ([5, 7].includes(u)) return 480; // 8 นาที
  if (u === 8) return 600; // 10 นาที

  return 360;
};

const TOTAL_UNITS = 8;

const UNIT_PASS_REQUIREMENTS = {
  1: 4,
  2: 4,
  3: 4,
  4: 4,
  5: 6,
  6: 4,
  7: 6,
  8: 8,
};

const UNIT_MAX_QUESTIONS = {
  1: 5,
  2: 5,
  3: 5,
  4: 5,
  5: 7,
  6: 5,
  7: 7,
  8: 9,
};

const QUESTION_IMAGE_MAP = {
  21: img1,
  22: img2,
  23: img3,
  24: img4,
  25: img5,
  26: img6,
  27: img7,
};

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
  const [timeLeft, setTimeLeft] = useState(getUnitTimeSeconds(1));

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
    });
    return count;
  }, [items, answers]);

  const progressPercent = useMemo(() => {
    if (!totalQuestions) return 0;
    return Math.round((answeredCount / totalQuestions) * 100);
  }, [answeredCount, totalQuestions]);

  const initAnswerByType = () => "";

  const isAnswered = (item) => {
    const val = answers[item.id];
    return !!val;
  };

  const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

  const getItemPoint = (item) => {
    const dbPoint = Number(item?.points);
    if (Number.isFinite(dbPoint) && dbPoint > 0) return dbPoint;
    return 1;
  };

  const getUnitPassThreshold = (unit) => {
    const safeUnit = Number(unit);
    return UNIT_PASS_REQUIREMENTS[safeUnit] ?? 0;
  };

  const getUnitMaxScore = (unit) => {
    const safeUnit = Number(unit);
    return UNIT_MAX_QUESTIONS[safeUnit] ?? 0;
  };

  const getQuestionImage = (item) => {
    const orderIndex = Number(item?.order_index);
    return QUESTION_IMAGE_MAP[orderIndex] || null;
  };

  const formatTime = (seconds) => {
    const safe = Math.max(0, Number(seconds) || 0);
    const mm = String(Math.floor(safe / 60)).padStart(2, "0");
    const ss = String(safe % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const calculateRemainingSeconds = (startedAtIso, unit) => {
    const unitTime = getUnitTimeSeconds(unit);
    if (!startedAtIso) return unitTime;

    const startedMs = new Date(startedAtIso).getTime();
    const nowMs = Date.now();
    const diff = Math.floor((nowMs - startedMs) / 1000);

    return Math.max(0, unitTime - diff);
  };

  const saveAnswerToDb = async (item, value) => {
    if (!attemptId) return;

    const safeValue = value == null ? "" : value;

    const { error } = await supabase.from("final_test_answers").upsert(
      [
        {
          attempt_id: attemptId,
          item_id: item.id,
          answer: { type: "single", value: safeValue },
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
      const safeValue = answers[it.id] == null ? "" : answers[it.id];

      return {
        attempt_id: attemptId,
        item_id: it.id,
        answer: { type: "single", value: safeValue },
      };
    });

    const { error } = await supabase
      .from("final_test_answers")
      .upsert(rows, { onConflict: "attempt_id,item_id" });

    if (error) throw error;
  };

  const buildPassMapFromSectionScores = (sectionScores) => {
    const passMap = {};

    for (let unit = 1; unit <= TOTAL_UNITS; unit++) {
      const score = Number(sectionScores[unit]) || 0;
      passMap[unit] = score >= getUnitPassThreshold(unit);
    }

    return passMap;
  };

  const buildScoresFromLockedUnits = async ({
    lockedUnits = [],
    forceZeroFromUnit = null,
  }) => {
    let totalScore = 0;
    let maxScore = 0;

    const sectionScores = createUnitScoreMap();
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

      if (isLocked && !isForcedZero && it.type === "single") {
        const correct = it.correct_answer?.value;
        score = userAnswer === correct ? point : 0;
      } else {
        score = 0;
      }

      score = round2(score);
      totalScore = round2(totalScore + score);
      sectionScores[unit] = round2((Number(sectionScores[unit]) || 0) + score);
    });

    const passMap = buildPassMapFromSectionScores(sectionScores);

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

  const finalizeFinalTest = async () => {
    if (finalizingRef.current) return;
    finalizingRef.current = true;

    try {
      if (!userId || !finalTestId || !attemptId) {
        setMsg("ข้อมูลระบบยังไม่พร้อม กรุณารีเฟรชแล้วลองใหม่");
        return;
      }

      const rows = items.map((it) => {
        const safeValue = answers[it.id] == null ? "" : answers[it.id];

        return {
          attempt_id: attemptId,
          item_id: it.id,
          answer: { type: "single", value: safeValue },
        };
      });

      const { error: upsertErr } = await supabase
        .from("final_test_answers")
        .upsert(rows, { onConflict: "attempt_id,item_id" });

      if (upsertErr) throw upsertErr;

      openProcessingPopup(
        "กรุณารอสักครู่",
        "ระบบกำลังตรวจคำตอบและสรุปผลคะแนน Final ของคุณ"
      );

      setMsg("ระบบกำลังประมวลผลคำตอบ กรุณาอย่าออกจากหน้านี้");
      await new Promise((resolve) => setTimeout(resolve, 50));

      let totalScore = 0;
      let maxScore = 0;

      const sectionScores = createUnitScoreMap();
      const answersPayload = {};
      const perItem = {};

      items.forEach((it) => {
        const userAnswer = answers[it.id];
        const point = getItemPoint(it);

        maxScore = round2(maxScore + point);
        answersPayload[`q${it.order_index}`] = userAnswer ?? "";

        let score = 0;

        if (it.type === "single") {
          const correct = it.correct_answer?.value;
          score = userAnswer === correct ? point : 0;
        }

        score = round2(score);
        totalScore = round2(totalScore + score);
        sectionScores[it.unit] = round2((Number(sectionScores[it.unit]) || 0) + score);

        perItem[it.id] = {
          score,
          maxScore: point,
          unit: it.unit,
          orderIndex: it.order_index,
          type: it.type,
        };
      });

      const passMap = buildPassMapFromSectionScores(sectionScores);
      const nowIso = new Date().toISOString();

      const { data: attemptBeforeUpdate, error: attemptBeforeUpdateErr } = await supabase
        .from("final_test_attempts")
        .select("meta")
        .eq("id", attemptId)
        .single();

      if (attemptBeforeUpdateErr) throw attemptBeforeUpdateErr;

      const prevMeta = attemptBeforeUpdate?.meta || {};

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
            ...prevMeta,
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
      });

      setScoreSnapshot({
        firstTotalScore: snapshot?.firstTotalScore ?? totalScore,
        latestTotalScore: snapshot?.latestTotalScore ?? totalScore,
        maxScore,
        firstSubmittedAt: snapshot?.firstSubmittedAt ?? nowIso,
        latestSubmittedAt: snapshot?.latestSubmittedAt ?? nowIso,
      });

      closeProcessingPopup();
      setMsg("ส่งคำตอบสำเร็จ ✅ กำลังพาไปหน้าหลัก...");
      setRedirecting(true);

      window.setTimeout(() => {
        navigate("/main", { replace: true });
      }, 1500);
    } catch (error) {
      console.error("finalizeFinalTest error:", error);
      closeProcessingPopup();
      setMsg(`ส่งคำตอบไม่สำเร็จ ❌ ${error.message || ""}`);
      setSubmitting(false);
    } finally {
      finalizingRef.current = false;
    }
  };

  const disqualifyAttempt = async (reason = "left_exam_page") => {
    if (disqualifiedRef.current || finalizingRef.current || !attemptId || !userId || !finalTestId) {
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
        .select("meta, current_unit")
        .eq("id", attemptId)
        .single();

      if (attemptReadErr) throw attemptReadErr;

      try {
        await saveCurrentUnitAnswers();
      } catch (saveErr) {
        console.error("saveCurrentUnitAnswers before disqualify error:", saveErr);
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

      setMsg("ตรวจพบการออกจากหน้าแบบทดสอบ ระบบยุติการสอบและนับคะแนนเฉพาะหน่วยที่ทำเสร็จก่อนหน้า");

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
          setMsg(`กรุณาตอบให้ครบทั้ง ${currentItems.length} ข้อก่อนไปบทถัดไป`);
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
      setTimeLeft(getUnitTimeSeconds(nextUnit));

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

        const { data: finalTest, error: finalTestErr } = await supabase
          .from("final_tests")
          .select("id, title, version")
          .eq("is_active", true)
          .single();

        if (finalTestErr || !finalTest) {
          console.error(finalTestErr);
          if (alive) setMsg("ไม่พบชุดข้อสอบ Final");
          return;
        }

        const snapshot = await loadFinalScoreSnapshot(user.id, finalTest.id);

        const { data: inProgressAttempts, error: inProgressErr } = await supabase
          .from("final_test_attempts")
          .select("id, status, current_unit, unit_started_at, meta, attempt_no, started_at")
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
          const { data: latestAttempt, error: latestAttemptErr } = await supabase
            .from("final_test_attempts")
            .select("attempt_no")
            .eq("user_id", user.id)
            .eq("final_test_id", finalTest.id)
            .order("attempt_no", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (latestAttemptErr) {
            console.error(latestAttemptErr);
            if (alive) setMsg("โหลดข้อมูลการทำ Final ไม่สำเร็จ");
            return;
          }

          const nextAttemptNo = Number(latestAttempt?.attempt_no || 0) + 1;
          const nowIso = new Date().toISOString();

          const { data: createdAttempt, error: createAttemptErr } = await supabase
            .from("final_test_attempts")
            .insert({
              final_test_id: finalTest.id,
              user_id: user.id,
              attempt_no: nextAttemptNo,
              status: "in_progress",
              current_unit: 1,
              unit_started_at: nowIso,
              started_at: nowIso,
              flag_count: 0,
              meta: { source: "frontend", locked_units: [] },
            })
            .select("id, status, current_unit, unit_started_at, meta, attempt_no, started_at")
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
          .from("final_test_items")
          .select("id, unit, order_index, type, prompt, choices, points, correct_answer")
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
          order_index: Number(it.order_index),
          choices: Array.isArray(it.choices) ? it.choices : [],
        }));

        const initialAnswers = {};
        normalizedItems.forEach((it) => {
          initialAnswers[it.id] = initAnswerByType(it.type);
        });

        const { data: savedAnswers } = await supabase
          .from("final_test_answers")
          .select("item_id, answer")
          .eq("attempt_id", currentAttempt.id);

        (savedAnswers || []).forEach((row) => {
          const item = normalizedItems.find((it) => it.id === row.item_id);
          if (!item) return;

          const savedValue = row.answer?.value;
          initialAnswers[row.item_id] = savedValue ?? "";
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
            currentAttempt.unit_started_at,
            loadedUnit
          )
        );

        setScoreSnapshot({
          firstTotalScore: snapshot?.firstTotalScore ?? null,
          latestTotalScore: snapshot?.latestTotalScore ?? null,
          maxScore: normalizedItems.length,
          firstSubmittedAt: snapshot?.firstSubmittedAt ?? null,
          latestSubmittedAt: snapshot?.latestSubmittedAt ?? null,
        });
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
      const remain = calculateRemainingSeconds(unitStartedAt, safeCurrentUnit);
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
  }, [examStarted, showRulesModal, redirecting, attemptId, userId, finalTestId, safeCurrentUnit]);

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
                  maxWidth: 620,
                  background: "#fff",
                  borderRadius: 20,
                  padding: 24,
                  boxSizing: "border-box",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
                }}
              >
                <h2 style={{ marginTop: 0, marginBottom: 12 }}>
                  ข้อกำหนดก่อนเริ่มทำ Final
                </h2>

                <div style={{ lineHeight: 1.8, color: "#333", fontSize: 15 }}>
                  <div>1. Final ทำได้หลายครั้ง และระบบจะเก็บคะแนน 2 ค่า คือ คะแนนครั้งแรก และคะแนนครั้งล่าสุด</div>
                  <div>2. เวลาเท่ากับ pretest: บท 1–4 และ 6 บทละ 6 นาที, บท 5 และ 7 บทละ 8 นาที, บท 8 บทละ 10 นาที</div>
                  <div>3. เมื่อไปบทถัดไปแล้วจะไม่สามารถย้อนกลับได้</div>
                  <div>4. หากออกจากหน้าแบบทดสอบหรือสลับแท็บ ระบบจะยุติการสอบทันที และนับคะแนนเฉพาะหน่วยที่ทำเสร็จก่อนหน้า</div>
                  <div>5. ข้อสอบเป็นแบบปรนัยทั้งหมด ใช้เพื่อสรุปผลและฝึกทำซ้ำได้</div>
                </div>

                <div
                  style={{
                    marginTop: 18,
                    padding: 12,
                    borderRadius: 12,
                    background: "#fff3cd",
                    color: "#7a5900",
                    fontWeight: 700,
                    lineHeight: 1.7,
                  }}
                >
                  คะแนนครั้งแรกจะถูกเก็บไว้ใช้วิเคราะห์ t-test และระบบจะอัปเดตคะแนนครั้งล่าสุดทุกครั้งที่ส่งข้อสอบ
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
              <h1 className="title">Final ({totalQuestions} ข้อ)</h1>
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
                disabled={submitting || redirecting || examStarted}
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

            <div style={{ marginTop: 12, fontSize: 14, color: "#444", lineHeight: 1.7 }}>
              <div>
                คะแนนครั้งแรก:{" "}
                <b>
                  {scoreSnapshot.firstTotalScore != null
                    ? `${Number(scoreSnapshot.firstTotalScore).toFixed(2)} / ${Number(
                        scoreSnapshot.maxScore ?? totalQuestions
                      ).toFixed(2)}`
                    : "-"}
                </b>
              </div>
              <div>
                คะแนนครั้งล่าสุด:{" "}
                <b>
                  {scoreSnapshot.latestTotalScore != null
                    ? `${Number(scoreSnapshot.latestTotalScore).toFixed(2)} / ${Number(
                        scoreSnapshot.maxScore ?? totalQuestions
                      ).toFixed(2)}`
                    : "-"}
                </b>
              </div>
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
              {currentItems.map((q, idx) => {
                const qImage = getQuestionImage(q);

                return (
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

                    {qImage && (
                      <div style={{ marginTop: 14, marginBottom: 14 }}>
                        <img
                          src={qImage}
                          alt={`question-${q.order_index}`}
                          style={{
                            display: "block",
                            width: "100%",
                            maxWidth: "640px",
                            borderRadius: 16,
                            border: "1px solid #e5e7eb",
                            margin: "0 auto",
                            objectFit: "contain",
                            background: "#fff",
                          }}
                          onContextMenu={(e) => e.preventDefault()}
                          draggable={false}
                        />
                      </div>
                    )}

                    {q.type === "single" ? (
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
                    ) : (
                      <div
                        style={{
                          marginTop: 12,
                          padding: 12,
                          borderRadius: 12,
                          background: "#fff4e5",
                          color: "#8a5700",
                          fontSize: 14,
                          fontWeight: 600,
                        }}
                      >
                        รองรับเฉพาะข้อสอบแบบเลือกตอบ (single) เท่านั้น
                      </div>
                    )}
                  </div>
                );
              })}

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
                  คะแนนรอบนี้: <b>{Number(result.totalScore).toFixed(2)}</b> /{" "}
                  {Number(result.maxScore).toFixed(2)}

                  <div style={{ marginTop: 12, lineHeight: 1.8 }}>
                    {Object.entries(result.sectionScores).map(([unit, score]) => {
                      const unitNo = Number(unit);
                      const unitMax = getUnitMaxScore(unitNo);
                      const unitPass = getUnitPassThreshold(unitNo);

                      return (
                        <div key={unit}>
                          หน่วย {unitNo}: {Number(score).toFixed(2)}/{unitMax}.00{" "}
                          (เกณฑ์ผ่าน {unitPass}/{unitMax}){" "}
                          {result.passMap[unitNo] ? "✅ ผ่าน" : "❌ ไม่ผ่าน"}
                        </div>
                      );
                    })}
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