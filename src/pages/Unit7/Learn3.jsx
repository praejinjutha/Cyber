// src/pages/Unit7/Learn3.jsx
// Unit 7 - เรื่องที่ 3: ความเสี่ยงของธุรกรรมออนไลน์
// Flow: Micro-lesson → Compare & Think → Interactive Classification → Immediate Feedback Learning
// ใช้เฉพาะ class จาก main.css + learn.css
// เหมาะสำหรับเยาวชนอายุ 15–18 ปี
// เน้น "ทริคสังเกต" ที่ใช้ได้จริงมากกว่าการจำจากภาพ

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
  FiDollarSign,
  FiShield,
  FiMessageSquare,
  FiSearch,
  FiLink,
} from "react-icons/fi";

/* ------------------------------------------------------------------ */
/* MICRO LESSON */
/* ------------------------------------------------------------------ */

const MICRO_LESSON = [
  {
    icon: <FiDollarSign />,
    title: "ราคาถูกผิดปกติ ต้องสงสัยไว้ก่อน",
    points: [
      "ถ้าราคาถูกกว่าร้านทั่วไปมากแบบผิดสังเกต อย่าเพิ่งดีใจ ให้สงสัยก่อน",
      "ราคาที่ถูกมากเกินไปอาจถูกใช้เพื่อเร่งให้ตัดสินใจเร็ว โดยไม่ตรวจสอบรายละเอียด",
      "ก่อนซื้อควรลองเปรียบเทียบราคากับหลายร้าน ไม่ดูแค่ร้านเดียว",
      "ของที่เป็นที่นิยมมาก แต่ราคาต่ำเกินจริง มักต้องตรวจสอบเพิ่มเป็นพิเศษ",
    ],
    note: "ทริคจำง่าย: ถ้าราคาดีเกินจริง จงหยุดก่อน อย่าเพิ่งโอน",
  },
  {
    icon: <FiLink />,
    title: "การขอให้ออกจากระบบแพลตฟอร์มคือสัญญาณเสี่ยง",
    points: [
      "ถ้าร้านพยายามพาไปคุยส่วนตัว แล้วขอให้โอนเงินนอกระบบ ให้ระวังทันที",
      "การชำระเงินนอกระบบมักทำให้ไม่มีตัวกลางช่วยตรวจสอบหรือคุ้มครอง",
      "บางกรณีอาจใช้เหตุผล เช่น จะลดเพิ่ม จะส่งไวขึ้น หรือจะไม่เสียค่าธรรมเนียม",
      "ยิ่งร้านเร่งให้รีบโอนก่อน ยิ่งต้องเพิ่มความระวัง",
    ],
    note:
      "ทริคจำง่าย: ยิ่งออกจากระบบคุ้มครองของแพลตฟอร์มมากเท่าไร ความเสี่ยงก็มักเพิ่มขึ้น",
  },
  {
    icon: <FiShield />,
    title: "ร้านน่าเชื่อถือ ต้องตรวจได้ ไม่ใช่แค่พูดว่าน่าเชื่อถือ",
    points: [
      "ก่อนซื้อควรดูว่ามีข้อมูลร้านค้า ช่องทางติดต่อ หรือประวัติการขายหรือไม่",
      "ควรดูรีวิวอย่างมีสติ ไม่ดูแค่จำนวน แต่ดูความสมเหตุสมผลของรีวิวด้วย",
      "ถ้าหาร่องรอยร้านแทบไม่เจอ หรือข้อมูลน้อยมาก ควรระวัง",
      "การมีชื่อร้าน บัญชีผู้รับเงิน และข้อมูลให้ตรวจสอบต่อได้ จะช่วยลดความเสี่ยง",
    ],
    note: "ทริคจำง่าย: ร้านที่ตรวจสอบอะไรแทบไม่ได้ มักไม่ควรรีบไว้ใจ",
  },
  {
    icon: <FiSearch />,
    title: "ก่อนจ่ายเงินจริง ต้องเช็กให้มากกว่าดูโพสต์ขาย",
    points: [
      "ตรวจสอบชื่อร้าน ชื่อบัญชี หรือข้อมูลติดต่อเพิ่มเติมก่อนทำธุรกรรม",
      "หากมีข้อสงสัย ควรค้นข้อมูลจากหลายแหล่ง ไม่เชื่อจากคำพูดของร้านฝ่ายเดียว",
      "ดูว่ามีคนเคยซื้อจริงหรือมีสัญญาณเตือนจากที่อื่นหรือไม่",
      "การใช้เวลาเช็กเพิ่มไม่กี่นาที อาจช่วยป้องกันการเสียเงินฟรีได้",
    ],
    note: "ทริคจำง่าย: อย่าดูแค่โพสต์ขาย ให้ดู 'ข้อมูลรอบโพสต์' ด้วย",
  },
];

/* ------------------------------------------------------------------ */
/* QUICK CHECKLIST */
/* ------------------------------------------------------------------ */

const CHECKLIST = [
  "ราคาถูกผิดปกติเมื่อเทียบกับร้านทั่วไป",
  "เร่งให้รีบโอน รีบจ่าย หรือรีบตัดสินใจ",
  "ขอให้โอนเงินนอกระบบแพลตฟอร์ม",
  "ไม่มีข้อมูลร้าน รีวิว หรือข้อมูลติดต่อที่ตรวจสอบได้",
  "อ้างว่ามีของจำกัด แต่ไม่ยอมให้เวลาตรวจสอบ",
  "ให้เชื่อจากคำพูดอย่างเดียว มากกว่าหลักฐานที่ตรวจได้",
  "หลีกเลี่ยงคำถามเรื่องข้อมูลร้าน การรับประกัน หรือหลักฐานการขาย",
  "ทำให้รู้สึกว่าถ้าไม่รีบตอนนี้จะพลาดทันที",
];

/* ------------------------------------------------------------------ */
/* SAFE VS RISK */
/* ------------------------------------------------------------------ */

const COMPARE_ITEMS = [
  {
    id: "safe",
    title: "ธุรกรรมที่ปลอดภัยกว่า",
    tips: [
      "ซื้อผ่านแพลตฟอร์มที่มีระบบชำระเงินกลาง",
      "มีข้อมูลร้านค้าและช่องทางติดต่อพอสมควร",
      "มีรีวิวที่ดูมีรายละเอียดและสอดคล้องกัน",
      "ไม่เร่งให้รีบโอนก่อนตรวจสอบ",
      "ยอมให้ผู้ซื้อเช็กข้อมูลก่อนตัดสินใจ",
    ],
  },
  {
    id: "risk",
    title: "ธุรกรรมที่มีความเสี่ยง",
    tips: [
      "ราคาถูกผิดปกติจนไม่สมเหตุสมผล",
      "ขอให้โอนผ่านแชตหรือบัญชีส่วนตัว",
      "ไม่มีข้อมูลร้านหรือมีข้อมูลน้อยมาก",
      "ใช้คำพูดเร่งรีบ กดดัน หรือชวนให้ตัดสินใจทันที",
      "ตอบคำถามไม่ชัด หรือเลี่ยงการให้ข้อมูลเพิ่มเติม",
    ],
  },
];

/* ------------------------------------------------------------------ */
/* INTERACTIVE CLASSIFICATION */
/* ------------------------------------------------------------------ */

const CHECK_ITEMS = [
  {
    id: "i1",
    text: "ร้านขายรองเท้าแบรนด์ดังในราคาถูกกว่าร้านทั่วไปมาก และบอกว่าต้องรีบโอนวันนี้เท่านั้น",
    answer: "risk",
    choices: [
      { id: "safe", label: "ปลอดภัยกว่า" },
      { id: "risk", label: "มีความเสี่ยง" },
    ],
    reason:
      "มีทั้งราคาถูกผิดปกติและการเร่งให้รีบโอน จึงเป็นสัญญาณความเสี่ยงที่ควรระวัง",
  },
  {
    id: "i2",
    text: "ผู้ซื้อสั่งสินค้าผ่านแพลตฟอร์มที่มีระบบชำระเงินกลาง ร้านมีรีวิวหลายรายการ และมีข้อมูลร้านชัดเจน",
    answer: "safe",
    choices: [
      { id: "safe", label: "ปลอดภัยกว่า" },
      { id: "risk", label: "มีความเสี่ยง" },
    ],
    reason:
      "มีระบบคุ้มครองจากแพลตฟอร์มและมีข้อมูลให้ตรวจสอบได้ จึงปลอดภัยกว่ากรณีอื่น",
  },
  {
    id: "i3",
    text: "ร้านบอกว่าถ้าจะซื้อให้ทักแชตแล้วโอนเข้าบัญชีส่วนตัว เพราะจะได้ราคาถูกกว่าในระบบ",
    answer: "risk",
    choices: [
      { id: "safe", label: "ปลอดภัยกว่า" },
      { id: "risk", label: "มีความเสี่ยง" },
    ],
    reason:
      "การพาไปโอนนอกระบบแพลตฟอร์มทำให้ผู้ซื้อเสี่ยงมากขึ้น เพราะอาจไม่มีตัวกลางช่วยคุ้มครอง",
  },
  {
    id: "i4",
    text: "ร้านให้เวลาผู้ซื้ออ่านรายละเอียด ตรวจสอบรีวิว และชำระเงินผ่านช่องทางปกติของแพลตฟอร์ม",
    answer: "safe",
    choices: [
      { id: "safe", label: "ปลอดภัยกว่า" },
      { id: "risk", label: "มีความเสี่ยง" },
    ],
    reason:
      "ร้านไม่ได้เร่งกดดันและยังอยู่ในระบบที่ตรวจสอบได้ จึงเป็นธุรกรรมที่ปลอดภัยกว่า",
  },
  {
    id: "i5",
    text: "เพจขายของไม่มีข้อมูลร้านชัดเจน ไม่มีรีวิว แต่บอกว่ามีลูกค้าเยอะและให้เชื่อใจได้",
    answer: "risk",
    choices: [
      { id: "safe", label: "ปลอดภัยกว่า" },
      { id: "risk", label: "มีความเสี่ยง" },
    ],
    reason:
      "การอ้างว่าน่าเชื่อถืออย่างเดียวไม่พอ ถ้าไม่มีข้อมูลให้ตรวจสอบ ก็ยังถือว่าเสี่ยง",
  },
  {
    id: "i6",
    text: "ก่อนซื้อ ผู้ซื้อค้นข้อมูลร้านเพิ่มเติมและตัดสินใจซื้อจากร้านที่มีข้อมูลตรวจสอบได้มากกว่า แม้ราคาจะไม่ถูกที่สุด",
    answer: "safe",
    choices: [
      { id: "safe", label: "ปลอดภัยกว่า" },
      { id: "risk", label: "มีความเสี่ยง" },
    ],
    reason:
      "การให้ความสำคัญกับความน่าเชื่อถือมากกว่าราคาถูกที่สุด เป็นพฤติกรรมที่ปลอดภัยกว่า",
  },
];

/* ------------------------------------------------------------------ */
/* RESULT SUMMARY */
/* ------------------------------------------------------------------ */

const getResultSummary = (score) => {
  if (score >= 5) {
    return {
      title: "คุณแยกแยะความเสี่ยงของธุรกรรมออนไลน์ได้ค่อนข้างดี",
      badgeClass: "edu-badge edu-badge--ok",
      badgeText: "เข้าใจดี",
      icon: <FiCheckCircle />,
      message:
        "คุณเริ่มมองออกแล้วว่า ความเสี่ยงไม่ได้อยู่แค่ที่ราคาหรือคำโฆษณา แต่อยู่ที่วิธีขาย วิธีจ่ายเงิน และข้อมูลที่ตรวจสอบได้ด้วย",
      tips: [
        "อย่าดูแค่ราคาถูก ให้ดูความน่าเชื่อถือด้วย",
        "ถ้าร้านพาออกจากระบบแพลตฟอร์ม ควรระวังมากขึ้น",
        "ก่อนโอนหรือจ่ายเงิน ควรเช็กข้อมูลร้านและข้อมูลรับเงินเพิ่มเติม",
      ],
    };
  }

  if (score >= 3) {
    return {
      title: "คุณเริ่มจับสัญญาณเสี่ยงได้ แต่ยังควรฝึกเพิ่ม",
      badgeClass: "edu-badge edu-badge--yellow",
      badgeText: "พัฒนาได้อีก",
      icon: <FiAlertTriangle />,
      message:
        "สิ่งที่คนมักพลาดคือเชื่อเพราะราคาดีหรือรีบตัดสินใจตามแรงกดดัน ทั้งที่ยังตรวจสอบข้อมูลไม่พอ",
      tips: [
        "อย่ารีบโอนเพียงเพราะกลัวพลาดโปรโมชัน",
        "ดูให้ครบทั้งราคา ช่องทางจ่ายเงิน รีวิว และข้อมูลร้าน",
        "ถ้าตรวจสอบอะไรไม่ได้ชัด ควรชะลอไว้ก่อน",
      ],
    };
  }

  return {
    title: "ยังต้องฝึกสังเกตความเสี่ยงของธุรกรรมออนไลน์เพิ่ม",
    badgeClass: "edu-badge edu-badge--lock",
    badgeText: "ต้องทบทวน",
    icon: <FiAlertTriangle />,
    message:
      "ตอนนี้คุณอาจยังตัดสินจากราคาหรือคำพูดของร้านเป็นหลัก ลองฝึกดูข้อมูลรอบด้านก่อนเสมอ",
    tips: [
      "เริ่มจากถามว่า ราคาสมเหตุสมผลไหม",
      "ต่อมาดูว่า ร้านพยายามให้เราออกจากระบบแพลตฟอร์มหรือไม่",
      "สุดท้ายดูว่า มีข้อมูลร้าน รีวิว หรือหลักฐานที่ตรวจสอบต่อได้หรือเปล่า",
    ],
  };
};

/* ------------------------------------------------------------------ */
/* COMPONENT */
/* ------------------------------------------------------------------ */

export default function Learn3Unit7() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");
  const [step, setStep] = useState("lesson1");

  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const chooseAnswer = (itemId, choiceId) => {
    setAnswers((prev) => ({ ...prev, [itemId]: choiceId }));
    if (submitted) setSubmitted(false);
  };

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);

  const allAnswered = useMemo(() => {
    return Object.keys(answers).length === CHECK_ITEMS.length;
  }, [answers]);

  const score = useMemo(() => {
    let total = 0;
    for (const item of CHECK_ITEMS) {
      if (answers[item.id] === item.answer) total += 1;
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

const panelTitle = useMemo(() => {
  if (step === "quiz") return "กิจกรรมจำแนกความเสี่ยง";
  return "บทเรียนความเสี่ยงของธุรกรรมออนไลน์";
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
                  เรื่องที่ 3 : ความเสี่ยงของธุรกรรมออนไลน์
                </div>

                <div className="edu-lessons__toolbar">
                  <button
                    className="edu-btn edu-btn--back"
                    type="button"
                    onClick={() => {
                      if (step === "quiz") {
                        setStep("lesson2");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        return;
                      }

                      if (step === "lesson2") {
                        setStep("lesson1");
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

          {step === "lesson1" && (
            <div style={{ padding: 16 }}>
              <div className="edu-taskIntro">
                <div className="edu-taskIntro__title">
                  รู้ทันก่อนจ่ายจริง: ธุรกรรมออนไลน์ต้องดูมากกว่าราคาถูก
                </div>
                <div className="edu-taskIntro__desc">
                  เวลาซื้อของออนไลน์ ความเสี่ยงไม่ได้อยู่แค่ของแท้หรือของปลอม
                  แต่อยู่ที่วิธีขาย วิธีจ่ายเงิน และข้อมูลที่ตรวจสอบได้ด้วย
                  บทนี้จะช่วยให้มองเห็น “สัญญาณเตือน” ก่อนเสียเงิน
                </div>
              </div>

              <div style={{ marginTop: 24 }}>
                <div className="edu-card edu-adaptiveBlock">
                  <div className="edu-adaptiveBlock__head">
                    <div>
                      <div className="edu-adaptiveBlock__title">
                        4 มุมที่ควรเช็กก่อนทำธุรกรรมออนไลน์
                      </div>
                      <div className="edu-adaptiveBlock__sub">
                        อ่านทีละข้อ แล้วลองนึกถึงเวลาจะซื้อของจริง
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
                        เช็กลิสต์สั้น ๆ ก่อนซื้อหรือก่อนโอน
                      </div>
                      <div className="edu-adaptiveBlock__sub">
                        ถ้าเจอหลายข้อพร้อมกัน ให้ชะลอก่อนตัดสินใจ
                      </div>
                    </div>
                  </div>

                  <div className="edu-box">
                    <div className="edu-box__title">
                      <FiCheckCircle /> จุดที่ควรระวัง
                    </div>
                    <ul className="edu-list">
                      {CHECKLIST.map((item, index) => (
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
                    setStep("lesson2");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  ดูตัวอย่างเปรียบเทียบ <FiChevronRight />
                </button>
              </div>
            </div>
          )}

          {step === "lesson2" && (
            <div style={{ padding: 16 }}>
              <div className="edu-taskIntro">
                <div className="edu-taskIntro__title">
                  เปรียบเทียบให้เห็นชัดก่อนเริ่มทำกิจกรรม
                </div>
                <div className="edu-taskIntro__desc">
                  ลองดูความต่างของธุรกรรมที่ปลอดภัยกว่ากับธุรกรรมที่มีความเสี่ยง
                  แล้วใช้คำถามสั้น ๆ ช่วยคิดก่อนตัดสินใจ
                </div>
              </div>

              <div style={{ marginTop: 24 }}>
                <div className="edu-card edu-adaptiveBlock">
                  <div className="edu-adaptiveBlock__head">
                    <div>
                      <div className="edu-adaptiveBlock__title">
                        เปรียบเทียบให้เห็นชัด: แบบไหนปลอดภัยกว่า แบบไหนเสี่ยงกว่า
                      </div>
                      <div className="edu-adaptiveBlock__sub">
                        อย่าดูแค่คำขายของ ให้ดูภาพรวมของธุรกรรม
                      </div>
                    </div>
                  </div>

                  <div className="edu-actions" style={{ marginTop: 0 }}>
                    {COMPARE_ITEMS.map((item, index) => (
                      <div key={item.id} className="edu-box" style={{ width: "100%" }}>
                        <div className="edu-box__title">
                          {index === 0 ? <FiCheckCircle /> : <FiAlertTriangle />}{" "}
                          {item.title}
                        </div>
                        <ul className="edu-list">
                          {item.tips.map((tip, idx) => (
                            <li key={idx}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="edu-card edu-adaptiveBlock" style={{ marginTop: 24 }}>
                  <div className="edu-adaptiveBlock__head">
                    <div>
                      <div className="edu-adaptiveBlock__title">
                        วิธีคิดก่อนตัดสินใจ
                      </div>
                      <div className="edu-adaptiveBlock__sub">
                        ใช้ถามตัวเองสั้น ๆ ก่อนทุกครั้งที่กำลังจะจ่ายเงิน
                      </div>
                    </div>
                  </div>

                  <div className="edu-box">
                    <div className="edu-box__title">
                      <FiMessageSquare /> คำถามที่ควรถามตัวเอง
                    </div>
                    <ul className="edu-list">
                      <li>ราคานี้สมเหตุสมผลเมื่อเทียบกับร้านอื่นหรือไม่</li>
                      <li>ร้านกำลังเร่งให้รีบซื้อหรือรีบโอนเกินไปหรือเปล่า</li>
                      <li>ธุรกรรมนี้ยังอยู่ในระบบที่มีตัวกลางคุ้มครองหรือไม่</li>
                      <li>มีข้อมูลร้าน รีวิว หรือข้อมูลรับเงินที่ตรวจสอบต่อได้ไหม</li>
                      <li>ถ้าเกิดปัญหา เราจะมีหลักฐานหรือช่องทางติดตามหรือไม่</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="edu-actions" style={{ marginTop: 24 }}>
                <button
                  className="edu-btn edu-btn--back"
                  type="button"
                  onClick={() => {
                    setStep("lesson1");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  <FiChevronLeft /> กลับไปหน้าก่อน
                </button>

                <button
                  className="edu-btn edu-btn--primary"
                  type="button"
                  onClick={() => {
                    setStep("quiz");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  เริ่มกิจกรรม <FiChevronRight />
                </button>
              </div>
            </div>
          )}

          {step === "quiz" && (
            <div className="edu-taskStage">
              <div className="edu-taskIntro">
                <div className="edu-taskIntro__title">
                  ลองจำแนกสถานการณ์ต่อไปนี้ว่าปลอดภัยกว่าหรือมีความเสี่ยง
                </div>
                <div className="edu-taskIntro__desc">
                  ให้ดูจากภาพรวมของธุรกรรม ไม่ใช่ดูแค่ราคาหรือคำพูดของร้านเพียงอย่างเดียว
                </div>
                <div className="edu-taskIntro__meta">
                  ตอบแล้ว {answeredCount} / {CHECK_ITEMS.length}
                </div>
              </div>

              <div className="edu-taskGrid">
                {CHECK_ITEMS.map((item) => {
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
                    คุณได้ {score} / {CHECK_ITEMS.length} คะแนน
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
                      <span className={resultSummary.badgeClass}>
                        {resultSummary.badgeText}
                      </span>
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
                    setStep("lesson2");
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