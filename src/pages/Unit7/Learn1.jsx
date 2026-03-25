// src/pages/Unit7/Learn1.jsx
// ✅ Unit 7 - เรื่องที่ 1: การสังเกตและจำแนกโฆษณาออนไลน์
// ✅ ใช้เฉพาะ class ที่มีอยู่แล้วใน main.css + learn.css
// ✅ Flow: Video-based Concept Introduction → Micro-lesson → Interactive Concept Checking
// ✅ เนื้อหาเสริมไม่ซ้ำกับสคริปต์วิดีโอโดยตรง
// ✅ เหมาะกับวัย 15–18 ปี
// ✅ ไม่สร้าง class CSS ใหม่

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import logo from "../../assets/logo.png";
import learnVideo from "../../assets/learn3.1.mp4";

import organicImg from "../unit7/Organic.jpg";
import directImg from "../unit7/Direct.jpg";
import embeddedImg from "../unit7/Embedded.jpg";

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
  FiEye,
  FiTag,
  FiLink,
  FiMessageSquare,
} from "react-icons/fi";

/* ------------------------------------------------------------------ */
/* ✅ MICRO-LESSON
/* ------------------------------------------------------------------ */
const MICRO_LESSON = [
  {
    icon: <FiEye />,
    title: "มองให้พ้นจากหน้าตาโพสต์",
    points: [
      "โพสต์ที่ดูเป็นกันเอง หรือดูเหมือนเล่าเรื่องธรรมดา อาจไม่ได้เป็นเนื้อหาทั่วไปเสมอไป",
      "บางครั้งรูปแบบถูกทำให้ดูสบาย ๆ เพื่อให้ผู้ชมไม่รู้สึกว่ากำลังถูกขายของ",
    ],
    note: "เวลาจะตัดสินว่าเป็นโฆษณาหรือไม่ อย่าดูแค่ “บรรยากาศของโพสต์” แต่ให้ดูเป้าหมายของโพสต์ด้วย",
  },
  {
    icon: <FiTag />,
    title: "ดูว่าใครได้ประโยชน์จากเนื้อหา",
    points: [
      "ถ้าเนื้อหานั้นช่วยผลักดันสินค้า บริการ หรือแบรนด์ให้ดูน่าสนใจมากขึ้น ก็มีโอกาสสูงว่าเป็นเนื้อหาเชิงโฆษณา",
      "แต่ถ้าเป็นการเล่าประสบการณ์หรือแชร์ข้อมูล โดยไม่เห็นแรงจูงใจให้คนซื้อหรือคลิกต่อ ก็อาจเป็นเนื้อหาทั่วไป",
    ],
    note: "คำถามง่าย ๆ คือ “โพสต์นี้ทำขึ้นเพื่อเล่า” หรือ “ทำขึ้นเพื่อช่วยขาย”",
  },
  {
    icon: <FiMessageSquare />,
    title: "สังเกตน้ำหนักของคำพูด",
    points: [
      "ถ้าโพสต์พูดถึงข้อดีของสินค้าอย่างต่อเนื่อง แต่แทบไม่พูดอย่างอื่นเลย ให้ระวังว่าอาจเป็นการโน้มน้าวใจ",
      "ข้อความที่พยายามทำให้รู้สึกว่าต้องรีบ ต้องมี หรือพลาดไม่ได้ มักใกล้กับเนื้อหาเชิงพาณิชย์",
    ],
    note: "ยิ่งคำพูดออกแนวชวนเชื่อมากกว่าให้ข้อมูลแบบสมดุล ยิ่งควรตรวจสอบเพิ่ม",
  },
  {
    icon: <FiLink />,
    title: "ดูว่าจบโพสต์แล้วพาเราไปไหนต่อ",
    points: [
      "ถ้าโพสต์พาไปหน้าซื้อสินค้า หน้าแชตขายของ หน้ารับสิทธิ์ หรือฟอร์มสมัคร โอกาสสูงว่าไม่ใช่แค่คอนเทนต์ทั่วไป",
      "บางโพสต์ไม่ติดป้ายว่าเป็นโฆษณา แต่ปลายทางชัดมากว่าอยากพาเราเข้าสู่การซื้อขาย",
    ],
    note: "บางทีคำตอบไม่ได้อยู่ที่ตัวโพสต์อย่างเดียว แต่อยู่ที่สิ่งที่โพสต์นั้นพยายามให้เราทำต่อ",
  },
];

/* ------------------------------------------------------------------ */
/* ✅ QUICK GUIDE
/* ------------------------------------------------------------------ */
const GUIDE_ITEMS = [
  {
    id: "g1",
    title: "โฆษณาโดยตรง",
    desc: "สื่อสารเพื่อขายอย่างชัดเจน มักมีราคา โปรโมชัน ปุ่มสั่งซื้อ หรือติดป้ายว่าเป็นโฆษณา",
    image: directImg,
    alt: "ตัวอย่างโฆษณาโดยตรง",
  },
  {
    id: "g2",
    title: "โฆษณาแฝง",
    desc: "ดูเหมือนคอนเทนต์ปกติ แต่มีการสอดแทรกสินค้า แบรนด์ หรือชวนซื้อแบบไม่ตรงมาก",
    image: embeddedImg,
    alt: "ตัวอย่างโฆษณาแฝง",
  },
  {
    id: "g3",
    title: "เนื้อหาทั่วไป",
    desc: "มีเป้าหมายหลักเพื่อเล่า แชร์ หรือให้ข้อมูล โดยไม่พาไปสู่การตัดสินใจซื้อขาย",
    image: organicImg,
    alt: "ตัวอย่างเนื้อหาทั่วไป",
  },
];

/* ------------------------------------------------------------------ */
/* ✅ ตัวอย่างสั้น ๆ ให้ผู้เรียนเชื่อมภาพ
/* ------------------------------------------------------------------ */
const EXAMPLES = [
  {
    id: "e1",
    title: "ตัวอย่างโฆษณาแฝงจากโซเชียลมีเดีย",
    desc: "โพสต์ดูเหมือนเล่าชีวิตประจำวัน แต่มีการถือสินค้าและมีข้อความเชิงส่งเสริมการขายแทรกอยู่",
    hint: "แม้ภาพจะดูเป็นธรรมชาติ แต่ยังต้องสังเกตว่ามีการผลักดันสินค้าอยู่หรือไม่",
    image: embeddedImg,
    alt: "ตัวอย่างโฆษณาแฝงจากโซเชียลมีเดีย",
  },
  {
    id: "e2",
    title: "ตัวอย่างโฆษณาโดยตรง",
    desc: "มีส่วนลด ราคา และปุ่มสั่งซื้ออย่างชัดเจน ทำให้เห็นทันทีว่าเป็นเนื้อหาเพื่อการขาย",
    hint: "ถ้าโพสต์พยายามชวนให้กดซื้อทันที มักเป็นโฆษณาโดยตรง",
    image: directImg,
    alt: "ตัวอย่างโฆษณาโดยตรง",
  },
  {
    id: "e3",
    title: "ตัวอย่างเนื้อหาทั่วไป",
    desc: "เป็นโพสต์แชร์ประสบการณ์ส่วนตัว ไม่มีลิงก์ขาย ไม่มีโปรโมชัน และไม่ได้ชูสินค้าเป็นจุดหลัก",
    hint: "การพูดถึงสิ่งของในชีวิตประจำวันไม่ได้แปลว่าเป็นโฆษณาเสมอไป ต้องดูเจตนาด้วย",
    image: organicImg,
    alt: "ตัวอย่างเนื้อหาทั่วไป",
  },
];

/* ------------------------------------------------------------------ */
/* ✅ INTERACTIVE CONCEPT CHECKING
/* ------------------------------------------------------------------ */
const CHECK_ITEMS = [
  {
    id: "i1",
    text: "โพสต์ขึ้นข้อความว่า “แฟลชเซลคืนนี้เท่านั้น ลด 50% กดซื้อได้ทันที” พร้อมรูปสินค้าและปุ่มสั่งซื้อ",
    answer: "direct",
    choices: [
      { id: "direct", label: "โฆษณาโดยตรง" },
      { id: "embedded", label: "โฆษณาแฝง" },
      { id: "organic", label: "เนื้อหาทั่วไป" },
    ],
    reason:
      "โพสต์นี้ขายของตรง ๆ มีทั้งส่วนลด ความเร่งด่วน และปุ่มให้กดซื้อ จึงเป็นโฆษณาโดยตรง",
  },
  {
    id: "i2",
    text: "อินฟลูเอนเซอร์ทำคลิป “พาไปใช้ชีวิต 1 วัน” และมีการหยิบเครื่องดื่มแบรนด์เดิมขึ้นมาพูดชมหลายครั้ง พร้อมใส่ลิงก์สั่งซื้อใต้คลิป",
    answer: "embedded",
    choices: [
      { id: "direct", label: "โฆษณาโดยตรง" },
      { id: "embedded", label: "โฆษณาแฝง" },
      { id: "organic", label: "เนื้อหาทั่วไป" },
    ],
    reason:
      "รูปแบบดูเหมือนคอนเทนต์ชีวิตประจำวัน แต่มีการแทรกแบรนด์และพาไปซื้อ จึงเป็นโฆษณาแฝง",
  },
  {
    id: "i3",
    text: "นักเรียนคนหนึ่งโพสต์ว่าเพิ่งอ่านหนังสือเล่มนี้จบและชอบตรงที่อธิบายง่าย โดยไม่ได้ใส่ลิงก์ขายหรือชวนซื้อ",
    answer: "organic",
    choices: [
      { id: "direct", label: "โฆษณาโดยตรง" },
      { id: "embedded", label: "โฆษณาแฝง" },
      { id: "organic", label: "เนื้อหาทั่วไป" },
    ],
    reason:
      "โพสต์นี้เป็นการแชร์ความเห็นส่วนตัว และไม่เห็นสัญญาณของการผลักดันให้เกิดการซื้อขาย จึงเป็นเนื้อหาทั่วไป",
  },
  {
    id: "i4",
    text: "หน้าเว็บมีบทความชื่อ “แนะนำแอปเรียนออนไลน์สำหรับเด็กมัธยม” แต่เนื้อหาพูดถึงแอปเดียวเกือบทั้งหมดและมีปุ่มสมัครสมาชิกหลายจุด",
    answer: "embedded",
    choices: [
      { id: "direct", label: "โฆษณาโดยตรง" },
      { id: "embedded", label: "โฆษณาแฝง" },
      { id: "organic", label: "เนื้อหาทั่วไป" },
    ],
    reason:
      "หน้าตาเหมือนบทความแนะนำ แต่กำลังผลักดันบริการหนึ่งอย่างชัดเจนและพาไปสมัคร จึงเป็นโฆษณาแฝง",
  },
  {
    id: "i5",
    text: "สตอรี่มีคำว่า Sponsored ชัดเจน พร้อมรูปสินค้า ราคา และข้อความให้รีบทักก่อนของหมด",
    answer: "direct",
    choices: [
      { id: "direct", label: "โฆษณาโดยตรง" },
      { id: "embedded", label: "โฆษณาแฝง" },
      { id: "organic", label: "เนื้อหาทั่วไป" },
    ],
    reason:
      "มีป้ายกำกับว่าเป็นโฆษณาและมีองค์ประกอบการขายครบถ้วน จึงเป็นโฆษณาโดยตรง",
  },
  {
    id: "i6",
    text: "เพจหนึ่งโพสต์เล่าว่าไปเที่ยวทะเลกับเพื่อนมา สนุกอย่างไร กินอะไรบ้าง แต่ไม่ได้โปรโมตที่พักหรือแนบช่องทางจองใด ๆ",
    answer: "organic",
    choices: [
      { id: "direct", label: "โฆษณาโดยตรง" },
      { id: "embedded", label: "โฆษณาแฝง" },
      { id: "organic", label: "เนื้อหาทั่วไป" },
    ],
    reason:
      "โพสต์นี้เน้นเล่าประสบการณ์และไม่มีสัญญาณชักชวนเชิงพาณิชย์ จึงเป็นเนื้อหาทั่วไป",
  },
];

/* ------------------------------------------------------------------ */
/* ✅ RESULT SUMMARY
/* ------------------------------------------------------------------ */
const getResultSummary = (score) => {
  if (score >= 5) {
    return {
      title: "คุณแยกประเภทเนื้อหาได้ค่อนข้างแม่น",
      badgeClass: "edu-badge edu-badge--ok",
      badgeText: "เข้าใจดี",
      icon: <FiCheckCircle />,
      message:
        "คุณเริ่มมองออกแล้วว่า โฆษณาไม่ได้มีแค่แบบที่ติดป้ายชัด ๆ แต่ยังอาจซ่อนอยู่ในคอนเทนต์ที่ดูธรรมดาได้ด้วย",
      tips: [
        "ก่อนเชื่อหรือคลิก ลองดูว่าโพสต์นั้นต้องการพาเราไปทำอะไร",
        "ถ้าเห็นการผลักดันแบรนด์หรือสินค้า ควรสังเกตเพิ่ม",
        "ยิ่งจำแนกได้เร็ว ยิ่งตัดสินใจออนไลน์ได้รอบคอบขึ้น",
      ],
    };
  }

  if (score >= 3) {
    return {
      title: "คุณเริ่มจับทางได้ แต่ยังมีบางจุดที่สับสน",
      badgeClass: "edu-badge edu-badge--yellow",
      badgeText: "พัฒนาได้อีก",
      icon: <FiAlertTriangle />,
      message:
        "สิ่งที่มักสับสนมากที่สุดคือโฆษณาแฝง เพราะหน้าตาอาจเหมือนเนื้อหาทั่วไป จึงต้องดูเจตนาและปลายทางของโพสต์เพิ่ม",
      tips: [
        "อย่าดูแค่รูปแบบภายนอก ให้ดูว่ามีการผลักดันอะไรอยู่หรือไม่",
        "ถ้ามีลิงก์ โค้ด หรือทางไปสู่การซื้อ ควรระวังมากขึ้น",
        "ลองถามว่าโพสต์นี้ต้องการให้เรารู้ หรืออยากให้เราซื้อ",
      ],
    };
  }

  return {
    title: "ยังต้องฝึกสังเกตสัญญาณโฆษณาเพิ่ม",
    badgeClass: "edu-badge edu-badge--lock",
    badgeText: "ต้องทบทวน",
    icon: <FiAlertTriangle />,
    message:
      "ตอนนี้คุณอาจยังตัดสินจากหน้าตาโพสต์เป็นหลัก ลองย้อนกลับไปดูว่าเนื้อหาแต่ละประเภทต่างกันที่เจตนาและเป้าหมาย",
    tips: [
      "เริ่มจากดูว่ามีการขายหรือพาไปซื้อหรือไม่",
      "จากนั้นดูว่ามีการแทรกสินค้าแบบเนียน ๆ หรือเปล่า",
      "สุดท้ายถามว่าเนื้อหานั้นกำลังแชร์ หรือกำลังโน้มน้าวใจ",
    ],
  };
};

export default function Learn1Unit7() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");
  const [step, setStep] = useState("video");

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
        setStudentName(`${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim());
      }

      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [navigate]);

  const panelTitle = useMemo(() => {
    if (step === "video") return "บทนำผ่านวิดีโอ";
    if (step === "lesson") return "เข้าใจโฆษณาให้มากกว่าการดูป้ายกำกับ";
    return "ฝึกสังเกตและจำแนกประเภทเนื้อหา";
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
                  เรื่องที่ 1 : การสังเกตและจำแนกโฆษณาออนไลน์
                </div>

                <div className="edu-lessons__toolbar">
                  <button
                    className="edu-btn edu-btn--back"
                    type="button"
                    onClick={() => {
                      if (step === "quiz") {
                        setStep("lesson");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        return;
                      }

                      if (step === "lesson") {
                        setStep("video");
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
  <div style={{ padding: 16 }}>
    <div className="edu-taskIntro">
      <div className="edu-taskIntro__title">
        เข้าใจโฆษณาให้มากกว่าการดูป้ายกำกับ
      </div>
      <div className="edu-taskIntro__desc">
        หลังดูวิดีโอแล้ว ลองขยับจากการดู “ป้ายกำกับ” ไปสู่การมอง “เจตนา”
        ของโพสต์ ว่ากำลังสื่อสารเพื่อให้รู้ เพื่อให้เชื่อ หรือเพื่อให้ซื้อ
      </div>
    </div>

    <div style={{ marginTop: 24 }}>
      <div className="edu-card edu-adaptiveBlock">
        <div className="edu-adaptiveBlock__head">
          <div>
            <div className="edu-adaptiveBlock__title">
              4 วิธีสังเกตโฆษณาออนไลน์แบบไม่ดูแค่ป้าย
            </div>
            <div className="edu-adaptiveBlock__sub">
              อ่านเป็นลำดับจากบนลงล่าง แล้วค่อยนำไปใช้กับโพสต์จริง
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
            <div className="edu-adaptiveBlock__title">สรุปให้เห็นภาพเร็ว</div>
            <div className="edu-adaptiveBlock__sub">
              ใช้เป็นตัวช่วยก่อนเริ่มกิจกรรม
            </div>
          </div>
        </div>

        <div className="edu-box">
          <div className="edu-box__title">สรุป 3 ประเภทที่ต้องแยกให้ออก</div>
          <div className="edu-pathList" style={{ marginTop: 12 }}>
            {GUIDE_ITEMS.map((item, index) => (
              <div
                key={item.id}
                className="edu-pathRow"
                style={{ alignItems: "flex-start" }}
              >
                <div className="edu-pathRow__step">{index + 1}</div>

                <div style={{ flex: 1 }}>
                  <div className="edu-pathRow__title">{item.title}</div>
                  <div className="edu-pathRow__desc">{item.desc}</div>

                  <img
  src={item.image}
  alt={item.alt}
  style={{
    width: "100%",
    maxWidth: 560,
    marginTop: 12,
    borderRadius: 16,
    display: "block",
    objectFit: "cover",
    marginLeft: "auto",
    marginRight: "auto"
  }}
/>
                </div>


              </div>
            ))}
          </div>
        </div>

        <div className="edu-box" style={{ marginTop: 16 }}>
          <div className="edu-box__title">
            <FiCheckCircle /> วิธีคิดก่อนเริ่มกิจกรรม
          </div>
          <ul className="edu-list">
            <li>ถ้าขายชัด มีราคา โปรโมชัน หรือลิงก์สั่งซื้อแบบตรง ๆ → โฆษณาโดยตรง</li>
            <li>ถ้าดูเหมือนคอนเทนต์ปกติ แต่มีการสอดแทรกสินค้า/แบรนด์ → โฆษณาแฝง</li>
            <li>ถ้าเน้นเล่า แชร์ หรือให้ข้อมูล โดยไม่พาไปซื้อขาย → เนื้อหาทั่วไป</li>
          </ul>
        </div>
      </div>
    </div>

    <div className="edu-card edu-adaptiveBlock" style={{ marginTop: 24 }}>
      <div className="edu-adaptiveBlock__head">
        <div>
          <div className="edu-adaptiveBlock__title">ตัวอย่างที่เจอได้จริง</div>
          <div className="edu-adaptiveBlock__sub">
            ลองเชื่อมกับสิ่งที่พบในโซเชียลและเว็บไซต์
          </div>
        </div>
      </div>

      <div className="edu-actions" style={{ marginTop: 0 }}>
        {EXAMPLES.map((item) => (
          <div key={item.id} className="edu-box" style={{ width: "100%" }}>
            <div className="edu-box__title">{item.title}</div>

            <div className="edu-note" style={{ marginTop: 8 }}>
              {item.desc}
            </div>

            <div className="edu-note" style={{ marginTop: 8 }}>
              {item.hint}
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="edu-actions" style={{ marginTop: 24 }}>
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
                  อ่านตัวอย่าง แล้วเลือกว่าคือเนื้อหาแบบไหน
                </div>
                <div className="edu-taskIntro__desc">
                  ให้ดูจากภาพรวมของโพสต์ ว่ากำลังขายตรง ๆ แทรกขายแบบเนียน ๆ
                  หรือเป็นเนื้อหาทั่วไปที่ไม่ได้มีเป้าหมายทางการค้า
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