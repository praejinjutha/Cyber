// src/pages/Unit3/Learn6.jsx
// Unit 3 – เรื่องที่ 6: การจัดการเนื้อหาและรอยเท้าดิจิทัลในระยะยาว
// Practical Framework (Best-Practice) + Interactive Simulation Workshop + Immediate Feedback Learning
//
// เป้าหมาย: ให้ผู้เรียน “ตัดสินใจจัดการโพสต์” ตามระดับความเสี่ยง (ลบ/ซ่อน/จำกัด/ปรับแก้)
// โทน: พี่สอนน้อง (สั้น ชัด ครบถ้วน)

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

// Assets
import logo from "../../assets/logo.png";

// Styles
import "../../main.css";
import "../Unit1/learn.css";

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
  FiTrash2,
  FiEyeOff,
  FiLock,
  FiEdit3,
} from "react-icons/fi";

/* -------------------------------------------------- */
/* ✅ Best-Practice Framework (สั้น ๆ จำง่าย)            */
/* -------------------------------------------------- */
// - RISK: เสี่ยงแค่ไหน? (ต่ำ/กลาง/สูง)
// - WHO: ใครเห็นได้บ้าง? (สาธารณะ/เพื่อน/กลุ่มเล็ก)
// - IMPACT: กระทบอะไรในอนาคต? (ชื่อเสียง/งาน/ความสัมพันธ์/ความปลอดภัย)
// - ACTION: จัดการยังไง? (ลบ/ซ่อน/จำกัด/ปรับแก้)
const FRAMEWORK = [
  { k: "RISK", t: "ประเมินความเสี่ยง", d: "ต่ำ / กลาง / สูง" },
  { k: "WHO", t: "ใครเห็นได้บ้าง", d: "สาธารณะ = เสี่ยงกว่า" },
  { k: "IMPACT", t: "กระทบอะไรในอนาคต", d: "งาน/ทุน/ชื่อเสียง" },
  { k: "ACTION", t: "เลือกวิธีจัดการ", d: "ลบ/ซ่อน/จำกัด/ปรับแก้" },
];

/* -------------------------------------------------- */
/* ✅ สถานการณ์จำลอง: ตัวอย่างโพสต์ที่ต้องตัดสินใจ      */
/* -------------------------------------------------- */
// NOTE: ไม่เน้นเยอะ แต่ให้ครบประเภท “เสี่ยงจริงในอนาคต”
const CONTENT_CASES = [
  {
    id: "p1",
    title: "คอมเมนต์ด่าแรงตอนหัวร้อน",
    content: "“โง่หรือไงวะ…” (เถียงในโพสต์สาธารณะ)",
    risk: "HIGH",
    why: "คำพูดรุนแรงถูกแคป/แชร์ต่อได้ กระทบภาพลักษณ์ในอนาคต",
    best: "DELETE",
    tips: "ถ้าต้องสื่อสาร ให้เปลี่ยนเป็นข้อความสุภาพ/ย้ายไปคุยส่วนตัว",
  },
  {
    id: "p2",
    title: "รูปป้ายชื่อ/บัตรนักเรียนเห็นข้อมูลชัด",
    content: "รูปหมู่หน้าโรงเรียน เห็นชื่อ-เลขประจำตัวบนป้ายชื่อ",
    risk: "HIGH",
    why: "มีตัวระบุเฉพาะบุคคล เอาไปแอบอ้าง/ตามตัวได้",
    best: "EDIT",
    tips: "เบลอ/ครอปข้อมูล แล้วค่อยโพสต์ใหม่ หรือจำกัดเป็นเพื่อนเท่านั้น",
  },
  {
    id: "p3",
    title: "เช็กอินบ้าน + โลเคชันละเอียด",
    content: "“อยู่บ้านจ้า 🏠” พร้อมแท็กพิกัด/แผนที่",
    risk: "HIGH",
    why: "บอกตำแหน่งจริง เสี่ยงด้านความปลอดภัย",
    best: "DELETE",
    tips: "ถ้าจะโพสต์ ให้ปิด location หรือโพสต์หลังออกจากที่นั้นแล้ว",
  },
  {
    id: "p4",
    title: "ภาพปาร์ตี้/แอลกอฮอล์ (เห็นชัดว่าเมาหนัก)",
    content: "สตอรี่สาธารณะ มีแคปชันชวนดื่มแรง ๆ",
    risk: "MED",
    why: "อาจกระทบโอกาสฝึกงาน/งาน/ทุน เมื่อคนค้นชื่อย้อนดู",
    best: "LIMIT",
    tips: "ตั้งเฉพาะเพื่อนสนิท/Close friends หรือซ่อนจากสาธารณะ",
  },
  {
    id: "p5",
    title: "โพสต์แชร์งาน/พอร์ต แต่มีข้อมูลส่วนตัวหลุดในไฟล์",
    content: "แนบ PDF งานที่มีเบอร์/ที่อยู่ในหน้าสุดท้าย",
    risk: "MED",
    why: "ข้อมูลอ่อนไหวหลุดจากไฟล์แนบโดยไม่ตั้งใจ",
    best: "EDIT",
    tips: "แก้ไฟล์/ลบข้อมูลอ่อนไหว แล้วอัปโหลดใหม่",
  },
  {
    id: "p6",
    title: "โพสต์บ่นชีวิตทั่วไป (ไม่ระบุคน/ที่/ข้อมูลลับ)",
    content: "“วันนี้เหนื่อยมาก ขอพักก่อนนะ”",
    risk: "LOW",
    why: "เป็นความรู้สึกทั่วไป ไม่เปิดข้อมูลลับ",
    best: "HIDE",
    tips: "ถ้าไม่อยากให้คนตีความผิด ให้ซ่อน/จำกัดกลุ่ม หรือปรับถ้อยคำให้บวกขึ้น",
  },
  {
    id: "p7",
    title: "โพสต์เนื้อหาที่ผิดกฎหมายหรือผิดศีลธรรม",
    content: "โพสต์ขายของผิดกฎหมาย / ส่งเสริมพฤติกรรมผิดกฎหมาย",
    risk: "HIGH",
    why: "เสี่ยงต่อผลทางกฎหมาย และกระทบชื่อเสียงในระยะยาวอย่างรุนแรง",
    best: "DELETE",
    tips: "ลบเนื้อหาทันที และหลีกเลี่ยงการโพสต์เนื้อหาที่ผิดกฎหมายหรือศีลธรรม",
  },
];

/* -------------------------------------------------- */
/* ✅ ตัวเลือกการจัดการเนื้อหา                           */
/* -------------------------------------------------- */
const ACTIONS = [
  { key: "DELETE", label: "ลบ", icon: FiTrash2, desc: "หายจากไทม์ไลน์ (ลดความเสี่ยงสูงสุด)" },
  { key: "HIDE", label: "ซ่อน", icon: FiEyeOff, desc: "ไม่ให้คนทั่วไปเห็น (เหมาะกับเรื่องส่วนตัว/อ่อนไหวเล็กน้อย)" },
  { key: "LIMIT", label: "จำกัดผู้ชม", icon: FiLock, desc: "ให้เห็นเฉพาะเพื่อน/กลุ่มเล็ก" },
  { key: "EDIT", label: "ปรับแก้", icon: FiEdit3, desc: "เบลอ/ครอป/แก้คำพูดให้ปลอดภัยขึ้น" },
];

/* -------------------------------------------------- */
/* ✅ Helpers                                            */
/* -------------------------------------------------- */
function actionLabel(key) {
  const hit = ACTIONS.find((a) => a.key === key);
  return hit ? hit.label : key;
}

function scoreDelta(risk, chosen, best) {
  // ✅ ตรง best ได้เต็ม
  if (chosen === best) return 10;

  // ✅ ให้คะแนนแบบ “ใกล้เคียง” ตามระดับ risk
  const orderMap = {
    HIGH: ["DELETE", "EDIT", "LIMIT", "HIDE"],
    MED: ["LIMIT", "EDIT", "HIDE", "DELETE"],
    LOW: ["HIDE", "LIMIT", "EDIT", "DELETE"],
  };

  const order = orderMap[risk] ?? ["DELETE", "EDIT", "LIMIT", "HIDE"];
  const idx = order.indexOf(chosen);
  if (idx === -1) return 0;

  // อันดับ 1 ได้ 6, อันดับ 2 ได้ 3, อันดับ 3 ได้ 1
  const points = [10, 6, 3, 1];
  return points[idx] ?? 0;
}

function progressOf(answers) {
  const total = CONTENT_CASES.length;
  const done = CONTENT_CASES.filter((c) => Boolean(answers[c.id])).length;
  const correct = CONTENT_CASES.filter((c) => answers[c.id] && answers[c.id] === c.best).length;

  let level = "ยังไม่ครบ — เลือกให้ครบทุกโพสต์ก่อนนะ";
  if (done === total && correct === total) level = "โหดมาก ✅ จัดการได้เหมาะสมทุกโพสต์";
  else if (done === total && correct >= Math.ceil(total * 0.7)) level = "ดีมาก 👍 ส่วนใหญ่เลือกได้เหมาะสม";
  else if (done === total) level = "ครบแล้ว แต่ยังมีบางอันควรปรับ";

  return { total, done, correct, level };
}

export default function Learn6() {
  const navigate = useNavigate();

  /* -------------------------------------------------- */
  /* ✅ State: auth/user                                  */
  /* -------------------------------------------------- */
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("ผู้เรียน");

  /* -------------------------------------------------- */
  /* ✅ State: step                                       */
  /* -------------------------------------------------- */
  const [step, setStep] = useState("lesson"); // lesson | task

  /* -------------------------------------------------- */
  /* ✅ State: answers + score                            */
  /* -------------------------------------------------- */
  const [answers, setAnswers] = useState(() => {
    const init = {};
    for (const c of CONTENT_CASES) init[c.id] = "";
    return init;
  });

  const [score, setScore] = useState(0);

  /* -------------------------------------------------- */
  /* ✅ Derived                                            */
  /* -------------------------------------------------- */
  const progress = useMemo(() => progressOf(answers), [answers]);
  const doneAll = useMemo(() => progress.done === progress.total, [progress]);

  /* -------------------------------------------------- */
  /* ✅ Load session + student profile                      */
  /* -------------------------------------------------- */
  useEffect(() => {
    let alive = true;

    (async () => {
      // ✅ ตรวจ session
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      // ✅ ไม่มี user ให้เด้งไป login
      if (!user) {
        navigate("/login", { replace: true });
        return;
      }

      // ✅ โหลดชื่อผู้เรียน
      const { data: profileRow } = await supabase
        .from("student_profiles")
        .select("first_name,last_name")
        .eq("user_id", user.id)
        .maybeSingle();

      // ✅ กัน setState หลัง unmount
      if (!alive) return;

      if (profileRow) {
        const fullName =
          `${profileRow.first_name ?? ""} ${profileRow.last_name ?? ""}`.trim() || "ผู้เรียน";
        setStudentName(fullName);
      }

      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [navigate]);

  /* -------------------------------------------------- */
  /* ✅ Reset                                              */
  /* -------------------------------------------------- */
  const resetAll = () => {
    const init = {};
    for (const c of CONTENT_CASES) init[c.id] = "";
    setAnswers(init);
    setScore(0);
  };

  /* -------------------------------------------------- */
  /* ✅ Choose action (Feedback per item)                 */
  /* -------------------------------------------------- */
  const chooseAction = (caseItem, actionKey) => {
    setAnswers((prev) => ({ ...prev, [caseItem.id]: actionKey }));

    const delta = scoreDelta(caseItem.risk, actionKey, caseItem.best);
    setScore((s) => Math.max(0, s + delta));
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
<div className="edu-hero__sub">เรื่องที่ 6	การจัดการเนื้อหาและรอยเท้าดิจิทัลในระยะยาว
</div>

            <div className="edu-lessons__toolbar">
              <button
                className="edu-btn edu-btn--back"
                type="button"
                onClick={() => (step === "task" ? setStep("lesson") : navigate(-1))}
              >
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
            CONTENT
           ========================= */}
        <section className="edu-panel">
          {/* Header */}
          <div className="edu-panel__head">
            <div className="edu-panel__title">
              <FiFileText aria-hidden="true" />
              {step === "lesson" ? "Best-Practice Framework" : "Workshop: เลือกวิธีจัดการโพสต์ (รายข้อ)"}
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
              <div className="edu-card__body">
                <div className="edu-taskIntro">
                  <div className="edu-taskIntro__title">ท่องสั้น ๆ ก่อนลงมือ</div>
                  <div className="edu-taskIntro__desc">
                    พี่ให้สูตรจำง่าย: <b>RISK → WHO → IMPACT → ACTION</b>
                  </div>
                </div>

                <div className="edu-taskGrid">
                  {FRAMEWORK.map((f) => (
                    <div key={f.k} className="edu-taskCard">
                      <div className="edu-taskCard__body">
                        <div className="edu-taskCard__label">
                          {f.k} — {f.t}
                        </div>
                        <div className="edu-taskCard__example">{f.d}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="edu-callout">
                  <b>ทริคพี่น้อง:</b> โพสต์ “สาธารณะ” + “เสี่ยงสูง” → ส่วนมากควร <b>ลบ/ปรับแก้</b> ก่อน
                </div>

                <div className="edu-lessonActions">
                  <button className="edu-btn edu-btn--primary" type="button" onClick={() => setStep("task")}>
                    เริ่ม Workshop <FiChevronRight />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =========================
              TASK (single column + progress at bottom)
             ========================= */}
          {step === "task" && (
            <div className="edu-taskStage">
              <div className="edu-taskIntro">
                <div className="edu-taskIntro__title">เลือกให้ครบทุกโพสต์ — แล้วดูฟีดแบ็ก “ใต้โพสต์นั้นเลย”</div>
                <div className="edu-taskIntro__meta">
                  เคล็ดลับ: <b>เสี่ยงสูง</b> → มัก “ลบ/ปรับแก้” | <b>เสี่ยงกลาง</b> → “จำกัด/ปรับแก้” |{" "}
                  <b>เสี่ยงต่ำ</b> → “ซ่อน/จำกัด”
                </div>
              </div>

              {/* ✅ WORKSHOP: full width */}
              <div className="edu-taskGrid">
                {CONTENT_CASES.map((c) => {
                  const chosen = answers[c.id];
                  const ok = Boolean(chosen) && chosen === c.best;

                  const feedbackTitle = ok ? "ถูก ✅" : chosen ? "ควรปรับ ❗" : "ยังไม่เลือก";
                  const feedbackMsg = ok
                    ? `แนะนำ: ${actionLabel(chosen)}`
                    : chosen
                      ? `แนะนำจริง: ${actionLabel(c.best)}`
                      : "เลือก 1 วิธี: ลบ / ซ่อน / จำกัด / ปรับแก้";

                  const reasonLine = ok
                    ? `เหตุผล: ${c.why}`
                    : chosen
                      ? `ทริค: ${c.tips}`
                      : `ทำไมเสี่ยง: ${c.why}`;

                  return (
                    <div key={c.id} className="edu-taskCard">
                      <div className="edu-taskCard__body">
                        <div className="edu-taskCard__label">{c.title}</div>
                        <div className="edu-taskCard__example">{c.content}</div>

                        <div className="signal-meta" style={{ marginTop: 10 }}>
                          <span className="edu-pill">
                            Risk: <b>{c.risk}</b>
                          </span>
        
                          <span className="edu-pill">
                            ที่เลือก: <b>{chosen ? actionLabel(chosen) : "-"}</b>
                          </span>
                        </div>
                      </div>

                      <div className="edu-taskCard__actions">
                        {ACTIONS.map((a) => {
                          const Icon = a.icon;
                          const active = chosen === a.key;

                          return (
                            <button
                              key={a.key}
                              type="button"
                              className={`edu-pill ${active ? "is-active" : ""}`}
                              onClick={() => chooseAction(c, a.key)}
                              title={a.desc}
                            >
                              <Icon aria-hidden="true" />
                              {a.label}
                            </button>
                          );
                        })}
                      </div>

                      {/* ✅ Feedback per item */}
                      <div className={`edu-taskCard__feedback ${ok ? "ok" : chosen ? "warn" : ""}`}>
                        <div className="edu-taskCard__feedbackRow">
                          {ok ? (
                            <FiCheckCircle style={{ marginTop: 2 }} />
                          ) : chosen ? (
                            <FiAlertTriangle style={{ marginTop: 2 }} />
                          ) : (
                            <FiFileText style={{ marginTop: 2 }} />
                          )}

                          <div>
                            <div className="edu-taskCard__feedbackMsg">
                              {feedbackTitle} — {feedbackMsg}
                            </div>
                            <div className="edu-taskCard__feedbackReason">{reasonLine}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ✅ PROGRESS: moved to bottom (full width) */}
              <div style={{ marginTop: 14 }}>
                <div className="edu-callout">
                  <div style={{ fontWeight: 900 }}>ความคืบหน้า</div>
                  <div style={{ marginTop: 6, lineHeight: 1.7 }}>
                    เลือกแล้ว: <b>{progress.done}/{progress.total}</b>
                    <br />
                    ตรงคำแนะนำ: <b>{progress.correct}/{progress.total}</b>
                    <br />
                    สถานะ: <b>{doneAll ? "ครบ ✅" : "ยังไม่ครบ"}</b>
                    <br />
                    
                  </div>

                  <div style={{ marginTop: 10, opacity: 0.9 }}>{progress.level}</div>

                  <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button className="edu-btn" type="button" onClick={resetAll}>
                      <FiRotateCcw /> รีเซ็ตทั้งหมด
                    </button>

                    <button
                      className="edu-btn edu-btn--ghost"
                      type="button"
                      onClick={() => navigate("/unit3/learn")}
                    >
                      เสร็จสิ้น <FiChevronRight />
                    </button>
                  </div>

                  <div className="edu-note" style={{ marginTop: 10 }}>
                    ทริค: ถ้าโพสต์ “เสี่ยงสูง + สาธารณะ” → อย่ารอ ให้จัดการทันที
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
