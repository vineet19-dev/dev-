import { motion } from "framer-motion";

const zoneClasses = {
  normal: "border-emerald-300/45 bg-emerald-500/10",
  warning: "border-yellow-300/55 bg-yellow-500/10",
  critical: "border-red-300/70 bg-red-500/15 animate-blink"
};

const zones = {
  terminal1: { title: "Terminal 1", icon: "HVAC", rect: "M 20 30 H 165 V 120 H 20 Z", point: [35, 55] },
  terminal2: { title: "Terminal 2", icon: "SEC", rect: "M 185 30 H 330 V 120 H 185 Z", point: [200, 55] },
  runway: { title: "Runway", icon: "PWR", rect: "M 20 140 H 330 V 195 H 20 Z", point: [150, 158] },
  baggageArea: { title: "Baggage Area", icon: "FIRE", rect: "M 20 210 H 165 V 290 H 20 Z", point: [35, 238] },
  controlRoom: { title: "Control Room", icon: "IT", rect: "M 185 210 H 330 V 290 H 185 Z", point: [200, 238] }
};

const fillByStatus = {
  normal: "rgba(16, 185, 129, 0.22)",
  warning: "rgba(234, 179, 8, 0.25)",
  critical: "rgba(239, 68, 68, 0.28)"
};

const strokeByStatus = {
  normal: "rgba(74, 222, 128, 0.8)",
  warning: "rgba(250, 204, 21, 0.9)",
  critical: "rgba(248, 113, 113, 0.95)"
};

export const DigitalTwin = ({ systems, onSelect, selectedZone }) => {
  const zoneState = systems?.zones || {};
  const tooltip = {
    terminal1: `Temp ${Number(systems?.hvac?.temperature || 0).toFixed(1)} C`,
    terminal2: `Sensors ${Math.round(systems?.security?.activeSensors || 0)}`,
    runway: `Voltage ${Math.round(systems?.electrical?.voltage || 0)} V`,
    baggageArea: `Smoke ${Math.round(systems?.fireSafety?.smokeLevel || 0)} ppm`,
    controlRoom: `Load ${Math.round(systems?.itSystems?.serverLoad || 0)}%`
  };

  return (
    <section className="rounded-2xl border border-cyan-300/20 bg-slate-900/70 p-4">
      <h2 className="mb-4 text-lg font-semibold text-white">Airport Digital Twin</h2>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-6">
        <div className="lg:col-span-4 rounded-xl border border-slate-500/30 bg-slate-950/70 p-3">
          <div className="relative overflow-hidden rounded-lg border border-cyan-300/20 bg-[#030a18]">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(56,189,248,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(56,189,248,0.08)_1px,transparent_1px)] bg-[size:24px_24px]" />
            <div className="pointer-events-none absolute inset-0 opacity-30 twin-scanline" />
            <svg viewBox="0 0 350 310" className="relative z-10 w-full">
              {Object.entries(zones).map(([key, zone]) => {
                const status = zoneState[key] || "normal";
                const selected = selectedZone?.key === key;
                return (
                  <g key={key}>
                    <motion.path
                      d={zone.rect}
                      fill={fillByStatus[status]}
                      stroke={strokeByStatus[status]}
                      strokeWidth={selected ? 3 : 2}
                      animate={status === "critical" ? { opacity: [1, 0.55, 1] } : { opacity: 1 }}
                      transition={status === "critical" ? { duration: 1.2, repeat: Infinity } : { duration: 0.2 }}
                      className="cursor-pointer"
                      onClick={() => onSelect({ key, title: zone.title, status, note: tooltip[key] })}
                    />
                    <text x={zone.point[0]} y={zone.point[1]} fill="#d1e9ff" fontSize="10" className="uppercase tracking-[2px]">
                      {zone.title}
                    </text>
                    <text x={zone.point[0]} y={zone.point[1] + 16} fill="#9dddfd" fontSize="9">
                      {zone.icon}
                    </text>
                  </g>
                );
              })}

              <line x1="170" y1="30" x2="170" y2="290" stroke="rgba(100,116,139,0.5)" strokeDasharray="4 4" />
              <line x1="20" y1="202" x2="330" y2="202" stroke="rgba(100,116,139,0.5)" strokeDasharray="4 4" />
            </svg>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-5">
            {Object.entries(zones).map(([key, zone]) => {
              const status = zoneState[key] || "normal";
              return (
                <button
                  key={key}
                  title={tooltip[key]}
                  onClick={() => onSelect({ key, title: zone.title, status, note: tooltip[key] })}
                  className={`rounded-md border px-2 py-1 text-left text-[0.68rem] uppercase tracking-[0.16em] ${zoneClasses[status]}`}
                >
                  <p className="text-slate-100">{zone.title}</p>
                  <p className="text-slate-300">{status}</p>
                </button>
              );
            })}
          </div>
        </div>

        <aside className="lg:col-span-2 rounded-xl border border-slate-500/30 bg-slate-950/60 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">Zone Detail</p>
          {selectedZone ? (
            <div className="mt-3 space-y-2">
              <h3 className="text-xl font-semibold text-white">{selectedZone.title}</h3>
              <p className="text-sm uppercase text-slate-300">State: {selectedZone.status}</p>
              <p className="text-sm text-slate-300">{selectedZone.note}</p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-400">Click a zone to inspect live telemetry.</p>
          )}
        </aside>
      </div>
    </section>
  );
};