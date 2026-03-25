import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import logo from "../../assets/logo.png";

import "../../main.css";
import "../../styles.css";
import "../../lesson.css";

import {
  FiChevronLeft,
  FiChevronRight,
  FiFileText,
  FiHome,
  FiLogOut,
  FiUser,
  FiShield,
  FiEye,
  FiSmartphone,
  FiMapPin,
  FiMessageSquare,
  FiSearch,
  FiCheckCircle,
} from "react-icons/fi";

/* ------------------------------------------------------------------ */
/* BULLET LIST */
/* ------------------------------------------------------------------ */

function BulletList({ items }) {
  return (
    <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
      {items.map((text) => (
        <div
          key={text}
          style={{
            display: "grid",
            gridTemplateColumns: "10px 1fr",
            columnGap: 10,
            alignItems: "start",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#111827",
              marginTop: 9,
            }}
          />
          <span style={{ lineHeight: 1.75 }}>{text}</span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* DATA */
/* ------------------------------------------------------------------ */

const MICRO_LESSON = [
  {
    icon: <FiShield />,
    title: "แพลตฟอร์มมักเก็บข้อมูลมากกว่าที่เราคิด",
    points: [
      "เวลาเราใช้แอปหรือเว็บไซต์ แพลตฟอร์มมักเก็บข้อมูลบางอย่างเกี่ยวกับผู้ใช้ เพื่อให้บริการทำงานได้และปรับประสบการณ์การใช้งาน",
      "ข้อมูลที่ถูกเก็บอาจไม่ได้มีแค่สิ่งที่เรากรอกตอนสมัครสมาชิก แต่รวมถึงสิ่งที่เกิดขึ้นระหว่างการใช้งานด้วย",
      "การเข้าใจเรื่องนี้ช่วยให้เราระวังมากขึ้นเวลาต้องกดยอมรับเงื่อนไขหรือแชร์ข้อมูลกับแพลตฟอร์ม",
    ],
    note:
      "ทริคจำง่าย: สมัครบัญชีคือให้ข้อมูล แต่การใช้งานทุกวันก็สร้างข้อมูลเพิ่มด้วย",
  },
  {
    icon: <FiEye />,
    title: "พฤติกรรมการใช้งานก็เป็นข้อมูล",
    points: [
      "สิ่งที่เรากดดูบ่อย เวลาเข้าใช้งาน หรือเนื้อหาที่เราใช้เวลานานกับมัน ล้วนช่วยให้ระบบเดาความสนใจของเราได้",
      "ข้อมูลพฤติกรรมแบบนี้มักถูกใช้เพื่อแนะนำคอนเทนต์หรือโฆษณาที่ดูใกล้กับสิ่งที่เราสนใจ",
      "ดังนั้น แม้เราไม่ได้พิมพ์บอกตรง ๆ ระบบก็อาจเรียนรู้ความชอบของเราได้จากพฤติกรรมการใช้งาน",
    ],
    note:
      "ทริคจำง่าย: ไม่ใช่แค่สิ่งที่เราบอก แต่สิ่งที่เราคลิกก็เล่าเรื่องเราได้",
  },
  {
    icon: <FiSmartphone />,
    title: "ข้อมูลอุปกรณ์และตำแหน่งที่ตั้งก็อาจถูกเก็บ",
    points: [
      "แพลตฟอร์มอาจรู้ว่าเราใช้อุปกรณ์ประเภทใด ใช้ระบบปฏิบัติการอะไร หรือเข้าใช้งานผ่านอุปกรณ์แบบไหน",
      "ในบางกรณี ระบบอาจเก็บตำแหน่งที่ตั้งโดยประมาณ เช่น พื้นที่หรือภูมิภาคที่ผู้ใช้อยู่",
      "ข้อมูลเหล่านี้อาจถูกใช้เพื่อปรับบริการ ความปลอดภัย หรือการแสดงเนื้อหาให้เหมาะกับผู้ใช้มากขึ้น",
    ],
    note:
      "ทริคจำง่าย: แม้เราไม่ได้พิมพ์ที่อยู่ตรง ๆ ระบบก็อาจรู้บริบทการใช้งานของเราได้บางส่วน",
  },
  {
    icon: <FiFileText />,
    title: "ข้อตกลงการใช้งานสำคัญเพราะเกี่ยวกับข้อมูลของเรา",
    points: [
      "ข้อตกลงการใช้งานและนโยบายความเป็นส่วนตัวมักอธิบายว่าแพลตฟอร์มเก็บข้อมูลอะไร ใช้ไปเพื่ออะไร และอาจแบ่งปันกับใครบ้าง",
      "หลายคนกดยอมรับทันทีเพราะเอกสารดูยาวและน่าเบื่อ แต่ถ้าไม่อ่านเลย เราอาจไม่รู้ว่ากำลังยินยอมเรื่องอะไรอยู่",
      "การอ่านเฉพาะส่วนสำคัญเกี่ยวกับข้อมูลส่วนบุคคล ก็ช่วยให้ตัดสินใจได้รอบคอบขึ้นมาก",
    ],
    note:
      "ทริคจำง่าย: ไม่ต้องอ่านทุกบรรทัด แต่ควรอ่านส่วนที่เกี่ยวกับข้อมูลของเรา",
  },
];

const DATA_TYPES = [
  {
    icon: <FiUser />,
    title: "ข้อมูลส่วนตัวพื้นฐาน",
    desc:
      "เช่น ชื่อ อีเมล เบอร์โทร หรือวันเกิด เป็นข้อมูลที่ผู้ใช้มักกรอกตอนสมัครบัญชีหรือใช้ยืนยันตัวตน",
  },
  {
    icon: <FiEye />,
    title: "พฤติกรรมการใช้งาน",
    desc:
      "เช่น เวลาเข้าใช้งาน สิ่งที่กดดู สิ่งที่กดไลก์ หรือเนื้อหาที่ใช้เวลานาน ข้อมูลแบบนี้ช่วยให้ระบบเข้าใจความสนใจของผู้ใช้",
  },
  {
    icon: <FiSmartphone />,
    title: "ข้อมูลอุปกรณ์",
    desc:
      "เช่น ประเภทอุปกรณ์ ระบบปฏิบัติการ หรือเวอร์ชันแอป ใช้เพื่อให้บริการทำงานได้เหมาะกับอุปกรณ์ที่ผู้ใช้กำลังใช้",
  },
  {
    icon: <FiMapPin />,
    title: "ข้อมูลตำแหน่งที่ตั้งโดยประมาณ",
    desc:
      "เช่น พื้นที่หรือภูมิภาคที่เข้าใช้งาน ข้อมูลนี้อาจถูกใช้เพื่อแสดงเนื้อหาหรือบริการที่เกี่ยวข้องกับพื้นที่ของผู้ใช้",
  },
];

const POLICY_BLOCKS = [
  {
    icon: <FiSearch />,
    title: "ข้อความที่ควรสังเกตเรื่องการเก็บข้อมูล",
    text:
      "แพลตฟอร์มอาจเก็บข้อมูลบัญชี ข้อมูลการใช้งาน ข้อมูลอุปกรณ์ และข้อมูลตำแหน่งที่ตั้งโดยประมาณ เพื่อให้บริการทำงานได้ ปรับปรุงประสบการณ์การใช้งาน และพัฒนาบริการในอนาคต",
    focus:
      "เวลามองข้อความแบบนี้ ให้ถามตัวเองสองข้อ: ระบบเก็บข้อมูลอะไร และเก็บไปเพื่ออะไร",
  },
  {
    icon: <FiMessageSquare />,
    title: "ข้อความที่ควรสังเกตเรื่องการใช้ข้อมูลเพื่อโฆษณา",
    text:
      "ผู้ใช้อาจยินยอมให้แพลตฟอร์มนำข้อมูลบางส่วนไปใช้เพื่อแสดงโฆษณา เนื้อหา หรือคำแนะนำที่สอดคล้องกับความสนใจและพฤติกรรมการใช้งาน",
    focus:
      "คำสำคัญที่ควรมองหา เช่น ยินยอม, นำข้อมูลไปใช้, โฆษณา, ความสนใจ, พฤติกรรมการใช้งาน",
  },
  {
    icon: <FiShield />,
    title: "ข้อความที่ควรสังเกตเรื่องการแบ่งปันข้อมูล",
    text:
      "ในบางกรณี แพลตฟอร์มอาจแบ่งปันข้อมูลกับผู้ให้บริการภายนอกหรือพันธมิตรที่เกี่ยวข้อง ตามเงื่อนไขที่ระบุไว้ในนโยบายและขอบเขตที่จำเป็นต่อการให้บริการ",
    focus:
      "คำสำคัญที่ควรมองหา เช่น แบ่งปันข้อมูล, ผู้ให้บริการภายนอก, พันธมิตร, ขอบเขตการใช้งาน",
  },
];

const KEY_TAKEAWAYS = [
  "แพลตฟอร์มออนไลน์มักเก็บข้อมูลหลายประเภท ไม่ใช่แค่ข้อมูลที่เรากรอกเอง",
  "พฤติกรรมการใช้งาน ข้อมูลอุปกรณ์ และตำแหน่งที่ตั้งโดยประมาณก็อาจเป็นข้อมูลที่ระบบเก็บได้",
  "ข้อตกลงการใช้งานและนโยบายความเป็นส่วนตัวอธิบายว่าแพลตฟอร์มจะเก็บ ใช้ หรืออาจแบ่งปันข้อมูลอย่างไร",
  "การกดยอมรับโดยไม่อ่าน อาจทำให้เราไม่รู้ผลกระทบต่อความเป็นส่วนตัวของตนเอง",
];

const REFLECTION_GUIDE = [
  "ข้อมูลของเราอาจถูกใช้เพื่อแสดงโฆษณาเฉพาะบุคคล",
  "พฤติกรรมการใช้งานอาจถูกวิเคราะห์มากขึ้นเพื่อคาดเดาความสนใจ",
  "ในบางกรณีข้อมูลอาจถูกแบ่งปันกับบุคคลที่สามตามเงื่อนไขที่ระบุไว้",
  "ถ้าไม่อ่านนโยบาย เราอาจไม่รู้ว่ากำลังยินยอมให้ข้อมูลถูกนำไปใช้อย่างไร",
];

/* ------------------------------------------------------------------ */
/* COMPONENT */
/* ------------------------------------------------------------------ */

export default function Learn5Unit7() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");
  const [step, setStep] = useState("lesson");

  useEffect(() => {
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

      if (profile) {
        setStudentName(
          `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim()
        );
      }

      setLoading(false);
    })();
  }, [navigate]);

  const panelTitle = useMemo(() => {
    if (step === "lesson") return "บทเรียนข้อมูลส่วนบุคคลและนโยบายแพลตฟอร์ม";
    if (step === "policy") return "การอ่านนโยบายแพลตฟอร์ม";
    return "ทบทวนความเข้าใจ";
  }, [step]);

  return (
    <div className="edu-app ls-adaptive">

      {/* HEADER */}
      <header className="edu-topbar">
        <div className="edu-topbar__inner">

          <div className="homebar__brand">
            <img src={logo} className="homebar__logo" />
            <div className="edu-brandtext">
              <div className="edu-brandtext__title">LearnSecure</div>
              <div className="edu-brandtext__subtitle">Unit 7</div>
            </div>
          </div>

          <div className="edu-topbar__right">

            <div className="edu-userchip">
              <div className="edu-userchip__avatar">
                <FiUser />
              </div>
              <div className="edu-userchip__name">
                {loading ? "กำลังโหลด..." : studentName || "ผู้เรียน"}
              </div>
            </div>

            <button
              className="edu-btn edu-btn--danger"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate("/login", { replace: true });
              }}
            >
              <FiLogOut /> ออกจากระบบ
            </button>

          </div>
        </div>
      </header>

      <main className="edu-layout">

        {/* HERO */}
        <section className="edu-hero">
          <div className="edu-hero__card">

            <div className="edu-hero__title">
              Unit 7 : การรู้เท่าทันโฆษณาและการโน้มน้าวใจบนโลกออนไลน์
            </div>

            <div className="edu-hero__sub">
              เรื่องที่ 5 : ข้อมูลส่วนบุคคลและนโยบายแพลตฟอร์ม
            </div>

            <div className="edu-lessons__toolbar">

              <button
                className="edu-btn edu-btn--back"
                onClick={() => {
                  if (step === "reflect") setStep("policy");
                  else if (step === "policy") setStep("lesson");
                  else navigate("/unit7/learn", { replace: true });
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                <FiChevronLeft /> กลับ
              </button>

              <button
                className="edu-btn edu-btn--ghost"
                onClick={() => navigate("/main")}
              >
                <FiHome /> กลับหน้าหลัก
              </button>

            </div>
          </div>
        </section>

        {/* PANEL */}
        <section className="edu-panel">

          <div className="edu-panel__head">
            <div className="edu-panel__title">
              <FiFileText /> {panelTitle}
            </div>
          </div>

          {step === "lesson" && (
            <>
              {MICRO_LESSON.map((item) => (
                <div key={item.title} className="edu-panel">

                  <div className="edu-adaptiveBlock__title">
                    {item.icon} {item.title}
                  </div>

                  <BulletList items={item.points} />

                  <p className="edu-note">{item.note}</p>

                </div>
              ))}

              <div className="edu-panel">
                <div className="edu-adaptiveBlock__title">
                  4 กลุ่มข้อมูลที่ควรรู้จัก
                </div>

                <div className="edu-actions">
                  {DATA_TYPES.map((item) => (
                    <div key={item.title} className="edu-action">

                      <div className="edu-action__icon">{item.icon}</div>

                      <div className="edu-action__text">
                        <span className="edu-action__title">{item.title}</span>
                        <span className="edu-action__desc">{item.desc}</span>
                      </div>

                    </div>
                  ))}
                </div>
              </div>

              <div className="edu-panel">
                <div className="edu-adaptiveBlock__title">
                  สิ่งที่ควรจำก่อนไปต่อ
                </div>

                <BulletList items={KEY_TAKEAWAYS} />
              </div>

              <div className="edu-lessons__toolbar">
                <button
                  className="edu-btn edu-btn--primary"
                  onClick={() => setStep("policy")}
                >
                  ไปอ่านตัวอย่างนโยบาย <FiChevronRight />
                </button>
              </div>
            </>
          )}

          {step === "policy" && (
            <>
              {POLICY_BLOCKS.map((item) => (
                <div key={item.title} className="card">

                  <div className="title">
                    {item.icon} {item.title}
                  </div>

                  <p className="subtitle">{item.text}</p>

                  <p className="smallMuted">{item.focus}</p>

                </div>
              ))}

              <div className="edu-panel">
                <div className="edu-adaptiveBlock__title">
                  เวลาอ่านข้อตกลงการใช้งาน ควรมองหาอะไร
                </div>

                <BulletList
                  items={[
                    "แพลตฟอร์มกำลังพูดถึงข้อมูลประเภทใด",
                    "ข้อมูลจะถูกนำไปใช้เพื่ออะไร",
                    "มีข้อความเกี่ยวกับโฆษณาเฉพาะบุคคลหรือไม่",
                    "มีข้อความเกี่ยวกับการแบ่งปันข้อมูลกับบุคคลหรือบริการอื่นหรือไม่",
                    "ถ้ากดยอมรับแล้ว อาจเกิดผลอย่างไรกับความเป็นส่วนตัวของผู้ใช้",
                  ]}
                />
              </div>

              <div className="edu-panel">
                <div className="edu-adaptiveBlock__title">
                  สรุปก่อนไปส่วนสะท้อนคิด
                </div>

                <BulletList items={KEY_TAKEAWAYS} />
              </div>

              <div className="edu-lessons__toolbar">
                <button
                  className="edu-btn edu-btn--back"
                  onClick={() => setStep("lesson")}
                >
                  <FiChevronLeft /> กลับไปอ่านเนื้อหา
                </button>

                <button
                  className="edu-btn edu-btn--primary"
                  onClick={() => setStep("reflect")}
                >
                  ไปส่วนสะท้อนคิด <FiChevronRight />
                </button>
              </div>
            </>
          )}

          {step === "reflect" && (
            <>
              <div className="edu-panel">

                <div className="title">
                  <FiCheckCircle /> ทบทวนความเข้าใจ
                </div>

                <BulletList items={REFLECTION_GUIDE} />

                <p className="edu-note">
                  จุดสำคัญของบทนี้คือเข้าใจว่า การยอมรับเงื่อนไขอาจมีผลต่อข้อมูลส่วนบุคคล
                  และความเป็นส่วนตัวของผู้ใช้ในชีวิตจริง
                </p>

              </div>

              <div className="edu-lessons__toolbar">

                <button
                  className="edu-btn edu-btn--back"
                  onClick={() => setStep("policy")}
                >
                  <FiChevronLeft /> กลับไปอ่านนโยบาย
                </button>

                <button
                  className="edu-btn edu-btn--ghost"
                  onClick={() => navigate("/unit7/learn", { replace: true })}
                >
                  เสร็จสิ้น <FiChevronRight />
                </button>

              </div>
            </>
          )}

        </section>
      </main>
    </div>
  );
}