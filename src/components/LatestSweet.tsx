"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import type { IProduct } from "../models/Product";
import { useCart } from '../app/context/CartContext';
import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from 'lucide-react';

interface Pricing {
  quantity: number;
  unit: 'gm' | 'kg' | 'piece' | 'dozen';
  price: number;
  _id?: string;
}

export default function LatestProduct() {
  const [items, setItems] = useState<IProduct[]>([]);
  const [selectedPricing, setSelectedPricing] = useState<{[key: string]: Pricing}>({});
  const [dropdownOpen, setDropdownOpen] = useState<{[key: string]: boolean}>({});
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchLatestItems = async () => {
      try {
        const productsRes = await axios.get("/api/product");

        const latestProducts = productsRes.data.filter(
          (p: IProduct) => p.type === "latest"
        );

        setItems(latestProducts);

        // Set default selected pricing (first option for each product)
        const defaultPricing: {[key: string]: Pricing} = {};
        latestProducts.forEach((product: IProduct) => {
          if (product._id && product.pricing && product.pricing.length > 0) {
            defaultPricing[product._id] = product.pricing[0];
          }
        });
        setSelectedPricing(defaultPricing);
      } catch (error) {
        console.error("Error fetching latest items:", error);
      }
    };

    fetchLatestItems();
  }, []);

  const handlePricingSelect = (productId: string, pricing: Pricing) => {
    setSelectedPricing(prev => ({
      ...prev,
      [productId]: pricing
    }));
    setDropdownOpen(prev => ({
      ...prev,
      [productId]: false
    }));
  };

  const toggleDropdown = (productId: string) => {
    setDropdownOpen(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const handleAddToCart = async (item: IProduct) => {
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

  const getUnitDisplay = (unit: string) => {
    const unitMap = {
      'gm': 'g',
      'kg': 'kg',
      'piece': 'pc',
      'dozen': 'dz'
    };
    return unitMap[unit as keyof typeof unitMap] || unit;
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading latest products...</p>
      </div>
    );
  }

  // Show only first 3 products
  const displayedItems = items.slice(0, 3);

  return (
    <div className="py-8">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Latest Products</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayedItems.map((item) => {
          const itemId = item._id || '';
          const selected = selectedPricing[itemId];
          const isDropdownOpen = dropdownOpen[itemId];
          const hasPricingOptions = item.pricing && item.pricing.length > 0;
          
          return (
            <div 
              key={item._id || Math.random()} 
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
                {item.type && (
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

                {/* Price Options Dropdown - Only show if product has pricing options */}
                {hasPricingOptions ? (
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Select Size & Price:
                    </label>
                    <div className="relative">
                      <button
                        onClick={() => toggleDropdown(itemId)}
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
                          {item.pricing!.map((pricing, index) => (
                            <button
                              key={index}
                              onClick={() => handlePricingSelect(itemId, pricing)}
                              className={`w-full flex items-center justify-between p-3 hover:bg-orange-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                                selected && 
                                selected.quantity === pricing.quantity && 
                                selected.unit === pricing.unit && 
                                selected.price === pricing.price
                                  ? 'bg--100 text-orange-700' 
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
                ) : (
                  /* Simple Price Display for products without pricing options */
                  <div className="mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-orange-600">
                        {item.pricing && item.pricing.length > 0 ? `₹${item.pricing[0].price}` : 'Price not available'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Add to Cart Button */}
                <button
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                    (!hasPricingOptions || selected)
                      ? 'bg-orange-500 text-white hover:bg-orange-600 hover:shadow-md transform hover:-translate-y-0.5'
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
                    <>
                      Add to Cart{item.pricing && item.pricing.length > 0 ? ` - ₹${item.pricing[0].price}` : ''}
                    </>
                  )}
                </button>

                {/* Additional Info */}
                {hasPricingOptions && item.pricing!.length > 1 && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    {item.pricing!.length} size options available
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* View More Button - Only show if there are more than 3 items */}
      {items.length > 3 && (
        <div className="flex justify-center mt-8">
          <Link href="/collections/sweets">
            <button className="bg-orange-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-orange-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              View More Sweets
            </button>
          </Link>
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
  );
}