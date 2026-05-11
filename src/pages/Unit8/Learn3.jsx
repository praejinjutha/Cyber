// src/pages/Unit8/Learn3Unit8.jsx
// ✅ Unit 8 - เรื่องที่ 3: ผลกระทบทางสังคมของการเผยแพร่เนื้อหา
// ✅ Flow: Scenario-based Learning → Risk Assessment Learning → Immediate Feedback Learning
// ✅ ใช้เฉพาะ main.css + Unit1/learn.css
// ✅ ไม่เพิ่ม class CSS ใหม่
// ✅ เนื้อหาเหมาะกับผู้เรียนอายุ 15–18 ปี
// ✅ หน้าสุดท้ายมีปุ่ม "เสร็จสิ้น" และกลับไป /unit8/learn

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
  FiUsers,
  FiShare2,
  FiShield,
  FiSearch,
  FiMessageCircle,
  FiTrendingUp,
} from "react-icons/fi";

/* ------------------------------------------------------------------ */
/* ✅ MICRO-LESSON
/* เน้น: การเผยแพร่เนื้อหา 1 ชิ้น อาจส่งผลต่อคนจำนวนมากในสังคม
/* ------------------------------------------------------------------ */
const MICRO_LESSON = [
  {
    icon: <FiShare2 />,
    title: "การแชร์ 1 ครั้ง อาจส่งผลต่อคนจำนวนมาก",
    points: [
      "ในโลกออนไลน์ เนื้อหาชิ้นเดียวสามารถถูกส่งต่อได้รวดเร็วและขยายไปถึงคนจำนวนมากภายในเวลาไม่นาน",
      "เมื่อมีคนเห็นมากขึ้น ผลกระทบของเนื้อหานั้นก็อาจกว้างขึ้น ทั้งต่อบุคคล กลุ่มคน และสังคมโดยรวม",
      "จึงไม่ควรมองว่าการแชร์เป็นเรื่องเล็กเสมอไป เพราะการกดส่งต่ออาจทำให้เรื่องหนึ่งขยายตัวเกินกว่าที่เราคิด",
    ],
    note: "ก่อนแชร์ ลองคิดเสมอว่า ถ้าเนื้อหานี้กระจายออกไปกว้างกว่านี้ จะเกิดอะไรตามมาได้บ้าง",
  },
  {
    icon: <FiUsers />,
    title: "ผลกระทบอาจเกิดได้ทั้งเชิงบวกและเชิงลบ",
    points: [
      "บางเนื้อหาช่วยให้คนรับรู้ข้อมูลที่เป็นประโยชน์ เช่น การแจ้งเตือนภัย การขอความช่วยเหลือ หรือการรณรงค์เรื่องสำคัญ",
      "แต่บางเนื้อหาอาจทำให้เกิดความเข้าใจผิด ความขัดแย้ง ความตื่นตระหนก หรือความเสียหายต่อชื่อเสียงของผู้อื่น",
      "การพิจารณาผลกระทบจึงไม่ใช่ดูแค่ว่าเนื้อหาน่าสนใจไหม แต่ต้องดูด้วยว่าใครอาจได้รับผลจากมัน",
    ],
    note: "เนื้อหาเดียวกันอาจมีทั้งข้อดีและความเสี่ยง ขึ้นอยู่กับความถูกต้อง บริบท และวิธีที่คนในสังคมรับไปตีความ",
  },
  {
    icon: <FiMessageCircle />,
    title: "ความเข้าใจผิดและความขัดแย้ง มักเริ่มจากข้อมูลที่ยังไม่ครบ",
    points: [
      "ถ้าเนื้อหาถูกส่งต่อทั้งที่ยังไม่ชัดเจนหรือขาดบริบท ผู้คนอาจเข้าใจเรื่องนั้นผิดไปจากความเป็นจริง",
      "เมื่อแต่ละคนตีความต่างกัน ก็อาจเกิดการโต้เถียง ดราม่า หรือความขัดแย้งในสังคมตามมา",
      "ยิ่งเนื้อหาเกี่ยวข้องกับประเด็นอ่อนไหว ความเสียหายที่เกิดจากการแชร์โดยไม่คิดก็ยิ่งรุนแรงขึ้น",
    ],
    note: "บางครั้งปัญหาไม่ได้เริ่มจากเนื้อหาเท่านั้น แต่เริ่มจากการที่คนรับสารรีบเชื่อและรีบส่งต่อ",
  },
  {
    icon: <FiShield />,
    title: "ผู้ใช้สื่อออนไลน์ควรคิดถึงผลกระทบก่อนเผยแพร่",
    points: [
      "ก่อนแชร์ ควรถามตัวเองว่า เนื้อหานี้จริงหรือไม่ มีบริบทครบไหม และอาจกระทบใครบ้าง",
      "ถ้าเนื้อหานั้นมีโอกาสทำให้คนเข้าใจผิด แตกแยก หรือเกิดความเสียหาย ก็ควรหยุดคิดก่อนเผยแพร่",
      "การใช้สื่ออย่างรับผิดชอบไม่ได้แปลว่าห้ามแชร์ทุกอย่าง แต่หมายถึงการคิดให้รอบด้านก่อนลงมือ",
    ],
    note: "การตัดสินใจอย่างรับผิดชอบ เริ่มจากการถามว่า “ถ้าแชร์ไปแล้ว คนอื่นจะได้รับผลอย่างไร”",
  },
];

/* ------------------------------------------------------------------ */
/* ✅ SCENARIO-BASED LEARNING
/* ให้ผู้เรียนอ่านสถานการณ์ แล้วมองผลกระทบที่อาจเกิดขึ้น
/* ------------------------------------------------------------------ */
const SCENARIOS = [
  {
    title: "สถานการณ์ที่ 1: ข่าวที่ยังไม่ยืนยัน แต่ถูกแชร์ต่อจำนวนมาก",
    detail:
      "มีโพสต์ในโซเชียลระบุว่าโรงเรียนแห่งหนึ่งมีเหตุการณ์อันตรายเกิดขึ้น พร้อมข้อความเตือนให้รีบแชร์ต่อทันที แต่ในโพสต์ไม่ได้ระบุแหล่งที่มาชัดเจน และยังไม่มีประกาศยืนยันจากหน่วยงานที่เกี่ยวข้อง",
    points: [
      "ถ้าข้อมูลยังไม่ชัดเจน การแชร์ต่ออาจทำให้ผู้ปกครอง นักเรียน หรือคนในชุมชนเกิดความกังวลและเข้าใจผิด",
      "โรงเรียนหรือบุคคลที่เกี่ยวข้องอาจเสียชื่อเสียง แม้ข้อมูลนั้นจะยังไม่เป็นความจริงหรือยังไม่ครบถ้วน",
      "เมื่อมีคนแชร์ต่อมากขึ้น เรื่องอาจขยายเป็นกระแสใหญ่และควบคุมความเข้าใจผิดได้ยากขึ้น",
    ],
    note: "คำถามที่ควรถาม: ถ้าข้อมูลนี้ไม่จริงหรือไม่ครบ การแชร์ต่อจะกระทบใครบ้าง",
  },
  {
    title: "สถานการณ์ที่ 2: คลิปเหตุการณ์สั้น ๆ ที่ไม่มีบริบทครบ",
    detail:
      "มีคลิปสั้นถูกแชร์ต่อในออนไลน์ เป็นภาพการโต้เถียงกันในที่สาธารณะ พร้อมคำบรรยายว่า “คนกลุ่มนี้แย่มาก” แต่คลิปตัดมาเพียงบางช่วง ทำให้ไม่เห็นเหตุการณ์ก่อนหน้าและไม่รู้ว่าเกิดอะไรขึ้นทั้งหมด",
    points: [
      "เมื่อเห็นเพียงบางส่วน ผู้ชมอาจรีบตัดสินคนในคลิปโดยยังไม่รู้ข้อเท็จจริงทั้งหมด",
      "คำบรรยายที่ใส่อารมณ์อาจทำให้ผู้ชมรู้สึกโกรธและแสดงความคิดเห็นอย่างรุนแรงมากขึ้น",
      "การแชร์คลิปต่อโดยไม่ดูบริบท อาจเพิ่มความขัดแย้งและทำให้ผู้เกี่ยวข้องถูกโจมตีเกินกว่าความจริง",
    ],
    note: "คำถามที่ควรถาม: เราเห็นเหตุการณ์ครบจริงหรือยัง หรือกำลังตัดสินจากคลิปเพียงบางส่วน",
  },
  {
    title: "สถานการณ์ที่ 3: การแชร์เนื้อหาเพื่อช่วยเหลือสังคม",
    detail:
      "มีโพสต์ประกาศตามหาผู้สูงอายุที่หลงทาง โดยมีข้อมูลติดต่อจากหน่วยงานที่เกี่ยวข้องอย่างชัดเจน และมีข้อความขอความร่วมมือให้ช่วยกระจายข้อมูลเพื่อเพิ่มโอกาสในการค้นหา",
    points: [
      "ในบางกรณี การแชร์เนื้อหาอย่างเหมาะสมอาจช่วยให้ข้อมูลสำคัญไปถึงคนจำนวนมากได้เร็วขึ้น",
      "ผลกระทบเชิงบวกอาจเกิดขึ้น เช่น เพิ่มโอกาสในการได้รับความช่วยเหลือ หรือทำให้ชุมชนร่วมมือกันมากขึ้น",
      "อย่างไรก็ตาม ผู้แชร์ก็ควรดูว่าเนื้อหามีความน่าเชื่อถือและเหมาะสมต่อการเผยแพร่หรือไม่",
    ],
    note: "คำถามที่ควรถาม: เนื้อหานี้ช่วยสังคมอย่างไร และมีข้อมูลที่ตรวจสอบได้หรือไม่",
  },
];

/* ------------------------------------------------------------------ */
/* ✅ RISK ASSESSMENT LEARNING
/* ให้ผู้เรียนประเมินความเสี่ยง/ผลกระทบจากสถานการณ์
/* ------------------------------------------------------------------ */
const RISK_ITEMS = [
  {
    id: "r1",
    scenario:
      "มีโพสต์ข่าวเกี่ยวกับเหตุการณ์สำคัญในชุมชน แต่ยังไม่มีแหล่งยืนยันชัดเจน และมีคนแชร์ต่อจำนวนมาก ผลกระทบที่ควรนึกถึงมากที่สุดคืออะไร",
    answer: "B",
    choices: [
      { id: "A", label: "ยิ่งคนแชร์เยอะ ยิ่งแปลว่าข้อมูลถูกต้อง" },
      { id: "B", label: "อาจทำให้เกิดความเข้าใจผิดและความตื่นตระหนกในสังคม" },
      { id: "C", label: "ไม่มีผลอะไร เพราะเป็นแค่โพสต์ออนไลน์" },
    ],
    reason:
      "เมื่อข้อมูลยังไม่ยืนยัน แต่ถูกส่งต่อในวงกว้าง ผู้คนอาจเชื่อผิด เข้าใจสถานการณ์คลาดเคลื่อน และเกิดความกังวลเกินความจริงได้",
  },
  {
    id: "r2",
    scenario:
      "มีคลิปเหตุการณ์เพียงช่วงสั้น ๆ พร้อมคำบรรยายที่ทำให้คนดูโกรธ ก่อนแชร์ต่อ สิ่งที่ควรประเมินคืออะไร",
    answer: "C",
    choices: [
      { id: "A", label: "คลิปนี้มีคนดูเยอะหรือไม่" },
      { id: "B", label: "คลิปนี้ตื่นเต้นพอที่จะดึงความสนใจหรือไม่" },
      { id: "C", label: "คลิปนี้มีบริบทครบหรืออาจทำให้คนเข้าใจและตัดสินผิด" },
    ],
    reason:
      "คลิปที่ตัดมาเพียงบางช่วงอาจทำให้ผู้ชมเข้าใจเหตุการณ์ผิดจากความจริง จึงควรคิดถึงบริบทและผลกระทบก่อนแชร์",
  },
  {
    id: "r3",
    scenario:
      "มีโพสต์ขอความช่วยเหลือจากหน่วยงานที่ระบุข้อมูลติดต่อชัดเจน หากแชร์ต่ออย่างเหมาะสม ผลกระทบเชิงบวกที่อาจเกิดขึ้นคืออะไร",
    answer: "A",
    choices: [
      { id: "A", label: "ข้อมูลสำคัญอาจไปถึงคนจำนวนมากและช่วยให้เกิดการช่วยเหลือได้เร็วขึ้น" },
      { id: "B", label: "ยิ่งแชร์มากยิ่งไม่ต้องตรวจสอบข้อมูล" },
      { id: "C", label: "การแชร์ทุกอย่างถือว่าเป็นประโยชน์เสมอ" },
    ],
    reason:
      "เนื้อหาที่มีประโยชน์และตรวจสอบได้ อาจสร้างผลดีต่อสังคม เช่น การช่วยให้คนรับรู้ข้อมูลและร่วมกันช่วยเหลืออย่างเหมาะสม",
  },
  {
    id: "r4",
    scenario:
      "หากต้องตัดสินใจว่าจะเผยแพร่เนื้อหาออนไลน์ต่อหรือไม่ แนวคิดที่เหมาะสมที่สุดคืออะไร",
    answer: "B",
    choices: [
      { id: "A", label: "ดูแค่ว่าเนื้อหาน่าสนใจพอหรือไม่" },
      { id: "B", label: "พิจารณาทั้งความถูกต้องและผลกระทบที่อาจเกิดกับผู้อื่นและสังคม" },
      { id: "C", label: "ถ้ามีเพื่อนแชร์อยู่แล้ว ก็แชร์ตามได้เลย" },
    ],
    reason:
      "การใช้สื่ออย่างรับผิดชอบไม่ใช่ดูแค่ความน่าสนใจของโพสต์ แต่ต้องคิดถึงความถูกต้องและผลที่จะเกิดขึ้นกับผู้อื่นด้วย",
  },
];

export default function Learn3Unit8() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");
  const [step, setStep] = useState("lesson");

  const [answers, setAnswers] = useState({});
  const [submittedRisk, setSubmittedRisk] = useState(false);

  const chooseAnswer = (itemId, choiceId) => {
    setAnswers((prev) => ({ ...prev, [itemId]: choiceId }));
  };

  const allRiskAnswered = useMemo(
    () => Object.keys(answers).length === RISK_ITEMS.length,
    [answers]
  );

  const riskScore = useMemo(() => {
    let total = 0;
    for (const item of RISK_ITEMS) {
      if (answers[item.id] === item.answer) total += 1;
    }
    return total;
  }, [answers]);

  const panelTitle = useMemo(() => {
    if (step === "lesson") return "ทำความเข้าใจผลกระทบของการเผยแพร่เนื้อหา";
    if (step === "scenario") return "เรียนรู้จากสถานการณ์จำลอง";
    return "ประเมินความเสี่ยงก่อนเผยแพร่เนื้อหา";
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
                  Unit 8 : การรู้เท่าทันสื่อและการมีส่วนร่วมอย่างรับผิดชอบ
                </div>
                <div className="edu-hero__sub">
                  เรื่องที่ 3 ผลกระทบทางสังคมของการเผยแพร่เนื้อหา
                </div>

                <div className="edu-lessons__toolbar">
                  <button
                    className="edu-btn edu-btn--back"
                    type="button"
                    onClick={() => {
                      if (step === "risk") {
                        setStep("scenario");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        return;
                      }
                      if (step === "scenario") {
                        setStep("lesson");
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
                <FiTrendingUp />
                <div>
                  เมื่อเนื้อหาถูกเผยแพร่ออกไป ผลของมันไม่ได้หยุดอยู่แค่บนหน้าจอ
                  แต่อาจส่งผลต่อความคิด ความรู้สึก การตัดสินใจ และบรรยากาศในสังคมได้
                </div>
              </div>

              <div className="edu-actions">
                <button
                  className="edu-btn edu-btn--back"
                  type="button"
                  onClick={() => navigate("/unit8/learn")}
                >
                  <FiChevronLeft /> กลับไปหน้าบทเรียน
                </button>

                <button
                  className="edu-btn edu-btn--primary"
                  type="button"
                  onClick={() => {
                    setStep("scenario");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  ดูสถานการณ์ตัวอย่าง <FiChevronRight />
                </button>
              </div>
            </div>
          )}

          {step === "scenario" && (
            <div className="edu-taskStage">
              <div className="edu-taskIntro">
                <div className="edu-taskIntro__title">
                  ลองวิเคราะห์ผลกระทบจากสถานการณ์ใกล้ตัว
                </div>
                <div className="edu-taskIntro__desc">
                  อ่านแต่ละสถานการณ์ แล้วลองคิดว่า การเผยแพร่เนื้อหานั้นอาจส่งผลเชิงบวก
                  หรือเชิงลบต่อผู้คนและสังคมอย่างไรบ้าง
                </div>
              </div>

              <div className="edu-grid">
                {SCENARIOS.map((item, index) => (
                  <div key={index} className="edu-card">
                    <div className="edu-card__body">
                      <div className="edu-box__title">
                        <FiUsers /> {item.title}
                      </div>
                      <div className="edu-note" style={{ marginBottom: 12 }}>
                        {item.detail}
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
                <FiSearch />
                <div>
                  เวลาเห็นโพสต์ที่กำลังถูกพูดถึงมาก ลองถามตัวเองว่า
                  เนื้อหานี้อาจทำให้คน “เข้าใจอะไร” และ “รู้สึกอย่างไร”
                  เพราะสองอย่างนี้มักนำไปสู่ผลกระทบทางสังคมโดยตรง
                </div>
              </div>

              <div className="edu-actions">
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

                <button
                  className="edu-btn edu-btn--primary"
                  type="button"
                  onClick={() => {
                    setStep("risk");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  เริ่มประเมินความเสี่ยง <FiChevronRight />
                </button>
              </div>
            </div>
          )}

          {step === "risk" && (
            <div className="edu-taskStage">
              <div className="edu-taskIntro">
                <div className="edu-taskIntro__title">
                  อ่านสถานการณ์ แล้วเลือกการประเมินที่เหมาะสมที่สุด
                </div>
                <div className="edu-taskIntro__desc">
                  แบบฝึกนี้ช่วยให้คุณมองเห็นความเสี่ยงและผลกระทบที่อาจเกิดขึ้น
                  ก่อนตัดสินใจเผยแพร่หรือแชร์เนื้อหาออนไลน์
                </div>
                <div className="edu-taskIntro__meta">
                  ตอบแล้ว {Object.keys(answers).length} / {RISK_ITEMS.length}
                </div>
              </div>

              <div className="edu-taskGrid">
                {RISK_ITEMS.map((item) => {
                  const picked = answers[item.id];
                  const isCorrect = submittedRisk && picked === item.answer;
                  const isWrong = submittedRisk && picked && picked !== item.answer;

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

                      {submittedRisk && (
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

              {submittedRisk && (
                <>
                  <div className="edu-result">
                    <div className="edu-result__text">
                      คุณได้ {riskScore} / {RISK_ITEMS.length} คะแนน
                    </div>
                  </div>

                  <div className="edu-hint" style={{ marginTop: 20, marginBottom: 12 }}>
                    <FiShield />
                    <div>
                      การใช้สื่ออย่างรับผิดชอบ คือการคิดถึงผลที่จะเกิดขึ้นหลังจากการแชร์
                      ไม่ว่าจะเป็นผลต่อความเข้าใจของผู้คน ความสัมพันธ์ในสังคม
                      หรือผลดีที่อาจเกิดขึ้นเมื่อข้อมูลที่มีประโยชน์ถูกเผยแพร่อย่างเหมาะสม
                    </div>
                  </div>
                </>
              )}

              <div className="edu-taskFooter">
                <button
                  className="edu-btn edu-btn--back"
                  type="button"
                  onClick={() => {
                    if (submittedRisk) {
                      setSubmittedRisk(false);
                    }
                    setStep("scenario");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  <FiChevronLeft /> กลับไปดูสถานการณ์
                </button>

                <div className="edu-actions">
                  {!submittedRisk && (
                    <button
                      className="edu-btn edu-btn--primary"
                      type="button"
                      disabled={!allRiskAnswered}
                      onClick={() => {
                        setSubmittedRisk(true);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      ส่งคำตอบ <FiChevronRight />
                    </button>
                  )}

                  {submittedRisk && (
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