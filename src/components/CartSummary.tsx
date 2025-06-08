'use client';

import Image from 'next/image';
import { CartItem } from '@/hooks/useCart';

interface CartSummaryProps {
  cartItems: CartItem[];
  totals: {
    subtotal: number;
    shippingCost: number;
    tax: number;
    totalAmount: number;
  };
  onProceedToPay: () => void;
}

export default function CartSummary({ cartItems, totals, onProceedToPay }: CartSummaryProps) {
  if (cartItems.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <h2 className="text-2xl font-semibold text-gray-600 mb-4">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some items to your cart to proceed with checkout</p>
        <button 
          onClick={() => window.location.href = '/'}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cart Items */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Order Summary</h2>
        
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={`${item.product._id}-${item.selectedPricing?.quantity || 'default'}`} className="flex items-center space-x-4 py-4 border-b border-gray-200 last:border-b-0">
              <div className="flex-shrink-0">
                <Image
                  src={item.product.image || '/placeholder-image.jpg'}
                  alt={item.product.name}
                  width={80}
                  height={80}
                  className="rounded-lg object-cover"
                />
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{item.product.name}</h3>
                <p className="text-sm text-gray-600">
                  {item.selectedPricing ? 
                    `${item.selectedPricing.quantity}${item.selectedPricing.unit}` : 
                    item.product.size || 'Standard'
                  }
                </p>
                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
              </div>
              
              <div className="text-right">
                <p className="font-semibold text-gray-800">₹{item.product.price}</p>
                <p className="text-sm text-gray-600">
                  Total: ₹{(item.product.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Price Details</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal ({cartItems.length} items)</span>
            <span>₹{totals.subtotal.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between text-gray-600">
            <span>Shipping Cost</span>
            <span className={totals.shippingCost === 0 ? 'text-green-600' : ''}>
              {totals.shippingCost === 0 ? 'FREE' : `₹${totals.shippingCost}`}
            </span>
          </div>
          
          <div className="flex justify-between text-gray-600">
            <span>Tax (GST 18%)</span>
            <span>₹{totals.tax.toFixed(2)}</span>
          </div>
          
          <div className="border-t pt-3">
            <div className="flex justify-between text-lg font-semibold text-gray-800">
              <span>Total Amount</span>
              <span>₹{totals.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {totals.subtotal < 500 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Add ₹{(500 - totals.subtotal).toFixed(2)} more to get free shipping!
            </p>
          </div>
        )}
      </div>

      {/* Proceed Button */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <button
          onClick={onProceedToPay}
          className="w-full bg-green-600 text-white py-4 px-6 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors"
        >
          Proceed to Pay ₹{totals.totalAmount.toFixed(2)}
        </button>
      </div>
    </div>
  );
}