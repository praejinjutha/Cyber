
// pages/Unit2/Learn2.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

import logo from "../../assets/logo.png";

// ✅ CSS
import "../../main.css";
import "../Unit1/learn.css"; // ⭐ ใช้ CSS เดียวกับ Unit1

// ✅ Icons
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiFileText,
  FiHome,
  FiInfo,
  FiLogOut,
  FiMapPin,
  FiMonitor,
  FiShield,
  FiUser,
} from "react-icons/fi";

/**
 * ✅ Unit 2 - Learn2 (Scenario-based)
 * เป้าหมาย :
 * 4) ระบุ “สัญญาณเตือน” ของภัยคุกคามที่พบบ่อยได้
 * 5) อธิบายความเสี่ยง/ผลที่อาจเกิดขึ้น หากไม่จัดการ
 * 6) จำแนกพฤติกรรม/สถานการณ์ที่บ่งชี้ความเสี่ยง และชี้ “จุดผิดปกติ” ได้
 *
 * Flow:
 * - ผู้เรียนอ่านสถานการณ์ (เห็นอาการ)
 * - เลือก “สัญญาณเตือน” (signal identification)
 * - ทาย “ผลกระทบ/ความเสี่ยง” (predict impact)
 * - ได้ Feedback ทันที
 */
const Learn2Unit2 = () => {
  // ✅ Router helpers
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ อ่าน query mode เผื่อใช้ต่อ
  const mode = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    return sp.get("mode") || "all";
  }, [location.search]);

  // ✅ UI state
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");

  // ✅ step flow (หน้าเดียวก็ได้ แต่เผื่อขยาย)
  const [step, setStep] = useState("scenarios"); // "scenarios"

  /* ------------------------------------------------------------------ */
  /* ✅ CASES: สถานการณ์ภัยคุกคาม                              */
  /* - signals: จุดผิดปกติ + ระดับความเสี่ยง + คำอธิบาย                */
  /* - decoys : ตัวลวง (ดูเหมือนผิด แต่จริง ๆ ไม่ใช่จุดหลัก)           */
  /* - impactChoices: ให้ผู้เรียนทายผลกระทบ/ความเสี่ยง (BO5)           */
  /* ------------------------------------------------------------------ */
  const CASES = useMemo(
    () => [
      {
        id: "c1",
        title: "SMS: พัสดุตีกลับ ให้ยืนยันข้อมูล",
        channel: "SMS",
        body: "พัสดุของคุณติดปัญหา กรุณากรอกที่อยู่ใหม่ที่ลิงก์นี้: http://short.ly/ab12 (ภายใน 30 นาที)",
        meta: {
          time: "วันนี้ 09:12",
          hint: "http://short.ly/ab12",
        },
        // ✅ สัญญาณเตือน (BO4/BO6)
        signals: [
          {
            id: "s1",
            label: "ลิงก์สั้น/ไม่เห็นโดเมนจริง (short link)",
            risk: "high",
            why: "ลิงก์สั้นมักใช้ซ่อนปลายทางจริง เสี่ยงพาไปเว็บปลอมหรือหน้าฟิชชิ่ง",
          },
          {
            id: "s2",
            label: "เร่งเวลาให้ทำทันที (ภายใน 30 นาที)",
            risk: "medium",
            why: "การเร่งให้รีบทำ ทำให้เราเผลอคลิก/กรอกข้อมูลโดยไม่ตรวจสอบ",
          },
          {
            id: "s3",
            label: "ไม่มีเลขพัสดุ/ข้อมูลอ้างอิงที่ตรวจสอบได้",
            risk: "medium",
            why: "ข้อความหว่าน ๆ มักไม่ให้ข้อมูลอ้างอิง เพราะส่งไปหลายคนเพื่อให้มีคนหลงเชื่อ",
          },
        ],
        decoys: [
          {
            id: "d1",
            label: "ข้อความพูดว่า ‘พัสดุติดปัญหา’",
            why: "คำนี้ใช้ได้ทั้งจริงและปลอม ต้องดูที่ ‘ลิงก์/ข้อมูลอ้างอิง/ความเร่ง’ เป็นหลัก",
          },
        ],
        // ✅ คำถามทายผลกระทบ (BO5)
        impactPrompt: "ถ้าคุณกดลิงก์และกรอกข้อมูลตาม SMS นี้ “ผลที่อาจเกิดขึ้น” คือข้อใด?",
        impactAnswer: "A",
        impactChoices: [
          {
            id: "A",
            label: "บัญชี/ข้อมูลส่วนตัวอาจรั่วไหล หรือถูกหลอกให้กรอกข้อมูลจนถูกยึดบัญชี",
            why: "เว็บปลอมมักเก็บรหัสผ่าน/OTP/ข้อมูลบัตร ทำให้บัญชีถูกยึดหรือเกิดความเสียหายทางการเงิน",
          },
          {
            id: "B",
            label: "ไม่มีอะไรเกิดขึ้น เพราะเป็น SMS ธรรมดา",
            why: "ผิด ❌ ช่องทาง SMS ก็ใช้ฟิชชิ่งได้ และลิงก์สั้นยิ่งน่าสงสัย",
          },
          {
            id: "C",
            label: "เครื่องจะเร็วขึ้นและปลอดภัยขึ้นทันที",
            why: "ผิด ❌ การกดลิงก์สุ่มเสี่ยงไม่ได้ทำให้ปลอดภัยขึ้น",
          },
          {
            id: "D",
            label: "จะไม่ต้องใช้รหัสผ่านอีกต่อไป",
            why: "ผิด ❌ ไม่เกี่ยวข้อง และเป็นสัญญาณว่ากำลังโดนหลอกให้เชื่ออะไรแปลก ๆ",
          },
        ],
      },
      {
        id: "c2",
        title: "ดาวน์โหลดโปรแกรมจากเว็บไม่น่าเชื่อถือแล้วเครื่องเริ่มแปลก",
        channel: "File / App",
        body: "คุณดาวน์โหลดโปรแกรมจากเว็บที่ไม่น่าเชื่อถือ พอเปิดใช้งาน เครื่องเริ่มช้า มีป๊อปอัปเด้ง และไฟล์งานบางส่วนเปิดไม่ได้เหมือนถูกล็อก",
        meta: {
          device: "Windows • PC",
          time: "เมื่อกี้นี้",
        },
        signals: [
          {
            id: "s1",
            label: "ดาวน์โหลด/ติดตั้งจากแหล่งที่ไม่น่าเชื่อถือ",
            risk: "high",
            why: "แหล่งไม่น่าเชื่อถือเป็นทางเข้าหลักของมัลแวร์ เช่น trojan, spyware, ransomware",
          },
          {
            id: "s2",
            label: "เครื่องช้า/มีป๊อปอัปเด้งผิดปกติ",
            risk: "medium",
            why: "อาจเป็น adware หรือโปรแกรมไม่พึงประสงค์ที่รบกวนและเสี่ยงพาไปลิงก์อันตรายต่อ",
          },
          {
            id: "s3",
            label: "ไฟล์เปิดไม่ได้เหมือนถูกเข้ารหัส/ถูกล็อก",
            risk: "high",
            why: "เป็นอาการคล้าย ransomware ที่ทำให้ “ข้อมูลใช้ไม่ได้” และอาจเรียกค่าไถ่",
          },
        ],
        decoys: [
          {
            id: "d1",
            label: "เครื่องเป็น Windows",
            why: "เป็นข้อมูลทั่วไป ไม่ใช่สัญญาณผิดปกติโดยตรง (แต่ Windows เป็นเป้าหมายบ่อย ก็ยิ่งต้องระวัง)",
          },
        ],
        impactPrompt: "ถ้าปล่อยไว้ไม่จัดการ ความเสียหายที่เป็นไปได้มากที่สุดคือข้อใด?",
        impactAnswer: "A",
        impactChoices: [
          {
            id: "A",
            label: "ข้อมูลสำคัญอาจถูกขโมย/ถูกเข้ารหัส ทำให้งานหายหรือเปิดไม่ได้ และเสี่ยงถูกเรียกค่าไถ่",
            why: "ถูก ✅ มัลแวร์บางชนิดขโมยข้อมูล (spyware) บางชนิดเข้ารหัสไฟล์ (ransomware) กระทบ “ความปลอดภัยข้อมูล” ตรง ๆ",
          },
          {
            id: "B",
            label: "ไม่มีผลอะไร เพราะแค่เครื่องช้า",
            why: "ผิด ❌ เครื่องช้าเป็นสัญญาณหนึ่งของการติดมัลแวร์ และอาจลามไปสู่การขโมยข้อมูลได้",
          },
          {
            id: "C",
            label: "บัญชีธนาคารปลอดภัยขึ้น",
            why: "ผิด ❌ ไม่เกี่ยวข้อง และไม่มีเหตุผลทางความปลอดภัย",
          },
          {
            id: "D",
            label: "จะทำให้ไม่ต้องอัปเดตโปรแกรมอีก",
            why: "ผิด ❌ ตรงกันข้าม—ต้องอัปเดตเพื่ออุดช่องโหว่",
          },
        ],
      },
      {
        id: "c3",
        title: "เว็บหน้าตาเหมือนธนาคาร แต่ URL สะกดแปลก",
        channel: "Website",
        body: "คุณกำลังจะล็อกอินธนาคาร เว็บหน้าตาเหมือนมาก แต่ URL สะกดคล้าย ๆ (เช่น bnak-xxx.com) และมีหน้าขอ OTP/ข้อมูลบัตรทันที",
        meta: {
          location: "ไม่ระบุ",
          time: "ตอนนี้",
          hint: "bnak-xxx.com",
        },
        signals: [
          {
            id: "s1",
            label: "URL/โดเมนไม่ตรงของจริง (สะกดเพี้ยน/คล้าย)",
            risk: "high",
            why: "โดเมนเพี้ยนเป็นสัญญาณคลาสสิกของเว็บไซต์ปลอม/ฟิชชิ่งเว็บ",
          },
          {
            id: "s2",
            label: "รีบขอ OTP/ข้อมูลบัตรในจังหวะที่ผิดปกติ",
            risk: "high",
            why: "เว็บปลอมมักรีบขอข้อมูลสำคัญเพื่อเอาไปใช้ยึดบัญชี/ทำธุรกรรม",
          },
          {
            id: "s3",
            label: "เข้าผ่านลิงก์จากแหล่งไม่ชัวร์ (เช่น โฆษณา/ข้อความ)",
            risk: "medium",
            why: "เข้าผ่านลิงก์สุ่มเสี่ยง ถูกพาไปเว็บปลอมได้ง่าย ควรพิมพ์ URL เองหรือเข้าแอปทางการ",
          },
        ],
        decoys: [
          {
            id: "d1",
            label: "หน้าตาเว็บเหมือนจริงมาก",
            why: "หน้าตาเหมือนจริงไม่ใช่หลักฐานว่าเว็บปลอดภัย คนร้ายก็อปหน้าเว็บได้",
          },
        ],
        impactPrompt: "ถ้าคุณกรอก OTP/ข้อมูลบัตรบนเว็บนี้ ผลที่อาจเกิดขึ้นคือข้อใด?",
        impactAnswer: "A",
        impactChoices: [
          {
            id: "A",
            label: "ข้อมูลอาจถูกขโมย บัญชีถูกยึด และเกิดธุรกรรมที่เราไม่ได้ทำ",
            why: "ถูก ✅ นี่คือผลกระทบหลักของเว็บไซต์ปลอม: ขโมยข้อมูลสำคัญและเข้าควบคุมบัญชี",
          },
          {
            id: "B",
            label: "ไม่มีอะไรเกิดขึ้น เพราะเว็บดูเหมือนจริง",
            why: "ผิด ❌ หน้าตาเหมือนจริงไม่ได้แปลว่าปลอดภัย ต้องดูที่โดเมนและช่องทางเข้าถึง",
          },
          {
            id: "C",
            label: "ระบบจะล็อกอินเร็วขึ้น",
            why: "ผิด ❌ ไม่เกี่ยวกับความเร็ว และไม่มีเหตุผลด้านความปลอดภัย",
          },
          {
            id: "D",
            label: "จะไม่ต้องใช้รหัสผ่านอีกเลย",
            why: "ผิด ❌ ไม่เกี่ยวข้อง และเป็นคำกล่าวที่มักใช้หลอกให้เชื่อ",
          },
        ],
      },
    ],
    []
  );

  // ✅ index เคสปัจจุบัน
  const [idx, setIdx] = useState(0);

  // ✅ เก็บสัญญาณที่ผู้เรียนเลือก (checkbox)
  const [pickedSignals, setPickedSignals] = useState({}); // { [key]: true }

  // ✅ เก็บคำตอบทายผลกระทบ (radio)
  const [impactPicked, setImpactPicked] = useState(null); // "A" | "B" | "C" | "D"

  // ✅ โหมดเฉลย/feedback
  const [showFeedback, setShowFeedback] = useState(false);

  // ✅ เคสปัจจุบัน
  const current = CASES[idx];

  /**
   * ✅ รวมรายการทั้งหมดให้แสดง (signals + decoys)
   * - ให้ผู้เรียน “ชี้จุดผิดปกติ” (BO4/BO6)
   */
  const signalChoices = useMemo(() => {
    const real = current.signals.map((s) => ({
      key: `sig:${s.id}`,
      kind: "signal",
      id: s.id,
      label: s.label,
      why: s.why,
      risk: s.risk,
    }));

    const fake = current.decoys.map((d) => ({
      key: `dec:${d.id}`,
      kind: "decoy",
      id: d.id,
      label: d.label,
      why: d.why,
      risk: null,
    }));

    return [...real, ...fake];
  }, [current]);

  /**
   * ✅ helper: ผู้เรียนเลือกสัญญาณอะไรบ้าง
   */
  const pickedSignalKeys = useMemo(() => {
    return Object.entries(pickedSignals)
      .filter(([, v]) => v)
      .map(([k]) => k);
  }, [pickedSignals]);

  /**
   * ✅ สรุปผลเลือกสัญญาณ
   * - correct: เลือกสัญญาณจริงถูก
   * - missed: ไม่ได้เลือกสัญญาณจริง
   * - falsePositive: เลือกตัวลวง
   */
  const signalResult = useMemo(() => {
    const realIds = new Set(current.signals.map((s) => `sig:${s.id}`));
    const decIds = new Set(current.decoys.map((d) => `dec:${d.id}`));

    const correct = pickedSignalKeys.filter((k) => realIds.has(k));
    const falsePositive = pickedSignalKeys.filter((k) => decIds.has(k));
    const missed = [...realIds].filter((k) => !pickedSignalKeys.includes(k));

    return { correct, falsePositive, missed };
  }, [current, pickedSignalKeys]);

  /**
   * ✅ สรุประดับความเสี่ยงจาก “สัญญาณจริงที่เลือกได้ถูก”
   * - ถ้าเลือก high อย่างน้อย 1 -> high
   * - else ถ้าเลือก medium อย่างน้อย 1 -> medium
   * - else -> low
   */
  const inferredRisk = useMemo(() => {
    const correctIds = signalResult.correct.map((k) => k.replace("sig:", ""));
    const matchedSignals = current.signals.filter((s) => correctIds.includes(s.id));

    if (matchedSignals.some((s) => s.risk === "high")) return "high";
    if (matchedSignals.some((s) => s.risk === "medium")) return "medium";
    return "low";
  }, [current, signalResult.correct]);

  /**
   * ✅ label + ข้อความอธิบาย risk (BO5)
   */
  const riskMeta = useMemo(() => {
    if (inferredRisk === "high") {
      return {
        label: "ความเสี่ยง: สูง",
        hint: "มีสัญญาณอันตรายชัดเจน หากไม่จัดการ อาจนำไปสู่การข้อมูลรั่ว/บัญชีถูกยึด/ไฟล์เสียหาย",
        icon: <FiAlertTriangle aria-hidden="true" />,
      };
    }
    if (inferredRisk === "medium") {
      return {
        label: "ความเสี่ยง: กลาง",
        hint: "มีความผิดปกติบางอย่าง ควรตรวจสอบก่อนคลิก/ก่อนกรอกข้อมูล และหลีกเลี่ยงการทำตามทันที",
        icon: <FiInfo aria-hidden="true" />,
      };
    }
    return {
      label: "ความเสี่ยง: ต่ำ",
      hint: "ยังไม่เห็นสัญญาณชัด แต่ควรมีนิสัยตรวจสอบ URL/แหล่งที่มาเสมอ",
      icon: <FiShield aria-hidden="true" />,
      };
  }, [inferredRisk]);

  /**
   * ✅ ผลทาย impact (BO5)
   */
  const impactIsCorrect = useMemo(() => {
    if (!showFeedback) return false;
    return impactPicked === current.impactAnswer;
  }, [showFeedback, impactPicked, current]);

  /**
   * ✅ รีเซ็ตเมื่อเปลี่ยนเคส
   */
  const goNextCase = () => {
    if (idx < CASES.length - 1) {
      setIdx((v) => v + 1);
      setPickedSignals({});
      setImpactPicked(null);
      setShowFeedback(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // ✅ จบทั้งหมด -> ไปหน้าถัดไปของ Unit2 (ปรับ route ได้ตามโปรเจกต์)
    navigate("/unit2/learn", { replace: true });
  };

  /* ------------------------------------------------------------------ */
  /* ✅ Auth + profile (เหมือนหน้าอื่น ๆ)                               */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);

      // 1) เช็ค session
      const { data } = await supabase.auth.getSession();
      const u = data.session?.user;

      if (!u) {
        navigate("/login", { replace: true });
        return;
      }

      // 2) ดึงชื่อจาก student_profiles
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

    return () => {
      alive = false;
    };
  }, [navigate]);

  /**
   * ✅ Panel title
   */
  const panelTitle = useMemo(() => {
    return "Scenario-based: เห็นอาการ → ทายผลกระทบ ";
  }, []);

  /* ------------------------------------------------------------------ */
  /* ✅ UI helpers                                                       */
  /* ------------------------------------------------------------------ */
  const softText = { fontSize: 13, opacity: 0.8 };

  const boxStyle = {
    borderRadius: 16,
    border: "1px solid rgba(0,0,0,0.08)",
    background: "rgba(255,255,255,0.55)",
    padding: 14,
  };

  return (
    <div className="edu-app">
      {/* ✅ TOPBAR */}
      <header className="edu-topbar">
        <div className="edu-topbar__inner">
          {/* ✅ Brand */}
          <div className="homebar__brand" role="banner">
            <img src={logo} alt="LearnSecure logo" className="homebar__logo" />
            <div className="edu-brandtext">
              <div className="edu-brandtext__title">LearnSecure</div>
              <div className="edu-brandtext__subtitle">Unit 2</div>
            </div>
          </div>

          {/* ✅ Right actions */}
          <div className="edu-topbar__right">
            {/* ✅ User chip */}
            <div className="edu-userchip" title={studentName || "Student"}>
              <div className="edu-userchip__avatar" aria-hidden="true">
                <FiUser />
              </div>
              <div className="edu-userchip__meta">
                <div className="edu-userchip__name">{loading ? "กำลังโหลด..." : studentName || "ผู้เรียน"}</div>
              </div>
            </div>

            {/* ✅ Logout */}
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
        <section className="edu-hero" aria-label="Unit 2 header">
          <div className="edu-hero__card">
            <div className="edu-hero__row">
              <div className="edu-hero__headline">
                <div className="edu-hero__title">Unit 2: การปฏิบัติความปลอดภัยทางเทคนิคพื้นฐาน</div>

                <div className="edu-lessons__toolbar">
                  <button className="edu-btn edu-btn--back" type="button" onClick={() => navigate(-1)}>
                    <FiChevronLeft aria-hidden="true" />
                    กลับ
                  </button>

                  <button
                    className="edu-btn edu-btn--ghost"
                    type="button"
                    onClick={() => navigate("/main")}
                    style={{ marginLeft: 8 }}
                  >
                    <FiHome aria-hidden="true" />
                    กลับหน้าหลัก
                  </button>
                </div>
              </div>

              <div className="edu-lessons__meta">{/* เว้นไว้ */}</div>
            </div>
          </div>
        </section>

        {/* ✅ CONTENT */}
        <section className="edu-panel1">
          {/* ✅ Panel header */}
          <div className="edu-panel1__head">
            <div className="edu-panel1__title">
              <FiFileText aria-hidden="true" />
              {panelTitle}
            </div>
          </div>

          {/* ✅ VIEW: SCENARIOS */}
          {step === "scenarios" && (
            <div style={{ padding: 16 }}>
              {/* ✅ Intro */}
              <div className="edu-card" style={{ padding: 16, marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div className="edu-chip" aria-hidden="true">
                    <FiShield />
                  </div>

                  <div>
                    <div className="edu-h2" style={{ marginBottom: 6 }}>
                      เห็น “อาการเตือน” → ทาย “ผลกระทบ” แล้วรับ Feedback ทันที
                    </div>
                    <div className="edu-muted">
                      โฟกัส 3 อย่าง: (1) ชี้จุดผิดปกติ (2) เห็นความเสี่ยง/ผลกระทบ (3) จำแนกจากกรณีตัวอย่าง
                    </div>
                  </div>
                </div>
              </div>

              {/* ✅ Case container */}
              <div style={boxStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 950, marginBottom: 6 }}>{current.title}</div>
                    <div style={softText}>{current.channel} • เคส {idx + 1}/{CASES.length}</div>
                  </div>

                  <div style={{ fontSize: 12, opacity: 0.85, alignSelf: "center" }}>
                    เลือกสัญญาณแล้ว {Object.values(pickedSignals).filter(Boolean).length}
                  </div>
                </div>

                {/* ✅ Message card */}
                <div className="edu-glasscard signal-card" style={{ marginTop: 12, padding: 14 }}>
                  {/* ✅ top strip */}
                  <div className="signal-card__top">
                    <span className="signal-card__dot" aria-hidden="true" />
                    <div className="signal-card__label">สถานการณ์</div>
                  </div>

                  {/* ✅ body */}
                  <div className="edu-body signal-body" style={{ marginTop: 10 }}>
                    {current.body}
                  </div>

                  {/* ✅ meta pills */}
                  <div className="signal-meta" style={{ marginTop: 12 }}>
                    {current.meta?.location && (
                      <span className="signal-pill signal-pill--location">
                        <FiMapPin aria-hidden="true" />
                        <span className="signal-pill__text">{current.meta.location}</span>
                      </span>
                    )}

                    {current.meta?.device && (
                      <span className="signal-pill signal-pill--device">
                        <FiMonitor aria-hidden="true" />
                        <span className="signal-pill__text">{current.meta.device}</span>
                      </span>
                    )}

                    {current.meta?.time && (
                      <span className="signal-pill signal-pill--time">
                        <FiInfo aria-hidden="true" />
                        <span className="signal-pill__text">{current.meta.time}</span>
                      </span>
                    )}

                    {current.meta?.hint && (
                      <span className="signal-pill signal-pill--hint">
                        <FiInfo aria-hidden="true" />
                        <span className="signal-pill__text">{current.meta.hint}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* ✅ Task 1: Signal identification (BO4/BO6) */}
                <div className="edu-h4" style={{ marginTop: 16 }}>
                  1) เลือก “สัญญาณเตือน/จุดผิดปกติ” ที่คุณคิดว่าน่าสงสัย (เลือกได้หลายข้อ)
                </div>

                <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
                  {signalChoices.map((c) => {
                    const key = c.key;
                    const checked = !!pickedSignals[key];

                    return (
                      <label
                        key={key}
                        className="edu-choice"
                        style={{
                          display: "flex",
                          gap: 10,
                          alignItems: "flex-start",
                          padding: 12,
                          borderRadius: 14,
                          cursor: showFeedback ? "not-allowed" : "pointer",
                          opacity: showFeedback ? 0.85 : 1,
                        }}
                      >
                        {/* ✅ checkbox */}
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={showFeedback}
                          onChange={(e) => {
                            if (showFeedback) return;

                            setPickedSignals((prev) => ({
                              ...prev,
                              [key]: e.target.checked,
                            }));
                          }}
                          style={{ marginTop: 2 }}
                        />

                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                            <div className="edu-body">{c.label}</div>
                            {!showFeedback && (
                              <span ></span>
                            )}
                          </div>

                          {/* ✅ เหตุผล (แสดงหลังเฉลย) */}
                          {showFeedback && <div className="edu-muted" style={{ marginTop: 6 }}>{c.why}</div>}
                        </div>
                      </label>
                    );
                  })}
                </div>

                {/* ✅ Task 2: Predict impact (BO5) */}
                <div className="edu-h4" style={{ marginTop: 16 }}>
                  2) ทาย “ผลกระทบ/ความเสี่ยง” จากสถานการณ์นี้
                </div>

                <div className="edu-glasscard" style={{ marginTop: 10, padding: 14 }}>
                  <div className="edu-body" style={{ fontWeight: 900 }}>
                    {current.impactPrompt}
                  </div>

                  <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
                    {current.impactChoices.map((c) => {
                      const active = impactPicked === c.id;

                      return (
                        <button
                          key={c.id}
                          type="button"
                          className="edu-btn edu-btn"
                          onClick={() => {
                            if (showFeedback) return;
                            setImpactPicked(c.id);
                          }}
                          style={{
                            justifyContent: "flex-start",
                            textAlign: "left",
                            opacity: showFeedback ? 0.9 : 1,
                            border: active ? "1px solid rgba(59,130,246,0.45)" : undefined,
                            background: active ? "rgba(59,130,246,0.10)" : undefined,
                          }}
                          aria-pressed={active}
                          title={c.label}
                        >
                          {c.id}) {c.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* ✅ เฉลยผลกระทบหลัง feedback */}
                  {showFeedback && (
                    <div style={{ marginTop: 12 }}>
                      {impactIsCorrect ? (
                        <div
                          style={{
                            display: "flex",
                            gap: 10,
                            alignItems: "flex-start",
                            padding: 10,
                            borderRadius: 12,
                            border: "1px solid rgba(16,185,129,0.25)",
                            background: "rgba(16,185,129,0.10)",
                          }}
                        >
                          <FiCheckCircle aria-hidden="true" />
                          <div>
                            <div style={{ fontWeight: 900 }}>ทายผลกระทบถูกต้อง</div>
                            <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>
                              {current.impactChoices.find((x) => x.id === impactPicked)?.why}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            gap: 10,
                            alignItems: "flex-start",
                            padding: 10,
                            borderRadius: 12,
                            border: "1px solid rgba(245,158,11,0.25)",
                            background: "rgba(245,158,11,0.10)",
                          }}
                        >
                          <FiAlertTriangle aria-hidden="true" />
                          <div>
                            <div style={{ fontWeight: 900 }}>ยังไม่ตรง</div>
                            <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>
                              เฉลยคือข้อ {current.impactAnswer}){" "}
                              {current.impactChoices.find((x) => x.id === current.impactAnswer)?.label}
                            </div>
                            <div style={{ fontSize: 13, opacity: 0.9, marginTop: 6 }}>
                              {current.impactChoices.find((x) => x.id === current.impactAnswer)?.why}
                            </div>
                          </div>
                        </div>
                      )}

                      {!impactPicked && (
                        <div
                          style={{
                            display: "flex",
                            gap: 10,
                            alignItems: "flex-start",
                            padding: 10,
                            borderRadius: 12,
                            border: "1px solid rgba(220,38,38,0.18)",
                            background: "rgba(220,38,38,0.08)",
                            marginTop: 10,
                          }}
                        >
                          <FiAlertTriangle aria-hidden="true" />
                          <div>
                            <div style={{ fontWeight: 900 }}>คุณยังไม่ได้เลือกคำตอบเรื่องผลกระทบ</div>
                            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>
                              เลือก 1 ข้อก่อน เพื่อดู feedback
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* ✅ Actions */}
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                  <button
                    className="edu-btn edu-btn--back"
                    type="button"
                    onClick={() => navigate(-1)}
                    title="กลับ"
                  >
                    <FiChevronLeft aria-hidden="true" /> กลับ
                  </button>

                  {!showFeedback ? (
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <button
                        className="edu-btn edu-btn--primary"
                        type="button"
                        onClick={() => {
                          // ✅ บังคับให้ทำ 2 อย่าง: เลือกสัญญาณอย่างน้อย 1 และเลือกผลกระทบ 1 ข้อ
                          if (pickedSignalKeys.length === 0) {
                            alert("ลองเลือก ‘สัญญาณเตือน/จุดผิดปกติ’ อย่างน้อย 1 ข้อก่อนนะ");
                            return;
                          }
                          if (!impactPicked) {
                            alert("ลองเลือกคำตอบ ‘ผลกระทบ/ความเสี่ยง’ 1 ข้อก่อนนะ");
                            return;
                          }

                          setShowFeedback(true);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        title="ตรวจคำตอบ"
                      >
                        ตรวจคำตอบ <FiChevronRight aria-hidden="true" />
                      </button>

                      <button
                        className="edu-btn edu-btn--danger"
                        type="button"
                        onClick={() => {
                          setPickedSignals({});
                          setImpactPicked(null);
                          setShowFeedback(false);
                        }}
                        title="ล้างคำตอบ"
                      >
                        ล้างคำตอบ
                      </button>
                    </div>
                  ) : (
                    <button className="edu-btn edu-btn--ghost" type="button" onClick={goNextCase} title="ถัดไป">
                      {idx < CASES.length - 1 ? "เคสถัดไป" : "เสร็จสิ้น"}
                      <FiChevronRight aria-hidden="true" />
                    </button>
                  )}
                </div>

                {/* ✅ Feedback summary (ทันที) */}
                {showFeedback && (
                  <div className="edu-glasscard" style={{ marginTop: 16, padding: 14 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      {signalResult.missed.length === 0 && signalResult.falsePositive.length === 0 && impactIsCorrect ? (
                        <FiCheckCircle aria-hidden="true" />
                      ) : (
                        <FiAlertTriangle aria-hidden="true" />
                      )}

                      <div className="edu-h4" style={{ margin: 0 }}>
                        Feedback: ชี้สัญญาณถูก {signalResult.correct.length} • พลาด {signalResult.missed.length} • เลือกตัวลวง{" "}
                        {signalResult.falsePositive.length}
                      </div>
                    </div>

                    <div className="edu-divider" style={{ margin: "12px 0" }} />

                    {/* ✅ Risk summary */}
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div className="edu-chip" aria-hidden="true">
                        {riskMeta.icon}
                      </div>
                      <div>
                        <div className="edu-h4" style={{ margin: 0 }}>
                          {riskMeta.label}
                        </div>
                        <div className="edu-muted">{riskMeta.hint}</div>
                      </div>
                    </div>

                    {/* ✅ Hint สั้น ๆ แบบ “พี่สอนน้อง” */}
                    <div className="edu-callout" style={{ marginTop: 12 }}>
                      <div className="edu-body" style={{ marginBottom: 6 }}>
                        จำง่าย ๆ:
                      </div>
                      <ul style={{ margin: 0, paddingLeft: 18 }}>
                        <li>ลิงก์สั้น / โดเมนเพี้ยน / ขอ OTP ด่วน ๆ = หยุดก่อน</li>
                        <li>แหล่งดาวน์โหลดไม่น่าเชื่อถือ + เครื่องเริ่มแปลก = สงสัยมัลแวร์</li>
                        <li>ยิ่ง “เร่งเวลา” ยิ่งต้องตรวจสอบเพิ่ม เพราะคนร้ายชอบใช้ความรีบหลอกเรา</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Learn2Unit2; // ✅ อย่าลืม export คอมโพเนนต์

