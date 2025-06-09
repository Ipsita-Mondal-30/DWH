import { Schema, model, models } from 'mongoose';

export enum OrderStatus {
  Confirmed = "confirmed",
  Delivered = "delivered",
  Cancelled = "cancelled"
}

export enum PaymentStatus {
  Pending = "pending",
  Paid = "paid",
}

export enum PaymentMethod {
  CashOnDelivery = "cash_on_delivery",
  UPI = "upi",
}

interface IPricing {
  quantity: number;
  unit: 'gm' | 'kg' | 'piece' | 'dozen';
  price: number;
}

interface IOrderItem {
  productId: Schema.Types.ObjectId;
  productName: string; // Store product name for historical reference
  productImage: string; // Store product image for historical reference
  quantity: number;
  selectedPricing: IPricing;
  itemTotal: number; // Total for this item (selectedPricing.price * quantity)
}

interface IShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode?: string;
  landmark?: string;
}

export interface IOrder {
  _id?: string;
  orderId: string; // Custom order ID (e.g., ORD-2024-001)
  userId: string;
  userEmail?: string; // Store user email for reference
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  subtotal: number; // Sum of all item totals
  shippingCost: number;
  tax: number;
  totalAmount: number; // subtotal + shippingCost + tax
  notes?: string; // Any special instructions from customer
  adminNotes?: string; // Internal notes for admin
  estimatedDelivery?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
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

const OrderItemSchema = new Schema<IOrderItem>({
  productId: { 
    type: Schema.Types.ObjectId, 
    required: true,
    ref: 'Product'
  },
  productName: { type: String, required: true },
  productImage: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  selectedPricing: { 
    type: PricingSchema, 
    required: true 
  },
  itemTotal: { type: Number, required: true }
});

const ShippingAddressSchema = new Schema<IShippingAddress>({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  addressLine1: { type: String, required: true },
  addressLine2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String },
  landmark: { type: String }
});

const OrderSchema = new Schema<IOrder>({
  orderId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  userId: { type: String, required: true },
  userEmail: { type: String },
  items: { 
    type: [OrderItemSchema], 
    required: true,
    validate: {
      validator: function(v: IOrderItem[]) {
        return v && v.length > 0;
      },
      message: 'At least one item is required'
    }
  },
  shippingAddress: { 
    type: ShippingAddressSchema, 
    required: true 
  },
  orderStatus: {
    type: String,
    enum: Object.values(OrderStatus),
    default: OrderStatus.Confirmed
  },
  paymentStatus: {
    type: String,
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.Pending
  },
  paymentMethod: {
    type: String,
    enum: Object.values(PaymentMethod),
    required: true
  },
  subtotal: { type: Number, required: true },
  shippingCost: { type: Number, required: true, default: 0 },
  tax: { type: Number, required: true, default: 0 },
  totalAmount: { type: Number, required: true },
  notes: { type: String },
  adminNotes: { type: String },
  estimatedDelivery: { type: Date },
  deliveredAt: { type: Date },
  cancelledAt: { type: Date },
  cancellationReason: { type: String }
}, {
  timestamps: true
});

// Improved pre-save hook with better error handling
OrderSchema.pre('save', async function (next) {
    if (this.isNew && !this.orderId) {
      try {
        // Cast `this.constructor` to the actual model type
        const OrderModel = this.constructor as typeof Order;
        const count = await OrderModel.countDocuments();
        const year = new Date().getFullYear();
        this.orderId = `ORD-${year}-${String(count + 1).padStart(4, '0')}`;
      } catch (error) {
        // Cast error to Error before passing to `next`
        return next(error as Error);
      }
    }
    next();
  });

export const Order = models.Order || model<IOrder>("Order", OrderSchema);