import { useState } from "react";

const SAMPLE_JOBS = [
  {
    id: "JS-20260427-1001",
    personName: "Sagar K Saxena",
    personTitle: "Founder & CEO, Prowrrap",
    company: "Prowrrap",
    role: "Founder's Office – Strategy & Operations",
    location: "Ghaziabad",
    salary: "Not mentioned",
    domain: "Strategy",
    fitScore: 2,
    proceed: false,
    disqualified: false,
    disqualifyReason: "",
    resumeType: "Version A - Founder",
    outreachChannel: "LinkedIn DM",
    emailSubject: "",
    emailBody: "",
    linkedinDm: "Hi Sagar — came across the Founder's Office role at Prowrrap. I'm an AM at PwC with 6+ years building ops systems for eCommerce clients. Ghaziabad is a stretch for me, but if you're open to remote-first, happy to chat.",
    matchingSkills: ["Operations", "Strategy", "Stakeholder Management", "Process Redesign"],
    missingSkills: ["B2B packaging domain", "Logistics execution"],
    oneLineReason: "Good role type but Ghaziabad location outside target cities and salary unknown",
    status: "Not Applied",
    dateAdded: "2026-04-27",
  },
  {
    id: "JS-20260427-1002",
    personName: "Honey Sahani",
    personTitle: "AM Recruitment, FirstCalli",
    company: "FirstCalli",
    role: "Servicing Professional – Lending Operations",
    location: "Remote",
    salary: "₹17 LPA",
    domain: "Finance Ops",
    fitScore: 3,
    proceed: true,
    disqualified: false,
    disqualifyReason: "",
    resumeType: "Version A - Founder",
    outreachChannel: "Email",
    emailSubject: "AM at PwC – Lending Ops Role | Reconciliation & Controls Background",
    emailBody: "Hi Honey,\n\nCame across the Lending Operations role at FirstCalli. Quick context: I'm an AM at PwC with 6+ years building reconciliation systems for financial clients. Most recently, I reduced a 90-day reconciliation cycle to 3 days for a large eCommerce client — exactly the kind of payment processing and account maintenance challenge your role describes.\n\nWould you be open to a 15-minute call to explore fit?\n\nBest regards,\nAyush Arora | +91-9461626633",
    linkedinDm: "",
    matchingSkills: ["Reconciliation", "Financial Controls", "Stakeholder Management", "Process Redesign", "SQL"],
    missingSkills: ["Loan syndication", "Agency servicing"],
    oneLineReason: "Reconciliation ops match but 17 LPA is below 20 LPA minimum — worth a conversation",
    status: "Draft Ready",
    dateAdded: "2026-04-27",
  },
  {
    id: "JS-20260427-1003",
    personName: "Manish Tak",
    personTitle: "TA Executive, EpochFolio",
    company: "EpochFolio",
    role: "AM Finance – SOX & Financial Controls",
    location: "Remote",
    salary: "₹22 LPA",
    domain: "SOX / IT Audit",
    fitScore: 0,
    proceed: false,
    disqualified: true,
    disqualifyReason: "CA qualification mandatory – Ayush is not a CA",
    resumeType: "",
    outreachChannel: "Skip",
    emailSubject: "",
    emailBody: "",
    linkedinDm: "",
    matchingSkills: ["SOX", "Internal Controls"],
    missingSkills: ["CA qualification"],
    oneLineReason: "Disqualified – CA mandatory, non-negotiable",
    status: "Disqualified",
    dateAdded: "2026-04-27",
  },
  {
    id: "JS-20260427-1004",
    personName: "Vanshika Tiwari",
    personTitle: "Senior Consultant, TD Newton",
    company: "TD Newton",
    role: "Vice President – Strategy & Transformation",
    location: "India",
    salary: "Not mentioned",
    domain: "Strategy",
    fitScore: 1,
    proceed: false,
    disqualified: false,
    disqualifyReason: "",
    resumeType: "Version B - ATS",
    outreachChannel: "Skip",
    emailSubject: "",
    emailBody: "",
    linkedinDm: "",
    matchingSkills: ["Strategy", "Transformation", "Stakeholder Management"],
    missingSkills: ["14+ years experience required"],
    oneLineReason: "Requires 14+ years — Ayush has 6, significant experience gap",
    status: "Not Applied",
    dateAdded: "2026-04-27",
  },
];

const SCREENS = ["Paste & Search", "Fitment Analysis", "Outreach & Follow-up"];

const STATUS_COLORS = {
  "Not Applied": { bg: "#F1EFE8", text: "#444441" },
  "Draft Ready": { bg: "#E1F5EE", text: "#085041" },
  "Applied": { bg: "#E6F1FB", text: "#0C447C" },
  "Call Received": { bg: "#FAEEDA", text: "#633806" },
  "In Process": { bg: "#EEEDFE", text: "#3C3489" },
  "Offer": { bg: "#EAF3DE", text: "#27500A" },
  "Disqualified": { bg: "#FCEBEB", text: "#791F1F" },
  "Rejected": { bg: "#FCEBEB", text: "#791F1F" },
};

const STARS = (score) => {
  const filled = "★";
  const empty = "☆";
  return Array(5).fill(0).map((_, i) => (
    <span key={i} style={{ color: i < score ? "#BA7517" : "#D3D1C7", fontSize: 13 }}>{i < score ? filled : empty}</span>
  ));
};

const DOMAIN_COLOR = {
  "Operations": "#1D9E75",
  "Strategy": "#7F77DD",
  "Finance Ops": "#378ADD",
  "SOX / IT Audit": "#888780",
  "Other": "#888780",
};

export default function App() {
  const [screen, setScreen] = useState(0);
  const [jobs, setJobs] = useState(SAMPLE_JOBS);
  const [rawPost, setRawPost] = useState("");
  const [personName, setPersonName] = useState("");
  const [personTitle, setPersonTitle] = useState("");
  const [personUrl, setPersonUrl] = useState("");
  const [emailInPost, setEmailInPost] = useState("");
  const [applyLink, setApplyLink] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [filterDomain, setFilterDomain] = useState("All");
  const [filterProceed, setFilterProceed] = useState("All");
  const [outreachFilter, setOutreachFilter] = useState("All");
  const [copiedId, setCopiedId] = useState(null);

  const handleSubmit = () => {
    if (!rawPost.trim()) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setRawPost("");
      setPersonName("");
      setPersonTitle("");
      setPersonUrl("");
      setEmailInPost("");
      setApplyLink("");
      setTimeout(() => setSubmitted(false), 3000);
    }, 1800);
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStatusChange = (jobId, newStatus) => {
    setJobs(jobs.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
  };

  const domains = ["All", ...new Set(jobs.map(j => j.domain))];
  const filteredJobs = jobs.filter(j => {
    if (filterDomain !== "All" && j.domain !== filterDomain) return false;
    if (filterProceed === "Proceed" && !j.proceed) return false;
    if (filterProceed === "Disqualified" && !j.disqualified) return false;
    return true;
  });

  const outreachJobs = jobs.filter(j => {
    if (j.disqualified) return false;
    if (outreachFilter === "Email" && j.outreachChannel !== "Email") return false;
    if (outreachFilter === "LinkedIn DM" && j.outreachChannel !== "LinkedIn DM") return false;
    if (outreachFilter === "Proceed only" && !j.proceed) return false;
    return j.outreachChannel !== "Skip";
  });

  return (
    <div style={{ fontFamily: "'DM Sans', 'Instrument Sans', sans-serif", minHeight: "100vh", background: "#FAFAF8", color: "#1C1C1C" }}>

      {/* Header */}
      <div style={{ borderBottom: "0.5px solid #E0DDD6", background: "#fff", padding: "0 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: "#1C1C1C", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>JH</span>
            </div>
            <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: "-0.02em" }}>Job Hunt</span>
            <span style={{ fontSize: 12, color: "#888", background: "#F1EFE8", padding: "2px 8px", borderRadius: 4 }}>Ayush Arora</span>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {SCREENS.map((s, i) => (
              <button key={i} onClick={() => setScreen(i)} style={{
                padding: "6px 14px", borderRadius: 6, fontSize: 13, fontWeight: screen === i ? 500 : 400,
                border: screen === i ? "0.5px solid #1C1C1C" : "0.5px solid transparent",
                background: screen === i ? "#1C1C1C" : "transparent",
                color: screen === i ? "#fff" : "#666",
                cursor: "pointer", transition: "all 0.15s"
              }}>{s}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, fontSize: 13, color: "#888" }}>
            <span style={{ background: "#E1F5EE", color: "#085041", padding: "3px 10px", borderRadius: 4, fontWeight: 500 }}>{jobs.filter(j => j.proceed).length} to apply</span>
            <span style={{ background: "#FCEBEB", color: "#791F1F", padding: "3px 10px", borderRadius: 4, fontWeight: 500 }}>{jobs.filter(j => j.disqualified).length} disqualified</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 24px" }}>

        {/* ── SCREEN 1: PASTE & SEARCH ── */}
        {screen === 0 && (
          <div>
            {/* Paste form */}
            <div style={{ background: "#fff", border: "0.5px solid #E0DDD6", borderRadius: 12, padding: 24, marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, letterSpacing: "-0.02em" }}>Paste LinkedIn post</div>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>Copy the full post text and person details from LinkedIn</div>
                </div>
                {submitted && (
                  <div style={{ background: "#E1F5EE", color: "#085041", padding: "6px 14px", borderRadius: 6, fontSize: 13, fontWeight: 500 }}>
                    ✓ Sent to n8n — processing
                  </div>
                )}
              </div>

              <textarea
                value={rawPost}
                onChange={e => setRawPost(e.target.value)}
                placeholder="Paste the full LinkedIn post here — including the job description, person name, hashtags, everything..."
                style={{
                  width: "100%", minHeight: 140, padding: "12px 14px", borderRadius: 8,
                  border: "0.5px solid #E0DDD6", background: "#FAFAF8", fontSize: 13,
                  fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box",
                  lineHeight: 1.6, color: "#1C1C1C"
                }}
              />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 10 }}>
                {[
                  [personName, setPersonName, "Person name (who posted)"],
                  [personTitle, setPersonTitle, "Person title / designation"],
                  [personUrl, setPersonUrl, "LinkedIn profile URL"],
                  [emailInPost, setEmailInPost, "Email in post (if visible)"],
                  [applyLink, setApplyLink, "Apply link (if present)"],
                ].map(([val, setter, placeholder], i) => (
                  <input key={i} value={val} onChange={e => setter(e.target.value)} placeholder={placeholder}
                    style={{
                      padding: "9px 12px", borderRadius: 8, border: "0.5px solid #E0DDD6",
                      background: "#FAFAF8", fontSize: 13, fontFamily: "inherit", outline: "none",
                      color: "#1C1C1C"
                    }}
                  />
                ))}
                <button
                  onClick={handleSubmit}
                  disabled={!rawPost.trim() || submitting}
                  style={{
                    padding: "9px 12px", borderRadius: 8, border: "none",
                    background: rawPost.trim() ? "#1C1C1C" : "#E0DDD6",
                    color: rawPost.trim() ? "#fff" : "#888",
                    fontSize: 13, fontWeight: 600, cursor: rawPost.trim() ? "pointer" : "default",
                    transition: "all 0.15s", letterSpacing: "-0.01em"
                  }}
                >
                  {submitting ? "Sending to n8n..." : "Submit post →"}
                </button>
              </div>
            </div>

            {/* Jobs table */}
            <div style={{ background: "#fff", border: "0.5px solid #E0DDD6", borderRadius: 12, overflow: "hidden" }}>
              {/* Table header */}
              <div style={{ padding: "14px 20px", borderBottom: "0.5px solid #E0DDD6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>All posts — {filteredJobs.length} found</div>
                <div style={{ display: "flex", gap: 6 }}>
                  <select value={filterDomain} onChange={e => setFilterDomain(e.target.value)}
                    style={{ padding: "5px 10px", borderRadius: 6, border: "0.5px solid #E0DDD6", fontSize: 12, background: "#FAFAF8", outline: "none", cursor: "pointer" }}>
                    {domains.map(d => <option key={d}>{d}</option>)}
                  </select>
                  <select value={filterProceed} onChange={e => setFilterProceed(e.target.value)}
                    style={{ padding: "5px 10px", borderRadius: 6, border: "0.5px solid #E0DDD6", fontSize: 12, background: "#FAFAF8", outline: "none", cursor: "pointer" }}>
                    {["All", "Proceed", "Disqualified"].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              {/* Table */}
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#FAFAF8" }}>
                    {["Company & Role", "Person", "Location", "Salary", "Domain", "Fit", "Status", "Action"].map(h => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontWeight: 500, fontSize: 11, color: "#888", letterSpacing: "0.04em", textTransform: "uppercase", borderBottom: "0.5px solid #E0DDD6" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.map((job, idx) => (
                    <tr key={job.id} style={{ borderBottom: "0.5px solid #F1EFE8", background: idx % 2 === 0 ? "#fff" : "#FDFCFB" }}>
                      <td style={{ padding: "12px 16px", maxWidth: 220 }}>
                        <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 2 }}>{job.company}</div>
                        <div style={{ fontSize: 12, color: "#666", lineHeight: 1.4 }}>{job.role}</div>
                      </td>
                      <td style={{ padding: "12px 16px", maxWidth: 160 }}>
                        <div style={{ fontSize: 12, fontWeight: 500 }}>{job.personName}</div>
                        <div style={{ fontSize: 11, color: "#888", lineHeight: 1.4 }}>{job.personTitle.slice(0, 40)}{job.personTitle.length > 40 ? "..." : ""}</div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ fontSize: 12, color: "#444" }}>{job.location}</span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ fontSize: 12, color: job.salary === "Not mentioned" ? "#bbb" : "#1C1C1C" }}>{job.salary}</span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ fontSize: 11, fontWeight: 500, padding: "3px 8px", borderRadius: 4, background: "#F1EFE8", color: DOMAIN_COLOR[job.domain] || "#888" }}>{job.domain}</span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {job.disqualified ? (
                          <span style={{ fontSize: 11, color: "#A32D2D", background: "#FCEBEB", padding: "3px 8px", borderRadius: 4 }}>Disqualified</span>
                        ) : (
                          <div>
                            <div style={{ marginBottom: 2 }}>{STARS(job.fitScore)}</div>
                            <div style={{ fontSize: 10, color: job.proceed ? "#085041" : "#888" }}>{job.proceed ? "● Proceed" : "○ Hold"}</div>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <select
                          value={job.status}
                          onChange={e => handleStatusChange(job.id, e.target.value)}
                          style={{
                            padding: "4px 8px", borderRadius: 5, border: `0.5px solid ${STATUS_COLORS[job.status]?.text || "#888"}`,
                            background: STATUS_COLORS[job.status]?.bg || "#F1EFE8",
                            color: STATUS_COLORS[job.status]?.text || "#444",
                            fontSize: 11, fontWeight: 500, outline: "none", cursor: "pointer"
                          }}>
                          {Object.keys(STATUS_COLORS).map(s => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <button onClick={() => { setSelectedJob(job); setScreen(1); }}
                          style={{ padding: "5px 10px", borderRadius: 5, border: "0.5px solid #E0DDD6", background: "#fff", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
                          View →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── SCREEN 2: FITMENT ANALYSIS ── */}
        {screen === 1 && (
          <div>
            <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontWeight: 600, fontSize: 18, letterSpacing: "-0.03em" }}>Fitment Analysis</div>
              <div style={{ fontSize: 13, color: "#888" }}>{selectedJob ? `Viewing: ${selectedJob.company}` : "Select a job to analyse"}</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: selectedJob ? "280px 1fr" : "1fr", gap: 16 }}>
              {/* Job list sidebar */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {jobs.filter(j => !j.disqualified).map(job => (
                  <div key={job.id} onClick={() => setSelectedJob(job)}
                    style={{
                      padding: "12px 14px", borderRadius: 10, border: `0.5px solid ${selectedJob?.id === job.id ? "#1C1C1C" : "#E0DDD6"}`,
                      background: selectedJob?.id === job.id ? "#1C1C1C" : "#fff",
                      color: selectedJob?.id === job.id ? "#fff" : "#1C1C1C",
                      cursor: "pointer", transition: "all 0.15s"
                    }}>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{job.company}</div>
                    <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>{job.role.slice(0, 40)}...</div>
                    <div style={{ marginTop: 6 }}>{STARS(job.fitScore)}</div>
                  </div>
                ))}
                {jobs.filter(j => j.disqualified).map(job => (
                  <div key={job.id} onClick={() => setSelectedJob(job)}
                    style={{
                      padding: "12px 14px", borderRadius: 10, border: "0.5px solid #E0DDD6",
                      background: "#FAFAF8", color: "#bbb", cursor: "pointer", opacity: 0.6
                    }}>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{job.company}</div>
                    <div style={{ fontSize: 11, marginTop: 2, color: "#A32D2D" }}>✕ {job.disqualifyReason.slice(0, 40)}</div>
                  </div>
                ))}
              </div>

              {/* Detail panel */}
              {selectedJob && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {/* Header card */}
                  <div style={{ background: "#fff", border: "0.5px solid #E0DDD6", borderRadius: 12, padding: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.03em" }}>{selectedJob.company}</div>
                        <div style={{ fontSize: 14, color: "#555", marginTop: 2 }}>{selectedJob.role}</div>
                        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 5, background: "#F1EFE8", color: "#444" }}>📍 {selectedJob.location}</span>
                          <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 5, background: "#F1EFE8", color: "#444" }}>💰 {selectedJob.salary}</span>
                          <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 5, background: "#F1EFE8", color: DOMAIN_COLOR[selectedJob.domain] || "#888" }}>{selectedJob.domain}</span>
                          <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 5, background: "#EEEDFE", color: "#3C3489" }}>{selectedJob.resumeType}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 28, fontWeight: 700 }}>{selectedJob.fitScore}<span style={{ fontSize: 16, fontWeight: 400, color: "#888" }}>/5</span></div>
                        <div>{STARS(selectedJob.fitScore)}</div>
                        <div style={{ marginTop: 6 }}>
                          {selectedJob.disqualified ? (
                            <span style={{ background: "#FCEBEB", color: "#791F1F", padding: "4px 10px", borderRadius: 5, fontSize: 12, fontWeight: 500 }}>Disqualified</span>
                          ) : selectedJob.proceed ? (
                            <span style={{ background: "#E1F5EE", color: "#085041", padding: "4px 10px", borderRadius: 5, fontSize: 12, fontWeight: 500 }}>Proceed ✓</span>
                          ) : (
                            <span style={{ background: "#FAEEDA", color: "#633806", padding: "4px 10px", borderRadius: 5, fontSize: 12, fontWeight: 500 }}>Hold</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div style={{ marginTop: 14, padding: "12px 14px", background: "#FAFAF8", borderRadius: 8, fontSize: 13, color: "#555", lineHeight: 1.6 }}>
                      {selectedJob.oneLineReason}
                      {selectedJob.disqualifyReason && <span style={{ color: "#A32D2D" }}> — {selectedJob.disqualifyReason}</span>}
                    </div>
                  </div>

                  {/* Skills analysis */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div style={{ background: "#fff", border: "0.5px solid #E0DDD6", borderRadius: 12, padding: 16 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10, color: "#085041" }}>✓ Matching skills</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {selectedJob.matchingSkills.map(s => (
                          <span key={s} style={{ fontSize: 12, padding: "3px 9px", borderRadius: 4, background: "#E1F5EE", color: "#085041" }}>{s}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ background: "#fff", border: "0.5px solid #E0DDD6", borderRadius: 12, padding: 16 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10, color: "#791F1F" }}>✗ Missing / gap skills</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {selectedJob.missingSkills.map(s => (
                          <span key={s} style={{ fontSize: 12, padding: "3px 9px", borderRadius: 4, background: "#FCEBEB", color: "#791F1F" }}>{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Score breakdown */}
                  <div style={{ background: "#fff", border: "0.5px solid #E0DDD6", borderRadius: 12, padding: 16 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>Score breakdown</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                      {[
                        ["Outreach channel", selectedJob.outreachChannel],
                        ["Resume to use", selectedJob.resumeType],
                        ["Status", selectedJob.status],
                        ["Person", selectedJob.personName],
                        ["Added", selectedJob.dateAdded],
                        ["Domain", selectedJob.domain],
                      ].map(([label, value]) => (
                        <div key={label} style={{ padding: "10px 12px", background: "#FAFAF8", borderRadius: 8 }}>
                          <div style={{ fontSize: 11, color: "#888", marginBottom: 3 }}>{label}</div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: "#1C1C1C" }}>{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setScreen(2)}
                      style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: "#1C1C1C", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                      Go to Outreach →
                    </button>
                    <select value={selectedJob.status} onChange={e => handleStatusChange(selectedJob.id, e.target.value)}
                      style={{ padding: "10px 12px", borderRadius: 8, border: "0.5px solid #E0DDD6", background: "#fff", fontSize: 13, outline: "none", cursor: "pointer", fontFamily: "inherit" }}>
                      {Object.keys(STATUS_COLORS).map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {!selectedJob && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, background: "#fff", border: "0.5px solid #E0DDD6", borderRadius: 12, color: "#bbb", fontSize: 14 }}>
                  ← Select a job from the list to view fitment analysis
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SCREEN 3: OUTREACH & FOLLOW-UPS ── */}
        {screen === 2 && (
          <div>
            <div style={{ marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontWeight: 600, fontSize: 18, letterSpacing: "-0.03em" }}>Outreach & Follow-ups</div>
              <div style={{ display: "flex", gap: 6 }}>
                {["All", "Email", "LinkedIn DM", "Proceed only"].map(f => (
                  <button key={f} onClick={() => setOutreachFilter(f)}
                    style={{
                      padding: "5px 12px", borderRadius: 6, fontSize: 12,
                      border: outreachFilter === f ? "0.5px solid #1C1C1C" : "0.5px solid #E0DDD6",
                      background: outreachFilter === f ? "#1C1C1C" : "#fff",
                      color: outreachFilter === f ? "#fff" : "#666",
                      cursor: "pointer", fontFamily: "inherit"
                    }}>{f}</button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {outreachJobs.map(job => (
                <div key={job.id} style={{ background: "#fff", border: `0.5px solid ${job.proceed ? "#1D9E75" : "#E0DDD6"}`, borderRadius: 12, overflow: "hidden" }}>
                  {/* Card header */}
                  <div style={{ padding: "14px 18px", borderBottom: "0.5px solid #F1EFE8", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{job.company}</div>
                        <div style={{ fontSize: 12, color: "#666" }}>{job.role} · {job.location}</div>
                      </div>
                      <div>{STARS(job.fitScore)}</div>
                      {job.proceed && <span style={{ fontSize: 11, background: "#E1F5EE", color: "#085041", padding: "3px 8px", borderRadius: 4, fontWeight: 500 }}>Proceed</span>}
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 4, background: job.outreachChannel === "Email" ? "#E6F1FB" : "#EEEDFE", color: job.outreachChannel === "Email" ? "#0C447C" : "#3C3489" }}>
                        {job.outreachChannel === "Email" ? "✉ Email" : "💬 LinkedIn DM"}
                      </span>
                      <select value={job.status} onChange={e => handleStatusChange(job.id, e.target.value)}
                        style={{
                          padding: "4px 8px", borderRadius: 5, border: `0.5px solid ${STATUS_COLORS[job.status]?.text || "#888"}`,
                          background: STATUS_COLORS[job.status]?.bg, color: STATUS_COLORS[job.status]?.text,
                          fontSize: 11, fontWeight: 500, outline: "none", cursor: "pointer", fontFamily: "inherit"
                        }}>
                        {Object.keys(STATUS_COLORS).map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Outreach content */}
                  <div style={{ padding: "14px 18px" }}>
                    {job.outreachChannel === "Email" && job.emailBody && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div>
                          <div style={{ fontSize: 11, color: "#888", fontWeight: 500, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Email subject</div>
                          <div style={{ fontSize: 13, padding: "10px 12px", background: "#FAFAF8", borderRadius: 8, border: "0.5px solid #E0DDD6", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                            <span style={{ color: "#1C1C1C", lineHeight: 1.5 }}>{job.emailSubject}</span>
                            <button onClick={() => handleCopy(job.emailSubject, `subj-${job.id}`)}
                              style={{ flexShrink: 0, padding: "3px 8px", borderRadius: 4, border: "0.5px solid #E0DDD6", background: "#fff", fontSize: 11, cursor: "pointer", fontFamily: "inherit", color: copiedId === `subj-${job.id}` ? "#085041" : "#666" }}>
                              {copiedId === `subj-${job.id}` ? "✓ Copied" : "Copy"}
                            </button>
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          <div style={{ fontSize: 11, color: "#888", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>Send to</div>
                          <div style={{ fontSize: 13, padding: "10px 12px", background: "#FAFAF8", borderRadius: 8, border: "0.5px solid #E0DDD6", color: job.emailInPost ? "#0C447C" : "#bbb" }}>
                            {job.emailInPost || "Email not found — find via Apollo.io"}
                          </div>
                        </div>
                        <div style={{ gridColumn: "1 / -1" }}>
                          <div style={{ fontSize: 11, color: "#888", fontWeight: 500, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Email body</div>
                          <div style={{ position: "relative" }}>
                            <pre style={{ fontSize: 12, padding: "12px 14px", background: "#FAFAF8", borderRadius: 8, border: "0.5px solid #E0DDD6", whiteSpace: "pre-wrap", lineHeight: 1.7, fontFamily: "inherit", margin: 0, color: "#333" }}>
                              {job.emailBody}
                            </pre>
                            <button onClick={() => handleCopy(job.emailBody, `body-${job.id}`)}
                              style={{ position: "absolute", top: 8, right: 8, padding: "4px 10px", borderRadius: 4, border: "0.5px solid #E0DDD6", background: "#fff", fontSize: 11, cursor: "pointer", fontFamily: "inherit", color: copiedId === `body-${job.id}` ? "#085041" : "#666" }}>
                              {copiedId === `body-${job.id}` ? "✓ Copied" : "Copy email"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {job.outreachChannel === "LinkedIn DM" && job.linkedinDm && (
                      <div>
                        <div style={{ fontSize: 11, color: "#888", fontWeight: 500, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>LinkedIn DM — copy and send manually</div>
                        <div style={{ position: "relative" }}>
                          <div style={{ fontSize: 13, padding: "12px 14px", background: "#FAFAF8", borderRadius: 8, border: "0.5px solid #E0DDD6", lineHeight: 1.7, color: "#333" }}>
                            {job.linkedinDm}
                          </div>
                          <button onClick={() => handleCopy(job.linkedinDm, `dm-${job.id}`)}
                            style={{ position: "absolute", top: 8, right: 8, padding: "4px 10px", borderRadius: 4, border: "0.5px solid #E0DDD6", background: "#fff", fontSize: 11, cursor: "pointer", fontFamily: "inherit", color: copiedId === `dm-${job.id}` ? "#085041" : "#666" }}>
                            {copiedId === `dm-${job.id}` ? "✓ Copied" : "Copy DM"}
                          </button>
                        </div>
                        <div style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
                          Send to: <span style={{ color: "#3C3489", fontWeight: 500 }}>{job.personName}</span> · {job.personTitle}
                        </div>
                      </div>
                    )}

                    {/* Follow-up timeline */}
                    <div style={{ marginTop: 14, padding: "10px 14px", background: "#FAFAF8", borderRadius: 8, display: "flex", alignItems: "center", gap: 16, fontSize: 12, color: "#888" }}>
                      <span>📅 Added: {job.dateAdded}</span>
                      <span>→</span>
                      <span style={{ color: "#BA7517" }}>Day 7: Follow-up due</span>
                      <span>→</span>
                      <span style={{ color: "#888" }}>Day 14: Final nudge</span>
                      <span>→</span>
                      <span style={{ color: "#bbb" }}>Archive if no reply</span>
                    </div>
                  </div>
                </div>
              ))}

              {outreachJobs.length === 0 && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, background: "#fff", border: "0.5px solid #E0DDD6", borderRadius: 12, color: "#bbb", fontSize: 14 }}>
                  No outreach items match current filter
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
