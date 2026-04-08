import { useMemo, useState } from "react";

const columns = [
  { key: "timestamp", label: "Time" },
  { key: "department", label: "Department" },
  { key: "issue", label: "Issue" },
  { key: "severity", label: "Severity" },
  { key: "status", label: "Status" }
];

export const LogsTable = ({ logs }) => {
  const [sortBy, setSortBy] = useState("timestamp");
  const [order, setOrder] = useState("desc");
  const [severityFilter, setSeverityFilter] = useState("all");

  const filtered = useMemo(() => {
    const result = severityFilter === "all" ? [...logs] : logs.filter((log) => log.severity === severityFilter);
    result.sort((a, b) => {
      const left = sortBy === "timestamp" ? new Date(a.timestamp).getTime() : String(a[sortBy] || "");
      const right = sortBy === "timestamp" ? new Date(b.timestamp).getTime() : String(b[sortBy] || "");

      if (left < right) return order === "asc" ? -1 : 1;
      if (left > right) return order === "asc" ? 1 : -1;
      return 0;
    });
    return result;
  }, [logs, sortBy, order, severityFilter]);

  const onSort = (column) => {
    if (sortBy === column) {
      setOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortBy(column);
    setOrder("desc");
  };

  return (
    <section className="rounded-2xl border border-slate-400/20 bg-slate-900/70 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">Operational Logs</h2>
        <select
          className="rounded-lg border border-slate-500/40 bg-slate-900 px-3 py-2 text-sm text-slate-100"
          value={severityFilter}
          onChange={(event) => setSeverityFilter(event.target.value)}
        >
          <option value="all">All Severity</option>
          <option value="critical">Critical</option>
          <option value="warning">Warning</option>
          <option value="normal">Normal</option>
        </select>
      </div>

      <div className="max-h-[340px] overflow-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-500/40 text-left text-slate-300">
              {columns.map((column) => (
                <th key={column.key} className="px-3 py-2">
                  <button className="uppercase tracking-[0.16em]" onClick={() => onSort(column.key)}>
                    {column.label}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((log) => (
              <tr key={log._id} className="border-b border-slate-700/40 text-slate-200">
                <td className="px-3 py-2">{new Date(log.timestamp).toLocaleTimeString()}</td>
                <td className="px-3 py-2">{log.department}</td>
                <td className="px-3 py-2">{log.issue}</td>
                <td className="px-3 py-2 uppercase">{log.severity}</td>
                <td className="px-3 py-2 uppercase">{log.status}</td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-slate-400">
                  No log entries yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};