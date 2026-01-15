import "../main.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function LoginAdmin() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async () => {
    setErrorMsg("");
    setLoading(true);

    // 1. จัดการชื่อ Email (เติม @local.app ให้อัตโนมัติ)
    let email = username.trim().toLowerCase();
    if (!email.includes("@")) {
      email = `${email}@local.app`;
    }

    try {
      // 2. ล็อกอินเข้าระบบ
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) throw new Error("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");

      // 3. ตรวจสอบในตาราง user_profiles ว่าเป็น Admin จริงไหม
      const { data: userData, error: userError } = await supabase
        .from("user_profiles")
        .select("is_admin")
        .eq("user_id", data.user.id)
        .single();

      if (userError || !userData) {
        await supabase.auth.signOut();
        throw new Error("ไม่พบข้อมูลสิทธิ์ผู้ใช้งาน");
      }

      // 4. เงื่อนไขการเข้าถึง
      if (userData.is_admin === true) {
        // ✅ เป็นแอดมินจริง ไปที่หน้า DataAdmin
        navigate("/admin/data", { replace: true });
      } else {
        // ❌ ไม่ใช่แอดมิน (เป็นนักเรียน) สั่ง Logout และดีดออก
        await supabase.auth.signOut();
        throw new Error("ขออภัย! หน้านี้สำหรับผู้ดูแลระบบเท่านั้น");
      }

    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="edu-app">
      <div className="edu-topbar">
        <div className="edu-topbar__inner">
          <div className="edu-topbar__brand">
            <div className="edu-brandtext">
              <div className="edu-brandtext__title">LearnSecure</div>
              <div className="edu-brandtext__subtitle">Admin Portal</div>
            </div>
          </div>
        </div>
      </div>

      <div className="edu-layout">
        <div className="edu-hero">
          <div className="edu-hero__card">
            <div className="edu-hero__row">
              <div className="edu-hero__headline">
                <div className="edu-hero__title">เข้าสู่ระบบแอดมิน</div>
              </div>

              <div className="edu-modes">
                <input
                  className="edu-input"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <input
                  className="edu-input"
                  placeholder="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                />

                {errorMsg && (
                  <div style={{ color: "#ff4d4d", fontSize: "0.85rem", marginBottom: "10px" }}>
                    {errorMsg}
                  </div>
                )}

                <button
                  className={`edu-btn edu-btn--primary ${loading ? 'disabled' : ''}`}
                  onClick={handleLogin}
                  disabled={loading}
                >
                  {loading ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบแอดมิน"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}