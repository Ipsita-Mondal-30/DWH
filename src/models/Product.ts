import { Schema, model, models } from 'mongoose';

export enum ProductType {
  Popular = "popular",
  Latest = "latest",
  None = "none",
}

// New interface for quantity-based pricing
export interface IPricing {
  quantity: number;
  unit: 'gm' | 'kg' | 'piece' | 'dozen';
  price: number;
}
export type Product = {
  _id: string;
  name: string;
  description: string;
  image?: string;
  price: number; // Added the price property
  // Add other existing properties here
};

export interface IProduct {
  _id?: string;
  name: string;
  description: string;
  image: string;
  type: ProductType;
  pricing: IPricing[]; // Array of quantity-price combinations
  price: number; // Add the price property
}

const PricingSchema = new Schema<IPricing>({
  quantity: { type: Number, required: true },
  unit: { 
    type: String, 
    enum: ['gm', 'kg', 'piece', 'dozen'],
    required: true 
  },
  price: { type: Number, required: true }
});

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  type: {
    type: String,
    enum: Object.values(ProductType),
    default: ProductType.None,
  },
  pricing: { 
    type: [PricingSchema], 
    required: true,
    validate: {
      validator: function(v: IPricing[]) {
        return v && v.length > 0;
      },
      message: 'At least one pricing option is required'
    }
  }
}, {
  timestamps: true
});

export const Product = models.Product || model<IProduct>("Product", ProductSchema);