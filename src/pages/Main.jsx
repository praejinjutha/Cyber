import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import logo from "../assets/logo.png";

import "../main.css";
import "../home.css";

import {
  FiBarChart2,
  FiUser,
  FiLogOut,
  FiChevronRight,
  FiActivity,
} from "react-icons/fi";

import { FiThumbsUp } from "react-icons/fi"; // ใช้ FiThumbsUp สำหรับ feedback

export default function Main() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");
  const [studentProgress, setStudentProgress] = useState("ยังเรียนไม่จบ"); // Added state for student progress

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
        setStudentName(
          `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim()
        );
      }

      // Check if the student has completed the course
      const { data: progressData } = await supabase
        .from("course_progress")
        .select("status")
        .eq("user_id", u.id)
        .single();

      if (progressData && progressData.status === "completed") {
        setStudentProgress("จบหลักสูตร"); // Update status if course is completed
      } else {
        setStudentProgress("ยังเรียนไม่จบ");
      }

      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [navigate]);

  const greet = useMemo(() => {
    if (loading) return "กำลังโหลด...";
    return studentName ? studentName : "ผู้เรียน";
  }, [loading, studentName]);

  return (
    <div className="homepage">
      <header className="navbar">
        <div className="homebar">
          <div className="homebar__brand" role="banner">
            <img src={logo} alt="LearnSecure logo" className="homebar__logo" />
            <div className="homebar__brandText">
              <div className="homebar__title">LearnSecure</div>
              <div className="homebar__sub">Student Portal</div>
            </div>
          </div>

          <div className="homebar__right">
            <div className="homebar__user" title={studentName || "Student"}>
              <span className="homebar__avatar" aria-hidden="true">
                <FiUser />
              </span>
              <div className="homebar__meta">
                <div className="homebar__name">{greet}</div>
                <div className="homebar__role">
                  <span
                    className={`edu-pill ${
                      studentProgress === "จบหลักสูตร" ? "edu-pill--ok" : "edu-pill--lock"
                    }`}
                  >
                    {studentProgress}
                  </span>
                </div>
              </div>
            </div>

            <button
              className="homebtn homebtn--danger"
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

      <main className="homewrap">
        {/* HERO */}
        <section className="homehero" aria-label="Home hero">
          <div className="homehero__text">
            <div className="homehero__kicker">หน้าหลัก</div>
            <h1 className="homehero__title">เริ่มเรียนได้ทันที</h1>

            {loading ? (
              <div className="homehero__desc">
                <span className="homeload" aria-hidden="true" />
                กำลังดึงข้อมูลโปรไฟล์...
              </div>
            ) : (
              <p className="homehero__desc">
                สวัสดี <b>{greet}</b> 👋 
              </p>
            )}

            <div className="homehero__ctaRow">
              <button
                type="button"
                className="homebtn homebtn--primary"
                onClick={() => navigate("/lessons?mode=adaptive")}
              >
                <FiActivity aria-hidden="true" />
                เริ่มเรียนกันเลย
                <FiChevronRight aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* QUICK STRIP */}
          <div className="homehero__strip" aria-label="Quick actions">
            <button
              type="button"
              className="quick"
              onClick={() => navigate("/dashboard")}
            >
              <span className="quick__icon" aria-hidden="true">
                <FiBarChart2 />
              </span>
              <span className="quick__text">
                <span className="quick__title">Dashboard</span>
                <span className="quick__desc">ภาพรวมความก้าวหน้า</span>
              </span>
              <FiChevronRight className="quick__arrow" aria-hidden="true" />
            </button>

            {/* ปุ่มข้อเสนอแนะ */}
            <button
              type="button"
              className="quick"
              onClick={() => navigate("/feedback")}
            >
              <span className="quick__icon" aria-hidden="true">
                <FiThumbsUp />
              </span>
              <span className="quick__text">
                <span className="quick__title">ข้อเสนอแนะ</span>
                <span className="quick__desc">ให้ข้อเสนอแนะเกี่ยวกับการเรียนรู้</span>
              </span>
              <FiChevronRight className="quick__arrow" aria-hidden="true" />
            </button>

            <button
              type="button"
              className="quick"
              onClick={() => navigate("/profile")}
            >
              <span className="quick__icon" aria-hidden="true">
                <FiUser />
              </span>
              <span className="quick__text">
                <span className="quick__title">โปรไฟล์</span>
                <span className="quick__desc">ดู/แก้ไขข้อมูลผู้ใช้งาน</span>
              </span>
              <FiChevronRight className="quick__arrow" aria-hidden="true" />
            </button>
          </div>
        </section>

        {/* CONTENT */}
        <section className="homesections">
          {/* OVERVIEW */}
          <div className="section">
            <div className="section__head">
              <div className="section__title">
                <FiActivity aria-hidden="true" />
                ภาพรวมความก้าวหน้า
              </div>
              <button
                className="section__link"
                type="button"
                onClick={() => navigate("/dashboard")}
              >
                ดูทั้งหมด <FiChevronRight aria-hidden="true" />
              </button>
            </div>

            <div className="kpis">
              <div className="kpi">
                <div className="kpi__label">บทเรียนที่เรียนแล้ว</div>
                <div className="kpi__value">—</div>
                <div className="kpi__hint">จะแสดงเมื่อเชื่อมข้อมูลบทเรียน</div>
              </div>
              <div className="kpi">
                <div className="kpi__label">แบบทดสอบที่ทำแล้ว</div>
                <div className="kpi__value">—</div>
                <div className="kpi__hint">Pretest/แบบฝึกหัด</div>
              </div>
              <div className="kpi">
                <div className="kpi__label">คะแนนล่าสุด</div>
                <div className="kpi__value">—</div>
                <div className="kpi__hint">ดูรายละเอียดในเมนูคะแนน</div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
