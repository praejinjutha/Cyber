import "../../main.css";
import "../Unit1/learn.css";
import "./unit5-simpler.css";

import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

import logo from "../../assets/logo.png";
import processImg from "./process.png";

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
  FiUsers,
  FiBell,
  FiBookOpen,
} from "react-icons/fi";

/* ------------------------------------------------------------------ */
/* ✅ DATA                                                             */
/* ------------------------------------------------------------------ */
const SCENARIOS = [
  {
    id: "s1",
    icon: <FiUsers />,
    title: "เพื่อนส่งมาในกลุ่มไลน์ห้อง",
    desc: "เพื่อนถามว่า “จริงไหม? ส่งต่อดีไหม?”",
    tone: "กลุ่มแชทแพร่เร็ว ถ้าผิดกระทบหลายคน",
  },
  {
    id: "s2",
    icon: <FiBell />,
    title: "เห็นในฟีด คนคอมเมนต์แตกตื่น",
    desc: "คอมเมนต์ชวนตื่นกลัวและเร่งให้แชร์",
    tone: "ฟีดทำให้อารมณ์นำง่าย ต้องยึดหลักฐาน",
  },
  {
    id: "s3",
    icon: <FiBookOpen />,
    title: "ครูให้เช็กก่อนเอาไปเล่าหน้าห้อง",
    desc: "ต้องอธิบายได้ว่าตรวจอะไรมาแล้ว",
    tone: "งานเรียนต้องมีเหตุผล ไม่ใช่ความรู้สึก",
  },
];

const DECISIONS = [
  {
    id: "believe",
    title: "เชื่อได้ / แชร์ได้",
    emoji: "✅",
    hint: "ที่มาชัด + เวลาชัด + มีหลักฐานรองรับ",
  },
  {
    id: "unsure",
    title: "ยังไม่แน่ใจ",
    emoji: "⚠️",
    hint: "ข้อมูลยังไม่ครบ → ตรวจเพิ่มก่อน",
  },
  {
    id: "dont",
    title: "ไม่ควรเชื่อ / ไม่ควรแชร์",
    emoji: "❌",
    hint: "เสี่ยงผิด (ที่มาไม่ชัด / ข่าวเก่า / คำปั่น)",
  },
];

/**
 * ✅ REASONS
 * สำคัญ: 1 หมวดควรเลือกได้ "ข้อเดียว" (radio ต่อหมวด)
 */
const REASONS = [
  { id: "src_clear", group: "แหล่งที่มา", text: "มีแหล่งข่าวชัดเจน (สื่อ/หน่วยงาน/เว็บที่ระบุชื่อได้)" },
  { id: "src_unknown", group: "แหล่งที่มา", text: "ไม่รู้ต้นทาง หรือผู้เผยแพร่ไม่น่าไว้ใจ" },

  { id: "date_clear", group: "เวลา", text: "มีวัน/เวลาเผยแพร่ชัดเจน และยังเกี่ยวกับสถานการณ์ตอนนี้" },
  { id: "date_old", group: "เวลา", text: "ข่าวเก่า/หมดบริบท เสี่ยงถูกแชร์ซ้ำจนเข้าใจผิด" },

  { id: "lang_news", group: "ภาษา/วิธีเล่า", text: "ภาษาเป็นกลาง อธิบายข้อมูล ไม่เร้าอารมณ์" },
  { id: "lang_hype", group: "ภาษา/วิธีเล่า", text: "มีคำชวนเชื่อ/เร่งให้แชร์/ทำให้อารมณ์นำ" },

  { id: "cmp_done", group: "เทียบหลายแหล่ง", text: "เทียบแล้ว พบว่าหลายแหล่งตรงกัน/มีหน่วยงานยืนยัน" },
  { id: "cmp_notyet", group: "เทียบหลายแหล่ง", text: "ยังไม่ได้เทียบหลายแหล่ง เลยสรุปยังไม่เต็มที่" },
];

// ✅ ตัวอย่างสรุปชีวิตจริง: “บอกตัวเอง/บอกเพื่อน” แบบสั้น
const SAMPLE_SUMMARIES = {
  believe: [
    "แชร์ได้ เพราะต้นทางชัด + วันเวลายังใหม่ และข้อมูลตรงกับหลายแหล่ง",
    "โอเคที่จะเชื่อ แต่ก่อนแชร์ขอเช็กอีก 1 แหล่งให้ชัวร์",
  ],
  unsure: [
    "ยังไม่แชร์ก่อน เพราะยังไม่เจอแหล่งหลักยืนยัน",
    "ขอเช็กเพิ่ม: ดูต้นทาง + ดูวันเวลา + เทียบอีก 1–2 แหล่ง แล้วค่อยตัดสินใจ",
  ],
  dont: [
    "ไม่แชร์ เพราะต้นทางไม่ชัด/คำปั่นอารมณ์/ข่าวเก่าเสี่ยงเข้าใจผิด",
    "หยุดไว้ก่อน ถ้าจำเป็นค่อยดูประกาศจากหน่วยงานทางการหรือสื่อหลัก",
  ],
};

/* ------------------------------------------------------------------ */
/* ✅ HELPERS                                                          */
/* ------------------------------------------------------------------ */

/**
 * ✅ จัดกลุ่มเหตุผลตามหมวด
 * @param {Array<{id:string,group:string,text:string}>} reasons
 * @returns {Record<string, Array<{id:string,group:string,text:string}>>}
 */
function groupReasons(reasons) {
  const map = {};
  for (const r of reasons) {
    if (!map[r.group]) map[r.group] = [];
    map[r.group].push(r);
  }
  return map;
}

/**
 * ✅ แปลงการเลือกแบบ "เลือก 1 ข้อต่อหมวด" ให้ออกมาเป็น array ของ reason ids
 * @param {Record<string, string>} pickedByGroup - เช่น { "เวลา": "date_old", "แหล่งที่มา": "src_unknown" }
 * @returns {string[]}
 */
function pickedIdsFromGroups(pickedByGroup) {
  return Object.values(pickedByGroup).filter(Boolean);
}

/**
 * ✅ Feedback: สั้น ชัด มืออาชีพ และบอก “ทำต่ออะไร”
 * - good = ถูกต้อง/ไปต่อได้
 * - warn = มีจุดขัดแย้ง/เสี่ยง
 * - neutral = ยังไม่ครบ
 */
function evaluateDecision(decisionId, pickedReasonIds) {
  const picked = new Set(pickedReasonIds);

  // ✅ จุดบวก
  const hasGoodSource = picked.has("src_clear");
  const hasGoodDate = picked.has("date_clear");
  const hasNewsLang = picked.has("lang_news");
  const hasCompareDone = picked.has("cmp_done");

  // ⚠️ จุดเสี่ยง/ยังไม่ครบ
  const hasUnknownSource = picked.has("src_unknown");
  const hasOldDate = picked.has("date_old");
  const hasHypeLang = picked.has("lang_hype");
  const hasCompareNotYet = picked.has("cmp_notyet");

  const anyPicked = pickedReasonIds.length > 0;

  if (!decisionId) {
    return {
      level: "neutral",
      title: "เริ่มจากเลือกคำตัดสินใจก่อน",
      body: "เลือก 1 ข้อ: เชื่อได้ / ยังไม่แน่ใจ / ไม่ควรแชร์",
    };
  }

  if (!anyPicked) {
    return {
      level: "warn",
      title: "เลือกเหตุผลอย่างน้อย 1 หมวด",
      body: "เพื่อให้ตัดสินใจจากข้อมูลที่ตรวจสอบได้ ไม่ใช่ความรู้สึก",
    };
  }

  const hasRisk = hasUnknownSource || hasOldDate || hasHypeLang;
  const hasStrongPositive = hasGoodSource && hasGoodDate && hasNewsLang;

  if (decisionId === "believe") {
    if (hasRisk) {
      return {
        level: "warn",
        title: "ยังไม่ควรเชื่อทันที",
        body: "มีสัญญาณเสี่ยงอยู่ → เปลี่ยนเป็น “ยังไม่แน่ใจ” หรือกลับไปเช็กที่มา/เวลา/ภาษาให้ชัดก่อนแชร์",
      };
    }
    if (!hasCompareDone) {
      return {
        level: "good",
        title: "ดีแล้ว — แนะนำเทียบอีก 1 แหล่งก่อนแชร์",
        body: "ตอนนี้ดูน่าเชื่อถือ แต่ถ้าเทียบกับสื่อหลัก/หน่วยงานอีก 1–2 แหล่ง จะมั่นใจขึ้น",
      };
    }
    return {
      level: "good",
      title: "ผ่าน — เชื่อได้อย่างมีเหตุผล",
      body: "ที่มาชัด + เวลาชัด + ภาษากลาง + เทียบหลายแหล่งแล้ว",
    };
  }

  if (decisionId === "unsure") {
    if (hasStrongPositive && hasCompareDone && !hasRisk) {
      return {
        level: "neutral",
        title: "หลักฐานค่อนข้างครบแล้ว",
        body: "ถ้าคุณมั่นใจว่า “ที่มา/เวลา/ภาษา” ชัด และเทียบแล้ว สามารถเลือก “เชื่อได้” ได้",
      };
    }
    if (hasCompareNotYet) {
      return {
        level: "good",
        title: "ถูกต้อง — ยังไม่แน่ใจเพราะยังไม่เทียบหลายแหล่ง",
        body: "ทำต่อ: ค้นคีย์เวิร์ด แล้วเทียบกับสื่อหลัก/หน่วยงานทางการอย่างน้อย 1–2 แหล่ง",
      };
    }
    if (hasRisk) {
      return {
        level: "good",
        title: "รอบคอบดี",
        body: "เจอสัญญาณเสี่ยง → เก็บไว้ก่อน หาหลักฐานเพิ่มแล้วค่อยสรุป",
      };
    }
    return {
      level: "good",
      title: "โอเค — เลือกยังไม่แน่ใจ",
      body: "ทำต่อ: เลือกหมวด “เทียบหลายแหล่ง” จะช่วยให้สรุปได้ชัดขึ้น",
    };
  }

  if (decisionId === "dont") {
    if (!hasRisk && (hasStrongPositive || hasCompareDone)) {
      return {
        level: "warn",
        title: "เหตุผลยังไม่สอดคล้องกับ “ไม่ควรแชร์”",
        body: "คุณเลือกข้อดีหลายข้อ แต่ตัดสินใจไม่แชร์ → เปลี่ยนเป็น “ยังไม่แน่ใจ” หรือเลือกเหตุผลเสี่ยง (ที่มาไม่ชัด/ข่าวเก่า/คำปั่น) ให้ชัดเจน",
      };
    }
    if (hasRisk) {
      return {
        level: "good",
        title: "ดีมาก — ไม่แชร์คือปลอดภัยสุด",
        body: "มีสัญญาณเสี่ยง → ไม่ส่งต่อ และถ้าจำเป็นค่อยตรวจจากแหล่งทางการ",
      };
    }
    return {
      level: "neutral",
      title: "ไม่แชร์ได้ แต่ขอเหตุผลที่ชัดขึ้น",
      body: "เลือกเหตุผลเสี่ยงอย่างน้อย 1 หมวด (ที่มาไม่ชัด / ข่าวเก่า / คำปั่น) เพื่ออธิบายได้ชัดว่าทำไมไม่แชร์",
    };
  }

  return { level: "neutral", title: "พร้อมแล้ว", body: "ลองเลือกเหตุผลเพิ่มเพื่อให้คำตอบชัดขึ้น" };
}

/**
 * ✅ ไอคอนสำหรับกล่อง feedback
 * @param {{level: "good"|"warn"|"neutral"}} props
 */
function FeedbackIcon({ level }) {
  if (level === "good") return <FiCheckCircle aria-hidden="true" />;
  if (level === "warn") return <FiAlertTriangle aria-hidden="true" />;
  return <FiShield aria-hidden="true" />;
}

/* ------------------------------------------------------------------ */
/* ✅ COMPONENT                                                        */
/* ------------------------------------------------------------------ */
const Learn6Unit5 = () => {
  // ✅ Router
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Mode param (เผื่อใช้ภายหลัง)
  const mode = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    return sp.get("mode") || "all";
  }, [location.search]);

  // ✅ Auth/Profile
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");

  // ✅ Step
  const [step, setStep] = useState(1); // 1 micro, 2 task, 3 wrap

  // ✅ Task states
  const [scenarioId, setScenarioId] = useState("s1");
  const [decisionId, setDecisionId] = useState("");

  /**
   * ✅ เปลี่ยนใหม่: เลือกเหตุผลแบบ "1 ข้อต่อหมวด"
   * ตัวอย่าง: { "แหล่งที่มา": "src_unknown", "เวลา": "date_old" }
   */
  const [pickedByGroup, setPickedByGroup] = useState({});

  // ✅ Grouped reasons + scenario
  const grouped = useMemo(() => groupReasons(REASONS), []);
  const scenario = useMemo(() => SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0], [scenarioId]);

  // ✅ แปลงเป็น array ให้ evaluateDecision ใช้งานเหมือนเดิม
  const pickedReasonIds = useMemo(() => pickedIdsFromGroups(pickedByGroup), [pickedByGroup]);

  // ✅ Feedback จาก decision + reasons
  const feedback = useMemo(() => evaluateDecision(decisionId, pickedReasonIds), [decisionId, pickedReasonIds]);

  // ✅ เปิดทุกหมวดเป็นค่าเริ่มต้น (กดย่อค่อยหุบ)
  const allGroups = useMemo(() => Object.keys(grouped), [grouped]);
  const [openGroups, setOpenGroups] = useState([]);

  useEffect(() => {
    setOpenGroups(allGroups);
  }, [allGroups]);

  // ✅ Load session + profile
  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);

      // ✅ Get session
      const { data } = await supabase.auth.getSession();
      const u = data.session?.user;

      // ✅ No session → login
      if (!u) {
        navigate("/login", { replace: true });
        return;
      }

      // ✅ Load profile
      const { data: profile } = await supabase
        .from("student_profiles")
        .select("first_name,last_name")
        .eq("user_id", u.id)
        .maybeSingle();

      if (!alive) return;

      // ✅ Set student name
      if (profile) {
        setStudentName(`${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim());
      }

      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [navigate]);

  // ✅ Title per step
  const stepTitle = useMemo(() => {
    if (step === 1) return "สูตรสรุปให้จบใน 1 ประโยค";
    if (step === 2) return "เลือกสถานการณ์ → เลือกคำตอบ → เลือกเหตุผล";
    return "Tip";
  }, [step]);

  // ✅ Back behavior
  const handleBack = () => {
    if (step === 3) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (step === 2) {
      setStep(1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    navigate(-1);
  };

  /**
   * ✅ Reset answers (decision + reasons)
   * - ตรงนี้จะล้าง “ทุกหมวด” ให้กลับไปยังไม่เลือก
   */
  const resetAll = () => {
    setDecisionId("");
    setPickedByGroup({});
  };

  /**
   * ✅ เปลี่ยนใหม่: เลือกเหตุผลแบบ 1 ข้อต่อหมวด (radio)
   * @param {string} groupName
   * @param {string} reasonId
   */
  const pickReasonInGroup = (groupName, reasonId) => {
    setPickedByGroup((prev) => ({
      ...prev,
      [groupName]: reasonId, // ✅ เซ็ตทับทันที ทำให้ในหมวดเดียวเลือกได้แค่ 1
    }));
  };

  /**
   * ✅ เปิด/ปิดหมวด (accordion)
   * @param {string} g
   */
  const toggleGroup = (g) => {
    setOpenGroups((prev) => {
      const open = prev.includes(g);
      return open ? prev.filter((x) => x !== g) : [...prev, g];
    });
  };

  // ✅ ไป Step 3 ได้ถ้าเลือก decision แล้ว (เหมือนเดิม)
  const canGoWrap = Boolean(decisionId);

  return (
    <div className="edu-app u5s">
      {/* ✅ TOPBAR */}
      <header className="edu-topbar">
        <div className="edu-topbar__inner">
          <div className="homebar__brand" role="banner">
            <img src={logo} alt="LearnSecure logo" className="homebar__logo" />
            <div className="edu-brandtext">
              <div className="edu-brandtext__title">LearnSecure</div>
              <div className="edu-brandtext__subtitle">Unit 5</div>
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
        {/* ✅ HERO */}
        <section className="edu-hero" aria-label="Unit 5 header">
          <div className="edu-hero__card">
            <div className="edu-hero__row">
              <div className="edu-hero__headline">
                <div className="edu-hero__title">Unit 5: การรู้เท่าทันข่าวและข้อมูลออนไลน์</div>
<div className="edu-hero__sub">เรื่องที่ 6	การสรุปและตัดสินใจจากการตรวจสอบข้อมูล</div>

                <div className="edu-lessons__toolbar">
                  <button className="edu-btn edu-btn--back" type="button" onClick={handleBack}>
                    <FiChevronLeft aria-hidden="true" />
                    กลับ
                  </button>

                  <button className="edu-btn edu-btn--ghost" type="button" onClick={() => navigate("/main")} style={{ marginLeft: 8 }}>
                    <FiHome aria-hidden="true" />
                    หน้าหลัก
                  </button>
                </div>
              </div>

              <div className="u5s-metaChips">
                <span className="u5s-chip">Step: {step}/3</span>
              </div>
            </div>
          </div>
        </section>

        {/* ✅ CONTENT */}
        <section className="edu-panel1">
          <div className="edu-panel1__head">
            <div className="edu-panel1__title">
              <FiFileText aria-hidden="true" />
              {stepTitle}
            </div>
          </div>

          {/* =========================
              ✅ STEP 1: MICRO
              ========================= */}
          {step === 1 && (
            <div className="u5s-wrap">
              <div className="u5s-card">
                <div className="u5s-cardTitle">สูตรจำสั้น ๆ (ใช้ได้ทุกข่าว)</div>
                <div className="u5s-bigFormula">
                  <span>ที่มา</span>
                  <span className="u5s-dot">•</span>
                  <span>เวลา</span>
                  <span className="u5s-dot">•</span>
                  <span>หลักฐาน</span>
                  <span className="u5s-dot">→</span>
                  <strong>ค่อยตัดสินใจ</strong>
                </div>

                <div className="u5s-callout">
                  หลักเดียว: <strong>อย่ารีบแชร์</strong> ให้ดู “ที่มา + เวลา + หลักฐาน” ก่อนเสมอ
                </div>

                <div className="u5s-actions">
                  <button
                    className="edu-btn edu-btn--primary"
                    type="button"
                    onClick={() => {
                      setStep(2);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    เริ่มฝึก <FiChevronRight aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =========================
              ✅ STEP 2: TASK
              ========================= */}
          {step === 2 && (
            <div className="u5s-wrap">
              {/* ✅ Case image */}
              <div className="u5s-case">
                <div className="u5s-caseHead">
                  <div className="u5s-caseTitle">ข่าวตัวอย่าง (ดูภาพรวมก่อน)</div>
                  <button className="edu-btn edu-btn--danger" type="button" onClick={resetAll} title="ล้างคำตอบ">
                    ล้างคำตอบ
                  </button>
                </div>

                <div className="u5s-caseImg">
                  <img src={processImg} alt="ข่าวตัวอย่างสำหรับตัดสินใจ" />
                </div>
              </div>

              {/* ✅ Stepper blocks */}
              <div className="u5s-grid">
                {/* 1) Scenario */}
                <div className="u5s-block">
                  <div className="u5s-blockHead">
                    <div className="u5s-blockNo">1</div>
                    <div>
                      <div className="u5s-blockTitle">เลือกสถานการณ์</div>
                      <div className="u5s-blockSub">เลือกแบบที่ใกล้ชีวิตจริงที่สุด</div>
                    </div>
                  </div>

                  <div className="u5s-scenarioList">
                    {SCENARIOS.map((s) => {
                      const active = scenarioId === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          className={`u5s-scenario ${active ? "is-active" : ""}`}
                          onClick={() => setScenarioId(s.id)}
                          aria-pressed={active}
                        >
                          <div className="u5s-scenarioIcon" aria-hidden="true">
                            {s.icon}
                          </div>

                          <div className="u5s-scenarioText">
                            <div className="u5s-scenarioTitle">{s.title}</div>
                            <div className="u5s-scenarioDesc">{s.desc}</div>
                            <div className="u5s-scenarioTone">หมายเหตุ: {s.tone}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2) Decision */}
                <div className="u5s-block">
                  <div className="u5s-blockHead">
                    <div className="u5s-blockNo">2</div>
                    <div>
                      <div className="u5s-blockTitle">เลือกคำตอบ</div>
                      <div className="u5s-blockSub">เลือก 1 ข้อ</div>
                    </div>
                  </div>

                  <div className="u5s-decisionGrid">
                    {DECISIONS.map((d) => {
                      const active = decisionId === d.id;
                      return (
                        <button
                          key={d.id}
                          type="button"
                          className={`u5s-decision ${active ? "is-active" : ""}`}
                          onClick={() => setDecisionId(d.id)}
                          aria-pressed={active}
                        >
                          <div className="u5s-decisionTop">
                            <div className="u5s-decisionEmoji" aria-hidden="true">
                              {d.emoji}
                            </div>
                            <div className="u5s-decisionTitle">{d.title}</div>
                          </div>
                          <div className="u5s-decisionHint">{d.hint}</div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="u5s-miniNote">
                    คำตอบที่เลือก: <strong>{DECISIONS.find((d) => d.id === decisionId)?.title || "ยังไม่ได้เลือก"}</strong>
                  </div>
                </div>

                {/* 3) Reasons (✅ radio ต่อหมวด) */}
                <div className={`u5s-block ${decisionId ? "" : "is-locked"}`}>
                  <div className="u5s-blockHead">
                    <div className="u5s-blockNo">3</div>
                    <div>
                      <div className="u5s-blockTitle">เลือกเหตุผล (หมวดละ 1 ข้อ)</div>
                      <div className="u5s-blockSub">เปิดไว้ทั้งหมดแล้ว — ถ้าจะย่อค่อยกดหุบ</div>
                    </div>
                  </div>

                  {!decisionId && <div className="u5s-lockHint">*ต้องเลือก “คำตอบ” ก่อน ถึงจะเลือกเหตุผลได้</div>}

                  {decisionId && (
                    <>
                      <div className="u5s-accordion">
                        {Object.keys(grouped).map((g) => {
                          const open = openGroups.includes(g);
                          const selectedId = pickedByGroup[g] || "";

                          return (
                            <div key={g} className={`u5s-accItem ${open ? "is-open" : ""}`}>
                              <button className="u5s-accHead" type="button" onClick={() => toggleGroup(g)}>
                                <span className="u5s-accTitle">{g}</span>
                                <span className="u5s-accState">{open ? "ย่อ" : "เปิด"}</span>
                              </button>

                              {open && (
                                <div className="u5s-accBody">
                                  {grouped[g].map((r) => {
                                    // ✅ active = เลือกได้ทีละข้อในหมวดเดียว
                                    const active = selectedId === r.id;

                                    return (
                                      <button
                                        key={r.id}
                                        type="button"
                                        className={`u5s-checkRow ${active ? "is-active" : ""}`}
                                        onClick={() => pickReasonInGroup(g, r.id)}
                                        aria-pressed={active}
                                      >
                                        {/* ✅ วงกลมแบบ radio (ใช้ class เดิมได้ ถ้า CSS เป็นสี่เหลี่ยมจะเห็นเป็น checkbox)
                                            ถ้าจะให้เป็นวงกลมจริง แก้ CSS .u5s-checkBox { border-radius: 999px; } */}
                                        <span className={`u5s-checkBox ${active ? "is-active" : ""}`} aria-hidden="true" />
                                        <span className="u5s-checkText">{r.text}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* ✅ Feedback + ปุ่ม (อยู่ใน Reasons เลย) */}
                      <div className={`u5s-feedback ${feedback.level}`} style={{ marginTop: 12 }}>
                        <div className="u5s-feedbackIcon" aria-hidden="true">
                          <FeedbackIcon level={feedback.level} />
                        </div>
                        <div className="u5s-feedbackText">
                          <div className="u5s-feedbackTitle">{feedback.title}</div>
                          <div className="u5s-feedbackBody">{feedback.body}</div>
                        </div>
                      </div>

                      <div className="u5s-actions">
                        <button
                          className="edu-btn edu-btn--primary"
                          type="button"
                          disabled={!canGoWrap}
                          onClick={() => {
                            setStep(3);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          title={!canGoWrap ? "เลือกคำตอบก่อน" : "ไปดูทริคสรุปเร็ว"}
                        >
                          ไปดูทริคสรุปเร็ว <FiChevronRight aria-hidden="true" />
                        </button>

                        {!canGoWrap && <div className="u5s-miniNote">*เลือกคำตอบก่อนถึงไปต่อได้</div>}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* =========================
              ✅ STEP 3: WRAP
              ========================= */}
          {step === 3 && (
            <div className="u5s-wrap">
              <div className="u5s-card">
                <div className="u5s-cardTitle">ทริคสรุปเร็ว (ใช้ได้ในชีวิตจริง)</div>

                <div className="u5s-callout">
                  ✅ วิธีการ
                  <br />
                  <strong>1) เช็กต้นทาง</strong> → ใครพูด? มีตัวตนไหม?
                  <br />
                  <strong>2) เช็กเวลา</strong> → ข่าวใหม่ไหม? ยังอยู่ในบริบทไหม?
                  <br />
                  <strong>3) เทียบอีก 1 แหล่ง</strong> → ตรงกันไหม? มีหน่วยงาน/สื่อหลักยืนยันไหม?
                  <br />
                  <br />
                  กติกา: <strong>ถ้ายังขาดข้อใดข้อหนึ่ง = “อย่าเพิ่งแชร์”</strong>
                </div>

                <div className="u5s-callout" style={{ marginTop: 10 }}>
                  ✅ ประโยคสรุปแบบชีวิตจริง (พูดกับตัวเอง/พูดกับเพื่อน)
                  <br />
                  <strong>- แชร์ได้</strong> = “ต้นทางชัด + ข่าวใหม่ + เทียบแล้วตรงกัน”
                  <br />
                  <strong>- ยังไม่แชร์</strong> = “ยังไม่เจอแหล่งหลักยืนยัน ขอเช็กเพิ่มก่อน”
                  <br />
                  <strong>- ไม่แชร์</strong> = “ต้นทางไม่ชัด/ข่าวเก่า/คำปั่นอารมณ์ เสี่ยงทำให้คนเข้าใจผิด”
                </div>

                <div className="u5s-miniNote" style={{ marginTop: 10 }}>
                  ตัวอย่างตามคำตอบที่คุณเลือก: <strong>{DECISIONS.find((d) => d.id === decisionId)?.title || "—"}</strong>
                </div>

                <div className="u5s-sampleList">
                  {(SAMPLE_SUMMARIES[decisionId] || []).map((t, i) => (
                    <div key={`sample-${i}`} className="u5s-sample">
                      {t}
                    </div>
                  ))}
                </div>

                <div className="u5s-actions">
                  <button
                    className="edu-btn"
                    type="button"
                    onClick={() => {
                      setStep(2);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    <FiChevronLeft aria-hidden="true" /> กลับไปทำใหม่
                  </button>

                  <button className="edu-btn edu-btn--ghost" type="button" onClick={() => navigate("/unit5/learn", { replace: true })}>
                    เสร็จสิ้น <FiChevronRight aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Learn6Unit5;
