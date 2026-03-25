// src/pages/Unit3/Learn5.jsx
// Unit 3 – เรื่องที่ 5: การนำเสนอและปรับโปรไฟล์ออนไลน์
// Micro-lesson + Interactive Classification-based Learning + Interactive Simulation Workshop + Immediate Feedback
// ✅ ปรับ “ส่วนที่ 2 การจำลอง” ให้ดูโปรขึ้น: เลิกใช้ emoji ใน UI หลัก → ใช้ icon จาก react-icons แทน (Fi*)

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

// Assets
import logo from "../../assets/logo.png";

// Styles
import "../../main.css";
import "../Unit1/learn.css";
import "./learn.css";

// Icons
import {
  FiChevronLeft,
  FiChevronRight,
  FiFileText,
  FiHome,
  FiLogOut,
  FiUser,
  FiCheckCircle,
  FiAlertTriangle,
  FiRotateCcw,
  FiShield,
} from "react-icons/fi";

/* -------------------------------------------------- */
/* ✅ UI Helpers: Icon Badge (ทำให้ UI ดูเป็นระบบ/โปร)    */
/* -------------------------------------------------- */
const BadgeIcon = ({ kind = "info", size = 16, style }) => {
  // ✅ map ชนิด → icon เดียวกันทั้งหน้า (สม่ำเสมอ)
  // NOTE:
  // - risk = ไอคอนเตือน (เสี่ยง)
  // - safe = โล่ (ปลอดภัย)
  const map = {
    ok: FiCheckCircle,
    warn: FiAlertTriangle,
    risk: FiAlertTriangle,
    safe: FiShield,
    user: FiUser,
    file: FiFileText,
    reset: FiRotateCcw,
  };
  const Icon = map[kind] || FiAlertTriangle;

  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: 0,
        ...style,
      }}
    >
      <Icon size={size} />
    </span>
  );
};

/* -------------------------------------------------- */
/* ✅ กิจกรรมคัดแยก: โปรไฟล์สาธารณะควรโชว์อะไร?       */
/* -------------------------------------------------- */
const CLASSIFY_ITEMS = [
  {
    id: "c1",
    label: "เบอร์โทรส่วนตัว (08x-xxx-xxxx)",
    hint: "ข้อมูลติดต่อส่วนตัว",
    correct: "ADJUST",
    explain:
      "เบอร์โทรคือข้อมูลติดต่อส่วนตัวโดยตรง ไม่ควรเปิดในโปรไฟล์สาธารณะ เพราะใครก็สามารถนำไปโทร สแปม หรือคุกคามได้",
  },
  {
    id: "c2",
    label: "รหัสผ่าน/OTP/รหัส Wi-Fi",
    hint: "กุญแจเข้าบัญชี",
    correct: "ADJUST",
    explain: "ห้ามเผยแพร่เด็ดขาด เพราะเป็น “กุญแจ” ให้คนอื่นเข้าบัญชี/เข้าระบบแทนเราได้",
  },
  {
    id: "c3",
    label: "รูปบัตรนักเรียน/ป้ายชื่อ (เห็นชื่อ-เลขชัด)",
    hint: "ตัวระบุเฉพาะบุคคล",
    correct: "ADJUST",
    explain: "ควรเบลอ/ปิดข้อมูลก่อนลง เพราะคนเอาไปแอบอ้าง/ตามหาเราได้",
  },
  {
    id: "c4",
    label: "Bio: สนใจทักษะ/ทำงานเป็นทีม/แชร์ผลงาน",
    hint: "ภาพลักษณ์เชิงบวก",
    correct: "OK",
    explain: "ดีมาก เป็นข้อมูลทั่วไป ช่วยสะท้อนตัวตนเชิงบวกโดยไม่เปิดข้อมูลอ่อนไหว",
  },
  {
    id: "c5",
    label: "เช็กอินบ้าน + พิกัดละเอียด",
    hint: "ระบุตำแหน่งชัด",
    correct: "ADJUST",
    explain:
      "เสี่ยงสูง เพราะบอกตำแหน่งที่อยู่จริง ควรปิดโลเคชัน/เช็กอินแบบกว้าง ๆ หรือโพสต์หลังออกจากที่นั้นแล้ว",
  },
  {
    id: "c6",
    label: "ลิงก์พอร์ต/ผลงาน (ตรวจแล้วว่าไม่หลุดข้อมูลส่วนตัว)",
    hint: "โชว์ทักษะ",
    correct: "OK",
    explain: "โอเค ช่วยเพิ่มโอกาส/ภาพลักษณ์ที่ดี แต่อย่าลืมเช็กว่าไม่มีข้อมูลลับ/เบอร์/ที่อยู่หลุดอยู่ในลิงก์นั้น",
  },
  {
    id: "c7",
    label: "Bio/โพสต์ปักหมุดที่แสดงความเห็นรุนแรงหรือก่อความขัดแย้ง",
    hint: "ความเห็นส่วนตัว",
    correct: "ADJUST",
    explain:
      "ความคิดเห็นที่รุนแรงหรือสร้างความขัดแย้งอาจทำให้คนมองภาพลักษณ์เชิงลบ และส่งผลต่อโอกาสในอนาคต ควรปรับให้เป็นกลางหรือเชิงสร้างสรรค์",
  },
];

/* -------------------------------------------------- */
/* ✅ Simulation: โปรไฟล์ก่อนปรับ (ตั้งใจให้เสี่ยง)      */
/* -------------------------------------------------- */
const DEFAULT_PROFILE = {
  username: "เด็กซิ่งเมืองนนท์_2008",
  displayName: "ผู้เรียน",
  // ✅ เริ่มต้น “มีเบอร์” ให้สมจริง แล้วค่อยให้ผู้เรียนปรับเป็น “ไม่แสดงเบอร์”
  bio: "ว่าง ๆ ชอบไปร้านเดิมแถวบ้าน | ทักมาได้ 08x-xxx-xxxx",
  // ✅ ปรับข้อความตัวอย่างให้ดูโปรขึ้น (เอา emoji ออก — UI จะดูนิ่งขึ้น)
  pinnedPost: "ปักหมุด: เช็กอินบ้าน (พิกัดชัด) | รูปป้ายชื่อโรงเรียนเต็ม ๆ | แคปชัน: “โรงเรียน X ห้อง 3/2”",
  privacy: {
    profileVisibility: "PUBLIC", // PUBLIC | FRIENDS
    dm: "ANYONE", // ANYONE | FRIENDS
    // ✅ เพิ่ม Message requests ให้ DM เปิดได้อย่างสมเหตุสมผล (ติดต่อคนใหม่/งาน)
    messageRequests: true, // true | false
    locationTagging: true, // true | false
  },
};

/* -------------------------------------------------- */
/* ✅ Simulation options: เลือกอย่างเดียว (อ่านง่าย)     */
/* -------------------------------------------------- */
const USERNAME_OPTIONS = [
  { value: "เด็กซิ่งเมืองนนท์_2008", label: "เด็กซิ่งเมืองนนท์_2008 (เสี่ยง)" },
  { value: "ls.creator", label: "ls.creator (ปลอดภัย)" },
  { value: "design.journey", label: "design.journey (ปลอดภัย)" },
  { value: "learnsecure.student", label: "learnsecure.student (ปลอดภัย)" },
];

const BIO_OPTIONS = [
  {
    value: "ว่าง ๆ ชอบไปร้านเดิมแถวบ้าน | ทักมาได้ 08x-xxx-xxxx",
    label: "แบบเริ่มต้น (มีแถวบ้าน + เบอร์)",
  },
  {
    value: "รับงาน/ติดต่อได้ใน DM (ไม่แสดงเบอร์) | ตอบเป็นช่วงเวลา",
    label: "แบบปลอดภัย (ติดต่อได้ แต่ไม่โชว์เบอร์)",
  },
  {
    value: "สนใจกราฟิก | ชอบทำงานเป็นทีม | แชร์ผลงานและการเรียนรู้ | ติดต่อผ่าน DM",
    label: "แบบปลอดภัย + ภาพลักษณ์ดี",
  },
];

const PINNED_OPTIONS = [
  {
    value: "ปักหมุด: เช็กอินบ้าน (พิกัดชัด) | รูปป้ายชื่อโรงเรียนเต็ม ๆ | แคปชัน: “โรงเรียน X ห้อง 3/2”",
    label: "แบบเริ่มต้น (เช็กอิน + โรงเรียน/ห้อง)",
  },
  {
    value: "Pinned: รวมผลงาน/โปรเจกต์ที่ทำ (ไม่ระบุตำแหน่ง/ไม่โชว์ข้อมูลส่วนตัว)",
    label: "แบบปลอดภัย (โชว์ผลงาน)",
  },
  {
    value: "Pinned: กิจกรรมที่ชอบ + สิ่งที่กำลังเรียนรู้ (ไม่เช็กอิน/ไม่ระบุตัวตน)",
    label: "แบบปลอดภัย (กิจกรรมกว้าง ๆ )",
  },
];

/* -------------------------------------------------- */
/* ✅ Scenario (เหตุการณ์สุ่ม)                          */
/* -------------------------------------------------- */
const SCENARIOS = [
  {
    id: "s1",
    title: "มีคนแปลกหน้าทักมาขอเบอร์",
    prompt: "มีคนที่ไม่รู้จักทักว่า “ขอเบอร์ได้ไหม” ในแชต คุณควรทำยังไง?",
    options: [
      { label: "ให้เบอร์ไปเลย จะได้คุยง่าย", correct: false, explain: "ไม่ควรให้ข้อมูลติดต่อส่วนตัวกับคนแปลกหน้า เสี่ยงโดนคุกคาม/สแปม", score: -4 },
      { label: "ให้คุยผ่าน DM และไม่ให้เบอร์", correct: true, explain: "ถูก: คุมช่องทางติดต่อไว้ในแพลตฟอร์ม ลดความเสี่ยงจากเบอร์หลุด", score: +6 },
      { label: "บล็อกทันทีทุกกรณี", correct: false, explain: "ทำได้ถ้าไม่ปลอดภัย แต่ทางที่สมเหตุสมผลคือ “คุมช่องทาง” ก่อน", score: +1 },
    ],
  },
  {
    id: "s2",
    title: "เพื่อนแท็กโลเคชันบ้านให้",
    prompt: "เพื่อนโพสต์รูปแล้วแท็กโลเคชันบ้านคุณโดยไม่ตั้งใจ คุณควรทำอย่างไร?",
    options: [
      { label: "ปล่อยไว้ ไม่เป็นไร", correct: false, explain: "เสี่ยง เพราะเปิดตำแหน่งที่อยู่ให้คนอื่นเห็น/แชร์ต่อได้", score: -4 },
      { label: "ขอให้เพื่อนลบแท็ก/แก้โพสต์ และปิด Location tagging ของเรา", correct: true, explain: "ถูก: เอาข้อมูลตำแหน่งละเอียดออก + ตั้งค่าป้องกันไว้", score: +6 },
      { label: "ตอบคอมเมนต์ว่า “บ้านเราเอง” ให้ชัด ๆ", correct: false, explain: "ยิ่งทำให้ข้อมูลชัดขึ้นกว่าเดิม เสี่ยงสูง", score: -4 },
    ],
  },
  {
    id: "s3",
    title: "รูปป้ายชื่อโรงเรียนติดมุมภาพ",
    prompt: "คุณจะลงรูป แต่เห็นชื่อโรงเรียน/ห้องติดมุมภาพเล็ก ๆ คุณควรทำยังไง?",
    options: [
      { label: "ลงเลย มันเล็กนิดเดียว", correct: false, explain: "คนอื่นซูม/แชร์ต่อได้ และเอาไปตามหาตัวตนได้", score: -3 },
      { label: "ครอป/เบลอส่วนป้ายชื่อก่อน แล้วค่อยลง", correct: true, explain: "ถูก: ปิด “ตัวระบุเฉพาะ” ก่อนเผยแพร่", score: +6 },
      { label: "ใส่แคปชันบอกชื่อโรงเรียนแทน", correct: false, explain: "ยิ่งชี้ชัดกว่าเดิม เสี่ยงสูง", score: -4 },
    ],
  },
];

/* -------------------------------------------------- */
/* ✅ Helper: ตรวจ pattern เสี่ยง                         */
/* -------------------------------------------------- */
function hasPhone(text) {
  const t = text || "";
  const realPhone = /\b0\d{1,2}[- ]?\d{3}[- ]?\d{4}\b/;
  const placeholderPhone = /\b0\d{1,2}[xX][-\s]?xxx[-\s]?xxxx\b/;
  return realPhone.test(t) || placeholderPhone.test(t);
}

function hasSchoolOrClass(text) {
  const t = text || "";
  return /โรงเรียน/.test(t) || /ห้อง\s*\d/.test(t) || /ม\.\d/.test(t) || /ป\.\d/.test(t);
}

function hasHomeOrExactPlace(text) {
  return /บ้าน|แถวบ้าน|พิกัด|เช็กอิน/.test(text || "");
}

/* -------------------------------------------------- */
/* ✅ Helper: สรุปจุดเสี่ยงแบบทันที                       */
/* -------------------------------------------------- */
function riskIssues(profile) {
  const issues = [];

  if (/200\d|201\d|202\d/.test(profile.username || "")) {
    issues.push({ level: "WARN", title: "Username มีปี/อายุที่เดาได้", tip: "เลือก username ที่ไม่ใส่ปี/อายุ" });
  }

  if (/เมือง|นนท์|เชียง|โคราช|ภูเก็ต|หาดใหญ่|บ้าน|หมู่/.test(profile.username || "")) {
    issues.push({ level: "WARN", title: "Username อาจบอกพื้นที่อยู่ชัดเกิน", tip: "เลือก username ที่ไม่บอกเมือง/ย่าน" });
  }

  if (hasPhone(profile.bio)) {
    issues.push({ level: "WARN", title: "Bio มีเบอร์โทรส่วนตัว", tip: "ติดต่อได้ แต่ไม่ควรโชว์เบอร์ ให้คุยผ่าน DM แทน" });
  }

  if (hasHomeOrExactPlace(profile.bio)) {
    issues.push({ level: "WARN", title: "Bio บอกแถวบ้าน/สถานที่ประจำ", tip: "ใช้คำกว้าง ๆ แทน ไม่ระบุว่าใกล้บ้าน/ไปที่เดิมประจำ" });
  }

  if (profile.privacy.locationTagging && hasHomeOrExactPlace(profile.pinnedPost)) {
    issues.push({ level: "WARN", title: "Pinned มีสถานที่ + เปิดแท็กโลเคชัน", tip: "ปิด Location tagging หรือทำโพสต์ให้ไม่ระบุตำแหน่งละเอียด" });
  }

  if (hasSchoolOrClass(profile.pinnedPost)) {
    issues.push({ level: "WARN", title: "Pinned บอกโรงเรียน/ห้องเรียน", tip: "เลือก Pinned ที่ไม่บอกโรงเรียน/ห้อง หรือเบลอ/ตัดออกก่อนโพสต์" });
  }

  if (hasHomeOrExactPlace(profile.pinnedPost)) {
    issues.push({ level: "WARN", title: "Pinned บอกบ้าน/เช็กอิน/พิกัด", tip: "เลือก Pinned แบบกว้าง ๆ ไม่ระบุตำแหน่ง" });
  }

  // ✅ DM เปิดได้ แต่ควรมี “ตัวกรองข้อความ” ถ้าเปิด ANYONE
  if (profile.privacy.dm === "ANYONE" && !profile.privacy.messageRequests) {
    issues.push({ level: "WARN", title: "DM เปิดให้ใครก็ทักได้ แต่ไม่มี Message requests", tip: "เปิด Message requests เพื่อกันสแปม/คุกคาม" });
  }

  if (issues.length === 0) {
    issues.push({ level: "GOOD", title: "โปรไฟล์ดูปลอดภัย + ภาพลักษณ์ดีขึ้น", tip: "แสดงข้อมูลทั่วไป + ซ่อนข้อมูลเสี่ยง" });
  }

  return issues;
}

/* -------------------------------------------------- */
/* ✅ Helper: Checklist สรุปผล                           */
/* -------------------------------------------------- */
function checklistResult(profile) {
  // ✅ เงื่อนไข DM สมเหตุสมผล:
  // - FRIENDS = ผ่าน
  // - ANYONE + เปิด messageRequests = ผ่าน
  const dmOk = profile.privacy.dm === "FRIENDS" || (profile.privacy.dm === "ANYONE" && profile.privacy.messageRequests);

  const list = [
    { ok: !hasPhone(profile.bio), label: "Bio ไม่แสดงเบอร์โทร/ข้อมูลติดต่ออ่อนไหว" },
    { ok: !profile.privacy.locationTagging, label: "ปิด Location tagging (ลดการโดนตามจากพิกัด)" },
    { ok: dmOk, label: "DM มีตัวกันชน (FRIENDS หรือ ANYONE+Message requests)" },
    { ok: !hasSchoolOrClass(profile.pinnedPost), label: "Pinned ไม่บอกโรงเรียน/ห้อง/ตัวระบุชัด" },
    {
      ok: /กราฟิก|ทีม|ผลงาน|เรียนรู้|พอร์ต|portfolio|github/i.test(`${profile.bio} ${profile.pinnedPost}`),
      label: "มีตัวตนเชิงบวก (ทักษะ/ผลงาน)",
    },
  ];

  const okCount = list.filter((x) => x.ok).length;

  let level = "ยังเสี่ยงอยู่ — ปรับอีกนิด";
  if (okCount >= 5) level = "พร้อมเผยแพร่สาธารณะ";
  else if (okCount >= 3) level = "ดีขึ้นเยอะ แต่ยังปรับได้อีก";

  return { list, okCount, level };
}

export default function Learn5() {
  const navigate = useNavigate();

  /* -------------------------------------------------- */
  /* ✅ State: ผู้ใช้/โหลดข้อมูล                          */
  /* -------------------------------------------------- */
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("ผู้เรียน");

  /* -------------------------------------------------- */
  /* ✅ State: step + task mode                           */
  /* -------------------------------------------------- */
  const [step, setStep] = useState("lesson"); // lesson | task
  const [taskMode, setTaskMode] = useState("classify"); // classify | simulate

  /* -------------------------------------------------- */
  /* ✅ State: score                                      */
  /* -------------------------------------------------- */
  const [score, setScore] = useState(0);

  /* -------------------------------------------------- */
  /* ✅ State: Classification answers + feedback          */
  /* -------------------------------------------------- */
  const [answers, setAnswers] = useState(() => {
    const init = {};
    for (const it of CLASSIFY_ITEMS) init[it.id] = "";
    return init;
  });

  const [itemFeedback, setItemFeedback] = useState(() => {
    const init = {};
    for (const it of CLASSIFY_ITEMS) init[it.id] = null;
    return init;
  });

  /* -------------------------------------------------- */
  /* ✅ State: Simulation profile                         */
  /* -------------------------------------------------- */
  const [profile, setProfile] = useState(() => ({
    ...DEFAULT_PROFILE,
    displayName: "ผู้เรียน",
  }));

  /* -------------------------------------------------- */
  /* ✅ State: Simulate (เรียบง่าย)                        */
  /* -------------------------------------------------- */
  const [simTab, setSimTab] = useState("BUILDER"); // BUILDER | SCENARIO
  const [auditNote, setAuditNote] = useState(null); // {type,title,desc}

  // Scenario state
  const [scenarioId, setScenarioId] = useState(null);
  const [scenarioChoice, setScenarioChoice] = useState(null); // index
  const [scenarioFeedback, setScenarioFeedback] = useState(null); // {type,message,explain}

  /* -------------------------------------------------- */
  /* ✅ Derived: classify status                           */
  /* -------------------------------------------------- */
  const classifyDone = useMemo(() => {
    return CLASSIFY_ITEMS.every((it) => answers[it.id] === "OK" || answers[it.id] === "ADJUST");
  }, [answers]);

  const classifyCorrectCount = useMemo(() => {
    return CLASSIFY_ITEMS.filter((it) => answers[it.id] && answers[it.id] === it.correct).length;
  }, [answers]);

  /* -------------------------------------------------- */
  /* ✅ Derived: risk + checklist                          */
  /* -------------------------------------------------- */
  const issues = useMemo(() => riskIssues(profile), [profile]);
  const checklist = useMemo(() => checklistResult(profile), [profile]);

  const warnCount = useMemo(() => issues.filter((x) => x.level === "WARN").length, [issues]);

  const riskScore = useMemo(() => {
    if (issues.length === 1 && issues[0].level === "GOOD") return 0;
    return Math.min(100, warnCount * 15);
  }, [issues, warnCount]);

  const canFinish = useMemo(() => {
    return riskScore === 0 && checklist.okCount === 5;
  }, [riskScore, checklist.okCount]);

  // ✅ (NEW) เช็ค “Bio/Pinned เสี่ยงไหม” เพื่อสลับกรอบแดง ↔ กรอบเขียว + เปลี่ยนข้อความเสี่ยง ↔ ปลอดภัย
  const bioRisk = useMemo(() => {
    return hasPhone(profile.bio) || hasHomeOrExactPlace(profile.bio);
  }, [profile.bio]);

  const pinnedRisk = useMemo(() => {
    return hasSchoolOrClass(profile.pinnedPost) || hasHomeOrExactPlace(profile.pinnedPost);
  }, [profile.pinnedPost]);

  /* -------------------------------------------------- */
  /* ✅ Load auth + student profile                        */
  /* -------------------------------------------------- */
  useEffect(() => {
    let alive = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      if (!user) {
        navigate("/login", { replace: true });
        return;
      }

      const { data: profileRow } = await supabase
        .from("student_profiles")
        .select("first_name,last_name")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!alive) return;

      if (profileRow) {
        const fullName = `${profileRow.first_name ?? ""} ${profileRow.last_name ?? ""}`.trim() || "ผู้เรียน";
        setStudentName(fullName);
        setProfile((p) => ({ ...p, displayName: fullName }));
      }

      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [navigate]);

  /* -------------------------------------------------- */
  /* ✅ Helpers: score                                    */
  /* -------------------------------------------------- */
  const addScore = (delta) => {
    setScore((s) => Math.max(0, s + delta));
  };

  /* -------------------------------------------------- */
  /* ✅ Reset                                             */
  /* -------------------------------------------------- */
  const resetAll = () => {
    const init = {};
    for (const it of CLASSIFY_ITEMS) init[it.id] = "";
    setAnswers(init);

    const fbInit = {};
    for (const it of CLASSIFY_ITEMS) fbInit[it.id] = null;
    setItemFeedback(fbInit);

    setProfile((p) => ({
      ...DEFAULT_PROFILE,
      displayName: p.displayName || "ผู้เรียน",
    }));

    setTaskMode("classify");
    setSimTab("BUILDER");

    setScenarioId(null);
    setScenarioChoice(null);
    setScenarioFeedback(null);

    setAuditNote(null);

    setScore(0);
  };

  const resetClassifyOnly = () => {
    const init = {};
    for (const it of CLASSIFY_ITEMS) init[it.id] = "";
    setAnswers(init);

    const fbInit = {};
    for (const it of CLASSIFY_ITEMS) fbInit[it.id] = null;
    setItemFeedback(fbInit);
  };

  const resetSimulationOnly = () => {
    setProfile((p) => ({
      ...DEFAULT_PROFILE,
      displayName: p.displayName || "ผู้เรียน",
    }));
    setSimTab("BUILDER");

    setScenarioId(null);
    setScenarioChoice(null);
    setScenarioFeedback(null);

    setAuditNote(null);
  };

  /* -------------------------------------------------- */
  /* ✅ Classification logic                              */
  /* -------------------------------------------------- */
  const chooseAnswer = (item, value) => {
    setAnswers((prev) => ({ ...prev, [item.id]: value }));

    const isCorrect = value === item.correct;

    setItemFeedback((prev) => ({
      ...prev,
      [item.id]: isCorrect
        ? { type: "good", message: `ถูก ✅ ข้อนี้ควรเลือก “${item.correct}”`, hint: item.explain }
        : { type: "warn", message: `ยังไม่ตรง ❗ ข้อนี้ควรเลือก “${item.correct}”`, hint: item.explain },
    }));

    if (isCorrect) addScore(10);
    else addScore(-3);
  };

  /* -------------------------------------------------- */
  /* ✅ Simulation setters (เลือกอย่างเดียว)               */
  /* -------------------------------------------------- */
  const setField = (key, value) => setProfile((p) => ({ ...p, [key]: value }));
  const setPrivacy = (key, value) => setProfile((p) => ({ ...p, privacy: { ...p.privacy, [key]: value } }));

  const runAudit = () => {
    // ให้ feedback ตามตรรกะใหม่ (DM เปิดได้ ถ้ามี message requests)
    if (riskScore === 0 && checklist.okCount === 5) {
      setAuditNote({ type: "good", title: "ผ่าน", desc: "ปลอดภัย + ภาพลักษณ์ดี พร้อมเผยแพร่" });
      addScore(6);
      return;
    }

    // โฟกัสคำแนะนำที่ “สมเหตุสมผล”
    const hints = [];
    if (hasPhone(profile.bio)) hints.push("เปลี่ยน Bio เป็นแบบ “ติดต่อผ่าน DM (ไม่แสดงเบอร์)”");
    if (profile.privacy.dm === "ANYONE" && !profile.privacy.messageRequests) hints.push("เปิด Message requests (กันสแปม/คนไม่รู้จัก)");
    if (profile.privacy.locationTagging) hints.push("ปิด Location tagging");
    if (hasSchoolOrClass(profile.pinnedPost) || hasHomeOrExactPlace(profile.pinnedPost)) hints.push("เปลี่ยน Pinned เป็นแบบโชว์ผลงาน/กิจกรรมกว้าง ๆ");
    if (/200\d|201\d|202\d|เมือง|นนท์|เชียง|โคราช|ภูเก็ต|หาดใหญ่|บ้าน|หมู่/.test(profile.username || "")) hints.push("เปลี่ยน Username ให้ไม่บอกปี/เมือง");

    if (checklist.okCount >= 3) {
      setAuditNote({
        type: "info",
        title: "ดีขึ้นเยอะ",
        desc: hints.length ? `ลองอีกนิด: ${hints.slice(0, 2).join(" • ")}` : "เหลืออีกนิดเดียว ลองตรวจซ้ำ",
      });
      addScore(3);
    } else {
      setAuditNote({
        type: "warn",
        title: "ยังเสี่ยงอยู่",
        desc: hints.length ? `แนะนำ: ${hints.slice(0, 2).join(" • ")}` : "ลองเปลี่ยนตัวเลือกเป็นแบบปลอดภัย แล้วกดตรวจอีกครั้ง",
      });
    }
  };

  /* -------------------------------------------------- */
  /* ✅ Scenario logic                                    */
  /* -------------------------------------------------- */
  const currentScenario = useMemo(() => {
    return SCENARIOS.find((s) => s.id === scenarioId) || null;
  }, [scenarioId]);

  const pickRandomScenario = () => {
    const next = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
    setScenarioId(next.id);
    setScenarioChoice(null);
    setScenarioFeedback(null);
  };

  const answerScenario = (optionIndex) => {
    if (!currentScenario) return;

    const opt = currentScenario.options[optionIndex];
    if (!opt) return;

    setScenarioChoice(optionIndex);

    if (opt.correct) {
      setScenarioFeedback({ type: "good", message: "ถูก", explain: opt.explain });
    } else {
      setScenarioFeedback({ type: "warn", message: "ยังไม่ดีที่สุด", explain: opt.explain });
    }

    addScore(opt.score || 0);
  };

  /* -------------------------------------------------- */
  /* ✅ Lesson content                                    */
  /* -------------------------------------------------- */
  const lessonBullets = useMemo(
    () => [
      {
        title: "โปรไฟล์สาธารณะมีอะไรบ้าง?",
        items: ["Username / ชื่อที่แสดง", "Bio + ลิงก์ผลงาน", "โพสต์ปักหมุด + การแชร์", "ตั้งค่าความเป็นส่วนตัว"],
      },
      {
        title: "เช็กก่อนโพสต์ 3 ข้อ",
        items: ["ใครเห็น?", "อยู่ที่ไหน? (สาธารณะ = แชร์ต่อได้)", "ส่งผลอะไร? (ชื่อเสียง/โอกาสอนาคต)"],
      },
      {
        title: "จำง่าย ๆ",
        items: ["ข้อมูลทั่วไป = ป้ายชื่อ", "ข้อมูลอ่อนไหว = กล่องเซฟ", "DM เปิดได้ แต่ต้องมีตัวกรอง/Message requests"],
      },
    ],
    []
  );

  /* -------------------------------------------------- */
  /* ✅ Navigation gating                                 */
  /* -------------------------------------------------- */
  const gotoMode = (mode) => {
    if (mode === "simulate" && !classifyDone) return;
    setTaskMode(mode);
  };

  return (
    <div className="edu-app">
      {/* =========================
          TOPBAR
         ========================= */}
      <header className="edu-topbar">
        <div className="edu-topbar__inner">
          <div className="homebar__brand" role="banner">
            <img src={logo} alt="LearnSecure logo" className="homebar__logo" />
            <div className="edu-brandtext">
              <div className="edu-brandtext__title">LearnSecure</div>
              <div className="edu-brandtext__subtitle">Unit 3</div>
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
              <FiLogOut aria-hidden="true" />
              ออกจากระบบ
            </button>
          </div>
        </div>
      </header>

      <main className="edu-layout">
        {/* =========================
            HERO
           ========================= */}
        <section className="edu-hero" aria-label="Unit 3 header">
          <div className="edu-hero__card">
            <div className="edu-hero__title">Unit 3: การจัดการรอยเท้าดิจิทัลและตัวตนออนไลน์</div>
<div className="edu-hero__sub">เรื่องที่ 5	การนำเสนอและปรับโปรไฟล์ออนไลน์
</div>
            <div className="edu-lessons__toolbar">
              <button className="edu-btn edu-btn--back" type="button" onClick={() => (step === "task" ? setStep("lesson") : navigate(-1))}>
                <FiChevronLeft aria-hidden="true" />
                กลับ
              </button>

              <button className="edu-btn edu-btn--ghost" type="button" onClick={() => navigate("/main")}>
                <FiHome aria-hidden="true" />
                กลับหน้าหลัก
              </button>
            </div>
          </div>
        </section>

        {/* =========================
            CONTENT WRAPPER
           ========================= */}
        <section className="edu-panel">
          <div className="edu-panel__head">
            <div className="edu-panel__title">
              <FiFileText aria-hidden="true" />
              {step === "lesson" ? "บทนำ" : "กิจกรรมปรับโปรไฟล์"}
            </div>

            {step === "task" && (
              <button className="edu-btn" type="button" onClick={resetAll} title="รีเซ็ตทั้งหมด">
                <FiRotateCcw /> รีเซ็ต
              </button>
            )}
          </div>

          {/* =========================
              LESSON
             ========================= */}
          {step === "lesson" && (
            <div className="edu-card">
              <div style={{ display: "grid", gap: 14 }}>
                {lessonBullets.map((b, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: 12,
                      border: "1px solid rgba(0,0,0,.08)",
                      borderRadius: 14,
                      background: "rgba(255,255,255,.70)",
                    }}
                  >
                    <div style={{ fontWeight: 900, marginBottom: 6 }}>{b.title}</div>
                    <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
                      {b.items.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="edu-callout" style={{ marginTop: 12 }}>
                <b>ทริคจำ:</b>{" "}
                <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                  <BadgeIcon kind="user" /> ข้อมูลทั่วไป
                </span>{" "}
                |{" "}
                <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                  <BadgeIcon kind="safe" /> ข้อมูลอ่อนไหว
                </span>
                <br />
                ลังเลเมื่อไหร่… <b>ปรับก่อนค่อยปล่อย</b>
              </div>

              <div className="edu-lessonActions">
                <button className="edu-btn edu-btn--primary" type="button" onClick={() => setStep("task")}>
                  เริ่มกิจกรรม <FiChevronRight />
                </button>
              </div>
            </div>
          )}

          {/* =========================
              TASK
             ========================= */}
          {step === "task" && (
            <div className="edu-card">
              {/* TAB (ขั้นใหญ่) */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                <button className={`edu-btn ${taskMode === "classify" ? "edu-btn--primary" : ""}`} type="button" onClick={() => gotoMode("classify")}>
                  1) คัดแยก
                </button>

                <button
                  className={`edu-btn ${taskMode === "simulate" ? "edu-btn--primary" : ""}`}
                  type="button"
                  onClick={() => gotoMode("simulate")}
                  disabled={!classifyDone}
                  title={!classifyDone ? "ทำคัดแยกให้ครบก่อน" : "ไปการจำลอง"}
                >
                  2) การจำลอง
                </button>

                <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
                  <span className="edu-pill edu-pill--muted">คะแนน: {score}</span>
                  <span className="edu-pill edu-pill--muted">
                    คัดแยกถูก: {classifyCorrectCount}/{CLASSIFY_ITEMS.length}
                  </span>
                </div>
              </div>

              {/* =========================
                  MODE: CLASSIFY
                 ========================= */}
              {taskMode === "classify" && (
                <div>
                  <div className="edu-callout" style={{ marginBottom: 12 }}>
                    เลือกให้ครบทุกข้อ — <b>OK</b> = ลงสาธารณะได้ | <b>ADJUST</b> = ควรปรับ/ซ่อนก่อน
                    <br />
                    สถานะ:{" "}
                    {classifyDone ? <span className="edu-pill edu-pill--ok">ครบแล้ว ✅</span> : <span className="edu-pill edu-pill--muted">ยังไม่ครบ</span>}
                  </div>

                  <div className="edu-grid" style={{ gap: 12 }}>
                    {CLASSIFY_ITEMS.map((it) => {
                      const chosen = answers[it.id];
                      const fb = itemFeedback[it.id];

                      const isAdjust = it.correct === "ADJUST";

                      return (
                        <div key={it.id} className="edu-card" style={{ padding: 12 }}>
                          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", justifyContent: "space-between" }}>
                            <div style={{ fontWeight: 900 }}>{it.label}</div>

                            {/* ✅ เปลี่ยนจาก emoji hint → icon + text */}
                            <span className="edu-pill edu-pill--muted" style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                              <BadgeIcon kind={isAdjust ? "risk" : "user"} size={14} />
                              {it.hint}
                            </span>
                          </div>

                          <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                            <button type="button" className={`edu-btn ${chosen === "OK" ? "edu-btn--primary" : ""}`} onClick={() => chooseAnswer(it, "OK")}>
                              OK
                            </button>

                            <button type="button" className={`edu-btn ${chosen === "ADJUST" ? "edu-btn--primary" : ""}`} onClick={() => chooseAnswer(it, "ADJUST")}>
                              ADJUST
                            </button>

                            <span className="edu-pill edu-pill--muted">{chosen ? `เลือก: ${chosen}` : "ยังไม่เลือก"}</span>
                          </div>

                          {fb && (
                            <div
                              className="edu-callout"
                              style={{
                                marginTop: 10,
                                borderLeft: fb.type === "good" ? "6px solid #10b981" : "6px solid #f59e0b",
                              }}
                            >
                              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                                {fb.type === "good" ? <FiCheckCircle /> : <FiAlertTriangle />}
                                <div>
                                  <div style={{ fontWeight: 900 }}>{fb.message}</div>
                                  <div style={{ marginTop: 6 }}>{fb.hint}</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                    <button className="edu-btn" type="button" onClick={resetClassifyOnly}>
                      <FiRotateCcw /> รีเซ็ตคัดแยก
                    </button>

                    <button className="edu-btn edu-btn--primary" type="button" onClick={() => gotoMode("simulate")} disabled={!classifyDone}>
                      ไปการจำลอง <FiChevronRight />
                    </button>
                  </div>
                </div>
              )}

              {/* =========================
                  MODE: SIMULATE (✅ ส่วนที่ 2 ทั้งหมด: ปรับ icon/ข้อความให้ดูโปร)
                 ========================= */}
              {taskMode === "simulate" && (
                <div>
                  {/* Safety Meter */}
                  <div className="sim-status-board">
                    <div className="sim-meter-header">
                      <div className="sim-meter-title" style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                        <FiShield /> ระดับความปลอดภัยโปรไฟล์
                      </div>
                      <div className="sim-meter-value">{100 - riskScore}%</div>
                    </div>

                    <div className="sim-progress-bg">
                      <div
                        className="sim-progress-fill"
                        style={{
                          width: `${100 - riskScore}%`,
                          backgroundColor: riskScore > 60 ? "#ef4444" : riskScore > 0 ? "#f59e0b" : "#10b981",
                        }}
                      />
                    </div>

                    <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                      <span className="edu-pill edu-pill--muted" style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                        <BadgeIcon kind="warn" size={14} /> จุดเสี่ยง: {warnCount}
                      </span>
                      <span className="edu-pill edu-pill--muted" style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                        <BadgeIcon kind="ok" size={14} /> Checklist: {checklist.okCount}/5
                      </span>
                      <span className="edu-pill edu-pill--muted">{checklist.level}</span>
                    </div>

                    <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <button className="edu-btn" type="button" onClick={resetSimulationOnly}>
                        <FiRotateCcw /> รีเซ็ตโปรไฟล์จำลอง
                      </button>

                      <button className="edu-btn edu-btn--primary" type="button" onClick={runAudit}>
                        ตรวจโปรไฟล์ <FiChevronRight />
                      </button>
                    </div>

                    {auditNote && (
                      <div
                        className="edu-callout"
                        style={{
                          marginTop: 12,
                          borderLeft:
                            auditNote.type === "good"
                              ? "6px solid #10b981"
                              : auditNote.type === "warn"
                              ? "6px solid #f59e0b"
                              : "6px solid #60a5fa",
                        }}
                      >
                        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                          <BadgeIcon kind={auditNote.type === "good" ? "ok" : auditNote.type === "warn" ? "warn" : "user"} size={18} />
                          <div>
                            <div style={{ fontWeight: 900 }}>{auditNote.title}</div>
                            <div style={{ marginTop: 6, color: "#6b7280" }}>{auditNote.desc}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Workspace */}
                  <div
                    className="sim-workspace"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "minmax(280px, 420px) 1fr",
                      gap: 14,
                      alignItems: "start",
                      marginTop: 14,
                    }}
                  >
                    {/* LEFT: Preview */}
                    <div style={{ position: "sticky", top: 12 }}>
                      <div className="phone-case">
                        <div className="phone-screen">
                          <div className="phone-header">
                            <div className="phone-avatar">
                              <FiUser size={24} />
                            </div>

                            <div className="phone-user-info">
                              <div
                                className={`phone-username ${
                                  /200\d|201\d|202\d|เมือง|นนท์|เชียง|โคราช|ภูเก็ต|หาดใหญ่|บ้าน|หมู่/.test(profile.username || "") ? "danger-blink" : ""
                                }`}
                              >
                                @{profile.username}
                              </div>
                              <div className="phone-displayname">{profile.displayName}</div>
                            </div>
                          </div>

                          <div className="phone-body">
                            {/* ✅ Bio box: เสี่ยง=แดง | ปลอดภัย=เขียว + เปลี่ยนไอคอน/ข้อความ */}
                            <div className={`phone-bio-box ${bioRisk ? "danger-zone" : "safe-zone"}`}>
                              <div className={`zone-badge ${bioRisk ? "zone-badge--risk" : "zone-badge--safe"}`}>
                                <BadgeIcon kind={bioRisk ? "risk" : "safe"} size={12} />
                                {bioRisk ? "เสี่ยง" : "ปลอดภัย"}
                              </div>

                              <small style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                                <BadgeIcon kind={bioRisk ? "risk" : "safe"} size={14} /> Bio
                              </small>
                              <p style={{ margin: "6px 0 0" }}>{profile.bio}</p>
                            </div>

                            {/* ✅ Pinned box: เสี่ยง=แดง | ปลอดภัย=เขียว + เปลี่ยนไอคอน/ข้อความ */}
                            <div className={`phone-post-box ${pinnedRisk ? "danger-zone" : "safe-zone"}`}>
                              <div className={`zone-badge ${pinnedRisk ? "zone-badge--risk" : "zone-badge--safe"}`}>
                                <BadgeIcon kind={pinnedRisk ? "risk" : "safe"} size={12} />
                                {pinnedRisk ? "เสี่ยง" : "ปลอดภัย"}
                              </div>

                              <div className="post-tag" style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                                <FiFileText /> Pinned Post
                              </div>
                              <p style={{ margin: "6px 0 0" }}>{profile.pinnedPost}</p>
                            </div>

                            <div className="phone-settings-preview">
                              <div className="setting-item">
                                <span>DM:</span>{" "}
                                <b style={{ color: profile.privacy.dm === "ANYONE" ? "#f59e0b" : "#10b981" }}>
                                  {profile.privacy.dm === "ANYONE" ? "ใครก็ทักได้" : "เฉพาะเพื่อน"}
                                </b>
                              </div>
                              <div className="setting-item">
                                <span>Requests:</span>{" "}
                                <b style={{ color: profile.privacy.messageRequests ? "#10b981" : "#ef4444" }}>
                                  {profile.privacy.messageRequests ? "เปิด" : "ปิด"}
                                </b>
                              </div>
                              <div className="setting-item">
                                <span>Visibility:</span>{" "}
                                <b style={{ color: profile.privacy.profileVisibility === "PUBLIC" ? "#f59e0b" : "#10b981" }}>
                                  {profile.privacy.profileVisibility === "PUBLIC" ? "สาธารณะ" : "เฉพาะเพื่อน"}
                                </b>
                              </div>
                              <div className="setting-item">
                                <span>Location tag:</span>{" "}
                                <b style={{ color: profile.privacy.locationTagging ? "#ef4444" : "#10b981" }}>
                                  {profile.privacy.locationTagging ? "เปิด" : "ปิด"}
                                </b>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Checklist */}
                      <div className="edu-card" style={{ padding: 12, marginTop: 12 }}>
                        <div style={{ fontWeight: 900, marginBottom: 10, display: "inline-flex", gap: 8, alignItems: "center" }}>
                          <FiCheckCircle /> Checklist
                        </div>
                        <div style={{ display: "grid", gap: 8 }}>
                          {checklist.list.map((x, i) => (
                            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                              <span className={`edu-pill ${x.ok ? "edu-pill--ok" : "edu-pill--muted"}`} style={{ minWidth: 44, textAlign: "center" }}>
                                {x.ok ? "ผ่าน" : "รอ"}
                              </span>
                              <div style={{ fontSize: 13, color: x.ok ? "#111827" : "#6b7280", lineHeight: 1.5 }}>{x.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* RIGHT: Simple Builder + Scenario */}
                    <div>
                      {/* Tabs */}
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12, alignItems: "center" }}>
                        <button className={`edu-btn ${simTab === "BUILDER" ? "edu-btn--primary" : ""}`} type="button" onClick={() => setSimTab("BUILDER")}>
                          <FiCheckCircle /> เลือกปรับโปรไฟล์
                        </button>
                        <button className={`edu-btn ${simTab === "SCENARIO" ? "edu-btn--primary" : ""}`} type="button" onClick={() => setSimTab("SCENARIO")}>
                          <FiAlertTriangle /> เหตุการณ์สุ่ม
                        </button>
                      </div>

                      {/* BUILDER */}
                      {simTab === "BUILDER" && (
                        <div className="edu-card" style={{ padding: 12 }}>
                          <div style={{ fontWeight: 900, marginBottom: 10 }}>เลือกให้ปลอดภัย (ไม่ต้องพิมพ์)</div>

                          <div style={{ display: "grid", gap: 12 }}>
                            {/* Username */}
                            <div style={{ display: "grid", gap: 8 }}>
                              <b>1) Username</b>
                              <select className="edu-input" value={profile.username} onChange={(e) => setField("username", e.target.value)}>
                                {USERNAME_OPTIONS.map((u) => (
                                  <option key={u.value} value={u.value}>
                                    {u.label}
                                  </option>
                                ))}
                              </select>
                              <div style={{ fontSize: 12, color: "#6b7280", display: "inline-flex", gap: 8, alignItems: "center" }}>
                                <BadgeIcon kind="risk" size={14} /> ทริค: อย่าใส่ปี/เมือง
                              </div>
                            </div>

                            {/* Bio */}
                            <div style={{ display: "grid", gap: 8 }}>
                              <b>2) Bio</b>
                              <select className="edu-input" value={profile.bio} onChange={(e) => setField("bio", e.target.value)}>
                                {BIO_OPTIONS.map((b) => (
                                  <option key={b.label} value={b.value}>
                                    {b.label}
                                  </option>
                                ))}
                              </select>
                              <div style={{ fontSize: 12, color: "#6b7280" }}>
                                ลำดับคิด: เริ่มมีเบอร์ได้ (สมจริง) → แล้ว “ปรับ” ให้ไม่แสดงเบอร์
                              </div>
                            </div>

                            {/* Pinned */}
                            <div style={{ display: "grid", gap: 8 }}>
                              <b>3) Pinned Post</b>
                              <select className="edu-input" value={profile.pinnedPost} onChange={(e) => setField("pinnedPost", e.target.value)}>
                                {PINNED_OPTIONS.map((p) => (
                                  <option key={p.label} value={p.value}>
                                    {p.label}
                                  </option>
                                ))}
                              </select>
                              <div style={{ fontSize: 12, color: "#6b7280", display: "inline-flex", gap: 8, alignItems: "center" }}>
                                <BadgeIcon kind="file" size={14} /> Pinned ควรเป็น “ผลงาน/สิ่งดี ๆ” ไม่ใช่เช็กอิน
                              </div>
                            </div>

                            {/* Privacy */}
                            <div className="edu-card" style={{ padding: 12, background: "rgba(255,255,255,.70)" }}>
                              <div style={{ fontWeight: 900, marginBottom: 10, display: "inline-flex", gap: 8, alignItems: "center" }}>
                                <FiShield /> ตั้งค่า Privacy (สมเหตุสมผล)
                              </div>

                              <div style={{ display: "grid", gap: 10 }}>
                                <div style={{ display: "grid", gap: 6 }}>
                                  <b>DM (ใครทักได้)</b>
                                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                    <button
                                      type="button"
                                      className={`edu-btn ${profile.privacy.dm === "ANYONE" ? "edu-btn--primary" : ""}`}
                                      onClick={() => setPrivacy("dm", "ANYONE")}
                                    >
                                      ใครก็ทักได้ (ติดต่องานได้)
                                    </button>
                                    <button
                                      type="button"
                                      className={`edu-btn ${profile.privacy.dm === "FRIENDS" ? "edu-btn--primary" : ""}`}
                                      onClick={() => setPrivacy("dm", "FRIENDS")}
                                    >
                                      เฉพาะเพื่อน
                                    </button>
                                  </div>
                                  <div style={{ fontSize: 12, color: "#6b7280" }}>
                                    DM เปิดได้ แต่ควรมี “ตัวกรอง” (Message requests) เพื่อกันสแปม
                                  </div>
                                </div>

                                <div style={{ display: "grid", gap: 6 }}>
                                  <b>Message requests (ตัวกรองคนไม่รู้จัก)</b>
                                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                    <button
                                      type="button"
                                      className={`edu-btn ${profile.privacy.messageRequests ? "edu-btn--primary" : ""}`}
                                      onClick={() => setPrivacy("messageRequests", true)}
                                    >
                                      เปิด
                                    </button>
                                    <button
                                      type="button"
                                      className={`edu-btn ${!profile.privacy.messageRequests ? "edu-btn--primary" : ""}`}
                                      onClick={() => setPrivacy("messageRequests", false)}
                                    >
                                      ปิด (เสี่ยงสแปม)
                                    </button>
                                  </div>
                                </div>

                                <div style={{ display: "grid", gap: 6 }}>
                                  <b>Visibility</b>
                                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                    <button
                                      type="button"
                                      className={`edu-btn ${profile.privacy.profileVisibility === "PUBLIC" ? "edu-btn--primary" : ""}`}
                                      onClick={() => setPrivacy("profileVisibility", "PUBLIC")}
                                    >
                                      สาธารณะ
                                    </button>
                                    <button
                                      type="button"
                                      className={`edu-btn ${profile.privacy.profileVisibility === "FRIENDS" ? "edu-btn--primary" : ""}`}
                                      onClick={() => setPrivacy("profileVisibility", "FRIENDS")}
                                    >
                                      เฉพาะเพื่อน
                                    </button>
                                  </div>
                                </div>

                                <div style={{ display: "grid", gap: 6 }}>
                                  <b>Location tagging</b>
                                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                    <button
                                      type="button"
                                      className={`edu-btn ${profile.privacy.locationTagging ? "edu-btn--primary" : ""}`}
                                      onClick={() => setPrivacy("locationTagging", true)}
                                    >
                                      เปิด
                                    </button>
                                    <button
                                      type="button"
                                      className={`edu-btn ${!profile.privacy.locationTagging ? "edu-btn--primary" : ""}`}
                                      onClick={() => setPrivacy("locationTagging", false)}
                                    >
                                      ปิด
                                    </button>
                                  </div>
                                </div>
                              </div>

                              <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                                <button className="edu-btn edu-btn--primary" type="button" onClick={runAudit}>
                                  ตรวจโปรไฟล์ <FiChevronRight />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* SCENARIO */}
                      {simTab === "SCENARIO" && (
                        <div>
                          <div className="edu-callout" style={{ borderLeft: "6px solid #60a5fa" }}>
                            <div style={{ fontWeight: 900, marginBottom: 6, display: "inline-flex", gap: 8, alignItems: "center" }}>
                              <FiAlertTriangle /> เหตุการณ์สุ่ม
                            </div>
                            <div style={{ color: "#6b7280", fontSize: 13, lineHeight: 1.6 }}>เลือกตอบ → feedback ทันที + ได้คะแนน</div>

                            <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                              <button className="edu-btn edu-btn--primary" type="button" onClick={pickRandomScenario}>
                                สุ่มเหตุการณ์ใหม่ <FiChevronRight />
                              </button>
                              <button
                                className="edu-btn"
                                type="button"
                                onClick={() => {
                                  setScenarioId(null);
                                  setScenarioChoice(null);
                                  setScenarioFeedback(null);
                                }}
                              >
                                เคลียร์เหตุการณ์
                              </button>
                            </div>
                          </div>

                          {currentScenario ? (
                            <div className="edu-card" style={{ padding: 12, marginTop: 12 }}>
                              <div style={{ fontWeight: 900, marginBottom: 6 }}>{currentScenario.title}</div>
                              <div style={{ color: "#6b7280", marginBottom: 12 }}>{currentScenario.prompt}</div>

                              <div style={{ display: "grid", gap: 10 }}>
                                {currentScenario.options.map((op, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    className={`edu-btn ${scenarioChoice === idx ? "edu-btn--primary" : ""}`}
                                    onClick={() => answerScenario(idx)}
                                    disabled={scenarioChoice !== null}
                                    style={{ justifyContent: "flex-start" }}
                                  >
                                    {op.label}
                                  </button>
                                ))}
                              </div>

                              {scenarioFeedback && (
                                <div
                                  className="edu-callout"
                                  style={{
                                    marginTop: 12,
                                    borderLeft: scenarioFeedback.type === "good" ? "6px solid #10b981" : "6px solid #f59e0b",
                                  }}
                                >
                                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                                    <BadgeIcon kind={scenarioFeedback.type === "good" ? "ok" : "warn"} size={18} />
                                    <div>
                                      <div style={{ fontWeight: 900 }}>{scenarioFeedback.message}</div>
                                      <div style={{ marginTop: 6 }}>{scenarioFeedback.explain}</div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="edu-card" style={{ padding: 12, marginTop: 12 }}>
                              <div style={{ fontWeight: 900 }}>ยังไม่มีเหตุการณ์</div>
                              <div style={{ color: "#6b7280", marginTop: 6 }}>กด “สุ่มเหตุการณ์ใหม่” เพื่อเริ่ม</div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Finish */}
                      <div style={{ marginTop: 16, borderTop: "1px solid rgba(0,0,0,.08)", paddingTop: 14 }}>
                        {canFinish ? (
                          <div className="edu-callout" style={{ borderLeft: "6px solid #10b981" }}>
                            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                              <BadgeIcon kind="ok" size={18} />
                              <div>
                                <div style={{ fontWeight: 900, marginBottom: 10 }}>จบได้แล้ว! ปลอดภัย + ภาพลักษณ์ดี</div>
                                <button className="edu-btn edu-btn--ghost" type="button" onClick={() => navigate("/unit3/learn")}>
                                  เสร็จสิ้น <FiChevronRight />
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="edu-callout" style={{ borderLeft: "6px solid #f59e0b" }}>
                            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                              <BadgeIcon kind="warn" size={18} />
                              <div>
                                <div style={{ fontWeight: 900, marginBottom: 6 }}>ยังไม่ครบ</div>
                                <div style={{ fontSize: 13, color: "#6b7280" }}>
                                  ต้องให้ <b>Risk = 0</b> และ <b>Checklist = 5/5</b> ถึงจะจบได้
                                </div>
                                <button className="edu-btn" type="button" disabled style={{ opacity: 0.65, cursor: "not-allowed" }}>
                                  ยังจบไม่ได้
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
