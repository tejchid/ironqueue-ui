import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const DEMO_MODE = true;
const API_URL = "/api";

const DEMO_JOBS = [
  { id: 101, type: "email-send", status: "COMPLETED", attempts: 0, max_attempts: 3, payload: { to: "user@example.com" } },
  { id: 102, type: "image-process", status: "FAILED", attempts: 2, max_attempts: 3, payload: { image_id: "img_9821" }, last_error: "Worker timeout" },
  { id: 103, type: "report-generate", status: "RUNNING", attempts: 1, max_attempts: 3, payload: { report_id: "weekly" } },
];

type Job = {
  id: number;
  type: string;
  status: "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED" | string;
  attempts: number;
  max_attempts: number;
  payload?: any;
  last_error?: string | null;
  created_at?: string;
};

// --- HELPER COMPONENTS ---

function StatusBadge({ status }: { status: Job["status"] }) {
  const colors: Record<string, string> = {
    QUEUED: "#9ca3af",
    RUNNING: "#3b82f6",
    COMPLETED: "#10b981",
    FAILED: "#ef4444",
  };
  const color = colors[status] || "#9ca3af";
  
  return (
    <span className={`badge-base ${status === 'RUNNING' ? 'pulse' : ''}`} 
      style={{ 
        backgroundColor: `${color}22`, 
        color: color, 
        border: `1px solid ${color}44`,
        padding: '4px 10px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: 700,
        textTransform: 'uppercase',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px'
      }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: color, boxShadow: `0 0 8px ${color}` }}></span>
      {status}
    </span>
  );
}

function RetryDots({ attempts, max }: { attempts: number; max: number }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: "50%",
          background: i < attempts ? "#ef4444" : "transparent",
          border: i < attempts ? "none" : "1px solid #374151",
          boxShadow: i < attempts ? "0 0 8px #ef4444" : "none"
        }} />
      ))}
    </div>
  );
}

function PrettyJson({ value }: { value: any }) {
  return (
    <pre style={{
      margin: 0, padding: 16, borderRadius: 12, background: "#06090f",
      border: "1px solid #1f2937", color: "#60a5fa", fontSize: 12, overflow: "auto"
    }}>
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

// --- MAIN APP ---

export default function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selected, setSelected] = useState<Job | null>(null);
  const [query, setQuery] = useState("");

  async function fetchAllJobs() {
    if (DEMO_MODE) { setJobs(DEMO_JOBS); return; }
    try { const res = await axios.get(`${API_URL}/jobs`); setJobs(res.data); } catch (e) { console.error(e); }
  }

  async function fetchJob(id: number) {
    if (DEMO_MODE) { setSelected(DEMO_JOBS.find(j => j.id === id) || null); return; }
    try { const res = await axios.get(`${API_URL}/jobs/${id}`); setSelected(res.data); } catch (e) { console.error(e); }
  }

  useEffect(() => {
    fetchAllJobs();
    const id = setInterval(fetchAllJobs, 3000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (selectedId != null) fetchJob(selectedId);
  }, [selectedId]);

  const counts = useMemo(() => ({
    QUEUED: jobs.filter(j => j.status === "QUEUED").length,
    RUNNING: jobs.filter(j => j.status === "RUNNING").length,
    COMPLETED: jobs.filter(j => j.status === "COMPLETED").length,
    FAILED: jobs.filter(j => j.status === "FAILED").length,
  }), [jobs]);

  const filtered = useMemo(() => {
    return jobs.filter(j => {
      const q = query.trim().toLowerCase();
      return q.length === 0 ? true : (String(j.id).includes(q) || (j.type || "").toLowerCase().includes(q));
    });
  }, [jobs, query]);

  return (
    <div style={{ backgroundColor: "#070b14", minHeight: "100vh", color: "#f3f4f6", fontFamily: "Inter, sans-serif" }}>
      <style>{`
        .glow-card { background: rgba(17, 25, 40, 0.75); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; transition: all 0.2s ease; }
        .glow-card:hover { border-color: rgba(255, 255, 255, 0.2); }
        .pulse { animation: pulse-kf 2s infinite; }
        @keyframes pulse-kf { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        table tr:hover { background: rgba(255, 255, 255, 0.02); }
      `}</style>

      <div style={{ padding: "40px 24px", maxWidth: 1400, margin: "0 auto" }}>
        
        {/* HEADER */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0, letterSpacing: "-1px" }}>IronQueue</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
              <span className="pulse" style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#10b981", boxShadow: "0 0 10px #10b981" }}></span>
              <p style={{ margin: 0, color: "#9ca3af", fontSize: 14 }}>System Live · Updates 3s</p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <input 
              className="glow-card" 
              style={{ padding: "12px 20px", width: 260, color: "white", outline: "none", background: "rgba(15, 22, 36, 0.6)" }} 
              placeholder="Search by ID or Type..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button style={{ backgroundColor: "#3b82f6", color: "white", padding: "0 24px", borderRadius: "12px", border: "none", fontWeight: 600, cursor: "pointer" }}>
              Submit New Job
            </button>
          </div>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
          
          {/* MAIN PANEL */}
          <main>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
              {[
                { label: "Queued", val: counts.QUEUED, color: "#9ca3af" },
                { label: "Running", val: counts.RUNNING, color: "#3b82f6" },
                { label: "Completed", val: counts.COMPLETED, color: "#10b981" },
                { label: "Failed", val: counts.FAILED, color: "#ef4444" }
              ].map(stat => (
                <div key={stat.label} className="glow-card" style={{ padding: 20, borderLeft: `4px solid ${stat.color}` }}>
                  <div style={{ color: "#9ca3af", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{stat.label}</div>
                  <div style={{ fontSize: 32, fontWeight: 700, marginTop: 4 }}>{stat.val}</div>
                </div>
              ))}
            </div>

            <div className="glow-card" style={{ overflow: "hidden" }}>
              <table width="100%" style={{ borderCollapse: "collapse", textAlign: "left" }}>
                <thead style={{ background: "rgba(255,255,255,0.03)", color: "#9ca3af", fontSize: 12 }}>
                  <tr>
                    <th style={{ padding: 18 }}>JOB ID</th>
                    <th>TYPE</th>
                    <th>STATUS</th>
                    <th>RETRIES</th>
                    <th style={{ paddingRight: 18 }}>MAX</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: 18, color: "#9ca3af", textAlign: "center" }}>No records found.</td></tr>
                  ) : filtered.map(job => (
                    <tr key={job.id} onClick={() => setSelectedId(job.id)} style={{ borderTop: "1px solid rgba(255,255,255,0.05)", cursor: "pointer" }}>
                      <td style={{ padding: 18, fontWeight: 700 }}>#{job.id}</td>
                      <td><code style={{ background: "#1e293b", padding: "3px 8px", borderRadius: 6, fontSize: 13 }}>{job.type}</code></td>
                      <td><StatusBadge status={job.status} /></td>
                      <td><RetryDots attempts={job.attempts} max={job.max_attempts} /></td>
                      <td style={{ paddingRight: 18, color: "#9ca3af" }}>{job.max_attempts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </main>

          {/* ACTIVITY SIDEBAR */}
          <aside className="glow-card" style={{ padding: 20, height: "fit-content" }}>
            <h3 style={{ margin: "0 0 20px 0", fontSize: 16, fontWeight: 700 }}>Job Activity Stream</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {jobs.map(job => (
                <div key={job.id} style={{ display: "flex", gap: 14 }}>
                  <div style={{ 
                    width: 32, height: 32, borderRadius: "10px", 
                    backgroundColor: job.status === 'COMPLETED' ? "#10b98122" : job.status === 'FAILED' ? "#ef444422" : "#3b82f622",
                    display: "flex", alignItems: "center", justifyContent: "center", color: job.status === 'COMPLETED' ? "#10b981" : job.status === 'FAILED' ? "#ef4444" : "#3b82f6"
                  }}>
                    {job.status === 'COMPLETED' ? '✓' : job.status === 'FAILED' ? '!' : '→'}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>Job #{job.id} {job.status.toLowerCase()}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>Module: {job.type}</div>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>

      {/* DRAWER MODAL */}
      {selectedId && (
        <div onClick={() => setSelectedId(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "flex-end", zIndex: 100 }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 500, height: "100%", background: "#0f172a", borderLeft: "1px solid #1f2937", padding: 32, boxShadow: "-10px 0 30px rgba(0,0,0,0.5)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h2 style={{ margin: 0 }}>Job Detail #{selectedId}</h2>
                <p style={{ color: "#9ca3af", margin: "4px 0 0 0" }}>Internal System Trace</p>
              </div>
              <button onClick={() => setSelectedId(null)} style={{ background: "none", border: "1px solid #334155", color: "white", padding: "6px 12px", borderRadius: 8, cursor: "pointer" }}>Close</button>
            </div>
            
            <div style={{ marginTop: 32, display: "flex", gap: 12 }}>
              {selected ? <StatusBadge status={selected.status} /> : <span>Loading...</span>}
            </div>

            <div style={{ marginTop: 24 }}>
              <label style={{ color: "#9ca3af", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Data Payload</label>
              <div style={{ marginTop: 10 }}><PrettyJson value={selected?.payload ?? {}} /></div>
            </div>

            {selected?.last_error && (
              <div style={{ marginTop: 24 }}>
                <label style={{ color: "#ef4444", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Error Log</label>
                <div style={{ marginTop: 10, padding: 16, borderRadius: 12, background: "#7f1d1d22", border: "1px solid #ef444444", color: "#fca5a5", fontSize: 12 }}>{selected.last_error}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
