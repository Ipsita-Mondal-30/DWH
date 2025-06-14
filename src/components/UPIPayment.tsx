'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Copy, CheckCircle } from 'lucide-react';
import { CartItem } from '@/hooks/useCart';
import Image from 'next/image';
import QRCode from 'qrcode';

interface UPIPaymentProps {
  cartItems: CartItem[];
  totals: {
    subtotal: number;
    shippingCost: number;
    tax: number;
    totalAmount: number;
  };
  onBack: () => void;
  onPaymentSuccess: () => void;
}

export default function UPIPayment({ cartItems, totals, onBack, onPaymentSuccess }: UPIPaymentProps) {
  const [paymentStep, setPaymentStep] = useState<'payment' | 'confirmation' | 'processing' | 'success'>('payment');
  const [customerUpiId, setCustomerUpiId] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');

  // ⚠️ CHANGE THESE VALUES TO YOUR BUSINESS DETAILS
  const businessUpiId = 'q305666833@ybl'; // Replace with your actual UPI ID
  const businessName = 'Delhi Wala Halwai'; // Replace with your business name
  const transactionNote = 'Order Payment from Website '; // Optional: Add transaction note
  
  // Generate UPI payment URL
  const generateUPIUrl = () => {
    const upiUrl = `upi://pay?pa=${businessUpiId}&pn=${encodeURIComponent(businessName)}&am=${totals.totalAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
    return upiUrl;
  };

  // Generate QR Code
  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const upiUrl = generateUPIUrl();
        const qrDataUrl = await QRCode.toDataURL(upiUrl, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        setQrCodeDataUrl(qrDataUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    generateQRCode();
  }, [totals.totalAmount]);

  const copyUpiId = () => {
    navigator.clipboard.writeText(businessUpiId);
    alert('UPI ID copied to clipboard!');
  };

  const copyAmount = () => {
    navigator.clipboard.writeText(totals.totalAmount.toFixed(2));
    alert('Amount copied to clipboard!');
  };

  const copyUPIUrl = () => {
    const upiUrl = generateUPIUrl();
    navigator.clipboard.writeText(upiUrl);
    alert('UPI payment link copied to clipboard!');
  };

  const handlePaymentMade = () => {
    if (!customerUpiId.trim()) {
      alert('Please enter your UPI ID for verification');
      return;
    }
    setPaymentStep('confirmation');
  };

  const confirmPayment = () => {
    if (!transactionId.trim()) {
      alert('Please enter the transaction ID');
      return;
    }
    setPaymentStep('processing');

    // Simulate order processing
    setTimeout(() => {
      setPaymentStep('success');
      onPaymentSuccess();
    }, 2000);
  };

  const resetPayment = () => {
    setPaymentStep('payment');
    setCustomerUpiId('');
    setTransactionId('');
  };

  const openUPIApp = () => {
    const upiUrl = generateUPIUrl();
    window.location.href = upiUrl;
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
        {/* Left Column - Payment Instructions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {paymentStep === 'payment' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Complete Your Payment</h3>
              
              {/* QR Code Section */}
              <div className="text-center bg-gray-50 rounded-lg p-6">
                <h4 className="font-medium text-gray-800 mb-4">Scan QR Code to Pay</h4>
                <div className="bg-white p-4 rounded-lg inline-block shadow-sm">
                  {qrCodeDataUrl ? (
                    <Image
                      src={qrCodeDataUrl}
                      alt="UPI QR Code"
                      width={300}
                      height={300}
                      className="mx-auto"
                    />
                  ) : (
                    <div className="bg-gray-200 w-72 h-72 flex items-center justify-center text-gray-500">
                      Generating QR Code...
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-3 mb-4">
                  Open any UPI app and scan this QR code
                </p>
                
                {/* Mobile-friendly UPI app buttons */}
                <div className="space-y-2">
                  <button
                    onClick={openUPIApp}
                    className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                  >
                    Open in UPI App 📱
                  </button>
                  <button
                    onClick={copyUPIUrl}
                    className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-gray-700 transition-colors"
                  >
                    Copy Payment Link
                  </button>
                </div>
              </div>

              {/* Manual Payment Details */}
              <div className="border-t pt-6">
                <h4 className="font-medium text-gray-800 mb-4">Or Pay Manually</h4>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">UPI ID:</span>
                      <button
                        onClick={copyUpiId}
                        className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
                      >
                        <Copy className="w-3 h-3" />
                        Copy
                      </button>
                    </div>
                    <p className="font-mono text-lg font-semibold text-gray-900">{businessUpiId}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Amount:</span>
                      <button
                        onClick={copyAmount}
                        className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
                      >
                        <Copy className="w-3 h-3" />
                        Copy
                      </button>
                    </div>
                    <p className="font-mono text-xl font-bold text-green-600">₹{totals.totalAmount.toFixed(2)}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Merchant Name:</span>
                    <p className="font-semibold text-gray-900">{businessName}</p>
                  </div>
                </div>
              </div>

              {/* Customer UPI ID Input */}
              <div className="border-t pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your UPI ID (for verification)
                </label>
                <input
                  type="text"
                  value={customerUpiId}
                  onChange={(e) => setCustomerUpiId(e.target.value)}
                  placeholder="yourname@paytm / yourname@gpay"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  We need this to verify your payment
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Payment Instructions</h4>
                <ol className="text-sm text-blue-700 space-y-1">
                  <li>1. Scan QR code or click "Open in UPI App"</li>
                  <li>2. Verify amount ₹{totals.totalAmount.toFixed(2)} and complete payment</li>
                  <li>3. Enter your UPI ID above for verification</li>
                  <li>4. Click "I have made the payment" below</li>
                  <li>5. Enter transaction ID to confirm order</li>
                </ol>
              </div>

              <button
                onClick={handlePaymentMade}
                disabled={!customerUpiId.trim()}
                className="w-full bg-green-600 text-white py-4 px-6 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                I have made the payment ✓
              </button>
            </div>
          )}

          {paymentStep === 'confirmation' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Confirm Your Payment</h3>
                <p className="text-gray-600">Please provide transaction details for verification</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Payment Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount Paid:</span>
                    <span className="font-semibold">₹{totals.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Your UPI ID:</span>
                    <span className="font-semibold">{customerUpiId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Paid to:</span>
                    <span className="font-semibold">{businessUpiId}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction ID / Reference Number
                </label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g., 123456789012"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Find this in your UPI app's transaction history
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={confirmPayment}
                  disabled={!transactionId.trim()}
                  className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Confirm & Place Order
                </button>
                <button
                  onClick={resetPayment}
                  className="w-full bg-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Back to Payment
                </button>
              </div>
            </div>
          )}

          {paymentStep === 'processing' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Processing Your Order</h4>
              <p className="text-gray-600">Please wait while we confirm your payment...</p>
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Do not close this page. We are verifying your transaction.
                </p>
              </div>
            </div>
          )}

          {paymentStep === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Order Placed Successfully!</h4>
              <p className="text-gray-600 mb-2">Transaction ID: {transactionId}</p>
              <p className="text-gray-600 mb-6">Your order is being processed and will be delivered soon.</p>
              <button
                onClick={() => window.location.href = '/my-orders'}
                className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
              >
                View My Orders
              </button>
            </div>
          )}
        </div>

        {/* Right Column - Order Summary */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h3>
          
          <div className="space-y-4 mb-6">
            {cartItems.slice(0, 3).map((item) => {
              const itemPrice = item.selectedPricing?.price || item.product.price || 0;
              return (
                <div key={`${item.product._id}-${item.selectedPricing?.quantity || 'default'}`} className="flex items-center space-x-3">
                  <Image
                    width={48}
                    height={48}
                    src={item.product.image || '/placeholder-image.jpg'}
                    alt={item.product.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800 text-sm">{item.product.name}</h4>
                    <p className="text-xs text-gray-600">
                      Qty: {item.quantity}
                      {item.selectedPricing && (
                        <span> • {item.selectedPricing.quantity}{item.selectedPricing.unit}</span>
                      )}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-800 text-sm">₹{(itemPrice * item.quantity).toFixed(2)}</p>
                </div>
              );
            })}
            
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
            <h4 className="font-medium text-gray-800 mb-2">Payment Security</h4>
            <p className="text-xs text-gray-600">
              Your payment is processed securely. We do not store your financial information.
            </p>
          </div>

          {paymentStep === 'payment' && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Need Help?</h4>
              <p className="text-xs text-blue-700">
                If you face any issues with payment, please contact our support team.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}