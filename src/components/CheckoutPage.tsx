'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import CartSummary from '@/components/CartSummary';
import CheckoutForm from '@/components/CheckOutForm';
import UPIPayment from '@/components/UPIPayment';

// Import shared types to ensure consistency
export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string; // Optional to match CheckoutForm
  city: string;
  state: string;
  pincode: string;
  landmark?: string; // Optional to match CheckoutForm
}

interface UPIPaymentData {
  userEmail: string;
  shippingAddress: ShippingAddress;
  totals: {
    subtotal: number;
    shippingCost: number;
    tax: number;
    totalAmount: number;
  };
}

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState<'cart' | 'form' | 'upi'>('cart');
  
  // State to store UPI payment data when user selects UPI
  const [upiPaymentData, setUpiPaymentData] = useState<UPIPaymentData | null>(null);
  
  const {
    cartItems,
    totals,
    error,
  } = useCart();

  // Debug logging
  useEffect(() => {
    console.log('🔍 Checkout Page State:', {
      step,
      cartItemsCount: cartItems?.length,
      totals,
      userEmail: session?.user?.email,
      userName: session?.user?.name,
      hasUpiData: !!upiPaymentData
    });
  }, [step, cartItems, totals, session, upiPaymentData]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const handleProceedToPay = () => {
    if (cartItems.length === 0) {
      console.warn('⚠️ Cannot proceed: Cart is empty');
      return;
    }
    console.log('📝 Proceeding to form step');
    setStep('form');
  };

  const handleBackToCart = () => {
    console.log('⬅️ Going back to cart');
    setStep('cart');
  };

  // Handle payment method selection from CheckoutForm
  // This signature must match exactly what CheckoutForm expects
  const handlePaymentMethodSelect = (method: 'upi' | 'cod', data?: UPIPaymentData | undefined) => {
    console.log('💳 Payment method selected:', method);
    console.log('📋 Data received:', data);
    
    if (method === 'upi') {
      // Validate that we have the required data for UPI payment
      if (!data || !data.userEmail || !data.shippingAddress || !data.totals) {
        console.error('❌ Missing required data for UPI payment:', data);
        alert('Missing required information for UPI payment. Please try again.');
        return;
      }
      
      console.log('✅ UPI data validation passed, storing data and proceeding to UPI');
      
      // Store the UPI payment data
      setUpiPaymentData(data);
      
      // Navigate to UPI payment step
      setStep('upi');
    } else if (method === 'cod') {
      // COD is handled within the CheckoutForm component
      console.log('💰 COD payment selected - handled in CheckoutForm');
    }
  };

  const handleBackToForm = () => {
    console.log('⬅️ Going back to form from UPI');
    setStep('form');
  };

  const handlePaymentSuccess = () => {
    console.log('🎉 Payment successful, redirecting to orders');
    router.push('/my-orders');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error loading cart</h2>
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

  // Additional validation before showing UPI component
  if (step === 'upi') {
    if (!upiPaymentData || !upiPaymentData.userEmail || !upiPaymentData.shippingAddress || cartItems.length === 0) {
      console.error('❌ Missing required data for UPI payment step:', {
        hasUpiData: !!upiPaymentData,
        hasUserEmail: !!upiPaymentData?.userEmail,
        hasShippingAddress: !!upiPaymentData?.shippingAddress,
        hasCartItems: cartItems.length > 0
      });
      
      // Go back to form if data is missing
      setStep('form');
      alert('Session data lost. Please complete the checkout form again.');
      return null;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>
        
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
        
        {step === 'upi' && upiPaymentData && (
          <UPIPayment
            cartItems={cartItems}
            totals={upiPaymentData.totals}
            userEmail={upiPaymentData.userEmail}
            shippingAddress={{
              // Ensure all required fields are present for UPIPayment component
              fullName: upiPaymentData.shippingAddress.fullName,
              phone: upiPaymentData.shippingAddress.phone,
              addressLine1: upiPaymentData.shippingAddress.addressLine1,
              addressLine2: upiPaymentData.shippingAddress.addressLine2 || '', // Convert undefined to empty string
              city: upiPaymentData.shippingAddress.city,
              state: upiPaymentData.shippingAddress.state,
              pincode: upiPaymentData.shippingAddress.pincode,
              landmark: upiPaymentData.shippingAddress.landmark || '', // Convert undefined to empty string
            }}
            onBack={handleBackToForm}
            onPaymentSuccess={handlePaymentSuccess}
          />
        )}
      </div>
    </div>
  );
}