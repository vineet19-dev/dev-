import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["normal", "warning", "critical"],
      default: "normal"
    },
    operational: {
      type: Boolean,
      default: true
    },
    temperature: Number,
    voltage: Number,
    activeSensors: Number,
    smokeLevel: Number,
    serverLoad: Number,
    zone: String
  },
  { _id: false }
);

const systemStateSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      unique: true,
      default: "primary"
    },
    hvac: departmentSchema,
    electrical: departmentSchema,
    security: departmentSchema,
    fireSafety: departmentSchema,
    itSystems: departmentSchema,
    zones: {
      terminal1: { type: String, enum: ["normal", "warning", "critical"], default: "normal" },
      terminal2: { type: String, enum: ["normal", "warning", "critical"], default: "normal" },
      runway: { type: String, enum: ["normal", "warning", "critical"], default: "normal" },
      baggageArea: { type: String, enum: ["normal", "warning", "critical"], default: "normal" },
      controlRoom: { type: String, enum: ["normal", "warning", "critical"], default: "normal" }
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export const SystemState = mongoose.model("SystemState", systemStateSchema);