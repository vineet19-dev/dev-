import { motion } from "framer-motion";

const controls = [
  { label: "Trigger AC Failure", type: "AC_FAILURE", style: "border-red-300/50 bg-red-500/10 text-red-100" },
  { label: "Increase Temperature", type: "TEMP_INCREASE", style: "border-yellow-300/50 bg-yellow-400/10 text-yellow-100" },
  { label: "Power Failure", type: "POWER_FAILURE", style: "border-red-300/50 bg-red-600/10 text-red-100" },
  { label: "Fire Alert", type: "FIRE_ALERT", style: "border-orange-300/50 bg-orange-500/10 text-orange-100" }
];

export const ControlPanel = ({ onSimulate, onRunScenario, scenarioState }) => {
  const progress = scenarioState.total
    ? Math.round((scenarioState.step / scenarioState.total) * 100)
    : 0;

  return (
    <section className="rounded-2xl border border-cyan-300/20 bg-slate-900/70 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-white">Simulation Control</h2>
        <button
          onClick={onRunScenario}
          disabled={scenarioState.running}
          className="rounded-lg border border-cyan-300/50 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-100 transition hover:bg-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {scenarioState.running ? "Running Demo" : "Run 60s Demo Sequence"}
        </button>
      </div>

      <div className="mb-4 rounded-lg border border-cyan-300/20 bg-slate-950/70 p-3">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-300">
          <span>Scenario Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-cyan-300 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-slate-300">
          {scenarioState.running
            ? `Step ${scenarioState.step}/${scenarioState.total}: ${scenarioState.label}`
            : "Idle: click the demo button to run the guided incident narrative."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {controls.map((control) => (
          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ y: -2 }}
            key={control.type}
            className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${control.style}`}
            onClick={() => onSimulate(control.type)}
            disabled={scenarioState.running}
          >
            {control.label}
          </motion.button>
        ))}
      </div>
    </section>
  );
};