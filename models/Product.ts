import mongoose, { Document, Model, Schema } from "mongoose";

export interface IProduct extends Document {
  shopId: mongoose.Types.ObjectId;
  sku?: string;
  title: string;
  price: number;
  currency?: string;
  sizes?: string[];
  stock?: number;
  images?: string[];
  description?: string;
}

const ProductSchema = new Schema<IProduct>(
  {
    shopId: { type: Schema.Types.ObjectId, ref: "Shop", index: true, required: true },
    sku: { type: String, index: true, sparse: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    currency: { type: String },
    sizes: [String],
    stock: { type: Number, default: 0 },
    images: [String],
    description: { type: String },
  },
  { timestamps: true }
);

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
export default Product;
