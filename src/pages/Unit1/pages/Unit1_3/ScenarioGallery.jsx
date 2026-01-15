
import ScenarioCard from "./ScenarioCard";

/**
 * ✅ ScenarioGallery
 * - แสดงรายการสถานการณ์ทั้งหมด
 *
 * Props:
 * - scenarios: array
 * - currentId: id ที่เลือกอยู่
 * - doneMap: { [id]: true/false }
 * - onSelect(id): เลือกสถานการณ์
 */
export default function ScenarioGallery({ scenarios, currentId, doneMap, onSelect }) {
  return (
    // ✅ ครอบด้วย .u13-shell เพื่อได้พื้น/เงาแบบภาพ
    <div className="u13-shell">
      {/* ✅ กล่อง gallery */}
      <div className="u13-gallery">
        {/* ✅ หัวข้อ */}
        <div className="u13-header">
          <h3 className="u13-title">Scenario Gallery</h3>
          <p className="u13-desc">
            เลือก 1 สถานการณ์ แล้ว “ไฮไลต์” ว่าตรงไหนเป็นข้อมูลส่วนบุคคล
          </p>
        </div>

        {/* ✅ กริดการ์ด 5 ช่อง */}
        <div className="u13-grid">
          {scenarios.map((s) => (
            <ScenarioCard
              key={s.id} // ✅ key กัน React เตือน
              scenario={s} // ✅ ส่งข้อมูล scenario
              active={s.id === currentId} // ✅ สถานะเลือก
              done={Boolean(doneMap?.[s.id])} // ✅ ทำแล้วไหม
              onClick={() => onSelect(s.id)} // ✅ คลิกเพื่อเลือก
            />
          ))}
        </div>
      </div>
    </div>
  );
}
