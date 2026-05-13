import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import logo from "../../assets/logo.png";

import "../../main.css";
import "../cybercases.css"; 

import {
  FiChevronLeft, FiChevronRight, FiHome, FiLogOut, FiUser,
  FiInfo, FiShield, FiTarget, FiMaximize2, FiX, FiCpu, FiMail, FiAlertOctagon
} from "react-icons/fi";

export default function Group6() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedImg, setSelectedImg] = useState(null);

  const caseStudies = [
    {
      title: "กรณีศึกษาที่ 19: อันตรายจากแอปพลิเคชันนอกสโตร์ (.APK Custom Apps)",
      images: ["19.png"],
      description: "การติดตั้งไฟล์ .APK ที่ไม่ได้ผ่านการตรวจสอบจาก Official Store (เช่น Google Play) มักมีการฝังมัลแวร์เพื่อดักจับรหัสผ่าน, อ่าน SMS, ดูดรหัส OTP หรือแม้แต่ควบคุมเครื่องจากระยะไกล โดยแอปฯ มักจูงใจด้วยฟีเจอร์โกงเกมหรือใช้ฟรี",
      lesson: "ความเข้าใจผิดว่า 'แอปใช้งานได้ปกติแปลว่าปลอดภัย' คือจุดตาย แอปเถื่อนมักทำงานเบื้องหลังเงียบๆ เพื่อขโมยข้อมูล แอปพลิเคชันคือ 'โค้ด' ที่สามารถสั่งการเครื่องเราได้ทุกอย่างหากได้รับสิทธิ์",
      color: "#991b1b"
    },
    {
      title: "กรณีศึกษาที่ 20: อีเมลข่มขู่รีดไถข้อมูล (Email Extortion & Ransom)",
      images: ["20.jpg", "20.png"], // รองรับ 2 รูปตามที่พี่บอก (ใช้ชื่อไฟล์ที่พี่ส่งมา)
      description: "มิจฉาชีพส่งอีเมลแอบอ้างว่าสามารถเจาะระบบคอมพิวเตอร์และมีข้อมูลส่วนตัวหรือรหัสผ่านของผู้ใช้ โดยใช้เทคนิคจิตวิทยา (Social Engineering) ข่มขู่ให้โอนเงินหรือสินทรัพย์ดิจิทัลเพื่อแลกกับการไม่เปิดเผยข้อมูล",
      lesson: "อย่าตกใจเมื่อเห็นรหัสผ่านเก่าหลุดมาในเมล เพราะมักเป็นข้อมูลจากฐานข้อมูลเก่าที่เคยรั่วไหล วิธีแก้ที่ดีที่สุดคือ 'เปลี่ยนรหัสผ่านทันที' และตั้งค่าการยืนยันตัวตน 2 ชั้น (2FA) โดยห้ามโอนเงินเด็ดขาด",
      color: "#1e293b"
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
        <div onClick={() => setSelectedImg(null)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.95)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', cursor: 'zoom-out', padding: '20px' }}>
          <button style={{ position: 'absolute', top: '30px', right: '30px', background: 'white', border: 'none', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiX size={24} /></button>
          <img src={`/src/assets/case/${selectedImg}`} alt="Evidence" style={{ maxWidth: '85%', maxHeight: '85%', objectFit: 'contain', borderRadius: '12px' }} onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* --- HEADER --- */}
      <header className="edu-topbar">
        <div className="edu-topbar__inner">
          <div className="homebar__brand">
            <img src={logo} alt="Logo" className="homebar__logo" />
            <div className="edu-brandtext">
              <div className="edu-brandtext__title">LearnSecure</div>
              <div className="edu-brandtext__subtitle">Group 6: System & Data Security</div>
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
                <div className="edu-hero__title">กรณีศึกษา : มัลแวร์ & แอปอันตราย</div>
                <div className="edu-hero__sub">แอปเถื่อน ไวรัส มัลแวร์ และการขโมยข้อมูลในอุปกรณ์</div>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px', alignItems: 'center' }}>
              
              {/* --- โซนหลักฐาน (รองรับ 1 หรือ 2 รูป) --- */}
              <div style={{ display: 'grid', gridTemplateColumns: currentData.images.length > 1 ? '1fr 1fr' : '1fr', gap: '15px' }}>
                {currentData.images.map((img, idx) => (
                  <div key={idx} onClick={() => setSelectedImg(img)} style={{ background: '#f8fafc', borderRadius: '24px', border: '2px solid #e2e8f0', height: '380px', overflow: 'hidden', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <img src={`/src/assets/case/${img}`} alt="Evidence" style={{ maxWidth: '95%', maxHeight: '95%', objectFit: 'contain' }} />
                    <div style={{ position: 'absolute', bottom: '15px', backgroundColor: 'rgba(15, 23, 42, 0.7)', color: 'white', padding: '8px 15px', borderRadius: '20px', fontSize: '0.8rem' }}><FiMaximize2 /> ขยาย</div>
                  </div>
                ))}
              </div>

              {/* --- โซนอธิบาย --- */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ background: '#fff', padding: '30px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', marginBottom: '15px' }}><FiInfo color={currentData.color} /> รายละเอียดทางเทคนิค</h4>
                  <p style={{ lineHeight: '1.8', color: '#475569', fontSize: '1rem' }}>{currentData.description}</p>
                </div>

                <div style={{ background: 'white', border: `1.5px solid ${currentData.color}`, borderLeftWidth: '10px', borderRadius: '20px', padding: '25px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: currentData.color, marginBottom: '10px' }}><FiShield /> แนวทางป้องกันและจุดสอน</h4>
                  <p style={{ fontWeight: '700', color: '#0f172a', fontSize: '1.05rem' }}>{currentData.lesson}</p>
                </div>

                <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                  <button className="edu-btn edu-btn--ghost" onClick={prevStep} disabled={currentStep === 0} style={{ flex: 1, height: '50px' }}>ย้อนกลับ</button>
                  <button className="edu-btn" onClick={nextStep} disabled={currentStep === caseStudies.length - 1} style={{ flex: 1.5, height: '50px', background: currentStep === caseStudies.length - 1 ? '#cbd5e1' : currentData.color, color: 'white' }}>เคสถัดไป <FiChevronRight /></button>
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>
    </div>
  );
}