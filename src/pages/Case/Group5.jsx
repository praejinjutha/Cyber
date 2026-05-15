import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import logo from "../../assets/logo.png";

import "../../main.css";
import "../Cybercases.css"; 

import {
  FiChevronLeft, FiChevronRight, FiHome, FiLogOut, FiUser,
  FiInfo, FiShield, FiTarget, FiMaximize2, FiX, FiCameraOff, FiAlertCircle
} from "react-icons/fi";

export default function Group5() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedImg, setSelectedImg] = useState(null);

  const caseStudies = [
    {
      title: "กรณีศึกษาที่ 16: การแคปแชทประจาน (Private Chat Exposure)",
      image: "16.png",
      description: "การนำบทสนทนาส่วนตัวที่คุยกันแบบเฉพาะเจาะจงมาเปิดเผยสู่สาธารณะ เพื่อวัตถุประสงค์ในการประจานหรือสร้างความอับอาย ซึ่งเป็นการละเมิดสิทธิส่วนบุคคลอย่างร้ายแรง",
      lesson: "บทสนทนาส่วนตัวมีกฎหมายคุ้มครอง การเผยแพร่โดยไม่ได้รับยินยอมอาจถูกฟ้องร้องฐานละเมิดและหมิ่นประมาทได้",
      color: "#e11d48"
    },
    {
      title: "กรณีศึกษาที่ 17: การแพร่กระจายข่าวลือเท็จ (Fake News & Misinformation)",
      image: "17.jpg",
      description: "การสร้างหรือส่งต่อข้อมูลที่บิดเบือนความจริง เพื่อสร้างกระแสในโลกออนไลน์ ซึ่งส่งผลให้บุคคลหรือหน่วยงานที่ตกเป็นข่าวได้รับความเสียหายอย่างมหาศาล",
      lesson: "การส่งต่อข้อมูลเท็จมีความผิดตาม พ.ร.บ. คอมพิวเตอร์ ควรตรวจสอบแหล่งที่มาจากสำนักข่าวที่น่าเชื่อถือทุกครั้งก่อนกดแชร์",
      color: "#d97706"
    },
    {
      title: "กรณีศึกษาที่ 18: การละเมิดความเป็นส่วนตัวในที่สาธารณะ (Privacy Over-Sharing)",
      image: "18.png",
      description: "การถ่ายภาพหรือวิดีโอเหตุการณ์รอบตัวในโรงเรียนหรือพื้นที่สาธารณะ แล้วนำไปโพสต์ลงโซเชียลเพื่อสร้างคอนเทนต์หรือร่วมดราม่า โดยไม่คำนึงถึงสิทธิของคนในภาพที่อาจได้รับความเสียหายในชีวิตจริง",
      lesson: "อย่าโพสต์เรื่องรอบตัวที่กระทบผู้อื่นเพียงเพื่อความสนุก สิ่งที่โพสต์จะกลายเป็น Digital Footprint ที่ลบไม่ออก และอาจส่งผลกระทบต่อประวัติการศึกษาและการทำงานในอนาคตของคุณเอง",
      color: "#4f46e5"
    },
    {
      title: "กรณีศึกษาที่ 22: ร่องรอยดิจิทัลจากความคึกคะนอง (Social Backlash)",
      image: "22.jpg",
      description: "การโพสต์ข้อความรุนแรงหรือทัศนคติที่ขาดความยั้งคิดในอดีต แม้เวลาจะผ่านไปหลายปี แต่ร่องรอยเหล่านั้นสามารถถูกขุดคุ้ยกลับมาทำลายโอกาสในปัจจุบันได้เสมอเมื่อเกิดปรากฏการณ์ 'ทัวร์ลง'",
      lesson: "อินเทอร์เน็ตไม่เคยลืมสิ่งที่โพสต์ไปแล้ว ข้อมูลเหล่านี้จะติดตัวคุณไปตลอด (Permanent Record) การคิดก่อนโพสต์จึงเป็นทักษะที่สำคัญที่สุดในยุคนี้",
      color: "#7c3aed"
    },
    {
      title: "กรณีศึกษาที่ 23: การด่าทอผ่านบัญชีอวตาร (Cyber Defamation)",
      image: "23.jpg",
      description: "การเข้าไปคอมเมนต์ด่าทอผู้อื่นด้วยถ้อยคำหยาบคายเพราะคิดว่าการใช้บัญชีปลอมจะทำให้ตามตัวไม่เจอ แต่ในทางกฎหมาย เจ้าหน้าที่สามารถสืบหาตัวตนที่แท้จริงได้ผ่านที่อยู่ IP",
      lesson: "เสรีภาพในการพิมพ์ต้องแลกมาด้วยความรับผิดชอบ 'ค่าปรับราคาแพง' เป็นเรื่องจริงที่เกิดขึ้นบ่อยครั้งในคดีหมิ่นประมาทออนไลน์",
      color: "#b91c1c"
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
              <div className="edu-brandtext__subtitle">Group 5: Digital Footprint</div>
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
                <div className="edu-hero__title">กรณีศึกษา : พฤติกรรมออนไลน์ & ร่องรอยดิจิทัล</div>
                <div className="edu-hero__sub">Cyberbullying การประจานออนไลน์ และผลกระทบจาก Digital Footprint</div>
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
            <div style={{ background: '#f1f5f9', padding: '6px 14px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '700' }}>คดีที่: {currentStep + 1} / {caseStudies.length}</div>
          </div>

          <div className="cb-panel-body" style={{ padding: '40px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }}>
              
              <div onClick={() => setSelectedImg(currentData.image)} style={{ background: '#f8fafc', borderRadius: '24px', border: '2px solid #e2e8f0', height: '400px', overflow: 'hidden', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <img src={`/src/assets/case/${currentData.image}`} alt="Evidence" style={{ maxWidth: '95%', maxHeight: '95%', objectFit: 'contain' }} />
                <div style={{ position: 'absolute', bottom: '15px', backgroundColor: 'rgba(15, 23, 42, 0.7)', color: 'white', padding: '10px 20px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiMaximize2 /> ตรวจสอบหลักฐาน
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ background: '#fff', padding: '30px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', marginBottom: '15px' }}><FiInfo color={currentData.color} /> รายละเอียดอุบัติการณ์</h4>
                  <p style={{ lineHeight: '1.8', color: '#475569', fontSize: '1.05rem' }}>{currentData.description}</p>
                </div>

                <div style={{ background: 'white', border: `1.5px solid ${currentData.color}`, borderLeftWidth: '10px', borderRadius: '20px', padding: '25px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: currentData.color, marginBottom: '10px' }}><FiShield /> บทเรียนสำคัญ</h4>
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