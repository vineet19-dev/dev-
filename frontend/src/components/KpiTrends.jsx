const statusTone = {
  normal: "text-emerald-200",
  warning: "text-yellow-200",
  critical: "text-red-200"
};

const Sparkline = ({ data = [], color = "#22d3ee" }) => {
  if (!data.length) {
    return <div className="h-12 rounded bg-slate-950/70" />;
  }

  const width = 180;
  const height = 48;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = Math.max(max - min, 1);

  const points = data
    .map((value, idx) => {
      const x = (idx / Math.max(data.length - 1, 1)) * width;
      const y = height - ((value - min) / range) * (height - 8) - 4;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="h-12 w-full">
      <polyline fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" points={points} />
    </svg>
  );
};

export const KpiTrends = ({ systems, trendData }) => {
  const cards = [
    {
      key: "temp",
      title: "HVAC Temperature",
      unit: "C",
      value: Number(systems?.hvac?.temperature || 0).toFixed(1),
      status: systems?.hvac?.status || "normal",
      color: "#fb7185"
    },
    {
      key: "voltage",
      title: "Grid Voltage",
      unit: "V",
      value: Math.round(systems?.electrical?.voltage || 0),
      status: systems?.electrical?.status || "normal",
      color: "#facc15"
    },
    {
      key: "smoke",
      title: "Smoke Density",
      unit: "ppm",
      value: Math.round(systems?.fireSafety?.smokeLevel || 0),
      status: systems?.fireSafety?.status || "normal",
      color: "#fb923c"
    },
    {
      key: "load",
      title: "Server Load",
      unit: "%",
      value: Math.round(systems?.itSystems?.serverLoad || 0),
      status: systems?.itSystems?.status || "normal",
      color: "#22d3ee"
    }
  ];

  return (
    <section className="grid grid-cols-1 gap-3 lg:grid-cols-4">
      {cards.map((card) => (
        <article key={card.key} className="rounded-xl border border-slate-400/25 bg-slate-900/70 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-300">{card.title}</p>
          <div className="mt-2 flex items-end justify-between">
            <p className={`text-2xl font-semibold ${statusTone[card.status]}`}>{card.value}<span className="ml-1 text-sm text-slate-300">{card.unit}</span></p>
            <p className="text-xs uppercase text-slate-400">{card.status}</p>
          </div>
          <div className="mt-2 rounded bg-slate-950/70 px-2 py-1">
            <Sparkline data={trendData?.[card.key] || []} color={card.color} />
          </div>
        </article>
      ))}
    </section>
  );
};