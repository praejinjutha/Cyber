// src/pages/Unit1/Learn3.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// ✅ Supabase
import { supabase } from "../../lib/supabase";

// ✅ Assets
import logo from "../../assets/logo.png";

// ✅ วิดีโอ (ตามที่ต้องการให้แสดงก่อนเข้า 3.1)
import learnVideo from "../../assets/learn3.mp4";

// ✅ Styles
import "../../main.css";
import "./learn.css";

// ✅ Icons
import {
  FiChevronLeft,
  FiChevronRight,
  FiFileText,
  FiHome,
  FiLogOut,
  FiUser,
} from "react-icons/fi";

// ✅ 3.1
import Unit1_3_1 from "./pages/Unit1_3_1";

// ✅ 3.4
import Unit1_3_4 from "./pages/Unit1_3_4";



export default function Learn3() {
  // ✅ Router helpers
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ อ่าน query mode เผื่อใช้ต่อ (เหมือน Learn1/Learn2)
  const mode = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    return sp.get("mode") || "all";
  }, [location.search]);

  // ✅ State: โหลดข้อมูลผู้เรียน
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");

  /**
   * ✅ step flow สำหรับเรื่องที่ 3 (เพิ่ม video มาก่อน)
   * - "video"  : วิดีโอเกริ่น
   * - "task31" : 3.1
   * - "task34" : 3.4
   */
  const [step, setStep] = useState("video");

  // ✅ เก็บผล 3.1 (เพื่อย้อนกลับมาหน้าเดิมได้ + ปลดล็อก/วางเงื่อนไขได้)
  const [task31Result, setTask31Result] = useState(null);

  // ✅ โหลดชื่อผู้เรียน + โหลด progress เดิม (ถ้ามี)
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);

        // 1) เช็ค session
        const { data } = await supabase.auth.getSession();
        const u = data.session?.user;

        // ✅ ถ้าไม่มี session ให้เด้งไป login
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

        // ✅ ตั้งชื่อผู้เรียน
        if (profile) {
          setStudentName(
            `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim()
          );
        }

        // ✅ โหลด progress ของ 3.1 (ถ้ามี)
        const saved31 = loadU1_31?.();
        if (saved31) setTask31Result(saved31);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    // ✅ cleanup ป้องกัน setState หลัง unmount
    return () => {
      alive = false;
    };
  }, [navigate]);

  /**
   * ✅ Title ใน panel1 ให้เปลี่ยนตาม step
   */
  const panelTitle = useMemo(() => {
    if (step === "video") return "บทนำ: ผลกระทบและความเสี่ยงของข้อมูลส่วนบุคคล";
    if (step === "task31")
      return "ผลกระทบและความเสี่ยง (จัดระดับความเสี่ยง)";
    
    return "สรุปสถานการณ์ + ตัดสินใจอย่างปลอดภัย";
  }, [step]);

  return (
    <div className="edu-app">
      {/* =========================
          TOPBAR
      ========================= */}
      <header className="edu-topbar">
        <div className="edu-topbar__inner">
          {/* ✅ Brand */}
          <div className="homebar__brand" role="banner">
            <img src={logo} alt="LearnSecure logo" className="homebar__logo" />
            <div className="edu-brandtext">
              <div className="edu-brandtext__title">LearnSecure</div>
              <div className="edu-brandtext__subtitle">Unit 1</div>
            </div>
          </div>

          {/* ✅ Right controls */}
          <div className="edu-topbar__right">
            {/* ✅ User chip */}
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

            {/* ✅ Logout */}
            <button
              className="edu-btn edu-btn--danger"
              type="button"
              onClick={async () => {
                // ✅ ออกจากระบบ
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
        <section className="edu-hero" aria-label="Unit 1 header">
          <div className="edu-hero__card">
            <div className="edu-hero__row">
              <div className="edu-hero__headline">
                <div className="edu-hero__title">
                  Unit 1: การคุ้มครองข้อมูลส่วนบุคคลและความปลอดภัยบัญชี
                </div>

                {/* ✅ Toolbar */}
                <div className="edu-lessons__toolbar">
                  <button
                    className="edu-btn edu-btn--back"
                    type="button"
                    onClick={() => {
                      /**
                       * ✅ ปุ่มกลับแบบ step-by-step เหมือน Learn1
                       * - อยู่ 3.4 -> กลับ 3.1
                       * - อยู่ 3.1 -> กลับ video
                       * - อยู่ video -> กลับหน้าก่อนหน้า (history)
                       */
                      if (step === "task34") {
                        setStep("task31");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        return;
                      }

                      if (step === "task31") {
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

              {/* ✅ เว้น meta ไว้ตามแพทเทิร์นเดิม */}
              <div className="edu-lessons__meta" />
            </div>
          </div>
        </section>

        {/* =========================
            CONTENT
        ========================= */}
        <section className="edu-panel1">
          {/* ✅ Panel header */}
          <div className="edu-panel1__head">
            <div className="edu-panel1__title">
              <FiFileText aria-hidden="true" />
              {panelTitle}
            </div>
          </div>

          {/* =========================
              STEP: VIDEO (ก่อนเข้า 3.1)
          ========================= */}
          {step === "video" && (
            <div className="edu-videoStage">
              {/* ✅ วิดีโอเกริ่น */}
              <video className="edu-video" src={learnVideo} controls playsInline />

              {/* ✅ ปุ่มไปต่อ */}
              <div className="edu-videoActions">
                <button
                  className="edu-btn edu-btn--ghost"
                  type="button"
                  onClick={() => {
                    setStep("task31"); // ✅ ไป 3.1
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  title="ไปทำกิจกรรม 3.1"
                >
                  ถัดไป <FiChevronRight aria-hidden="true" />
                </button>
              </div>
            </div>
          )}

          {/* =========================
              STEP: 3.1
          ========================= */}
          {step === "task31" && (
            <Unit1_3_1
              // ✅ ส่ง progress เดิม (ถ้ามี) ให้คอมโพเนนต์เอาไป preset
              initialProgress={task31Result}
              // ✅ onComplete: เก็บผล + save ลง local storage
              onComplete={(result) => {
                setTask31Result(result);
                saveU1_31?.(result);
              }}
              // ✅ onNext: ไป 3.4
              onNext={() => {
                setStep("task34");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          )}

          {/* =========================
              STEP: 3.4
          ========================= */}
          {step === "task34" && (
            <Unit1_3_4
              // ✅ onNext: กลับไปหน้า Learn.jsx (หน้ารายชื่อบท)
              onNext={() => {
                navigate("/unit1/learn", { replace: true });
              }}
            />
          )}
        </section>
      </main>
    </div>
  );
}
