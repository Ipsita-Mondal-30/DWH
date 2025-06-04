import mongoose from 'mongoose';

const CartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: { type: Number, required: true },
});

const CartSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: [CartItemSchema],
});
export interface Product {
    _id: string;
    name: string;
    // Add other fields as needed
  }

export interface CartItem {
    product: Product;
    quantity: number;
  }

export const Cart = mongoose.models.Cart || mongoose.model('Cart', CartSchema);
