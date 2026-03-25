
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
  FiShield,
  FiMessageSquare,
  FiSearch,
  FiXCircle,
} from "react-icons/fi";

/* ------------------------------------------------------------------ */
/* MICRO INTRO */
/* ------------------------------------------------------------------ */

const MICRO_LESSON = [
  {
    icon: <FiShield />,
    title: "เมื่อเจอข้อเสนอที่ดูเสี่ยง อย่ารีบตอบสนองทันที",
    points: [
      "ข้อเสนอที่ดูดีเกินจริงหรือเร่งให้ตัดสินใจเร็ว มักทำให้คนพลาดเพราะรีบเกินไป",
      "การหยุดคิดก่อนตอบสนอง เป็นจุดเริ่มต้นของความปลอดภัย",
      "อย่าเพิ่งเชื่อเพียงเพราะข้อความดูน่าเชื่อถือหรือทำให้รู้สึกกลัวว่าจะพลาดโอกาส",
    ],
    note: "ทริคจำง่าย: เจออะไรเร่ง ๆ ให้ช้าลงก่อน",
  },
  {
    icon: <FiSearch />,
    title: "ตรวจสอบก่อนเชื่อ ก่อนคลิก ก่อนโอน",
    points: [
      "ควรตรวจสอบชื่อร้าน ชื่อเพจ ลิงก์ ช่องทางติดต่อ และรีวิวก่อน",
      "ถ้าเป็นข้อความแจ้งรางวัล แจ้งปัญหาบัญชี หรือโปรโมชัน ควรเช็กจากแหล่งทางการก่อน",
      "การใช้เวลาเช็กเพิ่มเล็กน้อย ช่วยลดโอกาสถูกหลอกได้มาก",
    ],
    note: "ทริคจำง่าย: ข้อมูลต้องตรวจสอบได้ ไม่ใช่เชื่อจากคำพูดอย่างเดียว",
  },
  {
    icon: <FiMessageSquare />,
    title: "อย่าให้ข้อมูลส่วนตัวหรือโอนเงินเพราะแรงกดดัน",
    points: [
      "ไม่ควรให้รหัสผ่าน รหัส OTP ข้อมูลบัตร หรือข้อมูลส่วนตัวทันที",
      "ไม่ควรโอนเงินทันทีเพียงเพราะถูกเร่งหรือถูกกดดัน",
      "ถ้าข้อเสนอนั้นพยายามให้รีบทำก่อนคิด ควรยิ่งระวัง",
    ],
    note: "ทริคจำง่าย: ยิ่งรีบให้ข้อมูล ยิ่งเสี่ยง",
  },
];

/* ------------------------------------------------------------------ */
/* DECISION GUIDE */
/* ------------------------------------------------------------------ */

const DECISION_GUIDE = [
  "หยุดก่อน อย่าเพิ่งรีบเชื่อหรือรีบทำตามทันที",
  "ดูว่าข้อความหรือข้อเสนอนั้นกำลังกดดันให้รีบตัดสินใจหรือไม่",
  "ตรวจสอบข้อมูลร้าน ผู้ส่ง ลิงก์ หรือแหล่งที่มาเพิ่มเติม",
  "ไม่ให้ข้อมูลส่วนตัว รหัสผ่าน รหัส OTP หรือข้อมูลการเงินทันที",
  "ไม่โอนเงินทันที โดยเฉพาะเมื่อยังตรวจสอบไม่ได้",
  "ถ้าไม่แน่ใจ ให้เลือกชะลอไว้ก่อนหรือสอบถามจากแหล่งทางการ",
];

/* ------------------------------------------------------------------ */
/* SCENARIOS */
/* ------------------------------------------------------------------ */

const SCENARIOS = [
  {
    id: "s1",
    title: "โปรโมชันราคาถูกผิดปกติ",
    text: "คุณเห็นโพสต์ขายโทรศัพท์รุ่นใหม่ราคาถูกกว่าปกติมาก ร้านบอกว่าถ้าจะซื้อให้รีบโอนภายใน 10 นาที ไม่อย่างนั้นสิทธิ์จะหลุด",
    choices: [
      {
        id: "a",
        label: "รีบโอนเงินทันที เพราะกลัวพลาดของถูก",
        isCorrect: false,
        feedback:
          "การรีบโอนเงินทันทีจากแรงกดดันทำให้เสี่ยงต่อการถูกหลอก ควรตรวจสอบร้าน รีวิว และช่องทางชำระเงินก่อน",
      },
      {
        id: "b",
        label: "ตรวจสอบข้อมูลร้าน รีวิว และความน่าเชื่อถือก่อนตัดสินใจ",
        isCorrect: true,
        feedback:
          "ถูกต้อง การตรวจสอบข้อมูลก่อนช่วยลดความเสี่ยง โดยเฉพาะเมื่อราคาถูกผิดปกติและมีการเร่งให้รีบโอน",
      },
      {
        id: "c",
        label: "ส่งเลขบัตรประชาชนให้ร้านเพื่อจองสินค้าไว้ก่อน",
        isCorrect: false,
        feedback:
          "ไม่ควรให้ข้อมูลส่วนตัวเพิ่มเติมกับแหล่งที่ยังตรวจสอบไม่ได้ เพราะอาจถูกนำไปใช้ในทางที่ไม่เหมาะสม",
      },
      {
        id: "d",
        label: "ย้ายไปคุยแชตส่วนตัวและโอนนอกระบบทันทีเพื่อให้ได้ราคาพิเศษ",
        isCorrect: false,
        feedback:
          "การออกจากระบบแพลตฟอร์มและโอนนอกระบบเพิ่มความเสี่ยง เพราะอาจไม่มีตัวกลางช่วยคุ้มครอง",
      },
    ],
    takeaway:
      "เมื่อเจอของราคาถูกผิดปกติและมีการเร่งให้รีบโอน ควรหยุดก่อนและตรวจสอบข้อมูลให้ชัด",
  },
  {
    id: "s2",
    title: "ข้อความแจ้งรับรางวัล",
    text: "มีข้อความส่งมาว่าคุณได้รับรางวัลพิเศษจากกิจกรรมออนไลน์ และต้องกดลิงก์เพื่อยืนยันตัวตนพร้อมกรอกข้อมูลส่วนตัวภายในวันนี้",
    choices: [
      {
        id: "a",
        label: "กดลิงก์ทันทีเพื่อไม่ให้พลาดรางวัล",
        isCorrect: false,
        feedback:
          "การกดลิงก์ทันทีจากข้อความที่ยังไม่ตรวจสอบอาจพาไปยังเว็บไซต์ปลอม ควรตรวจสอบแหล่งที่มาก่อน",
      },
      {
        id: "b",
        label: "ส่งข้อมูลส่วนตัวให้ครบก่อน แล้วค่อยตรวจสอบทีหลัง",
        isCorrect: false,
        feedback:
          "ไม่ควรให้ข้อมูลส่วนตัวก่อนตรวจสอบ เพราะอาจถูกนำไปใช้หลอกลวงหรือขโมยตัวตนได้",
      },
      {
        id: "c",
        label: "ตรวจสอบว่าข้อความมาจากแหล่งทางการจริงหรือไม่ก่อน",
        isCorrect: true,
        feedback:
          "ถูกต้อง ควรตรวจสอบแหล่งที่มา ลิงก์ และข้อมูลผู้ส่งก่อนเสมอ โดยเฉพาะเมื่อมีการขอข้อมูลส่วนตัว",
      },
      {
        id: "d",
        label: "แชร์ข้อความนี้ต่อให้เพื่อนเพื่อให้เพื่อนมีสิทธิ์รับรางวัลด้วย",
        isCorrect: false,
        feedback:
          "ไม่ควรแชร์ต่อก่อนตรวจสอบ เพราะอาจเป็นข้อความหลอกลวงและทำให้ผู้อื่นเสี่ยงตามไปด้วย",
      },
    ],
    takeaway:
      "ถ้าข้อความใดขอให้กดลิงก์และกรอกข้อมูลส่วนตัว ควรตรวจสอบจากแหล่งทางการก่อนเสมอ",
  },
  {
    id: "s3",
    title: "ผู้ขายเร่งให้โอนนอกระบบ",
    text: "คุณสนใจซื้อสินค้าจากเพจหนึ่ง ผู้ขายบอกว่าถ้าโอนเข้าบัญชีส่วนตัวตอนนี้จะได้ลดเพิ่ม แต่ถ้าจ่ายผ่านระบบแพลตฟอร์มจะไม่ได้โปรนี้",
    choices: [
      {
        id: "a",
        label: "โอนเข้าบัญชีส่วนตัวทันทีเพื่อให้ได้ราคาถูกที่สุด",
        isCorrect: false,
        feedback:
          "การโอนเข้าบัญชีส่วนตัวนอกระบบแพลตฟอร์มทำให้เสี่ยงมากขึ้น เพราะอาจไม่มีระบบคุ้มครองผู้ซื้อ",
      },
      {
        id: "b",
        label: "เลือกชำระผ่านระบบของแพลตฟอร์มหรือชะลอการซื้อไว้ก่อน",
        isCorrect: true,
        feedback:
          "ถูกต้อง การอยู่ในระบบของแพลตฟอร์มช่วยให้ปลอดภัยกว่า และถ้ายังไม่แน่ใจก็ควรชะลอไว้ก่อน",
      },
      {
        id: "c",
        label: "ส่งภาพบัตรนักเรียนให้ผู้ขายเพื่อสร้างความไว้ใจกัน",
        isCorrect: false,
        feedback:
          "ไม่ควรส่งข้อมูลส่วนตัวที่ไม่จำเป็นให้ผู้ขาย เพราะไม่ได้ช่วยลดความเสี่ยง และอาจเพิ่มความเสี่ยงแทน",
      },
      {
        id: "d",
        label: "รีบตกลงเพราะผู้ขายบอกว่ามีคนอื่นรอซื้ออีกหลายคน",
        isCorrect: false,
        feedback:
          "การตัดสินใจเพราะแรงกดดันทำให้พลาดการตรวจสอบข้อมูลสำคัญ ควรตั้งสติและดูความน่าเชื่อถือก่อน",
      },
    ],
    takeaway:
      "การโอนนอกระบบแพลตฟอร์มเป็นสัญญาณเสี่ยงที่ควรระวังมาก",
  },
  {
    id: "s4",
    title: "ลิงก์แจ้งปัญหาบัญชี",
    text: "คุณได้รับข้อความว่าบัญชีของคุณมีปัญหาและจะถูกระงับ ถ้าไม่ยืนยันข้อมูลภายใน 30 นาที โดยให้กดลิงก์และกรอกรหัสผ่านเพื่อยืนยันตัวตน",
    choices: [
      {
        id: "a",
        label: "รีบกรอกรหัสผ่านทันทีเพราะกลัวบัญชีถูกปิด",
        isCorrect: false,
        feedback:
          "ไม่ควรกรอกรหัสผ่านผ่านลิงก์จากข้อความที่ยังไม่ตรวจสอบ เพราะอาจเป็นการหลอกขโมยบัญชี",
      },
      {
        id: "b",
        label: "เข้าแอปหรือเว็บไซต์ทางการด้วยตนเองเพื่อตรวจสอบสถานะบัญชี",
        isCorrect: true,
        feedback:
          "ถูกต้อง หากกังวลเรื่องบัญชี ควรเข้าไปตรวจสอบผ่านช่องทางทางการด้วยตนเอง ไม่ใช้ลิงก์ที่ส่งมาในข้อความ",
      },
      {
        id: "c",
        label: "ตอบกลับข้อความและส่งรหัส OTP ให้ผู้ส่งเพื่อยืนยันเร็วขึ้น",
        isCorrect: false,
        feedback:
          "ไม่ควรส่งรหัส OTP ให้ผู้อื่นเด็ดขาด เพราะอาจทำให้บัญชีถูกเข้าถึงโดยไม่ได้รับอนุญาต",
      },
      {
        id: "d",
        label: "ส่งต่อข้อความนี้ให้เพื่อนช่วยดูและลองกดให้",
        isCorrect: false,
        feedback:
          "การส่งต่อข้อความเสี่ยงไม่ช่วยแก้ปัญหา และอาจทำให้ผู้อื่นเสี่ยงตามไปด้วย ควรตรวจสอบผ่านช่องทางทางการแทน",
      },
    ],
    takeaway:
      "ถ้ามีข้อความเร่งให้ยืนยันข้อมูลบัญชีผ่านลิงก์ ควรตรวจสอบผ่านแอปหรือเว็บไซต์ทางการด้วยตนเอง",
  },
];

/* ------------------------------------------------------------------ */
/* RESULT SUMMARY */
/* ------------------------------------------------------------------ */

const getResultSummary = (score) => {
  if (score >= 4) {
    return {
      title: "คุณตัดสินใจตอบสนองต่อข้อเสนอเสี่ยงได้ค่อนข้างดี",
      badgeClass: "edu-badge edu-badge--ok",
      badgeText: "ตัดสินใจได้ดี",
      icon: <FiCheckCircle />,
      message:
        "คุณเริ่มมองออกแล้วว่า การตอบสนองอย่างปลอดภัยไม่ได้อยู่ที่ความเร็ว แต่อยู่ที่การตั้งสติ ตรวจสอบ และไม่ให้ข้อมูลหรือเงินไปก่อนโดยไม่จำเป็น",
      tips: [
        "หยุดก่อนเมื่อเจอแรงกดดันให้รีบตัดสินใจ",
        "ตรวจสอบแหล่งที่มา ร้านค้า หรือลิงก์ก่อนทุกครั้ง",
        "ไม่ให้ข้อมูลส่วนตัว รหัสผ่าน หรือโอนเงินทันที",
      ],
    };
  }

  if (score >= 2) {
    return {
      title: "คุณเริ่มมีแนวทางตอบสนองที่ปลอดภัย แต่ยังควรฝึกเพิ่ม",
      badgeClass: "edu-badge edu-badge--yellow",
      badgeText: "พัฒนาได้อีก",
      icon: <FiAlertTriangle />,
      message:
        "บางสถานการณ์อาจทำให้เราตัดสินใจเร็วเพราะกลัวพลาดหรือกลัวเกิดปัญหา ลองฝึกมองสัญญาณกดดันและตรวจสอบข้อมูลก่อนตอบสนองเสมอ",
      tips: [
        "อย่าตัดสินใจเพราะคำว่า ด่วน หมดวันนี้ หรือจะถูกระงับทันที",
        "ถ้ายังไม่แน่ใจ ให้ชะลอไว้ก่อน",
        "ใช้ช่องทางทางการหรือระบบของแพลตฟอร์มแทนลิงก์หรือการโอนตรง",
      ],
    };
  }

  return {
    title: "ยังควรฝึกการตอบสนองอย่างปลอดภัยต่อข้อเสนอที่มีความเสี่ยง",
    badgeClass: "edu-badge edu-badge--lock",
    badgeText: "ต้องทบทวน",
    icon: <FiXCircle />,
    message:
      "ตอนนี้คุณอาจยังถูกเร่งให้ตัดสินใจง่ายเกินไป ลองฝึกหยุดคิด ตรวจสอบ และไม่รีบให้ข้อมูลหรือโอนเงินเมื่อยังไม่แน่ใจ",
    tips: [
      "เริ่มจากหยุดก่อน ไม่รีบทำตามทันที",
      "ตรวจสอบข้อมูลจากแหล่งทางการหรือข้อมูลร้านก่อน",
      "ไม่กดลิงก์ ไม่ให้ข้อมูลส่วนตัว และไม่โอนเงินทันที",
    ],
  };
};

/* ------------------------------------------------------------------ */
/* COMPONENT */
/* ------------------------------------------------------------------ */

export default function Learn4Unit7() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");
  const [step, setStep] = useState("lesson");

  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const chooseAnswer = (scenarioId, choiceId) => {
    setAnswers((prev) => ({ ...prev, [scenarioId]: choiceId }));
    if (submitted) setSubmitted(false);
  };

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);

  const allAnswered = useMemo(() => {
    return Object.keys(answers).length === SCENARIOS.length;
  }, [answers]);

  const score = useMemo(() => {
    let total = 0;
    for (const scenario of SCENARIOS) {
      const picked = answers[scenario.id];
      const choice = scenario.choices.find((item) => item.id === picked);
      if (choice?.isCorrect) total += 1;
    }
    return total;
  }, [answers]);

  const resultSummary = useMemo(() => {
    if (!submitted) return null;
    return getResultSummary(score);
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

const panelTitle = useMemo(() => {
  if (step === "lesson") return "บทเรียนการตอบสนองอย่างปลอดภัย";
  return "กิจกรรมตัดสินใจจากสถานการณ์";
}, [step]);

  return (
    <div className="edu-app">
      <header className="edu-topbar">
        <div className="edu-topbar__inner">
          <div className="homebar__brand" role="banner">
            <img src={logo} alt="LearnSecure logo" className="homebar__logo" />
            <div className="edu-brandtext">
              <div className="edu-brandtext__title">LearnSecure</div>
              <div className="edu-brandtext__subtitle">Unit 7</div>
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
        <section className="edu-hero" aria-label="Unit 7 header">
          <div className="edu-hero__card">
            <div className="edu-hero__row">
              <div className="edu-hero__headline">
                <div className="edu-hero__title">
                  Unit 7 : การรู้เท่าทันโฆษณาและการโน้มน้าวใจบนโลกออนไลน์
                </div>
                <div className="edu-hero__sub">
                  เรื่องที่ 4 : การตอบสนองอย่างปลอดภัยต่อข้อเสนอที่มีความเสี่ยง
                </div>

                <div className="edu-lessons__toolbar">
                  <button
                    className="edu-btn edu-btn--back"
                    type="button"
                    onClick={() => {
                      if (step === "activity") {
                        setStep("lesson");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        return;
                      }
                      navigate("/unit7/learn", { replace: true });
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
            <div style={{ padding: 16 }}>
              <div className="edu-taskIntro">
                <div className="edu-taskIntro__title">
                  ไม่ใช่แค่ดูออกว่าเสี่ยง แต่ต้องตอบสนองให้ปลอดภัยด้วย
                </div>
                <div className="edu-taskIntro__desc">
                  บางครั้งเรารู้สึกได้ว่าข้อเสนอนั้นแปลกหรือกดดัน แต่ถ้าตอบสนองผิด
                  ก็ยังอาจเสียข้อมูล เสียเงิน หรือถูกหลอกได้
                  บทนี้จะช่วยฝึกตัดสินใจว่า เมื่อเจอสถานการณ์เสี่ยงควรตอบอย่างไรจึงปลอดภัยกว่า
                </div>
              </div>

              <div style={{ marginTop: 24 }}>
                <div className="edu-card edu-adaptiveBlock">
                  <div className="edu-adaptiveBlock__head">
                    <div>
                      <div className="edu-adaptiveBlock__title">
                        หลักคิดก่อนตอบสนองต่อข้อเสนอที่น่าสงสัย
                      </div>
                      <div className="edu-adaptiveBlock__sub">
                        อ่านสั้น ๆ ก่อน แล้วค่อยไปตัดสินใจในสถานการณ์จำลอง
                      </div>
                    </div>
                  </div>

                  <div className="edu-actions" style={{ marginTop: 0 }}>
                    {MICRO_LESSON.map((item, index) => (
                      <div key={index} className="edu-box" style={{ width: "100%" }}>
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
                    ))}
                  </div>
                </div>

                <div className="edu-card edu-adaptiveBlock" style={{ marginTop: 24 }}>
                  <div className="edu-adaptiveBlock__head">
                    <div>
                      <div className="edu-adaptiveBlock__title">
                        เช็กลิสต์สั้น ๆ ก่อนตอบสนอง
                      </div>
                      <div className="edu-adaptiveBlock__sub">
                        ใช้เตือนตัวเองก่อนคลิก ก่อนโอน และก่อนให้ข้อมูล
                      </div>
                    </div>
                  </div>

                  <div className="edu-box">
                    <div className="edu-box__title">
                      <FiCheckCircle /> ถ้ายังไม่แน่ใจ ให้ชะลอไว้ก่อน
                    </div>
                    <ul className="edu-list">
                      {DECISION_GUIDE.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="edu-actions" style={{ marginTop: 24 }}>
                <button
                  className="edu-btn edu-btn--primary"
                  type="button"
                  onClick={() => {
                    setStep("activity");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  เริ่มสถานการณ์จำลอง <FiChevronRight />
                </button>
              </div>
            </div>
          )}

          {step === "activity" && (
            <div className="edu-taskStage">
              <div className="edu-taskIntro">
                <div className="edu-taskIntro__title">
                  ลองเลือกวิธีตอบสนองที่ปลอดภัยที่สุดในแต่ละสถานการณ์
                </div>
                <div className="edu-taskIntro__desc">
                  ให้คิดว่า ถ้าเกิดขึ้นจริงกับเรา วิธีไหนช่วยลดความเสี่ยงได้มากกว่า
                </div>
                <div className="edu-taskIntro__meta">
                  ตอบแล้ว {answeredCount} / {SCENARIOS.length}
                </div>
              </div>

              <div className="edu-taskGrid">
                {SCENARIOS.map((scenario) => {
                  const picked = answers[scenario.id];
                  const pickedChoice = scenario.choices.find((choice) => choice.id === picked);
                  const isCorrect = submitted && pickedChoice?.isCorrect;
                  const isWrong = submitted && pickedChoice && !pickedChoice.isCorrect;

                  return (
                    <div key={scenario.id} className="edu-taskCard">
                      <div className="edu-taskCard__body">
                        <div className="edu-box__title" style={{ marginBottom: 8 }}>
                          {scenario.title}
                        </div>
                        <div className="edu-taskCard__label">{scenario.text}</div>
                      </div>

                      <div className="edu-taskCard__actions" style={{ display: "grid", gap: 8 }}>
                        {scenario.choices.map((choice) => (
                          <button
                            key={choice.id}
                            type="button"
                            className={`edu-pill ${picked === choice.id ? "is-active" : ""}`}
                            onClick={() => chooseAnswer(scenario.id, choice.id)}
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
                                  ? "ปลอดภัยกว่า"
                                  : isWrong
                                  ? "ยังไม่ใช่วิธีที่ปลอดภัยที่สุด"
                                  : "ยังไม่ได้เลือกคำตอบ"}
                              </div>
                              <div className="edu-taskCard__feedbackReason">
                                {pickedChoice
                                  ? pickedChoice.feedback
                                  : "เลือกคำตอบก่อน แล้วกดส่งคำตอบอีกครั้ง"}
                              </div>
                            </div>
                          </div>

                          <div className="edu-note" style={{ marginTop: 10 }}>
                            {scenario.takeaway}
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
                    คุณได้ {score} / {SCENARIOS.length} คะแนน
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
                  <FiChevronLeft /> กลับไปดูหลักคิด
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
                      onClick={() => navigate("/unit7/learn", { replace: true })}
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