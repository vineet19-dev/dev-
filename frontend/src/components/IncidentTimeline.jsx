import { motion } from "framer-motion";

const severityClass = {
  critical: "border-red-300/60 bg-red-500/10 text-red-100",
  warning: "border-yellow-300/60 bg-yellow-500/10 text-yellow-100",
  normal: "border-emerald-300/60 bg-emerald-500/10 text-emerald-100"
};

export const IncidentTimeline = ({ logs = [] }) => {
  const top = logs.slice(0, 14);

  return (
    <section className="rounded-2xl border border-cyan-300/20 bg-slate-900/70 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Incident Timeline</h2>
        <span className="text-xs uppercase tracking-[0.2em] text-slate-300">Live Feed</span>
      </div>

      <div className="relative overflow-x-auto pb-2">
        <div className="absolute left-0 top-[30px] h-px w-full bg-cyan-300/25" />
        <div className="relative flex min-w-max gap-3">
          {top.map((log, index) => (
            <motion.div
              key={log._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02, duration: 0.2 }}
              className="w-[220px]"
            >
              <div className="mb-2 h-3 w-3 rounded-full border border-cyan-200/70 bg-cyan-300/70" />
              <article className={`rounded-lg border px-3 py-2 text-xs ${severityClass[log.severity] || severityClass.warning}`}>
                <p className="font-semibold uppercase tracking-[0.16em]">{log.department}</p>
                <p className="mt-1 line-clamp-2 text-slate-100">{log.issue}</p>
                <p className="mt-2 text-[0.68rem] text-slate-300">{new Date(log.timestamp).toLocaleTimeString()}</p>
              </article>
            </motion.div>
          ))}
          {!top.length && <p className="text-sm text-slate-400">Timeline will populate with live events.</p>}
        </div>
      </div>
    </section>
  );
};