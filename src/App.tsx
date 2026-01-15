import { useEffect, useState } from "react";

// --- TERMINAL THEME ---
export default function App() {
  const [jobs, setJobs] = useState([...]); 
  
  return (
    <div style={{ 
      backgroundColor: "#0a0a0a", 
      color: "#00ff41", // Matrix/Terminal Green
      fontFamily: "'JetBrains Mono', monospace", 
      minHeight: "100vh",
      padding: "20px",
      border: "10px solid #1a1a1a" // "Monitor" frame
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');
        .term-border { border: 1px solid #00ff41; padding: 15px; margin-bottom: 20px; box-shadow: inset 0 0 10px #00ff4133; }
        .cursor { display: inline-block; width: 10px; height: 18px; background: #00ff41; animation: blink 1s infinite; vertical-align: middle; }
        @keyframes blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }
      `}</style>

      {/* SYSTEM HEADER */}
      <div className="term-border" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontWeight: 800 }}>[ SYSTEM ]: IRON_QUEUE_V2</div>
          <div style={{ fontSize: 12 }}>ID: SJSU_CE_NODE_01</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div>CPU_LOAD: 24.8%</div>
          <div>NET_LATENCY: 0.04ms</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>
        
        {/* COMMAND TABLE */}
        <div>
          <div className="term-border" style={{ padding: 0 }}>
            <table width="100%" style={{ borderCollapse: 'collapse' }}>
              <thead style={{ background: '#00ff41', color: '#0a0a0a' }}>
                <tr>
                  <th style={{ padding: '8px' }}>HEX_ID</th>
                  <th>MODULE</th>
                  <th>STATUS</th>
                  <th>OP_CODE</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(j => (
                  <tr key={j.id} style={{ borderBottom: '1px solid #00ff4122' }}>
                    <td style={{ padding: '12px' }}>0x{j.id.toString(16).toUpperCase()}</td>
                    <td>{j.type}</td>
                    <td>[{j.status}]</td>
                    <td><button style={{ background: 'none', border: '1px solid #00ff41', color: '#00ff41', cursor: 'pointer', fontSize: '10px' }}>KILL_PROC</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* WORKER LOGS */}
        <aside>
          <div className="term-border" style={{ height: '400px', fontSize: '12px', overflow: 'hidden' }}>
            <div style={{ marginBottom: '10px', color: '#888' }}>-- WORKER_DAEMON_LOG --</div>
            <div>[04:22] Initializing Redis...</div>
            <div>[04:22] Connection established.</div>
            <div>[04:23] Worker_01: Waiting for task...</div>
            <div style={{ marginTop: '20px' }}>&gt; _ <span className="cursor"></span></div>
          </div>
        </aside>

      </div>
    </div>
  );
}
