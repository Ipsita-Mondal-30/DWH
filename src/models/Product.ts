import { Schema, model, models } from 'mongoose';

export enum ProductType {
  Popular = "popular",
  Latest = "latest",
  None = "none",
}

export interface IProduct {
  _id?: string;
  name: string;
  description: string;
  image: string;
  type: ProductType;
  price: number;
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
  price: { type: Number, required: true },
});

export const Product = models.Product || model<IProduct>('Product', ProductSchema);
