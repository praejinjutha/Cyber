import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import logo from "../../assets/logo.png";

import "../../main.css";
import "../cybercases.css"; 

import {
  FiChevronLeft, FiChevronRight, FiHome, FiLogOut, FiUser,
  FiInfo, FiShield, FiTarget, FiMaximize2, FiX, FiDollarSign, FiSearch
} from "react-icons/fi";

export default function Group4() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedImg, setSelectedImg] = useState(null);

  const caseStudies = [
    {
      title: "กรณีศึกษาที่ 13: กลโกงงานออนไลน์ (Part-time Scam)",
      images: ["13.png"],
      description: "มิจฉาชีพโฆษณาชวนเชื่อว่าเป็นงานง่ายที่ได้รับค่าตอบแทนสูงในช่วงแรกเพื่อให้เหยื่อตายใจ (Loss Leader) ก่อนจะหลอกล่อให้เหยื่อ 'สำรองเงิน' หรือโอนเงินสมทบเพื่อทำภารกิจที่ยากขึ้น และจบลงด้วยการเชิดเงินหนี",
      lesson: "พึงระลึกว่า 'งานที่ต้องจ่ายเงินก่อนคืองานปลอม' แพลตฟอร์มการทำงานที่ถูกกฎหมายจะไม่มีนโยบายให้ลูกจ้างโอนเงินประกันหรือสำรองจ่ายทุกกรณี",
      color: "#b45309"
    },
    {
      title: "กรณีศึกษาที่ 14: การปลอมแปลงเอกสารธุรกรรม (Fake Slip)",
      images: ["14.jpg"],
      description: "การใช้แอปพลิเคชันหรือโปรแกรมตัดต่อภาพเพื่อสร้างสลิปการโอนเงินปลอม โดยมีการแก้ไขตัวเลข วันที่ และเวลาให้ดูเหมือนมีการทำธุรกรรมจริงเพื่อหลอกให้ผู้ขายส่งสินค้าให้",
      lesson: "อย่าเชื่อถือเพียงภาพถ่ายสลิป ให้ตรวจสอบยอดเงินเข้าผ่านแอปพลิเคชันธนาคาร (Mobile Banking) โดยตรง หรือสแกน QR Code บนสลิปเพื่อตรวจสอบความถูกต้องของข้อมูล",
      color: "#1e293b"
    },
    {
      title: "กรณีศึกษาที่ 15: การโฆษณาแฝงผ่านผู้มีอิทธิพล (Hidden Advertising)",
      images: ["15.png"],
      description: "การนำเสนอเนื้อหาที่ดูเหมือนการรีวิวทั่วไปหรือคลิปไลฟ์สไตล์ แต่มีการแอบแฝงการโฆษณาสินค้าผ่าน Hashtag หรือ Caption เพื่อหลีกเลี่ยงการรับรู้ว่าเป็นโฆษณา ทำให้ผู้บริโภคตัดสินใจซื้อโดยไม่ได้รับข้อมูลที่เป็นกลาง",
      lesson: "ผู้บริโภคควรวิเคราะห์ 'เจตนา' ของผู้ส่งสาร การใช้ Hashtag หรือการปักหมุดลิงก์สินค้ามักเป็นการโฆษณาแฝง ไม่ใช่การรีวิวจากประสบการณ์ใช้งานจริง 100%",
      color: "#166534"
    }
  ];

  const nextStep = () => { if (currentStep < caseStudies.length - 1) { setCurrentStep(currentStep + 1); setSelectedImg(null); } };
  const prevStep = () => { if (currentStep > 0) { setCurrentStep(currentStep - 1); setSelectedImg(null); } };

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
      {selectedImg && (
        <div onClick={() => setSelectedImg(null)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.95)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', cursor: 'zoom-out' }}>
          <button style={{ position: 'absolute', top: '30px', right: '30px', background: 'white', border: 'none', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiX size={24} /></button>
          <img src={`/src/assets/case/${selectedImg}`} alt="Large" style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain', borderRadius: '12px' }} onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* --- HEADER --- */}
      <header className="edu-topbar">
        <div className="edu-topbar__inner">
          <div className="homebar__brand">
            <img src={logo} alt="Logo" className="homebar__logo" />
            <div className="edu-brandtext">
              <div className="edu-brandtext__title">LearnSecure</div>
              <div className="edu-brandtext__subtitle">Group 4: Work & Finance Scams</div>
            </div>
          </div>
          <div className="edu-topbar__right">
            <div className="edu-userchip">
              <div className="edu-userchip__avatar"><FiUser /></div>
              <div className="edu-userchip__name">{studentName || "ผู้เรียน"}</div>
            </div>
            <button className="edu-btn edu-btn--danger" onClick={() => { supabase.auth.signOut(); navigate("/login"); }}><FiLogOut /></button>
          </div>
        </div>
      </header>

      <main className="edu-layout">
        <section className="edu-hero" style={{ marginBottom: '24px' }}>
          <div className="edu-hero__card">
            <div className="edu-hero__row">
              <div className="edu-hero__headline">
                <div className="edu-hero__title">กรณีศึกษา: กลโกงงาน & ธุรกรรมออนไลน์</div>
                <div className="edu-hero__sub">งานออนไลน์ปลอม สลิปปลอม และการหลอกลวงด้านการเงินดิจิทัล</div>
                <div className="edu-lessons__toolbar">
                  <button className="edu-btn edu-btn--back" onClick={() => navigate("/cybercases")}><FiChevronLeft /> ย้อนกลับ</button>
                  <button className="edu-btn edu-btn--ghost" onClick={() => navigate("/main")} style={{ marginLeft: 8 }}><FiHome /> หน้าหลัก</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="edu-panel1">
          <div className="edu-panel1__head">
            <div className="edu-panel1__title"><FiTarget /> {currentData.title}</div>
            <div style={{ background: '#f1f5f9', padding: '6px 14px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '700' }}>เคสที่: {currentStep + 1} / {caseStudies.length}</div>
          </div>

          <div className="cb-panel-body" style={{ padding: '40px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }}>
              
              {/* --- โซนหลักฐาน (รูปภาพ) --- */}
              <div onClick={() => setSelectedImg(currentData.images[0])} style={{ background: '#f8fafc', borderRadius: '24px', border: '2px solid #e2e8f0', height: '400px', overflow: 'hidden', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <img src={`/src/assets/case/${currentData.images[0]}`} alt="Evidence" style={{ maxWidth: '95%', maxHeight: '95%', objectFit: 'contain' }} />
                <div style={{ position: 'absolute', bottom: '15px', backgroundColor: 'rgba(15, 23, 42, 0.7)', color: 'white', padding: '10px 20px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiMaximize2 /> กดเพื่อตรวจสอบหลักฐาน
                </div>
              </div>

              {/* --- โซนอธิบาย --- */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ background: '#fff', padding: '30px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', marginBottom: '15px', fontSize: '1.2rem' }}><FiInfo color={currentData.color} /> รายละเอียดอุบัติการณ์</h4>
                  <p style={{ lineHeight: '1.8', color: '#475569', fontSize: '1.05rem' }}>{currentData.description}</p>
                </div>

                <div style={{ background: 'white', border: `1.5px solid ${currentData.color}`, borderLeftWidth: '10px', borderRadius: '20px', padding: '25px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: currentData.color, marginBottom: '10px' }}><FiShield /> บทเรียนและแนวทางป้องกัน</h4>
                  <p style={{ fontWeight: '700', color: '#0f172a', fontSize: '1.1rem' }}>{currentData.lesson}</p>
                </div>

                <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                  <button className="edu-btn edu-btn--ghost" onClick={prevStep} disabled={currentStep === 0} style={{ flex: 1, height: '55px' }}>ย้อนกลับ</button>
                  <button className="edu-btn" onClick={nextStep} disabled={currentStep === caseStudies.length - 1} style={{ flex: 1.5, height: '55px', background: currentStep === caseStudies.length - 1 ? '#cbd5e1' : currentData.color, color: 'white', fontWeight: 'bold' }}>เคสถัดไป <FiChevronRight /></button>
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>
    </div>
  );
}