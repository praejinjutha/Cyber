// src/pages/Unit3/Learn3.jsx
// ✅ Unit 3 – เรื่องที่ 3: พฤติกรรมออนไลน์และความเสี่ยงที่เกิดขึ้น
// แผน: Micro-lesson + Interactive Classification-based Learning + Signal Identification Task
// ❌ ไม่มีวิดีโอ

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
} from "react-icons/fi";

/* ------------------------------------------------------------------ */
/* ✅ 3 สถานการณ์ (ตามที่คุณขอ: ไม่เยอะ)                              */
/* ------------------------------------------------------------------ */
/**
 * ✅ แนวคิดการให้ feedback:
 * - เชื่อม "พฤติกรรม" -> "ผลกระทบ" (ชื่อเสียง / ความสัมพันธ์ / โอกาสในอนาคต)
 * - Signal identification: ให้ติ๊ก "จุดสังเกตเสี่ยง" เพื่อฝึกจับสัญญาณ
 */
const SCENARIOS = [
  {
    id: "s1",
    title: "คอมเมนต์แรงใต้โพสต์ (สาธารณะ)",
    story:
      "มีคนโพสต์ดราม่าในโซเชียล คุณโมโหมากเลยคอมเมนต์คำหยาบ/ด่าแรง ๆ แบบสาธารณะ และมีเพื่อน ๆ มากดโต้ตอบ",
    correctClass: "RISKY", // เสี่ยง
    riskSignals: [
      "ใช้ถ้อยคำรุนแรง/โจมตีคน",
      "โพสต์สาธารณะ คนเห็นเยอะ",
      "อารมณ์นำเหตุผล (โพสต์ตอนโกรธ)",
    ],
    trapSignals: [
      "ตั้งใจถามด้วยเหตุผล",
      "คุยส่วนตัวเพื่อเคลียร์",
    ],
    impacts: [
      "ชื่อเสียง: คนมองว่าใจร้อน/ก้าวร้าว",
      "ความสัมพันธ์: ทะเลาะ/ดราม่าบานปลาย",
      "โอกาสในอนาคต: ถูกแคป/ส่งต่อ อาจมีผลต่อกิจกรรม/สมัครงาน",
    ],
    saferMove:
      "หยุดก่อนพิมพ์ 10 วินาที → ใช้คำสุภาพ/โฟกัสประเด็น → ถ้าต้องเคลียร์จริงให้ย้ายไปคุยส่วนตัว",
  },
  {
    id: "s2",
    title: "แชร์โพสต์ไม่เหมาะสมแบบไม่คิด",
    story:
      "คุณเห็นมีม/คลิปที่ล้อเลียนคนอื่นในกลุ่ม แล้วกดแชร์ต่อเพราะคิดว่า ‘ขำดี’ โดยไม่ได้รู้บริบทหรือความรู้สึกของคนที่ถูกพาดพิง",
    correctClass: "RISKY", // เสี่ยง
    riskSignals: [
      "แชร์เนื้อหาที่อาจทำร้ายคนอื่น",
      "ไม่รู้บริบท/ข้อเท็จจริงครบ",
      "ส่งต่อได้ คุมวงไม่ได้",
    ],
    trapSignals: [
      "ตรวจสอบก่อนแชร์",
      "ขออนุญาต/ถามเจ้าของโพสต์",
    ],
    impacts: [
      "ชื่อเสียง: คนมองว่าเข้าข้างการบูลลี่/ไม่เคารพคนอื่น",
      "ความสัมพันธ์: คนที่ถูกล้อหรือเพื่อนบางคนไม่โอเค",
      "โอกาสในอนาคต: ถ้าถูกส่งต่อออกนอกกลุ่มจะย้อนมาหาเราได้",
    ],
    saferMove:
      "คิดก่อนแชร์: ‘ถ้าเราเป็นคนโดนล้อ เราโอเคไหม?’ → ถ้าไม่ชัวร์ หยุดแชร์/รายงาน/เปลี่ยนเรื่อง",
  },
  {
    id: "s3",
    title: "แสดงความเห็นสุภาพ แม้เห็นต่าง",
    story:
      "มีประเด็นที่เห็นต่างกัน คุณพิมพ์ความเห็นอย่างสุภาพ มีเหตุผล ไม่พาดพิงตัวบุคคล และพร้อมรับฟังอีกฝ่าย",
    correctClass: "SAFE", // ไม่เสี่ยง
    riskSignals: [
      // ในเคสนี้ “สัญญาณเสี่ยง” มีน้อย/แทบไม่มี
      "พาดพิง/โจมตีตัวบุคคล",
      "ใช้คำหยาบ/แรง",
      "โพสต์ตอนอารมณ์ร้อน",
    ],
    trapSignals: [
      // สิ่งที่เป็นสัญญาณปลอดภัย
      "ใช้ถ้อยคำสุภาพ",
      "โฟกัสที่ประเด็น ไม่โจมตีคน",
      "พร้อมรับฟังและตอบด้วยเหตุผล",
    ],
    impacts: [
      "ชื่อเสียง: ดูมีวุฒิภาวะ/น่าเชื่อถือ",
      "ความสัมพันธ์: ลดโอกาสทะเลาะและคุยกันได้",
      "โอกาสในอนาคต: โปรไฟล์ดูเป็นมืออาชีพมากขึ้น",
    ],
    saferMove:
      "รักษามาตรฐานนี้ไว้: สุภาพ + เหตุผล + ไม่พาดพิงคน → ช่วยสร้างภาพลักษณ์ระยะยาว",
  },
  {
  id: "s4",
  title: "แชร์ข่าวโดยไม่ตรวจสอบแหล่งที่มา",
  story:
    "คุณเห็นโพสต์ข่าวหัวข้อรุนแรงในโซเชียล จึงแชร์ต่อทันทีโดยไม่ได้ตรวจสอบแหล่งที่มา หรือความถูกต้องของข้อมูล",
  correctClass: "RISKY",
  riskSignals: [
    "ไม่ตรวจสอบแหล่งที่มา",
    "พาดหัวรุนแรง/ชวนเชื่อ",
    "แชร์ต่ออย่างรวดเร็ว"
  ],
  trapSignals: [
    "ตรวจสอบก่อนแชร์",
    "อ้างอิงแหล่งข่าวที่เชื่อถือได้"
  ],
  impacts: [
    "ชื่อเสียง: คนมองว่าไม่น่าเชื่อถือ",
    "ความสัมพันธ์: คนอื่นอาจไม่ไว้วางใจข้อมูลจากเรา",
    "โอกาสในอนาคต: ภาพลักษณ์ด้านความรับผิดชอบลดลง"
  ],
  saferMove:
    "หยุดก่อนแชร์ → ตรวจสอบแหล่งข่าว → อ่านหลายแหล่งก่อนตัดสินใจ"
}
];

const CLASS_CHOICES = [
  { id: "SAFE", label: "ไม่เสี่ยง" },
  { id: "RISKY", label: "เสี่ยง" },
];

export default function Learn3Unit3() {
  const navigate = useNavigate();
  const location = useLocation();

  const mode = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    return sp.get("mode") || "all";
  }, [location.search]);

  // ✅ profile
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("ผู้เรียน");

  // ✅ step
  const [step, setStep] = useState("lesson"); // lesson | task

  // ✅ scenario
  const [activeId, setActiveId] = useState(SCENARIOS[0].id);
  const active = useMemo(
    () => SCENARIOS.find((s) => s.id === activeId) || SCENARIOS[0],
    [activeId]
  );

  // ✅ answers
  const [pickedClass, setPickedClass] = useState("");
  const [pickedSignals, setPickedSignals] = useState([]); // string labels
  const [submitted, setSubmitted] = useState(false);

  // ✅ reset when change scenario
  useEffect(() => {
    setPickedClass("");
    setPickedSignals([]);
    setSubmitted(false);
  }, [activeId]);

  // ✅ toggle signals
  const toggleSignal = (label) => {
    setPickedSignals((prev) => {
      if (prev.includes(label)) return prev.filter((x) => x !== label);
      return [...prev, label];
    });
    if (submitted) setSubmitted(false);
  };

  // ✅ submit
  const submitTask = () => {
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ finish
  const goFinish = () => {
    navigate("/unit3/learn", { replace: true, state: { from: "unit3-learn3", mode } });
  };

  // ✅ load profile (เหมือน Unit2/Unit3 เดิม)
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
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

        const full = `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim();
        setStudentName(full || "ผู้เรียน");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [navigate]);

  // ✅ panel title
  const panelTitle = useMemo(() => {
    if (step === "lesson") return "Micro-lesson: พฤติกรรมออนไลน์ → ความเสี่ยง";
    return "กิจกรรม: คัดแยกเสี่ยง/ไม่เสี่ยง + จุดสังเกต (Signal)";
  }, [step]);

  // ✅ UI helpers (ยึด pattern Unit2 เพื่อไม่เพี้ยน)
  const softText = { fontSize: 13, opacity: 0.85, lineHeight: 1.7 };

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
    fontWeight: 900,
    cursor: "pointer",
  });

  const chipStyle = (active) => ({
    borderRadius: 12,
    border: active ? "1px solid rgba(34,197,94,0.35)" : "1px solid rgba(0,0,0,0.10)",
    background: active ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.70)",
    padding: "10px 12px",
    fontSize: 13,
    fontWeight: 850,
    cursor: "pointer",
    textAlign: "left",
  });

  // ✅ check completeness
  const canSubmit = useMemo(() => {
    return Boolean(pickedClass) && pickedSignals.length > 0;
  }, [pickedClass, pickedSignals.length]);

  // ✅ correctness
  const classCorrect = submitted && pickedClass === active.correctClass;

  // ✅ signal correctness (ง่าย+ชัด): ต้องติ๊ก “สัญญาณเสี่ยง” ให้ถูกมากกว่า “กับดัก”
  const pickedRiskCount = useMemo(() => {
    const riskSet = new Set(active.riskSignals);
    return pickedSignals.filter((x) => riskSet.has(x)).length;
  }, [pickedSignals, active.riskSignals]);

  const pickedTrapCount = useMemo(() => {
    const trapSet = new Set(active.trapSignals);
    return pickedSignals.filter((x) => trapSet.has(x)).length;
  }, [pickedSignals, active.trapSignals]);

  const signalOk = useMemo(() => {
    // ✅ เงื่อนไข: เลือก risk อย่างน้อย 2 ข้อ และเลือก trap ไม่เกิน 0 (หรือในเคส SAFE ให้เลือก trap แทน)
    if (active.correctClass === "RISKY") {
      return pickedRiskCount >= 2 && pickedTrapCount === 0;
    }
    // SAFE case: ควรเลือก trap(ปลอดภัย) อย่างน้อย 2 และไม่เลือก risk
    return pickedTrapCount >= 2 && pickedRiskCount === 0;
  }, [active.correctClass, pickedRiskCount, pickedTrapCount]);

  return (
    <div className="edu-app">
      {/* ✅ TOPBAR */}
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
              <FiLogOut aria-hidden="true" /> ออกจากระบบ
            </button>
          </div>
        </div>
      </header>

      <main className="edu-layout">
        {/* ✅ HERO */}
        <section className="edu-hero" aria-label="Unit 3 header">
          <div className="edu-hero__card">
            <div className="edu-hero__row">
              <div className="edu-hero__headline">
                <div className="edu-hero__title">
                  Unit 3: การจัดการรอยเท้าดิจิทัลและตัวตนออนไลน์
                </div>
                <div className="edu-hero__sub">เรื่องที่ 3	พฤติกรรมออนไลน์และความเสี่ยงที่เกิดขึ้น
</div>

                <div className="edu-lessons__toolbar">
                  <button
                    className="edu-btn edu-btn--back"
                    type="button"
                    onClick={() => {
                      if (step === "task") {
                        setStep("lesson");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        return;
                      }
                      navigate(-1);
                    }}
                  >
                    <FiChevronLeft aria-hidden="true" /> กลับ
                  </button>

                  <button
                    className="edu-btn edu-btn--ghost"
                    type="button"
                    onClick={() => navigate("/main")}
                    style={{ marginLeft: 8 }}
                  >
                    <FiHome aria-hidden="true" /> กลับหน้าหลัก
                  </button>
                </div>
              </div>

              <div className="edu-lessons__meta">{/* เว้นไว้ */}</div>
            </div>
          </div>
        </section>

        {/* ✅ CONTENT PANEL */}
        <section className="edu-panel1">
          <div className="edu-panel1__head">
            <div className="edu-panel1__title">
              <FiFileText aria-hidden="true" />
              {panelTitle}
            </div>
          </div>

          {/* ========================================================= */}
          {/* ✅ STEP 1: MICRO-LESSON                                    */}
          {/* ========================================================= */}
          {step === "lesson" && (
            <div style={{ padding: 16 }}>
              <div style={boxStyle}>
                <div style={{ fontSize: 18, fontWeight: 950, marginBottom: 8 }}>
                  พฤติกรรมออนไลน์ ไม่ได้หายไปไหน — มันกลายเป็น “รอยเท้า”
                </div>

                <div style={softText}>
                  พฤติกรรมอย่างการคอมเมนต์แรง ๆ หรือแชร์สิ่งที่ไม่เหมาะสม
                  อาจส่งผล 3 เรื่องสำคัญ:
                  <b>ชื่อเสียง</b> / <b>ความสัมพันธ์</b> / <b>โอกาสในอนาคต</b>
                </div>

                <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                  <div
                    style={{
                      borderRadius: 14,
                      border: "1px solid rgba(0,0,0,0.08)",
                      background: "rgba(255,255,255,0.65)",
                      padding: 12,
                    }}
                  >
                    <div style={{ fontWeight: 950 }}>ตัวอย่างพฤติกรรมเสี่ยง</div>
                    <ul style={{ margin: "8px 0 0 18px", ...softText }}>
                      <li>แสดงความคิดเห็นรุนแรง/โจมตีคน</li>
                      <li>แชร์เนื้อหาพาดพิงคนอื่นแบบไม่คิด</li>
                      <li>โพสต์ตอนอารมณ์ร้อน</li>
                    </ul>
                  </div>

                  <div
                    style={{
                      borderRadius: 14,
                      border: "1px solid rgba(0,0,0,0.08)",
                      background: "rgba(255,255,255,0.65)",
                      padding: 12,
                    }}
                  >
                    <div style={{ fontWeight: 950 }}>ตัวอย่างพฤติกรรมไม่เสี่ยง</div>
                    <ul style={{ margin: "8px 0 0 18px", ...softText }}>
                      <li>แสดงความคิดเห็นสุภาพ มีเหตุผล</li>
                      <li>คิดก่อนแชร์/ตรวจบริบทก่อนส่งต่อ</li>
                      <li>โฟกัสประเด็น ไม่โจมตีคน</li>
                    </ul>
                  </div>

                  <div
                    style={{
                      borderRadius: 14,
                      border: "1px solid rgba(16,185,129,0.22)",
                      background: "rgba(16,185,129,0.10)",
                      padding: 12,
                    }}
                  >
                    <div style={{ fontWeight: 950 }}>จำง่าย</div>
                    <div style={softText}>
                      ก่อนโพสต์/ก่อนแชร์ ให้ถามตัวเอง:{" "}
                      <b>“ทำให้ใครเสียหายไหม?”</b> + <b>“คุมการส่งต่อได้ไหม?”</b> +{" "}
                      <b>“ถ้าอนาคตคนเห็น เราโอเคไหม?”</b>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    className="edu-btn edu-btn--primary"
                    type="button"
                    onClick={() => {
                      setStep("task");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    ไปทำกิจกรรม <FiChevronRight aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* ✅ STEP 2: TASK                                            */}
          {/* ========================================================= */}
          {step === "task" && (
            <div style={{ padding: 16 }}>
              <div style={boxStyle}>
                <div style={{ display: "grid", gap: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 950 }}>กิจกรรมคัดแยกพฤติกรรม</div>
                      <div style={softText}>
                        เลือก 1 สถานการณ์ แล้วตอบว่า “เสี่ยง/ไม่เสี่ยง” จากนั้นติ๊ก “จุดสังเกต” และดู feedback ทันที
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignSelf: "center" }}>
                      <span className="edu-pill edu-pill--muted">Classification</span>
                      <span className="edu-pill edu-pill--muted">Signal Task</span>
                    </div>
                  </div>

                  {/* ✅ scenario selector */}
                  <div>
                    <div style={{ fontWeight: 950, marginBottom: 8 }}>เลือกสถานการณ์</div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {SCENARIOS.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setActiveId(s.id)}
                          style={pillStyle(activeId === s.id)}
                          aria-pressed={activeId === s.id}
                          title={s.title}
                        >
                          {s.title}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ✅ story card */}
                  <div
                    style={{
                      borderRadius: 14,
                      border: "1px solid rgba(0,0,0,0.08)",
                      background: "rgba(255,255,255,0.65)",
                      padding: 12,
                    }}
                  >
                    <div style={{ fontWeight: 950 }}>{active.title}</div>
                    <div style={{ ...softText, marginTop: 6 }}>{active.story}</div>
                  </div>

                  {/* ✅ classification */}
                  <div>
                    <div style={{ fontWeight: 950, marginBottom: 8 }}>1) พฤติกรรมนี้จัดว่า…</div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {CLASS_CHOICES.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setPickedClass(c.id);
                            if (submitted) setSubmitted(false);
                          }}
                          style={pillStyle(pickedClass === c.id)}
                          aria-pressed={pickedClass === c.id}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ✅ signal identification */}
                  <div>
                    <div style={{ fontWeight: 950, marginBottom: 8 }}>
                      2) จุดสังเกต (Signal) ที่ทำให้ “เสี่ยง/ไม่เสี่ยง”
                    </div>

                    <div style={{ display: "grid", gap: 10 }}>
                      {/* รวมรายการให้เลือก: เอา riskSignals + trapSignals มารวม */}
                      {[...active.riskSignals, ...active.trapSignals].map((label) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => toggleSignal(label)}
                          style={chipStyle(pickedSignals.includes(label))}
                          aria-pressed={pickedSignals.includes(label)}
                          title={label}
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    <div style={{ ...softText, marginTop: 8 }}>
                      เคล็ดลับ: “เสี่ยง” มักเกี่ยวกับทำร้ายคนอื่น/คุมการส่งต่อไม่ได้/อารมณ์นำเหตุผล  
                      ส่วน “ไม่เสี่ยง” มักเกี่ยวกับสุภาพ/มีเหตุผล/เคารพคนอื่น
                    </div>
                  </div>

                  {/* ✅ feedback */}
                  {submitted && (
                    <div style={{ display: "grid", gap: 10 }}>
                      {/* classification feedback */}
                      {classCorrect ? (
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
                            <div style={{ fontWeight: 900 }}>จัดประเภทถูกต้อง ✅</div>
                            <div style={softText}>
                              เฉลยของสถานการณ์นี้คือ:{" "}
                              <b>{active.correctClass === "RISKY" ? "เสี่ยง" : "ไม่เสี่ยง"}</b>
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
                              ยังไม่ตรง ❌ (เฉลย:{" "}
                              {active.correctClass === "RISKY" ? "เสี่ยง" : "ไม่เสี่ยง"})
                            </div>
                            <div style={softText}>
                              ลองเชื่อม “พฤติกรรม” กับ “ผลกระทบ” ดูว่าไปกระทบชื่อเสียง/ความสัมพันธ์/อนาคตไหม
                            </div>
                          </div>
                        </div>
                      )}

                      {/* signal feedback */}
                      {signalOk ? (
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
                            <div style={{ fontWeight: 900 }}>Signal แม่น ✅</div>
                            <div style={softText}>
                              คุณเลือกสัญญาณได้สอดคล้องกับการจัดประเภท (เสี่ยง/ไม่เสี่ยง)
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
                            <div style={{ fontWeight: 900 }}>Signal ยังไม่ค่อยตรง</div>
                            <div style={softText}>
                              เฉลยแนวคิด: ถ้าเคส “เสี่ยง” ให้โฟกัสสัญญาณที่ทำให้กระทบคนอื่น/คุมการส่งต่อไม่ได้  
                              ถ้าเคส “ไม่เสี่ยง” ให้โฟกัสสัญญาณที่สุภาพ/มีเหตุผล/ไม่โจมตีคน
                            </div>
                          </div>
                        </div>
                      )}

                      {/* impact explanation */}
                      <div
                        style={{
                          borderRadius: 14,
                          border: "1px solid rgba(0,0,0,0.08)",
                          background: "rgba(255,255,255,0.65)",
                          padding: 12,
                        }}
                      >
                        <div style={{ fontWeight: 950 }}>ผลกระทบที่ควรเชื่อมให้เห็น</div>
                        <ul style={{ margin: "8px 0 0 18px", ...softText }}>
                          {active.impacts.map((x) => (
                            <li key={x}>{x}</li>
                          ))}
                        </ul>

                        <div style={{ fontWeight: 950, marginTop: 12 }}>ทำยังไงให้ปลอดภัยกว่า</div>
                        <div style={{ ...softText, marginTop: 6 }}>{active.saferMove}</div>
                      </div>
                    </div>
                  )}

                  {/* ✅ actions */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                      marginTop: 6,
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      className="edu-btn edu-btn--back"
                      type="button"
                      onClick={() => {
                        setStep("lesson");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      <FiChevronLeft aria-hidden="true" /> กลับ
                    </button>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <button
                        className="edu-btn edu-btn--primary"
                        type="button"
                        onClick={submitTask}
                        disabled={!canSubmit}
                        title={!canSubmit ? "เลือก ‘เสี่ยง/ไม่เสี่ยง’ และติ๊ก signal อย่างน้อย 1 ข้อก่อนนะ" : "ส่งคำตอบเพื่อดู feedback"}
                      >
                        ส่งคำตอบ <FiChevronRight aria-hidden="true" />
                      </button>

                      {submitted && (
                        <button
                          className="edu-btn edu-btn--ghost"
                          type="button"
                          onClick={goFinish}
                          title="กลับหน้า Learn ของ Unit 3"
                        >
                          เสร็จสิ้น <FiChevronRight aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* ✅ reset */}
                  <button
                    className="edu-btn"
                    type="button"
                    onClick={() => {
                      setPickedClass("");
                      setPickedSignals([]);
                      setSubmitted(false);
                    }}
                    title="ลองใหม่"
                  >
                    ลองใหม่ (รีเซ็ตคำตอบ)
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
