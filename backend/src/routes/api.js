import { Router } from "express";
import { Alert } from "../models/Alert.js";
import { Log } from "../models/Log.js";
import { SystemState } from "../models/SystemState.js";
import {
  createAlertIfNeeded,
  ensureSystemState,
  evaluateSmartRules,
  resolveAlert,
  simulateEvent
} from "../services/engine.js";

export const createApiRouter = (io) => {
  const router = Router();

  router.get("/systems", async (_req, res, next) => {
    try {
      const state = await ensureSystemState();
      res.json(state);
    } catch (error) {
      next(error);
    }
  });

  router.get("/alerts", async (_req, res, next) => {
    try {
      const alerts = await Alert.find({ status: "active" }).sort({ createdAt: -1 }).lean();
      res.json(alerts);
    } catch (error) {
      next(error);
    }
  });

  router.post("/alerts", async (req, res, next) => {
    try {
      const { title, severity = "warning", department = "Manual", zone = "Control Room", code = `MANUAL_${Date.now()}` } = req.body;
      if (!title) {
        return res.status(400).json({ message: "title is required" });
      }

      const alert = await createAlertIfNeeded(io, {
        title,
        severity,
        department,
        zone,
        code,
        status: "active"
      });

      await evaluateSmartRules(io);
      return res.status(201).json(alert);
    } catch (error) {
      next(error);
    }
  });

  router.patch("/alerts/:id/resolve", async (req, res, next) => {
    try {
      const resolved = await resolveAlert(io, req.params.id);
      if (!resolved) {
        return res.status(404).json({ message: "Alert not found" });
      }

      await evaluateSmartRules(io);
      return res.json(resolved);
    } catch (error) {
      next(error);
    }
  });

  router.get("/logs", async (req, res, next) => {
    try {
      const { severity, status, department, sortBy = "timestamp", order = "desc" } = req.query;
      const filters = {};
      if (severity) filters.severity = severity;
      if (status) filters.status = status;
      if (department) filters.department = department;

      const sortDirection = order === "asc" ? 1 : -1;
      const logs = await Log.find(filters).sort({ [sortBy]: sortDirection }).limit(300).lean();
      res.json(logs);
    } catch (error) {
      next(error);
    }
  });

  router.post("/simulate", async (req, res, next) => {
    try {
      const { type } = req.body;
      const supported = ["AC_FAILURE", "TEMP_INCREASE", "POWER_FAILURE", "FIRE_ALERT"];
      if (!supported.includes(type)) {
        return res.status(400).json({ message: "Unsupported simulation type" });
      }

      const state = await simulateEvent(io, type);
      return res.status(201).json({ message: "Simulation applied", state });
    } catch (error) {
      next(error);
    }
  });

  router.get("/snapshot", async (_req, res, next) => {
    try {
      const [state, alerts, logs] = await Promise.all([
        ensureSystemState(),
        Alert.find({ status: "active" }).sort({ createdAt: -1 }).lean(),
        Log.find().sort({ timestamp: -1 }).limit(150).lean()
      ]);
      res.json({ state, alerts, logs });
    } catch (error) {
      next(error);
    }
  });

  router.post("/reset", async (_req, res, next) => {
    try {
      await Promise.all([
        Alert.deleteMany({}),
        Log.deleteMany({}),
        SystemState.deleteMany({})
      ]);
      const state = await ensureSystemState();
      io.emit("system:update", state);
      res.json({ message: "System reset complete" });
    } catch (error) {
      next(error);
    }
  });

  return router;
};