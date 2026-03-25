import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

import logo from "../../assets/logo.png";

// ✅ CSS
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
  FiShield,
  FiUser,
  FiSettings,
  FiRefreshCw,
  FiTrash2,
  FiSmartphone,
  FiLock,
  FiEyeOff,
  FiInfo,
} from "react-icons/fi";

/**
 * ✅ Unit 2 - Learn3 (Simulation-based)
 * เป้าหมาย (BO7-BO10):
 * 7) ระบุการตั้งค่าความปลอดภัยพื้นฐาน (รหัสผ่าน, อัปเดต, สิทธิ์เข้าถึง)
 * 8) เลือกการตั้งค่าให้เหมาะกับสถานการณ์
 * 9) ระบุพฤติกรรม Digital Hygiene
 * 10) ปฏิบัติตาม Digital Hygiene ในสถานการณ์ที่กำหนด
 *
 * ✅ ปรับตามที่ขอ:
 * - สถานการณ์ "คอมฯ สาธารณะ" เพิ่มการปฏิบัติ: ล้างประวัติ/แคช, ไม่บันทึกรหัสผ่าน, แจ้งครู/IT หากพบความผิดปกติ
 * - ทำให้ทั้ง 2 สถานการณ์ “เลือกได้หมด” แล้วให้ระบบ Feedback ว่าอะไร “ควรเลือก”, “ทำเพิ่มได้”, “ไม่เหมาะ/ทำไม่ได้”
 */
const Learn3Unit2 = () => {
  const navigate = useNavigate();
  const location = useLocation(); // (เผื่อใช้ต่อยอดภายหลัง)

  // ✅ UI & Auth State
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");

  // ✅ Simulation State
  const [contextKey, setContextKey] = useState("personal"); // personal | public
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [simPhase, setSimPhase] = useState("idle"); // idle | running | done
  const [simStep, setSimStep] = useState(0);

  /* ------------------------------------------------------------------ */
  /* ✅ DATA: สถานการณ์ (Contexts)                                       */
  /* ------------------------------------------------------------------ */
  const CONTEXTS = [
    {
      key: "personal",
      label: "มือถือส่วนตัว",
      icon: <FiUser />,
      desc: "ใช้แอปธนาคาร, เก็บรูปส่วนตัว, ล็อกอินโซเชียลค้างไว้",
    },
    {
      key: "public",
      label: "คอมฯ สาธารณะ",
      icon: <FiLock />,
      desc: "ยืมเครื่องเพื่อน หรือใช้คอมฯ ห้องสมุดส่งงานชั่วคราว",
    },
  ];

  /* ------------------------------------------------------------------ */
  /* ✅ DATA: งาน Digital Hygiene                                         */
  /* - recommendFor: “ควรทำที่สุด” ตามสถานการณ์
   * - alsoOkFor: “ทำเพิ่มได้” ไม่ผิด แต่ไม่ใช่หัวใจหลักของสถานการณ์นั้น
   * - notRecommendedFor: “ไม่เหมาะ/ทำไม่ได้/เสี่ยง” สำหรับสถานการณ์นั้น
   * ------------------------------------------------------------------ */
  const HYGIENE_TASKS = useMemo(
    () => [
      {
        id: "passcode",
        label: "ตั้งรหัสผ่าน/Lock หน้าจอ",
        category: "Security Setting",
        icon: <FiLock />,
        recommendFor: ["personal"],
        alsoOkFor: ["public"],
        notRecommendedFor: [],
        impactIfMissing:
          "ถ้าไม่ทำ: ใครก็เข้าถึงข้อมูลในเครื่องได้ทันทีหากเราลุกไปที่อื่น",
        note:
          "ถ้าเป็นคอมสาธารณะ: ทำได้เฉพาะกรณีเครื่องเป็นของเรา/มีสิทธิ์ตั้งค่า (ส่วนใหญ่ทำไม่ได้)",
      },
      {
        id: "os_update",
        label: "อัปเดตระบบปฏิบัติการ",
        category: "Maintenance",
        icon: <FiRefreshCw />,
        recommendFor: ["personal"],
        alsoOkFor: [],
        notRecommendedFor: ["public"],
        impactIfMissing:
          "ถ้าไม่ทำ: เครื่องจะมีช่องโหว่ให้ Malware โจมตีผ่านช่องโหว่เก่า",
        notRecommendedReason:
          "คอมสาธารณะส่วนใหญ่เราไม่มีสิทธิ์อัปเดต และเสียเวลา/กระทบผู้ใช้คนอื่น",
      },
      {
        id: "permission",
        label: "จำกัดสิทธิ์แอป (Permissions)",
        category: "Security Setting",
        icon: <FiEyeOff />,
        recommendFor: ["personal"],
        alsoOkFor: [],
        notRecommendedFor: ["public"],
        impactIfMissing:
          "ถ้าไม่ทำ: แอปทั่วไปอาจแอบเข้าถึงพิกัดหรือไมโครโฟนตลอดเวลา",
        notRecommendedReason:
          "คอมสาธารณะไม่ใช่มือถือเรา และมักปรับสิทธิ์แอปได้จำกัด/ไม่เกี่ยว",
      },

      // ✅ ปรับของเดิม: แยก Logout กับ Clear History/Cache ให้ชัด
      {
        id: "logout_all",
        label: "ออกจากระบบ (Logout) ทุกบัญชีให้ครบ",
        category: "Digital Hygiene",
        icon: <FiLogOut />,
        recommendFor: ["public"],
        alsoOkFor: ["personal"],
        notRecommendedFor: [],
        impactIfMissing:
          "ถ้าไม่ทำ: คนที่มาใช้เครื่องต่ออาจเข้าบัญชีคุณได้ทันที",
        note:
          "ทริค: เช็คหลายที่—Gmail, Drive, Facebook, Line Web, Browser Sync, Microsoft/Google Account",
      },
      {
        id: "clear_history_cache",
        label: "ล้างประวัติ/แคช (Clear History/Cache) หลังใช้งาน",
        category: "Digital Hygiene",
        icon: <FiTrash2 />,
        recommendFor: ["public"],
        alsoOkFor: ["personal"],
        notRecommendedFor: [],
        impactIfMissing:
          "ถ้าไม่ทำ: ประวัติ, คุกกี้, หรือฟอร์มที่กรอก อาจค้างไว้ให้คนถัดไปเห็น",
        note: "ถ้าทำได้: ใช้โหมดไม่ระบุตัวตน (Incognito/Private) ตั้งแต่เริ่มก็ยิ่งดี",
      },
      {
        id: "dont_save_password",
        label: "ไม่บันทึกรหัสผ่าน/ไม่กด Remember me",
        category: "Account Safety",
        icon: <FiEyeOff />,
        recommendFor: ["public"],
        alsoOkFor: ["personal"],
        notRecommendedFor: [],
        impactIfMissing:
          "ถ้าเผลอบันทึก: เบราว์เซอร์อาจจำรหัสผ่าน ทำให้คนถัดไปล็อกอินแทนได้",
        note:
          "ถ้าพลาดไปแล้ว: รีบไปลบ Saved Passwords/Sign-in และ Logout ทุกที่",
      },
      {
        id: "report_suspicious",
        label: "แจ้งครูหรือ IT หากพบความผิดปกติ (หน้าต่างเด้ง/ขอรหัส/โปรแกรมแปลก)",
        category: "Incident Response",
        icon: <FiAlertTriangle />,
        recommendFor: ["public", "personal"],
        alsoOkFor: [],
        notRecommendedFor: [],
        impactIfMissing:
          "ถ้าไม่แจ้ง: ปัญหาอาจลามไปคนอื่น หรือบัญชีอาจถูกขโมยโดยไม่รู้ตัว",
        note:
          "สัญญาณง่าย ๆ: เบราว์เซอร์เด้งโฆษณา, หน้า Login แปลก, คีย์บอร์ดพิมพ์เอง, เมาส์ขยับเอง, มีโปรแกรมไม่รู้จัก",
      },

      // ✅ เพิ่ม “ทำเพิ่มได้” ที่ปลอดภัยทั้งสองบริบทแบบง่าย ๆ (optional but good)
      {
        id: "use_2fa",
        label: "เปิดยืนยันตัวตน 2 ขั้นตอน (2FA) ในบัญชีสำคัญ",
        category: "Account Safety",
        icon: <FiShield />,
        recommendFor: ["personal"],
        alsoOkFor: ["public"],
        notRecommendedFor: [],
        impactIfMissing:
          "ถ้าไม่ทำ: ถ้ารหัสผ่านหลุด บัญชีอาจถูกยึดได้ง่ายขึ้น",
        note: "เหมือนมีกุญแจ 2 ชั้น—แม้รหัสผ่านหลุดยังกันได้อีกด่าน",
      },
    ],
    []
  );

  /* ------------------------------------------------------------------ */
  /* ✅ LOGIC: เลือก/ยกเลิก Task                                         */
  /* ------------------------------------------------------------------ */
  const toggleTask = (id) => {
    // ✅ ระหว่างจำลอง/หลังจบ ไม่ให้แก้ selection
    if (simPhase !== "idle") return;

    setSelectedTasks((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  /* ------------------------------------------------------------------ */
  /* ✅ LOGIC: ประเมินผล (Feedback แบบ “ควรเลือก/ทำเพิ่มได้/ไม่เหมาะ”)      */
  /* ------------------------------------------------------------------ */
  const evaluation = useMemo(() => {
    // ✅ งานที่ “ควรทำที่สุด” ตามบริบท
    const recommendedIds = HYGIENE_TASKS.filter((t) =>
      (t.recommendFor ?? []).includes(contextKey)
    ).map((t) => t.id);

    // ✅ งานที่ “ทำเพิ่มได้” ตามบริบท
    const alsoOkIds = HYGIENE_TASKS.filter((t) =>
      (t.alsoOkFor ?? []).includes(contextKey)
    ).map((t) => t.id);

    // ✅ งานที่ “ไม่เหมาะ/ทำไม่ได้” ตามบริบท
    const notRecommendedIds = HYGIENE_TASKS.filter((t) =>
      (t.notRecommendedFor ?? []).includes(contextKey)
    ).map((t) => t.id);

    // ✅ คำนวณ missing (ขาดงานที่ควรทำที่สุด)
    const missingRecommended = recommendedIds.filter(
      (id) => !selectedTasks.includes(id)
    );

    // ✅ คำนวณ selected ที่ไม่เหมาะ
    const selectedNotRecommended = selectedTasks.filter((id) =>
      notRecommendedIds.includes(id)
    );

    // ✅ คำนวณ selected ที่เป็น “ทำเพิ่มได้”
    const selectedAlsoOk = selectedTasks.filter((id) => alsoOkIds.includes(id));

    // ✅ คำนวณ selected ที่เป็น recommended
    const selectedRecommended = selectedTasks.filter((id) =>
      recommendedIds.includes(id)
    );

    // ✅ คะแนน: ให้คะแนนจาก recommended เป็นหลัก (ไม่หักจากการเลือก extra)
    const denom = Math.max(recommendedIds.length, 1);
    const score = (selectedRecommended.length / denom) * 100;

    // ✅ สถานะรวม
    const isPerfect =
      missingRecommended.length === 0 && selectedNotRecommended.length === 0;

    // ✅ แปลงเป็น object รายการ task เพื่อเอาไปโชว์ข้อความ
    const toTaskObj = (ids) =>
      HYGIENE_TASKS.filter((t) => ids.includes(t.id));

    return {
      score,
      isPerfect,

      recommendedTasks: toTaskObj(recommendedIds),
      missingRecommendedTasks: toTaskObj(missingRecommended),

      selectedRecommendedTasks: toTaskObj(selectedRecommended),
      selectedAlsoOkTasks: toTaskObj(selectedAlsoOk),
      selectedNotRecommendedTasks: toTaskObj(selectedNotRecommended),
    };
  }, [contextKey, selectedTasks, HYGIENE_TASKS]);

  /* ------------------------------------------------------------------ */
  /* ✅ LOGIC: เริ่ม Simulation                                           */
  /* ------------------------------------------------------------------ */
  const startSim = () => {
    // ✅ ต้องเลือกอย่างน้อย 1 อย่าง
    if (selectedTasks.length === 0) {
      alert("กรุณาเลือกสิ่งที่ต้องการปฏิบัติอย่างน้อย 1 อย่าง");
      return;
    }

    // ✅ เริ่มจำลอง
    setSimPhase("running");
    setSimStep(0);
  };

  /* ------------------------------------------------------------------ */
  /* ✅ EFFECT: ทำ Step Loading ให้ดูเหมือนระบบกำลังประมวลผล               */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (simPhase === "running") {
      if (simStep < 3) {
        const timer = setTimeout(() => setSimStep((s) => s + 1), 800);
        return () => clearTimeout(timer);
      } else {
        setSimPhase("done");
      }
    }
  }, [simPhase, simStep]);

  /* ------------------------------------------------------------------ */
  /* ✅ AUTH CHECK                                                      */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    (async () => {
      setLoading(true);

      // ✅ ดึง session
      const { data } = await supabase.auth.getSession();

      // ✅ ถ้าไม่ login -> กลับหน้า login
      if (!data.session?.user) {
        navigate("/login", { replace: true });
        return;
      }

      // ✅ ดึงโปรไฟล์ผู้เรียน
      const { data: profile } = await supabase
        .from("student_profiles")
        .select("first_name,last_name")
        .eq("user_id", data.session.user.id)
        .maybeSingle();

      // ✅ ใส่ชื่อบน UI
      if (profile)
        setStudentName(
          `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim()
        );

      setLoading(false);
    })();
  }, [navigate]);

  /* ------------------------------------------------------------------ */
  /* ✅ UI                                                              */
  /* ------------------------------------------------------------------ */
  return (
    <div className="edu-app">
      {/* ✅ TOPBAR */}
      <header className="edu-topbar">
        <div className="edu-topbar__inner">
          <div className="homebar__brand">
            <img src={logo} alt="logo" className="homebar__logo" />
            <div className="edu-brandtext">
              <div className="edu-brandtext__title">LearnSecure</div>
              <div className="edu-brandtext__subtitle">Unit 2.3</div>
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
        {/* ✅ HERO */}
        <section className="edu-hero">
          <div className="edu-hero__card">
            <div className="edu-hero__headline">
              <div className="edu-hero__title">
                Unit 2: การปฏิบัติความปลอดภัยทางเทคนิคพื้นฐาน
              </div>
              <div className="edu-hero__sub">เรื่องที่ 3	การตั้งค่าความปลอดภัยและ Digital Hygiene
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
                  style={{ marginLeft: 8 }}
                >
                  <FiHome /> หน้าหลัก
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ✅ SIMULATION CONTENT */}
        <section className="edu-panel1">
          <div className="edu-panel1__head">
            <div className="edu-panel1__title">
              <FiSettings /> Workshop: ปฏิบัติจริงตามสถานการณ์
            </div>
          </div>

          <div className="u13-layout" style={{ padding: 20 }}>
            {/* LEFT: Step 1 & 2 */}
            <div className="u13-shell">
              <div className="u13-gallery">
                <div className="u13-header">
                  <h3 className="u13-title">1. เลือกสถานการณ์</h3>

                  <div className="u13-actions" style={{ marginTop: 12 }}>
                    {CONTEXTS.map((c) => (
                      <button
                        key={c.key}
                        className={`u13-token ${
                          contextKey === c.key ? "is-selected" : ""
                        }`}
                        onClick={() => {
                          // ✅ เปลี่ยนสถานการณ์ -> รีเซ็ตการเลือก + รีเซ็ตผล
                          setContextKey(c.key);
                          setSelectedTasks([]);
                          setSimPhase("idle");
                          setSimStep(0);
                        }}
                      >
                        {c.icon} {c.label}
                      </button>
                    ))}
                  </div>

                  <div className="edu-callout" style={{ marginTop: 12 }}>
                    <b>บริบท:</b> {CONTEXTS.find((c) => c.key === contextKey).desc}
                  </div>
                </div>

                <div className="u13-header" style={{ marginTop: 24 }}>
                  <h3 className="u13-title">2. เลือกการปฏิบัติ</h3>

                  {/* ✅ เปลี่ยนข้อความ: ไม่บังคับ “ควรทำที่สุด” อย่างเดียวแล้ว */}
                  <p className="u13-desc">
                    เลือกสิ่งที่คุณคิดว่า “ควรทำ” ในสถานการณ์นี้ (เลือกได้หลายข้อ)
                    แล้วระบบจะบอกว่าอะไร “ควรเลือก”, “ทำเพิ่มได้”, หรือ “ไม่เหมาะ/ทำไม่ได้”
                  </p>


                </div>

                <div className="u13-grid">
                  {HYGIENE_TASKS.map((task) => (
                    <button
                      key={task.id}
                      className={`u13-card ${
                        selectedTasks.includes(task.id) ? "is-active" : ""
                      }`}
                      onClick={() => toggleTask(task.id)}
                    >
                      <div className="u13-card-row">
                        <div className="u13-iconbox">{task.icon}</div>

                        <div style={{ flex: 1, textAlign: "left" }}>
                          <div className="u13-card-title">{task.label}</div>
                          <div className="u13-card-sub">{task.category}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT: Step 3 Simulation */}
            <div className="u13-rightCard">
              <div className="u13-head">
                <div className="u13-head__title">3. ผลลัพธ์</div>
                <div className="u13-head__sub">
                  ระบบจะจำลองความปลอดภัยของอุปกรณ์ตามสิ่งที่คุณเลือก
                </div>
              </div>

              <div className="u13-body">
                <div
                  className="u13-feedback-container"
                  style={{
                    background: "#f0f4f8",
                    padding: 20,
                    borderRadius: 16,
                  }}
                >
                  <div style={{ textAlign: "center", marginBottom: 20 }}>
                    <FiSmartphone
                      size={48}
                      color={
                        simPhase === "done"
                          ? evaluation.isPerfect
                            ? "#10b981"
                            : "#f59e0b"
                          : "#64748b"
                      }
                    />

                    <div className="edu-h4" style={{ marginTop: 10 }}>
                      {simPhase === "idle"
                        ? "พร้อมทดสอบ"
                        : simPhase === "running"
                        ? "กำลังประมวลผล..."
                        : "เสร็จสิ้น"}
                    </div>
                  </div>

                  {[
                    { label: "ตรวจสอบสถานการณ์", icon: <FiShield /> },
                    { label: "ประเมินสิ่งที่เลือก", icon: <FiRefreshCw /> },
                    { label: "สรุปผลและให้คำแนะนำ", icon: <FiCheckCircle /> },
                  ].map((s, idx) => (
                    <div
                      key={idx}
                      className="u13-feedback"
                      style={{
                        opacity: simStep >= idx ? 1 : 0.3,
                        marginBottom: 8,
                      }}
                    >
                      <div className="u13-feedback__row">
                        <div className="u13-feedback__icon">
                          {simStep > idx ? (
                            <FiCheckCircle color="#10b981" />
                          ) : (
                            s.icon
                          )}
                        </div>
                        <div
                          className="u13-feedback__title"
                          style={{ fontSize: 14 }}
                        >
                          {s.label}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ✅ ปุ่มเริ่ม */}
                {simPhase === "idle" && (
                  <button
                    className="edu-btn edu-btn--primary"
                    onClick={startSim}
                    style={{ width: "100%", marginTop: 20 }}
                  >
                    Simulation <FiChevronRight />
                  </button>
                )}

                {/* ✅ ผลลัพธ์ + Feedback แบบละเอียด */}
                {simPhase === "done" && (
                  <div
                    className={`u13-feedback ${
                      evaluation.isPerfect ? "ok" : "warn"
                    }`}
                    style={{ marginTop: 20 }}
                  >
                    <div className="u13-feedback__title">
                      {evaluation.isPerfect
                        ? "ดีมาก! เลือกได้เหมาะกับสถานการณ์"
                        : "ยังปรับได้อีกนิด เพื่อให้ปลอดภัยขึ้น"}
                    </div>

                    {/* ✅ คะแนนแบบเบา ๆ (อิงจาก recommended เป็นหลัก) */}
                    <div
                      className="u13-feedback__text"
                      style={{ marginTop: 10, fontSize: 13, opacity: 0.9 }}
                    >
                      คะแนนความเหมาะสม (จากสิ่งที่ “ควรทำที่สุด”):{" "}
                      <b>{Math.round(evaluation.score)}%</b>
                    </div>

                    <div className="u13-feedback__text" style={{ marginTop: 12 }}>
                      {/* ✅ 1) ขาดสิ่งที่ควรทำที่สุด */}
                      {evaluation.missingRecommendedTasks.length > 0 && (
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontWeight: 700, marginBottom: 6 }}>
                            ❗ สิ่งที่ “ควรเลือก” แต่ยังขาด:
                          </div>

                          {evaluation.missingRecommendedTasks.map((t) => (
                            <div
                              key={t.id}
                              style={{
                                color: "#ef4444",
                                marginBottom: 10,
                                fontSize: 13,
                                lineHeight: 1.4,
                              }}
                            >
                              • <b>{t.label}</b>
                              <br />
                              <small style={{ opacity: 0.85 }}>
                                {t.impactIfMissing}
                              </small>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* ✅ 2) เลือกสิ่งที่ทำเพิ่มได้ */}
                      {evaluation.selectedAlsoOkTasks.length > 0 && (
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontWeight: 700, marginBottom: 6 }}>
                            ✅ สิ่งที่ “ทำเพิ่มได้” (ดีเลย):
                          </div>

                          {evaluation.selectedAlsoOkTasks.map((t) => (
                            <div
                              key={t.id}
                              style={{
                                color: "#10b981",
                                marginBottom: 10,
                                fontSize: 13,
                                lineHeight: 1.4,
                              }}
                            >
                              • <b>{t.label}</b>
                              {t.note ? (
                                <>
                                  <br />
                                  <small style={{ opacity: 0.85 }}>{t.note}</small>
                                </>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* ✅ 3) เลือกสิ่งที่ไม่เหมาะ/ทำไม่ได้ */}
                      {evaluation.selectedNotRecommendedTasks.length > 0 && (
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontWeight: 700, marginBottom: 6 }}>
                            ⚠️ สิ่งที่ “ไม่เหมาะ/ทำไม่ได้” ในสถานการณ์นี้:
                          </div>

                          {evaluation.selectedNotRecommendedTasks.map((t) => (
                            <div
                              key={t.id}
                              style={{
                                color: "#f59e0b",
                                marginBottom: 10,
                                fontSize: 13,
                                lineHeight: 1.4,
                              }}
                            >
                              • <b>{t.label}</b>
                              <br />
                              <small style={{ opacity: 0.85 }}>
                                {t.notRecommendedReason ||
                                  "ไม่จำเป็น/ทำได้ยากในบริบทนี้"}
                              </small>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* ✅ 4) ถ้าครบจริง ๆ */}
                      {evaluation.isPerfect && (
                        <div style={{ marginTop: 6, fontSize: 13 }}>
                          คุณเลือกได้ตรงจุดตามสถานการณ์ และปฏิบัติตามหลัก Digital
                          Hygiene ได้ครบถ้วน 🎯
                        </div>
                      )}
                    </div>

                    {/* ✅ ปุ่มจบ */}
                    <button
                      className="edu-btn edu-btn--ghost"
                      onClick={() => navigate("/unit2/learn")}
                      style={{ marginTop: 15, width: "100%" }}
                    >
                      เสร็จสิ้น <FiChevronRight />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Learn3Unit2;
