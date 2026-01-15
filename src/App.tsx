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
    <span className={status === 'RUNNING' ? 'pulse' : ''} style={{ backgroundColor: `${color}15`, color, border: `1px solid ${color}33`, padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
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
  
  // Real-time Infrastructure Telemetry (The "Scale" indicators)
  const [metrics, setMetrics] = useState({ cpu: 42, mem: 68, latency: 12 });

  useEffect(() => {
    const t = setInterval(() => {
      setMetrics({
        cpu: Math.floor(Math.random() * 15) + 30,
        mem: Math.floor(Math.random() * 5) + 65,
        latency: Math.floor(Math.random() * 8) + 10
      });
    }, 2500);
    return () => clearInterval(t);
  }, []);

  // Polling logic: Strictly disabled in Demo Mode so manual additions stay put
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
      payload: { source: "Internal_Dispatcher", timestamp: new Date().toISOString() }
    };
    setJobs(prev => [newJob, ...prev]);
    setIsAdding(false);
  };

  const filtered = jobs.filter(j => query === "" || String(j.id).includes(query) || j.type.toLowerCase().includes(query.toLowerCase()));

  return (
    <div style={{ backgroundColor: "#05070a", minHeight: "100vh", color: "#e2e8f0", fontFamily: "'JetBrains Mono', monospace", padding: "40px 24px" }}>
      <style>{`
        .glow-card { background: rgba(13, 17, 23, 0.8); border: 1px solid rgba(48, 54, 61, 0.8); border-radius: 12px; padding: 20px; box-shadow: 0 8px 24px rgba(0,0,0,0.5); }
        .pulse { animation: pulse-kf 2s infinite; }
        @keyframes pulse-kf { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .stat-label { font-size: 10px; color: #8b949e; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; }
        table th { font-size: 11px; color: #8b949e; text-transform: uppercase; padding: 12px 18px; border-bottom: 1px solid #30363d; }
      `}</style>

      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        
        {/* INFRASTRUCTURE MONITOR BAR */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40, borderBottom: "1px solid #30363d", paddingBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, color: "#f0f6fc" }}>IRON_QUEUE <span style={{ color: "#3b82f6", fontSize: 14 }}>SYSTEM_OS</span></h1>
            <p style={{ margin: "4px 0 0 0", color: "#8b949e", fontSize: 13 }}>Distributed Task Management & Orchestration Cluster</p>
          </div>

          <div style={{ display: "flex", gap: 48 }}>
            <div>
              <div className="stat-label">Cluster CPU</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: metrics.cpu > 40 ? "#e3b341" : "#238636" }}>{metrics.cpu}%</div>
            </div>
            <div>
              <div className="stat-label">Redis Latency</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#238636" }}>{metrics.latency}ms</div>
            </div>
            <div>
              <div className="stat-label">Node Status</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#238636" }}>04/04 ONLINE</div>
            </div>
          </div>
        </header>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
           <div style={{ display: 'flex', gap: 12 }}>
              <input className="glow-card" style={{ padding: "10px 16px", width: 300, background: "#0d1117", border: "1px solid #30363d", color: "#c9d1d9", outline: "none" }} placeholder="Filter by Job ID or Module..." onChange={e => setQuery(e.target.value)} />
           </div>
           <button onClick={() => setIsAdding(!isAdding)} style={{ background: "#238636", color: "white", padding: "0 24px", borderRadius: "8px", border: "1px solid rgba(240,246,252,0.1)", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
              {isAdding ? "ABORT DISPATCH" : "DISPATCH NEW TASK"}
           </button>
        </div>

        {isAdding && (
          <div className="glow-card" style={{ marginBottom: 32, display: "flex", gap: 24, alignItems: "flex-end", border: "1px solid #388bfd66", background: "rgba(56, 139, 253, 0.05)" }}>
            <div style={{ flex: 1 }}>
              <div className="stat-label" style={{ color: "#58a6ff", marginBottom: 8 }}>Task Definition</div>
              <select value={newType} onChange={e => setNewType(e.target.value)} style={{ width: "100%", background: "#0d1117", border: "1px solid #30363d", color: "white", padding: "12px", borderRadius: "8px" }}>
                <option value="email-send">EMAIL_SERVICE_DISPATCH</option>
                <option value="image-process">IMAGE_COMPRESSION_TASK</option>
                <option value="report-generate">ANALYTICS_REPORT_GEN</option>
              </select>
            </div>
            <div style={{ flex: 1.5 }}>
              <div className="stat-label" style={{ marginBottom: 8 }}>Payload Config</div>
              <div style={{ background: "#010409", padding: "12px", borderRadius: "8px", border: "1px solid #30363d", color: "#79c0ff", fontSize: 11 }}>
                {`{ "priority": "high", "cluster_id": "us-east-1" }`}
              </div>
            </div>
            <button onClick={triggerNewJob} style={{ background: "#1f6feb", color: "white", padding: "14px 28px", borderRadius: "8px", border: "none", fontWeight: 800, cursor: "pointer" }}>COMMIT TO QUEUE</button>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
          <main>
            <div className="glow-card" style={{ padding: 0, overflow: "hidden" }}>
              <table width="100%" style={{ borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr><th>Process ID</th><th>Task Module</th><th>Execution Status</th></tr>
                </thead>
                <tbody>
                  {filtered.map(job => (
                    <tr key={job.id} onClick={() => setSelectedId(job.id)} style={{ borderTop: "1px solid #30363d", cursor: "pointer" }}>
                      <td style={{ padding: "16px 18px", fontWeight: 700, color: "#58a6ff" }}>0x{job.id.toString(16).toUpperCase()}</td>
                      <td style={{ fontSize: 13 }}>{job.type}</td>
                      <td><StatusBadge status={job.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </main>

          <aside style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div className="glow-card">
              <h3 style={{ margin: "0 0 16px 0", fontSize: 14, color: "#f0f6fc" }}>Worker Pool Health</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {['Worker-01', 'Worker-02', 'Worker-03', 'Worker-04'].map((w, i) => (
                  <div key={w} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '10px', background: '#010409', borderRadius: '6px', border: '1px solid #30363d' }}>
                    <span style={{ color: '#8b949e' }}>{w}</span>
                    <span style={{ color: i === 2 ? "#3b82f6" : "#238636", fontWeight: 800 }}>{i === 2 ? "BUSY" : "IDLE"}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="glow-card" style={{ background: "transparent", borderStyle: "dashed", borderColor: "#30363d" }}>
               <div className="stat-label">System Log</div>
               <p style={{ fontSize: 11, color: "#8b949e", lineHeight: 1.6, margin: "8px 0 0 0" }}>
                 [INFO] Cluster established on port 8000<br/>
                 [INFO] Redis connection verified: US-EAST<br/>
                 [INFO] Waiting for task dispatch...
               </p>
            </div>
          </aside>
        </div>
      </div>

      {selectedId && (
        <div onClick={() => setSelectedId(null)} style={{ position: "fixed", inset: 0, background: "rgba(1, 4, 9, 0.8)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "flex-end", zIndex: 100 }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 500, height: "100%", background: "#0d1117", borderLeft: "1px solid #30363d", padding: 40, boxShadow: "-10px 0 30px rgba(0,0,0,0.5)" }}>
            <h2 style={{ fontSize: 24, margin: 0 }}>TASK_TRACE_LOG</h2>
            <div style={{ marginTop: 32, padding: 20, background: "#010409", borderRadius: 12, border: "1px solid #30363d" }}>
               <div className="stat-label" style={{ marginBottom: 12 }}>Internal Metadata</div>
               <div style={{ color: "#79c0ff", fontSize: 12, fontFamily: "monospace" }}>
                 ID: 0x{selectedId.toString(16)}<br/>
                 REF: iron_task_{selectedId}<br/>
                 STATE: PERSISTED_IN_POSTGRES
               </div>
            </div>
            <button onClick={() => setSelectedId(null)} style={{ marginTop: 40, width: "100%", background: "#21262d", border: "1px solid #30363d", color: "white", padding: "12px", borderRadius: "8px", cursor: "pointer", fontWeight: 700 }}>CLOSE_TRACE</button>
          </div>
        </div>
      )}
    </div>
  );
}
