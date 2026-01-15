import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  // 1. จัดการ CORS Pre-flight (กันพังเวลาเรียกจาก Browser)
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const apiKey = Deno.env.get("GEMINI_API_KEY")!;

    // ⚡ ใช้ Admin Client (Service Role) เพื่อให้ AI อัปเดต DB ได้แน่นอน
    const sbAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { attempt_id } = await req.json();
    console.log("--- START GRADING ATTEMPT:", attempt_id, "---");

    // 2. ดึงข้อมูลคำตอบที่นักเรียนพิมพ์มา
    const { data: answers, error: ansErr } = await sbAdmin
      .from("posttest_answers")
      .select(`id, answer, posttest_items(type, correct_answer)`)
      .eq("attempt_id", attempt_id);

    if (ansErr) throw ansErr;

    // 3. วนลูปตรวจข้อเขียน (short)
    for (const row of (answers || [])) {
      const item = row.posttest_items as any;
      if (item?.type !== "short") continue;

      // 🛠️ สกัดคำตอบออกมา ไม่ว่าจะมาเป็น Object หรือ JSON String
      let studentAnswer = "";
      const rawAns = row.answer;
      if (typeof rawAns === "object" && rawAns !== null) {
        studentAnswer = rawAns.value || "";
      } else if (typeof rawAns === "string") {
        try {
          const parsed = JSON.parse(rawAns);
          studentAnswer = parsed.value || "";
        } catch {
          studentAnswer = rawAns;
        }
      }

      console.log(`Row ID: ${row.id} | Answer Extracted: "${studentAnswer}"`);

      // ถ้าไม่ได้ตอบมา ให้ข้ามไป
      if (!studentAnswer || studentAnswer.trim() === "") {
        await sbAdmin.from("posttest_answers").update({
          score: 0,
          ai_feedback: "ไม่พบคำตอบจากนักเรียน"
        }).eq("id", row.id);
        continue;
      }

      // 4. เตรียม Rubric ให้ AI
      const rubricRaw = item.correct_answer || {};
      const rubricText = `คะแนนเต็ม: ${rubricRaw.max_score || 2}. เกณฑ์: ${
        Array.isArray(rubricRaw.must_have) ? rubricRaw.must_have.join(" และ ") : "พิจารณาความสมเหตุสมผล"
      }`;

      // 🚨 จุดที่มึงทดสอบ PowerShell ผ่านเมื่อกี้: ใช้ v1beta และ gemini-flash-latest
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `คุณคือครูผู้ตรวจข้อสอบ จงตรวจคำตอบนักเรียน: "${studentAnswer}" 
              อิงตามเกณฑ์: ${rubricText}
              กติกา:
              1. ให้คะแนน (score) เป็นตัวเลข
              2. เขียนคำแนะนำ (feedback_th) เป็นภาษาไทยสั้นๆ สุภาพ
              ห้ามมี Markdown หรือคำเกริ่นใดๆ
              ตอบเป็น JSON เท่านั้น: {"score": number, "feedback_th": "string"}`
            }]
          }]
        })
      });

      const out = await res.json();
      if (out.error) {
        console.error("Gemini API Error Detail:", JSON.stringify(out.error));
        continue;
      }

      let resultText = out.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      
      // ล้าง Markdown เผื่อ AI ส่งมา
      resultText = resultText.replace(/```json|```/g, "").trim();

      try {
        const graded = JSON.parse(resultText);

        // 5. บันทึกผลลง Database
        const { error: upErr } = await sbAdmin
          .from("posttest_answers")
          .update({
            score: graded.score ?? 0,
            ai_feedback: graded.feedback_th || "ตรวจแล้ว"
          })
          .eq("id", row.id);

        if (upErr) console.error("Database Update Error:", upErr.message);
        else console.log(`✅ Success ID ${row.id}: ${graded.score} pts`);

      } catch (jsonErr) {
        console.error("JSON Parse Error:", jsonErr.message, "Content:", resultText);
      }
    }

    return new Response(JSON.stringify({ ok: true }), { 
      status: 200, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });

  } catch (err: any) {
    console.error("CRITICAL ERROR:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
});