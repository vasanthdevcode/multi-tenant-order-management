import mongoose from "mongoose";
import { Tenant } from "./Tenant.js";

const productSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tenant",
  },
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 1 },
  inventoryCount: { type: Number },
  tags: { type: [String] },
  createdAt: { type: Date, default: Date.now },
});

productSchema.index({ tenantId: 1, category: 1 });
productSchema.index({ tenantId: 1, price: 1 });
// Since tags is an array, MongoDB creates a multikey index.
productSchema.index({ tenantId: 1, tags: 1 });

export const Product = mongoose.model("Product", productSchema);
