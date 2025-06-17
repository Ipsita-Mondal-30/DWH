// types/checkout.ts - Create this shared types file

export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string; // Optional as in your CheckoutForm
  city: string;
  state: string;
  pincode: string;
  landmark?: string; // Optional as in your CheckoutForm
}

export interface UPIPaymentData {
  userEmail: string;
  shippingAddress: ShippingAddress;
  totals: {
    subtotal: number;
    shippingCost: number;
    tax: number;
    totalAmount: number;
  };
}

export interface OrderResult {
  _id: string;
  orderId: string; 
  userEmail: string;
  shippingAddress: ShippingAddress;
  paymentMethod: 'cash_on_delivery' | 'upi';
  items: {
    productId: string;
    productName: string;
    quantity: number;
    selectedPricing: {
      quantity: number;
      unit: string;
      price: number;
    } | null;
    itemTotal: number;
  }[];
  createdAt?: string;
  totalAmount: number;
  updatedAt?: string;
  estimatedDelivery?: string;
  orderStatus: string;
}