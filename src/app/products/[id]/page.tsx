"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { signIn, useSession } from 'next-auth/react';
import Image from 'next/image';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import SignInPopup from '@/components/SigninPopup';

// Define the pricing interface to match your cart system
interface Pricing {
  quantity: number;
  unit: 'gm' | 'kg' | 'piece' | 'dozen';
  price: number;
  _id?: string;
}

// Interface for both Product and Namkeen (they have the same structure)
interface ProductItem {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  type?: string;
  pricing?: Pricing[];
  price?: number; // fallback for legacy products
}

export default function ProductPage() {
  const params = useParams();
  const [product, setProduct] = useState<ProductItem | null>(null);
  const [showSignInPopup, setShowSignInPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPricing, setSelectedPricing] = useState<Pricing | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [productType, setProductType] = useState<'product' | 'namkeen' | 'bhaji' | null>(null);

  const { addToCart } = useCart();
  const { status } = useSession();
  const productId = params.id as string;

  // Mock multiple images for carousel (you can replace with actual multiple images from your product data)
  const productImages = [
    product?.image || "/placeholder-image.jpg",
    // Add more images if your product model supports multiple images
  ];

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        console.log('Fetching product with ID:', productId);
        setLoading(true);
        
        // First try to fetch from /api/product
        let response = await fetch(`/api/product/${productId}`);
        let productData = null;
        let fetchedType: 'product' | 'namkeen' | 'bhaji' = 'product';
        
        if (response.ok) {
          productData = await response.json();
          fetchedType = 'product';
        } else if (response.status === 404) {
          // If not found in products, try namkeens
          console.log('Product not found in /api/product, trying /api/namkeen');
          response = await fetch(`/api/namkeen/${productId}`);
          
          if (response.ok) {
            productData = await response.json();
            fetchedType = 'namkeen';
          } else if (response.status === 404) {
            // If not found in namkeens, try bhaji boxes
            console.log('Product not found in /api/namkeen, trying /api/box');
            response = await fetch(`/api/box/${productId}`);
            
            if (response.ok) {
              productData = await response.json();
              fetchedType = 'bhaji';
            } else {
              throw new Error(`Product not found in products, namkeens, or bhaji boxes. Status: ${response.status}`);
            }
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        console.log(`${fetchedType} data received:`, productData);
        setProduct(productData);
        setProductType(fetchedType);
        
        // Set default selected pricing if available
        if (productData.pricing && productData.pricing.length > 0) {
          setSelectedPricing(productData.pricing[0]);
        } else if (productData.price && fetchedType === 'bhaji') {
          // For bhaji boxes, create a default pricing structure
          setSelectedPricing({
            quantity: 1,
            unit: 'piece',
            price: productData.price
          });
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch product');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  // Auto-hide success toast after 4 seconds
  useEffect(() => {
    if (showSuccessToast) {
      const timer = setTimeout(() => {
        setShowSuccessToast(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessToast]);

  const handleAddToCart = async () => {
    // Check if user is authenticated
    if (status === "unauthenticated") {
      setShowSignInPopup(true);
      setShowSignInPopup(true);
      return;
    }

    if (!product) return;

    try {
      setAddingToCart(true);
      
      // Use the selected pricing or default pricing
      let pricingToUse = selectedPricing;
      
      // For bhaji boxes, if no pricing structure exists, create one from the price
      if (!pricingToUse && productType === 'bhaji' && product.price) {
        pricingToUse = {
          quantity: 1,
          unit: 'piece' as const,
          price: product.price
        };
      } else if (!pricingToUse && product.pricing && product.pricing.length > 0) {
        pricingToUse = product.pricing[0];
      }
      
      console.log('Adding to cart:', {
        productId: product._id,
        quantity,
        selectedPricing: pricingToUse,
        productType
      });

      await addToCart(product._id, quantity, pricingToUse ? { ...pricingToUse, unit: pricingToUse.unit as 'gm' | 'kg' | 'piece' | 'dozen' } : undefined);
      
      // Show success toast instead of alert
      setShowSuccessToast(true);
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add product to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleSignIn = () => {
    // Trigger Google sign-in using NextAuth
    signIn('google', { 
      callbackUrl: window.location.href // Redirect back to current page after sign-in
    });
  };
  
  const handlePricingChange = (pricing: Pricing) => {
    setSelectedPricing(pricing);
  };

  const getCurrentPrice = () => {
    if (selectedPricing) {
      return selectedPricing.price;
    }
    if (product?.pricing && product.pricing.length > 0) {
      return product.pricing[0].price;
    }
    return product?.price || 0;
  };

  const getOriginalPrice = () => {
    const currentPrice = getCurrentPrice();
    return Math.round(currentPrice * 1.2);
  };

  const getDiscountPercentage = () => {
    const currentPrice = getCurrentPrice();
    const originalPrice = getOriginalPrice();
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  // Check if product is popular (you can modify this logic based on your criteria)
  const isPopular = product?.type === 'popular' || product?.type === 'latest';

  // Get product type display name
  const getProductTypeDisplay = () => {
    if (productType === 'namkeen') return 'Namkeen';
    if (productType === 'bhaji') return 'Bhaji Box';
    return 'Product';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-2">{error || 'The product you are looking for does not exist.'}</p>
          <Link 
            href="/"
            className="inline-flex items-center text-orange-600 hover:text-orange-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link 
            href="/"
            className="inline-flex items-center text-orange-600 hover:text-orange-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Product Image Section */}
            <div className="p-8">
              <div className="relative">
                {/* Main Image */}
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 relative">
                  <Image
                    src={productImages[currentImageIndex]}
                    alt={product.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                  
                  {/* Image Navigation - Only show if multiple images */}
                  {productImages.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                      >
                        <ChevronLeft className="h-5 w-5 text-gray-600" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                      >
                        <ChevronRight className="h-5 w-5 text-gray-600" />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnail Images - Only show if multiple images */}
                {productImages.length > 1 && (
                  <div className="flex gap-2 mt-4 justify-center">
                    {productImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                          currentImageIndex === index ? 'border-orange-500' : 'border-gray-200'
                        }`}
                      >
                        <Image
                          src={productImages[index]}
                          alt={`${product.name} view ${index + 1}`}
                          width={64}
                          height={64}
                          className="object-cover w-full h-full"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Product Details Section */}
            <div className="p-8 flex flex-col">
              {/* Product Type Badge */}
              {productType && (
                <div className="mb-2">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    productType === 'namkeen' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : productType === 'bhaji'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {getProductTypeDisplay()}
                  </span>
                </div>
              )}

              {/* Product Name */}
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                {product.name}
              </h1>

              {/* Selling Fast Badge - Only for popular products */}
              {isPopular && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-red-500">⚡</span>
                  <span className="text-sm text-gray-600">
                    Selling fast! 10 people have this in their carts.
                  </span>
                </div>
              )}

              {/* Price Section */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl font-bold text-gray-800">
                    Rs. {getCurrentPrice()}.00
                  </span>
                  <span className="text-lg text-gray-500 line-through">
                    Rs. {getOriginalPrice()}.00
                  </span>
                  <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
                    {getDiscountPercentage()}% OFF
                  </span>
                </div>
                <p className="text-sm text-gray-600">Inclusive of all Taxes</p>
              </div>

              {/* Weight/Size Options */}
              {product.pricing && product.pricing.length > 0 && (
                <div className="mb-6">
                  <div className="mb-3">
                    <span className="text-gray-700 font-medium">Weight: </span>
                    <span className="font-semibold">
                      {selectedPricing ? `${selectedPricing.quantity} ${selectedPricing.unit.toUpperCase()}` : `${product.pricing[0].quantity} ${product.pricing[0].unit.toUpperCase()}`}
                    </span>
                  </div>
                  
                  {product.pricing.length > 1 && (
                    <div className="flex gap-2 flex-wrap">
                      {product.pricing.map((pricing, index) => (
                        <button
                          key={index}
                          onClick={() => handlePricingChange({ ...pricing, unit: pricing.unit as 'gm' | 'kg' | 'piece' | 'dozen' })}
                          className={`px-4 py-2 rounded-full border-2 transition-colors ${
                            selectedPricing && 
                            selectedPricing.quantity === pricing.quantity && 
                            selectedPricing.unit === pricing.unit
                              ? 'bg-orange-100 border-orange-300 text-orange-700'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {pricing.quantity} {pricing.unit}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* For bhaji boxes, show unit type */}
              {productType === 'bhaji' && (!product.pricing || product.pricing.length === 0) && (
                <div className="mb-6">
                  <div className="mb-3">
                    <span className="text-gray-700 font-medium">Unit: </span>
                    <span className="font-semibold">1 PIECE</span>
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mb-8">
                <span className="text-gray-700 font-medium mb-3 block">Quantity</span>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors text-gray-600 font-medium"
                  >
                    −
                  </button>
                  <span className="text-lg font-semibold w-8 text-center">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors text-gray-600 font-medium"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <div className="mt-auto">
                <button 
                  onClick={handleAddToCart}
                  disabled={addingToCart || status === "loading"}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${
                    addingToCart || status === "loading"
                      ? 'bg-gray-400 cursor-not-allowed'
                      : status === "unauthenticated"
                      ? 'bg-yellow-500 hover:bg-yellow-600'
                      : 'bg-orange-500 hover:bg-orange-600 hover:shadow-lg transform hover:-translate-y-0.5'
                  } text-white`}
                >
                  {addingToCart 
                    ? 'Adding to Cart...' 
                    : status === "unauthenticated"
                    ? 'Sign in to Add to Cart'
                    : 'Add to Cart'
                  }
                </button>
              </div>

              {/* Authentication Status */}
              {status === "unauthenticated" && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    Please sign in to add items to your cart
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Product Description */}
          {product.description && (
            <div className="px-8 pb-8">
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Description</h3>
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Success Toast Notification */}
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
          <div className="bg-white border border-green-200 rounded-lg shadow-lg p-4 max-w-sm w-full">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Added to Cart!
                  </h3>
                  <button
                    onClick={() => setShowSuccessToast(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {product?.name} ({quantity} {quantity > 1 ? 'items' : 'item'}) 
                  {selectedPricing && ` - ${selectedPricing.quantity}${selectedPricing.unit}`}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-medium text-green-600">
                    ₹{(getCurrentPrice() * quantity).toFixed(2)}
                  </span>
                  <button 
                    onClick={() => {
                      setShowSuccessToast(false);
                    }}
                    className="text-xs bg-green-600 text-white px-3 py-1 rounded-full hover:bg-green-700 transition-colors"
                  >
                    View Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login Prompt Modal */}
      {showSignInPopup && (
        <SignInPopup 
          isOpen={showSignInPopup}
          onClose={() => setShowSignInPopup(false)}
          onSignIn={handleSignIn}
        />
      )}
    </div>
  );
}