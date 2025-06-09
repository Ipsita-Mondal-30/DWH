'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import CartSummary from '@/components/CartSummary';
import CheckoutForm from '@/components/CheckOutForm';
import UPIPayment from '@/components/UPIPayment';

export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
}

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState<'cart' | 'form' | 'upi'>('cart');
  const { 
    cartItems, 
    totals, 
    isLoading, 
    error, 
  } = useCart();

  // Debug logging (can be removed in production)
  console.log('🚀 Checkout Page - Items:', cartItems.length, 'Loading:', isLoading);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const handleProceedToPay = () => {
    if (cartItems.length === 0) {
      return;
    }
    setStep('form');
  };

  const handleBackToCart = () => {
    setStep('cart');
  };

  const handlePaymentMethodSelect = (method: 'cod' | 'upi') => {
    if (method === 'upi') {
      setStep('upi');
    }
    // COD handling is done in CheckoutForm component
  };

  const handleBackToForm = () => {
    setStep('form');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null; // Will redirect
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading cart</p>
          <button 
            onClick={() => router.push('/cart')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
        
        {step === 'cart' && (
          <CartSummary 
            cartItems={cartItems}
            totals={totals}
            onProceedToPay={handleProceedToPay}
          />
        )}
        
        {step === 'form' && (
          <CheckoutForm 
            cartItems={cartItems}
            totals={totals}
            userEmail={session?.user?.email || ''}
            userName={session?.user?.name || ''}
            onBack={handleBackToCart}
            onPaymentMethodSelect={handlePaymentMethodSelect}
          />
        )}
        
        {step === 'upi' && (
          <UPIPayment 
            cartItems={cartItems}
            totals={totals}
            onBack={handleBackToForm}
          />
        )}
      </div>
    </div>
  );
}