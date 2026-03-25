import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

import logo from "../../assets/logo.png";

// ✅ CSS (ห้ามแก้)
import "../../main.css";
import "../Unit1/learn.css";

// ✅ Icons
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiHome,
  FiLogOut,
  FiUser,
  FiMessageSquare,
  FiFlag,
  FiHelpCircle,
  FiShield
} from "react-icons/fi";

/**
 * Unit 4 - Learn2
 * เรื่องที่ 2: การจำแนกประเภทความขัดแย้งและการกลั่นแกล้งออนไลน์
 * รูปแบบ: Micro-lesson + Interactive Classification + Signal Identification
 */
const Learn2Unit4 = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Auth / UI
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");

  // ✅ Learning State
  const [scenarioKey, setScenarioKey] = useState("chat");
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [phase, setPhase] = useState("idle"); // idle | running | done
  const [step, setStep] = useState(0);

  // ✅ Micro-lesson (ก่อนเริ่ม workshop)
  const [showLesson, setShowLesson] = useState(true);

  // ✅ Signal Identification Task (ผู้เรียนกดเช็กสัญญาณก่อน)
  const [signals, setSignals] = useState({
    repeated: false, // ทำซ้ำ / ตามต่อ
    humiliating: false, // ทำให้อับอาย/ประจาน
    provoking: false, // ยั่วยุให้ปะทะ
    rudeLanguage: false, // คำพูดไม่สุภาพ/ดูหมิ่น
    manyAgainstOne: false // รุม/หลายคนใส่คนเดียว
  });

  /* ------------------------------------------------------------------ */
  /* ✅ สถานการณ์ตัวอย่าง (Context)                                    */
  /* ------------------------------------------------------------------ */
  const SCENARIOS = [
    {
      key: "chat",
      label: "แชทกลุ่มเพื่อน",
      icon: <FiMessageSquare />,
      desc: "คุยกันในกลุ่มแชทห้อง มีการแซว ตอบโต้ และส่งข้อความเร็ว"
    },
    {
      key: "comment",
      label: "คอมเมนต์สาธารณะ",
      icon: <FiFlag />,
      desc: "มีคนแสดงความคิดเห็นใต้โพสต์ที่ทุกคนมองเห็นได้"
    }
  ];

  /* ------------------------------------------------------------------ */
  /* ✅ ประเภทพฤติกรรมที่ต้องจำแนก                                     */
  /* ------------------------------------------------------------------ */
  const BEHAVIOR_TYPES = useMemo(
    () => [
      {
        id: "conflict",
        label: "ความขัดแย้งทั่วไป",
        icon: <FiHelpCircle />,
        signal: "โต้เถียงกันด้วยเหตุผล หรือมุมมองไม่ตรงกัน"
      },
      {
        id: "rude",
        label: "การสื่อสารไม่สุภาพ",
        icon: <FiAlertTriangle />,
        signal: "ใช้คำพูดแรง ประชด หรือดูหมิ่น"
      },
      {
        id: "provocation",
        label: "การยั่วยุ",
        icon: <FiFlag />,
        signal: "ตั้งใจพูดให้คนอื่นโกรธหรือปะทะ"
      },
      {
        id: "cyberbullying",
        label: "การกลั่นแกล้งออนไลน์",
        icon: <FiShield />,
        signal: "ทำซ้ำ ๆ ทำให้อีกฝ่ายอับอาย หวาดกลัว หรือโดดเดี่ยว"
      }
    ],
    []
  );

  /* ------------------------------------------------------------------ */
  /* ✅ เฉลยที่ถูกต้อง “ต่อสถานการณ์”                                  */
  /* ------------------------------------------------------------------ */
  const ANSWERS = useMemo(
    () => ({
      // แชทกลุ่มเพื่อน: มักเจอความขัดแย้ง/ไม่สุภาพ/ยั่วยุ (ไม่ใช่ทุกเคสจะถึงขั้น bully)
      chat: ["conflict", "rude", "provocation"],
      // คอมเมนต์สาธารณะ: มักเจอความขัดแย้ง/ไม่สุภาพ/กลั่นแกล้ง
      comment: ["conflict", "rude", "cyberbullying"]
    }),
    []
  );

  /* ------------------------------------------------------------------ */
  /* ✅ Logic                                                           */
  /* ------------------------------------------------------------------ */
  const toggleType = (id) => {
    if (phase !== "idle") return;
    setSelectedTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const toggleSignal = (key) => {
    if (phase !== "idle") return;
    setSignals((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // ✅ แก้ตรรกะ: ต้อง “พอดี” ไม่ใช่แค่ “มีครบ”
  const evaluation = useMemo(() => {
    const expected = ANSWERS[scenarioKey] ?? [];
    const missing = expected.filter((id) => !selectedTypes.includes(id));
    const extra = selectedTypes.filter((id) => !expected.includes(id));

    return {
      expected,
      missing,
      extra,
      isPerfect: missing.length === 0 && extra.length === 0
    };
  }, [scenarioKey, selectedTypes, ANSWERS]);

  // ✅ Signal feedback (ไม่ใช่เฉลย แต่เป็น “ตัวช่วยคิด” ก่อนตรวจคำตอบ)
  const signalHint = useMemo(() => {
    const selected = Object.entries(signals).filter(([, v]) => v).map(([k]) => k);

    if (selected.length === 0) {
      return {
        level: "info",
        text: "ลองติ๊กสัญญาณที่คุณสังเกตเห็นก่อน จะช่วยให้คัดแยกประเภทได้แม่นขึ้น"
      };
    }

    const important = [];

    if (signals.rudeLanguage) important.push("มีคำพูดไม่สุภาพ → อาจเข้าข่าย ‘ไม่สุภาพ’");
    if (signals.provoking) important.push("มีการยั่วยุ → อาจเข้าข่าย ‘ยั่วยุ’");
    if (signals.repeated) important.push("ทำซ้ำ/ตามต่อ → ระวัง ‘กลั่นแกล้ง’");
    if (signals.humiliating) important.push("ทำให้อับอาย/ประจาน → ระวัง ‘กลั่นแกล้ง’");
    if (signals.manyAgainstOne) important.push("หลายคนรุม → ระวัง ‘กลั่นแกล้ง’");

    return {
      level: important.length >= 2 ? "warn" : "ok",
      text:
        important.length > 0
          ? important.join(" • ")
          : "สัญญาณที่เลือกยังไม่ชัด ลองมองว่าเป็น ‘ทำซ้ำไหม’ หรือ ‘เจตนาทำร้ายไหม’"
    };
  }, [signals]);

  const startCheck = () => {
    if (selectedTypes.length === 0) {
      alert("ลองเลือกประเภทพฤติกรรมอย่างน้อย 1 อย่าง");
      return;
    }
    setPhase("running");
    setStep(0);
  };

  useEffect(() => {
    if (phase === "running") {
      if (step < 3) {
        const t = setTimeout(() => setStep((s) => s + 1), 700);
        return () => clearTimeout(t);
      } else {
        setPhase("done");
      }
    }
  }, [phase, step]);

  /* ------------------------------------------------------------------ */
  /* ✅ AUTH CHECK                                                      */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase.auth.getSession();
      if (!data.session?.user) {
        navigate("/login", { replace: true });
        return;
      }
      const { data: profile } = await supabase
        .from("student_profiles")
        .select("first_name,last_name")
        .eq("user_id", data.session.user.id)
        .maybeSingle();

      if (profile)
        setStudentName(
          `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim()
        );

      setLoading(false);
    })();
  }, [navigate]);

  const getLabelById = (id) =>
    BEHAVIOR_TYPES.find((b) => b.id === id)?.label ?? id;
  const getSignalById = (id) =>
    BEHAVIOR_TYPES.find((b) => b.id === id)?.signal ?? "";

  const resetForScenario = (key) => {
    setScenarioKey(key);
    setSelectedTypes([]);
    setPhase("idle");
    setStep(0);
    setSignals({
      repeated: false,
      humiliating: false,
      provoking: false,
      rudeLanguage: false,
      manyAgainstOne: false
    });
  };

  return (
    <div className="edu-app">
      {/* TOPBAR */}
      <header className="edu-topbar">
        <div className="edu-topbar__inner">
          <div className="homebar__brand">
            <img src={logo} alt="logo" className="homebar__logo" />
            <div className="edu-brandtext">
              <div className="edu-brandtext__title">LearnSecure</div>
              <div className="edu-brandtext__subtitle">Unit 4.2</div>
            </div>
          </div>
          <div className="edu-topbar__right">
            <div className="edu-userchip">
              <div className="edu-userchip__avatar">
                <FiUser />
              </div>
              <div className="edu-userchip__name">
                {loading ? "..." : studentName || "ผู้เรียน"}
              </div>
            </div>
            <button
              className="edu-btn edu-btn--danger"
              onClick={() => supabase.auth.signOut()}
            >
              <FiLogOut /> ออก
            </button>
          </div>
        </div>
      </header>

      <main className="edu-layout">
        {/* HERO */}
        <section className="edu-hero">
          <div className="edu-hero__card">
            <div className="edu-hero__headline">
              {/* ✅ แก้หัวข้อให้ตรงเรื่อง */}
              <div className="edu-hero__title">
                Unit 4: การสื่อสารและมารยาทดิจิทัล
              </div>
<div className="edu-hero__sub">เรื่องที่ 2	การจำแนกประเภทความขัดแย้งและการกลั่นแกล้งออนไลน์

</div>

              <div className="edu-lessons__toolbar">
                <button
                  className="edu-btn edu-btn--back"
                  onClick={() => navigate(-1)}
                >
                  <FiChevronLeft /> กลับ
                </button>
                <button
                  className="edu-btn edu-btn--ghost"
                  onClick={() => navigate("/main")}
                >
                  <FiHome /> หน้าหลัก
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ✅ MICRO-LESSON (ก่อน workshop) */}
        {showLesson && (
         <section className="edu-panel1" style={{ marginBottom: 14 }}>
  <div className="edu-panel1__head">
    <div className="edu-panel1__title">
      <FiHelpCircle /> ก่อนเริ่มกิจกรรม: แยกให้ออกว่าเกิดอะไรขึ้น
    </div>
  </div>

  <div className="u13-shell" style={{ padding: 18 }}>
    {/* บทนำสั้น */}
    <div className="u13-desc">
      ในโลกออนไลน์ ข้อความที่ดูแรงอาจไม่ได้หมายความว่าเป็นการกลั่นแกล้งเสมอไป  
      การดู “สัญญาณ” จะช่วยให้เราแยกประเภทได้แม่นยำขึ้น
    </div>

    {/* ประเภทพฤติกรรม */}
    <div className="u13-header" style={{ marginTop: 18 }}>
      <h3 className="u13-title">ประเภทพฤติกรรมที่ใช้ในบทนี้</h3>
      <p className="u13-desc">
        บทนี้ใช้ 4 ประเภทหลัก เพื่อช่วยอธิบายสถานการณ์ออนไลน์ที่พบบ่อย
      </p>
    </div>

    <div className="u13-grid">
      <div className="u13-card is-static">
        <div className="u13-card-title">ความขัดแย้งทั่วไป</div>
        <div className="u13-card-sub">
          ความเห็นต่างหรือการถกเถียงกัน โดยยังไม่ตั้งใจทำร้ายอีกฝ่าย
        </div>
      </div>

      <div className="u13-card is-static">
        <div className="u13-card-title">การสื่อสารไม่สุภาพ</div>
        <div className="u13-card-sub">
          ใช้คำพูดแรง ประชด หรือดูหมิ่น ทำให้อีกฝ่ายรู้สึกไม่ดี
        </div>
      </div>

      <div className="u13-card is-static">
        <div className="u13-card-title">การยั่วยุ</div>
        <div className="u13-card-sub">
          ตั้งใจพูดหรือทำเพื่อให้อีกฝ่ายโกรธและเกิดการปะทะ
        </div>
      </div>

      <div className="u13-card is-static">
        <div className="u13-card-title">การกลั่นแกล้งออนไลน์</div>
        <div className="u13-card-sub">
          การกระทำที่ทำซ้ำ รุม หรือทำให้อับอาย จนอีกฝ่ายเครียดหรือหวาดกลัว
        </div>
      </div>
    </div>

    {/* สัญญาณ */}
    <div className="u13-header" style={{ marginTop: 22 }}>
      <h3 className="u13-title">สัญญาณที่ควรสังเกต</h3>
      <p className="u13-desc">
        สัญญาณเหล่านี้ช่วยบอกระดับความรุนแรงของสถานการณ์
      </p>
    </div>

    <div className="u13-grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
      <div className="u13-card is-static">
        <div className="u13-card-sub">พฤติกรรมเกิดขึ้นซ้ำหรือไม่</div>
      </div>
      <div className="u13-card is-static">
        <div className="u13-card-sub">มีคำพูดดูหมิ่นหรือยั่วยุหรือเปล่า</div>
      </div>
      <div className="u13-card is-static">
        <div className="u13-card-sub">มีการประจานหรือทำให้อับอายไหม</div>
      </div>
      <div className="u13-card is-static">
        <div className="u13-card-sub">มีหลายคนรุมใส่คนเดียวหรือไม่</div>
      </div>
    </div>

    {/* ปุ่มเข้า workshop */}
    <div className="u13-actions" style={{ marginTop: 20 }}>
      <button
        className="edu-btn edu-btn--primary"
        onClick={() => setShowLesson(false)}
      >
        เริ่ม Workshop <FiChevronRight />
      </button>
    </div>
  </div>
</section>

        )}

        {/* CONTENT (Workshop) */}
        {!showLesson && (
          <section className="edu-panel1">
            <div className="edu-panel1__head">
              <div className="edu-panel1__title">
                <FiMessageSquare /> Workshop: จำแนกพฤติกรรมจากสถานการณ์
              </div>
            </div>

            <div className="u13-layout" style={{ padding: 20 }}>
              {/* LEFT */}
              <div className="u13-shell">
                <div className="u13-header">
                  <h3 className="u13-title">1. เลือกสถานการณ์</h3>
                  <div className="u13-actions" style={{ marginTop: 12 }}>
                    {SCENARIOS.map((s) => (
                      <button
                        key={s.key}
                        className={`u13-token ${scenarioKey === s.key ? "is-selected" : ""}`}
                        onClick={() => resetForScenario(s.key)}
                      >
                        {s.icon} {s.label}
                      </button>
                    ))}
                  </div>

                  <div className="edu-callout" style={{ marginTop: 12 }}>
                    <b>บริบท:</b> {SCENARIOS.find((s) => s.key === scenarioKey).desc}
                  </div>
                </div>

                {/* ✅ Signal Identification Task */}
                <div className="u13-header" style={{ marginTop: 18 }}>
                  <h3 className="u13-title">2. เช็ก “สัญญาณ” ที่เห็น</h3>
                  <p className="u13-desc">
                    ติ๊กสิ่งที่คุณสังเกตเห็นจากสถานการณ์นี้ (ช่วยให้คัดแยกได้แม่นขึ้น)
                  </p>

                  <div className="u13-grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
                    <button
                      className={`u13-card ${signals.rudeLanguage ? "is-active" : ""}`}
                      onClick={() => toggleSignal("rudeLanguage")}
                    >
                      <div className="u13-card-row">
                        <div className="u13-card-title">มีคำพูดไม่สุภาพ/ดูหมิ่น</div>
                      </div>
                    </button>

                    <button
                      className={`u13-card ${signals.provoking ? "is-active" : ""}`}
                      onClick={() => toggleSignal("provoking")}
                    >
                      <div className="u13-card-row">
                        <div className="u13-card-title">เหมือนตั้งใจยั่วให้ปะทะ</div>
                      </div>
                    </button>

                    <button
                      className={`u13-card ${signals.repeated ? "is-active" : ""}`}
                      onClick={() => toggleSignal("repeated")}
                    >
                      <div className="u13-card-row">
                        <div className="u13-card-title">ทำซ้ำ/ตามต่อ</div>
                      </div>
                    </button>

                    <button
                      className={`u13-card ${signals.humiliating ? "is-active" : ""}`}
                      onClick={() => toggleSignal("humiliating")}
                    >
                      <div className="u13-card-row">
                        <div className="u13-card-title">ทำให้อับอาย/เหมือนประจาน</div>
                      </div>
                    </button>

                    <button
                      className={`u13-card ${signals.manyAgainstOne ? "is-active" : ""}`}
                      onClick={() => toggleSignal("manyAgainstOne")}
                      style={{ gridColumn: "1 / -1" }}
                    >
                      <div className="u13-card-row">
                        <div className="u13-card-title">หลายคนรุมใส่คนเดียว</div>
                      </div>
                    </button>
                  </div>

                  <div className="edu-callout" style={{ marginTop: 12 }}>
                    <b>Hint:</b> {signalHint.text}
                  </div>
                </div>

                <div className="u13-header" style={{ marginTop: 20 }}>
                  <h3 className="u13-title">3. คัดแยกประเภทพฤติกรรม</h3>
                  <p className="u13-desc">
                    เลือก “เฉพาะประเภทที่คิดว่าเข้ากับสถานการณ์นี้” (เลือกเยอะไม่ได้แปลว่าถูก)
                  </p>
                </div>

                <div className="u13-grid">
                  {BEHAVIOR_TYPES.map((b) => (
                    <button
                      key={b.id}
                      className={`u13-card ${selectedTypes.includes(b.id) ? "is-active" : ""}`}
                      onClick={() => toggleType(b.id)}
                    >
                      <div className="u13-card-row">
                        <div className="u13-iconbox">{b.icon}</div>
                        <div style={{ flex: 1, textAlign: "left" }}>
                          <div className="u13-card-title">{b.label}</div>
                          <div className="u13-card-sub">{b.signal}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* RIGHT */}
              <div className="u13-rightCard">
                <div className="u13-head">
                  <div className="u13-head__title">4. ตรวจสัญญาณ</div>
                  <div className="u13-head__sub">ดูว่า “ขาดอะไร” และ “เลือกเกินอะไร”</div>
                </div>

                <div className="u13-body">
                  {phase === "idle" && (
                    <>
                      <button
                        className="edu-btn edu-btn--primary"
                        style={{ width: "100%" }}
                        onClick={startCheck}
                      >
                        ตรวจสอบ <FiChevronRight />
                      </button>

                      <button
                        className="edu-btn"
                        style={{ width: "100%", marginTop: 10 }}
                        onClick={() => setShowLesson(true)}
                      >
                        กลับไปอ่านเนื้อหา
                      </button>
                    </>
                  )}

                  {phase === "running" && (
                    <div className="edu-callout" style={{ marginTop: 12 }}>
                      กำลังตรวจสัญญาณ... ({step}/3)
                    </div>
                  )}

                  {phase === "done" && (
                    <div
                      className={`u13-feedback ${evaluation.isPerfect ? "ok" : "warn"}`}
                      style={{ marginTop: 12 }}
                    >
                      <div className="u13-feedback__title">
                        {evaluation.isPerfect ? "พอดีเลย ✅" : "ยังไม่พอดี (มีขาด/มีเกิน) ⚠️"}
                      </div>

                      <div className="u13-feedback__text" style={{ marginTop: 10, fontSize: 13 }}>
                        {/* Missing */}
                        {evaluation.missing.length > 0 && (
                          <div style={{ marginBottom: 10 }}>
                            <b>สิ่งที่อาจมองข้าม:</b>
                            {evaluation.missing.map((id) => (
                              <div key={id} style={{ marginTop: 6 }}>
                                • <b>{getLabelById(id)}</b>: {getSignalById(id)}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Extra */}
                        {evaluation.extra.length > 0 && (
                          <div style={{ marginBottom: 10 }}>
                            <b>สิ่งที่อาจเลือกเกิน:</b>
                            {evaluation.extra.map((id) => (
                              <div key={id} style={{ marginTop: 6 }}>
                                • <b>{getLabelById(id)}</b> (ลองถามตัวเองว่า “มีหลักฐานพอไหม”)
                              </div>
                            ))}
                          </div>
                        )}

                        {evaluation.isPerfect && (
                          <div>
                            คุณเลือกได้ “พอดี” กับบริบทนี้ — ช่วยให้รับมือได้ชัดขึ้นโดยไม่เหมารวมเกินไป
                          </div>
                        )}
                      </div>

                      <button
                        className="edu-btn edu-btn--ghost"
                        style={{ marginTop: 12, width: "100%" }}
                        onClick={() => navigate("/unit4/learn")}
                      >
                        เสร็จสิ้น <FiChevronRight />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Learn2Unit4;
