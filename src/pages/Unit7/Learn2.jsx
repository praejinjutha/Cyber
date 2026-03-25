// src/pages/Unit7/Learn2.jsx
// Unit 7 - เรื่องที่ 2: เทคนิคการโน้มน้าวใจในสื่อออนไลน์
// Flow: Micro-lesson → Scenario-based Learning → Interactive Concept Checking
// ใช้เฉพาะ class ที่มีอยู่แล้วใน main.css + learn.css
// เหมาะสำหรับเยาวชนอายุ 15–18 ปี

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import logo from "../../assets/logo.png";

import organicImg from "./FlashSale.jpg";
import directImg from "./SocialProof.jpg";
import embeddedImg from "./Emotional.jpg";

import "../../main.css";
import "../Unit1/learn.css";

import {
  FiChevronLeft,
  FiChevronRight,
  FiFileText,
  FiHome,
  FiLogOut,
  FiUser,
  FiCheckCircle,
  FiAlertTriangle,
  FiClock,
  FiMessageSquare,
  FiTrendingUp
} from "react-icons/fi";

/* ------------------------------------------------------------------ */
/* MICRO LESSON */
/* ------------------------------------------------------------------ */

const MICRO_LESSON = [
  {
    icon: <FiClock />,
    title: "การเร่งเวลาให้ตัดสินใจเร็ว",
    image: organicImg,
    points: [
      "โฆษณาหลายแบบทำให้ผู้ชมรู้สึกว่าต้องตัดสินใจทันที",
      "มักใช้คำ เช่น 'เหลือเพียงไม่กี่ชิ้น' หรือ 'หมดวันนี้เท่านั้น'",
      "การสร้างความเร่งด่วนช่วยลดเวลาที่ผู้บริโภคใช้คิดวิเคราะห์",
    ],
    note:
      "ถ้าเห็นข้อความที่ทำให้รู้สึกต้องรีบตัดสินใจ ควรหยุดคิดและตรวจสอบข้อมูลก่อน",
  },
  {
    icon: <FiMessageSquare />,
    title: "การใช้รีวิวหรือคำชมจากผู้ใช้",
    image: directImg,
    points: [
      "โฆษณามักใช้รีวิวเพื่อสร้างความน่าเชื่อถือ",
      "รีวิวจากผู้ใช้หรืออินฟลูเอนเซอร์สามารถทำให้สินค้า ดูน่าใช้มากขึ้น",
      "บางครั้งรีวิวอาจเป็นส่วนหนึ่งของการตลาด",
    ],
    note:
      "รีวิวสามารถช่วยให้ตัดสินใจได้ แต่ควรดูหลายแหล่งและตรวจสอบความน่าเชื่อถือ",
  },
  {
    icon: <FiTrendingUp />,
    title: "การกระตุ้นอารมณ์",
    image: embeddedImg,
    points: [
      "โฆษณาบางแบบเน้นกระตุ้นความรู้สึก เช่น ความตื่นเต้น ความกลัว หรือความอยากได้",
      "อาจใช้ภาพ เพลง หรือคำพูดที่ทำให้รู้สึกว่าต้องมีสินค้า",
      "การกระตุ้นอารมณ์ช่วยทำให้ผู้ชมจดจำสินค้าได้ง่ายขึ้น",
    ],
    note:
      "เมื่อโฆษณาทำให้เกิดอารมณ์แรง ควรพิจารณาข้อมูลจริงประกอบก่อนตัดสินใจ",
  },
];

/* ------------------------------------------------------------------ */
/* COMPONENT */
/* ------------------------------------------------------------------ */

export default function Learn2Unit7() {

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");

  useEffect(() => {

    let alive = true;

    (async () => {

      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      if (!user) {
        navigate("/login", { replace: true });
        return;
      }

      const { data: profile } = await supabase
        .from("student_profiles")
        .select("first_name,last_name")
        .eq("user_id", user.id)
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

  return (
    <div className="edu-app">

      <header className="edu-topbar">

        <div className="edu-topbar__inner">

          <div className="homebar__brand">

            <img src={logo} alt="logo" className="homebar__logo" />

            <div className="edu-brandtext">

              <div className="edu-brandtext__title">
                LearnSecure
              </div>

              <div className="edu-brandtext__subtitle">
                Unit 7
              </div>

            </div>

          </div>

          <div className="edu-topbar__right">

            <div className="edu-userchip">

              <div className="edu-userchip__avatar">
                <FiUser />
              </div>

              <div className="edu-userchip__meta">

                <div className="edu-userchip__name">
                  {loading ? "กำลังโหลด..." : studentName || "ผู้เรียน"}
                </div>

              </div>

            </div>

            <button
              className="edu-btn edu-btn--danger"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate("/login", { replace: true });
              }}
            >
              <FiLogOut />
              ออกจากระบบ
            </button>

          </div>

        </div>

      </header>

      <main className="edu-layout">

        <section className="edu-hero" aria-label="Unit 7 header">
          <div className="edu-hero__card">
            <div className="edu-hero__row">
              <div className="edu-hero__headline">

                <div className="edu-hero__title">
                  Unit 7 : การรู้เท่าทันโฆษณาและการโน้มน้าวใจบนโลกออนไลน์
                </div>

                <div className="edu-hero__sub">
                  เรื่องที่ 2 : เทคนิคการโน้มน้าวใจในสื่อออนไลน์
                </div>

                <div className="edu-lessons__toolbar">

                  <button
                    className="edu-btn edu-btn--back"
                    type="button"
                    onClick={() => navigate("/unit7/learn")}
                  >
                    <FiChevronLeft />
                    กลับ
                  </button>

                  <button
                    className="edu-btn edu-btn--ghost"
                    type="button"
                    onClick={() => navigate("/main")}
                  >
                    <FiHome />
                    กลับหน้าหลัก
                  </button>

                </div>

              </div>
            </div>
          </div>
        </section>

<section className="edu-panel1">

  <div className="edu-panel1__head">

    <div className="edu-panel1__title">
      <FiFileText />
      ประเด็นสำคัญที่ควรรู้
    </div>

  </div>

  <div style={{ padding: 16 }}>

    <div
      className="edu-adaptiveGrid"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20
      }}
    >

      {MICRO_LESSON.map((item, index) => (

        <div
          key={index}
          className="edu-card"
          style={{ width: "100%" }}
        >

          <div className="edu-card__body">

            <div className="edu-box">

              <div className="edu-box__title">
                {item.icon} {item.title}
              </div>

              <img
                src={item.image}
                alt={item.title}
                style={{
                  width: "100%",
                  maxWidth: 420,
                  borderRadius: 10,
                  margin: "12px auto",
                  display: "block"
                }}
              />

              <ul className="edu-list">

                {item.points.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}

              </ul>

              <div className="edu-note">
                {item.note}
              </div>

            </div>

          </div>

        </div>

      ))}

    </div>

    <div
      style={{
        display: "flex",
        justifyContent: "center",
        marginTop: 24,
        marginBottom: 40
      }}
    >
      <button
        className="edu-btn edu-btn--ghost"
        type="button"
        onClick={() => navigate("/unit7/learn")}
      >
        เสร็จสิ้น <FiChevronRight />
      </button>
    </div>

  </div>

</section>


      </main>

    </div>
  );
}