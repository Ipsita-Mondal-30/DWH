'use client';

import { useState,  useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { CartItem } from '@/hooks/useCart';
import { ShippingAddress } from './CheckoutPage';
import Image from 'next/image';

interface CheckoutFormProps {
  cartItems: CartItem[];
  totals: {
    subtotal: number;
    shippingCost: number;
    tax: number;
    totalAmount: number;
  };
  userEmail: string;
  userName: string;
  onBack: () => void;
  onPaymentMethodSelect: (method: 'cod' | 'upi') => void;
}

export default function CheckoutForm({ 
  cartItems, 
  totals, 
  userEmail, 
  userName, 
  onBack, 
  onPaymentMethodSelect 
}: CheckoutFormProps) {
  const [formData, setFormData] = useState<ShippingAddress & { email: string }>({
    fullName: userName,
    email: userEmail,
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  });
  interface OrderResult {
    _id: string;
    orderId: string; 
    userEmail: string;
    shippingAddress: {
      fullName: string;
      phone: string;
      addressLine1: string;
      addressLine2?: string;
      city: string;
      state: string;
      pincode: string;
      landmark?: string;
    };
    paymentMethod: 'cash_on_delivery' | 'upi';
    cartItems: {
      productId: string;
      quantity: number;
      selectedPricing: number; 
      product: number;
    }[];
    createdAt?: string;
    totalAmount: number;
    updatedAt?: string;
    estimatedDelivery?: string;
  }
  

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi' | ''>('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate totals with shipping logic
  const calculatedTotals = useMemo(() => {
    const subtotal = totals.subtotal;
    const shippingCost = subtotal >= 1000 ? 0 : 59;
    const tax = totals.tax;
    const totalAmount = subtotal + shippingCost + tax;
    
    return {
      subtotal,
      shippingCost,
      tax,
      totalAmount
    };
  }, [totals.subtotal, totals.tax]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePaymentMethodChange = (method: 'cod' | 'upi') => {
    setPaymentMethod(method);
    if (method === 'upi') {
      // Only call the parent handler if method is UPI
      onPaymentMethodSelect('upi');
    }
  };


  const isFormValid = useMemo(() => {
    // Check required fields without calling validateForm (to prevent infinite loop)
    const requiredFields = ['fullName', 'email', 'phone', 'addressLine1', 'city', 'state', 'pincode'];
    const hasAllRequiredFields = requiredFields.every(field => 
      formData[field as keyof typeof formData].trim() !== ''
    );
    
    return hasAllRequiredFields && paymentMethod;
  }, [formData, paymentMethod]);

  const placeOrder = async () => {
    if (!isFormValid || !paymentMethod) return;

    setIsPlacingOrder(true);

    try {
      const orderData = {
        userEmail: formData.email,
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          landmark: formData.landmark
        },
        paymentMethod: paymentMethod === 'cod' ? 'cash_on_delivery' : 'upi',
        cartItems: cartItems.map(item => ({
          productId: item.product._id,
          quantity: item.quantity,
          selectedPricing: item.selectedPricing,
          product: item.product // Include product details for the order
        }))
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setOrderResult(result.order);
        setShowSuccessModal(true);
      } else {
        alert('Failed to place order: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    window.location.href = '/my-orders'; // Redirect to orders page
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
        <h2 className="text-2xl font-semibold text-gray-800">Shipping Details</h2>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Delivery Information</h3>
          
          <div className="space-y-4">
            {/* Name and Email */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.fullName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter 10-digit mobile number"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Line 1 *
              </label>
              <input
                type="text"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleInputChange}
                placeholder="House no, Building name, Street"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.addressLine1 ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.addressLine1 && <p className="text-red-500 text-xs mt-1">{errors.addressLine1}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Line 2
              </label>
              <input
                type="text"
                name="addressLine2"
                value={formData.addressLine2}
                onChange={handleInputChange}
                placeholder="Area, Colony, Sector (Optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* City, State, Pincode */}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.city ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.state ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pincode *
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  placeholder="6-digit code"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.pincode ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
              </div>
            </div>

            {/* Landmark */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Landmark
              </label>
              <input
                type="text"
                name="landmark"
                value={formData.landmark}
                onChange={handleInputChange}
                placeholder="Nearby landmark (Optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Right Column - Order Summary & Payment */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h3>
            
            {/* Cart Items Preview */}
            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
              {cartItems.map((item, index) => (
                <div key={`${item.product._id}-${index}`} className="flex items-center space-x-3 py-2">
                  <Image
                    width={40}
                    height={40}
                    src={item.product.image || '/placeholder-image.jpg'}
                    alt={item.product.name}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-800 text-sm truncate">{item.product.name}</h4>
                    <p className="text-xs text-gray-600">
                      {item.selectedPricing ? 
                        `${item.selectedPricing.quantity}${item.selectedPricing.unit}` : 
                        item.product.size || 'Standard'
                      } × {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-800 text-sm">
                    ₹{(item.product.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            
            {/* Price Breakdown */}
            <div className="space-y-3 text-sm border-t pt-4">
              <div className="flex justify-between">
                <span>Subtotal ({cartItems.length} items)</span>
                <span>₹{calculatedTotals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className={calculatedTotals.shippingCost === 0 ? 'text-green-600' : ''}>
                  {calculatedTotals.shippingCost === 0 ? 'FREE' : `₹${calculatedTotals.shippingCost}`}
                </span>
              </div>
              {calculatedTotals.subtotal >= 1000 && calculatedTotals.shippingCost === 0 && (
                <div className="text-xs text-green-600">
                  🎉 You saved ₹59 on shipping!
                </div>
              )}
              {calculatedTotals.subtotal < 1000 && (
                <div className="text-xs text-blue-600">
                  Add ₹{(1000 - calculatedTotals.subtotal).toFixed(2)} more to get FREE shipping!
                </div>
              )}
              <div className="flex justify-between">
                <span>Tax (GST 18%)</span>
                <span>₹{calculatedTotals.tax.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>₹{calculatedTotals.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Payment Method</h3>
            
            <div className="space-y-3">
              {/* Cash on Delivery */}
              <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                paymentMethod === 'cod' 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => handlePaymentMethodChange('cod')}
                  className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                />
                <div className="ml-3">
                  <div className="font-medium text-gray-800">Cash on Delivery</div>
                  <div className="text-sm text-gray-600">Pay when your order arrives</div>
                </div>
                <div className="ml-auto">
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Recommended</span>
                </div>
              </label>

              {/* UPI Payment */}
              <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                paymentMethod === 'upi' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="upi"
                  checked={paymentMethod === 'upi'}
                  onChange={() => handlePaymentMethodChange('upi')}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <div className="ml-3">
                  <div className="font-medium text-gray-800">UPI Payment</div>
                  <div className="text-sm text-gray-600">Pay instantly using UPI</div>
                </div>
                <div className="ml-auto">
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Instant</span>
                </div>
              </label>
            </div>

            {!paymentMethod && (
              <p className="text-red-500 text-sm mt-2">Please select a payment method</p>
            )}
          </div>

          {/* Place Order Button */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <button
              onClick={placeOrder}
              disabled={!isFormValid || isPlacingOrder || paymentMethod === 'upi'}
              className={`w-full py-4 px-6 rounded-lg text-lg font-semibold transition-colors ${
                isFormValid && paymentMethod === 'cod' && !isPlacingOrder
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isPlacingOrder ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Placing Order...</span>
                </div>
              ) : (
                `Place Order - ₹${calculatedTotals.totalAmount.toFixed(2)}`
              )}
            </button>
            
            {paymentMethod === 'upi' && (
              <p className="text-sm text-blue-600 mt-2 text-center">
                Click to proceed to UPI payment →
              </p>
            )}

            {paymentMethod === 'cod' && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800 text-center">
                  ✓ No advance payment required. Pay when you receive your order.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                Order Placed Successfully!
              </h3>
              
              <p className="text-gray-600 mb-4">
                Your order has been confirmed and will be delivered soon.
              </p>
              
              {orderResult && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-semibold text-gray-800">{orderResult.orderId}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    Total Amount: ₹{orderResult.totalAmount}
                  </p>
                  <p className="text-sm text-gray-600">
                    Estimated Delivery: {orderResult.estimatedDelivery ? 
                      new Date(orderResult.estimatedDelivery).toLocaleDateString() : 
                      '7-10 business days'
                    }
                  </p>
                </div>
              )}
              
              <div className="space-y-3">
                <button
                  onClick={closeSuccessModal}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View My Orders
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}