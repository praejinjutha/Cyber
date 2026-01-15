import logo from "../assets/logo.png";

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { FiUser, FiLock, FiLogIn, FiHelpCircle } from "react-icons/fi";

export default function Login() {
  // ✅ router
  const navigate = useNavigate();

  // ✅ form state
  const [username, setUsername] = useState("user001");
  const [password, setPassword] = useState("");

  // ✅ ui state
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  // ✅ manual link
  const manualUrl = useMemo(() => "https://example.com/manual", []);

  /**
   * ✅ Login handler
   * แก้ bug "Cannot access 'data' before initialization" ด้วย:
   * - ห้ามอ้างถึง data ก่อน destructure
   * - เปลี่ยนชื่อ data → authData / sessionData เพื่อไม่ชนกับ data ตัวอื่น
   */
  const onLogin = async () => {
    // ✅ reset ui
    setMsg("");
    setBusy(true);

    try {
      // ===============================
      // 🔍 DEBUG 1: input ที่ผู้ใช้กรอก
      // ===============================
      console.log("DEBUG INPUT:", { username, password });

      // ===============================
      // ✅ validate input ก่อนทำอะไรทั้งหมด
      // ===============================
      if (!username.trim() || !password) {
        throw new Error("กรุณากรอก username และรหัสผ่าน");
      }

      // ===============================
      // 🔄 แปลง username → email
      // (ระบบ local ของคุณใช้รูปแบบ user001@local.app)
      // ===============================
      let email = username.trim().toLowerCase();
      if (!email.includes("@")) {
        email = `${email}@local.app`;
      }

      console.log("DEBUG EMAIL:", email);
      console.log("DEBUG: about to signIn");

      // ===============================
      // 🔐 LOGIN ด้วย Supabase Auth
      // ===============================
      const { data: authData, error: loginError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      console.log("DEBUG signIn result:", { authData, loginError });

      // ✅ handle login error
      if (loginError) throw new Error("Username หรือ Password ไม่ถูกต้อง");
      if (!authData?.user) throw new Error("ไม่พบข้อมูลผู้ใช้");

      // ===============================
      // 🔑 DEBUG 2: session + access_token
      // (บางที session จะอยู่ใน authData.session อยู่แล้ว
      // แต่ดึงผ่าน getSession เพื่อความชัวร์)
      // ===============================
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) {
        throw new Error("ไม่สามารถดึง session ได้");
      }

      const session = sessionData?.session;

      console.log("DEBUG session:", session);
      console.log("DEBUG access_token:", session?.access_token);

      if (!session?.access_token) {
        throw new Error("ไม่สามารถสร้าง access token ได้");
      }

      // ✅ ถ้าจะ debug token แบบเดี่ยว ๆ ให้ทำตรงนี้เท่านั้น
      console.log("ACCESS_TOKEN_ONLY:", session.access_token);

      // ===============================
      // 👤 เช็ก role จาก user_profiles
      // ===============================
      const { data: profile, error: roleError } = await supabase
        .from("user_profiles")
        .select("is_admin")
        .eq("user_id", authData.user.id) // ✅ ใช้ authData.user.id ไม่ใช่ data.user.id
        .single();

      console.log("DEBUG profile:", profile, roleError);

      // ✅ ถ้าไม่เจอโปรไฟล์/สิทธิ์ → sign out แล้วแจ้ง error
      if (roleError || !profile) {
        await supabase.auth.signOut();
        throw new Error("ไม่พบข้อมูลสิทธิ์การใช้งาน");
      }

      // ✅ กัน admin ล็อกอินผิดหน้า
      if (profile.is_admin === true) {
        await supabase.auth.signOut();
        throw new Error("บัญชี Admin กรุณาเข้าใช้งานผ่านหน้า Login ผู้ดูแลระบบ");
      }

      // ===============================
      // ✅ LOGIN สำเร็จ
      // ===============================
      navigate("/profile", { replace: true });
    } catch (err) {
      console.error("Login Error:", err);
      setMsg(err?.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setBusy(false);
    }
  };

  // ✅ enter to login
  const handleKeyDown = (e) => {
    if (e.key === "Enter") onLogin();
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

            <a
              href={manualUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary"
              style={{
                height: "fit-content",
                textDecoration: "none",
              }}
              title="เปิดคู่มือการใช้งาน"
            >
              <FiHelpCircle />
              คู่มือใช้งาน
            </a>
          </div>

          <div className="form" style={{ maxWidth: "400px", margin: "0 auto" }}>
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
                onKeyDown={handleKeyDown}
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
                onKeyDown={handleKeyDown}
                placeholder="รหัสผ่านของคุณ"
                autoComplete="current-password"
              />
            </div>

            <div className="actions" style={{ textAlign: "center" }}>
              <button
                className="btn btn-primary"
                onClick={onLogin}
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
          </div>
        </div>
      </div>
    </div>
  );
}
