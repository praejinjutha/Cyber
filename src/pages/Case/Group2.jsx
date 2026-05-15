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

export default function Group2() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedImg, setSelectedImg] = useState(null); // เก็บรูปที่กำลังขยาย

  const caseStudies = [
    {
      title: "กรณีศึกษาที่ 7: ล่อลวงด้วยเนื้อหาที่น่าสนใจ (Clickbait)",
      images: ["7.jpg"], // ปรับเป็น Array ทั้งหมด
      description: "การใช้พาดหัวข่าวหรือเนื้อหาที่กระตุ้นความอยากรู้อยากเห็น (เช่น คลิปหลุดหรือเหตุการณ์สำคัญ) เพื่อล่อให้เหยื่อคลิกเข้าไปยังเว็บไซต์ภายนอก ซึ่งมักจะนำพาไปสู่หน้าล็อกอินโซเชียลมีเดียปลอมเพื่อดักรับข้อมูลบัญชี",
      lesson: "ความอยากรู้คือจุดอ่อนที่มิจฉาชีพใช้บ่อยที่สุด ควรตรวจสอบที่มาของเว็บไซต์และ URL ก่อนคลิกเสมอ",
      color: "#0369a1"
    },
    {
      title: "กรณีศึกษาที่ 8: หน้าเว็บไซต์ล็อกอินเลียนแบบ (Login Phishing)",
      images: ["8.png"],
      description: "การสร้างหน้าเว็บไซต์ที่เลียนแบบหน้าล็อกอินของแพลตฟอร์มยอดนิยม โดยมีความเหมือนในเชิงกราฟิกเกือบ 100% เพื่อหลอกให้เหยื่อกรอกชื่อผู้ใช้และรหัสผ่านโดยไม่เฉลียวใจ",
      lesson: "ตรวจสอบแถบที่อยู่ (Address Bar) ทุกครั้ง เว็บไซต์ทางการต้องมีการเข้ารหัส (HTTPS) และสะกดชื่อโดเมนเนมอย่างถูกต้อง",
      color: "#1e293b"
    },
    {
      title: "กรณีศึกษาที่ 9: การเลียนแบบธุรกิจและเพจที่พักปลอม",
      images: ["9.jpg", "9.1.webp"], 
      description: "มิจฉาชีพสร้างเพจปลอมโดยคัดลอกรูปภาพและข้อมูลจากธุรกิจจริง (เช่น ที่พัก) และทำการปั๊มยอดผู้ติดตามเพื่อสร้างความน่าเชื่อถือเท็จ (Social Proof) เพื่อล่อลวงให้โอนเงินจองสินค้าหรือบริการที่ไม่มีอยู่จริง",
      lesson: "ตรวจสอบ 'ความโปร่งใสของเพจ' เพื่อดูประวัติการเปลี่ยนชื่อและวันที่สร้างเพจ และควรสังเกตความผิดปกติของราคาที่ถูกเกินจริง",
      color: "#166534"
    },
    {
      title: "กรณีศึกษาที่ 10: การแอบอ้างบุคคลสำคัญและรางวัลสมนาคุณ",
      images: ["10.1.jpg", "10.2.png"], 
      description: "การใช้ชื่อบุคคลที่มีชื่อเสียง (เช่น พิมรี่พาย) หรือการปลอมชื่อผู้ส่ง SMS (Sender ID) ให้ดูเหมือนมาจากหน่วยงานที่น่าเชื่อถือ เพื่อแจ้งข่าวดีเรื่องการได้รับรางวัลใหญ่หรือสิทธิ์พิเศษ",
      lesson: "บุคคลสาธารณะและหน่วยงานทางการจะไม่มีการแจ้งรับรางวัลผ่าน SMS ที่มีลิงก์ให้กรอกข้อมูลส่วนบุคคล หรือเรียกเก็บค่าธรรมเนียมก่อนการรับรางวัลทุกกรณี",
      color: "#be123c"
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
        <div onClick={() => setSelectedImg(null)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.95)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', cursor: 'zoom-out', padding: '40px' }}>
          <button style={{ position: 'absolute', top: '30px', right: '30px', background: 'white', border: 'none', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <FiX size={24} />
          </button>
          <img src={`/src/assets/case/${selectedImg}`} alt="Large" style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', borderRadius: '8px' }} onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* --- HEADER --- */}
      <header className="edu-topbar">
        <div className="edu-topbar__inner">
          <div className="homebar__brand">
            <img src={logo} alt="Logo" className="homebar__logo" />
            <div className="edu-brandtext">
              <div className="edu-brandtext__title">LearnSecure</div>
              <div className="edu-brandtext__subtitle">Group 2: Social Traps</div>
            </div>
          </div>
          <div className="edu-topbar__right">
            <div className="edu-userchip">
              <div className="edu-userchip__avatar"><FiUser /></div>
              <div className="edu-userchip__name">{studentName || "ผู้เรียน"}</div>
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
                <div className="edu-hero__title">กรณีศึกษา: กับดักโซเชียล & คอนเทนต์หลอก</div>
                <div className="edu-hero__sub">ข่าวปลอม เพจปลอม Clickbait และการหลอกลวงผ่านโซเชียลมีเดีย</div>
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
            <div className="edu-panel1__title" style={{ fontSize: '1.15rem' }}>
              <FiTarget /> {currentData.title}
            </div>
            <div style={{ background: '#f1f5f9', padding: '6px 14px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '700' }}>
              ความคืบหน้า: {currentStep + 1} / {caseStudies.length}
            </div>
          </div>

          <div className="cb-panel-body" style={{ padding: '40px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px', alignItems: 'start' }}>
              
              {/* ส่วนรูปภาพ - รองรับ 1 หรือ 2 รูป */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: currentData.images.length > 1 ? '1fr 1fr' : '1fr', 
                gap: '15px' 
              }}>
                {currentData.images.map((imgName, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setSelectedImg(imgName)}
                    style={{ 
                      background: '#f8fafc', borderRadius: '20px', overflow: 'hidden', border: '2px solid #e2e8f0', 
                      height: currentData.images.length > 1 ? '350px' : '420px', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' 
                    }}
                  >
                    <img src={`/src/assets/case/${imgName}`} alt="Case" style={{ maxWidth: '95%', maxHeight: '95%', objectFit: 'contain' }} />
                    <div style={{ position: 'absolute', bottom: '15px', right: '15px', backgroundColor: 'rgba(15, 23, 42, 0.7)', color: 'white', padding: '8px 15px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                      <FiMaximize2 /> ขยาย
                    </div>
                  </div>
                ))}
              </div>

              {/* ส่วนอธิบาย */}
              <div>
                <div style={{ marginBottom: '25px' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', marginBottom: '10px' }}>
                    <FiInfo color={currentData.color} /> รายละเอียดอุบัติการณ์
                  </h4>
                  <p style={{ lineHeight: '1.7', color: '#475569', fontSize: '1rem' }}>
                    {currentData.description}
                  </p>
                </div>

                <div style={{ background: 'white', border: `1.5px solid ${currentData.color}`, borderLeftWidth: '8px', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: currentData.color, marginBottom: '8px' }}>
                    <FiShield /> แนวทางตรวจสอบและป้องกัน
                  </h4>
                  <p style={{ fontWeight: '700', color: '#0f172a', fontSize: '1rem' }}>
                    {currentData.lesson}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '15px', marginTop: '35px' }}>
                  <button className="edu-btn edu-btn--ghost" onClick={prevStep} disabled={currentStep === 0} style={{ flex: 1, height: '48px' }}>
                    <FiChevronLeft /> ย้อนกลับ
                  </button>
                  <button className="edu-btn" onClick={nextStep} disabled={currentStep === caseStudies.length - 1} style={{ flex: 1.5, height: '48px', background: currentStep === caseStudies.length - 1 ? '#cbd5e1' : currentData.color, color: 'white', border: 'none' }}>
                    กรณีศึกษาถัดไป <FiChevronRight />
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