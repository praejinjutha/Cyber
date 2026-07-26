import logo from "../assets/logo.png";
import manualPdf from "../assets/manual.pdf"; // นำเข้าไฟล์ PDF

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  FiUser,
  FiLock,
  FiLogIn,
  FiHelpCircle,
  FiShield,
  FiX,
} from "react-icons/fi";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("user001");
  const [password, setPassword] = useState("");

  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const [profile, setProfile] = useState(null);

  const manualUrl = useMemo(() => "https://example.com/manual", []);

  const onLogin = async (e) => {
    e?.preventDefault?.();

    setMsg("");
    setBusy(true);

    try {
      if (!username.trim() || !password) {
        throw new Error("กรุณากรอก username และรหัสผ่าน");
      }

      let email = username.trim().toLowerCase();
      if (!email.includes("@")) {
        email = `${email}@local.app`;
      }

      console.log("DEBUG INPUT:", { username, password: "***" });
      console.log("DEBUG EMAIL:", email);

      const { data: authData, error: loginError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (loginError) throw loginError;
      if (!authData?.user) throw new Error("ไม่พบข้อมูลผู้ใช้");

      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      const session = sessionData?.session;

      if (!session?.access_token) {
        throw new Error("ไม่สามารถสร้าง access token ได้");
      }

      // 🔥 FIX: ต้องมี user_id ด้วย (ของเดิมคุณพังตรงนี้)
      const { data: profileData, error: profileError } = await supabase
        .from("user_profiles")
        .select("user_id, is_admin, privacy_accepted")
        .eq("user_id", authData.user.id)
        .single();

      console.log("DEBUG profile:", profileData, profileError);

      if (profileError || !profileData) {
        await supabase.auth.signOut();
        throw new Error("ไม่พบข้อมูลสิทธิ์การใช้งาน (user_profiles)");
      }

      setProfile(profileData);

      if (profileData.is_admin === true) {
        await supabase.auth.signOut();
        throw new Error("บัญชี Admin กรุณาเข้าใช้งานผ่านหน้า Login ผู้ดูแลระบบ");
      }

      // consent check (UI เดิมไม่เปลี่ยน)
      if (!profileData.privacy_accepted) {
        setShowPrivacy(true);
        setBusy(false);
        return;
      }

      navigate("/profile", { replace: true });
    } catch (err) {
      console.error("Login Error:", err);
      setMsg(err?.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setBusy(false);
    }
  };

  // 🔥 FIX ONLY (ไม่แตะ UI เดิม)
  const acceptPrivacy = async () => {
    try {
      if (!profile?.user_id) {
        throw new Error("ไม่พบ user_id");
      }

      const { error } = await supabase
        .from("user_profiles")
        .update({
          privacy_accepted: true,
          privacy_accepted_at: new Date().toISOString(),
        })
        .eq("user_id", profile.user_id);

      if (error) throw error;

      setShowPrivacy(false);
      navigate("/profile", { replace: true });
    } catch (err) {
      console.error("CONSENT ERROR:", err);
      setMsg(err?.message || "บันทึกความยินยอมไม่สำเร็จ");
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
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowPrivacy(true)}
              >
                <FiShield />
                ความเป็นส่วนตัว
              </button>

              <a
                href={manualPdf}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary"
              >
                <FiHelpCircle />
                คู่มือใช้งาน
              </a>
            </div>
          </div>

          <form className="form" onSubmit={onLogin}>
            <div>
              <label className="label">
                <span style={{ display: "inline-flex", gap: 8 }}>
                  <FiUser />
                  Username
                </span>
              </label>
              <input
                className="input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="เช่น user001"
              />
            </div>

            <div>
              <label className="label">
                <span style={{ display: "inline-flex", gap: 8 }}>
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
              />
            </div>

            <div className="actions" style={{ textAlign: "center" }}>
              <button className="btn btn-primary" type="submit" disabled={busy}>
                <FiLogIn />
                {busy ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </button>
            </div>

            {msg && <div className="alert-error">{msg}</div>}

            <div className="footerNote">
              ระบบทดลองเพื่อการศึกษา — บัญชีผู้ใช้ถูกสร้างไว้ล่วงหน้าโดยผู้ดูแล
            </div>
          </form>
        </div>
      </div>

      {/* ================= PRIVACY MODAL (ของเดิม 100%) ================= */}
      {showPrivacy && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "30px",
              borderRadius: "16px",
              maxWidth: "550px",
              width: "100%",
              position: "relative",
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
              border: "1px solid #eee",
            }}
          >
            <button
              onClick={() => setShowPrivacy(false)}
              style={{
                position: "absolute",
                top: "15px",
                right: "15px",
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: "#999",
              }}
            >
              <FiX />
            </button>

            <h2 style={{ marginTop: 0, color: "#1e40af" }}>
              <FiShield /> ข้อตกลงความเป็นส่วนตัว
            </h2>

            <div
              style={{
                color: "#374151",
                lineHeight: "1.7",
                marginTop: "20px",
                fontSize: "0.95rem",
              }}
            >
              <p style={{ fontWeight: "bold", marginBottom: "10px" }}>
                ถึง ผู้เข้าร่วมการวิจัยทุกท่าน (อายุ 15-18 ปี):
              </p>

              <p>
                เพื่อให้การศึกษาวิจัยครั้งนี้เป็นไปตามหลักจริยธรรมและถูกต้องแม่นยำ
                ระบบมีความจำเป็นต้องขอข้อมูล "ชื่อ-นามสกุล และอายุ" ของท่านในขั้นตอนลงทะเบียน
              </p>

              <div
                style={{
                  backgroundColor: "#f8fafc",
                  padding: "15px",
                  borderRadius: "8px",
                  borderLeft: "4px solid #3b82f6",
                  margin: "15px 0",
                }}
              >
                <p style={{ margin: 0 }}>
                  <strong>การรักษาความลับ:</strong> ระบบจะ{" "}
                  <strong>ไม่เปิดเผย</strong> ชื่อจริง-นามสกุลของท่านสู่สาธารณะหรือในรายงานวิจัยโดยเด็ดขาด
                </p>
              </div>

              <ul style={{ paddingLeft: "20px" }}>
                <li>
                  ในหน้าแสดงลำดับคะแนนหรือสรุปผล ระบบจะใช้ชื่อแฝง user001 ถึง user040 แทนชื่อจริงเสมอ
                </li>
                <li>
                  ข้อมูลส่วนตัวของท่านจะถูกเก็บเป็นความลับสูงสุดและเข้าถึงได้เฉพาะผู้วิจัยเท่านั้น
                </li>
                <li>
                  ข้อมูลจะถูกนำไปใช้วิเคราะห์ในภาพรวมเพื่อการพัฒนาสื่อการเรียนรู้ในงานวิจัยนี้เท่านั้น
                </li>
              </ul>
            </div>

            <button
              className="btn btn-primary"
              onClick={acceptPrivacy}
              style={{
                width: "100%",
                marginTop: "25px",
                padding: "12px",
                fontSize: "1rem",
              }}
            >
              รับทราบและยินยอมให้ข้อมูล
            </button>
          </div>
        </div>
      )}
    </div>
  );
}