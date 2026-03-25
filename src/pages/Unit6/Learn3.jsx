// src/pages/Unit6/Learn3.jsx
// ✅ Unit 6 - เรื่องที่ 3: ผลกระทบของการใช้สื่อต่อร่างกาย จิตใจ และสมดุลชีวิต
// ✅ ใช้เฉพาะ class ที่มีอยู่แล้วใน main.css + learn.css
// ✅ Flow: Micro-lesson → Interactive Classification-based Learning → Immediate Feedback Learning
// ✅ ปรับเนื้อหาให้อ่านโปร่งขึ้น เหมาะกับวัย 15-18 ปี
// ✅ ไม่สร้าง class CSS ใหม่

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import logo from "../../assets/logo.png";

import "../../main.css";
import "../Unit1/learn.css";

import {
  FiChevronLeft,
  FiChevronRight,
  FiFileText,
  FiHome,
  FiLogOut,
  FiUser,
  FiCheckCircle,
  FiAlertTriangle,
  FiHeart,
  FiClock,
  FiMoon,
  FiSmile,
} from "react-icons/fi";

/* ------------------------------------------------------------------ */
/* ✅ MICRO-LESSON
/* ------------------------------------------------------------------ */
const MICRO_LESSON = [
  {
    icon: <FiHeart />,
    title: "ร่างกายเริ่มส่งสัญญาณได้",
    points: [
      "ใช้สื่อนานเกินไป อาจล้าตา ปวดคอ ปวดหลัง หรือเมื่อยไหล่",
      "บางครั้งเราไม่รู้ตัว เพราะอาการค่อย ๆ สะสม",
    ],
    note: "ถ้าใช้สื่อนาน แต่แทบไม่ได้ลุกหรือเปลี่ยนอิริยาบถเลย ร่างกายอาจเริ่มเสียสมดุล",
  },
  {
    icon: <FiSmile />,
    title: "อารมณ์ก็ได้รับผลกระทบ",
    points: [
      "การรับข้อมูลต่อเนื่องมากเกินไป อาจทำให้เครียด หงุดหงิด หรือสมองล้า",
      "บางคนเลื่อนดูโซเชียลนาน ๆ แล้วเริ่มเปรียบเทียบตัวเองโดยไม่จำเป็น",
    ],
    note: "ลองสังเกตว่า หลังใช้สื่อ คุณรู้สึกสบายใจขึ้น หรือเหนื่อยกว่าเดิม",
  },
  {
    icon: <FiClock />,
    title: "สื่ออาจเบียดเวลาสิ่งสำคัญ",
    points: [
      "ปัญหาไม่ใช่แค่ใช้สื่อนาน",
      "แต่คือใช้จนเบียดเวลาเรียน เวลาพัก หรือเวลาทำสิ่งที่ตั้งใจไว้",
    ],
    note: "บางครั้งเริ่มจากแค่ “ขออีกแป๊บเดียว” แต่สุดท้ายเวลาหายไปมากกว่าที่คิด",
  },
  {
    icon: <FiMoon />,
    title: "ช่วงก่อนนอนควรระวังมาก",
    points: [
      "ใช้สื่อหนักก่อนนอน อาจทำให้นอนช้า หลับยาก หรือนอนไม่พอ",
      "พอนอนน้อย วันถัดไปก็มักง่วง ไม่มีสมาธิ และอารมณ์แกว่งง่าย",
    ],
    note: "ผลกระทบไม่ได้จบแค่ตอนกลางคืน แต่มักลากต่อไปถึงวันถัดไป",
  },
];

/* ------------------------------------------------------------------ */
/* ✅ QUICK GUIDE
/* ------------------------------------------------------------------ */
const IMPACT_GUIDE = [
  {
    id: "g1",
    title: "ผลกระทบต่อร่างกาย",
    desc: "เช่น ล้าตา ปวดคอ ปวดหลัง เมื่อยตัว ขยับน้อยเกินไป",
  },
  {
    id: "g2",
    title: "ผลกระทบต่อจิตใจและอารมณ์",
    desc: "เช่น เครียด หงุดหงิด กดดัน อารมณ์ตก หรือรู้สึกล้าทางใจ",
  },
  {
    id: "g3",
    title: "ผลกระทบต่อสมดุลชีวิต",
    desc: "เช่น เวลานอนเสีย เวลาเรียนหาย ทำสิ่งสำคัญไม่ทัน หรือชีวิตเริ่มรวน",
  },
];

/* ------------------------------------------------------------------ */
/* ✅ CLASSIFICATION ACTIVITY
/* ------------------------------------------------------------------ */
const CLASSIFY_ITEMS = [
  {
    id: "i1",
    text: "ใช้โทรศัพท์ต่อเนื่องนานมาก จนปวดตา ปวดคอ และไหล่ตึง",
    answer: "body",
    choices: [
      { id: "body", label: "ร่างกาย" },
      { id: "mind", label: "จิตใจและอารมณ์" },
      { id: "balance", label: "สมดุลชีวิต" },
    ],
    reason:
      "อาการที่เด่นที่สุดคือความล้าและความเจ็บเมื่อยของร่างกาย จึงเป็นผลกระทบด้านร่างกาย",
  },
  {
    id: "i2",
    text: "เลื่อนดูโซเชียลนาน ๆ แล้วรู้สึกกดดัน เปรียบเทียบตัวเอง และอารมณ์ตก",
    answer: "mind",
    choices: [
      { id: "body", label: "ร่างกาย" },
      { id: "mind", label: "จิตใจและอารมณ์" },
      { id: "balance", label: "สมดุลชีวิต" },
    ],
    reason:
      "ผลที่เด่นที่สุดคือความรู้สึกและอารมณ์ที่เปลี่ยนไป จึงจัดเป็นผลกระทบด้านจิตใจและอารมณ์",
  },
  {
    id: "i3",
    text: "ตั้งใจเช็กมือถือไม่กี่นาที แต่สุดท้ายไม่ได้อ่านหนังสือตามแผน",
    answer: "balance",
    choices: [
      { id: "body", label: "ร่างกาย" },
      { id: "mind", label: "จิตใจและอารมณ์" },
      { id: "balance", label: "สมดุลชีวิต" },
    ],
    reason:
      "สถานการณ์นี้ชี้ให้เห็นว่าสื่อเข้าไปเบียดเวลาสิ่งสำคัญ จึงเป็นผลกระทบด้านสมดุลชีวิต",
  },
  {
    id: "i4",
    text: "ดูคลิปก่อนนอนทุกคืน จนนอนดึก ตื่นไม่ไหว และง่วงในห้องเรียน",
    answer: "balance",
    choices: [
      { id: "body", label: "ร่างกาย" },
      { id: "mind", label: "จิตใจและอารมณ์" },
      { id: "balance", label: "สมดุลชีวิต" },
    ],
    reason:
      "จุดเด่นของสถานการณ์นี้คือเวลานอนเสียและส่งผลต่อการใช้ชีวิตในวันถัดไป จึงเป็นเรื่องสมดุลชีวิต",
  },
  {
    id: "i5",
    text: "รับข่าวหรือข้อมูลต่อเนื่องนาน ๆ แล้วเริ่มเครียดและหงุดหงิดง่าย",
    answer: "mind",
    choices: [
      { id: "body", label: "ร่างกาย" },
      { id: "mind", label: "จิตใจและอารมณ์" },
      { id: "balance", label: "สมดุลชีวิต" },
    ],
    reason:
      "ความเครียดและความหงุดหงิดเป็นผลกระทบที่เกิดกับสภาพจิตใจและอารมณ์โดยตรง",
  },
  {
    id: "i6",
    text: "นั่งดูสื่อนานมาก แทบไม่ลุกเลย จนเมื่อยหลังและไม่ค่อยสบายตัว",
    answer: "body",
    choices: [
      { id: "body", label: "ร่างกาย" },
      { id: "mind", label: "จิตใจและอารมณ์" },
      { id: "balance", label: "สมดุลชีวิต" },
    ],
    reason:
      "ผลที่เห็นชัดคืออาการเมื่อยล้าและไม่สบายตัว จึงเป็นผลกระทบด้านร่างกาย",
  },
];

export default function Learn3Unit6() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");
  const [step, setStep] = useState("lesson");

  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const chooseAnswer = (itemId, choiceId) => {
    setAnswers((prev) => ({ ...prev, [itemId]: choiceId }));
    if (submitted) setSubmitted(false);
  };

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);

  const allAnswered = useMemo(() => {
    return Object.keys(answers).length === CLASSIFY_ITEMS.length;
  }, [answers]);

  const score = useMemo(() => {
    let total = 0;
    for (const item of CLASSIFY_ITEMS) {
      if (answers[item.id] === item.answer) total += 1;
    }
    return total;
  }, [answers]);

  const resultSummary = useMemo(() => {
    if (!submitted) return null;

    if (score >= 5) {
      return {
        title: "คุณแยกผลกระทบได้ค่อนข้างชัด",
        badgeClass: "edu-badge edu-badge--ok",
        badgeText: "เข้าใจดี",
        icon: <FiCheckCircle />,
        message:
          "คุณเริ่มเห็นแล้วว่า การใช้สื่อมากเกินไปไม่ได้กระทบแค่เรื่องเวลา แต่เชื่อมไปถึงร่างกาย อารมณ์ และชีวิตประจำวันด้วย",
        tips: [
          "เวลาสังเกตตัวเอง ให้ดูทั้ง 3 ด้านไปพร้อมกัน",
          "ถ้าปัญหาเดิมเกิดซ้ำ แปลว่าอาจถึงเวลาต้องปรับพฤติกรรม",
          "รู้เร็ว แก้ได้ง่ายกว่า",
        ],
      };
    }

    if (score >= 3) {
      return {
        title: "คุณเริ่มเข้าใจแล้ว แต่ยังมีบางจุดที่สับสน",
        badgeClass: "edu-badge edu-badge--yellow",
        badgeText: "พัฒนาได้อีก",
        icon: <FiAlertTriangle />,
        message:
          "บางพฤติกรรมส่งผลได้หลายด้าน จึงต้องดูว่า “ผลกระทบที่เด่นที่สุด” คืออะไร",
        tips: [
          "ถามตัวเองว่า สิ่งที่เด่นสุดคือเจ็บล้า เครียด หรือเวลาเสียสมดุล",
          "ลองมองที่ผลที่ตามมา ไม่ใช่แค่สิ่งที่กำลังทำ",
          "เชื่อมกับชีวิตจริงของตัวเองจะช่วยให้เห็นภาพชัดขึ้น",
        ],
      };
    }

    return {
      title: "ยังต้องฝึกแยกผลกระทบให้ชัดขึ้น",
      badgeClass: "edu-badge edu-badge--lock",
      badgeText: "ต้องทบทวน",
      icon: <FiAlertTriangle />,
      message:
        "ตอนนี้คุณอาจยังมองผลกระทบของการใช้สื่อไม่ครบทุกด้าน ลองย้อนดูตัวอย่างอีกครั้ง แล้วเชื่อมกับพฤติกรรมจริงของตัวเอง",
      tips: [
        "เริ่มจากดูว่าหลังใช้สื่อ ร่างกายรู้สึกอย่างไร",
        "จากนั้นค่อยสังเกตอารมณ์",
        "สุดท้ายดูว่าสื่อเริ่มเบียดเวลาสิ่งสำคัญหรือยัง",
      ],
    };
  }, [submitted, score]);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);

      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      if (!user) {
        navigate("/login", { replace: true });
        return;
      }

      const { data: profile } = await supabase
        .from("student_profiles")
        .select("first_name,last_name")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!alive) return;

      if (profile) {
        setStudentName(`${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim());
      }

      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [navigate]);

  return (
    <div className="edu-app">
      <header className="edu-topbar">
        <div className="edu-topbar__inner">
          <div className="homebar__brand" role="banner">
            <img src={logo} alt="LearnSecure logo" className="homebar__logo" />
            <div className="edu-brandtext">
              <div className="edu-brandtext__title">LearnSecure</div>
              <div className="edu-brandtext__subtitle">Unit 6</div>
            </div>
          </div>

          <div className="edu-topbar__right">
            <div className="edu-userchip" title={studentName || "Student"}>
              <div className="edu-userchip__avatar" aria-hidden="true">
                <FiUser />
              </div>
              <div className="edu-userchip__meta">
                <div className="edu-userchip__name">
                  {loading ? "กำลังโหลด..." : studentName || "ผู้เรียน"}
                </div>
              </div>
            </div>

            <button
              className="edu-btn edu-btn--danger"
              type="button"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate("/login", { replace: true });
              }}
            >
              <FiLogOut />
              ออกจากระบบ
            </button>
          </div>
        </div>
      </header>

      <main className="edu-layout">
        <section className="edu-hero" aria-label="Unit 6 header">
          <div className="edu-hero__card">
            <div className="edu-hero__row">
              <div className="edu-hero__headline">
                <div className="edu-hero__title">
                  Unit 6 : การตระหนักรู้ถึงสุขภาวะดิจิทัลและความปลอดภัย
                </div>
                <div className="edu-hero__sub">
                  เรื่องที่ 3 : ผลกระทบของการใช้สื่อต่อร่างกาย จิตใจ และสมดุลชีวิต
                </div>

                <div className="edu-lessons__toolbar">
                  <button
                    className="edu-btn edu-btn--back"
                    type="button"
                    onClick={() => {
                      if (step === "classify") {
                        setStep("lesson");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        return;
                      }
                      navigate("/unit6/learn", { replace: true });
                    }}
                  >
                    <FiChevronLeft />
                    กลับ
                  </button>

                  <button
                    className="edu-btn edu-btn--ghost"
                    type="button"
                    onClick={() => navigate("/main")}
                  >
                    <FiHome />
                    กลับหน้าหลัก
                  </button>
                </div>
              </div>

             
            </div>
          </div>
        </section>

        <section className="edu-panel1">
          <div className="edu-panel1__head">
            <div className="edu-panel1__title">
              <FiFileText />
              {step === "lesson"
                ? "มองผลกระทบของการใช้สื่อให้ครบทั้ง 3 ด้าน"
                : "ลองจำแนกผลกระทบจากสถานการณ์ต่าง ๆ"}
            </div>
          </div>

          {step === "lesson" && (
            <div className="edu-taskStage">
              <div className="edu-taskIntro">
                <div className="edu-taskIntro__title">
                  การใช้สื่อมากเกินไป อาจกระทบมากกว่าที่คิด
                </div>
                <div className="edu-taskIntro__desc">
                  บางครั้งผลกระทบไม่ได้มาแบบชัดทันที  
                  แต่อาจเริ่มจากอาการเล็ก ๆ แล้วค่อยสะสมไปเรื่อย ๆ
                </div>
              </div>

              <div className="edu-grid">
                {MICRO_LESSON.map((item, index) => (
                  <div key={index} className="edu-card">
                    <div className="edu-card__body">
                      <div className="edu-box">
                        <div className="edu-box__title">
                          {item.icon} {item.title}
                        </div>

                        <ul className="edu-list">
                          {item.points.map((point, idx) => (
                            <li key={idx}>{point}</li>
                          ))}
                        </ul>

                        <div className="edu-note">{item.note}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="edu-adaptiveGrid" style={{ marginTop: "24px" }}>
                <div className="edu-card edu-adaptiveBlock">
                  <div className="edu-adaptiveBlock__head">
                    <div>
                      <div className="edu-adaptiveBlock__title">สรุปสั้น ๆ</div>
                      <div className="edu-adaptiveBlock__sub">
                        เวลาใช้สื่อ ลองดูให้ครบทั้ง 3 ด้าน
                      </div>
                    </div>
                  </div>

                  <div className="edu-pathList">
                    {IMPACT_GUIDE.map((item, index) => (
                      <div key={item.id} className="edu-pathRow">
                        <div className="edu-pathRow__step">{index + 1}</div>
                        <div>
                          <div className="edu-pathRow__title">{item.title}</div>
                          <div className="edu-pathRow__desc">{item.desc}</div>
                        </div>
                        <div className="edu-pathRow__arrow">
                          <FiChevronRight />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="edu-card edu-adaptiveBlock">
                  <div className="edu-adaptiveBlock__head">
                    <div>
                      <div className="edu-adaptiveBlock__title">ก่อนเริ่มกิจกรรม</div>
                      <div className="edu-adaptiveBlock__sub">
                        ให้เลือก “ผลกระทบที่เด่นที่สุด”
                      </div>
                    </div>
                  </div>

                  <div className="edu-box">
                    <div className="edu-box__title">
                      <FiCheckCircle /> วิธีคิดง่าย ๆ
                    </div>
                    <ul className="edu-list">
                      <li>ถ้าเด่นที่อาการเจ็บล้าหรือไม่สบายตัว → ร่างกาย</li>
                      <li>ถ้าเด่นที่ความเครียด กดดัน หรืออารมณ์ตก → จิตใจและอารมณ์</li>
                      <li>ถ้าเด่นที่เวลานอนเสีย เวลาเรียนหาย หรือชีวิตรวน → สมดุลชีวิต</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="edu-actions" style={{ marginTop: "24px" }}>
                <button
                  className="edu-btn edu-btn--back"
                  type="button"
                  onClick={() => navigate("/unit6/learn2", { replace: true })}
                >
                  <FiChevronLeft /> กลับไปเรื่องก่อนหน้า
                </button>

                <button
                  className="edu-btn edu-btn--primary"
                  type="button"
                  onClick={() => {
                    setStep("classify");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  เริ่มกิจกรรม <FiChevronRight />
                </button>
              </div>
            </div>
          )}

          {step === "classify" && (
            <div className="edu-taskStage">
              <div className="edu-taskIntro">
                <div className="edu-taskIntro__title">
                  อ่านสถานการณ์ แล้วเลือกคำตอบที่ตรงที่สุด
                </div>
                <div className="edu-taskIntro__desc">
                  บางข้ออาจเกี่ยวข้องหลายด้าน  
                  แต่ให้เลือกด้านที่เด่นที่สุดจากสิ่งที่เกิดขึ้น
                </div>
                <div className="edu-taskIntro__meta">
                  ตอบแล้ว {answeredCount} / {CLASSIFY_ITEMS.length}
                </div>
              </div>

              <div className="edu-taskGrid">
                {CLASSIFY_ITEMS.map((item) => {
                  const picked = answers[item.id];
                  const isCorrect = submitted && picked === item.answer;
                  const isWrong = submitted && picked && picked !== item.answer;

                  return (
                    <div key={item.id} className="edu-taskCard">
                      <div className="edu-taskCard__body">
                        <div className="edu-taskCard__label">{item.text}</div>
                      </div>

                      <div className="edu-taskCard__actions">
                        {item.choices.map((choice) => (
                          <button
                            key={choice.id}
                            type="button"
                            className={`edu-pill ${picked === choice.id ? "is-active" : ""}`}
                            onClick={() => chooseAnswer(item.id, choice.id)}
                          >
                            {choice.label}
                          </button>
                        ))}
                      </div>

                      {submitted && (
                        <div
                          className={`edu-taskCard__feedback ${
                            isCorrect ? "ok" : isWrong ? "warn" : ""
                          }`}
                        >
                          <div className="edu-taskCard__feedbackRow">
                            {isCorrect ? <FiCheckCircle /> : <FiAlertTriangle />}
                            <div>
                              <div className="edu-taskCard__feedbackMsg">
                                {isCorrect
                                  ? "ถูกต้อง"
                                  : isWrong
                                  ? "ยังไม่ตรง"
                                  : "ยังไม่ได้เลือกคำตอบ"}
                              </div>
                              <div className="edu-taskCard__feedbackReason">
                                {picked
                                  ? item.reason
                                  : "เลือกคำตอบก่อน แล้วกดส่งคำตอบอีกครั้ง"}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {submitted && (
                <div className="edu-result">
                  <div className="edu-result__text">
                    คุณได้ {score} / {CLASSIFY_ITEMS.length} คะแนน
                  </div>
                </div>
              )}

              {submitted && resultSummary && (
                <div className="edu-box">
                  <div className="edu-feedbackCard__head">
                    <div className="edu-box__title">
                      {resultSummary.icon} {resultSummary.title}
                    </div>
                    <div className="edu-feedbackCard__status">
                      <span className={resultSummary.badgeClass}>{resultSummary.badgeText}</span>
                    </div>
                  </div>

                  <div className="edu-note">{resultSummary.message}</div>

                  <div className="edu-box" style={{ marginTop: 12 }}>
                    <div className="edu-box__title">สิ่งที่ควรจำ</div>
                    <ul className="edu-list">
                      {resultSummary.tips.map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div className="edu-taskFooter">
                <button
                  className="edu-btn edu-btn--back"
                  type="button"
                  onClick={() => {
                    setStep("lesson");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  <FiChevronLeft /> กลับไปดูสรุป
                </button>

                <div className="edu-actions">
                  <button
                    className="edu-btn edu-btn--primary"
                    type="button"
                    disabled={!allAnswered}
                    onClick={() => {
                      setSubmitted(true);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    ส่งคำตอบ <FiChevronRight />
                  </button>

                  {submitted && (
                    <button
                      className="edu-btn edu-btn--ghost"
                      type="button"
                      onClick={() => navigate("/unit6/learn", { replace: true })}
                    >
                      เสร็จสิ้น <FiChevronRight />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}