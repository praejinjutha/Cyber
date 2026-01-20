import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import logo from "../../assets/logo.png";
import "../../main.css";

// ✅ Icons
import {
  FiChevronLeft,
  FiChevronRight,
  FiCheckCircle,
  FiFileText,
  FiHome,
  FiLogOut,
  FiUser,
} from "react-icons/fi";

const UNIT2_TOPICS = [
  {
    id: 1,
    title: "ความตระหนักด้านภัยคุกคามไซเบอร์",
    desc: "การระบุและทำความเข้าใจภัยคุกคามในชีวิตประจำวัน",
    path: "/unit2/learn1",
  },
  {
    id: 2,
    title: "การวิเคราะห์สถานการณ์และสัญญาณเตือน",
    desc: "การเฝ้าระวังและประเมินผลกระทบจากภัยคุกคาม",
    path: "/unit2/learn2",
  },
  {
    id: 3,
    title: "การตั้งค่าความปลอดภัยและ Digital Hygiene",
    desc: "มาตรฐานการดูแลรักษาความปลอดภัยของอุปกรณ์และข้อมูล",
    path: "/unit2/learn3",
  },
];

export default function LearnUnit2() {
  // ✅ Router helpers
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ คะแนนจากหน้า posttest (กรณีเพิ่งทำเสร็จแล้ว navigate กลับมา)
  const [posttestResult, setPosttestResult] = useState(null);

  // ✅ UI states
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("ผู้เรียน");

  // ✅ คะแนนจาก DB (ใช้โชว์ “คะแนนครั้งแรกที่ submit จริง”)
  const [dbScoreText, setDbScoreText] = useState("");

  // =========================================================
  // ✅ 1) รับคะแนนจาก location.state (ถ้ามี)
  useEffect(() => {
    const incoming = location.state?.posttestResult;
    if (incoming && typeof incoming === "object") {
      setPosttestResult(incoming);
    }
  }, [location.state]);

  // =========================================================
  // ✅ 2) init: เช็ค session + โหลด profile + โหลด “คะแนนครั้งแรก” จาก DB
  useEffect(() => {
    let mounted = true;

    const initData = async () => {
      try {
        if (!mounted) return;
        setLoading(true);

        // ✅ 2.1 session / user
        const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
        if (sessionErr) console.error("❌ getSession failed:", sessionErr);

        const user = session?.user;
        if (!user) {
          navigate("/login", { replace: true });
          return;
        }

        // ✅ 2.2 profile
        const { data: profile, error: profileErr } = await supabase
          .from("student_profiles")
          .select("first_name,last_name")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profileErr) console.error("❌ Load profile failed:", profileErr);

        if (mounted) {
          const fullName = `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim();
          setStudentName(fullName || "ผู้เรียน");
        }

        // ✅ 2.3 หา posttest active ของ Unit 2 (version ล่าสุด)
        const { data: activePosttest, error: ptErr } = await supabase
          .from("posttests")
          .select("id, version")
          .eq("unit", 2)
          .eq("is_active", true)
          .order("version", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (ptErr) console.error("❌ Load active posttest failed:", ptErr);

        if (!activePosttest?.id) {
          if (mounted) setDbScoreText("");
          return;
        }

        // ✅ 2.4 ดึง “ครั้งแรกที่ submit จริง”
        const { data: firstSubmitted, error: attErr } = await supabase
          .from("posttest_attempts")
          .select("total_score, max_score")
          .eq("user_id", user.id)
          .eq("posttest_id", activePosttest.id)
          .not("submitted_at", "is", null)
          .order("submitted_at", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (attErr) console.error("❌ Load first score failed:", attErr);

        if (mounted) {
          if (firstSubmitted) {
            setDbScoreText(`${firstSubmitted.total_score} / ${firstSubmitted.max_score}`);
          } else {
            setDbScoreText("");
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initData();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  // ✅ 3) คะแนนที่โชว์บนการ์ด
  const posttestScoreText = useMemo(() => {
    if (dbScoreText) return dbScoreText;

    if (posttestResult && typeof posttestResult.score === "number") {
      return `${posttestResult.score} / ${posttestResult.maxScore ?? ""}`;
    }

    return "";
  }, [dbScoreText, posttestResult]);

  return (
    <div className="edu-app">
      {/* ✅ Topbar */}
      <header className="edu-topbar">
        <div className="edu-topbar__inner">
          {/* ✅ Brand */}
          <div className="homebar__brand">
            <img src={logo} alt="Logo" className="homebar__logo" />
            <div className="edu-brandtext">
              <div className="edu-brandtext__title">LearnSecure</div>
              <div className="edu-brandtext__subtitle">Unit 2</div>
            </div>
          </div>

          {/* ✅ User + Logout */}
          <div className="edu-topbar__right">
            <div className="edu-userchip">
              <div className="edu-userchip__avatar">
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
              onClick={async () => {
                await supabase.auth.signOut();
                navigate("/login", { replace: true });
              }}
            >
              <FiLogOut /> ออกจากระบบ
            </button>
          </div>
        </div>
      </header>

      {/* ✅ Content */}
      <main className="edu-layout">
        {/* ✅ Hero */}
        <section className="edu-hero">
          <div className="edu-hero__card">
            <div className="edu-hero__row">
              <div className="edu-hero__headline">
                <div className="edu-hero__title">
                  Unit 2: การเรียนรู้การปกป้องข้อมูลส่วนบุคคล
                </div>

                <div className="edu-lessons__toolbar">
                  <button className="edu-btn edu-btn--back" onClick={() => navigate("/lessons")}>
                    <FiChevronLeft /> กลับ
                  </button>

                  <button
                    className="edu-btn edu-btn--ghost"
                    onClick={() => navigate("/main")}
                    style={{ marginLeft: 8 }}
                  >
                    <FiHome /> กลับหน้าหลัก
                  </button>
                </div>
              </div>

              <div className="edu-lessons__meta">
                <div className="edu-miniStat">
                  <div className="edu-miniStat__label">เรื่องย่อย</div>
                  <div className="edu-miniStat__value">4</div>
                </div>
                <div className="edu-miniStat">
                  <div className="edu-miniStat__label">Posttest</div>
                  <div className="edu-miniStat__value">1</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ✅ Lessons list */}
        <section className="edu-panel">
          <div className="edu-panel__head">
            <div className="edu-panel__title">
              <FiFileText /> เรื่องย่อยของ Unit 2
            </div>
          </div>

          <div className="edu-lessons">
            {/* ✅ เรื่องย่อย */}
            {UNIT2_TOPICS.map((t) => (
              <button
                key={t.id}
                type="button"
                className="edu-lessonCard"
                onClick={() => navigate(t.path)}
              >
                <div className="edu-lessonCard__left">
                  <div className="edu-lessonNo">{t.id}</div>
                  <div className="edu-lessonCard__meta">
                    <div className="edu-lessonCard__title">{t.title}</div>
                    <div className="edu-lessonCard__desc">{t.desc}</div>
                    <div className="edu-lessonCard__tags">
                      <span className="edu-pill edu-pill--muted">เรื่องย่อย</span>
                    </div>
                  </div>
                </div>
                <FiChevronRight className="edu-lessonCard__arrow" />
              </button>
            ))}

            {/* ✅ Posttest card */}
            <button type="button" className="edu-lessonCard" onClick={() => navigate("/unit2/posttest")}>
              <div className="edu-lessonCard__left">
                <div className="edu-lessonNo">
                  <FiCheckCircle />
                </div>
                <div className="edu-lessonCard__meta">
                  <div className="edu-lessonCard__title">แบบฝึกหัด: Unit 2</div>
                  <div className="edu-lessonCard__desc">
                    ทำแบบทดสอบหลังเรียนเพื่อบันทึกผลและปลดล็อกการเรียนต่อ
                  </div>

                  <div className="edu-lessonCard__tags">
                    <span className="edu-pill edu-pill--ok">แบบทดสอบ</span>
                    {posttestScoreText && (
                      <span className="edu-pill edu-pill--score">
                        คะแนน: {posttestScoreText}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <FiChevronRight className="edu-lessonCard__arrow" />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
