import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type PretestItem = {
  type?: string;
  prompt?: string;
  correct_answer?: {
    max_score?: number;
    must_have?: string[];
    common_mistakes?: string[];
    examples_good?: string[];
    [key: string]: unknown;
  } | null;
};

type PretestAnswerRow = {
  id: string;
  answer: unknown;
  pretest_items: PretestItem | PretestItem[] | null;
};

type BatchGradeResult = {
  results?: Array<{
    answer_id?: string;
    score?: unknown;
    feedback_th?: unknown;
  }>;
};

function clampScore(score: number, maxScore: number) {
  const safe = Number.isFinite(score) ? score : 0;
  return Math.max(0, Math.min(maxScore, safe));
}

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

function cleanJsonText(text: string): string {
  return String(text ?? "").replace(/```json|```/gi, "").trim();
}

function safeParseJson<T>(text: string, fallback: T): T {
  try {
    return JSON.parse(cleanJsonText(text));
  } catch {
    return fallback;
  }
}

function normalizeItem(raw: PretestAnswerRow["pretest_items"]): PretestItem | null {
  if (!raw) return null;
  if (Array.isArray(raw)) return raw[0] ?? null;
  return raw;
}

function extractStudentAnswer(rawAnswer: unknown): string {
  try {
    if (typeof rawAnswer === "object" && rawAnswer !== null) {
      const obj = rawAnswer as Record<string, unknown>;
      return normalizeText(obj?.value);
    }

    if (typeof rawAnswer === "string") {
      const parsed = JSON.parse(rawAnswer);
      if (parsed && typeof parsed === "object") {
        return normalizeText((parsed as Record<string, unknown>)?.value);
      }
      return normalizeText(rawAnswer);
    }

    return normalizeText(rawAnswer);
  } catch {
    if (typeof rawAnswer === "object" && rawAnswer !== null) {
      return normalizeText((rawAnswer as Record<string, unknown>)?.value);
    }
    return normalizeText(rawAnswer);
  }
}

function getAllowedScoreBands(maxScore: number) {
  // ถ้าเต็ม 1 -> 0, 0.5, 1
  if (maxScore === 1) return [0, 0.5, 1];

  // ถ้าเต็ม 1.5 -> 0, 0.5, 1.0, 1.5
  if (maxScore === 1.5) return [0, 0.5, 1.0, 1.5];

  // ถ้าเต็ม 2 -> 0, 1, 2
  if (maxScore === 2) return [0, 1, 2];

  // fallback
  return [0, maxScore];
}

function snapToAllowedBand(score: number, allowedBands: number[], maxScore: number) {
  let safeScore = clampScore(score, maxScore);

  if (!allowedBands.includes(safeScore)) {
    let nearest = allowedBands[0];
    let minDiff = Math.abs(safeScore - nearest);

    for (const band of allowedBands) {
      const diff = Math.abs(safeScore - band);
      if (diff < minDiff) {
        minDiff = diff;
        nearest = band;
      }
    }

    safeScore = nearest;
  }

  return safeScore;
}

async function callGeminiJson(apiKey: string, prompt: string): Promise<string> {
  const geminiUrl =
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

  const res = await fetch(geminiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        topK: 20,
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

    if (!attempt_id) {
      throw new Error("attempt_id is required");
    }

    console.log("--- START PRETEST GRADING:", attempt_id, "---");

    const { data: answers, error: ansErr } = await sbAdmin
      .from("pretest_answers")
      .select(`
        id,
        answer,
        pretest_items (
          type,
          prompt,
          correct_answer
        )
      `)
      .eq("attempt_id", attempt_id);

    if (ansErr) throw ansErr;

    const answerRows: PretestAnswerRow[] = answers || [];

    if (answerRows.length === 0) {
      return new Response(JSON.stringify({ error: "No answers found" }), {
        status: 404,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    // รวมเฉพาะข้ออัตนัย short เพื่อเรียก AI แค่ครั้งเดียว
    const shortRows = answerRows
      .map((row) => {
        const item = normalizeItem(row.pretest_items);
        if (item?.type !== "short") return null;

        const studentAnswer = extractStudentAnswer(row.answer);
        const rubricRaw = item?.correct_answer || {};
        const promptText = normalizeText(item?.prompt);
        const maxScore = Number(rubricRaw?.max_score) || 1;
        const allowedBands = getAllowedScoreBands(maxScore);

        const mustHave = Array.isArray(rubricRaw?.must_have) ? rubricRaw.must_have : [];
        const commonMistakes = Array.isArray(rubricRaw?.common_mistakes)
          ? rubricRaw.common_mistakes
          : [];
        const examplesGood = Array.isArray(rubricRaw?.examples_good)
          ? rubricRaw.examples_good
          : [];

        return {
          answer_id: row.id,
          prompt: promptText,
          student_answer: studentAnswer,
          max_score: maxScore,
          allowed_bands: allowedBands,
          must_have: mustHave,
          common_mistakes: commonMistakes,
          examples_good: examplesGood,
        };
      })
      .filter(Boolean) as Array<{
      answer_id: string;
      prompt: string;
      student_answer: string;
      max_score: number;
      allowed_bands: number[];
      must_have: string[];
      common_mistakes: string[];
      examples_good: string[];
    }>;

    // ถ้าไม่มีข้อ short ก็จบเลยเหมือนเดิม
    if (shortRows.length === 0) {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    // อัปเดตข้อที่ว่างก่อน เพื่อให้พฤติกรรมเหมือนเดิม
    const rowsForAi = [];
    for (const row of shortRows) {
      if (!row.student_answer) {
        await sbAdmin
          .from("pretest_answers")
          .update({
            score: 0,
            ai_feedback: "ไม่พบคำตอบ",
          })
          .eq("id", row.answer_id);

        console.log(`⚠️ Empty answer on row ${row.answer_id}`);
        continue;
      }

      rowsForAi.push(row);
    }

    // ถ้าทุกข้อว่าง ก็จบเลย
    if (rowsForAi.length === 0) {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    // เรียก AI ครั้งเดียว
    const batchPrompt = `
คุณคือผู้ช่วยตรวจข้อสอบอัตนัยสั้นสำหรับ pretest ภาษาไทยของนักเรียนระดับมัธยมศึกษา

เป้าหมาย:
- พิจารณา "ความหมายโดยรวม" ของคำตอบนักเรียน
- ไม่ยึดติดการใช้คำตรงตาม rubric หรือ keyword เป๊ะ
- ถ้านักเรียนใช้ภาษาง่าย สั้น หรือภาษาพูด แต่สาระสำคัญถูกต้อง ให้สามารถได้คะแนน
- อย่าตัดคะแนนเพียงเพราะสำนวนต่างจากตัวอย่าง
- แต่ต้องให้คะแนนอย่างสม่ำเสมอและระมัดระวัง ไม่แจกเต็มโดยไม่มีเหตุผล

งานของคุณ:
- ตรวจทุกข้อในรายการด้านล่าง
- แต่ละข้อให้เลือกคะแนนได้เฉพาะจาก allowed_bands ของข้อนั้นเท่านั้น
- ห้ามให้คะแนนนอกช่วงหรือค่านอก allowed_bands
- ให้ feedback_th สั้น กระชับ ตรงประเด็น

หลักการให้คะแนน:
- ให้ 0 ถ้าคำตอบว่าง ไม่เกี่ยวข้อง หรือผิดประเด็นเป็นหลัก
- ให้คะแนนขั้นต่ำระดับกลาง ถ้าคำตอบพอสะท้อนแนวคิดที่ถูกต้องบางส่วน
- ให้คะแนนเต็มเมื่อคำตอบตรงประเด็นชัดเจนและสื่อสารสาระสำคัญครบพอสมควร
- หากคำตอบถูกบางส่วน ให้เลือกคะแนนแบบขั้นที่เหมาะสมที่สุดจากรายการที่กำหนด

ข้อมูลข้อสอบทั้งหมด:
${JSON.stringify(rowsForAi, null, 2)}

ให้ตอบเป็น JSON object เท่านั้น ห้ามมี markdown ห้ามมีข้อความอื่น
รูปแบบ:
{
  "results": [
    {
      "answer_id": "string",
      "score": number,
      "feedback_th": "string"
    }
  ]
}
`.trim();

    try {
      const resultText = await callGeminiJson(apiKey, batchPrompt);
      const parsed = safeParseJson<BatchGradeResult>(resultText, { results: [] });

      const resultMap = new Map<
        string,
        {
          score: number;
          feedback_th: string;
        }
      >();

      for (const r of parsed.results || []) {
        const answerId = normalizeText(r?.answer_id);
        if (!answerId) continue;

        resultMap.set(answerId, {
          score: Number(r?.score),
          feedback_th: normalizeText(r?.feedback_th) || "ตรวจแล้ว",
        });
      }

      for (const row of rowsForAi) {
        const graded = resultMap.get(row.answer_id);

        if (!graded) {
          await sbAdmin
            .from("pretest_answers")
            .update({
              score: 0,
              ai_feedback: "ระบบอ่านผลตรวจไม่สำเร็จ",
            })
            .eq("id", row.answer_id);

          console.error(`Missing graded result for row ${row.answer_id}`);
          continue;
        }

        const safeScore = snapToAllowedBand(
          graded.score,
          row.allowed_bands,
          row.max_score,
        );

        await sbAdmin
          .from("pretest_answers")
          .update({
            score: safeScore,
            ai_feedback: graded.feedback_th,
          })
          .eq("id", row.answer_id);

        console.log(`✅ Pretest row ${row.answer_id} graded with score ${safeScore}`);
      }
    } catch (err: any) {
      console.error("Batch pretest grading failed:", err?.message || err);

      for (const row of rowsForAi) {
        await sbAdmin
          .from("pretest_answers")
          .update({
            score: 0,
            ai_feedback: "ระบบตรวจอัตนัยขัดข้อง",
          })
          .eq("id", row.answer_id);
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (err: any) {
    console.error("grade-pretest fatal error:", err);

    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
});