import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import logo from "../assets/logo.png";

import "../main.css";
import "../lesson.css";

import {
  FiChevronRight,
  FiUser,
  FiLogOut,
  FiActivity,
  FiLock,
  FiCheckCircle,
  FiHome,
  FiBookOpen,
} from "react-icons/fi";

// ✅ รายการบทเรียน 8 บท (คงเดิม)
const LESSONS = [
  { no: 1, title: "พื้นฐานความปลอดภัยไซเบอร์", desc: "รู้จักภัยคุกคามและหลักการสำคัญ" },
  { no: 2, title: "รหัสผ่านและการยืนยันตัวตน", desc: "ตั้งรหัสผ่านให้ปลอดภัย + MFA" },
  { no: 3, title: "Phishing และ Social Engineering", desc: "จับสัญญาณอีเมล/ลิงก์หลอก" },
  { no: 4, title: "ความปลอดภัยบนโซเชียลมีเดีย", desc: "ตั้งค่า Privacy และลดความเสี่ยง" },
  { no: 5, title: "ความปลอดภัยบนอุปกรณ์", desc: "อัปเดต ซอฟต์แวร์ แอนติไวรัส การล็อกเครื่อง" },
  { no: 6, title: "ความปลอดภัยบนเครือข่าย", desc: "Wi-Fi, VPN, การใช้งานสาธารณะ" },
  { no: 7, title: "ข้อมูลส่วนบุคคลและ PDPA เบื้องต้น", desc: "แนวคิดข้อมูลส่วนบุคคลและการปกป้อง" },
  { no: 8, title: "สรุป + แนวทางปฏิบัติ", desc: "เช็กลิสต์การใช้งานจริงและทบทวน" },
];

export default function Lessons() {
  // ✅ ใช้สำหรับเปลี่ยนหน้า
  const navigate = useNavigate();

  // ✅ state สำหรับโหลดข้อมูลผู้เรียน
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");

  // =========================================================
  // ✅ MOCK STATE (ภายหลังค่อยผูก Supabase)
  // =========================================================

  // ✅ ผ่าน pretest แล้ว (ข้ามได้ แต่เข้าไปทบทวนได้)
  const pretestPassedSet = useMemo(() => new Set([1, 4, 6]), []);

  // ✅ ผู้เรียน "เรียนจบจริง" — mock
  const learnedCompletedSet = useMemo(() => new Set([2]), []);

  // ✅ ตัวอย่างคะแนน posttest (mock)
  const getPosttestScore = (lessonNo) => {
    const posttestScores = {
      1: 85,
      2: 90,
      3: 88,
      4: 95,
      5: 87,
      6: 92,
      7: 84,
      8: 93,
    };
    return posttestScores[lessonNo] || 0;
  };

  // ✅ คะแนนแสดงเฉพาะ "ผ่านจากการทำข้อสอบ/เรียนจบจริง" เท่านั้น
  const getDisplayScore = (lessonNo) => {
    const isPassedFromExam = learnedCompletedSet.has(lessonNo);
    if (!isPassedFromExam) return 0;
    return getPosttestScore(lessonNo);
  };

  // ✅ mastered = ผ่าน pretest หรือเรียนจบจริง
  const masteredSet = useMemo(() => {
    const s = new Set();
    for (const n of pretestPassedSet) s.add(n);
    for (const n of learnedCompletedSet) s.add(n);
    return s;
  }, [pretestPassedSet, learnedCompletedSet]);

  // =========================================================
  // ✅ ADAPTIVE PATH / UNLOCK LOGIC
  // =========================================================

  // ✅ Adaptive path (ระบบจัดมา) — TODO: ภายหลังให้ดึงจาก AI/DB
  const adaptivePath = useMemo(() => [2, 3, 5, 7, 8], []);

  // ✅ mock: ผ่านใน path ไปแล้วกี่ step (นับแบบต่อเนื่อง)
  const adaptivePathPassedCount = useMemo(() => {
    let count = 0;
    for (const n of adaptivePath) {
      if (masteredSet.has(n)) count += 1;
      else break;
    }
    return count;
  }, [adaptivePath, masteredSet]);

  // ✅ path สำเร็จครบ
  const isPathCompleted = adaptivePathPassedCount >= adaptivePath.length;

  // ✅ adaptive: ปลดล็อกได้ถึง step ถัดไป (รวมตัวที่กำลังเรียนได้ 1 บท)
  const adaptiveUnlockedSet = useMemo(() => {
    const maxIndex = Math.min(adaptivePath.length - 1, adaptivePathPassedCount);
    const unlocked = adaptivePath.slice(0, maxIndex + 1);
    return new Set(unlocked);
  }, [adaptivePath, adaptivePathPassedCount]);

  // ✅ helper หา lesson ด้วยเลข
  const getLessonByNo = (n) => LESSONS.find((x) => x.no === n);

  // =========================================================
  // ✅ ROUTE HELPER: กดบทเรียนแล้วไป Unit ตามเลขบท
  // =========================================================
  const goUnitByLessonNo = (lessonNo) => {
    // ✅ กันค่าเพี้ยน
    const n = Math.min(8, Math.max(1, Number(lessonNo || 1)));

    // ✅ บท 1 เข้าหน้าเรียนของ Unit1
    if (n === 1) {
      navigate("/unit1/learn");
      return;
    }

    // ✅ บทอื่นเข้า /unit{n}/learn2
    navigate(`/unit${n}/learn2`);
  };

  // =========================================================
  // ✅ BADGE (ใช้ class ใหม่ ไม่ชนหน้าอื่น)
  // =========================================================
  const renderBadge = ({ isLocked, isMastered, isFromPretest, isFromExam, scoreToShow }) => {
    if (isLocked) {
      return (
        <span className="ls-badge ls-badge--lock">
          <FiLock aria-hidden="true" /> รอระบบปลดล็อก
        </span>
      );
    }

  
    return <span className="ls-badge ls-badge--go">เริ่มภารกิจ</span>;
  };

  // =========================================================
  // ✅ DERIVED LISTS: Active / Completed
  // =========================================================
  // ✅ รายการ “ภารกิจที่ต้องโฟกัสตอนนี้” = เฉพาะใน Path ที่ยังไม่ผ่าน หรือกำลังทำ
  const activePathItems = useMemo(() => {
    return adaptivePath
      .map((n, idx) => ({ n, idx }))
      .filter(({ n }) => !masteredSet.has(n)); // เหลือเฉพาะที่ยังไม่ mastered
  }, [adaptivePath, masteredSet]);

  // ✅ ถ้าผ่านหมด จะ activePathItems ว่าง -> เราใช้ state-based summary แทน
  const nextTarget = useMemo(() => {
    // ตัวถัดไปที่ปลดล็อกและยังไม่ผ่าน
    for (const n of adaptivePath) {
      if (!masteredSet.has(n) && adaptiveUnlockedSet.has(n)) return n;
    }
    return null;
  }, [adaptivePath, masteredSet, adaptiveUnlockedSet]);

  // ✅ คลัง “ผ่านแล้ว/ทบทวนได้” = ทั้ง pretest + learnedCompleted + path ที่ผ่านแล้ว
  const reviewItems = useMemo(() => {
    const all = new Set();
    for (const n of pretestPassedSet) all.add(n);
    for (const n of learnedCompletedSet) all.add(n);
    for (const n of adaptivePath) if (masteredSet.has(n)) all.add(n);

    return Array.from(all)
      .sort((a, b) => a - b)
      .map((n) => ({ n, lesson: getLessonByNo(n) }))
      .filter((x) => x.lesson);
  }, [pretestPassedSet, learnedCompletedSet, adaptivePath, masteredSet]);

  // =========================================================
  // ✅ AUTH + PROFILE
  // =========================================================
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
        setStudentName(`${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim());
      }

      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [navigate]);

  // =========================================================
  // ✅ SUMMARY HELPERS (เบา ๆ ไม่ dev)
  // =========================================================
  const totalInPath = adaptivePath.length;
  const doneInPath = adaptivePathPassedCount;
  const progressPct = totalInPath ? Math.round((doneInPath / totalInPath) * 100) : 0;

  const summaryTitle = isPathCompleted ? "เส้นทางแนะนำ: สำเร็จแล้ว" : "เส้นทางแนะนำ: กำลังดำเนินการ";
  const summaryDesc = isPathCompleted
    ? "คุณทำภารกิจครบตามเส้นทางที่ระบบแนะนำแล้ว สามารถทบทวนหัวข้อที่ผ่านได้ตลอดเวลา"
    : "ระบบจัดลำดับภารกิจให้ตามความพร้อมของคุณ ทำทีละขั้นเพื่อปลดล็อกภารกิจถัดไป";

  // =========================================================
  // ✅ UI (NEW DESIGN + NEW CLASSES ONLY)
  // =========================================================
  return (
    <div className="edu-app ls-adaptive"> 


      {/* ✅ TOPBAR (คงของเดิม ไม่แตะ class เดิม) */}
      <header className="edu-topbar">
        <div className="edu-topbar__inner">
          <div className="homebar__brand" role="banner">
            <img src={logo} alt="LearnSecure logo" className="homebar__logo" />
            <div className="edu-brandtext">
              <div className="edu-brandtext__title">LearnSecure</div>
              <div className="edu-brandtext__subtitle">Adaptive Lessons</div>
            </div>
          </div>

          <div className="edu-topbar__right">
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

      {/* ✅ NEW SHELL */}
      <main className="edu-layout"> {/* ✅ HERO */} <section className="edu-hero" aria-label="Lessons header"> <div className="edu-hero__card"> <div className="edu-hero__row"> <div className="edu-hero__headline"> <div className="edu-hero__title">บทเรียนแบบ Adaptive</div> <div className="edu-hero__sub"> ระบบจะจัด “เส้นทางการเรียน” ให้ตามสมรรถนะของผู้เรียน (ไม่ต้องไล่บทเอง) </div> <div className="edu-lessons__toolbar"> <button className="edu-btn edu-btn--ghost" type="button" onClick={() => navigate("/main")} style={{ marginLeft: 8 }} > <FiHome aria-hidden="true" /> กลับหน้าหลัก </button> </div> </div> <div className="edu-lessons__meta"> <div className="edu-miniStat"> <div className="edu-miniStat__label">จำนวนบท (รวม)</div> <div className="edu-miniStat__value">{LESSONS.length}</div> </div> </div> </div> </div> </section>

      {/* ✅ GRID: Left (Focus/Summary) + Right (Review) */}
      <section className="ls-grid" aria-label="Adaptive layout">
        {/* =========================
            ✅ LEFT: Focus / Summary (เปลี่ยนตามสถานะ)
           ========================= */}
        <section className="ls-card" aria-label="Focus panel">
          <div className="ls-cardHead">
            <div>
              <div className="ls-cardTitle">
                <FiActivity aria-hidden="true" />
                {summaryTitle}
              </div>
              <div className="ls-cardSub">{summaryDesc}</div>
            </div>

            <span className="ls-chip" title="Progress in recommended path">
              {doneInPath}/{totalInPath}
            </span>
          </div>

          <div className="ls-summaryBody">
            {/* ✅ Summary block */}
            <div className="ls-summaryTop">
              <div>
                <div className="ls-summaryMetaTitle">ความคืบหน้าเส้นทางแนะนำ</div>
                <div className="ls-summaryMetaSub">
                  ระบบจะปลดล็อกภารกิจทีละขั้น เมื่อคุณ “ผ่าน” ภารกิจก่อนหน้า
                </div>
                <div className="ls-bar" aria-label="Progress bar">
                  <span style={{ width: `${progressPct}%` }} />
                </div>
              </div>

              <div className="ls-progressWrap">
                <div className="ls-progressPct">{progressPct}%</div>
                <div className="ls-progressLabel">ความคืบหน้า</div>
              </div>
            </div>

            {/* ✅ Next action box */}
            


              {nextTarget ? (
                (() => {
                  const l = getLessonByNo(nextTarget);
                  return (
                    <>

                    </>
                  );
                })()
              ) : (
                <>
                  <div className="ls-nextHint">
                    ตอนนี้คุณทำภารกิจในเส้นทางแนะนำครบแล้ว ✅
                    <br />
                    แนะนำให้ทบทวนบทที่เคยผ่าน หรือทำแบบทดสอบสรุป (ถ้ามี)
                  </div>
                  <div className="ls-doneActions">
                    <button
                      className="ls-btn ls-btn--primary"
                      type="button"
                      onClick={() => {
                        const el = document.querySelector(".ls-reviewAnchor");
                        el?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                    >
                      <FiBookOpen aria-hidden="true" /> ไปหน้าทบทวน
                    </button>

                    <button className="ls-btn" type="button" onClick={() => navigate("/main")}>
                      <FiHome aria-hidden="true" /> กลับหน้าหลัก
                    </button>
                  </div>
                </>
              )}
            

            {/* ✅ Task list: แสดงเฉพาะ “ภารกิจใน path” (ถ้ายังไม่จบ) */}
            {!isPathCompleted ? (
              <div className="ls-taskList" aria-label="Recommended tasks list">
                {adaptivePath.map((n, idx) => {
                  const l = getLessonByNo(n);
                  if (!l) return null;

                  const isUnlocked = adaptiveUnlockedSet.has(n);
                  const isLocked = !isUnlocked;

                  const isMastered = masteredSet.has(n);
                  const isFromPretest = pretestPassedSet.has(n);
                  const isFromExam = learnedCompletedSet.has(n);
                  const scoreToShow = isFromExam ? getDisplayScore(n) : 0;

                  // ✅ ถ้า mastered แล้ว เราไม่แสดงใน list “โฟกัส” เพื่อไม่ให้รก (ไปอยู่ขวาแทน)
                  if (isMastered) return null;

                  return (
                    <button
                      key={n}
                      type="button"
                      className="ls-taskRow"
                      disabled={isLocked}
                      onClick={() => {
                        if (isLocked) return;
                        goUnitByLessonNo(n);
                      }}
                      title={isLocked ? "รอระบบปลดล็อก" : "เริ่มภารกิจนี้"}
                    >
                      <div className="ls-step">{idx + 1}</div>

                      <div>
                        <div className="ls-taskTitle">
                          บทที่ {l.no}: {l.title}
                        </div>
                        <div className="ls-taskDesc">{l.desc}</div>

                        <div className="ls-taskFoot">
                          {renderBadge({
                            isLocked,
                            isMastered,
                            isFromPretest,
                            isFromExam,
                            scoreToShow,
                          })}
                        </div>
                      </div>

                      <FiChevronRight className="ls-arrow" aria-hidden="true" />
                    </button>
                  );
                })}

                {/* ✅ ถ้าไม่มี task ที่ยังไม่ผ่าน (แต่ isPathCompleted ยัง false ในบางเคส) */}
                {activePathItems.length === 0 && (
                  <div className="ls-done" aria-label="No active tasks">
                    <div className="ls-doneTitle">ไม่มีภารกิจค้างอยู่ในตอนนี้</div>
                    <div className="ls-doneSub">
                      ระบบจะอัปเดตเมื่อมีภารกิจใหม่ หรือคุณสามารถไปทบทวนบทที่ผ่านแล้วได้ทางฝั่งขวา
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="ls-done" aria-label="Path completed message">
                <div className="ls-doneTitle">คุณทำเส้นทางแนะนำครบแล้ว 🎉</div>
                <div className="ls-doneSub">
                  ต่อจากนี้คุณสามารถทบทวนหัวข้อที่เคยผ่าน หรือกลับไปทำซ้ำเพื่อความแม่นยำได้
                </div>
              </div>
            )}

            <div className="ls-note">
              * คะแนนจะแสดงเฉพาะบทที่ “ผ่านจากการทำข้อสอบ/ภารกิจจริง” เท่านั้น (ไม่แสดงจาก Pretest)
            </div>
          </div>
        </section>

        {/* =========================
            ✅ RIGHT: Review (ผ่านแล้ว/ทบทวนได้)
           ========================= */}
        <aside className="ls-card ls-reviewAnchor" aria-label="Review panel">
          <div className="ls-cardHead">
            <div>
              <div className="ls-cardTitle">
                <FiCheckCircle aria-hidden="true" />
                ผ่านแล้ว / ทบทวนได้
              </div>

              <div className="ls-cardSub">
                รวมบทที่ผ่านจาก Pretest (กดเพื่อเข้าไปทบทวนได้)
              </div>
            </div>

            <span className="ls-chip" title="Count of reviewable lessons">
              {reviewItems.length} รายการ
            </span>
          </div>

          <div className="ls-reviewBody">
            <div className="ls-reviewGrid" aria-label="Review list">
              {reviewItems.length === 0 ? (
                <div className="ls-done">
                  <div className="ls-doneTitle">ยังไม่มีรายการทบทวน</div>
                  <div className="ls-doneSub">เริ่มทำภารกิจแรกทางฝั่งซ้าย แล้วรายการที่ผ่านจะย้ายมาอยู่ที่นี่เอง</div>
                </div>
              ) : (
                reviewItems.map(({ n, lesson }) => {
                  const isMastered = masteredSet.has(n);
                  const isFromPretest = pretestPassedSet.has(n);
                  const isFromExam = learnedCompletedSet.has(n);
                  const scoreToShow = isFromExam ? getDisplayScore(n) : 0;

                  return (
                    <button
                      key={n}
                      type="button"
                      className="ls-reviewCard"
                      onClick={() => goUnitByLessonNo(n)}
                      title="กดเพื่อทบทวน"
                    >
                      <div className="ls-reviewIcon" aria-hidden="true">
                        <FiCheckCircle />
                      </div>

                      <div>
                        <div className="ls-reviewTitle">
                          บทที่ {lesson.no}: {lesson.title}
                        </div>
                        <div className="ls-reviewDesc">{lesson.desc}</div>

                        <div className="ls-reviewMeta">
                          {renderBadge({
                            isLocked: false,
                            isMastered,
                            isFromPretest,
                            isFromExam,
                            scoreToShow,
                          })}
                        </div>
                      </div>

                      <FiChevronRight className="ls-arrow" aria-hidden="true" />
                    </button>
                  );
                })
              )}
            </div>

            <div className="ls-note">
              * บทที่ผ่านจาก Pretest: สามารถ “ข้าม” ได้ แต่เข้าทบทวนได้เสมอ
            </div>
          </div>
        </aside>
      </section>
    </main>
  </div>
);
}
