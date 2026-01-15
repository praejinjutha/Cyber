// src/pages/Unit1/Learn4.jsx

import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// ✅ Supabase
import { supabase } from "../../lib/supabase";

// ✅ Assets
import logo from "../../assets/logo.png";

// ✅ วิดีโอ (4.1)
import learnVideo from "../../assets/learn4.mp4";

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

// ✅ 4.2
import Unit1_4_2 from "./pages/Unit1_4_2";

// ✅ 4.3 (รวม 4.4 แล้ว)
import Unit1_4_3 from "./pages/Unit1_4_3";

export default function Learn4() {
  // ✅ Router helpers
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ อ่าน query mode เผื่อใช้ต่อ (เหมือน Learn3)
  const mode = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    return sp.get("mode") || "all";
  }, [location.search]);

  // ✅ State: โหลดข้อมูลผู้เรียน
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");

  /**
   * ✅ step flow สำหรับเรื่องที่ 4 (ปรับตามที่รวม 4.3+4.4)
   * - "video"  : 4.1 ความหมายและความสำคัญของ MFA (micro video/animation + quiz)
   * - "task42" : 4.2 รูปแบบ MFA ที่ใช้แพร่หลาย (interactive simulation)
   * - "task43" : 4.3 รวมกัน = เลือก MFA ให้เหมาะ + จำลองขั้นตอนเปิดใช้งาน (scenario + step-by-step)
   */
  const [step, setStep] = useState("video");

  // ✅ โหลดชื่อผู้เรียน (ไม่มี progress แล้ว)
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
   * ✅ Title ใน panel1 ให้เปลี่ยนตาม step (สอดคล้องกับตารางที่ปรับรวมแล้ว)
   */
  const panelTitle = useMemo(() => {
    if (step === "video") return "บทนำ: ความหมายและความสำคัญของ MFA";
    if (step === "task42") return "รูปแบบ MFA ที่ใช้แพร่หลาย";
    return "เลือก MFA ให้เหมาะ + จำลองขั้นตอนเปิดใช้งาน";
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
                       * ✅ ปุ่มกลับแบบ step-by-step เหมือน Learn3
                       * - อยู่ 4.3 -> กลับ 4.2
                       * - อยู่ 4.2 -> กลับ video
                       * - อยู่ video -> กลับหน้าก่อนหน้า (history)
                       */
                      if (step === "task43") {
                        setStep("task42");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        return;
                      }

                      if (step === "task42") {
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
              STEP: VIDEO (4.1 ก่อนเข้า 4.2)
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
                    setStep("task42"); // ✅ ไป 4.2
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  title="ไปทำกิจกรรม 4.2"
                >
                  ถัดไป <FiChevronRight aria-hidden="true" />
                </button>
              </div>
            </div>
          )}

          {/* =========================
              STEP: 4.2
          ========================= */}
          {step === "task42" && (
            <Unit1_4_2
              // ✅ onNext: ไป 4.3 (รวม 4.4 แล้ว)
              onNext={() => {
                setStep("task43");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          )}

          {/* =========================
              STEP: 4.3 (รวม 4.4)
          ========================= */}
          {step === "task43" && (
            <Unit1_4_3
              // ✅ onNext: จบบท 4 -> กลับหน้ารายชื่อบท
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
