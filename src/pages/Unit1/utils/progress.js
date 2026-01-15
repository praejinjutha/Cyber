// src/pages/Unit1/utils/progress.js

/**
 * ✅ key สำหรับเก็บ progress ใน localStorage
 * - แยก key ชัดเจนตาม step จะดูแลง่าย
 */

// ✅ (ของเดิม) step 1.2
const KEY_12 = "learnsecure:u1:step1-2";

// ✅ (เพิ่มใหม่) step 1.3
const KEY_13 = "learnsecure:u1:step1-3";

/**
 * =========================
 * ✅ Step 1.2 (ของเดิม)
 * =========================
 */

/**
 * ✅ โหลด progress (ถ้ามี)
 * - ใช้ตอนผู้เรียนรีเฟรชหน้าแล้วกลับมาทำต่อ
 */
export function loadU1_12() {
  try {
    const raw = localStorage.getItem(KEY_12);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error("loadU1_12 failed:", err);
    return null;
  }
}

/**
 * ✅ เซฟ progress
 * - เก็บผลลัพธ์ของ ClassificationTask
 */
export function saveU1_12(result) {
  try {
    if (!result) {
      localStorage.removeItem(KEY_12);
      return;
    }
    localStorage.setItem(KEY_12, JSON.stringify(result));
  } catch (err) {
    console.error("saveU1_12 failed:", err);
  }
}

/**
 * =========================
 * ✅ Step 1.3 (เพิ่มใหม่)
 * =========================
 */

/**
 * ✅ โหลด progress ของ 1.3
 * - ใช้ตอนผู้เรียนรีเฟรชแล้วกลับมาทำต่อ
 */
export function loadU1_13() {
  try {
    const raw = localStorage.getItem(KEY_13);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error("loadU1_13 failed:", err);
    return null;
  }
}

/**
 * ✅ เซฟ progress ของ 1.3
 * - เก็บผลลัพธ์ของ HighlightTask
 */
export function saveU1_13(result) {
  try {
    if (!result) {
      localStorage.removeItem(KEY_13);
      return;
    }
    localStorage.setItem(KEY_13, JSON.stringify(result));
  } catch (err) {
    console.error("saveU1_13 failed:", err);
  }
}

// ✅ เรื่องที่ 2.1
export const loadU1_21 = () => {
  try {
    const raw = localStorage.getItem("u1_21");
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

export const saveU1_21 = (data) => {
  try {
    localStorage.setItem("u1_21", JSON.stringify(data));
  } catch (e) {}
};
