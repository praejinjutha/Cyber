import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

import logo from "../assets/logo.png";
import "../main.css";
import "../styles.css";

import {
  FiUser,
  FiLogOut,
  FiChevronRight,
  FiSave,
  FiRefreshCw,
  FiClipboard,
  FiHome,
} from "react-icons/fi";

export default function Profile() {
  const navigate = useNavigate();

  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("15");

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [hasPretest, setHasPretest] = useState(false);

  const ages = useMemo(() => ["15", "16", "17", "18"], []);

  const loadAll = async () => {
    setLoading(true);
    setMsg("");

    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error(error);
      setMsg("โหลดข้อมูลผู้ใช้ไม่สำเร็จ กรุณาลองใหม่");
      setLoading(false);
      return;
    }

    const u = data.session?.user;
    if (!u) {
      navigate("/login", { replace: true });
      return;
    }

    setUserId(u.id);
    setEmail(u.email ?? "");

    // โหลดโปรไฟล์
    const { data: profile, error: profileErr } = await supabase
      .from("student_profiles")
      .select("first_name,last_name,age")
      .eq("user_id", u.id)
      .maybeSingle();

    if (profileErr) {
      console.error(profileErr);
      setMsg("โหลดโปรไฟล์ไม่สำเร็จ (แต่ยังแก้ไขและบันทึกใหม่ได้)");
    } else if (profile) {
      setFirstName(profile.first_name ?? "");
      setLastName(profile.last_name ?? "");
      setAge(String(profile.age ?? "15"));
    } else {
      setFirstName("");
      setLastName("");
      setAge("15");
    }

    // เช็คทำ pretest แล้วหรือยัง (จำค่าไว้ใน DB: pretest_results)
    const { data: pretest, error: pretestErr } = await supabase
      .from("pretest_results")
      .select("id")
      .eq("user_id", u.id)
      .limit(1)
      .maybeSingle();

    if (pretestErr) {
      console.error(pretestErr);
      setHasPretest(false);
    } else {
      setHasPretest(!!pretest);
    }

    setLoading(false);
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!alive) return;
      await loadAll();
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const greet = useMemo(() => {
    const full = `${firstName ?? ""} ${lastName ?? ""}`.trim();
    if (loading) return "กำลังโหลด...";
    return full ? full : "ผู้เรียน";
  }, [loading, firstName, lastName]);

  const onSave = async (e) => {
    e.preventDefault();
    setMsg("");

    const fn = firstName.trim();
    const ln = lastName.trim();

    if (!fn || !ln) {
      setMsg("กรุณากรอกชื่อและนามสกุลให้ครบก่อนนะ");
      return;
    }
    if (!userId) {
      setMsg("ไม่พบผู้ใช้ กรุณาเข้าสู่ระบบใหม่");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("student_profiles")
      .upsert(
        {
          user_id: userId,
          first_name: fn,
          last_name: ln,
          age: Number(age),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    setSaving(false);

    if (error) {
      console.error("SUPABASE ERROR:", error);
      setMsg(`บันทึกไม่สำเร็จ ❌ ${error.message}`);
      return;
    }

    setMsg("บันทึกโปรไฟล์แล้ว ✅");
    await loadAll();
  };

  const goPretest = async () => {
    setMsg("");

    const fn = firstName.trim();
    const ln = lastName.trim();

    // ✅ เปลี่ยนเป็น alert แทนข้อความในหน้า
    if (!fn || !ln) {
      alert("กรุณากรอกชื่อและนามสกุลก่อนเริ่มทำ Pretest");
      return;
    }

    if (hasPretest) {
      navigate("/main");
      return;
    }

    // บันทึกก่อนพาไป pretest
    if (userId) {
      setSaving(true);
      const { error } = await supabase
        .from("student_profiles")
        .upsert(
          {
            user_id: userId,
            first_name: fn,
            last_name: ln,
            age: Number(age),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );
      setSaving(false);

      if (error) {
        console.error("SUPABASE ERROR:", error);
        setMsg(`บันทึกไม่สำเร็จ ❌ ${error.message}`);
        return;
      }
    }

    navigate("/pretest");
  };

  const resetMyData = async () => {
    setMsg("");

    if (
      !window.confirm(
        "รีเซ็ตโปรไฟล์ + ผล Pretest ของบัญชีนี้ไหม?\n(หลังรีเซ็ตต้องกรอกใหม่และทำ Pretest ใหม่)"
      )
    ) {
      return;
    }

    setSaving(true);

    const { data, error: sessErr } = await supabase.auth.getSession();
    const u = data.session?.user;

    if (sessErr || !u) {
      console.error(sessErr);
      setSaving(false);
      setMsg("ไม่พบผู้ใช้ กรุณาเข้าสู่ระบบใหม่");
      return;
    }

    const { error: delPreErr } = await supabase
      .from("pretest_results")
      .delete()
      .eq("user_id", u.id);

    const { error: delProfErr } = await supabase
      .from("student_profiles")
      .delete()
      .eq("user_id", u.id);

    setSaving(false);

    if (delPreErr || delProfErr) {
      console.error("DELETE PRETEST ERROR:", delPreErr);
      console.error("DELETE PROFILE ERROR:", delProfErr);
      setMsg(
        `รีเซ็ตไม่สำเร็จ ❌ ${(delPreErr?.message || delProfErr?.message) ?? ""}`
      );
      return;
    }

    alert("รีเซ็ตแล้ว ✅");
    await loadAll();
  };

  return (
    <div className="edu-app">
      {/* TOPBAR (สไตล์เดียวกับ Main) */}
      <header className="edu-topbar">
        <div className="edu-topbar__inner">
          <div className="homebar__brand" role="banner">
            <img src={logo} alt="LearnSecure logo" className="homebar__logo" />
            <div className="edu-brandtext">
              <div className="edu-brandtext__title">LearnSecure</div>
              <div className="edu-brandtext__subtitle">Student Portal</div>
            </div>
          </div>

          <div className="edu-topbar__right">
            <div className="edu-userchip" title={greet}>
              <div className="edu-userchip__avatar" aria-hidden="true">
                <FiUser />
              </div>
              <div className="edu-userchip__meta">
                <div className="edu-userchip__name">{greet}</div>
              </div>
            </div>

            <button
              className="edu-btn edu-btn--danger"
              type="button"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate("/login", { replace: true });
              }}
              disabled={saving}
            >
              <FiLogOut aria-hidden="true" />
              ออกจากระบบ
            </button>
          </div>
        </div>
      </header>

      <main className="edu-layout">
        {/* HERO */}
        <section className="edu-hero" aria-label="Profile hero">
          <div className="edu-hero__card" style={{ minHeight: "220px" }}>
            <div className="edu-hero__row">
              <div className="edu-hero__headline">
                <div className="edu-hero__title">โปรไฟล์ผู้เรียน</div>

                {loading ? (
                  <div className="edu-hero__sub">
                    <span className="edu-inlineSpinner" aria-hidden="true" />
                    กำลังดึงข้อมูลโปรไฟล์...
                  </div>
                ) : (
                  <div className="edu-hero__sub">
                    {hasPretest
                      ? "ตั้งค่า/ตรวจสอบข้อมูลผู้เรียน"
                      : "ตั้งค่าข้อมูลก่อนเริ่มทำ Pretest"}
                  </div>
                )}

                <div
                  style={{
                    marginTop: 12,
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  {/* ✅ ห้ามแสดงปุ่มกลับหน้าหลัก ถ้ายังไม่ทำ Pretest */}
                  {hasPretest && (
                    <button
                      type="button"
                      className="edu-btn"
                      onClick={() => navigate("/main")}
                      disabled={saving}
                      title="กลับหน้าหลัก"
                    >
                      <FiHome aria-hidden="true" />
                      กลับหน้าหลัก
                    </button>
                  )}

                  {!hasPretest ? (
                    <button
                      type="button"
                      className="edu-btn edu-btn--pretestBlink"
                      onClick={goPretest}
                      disabled={saving || loading}
                      title="ไปทำ Pretest"
                    >
                      <FiClipboard aria-hidden="true" />
                      {saving ? "กำลังบันทึก..." : "ทำ Pretest"}
                      <FiChevronRight aria-hidden="true" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="edu-btn edu-btn--primary"
                      onClick={() => navigate("/lessons")}
                      disabled={saving || loading}
                      title="ไปหน้าบทเรียน"
                    >
                      <FiClipboard aria-hidden="true" />
                      ไปหน้าบทเรียน
                      <FiChevronRight aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>

              {/* สถานะด้านขวา */}
              <div className="edu-modes" aria-label="Profile status">
                <div className="edu-panel" style={{ width: "100%", maxWidth: 420 }}>
                  <div className="edu-panel__head">
                    <div className="edu-panel__title">
                      <FiUser aria-hidden="true" />
                      สถานะบัญชี
                    </div>
                  </div>

                  <div className="edu-stats" style={{ gridTemplateColumns: "1fr" }}>
                    <div className="edu-stat">
                      <div className="edu-stat__label">ล็อกอินด้วย</div>
                      <div className="edu-stat__value" style={{ fontSize: 16 }}>
                        {email || "—"}
                      </div>
                      <div className="edu-stat__hint">
                        {hasPretest ? "ทำ Pretest แล้ว" : "ยังไม่ทำ Pretest"}
                      </div>
                    </div>
                  </div>

                  {msg && (
                    <div className="edu-alert" style={{ marginTop: 12 }}>
                      {msg}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CONTENT GRID */}
        <section className="edu-grid">
          {/* LEFT: ฟอร์ม */}
          <div className="edu-col">
            <div className="edu-panel">
              <div className="edu-panel__head">
                <div className="edu-panel__title">
                  <FiSave aria-hidden="true" />
                  ข้อมูลผู้เรียน
                </div>

                <button
                  className="edu-linkbtn"
                  type="button"
                  onClick={loadAll}
                  disabled={saving}
                  title="รีเฟรชข้อมูล"
                >
                  <FiRefreshCw aria-hidden="true" />
                  รีเฟรช
                </button>
              </div>

              <form onSubmit={onSave} className="edu-form">
                <div className="edu-formGrid">
                  <div className="edu-field">
                    <label className="edu-label">ชื่อ</label>
                    <input
                      className="edu-input"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="เช่น พิมพ์ชนก"
                      disabled={saving}
                    />
                  </div>

                  <div className="edu-field">
                    <label className="edu-label">นามสกุล</label>
                    <input
                      className="edu-input"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="เช่น ใจดี"
                      disabled={saving}
                    />
                  </div>

                  <div className="edu-field" style={{ gridColumn: "1 / -1" }}>
                    <label className="edu-label">อายุ</label>
                    <select
                      className="edu-input"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      disabled={saving}
                    >
                      {ages.map((a) => (
                        <option key={a} value={a}>
                          {a} ปี
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* ✅ เหลือแค่ปุ่มบันทึกปุ่มเดียว */}
                <div className="edu-formActions">
                  <button
                    className="edu-btn"
                    type="submit"
                    disabled={saving}
                    title="บันทึกโปรไฟล์"
                  >
                    <FiSave aria-hidden="true" />
                    {saving ? "กำลังบันทึก..." : "บันทึกโปรไฟล์"}
                  </button>
                </div>

                {msg && (
                  <div className="edu-alert" style={{ marginTop: 12 }}>
                    {msg}
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* RIGHT: การจัดการข้อมูล (Reset) */}
          <aside className="edu-col">
            <div className="edu-panel">
              <div className="edu-panel__head">
                <div className="edu-panel__title">
                  <FiRefreshCw aria-hidden="true" />
                  การจัดการข้อมูล
                </div>
              </div>

              <div className="edu-actions">
                <button
                  type="button"
                  className="edu-action edu-action--danger"
                  onClick={resetMyData}
                  disabled={saving}
                  title="รีเซ็ตโปรไฟล์และผล Pretest"
                >
                  <span className="edu-action__icon" aria-hidden="true">
                    <FiRefreshCw />
                  </span>

                  <span className="edu-action__text">
                    <span className="edu-action__title">รีเซ็ตข้อมูล (ทดสอบ)</span>
                    <span className="edu-action__desc">
                      ลบโปรไฟล์ + ผล Pretest แล้วเริ่มใหม่
                    </span>
                  </span>

                  <FiChevronRight className="edu-action__arrow" aria-hidden="true" />
                </button>
              </div>

              <div className="edu-note" style={{ marginTop: 12 }}>
                Tip: ใช้ปุ่มนี้เมื่อต้องการทดสอบระบบใหม่ตั้งแต่ต้น
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
