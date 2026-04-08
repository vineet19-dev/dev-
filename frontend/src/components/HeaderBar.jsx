import { useEffect, useState } from "react";

export const HeaderBar = () => {
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="relative overflow-hidden rounded-2xl border border-cyan-300/20 bg-slate-900/70 p-6 backdrop-blur-lg shadow-neonBlue">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(34,211,238,0.15),transparent_45%),radial-gradient(circle_at_90%_70%,rgba(14,165,233,0.2),transparent_40%)]" />
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">AeroBridge</p>
          <h1 className="mt-1 text-3xl font-semibold text-white md:text-4xl">AeroBridge Command Center</h1>
          <p className="mt-1 text-sm text-slate-300">Airport Operations Monitoring System</p>
        </div>
        <div className="rounded-xl border border-cyan-300/30 bg-slate-950/70 px-4 py-3 text-right">
          <p className="text-[0.68rem] uppercase tracking-[0.3em] text-cyan-200/70">Live UTC</p>
          <p className="text-lg font-medium text-cyan-100">{clock.toUTCString().slice(17, 25)}</p>
        </div>
      </div>
    </header>
  );
};