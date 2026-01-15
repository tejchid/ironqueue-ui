import { useEffect, useState } from "react";
import axios from "axios";

const DEMO_MODE = true;
const API_URL = "/api";

const INITIAL_JOBS = [
  { id: 101, type: "EMAIL_DISPATCH_SERVICE", status: "COMPLETED", attempts: 0, max_attempts: 3 },
  { id: 102, type: "IMAGE_COMPRESSION_TASK", status: "FAILED", attempts: 2, max_attempts: 3 },
  { id: 103, type: "ANALYTICS_GEN_WORKER", status: "RUNNING", attempts: 1, max_attempts: 3 },
];

type Job = { id: number; type: string; status: string; attempts: number; max_attempts: number; payload?: any; };

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
  const [newType, setNewType] = useState("EMAIL_DISPATCH_SERVICE");
  const [metrics, setMetrics] = useState({ cpu: 42, latency: 12 });

  useEffect(() => {
    const t = setInterval(() => setMetrics({ cpu: Math.floor(Math.random() * 15) + 30, latency: Math.floor(Math.random() * 5) + 10 }), 2500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (DEMO_MODE) return;
    const interval = setInterval(async () => {
      try { const res = await axios.get(`${API_URL}/jobs`); setJobs(res.data); } catch (e) { console.error(e); }
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
      payload: { source: "Manual_Dispatch", cluster: "us-west-2" }
    };
    setJobs(prev => [newJob, ...prev]);
    setIsAdding(false);
  };

  const filtered = jobs.filter(j => query === "" || String(j.id).includes(query) || j.type.toLowerCase().includes(query.toLowerCase()));

  return (
    <div style={{ backgroundColor: "#05070a", minHeight: "100vh", color: "#e2e8f0", fontFamily: "'JetBrains Mono', monospace", padding: "40px 24px" }}>
      <style>{`
        .glow-card { background: rgba(13, 17, 23, 0.8); border: 1px solid rgba(48, 54, 61, 0.8); border-radius: 12px; padding: 20px; }
        .pulse { animation: pulse-kf 2s infinite; }
        @keyframes pulse-kf { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .stat-label { font-size: 10px; color: #8b949e; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; }
        table th { font-size: 11px; color: #8b949e; text-transform: uppercase; padding: 12px 18px; border-bottom: 1px solid #30363d; }
      `}</style>

      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40, borderBottom: "1px solid #30363d", paddingBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>IRON_QUEUE <span style={{ color: "#3b82f6", fontSize: 14 }}>SYSTEM_OS</span></h1>
            <p style={{ margin: "4px 0 0 0", color: "#8b949e", fontSize: 13 }}>Distributed Orchestration Cluster</p>
          </div>
          <div style={{ display: "flex", gap: 48 }}>
            <div><div className="stat-label">Cluster CPU</div><div style={{ fontSize: 20, fontWeight: 700, color: "#238636" }}>{metrics.cpu}%</div></div>
            <div><div className="stat-label">Redis Latency</div><div style={{ fontSize: 20, fontWeight: 700, color: "#238636" }}>{metrics.latency}ms</div></div>
            <div><div className="stat-label">Node Status</div><div style={{ fontSize: 20, fontWeight: 700, color: "#238636" }}>04/04 ONLINE</div></div>
          </div>
        </header>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
           <input className="glow-card" style={{ padding: "10px 16px", width: 300, background: "#0d1117", border: "1px solid #30363d", color: "#c9d1d9", outline: "none" }} placeholder="Filter by Process ID..." value={query} onChange={e => setQuery(e.target.value)} />
           <button onClick={() => setIsAdding(!isAdding)} style={{ background: "#238636", color: "white", padding: "0 24px", borderRadius: "8px", border: "none", fontWeight: 700, cursor: "pointer" }}>
              {isAdding ? "ABORT" : "DISPATCH NEW TASK"}
           </button>
        </div>

        {isAdding && (
          <div className="glow-card" style={{ marginBottom: 32, display: "flex", gap: 24, alignItems: "flex-end", border: "1px solid #388bfd66" }}>
            <div style={{ flex: 1 }}>
              <div className="stat-label" style={{ color: "#58a6ff", marginBottom: 8 }}>Task Definition</div>
              <select value={newType} onChange={e => setNewType(e.target.value)} style={{ width: "100%", background: "#0d1117", border: "1px solid #30363d", color: "white", padding: "12px", borderRadius: "8px" }}>
                <option value="EMAIL_DISPATCH_SERVICE">EMAIL_DISPATCH_SERVICE</option>
                <option value="IMAGE_COMPRESSION_TASK">IMAGE_COMPRESSION_TASK</option>
                <option value="ANALYTICS_GEN_WORKER">ANALYTICS_GEN_WORKER</option>
              </select>
            </div>
            <button onClick={triggerNewJob} style={{ background: "#1f6feb", color: "white", padding: "14px 28px", borderRadius: "8px", border: "none", fontWeight: 800, cursor: "pointer" }}>COMMIT</button>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
          <main>
            <div className="glow-card" style={{ padding: 0, overflow: "hidden" }}>
              <table width="100%" style={{ borderCollapse: "collapse", textAlign: "left" }}>
                <thead><tr><th>Process ID</th><th>Task Module</th><th>Status</th></tr></thead>
                <tbody>
                  {filtered.map(job => (
                    <tr key={job.id} onClick={() => setSelectedId(job.id)} style={{ borderTop: "1px solid #30363d", cursor: "pointer" }}>
                      <td style={{ padding: "16px 18px", fontWeight: 700, color: "#58a6ff" }}>0x{job.id.toString(16).toUpperCase()}</td>
                      <td style={{ fontSize: 12 }}>{job.type}</td>
                      <td><StatusBadge status={job.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </main>

          <aside style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div className="glow-card">
              <h3 style={{ margin: "0 0 16px 0", fontSize: 14 }}>Worker Pool</h3>
              {['Worker-01', 'Worker-02', 'Worker-03'].map((w, i) => (
                <div key={w} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '10px', background: '#010409', borderRadius: '6px', marginBottom: 8, border: '1px solid #30363d' }}>
                  <span style={{ color: '#8b949e' }}>{w}</span>
                  <span style={{ color: i === 1 ? "#3b82f6" : "#238636", fontWeight: 800 }}>{i === 1 ? "BUSY" : "IDLE"}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>

      {/* Trace Log Modal (Re-Integrated to use selectedId) */}
      {selectedId && (
        <div onClick={() => setSelectedId(null)} style={{ position: "fixed", inset: 0, background: "rgba(1, 4, 9, 0.8)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "flex-end", zIndex: 100 }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 500, height: "100%", background: "#0d1117", borderLeft: "1px solid #30363d", padding: 40 }}>
            <h2 style={{ fontSize: 20 }}>TASK_TRACE_LOG [0x{selectedId.toString(16).toUpperCase()}]</h2>
            <div style={{ marginTop: 32, padding: 20, background: "#010409", borderRadius: 12, border: "1px solid #30363d", color: "#79c0ff", fontSize: 12, fontFamily: "monospace" }}>
               PERSISTENCE: POSTGRESQL_DB<br/>
               BROKER: REDIS_6.2<br/>
               LATENCY: 14ms
            </div>
            <button onClick={() => setSelectedId(null)} style={{ marginTop: 40, width: "100%", background: "#21262d", border: "1px solid #30363d", color: "white", padding: "12px", borderRadius: "8px", cursor: "pointer", fontWeight: 700 }}>CLOSE_TRACE</button>
          </div>
        </div>
      )}
    </div>
  );
}
