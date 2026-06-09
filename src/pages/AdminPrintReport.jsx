import "../admin.css";
import "./AdminPrintReport.css";

import { Fragment, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiBarChart2,
  FiFileText,
  FiPrinter,
  FiRefreshCw,
} from "react-icons/fi";

import { supabase } from "../lib/supabase";
import { pairedTTest, safeNumber } from "../utils/pairedTTest";

const PRETEST_MAX_SCORE = 48;
const POSTTEST_MAX_SCORE = 48;

function isTestStudent(email) {
  const local = String(email || "")
    .trim()
    .toLowerCase()
    .split("@")[0];

  return (
    local === "000" ||
    local === "user000" ||
    local === "student000" ||
    local.endsWith("-000") ||
    local.endsWith("_000")
  );
}

function formatNumber(v, digits = 2) {
  if (v == null || !Number.isFinite(v)) return "—";
  return Number(v).toFixed(digits);
}

function formatScore(v, max) {
  const n = safeNumber(v);
  if (n == null) return "—";

  const display = Number.isInteger(n) ? String(n) : n.toFixed(2);
  return `${display}/${max}`;
}

function formatAge(v) {
  const n = safeNumber(v);
  if (n == null) return "ไม่ระบุ";
  return `${n} ปี`;
}

function getThaiPrintedAt() {
  return new Date().toLocaleString("th-TH", {
    dateStyle: "long",
    timeStyle: "short",
  });
}

export default function AdminPrintReport() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function loadReport() {
    try {
      setLoading(true);
      setErr("");

      const [studentsRes, pretestsRes, finalsRes] = await Promise.all([
        supabase
          .from("v_admin_students")
          .select("user_id, email, full_name, age, profile_completed")
          .order("email", { ascending: true }),

        supabase.from("pretest_results").select("user_id, total_score"),

        supabase
          .from("final_test_results")
          .select("user_id, first_total_score"),
      ]);

      if (studentsRes.error) throw studentsRes.error;
      if (pretestsRes.error) throw pretestsRes.error;
      if (finalsRes.error) throw finalsRes.error;

      const pretestMap = new Map();
      const posttestMap = new Map();

      for (const item of pretestsRes.data || []) {
        const score = safeNumber(item.total_score);
        if (item.user_id && score != null && !pretestMap.has(item.user_id)) {
          pretestMap.set(item.user_id, score);
        }
      }

      for (const item of finalsRes.data || []) {
        const score = safeNumber(item.first_total_score);
        if (item.user_id && score != null && !posttestMap.has(item.user_id)) {
          posttestMap.set(item.user_id, score);
        }
      }

      const reportRows = (studentsRes.data || [])
        .filter((student) => !isTestStudent(student.email))
        .map((student) => ({
          user_id: student.user_id,
          email: student.email || "—",
          age: student.age ?? null,
          pretest_score: pretestMap.get(student.user_id) ?? null,
          posttest_score: posttestMap.get(student.user_id) ?? null,
        }));

      setRows(reportRows);
    } catch (e) {
      console.error("ADMIN PRINT REPORT ERROR:", e);
      setErr(e?.message || "โหลดข้อมูลรายงานไม่สำเร็จ");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReport();
  }, []);

  const printedAt = useMemo(() => getThaiPrintedAt(), []);

  const pairedRows = useMemo(() => {
    return rows
      .filter((row) => row.pretest_score != null && row.posttest_score != null)
      .map((row) => ({
        user_id: row.user_id,
        pretest_score: row.pretest_score,
        posttest_score: row.posttest_score,
      }));
  }, [rows]);

  const stats = useMemo(() => pairedTTest(pairedRows), [pairedRows]);

  const ageGroups = useMemo(() => {
    const sortedRows = [...rows].sort((a, b) => {
      const ageA = safeNumber(a.age);
      const ageB = safeNumber(b.age);

      if (ageA == null && ageB == null) {
        return String(a.email).localeCompare(String(b.email));
      }

      if (ageA == null) return 1;
      if (ageB == null) return -1;
      if (ageA !== ageB) return ageA - ageB;

      return String(a.email).localeCompare(String(b.email));
    });

    const groups = [];

    sortedRows.forEach((row, index) => {
      const age = safeNumber(row.age);
      const key = age == null ? "unknown-age" : `age-${age}`;
      const label = age == null ? "ไม่ระบุอายุ" : `อายุ ${formatAge(age)}`;
      let group = groups[groups.length - 1];

      if (!group || group.key !== key) {
        group = { key, label, rows: [] };
        groups.push(group);
      }

      group.rows.push({ ...row, displayIndex: index + 1 });
    });

    return groups;
  }, [rows]);

  const summaryText = useMemo(() => {
    if (!stats.hasEnoughData) {
      return "ข้อมูลยังไม่เพียงพอสำหรับการคำนวณ Paired t-test";
    }

    if (stats.significant) {
      return "คะแนนหลังเรียนสูงกว่าก่อนเรียนอย่างมีนัยสำคัญทางสถิติที่ระดับ .05";
    }

    return "ยังไม่พบความแตกต่างอย่างมีนัยสำคัญทางสถิติที่ระดับ .05";
  }, [stats]);

  return (
    <div className="edu-app print-page">
      <div className="print-toolbar">
        <Link
          to="/admin/data"
          className="edu-btn edu-btn--ghost print-toolbar__btn"
          style={{ textDecoration: "none" }}
        >
          <FiArrowLeft />
          กลับหน้า Admin
        </Link>

        <div className="print-toolbar__right">
          <button
            type="button"
            className="edu-btn print-toolbar__btn"
            onClick={loadReport}
            disabled={loading}
          >
            <FiRefreshCw />
            โหลดใหม่
          </button>

          <button
            type="button"
            className="edu-btn edu-btn--primary print-toolbar__btn"
            onClick={() => window.print()}
            disabled={loading || !!err}
          >
            <FiPrinter />
            พิมพ์รายงาน
          </button>
        </div>
      </div>

      <main className="print-paper">
        <header className="print-header">
          <div>
            <div className="print-kicker">Admin Report</div>
            <h1>รายงานผลคะแนนผู้เรียน</h1>
            <p>
              รวมอีเมล คะแนนก่อนเรียน และคะแนนหลังเรียนไว้ในตารางเดียว
              แยกกลุ่มตามอายุด้วยแถบสี พร้อมจัดเฟรมสำหรับพิมพ์ลงกระดาษ A4 อย่างเป็นระเบียบ
            </p>
          </div>

          <div className="print-meta">
            <span>วันที่พิมพ์</span>
            <strong>{printedAt}</strong>
          </div>
        </header>

        {loading && (
          <section className="print-state">
            <div className="print-state__box">กำลังโหลดข้อมูลรายงาน…</div>
          </section>
        )}

        {!!err && !loading && (
          <section className="print-state">
            <div className="print-state__box print-state__box--error">
              โหลดข้อมูลรายงานไม่สำเร็จ
              <br />
              {err}
            </div>
          </section>
        )}

        {!loading && !err && (
          <>
            <section className="print-section">
              <div className="print-section__head">
                <div>
                  <h2>
                    <FiFileText />
                    ตารางคะแนนผู้เรียน
                  </h2>
                </div>

                <div className="print-count">
                  ทั้งหมด <strong>{rows.length}</strong> คน
                </div>
              </div>

              <table className="print-table">
                <colgroup>
                  <col className="print-col-no" />
                  <col className="print-col-email" />
                  <col className="print-col-score" />
                  <col className="print-col-score" />
                </colgroup>

                <thead>
                  <tr>
                    <th>ลำดับ</th>
                    <th>อีเมลผู้เรียน</th>
                    <th>Pretest</th>
                    <th>Posttest</th>
                  </tr>
                </thead>

                <tbody>
                  {ageGroups.map((group) => (
                    <Fragment key={group.key}>
                      <tr className="student-group-row">
                        <td colSpan={4}>
                          <span className="student-group-title">{group.label}</span>
                          <span className="student-group-count">
                            {group.rows.length} คน
                          </span>
                        </td>
                      </tr>

                      {group.rows.map((row) => (
                        <tr className="student-row" key={row.user_id || row.email}>
                          <td className="student-index-cell">
                            <span className="student-no">{row.displayIndex}</span>
                          </td>
                          <td className="email-cell">{row.email}</td>
                          <td className="score-cell">
                            {formatScore(row.pretest_score, PRETEST_MAX_SCORE)}
                          </td>
                          <td className="score-cell score-cell--post">
                            {formatScore(row.posttest_score, POSTTEST_MAX_SCORE)}
                          </td>
                        </tr>
                      ))}
                    </Fragment>
                  ))}

                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={4} className="print-empty">
                        ไม่พบข้อมูลผู้เรียน
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>

            <section className="print-section print-section--summary">
              <div className="print-section__head">
                <div>
                  <h2>
                    <FiBarChart2 />
                    วิเคราะห์ผลรวมผู้เรียน (Paired t-test)
                  </h2>
                  <p>ใช้เฉพาะผู้เรียนที่มีคะแนน pretest และ posttest ครบทั้งสองรายการ</p>
                </div>
              </div>

              <div className="print-summary-grid">
                <SummaryCard label="จำนวนผู้เรียนในรายงาน" value={rows.length} />
                <SummaryCard label="จำนวนคู่ข้อมูลที่ใช้คำนวณ" value={stats.n} />
                <SummaryCard label="ค่าเฉลี่ยก่อนเรียน" value={formatNumber(stats.preMean, 2)} />
                <SummaryCard label="ค่าเฉลี่ยหลังเรียน" value={formatNumber(stats.postMean, 2)} />
                <SummaryCard label="ค่าเฉลี่ยที่เพิ่มขึ้น" value={formatNumber(stats.gainMean, 2)} />
                <SummaryCard label="SD ของผลต่าง" value={formatNumber(stats.sdDiff, 2)} />
                <SummaryCard label="ค่า t" value={formatNumber(stats.t, 4)} />
                <SummaryCard label="df" value={stats.df ?? "—"} />
                <SummaryCard label="ค่า p" value={formatNumber(stats.p, 6)} />
              </div>

              <div className="print-conclusion">
                <strong>ผลสรุป:</strong> {summaryText}
              </div>

              <div className="print-note">
                * การวิเคราะห์นี้เปรียบเทียบคะแนนก่อนเรียนและหลังเรียนของผู้เรียนคนเดิม
                โดยคำนวณจากข้อมูลที่มีคะแนนครบทั้งสองชุดเท่านั้น
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="print-summary-card">
      <div className="print-summary-card__label">{label}</div>
      <div className="print-summary-card__value">{value}</div>
    </div>
  );
}
