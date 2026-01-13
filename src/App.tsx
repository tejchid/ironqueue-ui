import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_URL = "/api";

type Job = {
  id: number;
  type: string;
  status: "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED" | string;
  attempts: number;
  max_attempts: number;
  payload?: any;
  last_error?: string | null;
  created_at?: string;
  started_at?: string;
  finished_at?: string;
};

function StatusBadge({ status }: { status: Job["status"] }) {
  const cls =
    status === "QUEUED"
      ? "gray"
      : status === "RUNNING"
      ? "blue"
      : status === "COMPLETED"
      ? "green"
      : "red";
  return <span className={`badge ${cls}`}>{status}</span>;
}

function RetryDots({ attempts, max }: { attempts: number; max: number }) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {Array.from({ length: max }).map((_, i) => {
        const used = i < attempts;
        return (
          <div
            key={i}
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: used ? "#ef4444" : "transparent",
              border: used ? "none" : "1px solid #4b5563",
            }}
          />
        );
      })}
    </div>
  );
}

function PrettyJson({ value }: { value: any }) {
  return (
    <pre
      style={{
        margin: 0,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        fontSize: 12,
        lineHeight: 1.4,
        padding: 12,
        borderRadius: 12,
        background: "#0b1220",
        border: "1px solid #1f2937",
      }}
    >
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

export default function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selected, setSelected] = useState<Job | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [query, setQuery] = useState("");

  async function fetchAllJobs() {
    const statuses = ["QUEUED", "RUNNING", "COMPLETED", "FAILED"];
    const results = await Promise.all(
      statuses.map((s) =>
        axios.get(`${API_URL}/jobs?status=${s}`).then((r) => r.data as Job[])
      )
    );
    const merged = results.flat();
    // newest first
    merged.sort((a, b) => b.id - a.id);
    setJobs(merged);
  }

  async function fetchJob(id: number) {
    const res = await axios.get(`${API_URL}/jobs/${id}`);
    setSelected(res.data);
  }

  useEffect(() => {
    fetchAllJobs();
    const id = setInterval(fetchAllJobs, 3000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (selectedId != null) fetchJob(selectedId);
  }, [selectedId]);

  const counts = useMemo(
    () => ({
      QUEUED: jobs.filter((j) => j.status === "QUEUED").length,
      RUNNING: jobs.filter((j) => j.status === "RUNNING").length,
      COMPLETED: jobs.filter((j) => j.status === "COMPLETED").length,
      FAILED: jobs.filter((j) => j.status === "FAILED").length,
    }),
    [jobs]
  );

  const filtered = useMemo(() => {
    return jobs.filter((j) => {
      const okStatus = statusFilter === "ALL" ? true : j.status === statusFilter;
      const q = query.trim().toLowerCase();
      const okQuery =
        q.length === 0
          ? true
          : String(j.id).includes(q) || (j.type || "").toLowerCase().includes(q);
      return okStatus && okQuery;
    });
  }, [jobs, statusFilter, query]);

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <header
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: 18,
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>IronQueue</h1>
          <p style={{ margin: 0, color: "#9ca3af" }}>Live · updating every 3s</p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by id or type…"
            style={{
              width: 240,
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid #1f2937",
              background: "#0f1624",
              color: "#e5e7eb",
              outline: "none",
            }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid #1f2937",
              background: "#0f1624",
              color: "#e5e7eb",
              outline: "none",
            }}
          >
            <option value="ALL">All</option>
            <option value="QUEUED">Queued</option>
            <option value="RUNNING">Running</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 18,
        }}
      >
        {Object.entries(counts).map(([k, v]) => (
          <div key={k} className="card">
            <div style={{ fontSize: 30, fontWeight: 650 }}>{v}</div>
            <div style={{ color: "#9ca3af", letterSpacing: 0.4 }}>{k}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: 16, color: "#9ca3af", fontSize: 12 }}>
          Click a job to view details
        </div>

        <table width="100%" cellPadding={12} style={{ borderCollapse: "collapse" }}>
          <thead style={{ color: "#9ca3af", textAlign: "left" }}>
            <tr>
              <th style={{ paddingLeft: 16 }}>ID</th>
              <th>Type</th>
              <th>Status</th>
              <th>Retries</th>
              <th style={{ paddingRight: 16 }}>Max</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: 16, color: "#9ca3af" }}>
                  No jobs match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((job) => (
                <tr
                  key={job.id}
                  onClick={() => setSelectedId(job.id)}
                  style={{
                    cursor: "pointer",
                    borderTop: "1px solid #0b1220",
                    background:
                      selectedId === job.id ? "rgba(59,130,246,0.08)" : "transparent",
                  }}
                >
                  <td style={{ paddingLeft: 16 }}>{job.id}</td>
                  <td>{job.type}</td>
                  <td>
                    <StatusBadge status={job.status} />
                  </td>
                  <td>
                    <RetryDots attempts={job.attempts} max={job.max_attempts} />
                  </td>
                  <td style={{ paddingRight: 16 }}>{job.max_attempts}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Drawer */}
      {selectedId != null && (
        <div
          onClick={() => {
            setSelectedId(null);
            setSelected(null);
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 520,
              height: "100%",
              background: "#0f1624",
              borderLeft: "1px solid #1f2937",
              padding: 18,
              boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>Job</div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>
                  #{selectedId}
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedId(null);
                  setSelected(null);
                }}
              >
                Close
              </button>
            </div>

            <div style={{ marginTop: 14, display: "flex", gap: 10, alignItems: "center" }}>
              {selected ? (
                <>
                  <StatusBadge status={selected.status} />
                  <span style={{ color: "#9ca3af" }}>
                    {selected.type} · attempts {selected.attempts}/{selected.max_attempts}
                  </span>
                </>
              ) : (
                <span style={{ color: "#9ca3af" }}>Loading…</span>
              )}
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={{ color: "#9ca3af", fontSize: 12, marginBottom: 8 }}>
                Payload
              </div>
              <PrettyJson value={selected?.payload ?? {}} />
            </div>

            {selected?.last_error ? (
              <div style={{ marginTop: 16 }}>
                <div style={{ color: "#9ca3af", fontSize: 12, marginBottom: 8 }}>
                  Last error
                </div>
                <div
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    border: "1px solid #1f2937",
                    background: "#0b1220",
                    color: "#fca5a5",
                    fontSize: 12,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {selected.last_error}
                </div>
              </div>
            ) : null}

            <div style={{ marginTop: 16, color: "#9ca3af", fontSize: 12 }}>
              Note: duration is shown as “—” until backend exposes timestamps in its response schema.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
