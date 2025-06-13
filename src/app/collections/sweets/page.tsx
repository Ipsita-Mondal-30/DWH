"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import type { IProduct } from "../../../models/Product";
import { useCart } from '../../../app/context/CartContext';
import Image from "next/image";
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Navbar from "@/components/Navbar";

interface Pricing {
  quantity: number;
  unit: 'gm' | 'kg' | 'piece' | 'dozen';
  price: number;
  _id?: string;
}

export default function SweetsCollection() {
  const [items, setItems] = useState<IProduct[]>([]);
  const [selectedPricing, setSelectedPricing] = useState<{[key: string]: Pricing}>({});
  const [dropdownOpen, setDropdownOpen] = useState<{[key: string]: boolean}>({});
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchSweetItems = async () => {
      try {
        const productsRes = await axios.get("/api/product");

        // Show ALL products from the product API (sweets), not just "latest" type
        const sweetProducts = productsRes.data;

        setItems(sweetProducts);

        // Set default selected pricing (first option for each product)
        const defaultPricing: {[key: string]: Pricing} = {};
        sweetProducts.forEach((product: IProduct) => {
          if (product._id && product.pricing && product.pricing.length > 0) {
            defaultPricing[product._id] = product.pricing[0];
          }
        });
        setSelectedPricing(defaultPricing);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching sweet items:", error);
        setLoading(false);
      }
    };

    fetchSweetItems();
  }, []);

  const handlePricingSelect = (productId: string, pricing: Pricing, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedPricing(prev => ({
      ...prev,
      [productId]: pricing
    }));
    setDropdownOpen(prev => ({
      ...prev,
      [productId]: false
    }));
  };

  const toggleDropdown = (productId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDropdownOpen(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const handleAddToCart = async (item: IProduct, event: React.MouseEvent) => {
    // Prevent navigation when clicking add to cart
    event.preventDefault();
    event.stopPropagation();
    
    if (!item._id) return;

    const selected = selectedPricing[item._id];
    
    try {
      console.log('Adding to cart:', { itemId: item._id, selected }); // Debug log
      if (selected) {
        // Product has pricing options - pass the selected pricing
        await addToCart(item._id, 1, selected);
      } else {
        // Product doesn't have pricing options - use regular add to cart
        await addToCart(item._id, 1);
      }
      console.log('Successfully added to cart'); // Debug log
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert('Failed to add item to cart. Please try again.');
    }
  };

  const handleCardClick = (item: IProduct, index: number) => {
    // Only navigate if no dropdown is open for this item
    const itemId = item._id || '';
    if (!dropdownOpen[itemId]) {
      window.location.href = `/products/${item._id}?_pos=${index + 1}&_psq=sweets&_ss=e&_v=1.0`;
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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setDropdownOpen({});
    };

    if (Object.values(dropdownOpen).some(open => open)) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [dropdownOpen]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white ">
        
        <Navbar />
        
        <div className="flex justify-center items-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium ">Loading sweet collection...</p>
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
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Sweet Collection</h2>
            <p className="text-gray-600 text-lg mb-4">Discover our complete range of delicious sweets</p>
            <div className="w-24 h-1 bg-orange-500 mx-auto rounded-full"></div>
          </div>

          {/* Products Count */}
          <div className="mb-6">
            <p className="text-gray-600">
              Showing <span className="font-semibold">{items.length}</span> products
            </p>
          </div>

          {/* Products Grid */}
          {items.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 text-6xl mb-4">🍬</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No sweets available</h3>
              <p className="text-gray-500">Check back later for new sweet arrivals!</p>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-8xl">
                {items.map((item, index) => {
                  const itemId = item._id || '';
                  const selected = selectedPricing[itemId];
                  const isDropdownOpen = dropdownOpen[itemId];
                  const hasPricingOptions = item.pricing && item.pricing.length > 0;
                  
                  return (
                    <div 
                      key={item._id || Math.random()} 
                      className="block"
                    >
                      <div 
                        className="bg-white rounded-2xl shadow-lg overflow-visible hover:shadow-2xl transition-all duration-300 border border-orange-100 transform hover:-translate-y-1 cursor-pointer relative"
                        style={{ zIndex: isDropdownOpen ? 1000 : 1 }}
                        onClick={() => handleCardClick(item, index)}
                      >
                        {/* Product Image */}
                        <div className="relative h-56 w-full overflow-hidden bg-gradient-to-br from-orange-100 to-orange-50">
                          <Image
                            src={item.image || "/placeholder-image.jpg"}
                            alt={item.name}
                            fill
                            className="object-cover hover:scale-110 transition-transform duration-500"
                          />
                          {item.type && item.type !== 'none' && (
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

                          {/* Price Options Dropdown - Only show if product has pricing options */}
                          {hasPricingOptions ? (
                            <div className="mb-6" onClick={(e) => e.stopPropagation()}>
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
                                    {item.pricing!.map((pricing, pricingIndex) => (
                                      <button
                                        key={pricingIndex}
                                        type="button"
                                        onClick={(e) => handlePricingSelect(itemId, pricing, e)}
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
                            /* Simple Price Display for products without pricing options */
                            <div className="mb-6 text-center">
                              <span className="text-2xl font-bold text-orange-600">
                                {item.pricing && item.pricing.length > 0 ? `₹${item.pricing[0].price}` : 'Price not available'}
                              </span>
                            </div>
                          )}

                          {/* Add to Cart Button - Centered */}
                          <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              className={`w-full max-w-xs py-4 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg ${
                                (!hasPricingOptions || selected)
                                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 hover:shadow-xl transform hover:-translate-y-1 hover:scale-105'
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                              onClick={(e) => handleAddToCart(item, e)}
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
                                <>
                                  Add to Cart{item.pricing && item.pricing.length > 0 ? ` - ₹${item.pricing[0].price}` : ''}
                                </>
                              )}
                            </button>
                          </div>

                          {/* Additional Info */}
                          {hasPricingOptions && item.pricing!.length > 1 && (
                            <p className="text-xs text-orange-600 mt-3 text-center font-medium">
                              {item.pricing!.length} size options available
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}