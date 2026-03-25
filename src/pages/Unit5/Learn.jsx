import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import logo from "../../assets/logo.png";
import "../../main.css";

import {
  FiChevronLeft,
  FiChevronRight,
  FiCheckCircle,
  FiFileText,
  FiHome,
  FiLogOut,
  FiUser,
  FiCpu,
  FiTrendingUp,
  FiAlertCircle,
} from "react-icons/fi";

const PASS_PERCENT = 60;

const UNIT5_TOPICS = [
  {
    id: 1,
    title: "การประเมินความน่าเชื่อถือของแหล่งข่าวออนไลน์",
    desc: "เช็คแหล่งข่าว: ใครเป็นเจ้าของเว็บ / มีตัวตนจริงไหม / น่าเชื่อถือแค่ไหน",
    path: "/unit5/learn1",
  },
  {
    id: 2,
    title: "การสังเกตอคติและการชี้นำในเนื้อหาข่าว",
    desc: "จับคำชี้นำ/อารมณ์/เลือกข้าง และดูว่าข่าวพาเราเชื่อแบบไหน",
    path: "/unit5/learn2",
  },
  {
    id: 3,
    title: "การทำความเข้าใจเจตนาของผู้เผยแพร่เนื้อหา",
    desc: "แยกเจตนา: ให้ข้อมูล / ขายของ / ปั่นกระแส / โจมตี / ชวนแชร์",
    path: "/unit5/learn3",
  },
  {
    id: 4,
    title: "การแยกแยะประเภทของข่าวและข้อมูลออนไลน์",
    desc: "แยกข่าวจริง/ข่าวลือ/โฆษณาแฝง/ความเห็น/คอนเทนต์บันเทิง",
    path: "/unit5/learn4",
  },
  {
    id: 5,
    title: "ขั้นตอนการตรวจสอบความน่าเชื่อถือของข้อมูล",
    desc: "ทำเป็นขั้น: ตรวจแหล่งที่มา → เช็คหลักฐาน → เทียบหลายแหล่ง → ดูวันที่/บริบท",
    path: "/unit5/learn5",
  },
  {
    id: 6,
    title: "การสรุปและตัดสินใจจากการตรวจสอบข้อมูล",
    desc: "สรุปผลการตรวจแล้วตัดสินใจ: เชื่อ/ไม่เชื่อ/รอหลักฐาน/ไม่แชร์ต่อ",
    path: "/unit5/learn6",
  },
];

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

export default function LearnUnit5() {
  const location = useLocation();
  const navigate = useNavigate();

  const [posttestResult, setPosttestResult] = useState(null);

  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("ผู้เรียน");

  const [passedFromPretest, setPassedFromPretest] = useState(false);
  const [firstScoreText, setFirstScoreText] = useState("");
  const [latestScoreText, setLatestScoreText] = useState("");
  const [latestPassed, setLatestPassed] = useState(false);

  const [aiAnalysisData, setAiAnalysisData] = useState({
    summary: "",
    strengths: [],
    weaknesses: [],
  });

  useEffect(() => {
    const incoming = location.state?.posttestResult;
    if (incoming && typeof incoming === "object") {
      setPosttestResult(incoming);
    }
  }, [location.state]);

  useEffect(() => {
    let mounted = true;

    const initData = async () => {
      try {
        if (!mounted) return;
        setLoading(true);

        const {
          data: { session },
          error: sessionErr,
        } = await supabase.auth.getSession();

        if (sessionErr) {
          console.error("❌ getSession failed:", sessionErr);
        }

        const user = session?.user;
        if (!user) {
          navigate("/login", { replace: true });
          return;
        }

        const { data: profile, error: profileErr } = await supabase
          .from("student_profiles")
          .select("first_name,last_name")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profileErr) {
          console.error("❌ Load profile failed:", profileErr);
        }

        if (mounted) {
          const fullName = `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim();
          setStudentName(fullName || "ผู้เรียน");
        }

        const { data: pretestRow, error: pretestErr } = await supabase
          .from("pretest_results")
          .select("pass_map")
          .eq("user_id", user.id)
          .maybeSingle();

        if (pretestErr) {
          console.error("❌ Load pretest result failed:", pretestErr);
        }

        const pretestPassedSet = parsePassMap(pretestRow?.pass_map);

        if (mounted) {
          setPassedFromPretest(pretestPassedSet.has(5));
        }

        const { data: activePosttest, error: ptErr } = await supabase
          .from("posttests")
          .select("id, version")
          .eq("unit", 5)
          .eq("is_active", true)
          .order("version", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (ptErr) {
          console.error("❌ Load active posttest failed:", ptErr);
        }

        if (!activePosttest?.id) {
          if (mounted) {
            setFirstScoreText("");
            setLatestScoreText("");
            setLatestPassed(false);
            setAiAnalysisData({
              summary: "",
              strengths: [],
              weaknesses: [],
            });
          }
          return;
        }

        const { data: firstSubmitted, error: firstErr } = await supabase
          .from("posttest_attempts")
          .select("total_score, max_score, pass, submitted_at")
          .eq("user_id", user.id)
          .eq("posttest_id", activePosttest.id)
          .not("submitted_at", "is", null)
          .order("submitted_at", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (firstErr) {
          console.error("❌ Load first score failed:", firstErr);
        }

        const { data: latestSubmitted, error: latestErr } = await supabase
          .from("posttest_attempts")
          .select("id, total_score, max_score, pass, submitted_at, ai_summary")
          .eq("user_id", user.id)
          .eq("posttest_id", activePosttest.id)
          .not("submitted_at", "is", null)
          .order("submitted_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (latestErr) {
          console.error("❌ Load latest score failed:", latestErr);
        }

        if (mounted) {
          setFirstScoreText(
            firstSubmitted
              ? `${firstSubmitted.total_score} / ${firstSubmitted.max_score}`
              : ""
          );

          setLatestScoreText(
            latestSubmitted
              ? `${latestSubmitted.total_score} / ${latestSubmitted.max_score}`
              : ""
          );

          const latestPercent = calcPercent(
            latestSubmitted?.total_score,
            latestSubmitted?.max_score
          );

          setLatestPassed(latestPercent >= PASS_PERCENT);

          let aiParsed = { summary: "", strengths: [], weaknesses: [] };

          try {
            if (
              latestSubmitted?.ai_summary &&
              typeof latestSubmitted.ai_summary === "string" &&
              latestSubmitted.ai_summary.startsWith("{")
            ) {
              aiParsed = JSON.parse(latestSubmitted.ai_summary);
            } else {
              aiParsed.summary = latestSubmitted?.ai_summary || "";
            }
          } catch (e) {
            aiParsed.summary = latestSubmitted?.ai_summary || "";
          }

          setAiAnalysisData({
            summary:
              aiParsed.summary ||
              (latestPercent >= PASS_PERCENT
                ? "คุณมีความเข้าใจเรื่องการรู้เท่าทันข่าวและข้อมูลออนไลน์ในระดับที่ดี สามารถประเมินความน่าเชื่อถือของข้อมูล แยกเจตนาของผู้เผยแพร่ และตัดสินใจก่อนเชื่อหรือแชร์ได้อย่างเหมาะสม"
                : "คุณเริ่มเข้าใจพื้นฐานของการตรวจสอบข่าวและข้อมูลแล้ว แต่ยังควรทบทวนเรื่องการประเมินแหล่งข่าว การสังเกตอคติ การแยกประเภทเนื้อหา และการตัดสินใจก่อนแชร์เพิ่มเติม"),
            strengths: Array.isArray(aiParsed.strengths) ? aiParsed.strengths : [],
            weaknesses: Array.isArray(aiParsed.weaknesses)
              ? aiParsed.weaknesses.map((w) =>
                  typeof w === "string"
                    ? { topic: w, feedback: "" }
                    : {
                        topic: w.topic || "",
                        feedback: w.feedback || "",
                      }
                )
              : [],
          });
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

  const latestScoreTextForDisplay = useMemo(() => {
    if (
      posttestResult &&
      typeof posttestResult.score === "number" &&
      typeof posttestResult.maxScore === "number"
    ) {
      return `${posttestResult.score} / ${posttestResult.maxScore}`;
    }
    return latestScoreText;
  }, [latestScoreText, posttestResult]);

  const latestPassedForDisplay = useMemo(() => {
    if (
      posttestResult &&
      typeof posttestResult.score === "number" &&
      typeof posttestResult.maxScore === "number"
    ) {
      const percent = calcPercent(posttestResult.score, posttestResult.maxScore);
      return percent >= PASS_PERCENT;
    }

    return latestPassed;
  }, [latestPassed, posttestResult]);

  return (
    <div className="edu-app">
      <style>{`
        .edu-ai-feedback-container {
          margin-top: 2.5rem;
          padding: 1.5rem;
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid #e0e7ff;
          box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.1);
        }
        .ai-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          color: #4f46e5;
        }
        .ai-header h3 { margin: 0; font-size: 1.25rem; font-weight: 700; }
        .ai-summary-box {
          background: #f8faff;
          padding: 1rem;
          border-radius: 12px;
          border-left: 4px solid #4f46e5;
          margin-bottom: 1.5rem;
          font-size: 0.95rem;
          line-height: 1.5;
        }
        .ai-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        @media (max-width: 768px) {
          .ai-grid {
            grid-template-columns: 1fr;
          }
        }
        .ai-card {
          padding: 1.25rem;
          border-radius: 16px;
          height: 100%;
        }
        .ai-card--positive {
          background: #f0fdf4;
          border: 1px solid #dcfce7;
        }
        .ai-card--negative {
          background: #fff7ed;
          border: 1px solid #ffedd5;
        }
        .ai-card-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
          font-size: 1rem;
        }
        .ai-list {
          margin: 0;
          padding-left: 1.2rem;
          font-size: 0.9rem;
          line-height: 1.5;
          color: #374151;
        }
        .ai-list li {
          margin-bottom: 0.5rem;
        }
        .ai-empty-state {
          text-align: center;
          padding: 2rem;
          color: #9ca3af;
          border: 2px dashed #e5e7eb;
          border-radius: 12px;
        }
      `}</style>

      <header className="edu-topbar">
        <div className="edu-topbar__inner">
          <div className="homebar__brand">
            <img src={logo} alt="Logo" className="homebar__logo" />
            <div className="edu-brandtext">
              <div className="edu-brandtext__title">LearnSecure</div>
              <div className="edu-brandtext__subtitle">Unit 5</div>
            </div>
          </div>

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

      <main className="edu-layout">
        <section className="edu-hero">
          <div className="edu-hero__card">
            <div className="edu-hero__row">
              <div className="edu-hero__headline">
                <div className="edu-hero__title">Unit 5: การรู้เท่าทันข่าวและข้อมูลออนไลน์</div>

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
                  <div className="edu-miniStat__value">{UNIT5_TOPICS.length}</div>
                </div>
                <div className="edu-miniStat">
                  <div className="edu-miniStat__label">Posttest</div>
                  <div className="edu-miniStat__value">1</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="edu-panel">
          <div className="edu-panel__head">
            <div className="edu-panel__title">
              <FiFileText /> เรื่องย่อยของ Unit 5
            </div>
          </div>

          <div className="edu-lessons">
            {UNIT5_TOPICS.map((t) => (
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

            <button
              type="button"
              className="edu-lessonCard"
              onClick={() => navigate("/unit5/posttest")}
            >
              <div className="edu-lessonCard__left">
                <div className="edu-lessonNo">
                  <FiCheckCircle />
                </div>

                <div className="edu-lessonCard__meta edu-lessonCard__meta--posttest">
                  {passedFromPretest && (
                    <div className="edu-cornerBadge">ผ่านจาก Pretest</div>
                  )}

                  <div className="edu-lessonCard__title">แบบฝึกหัด: Unit 5</div>
                  <div className="edu-lessonCard__desc">
                    ทำแบบทดสอบหลังเรียนเพื่อบันทึกผลและปลดล็อกการเรียนต่อ
                  </div>

                  <div className="edu-lessonCard__tags" style={{ marginBottom: 10 }}>
                    <span
                      className={`edu-pill ${
                        latestPassedForDisplay ? "edu-pill--pass" : "edu-pill--fail"
                      }`}
                    >
                      {latestPassedForDisplay ? "ผ่าน" : "ยังไม่ผ่าน"}
                    </span>
                  </div>

                  {(firstScoreText || latestScoreTextForDisplay) && (
                    <div className="edu-scoreBox">
                      {firstScoreText && (
                        <div className="edu-scoreRow">
                          <span className="edu-scoreRow__label">คะแนนครั้งแรก</span>
                          <span className="edu-scoreRow__value">{firstScoreText}</span>
                        </div>
                      )}

                      {latestScoreTextForDisplay && (
                        <div className="edu-scoreRow">
                          <span className="edu-scoreRow__label">คะแนนล่าสุด</span>
                          <span className="edu-scoreRow__value">
                            {latestScoreTextForDisplay}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <FiChevronRight className="edu-lessonCard__arrow" />
            </button>

            <div className="insight-force-fullwidth cyber-insight">
              <section className="insight-outer-frame">
                <div className="insight-header-box">
                  <div className="insight-tag">
                    <FiCpu className="icon-spin" />
                    <span>AI GENERATED ANALYSIS</span>
                  </div>
                  <h2 className="insight-main-title">วิเคราะห์ผลการเรียนรู้รายบุคคล</h2>
                </div>

                {!latestScoreTextForDisplay ? (
                  <div className="insight-empty-state">
                    <p>ระบบกำลังรอข้อมูลเพื่อเริ่มการวิเคราะห์...</p>
                  </div>
                ) : (
                  <div className="insight-inner-stack">
                    <div className="inner-block summary-block">
                      <div className="block-label">Executive Summary</div>
                      <p className="summary-text">
                        {aiAnalysisData.summary || "กำลังประมวลผล..."}
                      </p>
                    </div>

                    <div className="side-by-side">
                      <div className="inner-block strength-block">
                        <div className="block-header">
                          <FiTrendingUp />
                          <h3>จุดที่ทำได้ดีและทักษะที่โดดเด่น</h3>
                        </div>
                        <div className="strength-list">
                          {aiAnalysisData.strengths.length > 0 ? (
                            aiAnalysisData.strengths.map((s, i) => (
                              <div key={i} className="strength-item">
                                <FiCheckCircle /> <span>{s}</span>
                              </div>
                            ))
                          ) : (
                            <div className="strength-item">
                              <span>วิเคราะห์ข้อมูลจุดเด่น...</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="inner-block improve-block">
                        <div className="block-header">
                          <FiAlertCircle />
                          <h3>สิ่งที่ควรพัฒนาและคำแนะนำเพิ่มเติม</h3>
                        </div>
                        <div className="improve-list">
                          {aiAnalysisData.weaknesses.length > 0 ? (
                            aiAnalysisData.weaknesses.map((w, i) => (
                              <div key={i} className="improve-item">
                                <div className="topic-text">{w.topic}</div>
                                {w.feedback && (
                                  <div className="feedback-text">💡 {w.feedback}</div>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="improve-item">
                              <span>วิเคราะห์ข้อมูลที่ควรพัฒนา...</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}