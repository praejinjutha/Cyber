import { useEffect, useMemo, useState } from "react"; // ✅ React hooks
import { useLocation, useNavigate } from "react-router-dom"; // ✅ Router helpers
import { supabase } from "../../lib/supabase"; // ✅ Supabase auth/profile

import logo from "../../assets/logo.png"; // ✅ Brand logo

// ✅ CSS (ใช้ชุดเดียวกับโปรเจกต์)
import "../../main.css";
import "../Unit1/learn.css";

// ✅ Icons
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
  FiImage,
  FiMapPin,
  FiMessageSquare,
  FiEyeOff,
} from "react-icons/fi";

/* ------------------------------------------------------------------ */
/* ✅ MICRO-LESSON CONTENT                                              */
/* ------------------------------------------------------------------ */
const MICRO = {
  hook: {
    title: "ข้อมูลของคนอื่น ≠ ของที่แชร์ได้ตามใจ",
    desc:
      "ต่อให้เรา “ได้มาในแชท” หรือ “เห็นในออนไลน์” ถ้ามันระบุตัวคนได้ การแชร์ต่อโดยไม่ขออนุญาตอาจทำให้เขาอับอาย ถูกคุกคาม หรือเกิดอันตรายจริงได้",
  },
  whatIsPII: {
    title: "ข้อมูลส่วนบุคคลของผู้อื่น (ที่เจอในชีวิตจริงบ่อย)",
    bullets: [
      "ภาพ/วิดีโอที่เห็นหน้า เห็นรูปร่าง หรือรู้ว่าเป็นใคร",
      "ชื่อ–นามสกุล ชื่อเล่นที่ชี้ไปถึงตัวคนได้ หรือบัญชีโซเชียล",
      "สถานที่: โรงเรียน ที่ทำงาน บ้าน พิกัด/เช็กอิน",
      "แชทส่วนตัว/สกรีนช็อต/ข้อความที่ส่งเฉพาะคน",
      "เสียง หรือข้อมูลประกอบที่เชื่อมโยงไปหาตัวคนได้",
    ],
    cue: "จำง่าย: ถ้าคนอื่นดูแล้ว ‘รู้ว่าเป็นใคร’ = เข้าข่ายข้อมูลส่วนบุคคล",
  },
  whatIsNot: {
    title: "อะไรที่มักดู ‘ไม่ใช่’ ข้อมูลส่วนบุคคลของคนอื่น",
    bullets: [
      "ข่าวสาธารณะจากแหล่งข่าว/ประกาศที่เผยแพร่ทั่วไป",
      "ข้อมูลทั่วไปที่ไม่ระบุตัวคน (ไม่มีชื่อ/หน้า/พิกัด/รายละเอียดเชื่อมโยง)",
      "ความคิดเห็นของเราเองที่ไม่เปิดข้อมูลระบุตัวตนของผู้อื่น",
    ],
  },
  permission: {
    title: "เมื่อไหร่ควรขออนุญาตก่อนโพสต์",
    bullets: [
      "มีหน้า/ชื่อ/พิกัด/ข้อมูลที่ทำให้รู้ว่าเป็นใคร",
      "เป็นภาพจากแชทส่วนตัว หรือส่งให้ดูเฉพาะกลุ่มเล็ก",
      "เนื้อหาอาจทำให้อีกฝ่ายเสียหน้า อับอาย หรือถูกเข้าใจผิด",
      "เราไม่ชัวร์ว่าเจ้าของโอเคหรือไม่",
    ],
    cue: "กติกาเซฟสุด: ไม่ชัวร์ = ขออนุญาต / ไม่โพสต์",
  },
  doWhenReceive: {
    title: "ได้รูป/ข้อมูลของคนอื่นมา ควรทำยังไง",
    bullets: [
      "ตรวจสอบก่อนว่า ‘ระบุตัวตนได้ไหม’",
      "ขออนุญาตก่อนเผยแพร่ทุกครั้ง (ขอให้ชัด: โพสต์ที่ไหน/ให้ใครเห็น)",
      "ถ้าจำเป็นต้องแชร์: ปิดข้อมูลระบุตัวตน (บังหน้า/ชื่อ/พิกัด) และยังต้องขออนุญาตถ้าเป็นข้อมูลส่วนตัว",
      "ไม่จำเป็น = ไม่เผยแพร่",
      "อย่าส่งต่อให้คนอื่นตัดสินใจแทน (ยิ่งคนเยอะ ยิ่งเสี่ยง)",
    ],
  },
};

/* ------------------------------------------------------------------ */
/* ✅ Interactive Simulation Workshop                                    */
/* ------------------------------------------------------------------ */
const ACTIONS = [
  { id: "share", label: "แชร์/โพสต์เลย" },
  { id: "ask", label: "ขออนุญาตเจ้าของก่อน" },
  { id: "redact", label: "ปิดข้อมูลระบุตัวตนก่อน (บังหน้า/ชื่อ/พิกัด)" },
  { id: "dont", label: "ไม่เผยแพร่/หยุดแชร์" },
  { id: "forward", label: "ส่งต่อให้คนอื่นตัดสินใจแทน" },
];

const WORKSHOP = [
  {
    id: "w1",
    icon: <FiImage />,
    title: "ได้รูปเพื่อนจากแชท",
    desc: "เพื่อนส่งรูปส่วนตัวมาในแชท แล้วคุณคิดจะแชร์ลงสตอรี่ให้คนดู",
    best: ["ask", "dont"],
    ok: ["redact"],
    feedback: {
      share: {
        level: "bad",
        title: "ไม่เหมาะ ⚠️",
        text: "รูปมาจากแชทส่วนตัว + ระบุตัวคนได้ → แชร์ต่อโดยไม่ขออนุญาตเสี่ยงกระทบเจ้าของรูป",
        fix: "รู้สึกไม่ชัวร์ = ขออนุญาตก่อน หรือเลือกไม่โพสต์",
      },
      ask: {
        level: "good",
        title: "เหมาะ ✅",
        text: "ขออนุญาตก่อน = เคารพเจ้าของข้อมูล และลดความเสี่ยง",
        fix: "ขอให้ชัดว่าโพสต์ที่ไหน/ให้ใครเห็น/ลบได้ไหมถ้าไม่โอเค",
      },
      redact: {
        level: "ok",
        title: "ดีขึ้น แต่ยังไม่พอ",
        text: "บังหน้า/ชื่อช่วยลดความเสี่ยง แต่ถ้าเป็นรูปส่วนตัว ‘ยังควรถามเจ้าของ’ ก่อน",
        fix: "ทำสองอย่างคู่กัน: ขออนุญาต + ปิดข้อมูลระบุตัวตน",
      },
      dont: {
        level: "good",
        title: "เหมาะ ✅",
        text: "ไม่เผยแพร่ = เซฟสุดเมื่อไม่ชัวร์ และช่วยปกป้องเจ้าของข้อมูล",
        fix: "ถ้าจำเป็นต้องใช้จริง ๆ ค่อยขออนุญาตก่อน",
      },
      forward: {
        level: "bad",
        title: "ไม่เหมาะ ⚠️",
        text: "ส่งต่อให้คนอื่นตัดสินใจแทน = ยิ่งคนเยอะ ยิ่งเสี่ยงหลุดและควบคุมไม่ได้",
        fix: "ให้เจ้าของรูปเป็นคนตัดสินใจ หรือขออนุญาตโดยตรง",
      },
    },
  },
  {
    id: "w2",
    icon: <FiMapPin />,
    title: "ภาพมีชื่อ + สถานที่",
    desc: "คุณอยากโพสต์รูปเพื่อน พร้อมแท็กชื่อและเช็กอินสถานที่ที่อยู่ตอนนี้",
    best: ["ask"],
    ok: ["redact", "dont"],
    feedback: {
      share: {
        level: "bad",
        title: "ไม่เหมาะ ⚠️",
        text: "ชื่อ + สถานที่/เช็กอิน ทำให้ตามตัวได้ง่าย เสี่ยงความปลอดภัย",
        fix: "ขออนุญาตก่อนเสมอ และหลีกเลี่ยงการลงพิกัดแบบเรียลไทม์",
      },
      ask: {
        level: "good",
        title: "เหมาะ ✅",
        text: "ขออนุญาตก่อน = ให้เจ้าของข้อมูลมีสิทธิ์เลือกว่าพร้อมให้เผยแพร่ไหม",
        fix: "ถ้าจะเช็กอิน แนะนำถามเพิ่มว่า ‘โอเคไหมถ้าระบุสถานที่’",
      },
      redact: {
        level: "ok",
        title: "ดีขึ้น",
        text: "ไม่แท็กชื่อ/ไม่ใส่พิกัดช่วยลดความเสี่ยง แต่ถ้าเป็นรูปเพื่อนก็ยังควรถามก่อนโพสต์",
        fix: "ขออนุญาต + ตัดข้อมูลเสี่ยง (ชื่อ/พิกัด) จะเซฟสุด",
      },
      dont: {
        level: "good",
        title: "เหมาะ ✅",
        text: "ถ้าไม่แน่ใจว่าเพื่อนโอเคหรือเปล่า การไม่โพสต์คือทางปลอดภัย",
        fix: "ถ้าจะโพสต์ภายหลัง ให้ขออนุญาตและเลี่ยงพิกัดเรียลไทม์",
      },
      forward: {
        level: "bad",
        title: "ไม่เหมาะ ⚠️",
        text: "ส่งต่อให้คนอื่นดู/ตัดสินใจ = เพิ่มคนเห็น โดยที่เจ้าของข้อมูลไม่รู้",
        fix: "คุยกับเจ้าของข้อมูลโดยตรงดีที่สุด",
      },
    },
  },
  {
    id: "w3",
    icon: <FiMessageSquare />,
    title: "สกรีนช็อตแชทในกลุ่ม",
    desc: "คุณอยากแคปแชทเพื่อนในกลุ่มไปลงโพสต์ เพราะคิดว่าตลกดี",
    best: ["ask", "dont"],
    ok: ["redact"],
    feedback: {
      share: {
        level: "bad",
        title: "ไม่เหมาะ ⚠️",
        text: "แชทคือบริบทส่วนตัว แม้เป็นกลุ่มก็ไม่เท่ากับอนุญาตให้เผยแพร่สาธารณะ",
        fix: "ขออนุญาตทุกคนที่เกี่ยวข้อง หรือไม่โพสต์",
      },
      ask: {
        level: "good",
        title: "เหมาะ ✅",
        text: "ถามก่อน = ลดปัญหาทะเลาะ/เสียใจ/ความไว้ใจพัง",
        fix: "ถ้าในภาพมีหลายคน ให้ขอจากทุกคนที่เห็นชื่อ/โปรไฟล์",
      },
      redact: {
        level: "ok",
        title: "ดีขึ้น แต่ยังต้องระวัง",
        text: "ปิดชื่อ/รูปโปรไฟล์ช่วยได้ แต่ถ้าข้อความมีบริบททำให้รู้ว่าเป็นใคร ก็ยังเสี่ยง",
        fix: "ขออนุญาตก่อน + ตัดส่วนที่ระบุตัวตนออก",
      },
      dont: {
        level: "good",
        title: "เหมาะ ✅",
        text: "ไม่เผยแพร่ = ปกป้องความเป็นส่วนตัวของคนในแชท",
        fix: "ถ้าอยากแชร์จริง ๆ เลือกแชร์แบบไม่ระบุตัวตนและขออนุญาตก่อน",
      },
      forward: {
        level: "bad",
        title: "ไม่เหมาะ ⚠️",
        text: "ส่งต่อให้คนอื่นตัดสินใจแทน = เพิ่มการกระจายข้อมูล และคุมไม่ได้",
        fix: "ให้เจ้าของข้อความ/คนในแชทตัดสินใจเอง",
      },
    },
  },
  {
    id: "w4",
    icon: <FiEyeOff />,
    title: "ข้อมูลไม่ชัดว่าเป็นสาธารณะไหม",
    desc: "คุณเห็นข้อมูลของคนหนึ่งในออนไลน์ แต่ไม่แน่ใจว่าเขาตั้งค่าให้คนทั่วไปเห็นหรือเปล่า",
    best: ["dont", "ask"],
    ok: ["redact"],
    feedback: {
      share: {
        level: "bad",
        title: "ไม่เหมาะ ⚠️",
        text: "ไม่ชัวร์ว่าเขาเปิดสาธารณะ = อย่าเดาเอง เพราะเสี่ยงละเมิดความเป็นส่วนตัว",
        fix: "ไม่แน่ใจ = ไม่โพสต์ หรือขออนุญาตก่อน",
      },
      ask: {
        level: "good",
        title: "เหมาะ ✅",
        text: "ถามก่อน = เคารพเจ้าของข้อมูลและชัดเจน",
        fix: "ถามสั้น ๆ ว่าอนุญาตให้แชร์ต่อไหม และจะเผยแพร่ที่ไหน",
      },
      redact: {
        level: "ok",
        title: "พอได้ (แต่ยังต้องคิด)",
        text: "ตัดข้อมูลระบุตัวตนช่วยลดความเสี่ยง แต่ถ้าบริบททำให้รู้ว่าเป็นใคร ก็ยังไม่เซฟ",
        fix: "ถ้าระบุตัวคนได้ → ขออนุญาตก่อน หรือไม่โพสต์",
      },
      dont: {
        level: "good",
        title: "เหมาะ ✅",
        text: "ไม่เผยแพร่เมื่อไม่ชัวร์ = ทางที่ปลอดภัยที่สุด",
        fix: "ถ้าจำเป็นต้องอ้างอิง ให้ใช้ข้อมูลที่ไม่ระบุตัวตน",
      },
      forward: {
        level: "bad",
        title: "ไม่เหมาะ ⚠️",
        text: "ยิ่งส่งต่อ ยิ่งเพิ่มความเสี่ยงที่ข้อมูลจะหลุด",
        fix: "หยุดส่งต่อ แล้วคุยกับเจ้าของข้อมูล",
      },
    },
  },
];

/* ------------------------------------------------------------------ */
/* ✅ MINI QUIZ                                                         */
/* ------------------------------------------------------------------ */
const QUIZ = [
  {
    id: "q1",
    prompt: "ข้อไหน ‘เข้าข่ายข้อมูลส่วนบุคคลของผู้อื่น’ ชัดที่สุด?",
    answer: "B",
    choices: [
      { id: "A", label: "A) แชร์ข่าวสาธารณะจากแหล่งข่าว" },
      { id: "B", label: "B) โพสต์รูปเพื่อนพร้อมชื่อหรือเช็กอินสถานที่" },
      { id: "C", label: "C) เขียนบันทึกส่วนตัวของเราเอง" },
    ],
    feedback: {
      A: "ยังไม่ใช่ ❌ ข่าวสาธารณะไม่ใช่ข้อมูลส่วนบุคคลของคนอื่นโดยตรง",
      B: "ถูกต้อง ✅ ระบุตัวคนได้ (ภาพ + ชื่อ/พิกัด) ต้องระวังและขออนุญาต",
      C: "ยังไม่ใช่ ❌ ถ้าไม่เปิดข้อมูลระบุตัวคนอื่น ก็ไม่เข้าข่าย",
    },
  },
  {
    id: "q2",
    prompt: "ถ้า ‘ไม่ชัวร์ว่าเจ้าของข้อมูลอนุญาตไหม’ วิธีที่ปลอดภัยสุดคือข้อไหน?",
    answer: "C",
    choices: [
      { id: "A", label: "A) ใส่เครดิต/บอกว่าไม่ได้ตั้งใจ" },
      { id: "B", label: "B) แชร์ไปก่อน เดี๋ยวค่อยลบ" },
      { id: "C", label: "C) ขออนุญาต หรือเลือกไม่เผยแพร่" },
    ],
    feedback: {
      A: "ยังไม่พอ ❌ เรื่องนี้ไม่ใช่เครดิต แต่คือ ‘สิทธิ/ความยินยอม’",
      B: "ไม่แนะนำ ❌ แชร์แล้วอาจกระจายไปไกล คุมไม่ได้",
      C: "ถูกต้อง ✅ ขออนุญาต/ไม่โพสต์ คือทางเซฟสุด",
    },
  },
  {
    id: "q3",
    prompt: "ได้รูปส่วนตัวของคนอื่นจากแชท สิ่งที่เหมาะสมที่สุดคืออะไร?",
    answer: "A",
    choices: [
      { id: "A", label: "A) ตรวจสอบ/ขออนุญาต/พิจารณาความเหมาะสมก่อนเผยแพร่" },
      { id: "B", label: "B) ส่งต่อให้เพื่อนช่วยตัดสินใจ" },
      { id: "C", label: "C) แชร์ทันทีเพราะเราไม่ได้เป็นเจ้าของรูป" },
    ],
    feedback: {
      A: "ถูกต้อง ✅ เคารพเจ้าของข้อมูล + ลดความเสี่ยง",
      B: "ไม่แนะนำ ❌ ยิ่งส่งต่อ ยิ่งเพิ่มคนเห็น และคุมไม่ได้",
      C: "ไม่แนะนำ ❌ ไม่ใช่เจ้าของยิ่งต้องระวังและขออนุญาต",
    },
  },
];

/* ------------------------------------------------------------------ */
/* ✅ COMPONENT                                                         */
/* ------------------------------------------------------------------ */
export default function Learn5Unit4() {
  // =========================================================
  // ✅ Router helpers
  // =========================================================
  const navigate = useNavigate();
  const location = useLocation();

  // =========================================================
  // ✅ อ่าน query mode เผื่อใช้ต่อ (เหมือน Unit1/2/3)
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
   * ✅ step flow
   * - "lesson"   : Micro-lesson
   * - "risk"     : Risk assessment (feedback ทันทีรายข้อ)
   * - "workshop" : Interactive simulation + immediate feedback
   * - "quiz"     : Mini quiz
   */
  const [step, setStep] = useState("lesson");

  // =========================================================
  // ✅ Risk state (null = ยังไม่เลือก → ไม่ active จนกว่าจะคลิก)
  // =========================================================
  const [risk, setRisk] = useState({
    identify: null, // มีข้อมูลระบุตัวตนไหม
    permission: null, // ได้รับความยินยอมไหม
    impact: null, // มีโอกาสเดือดร้อนไหม
  });

  const resetRisk = () => {
    setRisk({ identify: null, permission: null, impact: null });
  };

  // ✅ ตอบครบไหม (ไว้ใช้เปิดปุ่ม “ไป Workshop” แบบมีวินัย)
  const riskAllAnswered = useMemo(() => {
    return risk.identify !== null && risk.permission !== null && risk.impact !== null;
  }, [risk]);

  // ✅ กติกาหยุด (แดง): ระบุตัวได้ + ยังไม่ยินยอม
  const riskHardStop = useMemo(() => {
    return risk.identify === true && risk.permission === false;
  }, [risk]);

  // =========================================================
  // ✅ Workshop state
  // =========================================================
  const [workKey, setWorkKey] = useState(WORKSHOP[0].id);
  const [selectedAction, setSelectedAction] = useState(null);

  const currentWorkshop = useMemo(() => WORKSHOP.find((w) => w.id === workKey), [workKey]);

  const workshopFeedback = useMemo(() => {
    if (!selectedAction) return null;
    return currentWorkshop?.feedback?.[selectedAction] ?? null;
  }, [selectedAction, currentWorkshop]);

  const workshopDone = useMemo(() => !!selectedAction, [selectedAction]);

  // =========================================================
  // ✅ Quiz state
  // =========================================================
  const [answers, setAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const quizAllAnswered = useMemo(() => Object.keys(answers).length === QUIZ.length, [answers]);

  const quizScore = useMemo(() => {
    let s = 0;
    for (const q of QUIZ) if (answers[q.id] === q.answer) s += 1;
    return s;
  }, [answers]);

  // =========================================================
  // ✅ Auth: โหลดชื่อผู้เรียน
  // =========================================================
  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);

      // ✅ 1) เช็ค session
      const { data } = await supabase.auth.getSession();
      const u = data.session?.user;

      // ✅ ถ้าไม่ล็อกอิน ให้กลับหน้า login
      if (!u) {
        navigate("/login", { replace: true });
        return;
      }

      // ✅ 2) ดึงชื่อจาก student_profiles
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
  // ✅ Panel title by step
  // =========================================================
  const panelTitle = useMemo(() => {
    if (step === "lesson") return "รู้จักข้อมูลส่วนบุคคลของผู้อื่น + เมื่อไหร่ควรขออนุญาต";
    if (step === "risk") return "เช็คก่อนโพสต์ (เลือกแล้วมีคำแนะนำทันที)";
    if (step === "workshop") return "Workshop: เลือกการกระทำ แล้วดูผลลัพธ์ทันที";
    return "Mini quiz";
  }, [step]);

  // =========================================================
  // ✅ Styles (ยึด pattern เดิมของคุณ)
  // =========================================================
  const softText = { fontSize: 13, opacity: 0.85, lineHeight: 1.6 };

  const boxStyle = {
    borderRadius: 16,
    border: "1px solid rgba(0,0,0,0.08)",
    background: "rgba(255,255,255,0.55)",
    padding: 14,
  };

  const infoCardStyle = {
    borderRadius: 14,
    border: "1px solid rgba(0,0,0,0.08)",
    background: "rgba(255,255,255,0.55)",
    padding: 12,
  };

  const sectionTitleStyle = { fontWeight: 950, marginBottom: 6 };

  const tabStyle = (active) => ({
    borderRadius: 999,
    border: active ? "1px solid rgba(99,102,241,0.45)" : "1px solid rgba(0,0,0,0.10)",
    background: active ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.65)",
    padding: "8px 12px",
    fontSize: 12,
    fontWeight: 900,
    cursor: "pointer",
    opacity: active ? 1 : 0.85,
  });

  // ✅ pill: ยังไม่เลือก = ไม่ active
  const pillStyle = (active) => ({
    borderRadius: 999,
    border: active ? "1px solid rgba(59,130,246,0.45)" : "1px solid rgba(0,0,0,0.10)",
    background: active ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.70)",
    padding: "8px 12px",
    fontSize: 13,
    fontWeight: 800,
    cursor: "pointer",
  });

  // =========================================================
  // ✅ Navigation: จบแล้วกลับหน้ารวม Unit4
  // =========================================================
  const goFinish = () => {
    navigate("/unit4/learn", { replace: true });
  };

  return (
    <div className="edu-app">
      {/* ✅ TOPBAR */}
      <header className="edu-topbar">
        <div className="edu-topbar__inner">
          {/* ✅ Brand */}
          <div className="homebar__brand" role="banner">
            <img src={logo} alt="LearnSecure logo" className="homebar__logo" />
            <div className="edu-brandtext">
              <div className="edu-brandtext__title">LearnSecure</div>
              <div className="edu-brandtext__subtitle">Unit 4.5</div>
            </div>
          </div>

          {/* ✅ Right actions */}
          <div className="edu-topbar__right">
            {/* ✅ User chip */}
            <div className="edu-userchip" title={studentName || "Student"}>
              <div className="edu-userchip__avatar" aria-hidden="true">
                <FiUser />
              </div>
              <div className="edu-userchip__meta">
                <div className="edu-userchip__name">{loading ? "กำลังโหลด..." : studentName || "ผู้เรียน"}</div>
              </div>
            </div>

            {/* ✅ Logout */}
            <button
              className="edu-btn edu-btn--danger"
              type="button"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate("/login", { replace: true });
              }}
            >
              <FiLogOut aria-hidden="true" />
              ออกจากระบบ
            </button>
          </div>
        </div>
      </header>

      <main className="edu-layout">
        {/* ✅ HERO */}
        <section className="edu-hero" aria-label="Unit 4 header">
          <div className="edu-hero__card">
            <div className="edu-hero__row">
              <div className="edu-hero__headline">
                <div className="edu-hero__title">Unit 4 : การสื่อสารและมารยาทดิจิทัล</div>
<div className="edu-hero__sub">เรื่องที่ 5	การเผยแพร่ข้อมูลส่วนบุคคลของผู้อื่นอย่างรับผิดชอบ
</div>
                <div className="edu-lessons__toolbar">
                  <button
                    className="edu-btn edu-btn--back"
                    type="button"
                    onClick={() => {
                      // ✅ ปุ่มกลับแบบ step-by-step
                      if (step === "quiz") {
                        setStep("workshop");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        return;
                      }
                      if (step === "workshop") {
                        setStep("risk");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        return;
                      }
                      if (step === "risk") {
                        setStep("lesson");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        return;
                      }
                      navigate(-1);
                    }}
                  >
                    <FiChevronLeft aria-hidden="true" />
                    กลับ
                  </button>

                  <button
                    className="edu-btn edu-btn--ghost"
                    type="button"
                    onClick={() => navigate("/main")}
                    style={{ marginLeft: 8 }}
                  >
                    <FiHome aria-hidden="true" />
                    กลับหน้าหลัก
                  </button>
                </div>
              </div>

              <div className="edu-lessons__meta">{/* เว้นไว้ */}</div>
            </div>
          </div>
        </section>

        {/* ✅ CONTENT */}
        <section className="edu-panel1">
          <div className="edu-panel1__head" style={{ alignItems: "flex-start" }}>
            <div className="edu-panel1__title">
              <FiFileText aria-hidden="true" />
              {panelTitle}
            </div>

            {/* ✅ Step Tabs */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
              <button type="button" style={tabStyle(step === "lesson")} onClick={() => setStep("lesson")}>
                1) เนื้อหา
              </button>

              <button
                type="button"
                style={tabStyle(step === "risk")}
                onClick={() => {
                  setStep("risk");
                }}
              >
                2) Risk
              </button>

              <button type="button" style={tabStyle(step === "workshop")} onClick={() => setStep("workshop")}>
                3) Workshop
              </button>

              <button type="button" style={tabStyle(step === "quiz")} onClick={() => setStep("quiz")}>
                4) Quiz
              </button>
            </div>
          </div>

          {/* =========================================================
              ✅ STEP 1: Micro-lesson
             ========================================================= */}
          {step === "lesson" && (
            <div style={{ padding: 16 }}>
              <div className="edu-card">
                <div className="edu-card__title">อ่าน 2 นาที แล้วไปทำ Risk + Workshop</div>

                <div className="edu-card__body" style={{ display: "grid", gap: 12 }}>
                  {/* ✅ Hook */}
                  <div
                    style={{
                      borderRadius: 14,
                      border: "1px solid rgba(99,102,241,0.20)",
                      background: "rgba(99,102,241,0.08)",
                      padding: 12,
                      display: "flex",
                      gap: 10,
                      alignItems: "flex-start",
                    }}
                  >
                    <FiShield aria-hidden="true" />
                    <div>
                      <div style={{ fontWeight: 950 }}>{MICRO.hook.title}</div>
                      <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4, lineHeight: 1.6 }}>{MICRO.hook.desc}</div>
                    </div>
                  </div>

                  {/* ✅ What is PII */}
                  <div style={infoCardStyle}>
                    <div style={sectionTitleStyle}>{MICRO.whatIsPII.title}</div>
                    <ul style={{ margin: "6px 0 0 18px", fontSize: 13, opacity: 0.92, lineHeight: 1.7 }}>
                      {MICRO.whatIsPII.bullets.map((b, i) => (
                        <li key={`pii-${i}`}>{b}</li>
                      ))}
                    </ul>
                    <div style={{ fontSize: 12, opacity: 0.75, marginTop: 8 }}>{MICRO.whatIsPII.cue}</div>
                  </div>

                  {/* ✅ What is NOT */}
                  <div style={infoCardStyle}>
                    <div style={sectionTitleStyle}>{MICRO.whatIsNot.title}</div>
                    <ul style={{ margin: "6px 0 0 18px", fontSize: 13, opacity: 0.92, lineHeight: 1.7 }}>
                      {MICRO.whatIsNot.bullets.map((b, i) => (
                        <li key={`not-${i}`}>{b}</li>
                      ))}
                    </ul>
                  </div>

                  {/* ✅ When to ask permission */}
                  <div style={infoCardStyle}>
                    <div style={sectionTitleStyle}>{MICRO.permission.title}</div>
                    <ul style={{ margin: "6px 0 0 18px", fontSize: 13, opacity: 0.92, lineHeight: 1.7 }}>
                      {MICRO.permission.bullets.map((b, i) => (
                        <li key={`perm-${i}`}>{b}</li>
                      ))}
                    </ul>
                    <div style={{ fontSize: 12, opacity: 0.75, marginTop: 8 }}>{MICRO.permission.cue}</div>
                  </div>

                  {/* ✅ Do when receive */}
                  <div style={infoCardStyle}>
                    <div style={sectionTitleStyle}>{MICRO.doWhenReceive.title}</div>
                    <ul style={{ margin: "6px 0 0 18px", fontSize: 13, opacity: 0.92, lineHeight: 1.7 }}>
                      {MICRO.doWhenReceive.bullets.map((b, i) => (
                        <li key={`do-${i}`}>{b}</li>
                      ))}
                    </ul>
                  </div>

                  {/* ✅ Next */}
                  <div
                    style={{
                      borderRadius: 14,
                      border: "1px solid rgba(16,185,129,0.20)",
                      background: "rgba(16,185,129,0.08)",
                      padding: 12,
                    }}
                  >
                    <div style={{ fontWeight: 950 }}>ขั้นต่อไป</div>
                    <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4, lineHeight: 1.6 }}>
                      ไปที่ <b>Risk</b> → เลือกคำตอบ แล้วดูคำแนะนำได้ทันที
                    </div>
                  </div>
                </div>

                {/* ✅ Go risk */}
                <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    className="edu-btn edu-btn--primary"
                    type="button"
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                      setStep("risk");
                    }}
                  >
                    ไปทำ Risk <FiChevronRight aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              ✅ STEP 2: Risk (Feedback ทันทีรายข้อ / ไม่มีสรุปรวม)
             ========================================================= */}
          {step === "risk" && (
            <div style={{ padding: 16 }}>
              <div style={boxStyle}>
                {/* ✅ Header */}
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 950, marginBottom: 6 }}>Risk Check: โพสต์ได้ไหม?</div>
                    <div style={softText}>
                      เลือกคำตอบแล้วจะมี <b>คำแนะนำขึ้นทันที</b> ใต้แต่ละข้อ
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <button className="edu-btn edu-btn--ghost" type="button" onClick={resetRisk}>
                      ล้างคำตอบ
                    </button>
                  </div>
                </div>

                {/* ✅ Q1 */}
                <div style={{ marginTop: 12, ...infoCardStyle }}>
                  <div style={{ fontWeight: 950, marginBottom: 6 }}>1) ในโพสต์นี้ “มีข้อมูลที่ทำให้รู้ว่าเป็นใคร” ไหม?</div>
                  <div style={{ fontSize: 13, opacity: 0.9, lineHeight: 1.6 }}>
                    ตัวอย่าง: เห็นหน้า / ชื่อ / @ไอดี / ป้ายชื่อโรงเรียน / ชุดนักเรียน / ป้ายชื่อ / เช็กอินสถานที่
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
                    <button type="button" style={pillStyle(risk.identify === true)} onClick={() => setRisk((p) => ({ ...p, identify: true }))}>
                      มี (รู้ว่าเป็นใคร)
                    </button>
                    <button type="button" style={pillStyle(risk.identify === false)} onClick={() => setRisk((p) => ({ ...p, identify: false }))}>
                      ไม่มี (ไม่รู้ว่าเป็นใคร)
                    </button>
                  </div>

                  {/* ✅ Q1 Feedback */}
                  {risk.identify === null && <div style={{ marginTop: 8, fontSize: 12, opacity: 0.75 }}>* เลือก 1 ตัวเลือก</div>}

                  {risk.identify === true && (
                    <div style={{ marginTop: 10 }} className="edu-callout">
                      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <FiAlertTriangle aria-hidden="true" />
                        <div>
                          <div style={{ fontWeight: 950 }}>เริ่มเสี่ยง</div>
                          <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4, lineHeight: 1.6 }}>
                            โพสต์นี้มีข้อมูลระบุตัวตน → ต้องดู “ความยินยอม” ในข้อ 2 ต่อ
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {risk.identify === false && (
                    <div style={{ marginTop: 10 }} className="edu-callout">
                      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <FiCheckCircle aria-hidden="true" />
                        <div>
                          <div style={{ fontWeight: 950 }}>ปลอดภัยขึ้น</div>
                          <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4, lineHeight: 1.6 }}>
                            ไม่มีข้อมูลระบุตัวตน → ความเสี่ยงลดลง แต่ยังควรดู “ผลกระทบ” ในข้อ 3
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ✅ Q2 */}
                <div style={{ marginTop: 10, ...infoCardStyle }}>
                  <div style={{ fontWeight: 950, marginBottom: 6 }}>2) เจ้าของข้อมูล “ยินยอมให้โพสต์” แล้วหรือยัง?</div>
                  <div style={{ fontSize: 13, opacity: 0.9, lineHeight: 1.6 }}>
                    ยินยอมแบบชัด ๆ: จะโพสต์ที่ไหน / ใครเห็นได้บ้าง / ไม่โอเคให้ลบได้ไหม
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
                    <button type="button" style={pillStyle(risk.permission === true)} onClick={() => setRisk((p) => ({ ...p, permission: true }))}>
                      ยินยอมแล้ว
                    </button>
                    <button type="button" style={pillStyle(risk.permission === false)} onClick={() => setRisk((p) => ({ ...p, permission: false }))}>
                      ยังไม่ยินยอม
                    </button>
                  </div>

                  {/* ✅ Q2 Feedback */}
{risk.permission === null && (
  <div style={{ marginTop: 8, fontSize: 12, opacity: 0.75 }}>* เลือก 1 ตัวเลือก</div>
)}

{/* 🔴 ยังไม่ยินยอม (ต้องขึ้นเสมอ ไม่ว่าข้อ 1 จะเป็นอะไร) */}
{risk.permission === false && (
  <div style={{ marginTop: 10 }} className="edu-callout">
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <FiAlertTriangle aria-hidden="true" />
      <div>
        <div style={{ fontWeight: 950 }}>🚫 หยุดก่อน</div>

        {/* ✅ ถ้าระบุตัวตนได้ = ห้ามโพสต์ชัด ๆ */}
        {risk.identify === true && (
          <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4, lineHeight: 1.6 }}>
            โพสต์นี้ <b>ระบุตัวคนได้</b> แต่ <b>ยังไม่ได้รับความยินยอม</b> → <b>ไม่ควรโพสต์</b>
            <br />
            กติกา: <b>ต้องขออนุญาตก่อนเสมอ</b>
          </div>
        )}

        {/* ✅ ถ้าไม่ระบุตัวตนได้ = ยังควรระวัง + แนะนำให้ขออยู่ดีถ้าเป็นรูปคนอื่น */}
        {risk.identify === false && (
          <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4, lineHeight: 1.6 }}>
            ถึงจะ <b>ไม่ระบุตัวตนได้ชัด</b> แต่ก็ <b>ยังไม่ได้รับความยินยอม</b> → แนะนำ <b>ขออนุญาตก่อน</b>
            <br />
            ถ้าเป็นรูป/แชทของคนอื่น: <b>ขออนุญาต = เซฟสุด</b>
          </div>
        )}

        {/* ✅ ถ้ายังไม่ตอบข้อ 1 ให้บอกเป็นคำแนะนำ */}
        {risk.identify === null && (
          <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4, lineHeight: 1.6 }}>
            คุณยังไม่ได้ตอบข้อ 1 → แต่ตอนนี้ <b>ยังไม่ยินยอม</b> ก็แปลว่า <b>ยังไม่ควรโพสต์</b> อยู่ดี
          </div>
        )}
      </div>
    </div>
  </div>
)}

{/* 🟢 ยินยอมแล้ว */}
{risk.permission === true && (
  <div style={{ marginTop: 10 }} className="edu-callout">
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <FiCheckCircle aria-hidden="true" />
      <div>
        <div style={{ fontWeight: 950 }}>โอเคขึ้น</div>
        <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4, lineHeight: 1.6 }}>
          ได้รับความยินยอมแล้ว → ไปดู “ผลกระทบ” ในข้อ 3 ต่อ
        </div>
      </div>
    </div>
  </div>
)}

{/* 🟦 Tips เพิ่ม เมื่อ “ระบุตัวตนได้ + ยินยอมแล้ว” */}
{risk.identify === true && risk.permission === true && (
  <div style={{ marginTop: 8, fontSize: 12, opacity: 0.75 }}>
    * เพิ่มความปลอดภัยได้อีก: ลองปิดชื่อ/บังหน้า/ไม่ลงพิกัด
  </div>
)}</div>

                {/* ✅ Q3 */}
                <div style={{ marginTop: 10, ...infoCardStyle }}>
                  <div style={{ fontWeight: 950, marginBottom: 6 }}>3) ถ้าโพสต์ไป “เขามีโอกาสเดือดร้อนไหม”?</div>
                  <div style={{ fontSize: 13, opacity: 0.9, lineHeight: 1.6 }}>
                    ตัวอย่าง: โดนล้อ/อาย/ทะเลาะ/โดนตามตัว/มีปัญหาที่บ้านหรือโรงเรียน/ถูกคุกคาม
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
                    <button type="button" style={pillStyle(risk.impact === true)} onClick={() => setRisk((p) => ({ ...p, impact: true }))}>
                      มีโอกาสเดือดร้อน
                    </button>
                    <button type="button" style={pillStyle(risk.impact === false)} onClick={() => setRisk((p) => ({ ...p, impact: false }))}>
                      ไม่น่าเดือดร้อน
                    </button>
                  </div>

                  {/* ✅ Q3 Feedback */}
                  {risk.impact === null && <div style={{ marginTop: 8, fontSize: 12, opacity: 0.75 }}>* เลือก 1 ตัวเลือก</div>}

                  {risk.impact === true && (
                    <div style={{ marginTop: 10 }} className="edu-callout">
                      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <FiAlertTriangle aria-hidden="true" />
                        <div>
                          <div style={{ fontWeight: 950 }}>ควรเลี่ยง</div>
                          <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4, lineHeight: 1.6 }}>
                            โพสต์นี้อาจทำให้เขาเดือดร้อน → <b>ควรไม่โพสต์</b> หรืออย่างน้อยให้ <b>ตัด/บัง</b> ข้อมูลที่เสี่ยง
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {risk.impact === false && (
                    <div style={{ marginTop: 10 }} className="edu-callout">
                      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <FiCheckCircle aria-hidden="true" />
                        <div>
                          <div style={{ fontWeight: 950 }}>โอเคกว่า</div>
                          <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4, lineHeight: 1.6 }}>
                            ไม่น่าเดือดร้อน → โพสต์ได้ “ปลอดภัยกว่า” แต่ยังควรคิดเรื่องความเหมาะสม
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ✅ Bottom hint (optional): แถบกติกาหลัก */}
                <div style={{ marginTop: 12, opacity: 0.9, lineHeight: 1.6 }}>
                  <b>กติกาหลัก:</b> ถ้า <b>รู้ว่าเป็นใคร</b> แต่ <b>ยังไม่ยินยอม</b> → <b>หยุดก่อนเสมอ</b>
                </div>

                {/* ✅ Actions */}
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                  <button className="edu-btn edu-btn--back" type="button" onClick={() => setStep("lesson")}>
                    <FiChevronLeft aria-hidden="true" /> กลับไปเนื้อหา
                  </button>

                  <button
                    className="edu-btn edu-btn--primary"
                    type="button"
                    // ✅ ตั้งใจ “มีวินัย”: ต้องตอบครบ + ถ้ามี hard stop ให้หยุดไว้
                    disabled={!riskAllAnswered || riskHardStop}
                    title={
                      !riskAllAnswered
                        ? "เลือกคำตอบให้ครบทั้ง 3 ข้อก่อน"
                        : riskHardStop
                          ? "ตอนนี้ควร ‘หยุดก่อน’ (ยังไม่ได้รับความยินยอม)"
                          : "ไป Workshop"
                    }
                    onClick={() => {
                      setSelectedAction(null);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                      setStep("workshop");
                    }}
                  >
                    ไป Workshop <FiChevronRight aria-hidden="true" />
                  </button>
                </div>

                {riskHardStop && (
                  <div style={{ marginTop: 10, fontSize: 12, opacity: 0.85 }}>
                    * ปลดล็อกปุ่มได้เมื่อเปลี่ยนเป็น “ยินยอมแล้ว” หรือเลือก “ไม่มีข้อมูลระบุตัวตน”
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================================
              ✅ STEP 3: Workshop + Immediate Feedback
             ========================================================= */}
          {step === "workshop" && (
            <div style={{ padding: 16 }}>
              <div style={boxStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 950, marginBottom: 6 }}>Workshop: เลือกการกระทำ</div>
                    <div style={softText}>เลือกสถานการณ์ → เลือก 1 วิธี → ดูผลลัพธ์ทันที</div>
                  </div>
                </div>

                {/* ✅ Scenario selector */}
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontWeight: 950, marginBottom: 8 }}>1) เลือกสถานการณ์</div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {WORKSHOP.map((w) => (
                      <button
                        key={w.id}
                        className={`u13-token ${workKey === w.id ? "is-selected" : ""}`}
                        type="button"
                        onClick={() => {
                          setWorkKey(w.id);
                          setSelectedAction(null);
                        }}
                      >
                        {w.icon} {w.title}
                      </button>
                    ))}
                  </div>

                  <div className="edu-callout" style={{ marginTop: 12 }}>
                    <div style={{ fontWeight: 950 }}>{currentWorkshop.title}</div>
                    <div style={{ marginTop: 6, opacity: 0.9, lineHeight: 1.6 }}>{currentWorkshop.desc}</div>
                  </div>
                </div>

                {/* ✅ Action picker */}
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontWeight: 950, marginBottom: 8 }}>2) คุณจะทำแบบไหน</div>
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

                {/* ✅ Feedback */}
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontWeight: 950, marginBottom: 8 }}>3) ผลลัพธ์</div>

                  {!selectedAction && <div className="edu-callout">เลือก 1 วิธี เพื่อดูผลลัพธ์</div>}

                  {selectedAction && workshopFeedback && (
                    <div
                      style={{
                        borderRadius: 12,
                        border:
                          workshopFeedback.level === "good"
                            ? "1px solid rgba(16,185,129,0.25)"
                            : workshopFeedback.level === "ok"
                              ? "1px solid rgba(59,130,246,0.20)"
                              : "1px solid rgba(245,158,11,0.25)",
                        background:
                          workshopFeedback.level === "good"
                            ? "rgba(16,185,129,0.10)"
                            : workshopFeedback.level === "ok"
                              ? "rgba(59,130,246,0.08)"
                              : "rgba(245,158,11,0.10)",
                        padding: 12,
                      }}
                    >
                      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        {workshopFeedback.level === "bad" ? <FiAlertTriangle aria-hidden="true" /> : <FiCheckCircle aria-hidden="true" />}

                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 950 }}>{workshopFeedback.title}</div>
                          <div style={{ marginTop: 6, opacity: 0.9, lineHeight: 1.6 }}>{workshopFeedback.text}</div>
                          <div style={{ marginTop: 10, opacity: 0.92, lineHeight: 1.6 }}>
                            <b>ทำให้ถูก:</b> {workshopFeedback.fix}
                          </div>

                          <div style={{ marginTop: 10, opacity: 0.9, lineHeight: 1.6 }}>
                            <b>แนวทางที่ปลอดภัยในสถานการณ์นี้:</b>{" "}
                            {currentWorkshop.best
                              .map((id) => ACTIONS.find((x) => x.id === id)?.label)
                              .filter(Boolean)
                              .join(" / ")}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ✅ Actions */}
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                  <button className="edu-btn edu-btn--back" type="button" onClick={() => setStep("risk")}>
                    <FiChevronLeft aria-hidden="true" /> กลับไป Risk
                  </button>

                  <button
                    className="edu-btn edu-btn--primary"
                    type="button"
                    disabled={!workshopDone}
                    title={!workshopDone ? "เลือก 1 วิธี เพื่อดูผลลัพธ์ก่อนนะ" : "ไปทำ Quiz"}
                    onClick={() => {
                      setQuizSubmitted(false);
                      setAnswers({});
                      window.scrollTo({ top: 0, behavior: "smooth" });
                      setStep("quiz");
                    }}
                  >
                    ไปทำ Quiz <FiChevronRight aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              ✅ STEP 4: Mini quiz + feedback
             ========================================================= */}
          {step === "quiz" && (
            <div style={{ padding: 16 }}>
              <div style={boxStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 950, marginBottom: 6 }}>Mini quiz</div>
                    <div style={softText}>ตอบให้ครบ แล้วกดส่งเพื่อดูเฉลยทันที</div>
                  </div>

                  <div style={{ fontSize: 12, opacity: 0.8, alignSelf: "center" }}>
                    ตอบแล้ว {Object.keys(answers).length} / {QUIZ.length}
                  </div>
                </div>

                {/* ✅ Questions */}
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
                          padding: 12,
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
                              style={pillStyle(picked === c.id)}
                              aria-pressed={picked === c.id}
                            >
                              {c.label}
                            </button>
                          ))}
                        </div>

                        {/* ✅ Feedback */}
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
                                  background: "rgba(16,185,129,0.10)",
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
                                  background: "rgba(245,158,11,0.10)",
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
                                  background: "rgba(220,38,38,0.08)",
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

                {/* ✅ Buttons */}
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                  <button className="edu-btn edu-btn--back" type="button" onClick={() => setStep("workshop")}>
                    <FiChevronLeft aria-hidden="true" /> กลับไป Workshop
                  </button>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button
                      className="edu-btn edu-btn--primary"
                      type="button"
                      disabled={!quizAllAnswered}
                      title={!quizAllAnswered ? "ตอบให้ครบทุกข้อก่อน" : "ส่งคำตอบเพื่อดูเฉลย"}
                      onClick={() => {
                        setQuizSubmitted(true);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      ส่งคำตอบ <FiChevronRight aria-hidden="true" />
                    </button>

                    {quizSubmitted && (
                      <button className="edu-btn edu-btn--ghost" type="button" onClick={goFinish}>
                        เสร็จสิ้น <FiChevronRight aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>

                {/* ✅ Score */}
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
                        background: "rgba(59,130,246,0.08)",
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
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
