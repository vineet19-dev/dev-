import { Alert } from "../models/Alert.js";
import { Log } from "../models/Log.js";
import { SystemState } from "../models/SystemState.js";

const severityRank = {
  normal: 0,
  warning: 1,
  critical: 2
};

const setZoneSeverity = (state, zoneKey, severity) => {
  const current = state.zones[zoneKey] || "normal";
  if (severityRank[severity] > severityRank[current]) {
    state.zones[zoneKey] = severity;
  }
};

const resetZoneStatus = (state) => {
  state.zones = {
    terminal1: "normal",
    terminal2: "normal",
    runway: "normal",
    baggageArea: "normal",
    controlRoom: "normal"
  };
};

const getBaseState = () => ({
  key: "primary",
  hvac: {
    status: "normal",
    operational: true,
    temperature: 23,
    zone: "terminal1"
  },
  electrical: {
    status: "normal",
    operational: true,
    voltage: 220,
    zone: "runway"
  },
  security: {
    status: "normal",
    operational: true,
    activeSensors: 128,
    zone: "terminal2"
  },
  fireSafety: {
    status: "normal",
    operational: true,
    smokeLevel: 8,
    zone: "baggageArea"
  },
  itSystems: {
    status: "normal",
    operational: true,
    serverLoad: 35,
    zone: "controlRoom"
  },
  zones: {
    terminal1: "normal",
    terminal2: "normal",
    runway: "normal",
    baggageArea: "normal",
    controlRoom: "normal"
  }
});

export const ensureSystemState = async () => {
  let state = await SystemState.findOne({ key: "primary" });
  if (!state) {
    state = await SystemState.create(getBaseState());
  }
  return state;
};

const createLog = async ({ department, issue, severity, status, zone }) => {
  const log = await Log.create({ department, issue, severity, status, zone });
  return log;
};

const emitState = (io, state) => {
  io.emit("system:update", state);
};

const emitAlert = (io, alert) => {
  io.emit("alert:new", alert);
};

const emitResolved = (io, alert) => {
  io.emit("alert:resolved", alert);
};

const emitLog = (io, log) => {
  io.emit("log:new", log);
};

export const createAlertIfNeeded = async (io, payload) => {
  const existing = await Alert.findOne({ code: payload.code, status: "active" });
  if (existing) {
    return existing;
  }

  const alert = await Alert.create(payload);
  const log = await createLog({
    department: payload.department,
    issue: payload.title,
    severity: payload.severity,
    status: "active",
    zone: payload.zone
  });
  emitAlert(io, alert);
  emitLog(io, log);
  return alert;
};

export const resolveAlert = async (io, alertId) => {
  const alert = await Alert.findById(alertId);
  if (!alert) {
    return null;
  }
  alert.status = "resolved";
  alert.resolvedAt = new Date();
  await alert.save();

  const log = await createLog({
    department: alert.department,
    issue: `${alert.title} resolved`,
    severity: "normal",
    status: "resolved",
    zone: alert.zone
  });
  emitResolved(io, alert);
  emitLog(io, log);
  return alert;
};

export const evaluateSmartRules = async (io) => {
  const state = await ensureSystemState();

  state.hvac.status = "normal";
  state.electrical.status = "normal";
  state.fireSafety.status = "normal";
  resetZoneStatus(state);

  if (!state.hvac.operational) {
    state.hvac.status = "critical";
    setZoneSeverity(state, state.hvac.zone, "critical");
    await createAlertIfNeeded(io, {
      title: "AC Failure - Terminal 1",
      department: "HVAC",
      zone: "Terminal 1",
      code: "HVAC_AC_FAILURE_TERMINAL1",
      severity: "critical",
      status: "active",
      meta: { operational: false }
    });
  }

  if (state.hvac.temperature > 32) {
    state.hvac.status = "critical";
    setZoneSeverity(state, state.hvac.zone, "critical");
    await createAlertIfNeeded(io, {
      title: "HVAC Overheat - Terminal 1",
      department: "HVAC",
      zone: "Terminal 1",
      code: "HVAC_TEMP_CRITICAL_TERMINAL1",
      severity: "critical",
      status: "active",
      meta: { temperature: state.hvac.temperature }
    });
  } else if (state.hvac.temperature > 28) {
    if (state.hvac.status !== "critical") {
      state.hvac.status = "warning";
    }
    setZoneSeverity(state, state.hvac.zone, "warning");
    await createAlertIfNeeded(io, {
      title: "HVAC Temperature Warning - Terminal 1",
      department: "HVAC",
      zone: "Terminal 1",
      code: "HVAC_TEMP_WARNING_TERMINAL1",
      severity: "warning",
      status: "active",
      meta: { temperature: state.hvac.temperature }
    });
  }

  if (state.electrical.voltage === 0 || !state.electrical.operational) {
    state.electrical.status = "critical";
    setZoneSeverity(state, state.electrical.zone, "critical");
    await createAlertIfNeeded(io, {
      title: "Power Failure - Runway Grid",
      department: "Electrical",
      zone: "Runway",
      code: "ELECTRICAL_VOLTAGE_ZERO_RUNWAY",
      severity: "critical",
      status: "active",
      meta: { voltage: state.electrical.voltage }
    });
  }

  if (state.fireSafety.smokeLevel > 55) {
    state.fireSafety.status = "critical";
    setZoneSeverity(state, state.fireSafety.zone, "critical");
    await createAlertIfNeeded(io, {
      title: "Fire Alert - Baggage Area",
      department: "Fire Safety",
      zone: "Baggage Area",
      code: "FIRE_SMOKE_CRITICAL_BAGGAGE",
      severity: "critical",
      status: "active",
      meta: { smokeLevel: state.fireSafety.smokeLevel }
    });
  } else if (state.fireSafety.smokeLevel > 35) {
    state.fireSafety.status = "warning";
    setZoneSeverity(state, state.fireSafety.zone, "warning");
    await createAlertIfNeeded(io, {
      title: "Smoke Warning - Baggage Area",
      department: "Fire Safety",
      zone: "Baggage Area",
      code: "FIRE_SMOKE_WARNING_BAGGAGE",
      severity: "warning",
      status: "active",
      meta: { smokeLevel: state.fireSafety.smokeLevel }
    });
  }

  state.security.status = state.security.activeSensors < 70 ? "warning" : "normal";
  if (state.security.status === "warning") {
    setZoneSeverity(state, state.security.zone, "warning");
  }

  state.itSystems.status = state.itSystems.serverLoad > 80 ? "warning" : "normal";
  if (state.itSystems.status === "warning") {
    setZoneSeverity(state, state.itSystems.zone, "warning");
  }

  state.updatedAt = new Date();
  await state.save();
  emitState(io, state);

  return state;
};

export const simulateEvent = async (io, type) => {
  const state = await ensureSystemState();

  if (type === "AC_FAILURE") {
    state.hvac.operational = false;
    state.hvac.temperature += 2;
  }

  if (type === "TEMP_INCREASE") {
    state.hvac.temperature += 3;
  }

  if (type === "POWER_FAILURE") {
    state.electrical.voltage = 0;
    state.electrical.operational = false;
  }

  if (type === "FIRE_ALERT") {
    state.fireSafety.smokeLevel += 30;
  }

  await state.save();
  return evaluateSmartRules(io);
};

export const telemetryTick = async (io) => {
  const state = await ensureSystemState();

  state.hvac.temperature = Math.max(20, Math.min(36, state.hvac.temperature + (Math.random() * 2 - 1.1)));
  state.security.activeSensors = Math.max(45, Math.min(150, Math.round(state.security.activeSensors + (Math.random() * 8 - 4))));
  state.itSystems.serverLoad = Math.max(15, Math.min(95, Math.round(state.itSystems.serverLoad + (Math.random() * 10 - 5))));

  if (state.electrical.operational && state.electrical.voltage > 0) {
    state.electrical.voltage = Math.max(210, Math.min(240, Math.round(state.electrical.voltage + (Math.random() * 4 - 2))));
  }

  state.fireSafety.smokeLevel = Math.max(5, Math.min(80, Math.round(state.fireSafety.smokeLevel + (Math.random() * 6 - 3))));

  await state.save();
  return evaluateSmartRules(io);
};