import { useState } from "react";
import { FiChevronRight } from "react-icons/fi";
import "../main.css"; // Importing the main styles
import "../lesson.css"; // Importing the lesson-specific styles

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
  const [completedLessons, setCompletedLessons] = useState(new Set([1, 2])); // Mock completed lessons
  
  // Function to handle lesson click
  const goToLesson = (lessonNo) => {
    console.log(`Navigating to Lesson ${lessonNo}`);
    // Logic to navigate to the detailed lesson view can go here
  };

  return (
    <div className="edu-app ls-adaptive">
      {/* Top Bar */}
      <header className="edu-topbar">
        <div className="edu-topbar__inner">
          <div className="homebar__brand" role="banner">
            <img src="/path-to-logo.png" alt="Logo" className="homebar__logo" />
            <div className="edu-brandtext">
              <div className="edu-brandtext__title">LearnSecure</div>
              <div className="edu-brandtext__subtitle">Linear Lessons</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="edu-layout">
        <section className="edu-hero">
          <div className="edu-hero__card">
            <div className="edu-hero__headline">
              <h2>บทเรียนแบบ Linear</h2>
              <p>เรียนแต่ละบทในลำดับจากบทแรกจนถึงบทสุดท้าย</p>
            </div>
          </div>
        </section>

        {/* Lesson List */}
        <section className="ls-card">
          <div className="ls-cardHead">
            <h3>ภารกิจของคุณ</h3>
          </div>
          <div className="ls-taskList">
            {LESSONS.map((lesson) => {
              const isCompleted = completedLessons.has(lesson.no);
              return (
                <button
                  key={lesson.no}
                  type="button"
                  className={`ls-taskRow ${isCompleted ? "ls-badge--ok" : "ls-badge--go"}`}
                  onClick={() => goToLesson(lesson.no)}
                  disabled={isCompleted}
                >
                  <div className="ls-step">{lesson.no}</div>
                  <div>
                    <div className="ls-taskTitle">{lesson.title}</div>
                    <div className="ls-taskDesc">{lesson.desc}</div>
                  </div>
                  <FiChevronRight className="ls-arrow" aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
