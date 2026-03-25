// src/pages/Unit6/Learn2.jsx
// ✅ Unit 6 - เรื่องที่ 2: การจัดสรรเวลาและลำดับความสำคัญในชีวิตประจำวัน
// ✅ ใช้เฉพาะ class ที่มีอยู่แล้วใน main.css + learn.css
// ✅ Flow: Scenario-based Learning (Cognitive Linking) → Interactive Simulation Workshop → Immediate Feedback Learning
// ✅ เหมาะสำหรับผู้เรียนช่วงอายุ 15-18 ปี
// ✅ เน้นการตัดสินใจจัดเวลาใช้สื่อให้สอดคล้องกับกิจกรรมประจำวัน และการปรับแผนเมื่อมีงานเร่งด่วน

import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  FiClock,
  FiTarget,
  FiBookOpen,
  FiCalendar,
} from "react-icons/fi";

/* ------------------------------------------------------------------ */
/* ✅ SCENARIO INTRODUCTION
/* ------------------------------------------------------------------ */
const SCENARIO_INTRO = {
  title: "ชวนคิด: เมื่อหลายอย่างเกิดขึ้นพร้อมกัน",
  description:
    "ในชีวิตประจำวัน เรามักใช้สื่อควบคู่ไปกับการเรียน การพักผ่อน งานบ้าน หรือการทำกิจกรรมส่วนตัว บางครั้งสื่อช่วยให้ทำงานได้สะดวกขึ้น แต่บางครั้งก็แย่งเวลาไปจากสิ่งที่ควรทำก่อน การจัดสรรเวลาที่ดีจึงไม่ใช่แค่ลดเวลาใช้สื่อ แต่คือการรู้ว่าเวลาไหนควรใช้ เวลาไหนควรหยุด และเมื่อมีเรื่องเร่งด่วนเข้ามา เราจะปรับแผนอย่างไรให้เหมาะสม",
  focus:
    "เป้าหมายของบทเรียนนี้คือ ฝึกคิดเชื่อมโยงระหว่าง “กิจกรรมที่ต้องทำ” กับ “การใช้สื่อ” เพื่อเลือกสิ่งที่ควรทำก่อนอย่างมีเหตุผล",
};

/* ------------------------------------------------------------------ */
/* ✅ MICRO CONTENT FOR COGNITIVE LINKING
/* ------------------------------------------------------------------ */
const MICRO_LESSON = [
  {
    icon: <FiCalendar />,
    title: "จัดเวลาให้สอดคล้องกับกิจกรรมหลักของวัน",
    points: [
      "แต่ละช่วงเวลาของวันมีหน้าที่ต่างกัน เช่น เวลาเรียน เวลาทำงาน เวลาพัก และเวลาส่วนตัว",
      "การใช้สื่อควรสอดคล้องกับหน้าที่ของช่วงเวลานั้น เช่น ใช้ค้นข้อมูลตอนทำงาน หรือใช้เพื่อพักผ่อนหลังเสร็จภารกิจสำคัญ",
      "เมื่อรู้ว่าช่วงไหนเป็นเวลาของอะไร จะช่วยให้ตัดสินใจได้ง่ายขึ้นว่าควรใช้สื่อหรือควรพักการใช้ไว้ก่อน",
    ],
    note:
      "คำถามสำคัญคือ ตอนนี้เป็นเวลาของกิจกรรมหลักอะไร และสื่อมีบทบาทช่วยหรือรบกวนกิจกรรมนั้น",
  },
  {
    icon: <FiTarget />,
    title: "แยกให้ออกว่าอะไรสำคัญ อะไรเร่งด่วน",
    points: [
      "บางกิจกรรมสำคัญเพราะมีผลต่อการเรียนหรือความรับผิดชอบ เช่น ส่งงาน เตรียมสอบ หรือนัดหมายสำคัญ",
      "บางกิจกรรมเร่งด่วนเพราะต้องทำทันที เช่น ครูส่งข้อความให้แก้งานวันนี้ หรือมีงานบ้านที่ผู้ปกครองมอบหมายตอนนี้",
      "การจัดลำดับที่ดีคือมองทั้งความสำคัญและความเร่งด่วน ไม่ใช่เลือกตามความอยากในขณะนั้น",
    ],
    note:
      "สิ่งที่อยากทำทันที ไม่ได้แปลว่าเป็นสิ่งที่ควรทำก่อนเสมอไป",
  },
  {
    icon: <FiClock />,
    title: "ใช้สื่ออย่างมีขอบเขตเมื่อมีภารกิจรออยู่",
    points: [
      "เมื่อยังมีงานสำคัญค้างอยู่ การใช้สื่อเพื่อความบันเทิงควรถูกจำกัดเวลาให้ชัดเจน",
      "ถ้าปล่อยให้ใช้ต่อเนื่องโดยไม่มีขอบเขต อาจทำให้เวลาสำหรับงานหลักลดลงโดยไม่รู้ตัว",
      "การกำหนดล่วงหน้าว่าจะใช้เมื่อไร นานแค่ไหน และใช้หลังทำอะไรเสร็จ ช่วยให้บริหารเวลาได้ดีขึ้น",
    ],
    note:
      "การใช้สื่อไม่จำเป็นต้องตัดออกทั้งหมด แต่ควรอยู่ในตำแหน่งที่เหมาะกับแผนของวัน",
  },
  {
    icon: <FiBookOpen />,
    title: "เมื่อมีเรื่องเร่งด่วน ต้องกล้าปรับแผน",
    points: [
      "แผนเดิมอาจเปลี่ยนได้เมื่อมีสถานการณ์ใหม่ เช่น งานด่วน นัดหมายเลื่อน หรือมีเรื่องที่ต้องรับผิดชอบทันที",
      "การปรับแผนไม่ใช่ความล้มเหลว แต่เป็นทักษะสำคัญของการจัดการเวลา",
      "การตัดสินใจที่ดีคือยอมเลื่อนการใช้สื่อบางอย่างออกไป เพื่อรักษาสิ่งที่จำเป็นกว่าก่อน",
    ],
    note:
      "คนที่จัดการเวลาได้ดี ไม่ได้ทำตามแผนเดิมทุกครั้ง แต่รู้ว่าเมื่อไรควรเปลี่ยนแผน",
  },
];

/* ------------------------------------------------------------------ */
/* ✅ INTERACTIVE SIMULATION WORKSHOP
/* ------------------------------------------------------------------ */
const SIMULATION_ITEMS = [
  {
    id: "s1",
    scenario:
      "เวลา 18.30 น. ต้นตั้งใจจะดูคลิปบันเทิงประมาณ 30 นาที แต่จู่ ๆ ครูส่งข้อความแจ้งว่าให้แก้งานและส่งก่อน 21.00 น. วันนี้",
    answer: "B",
    choices: [
      {
        id: "A",
        label: "ดูคลิปต่อก่อน เพราะตั้งใจไว้แล้ว แล้วค่อยทำงานทีหลัง",
      },
      {
        id: "B",
        label: "หยุดแผนเดิมชั่วคราว แล้วเริ่มแก้งานก่อน เพราะมีเส้นตายชัดเจน",
      },
      {
        id: "C",
        label: "เปิดคลิปไปด้วยและแก้งานไปด้วย เพื่อทำสองอย่างพร้อมกัน",
      },
    ],
    reason:
      "งานที่มีเส้นตายภายในคืนนี้เป็นทั้งเรื่องสำคัญและเร่งด่วน จึงควรถูกจัดไว้ก่อนการใช้สื่อเพื่อความบันเทิง",
  },
  {
    id: "s2",
    scenario:
      "เมย์วางแผนอ่านหนังสือสอบตอน 20.00-21.00 น. แต่ก่อนเริ่มอ่าน เธอเห็นเพื่อนส่งลิงก์ไลฟ์สดที่อยากดูมาก และไลฟ์จะจบใน 1 ชั่วโมง",
    answer: "C",
    choices: [
      {
        id: "A",
        label: "ดูไลฟ์สดเต็มก่อน เพราะโอกาสมีครั้งเดียว ส่วนอ่านหนังสือค่อยไว้ทีหลัง",
      },
      {
        id: "B",
        label: "เปิดไลฟ์ค้างไว้เบา ๆ ระหว่างอ่านหนังสือ เพื่อไม่ให้พลาด",
      },
      {
        id: "C",
        label: "ยึดแผนอ่านหนังสือก่อน แล้วค่อยดูสรุปหรือคลิปย้อนหลังถ้ามี",
      },
    ],
    reason:
      "เมื่อตั้งใจไว้แล้วว่าจะใช้เวลานี้กับการอ่านหนังสือ การคงแผนเดิมไว้ช่วยรักษาลำดับความสำคัญของงานหลักได้ดีกว่า",
  },
  {
    id: "s3",
    scenario:
      "ภัทรกลับบ้านมาเหนื่อยและอยากเล่นเกมทันที แต่ยังมีงานบ้านที่รับปากผู้ปกครองไว้ว่าจะช่วยทำก่อน 19.00 น.",
    answer: "A",
    choices: [
      {
        id: "A",
        label: "ทำงานบ้านให้เสร็จก่อน แล้วค่อยใช้เวลาเล่นเกมตามที่เหลือ",
      },
      {
        id: "B",
        label: "เล่นเกมก่อนสักตา เพราะใช้เวลาไม่นาน แล้วค่อยไปทำงานบ้าน",
      },
      {
        id: "C",
        label: "เล่นเกมไปด้วยและทำงานบ้านไปด้วย เพื่อประหยัดเวลา",
      },
    ],
    reason:
      "งานบ้านที่รับผิดชอบไว้เป็นภารกิจที่มีเวลาชัดเจนและเกี่ยวข้องกับหน้าที่ของตน จึงควรทำก่อนกิจกรรมเพื่อความบันเทิง",
  },
  {
    id: "s4",
    scenario:
      "น้ำฝนใช้โทรศัพท์ค้นข้อมูลทำรายงานอยู่ แต่มีแจ้งเตือนจากหลายแอปเข้ามาต่อเนื่อง ทำให้เธอสลับไปตอบแชตและเลื่อนดูโพสต์บ่อยมาก",
    answer: "C",
    choices: [
      {
        id: "A",
        label: "สลับตอบไปเรื่อย ๆ เพราะยังถือว่าใช้โทรศัพท์เรื่องเรียนอยู่",
      },
      {
        id: "B",
        label: "เปิดทุกอย่างไว้เหมือนเดิม เพราะน่าจะจัดการได้",
      },
      {
        id: "C",
        label: "ลดสิ่งรบกวนชั่วคราว เช่น ปิดแจ้งเตือนหรือโฟกัสงานให้เสร็จก่อน",
      },
    ],
    reason:
      "แม้เริ่มจากการใช้สื่อเพื่อการเรียน แต่เมื่อสิ่งรบกวนแทรกเข้ามา การปรับวิธีใช้สื่อให้เหมาะกับงานหลักจะช่วยให้เวลาไม่รั่วไหล",
  },
];

/* ------------------------------------------------------------------ */
/* ✅ PRIORITY PRACTICE
/* ------------------------------------------------------------------ */
const PRIORITY_REFLECT = [
  {
    id: "r1",
    text: "เมื่อมีงานสำคัญเข้ามา ฉันสามารถหยุดการใช้สื่อเพื่อความบันเทิงได้",
  },
  {
    id: "r2",
    text: "ฉันมักคิดก่อนว่า ตอนนี้อะไรควรทำก่อน อะไรทำทีหลังได้",
  },
  {
    id: "r3",
    text: "เมื่อใช้สื่อระหว่างทำงานหรืออ่านหนังสือ ฉันรู้วิธีลดสิ่งรบกวนของตัวเอง",
  },
  {
    id: "r4",
    text: "ถ้าแผนเดิมเปลี่ยนเพราะมีเรื่องเร่งด่วน ฉันปรับตารางใหม่ได้โดยไม่เสียเป้าหมายหลัก",
  },
];

const SCALE_CHOICES = [
  { id: 1, label: "น้อยมาก" },
  { id: 2, label: "น้อย" },
  { id: 3, label: "ปานกลาง" },
  { id: 4, label: "มาก" },
  { id: 5, label: "มากที่สุด" },
];

export default function Learn2Unit6() {
  const navigate = useNavigate();
  const location = useLocation();

  const mode = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    return sp.get("mode") || "all";
  }, [location.search]);

  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");
  const [step, setStep] = useState("scenario");

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

  const allCheckAnswered = useMemo(() => {
    return Object.keys(answers).length === SIMULATION_ITEMS.length;
  }, [answers]);

  const checkScore = useMemo(() => {
    let total = 0;
    for (const item of SIMULATION_ITEMS) {
      if (answers[item.id] === item.answer) total += 1;
    }
    return total;
  }, [answers]);

  const allReflectAnswered = useMemo(() => {
    return Object.keys(reflectAnswers).length === PRIORITY_REFLECT.length;
  }, [reflectAnswers]);

  const reflectSummary = useMemo(() => {
    if (!submittedReflect) return "";

    const r1 = reflectAnswers.r1 || 0;
    const r2 = reflectAnswers.r2 || 0;
    const r3 = reflectAnswers.r3 || 0;
    const r4 = reflectAnswers.r4 || 0;

    const control = r1 + r3;
    const planning = r2 + r4;

    if (control >= 8 && planning >= 8) {
      return "ผลประเมินสะท้อนว่าคุณมีแนวโน้มจัดลำดับความสำคัญและปรับแผนการใช้สื่อได้ค่อนข้างดี เมื่อมีงานสำคัญหรือเรื่องเร่งด่วนเข้ามา คุณน่าจะตัดสินใจได้อย่างมีเหตุผล";
    }

    if (control <= 5 || planning <= 5) {
      return "ผลประเมินสะท้อนว่าคุณอาจยังเผลอให้สื่อแทรกเข้ามาในช่วงที่ควรโฟกัสกับงานหลัก หรือยังไม่ค่อยมั่นใจเวลาแผนเปลี่ยนกะทันหัน จุดที่ควรฝึกคือการหยุดสิ่งที่อยากทำชั่วคราว เพื่อรักษาสิ่งที่จำเป็นกว่าก่อน";
    }

    return "ผลประเมินอยู่ในระดับกลาง แปลว่าคุณเริ่มมีทักษะในการจัดเวลาและเลือกสิ่งที่ควรทำก่อนแล้ว แต่ยังควรฝึกการกำหนดขอบเขตเวลาใช้สื่อและการปรับแผนเมื่อมีเรื่องด่วนเข้ามา";
  }, [reflectAnswers, submittedReflect]);

  const panelTitle = useMemo(() => {
    if (step === "scenario") return "เริ่มต้นคิดจากสถานการณ์ใกล้ตัว";
    if (step === "lesson") return "หลักคิดในการจัดเวลาและเลือกสิ่งสำคัญ";
    if (step === "check") return "ฝึกตัดสินใจจากสถานการณ์จำลอง";
    return "สรุปผลและสะท้อนการเรียนรู้";
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
        setStudentName(
          `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim()
        );
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
<div className="edu-hero__sub">เรื่องที่ 2	การจัดสรรเวลาและลำดับความสำคัญในชีวิตประจำวัน
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
                        setStep("scenario");
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

          {step === "scenario" && (
            <div className="edu-taskStage">
              <div className="edu-taskIntro">
                <div className="edu-taskIntro__title">
                  {SCENARIO_INTRO.title}
                </div>
                <div className="edu-taskIntro__desc">
                  {SCENARIO_INTRO.description}
                </div>
              </div>

              <div className="edu-card">
                <div className="edu-card__body">
                  <div className="edu-box">
                    <div className="edu-box__title">
                      <FiTarget /> จุดมุ่งหมายของบทเรียนนี้
                    </div>
                    <div className="edu-note">{SCENARIO_INTRO.focus}</div>
                  </div>
                </div>
              </div>

              <div className="edu-hint" style={{ marginTop: "12px", marginBottom: "12px" }}>
                <FiCheckCircle />
                <div>
                  ระหว่างเรียน ลองคิดถึงชีวิตจริงของตัวเอง เช่น ช่วงหลังเลิกเรียน
                  ช่วงทำการบ้าน หรือเวลาที่มีทั้งงานและสิ่งบันเทิงเข้ามาพร้อมกัน
                </div>
              </div>

              <div className="edu-actions">
                <button
                  className="edu-btn edu-btn--primary"
                  type="button"
                  onClick={() => {
                    setStep("lesson");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  เริ่มเรียนรู้ <FiChevronRight />
                </button>
              </div>
            </div>
          )}

          {step === "lesson" && (
            <div className="edu-taskStage">
              <div className="edu-taskIntro">
                <div className="edu-taskIntro__title">
                  หลักคิดก่อนลงมือจัดเวลา
                </div>
                <div className="edu-taskIntro__desc">
                  ส่วนนี้ช่วยให้คุณเชื่อมโยงการใช้สื่อเข้ากับตารางชีวิตจริง
                  เพื่อเตรียมตัวก่อนทำกิจกรรมสถานการณ์จำลอง
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

              <div className="edu-hint"style={{ marginTop: "12px", marginBottom: "12px" }}>
                <FiClock />
                <div>
                  ก่อนทำกิจกรรม ลองถามตัวเองว่า
                  ถ้าวันนี้มีทั้งงานที่ต้องรับผิดชอบและสิ่งที่อยากทำพร้อมกัน
                  คุณจะตัดสินใจเรียงลำดับอย่างไร
                </div>
              </div>

              <div className="edu-actions">
                <button
                  className="edu-btn edu-btn--back"
                  type="button"
                  onClick={() => {
                    setStep("scenario");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  <FiChevronLeft /> กลับ
                </button>

                <button
                  className="edu-btn edu-btn--primary"
                  type="button"
                  onClick={() => {
                    setStep("check");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  เข้าสู่สถานการณ์จำลอง <FiChevronRight />
                </button>
              </div>
            </div>
          )}

          {step === "check" && (
            <div className="edu-taskStage">
              <div className="edu-taskIntro">
                <div className="edu-taskIntro__title">
                  กิจกรรม: เลือกแผนที่เหมาะสมในแต่ละสถานการณ์
                </div>
                <div className="edu-taskIntro__desc">
                  อ่านสถานการณ์ แล้วเลือกทางเลือกที่เหมาะสมที่สุด
                  โดยคิดจากลำดับความสำคัญของกิจกรรมและการใช้สื่อในชีวิตประจำวัน
                </div>
                <div className="edu-taskIntro__meta">
                  ตอบแล้ว {Object.keys(answers).length} /{" "}
                  {SIMULATION_ITEMS.length}
                </div>
              </div>

              <div className="edu-taskGrid">
                {SIMULATION_ITEMS.map((item) => {
                  const picked = answers[item.id];
                  const isCorrect = submittedCheck && picked === item.answer;
                  const isWrong =
                    submittedCheck && picked && picked !== item.answer;

                  return (
                    <div key={item.id} className="edu-taskCard">
                      <div className="edu-taskCard__body">
                        <div className="edu-taskCard__label">
                          {item.scenario}
                        </div>
                      </div>

                      <div className="edu-taskCard__actions">
                        {item.choices.map((choice) => (
                          <button
                            key={choice.id}
                            type="button"
                            className={`edu-pill ${
                              picked === choice.id ? "is-active" : ""
                            }`}
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
                                  ? "เหมาะสม"
                                  : isWrong
                                  ? `ยังไม่ตรง (เฉลย: ${item.answer})`
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
                    คุณได้ {checkScore} / {SIMULATION_ITEMS.length} คะแนน
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
                  <FiChevronLeft /> กลับไปดูหลักคิด
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
                      ดูผลสะท้อนตนเอง <FiChevronRight />
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
                  ประเมินตนเอง: การจัดเวลาและลำดับความสำคัญของฉัน
                </div>
                <div className="edu-taskIntro__desc">
                  ให้คะแนนตามประสบการณ์จริงของตนเอง
                  เพื่อดูว่าคุณพร้อมแค่ไหนในการจัดการเวลาใช้สื่อร่วมกับภารกิจในชีวิตประจำวัน
                </div>
                <div className="edu-taskIntro__meta">
                  1 = น้อยมาก, 2 = น้อย, 3 = ปานกลาง, 4 = มาก, 5 = มากที่สุด
                </div>
              </div>

              <div className="edu-taskGrid">
                {PRIORITY_REFLECT.map((item) => (
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
                            reflectAnswers[item.id] === scale.id
                              ? "is-active"
                              : ""
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

              {submittedReflect && (
                <div className="edu-feedback">
                  <div className="edu-feedback__ok">
                    <FiCheckCircle />
                    <div>{reflectSummary}</div>
                  </div>
                </div>
              )}

              {submittedReflect && (
                <div className="edu-box">
                  <div className="edu-box__title">
                    แนวทางนำไปใช้ในชีวิตประจำวัน
                  </div>
                  <ul className="edu-list">
                    <li>
                      ก่อนใช้สื่อ ให้ดูว่าตอนนี้มีภารกิจหลักอะไรที่ต้องทำก่อนหรือไม่
                    </li>
                    <li>
                      ถ้ามีงานสำคัญหรือมีเวลาจำกัด
                      ให้จัดงานนั้นไว้ก่อนกิจกรรมเพื่อความบันเทิง
                    </li>
                    <li>
                      เมื่อใช้สื่อเพื่อเรียนหรือทำงาน ลองลดสิ่งรบกวน เช่น
                      ปิดแจ้งเตือนที่ไม่จำเป็น
                    </li>
                    <li>
                      ถ้ามีเรื่องเร่งด่วนเข้ามา ให้กล้าปรับแผน
                      โดยเลื่อนการใช้สื่อบางอย่างออกไปก่อน
                    </li>
                  </ul>
                </div>
              )}

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
                    <button
                      className="edu-btn edu-btn--ghost"
                      type="button"
                      onClick={goNext}
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