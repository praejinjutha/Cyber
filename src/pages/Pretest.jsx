import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Pretest() {
  const navigate = useNavigate();

  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  const [answers, setAnswers] = useState({ q1: "", q2: "" });
  const [score, setScore] = useState(null);

  const [redirecting, setRedirecting] = useState(false);

  const questions = useMemo(
    () => [
      {
        id: "q1",
        text: "ถ้ามีคนทักมาขอรหัสผ่าน/OTP ของเรา เราควรทำอย่างไร?",
        choices: [
          { key: "a", label: "บอกให้ไปเลย จะได้ช่วยเขา" },
          { key: "b", label: "ไม่บอก และแจ้งผู้ปกครอง/ครู หรือรายงาน" },
          { key: "c", label: "ส่งให้เพื่อนช่วยตัดสินใจ" },
        ],
        answer: "b",
      },
      {
        id: "q2",
        text: "รหัสผ่านที่ปลอดภัยควรเป็นแบบไหน?",
        choices: [
          { key: "a", label: "123456 จำง่ายที่สุด" },
          { key: "b", label: "ชื่อเล่น + วันเกิด" },
          { key: "c", label: "ยาวพอสมควร เดายาก และไม่ซ้ำกับที่อื่น" },
        ],
        answer: "c",
      },
    ],
    []
  );

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setMsg("");

      const { data, error } = await supabase.auth.getSession();
      if (!alive) return;

      if (error) {
        console.error(error);
        setMsg("โหลดข้อมูลผู้ใช้ไม่สำเร็จ กรุณาลองใหม่");
        setLoading(false);
        return;
      }

      const u = data.session?.user;
      if (!u) {
        navigate("/login", { replace: true });
        return;
      }

      setUserId(u.id);

      // ✅ GUARD: ถ้าทำ pretest แล้ว ห้ามเข้าหน้านี้อีก → เด้งไป /main ทันที
      const { data: pretest, error: pretestErr } = await supabase
        .from("pretest_results")
        .select("id")
        .eq("user_id", u.id)
        .limit(1)
        .maybeSingle();

      if (!alive) return;

      if (pretestErr) {
        console.error(pretestErr);
        // ถ้า error ให้ยังอยู่หน้าเดิมได้ แต่โหลดเสร็จ
        setLoading(false);
        return;
      }

      if (pretest) {
        navigate("/main", { replace: true });
        return;
      }

      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [navigate]);

  const setAns = (qid, key) => {
    setAnswers((p) => ({ ...p, [qid]: key }));
  };

  const computeScore = () => {
    let s = 0;
    for (const q of questions) {
      if (answers[q.id] === q.answer) s += 1;
    }
    return s;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!userId) {
      setMsg("ไม่พบผู้ใช้ กรุณาเข้าสู่ระบบใหม่");
      return;
    }

    for (const q of questions) {
      if (!answers[q.id]) {
        setMsg("กรุณาตอบให้ครบทุกข้อก่อนส่งนะ");
        return;
      }
    }

    const s = computeScore();
    setScore(s);

    setSubmitting(true);

    // ✅ (กันส่งซ้ำ) เช็คซ้ำอีกครั้งก่อน insert
    const { data: already, error: chkErr } = await supabase
      .from("pretest_results")
      .select("id")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();

    if (chkErr) {
      console.error(chkErr);
      setSubmitting(false);
      setMsg("ตรวจสอบสถานะไม่สำเร็จ ❌ กรุณาลองใหม่");
      return;
    }

    if (already) {
      setSubmitting(false);
      setMsg("คุณทำ Pretest ไปแล้ว ✅ กำลังพาไปหน้าหลัก...");
      setRedirecting(true);
      window.setTimeout(() => {
        navigate("/main", { replace: true });
      }, 1000);
      return;
    }

    const { error } = await supabase.from("pretest_results").insert({
      user_id: userId,
      score: s,
      q1: answers.q1,
      q2: answers.q2,
    });

    setSubmitting(false);

    if (error) {
      console.error(error);

      // ✅ ถ้าคุณทำ unique constraint แล้ว error จะเป็นแนว duplicate → เด้งไป main ได้เลย
      setMsg("ส่งคำตอบไม่สำเร็จ ❌ (อาจทำไปแล้ว) กำลังพาไปหน้าหลัก...");
      setRedirecting(true);
      window.setTimeout(() => {
        navigate("/main", { replace: true });
      }, 1500);
      return;
    }

    setMsg("ส่งคำตอบสำเร็จ ✅ กำลังพาไปหน้าหลัก...");
    setRedirecting(true);

    window.setTimeout(() => {
      navigate("/main", { replace: true });
    }, 2000);
  };

  if (loading) {
    return (
      <div className="bg">
        <div className="shell">
          <div className="card">
            <h1 className="title">Pretest</h1>
            <p className="subtitle">กำลังโหลดข้อสอบ...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg">
      <div className="shell">
        <div className="card">
          <div className="topRow">
            <div>
              <h1 className="title">Pretest (2 ข้อ)</h1>
              <p className="subtitle">ทำแบบทดสอบก่อนเรียน</p>
            </div>

            <button
              className="btn btn-ghost"
              onClick={() => navigate("/profile")}
              disabled={submitting || redirecting}
            >
              กลับไปโปรไฟล์
            </button>
          </div>

          <form className="form" onSubmit={onSubmit}>
            {questions.map((q, idx) => (
              <div key={q.id} className="qCard">
                <div className="qHead">
                  <div className="qNo">ข้อ {idx + 1}</div>
                  <div className="qText">{q.text}</div>
                </div>

                <div className="choices">
                  {q.choices.map((c) => (
                    <label
                      key={c.key}
                      className={`choice ${answers[q.id] === c.key ? "active" : ""}`}
                      style={{
                        opacity: submitting || redirecting ? 0.7 : 1,
                        pointerEvents: submitting || redirecting ? "none" : "auto",
                      }}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={c.key}
                        checked={answers[q.id] === c.key}
                        onChange={() => setAns(q.id, c.key)}
                        disabled={submitting || redirecting}
                      />
                      <span>{c.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="actions">
              <button className="btn btn-primary" type="submit" disabled={submitting || redirecting}>
                {redirecting ? "กำลังพาไปหน้าหลัก..." : submitting ? "กำลังส่ง..." : "ส่งคำตอบ"}
              </button>
            </div>

            {score !== null && (
              <div className="resultBox">
                คะแนนของคุณ: <b>{score}</b> / {questions.length}
              </div>
            )}

            {msg && <div className="alert">{msg}</div>}
          </form>
        </div>

        <div className="footerNote">
          Tip: ผล Pretest บันทึกลง Supabase (ตาราง pretest_results) แล้ว ✅
        </div>
      </div>
    </div>
  );
}
