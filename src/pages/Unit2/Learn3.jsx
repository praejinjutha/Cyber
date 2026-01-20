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
  FiFileText,
  FiHome,
  FiInfo,
  FiLogOut,
  FiShield,
  FiUser,
  FiSettings,
  FiRefreshCw,
  FiTrash2,
  FiSmartphone,
  FiLock,
  FiEyeOff
} from "react-icons/fi";

/**
 * ✅ Unit 2 - Learn3 (Simulation-based)
 * เป้าหมาย (BO7-BO10):
 * 7) ระบุการตั้งค่าความปลอดภัยพื้นฐาน (รหัสผ่าน, อัปเดต, สิทธิ์เข้าถึง)
 * 8) เลือกการตั้งค่าให้เหมาะกับสถานการณ์
 * 9) ระบุพฤติกรรม Digital Hygiene
 * 10) ปฏิบัติตาม Digital Hygiene ในสถานการณ์ที่กำหนด
 */
const Learn3Unit2 = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ UI & Auth State
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");
  
  // ✅ Simulation State
  const [contextKey, setContextKey] = useState("personal"); // personal | public
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [simPhase, setSimPhase] = useState("idle"); // idle | running | done
  const [simStep, setSimStep] = useState(0);

  /* ------------------------------------------------------------------ */
  /* ✅ DATA: สถานการณ์และงาน Digital Hygiene (BO7-BO10)                */
  /* ------------------------------------------------------------------ */
  const CONTEXTS = [
    { key: "personal", label: "มือถือส่วนตัว", icon: <FiUser />, desc: "ใช้แอปธนาคาร, เก็บรูปส่วนตัว, ล็อกอินโซเชียลค้างไว้" },
    { key: "public", label: "คอมฯ สาธารณะ", icon: <FiLock />, desc: "ยืมเครื่องเพื่อน หรือใช้คอมฯ ห้องสมุดส่งงานชั่วคราว" },
  ];

  const HYGIENE_TASKS = useMemo(() => [
    {
      id: "passcode",
      label: "ตั้งรหัสผ่าน/Lock หน้าจอ",
      category: "Security Setting",
      icon: <FiLock />,
      importance: ["personal", "public"],
      impact: "ถ้าไม่ทำ: ใครก็เข้าถึงข้อมูลในเครื่องได้ทันทีหากเราลุกไปที่อื่น",
    },
    {
      id: "os_update",
      label: "อัปเดตระบบปฏิบัติการ",
      category: "Maintenance",
      icon: <FiRefreshCw />,
      importance: ["personal"],
      impact: "ถ้าไม่ทำ: เครื่องจะมีช่องโหว่ให้ Malware โจมตีผ่านช่องโหว่เก่า",
    },
    {
      id: "permission",
      label: "จำกัดสิทธิ์แอป (Permissions)",
      category: "Security Setting",
      icon: <FiEyeOff />,
      importance: ["personal"],
      impact: "ถ้าไม่ทำ: แอปทั่วไปอาจแอบเข้าถึงพิกัดหรือไมโครโฟนตลอดเวลา",
    },
    {
      id: "logout_clear",
      label: "Logout & ล้างประวัติ (Clear Cache)",
      category: "Digital Hygiene",
      icon: <FiTrash2 />,
      importance: ["public"],
      impact: "ถ้าไม่ทำ: คนที่มาใช้เครื่องต่อจะเข้าบัญชีคุณได้ทันทีโดยไม่ต้องใส่รหัส",
    }
  ], []);

  /* ------------------------------------------------------------------ */
  /* ✅ LOGIC: Simulation & Evaluation                                  */
  /* ------------------------------------------------------------------ */
  const toggleTask = (id) => {
    if (simPhase !== "idle") return;
    setSelectedTasks(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const evaluation = useMemo(() => {
    const required = HYGIENE_TASKS.filter(t => t.importance.includes(contextKey)).map(t => t.id);
    const missing = required.filter(id => !selectedTasks.includes(id));
    return {
      isPerfect: missing.length === 0,
      missingTasks: HYGIENE_TASKS.filter(t => missing.includes(t.id)),
      score: ((required.length - missing.length) / required.length) * 100
    };
  }, [contextKey, selectedTasks, HYGIENE_TASKS]);

  const startSim = () => {
    if (selectedTasks.length === 0) {
      alert("กรุณาเลือกสิ่งที่ต้องการปฏิบัติอย่างน้อย 1 อย่าง");
      return;
    }
    setSimPhase("running");
    setSimStep(0);
  };

  useEffect(() => {
    if (simPhase === "running") {
      if (simStep < 3) {
        const timer = setTimeout(() => setSimStep(s => s + 1), 800);
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
      if (profile) setStudentName(`${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim());
      setLoading(false);
    })();
  }, [navigate]);

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
              <div className="edu-userchip__avatar"><FiUser /></div>
              <div className="edu-userchip__name">{loading ? "..." : studentName || "ผู้เรียน"}</div>
            </div>
            <button className="edu-btn edu-btn--danger" onClick={() => supabase.auth.signOut()}>
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
              <div className="edu-hero__title">Unit 2: การปฏิบัติความปลอดภัยทางเทคนิคพื้นฐาน</div>
              <div className="edu-lessons__toolbar">
                <button className="edu-btn edu-btn--back" onClick={() => navigate(-1)}><FiChevronLeft /> กลับ</button>
                <button className="edu-btn edu-btn--ghost" onClick={() => navigate("/main")} style={{marginLeft: 8}}><FiHome /> หน้าหลัก</button>
              </div>
            </div>
          </div>
        </section>

        {/* ✅ SIMULATION CONTENT */}
        <section className="edu-panel1">
          <div className="edu-panel1__head">
            <div className="edu-panel1__title"><FiSettings /> Workshop: ปฏิบัติจริงตามสถานการณ์</div>
          </div>

          <div className="u13-layout" style={{ padding: 20 }}>
            {/* LEFT: Step 1 & 2 */}
            <div className="u13-shell">
              <div className="u13-gallery">
                <div className="u13-header">
                  <h3 className="u13-title">1. เลือกสถานการณ์ </h3>
                  <div className="u13-actions" style={{ marginTop: 12 }}>
                    {CONTEXTS.map(c => (
                      <button 
                        key={c.key}
                        className={`u13-token ${contextKey === c.key ? 'is-selected' : ''}`}
                        onClick={() => { setContextKey(c.key); setSelectedTasks([]); setSimPhase("idle"); }}
                      >
                        {c.icon} {c.label}
                      </button>
                    ))}
                  </div>
                  <div className="edu-callout" style={{ marginTop: 12 }}>
                    <b>บริบท:</b> {CONTEXTS.find(c => c.key === contextKey).desc}
                  </div>
                </div>

                <div className="u13-header" style={{ marginTop: 24 }}>
                  <h3 className="u13-title">2. เลือกการปฏิบัติ </h3>
                  <p className="u13-desc">เลือกการตั้งค่าที่ควรทำที่สุดสำหรับสถานการณ์นี้</p>
                </div>
                
                <div className="u13-grid">
                  {HYGIENE_TASKS.map((task) => (
                    <button
                      key={task.id}
                      className={`u13-card ${selectedTasks.includes(task.id) ? "is-active" : ""}`}
                      onClick={() => toggleTask(task.id)}
                    >
                      <div className="u13-card-row">
                        <div className="u13-iconbox">{task.icon}</div>
                        <div style={{ flex: 1, textAlign: 'left' }}>
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
                <div className="u13-head__title">3. ผลลัพธ์ </div>
                <div className="u13-head__sub">ระบบจะจำลองความปลอดภัยของอุปกรณ์</div>
              </div>

              <div className="u13-body">
                <div className="u13-feedback-container" style={{ background: '#f0f4f8', padding: 20, borderRadius: 16 }}>
                  <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <FiSmartphone size={48} color={simPhase === 'done' ? (evaluation.isPerfect ? '#10b981' : '#f59e0b') : '#64748b'} />
                    <div className="edu-h4" style={{marginTop: 10}}>
                      {simPhase === 'idle' ? "พร้อมทดสอบ" : simPhase === 'running' ? "กำลังประมวลผล..." : "เสร็จสิ้น"}
                    </div>
                  </div>

                  {[
                    { label: "ตรวจสอบนโยบายความปลอดภัย", icon: <FiShield /> },
                    { label: "ประเมินพฤติกรรม Hygiene", icon: <FiRefreshCw /> },
                    { label: "สรุปผลการป้องกัน", icon: <FiCheckCircle /> }
                  ].map((s, idx) => (
                    <div key={idx} className="u13-feedback" style={{ opacity: simStep >= idx ? 1 : 0.3, marginBottom: 8 }}>
                      <div className="u13-feedback__row">
                        <div className="u13-feedback__icon">{simStep > idx ? <FiCheckCircle color="#10b981" /> : s.icon}</div>
                        <div className="u13-feedback__title" style={{fontSize: 14}}>{s.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {simPhase === "idle" && (
                  <button className="edu-btn edu-btn--primary" onClick={startSim} style={{ width: '100%', marginTop: 20 }}>
                    Simulation <FiChevronRight />
                  </button>
                )}

                {simPhase === "done" && (
                  <div className={`u13-feedback ${evaluation.isPerfect ? 'ok' : 'warn'}`} style={{ marginTop: 20 }}>
                    <div className="u13-feedback__title">
                      {evaluation.isPerfect ? "ยอดเยี่ยม! อุปกรณ์ปลอดภัย" : "พบช่องโหว่ความปลอดภัย!"}
                    </div>
                    <div className="u13-feedback__text" style={{ marginTop: 10 }}>
                      {evaluation.missingTasks.map(t => (
                        <div key={t.id} style={{ color: '#ef4444', marginBottom: 8, fontSize: 13 }}>
                          • <b>ขาดการปฏิบัติ:</b> {t.label} <br/>
                          <small style={{opacity: 0.8}}>{t.impact}</small>
                        </div>
                      ))}
                      {evaluation.isPerfect && "คุณเลือกตั้งค่าได้ถูกต้องตามสถานการณ์ที่กำหนด และปฏิบัติตามหลัก Digital Hygiene ได้ครบถ้วน"}
                    </div>
                    
                    <button className="edu-btn edu-btn--ghost" onClick={() => navigate("/unit2/learn")} style={{ marginTop: 15, width: '100%' }}>
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