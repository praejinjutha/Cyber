// src/pages/Unit8/Learn1.jsx
// ✅ Unit 8 - เรื่องที่ 1: การตั้งคำถามต่อเนื้อหาออนไลน์
// ✅ ใช้เฉพาะ class ที่มีอยู่แล้วใน main.css + learn.css
// ✅ Flow: Video-based Concept Introduction → Micro-lesson → Interactive Concept Checking → Immediate Feedback Learning
// ✅ เนื้อหาใน micro-lesson ไม่ซ้ำกับวิดีโอ
// ✅ หน้าสุดท้ายมีปุ่ม "เสร็จสิ้น" และกลับไป /unit8/learn

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import logo from "../../assets/logo.png";
import learnVideo from "../../assets/learn8.mp4";

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
  FiSearch,
  FiTarget,
  FiBookOpen,
  FiShield,
} from "react-icons/fi";

/* ------------------------------------------------------------------ */
/* ✅ MICRO-LESSON (ต่อยอดจากวิดีโอ ไม่พูดซ้ำ) */
/* ------------------------------------------------------------------ */
const MICRO_LESSON = [
  {
    icon: <FiSearch />,
    title: "ไม่ใช่ทุกโพสต์ถูกสร้างมาเพื่อให้ข้อมูลอย่างเดียว",
    points: [
      "เนื้อหาออนไลน์บางชิ้นให้ข้อมูล แต่บางชิ้นถูกทำขึ้นเพื่อเรียกความสนใจ สร้างอารมณ์ หรือดันให้คนรีบแชร์ต่อ",
      "โพสต์ที่ทำให้ตกใจ โกรธ หรือรู้สึกว่าเป็นเรื่องด่วน มักแพร่กระจายได้เร็ว แม้ข้อมูลจะยังไม่ชัดเจน",
      "การตั้งคำถามช่วยให้เราไม่รับสารแบบอัตโนมัติ และเริ่มมองเห็นว่าโพสต์นั้นกำลังพยายามทำอะไรกับผู้ชม",
    ],
    note: "ก่อนเชื่อหรือแชร์ ลองคิดว่าเนื้อหานี้ต้องการให้เรารู้จริง ๆ หรือกำลังพยายามเร่งให้เราตอบสนองบางอย่าง",
  },
  {
    icon: <FiTarget />,
    title: "ยอดแชร์เยอะ ไม่ได้แปลว่าข้อมูลนั้นจริง",
    points: [
      "บางโพสต์ถูกแชร์จำนวนมากเพราะคนอยากเตือนกันต่อ หรือเพราะหัวข้อดูแรงและน่าตกใจ",
      "ผู้คนจำนวนมากอาจแชร์ต่อจากความหวังดี แต่ยังไม่ได้ตรวจสอบแหล่งที่มาอย่างรอบคอบ",
      "ยิ่งโพสต์แพร่กระจายเร็ว เรายิ่งควรใช้เวลาเช็กข้อมูลก่อนตัดสินใจเชื่อ",
    ],
    note: "ยอดไลก์ ยอดแชร์ หรือคอมเมนต์เยอะ เป็นสัญญาณว่าโพสต์กำลังถูกพูดถึง ไม่ใช่หลักฐานว่าโพสต์นั้นถูกต้อง",
  },
  {
    icon: <FiBookOpen />,
    title: "ฝึกตั้งคำถาม 3 ด้านก่อนเชื่อ",
    points: [
      "ใครเป็นผู้สร้างเนื้อหานี้ เป็นแหล่งข้อมูลที่ชัดเจนหรือเป็นบัญชีที่ตรวจสอบไม่ได้",
      "ผู้โพสต์มีวัตถุประสงค์อะไร ต้องการให้ความรู้ เตือนภัย ขายของ หรือชี้นำความคิดของคนดู",
      "ข้อมูลนี้มีแหล่งอ้างอิงหรือหลักฐานที่ตรวจสอบได้จริงหรือไม่",
    ],
    note: "การตั้งคำถามให้ครบทั้งผู้สร้าง วัตถุประสงค์ และแหล่งอ้างอิง ช่วยให้เรามองโพสต์ได้รอบด้านขึ้น",
  },
  {
    icon: <FiShield />,
    title: "การตั้งคำถามคือทักษะป้องกันตัวในโลกออนไลน์",
    points: [
      "เมื่อเราตั้งคำถามก่อนเชื่อ เราจะลดโอกาสถูกหลอกด้วยข่าวปลอม ข้อมูลบิดเบือน หรือโพสต์ที่ชวนเข้าใจผิด",
      "ทักษะนี้ใช้ได้กับข่าว คลิปไวรัล รีวิวสินค้า ข้อความส่งต่อ และโพสต์ในโซเชียลทุกรูปแบบ",
      "การหยุดคิดก่อนแชร์ ไม่ได้ช่วยแค่ตัวเรา แต่ยังช่วยลดการกระจายของข้อมูลที่ไม่ถูกต้องไปสู่คนอื่นด้วย",
    ],
    note: "แค่หยุดคิดสั้น ๆ ก่อนเชื่อหรือแชร์ ก็เป็นทักษะสำคัญของการใช้สื่ออย่างรับผิดชอบ",
  },
];

/* ------------------------------------------------------------------ */
/* ✅ INTERACTIVE CONCEPT CHECKING
/* เน้น “ฝึกตั้งคำถาม” จากสถานการณ์จริง */
/* ------------------------------------------------------------------ */
const CHECK_ITEMS = [
  {
    id: "c1",
    scenario:
      "มีโพสต์เตือนภัยในโซเชียลถูกแชร์กว่า 20,000 ครั้ง เขียนว่า “ด่วนมาก! ห้ามรับสายเบอร์นี้เด็ดขาด ไม่งั้นเงินจะหายจากบัญชีทันที” แต่ไม่มีชื่อหน่วยงาน ไม่มีลิงก์อ้างอิง และไม่บอกว่าใครเป็นผู้โพสต์ต้นทาง",
    answer: "A",
    choices: [
      { id: "A", label: "ใครเป็นผู้สร้างหรือโพสต์ข้อมูลนี้" },
      { id: "B", label: "โพสต์นี้มีคนแชร์ไปแล้วกี่ครั้ง" },
      { id: "C", label: "โพสต์นี้ฟังดูน่ากลัวแค่ไหน" },
    ],
    reason:
      "คำถามแรกที่ควรถามคือแหล่งที่มาของข้อมูล เพราะถ้ายังไม่รู้ว่าใครเป็นผู้สร้างหรือโพสต์ต้นทาง เราก็ยังไม่ควรเชื่อถือข้อมูลนั้นทันที",
  },
  {
    id: "c2",
    scenario:
      "มีคลิปไวรัลในแพลตฟอร์มหนึ่งพร้อมแคปชันว่า “นี่คือความจริงทั้งหมดของเหตุการณ์นี้” คลิปมียอดดูจำนวนมาก แต่เป็นคลิปที่ถูกตัดมาเพียงบางช่วงและไม่มีคลิปเต็มแนบไว้",
    answer: "B",
    choices: [
      { id: "A", label: "คลิปนี้มียอดวิวมากแค่ไหน" },
      { id: "B", label: "คลิปนี้อาจถูกตัดบางส่วนจนทำให้เข้าใจผิดหรือไม่" },
      { id: "C", label: "คนในคลิปเป็นใครและหน้าตาเป็นอย่างไร" },
    ],
    reason:
      "เมื่อคลิปถูกตัดบางช่วง เราควรตั้งคำถามเรื่องบริบทและส่วนที่หายไปก่อน เพราะการเห็นเพียงบางส่วนอาจทำให้ตีความเหตุการณ์ผิดจากความจริงได้",
  },
  {
    id: "c3",
    scenario:
      "มีโพสต์รีวิวสินค้าเขียนว่า “ใช้แล้วเห็นผลแน่นอน 100% ภายใน 3 วัน” พร้อมภาพก่อนและหลัง แต่ไม่ได้ระบุข้อมูลผลิตภัณฑ์ แหล่งอ้างอิง หรือรายละเอียดที่ตรวจสอบได้",
    answer: "C",
    choices: [
      { id: "A", label: "มีคนกดไลก์โพสต์นี้กี่คน" },
      { id: "B", label: "ภาพก่อนและหลังดูต่างกันมากแค่ไหน" },
      { id: "C", label: "ผู้โพสต์มีวัตถุประสงค์อะไร เช่น ต้องการขายสินค้าหรือไม่" },
    ],
    reason:
      "โพสต์ลักษณะนี้ควรถามเรื่องวัตถุประสงค์ของผู้โพสต์ เพราะเนื้อหาอาจถูกสร้างขึ้นเพื่อโฆษณาหรือโน้มน้าวให้ซื้อ มากกว่าการให้ข้อมูลอย่างเป็นกลาง",
  },
  {
    id: "c4",
    scenario:
      "มีข้อความถูกส่งต่อในกลุ่มแชตว่า “พรุ่งนี้โรงเรียนจะหยุดเรียนเพราะเหตุฉุกเฉิน” ข้อความถูกส่งต่อไปหลายกลุ่ม แต่ไม่มีภาพประกาศจากโรงเรียนหรือช่องทางทางการแนบมาด้วย",
    answer: "B",
    choices: [
      { id: "A", label: "ข้อความนี้ถูกส่งต่อไปกี่กลุ่มแล้ว" },
      { id: "B", label: "มีประกาศจากแหล่งทางการที่ตรวจสอบได้หรือไม่" },
      { id: "C", label: "ใครเป็นคนส่งข้อความนี้เข้ามาในกลุ่มก่อน" },
    ],
    reason:
      "เมื่อเป็นข้อมูลสำคัญที่กระทบการตัดสินใจ ควรตรวจสอบจากแหล่งทางการก่อนเสมอ เช่น เว็บไซต์โรงเรียน เพจทางการ หรือประกาศที่ตรวจสอบย้อนกลับได้",
  },
];

export default function Learn1Unit8() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");
  const [step, setStep] = useState("video");

  const [answers, setAnswers] = useState({});
  const [submittedCheck, setSubmittedCheck] = useState(false);

  const chooseAnswer = (itemId, choiceId) => {
    setAnswers((prev) => ({ ...prev, [itemId]: choiceId }));
  };

  const allCheckAnswered = useMemo(
    () => Object.keys(answers).length === CHECK_ITEMS.length,
    [answers]
  );

  const checkScore = useMemo(() => {
    let total = 0;
    for (const item of CHECK_ITEMS) {
      if (answers[item.id] === item.answer) total += 1;
    }
    return total;
  }, [answers]);

  const panelTitle = useMemo(() => {
    if (step === "video") return "เริ่มต้นทำความรู้จักบทเรียน";
    if (step === "lesson") return "แนวคิดสำคัญ";
    return "ฝึกตั้งคำถามจากสถานการณ์จริง";
  }, [step]);

  useEffect(() => {
    let alive = true;

    const loadProfile = async () => {
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
        setStudentName(
          `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim()
        );
      }

      setLoading(false);
    };

    loadProfile();

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
              <div className="edu-brandtext__subtitle">Unit 8</div>
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
        <section className="edu-hero" aria-label="Unit 8 header">
          <div className="edu-hero__card">
            <div className="edu-hero__row">
              <div className="edu-hero__headline">
                <div className="edu-hero__title">
                  Unit 8 : การรู้เท่าทันสื่อและข้อมูลออนไลน์
                </div>
                <div className="edu-hero__sub">
                  เรื่องที่ 1 การตั้งคำถามต่อเนื้อหาออนไลน์
                </div>

                <div className="edu-lessons__toolbar">
                  <button
                    className="edu-btn edu-btn--back"
                    type="button"
                    onClick={() => {
                      if (step === "check") {
                        setStep("lesson");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        return;
                      }
                      if (step === "lesson") {
                        setStep("video");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        return;
                      }
                      navigate(-1);
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
              {panelTitle}
            </div>
          </div>

          {step === "video" && (
            <div className="edu-videoStage">
              <video className="edu-video" src={learnVideo} controls playsInline />
              <div className="edu-videoActions">
                <button
                  className="edu-btn edu-btn--ghost"
                  type="button"
                  onClick={() => {
                    setStep("lesson");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  ถัดไป <FiChevronRight />
                </button>
              </div>
            </div>
          )}

          {step === "lesson" && (
            <div className="edu-taskStage">
              <div className="edu-grid">
                {MICRO_LESSON.map((item, index) => (
                  <div key={index} className="edu-card">
                    <div className="edu-card__body">
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
                ))}
              </div>

              <div className="edu-hint" style={{ marginTop: 24, marginBottom: 24 }}>
                <FiCheckCircle />
                <div>
                  ลองนึกถึงโพสต์หรือข่าวที่เคยทำให้คุณเกือบเชื่อทันที
                  แล้วถามตัวเองว่า ตอนนั้นคุณดูเพียงความน่าสนใจของเนื้อหา
                  หรือได้ลองเช็กว่าใครเป็นผู้โพสต์ มีจุดประสงค์อะไร และมีหลักฐานหรือไม่
                </div>
              </div>

              <div className="edu-actions">
                <button
                  className="edu-btn edu-btn--back"
                  type="button"
                  onClick={() => {
                    setStep("video");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  <FiChevronLeft /> กลับไปดูวิดีโอ
                </button>

                <button
                  className="edu-btn edu-btn--primary"
                  type="button"
                  onClick={() => {
                    setStep("check");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  เริ่มกิจกรรม <FiChevronRight />
                </button>
              </div>
            </div>
          )}

          {step === "check" && (
            <div className="edu-taskStage">
              <div className="edu-taskIntro">
                <div className="edu-taskIntro__title">
                  อ่านสถานการณ์ แล้วเลือก “คำถามที่ควรถาม” มากที่สุด
                </div>
                <div className="edu-taskIntro__desc">
                  แบบฝึกนี้ไม่ได้วัดว่าใครจำเนื้อหาได้ แต่ต้องการให้คุณฝึกคิดว่า
                  เมื่อเจอโพสต์หรือข่าวที่แชร์กันมาก เราควรถามอะไรเพื่อช่วยตรวจสอบข้อมูล
                </div>
                <div className="edu-taskIntro__meta">
                  ตอบแล้ว {Object.keys(answers).length} / {CHECK_ITEMS.length}
                </div>
              </div>

              <div className="edu-taskGrid">
                {CHECK_ITEMS.map((item) => {
                  const picked = answers[item.id];
                  const isCorrect = submittedCheck && picked === item.answer;
                  const isWrong = submittedCheck && picked && picked !== item.answer;

                  return (
                    <div key={item.id} className="edu-taskCard">
                      <div className="edu-taskCard__body">
                        <div className="edu-taskCard__label">{item.scenario}</div>
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

                      {submittedCheck && (
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

              {submittedCheck && (
                <div className="edu-result">
                  <div className="edu-result__text">
                    คุณได้ {checkScore} / {CHECK_ITEMS.length} คะแนน
                  </div>
                </div>
              )}

              <div className="edu-taskFooter">
                <button
                  className="edu-btn edu-btn--back"
                  type="button"
                  onClick={() => {
                    if (submittedCheck) {
                      setSubmittedCheck(false);
                    }
                    setStep("lesson");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  <FiChevronLeft /> กลับไปดูสรุป
                </button>

                <div className="edu-actions">
                  {!submittedCheck && (
                    <button
                      className="edu-btn edu-btn--primary"
                      type="button"
                      disabled={!allCheckAnswered}
                      onClick={() => {
                        setSubmittedCheck(true);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      ส่งคำตอบ <FiChevronRight />
                    </button>
                  )}

                  {submittedCheck && (
                    <button
                      className="edu-btn edu-btn--ghost"
                      type="button"
                      onClick={() => {
                        navigate("/unit8/learn", { replace: true });
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
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