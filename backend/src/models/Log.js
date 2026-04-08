import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    department: { type: String, required: true },
    issue: { type: String, required: true },
    severity: {
      type: String,
      enum: ["critical", "warning", "normal"],
      required: true
    },
    status: {
      type: String,
      enum: ["active", "resolved"],
      required: true
    },
    zone: { type: String, required: true },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export const Log = mongoose.model("Log", logSchema);