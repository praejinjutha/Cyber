import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import logo from "../assets/logo.png";

import "../main.css";
import "../dashboard.css";

import {
  FiUser,
  FiLogOut,
  FiHome,
  FiTrendingUp,
  FiLock,
  FiEdit,
  FiAward,
  FiRefreshCw,
  FiMinusCircle,
} from "react-icons/fi";

export default function DashScore() {
  const navigate = useNavigate();

  // ✅ 1) State สำหรับข้อมูลจาก DB
  const [studentName, setStudentName] = useState("ผู้เรียน");
  const [loading, setLoading] = useState(true);

  // ✅ เก็บคะแนน posttest “ครั้งแรกที่ submit” ของแต่ละหน่วย (1-8)
  // รูปแบบ: { 1: { score, max }, 2: { score, max }, ... }
  const [scoresByUnit, setScoresByUnit] = useState({});

  // ✅ คะแนน Pretest รวม
  const [programPre, setProgramPre] = useState({
    done: false,
    score: null,
    max: 48,
  });

  // ✅ คะแนน Final “ครั้งแรก”
  const [programPost, setProgramPost] = useState({
    done: false,
    score: null,
    max: 48,
  });

  // ✅ 3) Logic ดึงข้อมูล Profile + คะแนนจาก Database
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);

        const {
          data: { session },
          error: sessionErr,
        } = await supabase.auth.getSession();

        if (sessionErr) {
          console.error("getSession error:", sessionErr);
        }

        if (!session?.user) {
          navigate("/login", { replace: true });
          return;
        }

        const userId = session.user.id;

        // -------------------------
        // 1) ดึง Profile
        // -------------------------
        const { data: profile, error: profileErr } = await supabase
          .from("student_profiles")
          .select("first_name, last_name")
          .eq("user_id", userId)
          .maybeSingle();

        if (profileErr) {
          console.error("profile load error:", profileErr);
        }

        if (mounted && profile) {
          setStudentName(
            `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() ||
              "ผู้เรียน"
          );
        }

        // -------------------------
        // 2) ดึงคะแนน Pretest รวม
        // -------------------------
        const { data: pretestResult, error: pretestErr } = await supabase
          .from("pretest_results")
          .select("total_score")
          .eq("user_id", userId)
          .maybeSingle();

        if (pretestErr) {
          console.error("pretest result load error:", pretestErr);
        }

        if (mounted) {
          setProgramPre({
            done: pretestResult?.total_score != null,
            score: pretestResult?.total_score ?? null,
            max: 48,
          });
        }

        // -------------------------
        // 3) ดึงคะแนน Final “ครั้งแรก”
        // -------------------------
        const { data: finalResult, error: finalErr } = await supabase
          .from("final_test_results")
          .select("first_total_score")
          .eq("user_id", userId)
          .maybeSingle();

        if (finalErr) {
          console.error("final result load error:", finalErr);
        }

        if (mounted) {
          setProgramPost({
            done: finalResult?.first_total_score != null,
            score: finalResult?.first_total_score ?? null,
            max: 48,
          });
        }

        // -------------------------
        // 4) ดึงคะแนน Posttest รายหน่วย “ครั้งแรก”
        // -------------------------
        const scoresMap = {};

        for (let unit = 1; unit <= 8; unit++) {
          const { data: posttest, error: posttestErr } = await supabase
            .from("posttests")
            .select("id")
            .eq("unit", unit)
            .eq("is_active", true)
            .maybeSingle();

          if (posttestErr) {
            console.error(`posttest load error (unit ${unit}):`, posttestErr);
            continue;
          }

          if (!posttest?.id) continue;

          const { data: firstAttempt, error: attemptErr } = await supabase
            .from("posttest_attempts")
            .select("total_score, max_score, submitted_at")
            .eq("user_id", userId)
            .eq("posttest_id", posttest.id)
            .not("submitted_at", "is", null)
            .order("submitted_at", { ascending: true })
            .limit(1)
            .maybeSingle();

          if (attemptErr) {
            console.error(`attempt load error (unit ${unit}):`, attemptErr);
            continue;
          }

          if (firstAttempt) {
            scoresMap[unit] = {
              score: firstAttempt.total_score,
              max: firstAttempt.max_score,
            };
          }
        }

        if (mounted) {
          setScoresByUnit(scoresMap);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  // ✅ 4) จัดการรายการบทเรียน 1-8
  const unitPost = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const unitNum = i + 1;
      const s = scoresByUnit[unitNum];

      return {
        unit: unitNum,
        done: !!s,
        score: s?.score ?? null,
        max: s?.max ?? 10,
        pretestPassed: unitNum === 1 ? true : false,
      };
    });
  }, [scoresByUnit]);

  // UI Helpers
  const doneUnits = useMemo(
    () => unitPost.filter((u) => u.done).length,
    [unitPost]
  );
  const totalUnits = 8;
  const overallProgress = Math.round((doneUnits / totalUnits) * 100);

  const nextUnit = useMemo(
    () => unitPost.find((u) => !u.done)?.unit ?? null,
    [unitPost]
  );

  const compareReady = Boolean(programPre.done && programPost.done);
  const compareDelta = (programPost.score ?? 0) - (programPre.score ?? 0);
  const compareStatusText = !programPre.done
    ? "ต้องทำ Pretest ก่อน"
    : !programPost.done
    ? "รอคะแนน Final เพื่อสรุปความพัฒนา"
    : "สรุปความพัฒนาแล้ว";

  const comparePct = useMemo(() => {
    if (!programPre.done || !programPost.done) return null;

    const preScore = Number(programPre.score || 0);
    const postScore = Number(programPost.score || 0);
    const preMax = Number(programPre.max || 0);
    const postMax = Number(programPost.max || 0);

    if (preMax <= 0 || postMax <= 0) return null;

    const prePercent = (preScore / preMax) * 100;
    const postPercent = (postScore / postMax) * 100;
    const diffPct = Math.round((postPercent - prePercent) * 100) / 100;

    return {
      prePercent,
      postPercent,
      diffPct,
    };
  }, [programPre, programPost]);

  // ✅ Banner ให้กำลังใจ โดยไม่แตะ logic หลัก
const bannerConfig = useMemo(() => {
  if (!compareReady) {
    return {
      title: "ยังไม่สามารถสรุปผลการเปรียบเทียบได้",
      sub: "ต้องมีคะแนน Pretest และ Final ครบทั้งสองส่วน",
      icon: <FiLock aria-hidden="true" />,
      className: "dashBanner dashBanner--locked",
    };
  }

  const diffPct = Number(comparePct?.diffPct ?? 0).toFixed(2);
  const diffScore = Number(compareDelta ?? 0).toFixed(2);

  if (compareDelta > 0) {
    return {
      title: `ผลการประเมินเพิ่มขึ้น +${diffPct}%`,
      sub: `คะแนนเพิ่มขึ้น ${diffScore} คะแนน เมื่อเทียบกับก่อนเรียน`,
      icon: <FiAward aria-hidden="true" />,
      className: "dashBanner dashBanner--up",
    };
  }

  if (compareDelta === 0) {
    return {
      title: "ผลการประเมินคงที่ (0.00%)",
      sub: "คะแนนก่อนและหลังเรียนอยู่ในระดับเดียวกัน",
      icon: <FiMinusCircle aria-hidden="true" />,
      className: "dashBanner dashBanner--same",
    };
  }

  return {
    title: `ผลการประเมินลดลง ${diffPct}%`,
    sub: `คะแนนลดลง ${diffScore} คะแนน เมื่อเทียบกับก่อนเรียน`,
    icon: <FiRefreshCw aria-hidden="true" />,
    className: "dashBanner dashBanner--down",
  };
}, [compareReady, compareDelta, comparePct]);

  const primaryCTA = { label: "กลับหน้าหลัก", to: "/main" };

  return (
    <div className="edu-app">
      <header className="edu-topbar">
        <div className="edu-topbar__inner">
          <div className="homebar__brand">
            <img src={logo} alt="Logo" className="homebar__logo" />
            <div className="edu-brandtext">
              <div className="edu-brandtext__title">LearnSecure</div>
              <div className="edu-brandtext__subtitle">Dashboard</div>
            </div>
          </div>

          <div className="edu-topbar__right">
            <div className="edu-userchip">
              <div className="edu-userchip__avatar">
                <FiUser />
              </div>
              <div className="edu-userchip__meta">
                <div className="edu-userchip__name">
                  {loading ? "..." : studentName}
                </div>
              </div>
            </div>

            <button
              className="edu-btn edu-btn--danger"
              onClick={() =>
                supabase.auth.signOut().then(() => navigate("/login"))
              }
            >
              <FiLogOut /> ออกจากระบบ
            </button>
          </div>
        </div>
      </header>

      <main className="edu-layout">
        <section className="edu-hero">
          <div className="edu-hero__card">
            <div className="edu-hero__header">
              <div className="edu-hero__title">การติดตามการเรียนรู้</div>

              <button
                className="edu-btn edu-btn--ghost"
                type="button"
                onClick={() => navigate("/main")}
              >
                <FiHome aria-hidden="true" /> กลับหน้าหลัก
              </button>
            </div>
          </div>
        </section>

        <div className="dash dash--score">
          <div className="dash__grid dash__grid--score">
            {/* 1) Pretest */}
            <section className="dashCard dashCard--pre">
              <div className="dashCard__head">
                <h2 className="dashCard__title">1) Pretest รวม</h2>
                <span className="dashPill">
                  {programPre.done ? "ทำแล้ว" : "ยังไม่ทำ"}
                </span>
              </div>

              <div className="dashBar">
                <div className="dashHint">
                  {programPre.done
                    ? `คะแนน: ${programPre.score}/${programPre.max}`
                    : "ต้องทำก่อนเริ่มเรียน"}
                </div>

                <div className="dashBar__track">
                  <div
                    className="dashBar__fill"
                    style={{
                      width: `${
                        programPre.done && programPre.score != null
                          ? (programPre.score / programPre.max) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </section>

            {/* 2) Posttest รายหน่วย */}
            <section className="dashCard dashCard--post">
              <div className="dashCard__head">
                <h2 className="dashCard__title">2) แบบฝึกหัดท้ายบท</h2>
                <span className="dashHint">ทำแล้ว {doneUnits}/8 บท</span>
              </div>

              <ol className="dashSteps">
                {unitPost.map((u) => (
                  <li key={u.unit} className={`dashStep ${u.done ? "is-done" : ""}`}>
                    <div className="dashStep__num">{u.unit}</div>
                    <div className="dashStep__body">
                      <div className="dashStep__title">หน่วยที่ {u.unit}</div>
                      <div className={`dashStep__meta ${u.done ? "is-done" : ""}`}>
                        {u.done ? `ทำแล้ว • ${u.score}/${u.max}` : "ยังไม่ทำ"}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {/* 3) การประเมิน */}
            <section className="dashCard">
              <div className="dashCard__head">
                <h2 className="dashCard__title">3) การประเมิน</h2>
                <span className="dashPill">
                  {programPost.done ? "ทำแล้ว" : "ยังไม่ทำ"}
                </span>
              </div>

              <div className="dashList">
                <div className="dashList__row">
                  <div>
                    <div className="dashList__title">Post-test</div>
                    <div className="dashList__desc">
                      แบบทดสอบรวบยอดหลังเรียนครบทุกบท
                      <span>เพื่อวัดผลรวมทั้งหลักสูตร</span>
                    </div>
                  </div>

                  <Link className="dashMiniLink" to="/final">
                    <FiEdit />
                  </Link>
                </div>

                {/* <div className="dashList__row">
                  <div>
                    <div className="dashList__title">ความพึงพอใจต่อระบบ</div>
                    <div className="dashList__desc">
                      ประเมินด้านการใช้งาน ความน่าสนใจ{" "}
                      <span>และประโยชน์ที่ได้รับ</span>
                    </div>
                  </div>

                  <Link className="dashBtn dashBtn--solid" to="/survey">
                    <FiEdit />
                  </Link>
                </div> */}
              </div>
            </section>

            {/* 4) Compare */}
            <section
              className={`dashCard dashCard--compare ${
                compareReady ? "" : "is-locked"
              }`}
            >
              <div className="dashCard__head">
                <h2 className="dashCard__title">
                  <FiTrendingUp
                    aria-hidden="true"
                    style={{ marginRight: 8, verticalAlign: "-2px" }}
                  />
                  4) เปรียบเทียบผลก่อน–หลัง (Pretest vs Final)
                </h2>

                {compareReady ? (
                  <span className="dashPill">พร้อมสรุป</span>
                ) : (
                  <span className="dashPill dashPill--muted">
                    <FiLock
                      aria-hidden="true"
                      style={{ marginRight: 6, verticalAlign: "-2px" }}
                    />
                    รอผล
                  </span>
                )}
              </div>

              <p className="dashCard__desc">{compareStatusText}</p>

              <div className={bannerConfig.className}>
                <div className="dashBanner__icon">{bannerConfig.icon}</div>
                <div className="dashBanner__content">
                  <div className="dashBanner__title">{bannerConfig.title}</div>
                  <div className="dashBanner__sub">{bannerConfig.sub}</div>
                </div>
              </div>

              <div className="dashCompare">
                <div className="dashCompare__row">
                  <div className="dashCompare__label">Pretest</div>
                  <div className="dashCompare__value">
                    {programPre.done ? `${programPre.score}/${programPre.max}` : "—"}
                  </div>
                </div>

                <div className="dashCompare__row">
                  <div className="dashCompare__label">Final</div>
                  <div className="dashCompare__value">
                    {programPost.done
                      ? `${programPost.score}/${programPost.max}`
                      : "รอคะแนน"}
                  </div>
                </div>

                <div className="dashCompare__divider" />

                
                
              </div>

              {!compareReady && (
                <div className="dashNote">
                  *ระบบจะคำนวณ “ความพัฒนา” ให้หลังจากมีคะแนน <b>Final</b> แล้วเท่านั้น
                </div>
              )}

              {compareReady && (
                <div className="dashActions">
                
                  
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}