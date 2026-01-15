// src/pages/Unit1/Learn2.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import logo from "../../assets/logo.png";

import "../../main.css";
import "./learn.css";

import { FiChevronLeft, FiFileText, FiHome, FiLogOut, FiUser } from "react-icons/fi";

// ✅ 2.1
import Unit1_2_1 from "./pages/Unit1_2_1";

// ✅ 2.2 (อยู่ในโฟลเดอร์ Unit1 ตรงนี้ตามที่คุณ import มา)
import Unit1_2_2 from "./pages/Unit1_2_2";
import Unit1_2_4 from "./pages/Unit1_2_4";


// ✅ progress (ตอนนี้ยังเก็บแค่ 2.1 ตามที่คุณมี)
import { loadU1_21, saveU1_21 } from "./utils/progress";

export default function Learn2() {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ อ่าน query mode เผื่อใช้ต่อ (เหมือน Learn1) — ตอนนี้ยังไม่ใช้ แต่เก็บไว้ได้
  const mode = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    return sp.get("mode") || "all";
  }, [location.search]);

  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");

  /**
   * ✅ step flow:
   * - "task21" : 2.1
   * - "task22" : 2.2
   * - "task24" : 2.4 (ยังไม่ทำ)
   */
  const [step, setStep] = useState("task21");

  // ✅ เก็บผล 2.1 (ใช้ปล่อยผ่าน/ย้อนกลับได้)
  const [task21Result, setTask21Result] = useState(null);

  // ✅ โหลดชื่อผู้เรียน + โหลด progress เดิม (ถ้ามี)
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
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

        // ✅ โหลด progress ของ 2.1
        const saved21 = loadU1_21();
        if (saved21) setTask21Result(saved21);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [navigate]);

  /**
   * ✅ title ใน panel1 ให้เปลี่ยนตาม step (เหมือน Learn1)
   */
  const panelTitle = useMemo(() => {
    if (step === "task21") return "แนวคิดระดับการเข้าถึงข้อมูล";
    if (step === "task22") return "ความสัมพันธ์ (ข้อมูล × บริบท × ระดับการเข้าถึง)";
    return "กิจกรรม 2.4: วิเคราะห์สถานการณ์ + ให้เหตุผล";
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
                <div className="edu-userchip__name">{loading ? "กำลังโหลด..." : studentName || "ผู้เรียน"}</div>
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
                <div className="edu-hero__title">Unit 1: การคุ้มครองข้อมูลส่วนบุคคลและความปลอดภัยบัญชี</div>

                <div className="edu-lessons__toolbar">
                  <button
                    className="edu-btn edu-btn--back"
                    type="button"
                    onClick={() => {
                      // ✅ ปุ่มกลับ: ไล่ step ย้อนแบบเป็นระบบ
                      if (step === "task24") {
                        setStep("task22");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        return;
                      }
                      if (step === "task22") {
                        setStep("task21");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        return;
                      }

                      // ✅ ถ้าอยู่ 2.1 แล้วกดย้อน -> ย้อนหน้าก่อนหน้า
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

          {/* ✅ STEP: 2.1 */}
          {step === "task21" && (
            <Unit1_2_1
              initialProgress={task21Result}
              onComplete={(result) => {
                setTask21Result(result);
                saveU1_21(result);
              }}
              onNext={() => {
                setStep("task22");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          )}

          {/* ✅ STEP: 2.2 */}
          {step === "task22" && (
            <Unit1_2_2
              onNext={() => {
                // ✅ ไป 2.4
                setStep("task24");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          )}

          {/* ✅ STEP: 2.4 */}
{step === "task24" && (
  <Unit1_2_4
    onNext={() => {
      // ✅ กลับไปหน้า Learn.jsx (หน้ารายชื่อบท)
      navigate("/unit1/learn", { replace: true });
    }}
  />
)}


        </section>
      </main>
    </div>
  );
}
