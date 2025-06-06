"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useCart } from '../app/context/CartContext';
import Image from "next/image";
import { ChevronDown } from "lucide-react";

// Enhanced Product interface to handle quantity-based pricing
interface ProductOption {
  quantity: number;
  price: number;
  unit?: string; // e.g., "kg", "g", "pieces"
}

interface IProduct {
  _id: string;
  name: string;
  description?: string;
  image: string;
  type: string;
  // Support both single price and quantity-based pricing
  price?: number;
  options?: ProductOption[];
  defaultQuantity?: number;
}

interface SelectedOption {
  quantity: number;
  price: number;
  unit?: string;
}

export default function LatestProduct() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, SelectedOption>>({});
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});
  const { addToCart } = useCart();
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("/api/product");
        const latest = res.data.filter((p: IProduct) => p.type === "latest");
        setProducts(latest);
        
        // Initialize selected options for each product
        const initialOptions: Record<string, SelectedOption> = {};
        latest.forEach((product: IProduct) => {
          if (product.options && product.options.length > 0) {
            // Select first option by default
            initialOptions[product._id] = {
              quantity: product.options[0].quantity,
              price: product.options[0].price,
              unit: product.options[0].unit
            };
          } else if (product.price) {
            // Fallback to single price
            initialOptions[product._id] = {
              quantity: product.defaultQuantity || 1,
              price: product.price
            };
          }
        });
        setSelectedOptions(initialOptions);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  const handleOptionSelect = (productId: string, option: SelectedOption) => {
    setSelectedOptions(prev => ({
      ...prev,
      [productId]: option
    }));
    setOpenDropdowns(prev => ({
      ...prev,
      [productId]: false
    }));
  };

  const toggleDropdown = (productId: string) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const handleAddToCart = async (productId: string) => {
    const selectedOption = selectedOptions[productId];
    if (!selectedOption) return;

    setLoading(prev => ({
      ...prev,
      [productId]: true
    }));

    try {
      // You might need to modify your addToCart function to handle price and quantity
      // For now, we'll pass the quantity from the selected option
      await addToCart(productId, selectedOption.quantity);
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setLoading(prev => ({
        ...prev,
        [productId]: false
      }));
    }
  };

  if (products.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading latest products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Latest Products</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          const selectedOption = selectedOptions[product._id];
          const hasOptions = product.options && product.options.length > 0;
          
          return (
            <div key={product._id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
              {/* Product Image */}
              <div className="relative h-48 w-full">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              
              {/* Product Info */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                  {product.name}
                </h3>
                
                {product.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>
                )}

                {/* Quantity/Price Selector */}
                {hasOptions ? (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Quantity & Price:
                    </label>
                    
                    <div className="relative">
                      <button
                        onClick={() => toggleDropdown(product._id)}
                        className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 flex justify-between items-center"
                      >
                        <span className="text-sm">
                          {selectedOption?.quantity}
                          {selectedOption?.unit && ` ${selectedOption.unit}`} - 
                          <span className="font-semibold ml-1">
                            ₹{selectedOption?.price?.toFixed(2)}
                          </span>
                        </span>
                        <ChevronDown 
                          className={`h-4 w-4 transition-transform duration-200 ${
                            openDropdowns[product._id] ? 'rotate-180' : ''
                          }`} 
                        />
                      </button>

                      {/* Dropdown Options */}
                      {openDropdowns[product._id] && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                          {product.options?.map((option, index) => (
                            <button
                              key={index}
                              onClick={() => handleOptionSelect(product._id, {
                                quantity: option.quantity,
                                price: option.price,
                                unit: option.unit
                              })}
                              className={`w-full px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 text-sm ${
                                selectedOption?.quantity === option.quantity && 
                                selectedOption?.price === option.price 
                                  ? 'bg-orange-50 text-orange-700' 
                                  : 'text-gray-700'
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <span>
                                  {option.quantity}
                                  {option.unit && ` ${option.unit}`}
                                </span>
                                <span className="font-semibold">
                                  ₹{option.price.toFixed(2)}
                                </span>
                              </div>
                              {option.quantity > 1 && (
                                <div className="text-xs text-gray-500 mt-1">
                                  ₹{(option.price / option.quantity).toFixed(2)} per unit
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // Single price display
                  <div className="mb-4">
                    <div className="text-lg font-bold text-gray-800">
                      ₹{selectedOption?.price?.toFixed(2)}
                    </div>
                  </div>
                )}

                {/* Add to Cart Button */}
                <button
                  onClick={() => handleAddToCart(product._id)}
                  disabled={loading[product._id] || !selectedOption}
                  className={`w-full py-2 px-4 rounded-md font-medium transition-colors duration-200 ${
                    loading[product._id]
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-orange-500 text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2'
                  }`}
                >
                  {loading[product._id] ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Adding...
                    </div>
                  ) : (
                    'Add to Cart'
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}