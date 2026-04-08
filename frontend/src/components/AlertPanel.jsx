import { AnimatePresence, motion } from "framer-motion";

const severityStyles = {
  critical: "border-red-400/50 bg-red-500/10 shadow-neonRed",
  warning: "border-yellow-300/50 bg-yellow-400/10 shadow-neonYellow",
  normal: "border-emerald-400/50 bg-emerald-400/10 shadow-neonGreen"
};

export const AlertPanel = ({ alerts, onResolve }) => {
  return (
    <section className="rounded-2xl border border-red-200/20 bg-slate-900/70 p-4 backdrop-blur-md">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Active Alerts</h2>
        <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-medium text-red-200">{alerts.length} Active</span>
      </div>
      <div className="max-h-[360px] space-y-3 overflow-auto pr-1">
        <AnimatePresence initial={false}>
          {alerts.map((alert) => (
            <motion.article
              key={alert._id}
              initial={{ opacity: 0, x: -18, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className={`rounded-xl border p-3 ${severityStyles[alert.severity] || severityStyles.warning}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-white">{alert.title}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-300">{alert.department} | {alert.zone}</p>
                  <p className="mt-2 text-xs text-slate-400">{new Date(alert.createdAt).toLocaleString()}</p>
                </div>
                <button
                  onClick={() => onResolve(alert._id)}
                  className="rounded-md border border-cyan-200/40 px-3 py-1 text-xs font-medium text-cyan-100 transition hover:bg-cyan-300/15"
                >
                  Resolve
                </button>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
        {!alerts.length && <p className="rounded-lg border border-emerald-300/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">No active alerts. All systems nominal.</p>}
      </div>
    </section>
  );
};