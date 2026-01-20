import { useMemo, useState } from "react";
import { FiChevronRight, FiHome, FiUser, FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import logo from "../assets/logo.png"; // ปรับ path โลโก้ตามจริง

import "../main.css";
import "../lesson.css";

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

export default function LessonLinear() {
  const navigate = useNavigate();

  // mock state ผู้เรียน
  const [studentName] = useState("นักเรียนทดลอง");
  const [loading] = useState(false);

  // (ถ้ายังไม่ได้ใช้จริง จะลบทีหลังก็ได้)
  const [completedLessons] = useState(new Set());

  const doneCount = useMemo(() => {
    let c = 0;
    for (const l of LESSONS) if (completedLessons.has(l.no)) c++;
    return c;
  }, [completedLessons]);

  const progressPct = useMemo(() => {
    return Math.round((doneCount / LESSONS.length) * 100);
  }, [doneCount]);

  /**
 * ✅ ไปยังหน้าบทเรียนตามเลขบท (Linear)
 * - บทที่ 1 -> /unit1/learn
 * - บทที่ 2–8 -> /unit{n}/learn
 */
const goToLesson = (n) => {
  console.log(`Navigating to Unit ${n}`);

  // ✅ บท 1 เข้าหน้าเรียนของ Unit1
  if (n === 1) {
    navigate("/unit1/learn");
    return;
  }

  // ✅ สำหรับบทที่ 2–8 เข้า /unit{n}/learn
  if (n >= 2 && n <= 8) {
    navigate(`/unit${n}/learn`);
    return;
  }

  // ❗ เผื่อกรณีบทนอกเหนือจากที่กำหนด
  console.warn("Invalid lesson number:", n);
};


  return (
    <div className="edu-app ls-adaptive">
      {/* ✅ TOPBAR (คง class เดิมทั้งหมด) */}
      <header className="edu-topbar">
        <div className="edu-topbar__inner">
          <div className="homebar__brand" role="banner">
            <img
              src={logo}
              alt="LearnSecure logo"
              className="homebar__logo"
            />
            <div className="edu-brandtext">
              <div className="edu-brandtext__title">LearnSecure</div>
              <div className="edu-brandtext__subtitle">
                Adaptive Lessons
              </div>
            </div>
          </div>

          <div className="edu-topbar__right">
            <div
              className="edu-userchip"
              title={studentName || "Student"}
            >
              <div
                className="edu-userchip__avatar"
                aria-hidden="true"
              >
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

      <main className="edu-layout">
        {/* HERO */}
       <section className="edu-hero" aria-label="Lessons header"> <div className="edu-hero__card"> <div className="edu-hero__row"> <div className="edu-hero__headline"> <div className="edu-hero__title">บทเรียนทั้งหมด 
</div> <div className="edu-hero__sub"> คุณผ่านเส้นทางแบบ Adaptive ครบแล้ว — หน้านี้จึงแสดงบทเรียนทั้งหมดเรียงตามบท เพื่อทบทวน/เรียนซ้ำได้ทันที </div> <div className="edu-lessons__toolbar"> <button className="edu-btn edu-btn--ghost" type="button" onClick={() => navigate("/main")} style={{ marginLeft: 8 }} > <FiHome aria-hidden="true" /> กลับหน้าหลัก </button> </div> </div> <div className="edu-lessons__meta"> <div className="edu-miniStat"> <div className="edu-miniStat__label">จำนวนบท (รวม)</div> <div className="edu-miniStat__value">{LESSONS.length}</div> </div> </div> </div> </div> </section>

        {/* Lesson Grid Card */}
<section className="lgrid-container">
  <div className="lgrid-header">
    <h3 className="lgrid-title">เลือกบทเรียน</h3>
    <p className="lgrid-subtitle">กดเริ่มได้ทุกบท (ทำแล้วก็กดเรียนซ้ำได้)</p>
  </div>

<div className="lgrid-wrapper">
  {LESSONS.map((lesson) => {
    return (
      <button
  key={lesson.no}
  type="button"
  className="lgrid-item"
  onClick={() => goToLesson(lesson.no)}
>

        <div className="lgrid-item-top">
          <div className="lgrid-badge">บทที่ {lesson.no}</div>
        </div>

        <div className="lgrid-item-body">
          <h4 className="lgrid-item-name">{lesson.title}</h4>
          <p className="lgrid-item-info">{lesson.desc}</p>
        </div>

        <div className="lgrid-item-footer">
          <span className="lgrid-status-pill is-action">เริ่มเรียน</span>
          <FiChevronRight className="lgrid-icon-arrow" aria-hidden="true" />
        </div>
      </button>
    );
  })}
</div>

</section>
      </main>
    </div>
  );
}
