import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import logo from "../assets/logo.png";

import "../main.css";
import "../home.css";

import {
  FiBookOpen,
  FiUser,
  FiLogOut,
  FiChevronRight,
  FiClipboard,
  FiCheckCircle,
  FiHome,
  FiTrendingUp,
  FiAward,
} from "react-icons/fi";

const PASS_PERCENT = 60;
const TOTAL_UNITS = 8;

function calcPercent(total, max) {
  const safeTotal = Number(total) || 0;
  const safeMax = Number(max) || 0;

  if (safeMax <= 0) return 0;
  return Math.round((safeTotal / safeMax) * 100);
}

function parsePassMap(raw) {
  if (!raw) return new Set();

  let obj = raw;

  if (typeof raw === "string") {
    try {
      obj = JSON.parse(raw);
    } catch {
      return new Set();
    }
  }

  if (typeof obj !== "object" || obj === null) return new Set();

  const passed = new Set();

  Object.entries(obj).forEach(([key, value]) => {
    const unitNo = Number(key);
    if (!Number.isInteger(unitNo)) return;

    const isPassed =
      value === true ||
      value === "true" ||
      value === 1 ||
      value === "1";

    if (isPassed) {
      passed.add(unitNo);
    }
  });

  return passed;
}

function extractLatestAttemptByUnit(rows) {
  const latestMap = new Map();

  for (const row of rows || []) {
    const related = row?.posttests;
    const unit = Array.isArray(related) ? related[0]?.unit : related?.unit;
    const unitNo = Number(unit);

    if (!Number.isInteger(unitNo)) continue;
    if (!row?.submitted_at) continue;

    const currentTime = new Date(row.submitted_at).getTime();
    const prev = latestMap.get(unitNo);

    if (!prev) {
      latestMap.set(unitNo, row);
      continue;
    }

    const prevTime = new Date(prev.submitted_at).getTime();
    if (currentTime > prevTime) {
      latestMap.set(unitNo, row);
    }
  }

  return latestMap;
}

function buildLatestScoreMap(latestMap) {
  const result = {};

  for (const [unitNo, row] of latestMap.entries()) {
    const total = Number(row?.total_score) || 0;
    const max = Number(row?.max_score) || 0;
    const percent = calcPercent(total, max);

    result[unitNo] = {
      total,
      max,
      percent,
      submittedAt: row?.submitted_at || null,
      passed: percent >= PASS_PERCENT,
    };
  }

  return result;
}

export default function Main() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");
  const [studentProgress, setStudentProgress] = useState("อยู่ระหว่างการเรียนรู้");
  const [canTakePosttest, setCanTakePosttest] = useState(false);
  const [hasCompletedCourse, setHasCompletedCourse] = useState(false);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);

        const {
          data: { session },
          error: sessionErr,
        } = await supabase.auth.getSession();

        if (sessionErr) {
          console.error(sessionErr);
          navigate("/login", { replace: true });
          return;
        }

        const u = session?.user;

        if (!u) {
          navigate("/login", { replace: true });
          return;
        }

        // 1) ตรวจสอบข้อมูลโปรไฟล์
        const { data: profile, error: profileErr } = await supabase
          .from("student_profiles")
          .select("first_name,last_name")
          .eq("user_id", u.id)
          .maybeSingle();

        if (profileErr) {
          console.error(profileErr);
          navigate("/profile", { replace: true });
          return;
        }

        const hasProfile =
          !!profile &&
          !!String(profile.first_name || "").trim() &&
          !!String(profile.last_name || "").trim();

        if (!hasProfile) {
          navigate("/profile", { replace: true });
          return;
        }

        // 2) ตรวจสอบ pretest
        const { data: pretestResult, error: pretestErr } = await supabase
          .from("pretest_results")
          .select("id, pass_map")
          .eq("user_id", u.id)
          .maybeSingle();

        if (pretestErr) {
          console.error(pretestErr);
          navigate("/pretest", { replace: true });
          return;
        }

        if (!pretestResult) {
          navigate("/pretest", { replace: true });
          return;
        }

        // 3) โหลดผลแบบฝึกหัดท้ายบทล่าสุดของแต่ละหน่วย
        const { data: attemptRows, error: postErr } = await supabase
          .from("posttest_attempts")
          .select(`
            total_score,
            max_score,
            submitted_at,
            posttests!inner (
              unit,
              is_active
            )
          `)
          .eq("user_id", u.id)
          .not("submitted_at", "is", null)
          .eq("posttests.is_active", true);

        if (postErr) {
          console.error("posttest_attempts load error:", postErr);
        }

        // 4) ตรวจสอบผลแบบทดสอบหลังเรียน
        const { data: finalResult, error: finalErr } = await supabase
          .from("final_test_results")
          .select("first_total_score")
          .eq("user_id", u.id)
          .maybeSingle();

        if (finalErr) {
          console.error("final_test_results load error:", finalErr);
        }

        const hasFinalScore = finalResult?.first_total_score != null;

        const pretestPassedSet = parsePassMap(pretestResult.pass_map);
        const latestMap = extractLatestAttemptByUnit(attemptRows || []);
        const latestScoreMap = buildLatestScoreMap(latestMap);

        const masteredSet = new Set([...pretestPassedSet]);

        Object.entries(latestScoreMap).forEach(([unitKey, info]) => {
          const unitNo = Number(unitKey);
          if (!Number.isInteger(unitNo)) return;

          if (info?.percent >= PASS_PERCENT) {
            masteredSet.add(unitNo);
          }
        });

        const allPassed = masteredSet.size >= TOTAL_UNITS;

        if (!alive) return;

        setStudentName(
          `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim()
        );

        setHasCompletedCourse(hasFinalScore);

        if (hasFinalScore) {
          setStudentProgress("สำเร็จการศึกษาในหลักสูตรแล้ว");
          setCanTakePosttest(true);
        } else if (allPassed) {
          setStudentProgress("มีสิทธิ์เข้าสู่แบบทดสอบหลังเรียน");
          setCanTakePosttest(true);
        } else {
          setStudentProgress("อยู่ระหว่างการเรียนรู้");
          setCanTakePosttest(false);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [navigate]);

  const greet = useMemo(() => {
    if (loading) return "กำลังโหลดข้อมูล...";
    return studentName ? studentName : "ผู้เรียน";
  }, [loading, studentName]);

  const showPosttestButton = !loading && canTakePosttest;

  const assessmentButtonLabel = hasCompletedCourse
    ? "ทบทวนแบบทดสอบหลังเรียน"
    : "เข้าสู่แบบทดสอบหลังเรียน";

  const statusClass =
  studentProgress === "สำเร็จการศึกษาในหลักสูตรแล้ว"
    ? "edu-pill--ok"
    : studentProgress === "มีสิทธิ์เข้าสู่แบบทดสอบหลังเรียน"
    ? "edu-pill--warn"
    : "edu-pill--danger";

  return (
    <div className="homepage">
      <header className="navbar">
        <div className="homebar">
          <div className="homebar__brand" role="banner">
            <img src={logo} alt="LearnSecure logo" className="homebar__logo" />
            <div className="homebar__brandText">
              <div className="homebar__title">LearnSecure</div>
              <div className="homebar__sub">Learning Management Portal</div>
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
                  <span className={`edu-pill ${statusClass}`}>
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
        <section className="homehero" aria-label="หน้าหลักระบบการเรียนรู้">
          <div className="homehero__text">
            <div className="homehero__kicker">
              <FiHome style={{ marginRight: 8, verticalAlign: "middle" }} />
              หน้าหลักระบบการเรียนรู้
            </div>

            <h1 className="homehero__title">ยินดีต้อนรับสู่เส้นทางการเรียนรู้ของคุณ</h1>

            {loading ? (
              <div className="homehero__desc">
                <span className="homeload" aria-hidden="true" />
                กำลังตรวจสอบข้อมูลผู้เรียนและความก้าวหน้า...
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
                <FiBookOpen aria-hidden="true" />
                เข้าสู่บทเรียน
                <FiChevronRight aria-hidden="true" />
              </button>

              {showPosttestButton && (
                <button
                  type="button"
                  className="homebtn homebtn--success"
                  onClick={() => navigate("/final")}
                >
                  <FiClipboard aria-hidden="true" />
                  {assessmentButtonLabel}
                  <FiChevronRight aria-hidden="true" />
                </button>
              )}
            </div>

            {!loading && !canTakePosttest && (
              <p className="homehero__desc" style={{ marginTop: 12 }}>
                ผู้เรียนจะสามารถเข้าสู่
                <b> แบบทดสอบหลังเรียน </b>
                ได้เมื่อเรียนและผ่านแบบฝึกหัดท้ายบทครบทุกหน่วยการเรียนรู้
              </p>
            )}

            {!loading && hasCompletedCourse && (
              <p className="homehero__desc" style={{ marginTop: 12 }}>
                คุณได้ทำ
                <b> แบบทดสอบหลังเรียน </b>
                เรียบร้อยแล้ว สามารถกดปุ่มด้านบนเพื่อกลับเข้าไปทบทวนได้อีกครั้ง
              </p>
            )}
          </div>

          <div className="homehero__strip" aria-label="เมนูลัดสำหรับผู้เรียน">
            <button
              type="button"
              className="quick"
              onClick={() => navigate("/dashboard")}
            >
              <span className="quick__icon" aria-hidden="true">
                <FiTrendingUp />
              </span>
              <span className="quick__text">
                <span className="quick__title">ผลการเรียนรู้</span>
                <span className="quick__desc">
                  ดูภาพรวมคะแนน ความก้าวหน้า และพัฒนาการของตนเอง
                </span>
              </span>
              <FiChevronRight className="quick__arrow" aria-hidden="true" />
            </button>

            <button
              type="button"
              className="quick"
              onClick={() => navigate("/lessons")}
            >
              <span className="quick__icon" aria-hidden="true">
                <FiBookOpen />
              </span>
              <span className="quick__text">
                <span className="quick__title">บทเรียนทั้งหมด</span>
                <span className="quick__desc">
                  เนื้อหาการเรียนรู้จำนวน 8 หน่วย
                </span>
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
                <span className="quick__title">ข้อมูลผู้เรียน</span>
                <span className="quick__desc">
                  ตรวจสอบและแก้ไขข้อมูลส่วนตัวสำหรับการใช้งานระบบ
                </span>
              </span>
              <FiChevronRight className="quick__arrow" aria-hidden="true" />
            </button>

          </div>
        </section>
      </main>
    </div>
  );
}