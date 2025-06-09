"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSession, signIn } from 'next-auth/react';
import Image from "next/image";
import { useCart } from '../app/context/CartContext';
import { ChevronDown } from 'lucide-react';
import SignInPopup from './SigninPopup'; // Import the popup component

interface Pricing {
  quantity: number;
  unit: 'gm' | 'kg' | 'piece' | 'dozen';
  price: number;
  _id?: string;
}

interface Namkeen {
  _id: string;
  name: string;
  description: string;
  image: string;
  type: string;
  pricing: Pricing[];
}

export default function LatestNamkeen() {
  const [namkeens, setNamkeens] = useState<Namkeen[]>([]);
  const { data: session, status } = useSession();
  const [selectedPricing, setSelectedPricing] = useState<{[key: string]: Pricing}>({});
  const [dropdownOpen, setDropdownOpen] = useState<{[key: string]: boolean}>({});
  const [showSignInPopup, setShowSignInPopup] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchNamkeens = async () => {
      try {
        const res = await axios.get("/api/namkeen");
        setNamkeens(res.data);
        
        // Set default selected pricing (first option for each namkeen)
        const defaultPricing: {[key: string]: Pricing} = {};
        res.data.forEach((namkeen: Namkeen) => {
          if (namkeen.pricing.length > 0) {
            defaultPricing[namkeen._id] = namkeen.pricing[0];
          }
        });
        setSelectedPricing(defaultPricing);
      } catch (error) {
        console.error("Error fetching namkeens:", error);
      }
    };

    fetchNamkeens();
  }, []);

  const handlePricingSelect = (namkeenId: string, pricing: Pricing) => {
    setSelectedPricing(prev => ({
      ...prev,
      [namkeenId]: pricing
    }));
    setDropdownOpen(prev => ({
      ...prev,
      [namkeenId]: false
    }));
  };

  const toggleDropdown = (namkeenId: string) => {
    setDropdownOpen(prev => ({
      ...prev,
      [namkeenId]: !prev[namkeenId]
    }));
  };

  const handleAddToCart = async (item: Namkeen) => {
    if (!item._id) return;

    const selected = selectedPricing[item._id];
    if (!selected) return;
    
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
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert('Failed to add item to cart. Please try again.');
    }
  };

  const handleSignIn = () => {
    // Trigger Google sign-in using NextAuth
    signIn('google', { 
      callbackUrl: window.location.href // Redirect back to current page after sign-in
    });
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

  // Show loading state while session is being determined
  if (status !== "authenticated" && status !== "unauthenticated") {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (namkeens.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading namkeens...</p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
        Latest Namkeens
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {namkeens.map((item) => {
          const selected = selectedPricing[item._id];
          const isDropdownOpen = dropdownOpen[item._id];
          
          return (
            <div 
              key={item._id} 
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              {/* Product Image */}
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={item.image || "/placeholder-image.jpg"}
                  alt={item.name}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
                {item.type && item.type !== "none" && (
                  <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    {item.type}
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2 text-gray-800 line-clamp-1">
                  {item.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                {/* Price Options Dropdown */}
                {item.pricing.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Select Size & Price:
                    </label>
                    <div className="relative">
                      <button
                        onClick={() => toggleDropdown(item._id)}
                        className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 transition-colors"
                      >
                        <div className="flex flex-col items-start">
                          {selected ? (
                            <>
                              <span className="text-sm font-medium text-gray-800">
                                {selected.quantity}{getUnitDisplay(selected.unit)}
                              </span>
                              <span className="text-lg font-bold text-orange-600">
                                ₹{selected.price}
                              </span>
                            </>
                          ) : (
                            <span className="text-gray-500">Select option</span>
                          )}
                        </div>
                        <ChevronDown 
                          className={`h-4 w-4 text-gray-500 transition-transform ${
                            isDropdownOpen ? 'rotate-180' : ''
                          }`} 
                        />
                      </button>

                      {/* Dropdown Options - Fixed z-index */}
                      {isDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-[60] max-h-48 overflow-y-auto">
                          {item.pricing.map((pricing, index) => (
                            <button
                              key={index}
                              onClick={() => handlePricingSelect(item._id, pricing)}
                              className={`w-full flex items-center justify-between p-3 hover:bg-orange-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                                selected && 
                                selected.quantity === pricing.quantity && 
                                selected.unit === pricing.unit && 
                                selected.price === pricing.price
                                  ? 'bg-orange-100 text-orange-700' 
                                  : 'text-gray-700'
                              }`}
                            >
                              <div className="flex flex-col items-start">
                                <span className="font-medium">
                                  {pricing.quantity}{getUnitDisplay(pricing.unit)}
                                </span>
                                <span className="text-sm text-gray-500">
                                  Per {pricing.unit === 'piece' ? 'piece' : pricing.unit === 'dozen' ? 'dozen' : 'unit'}
                                </span>
                              </div>
                              <span className="font-bold text-orange-600">
                                ₹{pricing.price}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Add to Cart Button */}
                <button
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                    selected
                      ? 'bg-orange-500 text-white hover:bg-orange-600 hover:shadow-md transform hover:-translate-y-0.5'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  onClick={() => handleAddToCart(item)}
                  disabled={!selected}
                >
                  {selected ? (
                    <>
                      Add to Cart - ₹{selected.price}
                    </>
                  ) : (
                    'Select Size First'
                  )}
                </button>

                {/* Additional Info */}
                {item.pricing.length > 1 && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    {item.pricing.length} size options available
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Click outside to close dropdowns */}
      {Object.values(dropdownOpen).some(open => open) && (
        <div 
          className="fixed inset-0 z-[50]" 
          onClick={() => setDropdownOpen({})}
        />
      )}
      
      {/* Sign In Popup */}
      <SignInPopup 
        isOpen={showSignInPopup}
        onClose={() => setShowSignInPopup(false)}
        onSignIn={handleSignIn}
      />
    </div>
  );
}