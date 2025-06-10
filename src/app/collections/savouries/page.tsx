"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { useCart } from '../../../app/context/CartContext';
import { ChevronDown, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

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

  const toggleDropdown = (namkeenId: string) => {
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
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-500 text-lg">Loading savouries collection...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Back Button */}
        <div className="flex items-center mb-8">
          <Link 
            href="/" 
            className="flex items-center text-orange-600 hover:text-orange-800 transition-colors mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Savouries Collection</h1>
          <p className="text-gray-600 text-lg">Explore our complete range of delicious namkeens and savouries</p>
          <div className="w-24 h-1 bg-orange-500 mx-auto mt-4 rounded-full"></div>
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
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No savouries available</h3>
            <p className="text-gray-500">Check back later for new namkeen arrivals!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {namkeens.map((item, index) => {
              const selected = selectedPricing[item._id];
              const isDropdownOpen = dropdownOpen[item._id];
              
              return (
                <Link 
                  key={item._id} 
                  href={`/products/${item._id}?_pos=${index + 1}&_psq=namkeen&_ss=e&_v=1.0`}
                  className="block"
                >
                  <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer">
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
                        <div className="mb-4" onClick={(e) => e.preventDefault()}>
                          <label className="block text-xs font-medium text-gray-700 mb-2">
                            Select Size & Price:
                          </label>
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleDropdown(item._id);
                              }}
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
                                {item.pricing.map((pricing, pricingIndex) => (
                                  <button
                                    key={pricingIndex}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handlePricingSelect(item._id, pricing);
                                    }}
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

                      {/* Additional Info */}
                      {item.pricing.length > 1 && (
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          {item.pricing.length} size options available
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Click outside to close dropdowns */}
        {Object.values(dropdownOpen).some(open => open) && (
          <div 
            className="fixed inset-0 z-[50]" 
            onClick={() => setDropdownOpen({})}
          />
        )}
      </div>
    </div>
  );
}