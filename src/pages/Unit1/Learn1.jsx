// src/pages/Unit1/Learn1.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import logo from "../../assets/logo.png";

// ✅ วิดีโอ Unit 1
import learnVideo from "../../assets/learn1.mp4";

import "../../main.css";
import "./learn.css";

import { FiChevronLeft, FiChevronRight, FiFileText, FiHome, FiLogOut, FiUser } from "react-icons/fi";

// ✅ 1.2
import ClassificationTask from "./components/ClassificationTask";

// ✅ 1.3 (embed อยู่ panel1)
import HighlightTask from "./pages/Unit1_3/HighlightTask";

// ✅ progress
import { loadU1_12, saveU1_12, loadU1_13, saveU1_13 } from "./utils/progress";

export default function Learn1() {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ อ่าน query mode เผื่อใช้ต่อ
  const mode = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    return sp.get("mode") || "all";
  }, [location.search]);

  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");

  /**
   * ✅ step flow:
   * - "video"  : วิดีโอ
   * - "task12" : กิจกรรม 1.2
   * - "task13" : กิจกรรม 1.3 (อยู่ใน panel1)
   */
  const [step, setStep] = useState("video");

  // ✅ เก็บผล 1.2 / 1.3 (เผื่อใช้ต่อ)
  const [task12Result, setTask12Result] = useState(null);
  const [task13Result, setTask13Result] = useState(null);

  // ✅ โหลดชื่อผู้เรียน + โหลด progress เดิม (ถ้ามี)
  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);

      // 1) เช็ค session
      const { data } = await supabase.auth.getSession();
      const u = data.session?.user;

      if (!u) {
        navigate("/login", { replace: true });
        return;
      }

      // 2) ดึงชื่อจาก student_profiles
      const { data: profile } = await supabase
        .from("student_profiles")
        .select("first_name,last_name")
        .eq("user_id", u.id)
        .maybeSingle();

      if (!alive) return;

      if (profile) {
        setStudentName(`${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim());
      }

      // ✅ โหลด progress ของ 1.2
      const saved12 = loadU1_12();
      if (saved12) setTask12Result(saved12);

      // ✅ โหลด progress ของ 1.3
      const saved13 = loadU1_13();
      if (saved13) setTask13Result(saved13);

      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [navigate]);

  /**
   * ✅ title ใน panel1 ให้เปลี่ยนตาม step
   */
  const panelTitle = useMemo(() => {
    if (step === "video") return "บทนำ: ทำความเข้าใจข้อมูลส่วนบุคคล";
    if (step === "task12") return "จัดประเภทข้อมูล";
    return "ตัวอย่างข้อมูลส่วนบุคคลในชีวิตประจำวัน";
  }, [step]);

  return (
    <div className="edu-app">
      {/* TOPBAR */}
      <header className="edu-topbar">
        <div className="edu-topbar__inner">
          <div className="homebar__brand" role="banner">
            <img src={logo} alt="LearnSecure logo" className="homebar__logo" />
            <div className="edu-brandtext">
              <div className="edu-brandtext__title">LearnSecure</div>
              <div className="edu-brandtext__subtitle">Unit 1</div>
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
        {/* HERO */}
        <section className="edu-hero" aria-label="Unit 1 header">
          <div className="edu-hero__card">
            <div className="edu-hero__row">
              <div className="edu-hero__headline">
                <div className="edu-hero__title">
                  Unit 1: การคุ้มครองข้อมูลส่วนบุคคลและความปลอดภัยบัญชี
                </div>

                <div className="edu-lessons__toolbar">
                  <button
                    className="edu-btn edu-btn--back"
                    type="button"
                    onClick={() => {
                      // ✅ ปุ่มกลับ: ถ้าอยู่ 1.3 -> กลับ 1.2, ถ้าอยู่ 1.2 -> กลับ video
                      if (step === "task13") {
                        setStep("task12");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        return;
                      }
                      if (step === "task12") {
                        setStep("video");
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

        {/* CONTENT */}
        <section className="edu-panel1">
          <div className="edu-panel1__head">
            <div className="edu-panel1__title">
              <FiFileText aria-hidden="true" />
              {panelTitle}
            </div>
          </div>

          {/* STEP 1: วิดีโอ */}
          {step === "video" && (
            <div className="edu-videoStage">
              <video className="edu-video" src={learnVideo} controls playsInline />

              <div className="edu-videoActions">
                <button
                  className="edu-btn edu-btn--ghost"
                  type="button"
                  onClick={() => {
                    setStep("task12"); // ✅ ไป 1.2
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  title="ไปทำกิจกรรม 1.2"
                >
                  ถัดไป <FiChevronRight aria-hidden="true" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Task 1.2 */}
          {step === "task12" && (
            <ClassificationTask
              onComplete={(result) => {
                setTask12Result(result);
                saveU1_12(result);
              }}
              onNext={() => {
                // ✅ อยู่ใน panel1: ไป 1.3 ด้วยการ setStep
                setStep("task13");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          )}

          {/* STEP 3: Task 1.3 (อยู่ใน panel1 เหมือนกัน) */}
{step === "task13" && (
  <HighlightTask
    initialProgress={task13Result}
    onComplete={(result) => {
      setTask13Result(result);
      saveU1_13(result);
    }}
    onNext={() => navigate("/unit1/learn", { replace: true })}
    
  />
)}

        </section>
      </main>
    </div>
  );
}
