import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import logo from "../../assets/logo.png";

import "../../main.css";
import "../Cybercases.css"; 

import {
  FiChevronLeft, FiChevronRight, FiHome, FiLogOut, FiUser,
  FiInfo, FiShield, FiTarget, FiMaximize2, FiX, FiAlertTriangle, FiHeart
} from "react-icons/fi";


  export default function Group7() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedImg, setSelectedImg] = useState(null);

  const caseStudies = [
    {
      title: "กรณีศึกษาที่ 21: การข่มขู่รีดไถผ่านสื่อลามกอนาจาร (Sextortion)",
      image: "21.jpg",
      description: "มิจฉาชีพใช้วิธีสร้างความสัมพันธ์จนเหยื่อไว้วางใจ หรือแอบอ้างการจ้างงาน (เช่น ถ่ายแบบ) เพื่อหลอกให้เหยื่อส่งภาพหรือคลิปวิดีโอส่วนตัวที่เห็นร่างกาย ทันทีที่ได้รับข้อมูล มิจฉาชีพจะเปลี่ยนไปใช้การข่มขู่ว่าจะเผยแพร่สู่สาธารณะหรือส่งให้บุคคลใกล้ชิดเพื่อเรียกรับผลประโยชน์",
      lesson: "ร่างกายและภาพลักษณ์ส่วนตัวคือข้อมูลที่มีค่าสูงสุด เมื่อข้อมูลถูกส่งเข้าระบบออนไลน์แล้ว คุณจะสูญเสียอำนาจในการควบคุมข้อมูลนั้นทันที ห้ามยินยอมให้เงินตามคำขู่ เพราะมิจฉาชีพมักจะกลับมาข่มขู่ซ้ำและไม่ลบข้อมูลจริงตามที่อ้าง",
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
      {/* --- MODAL POPUP (รูปภาพ) --- */}
      {selectedImg && (
        <div onClick={() => setSelectedImg(null)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.95)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', cursor: 'zoom-out', padding: '20px' }}>
          <button style={{ position: 'absolute', top: '30px', right: '30px', background: 'white', border: 'none', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiX size={24} /></button>
          <img src={`/src/assets/case/${selectedImg}`} alt="Evidence" style={{ maxWidth: '80%', maxHeight: '85%', objectFit: 'contain', borderRadius: '12px' }} onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* --- HEADER --- */}
      <header className="edu-topbar">
        <div className="edu-topbar__inner">
          <div className="homebar__brand">
            <img src={logo} alt="Logo" className="homebar__logo" />
            <div className="edu-brandtext">
              <div className="edu-brandtext__title">LearnSecure</div>
              <div className="edu-brandtext__subtitle">Group 7: Cyber Exploitation</div>
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
                <div className="edu-hero__title">กรณีศึกษา : ภัยคุกคามทางเพศ & การแบล็กเมล</div>
                <div className="edu-hero__sub">การข่มขู่ คุกคาม และการเผยแพร่ข้อมูลหรือรูปภาพส่วนตัว</div>
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
            <div className="edu-panel1__title" style={{ color: '#be123c' }}><FiAlertTriangle /> {currentData.title}</div>
          </div>

          <div className="cb-panel-body" style={{ padding: '40px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '40px', alignItems: 'center' }}>
              
              {/* --- โซนหลักฐาน --- */}
              <div onClick={() => setSelectedImg(currentData.image)} style={{ background: '#fff1f2', borderRadius: '24px', border: '2px solid #fecdd3', height: '420px', overflow: 'hidden', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <img src={`/src/assets/case/${currentData.image}`} alt="Evidence" style={{ maxWidth: '95%', maxHeight: '95%', objectFit: 'contain' }} />
                <div style={{ position: 'absolute', bottom: '15px', backgroundColor: '#be123c', color: 'white', padding: '10px 20px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiMaximize2 /> ตรวจสอบจุดสังเกต
                </div>
              </div>

              {/* --- โซนอธิบาย --- */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ background: '#fff', padding: '30px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', marginBottom: '15px', fontSize: '1.2rem' }}><FiInfo color={currentData.color} /> รูปแบบการล่อลวง</h4>
                  <p style={{ lineHeight: '1.8', color: '#475569', fontSize: '1.05rem' }}>{currentData.description}</p>
                </div>

                <div style={{ background: '#fff1f2', border: `1.5px solid ${currentData.color}`, borderLeftWidth: '10px', borderRadius: '20px', padding: '25px' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: currentData.color, marginBottom: '10px' }}><FiShield /> แนวทางปฏิบัติเมื่อเกิดเหตุ</h4>
                  <p style={{ fontWeight: '700', color: '#0f172a', fontSize: '1.1rem', marginBottom: '10px' }}>{currentData.lesson}</p>
                  <div style={{ background: '#fff', padding: '15px', borderRadius: '12px', fontSize: '0.95rem', color: '#be123c', border: '1px solid #fecdd3' }}>
                    <strong>✅ วิธีแก้ปัญหา:</strong> รวบรวมหลักฐานหน้าจอ ปรึกษาผู้ใหญ่ที่ไว้ใจ หรือแจ้งตำรวจไซเบอร์ทันที อย่ารับมือเพียงลำพัง
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                  <button className="edu-btn edu-btn--ghost" onClick={() => navigate("/cybercases")} style={{ flex: 1, height: '55px' }}>จบการศึกษาหมวดกรณีศึกษา</button>
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>
    </div>
  );
}