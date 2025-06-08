import { Schema, model, models } from 'mongoose';

export enum NamkeenType {
  Popular = "popular",
  Latest = "latest",
  None = "none",
}

// Interface for quantity-based pricing
export interface IPricing {
  quantity: number;
  unit: 'gm' | 'kg' | 'piece' | 'dozen';
  price: number;
}

export interface INamkeen {
  _id?: string;
  name: string;
  description: string;
  image: string;
  type: NamkeenType;
  pricing: IPricing[]; // Array of quantity-price combinations
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

const NamkeenSchema = new Schema<INamkeen>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  type: {
    type: String,
    enum: Object.values(NamkeenType),
    default: NamkeenType.None,
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

export const Namkeen = models.Namkeen || model<INamkeen>("Namkeen", NamkeenSchema);