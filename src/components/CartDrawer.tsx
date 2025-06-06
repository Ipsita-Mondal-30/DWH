'use client';
import { useCart } from '@/app/context/CartContext';
import { useProducts } from '@/hooks/useProducts';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  X, 
  Truck, 
  Trash2, 
  Minus, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  ShoppingBag,
  Clock
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ImprovedCartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, removeFromCart, updateQuantity, addToCart } = useCart();
  const { data: products = [] } = useProducts();
  const router = useRouter();
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Get suggested products from your database (excluding items already in cart)
  const cartProductIds = cart.map(item => item.product._id);
  const suggestedProducts = products
    .filter(product => !cartProductIds.includes(product._id))
    .slice(0, 5);
    const clearExpiredCartItems = useCallback(() => {
      cart.forEach(item => {
        if (item.product._id) {
          removeFromCart(item.product._id);
        }
      });
    }, [cart, removeFromCart]);

  // Initialize timer - persistent across page navigations
  useEffect(() => {
    const initializeTimer = () => {
      const savedEndTime = localStorage.getItem('cartTimerEndTime');
      const now = Date.now();
      
      if (savedEndTime) {
        const endTime = parseInt(savedEndTime);
        const remaining = Math.max(0, endTime - now);
        if (remaining > 0) {
          setTimeRemaining(remaining);
        } else {
          localStorage.removeItem('cartTimerEndTime');
          clearExpiredCartItems();
        }
      } else if (cart.length > 0) {
        const twentyMinutes = 20 * 60 * 1000;
        const endTime = now + twentyMinutes;
        localStorage.setItem('cartTimerEndTime', endTime.toString());
        setTimeRemaining(twentyMinutes);
      }
    };

    initializeTimer();
  }, [cart.length ,clearExpiredCartItems]);

  

  // Timer countdown effect
  useEffect(() => {
    if (timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1000;
        if (newTime <= 0) {
          localStorage.removeItem('cartTimerEndTime');
          clearExpiredCartItems();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining, clearExpiredCartItems]);

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    try {
      if (newQuantity < 1) {
        await removeFromCart(productId);
      } else {
        await updateQuantity(productId, newQuantity);
      }
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  const handleAddSuggestedProduct = async (productId: string) => {
    try {
      await addToCart(productId, 1);
      const twentyMinutes = 20 * 60 * 1000;
      const endTime = Date.now() + twentyMinutes;
      localStorage.setItem('cartTimerEndTime', endTime.toString());
      setTimeRemaining(twentyMinutes);
    } catch (error) {
      console.error('Error adding product to cart:', error);
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const total = calculateTotal();
  const freeShippingThreshold = 799;
  const hasEligibleShipping = total >= freeShippingThreshold;
  const amountForFreeShipping = freeShippingThreshold - total;

  const nextSlide = () => {
    if (suggestedProducts.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % suggestedProducts.length);
    }
  };

  const prevSlide = () => {
    if (suggestedProducts.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + suggestedProducts.length) % suggestedProducts.length);
    }
  };

  const handleContinueShopping = () => {
    onClose();
    router.push('/');
  };

  const handleCheckout = () => {
    onClose();
    router.push('/checkout');
  };

  // Close drawer when clicking outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      {/* Blurred Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 backdrop-blur-sm bg-black/20 transition-all duration-300"
          onClick={handleBackdropClick}
        />
      )}
      
      {/* Cart Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 transform transition-all duration-300 ease-in-out shadow-2xl ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex-shrink-0 p-6 border-b border-gray-100 bg-white">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-orange-500" />
                <h2 className="text-xl font-semibold text-gray-800">
                  Your Cart ({cart.length})
                </h2>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            {/* Timer Section */}
            {timeRemaining > 0 && cart.length > 0 && (
              <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-orange-700">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Reserved for {formatTime(timeRemaining)}
                  </span>
                </div>
                <p className="text-xs text-orange-600 mt-1">
                  Complete your purchase before time runs out!
                </p>
              </div>
            )}
            
            {/* Free Shipping Progress */}
            {cart.length > 0 && (
              <div className="space-y-3">
                {hasEligibleShipping ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-green-700">
                      <Truck className="h-4 w-4" />
                      <span className="text-sm font-medium">Free Shipping Unlocked!</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">
                        Add ₹{amountForFreeShipping.toFixed(2)} for free shipping
                      </span>
                      <span className="text-xs text-gray-500">
                        ₹{freeShippingThreshold}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-orange-400 to-orange-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min((total / freeShippingThreshold) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cart Items - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <ShoppingBag className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-500 mb-6">Discover our amazing products and start shopping!</p>
                <button 
                  onClick={handleContinueShopping}
                  className="bg-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="p-4">
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.product._id} className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                      <div className="flex gap-4">
                        <div className="relative flex-shrink-0">
                          <Image
                            src={item.product.image || '/api/placeholder/80/80'}
                            alt={item.product.name}
                            width={80}
                            height={80}
                            className="rounded-lg object-cover"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 text-sm leading-tight">
                                {item.product.name}
                              </h3>
                              <p className="text-xs text-gray-500 mt-1">Weight: 400g</p>
                            </div>
                            <button 
                              onClick={() => item.product._id && removeFromCart(item.product._id)} 
                              className="p-1 hover:bg-red-50 rounded-full transition-colors group ml-2"
                              aria-label="Remove item"
                            >
                              <Trash2 className="h-4 w-4 text-gray-400 group-hover:text-red-500" />
                            </button>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-gray-900">
                              ₹{(item.product?.price ?? 0).toFixed(2)}
                            </p>
                            
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-3">
                              <button
                                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                                onClick={() => item.product._id && handleQuantityChange(item.product._id, item.quantity - 1)}
                                aria-label="Decrease quantity"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="text-sm font-medium min-w-[24px] text-center">{item.quantity}</span>
                              <button
                                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                                onClick={() => item.product._id && handleQuantityChange(item.product._id, item.quantity + 1)}
                                aria-label="Increase quantity"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Suggestions Section */}
          {suggestedProducts.length > 0 && (
            <div className="flex-shrink-0 border-t border-gray-100 bg-gray-50 p-4">
              <h3 className="text-sm font-medium text-gray-800 mb-3">You might also like</h3>
              <div className="relative">
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <Image
                      src={suggestedProducts[currentSlide]?.image || '/api/placeholder/50/50'}
                      alt={suggestedProducts[currentSlide]?.name || 'Product'}
                      width={50}
                      height={50}
                      className="rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-800 truncate">
                        {suggestedProducts[currentSlide]?.name}
                      </h4>
                      <span className="text-sm font-semibold text-gray-900">
                        ₹{suggestedProducts[currentSlide]?.price?.toFixed(2) ?? 'N/A'}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {suggestedProducts[currentSlide]?.type || 'Product'}
                      </p>
                    </div>
                    <button 
                      className="bg-orange-500 text-white p-2 rounded-lg hover:bg-orange-600 transition-colors flex-shrink-0"
                      onClick={() => handleAddSuggestedProduct(suggestedProducts[currentSlide]._id)}
                      aria-label="Add to cart"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {/* Slider Navigation */}
                {suggestedProducts.length > 1 && (
                  <div className="flex justify-between items-center mt-3">
                    <button 
                      onClick={prevSlide} 
                      className="p-1 hover:bg-white rounded-full transition-colors"
                      aria-label="Previous product"
                    >
                      <ChevronLeft className="h-4 w-4 text-gray-600" />
                    </button>
                    <div className="flex gap-1">
                      {suggestedProducts.map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentSlide ? 'bg-orange-500' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <button 
                      onClick={nextSlide} 
                      className="p-1 hover:bg-white rounded-full transition-colors"
                      aria-label="Next product"
                    >
                      <ChevronRight className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex-shrink-0 p-6 border-t border-gray-100 bg-white">
            {cart.length > 0 && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-medium text-gray-800">Total:</span>
                  <span className="text-2xl font-bold text-gray-900">₹{total.toFixed(2)}</span>
                </div>
                
                <button 
                  className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors mb-4 flex items-center justify-center gap-2"
                  onClick={handleCheckout}
                >
                  <ShoppingBag className="h-4 w-4" />
                  Proceed to Checkout
                </button>
              </>
            )}
            
            <button 
              className="w-full text-orange-500 text-sm font-medium hover:text-orange-600 transition-colors"
              onClick={handleContinueShopping}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </>
  );
}