import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import logo from "../assets/logo.png";

import "../main.css";
import "../lesson.css";

import {
  FiUser,
  FiLogOut,
  FiActivity,
  FiHome,
  FiPlay,
  FiLock,
  FiCheck,
  FiCheckCircle,
  FiBarChart2,
  FiChevronRight,
} from "react-icons/fi";

/* =========================================================
   CONFIG
========================================================= */
const PASS_PERCENT = 80;
const TOTAL_UNITS = 8;

/* =========================================================
   LESSON DATA
========================================================= */
const LESSONS = [
  {
    no: 1,
    title: "การคุ้มครองข้อมูลส่วนบุคคลและความปลอดภัยบัญชี",
    desc: "การตั้งค่าความเป็นส่วนตัว การจัดการสิทธิ์ และการป้องกันบัญชีผู้ใช้",
  },
  {
    no: 2,
    title: "การปฏิบัติความปลอดภัยทางเทคนิคพื้นฐาน",
    desc: "ภัยคุกคามไซเบอร์พื้นฐาน การตั้งค่าความปลอดภัย และ digital hygiene",
  },
  {
    no: 3,
    title: "การจัดการรอยเท้าดิจิทัลและตัวตนออนไลน์",
    desc: "ผลกระทบของการโพสต์ การจัดการโปรไฟล์ และภาพลักษณ์ดิจิทัล",
  },
  {
    no: 4,
    title: "การสื่อสารและมารยาทดิจิทัล",
    desc: "การสื่อสารอย่างเหมาะสม การลดความขัดแย้ง และการเคารพผู้อื่นออนไลน์",
  },
  {
    no: 5,
    title: "การรู้เท่าทันข่าวและข้อมูลออนไลน์",
    desc: "การตรวจสอบแหล่งข่าว วิเคราะห์อคติ และแยกแยะข้อมูลเท็จ",
  },
  {
    no: 6,
    title: "การตระหนักรู้ถึงสุขภาวะดิจิทัลและความปลอดภัย",
    desc: "การจัดการเวลาใช้สื่อ ดูแลสุขภาพกายใจ และสร้างสมดุลชีวิตดิจิทัล",
  },
  {
    no: 7,
    title: "การรู้เท่าทันเชิงพาณิชย์และสิทธิผู้บริโภคออนไลน์",
    desc: "โฆษณาออนไลน์ ธุรกรรมเสี่ยง และการเข้าใจเงื่อนไขแพลตฟอร์ม",
  },
  {
    no: 8,
    title: "สมรรถนะร่วมเชิงวิเคราะห์และจริยธรรมดิจิทัล",
    desc: "การคิดวิเคราะห์เนื้อหาออนไลน์ จริยธรรมดิจิทัล และการใช้ AI อย่างรับผิดชอบ",
  },
];

/* =========================================================
   HELPERS
========================================================= */
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

/**
 * เอา attempt ล่าสุดของแต่ละ unit
 * สำคัญ: ใช้ submitted_at ล่าสุดเท่านั้น
 */
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

export default function Lessons() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");
  const [hoveredUnitNo, setHoveredUnitNo] = useState(null);

  const [pretestPassedSet, setPretestPassedSet] = useState(new Set());
  const [latestScoreMap, setLatestScoreMap] = useState({});

  const goUnitByLessonNo = (lessonNo) => {
    const n = Math.min(TOTAL_UNITS, Math.max(1, Number(lessonNo || 1)));
    navigate(n === 1 ? "/unit1/learn" : `/unit${n}/learn`);
  };

  useEffect(() => {
    let alive = true;

    const loadData = async () => {
      try {
        setLoading(true);

        const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
        if (sessionErr) {
          console.error("getSession error:", sessionErr);
          return;
        }

        const user = sessionData.session?.user;
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
          console.error("profile load error:", profileErr);
        }

        if (alive && profile) {
          setStudentName(`${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim());
        }

        // 1) โหลดผล pretest
        const { data: pretestRow, error: pretestErr } = await supabase
          .from("pretest_results")
          .select("id, pass_map")
          .eq("user_id", user.id)
          .maybeSingle();

        if (pretestErr) {
          console.error("pretest_results load error:", pretestErr);
        }

        if (!pretestRow) {
          navigate("/pretest", { replace: true });
          return;
        }

        const realPretestPassed = parsePassMap(pretestRow?.pass_map);

        // 2) โหลด posttest attempts ทั้งหมดของ user
        // แล้วคัด "ครั้งล่าสุด" ของแต่ละ unit
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
          .eq("user_id", user.id)
          .not("submitted_at", "is", null)
          .eq("posttests.is_active", true);

        if (postErr) {
          console.error("posttest_attempts load error:", postErr);
        }

        const latestMap = extractLatestAttemptByUnit(attemptRows || []);
        const scoreMap = buildLatestScoreMap(latestMap);

        if (!alive) return;

        setPretestPassedSet(realPretestPassed);
        setLatestScoreMap(scoreMap);
      } finally {
        if (alive) setLoading(false);
      }
    };

    loadData();

    return () => {
      alive = false;
    };
  }, [navigate]);

  /**
   * หน่วยที่ผ่าน = ผ่านจาก pretest
   * หรือคะแนน posttest "ล่าสุด" >= 60
   */
  const masteredSet = useMemo(() => {
    const passed = new Set([...pretestPassedSet]);

    Object.entries(latestScoreMap).forEach(([unitKey, info]) => {
      const unitNo = Number(unitKey);
      if (!Number.isInteger(unitNo)) return;

      if (info?.percent >= PASS_PERCENT) {
        passed.add(unitNo);
      }
    });

    return passed;
  }, [pretestPassedSet, latestScoreMap]);

  /**
   * หา "บทแรกที่ยังไม่ผ่าน"
   * อันนี้คือหน่วยที่จะต้องเปิดให้เรียนต่อ
   */
  const nextTarget = useMemo(() => {
    for (const lesson of LESSONS) {
      if (!masteredSet.has(lesson.no)) {
        return lesson.no;
      }
    }
    return null;
  }, [masteredSet]);

  /**
   * สถานะของแต่ละบท
   * - completed = ผ่านแล้ว
   * - active = บทปัจจุบันที่ควรเรียน/ทำต่อ
   * - locked = ยังไม่ถึงคิว
   */
  const roadmapUnits = useMemo(() => {
    const posMap = {
      1: { top: "75%", left: "8%" },
      2: { top: "45%", left: "20%" },
      3: { top: "25%", left: "35%" },
      4: { top: "50%", left: "50%" },
      5: { top: "75%", left: "65%" },
      6: { top: "63%", left: "79%" },
      7: { top: "38%", left: "92%" },
      8: { top: "15%", left: "78%" },
    };

    return LESSONS.map((l) => {
      const latest = latestScoreMap[l.no] || null;
      const passedFromPretest = pretestPassedSet.has(l.no);
      const passedFromLatestPosttest = !!latest?.passed;
      const isMastered = masteredSet.has(l.no);

      let status = "locked";
      let clickable = false;

      if (isMastered) {
        status = "completed";
        clickable = true;
      } else if (nextTarget === l.no) {
        status = "active";
        clickable = true;
      }

      return {
        ...l,
        status,
        clickable,
        pos: posMap[l.no],
        latest,
        passedFromPretest,
        passedFromLatestPosttest,
      };
    });
  }, [latestScoreMap, masteredSet, nextTarget, pretestPassedSet]);

  const masteredList = useMemo(() => {
    return [...masteredSet].sort((a, b) => a - b);
  }, [masteredSet]);

  const allPassed = masteredSet.size >= TOTAL_UNITS;

  return (
    <div className="edu-app ls-adaptive">
      <header className="edu-topbar">
        <div className="edu-topbar__inner">
          <div className="homebar__brand">
            <img src={logo} alt="LearnSecure" className="homebar__logo" />
            <div>
              <div className="edu-brandtext__title">LearnSecure</div>
              <div className="edu-brandtext__subtitle">Adaptive Learning</div>
            </div>
          </div>

          <div className="edu-topbar__right">
            <div className="edu-userchip">
              <FiUser />
              <span>{loading ? "กำลังโหลด..." : studentName || "ผู้เรียน"}</span>
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
            <div className="edu-hero__head">
              <div className="edu-hero__text">
                <h1>เส้นทางการเรียนรู้</h1>
                <p>
                  ระบบจะใช้ผล Pretest ร่วมกับคะแนนแบบฝึกหัดรายบท
                  โดยใช้คะแนนล่าสุดของแต่ละบทในการตัดสินว่าปลดล็อกบทถัดไปได้หรือไม่
                </p>
              </div>

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

        <section className="section roadmap-section">
          <div className="section__head">
            <div className="section__title" style={{ color: "white" }}>
              <FiActivity /> Learning Roadmap
            </div>
          </div>

          <div className="roadmap-container">
            <svg className="roadmap-svg" viewBox="0 0 1000 350" preserveAspectRatio="none">
              <path
                d="M 80 280 Q 180 280 230 180 T 350 100 T 500 180 T 650 280 T 800 150 T 920 80 T 780 40"
                fill="none"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="54"
                strokeLinecap="round"
              />

              <path
                d="M 80 280 Q 180 280 230 180 T 350 100 T 500 180 T 650 280 T 800 150 T 920 80 T 780 40"
                fill="none"
                stroke="rgba(210,215,225,0.38)"
                strokeWidth="44"
                strokeLinecap="round"
              />

              <path
                d="M 80 280 Q 180 280 230 180 T 350 100 T 500 180 T 650 280 T 800 150 T 920 80 T 780 40"
                fill="none"
                stroke="rgba(255,255,255,0.95)"
                strokeWidth="6"
                strokeDasharray="36 26"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                shapeRendering="geometricPrecision"
                style={{
                  filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.45))",
                  opacity: 0.95,
                }}
              />
            </svg>

            {roadmapUnits.map((u) => (
              <div
                key={u.no}
                className={`roadmap-node-wrapper ${hoveredUnitNo === u.no ? "is-hovered" : ""}`}
                style={{ top: u.pos.top, left: u.pos.left }}
                onMouseEnter={() => setHoveredUnitNo(u.no)}
                onMouseLeave={() => setHoveredUnitNo(null)}
              >
                {hoveredUnitNo === u.no && (
                  <div className="unit-tooltip" role="tooltip">
                    <div className="unit-tooltip__title">
                      Unit {u.no}: {u.title}
                    </div>

                    <div className="unit-tooltip__desc">{u.desc}</div>

                    {u.passedFromPretest && (
                      <div className="unit-tooltip__desc" style={{ marginTop: 8, opacity: 0.95 }}>
                        ผ่านจาก Pretest
                      </div>
                    )}

                    {u.latest && (
                      <div className="unit-tooltip__desc" style={{ marginTop: 8, opacity: 0.95 }}>
                        คะแนนล่าสุด: {u.latest.total}/{u.latest.max} ({u.latest.percent}%)
                      </div>
                    )}

                    {u.passedFromLatestPosttest && (
                      <div className="unit-tooltip__desc" style={{ marginTop: 8, opacity: 0.95 }}>
                        ผ่านจากคะแนนล่าสุด ≥ {PASS_PERCENT}%
                      </div>
                    )}

                    {!u.latest && !u.passedFromPretest && u.status !== "locked" && (
                      <div className="unit-tooltip__desc" style={{ marginTop: 8, opacity: 0.95 }}>
                        ยังไม่มีคะแนนล่าสุดของแบบฝึกหัด
                      </div>
                    )}

                    {u.status === "locked" && (
                      <div className="unit-tooltip__desc" style={{ marginTop: 8, opacity: 0.95 }}>
                        ต้องผ่านบทก่อนหน้าให้ได้ก่อน
                      </div>
                    )}

                    <div className="unit-tooltip__arrow" />
                  </div>
                )}

                <button
                  className={`unit-node unit-node--${u.status}`}
                  disabled={!u.clickable}
                  onClick={() => u.clickable && goUnitByLessonNo(u.no)}
                  aria-label={`Unit ${u.no} ${u.title}`}
                >
                  {u.status === "completed" && <FiCheck />}
                  {u.status === "active" && <FiPlay />}
                  {u.status === "locked" && <FiLock />}
                </button>

                <div className="unit-label">Unit {u.no}</div>
              </div>
            ))}
          </div>
        </section>

        {!allPassed ? (
          <section className="ls-nextBox">
            <div className="ls-nextBox__row">
              <div className="ls-nextBox__text">
                <h3>ภารกิจถัดไปที่แนะนำ</h3>
                <p>
                  หน่วยที่ {nextTarget}: {LESSONS.find((l) => l.no === nextTarget)?.title}
                </p>
              </div>

              <button
                className="ls-btn ls-btn--primary ls-nextBox__cta"
                type="button"
                onClick={() => goUnitByLessonNo(nextTarget)}
              >
                <FiPlay aria-hidden="true" /> เริ่มบทนี้
              </button>
            </div>
          </section>
        ) : (
          <section className="ls-nextBox">
            <div className="ls-nextBox__row" style={{ gap: 16, flexWrap: "wrap" }}>
              <div className="ls-nextBox__text">
                <h3>เยี่ยมมาก 🎉</h3>
                <p>คุณผ่านครบทุกบทแล้ว สามารถไปทำ posttest ปลายคอร์สได้</p>
              </div>

              <button
                className="ls-btn ls-btn--primary ls-nextBox__cta"
                type="button"
                onClick={() => navigate("/final")}
              >
                <FiBarChart2 aria-hidden="true" /> เข้าสู่แบบทดสอบหลังเรียน
                <FiChevronRight aria-hidden="true" />
              </button>
            </div>
          </section>
        )}

        <section className="ls-legend">
          <div><FiCheck /> ผ่านแล้ว</div>
          <div><FiPlay /> หน่วยที่พร้อมเรียนต่อ</div>
          <div><FiLock /> ยังไม่ปลดล็อก</div>
        </section>

        <section className="ls-reviewMini">
          <h3><FiCheckCircle /> หน่วยที่ผ่านแล้ว</h3>
          <div className="ls-reviewRow">
            {masteredList.length === 0 ? (
              <div style={{ color: "white", opacity: 0.9 }}>
                ยังไม่มีหน่วยที่ผ่าน ระบบจะปลดล็อกบทแรกให้เริ่มเรียนก่อน
              </div>
            ) : (
              masteredList.map((n) => {
                const l = LESSONS.find((x) => x.no === n);
                const latest = latestScoreMap[n];
                const fromPretest = pretestPassedSet.has(n);

                if (!l) return null;

                let suffix = "";
                if (fromPretest && latest) {
                  suffix = ` (ผ่าน Pretest, ล่าสุด ${latest.total}/${latest.max} ${latest.percent}%)`;
                } else if (fromPretest) {
                  suffix = " (ผ่าน Pretest)";
                } else if (latest) {
                  suffix = ` (${latest.total}/${latest.max}, ${latest.percent}%)`;
                }

                return (
                  <button key={n} onClick={() => goUnitByLessonNo(n)}>
                    หน่วย {n}: {l.title}{suffix}
                  </button>
                );
              })
            )}
          </div>
        </section>
      </main>
    </div>
  );
}