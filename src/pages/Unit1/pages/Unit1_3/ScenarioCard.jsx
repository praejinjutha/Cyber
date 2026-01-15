// ✅ ScenarioCard.jsx
import { FiMessageCircle, FiImage, FiFileText, FiCheckCircle } from "react-icons/fi";


/**
 * ✅ ScenarioCard
 * - การ์ดสำหรับเลือก “สถานการณ์”
 *
 * Props:
 * - scenario: ข้อมูล scenario
 * - active: ถูกเลือกอยู่ไหม
 * - done: ทำเสร็จแล้วไหม
 * - onClick(): กดเพื่อเลือก
 */
export default function ScenarioCard({ scenario, active, done, onClick }) {
  // ✅ เลือกไอคอนตามประเภทของ scenario
  const Icon =
    scenario.type === "chat"
      ? FiMessageCircle
      : scenario.type === "story"
      ? FiImage
      : FiFileText;

  return (
    <button
      type="button" // ✅ ป้องกัน submit form โดยไม่ตั้งใจ
      onClick={onClick} // ✅ เรียก callback ตอนคลิก
      className={["u13-card", active ? "is-active" : ""].join(" ")} // ✅ class หลัก + active
    >
      <div className="u13-card-row">
        {/* ✅ กล่องไอคอน */}
        <div className="u13-iconbox">
          <Icon />
        </div>

        {/* ✅ เนื้อหา */}
        <div style={{ flex: 1 }}>
          {/* ✅ แถวบน: title + done badge */}
          <div className="u13-card-top">
            <div className="u13-card-title">{scenario.title}</div>

            {/* ✅ แสดง “ทำแล้ว” เมื่อ done === true */}
            {done && (
              <span className="u13-done">
                <FiCheckCircle />
                ทำแล้ว
              </span>
            )}
          </div>

          {/* ✅ subtitle */}
          <div className="u13-card-sub">{scenario.subtitle}</div>
        </div>
      </div>
    </button>
  );
}
