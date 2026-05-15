import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import logo from "../../assets/logo.png";

import "../../main.css";
import "../Cybercases.css"; 

import {
  FiChevronLeft, FiChevronRight, FiHome, FiLogOut, FiUser,
  FiInfo, FiShield, FiTarget, FiMaximize2, FiX, FiPlayCircle, FiYoutube
} from "react-icons/fi";

export default function Group3() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedImg, setSelectedImg] = useState(null); 
  const [activeVideo, setActiveVideo] = useState(null); 

  const caseStudies = [
    {
      title: "กรณีศึกษาที่ 11: การปลอมแปลงใบหน้าและอัตลักษณ์ (Deepfake Video Call)",
      image: "11.jpg",
      video: "11.mp4",
      description: "มิจฉาชีพใช้เทคโนโลยี AI ขั้นสูงในการสร้างใบหน้าและขยับปากให้ตรงกับเสียงแอบอ้างเป็นเจ้าหน้าที่ตำรวจ เพื่อทำการ Video Call มาข่มขู่ให้เหยื่อโอนเงินตรวจสอบ",
      lesson: "เทคโนโลยีปัจจุบันสามารถปลอมแปลงใบหน้าและเสียงได้แบบเรียลไทม์ 'การเห็นหน้าไม่เท่ากับตัวจริง' หากมีการอ้างถึงการโอนเงิน ให้สันนิษฐานว่าเป็นมิจฉาชีพ",
      color: "#be123c"
    },
    {
      title: "กรณีศึกษาที่ 12: การเลียนแบบเสียงเสมือนจริง (AI Voice Cloning)",
      youtubeId: "yLJVkad87sc",
      description: "กรณีมิจฉาชีพใช้ AI เลียนเสียงลูกชายโทรไปหลอกพ่อว่าถูกจับตัวไว้ โดยเสียงมีความใกล้เคียงกับเสียงจริงจนแยกได้ยาก เพื่อให้เหยื่อรีบโอนเงินช่วยเหลือ",
      lesson: "หากได้รับสายขอความช่วยเหลือที่น่าสงสัย ให้ตั้งสติและ 'โทรกลับไปยืนยันผ่านเบอร์ส่วนตัว' หรือช่องทางอื่นทันทีเพื่อยืนยันตัวตน",
      color: "#5b21b6"
    }
  ];

  const nextStep = () => { if (currentStep < caseStudies.length - 1) { setCurrentStep(currentStep + 1); setSelectedImg(null); setActiveVideo(null); } };
  const prevStep = () => { if (currentStep > 0) { setCurrentStep(currentStep - 1); setSelectedImg(null); setActiveVideo(null); } };

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
        <div onClick={() => setSelectedImg(null)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.95)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', cursor: 'zoom-out' }}>
          <button style={{ position: 'absolute', top: '30px', right: '30px', background: 'white', border: 'none', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><FiX size={24} /></button>
          <img src={`/src/assets/case/${selectedImg}`} alt="Large" style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain', borderRadius: '12px' }} onClick={(e) => e.stopPropagation()} />
        </div>
      )}

{/* --- MODAL POPUP (วิดีโอ) --- */}
{activeVideo && (
  <div onClick={() => setActiveVideo(null)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.9)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
    <button style={{ position: 'absolute', top: '30px', right: '30px', background: 'white', border: 'none', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10000 }}><FiX size={24} /></button>
    
    <div 
      onClick={(e) => e.stopPropagation()} 
      style={{ 
        // 🔹 จุดสำคัญ: ถ้าเป็นวิดีโอแนวตั้ง (Case 11) ให้คุมความกว้างแค่ 300-350px ก็พอ
        width: currentStep === 0 ? '320px' : '70%', 
        maxWidth: currentStep === 0 ? '90vw' : '750px',
        // 🔹 คุมความสูงไม่ให้เกิน 80% ของความสูงหน้าจอ
        maxHeight: '85vh', 
        aspectRatio: currentStep === 0 ? '9/16' : '16/9', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {currentStep === 1 ? ( 
        <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1`} frameBorder="0" allowFullScreen style={{ borderRadius: '16px' }}></iframe>
      ) : ( 
        <video 
          src={`/src/assets/case/${activeVideo}`} 
          controls 
          autoPlay 
          style={{ 
            width: '100%', 
            height: '100%', // ให้สูงตามตัวหุ้ม
            objectFit: 'contain', // รักษาทรงวิดีโอ
            borderRadius: '16px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)' 
          }} 
        />
      )}
    </div>
  </div>
)}

      <header className="edu-topbar">
        <div className="edu-topbar__inner">
          <div className="homebar__brand">
            <img src={logo} alt="Logo" className="homebar__logo" />
            <div className="edu-brandtext">
              <div className="edu-brandtext__title">LearnSecure</div>
              <div className="edu-brandtext__subtitle">Group 3: AI Scams</div>
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
                <div className="edu-hero__title">กรณีศึกษา: AI และตัวตนปลอมแปลง</div>
                <div className="edu-hero__sub">Deepfake เสียงปลอม และการสวมรอยด้วยปัญญาประดิษฐ์</div>
                <div className="edu-lessons__toolbar">
                  <button className="edu-btn edu-btn--back" onClick={() => navigate("/cybercases")}>ย้อนกลับ</button>
                  <button className="edu-btn edu-btn--ghost" onClick={() => navigate("/main")} style={{ marginLeft: 8 }}>หน้าหลัก</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="edu-panel1">
          <div className="edu-panel1__head">
            <div className="edu-panel1__title"><FiTarget /> {currentData.title}</div>
            <div style={{ background: '#f1f5f9', padding: '6px 14px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '700' }}>คดีที่: {currentStep + 1} / 2</div>
          </div>

          <div className="cb-panel-body" style={{ padding: '40px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }}>
              
              {/* --- โซนหลักฐาน (แก้ไขข้อ 2: ทำให้ YouTube ไม่โล้น) --- */}
              <div style={{ background: '#f8fafc', borderRadius: '24px', border: '2px solid #e2e8f0', height: '400px', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {currentStep === 0 ? (
                  /* เคส 11: รูปคู่ปุ่มวิดีโอ */
                  <div style={{ width: '100%', height: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                    <div onClick={() => setSelectedImg(currentData.image)} style={{ borderRight: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-in' }}>
                      <img src={`/src/assets/case/${currentData.image}`} alt="Evidence" style={{ maxWidth: '90%', maxHeight: '90%' }} />
                    </div>
                    <div onClick={() => setActiveVideo(currentData.video)} style={{ background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <FiPlayCircle size={60} color="white" />
                      <span style={{ color: 'white', marginTop: '15px', fontWeight: 'bold' }}>เล่นวิดีโอหลักฐาน</span>
                    </div>
                  </div>
                ) : (
                  /* เคส 12: YouTube Thumbnail (แก้ไขให้ไม่โล้น) */
                  <div onClick={() => setActiveVideo(currentData.youtubeId)} style={{ width: '100%', height: '100%', cursor: 'pointer', position: 'relative' }}>
                    <img src={`https://img.youtube.com/vi/${currentData.youtubeId}/maxresdefault.jpg`} alt="YT Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <FiYoutube size={70} color="#ff0000" />
                      <span style={{ color: 'white', marginTop: '15px', fontWeight: '800', fontSize: '1.2rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>คลิกเพื่อดูคลิปข่าวแจ้งเตือนภัย</span>
                    </div>
                  </div>
                )}
              </div>

              {/* --- โซนอธิบาย --- */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ background: '#fff', padding: '30px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', marginBottom: '15px', fontSize: '1.2rem' }}><FiInfo color={currentData.color} /> รายละเอียดอุบัติการณ์</h4>
                  <p style={{ lineHeight: '1.8', color: '#475569', fontSize: '1.05rem' }}>{currentData.description}</p>
                </div>

                <div style={{ background: 'white', border: `1.5px solid ${currentData.color}`, borderLeftWidth: '10px', borderRadius: '20px', padding: '25px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: currentData.color, marginBottom: '10px' }}><FiShield /> บทเรียนที่ได้รับ</h4>
                  <p style={{ fontWeight: '700', color: '#0f172a', fontSize: '1.1rem' }}>{currentData.lesson}</p>
                </div>

                <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                  <button className="edu-btn edu-btn--ghost" onClick={prevStep} disabled={currentStep === 0} style={{ flex: 1, height: '55px' }}>ย้อนกลับ</button>
                  <button className="edu-btn" onClick={nextStep} disabled={currentStep === caseStudies.length - 1} style={{ flex: 1.5, height: '55px', background: currentStep === caseStudies.length - 1 ? '#cbd5e1' : currentData.color, color: 'white', fontWeight: 'bold' }}>คดีถัดไป <FiChevronRight /></button>
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>
    </div>
  );
}