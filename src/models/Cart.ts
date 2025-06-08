import { Schema, model, models } from 'mongoose';

interface IPricing {
  quantity: number;
  unit: 'gm' | 'kg' | 'piece' | 'dozen';
  price: number;
}

interface ICartItem {
  productId: Schema.Types.ObjectId;
  quantity: number;
  selectedPricing?: IPricing; // Store the selected pricing option
}

interface ICart {
  userId: string;
  items: ICartItem[];
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

const CartItemSchema = new Schema<ICartItem>({
  productId: { 
    type: Schema.Types.ObjectId, 
    required: true,
    refPath: 'model' // This allows referencing different models
  },
  quantity: { type: Number, required: true, min: 1 },
  selectedPricing: { 
    type: PricingSchema, 
    required: false // Optional for products without pricing options
  }
});

const CartSchema = new Schema<ICart>({
  userId: { type: String, required: true, unique: true },
  items: [CartItemSchema]
}, {
  timestamps: true
});

export const Cart = models.Cart || model<ICart>("Cart", CartSchema);