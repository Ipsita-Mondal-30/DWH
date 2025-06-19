"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSession, signIn } from 'next-auth/react';
import type { IProduct } from "../models/Product";
import { useCart } from "../app/context/CartContext";
import Image from "next/image";
import { ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import SignInPopup from './SigninPopup'; // Import the popup component

interface Pricing {
  quantity: number;
  unit: 'gm' | 'kg' | 'piece' | 'dozen';
  price: number;
  _id?: string;
}

interface INamkeen {
  _id?: string;
  name: string;
  description: string;
  image: string;
  type: string;
  pricing: Pricing[];
}

// Combined type for both products and namkeens
interface CombinedItem {
  _id?: string;
  name: string;
  description: string;
  image: string;
  type: string;
  pricing: Pricing[];
  itemType: 'product' | 'namkeen';
}

export default function PopularProduct() {
  const [items, setItems] = useState<CombinedItem[]>([]);
  const { data: session, status } = useSession();
  const [selectedPricing, setSelectedPricing] = useState<{[key: string]: Pricing}>({});
  const [dropdownOpen, setDropdownOpen] = useState<{[key: string]: boolean}>({});
  const [showSignInPopup, setShowSignInPopup] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchPopularItems = async () => {
      try {
        // Fetch both products and namkeens
        const [productsRes, namkeensRes] = await Promise.all([
          axios.get("/api/product"),
          axios.get("/api/namkeen")
        ]);

        // Filter popular products
        const popularProducts = productsRes.data
          .filter((p: IProduct) => p.type === "popular")
          .map((p: IProduct) => ({
            ...p,
            itemType: 'product' as const
          }));

        // Filter popular namkeens
        const popularNamkeens = namkeensRes.data
          .filter((n: INamkeen) => n.type === "popular")
          .map((n: INamkeen) => ({
            ...n,
            itemType: 'namkeen' as const
          }));

        // Combine both arrays
        const combinedItems = [...popularProducts, ...popularNamkeens];
        setItems(combinedItems);

        // Set default selected pricing (first option for each item)
        const defaultPricing: {[key: string]: Pricing} = {};
        combinedItems.forEach((item: CombinedItem) => {
          if (item._id && item.pricing && item.pricing.length > 0) {
            defaultPricing[item._id] = item.pricing[0];
          }
        });
        setSelectedPricing(defaultPricing);
      } catch (error) {
        console.error("Error fetching popular items:", error);
      }
    };

    fetchPopularItems();
  }, []);

  const handlePricingSelect = (itemId: string, pricing: Pricing) => {
    setSelectedPricing(prev => ({
      ...prev,
      [itemId]: pricing
    }));
    setDropdownOpen(prev => ({
      ...prev,
      [itemId]: false
    }));
  };

  const toggleDropdown = (itemId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDropdownOpen(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const handleAddToCart = async (item: CombinedItem) => {
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
      <div className="flex justify-center items-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading popular products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-gradient-to-br from-orange-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Popular Products</h2>
          <div className="w-24 h-1 bg-orange-500 mx-auto rounded-full"></div>
        </div>
        
        <div className="flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl">
            {items.map((item) => {
              const itemId = item._id || '';
              const selected = selectedPricing[itemId];
              const isDropdownOpen = dropdownOpen[itemId];
              const hasPricingOptions = item.pricing && item.pricing.length > 0;
              
              return (
                <div 
                  key={item._id || Math.random()} 
                  className="bg-white rounded-2xl shadow-lg overflow-visible hover:shadow-2xl transition-all duration-300 border border-orange-100 transform hover:-translate-y-1"
                  style={{ zIndex: isDropdownOpen ? 1000 : 1 }}
                >
                  {/* Product Image */}
                  <div className="relative h-56 w-full overflow-hidden bg-gradient-to-br from-orange-100 to-orange-50">
                    <Image
                      src={item.image || "/placeholder-image.jpg"}
                      alt={item.name}
                      fill
                      className="object-cover hover:scale-110 transition-transform duration-500"
                    />
                    {/* Badge to show item type */}
                    <div className="absolute top-3 left-3">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full shadow-md ${
                        item.itemType === 'product' 
                          ? 'bg-red-500 text-white' 
                          : 'bg-orange-500 text-white'
                      }`}>
                        {item.itemType === 'product' ? 'Sweet' : 'Namkeen'}
                      </span>
                    </div>
                    {/* Popular badge */}
                    <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                      Popular
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                  </div>

                  {/* Product Details */}
                  <div className="p-6 bg-gradient-to-br from-white to-orange-50/30">
                    <h3 className="font-bold text-xl mb-3 text-gray-800 line-clamp-1 text-center">
                      {item.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-6 line-clamp-2 leading-relaxed text-center">
                      {item.description}
                    </p>

                    {/* Price Options Dropdown - Only show if item has pricing options */}
                    {hasPricingOptions ? (
                      <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">
                          Select Size & Price:
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => toggleDropdown(itemId, e)}
                            className="w-full flex items-center justify-between p-4 border-2 border-orange-200 rounded-xl hover:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 transition-all duration-200 bg-white shadow-sm"
                          >
                            <div className="flex flex-col items-start">
                              {selected ? (
                                <>
                                  <span className="text-sm font-semibold text-gray-800">
                                    {selected.quantity}{getUnitDisplay(selected.unit)}
                                  </span>
                                  <span className="text-xl font-bold text-orange-600">
                                    ₹{selected.price}
                                  </span>
                                </>
                              ) : (
                                <span className="text-gray-500 font-medium">Select option</span>
                              )}
                            </div>
                            <ChevronDown 
                              className={`h-5 w-5 text-orange-500 transition-transform duration-200 ${
                                isDropdownOpen ? 'rotate-180' : ''
                              }`} 
                            />
                          </button>

                          {/* Dropdown Options - Fixed positioning and z-index */}
                          {isDropdownOpen && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-orange-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto"
                                 style={{ zIndex: 9999 }}>
                              {item.pricing?.map((pricing, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handlePricingSelect(itemId, pricing);
                                  }}
                                  className={`w-full flex items-center justify-between p-4 hover:bg-orange-50 transition-colors border-b border-orange-100 last:border-b-0 ${
                                    selected && 
                                    selected.quantity === pricing.quantity && 
                                    selected.unit === pricing.unit && 
                                    selected.price === pricing.price
                                      ? 'bg-orange-100 text-orange-700 border-orange-200' 
                                      : 'text-gray-700 hover:text-orange-700'
                                  }`}
                                >
                                  <div className="flex flex-col items-start">
                                    <span className="font-semibold text-base">
                                      {pricing.quantity}{getUnitDisplay(pricing.unit)}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                      Per {pricing.unit === 'piece' ? 'piece' : pricing.unit === 'dozen' ? 'dozen' : 'unit'}
                                    </span>
                                  </div>
                                  <span className="font-bold text-orange-600 text-lg">
                                    ₹{pricing.price}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Simple Price Display for items without pricing options */
                      <div className="mb-6">
                        <div className="flex justify-center items-center p-4 border-2 border-gray-200 rounded-xl bg-gray-50">
                          <span className="text-lg font-bold text-gray-500">
                            Price not available
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Add to Cart Button - Centered */}
                    <div className="flex justify-center">
                      <button
                        type="button"
                        className={`w-full max-w-xs py-4 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg ${
                          (!hasPricingOptions || selected)
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 hover:shadow-xl transform hover:-translate-y-1 hover:scale-105'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        onClick={() => handleAddToCart(item)}
                        disabled={hasPricingOptions && !selected}
                      >
                        {hasPricingOptions ? (
                          selected ? (
                            <>
                              Add to Cart - ₹{selected.price}
                            </>
                          ) : (
                            'Select Size First'
                          )
                        ) : (
                          'Add to Cart'
                        )}
                      </button>
                    </div>

                    {/* Additional Info */}
                    {hasPricingOptions && item.pricing && item.pricing.length > 1 && (
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

        {/* Click outside to close dropdowns */}
        {Object.values(dropdownOpen).some(open => open) && (
          <div 
            className="fixed inset-0"
            style={{ zIndex: 999 }}
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
    </div>
  );
}