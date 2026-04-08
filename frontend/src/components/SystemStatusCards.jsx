const statusStyles = {
  normal: "border-emerald-300/35 bg-emerald-500/10 shadow-neonGreen",
  warning: "border-yellow-300/35 bg-yellow-500/10 shadow-neonYellow",
  critical: "border-red-300/45 bg-red-500/10 shadow-neonRed"
};

const cardConfig = [
  { key: "hvac", title: "HVAC", metric: (s) => `${Number(s.temperature || 0).toFixed(1)} C`, sub: "Temperature" },
  { key: "electrical", title: "Electrical", metric: (s) => `${Math.round(s.voltage || 0)} V`, sub: "Voltage" },
  { key: "security", title: "Security", metric: (s) => `${Math.round(s.activeSensors || 0)}`, sub: "Active Sensors" },
  { key: "fireSafety", title: "Fire Safety", metric: (s) => `${Math.round(s.smokeLevel || 0)} ppm`, sub: "Smoke Level" },
  { key: "itSystems", title: "IT Systems", metric: (s) => `${Math.round(s.serverLoad || 0)}%`, sub: "Server Load" }
];

export const SystemStatusCards = ({ systems }) => {
  return (
    <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
      {cardConfig.map((item) => {
        const system = systems?.[item.key] || {};
        const status = system.status || "normal";

        return (
          <article key={item.key} className={`rounded-xl border p-4 ${statusStyles[status]}`}>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-300">{item.title}</p>
            <p className="mt-3 text-2xl font-semibold text-white">{item.metric(system)}</p>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-slate-300">{item.sub}</span>
              <span className="rounded-full bg-slate-950/70 px-2 py-0.5 uppercase tracking-[0.16em] text-slate-200">{status}</span>
            </div>
          </article>
        );
      })}
    </section>
  );
};