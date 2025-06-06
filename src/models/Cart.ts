import mongoose from 'mongoose';

const CartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: { 
    type: Number, 
    required: true,
    min: 1
  },
}, { _id: true });

const CartSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true,
    index: true
  },
  items: [CartItemSchema],
}, {
  timestamps: true,
});

// Add index for faster queries
CartSchema.index({ userId: 1 });

// Remove items with quantity 0 before saving
CartSchema.pre('save', function() {
  const filteredItems = this.items.filter(item => item.quantity > 0);
  this.items.splice(0, this.items.length, ...filteredItems);
});

export const Cart = mongoose.models.Cart || mongoose.model('Cart', CartSchema);