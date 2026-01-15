import { useMemo, useState } from "react";
import { FiCheckCircle, FiAlertTriangle, FiChevronRight } from "react-icons/fi";

/**
 * ✅ Unit 1.3.4 — Final Case (Impact Mapping)
 * - เลือกหลายข้อ (ซ้าย = สิ่งที่เปิดเผย/ตั้งค่า, ขวา = ผลกระทบ)
 * - "เชื่อมโยงจริง" ด้วย mapping (cause -> impact)
 * - ไม่ต้องพิมพ์: ระบบสรุปเหตุ→ผลให้ทันที
 *
 * CSS ที่ใช้: learn.css (edu-*) + (ถ้าคุณจะเอาสไตล์ u13 ก็ได้ แต่ตัวนี้เน้น edu-* ให้เข้ากับหน้าเรียน)
 */

// =========================
// 1) Static Data
// =========================


const CAUSES = [
  { id: "public", label: "โพสต์เป็น Public", sub: "คนที่ไม่เกี่ยวข้องก็เห็นได้" },
  { id: "location", label: "เปิดเช็คอินสถานที่", sub: "บอกพิกัด/เส้นทางได้" },
  { id: "name", label: "เห็นชื่อ–นามสกุล", sub: "ระบุตัวตนได้ (ความเสี่ยงสูงขึ้น)" },
  { id: "photo", label: "เห็นหน้า/หน้าตาชัด", sub: "ยิ่งแชร์ต่อยิ่งควบคุมยาก" },
  { id: "group", label: "ไม่จำกัดกลุ่มผู้ชม", sub: "ออกนอกวงเพื่อนได้ง่าย" },
];

const IMPACTS = [
  { id: "stranger_see", label: "คนแปลกหน้าเห็นข้อมูล", sub: "ข้อมูลออกนอกกลุ่มควบคุม", term: "ระยะสั้น" },
  { id: "share_fast", label: "ข้อมูลถูกแชร์ต่อได้ง่าย", sub: "กระจายไว หยุดยาก", term: "ระยะสั้น" },
  { id: "misuse", label: "เสี่ยงถูกนำไปใช้ผิดวัตถุประสงค์", sub: "แอบอ้าง/หลอก/เอาไปทำคอนเทนต์ต่อ", term: "ระยะยาว" },
  { id: "unsafe", label: "รู้สึกไม่ปลอดภัย / ไม่สบายใจ", sub: "กระทบความมั่นใจในการใช้โซเชียล", term: "ระยะยาว" },
  { id: "reputation", label: "กระทบภาพลักษณ์/ชื่อเสียง", sub: "โดนแซว/โดนตัดต่อ/ถูกเข้าใจผิด", term: "ระยะยาว" },
];

// ✅ ระยะสั้น/ยาว (เพื่อ feedback แบบ “เห็นภาพ”)
const SHORT_IDS = new Set(["stranger_see", "share_fast"]);
const LONG_IDS = new Set(["misuse", "unsafe", "reputation"]);

// =========================
// 2) Mapping: cause -> impacts ที่ “เชื่อมได้”
// =========================
const LINK_MAP = {
  public: ["stranger_see", "share_fast", "misuse", "reputation"],
  group: ["stranger_see", "share_fast", "misuse", "reputation"],
  location: ["stranger_see", "misuse", "unsafe"],
  name: ["stranger_see", "misuse", "reputation"],
  photo: ["share_fast", "misuse", "unsafe", "reputation"],
};

// =========================
// 3) Helpers
// =========================
function useToggleList(initial = []) {
  const [list, setList] = useState(initial);

  const toggle = (id) => {
    setList((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const reset = () => setList([]);

  return { list, toggle, reset, setList };
}

function toLabel(mapArr, id) {
  const found = mapArr.find((x) => x.id === id);
  return found ? found.label : id;
}

// =========================
// 4) UI Subcomponents
// =========================
function OptionGrid({ items, pickedIds, onToggle, showTerm = false }) {
  return (
    <div className="edu-u1task__cards" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
      {items.map((item) => {
        const active = pickedIds.includes(item.id);

        return (
          <button
            key={item.id}
            type="button"
            className={`edu-u1card ${active ? "is-selected" : ""}`}
            onClick={() => onToggle(item.id)}
          >
            <div className="edu-u1card__label">
              {item.label}
              {showTerm ? (
                <span className="edu-pill" style={{ marginLeft: 8, padding: "4px 8px", fontSize: 12 }}>
                  {item.term}
                </span>
              ) : null}
            </div>
            <div className="edu-u1card__sub">{item.sub}</div>
          </button>
        );
      })}
    </div>
  );
}

function FeedbackBox({ ok, title, lines, chip }) {
  return (
    <div className={`edu-u1fb ${ok ? "is-ok" : "is-bad"}`}>
      <div className="edu-u1fb__top">
        <div className="edu-u1fb__title">
          {ok ? <FiCheckCircle /> : <FiAlertTriangle />}
          {title}
        </div>
        <div className="edu-u1fb__chip">{chip}</div>
      </div>

      <div className="edu-u1fb__body">
        {lines.map((line) => (
          <div key={line} className="edu-u1fb__line">
            • {line}
          </div>
        ))}
      </div>
    </div>
  );
}

function CheckpointBox({ points }) {
  return (
    <div className="edu-u1fb" style={{ marginTop: 12 }}>
      <div className="edu-u1fb__title">Checkpoint สรุป</div>
      <div className="edu-u1fb__body">
        {points.map((p) => (
          <div key={p} className="edu-u1fb__why">
            • {p}
          </div>
        ))}
      </div>
    </div>
  );
}

// =========================
// 5) Main Component
// =========================
export default function Unit1_3_4({ onNext }) {
  const causes = useToggleList([]);
  const impacts = useToggleList([]);
  const [checked, setChecked] = useState(false);

  // ✅ ผ่านขั้นต่ำ: ต้องเลือกทั้งสองฝั่ง
  const isValid = causes.list.length >= 1 && impacts.list.length >= 1;

  // ✅ รวม expected impacts จาก causes ที่เลือก
  const expectedImpactSet = useMemo(() => {
    const s = new Set();
    causes.list.forEach((cId) => {
      (LINK_MAP[cId] || []).forEach((iId) => s.add(iId));
    });
    return s;
  }, [causes.list]);

  // ✅ แยก impacts ที่เลือกเป็น “เข้า map” vs “นอก map”
  const { matched, mismatched } = useMemo(() => {
    const ok = [];
    const bad = [];

    impacts.list.forEach((iId) => {
      if (expectedImpactSet.has(iId)) ok.push(iId);
      else bad.push(iId);
    });

    return { matched: ok, mismatched: bad };
  }, [impacts.list, expectedImpactSet]);

  // ✅ เก็บการมองสั้น/ยาว (ใช้พูดให้เด็กเห็นภาพ)
  const hasShort = impacts.list.some((id) => SHORT_IDS.has(id));
  const hasLong = impacts.list.some((id) => LONG_IDS.has(id));

  const resetAll = () => {
    causes.reset();
    impacts.reset();
    setChecked(false);
  };

  // ✅ Feedback: “ระบบพูดแทนผู้เรียน” (ไม่ต้องพิมพ์)
  const feedback = useMemo(() => {
    if (!checked) return null;

    // ยังเลือกไม่ครบ
    if (!isValid) {
      return {
        ok: false,
        title: "ยังไม่ครบ",
        chip: "เลือกไม่ครบ",
        lines: ["เลือกอย่างน้อย 1 ข้อในแต่ละฝั่งก่อนนะ", "แล้วค่อยกดตรวจ เพื่อให้เห็นเหตุ → ผลชัด ๆ"],
      };
    }

    // ✅ สร้าง “ประโยคสอน” จาก cause ที่เลือก
    const teach = [];
    if (causes.list.includes("public") || causes.list.includes("group")) {
      teach.push("Public/ไม่จำกัดผู้ชม = ขยายวงคนเห็น → ข้อมูลหลุดออกนอกกลุ่มได้ง่าย");
    }
    if (causes.list.includes("location")) {
      teach.push("เช็คอิน/พิกัด = คนอื่นเดาเส้นทาง/ตำแหน่งได้ → เสี่ยงความปลอดภัยมากขึ้น");
    }
    if (causes.list.includes("name")) {
      teach.push("ชื่อ–นามสกุล = ระบุตัวตนได้ → ความเสี่ยงสูงกว่าโพสต์ทั่วไป");
    }
    if (causes.list.includes("photo")) {
      teach.push("หน้า/ภาพชัด = แชร์ต่อแล้วควบคุมยาก → โดนตัดต่อ/นำไปใช้ต่อได้");
    }

    // ✅ สรุปผล “เชื่อมโยง”
    const okCount = matched.length;
    const total = impacts.list.length;

    // ✅ ถ้าทุก impact ที่เลือกอยู่ใน map = ผ่านแบบชัด
    const allOk = total > 0 && okCount === total;

    // ✅ ถ้ามีทั้ง short+long ให้ชม
    const timeScopeLine =
      hasShort && hasLong
        ? "ดีมาก: คุณมองได้ทั้งระยะสั้น (เห็น/แชร์ไว) และระยะยาว (เอาไปใช้ต่อ/กระทบใจ/ชื่อเสียง)"
        : hasShort && !hasLong
        ? "คุณจับ “ระยะสั้น” ได้แล้ว ลองเติม “ระยะยาว” ที่อาจตามมาด้วย"
        : !hasShort && hasLong
        ? "คุณมอง “ระยะยาว” ได้ดี ลองเติม “ระยะสั้น” ที่มักเกิดทันทีด้วย"
        : "ลองเลือกผลกระทบเพิ่มให้เห็นทั้งระยะสั้นและระยะยาวนะ";

    // ✅ แปลงเป็น label อ่านง่าย
    const matchedLabels = matched.map((id) => toLabel(IMPACTS, id));
    const mismatchLabels = mismatched.map((id) => toLabel(IMPACTS, id));

    // ✅ สร้าง lines แบบ “อ่านแล้วเข้าใจทันที”
    const lines = [
      ...teach,
      timeScopeLine,
      matchedLabels.length ? `เชื่อมได้: ${matchedLabels.join(", ")}` : "ยังไม่เจอผลกระทบที่เชื่อมกับสิ่งที่เปิดเผย/ตั้งค่า",
    ];

    if (mismatchLabels.length) {
      lines.push(`ยังไม่ค่อยเชื่อม: ${mismatchLabels.join(", ")} (ลองดูว่าเกิดจาก cause อันไหน?)`);
    }

    return {
      ok: allOk, // สีเขียวเมื่อ “เชื่อมทั้งหมด”
      title: allOk ? "เชื่อมโยงได้ดี 👍" : "เกือบถูกแล้ว (ปรับนิดนึง) 🙂",
      chip: `${okCount}/${total} ข้อเชื่อมได้`,
      lines,
    };
  }, [checked, isValid, causes.list, matched, mismatched, hasShort, hasLong, impacts.list.length]);

  const checkpoint = useMemo(() => {
    if (!checked || !isValid) return null;

    return [
      "ดู “สิ่งที่เปิดเผย/ตั้งค่า” ก่อน (Public/พิกัด/ชื่อ/หน้า)",
      "ถามต่อว่า “ใครเข้าถึงได้” (เพื่อน vs คนแปลกหน้า vs แชร์ต่อ)",
      "แล้วค่อยสรุป “ผลกระทบ” ทั้งระยะสั้นและระยะยาว",
    ];
  }, [checked, isValid]);

  // ✅ ไปต่อ: บังคับให้กดตรวจ และต้องเลือกครบ
  const handleNext = () => {
    setChecked(true);
    if (!isValid) return;
    if (onNext) onNext();
  };

  return (
    <section className="edu-panel1">
      {/* Head */}
      <div className="edu-panel1__head">
        <div className="edu-panel1__title">
          <span>เลือกหลายข้อได้ทั้ง 2 ฝั่ง แล้วกด “ตรวจความเชื่อมโยง” ระบบจะสรุปเหตุ→ผลให้เอง</span>
          
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="edu-pill" onClick={resetAll} type="button">
            รีเซ็ต
          </button>

          
        </div>
      </div>



      {/* Task */}
      


{/* Two columns */}
<div className="edu-u1task__zones">
  {/* Left */}
  <div className="edu-u1zoneCard edu-u1zoneCard--left" role="region" aria-label="ฝั่งซ้าย: สิ่งที่เปิดเผย/ตั้งค่า">
    <div className="edu-u1zone">
      <div className="edu-u1zone__title">ฝั่งซ้าย: สิ่งที่เปิดเผย/ตั้งค่า</div>
      <div className="edu-u1zone__desc">เลือกสิ่งที่ทำให้ “คนอื่นเข้าถึงข้อมูลเราได้มากขึ้น”</div>
      <OptionGrid items={CAUSES} pickedIds={causes.list} onToggle={causes.toggle} />
    </div>
  </div>

  {/* Right */}
  <div className="edu-u1zoneCard edu-u1zoneCard--right" role="region" aria-label="ฝั่งขวา: ผลกระทบที่อาจตามมา">
    <div className="edu-u1zone">
      <div className="edu-u1zone__title">ฝั่งขวา: ผลกระทบที่อาจตามมา</div>
      <div className="edu-u1zone__desc">เลือกผลกระทบที่คิดว่าเชื่อมกับสิ่งที่เปิดเผย/ตั้งค่า</div>
      <OptionGrid items={IMPACTS} pickedIds={impacts.list} onToggle={impacts.toggle} showTerm />
    </div>
  </div>
</div>


        {/* Feedback */}
        {feedback ? (
          <FeedbackBox ok={feedback.ok} title={feedback.title} lines={feedback.lines} chip={feedback.chip} />
        ) : null}

        {/* Checkpoint */}
        {checkpoint ? <CheckpointBox points={checkpoint} /> : null}

        {/* Footer */}
        <div className="edu-videoActions">

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
<button
            className={`edu-btn edu-btn--primary ${checked ? "is-active" : ""}`}
            onClick={() => setChecked(true)}
            type="button"
          >
            ตรวจความเชื่อมโยง
          </button>


            <button
              className={`edu-btn edu-btn--ghost ${checked && isValid ? "is-active" : ""}`}
              type="button"
              onClick={handleNext}
            >
              ถัดไป <FiChevronRight />
            </button>
          </div>
        </div>
    </section>
  );
}
