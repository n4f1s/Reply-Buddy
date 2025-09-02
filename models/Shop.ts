import mongoose, { Document, Model, Schema } from "mongoose";

export interface IShop extends Document {
  fbPageId?: string;
  pageAccessToken?: string;
  name: string;
  currency?: string;
  tone?: "friendly" | "formal";
  languages?: string[];
  createdAt?: Date;
}

const ShopSchema = new Schema<IShop>(
  {
    fbPageId: { type: String, index: true, unique: true, sparse: true },
    pageAccessToken: { type: String },
    name: { type: String, required: true },
    currency: { type: String, default: "BDT" },
    tone: { type: String, enum: ["friendly", "formal"], default: "friendly" },
    languages: { type: [String], default: ["en", "bn"] },
  },
  { timestamps: true }
);

const Shop: Model<IShop> = mongoose.models.Shop || mongoose.model<IShop>("Shop", ShopSchema);
export default Shop;
