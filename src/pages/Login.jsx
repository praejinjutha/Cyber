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
    </div>
  );
}
