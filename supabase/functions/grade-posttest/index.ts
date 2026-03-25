import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PASS_PERCENT = 60;

type CorrectAnswer = {
  value?: unknown;
  max_score?: number;
  must_have?: string[];
  nice_to_have?: string[];
  common_mistakes?: string[];
  examples_good?: string[];
  [key: string]: unknown;
};

type Choice = {
  id: string;
  label?: string;
  [key: string]: unknown;
};

type PosttestItem = {
  id: string;
  prompt?: string;
  type?: string;
  choices?: Choice[];
  points?: number | string | null;
  correct_answer?: CorrectAnswer | null;
  objective_tags?: unknown;
  order_index?: number | null;
  posttest_id?: string | null;
  scenario_id?: string | null;
};

type AnswerRow = {
  id: string;
  item_id: string;
  answer: unknown;
  score: number | null;
  ai_feedback?: string | null;
  posttest_items: PosttestItem | PosttestItem[] | null;
};

type SummaryWeakness = {
  topic: string;
  feedback?: string;
};

type SummaryJson = {
  summary: string;
  strengths: string[];
  weaknesses: SummaryWeakness[];
};

type PosttestMeta = {
  id: string;
  unit?: number | null;
  title?: string | null;
};

type ScenarioMeta = {
  id: string;
  title?: string | null;
  context?: string | null;
  order_index?: number | null;
};

type ShortBatchResult = {
  results_by_id?: Record<
    string,
    {
      score?: number;
      feedback_th?: string;
    }
  >;
  summary?: string;
  strengths?: string[];
  weaknesses?: Array<string | { topic: string; feedback?: string }>;
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function cleanJsonText(text: string): string {
  return text.replace(/```json|```/gi, "").trim();
}

function safeParseJson<T>(text: string, fallback: T): T {
  try {
    return JSON.parse(cleanJsonText(text));
  } catch {
    return fallback;
  }
}

function toNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}

function normalizeItem(raw: AnswerRow["posttest_items"]): PosttestItem | null {
  if (!raw) return null;
  if (Array.isArray(raw)) return raw[0] ?? null;
  return raw;
}

function extractAnswerValue(rawAns: unknown): unknown {
  if (typeof rawAns === "object" && rawAns !== null) {
    const obj = rawAns as Record<string, unknown>;
    return "value" in obj ? obj.value : rawAns;
  }

  if (typeof rawAns === "string") {
    try {
      const parsed = JSON.parse(rawAns);
      if (parsed && typeof parsed === "object" && "value" in parsed) {
        return (parsed as Record<string, unknown>).value;
      }
      return parsed;
    } catch {
      return rawAns;
    }
  }

  return rawAns;
}

function extractStudentAnswerText(rawAns: unknown): string {
  const value = extractAnswerValue(rawAns);
  return typeof value === "string" ? value.trim() : "";
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((x) => String(x ?? "").trim())
    .filter(Boolean);
}

function normalizeString(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeObjectiveTags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((x) => normalizeString(x)).filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed)
        ? parsed.map((x) => normalizeString(x)).filter(Boolean)
        : [trimmed];
    } catch {
      return [trimmed];
    }
  }

  return [];
}

function getItemMaxScore(item: PosttestItem | null): number {
  if (!item) return 1;

  const fromPoints = toNumber(item.points, 0);
  if (fromPoints > 0) return fromPoints;

  if (item.type === "short") {
    const fromRubric = toNumber(item.correct_answer?.max_score, 2);
    return fromRubric > 0 ? fromRubric : 2;
  }

  return 1;
}

function calcPercent(total: number, max: number): number {
  if (max <= 0) return 0;
  return Math.round((total / max) * 100);
}

function arraysEqualExactly(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}

function arraysEqualAsSet(a: string[], b: string[]): boolean {
  const sa = [...a].sort();
  const sb = [...b].sort();
  if (sa.length !== sb.length) return false;
  return sa.every((v, i) => v === sb[i]);
}

function evaluateObjectiveAnswer(
  item: PosttestItem | null,
  rawAnswer: unknown,
): {
  score: number;
  maxScore: number;
  feedback: string;
  isCorrect: boolean;
} {
  const maxScore = getItemMaxScore(item);
  const itemType = item?.type || "";
  const correctValue = item?.correct_answer?.value;

  if (!item || !itemType) {
    return {
      score: 0,
      maxScore,
      feedback: "ไม่พบข้อมูลโจทย์สำหรับประเมินคะแนน",
      isCorrect: false,
    };
  }

  const answerValue = extractAnswerValue(rawAnswer);

  if (itemType === "single") {
    const student = normalizeString(answerValue);
    const correct = normalizeString(correctValue);
    const ok = !!student && !!correct && student === correct;

    return {
      score: ok ? maxScore : 0,
      maxScore,
      feedback: ok ? "ตอบถูกต้อง" : "คำตอบยังไม่ถูกต้อง",
      isCorrect: ok,
    };
  }

  if (itemType === "multi") {
    const student = normalizeStringArray(answerValue);
    const correct = normalizeStringArray(correctValue);

    const ok =
      student.length > 0 &&
      correct.length > 0 &&
      arraysEqualAsSet(student, correct);

    return {
      score: ok ? maxScore : 0,
      maxScore,
      feedback: ok ? "เลือกคำตอบได้ถูกต้องครบถ้วน" : "คำตอบยังไม่ถูกต้องหรือยังไม่ครบ",
      isCorrect: ok,
    };
  }

  if (itemType === "ordering") {
    const student = normalizeStringArray(answerValue);
    const correct = normalizeStringArray(correctValue);

    const ok =
      student.length > 0 &&
      correct.length > 0 &&
      arraysEqualExactly(student, correct);

    return {
      score: ok ? maxScore : 0,
      maxScore,
      feedback: ok ? "เรียงลำดับได้ถูกต้อง" : "ลำดับคำตอบยังไม่ถูกต้อง",
      isCorrect: ok,
    };
  }

  return {
    score: 0,
    maxScore,
    feedback: "ยังไม่รองรับการตรวจข้อประเภทนี้",
    isCorrect: false,
  };
}

function sanitizeSummary(parsed: Partial<SummaryJson>): SummaryJson {
  const strengths = Array.isArray(parsed.strengths)
    ? parsed.strengths
        .filter((x) => typeof x === "string" && x.trim())
        .map((x) => x.trim())
        .slice(0, 3)
    : [];

  const weaknesses = Array.isArray(parsed.weaknesses)
    ? parsed.weaknesses
        .map((w) => {
          if (typeof w === "string") {
            return w.trim() ? { topic: w.trim(), feedback: "" } : null;
          }

          if (w && typeof w === "object") {
            const topic =
              typeof (w as { topic?: unknown }).topic === "string"
                ? ((w as { topic?: string }).topic || "").trim()
                : "";

            const feedback =
              typeof (w as { feedback?: unknown }).feedback === "string"
                ? ((w as { feedback?: string }).feedback || "").trim()
                : "";

            if (!topic) return null;
            return { topic, feedback };
          }

          return null;
        })
        .filter(Boolean) as SummaryWeakness[]
    : [];

  return {
    summary:
      typeof parsed.summary === "string" && parsed.summary.trim()
        ? parsed.summary.trim().slice(0, 100)
        : "",
    strengths,
    weaknesses,
  };
}

async function callGeminiJson(apiKey: string, prompt: string): Promise<string> {
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${errText}`);
  }

  const out = await res.json();
  return out?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const apiKey = Deno.env.get("GEMINI_API_KEY");

    if (!supabaseUrl || !serviceRoleKey || !apiKey) {
      throw new Error("Missing required environment variables");
    }

    const sbAdmin = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json().catch(() => null);
    const attempt_id = body?.attempt_id;

    if (!attempt_id || typeof attempt_id !== "string") {
      return jsonResponse({ error: "attempt_id is required" }, 400);
    }

    console.log("🔥 GRADE POSTTEST RUNNING", { attempt_id });

    const { data: answers, error: ansErr } = await sbAdmin
      .from("posttest_answers")
      .select(`
        id,
        item_id,
        answer,
        score,
        ai_feedback,
        posttest_items (
          id,
          posttest_id,
          scenario_id,
          order_index,
          prompt,
          type,
          choices,
          points,
          correct_answer,
          objective_tags
        )
      `)
      .eq("attempt_id", attempt_id);

    if (ansErr) throw ansErr;

    const answerRows: AnswerRow[] = answers || [];

    if (answerRows.length === 0) {
      return jsonResponse({ error: "No answers found for this attempt" }, 404);
    }

    const posttestIds = [
      ...new Set(
        answerRows
          .map((row) => normalizeItem(row.posttest_items)?.posttest_id)
          .filter((x): x is string => typeof x === "string" && x.length > 0),
      ),
    ];

    const scenarioIds = [
      ...new Set(
        answerRows
          .map((row) => normalizeItem(row.posttest_items)?.scenario_id)
          .filter((x): x is string => typeof x === "string" && x.length > 0),
      ),
    ];

    const posttestMap = new Map<string, PosttestMeta>();
    const scenarioMap = new Map<string, ScenarioMeta>();

    if (posttestIds.length > 0) {
      const { data: posttests, error: posttestsErr } = await sbAdmin
        .from("posttests")
        .select("id, unit, title")
        .in("id", posttestIds);

      if (posttestsErr) throw posttestsErr;

      for (const p of posttests || []) {
        posttestMap.set(p.id, p as PosttestMeta);
      }
    }

    if (scenarioIds.length > 0) {
      const { data: scenarios, error: scenariosErr } = await sbAdmin
        .from("posttest_scenarios")
        .select("id, title, context, order_index")
        .in("id", scenarioIds);

      if (scenariosErr) throw scenariosErr;

      for (const s of scenarios || []) {
        scenarioMap.set(s.id, s as ScenarioMeta);
      }
    }

    // 1) ตรวจ objective ในโค้ดก่อน ไม่เรียก AI
    for (const row of answerRows) {
      const item = normalizeItem(row.posttest_items);
      const itemType = item?.type || "";

      if (itemType === "short") continue;

      const evaluated = evaluateObjectiveAnswer(item, row.answer);

      await sbAdmin
        .from("posttest_answers")
        .update({
          score: evaluated.score,
          ai_feedback: evaluated.feedback,
        })
        .eq("id", row.id);

      row.score = evaluated.score;
      row.ai_feedback = evaluated.feedback;
    }

    // 2) เตรียมข้อมูลสำหรับ AI call เดียว
    const shortBatch = answerRows
      .map((row) => {
        const item = normalizeItem(row.posttest_items);
        if (!item || item.type !== "short") return null;

        const posttest = item.posttest_id ? posttestMap.get(item.posttest_id) : undefined;
        const scenario = item.scenario_id ? scenarioMap.get(item.scenario_id) : undefined;
        const studentAnswer = extractStudentAnswerText(row.answer);
        const maxScore = getItemMaxScore(item);

        return {
          answer_id: row.id,
          item_id: row.item_id,
          order_index: item.order_index ?? null,
          unit: posttest?.unit ?? null,
          unit_title: posttest?.title ?? "",
          scenario_title: scenario?.title ?? "",
          scenario_context: scenario?.context ?? "",
          question: item.prompt || "",
          objective_tags: normalizeObjectiveTags(item.objective_tags),
          max_score: maxScore,
          student_answer: studentAnswer,
          rubric: {
            must_have: Array.isArray(item.correct_answer?.must_have)
              ? item.correct_answer?.must_have
              : [],
            nice_to_have: Array.isArray(item.correct_answer?.nice_to_have)
              ? item.correct_answer?.nice_to_have
              : [],
            common_mistakes: Array.isArray(item.correct_answer?.common_mistakes)
              ? item.correct_answer?.common_mistakes
              : [],
            examples_good: Array.isArray(item.correct_answer?.examples_good)
              ? item.correct_answer?.examples_good
              : [],
          },
        };
      })
      .filter(Boolean) as Array<{
      answer_id: string;
      item_id: string;
      order_index: number | null;
      unit: number | null;
      unit_title: string;
      scenario_title: string;
      scenario_context: string;
      question: string;
      objective_tags: string[];
      max_score: number;
      student_answer: string;
      rubric: {
        must_have: string[];
        nice_to_have: string[];
        common_mistakes: string[];
        examples_good: string[];
      };
    }>;

    const objectiveSummaryRows = answerRows
      .map((row) => {
        const item = normalizeItem(row.posttest_items);
        if (!item || item.type === "short") return null;

        const posttest = item.posttest_id ? posttestMap.get(item.posttest_id) : undefined;
        const scenario = item.scenario_id ? scenarioMap.get(item.scenario_id) : undefined;
        const itemMax = getItemMaxScore(item);
        const itemScore = clamp(toNumber(row.score, 0), 0, itemMax);

        let result = "ผิด/ยังทำไม่ได้";
        if (itemScore >= itemMax) result = "ถูกครบ";
        else if (itemScore > 0) result = "ได้บางส่วน";

        return {
          answer_id: row.id,
          item_id: row.item_id,
          unit: posttest?.unit ?? null,
          unit_title: posttest?.title ?? "",
          order_index: item.order_index ?? null,
          scenario_title: scenario?.title ?? "",
          scenario_context: scenario?.context ?? "",
          question: item.prompt || "",
          type: item.type || "",
          objective_tags: normalizeObjectiveTags(item.objective_tags),
          score: itemScore,
          max_score: itemMax,
          result,
          feedback: row.ai_feedback || "",
          student_answer: extractAnswerValue(row.answer),
        };
      })
      .filter(Boolean);

    // 3) ถ้ามีข้อเขียน เรียก AI ครั้งเดียว: ตรวจข้อเขียน + สรุปภาพรวมจากทุกข้อ
    let aiSummaryFromBatch: Partial<SummaryJson> | null = null;

    if (shortBatch.length > 0) {
      const aiPrompt = `
คุณคือครูผู้ตรวจข้อสอบภาษาไทย

งานของคุณมี 2 ส่วน และต้องตอบเป็น JSON เท่านั้น

ส่วนที่ 1: ตรวจคำตอบข้อเขียนทั้งหมด
กติกา:
- ต้องมีผลตรวจครบทุก answer_id ที่ส่งให้ ห้ามขาดแม้แต่ข้อเดียว
- ให้ตอบใน key "results_by_id" โดยใช้ answer_id เป็น key
- ให้คะแนนแต่ละข้อเป็นจำนวนเต็ม
- ห้ามให้เกิน max_score ของข้อนั้น
- feedback_th ต้องสั้น ชัดเจน ว่าขาดหรือครบอะไร
- ถ้า student_answer ว่าง ให้ score = 0 และ feedback_th = "ไม่พบคำตอบจากนักเรียน"
- ถ้าไม่แน่ใจ ให้ใส่ score = 0 และ feedback_th ที่อธิบายสั้น ๆ
- ห้ามข้ามข้อ

ส่วนที่ 2: สรุปภาพรวมความเข้าใจของผู้เรียนจาก "ทุกข้อ" ใน attempt นี้
กติกา:
- ต้องอิงจาก objective_items ที่ตรวจแล้ว และ short_items ที่คุณตรวจในครั้งนี้ร่วมกัน
- ต้องอิงจากความหมายของโจทย์/สถานการณ์/หัวข้อ ไม่ใช่ดูแค่คะแนนรวม
- ห้ามอ้างเป็นรายข้อ
- ห้ามระบุเลขข้อ หรือคำว่า "ข้อที่", "รายการที่"
- strengths และ weaknesses ต้องเป็นภาพรวมเชิงความรู้
- summary ต้องยาวไม่เกิน 100 ตัวอักษร
- ห้ามพูดถึงพฤติกรรม เช่น ตั้งใจ ส่งครบ หรือขยัน
- ถ้าผู้เรียนทำได้ไม่เต็มคะแนนโดยรวม หรือมีข้อใดผิด/ได้บางส่วน ต้องระบุ weaknesses อย่างน้อย 1 ข้อ
- weaknesses ต้องอิงจากประเด็นความรู้ที่ยังอ่อนจากคำตอบรายข้อ
- ห้ามปล่อย weaknesses เป็น [] หากผู้เรียนทำได้ไม่เต็มคะแนนโดยรวม
- ให้ weaknesses เป็น [] ได้เฉพาะเมื่อผู้เรียนทำได้เต็มทุกข้อเท่านั้น

ข้อมูล objective_items (ตรวจแล้ว):
${JSON.stringify(objectiveSummaryRows, null, 2)}

ข้อมูล short_items (ให้คุณตรวจ):
${JSON.stringify(shortBatch, null, 2)}

ตอบ JSON เท่านั้นในรูปแบบนี้:
{
  "results_by_id": {
    "answer_id_1": {
      "score": 0,
      "feedback_th": "..."
    },
    "answer_id_2": {
      "score": 1,
      "feedback_th": "..."
    }
  },
  "summary": "สรุปภาพรวมความเข้าใจของผู้เรียน",
  "strengths": ["จุดเด่นเชิงความรู้แบบภาพรวม"],
  "weaknesses": [
    {
      "topic": "ประเด็นที่ควรพัฒนาในภาพรวม",
      "feedback": "คำแนะนำสั้น ๆ"
    }
  ]
}
`.trim();

      try {
        const batchText = await callGeminiJson(apiKey, aiPrompt);
        const batchParsed = safeParseJson<ShortBatchResult>(batchText, {
          results_by_id: {},
          summary: "",
          strengths: [],
          weaknesses: [],
        });

        const resultEntries = Object.entries(batchParsed.results_by_id || {});
        const resultMap = new Map(
          resultEntries.map(([answerId, result]) => [
            answerId,
            {
              score: clamp(Math.round(toNumber(result?.score, 0)), 0, 999),
              feedback_th:
                typeof result?.feedback_th === "string" && result.feedback_th.trim()
                  ? result.feedback_th.trim()
                  : "ตรวจแล้ว",
            },
          ]),
        );

        for (const row of answerRows) {
          const item = normalizeItem(row.posttest_items);
          if (!item || item.type !== "short") continue;

          const maxScore = getItemMaxScore(item);
          const studentAnswer = extractStudentAnswerText(row.answer);
          const aiRow = resultMap.get(row.id);

          let finalScore = 0;
          let finalFeedback = "ไม่พบคำตอบจากนักเรียน";

          if (studentAnswer) {
            if (aiRow) {
              finalScore = clamp(aiRow.score, 0, maxScore);
              finalFeedback = aiRow.feedback_th;
            } else {
              finalScore = 0;
              finalFeedback = "ระบบประเมินคำตอบไม่สำเร็จ";
            }
          }

          await sbAdmin
            .from("posttest_answers")
            .update({
              score: finalScore,
              ai_feedback: finalFeedback,
            })
            .eq("id", row.id);

          row.score = finalScore;
          row.ai_feedback = finalFeedback;
        }

        aiSummaryFromBatch = {
          summary: batchParsed.summary,
          strengths: Array.isArray(batchParsed.strengths) ? batchParsed.strengths : [],
          weaknesses: Array.isArray(batchParsed.weaknesses) ? batchParsed.weaknesses : [],
        };
      } catch (itemErr) {
        console.error("Short batch grading failed:", itemErr);

        for (const row of answerRows) {
          const item = normalizeItem(row.posttest_items);
          if (!item || item.type !== "short") continue;

          const studentAnswer = extractStudentAnswerText(row.answer);
          const fallbackScore = 0;
          const fallbackFeedback = studentAnswer
            ? "ระบบตรวจคำตอบอัตโนมัติขัดข้อง กรุณาตรวจทานอีกครั้ง"
            : "ไม่พบคำตอบจากนักเรียน";

          await sbAdmin
            .from("posttest_answers")
            .update({
              score: fallbackScore,
              ai_feedback: fallbackFeedback,
            })
            .eq("id", row.id);

          row.score = fallbackScore;
          row.ai_feedback = fallbackFeedback;
        }
      }
    }

    // 4) โหลดใหม่หลังให้คะแนนเสร็จทุกข้อ
    const { data: refreshedAnswers, error: refreshErr } = await sbAdmin
      .from("posttest_answers")
      .select(`
        id,
        item_id,
        answer,
        score,
        ai_feedback,
        posttest_items (
          id,
          posttest_id,
          scenario_id,
          order_index,
          prompt,
          type,
          choices,
          points,
          correct_answer,
          objective_tags
        )
      `)
      .eq("attempt_id", attempt_id);

    if (refreshErr) throw refreshErr;

    const finalAnswers: AnswerRow[] = refreshedAnswers || [];

    let totalScore = 0;
    let maxScore = 0;

    for (const row of finalAnswers) {
      const item = normalizeItem(row.posttest_items);
      const itemMax = getItemMaxScore(item);
      const itemScore = clamp(toNumber(row.score, 0), 0, itemMax);

      totalScore += itemScore;
      maxScore += itemMax;
    }

    const percent = calcPercent(totalScore, maxScore);
    const pass = percent >= PASS_PERCENT;

    const { error: attemptUpdateErr } = await sbAdmin
      .from("posttest_attempts")
      .update({
        total_score: totalScore,
        max_score: maxScore,
        pass,
      })
      .eq("id", attempt_id);

    if (attemptUpdateErr) throw attemptUpdateErr;

    let finalSummaryObj: SummaryJson = {
      summary: "",
      strengths: [],
      weaknesses: [],
    };

    if (aiSummaryFromBatch) {
      finalSummaryObj = sanitizeSummary(aiSummaryFromBatch);
    }

    const finalSummary = JSON.stringify(finalSummaryObj);

    const { error: summarySaveErr } = await sbAdmin
      .from("posttest_attempts")
      .update({ ai_summary: finalSummary })
      .eq("id", attempt_id);

    if (summarySaveErr) throw summarySaveErr;

    console.log("✅ AI grading/summarizing done");
    console.log("✅ FINAL SCORE:", { totalScore, maxScore, percent, pass });

    return jsonResponse({
      ok: true,
      attempt_id,
      total_score: totalScore,
      max_score: maxScore,
      percent,
      pass,
      ai_summary: finalSummaryObj,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("CRITICAL ERROR:", message);
    return jsonResponse({ error: message }, 500);
  }
});