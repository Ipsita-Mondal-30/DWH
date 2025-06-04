import { Schema, model, models } from "mongoose";

export enum ProductType {
  Popular = "popular",
  Latest = "latest",
  None = "none",
}

export interface IProduct {
  name: string;
  description: string;
  image: string; // image URL (Cloudinary)
  type: ProductType;
  price: number; // ✅ new field
}

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  type: {
    type: String,
    enum: Object.values(ProductType),
    default: ProductType.None,
  },
  price: { type: Number, required: true }, // ✅ new field
});

export const Product = models.Product || model<IProduct>("Product", ProductSchema);
