import mongoose from "mongoose";
import { Tenant } from "./Tenant.js";

const userSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tenant",
    required: true,
  },
  name: { type: String, trim: true, required: true },
  email: { type: String, trim: true, required: true },
  role: { type: String, enum: ["admin", "manager", "viewer"], required: true },
  status: { type: String, enum: ["active", "inactive"], required: true },
  createdAt: { type: Date, default: Date.now },
});

/**
 * unique email per tenant
 *
 * How its work:
 * - Sort by tenantId (ascending)
 * - Then within each tenant → sort by createdAt (descending)
 * */
userSchema.index({ tenantId: 1, email: 1 }, { unique: true });

export const User = mongoose.model("User", userSchema);
