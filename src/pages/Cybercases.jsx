import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import logo from "../assets/logo.png";

// Import CSS เดิมเพื่อรักษา Navbar/Hero และ CSS ใหม่เพื่อแต่งเนื้อหา
import "../main.css"; 
import "./Cybercases.css"; 

import {
  FiChevronLeft, FiHome, FiLogOut, FiUser, FiAlertTriangle,
  FiLock, FiGlobe, FiCpu, FiBriefcase, FiMessageCircle, FiAlertOctagon, FiShield,
  FiChevronRight
} from "react-icons/fi";

export default function Cybercases() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");



const categories = [
  {
    id: 1,
    title: "การยึดบัญชี & ภัยการเงินไซเบอร์",
    description:
      "ฟิชชิง OTP แอปดูดเงิน QR ปลอม และการโจมตีบัญชีออนไลน์",
    icon: <FiLock />,
    iconClass: "cb-icon--emerald",
    cases: 6,
  },
  {
    id: 2,
    title: "กับดักโซเชียล & คอนเทนต์หลอก",
    description:
      "ข่าวปลอม เพจปลอม Clickbait และการหลอกลวงผ่านโซเชียลมีเดีย",
    icon: <FiGlobe />,
    iconClass: "cb-icon--sky",
    cases: 4,
  },
  {
    id: 3,
    title: "AI และตัวตนปลอมแปลง",
    description:
      "Deepfake เสียงปลอม และการสวมรอยด้วยปัญญาประดิษฐ์",
    icon: <FiCpu />,
    iconClass: "cb-icon--violet",
    cases: 2,
  },
  {
    id: 4,
    title: "กลโกงงาน & ธุรกรรมออนไลน์",
    description:
      "งานออนไลน์ปลอม สลิปปลอม และการหลอกลวงด้านการเงินดิจิทัล",
    icon: <FiBriefcase />,
    iconClass: "cb-icon--amber",
    cases: 3,
  },
  {
    id: 5,
    title: "พฤติกรรมออนไลน์ & ร่องรอยดิจิทัล",
    description:
      "Cyberbullying การประจานออนไลน์ และผลกระทบจาก Digital Footprint",
    icon: <FiMessageCircle />,
    iconClass: "cb-icon--rose",
    cases: 5,
  },
  {
    id: 6,
    title: "มัลแวร์ & แอปอันตราย",
    description:
      "แอปเถื่อน ไวรัส มัลแวร์ และการขโมยข้อมูลในอุปกรณ์",
    icon: <FiAlertOctagon />,
    iconClass: "cb-icon--red",
    cases: 2,
  },
  {
    id: 7,
    title: "ภัยคุกคามทางเพศ & การแบล็กเมล",
    description:
      "การข่มขู่ คุกคาม และการเผยแพร่ข้อมูลหรือรูปภาพส่วนตัว",
    icon: <FiShield />,
    iconClass: "cb-icon--cyan",
    cases: 1,
  },
];





  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase.auth.getSession();
      const u = data.session?.user;
      if (!u) { navigate("/login"); return; }
      const { data: profile } = await supabase.from("student_profiles").select("first_name,last_name").eq("user_id", u.id).maybeSingle();
      if (profile) setStudentName(`${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim());
      setLoading(false);
    })();
  }, [navigate]);

  return (
    <div className="edu-app">
      {/* ⚠️ TOPBAR: ห้ามเปลี่ยน Class เด็ดขาดตามสั่ง */}
      <header className="edu-topbar">
        <div className="edu-topbar__inner">
          <div className="homebar__brand">
            <img src={logo} alt="LearnSecure logo" className="homebar__logo" />
            <div className="edu-brandtext">
              <div className="edu-brandtext__title">LearnSecure</div>
              <div className="edu-brandtext__subtitle">Case Studies</div>
            </div>
          </div>
          <div className="edu-topbar__right">
            <div className="edu-userchip">
              <div className="edu-userchip__avatar"><FiUser /></div>
              <div className="edu-userchip__name">{studentName || "ผู้เรียน"}</div>
            </div>
            <button className="edu-btn edu-btn--danger" onClick={() => { supabase.auth.signOut(); navigate("/login"); }}>
              <FiLogOut /> ออกจากระบบ
            </button>
          </div>
        </div>
      </header>

      <main className="edu-layout">
        {/* ⚠️ HERO SECTION: ห้ามเปลี่ยน Class เด็ดขาดตามสั่ง */}
        <section className="edu-hero">
          <div className="edu-hero__card">
            <div className="edu-hero__row">
              <div className="edu-hero__headline">
                <div className="edu-hero__title">Cyber Incident Case Studies</div>
                <div className="edu-hero__sub">กรณีศึกษาอุบัติการณ์ภัยคุกคามไซเบอร์จากสถานการณ์จริง</div>
                <div className="edu-lessons__toolbar">
                  <button className="edu-btn edu-btn--back" onClick={() => navigate(-1)}>
                    <FiChevronLeft /> กลับ
                  </button>
                  <button className="edu-btn edu-btn--ghost" onClick={() => navigate("/main")} style={{ marginLeft: 8 }}>
                    <FiHome /> กลับหน้าหลัก
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ⚠️ PANEL: ห้ามเปลี่ยน Class เด็ดขาด */}
        <section className="edu-panel1">
          <div className="edu-panel1__head">
            <div className="edu-panel1__title">
              <FiAlertTriangle aria-hidden="true" /> รวม 21 กรณีศึกษาและแนวทางป้องกัน
            </div>
          </div>

          <div className="cb-grid-layout">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="cb-item-card"
                // ✅ แก้ไข Path ตรงตาม Route ที่พี่ส่งมาเป๊ะ: /case/groupX
                onClick={() => navigate(`/case/group${cat.id}`)}
              >
                <div className="cb-card-glow" />

                <div className="cb-item-card__header">
                  <div className={`cb-icon-frame ${cat.iconClass}`}>
                    {cat.icon}
                  </div>

                  <div className="cb-content">
                    <div className="cb-title-text">
                      {cat.title}
                    </div>

                    <div className="cb-description">
                      {cat.description}
                    </div>
                  </div>
                </div>

                <div className="cb-card-footer">
                  <div className="cb-case-info">
                    <span className="cb-case-number">
                      {cat.cases}
                    </span>

                    <span className="cb-case-label">
                      {cat.cases === 1 ? "Case Study" : "Case Studies"}
                    </span>
                  </div>

                  <div className="cb-arrow">
                    <FiChevronRight />
                  </div>
                </div>
              </div>
            ))}
          </div>

        </section>
      </main>
    </div>
  );
}