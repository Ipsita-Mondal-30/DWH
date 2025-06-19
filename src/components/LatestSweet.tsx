'use client';

import { useEffect, useMemo, useState } from "react";
import { useSession, signIn } from 'next-auth/react';
import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from 'lucide-react';
import { useCart } from '../app/context/CartContext';
import { useProducts } from "../hooks/useProducts"; // Assuming this is the correct path
import SignInPopup from './SigninPopup';
import { toast } from 'sonner';

interface Pricing {
  quantity: number;
  unit: 'gm' | 'kg' | 'piece' | 'dozen';
  price: number;
  _id?: string;
}
// interface Product {
//   _id: string;
//   name: string;
//   description: string;
//   type: string;
//   image?: string;
//   pricing: Pricing[];
// }


  interface Product {
    _id?: string;
    name: string;
    description: string;
    type: string;
    image?: string;
    pricing: Pricing[];
  }


export default function LatestSweet() {
  const { data: session, status } = useSession();
  const { addToCart } = useCart();
  const { data: items = [], isLoading, error } = useProducts();

  const [selectedPricing, setSelectedPricing] = useState<{ [key: string]: Pricing }>({});
  const [dropdownOpen, setDropdownOpen] = useState<{ [key: string]: boolean }>({});
  const [showSignInPopup, setShowSignInPopup] = useState(false);

  const latestItems = useMemo(() => {
    return items.filter(p => p.type === "latest").slice(0, 3);
  }, [items]);

  useEffect(() => {
    const defaultPricing: { [key: string]: Pricing } = {};
    latestItems.forEach((product) => {
      if (product._id && product.pricing && product.pricing.length > 0) {
        defaultPricing[product._id] = product.pricing[0];
      }
    });
    setSelectedPricing(defaultPricing);
  }, [latestItems]);
  

  const handlePricingSelect = (productId: string, pricing: Pricing) => {
    setSelectedPricing(prev => ({ ...prev, [productId]: pricing }));
    setDropdownOpen(prev => ({ ...prev, [productId]: false }));
  };

  const toggleDropdown = (productId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDropdownOpen(prev => ({ ...prev, [productId]: !prev[productId] }));
  };
  

  const handleAddToCart = async (item: Product) => {
    if (!item._id) return;

    const selected = selectedPricing[item._id];

    // Check if user is authenticated
    if (!session) {
      console.log("User is not logged in - showing popup");
      setShowSignInPopup(true);
      return;
    }
    
    try {
      console.log('Adding to cart:', { itemId: item._id, selected }); // Debug log
      // Pass the selected pricing to the cart
      await addToCart(item._id, 1, selected);
      console.log('Successfully added to cart'); // Debug log
      
      // Show success toast
      toast.success(
        `${item.name} (${selected.quantity}${getUnitDisplay(selected.unit)}) added to cart!`,
        {
          description: `₹${selected.price}`,
          duration: 3000,
        }
      );
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add item to cart. Please try again.");
    }
  };
  

  const handleSignIn = () => {
    signIn('google', { callbackUrl: window.location.href });
  };

  const getUnitDisplay = (unit: string) => {
    const unitMap = {
      'gm': 'g',
      'kg': 'kg',
      'piece': 'pc',
      'dozen': 'dz'
    };
    return unitMap[unit as keyof typeof unitMap] || unit;
  };

  if (isLoading || (status !== "authenticated" && status !== "unauthenticated")) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500">Error loading products.</p>;
  }

  return (
    <div className="py-12 bg-gradient-to-br from-orange-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Latest Sweets</h2>
          <div className="w-24 h-1 bg-orange-500 mx-auto rounded-full"></div>
        </div>

        <div className="flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl">
            {latestItems.map((item) => {
              const itemId = item._id || '';
              const selected = selectedPricing[itemId];
              const isDropdownOpen = dropdownOpen[itemId];
              const hasPricingOptions = item.pricing && item.pricing.length > 0;

              return (
                <div
                  key={item._id}
                  className="bg-white rounded-2xl shadow-lg overflow-visible hover:shadow-2xl transition-all duration-300 border border-orange-100 transform hover:-translate-y-1"
                  style={{ zIndex: isDropdownOpen ? 1000 : 1 }}
                >
                  <div className="relative h-56 w-full overflow-hidden bg-gradient-to-br from-orange-100 to-orange-50">
                    <Image
                      src={item.image || "/placeholder-image.jpg"}
                      alt={item.name}
                      fill
                      className="object-cover hover:scale-110 transition-transform duration-500"
                    />
                    {item.type && (
                      <div className="absolute top-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                        {item.type.toUpperCase()}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-white to-orange-50/30">
                    <h3 className="font-bold text-xl mb-3 text-gray-800 text-center line-clamp-1">{item.name}</h3>
                    <p className="text-gray-600 text-sm mb-6 text-center line-clamp-2">{item.description}</p>

                    {hasPricingOptions ? (
                      <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">Select Size & Price:</label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => toggleDropdown(itemId, e)}
                            className="w-full flex items-center justify-between p-4 border-2 border-orange-200 rounded-xl hover:border-orange-400 focus:outline-none bg-white shadow-sm"
                          >
                            <div className="flex flex-col items-start">
                              {selected ? (
                                <>
                                  <span className="text-sm font-semibold text-gray-800">{selected.quantity}{getUnitDisplay(selected.unit)}</span>
                                  <span className="text-xl font-bold text-orange-600">₹{selected.price}</span>
                                </>
                              ) : (
                                <span className="text-gray-500 font-medium">Select option</span>
                              )}
                            </div>
                            <ChevronDown className={`h-5 w-5 text-orange-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                          </button>

                          {isDropdownOpen && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-orange-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto z-50">
                              {item.pricing.map((pricing: Pricing, index: number) => (
                              <button
                                key={index}
                                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handlePricingSelect(itemId, pricing);
                                }}
                                className={`w-full flex items-center justify-between p-4 hover:bg-orange-50 transition-colors border-b border-orange-100 last:border-b-0 ${
                                selected?.quantity === pricing.quantity &&
                                selected?.unit === pricing.unit &&
                                selected?.price === pricing.price
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'text-gray-700'
                                }`}
                              >
                                <div className="flex flex-col items-start">
                                <span className="font-semibold text-base">{pricing.quantity}{getUnitDisplay(pricing.unit)}</span>
                                <span className="text-sm text-gray-500">Per {pricing.unit}</span>
                                </div>
                                <span className="font-bold text-orange-600 text-lg">₹{pricing.price}</span>
                              </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="mb-6 text-center">
                        <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                          <span className="text-2xl font-bold text-orange-600">
                            {item.pricing?.[0]?.price ? `₹${item.pricing[0].price}` : 'Price not available'}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-center">
                      <button
                        type="button"
                        className={`w-full max-w-xs py-4 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg ${
                          (!hasPricingOptions || selected)
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transform hover:-translate-y-1 hover:scale-105'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        onClick={() => handleAddToCart(item)}
                        disabled={hasPricingOptions && !selected}
                      >
                        {hasPricingOptions ? (
                          selected ? `Add to Cart - ₹${selected.price}` : 'Select Size First'
                        ) : (
                          `Add to Cart${item.pricing?.[0]?.price ? ` - ₹${item.pricing[0].price}` : ''}`
                        )}
                      </button>
                    </div>

                    {hasPricingOptions && item.pricing.length > 1 && (
                      <p className="text-xs text-orange-600 mt-3 text-center font-medium">
                        {item.pricing.length} size options available
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {items.filter((p: { type: string }) => p.type === "latest").length > 3 && (
          <div className="flex justify-center mt-12">
            <Link href="/collections/sweets">
              <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-10 py-4 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg">
          View More Sweets
              </button>
            </Link>
          </div>
        )}

        {Object.values(dropdownOpen).some(open => open) && (
          <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen({})} />
        )}

        <SignInPopup
          isOpen={showSignInPopup}
          onClose={() => setShowSignInPopup(false)}
          onSignIn={handleSignIn}
        />
      </div>
    </div>
  );
}
