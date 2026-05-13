import logo from "../assets/logo.png";
import manualPdf from "../assets/manual.pdf"; // นำเข้าไฟล์ PDF

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { FiUser, FiLock, FiLogIn, FiHelpCircle, FiShield, FiX } from "react-icons/fi";

export default function Login() {
  // ✅ router
  const navigate = useNavigate();

  // ✅ form state
  const [username, setUsername] = useState("user001");
  const [password, setPassword] = useState("");

  // ✅ ui state
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false); // ควบคุมการแสดง Popup

  // ✅ manual link
  const manualUrl = useMemo(() => "https://example.com/manual", []);

  /**
   * ✅ Login handler
   * - ใช้กับ <form onSubmit> เพื่อแก้ DOM warning และให้กด Enter แล้ว submit ได้ถูกต้อง
   * - แยก error 400/401 (รหัสผิด) ออกจาก 500 (Supabase Auth server/data มีปัญหา)
   */
  const onLogin = async (e) => {
    // ✅ กันหน้า reload จาก form submit
    e?.preventDefault?.();

    // ✅ reset ui
    setMsg("");
    setBusy(true);

    try {
      // ✅ validate input
      if (!username.trim() || !password) {
        throw new Error("กรุณากรอก username และรหัสผ่าน");
      }

      // ✅ แปลง username -> email (เช่น user001 -> user001@local.app)
      let email = username.trim().toLowerCase();
      if (!email.includes("@")) {
        email = `${email}@local.app`;
      }

      // ✅ debug แบบไม่โชว์รหัสจริง
      console.log("DEBUG INPUT:", { username, password: "***" });
      console.log("DEBUG EMAIL:", email);
      console.log("DEBUG: about to signIn");

      // ✅ login ด้วย Supabase Auth
      const { data: authData, error: loginError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      console.log("DEBUG signIn result:", { authData, loginError });

      // ✅ handle login error แบบแยกประเภท
      if (loginError) {
        const status = loginError.status; // บางเวอร์ชันอาจมี/ไม่มี

        console.error("SUPABASE LOGIN ERROR:", loginError);

        // ✅ รหัสผิด/ไม่อนุญาต (มักเป็น 400/401)
        if (status === 400 || status === 401) {
          throw new Error("Username หรือ Password ไม่ถูกต้อง");
        }

        // ✅ 500 = server/data auth มีปัญหา (กรณีของคุณ)
        if (status === 500) {
          throw new Error(
            "Supabase Auth ตอบกลับ 500 (Server Error) — มักเกิดจากการ seed ผู้ใช้ลง auth.* โดยตรงจนข้อมูลไม่สอดคล้อง"
          );
        }

        // ✅ กรณีอื่น ๆ แสดงข้อความจริงจากระบบ
        throw new Error(loginError.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
      }

      // ✅ ต้องมี user
      if (!authData?.user) throw new Error("ไม่พบข้อมูลผู้ใช้");

      // ✅ ดึง session (optional แต่ช่วย debug ได้)
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) {
        console.error("SESSION ERROR:", sessionError);
        throw new Error("ไม่สามารถดึง session ได้");
      }

      const session = sessionData?.session;

      console.log("DEBUG session:", session);
      console.log("DEBUG access_token:", session?.access_token);

      // ✅ ต้องมี access token
      if (!session?.access_token) {
        throw new Error("ไม่สามารถสร้าง access token ได้");
      }

      // ✅ เช็ก role จาก user_profiles
      const { data: profile, error: roleError } = await supabase
        .from("user_profiles")
        .select("is_admin")
        .eq("user_id", authData.user.id)
        .single();

      console.log("DEBUG profile:", profile, roleError);

      // ✅ ถ้าไม่เจอโปรไฟล์ → sign out แล้วแจ้ง error
      if (roleError || !profile) {
        await supabase.auth.signOut();
        throw new Error("ไม่พบข้อมูลสิทธิ์การใช้งาน (user_profiles)");
      }

      // ✅ กัน admin ล็อกอินผิดหน้า
      if (profile.is_admin === true) {
        await supabase.auth.signOut();
        throw new Error("บัญชี Admin กรุณาเข้าใช้งานผ่านหน้า Login ผู้ดูแลระบบ");
      }

      // ✅ login สำเร็จ
      navigate("/profile", { replace: true });
    } catch (err) {
      console.error("Login Error:", err);
      setMsg(err?.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg">
      <div className="shell">
        <div className="card">
          <div className="topRow">
            <div>
              <h1 className="title">
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <img
                    src={logo}
                    alt="LearnSecure"
                    style={{ width: 65, height: 65, objectFit: "contain" }}
                  />
                  LearnSecure
                </span>
              </h1>
              <p className="subtitle">เข้าสู่ระบบเพื่อเริ่มทำแบบทดสอบ</p>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              {/* ✅ ปุ่มแจ้งเรื่องความเป็นส่วนตัว (Privacy Popup) */}
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowPrivacy(true)}
                style={{
                  height: "fit-content",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "0.9rem",
                  padding: "8px 12px",
                  cursor: "pointer"
                }}
              >
                <FiShield />
                ความเป็นส่วนตัว
              </button>

              <a
                href={manualPdf} // ใช้ตัวแปรที่ import มา
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary"
                style={{
                  height: "fit-content",
                  textDecoration: "none",
                  display: "inline-flex",   // เพิ่มเพื่อให้ Icon กับ Text อยู่แถวเดียวกัน
                  alignItems: "center",     // จัดให้อยู่กึ่งกลางแนวตั้ง
                  gap: "8px",               // เว้นระยะห่างระหว่าง Icon กับข้อความ
                  fontSize: "0.9rem",
                  padding: "8px 12px"
                }}
                title="เปิดคู่มือการใช้งาน"
              >
                <FiHelpCircle />
                คู่มือใช้งาน
              </a>
            </div>
          </div>

          {/* ✅ แก้ DOM warning: ใส่ form ครอบ */}
          <form
            className="form"
            onSubmit={onLogin}
            style={{ maxWidth: "400px", margin: "0 auto" }}
          >
            <div>
              <label className="label">
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <FiUser />
                  Username
                </span>
              </label>
              <input
                className="input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="เช่น user001"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="label">
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <FiLock />
                  Password
                </span>
              </label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="รหัสผ่านของคุณ"
                autoComplete="current-password"
              />
            </div>

            <div className="actions" style={{ textAlign: "center" }}>
              {/* ✅ submit ผ่าน form */}
              <button
                className="btn btn-primary"
                type="submit"
                disabled={busy}
                style={{ width: "100%" }}
              >
                <FiLogIn />
                {busy ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </button>
            </div>

            {msg && <div className="alert-error">{msg}</div>}

            <div
              className="footerNote"
              style={{ textAlign: "center", marginTop: "20px" }}
            >
              ระบบทดลองเพื่อการศึกษา — บัญชีผู้ใช้ถูกสร้างไว้ล่วงหน้าโดยผู้ดูแล
            </div>
          </form>
        </div>
      </div>

      {/* ✅ Privacy Policy Popup (Modal) */}
      {showPrivacy && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: "20px"
        }}>
          <div style={{
            backgroundColor: "#fff", padding: "30px", borderRadius: "16px",
            maxWidth: "550px", width: "100%", position: "relative",
            boxShadow: "0 20px 40px rgba(0,0,0,0.3)", border: "1px solid #eee"
          }}>
            <button 
              onClick={() => setShowPrivacy(false)}
              style={{
                position: "absolute", top: "15px", right: "15px",
                background: "none", border: "none", fontSize: "24px",
                cursor: "pointer", color: "#999"
              }}
            >
              <FiX />
            </button>
            
            <h2 style={{ marginTop: 0, color: "#1e40af", display: "flex", alignItems: "center", gap: "12px" }}>
              <FiShield /> ข้อตกลงความเป็นส่วนตัว
            </h2>
            
            <div style={{ color: "#374151", lineHeight: "1.7", marginTop: "20px", fontSize: "0.95rem" }}>
              <p style={{ fontWeight: "bold", marginBottom: "10px" }}>ถึง ผู้เข้าร่วมการวิจัยทุกท่าน (อายุ 15-18 ปี):</p>
              <p>เพื่อให้การศึกษาวิจัยครั้งนี้เป็นไปตามหลักจริยธรรมและถูกต้องแม่นยำ ระบบมีความจำเป็นต้องขอข้อมูล <strong>"ชื่อ-นามสกุล และอายุ"</strong> ของท่านในขั้นตอนลงทะเบียน</p>
              
              <div style={{ backgroundColor: "#f8fafc", padding: "15px", borderRadius: "8px", borderLeft: "4px solid #3b82f6", margin: "15px 0" }}>
                <p style={{ margin: 0 }}><strong>การรักษาความลับ:</strong> ระบบจะ <strong>ไม่เปิดเผย</strong> ชื่อจริง-นามสกุลของท่านสู่สาธารณะหรือในรายงานวิจัยโดยเด็ดขาด</p>
              </div>

              <ul style={{ paddingLeft: "20px" }}>
                <li>ในหน้าแสดงลำดับคะแนนหรือสรุปผล ระบบจะใช้ชื่อแฝง <strong>user001 ถึง user040</strong> แทนชื่อจริงเสมอ</li>
                <li>ข้อมูลส่วนตัวของท่านจะถูกเก็บเป็นความลับสูงสุดและเข้าถึงได้เฉพาะผู้วิจัยเท่านั้น</li>
                <li>ข้อมูลจะถูกนำไปใช้วิเคราะห์ในภาพรวมเพื่อการพัฒนาสื่อการเรียนรู้ในงานวิจัยนี้เท่านั้น</li>
              </ul>
            </div>

            <button 
              className="btn btn-primary" 
              onClick={() => setShowPrivacy(false)}
              style={{ width: "100%", marginTop: "25px", padding: "12px", fontSize: "1rem" }}
            >
              รับทราบและยินยอมให้ข้อมูล
            </button>
          </div>
        </div>
      )}
    </div>
  );
}