// pages/Unit2/Examples.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

// ✅ Assets
import logo from "../../assets/logo.png";

// ✅ CSS (ใช้ชุดเดียวกับหน้าอื่น)
import "../../main.css";
import "../Unit1/learn.css";

// ✅ Icons
import {
  FiChevronLeft,
  FiChevronRight,
  FiHome,
  FiLogOut,
  FiUser,
  FiAlertTriangle,
  FiCheckCircle,
  FiShield,
  FiEye,
  FiLock,
} from "react-icons/fi";

/* ------------------------------------------------------------------ */
/* 🎨 CSS Styles (Scoped in File)                                   */
/* ------------------------------------------------------------------ */
const styles = {
  container: {
    padding: "16px",
    display: "grid",
    gap: "20px",
  },
  card: {
    borderRadius: "24px",
    border: "1px solid rgba(0,0,0,0.08)",
    background: "rgba(255,255,255,0.7)",
    backdropFilter: "blur(10px)",
    padding: "20px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.05)",
    transition: "transform 0.2s ease",
  },
  redFlag: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "#fee2e2",
    color: "#dc2626",
    padding: "6px 14px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "bold",
    marginBottom: "12px",
  },
  mockLabel: {
    fontSize: "14px",
    fontWeight: "900",
    marginBottom: "12px",
    color: "#1e293b",
    display: "flex",
    alignItems: "center",
    gap: "8px"
  }
};

/* ------------------------------------------------------------------ */
/* ✅ Enhanced SVG Mockups (เน้นสมจริง)                                */
/* ------------------------------------------------------------------ */

const SmsPhishingMock = () => (
  <svg viewBox="0 0 820 420" width="100%" height="auto" role="img" style={{ borderRadius: '16px', border: '1px solid #e2e8f0' }}>
    <rect width="820" height="420" fill="#f8fafc" />
    {/* Header */}
    <rect width="820" height="60" fill="#ffffff" />
    <circle cx="40" cy="30" r="15" fill="#e2e8f0" />
    <text x="65" y="35" fontSize="18" fontWeight="bold" fill="#1e293b">Flash Express (SMS ปลอม)</text>
    
    {/* Message Bubble */}
    <rect x="40" y="80" width="600" height="150" rx="20" fill="#ffffff" stroke="#e2e8f0" />
    <text x="70" y="120" fontSize="20" fontWeight="bold" fill="#1e293b">พัสดุของคุณจัดส่งไม่สำเร็จ!</text>
    <text x="70" y="155" fontSize="18" fill="#64748b">เนื่องจากข้อมูลที่อยู่ไม่ถูกต้อง กรุณาอัปเดตที่:</text>
    <text x="70" y="190" fontSize="18" fill="#2563eb" fontWeight="bold">https://bit.ly/th-flash-update</text>

    {/* Danger Zones */}
    <rect x="65" y="165" width="280" height="35" rx="8" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="5,5" />
    <text x="360" y="188" fontSize="14" fontWeight="bold" fill="#ef4444">← ลิงก์ย่อแปลกปลอม (จุดสังเกตหลัก)</text>
    
    <path d="M40 230 L30 245 L55 230" fill="#ffffff" stroke="#e2e8f0" />
  </svg>
);

const FakeWebsiteMock = () => (
  <svg viewBox="0 0 820 420" width="100%" height="auto" role="img" style={{ borderRadius: '16px', border: '1px solid #e2e8f0' }}>
    <rect width="820" height="420" fill="#ffffff" />
    {/* Browser Bar */}
    <rect width="820" height="50" fill="#e2e8f0" />
    <circle cx="25" cy="25" r="6" fill="#ff5f57" />
    <circle cx="45" cy="25" r="6" fill="#febc2e" />
    <circle cx="65" cy="25" r="6" fill="#28c841" />
    <rect x="100" y="10" width="600" height="30" rx="15" fill="#ffffff" />
    <text x="120" y="30" fontSize="14" fill="#ef4444" fontWeight="bold">https://www.k-bnak-online.com/login</text>
    
    {/* Content */}
    <rect x="210" y="100" width="400" height="250" rx="12" fill="#f8fafc" stroke="#e2e8f0" />
    <text x="410" y="140" fontSize="22" fontWeight="bold" fill="#1e293b" textAnchor="middle">เข้าสู่ระบบ K-Banking</text>
    <rect x="250" y="170" width="320" height="45" rx="8" fill="#ffffff" stroke="#cbd5e1" />
    <text x="265" y="198" fontSize="16" fill="#94a3b8">เลขบัญชี / ชื่อผู้ใช้งาน</text>
    <rect x="250" y="230" width="320" height="45" rx="8" fill="#ffffff" stroke="#cbd5e1" />
    <text x="265" y="258" fontSize="16" fill="#94a3b8">รหัสผ่าน</text>
    <rect x="250" y="290" width="320" height="45" rx="8" fill="#059669" />
    <text x="410" y="318" fontSize="18" fontWeight="bold" fill="#ffffff" textAnchor="middle">ตกลง</text>

    {/* Alert Label */}
    <rect x="110" y="10" width="180" height="30" fill="none" stroke="#ef4444" strokeWidth="2" />
    <text x="710" y="30" fontSize="14" fontWeight="black" fill="#ef4444">สะกดผิด! (bnak)</text>
  </svg>
);

const MalwareMock = () => (
  <svg viewBox="0 0 820 420" width="100%" height="auto" role="img" style={{ borderRadius: '16px' }}>
    <rect width="820" height="420" fill="#1e1e1e" />
    <text x="410" y="100" fontSize="35" fontWeight="black" fill="#ef4444" textAnchor="middle">YOUR FILES ARE ENCRYPTED!</text>
    <rect x="110" y="130" width="600" height="2" fill="#ef4444" />
    
    <text x="410" y="180" fontSize="20" fill="#ffffff" textAnchor="middle">ไฟล์งานและรูปภาพทั้งหมดของคุณถูกล็อคแล้ว</text>
    <text x="410" y="215" fontSize="18" fill="#cbd5e1" textAnchor="middle">หากต้องการกู้ข้อมูลคืน กรุณาจ่าย 0.1 BTC ไปที่:</text>
    
    <rect x="160" y="240" width="500" height="50" rx="8" fill="#334155" />
    <text x="410" y="272" fontSize="16" fill="#fbbf24" fontWeight="bold" textAnchor="middle" fontFamily="monospace">bc1qxy2kgdy627zx4p9qre...</text>
    
    <text x="410" y="330" fontSize="16" fill="#ef4444" fontWeight="bold" textAnchor="middle">เหลือเวลาอีก: 47:59:59</text>
    
    <rect x="310" y="350" width="200" height="40" rx="20" fill="#ef4444" />
    <text x="410" y="375" fontSize="16" fontWeight="bold" fill="#ffffff" textAnchor="middle">HOW TO PAY?</text>
  </svg>
);

/* ------------------------------------------------------------------ */
/* ✅ หน้าหลักตัวอย่างภาพ: Unit2 Examples                              */
/* ------------------------------------------------------------------ */
const Unit2Examples = () => {
  const navigate = useNavigate();

  // ✅ UI state
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");

  // ✅ โหลดชื่อผู้เรียน
  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
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

    return () => { alive = false; };
  }, [navigate]);

  // ✅ ข้อมูลตัวอย่าง
  const EXAMPLES = useMemo(
    () => [
      {
        id: "ex1",
        title: "ตัวอย่างที่ 1: Smishing (SMS ฟิชชิ่ง)",
        desc: "หลอกว่าเป็นบริษัทขนส่ง หรือหน่วยงานรัฐ เพื่อให้กดลิงก์",
        note: [
          "ใช้เบอร์มือถือทั่วไปส่งมา (ไม่ใช่ชื่อหน่วยงาน)",
          "มีลิงก์ย่อ เช่น bit.ly หรือชื่อแปลกๆ",
          "มักอ้างว่า 'มีปัญหาด่วน' เพื่อให้เราตกใจ",
        ],
        render: <SmsPhishingMock />,
      },
      {
        id: "ex2",
        title: "ตัวอย่างที่ 2: Phishing Website (หน้าเว็บปลอม)",
        desc: "หน้าตาเหมือนเว็บธนาคารเป๊ะๆ แต่จุดตายคือ URL",
        note: [
          "ตัวสะกด URL ผิดเพี้ยน (เช่น bnak แทนที่จะเป็น bank)",
          "ไม่มีสัญลักษณ์กุญแจล็อก หรือ HTTPS ที่ถูกต้อง",
          "หน้าเว็บมักจะบังคับให้กรอก OTP ทันทีที่เข้า",
        ],
        render: <FakeWebsiteMock />,
      },
      {
        id: "ex3",
        title: "ตัวอย่างที่ 3: Ransomware (มัลแวร์เรียกค่าไถ่)",
        desc: "ตัวอย่างหน้าจอเมื่อเครื่องโดนไวรัสล็อคไฟล์",
        note: [
          "ไฟล์จะนามสกุลเปลี่ยนไป เปิดไม่ได้",
          "มีข้อความข่มขู่เรียกเงินเป็น Bitcoin",
          "เกิดจากการเผลอไปโหลดโปรแกรมเถื่อนหรือไฟล์แปลกๆ",
        ],
        render: <MalwareMock />,
      },
    ],
    []
  );

  return (
    <div className="edu-app">
      {/* ✅ TOPBAR */}
      <header className="edu-topbar">
        <div className="edu-topbar__inner">
          <div className="homebar__brand" role="banner">
            <img src={logo} alt="LearnSecure logo" className="homebar__logo" />
            <div className="edu-brandtext">
              <div className="edu-brandtext__title">LearnSecure</div>
              <div className="edu-brandtext__subtitle">Unit 2: Case Studies</div>
            </div>
          </div>

          <div className="edu-topbar__right">
            <div className="edu-userchip" title={studentName || "Student"}>
              <div className="edu-userchip__avatar" aria-hidden="true">
                <FiUser />
              </div>
              <div className="edu-userchip__meta">
                <div className="edu-userchip__name">{loading ? "กำลังโหลด..." : studentName || "ผู้เรียน"}</div>
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
              <FiLogOut aria-hidden="true" />
              ออกจากระบบ
            </button>
          </div>
        </div>
      </header>

      <main className="edu-layout">
        {/* ✅ HERO */}
        <section className="edu-hero" aria-label="Unit 2 examples header">
          <div className="edu-hero__card" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white' }}>
            <div className="edu-hero__row">
              <div className="edu-hero__headline">
                <div className="edu-hero__title" style={{ color: '#f8fafc' }}>
                   เรียนรู้จาก "ของจริง"
                </div>
                <p style={{ opacity: 0.8, marginTop: '8px' }}>จำหน้าตามิจฉาชีพให้แม่น ก่อนจะตกเป็นเหยื่อ</p>

                <div className="edu-lessons__toolbar" style={{ marginTop: '20px' }}>
                  <button className="edu-btn edu-btn--ghost" type="button" onClick={() => navigate(-1)} style={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}>
                    <FiChevronLeft aria-hidden="true" /> กลับ
                  </button>
                  <button className="edu-btn edu-btn--ghost" type="button" onClick={() => navigate("/main")} style={{ marginLeft: 8, color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}>
                    <FiHome aria-hidden="true" /> กลับหน้าหลัก
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ✅ CONTENT */}
        <section className="edu-panel1">
          <div className="edu-panel1__head">
            <div className="edu-panel1__title">
              <FiShield style={{ color: '#10b981' }} />
              จุดสังเกตสำคัญ (Red Flags)
            </div>
          </div>

          <div style={styles.container}>
            {/* ✅ คำแนะนำรวม */}
            <div style={{ ...styles.card, background: '#f0fdf4', border: '1px solid #dcfce7' }}>
              <div style={{ display: "flex", gap: "12px" }}>
                <FiAlertTriangle style={{ color: '#15803d', fontSize: '24px' }} />
                <div>
                  <div style={{ fontWeight: "900", color: "#166534", marginBottom: "4px" }}>คาถาป้องกันตัว</div>
                  <div style={{ fontSize: "14px", color: "#166534", lineHeight: "1.6" }}>
                    "ไม่เชื่อ ไม่รีบ ไม่โอน" หากเจอลิงก์ให้กรอกข้อมูลสำคัญ ให้หยุดแล้วตรวจสอบ URL หรือโทรเช็คกับหน่วยงานโดยตรงทันที
                  </div>
                </div>
              </div>
            </div>

            {/* ✅ รายการตัวอย่าง */}
            {EXAMPLES.map((ex) => (
              <div key={ex.id} style={styles.card}>
                <div style={styles.mockLabel}>
                  <FiEye /> {ex.title}
                </div>
                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>{ex.desc}</p>

                {/* แถบแจ้งเตือนจุดผิด */}
                <div style={styles.redFlag}>
                  <FiAlertTriangle /> อย่ากดเด็ดขาด!
                </div>

                {/* ตัวอย่างภาพ */}
                <div style={{ borderRadius: "16px", overflow: "hidden", marginBottom: "16px", background: '#000' }}>
                  {ex.render}
                </div>

                {/* รายละเอียดจุดสังเกต */}
                <div style={{ background: 'rgba(0,0,0,0.03)', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '8px', color: '#1e293b' }}>
                    <FiLock style={{ display: 'inline', marginRight: '5px' }} /> วิธีเช็ค:
                  </div>
                  {ex.note.map((n, i) => (
                    <div key={i} style={{ fontSize: "13px", color: "#475569", marginBottom: "4px", display: 'flex', gap: '8px' }}>
                      <span>•</span> {n}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* ✅ ปุ่มนำทางท้ายหน้า */}
            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", marginTop: "20px" }}>

              <button className="edu-btn edu-btn--ghost" type="button" style={{ flex: 1 }} onClick={() => navigate("/unit2/learn", { replace: true })}>
                ไปเรียนเนื้อหาถัดไป <FiChevronRight />
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8', fontSize: '12px' }}>
        LearnSecure Cyber Literacy Project &copy; 2026
      </footer>
    </div>
  );
};

export default Unit2Examples;