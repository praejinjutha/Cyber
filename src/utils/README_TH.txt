วิธีติดตั้งหน้า Print Report

1) คัดลอกไฟล์ไปวางตาม path นี้

src/pages/AdminPrintReport.jsx
src/pages/AdminPrintReport.css
src/utils/pairedTTest.js

2) แก้ไฟล์ src/App.js

เพิ่ม import:

import AdminPrintReport from "./pages/AdminPrintReport";

เพิ่ม route:

<Route path="/admin/print-report" element={<AdminPrintReport />} />

ตัวอย่างวางใกล้ ๆ route นี้:

<Route path="/dashScore" element={<DashScore />} />
<Route path="/admin/print-report" element={<AdminPrintReport />} />

3) แก้ไฟล์ DataAdmin.jsx

เพิ่ม icon FiPrinter ใน import react-icons/fi:

import {
  FiEye,
  FiMail,
  FiUser,
  FiClipboard,
  FiBarChart2,
  FiUsers,
  FiTrendingUp,
  FiActivity,
  FiPrinter,
} from "react-icons/fi";

จากนั้นหา:

<div className="edu-topbar__right">

แล้ววางปุ่มนี้ไว้เป็นปุ่มแรกใน div นั้น:

<Link
  to="/admin/print-report"
  target="_blank"
  rel="noreferrer"
  className="edu-btn edu-btn--primary"
  style={{
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  }}
>
  <FiPrinter />
  พิมพ์ข้อมูล
</Link>

4) วิธีใช้

กดปุ่ม "พิมพ์ข้อมูล" ในหน้า Admin
ระบบจะเปิดหน้า /admin/print-report
กด "พิมพ์รายงาน"
