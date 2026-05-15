import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import logo from "../../assets/logo.png";

import "../../main.css";
import "../Cybercases.css"; 

import {
  FiChevronLeft, FiChevronRight, FiHome, FiLogOut, FiUser,
  FiAlertTriangle, FiInfo, FiShield, FiTarget, FiMaximize2, FiX
} from "react-icons/fi";

export default function Group1() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false); // State สำหรับ Popup

  const caseStudies = [
    {
      title: "กรณีศึกษาที่ 1: การหลอกลวงผ่านข้อความสั้น (Phishing SMS)",
      image: "1.png",
      description: "คนร้ายแอบอ้างเป็นหน่วยงานขนส่งหรือหน่วยงานรัฐ ส่งข้อความเร่งด่วนเพื่อกระตุ้นความกังวล โดยใช้ลิงก์ย่อ (Short Link) นำพาเหยื่อไปยังเว็บไซต์ปลอมเพื่อดักรับข้อมูลส่วนบุคคลหรือติดตั้งมัลแวร์",
      lesson: "ลิงก์ย่อมีความเสี่ยงสูง หน่วยงานรัฐและสถาบันการเงินไม่มีนโยบายส่งลิงก์เพื่อขอข้อมูลส่วนบุคคลผ่าน SMS",
      color: "#166534"
    },
    {
      title: "กรณีศึกษาที่ 2: รหัสผ่านใช้ครั้งเดียว (OTP) คือกุญแจสำคัญ",
      image: "2.png",
      description: "มิจฉาชีพจะพยายามเข้าถึงบัญชีของเหยื่อ และแชทมาขอรหัส OTP โดยอ้างเหตุผลความปลอดภัย เพื่อใช้ในการเปลี่ยนรหัสผ่านหรือยืนยันการโอนเงินออกจากบัญชี",
      lesson: "รหัส OTP ถือเป็นความลับสูงสุด ห้ามเปิดเผยแก่บุคคลอื่นแม้จะอ้างว่าเป็นเจ้าหน้าที่ก็ตาม",
      color: "#0369a1"
    },
    {
      title: "กรณีศึกษาที่ 3: แอปพลิเคชันควบคุมระยะไกล (Remote Desktop App)",
      image: "3.png",
      description: "การหลอกให้ติดตั้งแอปพลิเคชันนอกสโตร์และขอสิทธิ์ 'Screen Control' ทำให้คนร้ายสามารถมองเห็นหน้าจอและสั่งการโทรศัพท์ของเหยื่อเพื่อทำธุรกรรมแทนได้ทั้งหมด",
      lesson: "ปฏิเสธการขอสิทธิ์ควบคุมหน้าจอจากแอปพลิเคชันที่ไม่รู้จัก และหลีกเลี่ยงการดาวน์โหลดแอปฯ ผ่านลิงก์โดยตรง",
      color: "#5b21b6"
    },
    {
      title: "กรณีศึกษาที่ 4: ภัยเงียบจาก QR Code ปลอม (Quishing)",
      image: "4.png",
      description: "การนำสติกเกอร์ QR Code ปลอมมาแปะทับของร้านค้า เพื่อนำพาผู้ใช้งานไปยังเว็บไซต์ฟิชชิง หรือเปลี่ยนบัญชีปลายทางในการรับเงินโอน",
      lesson: "ก่อนยืนยันการชำระเงิน ต้องตรวจสอบชื่อบัญชีปลายทางและที่มาของ QR Code ทุกครั้ง",
      color: "#b45309"
    },
    {
      title: "กรณีศึกษาที่ 5: บัญชีม้าและผลกระทบทางกฎหมาย",
      image: "5.png",
      description: "การยินยอมให้บุคคลอื่นนำชื่อและบัญชีธนาคารไปใช้เพื่อฟอกเงินผิดกฎหมาย ซึ่งเจ้าของบัญชีจะต้องมีความผิดทางอาญาและรับโทษสถานหนักตามกฎหมาย",
      lesson: "ห้ามยินยอมให้ผู้อื่นครอบคลุมหรือใช้งานบัญชีธนาคารของตนเองโดยเด็ดขาด",
      color: "#be123c"
    },
    {
      title: "กรณีศึกษาที่ 6: กลโกงการเติมเกมราคาถูก",
      image: "6.jpg",
      description: "การประกาศขายไอเทมหรือเติมเงินในเกมในราคาที่ต่ำกว่าปกติ เพื่อจูงใจให้เหยื่อโอนเงินล่วงหน้าก่อนจะบล็อกการติดต่อ หรือขอข้อมูลล็อกอินเพื่อยึดครองบัญชีเกม",
      lesson: "ควรทำธุรกรรมผ่านช่องทางทางการเท่านั้น สินค้าที่ราคาถูกเกินจริงมีความเสี่ยงสูงที่จะเป็นการหลอกลวง",
      color: "#991b1b"
    }
  ];

  const nextStep = () => { if (currentStep < caseStudies.length - 1) { setCurrentStep(currentStep + 1); setIsModalOpen(false); } };
  const prevStep = () => { if (currentStep > 0) { setCurrentStep(currentStep - 1); setIsModalOpen(false); } };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase.auth.getSession();
      if (!data.session?.user) { navigate("/login"); return; }
      const { data: profile } = await supabase.from("student_profiles").select("first_name,last_name").eq("user_id", data.session.user.id).maybeSingle();
      if (profile) setStudentName(`${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim());
      setLoading(false);
    })();
  }, [navigate]);

  const currentData = caseStudies[currentStep];

  return (
    <div className="edu-app">
      {/* --- MODAL POPUP --- */}
      {isModalOpen && (
        <div 
          onClick={() => setIsModalOpen(false)}
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            backgroundColor: 'rgba(15, 23, 42, 0.9)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(8px)', cursor: 'zoom-out', padding: '40px'
          }}
        >
          <button 
            style={{ position: 'absolute', top: '30px', right: '30px', background: 'white', border: 'none', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
            onClick={() => setIsModalOpen(false)}
          >
            <FiX size={24} color="#0f172a" />
          </button>
          <img 
            src={`/src/assets/case/${currentData.image}`} 
            alt="Large View" 
            style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}

      {/* --- HEADER --- */}
      <header className="edu-topbar">
        <div className="edu-topbar__inner">
          <div className="homebar__brand">
            <img src={logo} alt="Logo" className="homebar__logo" />
            <div className="edu-brandtext">
              <div className="edu-brandtext__title">LearnSecure</div>
              <div className="edu-brandtext__subtitle">Group 1: Financial Scams</div>
            </div>
          </div>
          <div className="edu-topbar__right">
            <div className="edu-userchip">
              <div className="edu-userchip__avatar"><FiUser /></div>
              <div className="edu-userchip__name">{loading ? "..." : studentName || "ผู้เรียน"}</div>
            </div>
            <button className="edu-btn edu-btn--danger" onClick={() => supabase.auth.signOut().then(() => navigate("/login"))}>
              <FiLogOut />
            </button>
          </div>
        </div>
      </header>

      <main className="edu-layout">
        <section className="edu-hero" style={{ marginBottom: '24px' }}>
          <div className="edu-hero__card">
            <div className="edu-hero__row">
              <div className="edu-hero__headline">
                <div className="edu-hero__title">กรณีศึกษา: การยึดบัญชี & ภัยการเงินไซเบอร์</div>
                <div className="edu-hero__sub">ฟิชชิง OTP แอปดูดเงิน QR ปลอม และการโจมตีบัญชีออนไลน์</div>
                <div className="edu-lessons__toolbar">
                  <button className="edu-btn edu-btn--back" onClick={() => navigate("/cybercases")}>
                    <FiChevronLeft /> ย้อนกลับ
                  </button>
                  <button className="edu-btn edu-btn--ghost" onClick={() => navigate("/main")} style={{ marginLeft: 8 }}>
                    <FiHome /> หน้าหลัก
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="edu-panel1">
          <div className="edu-panel1__head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="edu-panel1__title" style={{ fontSize: '1.25rem' }}>
              <FiTarget /> {currentData.title}
            </div>
            <div style={{ background: '#f1f5f9', padding: '6px 14px', borderRadius: '10px', fontSize: '0.9rem', fontWeight: '700', color: '#475569' }}>
              ความก้าวหน้า: {currentStep + 1} / {caseStudies.length}
            </div>
          </div>

          <div className="cb-panel-body" style={{ padding: '40px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '40px', alignItems: 'start' }}>
              
              {/* ส่วนรูปภาพพร้อมปุ่ม Popup */}
              <div style={{ position: 'relative', group: 'true' }} className="image-container-group">
                <div 
                  style={{ 
                    background: '#f8fafc', borderRadius: '24px', overflow: 'hidden', border: '2px solid #e2e8f0',
                    height: '450px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative', cursor: 'pointer'
                  }}
                  onClick={() => setIsModalOpen(true)}
                >
                  <img 
                    src={`/src/assets/case/${currentData.image}`} 
                    alt="Case Evidence" 
                    style={{ maxWidth: '95%', maxHeight: '95%', objectFit: 'contain' }}
                  />
                  {/* ปุ่มขยายภาพกลางรูป */}
                  <div style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    backgroundColor: 'rgba(15, 23, 42, 0.7)', color: 'white', padding: '12px 24px',
                    borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '10px',
                    fontWeight: '600', opacity: 0.9, border: '1px solid rgba(255,255,255,0.2)'
                  }}>
                    <FiMaximize2 /> ขยายรูปภาพ
                  </div>
                </div>
              </div>

              {/* ส่วนรายละเอียด */}
              <div>
                <div style={{ marginBottom: '30px' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', fontSize: '1.2rem', marginBottom: '15px' }}>
                    <FiInfo color={currentData.color} /> บทวิเคราะห์สถานการณ์
                  </h4>
                  <p style={{ lineHeight: '1.8', color: '#475569', fontSize: '1.1rem' }}>
                    {currentData.description}
                  </p>
                </div>

                <div style={{ 
                  background: 'white', border: `1.5px solid ${currentData.color}`, 
                  borderLeftWidth: '8px', borderRadius: '16px', padding: '24px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)'
                }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: currentData.color, marginBottom: '10px', fontSize: '1.1rem' }}>
                    <FiShield /> แนวทางป้องกันและข้อควรระวัง
                  </h4>
                  <p style={{ fontWeight: '700', color: '#0f172a', fontSize: '1.1rem', lineHeight: '1.5' }}>
                    {currentData.lesson}
                  </p>
                </div>

                {/* ปุ่มเลื่อน */}
                <div style={{ display: 'flex', gap: '15px', marginTop: '40px' }}>
                  <button 
                    className="edu-btn edu-btn--ghost" 
                    onClick={prevStep} 
                    disabled={currentStep === 0}
                    style={{ flex: 1, height: '55px', borderRadius: '14px', border: '2px solid #e2e8f0' }}
                  >
                    <FiChevronLeft /> ก่อนหน้า
                  </button>
                  <button 
                    className="edu-btn" 
                    onClick={nextStep} 
                    disabled={currentStep === caseStudies.length - 1}
                    style={{ 
                      flex: 1.5, height: '55px', borderRadius: '14px', fontWeight: '700',
                      background: currentStep === caseStudies.length - 1 ? '#cbd5e1' : currentData.color,
                      color: 'white', border: 'none'
                    }}
                  >
                    กรณีถัดไป <FiChevronRight />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>
    </div>
  );
}