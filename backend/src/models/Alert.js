import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    department: { type: String, required: true },
    zone: { type: String, required: true },
    code: { type: String, required: true },
    severity: {
      type: String,
      enum: ["critical", "warning", "normal"],
      default: "warning"
    },
    status: {
      type: String,
      enum: ["active", "resolved"],
      default: "active"
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    resolvedAt: Date
  },
  { timestamps: true }
);

alertSchema.index({ code: 1, status: 1 });

export const Alert = mongoose.model("Alert", alertSchema);