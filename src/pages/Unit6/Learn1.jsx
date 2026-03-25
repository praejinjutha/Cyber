// src/pages/Unit6/Learn1.jsx
// ✅ Unit 6 - เรื่องที่ 1: สำรวจพฤติกรรมการใช้สื่อของตนเอง
// ✅ ใช้เฉพาะ class ที่มีอยู่แล้วใน main.css + learn.css
// ✅ Flow: Video-based Concept Introduction → Micro-lesson → Interactive Concept Checking → Immediate Feedback Learning
// ✅ เนื้อหาใน micro-lesson ไม่ซ้ำกับวิดีโอ

import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import logo from "../../assets/logo.png";

// ✅ เปลี่ยนมาใช้ Local Import วีดีโอแทน Link YouTube
import learnVideo from "../../assets/learn3.1.mp4";

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
  FiClock,
  FiTarget,
  FiMoon,
  FiBookOpen,
} from "react-icons/fi";

/* ------------------------------------------------------------------ */
/* ✅ MICRO-LESSON (ต่อยอดจากวิดีโอ ไม่พูดซ้ำ) */
/* ------------------------------------------------------------------ */
const MICRO_LESSON = [
  {
    icon: <FiTarget />,
    title: "มองให้ลึกกว่าแค่จำนวนชั่วโมงที่ใช้",
    points: [
      "เวลาใช้งานรวมเป็นเพียงจุดเริ่มต้นของการสังเกตพฤติกรรม",
      "เวลาที่เท่ากันอาจมีความหมายต่างกัน ขึ้นอยู่กับว่าใช้ไปกับอะไร",
      "การประเมินที่ดีต้องมองทั้งเป้าหมายของการใช้ และผลที่เกิดขึ้นกับชีวิตประจำวัน",
    ],
    note: "คำถามสำคัญคือ เวลาที่ใช้ไปนั้นสอดคล้องกับสิ่งที่เราตั้งใจไว้จริงหรือไม่",
  },
  {
    icon: <FiClock />,
    title: "แยกให้ออกว่าใช้แบบตั้งใจ หรือไหลไปตามความเคยชิน",
    points: [
      "การใช้แบบตั้งใจ คือ เปิดสื่อเพราะมีเป้าหมายชัด เช่น ค้นข้อมูล ส่งงาน ติดต่อเรื่องสำคัญ",
      "การใช้แบบไหลไปเรื่อย ๆ มักเริ่มจากตั้งใจไม่นาน แต่ต่อเนื่องยาวโดยไม่รู้ตัว",
      "การรู้ความต่างของสองแบบนี้ช่วยให้เห็นรูปแบบการใช้สื่อของตัวเองชัดขึ้น",
    ],
    note: "ลองถามตัวเองก่อนเปิดแอปว่า เปิดเพื่ออะไร และเมื่อเสร็จแล้วหยุดได้ไหม",
  },
  {
    icon: <FiBookOpen />,
    title: "เชื่อมข้อมูลการใช้สื่อกับชีวิตจริงของเรา",
    points: [
      "เมื่อพบช่วงที่ใช้สื่อมาก ควรมองร่วมกับกิจกรรมในชีวิตจริงช่วงนั้น",
      "บางช่วงอาจเป็นการใช้เพื่อเรียน งาน หรือพักผ่อนอย่างเหมาะสม",
      "บางช่วงอาจเริ่มดึงเวลาออกจากการอ่านหนังสือ การนอน หรือการทำสิ่งสำคัญอื่น",
    ],
    note: "เป้าหมายคือเข้าใจความสัมพันธ์ระหว่างการใช้สื่อกับจังหวะชีวิตของตนเอง",
  },
  {
    icon: <FiMoon />,
    title: "สำรวจตัวเองเพื่อเข้าใจ ไม่ใช่เพื่อตำหนิ",
    points: [
      "การสำรวจพฤติกรรมมีไว้เพื่อมองเห็นข้อมูลจริง ไม่ใช่ตัดสินตัวเองทันที",
      "เมื่อเห็นรูปแบบชัดขึ้น เราจะตัดสินใจได้ดีขึ้นว่าควรรักษา ปรับลด หรือจัดเวลาใหม่",
      "การรู้จักพฤติกรรมของตัวเองคือจุดเริ่มต้นของการดูแลสุขภาวะดิจิทัล",
    ],
    note: "การประเมินที่ดีคือการซื่อสัตย์กับพฤติกรรมของตัวเอง แล้วค่อยคิดว่าจะปรับอย่างไร",
  },
];

/* ------------------------------------------------------------------ */
/* ✅ INTERACTIVE CONCEPT CHECKING */
/* ------------------------------------------------------------------ */
const CHECK_ITEMS = [
  {
    id: "c1",
    scenario:
      "หลังเลิกเรียน แพรวเปิดแอปวิดีโอเพื่อพักสมอง 10 นาที แต่สุดท้ายเลื่อนไปเรื่อย ๆ เกือบ 1 ชั่วโมงโดยไม่ได้ตั้งใจ",
    answer: "B",
    choices: [
      { id: "A", label: "ใช้สื่อแบบตั้งใจและควบคุมเวลาได้" },
      { id: "B", label: "ใช้สื่อแบบไหลไปเรื่อย ๆ จนเกินเวลาที่ตั้งใจ" },
      { id: "C", label: "ใช้สื่อเพื่อการเรียนหรือทำงานเป็นหลัก" },
    ],
    reason:
      "สถานการณ์นี้เริ่มจากการพักสั้น ๆ แต่ลงท้ายด้วยการใช้นานเกินแผน จึงเป็นรูปแบบของการใช้สื่อที่ไหลต่อเนื่องโดยไม่ทันสังเกตเวลา",
  },
  {
    id: "c2",
    scenario:
      "นนท์เปิดโทรศัพท์ช่วง 19.00-20.00 เพื่อค้นข้อมูลทำรายงาน ส่งไฟล์ให้เพื่อน และเช็กข้อความจากครู จากนั้นวางโทรศัพท์แล้วกลับไปอ่านหนังสือต่อ",
    answer: "A",
    choices: [
      { id: "A", label: "ใช้สื่อแบบมีเป้าหมายชัดเจนและสอดคล้องกับงาน" },
      { id: "B", label: "ใช้สื่อแบบเคยชินโดยไม่รู้ตัว" },
      { id: "C", label: "ใช้สื่อที่เริ่มรบกวนการพักผ่อนอย่างชัดเจน" },
    ],
    reason:
      "การใช้งานมีเป้าหมายชัด ทำเสร็จแล้วหยุดได้ และสัมพันธ์กับการเรียนโดยตรง จึงเป็นรูปแบบการใช้สื่อที่มีจุดประสงค์ชัดเจน",
  },
  {
    id: "c3",
    scenario:
      "ฝ้ายมักใช้โซเชียลหนักช่วงก่อนนอนเกือบทุกคืน แม้ตั้งใจว่าจะเช็กแค่ไม่กี่นาที แต่สุดท้ายมักนอนดึกและตื่นมาไม่สดชื่น",
    answer: "C",
    choices: [
      { id: "A", label: "เป็นรูปแบบที่สมดุลและเหมาะกับการพักผ่อน" },
      { id: "B", label: "เป็นการใช้สื่อเพื่อการสื่อสารที่จำเป็น" },
      { id: "C", label: "เป็นรูปแบบที่เริ่มรบกวนสมดุลชีวิตและการพักผ่อน" },
    ],
    reason:
      "ผลที่ตามมาคือนอนดึกและพักผ่อนไม่พอ แปลว่าการใช้สื่อนี้เริ่มกระทบสมดุลชีวิต โดยเฉพาะการพักผ่อน",
  },
  {
    id: "c4",
    scenario:
      "เมฆเปิดมือถือบ่อยมากระหว่างอ่านหนังสือ แม้ไม่มีแจ้งเตือน บางครั้งแค่ปลดล็อกหน้าจอแล้วเลื่อนดูแบบไม่มีเป้าหมาย ก่อนจะกลับมาอ่านต่อ",
    answer: "B",
    choices: [
      { id: "A", label: "ใช้สื่อเพื่อเรียนอย่างต่อเนื่อง" },
      { id: "B", label: "มีแนวโน้มใช้สื่อจากความเคยชินหรือความเผลอ" },
      { id: "C", label: "ใช้สื่อเพื่อพักผ่อนอย่างเป็นระบบ" },
    ],
    reason:
      "การหยิบมือถือขึ้นมาโดยไม่มีเหตุจำเป็นหรือเป้าหมายชัด เป็นสัญญาณของการใช้สื่อจากความเคยชินหรือความเผลอ",
  },
];

/* ------------------------------------------------------------------ */
/* ✅ SELF REFLECTION */
/* ------------------------------------------------------------------ */
const SELF_REFLECT = [
  {
    id: "r1",
    text: "โดยส่วนใหญ่ ฉันเปิดสื่อเพราะมีเป้าหมายชัดเจน เช่น เรียน ค้นข้อมูล หรือติดต่อเรื่องสำคัญ",
  },
  {
    id: "r2",
    text: "ฉันรู้ว่าช่วงเวลาไหนของวันเป็นช่วงที่ตัวเองใช้สื่อมากที่สุด",
  },
  {
    id: "r3",
    text: "ฉันมักใช้สื่อนานกว่าที่ตั้งใจไว้",
  },
  {
    id: "r4",
    text: "การใช้สื่อของฉันรบกวนการเรียน งาน หรือการพักผ่อน",
  },
];

const SCALE_CHOICES = [
  { id: 1, label: "น้อยมาก" },
  { id: 2, label: "น้อย" },
  { id: 3, label: "ปานกลาง" },
  { id: 4, label: "มาก" },
  { id: 5, label: "มากที่สุด" },
];

export default function Learn1Unit6() {
  const navigate = useNavigate();
  const location = useLocation();

  const mode = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    return sp.get("mode") || "all";
  }, [location.search]);

  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");
  const [step, setStep] = useState("video");

  const [answers, setAnswers] = useState({});
  const [submittedCheck, setSubmittedCheck] = useState(false);

  const [reflectAnswers, setReflectAnswers] = useState({});
  const [submittedReflect, setSubmittedReflect] = useState(false);

  const chooseAnswer = (itemId, choiceId) => {
    setAnswers((prev) => ({ ...prev, [itemId]: choiceId }));
    if (submittedCheck) setSubmittedCheck(false);
  };

  const chooseReflect = (itemId, score) => {
    setReflectAnswers((prev) => ({ ...prev, [itemId]: score }));
    if (submittedReflect) setSubmittedReflect(false);
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

  const allReflectAnswered = useMemo(
    () => Object.keys(reflectAnswers).length === SELF_REFLECT.length,
    [reflectAnswers]
  );

  const reflectAnsweredCount = useMemo(
    () => Object.keys(reflectAnswers).length,
    [reflectAnswers]
  );

  const reflectScore = useMemo(() => {
    const r1 = reflectAnswers.r1 || 0;
    const r2 = reflectAnswers.r2 || 0;
    const r3 = reflectAnswers.r3 || 0;
    const r4 = reflectAnswers.r4 || 0;
    return r1 + r2 + (6 - r3) + (6 - r4);
  }, [reflectAnswers]);

  const reflectResult = useMemo(() => {
    const r1 = reflectAnswers.r1 || 0;
    const r2 = reflectAnswers.r2 || 0;
    const r3 = reflectAnswers.r3 || 0;
    const r4 = reflectAnswers.r4 || 0;

    if (!submittedReflect) return null;

    const total = r1 + r2 + (6 - r3) + (6 - r4);

    if (total >= 16) {
      return {
        level: "good",
        title: "ผลประเมิน: อยู่ในเกณฑ์ดี",
        badgeClass: "edu-badge edu-badge--ok",
        badgeText: "ดี",
        icon: <FiCheckCircle />,
        message:
          "รูปแบบการใช้สื่อของคุณโดยรวมค่อนข้างสมดุล คุณพอรู้ตัวว่าตนเองใช้สื่อเมื่อไร ใช้เพื่ออะไร และยังควบคุมไม่ให้กระทบต่อการเรียน งาน หรือการพักผ่อนมากนัก",
        tips: [
          "รักษาพฤติกรรมที่ดีนี้ไว้ต่อไป",
          "สังเกตช่วงเวลาที่ใช้สื่อมากที่สุดอย่างสม่ำเสมอ",
          "ก่อนเปิดแอป ลองถามตัวเองสั้น ๆ ว่าเปิดเพื่ออะไร",
        ],
      };
    }

    if (total >= 11) {
      return {
        level: "medium",
        title: "ผลประเมิน: ควรเฝ้าระวัง",
        badgeClass: "edu-badge edu-badge--yellow",
        badgeText: "เฝ้าระวัง",
        icon: <FiAlertTriangle />,
        message:
          "การใช้สื่อของคุณยังไม่ถึงขั้นน่ากังวลมาก แต่มีบางช่วงที่อาจเริ่มไหลเกินเวลาที่ตั้งใจ หรือเริ่มรบกวนบางส่วนของชีวิตประจำวัน จึงควรเริ่มสังเกตให้ชัดขึ้น",
        tips: [
          "ลองสังเกต 1 ช่วงเวลาที่ใช้สื่อมากที่สุดในแต่ละวัน",
          "กำหนดขอบเขตเวลาก่อนใช้ เช่น 10-15 นาที",
          "ถ้ารู้ตัวว่าเริ่มไหล ให้หยุดพักแล้วกลับไปทำสิ่งที่ตั้งใจไว้",
        ],
      };
    }

    return {
      level: "risk",
      title: "ผลประเมิน: เสี่ยงต่อการใช้สื่อแบบไม่สมดุล",
      badgeClass: "edu-badge edu-badge--lock",
      badgeText: "เสี่ยง",
      icon: <FiAlertTriangle />,
      message:
        "ผลประเมินสะท้อนว่าการใช้สื่อของคุณอาจเริ่มกระทบต่อการเรียน งาน หรือการพักผ่อนอย่างชัดเจน และมีแนวโน้มใช้สื่อนานเกินกว่าที่ตั้งใจไว้บ่อยครั้ง ควรเริ่มปรับพฤติกรรมอย่างจริงจัง",
      tips: [
        "เริ่มลดจากช่วงเวลาที่ใช้สื่อหนักที่สุดก่อน",
        "หลีกเลี่ยงการใช้สื่อยาวต่อเนื่องช่วงก่อนนอน",
        "ถ้าจำเป็น ให้ตั้งเวลาเตือนเพื่อช่วยหยุดใช้งาน",
      ],
    };
  }, [reflectAnswers, submittedReflect]);

  const panelTitle = useMemo(() => {
    if (step === "video") return "เริ่มต้นทำความรู้จักบทเรียน";
    if (step === "lesson") return "มองพฤติกรรมการใช้สื่อให้ชัดขึ้น";
    if (step === "check") return "ลองคิดจากสถานการณ์ใกล้ตัว";
    return "สะท้อนรูปแบบการใช้สื่อของตนเอง";
  }, [step]);

  const goNext = () => {
    navigate("/unit6/learn", { replace: true });
  };

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
                  เรื่องที่ 1 สำรวจพฤติกรรมการใช้สื่อของตนเอง
                </div>

                <div className="edu-lessons__toolbar">
                  <button
                    className="edu-btn edu-btn--back"
                    type="button"
                    onClick={() => {
                      if (step === "reflect") {
                        setStep("check");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        return;
                      }
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
                  ก่อนเริ่มกิจกรรม ลองนึกถึงพฤติกรรมของตัวเองว่า ช่วงไหนที่มักใช้สื่อมากที่สุด
                  และช่วงนั้นเป็นการใช้แบบตั้งใจ หรือใช้แบบไหลไปเรื่อย ๆ
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
                  ลองอ่านสถานการณ์ แล้วมองให้เห็นรูปแบบการใช้สื่อ
                </div>
                <div className="edu-taskIntro__desc">
                  อ่านแต่ละสถานการณ์แล้วเลือกคำตอบที่ตรงที่สุด จากนั้นกดส่งคำตอบ
                  เพื่อรับ feedback ทันที
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
                                  ? `ยังไม่ตรง`
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
                    disabled={!allCheckAnswered}
                    onClick={() => {
                      setSubmittedCheck(true);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    ส่งคำตอบ <FiChevronRight />
                  </button>

                  {submittedCheck && (
                    <button
                      className="edu-btn edu-btn--ghost"
                      type="button"
                      onClick={() => {
                        setStep("reflect");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      ถัดไป <FiChevronRight />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === "reflect" && (
            <div className="edu-taskStage">
              <div className="edu-card">
                <div className="edu-adaptiveBlock__head">
                  <div>
                    <div className="edu-adaptiveBlock__title">
                      ชวนสะท้อนรูปแบบการใช้สื่อของตนเอง
                    </div>
                    <div className="edu-adaptiveBlock__sub">
                      เลือกคำตอบให้ตรงกับพฤติกรรมจริงของตนเองมากที่สุด
                      แบบประเมินนี้ไม่มีคำตอบถูกหรือผิด เป้าหมายคือช่วยให้คุณเห็นรูปแบบการใช้สื่อของตัวเองตามจริง
                    </div>
                  </div>

                  <span className="edu-badge edu-badge--info">
                    ตอบแล้ว {reflectAnsweredCount} / {SELF_REFLECT.length}
                  </span>
                </div>

                <div
                  className="edu-lessonCard__tags"
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    marginTop: 10,
                  }}
                >
                  {SCALE_CHOICES.map((scale) => (
                    <span key={scale.id} className="edu-pill edu-pill--muted">
                      {scale.id} = {scale.label}
                    </span>
                  ))}
                </div>
              </div>

              <div
                className="edu-adaptiveGrid"
                style={{
                  marginTop: 14,
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1.45fr) minmax(320px, 380px)",
                  gap: 18,
                  alignItems: "start",
                }}
              >
                {/* LEFT */}
                <div
                  className="edu-card edu-adaptiveBlock"
                  style={{
                    padding: 16,
                    minWidth: 0,
                  }}
                >
                  <div
                    className="edu-adaptiveBlock__head"
                    style={{
                      marginBottom: 16,
                    }}
                  >
                    <div>
                      <div className="edu-adaptiveBlock__title">
                        ตอบตามพฤติกรรมจริงของคุณ
                      </div>
                      <div className="edu-adaptiveBlock__sub">
                        ไม่ต้องเลือกให้ดูดี เลือกให้ตรงกับชีวิตจริงมากที่สุด
                      </div>
                    </div>
                  </div>

                  <div
                    className="edu-pathList"
                    style={{
                      display: "grid",
                      gap: 12,
                    }}
                  >
                    {SELF_REFLECT.map((item, index) => (
                      <div
                        key={item.id}
                        className="edu-pathRow"
                        style={{
                          display: "grid",
                          gridTemplateColumns: "40px minmax(0,1fr) 24px",
                          gap: 12,
                          alignItems: "start",
                          padding: 14,
                          borderRadius: 16,
                          border: "1px solid rgba(0,0,0,0.08)",
                          background: "rgba(255,255,255,0.72)",
                          minWidth: 0,
                        }}
                      >
                        <div
                          className="edu-pathRow__step"
                          style={{
                            width: 36,
                            height: 36,
                            display: "grid",
                            placeItems: "center",
                            borderRadius: 999,
                            fontWeight: 800,
                            fontSize: 13,
                            flexShrink: 0,
                          }}
                        >
                          {index + 1}
                        </div>

                        <div style={{ minWidth: 0 }}>
                          <div
                            className="edu-pathRow__title"
                            style={{
                              display: "block",
                              width: "100%",
                              maxWidth: "100%",
                              fontSize: 15,
                              fontWeight: 700,
                              lineHeight: 1.65,
                              whiteSpace: "normal",
                              wordBreak: "keep-all",
                              overflowWrap: "break-word",
                            }}
                          >
                            {item.text}
                          </div>

                          <div
                            className="edu-pathRow__tags"
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 8,
                              marginTop: 12,
                            }}
                          >
                            {SCALE_CHOICES.map((scale) => (
                              <button
                                key={scale.id}
                                type="button"
                                className={`edu-pill ${
                                  reflectAnswers[item.id] === scale.id ? "is-active" : ""
                                }`}
                                onClick={() => chooseReflect(item.id, scale.id)}
                                style={{
                                  whiteSpace: "nowrap",
                                  flexShrink: 0,
                                }}
                              >
                                {scale.id} - {scale.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div
                          className="edu-pathRow__arrow"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            paddingTop: 6,
                            flexShrink: 0,
                          }}
                        >
                          {reflectAnswers[item.id] ? <FiCheckCircle /> : <FiChevronRight />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RIGHT */}
                <div
                  className="edu-card edu-adaptiveBlock"
                  style={{
                    padding: 16,
                    minWidth: 0,
                    position: "sticky",
                    top: 88,
                    alignSelf: "start",
                  }}
                >
                  <div
                    className="edu-adaptiveBlock__head"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 10,
                      marginBottom: 14,
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div className="edu-adaptiveBlock__title">สรุปการประเมิน</div>
                      <div
                        className="edu-adaptiveBlock__sub"
                        style={{
                          lineHeight: 1.6,
                        }}
                      >
                        เมื่อเลือกครบทุกข้อแล้ว กดดูผลประเมินเพื่ออ่านคำแนะนำ
                      </div>
                    </div>

                    {submittedReflect && reflectResult ? (
                      <span className={reflectResult.badgeClass}>{reflectResult.badgeText}</span>
                    ) : (
                      <span className="edu-badge">
                        {reflectAnsweredCount === SELF_REFLECT.length ? "พร้อมดูผล" : "ยังตอบไม่ครบ"}
                      </span>
                    )}
                  </div>

                  <div
                    className="edu-stats"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr",
                      gap: 10,
                    }}
                  >
                    <div
                      className="edu-stat"
                      style={{
                        padding: 14,
                        borderRadius: 14,
                        border: "1px solid rgba(0,0,0,0.08)",
                        background: "rgba(255,255,255,0.78)",
                      }}
                    >
                      <div className="edu-stat__label">จำนวนข้อที่ตอบแล้ว</div>
                      <div className="edu-stat__value">
                        {reflectAnsweredCount} / {SELF_REFLECT.length}
                      </div>
                      <div className="edu-stat__hint">ตอบให้ครบก่อนจึงจะดูผลประเมินได้</div>
                    </div>

                    <div
                      className="edu-stat"
                      style={{
                        padding: 14,
                        borderRadius: 14,
                        border: "1px solid rgba(0,0,0,0.08)",
                        background: "rgba(255,255,255,0.78)",
                      }}
                    >
                      <div className="edu-stat__label">สถานะตอนนี้</div>
                      <div className="edu-stat__value">
                        {submittedReflect ? "ประเมินแล้ว" : "ยังไม่ส่ง"}
                      </div>
                      <div className="edu-stat__hint">
                        {submittedReflect
                          ? "อ่านข้อความสรุปและแนวทางปรับใช้ด้านล่าง"
                          : "ยังไม่ต้องกังวลคะแนน ให้เน้นตอบตามจริง"}
                      </div>
                    </div>

                    <div
                      className="edu-stat"
                      style={{
                        padding: 14,
                        borderRadius: 14,
                        border: "1px solid rgba(0,0,0,0.08)",
                        background: "rgba(255,255,255,0.78)",
                      }}
                    >
                      <div className="edu-stat__label">คะแนนรวม</div>
                      <div className="edu-stat__value">{submittedReflect ? reflectScore : "-"}</div>
                      <div className="edu-stat__hint">
                        คะแนนจะคำนวณหลังจากคุณกดดูผลประเมิน
                      </div>
                    </div>
                  </div>

                  {!submittedReflect && (
                    <div
                      className="edu-callout"
                      style={{
                        marginTop: 12,
                        lineHeight: 1.75,
                      }}
                    >
                      แบบประเมินนี้ใช้เพื่อ “ทำความเข้าใจตัวเอง” ไม่ใช่เพื่อตัดสินว่าดีหรือไม่ดี
                      ยิ่งตอบตรงกับพฤติกรรมจริง ผลที่ได้ยิ่งมีประโยชน์กับคุณมากขึ้น
                    </div>
                  )}

                  {submittedReflect && reflectResult && (
                    <div style={{ marginTop: 14 }}>
                      <div
                        style={{
                          padding: 14,
                          borderRadius: 14,
                          border: "1px solid rgba(0,0,0,0.08)",
                          background: "rgba(255,255,255,0.78)",
                        }}
                      >
                        <div
                          className="edu-feedbackCard__head"
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: 10,
                            flexWrap: "wrap",
                            marginBottom: 10,
                          }}
                        >
                          <div className="edu-box__title" style={{ minWidth: 0, lineHeight: 1.5 }}>
                            {reflectResult.icon} {reflectResult.title}
                          </div>

                          <div className="edu-feedbackCard__status">
                            <span className={reflectResult.badgeClass}>
                              {reflectResult.badgeText}
                            </span>
                          </div>
                        </div>

                        <div className="edu-note" style={{ lineHeight: 1.75 }}>
                          {reflectResult.message}
                        </div>
                      </div>

                      <div
                        className="edu-callout"
                        style={{
                          marginTop: 12,
                          lineHeight: 1.75,
                        }}
                      >
                        <div className="edu-box__title" style={{ marginBottom: 8 }}>
                          แนวทางเล็ก ๆ ที่เริ่มได้จากวันนี้
                        </div>
                        <ul className="edu-list" style={{ marginBottom: 0 }}>
                          {reflectResult.tips.map((tip, index) => (
                            <li key={index}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="edu-taskFooter">
                <button
                  className="edu-btn edu-btn--back"
                  type="button"
                  onClick={() => {
                    setStep("check");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  <FiChevronLeft /> กลับไปกิจกรรม
                </button>

                <div className="edu-actions">
                  <button
                    className="edu-btn edu-btn--primary"
                    type="button"
                    disabled={!allReflectAnswered}
                    onClick={() => {
                      setSubmittedReflect(true);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    ดูผลประเมิน <FiChevronRight />
                  </button>

                  {submittedReflect && (
                    <button className="edu-btn edu-btn--ghost" type="button" onClick={goNext}>
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