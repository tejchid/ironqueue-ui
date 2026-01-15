import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const DEMO_MODE = true;
const API_URL = "/api";

const INITIAL_JOBS = [
  { id: 101, type: "email-send", status: "COMPLETED", attempts: 0, max_attempts: 3, payload: { to: "user@example.com" } },
  { id: 102, type: "image-process", status: "FAILED", attempts: 2, max_attempts: 3, payload: { image_id: "img_9821" }, last_error: "Worker timeout" },
  { id: 103, type: "report-generate", status: "RUNNING", attempts: 1, max_attempts: 3, payload: { report_id: "weekly" } },
];

type Job = {
  id: number;
  type: string;
  status: string;
  attempts: number;
  max_attempts: number;
  payload?: any;
  last_error?: string | null;
};

// --- HELPER COMPONENTS ---
function StatusBadge({ status }: { status: string }) {
  const color = status === "RUNNING" ? "#3b82f6" : status === "COMPLETED" ? "#10b981" : status === "FAILED" ? "#ef4444" : "#9ca3af";
  return (
    <span className={status === 'RUNNING' ? 'pulse' : ''} style={{ backgroundColor: `${color}22`, color, border: `1px solid ${color}44`, padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: color, boxShadow: `0 0 8px ${color}` }}></span>
      {status}
    </span>
  );
}

export default function App() {
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newType, setNewType] = useState("email-send");

  // Only poll if NOT in demo mode to prevent overwriting local state
  useEffect(() => {
    if (DEMO_MODE) return;
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${API_URL}/jobs`);
        setJobs(res.data);
      } catch (e) { console.error(e); }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const triggerNewJob = () => {
    const newJob: Job = {
      id: Math.floor(Math.random() * 899) + 200,
      type: newType,
      status: "QUEUED",
      attempts: 0,
      max_attempts: 3,
      payload: { source: "UI_Manual", timestamp: new Date().toISOString() }
    };
    setJobs(prev => [newJob, ...prev]);
    setIsAdding(false);
  };

  const counts = useMemo(() => ({
    QUEUED: jobs.filter(j => j.status === "QUEUED").length,
    RUNNING: jobs.filter(j => j.status === "RUNNING").length,
    COMPLETED: jobs.filter(j => j.status === "COMPLETED").length,
    FAILED: jobs.filter(j => j.status === "FAILED").length,
  }), [jobs]);

  const filtered = jobs.filter(j => query === "" || String(j.id).includes(query.toLowerCase()) || j.type.toLowerCase().includes(query.toLowerCase()));

  return (
    <div style={{ backgroundColor: "#070b14", minHeight: "100vh", color: "#f3f4f6", fontFamily: "Inter, sans-serif", padding: "40px 24px" }}>
      <style>{`
        .glow-card { background: rgba(17, 25, 40, 0.75); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 20px; }
        .pulse { animation: pulse-kf 2s infinite; }
        @keyframes pulse-kf { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}`</style>

      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0 }}>IronQueue</h1>
            <p style={{ margin: 0, color: "#9ca3af" }}>System Status: <span style={{ color: "#10b981" }}>Online</span></p>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <input className="glow-card" style={{ padding: "10px 15px", width: 250, outline: "none", color: "white" }} placeholder="Search jobs..." onChange={e => setQuery(e.target.value)} />
            <button onClick={() => setIsAdding(!isAdding)} style={{ backgroundColor: "#3b82f6", color: "white", padding: "0 20px", borderRadius: "12px", border: "none", fontWeight: 600, cursor: "pointer" }}>
              {isAdding ? "Cancel" : "Submit Job"}
            </button>
          </div>
        </header>

        {isAdding && (
          <div className="glow-card" style={{ marginBottom: 24, display: "flex", gap: 20, alignItems: "flex-end", border: "1px solid #3b82f666" }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#3b82f6", textTransform: "uppercase" }}>Task Type</label>
              <select value={newType} onChange={e => setNewType(e.target.value)} style={{ width: "100%", background: "#0f172a", border: "1px solid #1f2937", color: "white", padding: "10px", borderRadius: "8px", marginTop: 8 }}>
                <option value="email-send">email-send</option>
                <option value="image-process">image-process</option>
                <option value="report-generate">report-generate</option>
              </select>
            </div>
            <button onClick={triggerNewJob} style={{ backgroundColor: "#10b981", color: "white", padding: "12px 24px", borderRadius: "10px", border: "none", fontWeight: 800, cursor: "pointer" }}>PUSH TO QUEUE</button>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
          <main>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
              {Object.entries(counts).map(([label, val]) => (
                <div key={label} className="glow-card">
                  <div style={{ color: "#9ca3af", fontSize: 11, fontWeight: 700 }}>{label}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>{val}</div>
                </div>
              ))}
            </div>
            <div className="glow-card" style={{ padding: 0, overflow: "hidden" }}>
              <table width="100%" style={{ borderCollapse: "collapse", textAlign: "left" }}>
                <thead style={{ background: "rgba(255,255,255,0.03)", color: "#9ca3af", fontSize: 12 }}>
                  <tr><th style={{ padding: 18 }}>JOB ID</th><th>TYPE</th><th>STATUS</th></tr>
                </thead>
                <tbody>
                  {filtered.map(job => (
                    <tr key={job.id} onClick={() => setSelectedId(job.id)} style={{ borderTop: "1px solid rgba(255,255,255,0.05)", cursor: "pointer" }}>
                      <td style={{ padding: 18, fontWeight: 700 }}>#{job.id}</td>
                      <td><code style={{ background: "#1e293b", padding: "3px 8px", borderRadius: 6 }}>{job.type}</code></td>
                      <td><StatusBadge status={job.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </main>

          <aside className="glow-card" style={{ height: "fit-content" }}>
            <h3 style={{ margin: "0 0 20px 0", fontSize: 16 }}>Cluster Activity</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {jobs.slice(0, 6).map(job => (
                <div key={job.id} style={{ display: "flex", gap: 12, fontSize: 13 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: job.status === "COMPLETED" ? "#10b981" : "#3b82f6", marginTop: 4 }}></div>
                  <div>
                    <div style={{ fontWeight: 600 }}>Job #{job.id} {job.status.toLowerCase()}</div>
                    <div style={{ color: "#9ca3af", fontSize: 11 }}>{job.type}</div>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>

      {selectedId && (
        <div onClick={() => setSelectedId(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "flex-end", zIndex: 100 }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 450, height: "100%", background: "#0f172a", borderLeft: "1px solid #1f2937", padding: 40 }}>
            <h2>Job Details #{selectedId}</h2>
            <button onClick={() => setSelectedId(null)} style={{ background: "#1e293b", color: "white", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", marginTop: 20 }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
