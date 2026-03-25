// src/pages/Unit4/Learn4.jsx
// ✅ Unit 4 - เรื่องที่ 4: การใช้เนื้อหาออนไลน์และลิขสิทธิ์
// Flow (ลดความซ้ำซ้อน):
// 1) เนื้อหา + Best Practice (หน้าแรก)
// 2) เลือกประเภท + กิจกรรม (เลือกวิธีใช้ + ฟีดแบ็กทันที)
// 3) Quiz (ตอบครบ → ส่ง → ดูเฉลย/คะแนน)
// ✅ เงื่อนไข: ใช้ class ที่มีอยู่แล้วเท่านั้น (ไม่เพิ่ม class ใหม่)
// ✅ UX: เห็นชัดว่า “ต้องกดอะไรต่อ” และ “ต้องทำกี่ขั้น”
// ✅ ปรับตามที่ขอ: ตัด card เลือกประเภทออกจากหน้าแรก → ย้ายไปหน้า 2 (activity)

import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

import logo from "../../assets/logo.png";

import "../../main.css";
import "../Unit1/learn.css";

// Icons
import {
  FiChevronLeft,
  FiChevronRight,
  FiHome,
  FiLogOut,
  FiUser,
  FiImage,
  FiMusic,
  FiVideo,
  FiFileText,
  FiCheckCircle,
  FiAlertTriangle,
  FiShield
} from "react-icons/fi";

/* ------------------------------------------------------------------ */
/* ✅ MICRO-LESSON CONTENT (ครบตามบรีฟ)                                  */
/* ------------------------------------------------------------------ */
const MICRO = {
  hook: {
    title: "เจอในเน็ต ≠ ใช้ได้ฟรี",
    desc:
      "ลิขสิทธิ์คือสิทธิของเจ้าของผลงานในการ “ควบคุมการใช้/คัดลอก/เผยแพร่” งานของเขา ใช้ผิดเสี่ยงโดนร้องเรียน ลบโพสต์ ตัดเสียง หรือโดนลงโทษตามกติกา"
  },
  meaning: {
    title: "ลิขสิทธิ์คืออะไร",
    bullets: [
      "เจ้าของผลงานมีสิทธิ์อนุญาตหรือห้ามใช้",
      "ครอบคลุมงานดิจิทัลด้วย (ออนไลน์ก็มีลิขสิทธิ์)",
      "การให้เครดิต “ช่วยเรื่องมารยาท” แต่ “ไม่เท่ากับได้สิทธิ์ใช้”"
    ]
  },
  examples: {
    title: "ตัวอย่างงานที่อยู่ภายใต้ลิขสิทธิ์",
    bullets: [
      "ภาพ: รูปถ่าย ภาพวาด กราฟิก โลโก้ มีม (บางเคสมีเจ้าของ)",
      "เพลง/เสียง: เพลงฮิต BGM เอฟเฟกต์เสียง เสียงพูด",
      "วิดีโอ: คลิป YouTube/TikTok หนัง ซีรีส์ ไลฟ์",
      "งานเขียน: บทความ ข่าว หนังสือ โพสต์ยาว งานวิจัย"
    ]
  }
};

/* ------------------------------------------------------------------ */
/* ✅ PRACTICAL FRAMEWORK (Best Practice)                               */
/* ------------------------------------------------------------------ */
const FRAMEWORK = {
  title: "เช็กก่อนใช้ 4 ข้อ (Best Practice)",
  steps: [
    {
      t: "1) เช็กสิทธิ์",
      d: "มีการอนุญาตไหม? มีเงื่อนไขอะไร (ใช้ได้/ห้ามแก้/ต้องใส่เครดิต/ห้ามเชิงพาณิชย์)"
    },
    {
      t: "2) เลือกของที่อนุญาต",
      d: "ถ้าไม่ชัด ให้เลือกเนื้อหาที่ระบุว่าใช้ได้ (ปลอดภัยสุด)"
    },
    {
      t: "3) ให้เครดิตให้ครบ",
      d: "ใส่ชื่อผู้สร้าง/ที่มา/ลิงก์ ตามเงื่อนไขที่เขากำหนด"
    },
    {
      t: "4) ไม่แน่ใจ = ขออนุญาต/ไม่ใช้",
      d: "อย่าเดาเอง ถ้าไม่ชัวร์ให้ขออนุญาต หรือเปลี่ยนไปใช้แหล่งที่อนุญาต"
    }
  ],
  remember: "จำง่าย: เช็กสิทธิ์ → เลือกของที่ใช้ได้ → ใส่เครดิต → ไม่ชัวร์ให้ขออนุญาต"
};

/* ------------------------------------------------------------------ */
/* ✅ CONCEPT CHECK (ประเภทเนื้อหา)                                     */
/* ------------------------------------------------------------------ */
const CONTENT_TYPES = [
  { key: "image", label: "ภาพ", icon: <FiImage /> },
  { key: "music", label: "เพลง/เสียง", icon: <FiMusic /> },
  { key: "video", label: "วิดีโอ", icon: <FiVideo /> },
  { key: "text", label: "งานเขียน", icon: <FiFileText /> }
];

/* ------------------------------------------------------------------ */
/* ✅ INTERACTIVE SCENARIOS (สถานการณ์)                                  */
/* ------------------------------------------------------------------ */
const SCENARIOS = {
  image: {
    title: "สถานการณ์: ใช้รูปจากเน็ต",
    desc: "คุณอยากใช้ภาพจากอินเทอร์เน็ตประกอบรายงานที่ส่งครู"
  },
  music: {
    title: "สถานการณ์: ใส่เพลงลงวิดีโอโซเชียล",
    desc: "คุณอยากใช้เพลงประกอบวิดีโอที่อัปลงโซเชียล"
  },
  video: {
    title: "สถานการณ์: ตัดคลิปคนอื่นมาใช้",
    desc: "คุณตัดคลิปบางส่วนจากวิดีโอคนอื่นมาใช้ในงานนำเสนอ"
  },
  text: {
    title: "สถานการณ์: นำข้อความมาใส่รายงาน",
    desc: "คุณนำข้อความจากบทความมาใส่ในรายงาน"
  }
};

/* ------------------------------------------------------------------ */
/* ✅ ACTION OPTIONS                                                     */
/* ------------------------------------------------------------------ */
const ACTIONS = [
  { id: "copy", label: "เอามาใช้เลย" },
  { id: "credit", label: "ใช้และใส่เครดิต" },
  { id: "ask", label: "ขออนุญาตเจ้าของ" },
  { id: "free", label: "เลือกของที่อนุญาตให้ใช้ได้" }
];

/* ------------------------------------------------------------------ */
/* ✅ FEEDBACK: แยกตามประเภท + การเลือก                                  */
/* ------------------------------------------------------------------ */
const FEEDBACK_BY_TYPE = {
  image: {
    copy: {
      level: "bad",
      title: "ไม่เหมาะ ⚠️",
      text: "รูปมีเจ้าของ เอามาใช้เลยเสี่ยงละเมิดลิขสิทธิ์",
      fix: "เช็กสิทธิ์ → ถ้าไม่ชัดให้เปลี่ยนไปใช้ภาพที่อนุญาต + ใส่เครดิต"
    },
    credit: {
      level: "ok",
      title: "ยังไม่พอ",
      text: "ให้เครดิตดี แต่ยังต้องเช็กว่าเขาอนุญาตให้ใช้ไหม",
      fix: "เลือกภาพที่ระบุอนุญาตให้ใช้ได้ แล้วค่อยใส่เครดิต"
    },
    ask: {
      level: "good",
      title: "เหมาะ ✅",
      text: "ขออนุญาตก่อน = เคารพเจ้าของ และลดความเสี่ยง",
      fix: "ขอแบบสั้น ๆ ระบุว่าจะใช้ที่ไหน/เพื่ออะไร/เผยแพร่ไหม"
    },
    free: {
      level: "good",
      title: "เหมาะสุด ✅",
      text: "เลือกภาพที่อนุญาตให้ใช้ได้ = ปลอดภัยสุด",
      fix: "อย่าลืมใส่เครดิตตามเงื่อนไข"
    }
  },
  music: {
    copy: {
      level: "bad",
      title: "ไม่เหมาะ ⚠️",
      text: "เพลงมักโดนตรวจจับ อาจตัดเสียง/ลบคลิป",
      fix: "ใช้เพลงที่มีสิทธิ์ใช้งาน (อนุญาตชัด/มีไลเซนส์/แหล่งที่ให้ใช้ได้)"
    },
    credit: {
      level: "ok",
      title: "ยังไม่พอ",
      text: "ใส่เครดิตไม่เท่ากับได้สิทธิ์ใช้เพลง",
      fix: "ต้องเช็ก/มีสิทธิ์ก่อน แล้วค่อยเครดิต"
    },
    ask: {
      level: "good",
      title: "เหมาะ ✅",
      text: "ขออนุญาตเจ้าของก่อนช่วยลดความเสี่ยง",
      fix: "เก็บหลักฐานการอนุญาตไว้ เผื่อโดนร้องเรียน"
    },
    free: {
      level: "good",
      title: "เหมาะสุด ✅",
      text: "เลือกเพลงที่อนุญาตให้ใช้ได้ = ปลอดภัยสำหรับโซเชียล",
      fix: "เช็กเงื่อนไขเพิ่ม: ต้องเครดิตไหม/ใช้เชิงพาณิชย์ได้ไหม"
    }
  },
  video: {
    copy: {
      level: "bad",
      title: "ไม่เหมาะ ⚠️",
      text: "ตัดคลิปมาใช้เลยโดยไม่เช็กสิทธิ์/ไม่อ้างอิง เสี่ยงโดนร้องเรียน",
      fix: "ใช้เท่าที่จำเป็น + อ้างอิงที่มา + ขออนุญาตถ้าใช้เยอะ/เผยแพร่"
    },
    credit: {
      level: "ok",
      title: "ดีขึ้น",
      text: "มีที่มาแล้ว แต่ยังต้องดูว่าอนุญาตให้เอาไปใช้ไหม",
      fix: "ถ้าไม่ชัด ให้ขออนุญาต หรือใช้คลิปที่อนุญาตชัด"
    },
    ask: {
      level: "good",
      title: "เหมาะ ✅",
      text: "ขออนุญาตก่อน โดยเฉพาะถ้าจะใช้ยาวหรือเผยแพร่ต่อ",
      fix: "ระบุความยาวคลิป + บริบทการใช้ จะอนุมัติง่ายขึ้น"
    },
    free: {
      level: "good",
      title: "เหมาะสุด ✅",
      text: "เลือกคลิปที่อนุญาตให้ใช้ได้ = ลดปัญหาลิขสิทธิ์",
      fix: "ใส่เครดิตตามเงื่อนไข และใช้เท่าที่จำเป็น"
    }
  },
  text: {
    copy: {
      level: "bad",
      title: "ไม่เหมาะ ⚠️",
      text: "ก็อปยาว ๆ เสี่ยงลอกงานและละเมิดลิขสิทธิ์",
      fix: "สรุปด้วยคำตัวเอง + ใส่อ้างอิง/แหล่งที่มา"
    },
    credit: {
      level: "ok",
      title: "พอใช้ได้",
      text: "มีเครดิตแล้ว แต่ถ้าคัดลอกยาวเกินก็ยังไม่ดี",
      fix: "สรุปเองให้มากขึ้น แล้วอ้างอิงสั้นชัด"
    },
    ask: {
      level: "good",
      title: "เหมาะ ✅",
      text: "ถ้าจะคัดลอกเยอะ/เผยแพร่ต่อ ขออนุญาตก่อนดีที่สุด",
      fix: "ขอเฉพาะส่วนที่จำเป็นจริง ๆ"
    },
    free: {
      level: "good",
      title: "เหมาะ ✅",
      text: "เลือกแหล่งที่อนุญาตให้ใช้ซ้ำ/เปิดให้ใช้ = ลดความเสี่ยง",
      fix: "ยังควรใส่อ้างอิงเพื่อความน่าเชื่อถือ"
    }
  }
};

/* ------------------------------------------------------------------ */
/* ✅ MINI QUIZ                                                         */
/* ------------------------------------------------------------------ */
const QUIZ = [
  {
    id: "q1",
    prompt: "ข้อไหนถูกที่สุดเกี่ยวกับ ‘เครดิต’ ?",
    answer: "B",
    choices: [
      { id: "A", label: "A) ใส่เครดิตแล้ว ใช้ได้เสมอ" },
      { id: "B", label: "B) ใส่เครดิตดี แต่ยังต้องเช็กสิทธิ์การใช้" },
      { id: "C", label: "C) ไม่ต้องเครดิตถ้าเป็นงานเรียน" }
    ],
    feedback: {
      A: "ไม่ถูก ❌ เครดิตไม่เท่ากับได้สิทธิ์ใช้",
      B: "ถูก ✅ เครดิตเป็นมารยาท แต่สิทธิ์ต้องเช็กก่อน",
      C: "ไม่ถูก ❌ งานเรียนก็ยังควรอ้างอิงเพื่อความน่าเชื่อถือ"
    }
  },
  {
    id: "q2",
    prompt: "ถ้า ‘ไม่แน่ใจว่างานอนุญาตให้ใช้ไหม’ ควรทำข้อไหน?",
    answer: "C",
    choices: [
      { id: "A", label: "A) ใช้ไปก่อน เดี๋ยวค่อยแก้" },
      { id: "B", label: "B) ใส่เครดิตก็พอ" },
      { id: "C", label: "C) ขออนุญาต หรือเปลี่ยนไปใช้แหล่งที่อนุญาต" }
    ],
    feedback: {
      A: "ไม่แนะนำ ❌ เสี่ยงโดนร้องเรียน/โดนตัดเสียง/ลบงาน",
      B: "ยังไม่พอ ❌ เครดิตไม่ทำให้ถูกกติกา",
      C: "ถูก ✅ ทางปลอดภัยสุด"
    }
  },
  {
    id: "q3",
    prompt: "ข้อไหนเป็น ‘Best Practice’ ก่อนใช้เนื้อหาออนไลน์?",
    answer: "A",
    choices: [
      { id: "A", label: "A) เช็กสิทธิ์ → เลือกของที่ใช้ได้ → ใส่เครดิต" },
      { id: "B", label: "B) ก็อปมาใช้เลย ถ้าไม่ขายของ" },
      { id: "C", label: "C) ใช้ได้ถ้าหาใน Google เจอ" }
    ],
    feedback: {
      A: "ถูก ✅ ตรงตามกรอบเช็กก่อนใช้",
      B: "ไม่ถูก ❌ ไม่ขายของก็ยังละเมิดได้",
      C: "ไม่ถูก ❌ เจอในเน็ตไม่ได้แปลว่าใช้ฟรี"
    }
  }
];

export default function Learn4Unit4() {
  // =========================================================
  // ✅ Router helpers
  // =========================================================
  const navigate = useNavigate();
  const location = useLocation();

  // =========================================================
  // ✅ mode เผื่อใช้ต่อ (ยังคงไว้ แต่ไม่ทำให้ UX รก)
  // =========================================================
  const mode = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    return sp.get("mode") || "all";
  }, [location.search]);

  // =========================================================
  // ✅ UI state
  // =========================================================
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");

  /**
   * ✅ step flow (ลดจำนวนหน้า)
   * - lesson (เนื้อหา + Best Practice)
   * - activity (เลือกประเภท + เลือกวิธี + ฟีดแบ็ก)
   * - quiz
   */
  const [step, setStep] = useState("lesson");

  // =========================================================
  // ✅ Interactive states
  // =========================================================
  const [scenarioKey, setScenarioKey] = useState("image");
  const [selectedAction, setSelectedAction] = useState(null);

  // =========================================================
  // ✅ Quiz states
  // =========================================================
  const [answers, setAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // =========================================================
  // ✅ Derived values
  // =========================================================
  const scenario = SCENARIOS[scenarioKey];

  const feedback = useMemo(() => {
    if (!selectedAction) return null;
    return FEEDBACK_BY_TYPE?.[scenarioKey]?.[selectedAction] ?? null;
  }, [selectedAction, scenarioKey]);

  const quizAllAnswered = useMemo(() => Object.keys(answers).length === QUIZ.length, [answers]);

  const quizScore = useMemo(() => {
    let s = 0;
    for (const q of QUIZ) {
      if (answers[q.id] === q.answer) s += 1;
    }
    return s;
  }, [answers]);

  // =========================================================
  // ✅ Simple progress (แทนแท็บหลายปุ่ม)
  // =========================================================
  const flow = useMemo(
    () => [
      { key: "lesson", label: "1) เนื้อหา" },
      { key: "activity", label: "2) กิจกรรม" },
      { key: "quiz", label: "3) Quiz" }
    ],
    []
  );

  const currentIndex = useMemo(() => flow.findIndex((f) => f.key === step), [flow, step]);

  const progressLabel = useMemo(() => {
    const cur = currentIndex >= 0 ? currentIndex + 1 : 1;
    return `ขั้นตอน ${cur} / ${flow.length} • ${flow[cur - 1]?.label ?? ""}`;
  }, [currentIndex, flow]);

  const panelTitle = useMemo(() => {
    if (step === "lesson") return "ลิขสิทธิ์: เข้าใจให้ชัดก่อนใช้";
    if (step === "activity") return "กิจกรรม: เลือกวิธีใช้เนื้อหาให้ถูก";
    return "Mini quiz";
  }, [step]);

  // =========================================================
  // ✅ Inline styles (ไม่เพิ่ม class ใหม่)
  // =========================================================
  const softText = { fontSize: 13, opacity: 0.85, lineHeight: 1.6 };

  const cardBox = {
    borderRadius: 16,
    border: "1px solid rgba(0,0,0,0.08)",
    background: "rgba(255,255,255,0.55)",
    padding: 14
  };

  const infoCardStyle = {
    borderRadius: 14,
    border: "1px solid rgba(0,0,0,0.08)",
    background: "rgba(255,255,255,0.55)",
    padding: 12
  };

  const sectionTitleStyle = { fontWeight: 950, marginBottom: 6 };

  const feedbackStyle = useMemo(() => {
    if (!feedback?.level) return null;

    // ✅ แยกสีตามระดับ (คงเดิม)
    if (feedback.level === "good") {
      return {
        borderRadius: 12,
        border: "1px solid rgba(16,185,129,0.25)",
        background: "rgba(16,185,129,0.10)",
        padding: 12
      };
    }

    if (feedback.level === "ok") {
      return {
        borderRadius: 12,
        border: "1px solid rgba(59,130,246,0.20)",
        background: "rgba(59,130,246,0.08)",
        padding: 12
      };
    }

    return {
      borderRadius: 12,
      border: "1px solid rgba(245,158,11,0.25)",
      background: "rgba(245,158,11,0.10)",
      padding: 12
    };
  }, [feedback]);

  // =========================================================
  // ✅ AUTH
  // =========================================================
  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);

      // ✅ เช็ก session
      const { data } = await supabase.auth.getSession();
      const u = data.session?.user;

      // ✅ ไม่มี user → ไป login
      if (!u) {
        navigate("/login", { replace: true });
        return;
      }

      // ✅ โหลดชื่อผู้เรียน
      const { data: profile } = await supabase
        .from("student_profiles")
        .select("first_name,last_name")
        .eq("user_id", u.id)
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

  // =========================================================
  // ✅ Helpers: เปลี่ยนประเภทเนื้อหาแบบไม่ซ้ำโค้ด
  // =========================================================
  const pickContentType = (key) => {
    setScenarioKey(key);
    setSelectedAction(null);
  };

  // =========================================================
  // ✅ Helpers: ไป step ต่อไป / ย้อนกลับ
  // =========================================================
  const goNext = () => {
    if (step === "lesson") {
      setStep("activity");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (step === "activity") {
      setQuizSubmitted(false);
      setAnswers({});
      setStep("quiz");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    // quiz ไม่มี next แบบบังคับ (ใช้ปุ่ม “เสร็จสิ้น”)
  };

  const goBack = () => {
    if (step === "quiz") return setStep("activity");
    if (step === "activity") return setStep("lesson");
    navigate(-1);
  };

  return (
    <div className="edu-app">
      {/* TOPBAR */}
      <header className="edu-topbar">
        <div className="edu-topbar__inner">
          <div className="homebar__brand" role="banner">
            <img src={logo} alt="LearnSecure logo" className="homebar__logo" />
            <div className="edu-brandtext">
              <div className="edu-brandtext__title">LearnSecure</div>
              <div className="edu-brandtext__subtitle">Unit 4.4</div>
            </div>
          </div>

          <div className="edu-topbar__right">
            <div className="edu-userchip" title={studentName || "Student"}>
              <div className="edu-userchip__avatar" aria-hidden="true">
                <FiUser />
              </div>
              <div className="edu-userchip__meta">
                <div className="edu-userchip__name">{loading ? "กำลังโหลด..." : studentName || "ผู้เรียน"}</div>
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
              <FiLogOut aria-hidden="true" /> ออก
            </button>
          </div>
        </div>
      </header>

      <main className="edu-layout">
        {/* HERO */}
        <section className="edu-hero" aria-label="Unit 4 header">
          <div className="edu-hero__card">
            <div className="edu-hero__row">
              <div className="edu-hero__headline">
                <div className="edu-hero__title">Unit 4 : การสื่อสารและมารยาทดิจิทัล</div>
<div className="edu-hero__sub">เรื่องที่ 4	การใช้เนื้อหาออนไลน์และลิขสิทธิ์

</div>
                <div className="edu-lessons__toolbar">
                  <button className="edu-btn edu-btn--back" type="button" onClick={goBack}>
                    <FiChevronLeft aria-hidden="true" /> กลับ
                  </button>

                  <button className="edu-btn edu-btn--ghost" type="button" onClick={() => navigate("/main")} style={{ marginLeft: 8 }}>
                    <FiHome aria-hidden="true" /> หน้าหลัก
                  </button>
                </div>
              </div>

              <div className="edu-lessons__meta">{/* เว้นไว้ */}</div>
            </div>
          </div>
        </section>

        {/* CONTENT */}
        <section className="edu-panel1">
          <div className="edu-panel1__head" style={{ alignItems: "flex-start" }}>
            <div className="edu-panel1__title">
              <FiFileText aria-hidden="true" />
              {panelTitle}
            </div>

            {/* ✅ แทนแท็บหลายปุ่มด้วย “progress chip” (ลดรก + ยังรู้ว่าทำถึงไหน) */}
            {/* (เว้นไว้ตามไฟล์เดิม) */}
          </div>

          {/* =========================================================
              ✅ STEP 1: Lesson + Best Practice (ตัด card เลือกประเภทออกแล้ว)
             ========================================================= */}
          {step === "lesson" && (
            <div style={{ padding: 16 }}>
              <div className="edu-card">
                <div className="edu-card__title">อ่าน 2 นาที + เตรียมทำกิจกรรม</div>

                <div className="edu-card__body" style={{ display: "grid", gap: 12 }}>
                  {/* Hook */}
                  <div
                    style={{
                      borderRadius: 14,
                      border: "1px solid rgba(99,102,241,0.20)",
                      background: "rgba(99,102,241,0.08)",
                      padding: 12,
                      display: "flex",
                      gap: 10,
                      alignItems: "flex-start"
                    }}
                  >
                    <FiShield aria-hidden="true" />
                    <div>
                      <div style={{ fontWeight: 950 }}>{MICRO.hook.title}</div>
                      <div style={{ fontSize: 13, opacity: 0.9, marginTop: 6, lineHeight: 1.6 }}>{MICRO.hook.desc}</div>
                    </div>
                  </div>

                  {/* Meaning */}
                  <div style={infoCardStyle}>
                    <div style={sectionTitleStyle}>{MICRO.meaning.title}</div>
                    <ul style={{ margin: "6px 0 0 18px", fontSize: 13, opacity: 0.92, lineHeight: 1.7 }}>
                      {MICRO.meaning.bullets.map((b, i) => (
                        <li key={`m-${i}`}>{b}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Examples */}
                  <div style={infoCardStyle}>
                    <div style={sectionTitleStyle}>{MICRO.examples.title}</div>
                    <ul style={{ margin: "6px 0 0 18px", fontSize: 13, opacity: 0.92, lineHeight: 1.7 }}>
                      {MICRO.examples.bullets.map((b, i) => (
                        <li key={`e-${i}`}>{b}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Best Practice */}
                  <div style={cardBox}>
                    <div style={{ fontSize: 16, fontWeight: 950, marginBottom: 6 }}>{FRAMEWORK.title}</div>
                    <div style={softText}>ใช้เป็นเช็กลิสต์ก่อนหยิบงานคนอื่นมาใช้</div>

                    <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                      {FRAMEWORK.steps.map((s, idx) => (
                        <div key={`fw-${idx}`} style={infoCardStyle}>
                          <div style={{ fontWeight: 950 }}>{s.t}</div>
                          <div style={{ marginTop: 6, fontSize: 13, opacity: 0.9, lineHeight: 1.6 }}>{s.d}</div>
                        </div>
                      ))}
                    </div>

                    <div className="edu-callout" style={{ marginTop: 12 }}>
                      <div style={{ fontWeight: 950 }}>จำสั้น ๆ</div>
                      <div style={{ marginTop: 6, opacity: 0.9, lineHeight: 1.6 }}>{FRAMEWORK.remember}</div>
                    </div>

                    {/* CTA: บอกชัดว่าขั้นต่อไปทำอะไร (ไม่ต้องเลือกประเภทในหน้านี้แล้ว) */}
                    <div
                      style={{
                        marginTop: 12,
                        borderRadius: 14,
                        border: "1px solid rgba(16,185,129,0.20)",
                        background: "rgba(16,185,129,0.08)",
                        padding: 12
                      }}
                    >
                      <div style={{ fontWeight: 950 }}>ต่อไปทำอะไร?</div>
                      <div style={{ marginTop: 6, fontSize: 13, opacity: 0.9, lineHeight: 1.6 }}>
                        ไปที่ <b>กิจกรรม</b> แล้วเลือก <b>ประเภทเนื้อหา</b> + เลือก “วิธีใช้” ระบบจะบอกผลทันที
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button className="edu-btn edu-btn--primary" type="button" onClick={goNext}>
                    ไปทำกิจกรรม <FiChevronRight aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              ✅ STEP 2: Activity (ย้าย “เลือกประเภทเนื้อหา” มาอยู่หน้านี้)
             ========================================================= */}
          {step === "activity" && (
            <div style={{ padding: 16 }}>
              <div style={cardBox}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 950, marginBottom: 6 }}>กิจกรรม: เลือกวิธีใช้ให้ถูก</div>
                    <div style={softText}>เริ่มจากเลือก “ประเภทเนื้อหา” แล้วเลือก 1 วิธี ระบบจะบอกผลลัพธ์ทันที</div>
                  </div>

                  {/* บอกสถานะสั้น ๆ */}
                  <div style={{ fontSize: 12, opacity: 0.8, alignSelf: "center" }}>
                    ประเภท: <b>{CONTENT_TYPES.find((c) => c.key === scenarioKey)?.label ?? "—"}</b>
                    {" • "}
                    วิธี: <b>{selectedAction ? ACTIONS.find((a) => a.id === selectedAction)?.label ?? "—" : "—"}</b>
                  </div>
                </div>

                {/* เลือกประเภท (ย้ายมาอยู่หน้า 2 ตามที่ขอ) */}
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontWeight: 950, marginBottom: 8 }}>1) เลือกประเภทเนื้อหา</div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {CONTENT_TYPES.map((c) => (
                      <button
                        key={c.key}
                        className={`u13-token ${scenarioKey === c.key ? "is-selected" : ""}`}
                        type="button"
                        onClick={() => pickContentType(c.key)}
                      >
                        {c.icon} {c.label}
                      </button>
                    ))}
                  </div>

                  <div className="edu-callout" style={{ marginTop: 12 }}>
                    <div style={{ fontWeight: 950 }}>{scenario.title}</div>
                    <div style={{ marginTop: 6, opacity: 0.9, lineHeight: 1.6 }}>{scenario.desc}</div>
                  </div>

                  <div
                    style={{
                      marginTop: 12,
                      borderRadius: 14,
                      border: "1px solid rgba(59,130,246,0.20)",
                      background: "rgba(59,130,246,0.08)",
                      padding: 12
                    }}
                  >
                    <div style={{ fontWeight: 950 }}>ทิป</div>
                    <div style={{ marginTop: 6, fontSize: 13, opacity: 0.9, lineHeight: 1.6 }}>
                      เปลี่ยนประเภทได้ตลอด ระบบจะรีเซ็ต “วิธีใช้” ให้ใหม่อัตโนมัติ
                    </div>
                  </div>
                </div>

                {/* เลือกวิธี */}
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontWeight: 950, marginBottom: 8 }}>2) คุณจะใช้แบบไหน</div>
                  <div className="u13-grid">
                    {ACTIONS.map((a) => (
                      <button
                        key={a.id}
                        className={`u13-card ${selectedAction === a.id ? "is-active" : ""}`}
                        type="button"
                        onClick={() => setSelectedAction(a.id)}
                      >
                        <div className="u13-card-row">
                          <div className="u13-card-title">{a.label}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* ผลลัพธ์ */}
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontWeight: 950, marginBottom: 8 }}>3) ผลลัพธ์</div>

                  {!selectedAction && <div className="edu-callout">เลือก 1 วิธี เพื่อดูผลลัพธ์</div>}

                  {selectedAction && feedback && (
                    <div style={feedbackStyle}>
                      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        {feedback.level === "bad" ? <FiAlertTriangle aria-hidden="true" /> : <FiCheckCircle aria-hidden="true" />}

                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 950 }}>{feedback.title}</div>
                          <div style={{ marginTop: 6, opacity: 0.9, lineHeight: 1.6 }}>{feedback.text}</div>
                          <div style={{ marginTop: 10, opacity: 0.92, lineHeight: 1.6 }}>
                            <b>ทำให้ถูก:</b> {feedback.fix}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ปุ่มไปต่อ */}
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                  <button className="edu-btn edu-btn--back" type="button" onClick={goBack}>
                    <FiChevronLeft aria-hidden="true" /> กลับไปเนื้อหา
                  </button>

                  <button className="edu-btn edu-btn--primary" type="button" onClick={goNext}>
                    ไปทำ Quiz <FiChevronRight aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              ✅ STEP 3: Mini quiz + feedback
             ========================================================= */}
          {step === "quiz" && (
            <div style={{ padding: 16 }}>
              <div style={cardBox}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 950, marginBottom: 6 }}>Mini quiz</div>
                    <div style={softText}>ตอบให้ครบ แล้วกดส่งเพื่อดูเฉลยทันที</div>
                  </div>

                  <div style={{ fontSize: 12, opacity: 0.8, alignSelf: "center" }}>
                    ตอบแล้ว {Object.keys(answers).length} / {QUIZ.length}
                  </div>
                </div>

                {/* ข้อสอบ */}
                <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
                  {QUIZ.map((q, idx) => {
                    const picked = answers[q.id];
                    const isCorrect = quizSubmitted && picked === q.answer;
                    const isWrong = quizSubmitted && picked && picked !== q.answer;

                    return (
                      <div
                        key={q.id}
                        style={{
                          borderRadius: 14,
                          border: "1px solid rgba(0,0,0,0.08)",
                          background: "rgba(255,255,255,0.55)",
                          padding: 12
                        }}
                      >
                        <div style={{ fontWeight: 900, marginBottom: 6 }}>
                          {idx + 1}. {q.prompt}
                        </div>

                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
                          {q.choices.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                setAnswers((prev) => ({ ...prev, [q.id]: c.id }));
                                if (quizSubmitted) setQuizSubmitted(false);
                              }}
                              style={{
                                borderRadius: 999,
                                border: picked === c.id ? "1px solid rgba(59,130,246,0.45)" : "1px solid rgba(0,0,0,0.10)",
                                background: picked === c.id ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.70)",
                                padding: "8px 12px",
                                fontSize: 13,
                                fontWeight: 800,
                                cursor: "pointer"
                              }}
                              aria-pressed={picked === c.id}
                            >
                              {c.label}
                            </button>
                          ))}
                        </div>

                        {/* เฉลย */}
                        {quizSubmitted && (
                          <div style={{ marginTop: 10 }}>
                            {isCorrect && (
                              <div
                                style={{
                                  display: "flex",
                                  gap: 10,
                                  alignItems: "flex-start",
                                  padding: 10,
                                  borderRadius: 12,
                                  border: "1px solid rgba(16,185,129,0.25)",
                                  background: "rgba(16,185,129,0.10)"
                                }}
                              >
                                <FiCheckCircle aria-hidden="true" />
                                <div>
                                  <div style={{ fontWeight: 900 }}>ถูกต้อง</div>
                                  <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>{q.feedback?.[picked] ?? "ดีมาก"}</div>
                                </div>
                              </div>
                            )}

                            {isWrong && (
                              <div
                                style={{
                                  display: "flex",
                                  gap: 10,
                                  alignItems: "flex-start",
                                  padding: 10,
                                  borderRadius: 12,
                                  border: "1px solid rgba(245,158,11,0.25)",
                                  background: "rgba(245,158,11,0.10)"
                                }}
                              >
                                <FiAlertTriangle aria-hidden="true" />
                                <div>
                                  <div style={{ fontWeight: 900 }}>ยังไม่ตรง (เฉลย: {q.answer})</div>
                                  <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>{q.feedback?.[picked] ?? "ลองใหม่ได้"}</div>
                                </div>
                              </div>
                            )}

                            {!picked && (
                              <div
                                style={{
                                  display: "flex",
                                  gap: 10,
                                  alignItems: "flex-start",
                                  padding: 10,
                                  borderRadius: 12,
                                  border: "1px solid rgba(220,38,38,0.18)",
                                  background: "rgba(220,38,38,0.08)"
                                }}
                              >
                                <FiAlertTriangle aria-hidden="true" />
                                <div>
                                  <div style={{ fontWeight: 900 }}>ยังไม่ได้เลือกคำตอบ</div>
                                  <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>เลือก 1 ตัวเลือกก่อน</div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* ปุ่มส่ง + จบ */}
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                  <button className="edu-btn edu-btn--back" type="button" onClick={goBack}>
                    <FiChevronLeft aria-hidden="true" /> กลับไปกิจกรรม
                  </button>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button
                      className="edu-btn edu-btn--primary"
                      type="button"
                      onClick={() => {
                        setQuizSubmitted(true);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      disabled={!quizAllAnswered}
                      title={!quizAllAnswered ? "ตอบให้ครบทุกข้อก่อน" : "ส่งคำตอบเพื่อดูเฉลย"}
                    >
                      ส่งคำตอบ <FiChevronRight aria-hidden="true" />
                    </button>

                    {quizSubmitted && (
                      <button className="edu-btn edu-btn--ghost" type="button" onClick={() => navigate("/unit4/learn")}>
                        เสร็จสิ้น <FiChevronRight aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>

                {/* สรุปคะแนน */}
                {quizSubmitted && (
                  <div style={{ marginTop: 12 }}>
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "center",
                        padding: 10,
                        borderRadius: 12,
                        border: "1px solid rgba(59,130,246,0.20)",
                        background: "rgba(59,130,246,0.08)"
                      }}
                    >
                      <FiCheckCircle aria-hidden="true" />
                      <div>
                        <div style={{ fontWeight: 950 }}>สรุปคะแนน</div>
                        <div style={{ fontSize: 13, opacity: 0.9, marginTop: 2 }}>
                          ได้ {quizScore} / {QUIZ.length}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* หมายเหตุเล็ก ๆ (ไม่รก) */}
                {mode !== "all" && (
                  <div style={{ marginTop: 10, fontSize: 12, opacity: 0.65 }}>
                    โหมด: <b>{mode}</b>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
