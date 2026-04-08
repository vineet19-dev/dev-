import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import { connectDatabase } from "./config/db.js";
import { createApiRouter } from "./routes/api.js";
import { Alert } from "./models/Alert.js";
import { Log } from "./models/Log.js";
import { ensureSystemState, evaluateSmartRules, telemetryTick } from "./services/engine.js";

dotenv.config();
connectDatabase();
const app = express();
const server = http.createServer(app);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDist = path.resolve(__dirname, "../../frontend/dist");
const hasFrontendBuild = fs.existsSync(path.join(frontendDist, "index.html"));

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST", "PATCH"]
  }
});

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173"
  })
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

const apiRouter = createApiRouter(io);
app.use("/api", apiRouter);

if (hasFrontendBuild) {
  app.use(express.static(frontendDist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path === "/health") {
      return next();
    }
    return res.sendFile(path.join(frontendDist, "index.html"));
  });
} else {
  app.get("/", (_req, res) => {
    res.json({
      message: "Frontend build not found. Run frontend dev server at http://localhost:5173 or build frontend for production.",
      frontendDevUrl: "http://localhost:5173",
      apiBase: "/api"
    });
  });
}

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: "Unexpected server error" });
});

io.on("connection", async (socket) => {
  const [state, alerts, logs] = await Promise.all([
    ensureSystemState(),
    Alert.find({ status: "active" }).sort({ createdAt: -1 }).lean(),
    Log.find().sort({ timestamp: -1 }).limit(150).lean()
  ]);

  socket.emit("snapshot", { state, alerts, logs });
});

const start = async () => {
  await connectDatabase(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/aerobridge");
  await evaluateSmartRules(io);

  setInterval(() => {
    telemetryTick(io).catch((error) => {
      console.error("Telemetry tick failed:", error.message);
    });
  }, 5000);

  const port = Number(process.env.PORT || 4000);
  server.listen(port, () => {
    console.log(`AeroBridge backend listening on port ${port}`);
  });
};

start().catch((error) => {
  console.error("Backend startup failed:", error.message);
  process.exit(1);
});
