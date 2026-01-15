import { useEffect, useState } from "react";

const DEMO_MODE = true;

const INITIAL_JOBS = [
  { id: 255, type: "KAFKA_INGEST_PROC", status: "RUNNING" },
  { id: 128, type: "REDIS_CACHE_PURGE", status: "COMPLETED" },
  { id: 64,  type: "IMAGE_RESIZE_WORKER", status: "FAILED" },
];

export default function App() {
  const [jobs, setJobs] = useState(INITIAL_JOBS);
  const [query, setQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [metrics, setMetrics] = useState({ cpu: "24.2", mem: "1.2GB" });

  // Infrastructure Telemetry Effect
  useEffect(() => {
    const t = setInterval(() => {
      setMetrics({
        cpu: (Math.random() * 10 + 20).toFixed(1),
        mem: (Math.random() * 0.5 + 1.0).toFixed(1) + "GB"
      });
    }, 2000);
    return () => clearInterval(t);
  }, []);

  const dispatchTask = () => {
    const newTask = {
      id: Math.floor(Math.random() * 500),
      type: "MANUAL_DISPATCH_TASK",
      status: "QUEUED"
    };
    setJobs(prev => [newTask, ...prev]);
    setIsAdding(false);
  };

  const filtered = jobs.filter(j => 
    query === "" || j.type.toLowerCase().includes(query.toLowerCase()) || String(j.id).includes(query)
  );

  return (
    <div style={{ 
      backgroundColor: "#050505", 
      color: "#00ff41", 
      fontFamily: "'JetBrains Mono', monospace", 
      minHeight: "100vh", 
      padding: "30px",
      letterSpacing: "0.5px"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');
        .terminal-window { border: 1px solid #00ff41; padding: 20px; background: rgba(0, 255, 65, 0.02); margin-bottom: 20px; position: relative; }
        .terminal-window::before { content: "SYS_MONITOR_v1.0"; position: absolute; top: -10px; left: 20px; background: #050505; padding: 0 10px; font-size: 10px; }
        .blink { animation: blink-kf 1s infinite; }
        @keyframes blink-kf { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { text-align: left; border-bottom: 1px solid #00ff41; padding: 10px; font-size: 12px; }
        td { padding: 12px 10px; font-size: 13px; border-bottom: 1px solid #00ff4111; }
        input, select { background: transparent; border: 1px solid #00ff41; color: #00ff41; padding: 8px; font-family: inherit; outline: none; }
        button { background: #00ff41; color: #050505; border: none; padding: 10px 20px; font-family: inherit; font-weight: bold; cursor: pointer; }
        button:hover { background: #00cc33; }
      `}</style>

      {/* HEADER SECTION */}
      <div className="terminal-window" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "24px" }}>&gt; IRON_QUEUE_OS</h1>
          <p style={{ margin: 0, fontSize: "12px", opacity: 0.8 }}>DISTRIBUTED_NODE_STATION // {DEMO_MODE ? "SANDBOX_ACTIVE" : "PROD_ACTIVE"}</p>
        </div>
        <div style={{ textAlign: 'right', fontSize: "14px" }}>
          <div>CPU_USAGE: {metrics.cpu}%</div>
          <div>MEM_ALLOC: {metrics.mem}</div>
          <div>NET_STATUS: <span className="blink">ONLINE</span></div>
        </div>
      </div>

      {/* ACTION BAR */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <input 
          style={{ flex: 1 }} 
          placeholder="ENTER_FILTER_CRITERIA..." 
          value={query} 
          onChange={e => setQuery(e.target.value)} 
        />
        <button onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? "CANCEL_OP" : "DISPATCH_NEW_TASK"}
        </button>
      </div>

      {/* NEW TASK FORM */}
      {isAdding && (
        <div className="terminal-window" style={{ borderStyle: 'dashed' }}>
          <p style={{ margin: "0 0 15px 0" }}>// INITIALIZING NEW TASK SEQUENCE...</p>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <span style={{ fontSize: "12px" }}>SELECT_MODULE:</span>
            <select style={{ width: '250px' }}>
              <option>KAFKA_STREAM_PROC</option>
              <option>REDIS_FLUSH_NODE</option>
              <option>WORKER_CLEANUP_DAEMON</option>
            </select>
            <button style={{ padding: '5px 15px' }} onClick={dispatchTask}>EXECUTE_PUSH</button>
          </div>
        </div>
      )}

      {/* MAIN DATA GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '25px' }}>
        <div className="terminal-window" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>HEX_ADDRESS</th>
                <th>PROCESS_MODULE</th>
                <th>LOG_STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(j => (
                <tr key={j.id}>
                  <td style={{ color: "#00ff41", fontWeight: "bold" }}>0x{j.id.toString(16).toUpperCase()}</td>
                  <td>{j.type}</td>
                  <td style={{ color: j.status === "FAILED" ? "#ff3e3e" : j.status === "RUNNING" ? "#3b82f6" : "#00ff41" }}>
                    [{j.status}]
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* SYSTEM LOG SIDEBAR */}
        <div className="terminal-window">
          <p style={{ margin: "0 0 15px 0", fontSize: "12px", borderBottom: "1px solid #00ff41", paddingBottom: "5px" }}>SYSTEM_DAEMON_LOG</p>
          <div style={{ fontSize: "11px", lineHeight: "1.8", color: "rgba(0, 255, 65, 0.7)" }}>
            [08:42:01] Initializing cluster...<br/>
            [08:42:05] Redis handshake successful.<br/>
            [08:43:10] WorkerPool-01 established.<br/>
            [08:43:12] Heartbeat check: OK.<br/>
            [08:44:00] Awaiting instruction...<br/>
            <span style={{ color: "#00ff41" }}>&gt; _ <span className="blink"></span></span>
          </div>
        </div>
      </div>
    </div>
  );
}
