import mongoose from "mongoose";
import { Tenant } from "./Tenant.js";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tenant",
  },
  name: { type: String, trim: true, required: true },
  email: { type: String, trim: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "manager", "viewer"], required: true },
  status: { type: String, enum: ["active", "inactive"], required: true },
  createdAt: { type: Date, default: Date.now },
});

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;
});

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

/**
 * unique email per tenant
 * */
userSchema.index({ tenantId: 1, email: 1 }, { unique: true });

export const User = mongoose.models.User || mongoose.model("User", userSchema);
