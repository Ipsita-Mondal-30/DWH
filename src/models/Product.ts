// src/models/Product.ts
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
}

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true }, // new field for image URL
  type: {
    type: String,
    enum: Object.values(ProductType),
    default: ProductType.None,
  },
});

export const Product = models.Product || model<IProduct>("Product", ProductSchema);
