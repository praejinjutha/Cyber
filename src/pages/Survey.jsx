import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import logo from "../assets/logo.png";

import "../main.css";
import "../dashboard.css";

import { FiHome, FiLogOut, FiUser, FiChevronLeft } from "react-icons/fi";


export default function Survey() {
  const navigate = useNavigate();

  /* ------------------ คำถาม (ตัวอย่าง) ------------------ */
  const questions = useMemo(
    () => [
      {
        id: "q1",
        title: "ระบบช่วยให้ฉันตระหนักรู้ความปลอดภัยไซเบอร์มากขึ้น",
        desc:
          "เช่น การรู้ทันฟิชชิง การป้องกันข้อมูลส่วนบุคคล และการใช้งานอินเทอร์เน็ตอย่างปลอดภัย",
      },
      {
        id: "q2",
        title: "การปรับเส้นทางการเรียนรู้ (Adaptive) ของระบบเหมาะสมกับระดับของฉัน",
        desc:
          "บทเรียน กิจกรรม และความยากง่าย เหมาะสม ไม่ง่ายหรือยากเกินไป",
      },
      {
        id: "q3",
        title: "สถานการณ์จำลองและข้อเสนอแนะ (Feedback) ช่วยให้ฉันนำไปใช้ได้จริง",
        desc:
          "เข้าใจเหตุผลของความเสี่ยง และรู้ว่าควรปฏิบัติตัวอย่างไรในสถานการณ์จริง",
      },
    ],
    []
  );

  const scale = [
    { v: 1, label: "น้อยที่สุด" },
    { v: 2, label: "น้อย" },
    { v: 3, label: "ปานกลาง" },
    { v: 4, label: "มาก" },
    { v: 5, label: "มากที่สุด" },
  ];

  /* ------------------ state ------------------ */
  const [answers, setAnswers] = useState(() => {
    const init = {};
    questions.forEach((q) => (init[q.id] = 0));
    return init;
  });

  const [comment, setComment] = useState("");

  const [loadingUser, setLoadingUser] = useState(true);
  const [studentName, setStudentName] = useState("ผู้เรียน");

  /* ------------------ auth ------------------ */
  useEffect(() => {
    let alive = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      const u = data.session?.user;

      if (!u) {
        navigate("/login", { replace: true });
        return;
      }

      const { data: profile } = await supabase
        .from("student_profiles")
        .select("first_name,last_name")
        .eq("user_id", u.id)
        .maybeSingle();

      if (!alive) return;

      if (profile) {
        const full = `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim();
        if (full) setStudentName(full);
      }

      setLoadingUser(false);
    })();

    return () => {
      alive = false;
    };
  }, [navigate]);

  /* ------------------ helper ------------------ */
  const allAnswered = questions.every((q) => answers[q.id] > 0);

  const avgScore = useMemo(() => {
    const vals = questions.map((q) => answers[q.id]).filter((v) => v > 0);
    if (!vals.length) return 0;
    return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100;
  }, [answers, questions]);

  /* ================== UI ================== */
  return (
    <div className="edu-app">
      {/* ---------- TOPBAR ---------- */}
      <header className="edu-topbar">
        <div className="edu-topbar__inner">
          <div className="homebar__brand" role="banner">
            <img src={logo} alt="LearnSecure logo" className="homebar__logo" />
            <div className="edu-brandtext">
              <div className="edu-brandtext__title">LearnSecure</div>
              <div className="edu-brandtext__subtitle">Survey</div>
            </div>
          </div>

          <div className="edu-topbar__right">
            <div className="edu-userchip">
              <div className="edu-userchip__avatar">
                <FiUser />
              </div>
              <div className="edu-userchip__name">
                {loadingUser ? "กำลังโหลด..." : studentName}
              </div>
            </div>

            <button
              className="edu-btn edu-btn--danger"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate("/login", { replace: true });
              }}
            >
              <FiLogOut /> ออกจากระบบ
            </button>
          </div>
        </div>
      </header>

      {/* ---------- MAIN ---------- */}
      <main className="edu-layout">
        {/* HERO */}
        <section className="edu-hero">
          <div className="edu-hero__card">
            <div className="edu-hero__title">แบบสอบถามความพึงพอใจต่อระบบ</div>
            <div className="edu-hero__sub">
              ประเมินความพึงพอใจหลังใช้งานระบบ AI เพื่อการเรียนรู้ด้านความปลอดภัยไซเบอร์
            </div>

            <div className="edu-lessons__toolbar">
                              <button
                                className="edu-btn edu-btn--back"
                                type="button"
                                onClick={() => navigate("/dashboard")}
                              >
                                <FiChevronLeft aria-hidden="true" />
                                กลับ
                              </button>
            
                              <button
                                className="edu-btn edu-btn--ghost"
                                type="button"
                                onClick={() => navigate("/main")}
                                style={{ marginLeft: 8 }}
                              >
                                <FiHome aria-hidden="true" />
                                กลับหน้าหลัก
                              </button>
                            </div>
          </div>
        </section>

        {/* ---------- FORM ---------- */}
        <section className="dashCard dashCard--wide">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!allAnswered) {
                alert("กรุณาตอบคำถามให้ครบทุกข้อ");
                return;
              }

              console.log("Survey result (mock)", {
                answers,
                comment,
                avgScore,
              });

              alert("บันทึกแบบสอบถามเรียบร้อย (โหมดตัวอย่าง)");
              navigate("/dashboard");
            }}
          >
            {/* คำถาม ข้อละแถว */}
            <div style={{ display: "grid", gap: 16 }}>
              {questions.map((q, i) => (
                <div key={q.id} className="edu-panel">
                  <div className="edu-panel__head">
                    <div className="edu-panel__title">
                      {i + 1}. {q.title}
                    </div>
                    <div className="edu-note">{q.desc}</div>
                  </div>

                  <div
                    className="edu-lessons__toolbar"
                    style={{ gap: 10, flexWrap: "wrap" }}
                  >
                    {scale.map((s) => (
                      <label
                        key={s.v}
                        className="edu-btn"
                        style={{
                          border:
                            answers[q.id] === s.v
                              ? "2px solid var(--brand)"
                              : "1px solid var(--line)",
                        }}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          value={s.v}
                          checked={answers[q.id] === s.v}
                          onChange={() =>
                            setAnswers((prev) => ({
                              ...prev,
                              [q.id]: s.v,
                            }))
                          }
                        />
                        {s.label} ({s.v})
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* ข้อเสนอแนะ */}
            <div className="edu-panel" style={{ marginTop: 16 }}>
              <div className="edu-panel__title">
                ข้อเสนอแนะเพิ่มเติม (ไม่บังคับ)
              </div>

              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="ความคิดเห็นเพิ่มเติมเกี่ยวกับระบบ"
                style={{
                  width: "100%",
                  marginTop: 8,
                  padding: 12,
                  borderRadius: 12,
                  border: "1px solid var(--line)",
                  font: "inherit",
                }}
              />
            </div>

            {/* ปุ่ม */}
            <div className="edu-lessons__toolbar" style={{ marginTop: 16 }}>
              <button
                className="edu-btn edu-btn--primary"
                type="submit"
                disabled={!allAnswered}
              >
                ส่งแบบสอบถาม
              </button>

              <Link className="edu-btn" to="/dashboard">
                ยกเลิก
              </Link>

              <div className="edu-note" style={{ marginLeft: "auto" }}>
                ค่าเฉลี่ย: {avgScore || "-"} / 5
              </div>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
