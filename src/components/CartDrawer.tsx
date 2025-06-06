'use client';
import { useCart } from '@/app/context/CartContext';
import { useProducts } from '@/hooks/useProducts';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FiX, FiTruck, FiTrash2, FiMinus, FiPlus, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useState, useEffect, useCallback } from 'react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, removeFromCart, updateQuantity, addToCart } = useCart();
  const { data: products = [] } = useProducts();
  const router = useRouter();
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Get suggested products from your database (excluding items already in cart)
  const cartProductIds = cart.map(item => item.product._id);
  const suggestedProducts = products
    .filter(product => !cartProductIds.includes(product._id))
    .slice(0, 5); // Show up to 5 suggestions

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
          // Timer expired, clear cart items that are older than 20 minutes
          localStorage.removeItem('cartTimerEndTime');
          clearExpiredCartItems();
        }
      } else if (cart.length > 0) {
        // Start new timer when items are in cart
        const twentyMinutes = 20 * 60 * 1000;
        const endTime = now + twentyMinutes;
        localStorage.setItem('cartTimerEndTime', endTime.toString());
        setTimeRemaining(twentyMinutes);
      }
    };

    initializeTimer();
  }, [cart.length]);

  // Clear expired cart items
  const clearExpiredCartItems = useCallback(() => {
    cart.forEach(item => {
      if (item.product._id) {
        removeFromCart(item.product._id);
      }
    });
  }, [cart, removeFromCart]);

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

  // Format time as MM:SS
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
      // Restart timer when new item is added
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
    // Add checkout logic here
    router.push('/checkout');
  };

  return (
    <>
      {/* Light Overlay - Only slightly dim the background */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-10 z-20"
          onClick={onClose}
        />
      )}
      
      {/* Cart Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-white z-30 transform transition-transform duration-300 shadow-2xl ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b bg-white flex-shrink-0">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-gray-800">Your cart({cart.length})</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
                <FiX className="text-xl" />
              </button>
            </div>
            
            {/* Timer Section */}
            {timeRemaining > 0 && cart.length > 0 && (
              <div className="bg-gradient-to-r from-orange-400 to-orange-500 text-white p-3 rounded-lg text-center mb-3">
                <p className="text-sm font-medium">
                  Your products are reserved for {formatTime(timeRemaining)} minutes!
                </p>
              </div>
            )}
            
            {/* Free Shipping Section */}
            {cart.length > 0 && (
              <div className="text-center">
                {hasEligibleShipping ? (
                  <>
                    <p className="text-sm text-green-600 font-medium mb-2">
                      Congrats! You have achieved Free Shipping
                    </p>
                    <div className="flex justify-center">
                      <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1">
                        <FiTruck className="text-xs" />
                        Free Shipping
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-600 mb-2">
                      You are Rs. {amountForFreeShipping.toFixed(2)} away from Free Shipping
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className="bg-orange-400 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${Math.min((total / freeShippingThreshold) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Cart Items - Scrollable */}
          <div className="flex-1 overflow-y-auto px-4 py-2">
            {cart.length === 0 ? (
              <div className="text-center mt-10">
                <p className="text-gray-600 mb-4">Your cart is empty</p>
                <button 
                  onClick={handleContinueShopping}
                  className="text-orange-500 font-medium hover:underline"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.product._id} className="bg-gray-50 rounded-lg p-3 border hover:shadow-sm transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Image
                          src={item.product.image || '/api/placeholder/60/60'}
                          alt={item.product.name}
                          width={60}
                          height={60}
                          className="rounded-lg object-cover flex-shrink-0"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-800 text-sm truncate">{item.product.name}</h3>
                            <p className="text-xs text-gray-500">Weight: 400g</p>
                          </div>
                          <button 
                            onClick={() => item.product._id && removeFromCart(item.product._id)} 
                            className="text-gray-400 hover:text-red-500 ml-2 flex-shrink-0 p-1"
                            aria-label="Remove item"
                          >
                            <FiTrash2 className="text-sm" />
                          </button>
                        </div>
                        
                        <p className="font-semibold text-gray-800 mb-2">
  Rs. {(item.product?.price ?? 0).toFixed(2)}
</p>

                        
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <button
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                            onClick={() => item.product._id && handleQuantityChange(item.product._id, item.quantity - 1)}
                            aria-label="Decrease quantity"
                          >
                            <FiMinus className="text-xs" />
                          </button>
                          <span className="text-sm font-medium min-w-[20px] text-center">{item.quantity}</span>
                          <button
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                            onClick={() => item.product._id && handleQuantityChange(item.product._id, item.quantity + 1)}
                            aria-label="Increase quantity"
                          >
                            <FiPlus className="text-xs" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* You may also like Section */}
          {suggestedProducts.length > 0 && (
            <div className="border-t bg-gray-50 p-4 flex-shrink-0">
              <h3 className="text-sm font-medium text-gray-800 mb-3 italic">You may also like</h3>
              <div className="relative">
                <div className="bg-white rounded-lg p-3 shadow-sm border">
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
                      <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-semibold text-gray-800">
  Rs. {(suggestedProducts[currentSlide] && 'price' in suggestedProducts[currentSlide] ? (suggestedProducts[currentSlide] as any).price.toFixed(2) : 'N/A')}
</span>

                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {suggestedProducts[currentSlide]?.type || 'Sweet'}
                      </p>
                    </div>
                    <button 
                      className="bg-orange-400 text-white p-2 rounded-lg hover:bg-orange-500 transition-colors flex-shrink-0"
                      onClick={() => handleAddSuggestedProduct(suggestedProducts[currentSlide]._id)}
                      aria-label="Add to cart"
                    >
                      <FiPlus className="text-sm" />
                    </button>
                  </div>
                </div>
                
                {/* Slider Navigation */}
                {suggestedProducts.length > 1 && (
                  <div className="flex justify-between items-center mt-3">
                    <button 
                      onClick={prevSlide} 
                      className="text-gray-400 hover:text-gray-600 p-1"
                      aria-label="Previous product"
                    >
                      <FiChevronLeft className="text-lg" />
                    </button>
                    <div className="flex gap-1">
                      {suggestedProducts.map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentSlide ? 'bg-orange-400' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <button 
                      onClick={nextSlide} 
                      className="text-gray-400 hover:text-gray-600 p-1"
                      aria-label="Next product"
                    >
                      <FiChevronRight className="text-lg" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="p-4 border-t bg-white flex-shrink-0">
            {cart.length > 0 && (
              <>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium text-gray-800">Total:</span>
                  <span className="font-bold text-lg text-gray-800">Rs. {total.toFixed(2)}</span>
                </div>
                
                <button 
                  className="w-full bg-orange-400 text-white py-3 rounded-lg font-medium hover:bg-orange-500 transition-colors mb-3"
                  onClick={handleCheckout}
                >
                  Checkout
                </button>
                
                {/* Payment Icons */}
                <div className="flex justify-center items-center gap-2 mb-3">
                  <div className="w-8 h-5 bg-purple-600 rounded text-xs flex items-center justify-center text-white font-bold">PT</div>
                  <div className="w-8 h-5 bg-blue-500 rounded text-xs flex items-center justify-center text-white font-bold">GP</div>
                  <div className="w-8 h-5 bg-blue-600 rounded text-xs flex items-center justify-center text-white font-bold">V</div>
                  <div className="w-8 h-5 bg-red-500 rounded text-xs flex items-center justify-center text-white font-bold">M</div>
                  <div className="w-8 h-5 bg-black rounded text-xs flex items-center justify-center text-white font-bold">AP</div>
                  <div className="w-8 h-5 bg-blue-700 rounded text-xs flex items-center justify-center text-white font-bold">PP</div>
                </div>
              </>
            )}
            
            <button 
              className="w-full text-orange-500 text-sm font-medium hover:underline"
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