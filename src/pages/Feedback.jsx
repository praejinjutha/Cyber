import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import logo from "../assets/logo.png";
import "../main.css";
import {
  FiMessageSquare, 
  FiUser, 
  FiLogOut, 
  FiHome, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiThumbsUp,
} from "react-icons/fi";

// ✅ MOCK LESSON FEEDBACK (SYSTEM)
const FEEDBACKS = [
  {
    no: 1,
    title: "พื้นฐานความปลอดภัยไซเบอร์",
    status: "good",
    message: "คุณเข้าใจภาพรวมของภัยคุกคามไซเบอร์ได้ดี สามารถแยกประเภทความเสี่ยงพื้นฐานได้ถูกต้อง",
    suggestion: "แนะนำให้ทบทวนตัวอย่างเหตุการณ์จริงเพิ่มเติม",
  },
  {
    no: 2,
    title: "รหัสผ่านและการยืนยันตัวตน",
    status: "excellent",
    message: "คุณสามารถตั้งรหัสผ่านที่ปลอดภัยและเข้าใจแนวคิด MFA ได้ครบถ้วน",
    suggestion: "ไม่มีข้อเสนอแนะเพิ่มเติม",
  },
  {
    no: 3,
    title: "Phishing และ Social Engineering",
    status: "warn",
    message: "ยังสับสนบางจุดในการแยกแยะอีเมลหลอกกับอีเมลจริง",
    suggestion: "ควรทบทวนตัวอย่าง phishing email และ URL ปลอม",
  },
  {
    no: 4,
    title: "ความปลอดภัยบนโซเชียลมีเดีย",
    status: "good",
    message: "เข้าใจการตั้งค่า Privacy และความเสี่ยงจากการเปิดเผยข้อมูล",
    suggestion: "แนะนำให้ตรวจสอบการตั้งค่าบัญชีจริงของคุณอีกครั้ง",
  },
  {
    no: 5,
    title: "ความปลอดภัยบนอุปกรณ์",
    status: "warn",
    message: "ยังไม่เข้าใจความสำคัญของการอัปเดตระบบอย่างสม่ำเสมอ",
    suggestion: "ควรทบทวนหัวข้อการจัดการ Patch และ Antivirus",
  },
  {
    no: 6,
    title: "ความปลอดภัยบนเครือข่าย",
    status: "excellent",
    message: "คุณเข้าใจความเสี่ยงของ Wi-Fi สาธารณะและการใช้ VPN เป็นอย่างดี",
    suggestion: "ไม่มีข้อเสนอแนะเพิ่มเติม",
  },
  {
    no: 7,
    title: "ข้อมูลส่วนบุคคลและ PDPA",
    status: "good",
    message: "เข้าใจแนวคิดข้อมูลส่วนบุคคลและหน้าที่ในการปกป้องข้อมูล",
    suggestion: "แนะนำให้ทบทวนสิทธิของเจ้าของข้อมูลตาม PDPA",
  },
  {
    no: 8,
    title: "สรุป + แนวทางปฏิบัติ",
    status: "excellent",
    message: "คุณสามารถนำความรู้ไปประยุกต์ใช้ในสถานการณ์จริงได้",
    suggestion: "ควรรักษาพฤติกรรมความปลอดภัยนี้อย่างต่อเนื่อง",
  },
];

export default function Feedback() {
  const navigate = useNavigate();
  const [studentName, setStudentName] = useState("");
  const [loading, setLoading] = useState(true);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState(FEEDBACKS);
  const [statusFilter, setStatusFilter] = useState("all");

  // ฟังก์ชั่นสำหรับกรองตามสถานะ
  const filterFeedbacks = (status) => {
    if (status === "all") {
      setFilteredFeedbacks(FEEDBACKS);
    } else {
      setFilteredFeedbacks(FEEDBACKS.filter(f => f.status === status));
    }
  };

  useEffect(() => {
    let alive = true;

    (async () => {
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

  const renderStatus = (status) => {
    if (status === "excellent") {
      return (
        <span className="edu-badge edu-badge--ok edu-feedbackCard__status">
          <FiThumbsUp aria-hidden="true" /> ดีมาก
        </span>
      );
    }

    if (status === "good") {
      return (
        <span className="edu-badge edu-badge--info edu-feedbackCard__status">
          <FiCheckCircle aria-hidden="true" /> ผ่านเกณฑ์
        </span>
      );
    }

    return (
      <span className="edu-badge edu-badge--lock edu-feedbackCard__status">
        <FiAlertCircle aria-hidden="true" /> ควรทบทวน
      </span>
    );
  };

  return (
    <div className="edu-app">
      <header className="edu-topbar">
        <div className="edu-topbar__inner">
          <div className="homebar__brand" role="banner">
            <img src={logo} alt="LearnSecure logo" className="homebar__logo" />
            <div className="edu-brandtext">
              <div className="edu-brandtext__title">LearnSecure</div>
              <div className="edu-brandtext__subtitle">System Feedback</div>
            </div>
          </div>

          <div className="edu-topbar__right">
            <div className="edu-userchip">
              <div className="edu-userchip__avatar" aria-hidden="true">
                <FiUser />
              </div>
              <div className="edu-userchip__name">
                {loading ? "กำลังโหลด..." : studentName || "ผู้เรียน"}
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
              <FiLogOut aria-hidden="true" /> ออกจากระบบ
            </button>
          </div>
        </div>
      </header>

      <main className="edu-layout">
        <section className="edu-panel">
          <div className="edu-panel__head">
            <div className="edu-panel__title">
              <FiMessageSquare aria-hidden="true" /> ข้อเสนอแนะจากระบบ (ทั้ง 8 บท)
            </div>

            <button
              className="edu-btn edu-btn--ghost"
              type="button"
              onClick={() => navigate("/main")}
            >
              <FiHome aria-hidden="true" /> กลับหน้าหลัก
            </button>
          </div>

          {/* ฟอร์มกรองสถานะ */}
          <div className="edu-filter">
            <select
              onChange={(e) => {
                setStatusFilter(e.target.value);
                filterFeedbacks(e.target.value);
              }}
              value={statusFilter}
            >
              <option value="all">ทั้งหมด</option>
              <option value="excellent">ดีมาก</option>
              <option value="good">ผ่านเกณฑ์</option>
              <option value="warn">ควรทบทวน</option>
            </select>
          </div>

          <div className="edu-feedbackList">
            {filteredFeedbacks.map((f) => (
              <div
                key={f.no}
                className="edu-card edu-feedbackCard"
                style={{ marginBottom: "20px" }}
              >
                <div className="edu-feedbackCard__head">
                  <div className="edu-feedbackCard__title">
                    บทที่ {f.no}: {f.title}
                  </div>
                  {renderStatus(f.status)}
                </div>

                <div className="edu-feedbackCard__body">
                  <p>
                    <strong>ข้อเสนอแนะ:</strong> {f.suggestion}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
