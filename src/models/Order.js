import mongoose from "mongoose";
import { Tenant } from "./Tenant.js";
import { Product } from "./Product.js";

const orderSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tenant",
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number },
      priceAtPurchase: { type: Number },
    },
  ],
  totalAmount: { type: Number },
  status: { type: String, enum: ["created", "paid", "shipped", "cancelled"] },
  createdAt: { type: Date, default: Date.now },
});

orderSchema.index({ tenantId: 1, createdAt: -1 });
orderSchema.index({ tenantId: 1, status: 1 });
orderSchema.index({ tenantId: 1, userId: 1 });

export const Order = mongoose.model("Order", orderSchema);
