import "../main.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function LoginAdmin() {
  const navigate = useNavigate();

  // =========================
  // State: ฟอร์มล็อกอิน
  // =========================
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // =========================
  // State: UI
  // =========================
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  /**
   * ล็อกอินแอดมิน
   * - Step 1: signInWithPassword
   * - Step 2: เรียก RPC is_admin() เพื่อตรวจสิทธิ์ (ชัวร์กว่า select table ตรง ๆ)
   * - Step 3: ถ้าเป็นแอดมิน -> ไป /admin/data
   */
  const handleLogin = async () => {
    setErrorMsg("");
    setLoading(true);

    // =========================
    // 1) จัดรูปแบบอีเมล
    // - ถ้าพิมพ์ user001 -> เติม @local.app ให้
    // =========================
    let email = username.trim().toLowerCase();
    if (!email.includes("@")) {
      email = `${email}@local.app`;
    }

    try {
      // =========================
      // 2) ล็อกอิน Supabase Auth
      // =========================
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError || !data?.user) {
        throw new Error("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      }

      // =========================
      // 3) เช็คสิทธิ์แอดมินด้วย RPC (ลดปัญหา RLS/จังหวะ session)
      // =========================
      const { data: isAdmin, error: roleError } = await supabase.rpc("is_admin");

      // ถ้าเรียก RPC ไม่ได้/พัง ให้ logout เพื่อความปลอดภัย
      if (roleError) {
        await supabase.auth.signOut();
        throw new Error("ตรวจสอบสิทธิ์ไม่สำเร็จ (RPC is_admin ล้มเหลว)");
      }

      // =========================
      // 4) เงื่อนไขเข้า Admin
      // =========================
      if (isAdmin === true) {
        // ✅ เป็นแอดมินจริง -> ไปหน้า DataAdmin
        navigate("/admin/data", { replace: true });
        return;
      }

      // ❌ ไม่ใช่แอดมิน -> logout แล้วแจ้งเตือน
      await supabase.auth.signOut();
      throw new Error("ขออภัย! หน้านี้สำหรับผู้ดูแลระบบเท่านั้น");
    } catch (err) {
      setErrorMsg(err?.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  /**
   * กด Enter เพื่อ login
   */
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
                  className={`edu-btn edu-btn--primary ${loading ? "disabled" : ""}`}
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
