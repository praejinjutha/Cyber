// src/pages/Unit6/Learn4.jsx
// ✅ Unit 6 - เรื่องที่ 4: การตัดสินใจดูแลสุขภาวะดิจิทัลจากสถานการณ์จริง
// ✅ ใช้เฉพาะ class ที่มีอยู่แล้วใน main.css + learn.css
// ✅ Flow: Practical Framework (Best-Practice) → Interactive Simulation Workshop → Immediate Feedback Learning
// ✅ รองรับข้อ 6 และ 8 อย่างเป็นธรรมชาติ
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
  FiPauseCircle,
  FiClock,
  FiSmile,
  FiUsers,
  FiMoon,
} from "react-icons/fi";

/* ------------------------------------------------------------------ */
/* ✅ PRACTICAL FRAMEWORK (BEST-PRACTICE)
/* ------------------------------------------------------------------ */
const FRAMEWORK_CARDS = [
  {
    icon: <FiPauseCircle />,
    title: "1) หยุดก่อน เมื่อเริ่มรู้สึกไม่โอเค",
    points: [
      "ถ้าเริ่มเครียด หงุดหงิด หรือใช้นานเกินไป อย่าเลื่อนต่อทันที",
      "หยุดสั้น ๆ จะช่วยให้ตัดสินใจได้ดีขึ้นกว่าการใช้อารมณ์นำ",
    ],
    note: "การหยุดไม่ใช่การแพ้ แต่เป็นการดึงตัวเองกลับมาควบคุมสถานการณ์",
  },
  {
    icon: <FiClock />,
    title: "2) เลือกวิธีที่ช่วยให้กลับมาสมดุล",
    points: [
      "พักสายตา ลุกเดิน ดื่มน้ำ หรือเปลี่ยนไปทำกิจกรรมอื่นชั่วคราว",
      "เป้าหมายไม่ใช่ห้ามใช้สื่อทั้งหมด แต่คือไม่ปล่อยให้อารมณ์หรือเวลาไหลต่อ",
    ],
    note: "วิธีที่ดีควรช่วยทั้งเรื่องอารมณ์และเวลา ไม่ใช่ทำให้ใช้ต่อยาวขึ้น",
  },
  {
    icon: <FiUsers />,
    title: "3) เมื่ออยู่กับคนตรงหน้า ให้คนสำคัญกว่าสื่อ",
    points: [
      "ถ้าอยู่กับครอบครัวหรือกำลังทำกิจกรรมร่วมกัน ควรมีส่วนร่วมกับคนรอบตัว",
      "การวางอุปกรณ์ลงชั่วคราว เป็นการให้ความสำคัญกับความสัมพันธ์และช่วงเวลานั้น",
    ],
    note: "การใช้เทคโนโลยีอย่างเหมาะสม ไม่ได้แปลว่าต้องใช้ตลอดเวลา",
  },
  {
    icon: <FiSmile />,
    title: "4) เลือกสิ่งที่ทำให้ดีขึ้นจริง",
    points: [
      "บางอย่างดูเหมือนช่วยคลายเครียด แต่จริง ๆ อาจยิ่งทำให้เครียดหรือเหนื่อยกว่าเดิม",
      "การตัดสินใจที่ดีควรช่วยให้ใจสงบขึ้น และไม่ทำให้ชีวิตเสียสมดุลเพิ่ม",
    ],
    note: "ถามตัวเองง่าย ๆ ว่า สิ่งที่กำลังจะทำ ช่วยให้ดีขึ้นจริง หรือแค่ยืดปัญหาออกไป",
  },
];

/* ------------------------------------------------------------------ */
/* ✅ INTERACTIVE SIMULATION WORKSHOP
/* ------------------------------------------------------------------ */
const SIMULATION_CASES = [
  {
    id: "s1",
    title: "สถานการณ์ที่ 1 : เครียดจากการใช้สื่อ",
    scenario:
      "มินใช้สื่อสังคมออนไลน์ต่อเนื่องมาหลายชั่วโมง เริ่มรู้สึกเครียด หงุดหงิด และใจไม่ค่อยนิ่ง แต่ก็ยังคิดว่าจะเลื่อนดูต่ออีกสักพักเพื่อให้ลืมความเครียด",
    answer: "B",
    choices: [
      { id: "A", label: "ใช้สื่อต่อไปเพื่อให้ลืมความเครียด" },
      { id: "B", label: "หยุดใช้สื่อชั่วคราว พักสายตา แล้วเปลี่ยนไปทำกิจกรรมผ่อนคลายอื่น" },
      { id: "C", label: "เพิ่มเวลาใช้งานอีก เพราะใกล้จะหายเครียดแล้ว" },
      { id: "D", label: "ใช้สื่อต่อไปจนถึงก่อนนอน" },
    ],
    reason:
      "เมื่อเริ่มเครียดหรือหงุดหงิดจากสื่อ การหยุดใช้ชั่วคราวและพักจากหน้าจอเป็นทางเลือกที่เหมาะสมกว่า เพราะช่วยตัดวงจรอารมณ์และไม่ทำให้เวลาใช้งานยาวออกไป",
    bestPractice: [
      "สังเกตตัวเองว่าเริ่มไม่โอเคแล้ว",
      "หยุด ไม่ใช้อารมณ์ตัดสินใจ",
      "เปลี่ยนไปทำสิ่งที่ช่วยให้ใจและร่างกายผ่อนลงจริง",
    ],
  },
  {
    id: "s2",
    title: "สถานการณ์ที่ 2 : อยู่กับครอบครัวแต่มีสื่อเข้ามาแทรก",
    scenario:
      "ระหว่างรับประทานอาหารและคุยกับครอบครัว เจนได้รับข้อความและการแจ้งเตือนจากโทรศัพท์หลายครั้ง จนอยากหยิบมือถือขึ้นมาตอบทันที แม้กำลังอยู่ในกิจกรรมร่วมกับคนในบ้าน",
    answer: "C",
    choices: [
      { id: "A", label: "ใช้มือถือไปด้วย คุยกับครอบครัวไปด้วย" },
      { id: "B", label: "เปิดดูเฉพาะโซเชียลมีเดียระหว่างกิจกรรม" },
      { id: "C", label: "วางอุปกรณ์ไว้ก่อน และมีส่วนร่วมกับกิจกรรมของครอบครัวให้เต็มที่" },
      { id: "D", label: "เล่นเกมหรือเช็กโทรศัพท์ระหว่างกิจกรรมเป็นช่วง ๆ" },
    ],
    reason:
      "เมื่อกำลังทำกิจกรรมกับครอบครัว การวางอุปกรณ์ลงและอยู่กับคนตรงหน้าคือทางเลือกที่เหมาะสมที่สุด เพราะช่วยรักษาความสัมพันธ์และลดการถูกรบกวนจากสื่อ",
    bestPractice: [
      "ให้ความสำคัญกับคนตรงหน้า",
      "ไม่ปล่อยให้การแจ้งเตือนแทรกทุกช่วงเวลา",
      "เลือกใช้เทคโนโลยีอย่างเหมาะกับบริบท",
    ],
  },
  {
    id: "s3",
    title: "สถานการณ์ที่ 3 : ก่อนนอนแต่ยังอารมณ์ค้าง",
    scenario:
      "หลังจากเห็นโพสต์ที่ทำให้รู้สึกไม่ดี โต้งยังคิดถึงเรื่องนั้นอยู่ และอยากใช้สื่อต่อก่อนนอนเพื่อระบายอารมณ์ แม้จะเริ่มง่วงและรู้ว่าพรุ่งนี้ต้องตื่นเช้า",
    answer: "B",
    choices: [
      { id: "A", label: "ใช้สื่อต่อเพื่อระบายอารมณ์ให้สุดก่อนนอน" },
      { id: "B", label: "หยุดใช้สื่อ แล้วเปลี่ยนไปทำกิจกรรมที่ช่วยให้สงบลงก่อนพักผ่อน" },
      { id: "C", label: "เปิดดูคอนเทนต์ต่อไปเรื่อย ๆ จนกว่าจะง่วงมาก" },
      { id: "D", label: "ฝืนใช้สื่อต่อเพราะเดี๋ยวอารมณ์จะค้าง" },
    ],
    reason:
      "ช่วงก่อนนอนเป็นช่วงที่ควรลดการใช้งานสื่อ โดยเฉพาะเมื่ออารมณ์ยังไม่ดี การหยุดใช้และเปลี่ยนไปทำกิจกรรมผ่อนคลายช่วยทั้งเรื่องอารมณ์และการพักผ่อน",
    bestPractice: [
      "ไม่ต่อเวลาใช้งานเพราะอารมณ์พาไป",
      "เลือกกิจกรรมที่ทำให้ใจค่อย ๆ สงบ",
      "ปกป้องเวลาพักผ่อนของตัวเอง",
    ],
  },
];

/* ------------------------------------------------------------------ */
/* ✅ REFLECTION AFTER DECISION
/* ------------------------------------------------------------------ */
const REFLECTION_ITEMS = [
  {
    id: "r1",
    text: "เมื่อฉันเริ่มเครียดจากสื่อ ฉันพอรู้ตัวได้ว่าควรหยุดก่อน",
  },
  {
    id: "r2",
    text: "ฉันสามารถเลือกวิธีผ่อนคลายที่ไม่ทำให้ใช้สื่อต่อไปเรื่อย ๆ",
  },
  {
    id: "r3",
    text: "เมื่ออยู่กับครอบครัวหรือคนรอบตัว ฉันรู้ว่าควรวางอุปกรณ์ลงในเวลาที่เหมาะสม",
  },
];

const SCALE_CHOICES = [
  { id: 1, label: "ยังไม่ค่อยใช่" },
  { id: 2, label: "พอได้บ้าง" },
  { id: 3, label: "ค่อนข้างใช่" },
];

/* ------------------------------------------------------------------ */

export default function Learn4Unit6() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");
  const [step, setStep] = useState("framework");

  const [answers, setAnswers] = useState({});
  const [submittedSim, setSubmittedSim] = useState(false);

  const [reflectAnswers, setReflectAnswers] = useState({});
  const [submittedReflect, setSubmittedReflect] = useState(false);

  const chooseAnswer = (itemId, choiceId) => {
    setAnswers((prev) => ({ ...prev, [itemId]: choiceId }));
    if (submittedSim) setSubmittedSim(false);
  };

  const chooseReflect = (itemId, score) => {
    setReflectAnswers((prev) => ({ ...prev, [itemId]: score }));
    if (submittedReflect) setSubmittedReflect(false);
  };

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const allAnswered = useMemo(
    () => Object.keys(answers).length === SIMULATION_CASES.length,
    [answers]
  );

  const simScore = useMemo(() => {
    let total = 0;
    for (const item of SIMULATION_CASES) {
      if (answers[item.id] === item.answer) total += 1;
    }
    return total;
  }, [answers]);

  const allReflectAnswered = useMemo(
    () => Object.keys(reflectAnswers).length === REFLECTION_ITEMS.length,
    [reflectAnswers]
  );

  const reflectResult = useMemo(() => {
    if (!submittedReflect) return null;

    const total =
      (reflectAnswers.r1 || 0) +
      (reflectAnswers.r2 || 0) +
      (reflectAnswers.r3 || 0);

    if (total >= 8) {
      return {
        title: "คุณเริ่มมีแนวคิดที่ดีในการดูแลสุขภาวะดิจิทัล",
        badgeClass: "edu-badge edu-badge--ok",
        badgeText: "พร้อมนำไปใช้",
        icon: <FiCheckCircle />,
        message:
          "คุณมองเห็นแล้วว่าเมื่ออารมณ์เริ่มไม่ดีหรือเมื่อมีคนสำคัญอยู่ตรงหน้า เราควรตัดสินใจอย่างไรให้เหมาะสมกับชีวิตจริง",
        tips: [
          "ถ้าเริ่มเครียดจากสื่อ ให้หยุดก่อนแล้วค่อยเลือกว่าจะทำอะไรต่อ",
          "ถ้ากำลังอยู่กับครอบครัวหรือคนรอบตัว ให้ตั้งใจอยู่กับช่วงเวลานั้น",
          "ตัดสินใจโดยดูว่าอะไรช่วยให้ดีขึ้นจริง ไม่ใช่แค่ทำต่อเพราะความเคยชิน",
        ],
      };
    }

    if (total >= 5) {
      return {
        title: "คุณเริ่มคิดได้ถูกทาง แต่ยังต้องฝึกใช้ในชีวิตจริง",
        badgeClass: "edu-badge edu-badge--yellow",
        badgeText: "ฝึกต่อได้",
        icon: <FiAlertTriangle />,
        message:
          "คุณเข้าใจหลักบางส่วนแล้ว แต่เวลาอยู่ในสถานการณ์จริงอาจยังเผลอใช้อารมณ์หรือปล่อยให้สื่อแทรกช่วงเวลาสำคัญได้ง่าย",
        tips: [
          "ลองฝึกหยุดสั้น ๆ ก่อนตัดสินใจทุกครั้งที่เริ่มหงุดหงิด",
          "ตั้งใจวางอุปกรณ์ลงในช่วงที่กำลังอยู่กับครอบครัวหรือคนสำคัญ",
          "ฝึกเลือกกิจกรรมผ่อนคลายอื่นแทนการเลื่อนต่อไปเรื่อย ๆ",
        ],
      };
    }

    return {
      title: "ยังควรฝึกการตัดสินใจเพื่อดูแลตัวเองให้มากขึ้น",
      badgeClass: "edu-badge edu-badge--lock",
      badgeText: "ควรทบทวน",
      icon: <FiAlertTriangle />,
      message:
        "ตอนนี้คุณอาจยังไม่ค่อยมั่นใจว่าจะจัดการอารมณ์หรือการใช้สื่ออย่างไรในสถานการณ์จริง ลองเริ่มจากการสังเกตตัวเองและฝึกหยุดก่อนตอบสนอง",
      tips: [
        "เริ่มจากสังเกตว่าเมื่อไรที่สื่อทำให้อารมณ์แย่ลง",
        "ถ้าอยู่กับคนรอบตัว ลองวางมือถือไว้ก่อนช่วงสั้น ๆ",
        "จำไว้ว่าการหยุดใช้ชั่วคราวเป็นทักษะ ไม่ใช่ความล้มเหลว",
      ],
    };
  }, [reflectAnswers, submittedReflect]);

  const panelTitle = useMemo(() => {
    if (step === "framework") return "หลักคิดก่อนตัดสินใจในชีวิตจริง";
    if (step === "simulation") return "ลองตัดสินใจจากสถานการณ์จำลอง";
    return "สะท้อนผลจากการตัดสินใจของตนเอง";
  }, [step]);

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
                  เรื่องที่ 4 : การตัดสินใจดูแลสุขภาวะดิจิทัลจากสถานการณ์จริง
                </div>

                <div className="edu-lessons__toolbar">
                  <button
                    className="edu-btn edu-btn--back"
                    type="button"
                    onClick={() => {
                      if (step === "reflect") {
                        setStep("simulation");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        return;
                      }
                      if (step === "simulation") {
                        setStep("framework");
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
              {panelTitle}
            </div>
          </div>

          {step === "framework" && (
            <div className="edu-taskStage">
              <div className="edu-taskIntro">
                <div className="edu-taskIntro__title">
                  ก่อนตัดสินใจ ลองมีหลักคิดง่าย ๆ ติดตัวไว้
                </div>
                <div className="edu-taskIntro__desc">
                  ในชีวิตจริง เราไม่ได้ต้องการแค่ “รู้ว่าควรทำอะไร”
                  แต่ต้องตัดสินใจให้ได้ในจังหวะที่กำลังเครียด กำลังเผลอ
                  หรือกำลังถูกสื่อดึงความสนใจไปจากสิ่งสำคัญ
                </div>
              </div>

              <div className="edu-grid">
                {FRAMEWORK_CARDS.map((item, index) => (
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
                <div
                  className="edu-card edu-adaptiveBlock"
                  style={{ marginBottom: "24px" }}
                >
                  <div className="edu-adaptiveBlock__head">
                    <div>
                      <div className="edu-adaptiveBlock__title">Best-Practice ที่ควรจำ</div>
                      <div className="edu-adaptiveBlock__sub">
                        ตัดสินใจโดยดูว่าอะไรช่วยให้ดีขึ้นจริง ทั้งด้านอารมณ์ เวลา และความสัมพันธ์
                      </div>
                    </div>
                  </div>

                  <div className="edu-pathList">
                    <div className="edu-pathRow">
                      <div className="edu-pathRow__step">1</div>
                      <div>
                        <div className="edu-pathRow__title">เมื่อเครียดจากสื่อ</div>
                        <div className="edu-pathRow__desc">
                          หยุดก่อน แล้วพักจากหน้าจอชั่วคราว
                        </div>
                      </div>
                      <div className="edu-pathRow__arrow">
                        <FiChevronRight />
                      </div>
                    </div>

                    <div className="edu-pathRow">
                      <div className="edu-pathRow__step">2</div>
                      <div>
                        <div className="edu-pathRow__title">เมื่ออารมณ์เริ่มพาไป</div>
                        <div className="edu-pathRow__desc">
                          อย่าใช้อารมณ์ตัดสินใจว่าจะใช้สื่อต่อ
                        </div>
                      </div>
                      <div className="edu-pathRow__arrow">
                        <FiChevronRight />
                      </div>
                    </div>

                    <div className="edu-pathRow">
                      <div className="edu-pathRow__step">3</div>
                      <div>
                        <div className="edu-pathRow__title">เมื่ออยู่กับครอบครัวหรือคนสำคัญ</div>
                        <div className="edu-pathRow__desc">
                          วางอุปกรณ์ลงและให้ความสำคัญกับคนตรงหน้า
                        </div>
                      </div>
                      <div className="edu-pathRow__arrow">
                        <FiChevronRight />
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="edu-card edu-adaptiveBlock"
                  style={{ marginBottom: "24px" }}
                >
                  <div className="edu-adaptiveBlock__head">
                    <div>
                      <div className="edu-adaptiveBlock__title">เป้าหมายของกิจกรรมถัดไป</div>
                      <div className="edu-adaptiveBlock__sub">
                        คุณจะได้ลองเลือกทางออกจากสถานการณ์จริง และดูผลของการตัดสินใจแต่ละแบบ
                      </div>
                    </div>
                  </div>

                  <div className="edu-box">
                    <div className="edu-box__title">
                      <FiCheckCircle /> สิ่งที่ควรสังเกตเวลาตอบ
                    </div>
                    <ul className="edu-list">
                      <li>ทางเลือกนั้นช่วยให้อารมณ์ดีขึ้นจริงไหม</li>
                      <li>ทางเลือกนั้นทำให้เวลาใช้งานยาวขึ้นหรือสั้นลง</li>
                      <li>ทางเลือกนั้นเหมาะกับบริหน่วย เช่น ตอนอยู่กับครอบครัวหรือไม่</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="edu-actions" style={{ marginTop: "24px" }}>
                <button
                  className="edu-btn edu-btn--back"
                  type="button"
                  onClick={() => navigate("/unit6/learn3", { replace: true })}
                >
                  <FiChevronLeft /> กลับไปเรื่องก่อนหน้า
                </button>

                <button
                  className="edu-btn edu-btn--primary"
                  type="button"
                  onClick={() => {
                    setStep("simulation");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  เริ่มสถานการณ์จำลอง <FiChevronRight />
                </button>
              </div>
            </div>
          )}

          {step === "simulation" && (
            <div className="edu-taskStage">
              <div className="edu-taskIntro">
                <div className="edu-taskIntro__title">
                  ลองตัดสินใจจากสถานการณ์จำลอง
                </div>
                <div className="edu-taskIntro__desc">
                  อ่านสถานการณ์แต่ละข้อ แล้วเลือกแนวทางที่เหมาะสมที่สุด
                  โดยคิดทั้งเรื่องอารมณ์ เวลา และบริบทของสถานการณ์
                </div>
                <div className="edu-taskIntro__meta">
                  ตอบแล้ว {answeredCount} / {SIMULATION_CASES.length}
                </div>
              </div>

              <div className="edu-taskGrid">
                {SIMULATION_CASES.map((item) => {
                  const picked = answers[item.id];
                  const isCorrect = submittedSim && picked === item.answer;
                  const isWrong = submittedSim && picked && picked !== item.answer;

                  return (
                    <div key={item.id} className="edu-taskCard">
                      <div className="edu-taskCard__body">
                        <div className="edu-box__title" style={{ marginBottom: "8px" }}>
                          {item.title}
                        </div>
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

                      {submittedSim && (
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
                                  ? "เหมาะสมที่สุด"
                                  : isWrong
                                  ? "ยังไม่ใช่ทางเลือกที่เหมาะที่สุด"
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

                      {submittedSim && picked && (
                        <div className="edu-box" style={{ marginTop: "12px" }}>
                          <div className="edu-box__title">Best-Practice ของสถานการณ์นี้</div>
                          <ul className="edu-list">
                            {item.bestPractice.map((tip, idx) => (
                              <li key={idx}>{tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {submittedSim && (
                <div className="edu-result">
                  <div className="edu-result__text">
                    คุณตัดสินใจเหมาะสม {simScore} / {SIMULATION_CASES.length} สถานการณ์
                  </div>
                </div>
              )}

              {submittedSim && simScore >= 2 && (
                <div className="edu-feedback">
                  <div className="edu-feedback__ok">
                    <FiCheckCircle />
                    <div>
                      คุณเริ่มมองเห็นแล้วว่า การดูแลสุขภาวะดิจิทัลไม่ใช่แค่ลดเวลา
                      แต่คือการเลือกสิ่งที่เหมาะกับอารมณ์ ช่วงเวลา และคนรอบตัว
                    </div>
                  </div>
                </div>
              )}

              {submittedSim && simScore <= 1 && (
                <div className="edu-lockNotice">
                  <FiAlertTriangle />
                  ลองย้อนดูหลักคิดก่อนตัดสินใจอีกครั้ง โดยเฉพาะเรื่องการหยุดก่อน
                  และการเลือกสิ่งที่ช่วยให้สมดุลขึ้นจริง
                </div>
              )}

              <div className="edu-taskFooter">
                <button
                  className="edu-btn edu-btn--back"
                  type="button"
                  onClick={() => {
                    setStep("framework");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  <FiChevronLeft /> กลับไปดูหลักคิด
                </button>

                <div className="edu-actions">
                  <button
                    className="edu-btn edu-btn--primary"
                    type="button"
                    disabled={!allAnswered}
                    onClick={() => {
                      setSubmittedSim(true);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    ส่งคำตอบ <FiChevronRight />
                  </button>

                  {submittedSim && (
                    <button
                      className="edu-btn edu-btn--ghost"
                      type="button"
                      onClick={() => {
                        setStep("reflect");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      สะท้อนผลการตัดสินใจ <FiChevronRight />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === "reflect" && (
            <div className="edu-taskStage">
              <div className="edu-taskIntro">
                <div className="edu-taskIntro__title">
                  ลองสะท้อนว่าเราพร้อมนำไปใช้แค่ไหน
                </div>
                <div className="edu-taskIntro__desc">
                  เลือกคำตอบตามความเป็นจริงของตัวเอง เพื่อดูว่าคุณพร้อมใช้ทักษะนี้ในชีวิตประจำวันมากน้อยแค่ไหน
                </div>
                <div className="edu-taskIntro__meta">
                  1 = ยังไม่ค่อยใช่, 2 = พอได้บ้าง, 3 = ค่อนข้างใช่
                </div>
              </div>

              <div className="edu-taskGrid">
                {REFLECTION_ITEMS.map((item) => (
                  <div key={item.id} className="edu-taskCard">
                    <div className="edu-taskCard__body">
                      <div className="edu-taskCard__label">{item.text}</div>
                    </div>

                    <div className="edu-taskCard__actions">
                      {SCALE_CHOICES.map((scale) => (
                        <button
                          key={scale.id}
                          type="button"
                          className={`edu-pill ${
                            reflectAnswers[item.id] === scale.id ? "is-active" : ""
                          }`}
                          onClick={() => chooseReflect(item.id, scale.id)}
                        >
                          {scale.id} - {scale.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {submittedReflect && reflectResult && (
                <div className="edu-box"style={{ marginTop: "32px" }}>
                  <div className="edu-feedbackCard__head">
                    <div className="edu-box__title">
                      {reflectResult.icon} {reflectResult.title}
                    </div>
                    <div className="edu-feedbackCard__status">
                      <span className={reflectResult.badgeClass}>{reflectResult.badgeText}</span>
                    </div>
                  </div>

                  <div className="edu-note">{reflectResult.message}</div>

                  <div className="edu-box" style={{ marginTop: "2px" }}>
                    <div className="edu-box__title">แนวทางที่นำไปใช้ได้จริง</div>
                    <ul className="edu-list">
                      {reflectResult.tips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
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
                    setStep("simulation");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  <FiChevronLeft /> กลับไปสถานการณ์จำลอง
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
                    ดูผลสะท้อน <FiChevronRight />
                  </button>

                  {submittedReflect && (
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