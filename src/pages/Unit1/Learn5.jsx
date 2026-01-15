// src/pages/Unit1/Learn5.jsx

import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// ✅ Supabase
import { supabase } from "../../lib/supabase";

// ✅ Assets
import logo from "../../assets/logo.png";

// ✅ Styles
import "../../main.css";
import "./learn.css";

// ✅ Icons
import {
  FiChevronLeft,
  FiFileText,
  FiHome,
  FiLogOut,
  FiUser,
} from "react-icons/fi";

// ✅ Unit 1 - เรื่องที่ 5
import Unit1_5_1 from "./pages/Unit1_5_1";
import Unit1_5_2 from "./pages/Unit1_5_2";

export default function Learn5() {
  // ✅ Router helpers
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ เผื่อใช้ต่อแบบ Learn3/Learn4 (ยังไม่ได้ใช้หนัก แต่คงรูปแบบไว้)
  const mode = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    return sp.get("mode") || "all";
  }, [location.search]);

  // ✅ State: โหลดข้อมูลผู้เรียน
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");

  /**
   * ✅ step flow สำหรับเรื่องที่ 5 (ตามตารางที่ตัด 5.1)
   * - "task51": รวม 5.2 + 5.3 (ชี้สัญญาณผิดปกติ + ระดับความเสี่ยงใน feedback)
   * - "task52": 5.4 (แนวทางตอบสนองเมื่อพบสัญญาณผิดปกติ)
   */
  const [step, setStep] = useState("task51");

  // ✅ โหลดชื่อผู้เรียน
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
   * ✅ Title ใน panel1 ให้เปลี่ยนตาม step
   */
  const panelTitle = useMemo(() => {
    if (step === "task51") return "สัญญาณผิดปกติ + ระดับความเสี่ยง (ฝึกชี้จุดให้เป็น)";
    return "รับมือให้ถูกเมื่อเจอสัญญาณผิดปกติ (ฝึกเลือกการตอบสนอง)";
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
                       * ✅ ปุ่มกลับแบบ step-by-step
                       * - อยู่ task52 -> กลับ task51
                       * - อยู่ task51 -> กลับหน้าก่อนหน้า (history)
                       */
                      if (step === "task52") {
                        setStep("task51");
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
              STEP: 5.2+5.3 (รวม)
          ========================= */}
          {step === "task51" && (
            <Unit1_5_1
              mode={mode}
              onNext={() => {
                // ✅ ไป 5.4
                setStep("task52");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          )}

          {/* =========================
              STEP: 5.4
          ========================= */}
          {step === "task52" && (
            <Unit1_5_2
              mode={mode}
              onNext={() => {
                // ✅ จบบท 5 -> กลับหน้า Unit1 learn list
                navigate("/unit1/learn", { replace: true });
              }}
            />
          )}
        </section>
      </main>
    </div>
  );
}
