import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { AlertPanel } from "./components/AlertPanel";
import { ControlPanel } from "./components/ControlPanel";
import { DigitalTwin } from "./components/DigitalTwin";
import { HeaderBar } from "./components/HeaderBar";
import { IncidentTimeline } from "./components/IncidentTimeline";
import { KpiTrends } from "./components/KpiTrends";
import { LogsTable } from "./components/LogsTable";
import { SystemStatusCards } from "./components/SystemStatusCards";
import { useRealtime } from "./hooks/useRealtime";
import { fetchSnapshot, resetSystem, resolveAlert, triggerSimulation } from "./lib/api";

const uniqById = (items) => {
  const seen = new Map();
  items.forEach((item) => seen.set(item._id, item));
  return [...seen.values()];
};

export default function App() {
  const [systems, setSystems] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [error, setError] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [scenarioState, setScenarioState] = useState({
    running: false,
    step: 0,
    total: 0,
    label: ""
  });
  const [trendData, setTrendData] = useState({
    temp: [],
    voltage: [],
    smoke: [],
    load: []
  });
  const isMounted = useRef(true);

  const wait = (ms) =>
    new Promise((resolve) => {
      setTimeout(resolve, ms);
    });

  const beep = () => {
    if (!soundEnabled) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.1, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.22);
  };

  const captureTrend = (state) => {
    setTrendData((prev) => ({
      temp: [...prev.temp, Number(state?.hvac?.temperature || 0)].slice(-22),
      voltage: [...prev.voltage, Number(state?.electrical?.voltage || 0)].slice(-22),
      smoke: [...prev.smoke, Number(state?.fireSafety?.smokeLevel || 0)].slice(-22),
      load: [...prev.load, Number(state?.itSystems?.serverLoad || 0)].slice(-22)
    }));
  };

  useRealtime({
    onSnapshot: ({ state, alerts: nextAlerts, logs: nextLogs }) => {
      setSystems(state);
      setAlerts(nextAlerts || []);
      setLogs(nextLogs || []);
      captureTrend(state);
    },
    onSystem: (state) => {
      setSystems(state);
      captureTrend(state);
    },
    onAlert: (alert) => {
      setAlerts((prev) => uniqById([alert, ...prev]));
      beep();
    },
    onResolved: (resolved) => setAlerts((prev) => prev.filter((item) => item._id !== resolved._id)),
    onLog: (log) => setLogs((prev) => uniqById([log, ...prev]).slice(0, 220))
  });

  useEffect(() => {
    fetchSnapshot()
      .then(({ state, alerts: nextAlerts, logs: nextLogs }) => {
        setSystems(state);
        setAlerts(nextAlerts || []);
        setLogs(nextLogs || []);
        captureTrend(state);
      })
      .catch((err) => setError(err.message));

    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleResolve = async (alertId) => {
    try {
      await resolveAlert(alertId);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSimulation = async (type) => {
    try {
      await triggerSimulation(type);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRunScenario = async () => {
    if (scenarioState.running) return;

    const script = [
      { label: "Baseline sync and environment reset", wait: 4000, action: async () => resetSystem() },
      { label: "Terminal temperature drift rising", wait: 7000, action: async () => triggerSimulation("TEMP_INCREASE") },
      { label: "Thermal escalation crossing warning", wait: 7000, action: async () => triggerSimulation("TEMP_INCREASE") },
      { label: "HVAC operational fault injected", wait: 7000, action: async () => triggerSimulation("AC_FAILURE") },
      { label: "Runway grid voltage collapse", wait: 9000, action: async () => triggerSimulation("POWER_FAILURE") },
      { label: "Baggage area smoke spike", wait: 9000, action: async () => triggerSimulation("FIRE_ALERT") },
      { label: "Secondary smoke escalation", wait: 9000, action: async () => triggerSimulation("FIRE_ALERT") },
      { label: "Stabilization hold for narration", wait: 6000, action: async () => Promise.resolve() }
    ];

    setError("");
    setScenarioState({
      running: true,
      step: 0,
      total: script.length,
      label: "Initializing"
    });

    try {
      for (let index = 0; index < script.length; index += 1) {
        const step = script[index];
        setScenarioState((prev) => ({
          ...prev,
          step: index + 1,
          label: step.label
        }));

        await step.action();
        await wait(step.wait);
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err.message || "Demo scenario failed");
      }
    } finally {
      if (isMounted.current) {
        setScenarioState((prev) => ({
          ...prev,
          running: false,
          label: "Completed"
        }));
      }
    }
  };

  return (
    <main className="min-h-screen bg-[#020b1d] text-slate-100">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_8%_8%,rgba(34,211,238,0.14),transparent_35%),radial-gradient(circle_at_90%_90%,rgba(56,189,248,0.12),transparent_30%),linear-gradient(120deg,rgba(15,23,42,0.95),rgba(2,6,23,0.98))]" />
      <div className="relative mx-auto max-w-[1500px] space-y-4 px-4 py-5 md:px-6 md:py-6">
        <HeaderBar />

        <div className="flex justify-end">
          <button
            onClick={() => setSoundEnabled((prev) => !prev)}
            className="rounded-lg border border-cyan-300/40 bg-slate-900/70 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-100 hover:bg-cyan-300/10"
          >
            Alert Audio: {soundEnabled ? "On" : "Off"}
          </button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-100"
          >
            {error}
          </motion.div>
        )}

        <SystemStatusCards systems={systems} />
        <KpiTrends systems={systems} trendData={trendData} />

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <div className="xl:col-span-4">
            <AlertPanel alerts={alerts} onResolve={handleResolve} />
          </div>
          <div className="space-y-4 xl:col-span-8">
            <DigitalTwin systems={systems} onSelect={setSelectedZone} selectedZone={selectedZone} />
            <ControlPanel
              onSimulate={handleSimulation}
              onRunScenario={handleRunScenario}
              scenarioState={scenarioState}
            />
          </div>
        </section>

        <IncidentTimeline logs={logs} />

        <LogsTable logs={logs} />
      </div>
    </main>
  );
}