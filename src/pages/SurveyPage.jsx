import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { FiClipboard, FiChevronRight } from "react-icons/fi";

import "../main.css";
import "../dashboard.css";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function SurveyPage() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);
  const [showPosttestButton, setShowPosttestButton] = useState(false);

  const navigate = useNavigate();

  const surveyId = "69d59bc0-c084-473c-b8d3-fe77e6263cf6";

  /* ================= CHECK DONE ================= */
  useEffect(() => {
    const check = async () => {
      const userRes = await supabase.auth.getUser();
      const user = userRes.data.user;

      if (!user) return;

      const { data } = await supabase
        .from("survey_answers")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);

      if (data && data.length > 0) {
        setDone(true);
        setShowPosttestButton(true);
      }
    };

    check();
  }, []);

  /* ================= LOAD QUESTIONS ================= */
  useEffect(() => {
    const fetchQuestions = async () => {
      const { data, error } = await supabase
        .from("survey_questions")
        .select("*")
        .order("order_index");

      if (error) {
        console.error(error);
        return;
      }

      setQuestions(data || []);
      setLoading(false);
    };

    fetchQuestions();
  }, []);

  /* ================= SELECT ANSWER ================= */
  const selectScore = (qid, score) => {
    setAnswers((prev) => ({
      ...prev,
      [qid]: score,
    }));
  };

  /* ================= SUBMIT ================= */
  const submit = async () => {
    const userRes = await supabase.auth.getUser();
    const user = userRes.data.user;

    if (!user) {
      alert("กรุณาเข้าสู่ระบบก่อนทำแบบประเมิน");
      return;
    }

    const payload = Object.entries(answers).map(([question_id, score]) => ({
      user_id: user.id,
      question_id,
      score,
    }));

    const { error } = await supabase.from("survey_answers").insert(payload);

    if (error) {
      console.error(error);
      alert("ส่งแบบประเมินไม่สำเร็จ");
      return;
    }

    setDone(true);
    setShowPosttestButton(true);
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="dash">
        <div className="dashCard">กำลังโหลด...</div>
      </div>
    );
  }

  /* ================= DONE ================= */
  if (done) {
    return (
      <div className="dash">
        <div className="dashCard dashCard--wide" style={{ textAlign: "center", padding: 40 }}>
          <h2 className="dashCard__title">ส่งแบบประเมินเรียบร้อยแล้ว</h2>
          <p className="dashCard__desc">ขอบคุณสำหรับความคิดเห็นของคุณ</p>

          {/* BACK HOME */}
          <button
            className="dashBtn dashBtn--solid"
            onClick={() => navigate("/")}
            style={{ marginTop: 16 }}
          >
            กลับหน้าหลัก
          </button>

          {/* 🔥 POSTTEST BUTTON */}
         {showPosttestButton && (
  <button
    onClick={() => navigate("/final")}
    className="posttestBtn"
  >
    <FiClipboard />
   ทำแบบทดสอบหลังเรียน
    <FiChevronRight />
  </button>
)}
        </div>
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="dash">

      {/* HEADER */}
      <div className="dashCard dashCard--wide">

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 className="dashCard__title">แบบประเมินความคิดเห็นและความพึงพอใจของผู้เรียนต่อระบบ</h2>

          <button
            onClick={() => navigate(-1)}
            className="dashBtn dashBtn--ghost"
          >
            ย้อนกลับ
          </button>
        </div>

        <p className="dashCard__desc">
          กรุณาให้คะแนน 1 = น้อยที่สุด, 5 = มากที่สุด
        </p>

        {/* PROGRESS */}
        <div style={{ marginTop: 12 }}>
          <div className="dashBar__track">
            <div
              className="dashBar__fill"
              style={{
                width: `${(Object.keys(answers).length / questions.length) * 100}%`,
              }}
            />
          </div>

          <div style={{ fontSize: 12, marginTop: 6, color: "#6b7280" }}>
            ตอบแล้ว {Object.keys(answers).length} / {questions.length} ข้อ
          </div>
        </div>
      </div>

      {/* QUESTIONS */}
      <div className="dashCard dashCard--wide" style={{ marginTop: 14 }}>
        <div className="dashList">
          {questions.map((q) => (
            <div
              key={q.id}
              className="dashList__row"
              style={{ flexDirection: "column", alignItems: "flex-start" }}
            >
              <div style={{ fontWeight: 700, marginBottom: 10 }}>
                ข้อ {q.order_index}. {q.question_text}
              </div>

              <div style={{ display: "flex", gap: 10, width: "100%" }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => selectScore(q.id, n)}
                    style={{
                      flex: 1,
                      padding: "10px 0",
                      borderRadius: 12,
                      border: "1px solid #e5e7eb",
                      fontWeight: 700,
                      cursor: "pointer",
                      background: answers[q.id] === n ? "#2563eb" : "#fff",
                      color: answers[q.id] === n ? "#fff" : "#111827",
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* SUBMIT */}
        <button
          onClick={submit}
          disabled={Object.keys(answers).length !== questions.length}
          className="dashBtn dashBtn--solid"
          style={{
            width: "100%",
            marginTop: 20,
            opacity: Object.keys(answers).length !== questions.length ? 0.5 : 1,
          }}
        >
          ส่งแบบประเมิน
        </button>
      </div>
    </div>
  );
}