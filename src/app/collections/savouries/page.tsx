"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { useCart } from '../../../app/context/CartContext';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Navbar from "@/components/Navbar";

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

export default function SavouriesCollection() {
  const [namkeens, setNamkeens] = useState<Namkeen[]>([]);
  const [selectedPricing, setSelectedPricing] = useState<{[key: string]: Pricing}>({});
  const [dropdownOpen, setDropdownOpen] = useState<{[key: string]: boolean}>({});
  const [loading, setLoading] = useState(true);
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
        setLoading(false);
      } catch (error) {
        console.error("Error fetching namkeens:", error);
        setLoading(false);
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

  const toggleDropdown = (namkeenId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDropdownOpen(prev => ({
      ...prev,
      [namkeenId]: !prev[namkeenId]
    }));
  };

  const handleAddToCart = async (item: Namkeen, event: React.MouseEvent) => {
    // Prevent navigation when clicking add to cart
    event.preventDefault();
    event.stopPropagation();
    
    if (!item._id) return;

    const selected = selectedPricing[item._id];
    if (!selected) return;

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

  const getUnitDisplay = (unit: string) => {
    const unitMap = {
      'gm': 'g',
      'kg': 'kg',
      'piece': 'pc',
      'dozen': 'dz'
    };
    return unitMap[unit as keyof typeof unitMap] || unit;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white mt-10">
        <Navbar />
        <div className="flex justify-center items-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading savouries collection...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white mt-16 py-12">
      {/* ✅ Navbar goes here */}
      <Navbar />
      
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header with Back Button */}
          <div className="flex items-center mb-8">
           
          </div>

          {/* Page Title */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Namkeen Collection</h2>
            <p className="text-gray-600 text-lg mb-4">Explore our complete range of delicious namkeens and savouries</p>
            <div className="w-24 h-1 bg-orange-500 mx-auto rounded-full"></div>
          </div>

          {/* Products Count */}
          <div className="mb-6">
            <p className="text-gray-600">
              Showing <span className="font-semibold">{namkeens.length}</span> products
            </p>
          </div>

          {/* Products Grid */}
          {namkeens.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 text-6xl mb-4">🥨</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No namkeen available</h3>
              <p className="text-gray-500">Check back later for new namkeen arrivals!</p>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-8xl">
                {namkeens.map((item, index) => {
                  const selected = selectedPricing[item._id];
                  const isDropdownOpen = dropdownOpen[item._id];
                  
                  return (
                    <Link 
                      key={item._id} 
                      href={`/products/${item._id}?_pos=${index + 1}&_psq=namkeen&_ss=e&_v=1.0`}
                      className="block"
                    >
                      <div 
                        className="bg-white rounded-2xl shadow-lg overflow-visible hover:shadow-2xl transition-all duration-300 border border-orange-100 transform hover:-translate-y-1 cursor-pointer"
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
                          {item.type && item.type !== "none" && (
                            <div className="absolute top-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                              {item.type}
                            </div>
                          )}
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

                          {/* Price Options Dropdown */}
                          {item.pricing.length > 0 && (
                            <div className="mb-6">
                              <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">
                                Select Size & Price:
                              </label>
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={(e) => toggleDropdown(item._id, e)}
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
                                    {item.pricing.map((pricing, pricingIndex) => (
                                      <button
                                        key={pricingIndex}
                                        type="button"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          handlePricingSelect(item._id, pricing);
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
                          )}

                          {/* Add to Cart Button - Centered */}
                          <div className="flex justify-center">
                            <button
                              type="button"
                              className={`w-full max-w-xs py-4 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg ${
                                selected
                                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 hover:shadow-xl transform hover:-translate-y-1 hover:scale-105'
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                              onClick={(e) => handleAddToCart(item, e)}
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
                          </div>

                          {/* Additional Info */}
                          {item.pricing.length > 1 && (
                            <p className="text-xs text-orange-600 mt-3 text-center font-medium">
                              {item.pricing.length} size options available
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Click outside to close dropdowns */}
          {Object.values(dropdownOpen).some(open => open) && (
            <div 
              className="fixed inset-0"
              style={{ zIndex: 999 }}
              onClick={() => setDropdownOpen({})}
            />
          )}
        </div>
      </div>
    </div>
  );
}