import { useState } from "react";

const FY_MONTHS = [
  { label: "April 2025",     short: "April'25",     key: "apr25", totalDays: 30, period: "01.04.2025 to 30.04.2025" },
  { label: "May 2025",       short: "May'25",        key: "may25", totalDays: 31, period: "01.05.2025 to 31.05.2025" },
  { label: "June 2025",      short: "June'25",       key: "jun25", totalDays: 30, period: "01.06.2025 to 30.06.2025" },
  { label: "July 2025",      short: "July'25",       key: "jul25", totalDays: 31, period: "01.07.2025 to 31.07.2025" },
  { label: "August 2025",    short: "August'25",     key: "aug25", totalDays: 31, period: "01.08.2025 to 31.08.2025" },
  { label: "September 2025", short: "September'25",  key: "sep25", totalDays: 30, period: "01.09.2025 to 30.09.2025" },
  { label: "October 2025",   short: "October'25",    key: "oct25", totalDays: 31, period: "01.10.2025 to 31.10.2025" },
  { label: "November 2025",  short: "November'25",   key: "nov25", totalDays: 30, period: "01.11.2025 to 30.11.2025" },
  { label: "December 2025",  short: "December'25",   key: "dec25", totalDays: 31, period: "01.12.2025 to 31.12.2025" },
  { label: "January 2026",   short: "January'26",    key: "jan26", totalDays: 31, period: "01.01.2026 to 31.01.2026" },
  { label: "February 2026",  short: "February'26",   key: "feb26", totalDays: 28, period: "01.02.2026 to 28.02.2026" },
  { label: "March 2026",     short: "March'26",      key: "mar26", totalDays: 31, period: "01.03.2026 to 31.03.2026" },
];

const DEFAULT_EMP = {
  name: "Anurag Anil Yamnurwar", employeeId: "PS-1024",
  designation: "Graduate Engineer Trainee (GET)", department: "IT & LMS",
  doj: "07 August 2025", gender: "Male", location: "Nagpur, Maharashtra",
  company: "Perpetual Solutions", bankAccount: "", aadhar: "", pan: "",
};

const DEFAULT_SAL = { basic: 4500, conveyance: 1000, flexible: 750, other: 0, lateEarlyPenalty: 0, policyAdjustment: 0 };

const DEFAULT_KPI = { attTarget: 31, attRate: 1, travelTarget: 200, travelRate: 3, projTarget: 20, projRate: 10 };

const DEFAULT_ATT = { apr25: null, may25: null, jun25: null, jul25: null, aug25: 31, sep25: 30, oct25: 31, nov25: 30, dec25: 31, jan26: 31, feb26: 28, mar26: 31 };

const SAVED_PAY = { apr25: null, may25: null, jun25: null, jul25: null, aug25: 4032, sep25: 5000, oct25: 10000, nov25: 7250, dec25: 7750, jan26: 6250, feb26: 7250, mar26: null };

const f2 = (n) => Number(n || 0).toFixed(2);
const fINR = (n) => n == null ? "₹ -" : `₹ ${Number(n).toFixed(2)}`;

function computeSlip(sal, att, kpi, monthKey, variablePay, travelKM, projects) {
  const month = FY_MONTHS.find(m => m.key === monthKey);
  const present = att[monthKey];
  if (present == null || present === "") return null;
  const totalDays = month.totalDays;
  const presentDays = Number(present);
  const lwp = Math.max(0, totalDays - presentDays);
  const totalStd = Number(sal.basic) + Number(sal.conveyance) + Number(sal.flexible) + Number(sal.other);
  const lopDeduction = lwp * (totalStd / totalDays);
  const lateEarly = Number(sal.lateEarlyPenalty);
  const policy = Number(sal.policyAdjustment);
  const grossDeductions = lopDeduction + lateEarly + policy;
  const grossEarnings = Math.max(0, totalStd - grossDeductions);
  const varTotal = Object.values(variablePay).reduce((s, v) => s + Number(v || 0), 0);
  const netPay = grossEarnings + varTotal;
  const attValue = Math.min(presentDays, Number(kpi.attTarget)) * Number(kpi.attRate);
  const travelValue = Math.min(Number(travelKM), Number(kpi.travelTarget)) * Number(kpi.travelRate);
  const projValue = Math.min(Number(projects), Number(kpi.projTarget)) * Number(kpi.projRate);
  return { totalStd, lopDeduction, lateEarly, policy, grossDeductions, grossEarnings, varTotal, netPay, presentDays, lwp, totalDays, attValue, travelValue, projValue };
}

export default function App() {
  const [tab, setTab] = useState("setup");
  const [emp, setEmp] = useState(DEFAULT_EMP);
  const [sal, setSal] = useState(DEFAULT_SAL);
  const [kpi, setKpi] = useState(DEFAULT_KPI);
  const [att, setAtt] = useState(DEFAULT_ATT);
  const [savedPay, setSavedPay] = useState(SAVED_PAY);
  const [selMonth, setSelMonth] = useState("mar26");
  const [varPay, setVarPay] = useState({ enquiry: 0, product: 0, performance: 0, travel: 0, bonus: 0 });
  const [travelKM, setTravelKM] = useState(0);
  const [projects, setProjects] = useState(0);
  const [bills, setBills] = useState([{ desc: "", rate: "", amount: "" }, { desc: "", rate: "", amount: "" }, { desc: "", rate: "", amount: "" }, { desc: "", rate: "", amount: "" }, { desc: "", rate: "", amount: "" }]);

  const monthObj = FY_MONTHS.find(m => m.key === selMonth);
  const slip = computeSlip(sal, att, kpi, selMonth, varPay, travelKM, projects);
  const totalStd = Number(sal.basic) + Number(sal.conveyance) + Number(sal.flexible) + Number(sal.other);

  const ytd = FY_MONTHS.reduce((s, m) => {
    const p = m.key === selMonth ? (slip?.netPay ?? 0) : (savedPay[m.key] ?? 0);
    return s + p;
  }, 0);

  const setE = (k, v) => setEmp(e => ({ ...e, [k]: v }));
  const setS = (k, v) => setSal(s => ({ ...s, [k]: v }));
  const setK = (k, v) => setKpi(p => ({ ...p, [k]: v }));

  const handlePrint = () => {
    window.print();
  };

  const billsTotal = bills.reduce((s, b) => s + Number(b.amount || 0), 0);

  // ─── STYLES ────────────────────────────────────────────────────────────────
  const dark = {
    app: { fontFamily: "'Outfit',sans-serif", background: "#090c14", minHeight: "100vh", color: "#d8ddf0" },
    bar: { background: "#0e1120", borderBottom: "1px solid #1c2040", padding: "13px 30px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 },
    logo: { width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#2563eb,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 17, color: "#fff" },
    tabRow: { display: "flex", gap: 3, background: "#090c14", border: "1px solid #1c2040", borderRadius: 9, padding: 4 },
    tab: (a) => ({ padding: "8px 18px", borderRadius: 6, fontSize: 12.5, fontWeight: 500, cursor: "pointer", border: "none", background: a ? "#171d35" : "transparent", color: a ? "#dde1f0" : "#505880", transition: "all .15s" }),
    body: { padding: "26px 30px", maxWidth: 1180, margin: "0 auto" },
    card: { background: "#0e1120", border: "1px solid #1c2040", borderRadius: 13, padding: "20px 22px", marginBottom: 14 },
    slabel: { fontSize: 9.5, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#353c60", marginBottom: 13 },
    g2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13 },
    g3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 13 },
    lbl: { fontSize: 10.5, color: "#454b72", marginBottom: 4, display: "block" },
    inp: { width: "100%", background: "#090c14", border: "1px solid #1c2040", borderRadius: 7, padding: "8px 11px", color: "#d8ddf0", fontSize: 12.5, outline: "none", boxSizing: "border-box", fontFamily: "inherit" },
    btn: { background: "linear-gradient(135deg,#1d4ed8,#6d28d9)", border: "none", color: "#fff", padding: "9px 20px", borderRadius: 8, fontWeight: 600, fontSize: 12.5, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 7 },
  };

  const Field = ({ label, val, onChange, type = "text" }) => (
    <div>
      <label style={dark.lbl}>{label}</label>
      <input style={dark.inp} type={type} value={val} onChange={e => onChange(e.target.value)} />
    </div>
  );

  // ─── ATTENDANCE TAB ─────────────────────────────────────────────────────────
  const AttTab = () => (
    <div>
      <div style={dark.card}>
        <div style={dark.slabel}>Attendance — FY 2025–26 &nbsp;|&nbsp; Enter present days for each month</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(195px,1fr))", gap: 12 }}>
          {FY_MONTHS.map(m => {
            const present = att[m.key];
            const total = m.totalDays;
            const lwp = present != null ? Math.max(0, total - present) : null;
            const pct = present != null ? (Number(present) / total) * 100 : 0;
            const isActive = selMonth === m.key;
            return (
              <div key={m.key}
                onClick={() => setSelMonth(m.key)}
                style={{ background: "#090c14", border: `1px solid ${isActive ? "#3b82f6" : "#1c2040"}`, borderRadius: 10, padding: "13px 15px", cursor: "pointer", transition: "border .15s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#b8c0dc" }}>{m.label}</div>
                  {present != null && <span style={{ fontSize: 9.5, background: "#061810", color: "#34d399", border: "1px solid #0c4025", borderRadius: 20, padding: "1px 7px", fontWeight: 700 }}>✓</span>}
                </div>
                <label style={dark.lbl}>Present Days (of {total})</label>
                <input
                  style={{ ...dark.inp, borderColor: present != null ? "#2563eb55" : "#1c2040" }}
                  type="number" min={0} max={total}
                  value={present ?? ""}
                  placeholder={`Max ${total}`}
                  onClick={e => e.stopPropagation()}
                  onChange={e => {
                    const raw = e.target.value;
                    const v = raw === "" ? null : Math.min(total, Math.max(0, Number(raw)));
                    setAtt(a => ({ ...a, [m.key]: v }));
                  }}
                />
                {present != null && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "#454b72", marginBottom: 4 }}>
                      <span>LWP: <span style={{ color: lwp > 0 ? "#f87171" : "#34d399", fontWeight: 600 }}>{lwp}</span></span>
                      <span>{pct.toFixed(0)}%</span>
                    </div>
                    <div style={{ height: 3, background: "#1c2040", borderRadius: 2 }}>
                      <div style={{ height: 3, width: `${pct}%`, background: pct >= 90 ? "#34d399" : pct >= 70 ? "#fbbf24" : "#f87171", borderRadius: 2 }} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={dark.card}>
        <div style={dark.slabel}>KPI Targets &amp; Rates</div>
        <div style={dark.g3}>
          {[
            ["Attendance Target (days)", "attTarget"], ["Attendance Rate (₹/day)", "attRate"],
          ].map(([l, k]) => <Field key={k} label={l} val={kpi[k]} type="number" onChange={v => setK(k, v)} />)}
          <div />
          {[
            ["Travel Target (KM)", "travelTarget"], ["Travel Rate (₹/KM)", "travelRate"],
          ].map(([l, k]) => <Field key={k} label={l} val={kpi[k]} type="number" onChange={v => setK(k, v)} />)}
          <Field label={`Travel KM Achieved (${monthObj?.label})`} val={travelKM} type="number" onChange={setTravelKM} />
          {[
            ["Projects Target", "projTarget"], ["Projects Rate (₹/project)", "projRate"],
          ].map(([l, k]) => <Field key={k} label={l} val={kpi[k]} type="number" onChange={v => setK(k, v)} />)}
          <Field label={`Projects Achieved (${monthObj?.label})`} val={projects} type="number" onChange={setProjects} />
        </div>
      </div>

      <div style={{ textAlign: "right" }}>
        <button style={dark.btn} onClick={() => setTab("payslip")}>Generate Payslip →</button>
      </div>
    </div>
  );

  // ─── PAYSLIP TAB ────────────────────────────────────────────────────────────
  const PayTab = () => {
    if (!slip) return (
      <div style={{ ...dark.card, textAlign: "center", padding: "50px 20px" }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
        <div style={{ fontSize: 14, color: "#454b72" }}>No attendance data for <strong style={{ color: "#d8ddf0" }}>{monthObj?.label}</strong></div>
        <div style={{ fontSize: 11.5, color: "#2d3255", marginTop: 6 }}>Go to <strong>Attendance</strong> tab and enter present days for this month.</div>
        <button style={{ ...dark.btn, margin: "16px auto 0" }} onClick={() => setTab("attendance")}>Go to Attendance</button>
      </div>
    );

    return (
      <div>
        {/* Controls */}
        <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div>
            <label style={dark.lbl}>Generate payslip for</label>
            <select style={{ ...dark.inp, width: "auto", cursor: "pointer" }} value={selMonth} onChange={e => setSelMonth(e.target.value)}>
              {FY_MONTHS.map(m => <option key={m.key} value={m.key}>{m.label}{att[m.key] != null ? " ✓" : ""}</option>)}
            </select>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <button style={dark.btn} onClick={handlePrint}>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8" rx="1"/></svg>
              Download / Print PDF
            </button>
          </div>
        </div>

        {/* Variable Pay Inputs */}
        <div style={dark.card}>
          <div style={dark.slabel}>Variable Pay &amp; Bills for {monthObj?.label}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 11, marginBottom: 18 }}>
            {[["Enquiry Based (₹)", "enquiry"], ["Product Based (₹)", "product"], ["Performance (₹)", "performance"], ["Travel Reimb (₹)", "travel"], ["Bonus (₹)", "bonus"]].map(([l, k]) => (
              <Field key={k} label={l} val={varPay[k]} type="number" onChange={v => setVarPay(p => ({ ...p, [k]: v }))} />
            ))}
          </div>
          <div style={dark.slabel}>Bills / Reimbursements</div>
          {bills.map((b, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 9, marginBottom: 7 }}>
              <div><label style={dark.lbl}>Description</label><input style={dark.inp} value={b.desc} onChange={e => setBills(bl => bl.map((x, j) => j === i ? { ...x, desc: e.target.value } : x))} /></div>
              <div><label style={dark.lbl}>Rate</label><input style={dark.inp} type="number" value={b.rate} onChange={e => setBills(bl => bl.map((x, j) => j === i ? { ...x, rate: e.target.value } : x))} /></div>
              <div><label style={dark.lbl}>Amount (₹)</label><input style={dark.inp} type="number" value={b.amount} onChange={e => setBills(bl => bl.map((x, j) => j === i ? { ...x, amount: e.target.value } : x))} /></div>
            </div>
          ))}
        </div>

        {/* ───── PRINTABLE PAYSLIP ───── */}
        <div id="payslip-print" style={{ background: "#fff", color: "#111", fontFamily: "Arial, Helvetica, sans-serif", fontSize: "10.5px", border: "2px solid #222", borderRadius: 3, padding: "18px 22px", maxWidth: 840, margin: "0 auto" }}>
          <style>{`
            @media print {
              body > * { display: none !important; }
              #payslip-print { display: block !important; position: static !important; max-width: 100% !important; border: 2px solid #222 !important; margin: 0 !important; }
              #payslip-print { color: #111 !important; background: #fff !important; }
            }
            #ps-table { border-collapse: collapse; width: 100%; }
            #ps-table td, #ps-table th { padding: 2.5px 5px; }
            .psborder td, .psborder th { border: 1px solid #bbb; }
            .pshead { background: #ececec; font-weight: 700; }
          `}</style>

          {/* Header */}
          <div style={{ textAlign: "center", paddingBottom: 10, marginBottom: 8, borderBottom: "2px solid #222", position: "relative" }}>
            <div style={{ position: "absolute", right: 0, top: 0 }}>
              <div style={{ fontWeight: 900, fontSize: 15, color: "#1a3a8f" }}>Perpetual</div>
              <div style={{ fontSize: 9, color: "#666" }}>Solutions</div>
              <div style={{ fontSize: 8.5, color: "#999", marginTop: 1 }}>{emp.location}</div>
            </div>
            <div style={{ fontWeight: 900, fontSize: 17 }}>Salary Payslip for the Month of {monthObj?.label}</div>
            <div style={{ fontSize: 10.5, color: "#555", marginTop: 2 }}>Pay Period: {monthObj?.period}</div>
            <div style={{ fontWeight: 700, fontSize: 13, marginTop: 3 }}>{emp.name}</div>
          </div>

          {/* Employee Info */}
          <table id="ps-table" style={{ marginBottom: 9 }}>
            <tbody>
              {[
                ["Employee ID", emp.employeeId, "Bank A/C", emp.bankAccount],
                ["Designation", emp.designation, "Location", emp.location],
                ["DOJ", emp.doj, "Department", emp.department],
                ["Gender", emp.gender, "Days Worked", f2(slip.presentDays)],
                ["Aadhar", emp.aadhar, "LWP", f2(slip.lwp)],
                ["PAN", emp.pan, "Payable Days", f2(slip.presentDays)],
                ["", "", "Leave Balance", "0"],
              ].map(([k1, v1, k2, v2], i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 700, width: "13%", whiteSpace: "nowrap" }}>{k1}</td>
                  <td style={{ width: 8 }}>{k1 ? ":" : ""}</td>
                  <td style={{ width: "30%" }}>{v1}</td>
                  <td style={{ fontWeight: 700, width: "13%", whiteSpace: "nowrap" }}>{k2}</td>
                  <td style={{ width: 8 }}>:</td>
                  <td>{v2}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Salary Structure */}
          <div style={{ fontWeight: 800, textAlign: "center", background: "#dedede", padding: "3.5px 0", border: "1px solid #aaa", fontSize: 11, letterSpacing: ".5px" }}>SALARY STRUCTURE</div>
          <table id="ps-table" className="psborder">
            <thead>
              <tr className="pshead">
                <th style={{ textAlign: "left" }}>Component</th><th style={{ textAlign: "right" }}>INR</th>
                <th style={{ textAlign: "left" }}>Component</th><th style={{ textAlign: "right" }}>INR</th>
                <th style={{ textAlign: "left" }}>Deductions</th><th style={{ textAlign: "right" }}>INR</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Basic Salary", sal.basic, "Basic Salary", sal.basic, "Attendance Adjustment (LOP)", slip.lopDeduction],
                ["Conveyance Allowance", sal.conveyance, "Conveyance Allowance", sal.conveyance, "Late / Early Penalty", slip.lateEarly],
                ["Flexible Allowance", sal.flexible, "Flexible Allowance", sal.flexible, "Policy Adjustment", slip.policy],
                ["Other Allowance", sal.other, "Other Allowance", sal.other, null, null],
              ].map(([c1, v1, c2, v2, c3, v3], i) => (
                <tr key={i}>
                  <td>{c1}</td><td style={{ textAlign: "right" }}>{f2(v1)}</td>
                  <td>{c2}</td><td style={{ textAlign: "right" }}>{f2(v2)}</td>
                  <td>{c3 ?? ""}</td><td style={{ textAlign: "right" }}>{c3 != null ? f2(v3) : ""}</td>
                </tr>
              ))}
              {[...Array(5)].map((_, i) => <tr key={`s${i}`}><td colSpan={6} style={{ height: 10 }} /></tr>)}
              <tr style={{ fontWeight: 700, borderTop: "2px solid #888" }}>
                <td>Total Standard Salary</td><td style={{ textAlign: "right" }}>₹ {f2(slip.totalStd)}</td>
                <td>Gross Earnings</td><td style={{ textAlign: "right" }}>₹ {f2(slip.grossEarnings)}</td>
                <td>Gross Deductions</td><td style={{ textAlign: "right" }}>₹ {slip.grossDeductions > 0 ? f2(slip.grossDeductions) : "-"}</td>
              </tr>
              <tr style={{ fontWeight: 800 }}>
                <td colSpan={4} />
                <td style={{ textAlign: "right" }}>Net Pay</td>
                <td style={{ textAlign: "right" }}>₹ {f2(slip.netPay)}</td>
              </tr>
            </tbody>
          </table>

          {/* Compensation Details */}
          <div style={{ fontWeight: 800, textAlign: "center", background: "#dedede", padding: "3.5px 0", border: "1px solid #aaa", fontSize: 11, letterSpacing: ".5px", marginTop: 8 }}>COMPENSATION DETAILS</div>
          <table id="ps-table" className="psborder">
            <thead>
              <tr className="pshead">
                <th colSpan={2} style={{ textAlign: "center" }}>EARNINGS</th>
                <th colSpan={2} style={{ textAlign: "center" }}>VARIABLE PAY</th>
                <th colSpan={2} style={{ textAlign: "center" }}>FY Earnings Record</th>
              </tr>
              <tr style={{ background: "#f5f5f5" }}>
                <th style={{ textAlign: "left" }}>Component</th><th style={{ textAlign: "right" }}>Value</th>
                <th style={{ textAlign: "left" }}>Metric</th><th style={{ textAlign: "right" }}>Value</th>
                <th style={{ textAlign: "left" }}>Month</th><th style={{ textAlign: "right" }}>Net Pay</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const earningsRows = [
                  ["Gross Earnings", fINR(slip.grossEarnings)],
                  ["Variable Pay", slip.varTotal > 0 ? fINR(slip.varTotal) : "₹ -"],
                  ["Total Earnings", fINR(slip.netPay)],
                  ["Monthly CTC", fINR(totalStd)],
                  ["YTD Earnings", fINR(ytd)],
                ];
                const varRows = [
                  ["Enquiry Based Earnings", f2(varPay.enquiry)],
                  ["Product Based Earnings", f2(varPay.product)],
                  ["Performance Based Earnings", f2(varPay.performance)],
                  ["Travel Reimbursement (₹/KM)", f2(varPay.travel)],
                  ["Bonus", f2(varPay.bonus)],
                ];
                return FY_MONTHS.map((m, i) => {
                  const netForMonth = m.key === selMonth ? slip.netPay : (savedPay[m.key] ?? null);
                  return (
                    <tr key={m.key}>
                      <td style={{ fontWeight: i < earningsRows.length ? 400 : 400 }}>{earningsRows[i]?.[0] ?? ""}</td>
                      <td style={{ textAlign: "right" }}>{earningsRows[i]?.[1] ?? ""}</td>
                      <td>{varRows[i]?.[0] ?? ""}</td>
                      <td style={{ textAlign: "right" }}>{varRows[i]?.[1] ?? ""}</td>
                      <td>{m.short}</td>
                      <td style={{ textAlign: "right" }}>{netForMonth != null ? fINR(netForMonth) : "₹ -"}</td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>

          {/* Bills */}
          <div style={{ fontWeight: 800, textAlign: "center", background: "#dedede", padding: "3.5px 0", border: "1px solid #aaa", fontSize: 11, letterSpacing: ".5px", marginTop: 8 }}>BIILS DETAILS</div>
          <table id="ps-table" className="psborder">
            <thead>
              <tr className="pshead">
                <th style={{ textAlign: "left" }}>Description</th>
                <th style={{ textAlign: "right" }}>Rate</th>
                <th style={{ textAlign: "right" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((b, i) => (
                <tr key={i}>
                  <td>{b.desc}</td>
                  <td style={{ textAlign: "right" }}>{b.rate}</td>
                  <td style={{ textAlign: "right" }}>{b.amount ? f2(b.amount) : "0.00"}</td>
                </tr>
              ))}
              <tr style={{ fontWeight: 700, borderTop: "1px solid #999" }}>
                <td colSpan={2} style={{ textAlign: "right" }}>Total</td>
                <td style={{ textAlign: "right" }}>₹ {billsTotal > 0 ? f2(billsTotal) : "-"}</td>
              </tr>
              <tr>
                <td colSpan={3} style={{ fontSize: 8.5, color: "#555", fontStyle: "italic", paddingTop: 4 }}>
                  Note : Conversions are considered for orders &gt;INR25000, *Targets may be revised every 6 month
                </td>
              </tr>
            </tbody>
          </table>

          {/* Performance */}
          <div style={{ fontWeight: 800, textAlign: "center", background: "#dedede", padding: "3.5px 0", border: "1px solid #aaa", fontSize: 11, letterSpacing: ".5px", marginTop: 8 }}>PERFORMANCE SUMMARY</div>
          <table id="ps-table" className="psborder">
            <thead>
              <tr className="pshead">
                <th style={{ textAlign: "left" }}>KPI</th>
                <th style={{ textAlign: "right" }}>Target</th>
                <th style={{ textAlign: "right" }}>Achieved</th>
                <th style={{ textAlign: "right" }}>Rate</th>
                <th style={{ textAlign: "right" }}>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Attendance</td><td style={{ textAlign: "right" }}>{kpi.attTarget}</td><td style={{ textAlign: "right" }}>{f2(slip.presentDays)}</td><td style={{ textAlign: "right" }}>{kpi.attRate}</td><td style={{ textAlign: "right" }}>{f2(slip.attValue)}</td></tr>
              <tr><td>Travel KM</td><td style={{ textAlign: "right" }}>{kpi.travelTarget}</td><td style={{ textAlign: "right" }}>{travelKM}</td><td style={{ textAlign: "right" }}>{kpi.travelRate}</td><td style={{ textAlign: "right" }}>{f2(slip.travelValue)}</td></tr>
              <tr><td>Projects</td><td style={{ textAlign: "right" }}>{kpi.projTarget}</td><td style={{ textAlign: "right" }}>{projects}</td><td style={{ textAlign: "right" }}>{kpi.projRate}</td><td style={{ textAlign: "right" }}>{f2(slip.projValue)}</td></tr>
            </tbody>
          </table>

          {/* Footer */}
          <div style={{ marginTop: 18, fontSize: 9, color: "#444", lineHeight: 1.9 }}>
            <div>* This is a system-generated payslip and does not require signature.</div>
            <div>* All earnings and adjustments are governed by company policies and performance criteria.</div>
            <div>* For any discrepancies, please contact HR within 7 working days.</div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, borderTop: "1px solid #ddd", paddingTop: 5, fontSize: 9.5, color: "#777" }}>
            <span>{emp.name}</span><span>Page 1</span><span>{new Date().toLocaleDateString("en-GB").replace(/\//g, "-")}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={dark.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus { border-color: #3b82f6 !important; }
        input[type=number]::-webkit-inner-spin-button { opacity: .35; }
        select { appearance: auto; }
        @media print {
          body > * { display: none !important; }
          #payslip-print {
            display: block !important;
            position: fixed !important;
            top: 0; left: 0;
            width: 100% !important;
            max-width: 100% !important;
            border: none !important;
            padding: 12px !important;
            background: #fff !important;
            color: #111 !important;
          }
        }
      `}</style>

      {/* Topbar */}
      <div style={dark.bar}>
        <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
          <div style={dark.logo}>P</div>
          <div>
            <div style={{ fontSize: 14.5, fontWeight: 700 }}>Payroll Manager</div>
            <div style={{ fontSize: 10.5, color: "#2d3460" }}>FY 2025–26 · {emp.company}</div>
          </div>
        </div>
        <div style={dark.tabRow}>
          {[["setup", "⚙ Setup"], ["attendance", "📅 Attendance"], ["payslip", "🧾 Payslip"]].map(([t, l]) => (
            <button key={t} style={dark.tab(tab === t)} onClick={() => setTab(t)}>{l}</button>
          ))}
        </div>
      </div>

      <div style={dark.body}>

        {/* ── SETUP ── */}
        {tab === "setup" && (
          <div>
            <div style={dark.card}>
              <div style={dark.slabel}>Employee Details</div>
              <div style={dark.g2}>
                {[
                  ["Full Name", "name"], ["Employee ID", "employeeId"],
                  ["Designation", "designation"], ["Department", "department"],
                  ["Date of Joining", "doj"], ["Gender", "gender"],
                  ["Location", "location"], ["Company Name", "company"],
                  ["Bank Account No.", "bankAccount"], ["Aadhar No.", "aadhar"],
                  ["PAN", "pan"],
                ].map(([l, k]) => <Field key={k} label={l} val={emp[k]} onChange={v => setE(k, v)} />)}
              </div>
            </div>

            <div style={dark.card}>
              <div style={dark.slabel}>Fixed Monthly Salary Structure</div>
              <div style={dark.g3}>
                {[
                  ["Basic Salary (₹)", "basic"], ["Conveyance Allowance (₹)", "conveyance"],
                  ["Flexible Allowance (₹)", "flexible"], ["Other Allowance (₹)", "other"],
                  ["Late/Early Penalty (₹)", "lateEarlyPenalty"], ["Policy Adjustment (₹)", "policyAdjustment"],
                ].map(([l, k]) => <Field key={k} label={l} val={sal[k]} type="number" onChange={v => setS(k, v)} />)}
              </div>
              <div style={{ marginTop: 16, padding: "14px 18px", background: "#090c14", borderRadius: 10, display: "flex", gap: 32, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 10, color: "#353c60" }}>Total CTC / Month</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "#60a5fa", fontFamily: "monospace" }}>₹{totalStd.toLocaleString("en-IN")}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#353c60" }}>LOP Rate (auto-calculated)</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#fbbf24", fontFamily: "monospace" }}>₹{(totalStd / 30).toFixed(2)}/day</div>
                </div>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <button style={dark.btn} onClick={() => setTab("attendance")}>Next: Attendance →</button>
            </div>
          </div>
        )}

        {tab === "attendance" && <AttTab />}
        {tab === "payslip" && <PayTab />}
      </div>
    </div>
  );
}
