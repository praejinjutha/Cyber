import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

// ===== อ่านค่า env =====
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

// ===== Admin client (service role) =====
const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ===== helper =====
const pad3 = (n) => String(n).padStart(3, "0");

// ===== seed 1 user =====
async function seedOneUser(i) {
  const email = `user${pad3(i)}@local.app`;
  const password = `Test${pad3(i)}`;

  // ✅ 1) สร้าง user ผ่าน Admin API
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  // ✅ ถ้าสร้างไม่สำเร็จ ให้ข้าม (ส่วนใหญ่คือมีอยู่แล้ว)
  if (error) {
    console.log(`⚠️ skip: ${email} (${error.message})`);
    return { ok: false, skipped: true, email };
  }

  const userId = data?.user?.id;
  if (!userId) {
    console.log(`⚠️ skip: ${email} (no user id returned)`);
    return { ok: false, skipped: true, email };
  }

  // ✅ 2) upsert user_profiles
  const { error: up1 } = await admin.from("user_profiles").upsert({
    user_id: userId,
    is_admin: false,
  });

  if (up1) {
    console.error("❌ user_profiles upsert error:", email, up1);
  }

  // ✅ 3) upsert student_profiles
  const { error: up2 } = await admin.from("student_profiles").upsert({
    user_id: userId,
    first_name: "นักเรียน",
    last_name: pad3(i),
    age: 16,
  });

  if (up2) {
    console.error("❌ student_profiles upsert error:", email, up2);
  }

  console.log(`✅ seeded: ${email} / ${password}`);
  return { ok: true, email };
}

async function main() {
  console.log("🚀 Seeding users 1..120");

  let created = 0;
  let skipped = 0;

  for (let i = 1; i <= 120; i++) {
    const res = await seedOneUser(i);
    if (res.ok) created++;
    else if (res.skipped) skipped++;
  }

  console.log(`🎉 Done. created=${created}, skipped=${skipped}`);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
