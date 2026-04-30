import mongoose from "mongoose";

const TenantSchema = new mongoose.Schema({
  name: { type: String, trim: true, required: true },
  plan: { type: String, enum: ["basic", "pro", "enterprise"], required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Tenant = mongoose.model("Tenant", TenantSchema);
