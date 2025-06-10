'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { CartItem } from '@/hooks/useCart';
import Image from 'next/image';

interface UPIPaymentProps {
  cartItems: CartItem[];
  totals: {
    subtotal: number;
    shippingCost: number;
    tax: number;
    totalAmount: number;
  };
  onBack: () => void;
}

export default function UPIPayment({ cartItems, totals, onBack }: UPIPaymentProps) {
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending');
  const [upiId, setUpiId] = useState('');

  // This component is a placeholder for UPI payment integration
  // You can integrate with payment gateways like Razorpay, Paytm, etc.

  const handleUPIPayment = async () => {
    if (!upiId.trim()) {
      alert('Please enter a valid UPI ID');
      return;
    }

    setPaymentStatus('processing');

    // Simulate payment processing
    // Replace this with actual UPI payment integration
    setTimeout(() => {
      // For demo purposes, randomly succeed or fail
      const isSuccess = Math.random() > 0.3; // 70% success rate
      setPaymentStatus(isSuccess ? 'success' : 'failed');
    }, 3000);
  };

  const resetPayment = () => {
    setPaymentStatus('pending');
    setUpiId('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h2 className="text-2xl font-semibold text-gray-800">UPI Payment</h2>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Payment Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Complete Your Payment</h3>
          
          {paymentStatus === 'pending' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter UPI ID
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@paytm / yourname@gpay"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Payment Information</h4>
                <p className="text-sm text-blue-700">
                  You will be redirected to your UPI app to complete the payment of ₹{totals.totalAmount.toFixed(2)}
                </p>
              </div>

              <button
                onClick={handleUPIPayment}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Pay ₹{totals.totalAmount.toFixed(2)}
              </button>
            </div>
          )}

          {paymentStatus === 'processing' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Processing Payment</h4>
              <p className="text-gray-600">Please complete the payment in your UPI app</p>
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Do not close this page until payment is complete
                </p>
              </div>
            </div>
          )}

          {paymentStatus === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Payment Successful!</h4>
              <p className="text-gray-600 mb-6">Your order has been confirmed</p>
              <button
                onClick={() => window.location.href = '/my-orders'}
                className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
              >
                View Orders
              </button>
            </div>
          )}

          {paymentStatus === 'failed' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Payment Failed</h4>
              <p className="text-gray-600 mb-6">Something went wrong with your payment</p>
              <div className="space-y-3">
                <button
                  onClick={resetPayment}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={onBack}
                  className="w-full bg-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Choose Different Payment Method
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Order Summary */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h3>
          
          <div className="space-y-4 mb-6">
            {cartItems.slice(0, 3).map((item) => (
              <div key={`${item.product._id}-${item.selectedPricing?.quantity || 'default'}`} className="flex items-center space-x-3">
                <Image
                  width={100}
                  height={100}
                  src={item.product.image || '/placeholder-image.jpg'}
                  alt={item.product.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800 text-sm">{item.product.name}</h4>
                  <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold text-gray-800 text-sm">₹{(item.product.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
            
            {cartItems.length > 3 && (
              <p className="text-sm text-gray-600 text-center">
                +{cartItems.length - 3} more items
              </p>
            )}
          </div>

          <div className="space-y-3 text-sm border-t pt-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className={totals.shippingCost === 0 ? 'text-green-600' : ''}>
                {totals.shippingCost === 0 ? 'FREE' : `₹${totals.shippingCost}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Tax (GST 18%)</span>
              <span>₹{totals.tax.toFixed(2)}</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>₹{totals.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">Secure Payment</h4>
            <p className="text-xs text-gray-600">
  Your payment information is encrypted and secure. We don&#39;t store your UPI details.
</p>

          </div>
        </div>
      </div>
    </div>
  );
}