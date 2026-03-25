

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
  FiTag,
  FiBookOpen,
} from "react-icons/fi";

/* ------------------------------------------------------------------ */
/* ✅ TYPES (labels)                                                   */
/* ------------------------------------------------------------------ */
const TYPES = [
  { id: "fake", name: "ข้อมูลเท็จ (False)" },
  { id: "misinfo", name: "ข้อมูลบิดเบือน (Misleading/Manipulated)" },
  { id: "clickbait", name: "สื่อชวนคลิก (Clickbait)" },
  { id: "credible", name: "ข้อมูลน่าเชื่อถือ (Credible)" },
];

/* ------------------------------------------------------------------ */
/* ✅ INTERACTIVE CASES (ตัวอย่างแบบไทยที่พบได้จริงในชีวิต)              */
/* - ไม่อ้างชื่อสื่อจริงเพื่อเลี่ยงปัญหาลิขสิทธิ์/ความเสี่ยง             */
/* - โฟกัสสัญญาณ & การจัดประเภท                                       */
/* ------------------------------------------------------------------ */
const CASES = [
  {
    id: "c1",
    title: "โพสต์สุขภาพแบบมั่ว ๆ",
    snippet:
      "แชร์ด่วน! ดื่มน้ำมะนาวผสมน้ำอุ่นทุกเช้า = รักษามะเร็งได้ 100% หมอไม่อยากให้รู้!!",
    correctType: "fake",
    why:
      "อ้างผลลัพธ์เกินจริงแบบ 100% + ไม่มีหลักฐาน/แหล่งอ้างอิง + ใช้คำสมคบคิด (หมอไม่อยากให้รู้) → เข้าข่ายข้อมูลเท็จ",
    cues: ["อ้าง 100%", "ไม่มีแหล่งอ้างอิง", "สมคบคิด/เร้าอารมณ์", "ให้แชร์ด่วน"],
  },
  {
    id: "c2",
    title: "ข่าวจริงบางส่วน แต่พาดหัวทำให้เข้าใจผิด",
    snippet:
      "ช็อก! โรงเรียน 'ห้ามนักเรียนใช้มือถือ' แล้วจะติดต่อพ่อแม่ยังไง?",
    correctType: "misinfo",
    why:
      "อาจมีนโยบายจริง แต่พาดหัวชี้นำให้ดูรุนแรง/ตีความสุดโต่ง โดยไม่ให้บริหน่วย (เช่น อาจอนุญาตช่วงพัก/ใช้ติดต่อครูได้) → เข้าข่ายบิดเบือน/ทำให้เข้าใจผิด",
    cues: ["พาดหัวช็อก", "ขาดบริบท", "เน้นอารมณ์มากกว่าข้อเท็จจริง"],
  },
  {
    id: "c3",
    title: "โพสต์ชวนคลิก",
    snippet:
      "ถ้าคุณเกิดเดือนนี้ แปลว่าคุณกำลังจะรวย! กดดู ‘3 อย่าง’ ที่จะเกิดขึ้นกับคุณคืนนี้!",
    correctType: "clickbait",
    why:
      "ใช้คำกระตุ้นอยากรู้ + ซ่อนสาระไว้หลังการคลิก (3 อย่าง/คืนนี้) โดยไม่มีข้อมูลจริงรองรับ → สื่อชวนคลิก",
    cues: ["ชวนอยากรู้", "ซ่อนข้อมูล", "ใช้คำเว่อร์", "เร่งเวลา"],
  },
  {
    id: "c4",
    title: "ข้อมูลน่าเชื่อถือจากหน่วยงาน/แหล่งตรวจสอบได้",
    snippet:
      "ประกาศ: เตือนภัยมิจฉาชีพหลอกให้กดลิงก์รับเงินคืน — ระบุวิธีสังเกต URL และช่องทางแจ้งเหตุ",
    correctType: "credible",
    why:
      "มีลักษณะเป็นประกาศ/คำเตือน + เนื้อหามีขั้นตอนตรวจสอบได้ + ให้ช่องทางติดต่อ/แจ้งเหตุ → น่าเชื่อถือกว่า",
    cues: ["มีวิธีตรวจสอบ", "มีช่องทางทางการ", "ไม่เร่งให้แชร์แบบตื่นตระหนก"],
  },
  {
    id: "c5",
    title: "คลิปตัดต่อ/ตัดคำพูด",
    snippet:
      "คลิปหลุด! คนดังพูดว่า ‘ไม่สนใจประชาชน’ (คลิป 5 วิ) — ไม่มีคลิปเต็ม/ไม่มีบริบทก่อนหลัง",
    correctType: "misinfo",
    why:
      "การตัดช่วงสั้น ๆ อาจทำให้ความหมายเปลี่ยน (context missing) ถ้าไม่มีแหล่งคลิปเต็ม/คำพูดครบ → เสี่ยงบิดเบือน",
    cues: ["คลิปสั้นมาก", "ไม่มีบริบท", "ไม่มีแหล่งคลิปเต็ม"],
  },
];

/* ------------------------------------------------------------------ */
/* ✅ MICRO-LESSON (สอนก่อน)                                            */
/* ------------------------------------------------------------------ */
const MICRO = {
  title: "จำแนกประเภทข้อมูลให้แม่น",
  blocks: [
    {
      head: "ข้อมูลเท็จ (False)",
      body:
        "ข้อมูลที่ไม่จริงเป็นหลัก มักอ้างแรง ๆ แบบไม่มีหลักฐาน เช่น “รักษาได้ 100%” หรือแต่งเรื่องทั้งก้อน",
      tip: "ดูคำเว่อร์ + ไม่มีแหล่งอ้างอิง = ระวังมาก",
    },
    {
      head: "ข้อมูลบิดเบือน (Misleading/Manipulated)",
      body:
        "มีส่วนจริงบางส่วน แต่ ‘เล่าขาดบริบท’ หรือ ‘ตัดต่อ/ตัดคำ’ ทำให้คนเข้าใจผิดไปอีกทาง",
      tip: "เช็กบริบทก่อน-หลัง + หาแหล่งเต็ม/หลายมุม",
    },
    {
      head: "สื่อชวนคลิก (Clickbait)",
      body:
        "พาดหัว/ข้อความออกแบบเพื่อให้คลิก เช่น ‘ช็อก’, ‘ด่วน’, ‘3 อย่างที่…’ แต่เนื้อหาอาจไม่คุ้ม/ไม่จริง",
      tip: "ถ้าซ่อนสาระไว้หลังคลิกและเร้าอารมณ์หนัก ๆ = clickbait",
    },
    {
      head: "ข้อมูลน่าเชื่อถือ (Credible)",
      body:
        "มีตัวตนชัด ตรวจสอบได้ มีแหล่งอ้างอิง/วิธีตรวจสอบ และให้ข้อมูลครบกว่า ไม่เน้นปั่นอารมณ์",
      tip: "มีที่มา + ตรวจสอบได้ + ไม่เร่งให้แชร์ = น่าเชื่อถือกว่า",
    },
  ],
};

const Learn4Unit5 = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const mode = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    return sp.get("mode") || "all";
  }, [location.search]);

  // ✅ user info
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");

  /**
   * ✅ step flow (ใหม่)
   * - "micro"       : สอนก่อน
   * - "interactive" : ทำแบบฝึกหัด
   * - "summary"     : สรุปคะแนน (ออกได้จากหน้านี้)
   */
  const [step, setStep] = useState("micro");

  // ✅ interactive state
  const [caseIdx, setCaseIdx] = useState(0);
  const [pickedType, setPickedType] = useState({}); // { [caseId]: typeId }
  const [checked, setChecked] = useState(false);

  // ✅ load profile
  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);

      const { data } = await supabase.auth.getSession();
      const u = data.session?.user;

      if (!u) {
        navigate("/login", { replace: true });
        return;
      }

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

  // ✅ title
  const panelTitle = useMemo(() => {
    if (step === "micro") return "สรุปก่อนเริ่มทำแบบฝึกหัด";
    if (step === "interactive") return "Interactive: จำแนกประเภทข้อมูล + เฉลยทันที";
    return "สรุปผลคะแนนกิจกรรม";
  }, [step]);

  const current = CASES[caseIdx];
  const picked = current ? pickedType[current.id] : undefined;

  const allDone = useMemo(() => {
    return CASES.every((c) => Boolean(pickedType[c.id]));
  }, [pickedType]);

  const score = useMemo(() => {
    let s = 0;
    for (const c of CASES) {
      if (pickedType[c.id] === c.correctType) s += 1;
    }
    return s;
  }, [pickedType]);

  // ✅ choose type
  const chooseType = (typeId) => {
    setPickedType((prev) => ({ ...prev, [current.id]: typeId }));
    if (checked) setChecked(false);
  };

  // ✅ check current
  const checkNow = () => {
    setChecked(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ go next case OR finish -> summary
  const nextCase = () => {
    setChecked(false);

    if (caseIdx < CASES.length - 1) {
      setCaseIdx((i) => i + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // ✅ done interactive -> go summary (ไม่โชว์โจทย์แล้ว)
    setStep("summary");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ start interactive (จาก micro)
  const startInteractive = () => {
    setStep("interactive");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ reset to redo practice
  const redoPractice = () => {
    setCaseIdx(0);
    setPickedType({});
    setChecked(false);
    setStep("interactive");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ go back unit list (final exit)
  const goBackUnit = () => {
    navigate("/unit5/learn", { replace: true });
  };

  // ✅ UI helpers
  const softText = { fontSize: 13, opacity: 0.82 };
  const boxStyle = {
    borderRadius: 16,
    border: "1px solid rgba(0,0,0,0.08)",
    background: "rgba(255,255,255,0.55)",
    padding: 14,
  };
  const pillStyle = (active) => ({
    borderRadius: 999,
    border: active ? "1px solid rgba(59,130,246,0.45)" : "1px solid rgba(0,0,0,0.10)",
    background: active ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.70)",
    padding: "8px 12px",
    fontSize: 13,
    fontWeight: 800,
    cursor: "pointer",
  });

  return (
    <div className="edu-app">
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
        {/* ✅ HERO */}
        <section className="edu-hero" aria-label="Unit 5 header">
          <div className="edu-hero__card">
            <div className="edu-hero__row">
              <div className="edu-hero__headline">
                <div className="edu-hero__title">Unit 5: การรู้เท่าทันข่าวและข้อมูลออนไลน์</div>
<div className="edu-hero__sub">เรื่องที่ 4	การแยกแยะประเภทของข่าวและข้อมูลออนไลน์
</div>

                <div className="edu-lessons__toolbar">
                  <button
                    className="edu-btn edu-btn--back"
                    type="button"
                    onClick={() => {
                      // ✅ back step-by-step
                      // - ถ้าอยู่ interactive/summary -> กลับไป micro ก่อน (คุม flow ให้ไม่งง)
                      if (step === "interactive" || step === "summary") {
                        setStep("micro");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        return;
                      }
                      // - ถ้าอยู่ micro -> ออกแบบเดิม
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
          <div className="edu-panel1__head">
            <div className="edu-panel1__title">
              <FiFileText aria-hidden="true" />
              {panelTitle}
            </div>
          </div>

          {/* =========================
              ✅ STEP A: MICRO-LESSON (หน้าแรก)
              ========================= */}
          {step === "micro" && (
            <div style={{ padding: 16 }}>
              <div className="edu-card">
                <div className="edu-card__title">
                  <FiBookOpen style={{ marginRight: 8 }} />
                  {MICRO.title}
                </div>

                <div className="edu-card__body" style={{ display: "grid", gap: 12 }}>
                  {MICRO.blocks.map((b, i) => (
                    <div
                      key={`micro-${i}`}
                      style={{
                        borderRadius: 14,
                        border: "1px solid rgba(0,0,0,0.08)",
                        background: "rgba(255,255,255,0.60)",
                        padding: 12,
                      }}
                    >
                      <div style={{ fontWeight: 950 }}>{b.head}</div>
                      <div style={{ fontSize: 13, opacity: 0.92, marginTop: 6, lineHeight: 1.65 }}>
                        {b.body}
                      </div>
                      <div
                        style={{
                          marginTop: 8,
                          borderRadius: 12,
                          border: "1px solid rgba(16,185,129,0.22)",
                          background: "rgba(16,185,129,0.08)",
                          padding: 10,
                          fontSize: 13,
                          fontWeight: 850,
                          lineHeight: 1.6,
                        }}
                      >
                        💡 ทริค: {b.tip}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    className="edu-btn edu-btn--primary"
                    type="button"
                    onClick={startInteractive}
                    title="เริ่มทำแบบฝึกหัด"
                  >
                    เริ่มทำแบบฝึกหัด <FiChevronRight aria-hidden="true" />
                  </button>

                  
                </div>
              </div>
            </div>
          )}

          {/* =========================
              ✅ STEP B: INTERACTIVE
              ========================= */}
          {step === "interactive" && (
            <div style={{ padding: 16 }}>
              <div style={boxStyle}>
                {!current ? (
                  <div style={{ fontWeight: 900, opacity: 0.9 }}>ไม่พบเคสในระบบ</div>
                ) : (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 950, marginBottom: 6 }}>
                          <FiTag style={{ marginRight: 8 }} />
                          เคส {caseIdx + 1} / {CASES.length}: {current.title}
                        </div>
                        <div style={softText}>อ่านข้อความ แล้วเลือก “ประเภทข้อมูล” ที่เหมาะสมที่สุด</div>
                      </div>

                      <div style={{ fontSize: 12, opacity: 0.8, alignSelf: "center" }}>
                        ทำแล้ว {Object.keys(pickedType).length} / {CASES.length}
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop: 12,
                        borderRadius: 14,
                        border: "1px dashed rgba(0,0,0,0.20)",
                        background: "rgba(255,255,255,0.70)",
                        padding: 12,
                        fontSize: 14,
                        fontWeight: 900,
                        lineHeight: 1.6,
                      }}
                    >
                      “{current.snippet}”
                    </div>

                    <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {TYPES.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => chooseType(t.id)}
                          style={pillStyle(picked === t.id)}
                          aria-pressed={picked === t.id}
                          title={t.name}
                        >
                          {t.name}
                        </button>
                      ))}
                    </div>

                    <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <button
                        className="edu-btn edu-btn--primary"
                        type="button"
                        onClick={checkNow}
                        disabled={!picked}
                        title={!picked ? "เลือกประเภทก่อนนะ" : "ตรวจคำตอบ"}
                      >
                        ตรวจคำตอบ <FiChevronRight aria-hidden="true" />
                      </button>

                      <button
                        className="edu-btn edu-btn--danger"
                        type="button"
                        onClick={() => {
                          setPickedType((prev) => {
                            const next = { ...prev };
                            delete next[current.id];
                            return next;
                          });
                          setChecked(false);
                        }}
                        title="ล้างคำตอบของเคสนี้"
                      >
                        ล้างคำตอบ
                      </button>
                    </div>

                    {checked && (
                      <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                        {picked === current.correctType ? (
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
                              <div style={{ fontSize: 13, opacity: 0.88, marginTop: 4, lineHeight: 1.6 }}>
                                {current.why}
                              </div>
                            </div>
                          </div>
                        ) : (
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
                              <div style={{ fontWeight: 900 }}>
                                ยังไม่ตรง (เฉลย:{" "}
                                {TYPES.find((t) => t.id === current.correctType)?.name || current.correctType})
                              </div>
                              <div style={{ fontSize: 13, opacity: 0.88, marginTop: 4, lineHeight: 1.6 }}>
                                {current.why}
                              </div>
                            </div>
                          </div>
                        )}

                        <div
                          style={{
                            borderRadius: 12,
                            border: "1px solid rgba(59,130,246,0.20)",
                            background: "rgba(59,130,246,0.08)",
                            padding: 10,
                          }}
                        >
                          <div style={{ fontWeight: 900, marginBottom: 6 }}>จุดสังเกตในเคสนี้</div>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {current.cues.map((c, i) => (
                              <span
                                key={`${current.id}-cue-${i}`}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  borderRadius: 999,
                                  padding: "6px 10px",
                                  border: "1px solid rgba(0,0,0,0.10)",
                                  background: "rgba(255,255,255,0.70)",
                                  fontSize: 12,
                                  fontWeight: 800,
                                }}
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                          <button className="edu-btn edu-btn--ghost" type="button" onClick={nextCase}>
                            {caseIdx < CASES.length - 1 ? "ไปเคสถัดไป" : "เสร็จสิ้น (ไปสรุปคะแนน)"}{" "}
                            <FiChevronRight aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* =========================
              ✅ STEP C: SUMMARY (หลังทำครบ)
              ========================= */}
          {step === "summary" && (
            <div style={{ padding: 16 }}>
              <div className="edu-card">
                <div className="edu-card__title">
                  <FiCheckCircle style={{ marginRight: 8 }} />
                  สรุปคะแนนกิจกรรมจำแนกประเภท
                </div>

                <div className="edu-card__body" style={{ display: "grid", gap: 12 }}>
                  <div
                    style={{
                      borderRadius: 14,
                      border: "1px solid rgba(59,130,246,0.20)",
                      background: "rgba(59,130,246,0.08)",
                      padding: 12,
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                    }}
                  >
                    <FiCheckCircle aria-hidden="true" />
                    <div>
                      <div style={{ fontWeight: 950 }}>ผลลัพธ์ของคุณ</div>
                      <div style={{ fontSize: 13, opacity: 0.9, marginTop: 2 }}>
                        คุณได้ {score} / {CASES.length} คะแนน
                      </div>
                      <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>
                        {allDone
                          ? "ทำครบทุกเคสแล้ว ✅"
                          : "ยังทำไม่ครบทุกเคส (แต่เข้าหน้านี้ได้จาก flow การจบเคสสุดท้าย)"}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button className="edu-btn edu-btn--back" type="button" onClick={() => setStep("micro")}>
                      ทบทวนสรุปอีกครั้ง <FiChevronLeft aria-hidden="true" />
                    </button>

                    <button className="edu-btn edu-btn--primary" type="button" onClick={redoPractice}>
                      ทำแบบฝึกหัดอีกครั้ง <FiChevronRight aria-hidden="true" />
                    </button>

                    <button className="edu-btn edu-btn--ghost" type="button" onClick={goBackUnit}>
                      เสร็จสิ้น <FiChevronRight aria-hidden="true" />
                    </button>
                  </div>

                
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Learn4Unit5;
