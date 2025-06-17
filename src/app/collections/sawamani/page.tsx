'use client';

import React, { useState, useEffect } from 'react';
import { X,  Star, Package } from 'lucide-react';
import Image from 'next/image';
import { SawamaniForm } from '@/components/SawamaniForm'; 
import Navbar from "@/components/Navbar";
import { useProducts } from "../../../hooks/useProducts"; // Import the same hook

// Product interface
interface Product {
  type: string;
  variant: string;
  label: string;
  price: number;
  mainPrice: number;
  image: string;
  description?: string;
  rating?: number;
}

// Static product list
const STATIC_PRODUCTS: Product[] = [
  { 
    type: 'barfi', 
    variant: 'mawa', 
    label: 'Mawa Barfi', 
    price: 38000, 
    mainPrice: 1900000,
    image: '/mawa-barfi.jpeg',
    description: 'Rich and creamy barfi made with pure mawa and cardamom',
    rating: 4.8
  },
  { 
    type: 'peda', 
    variant: 'mawa', 
    label: 'Mawa Peda', 
    price: 38000, 
    mainPrice: 1900000,
    image: '/besan-ladoo.jpg',
    description: 'Traditional rich and creamy peda ladoo with roasted nuts',
    rating: 4.4
  },
  { 
    type: 'laddoo', 
    variant: 'moong', 
    label: 'Moong Ladoo', 
    price: 35000, 
    mainPrice: 1750000,
    image: '/moong-ladoo.jpg',
    description: 'Traditional ladoo prepared with roasted moong dal and ghee',
    rating: 4.6
  },
  { 
    type: 'barfi', 
    variant: 'moong', 
    label: 'Moong Barfi', 
    price: 35000, 
    mainPrice: 1750000,
    image: '/moong-dal-barfi.jpg',
    description: 'Nutritious and delicious barfi made from yellow moong dal',
    rating: 4.7
  },
  { 
    type: 'barfi', 
    variant: 'dilkhushal', 
    label: 'Dilkhushal Barfi', 
    price: 32000, 
    mainPrice: 1600000,
    image: '/dilkushar-barfi.jpg',
    description: 'Special festive barfi with mixed nuts and aromatic spices',
    rating: 4.9
  },
  { 
    type: 'laddoo', 
    variant: 'motichoor', 
    label: 'Motichoor Ladoo', 
    price: 32000, 
    mainPrice: 1600000,
    image: '/motichoor-ladoo.jpg',
    description: 'Fine textured ladoo made with tiny boondi pearls',
    rating: 4.8
  },
  { 
    type: 'other', 
    variant: 'churma', 
    label: 'Churma', 
    price: 24000, 
    mainPrice: 1200000,
    image: '/churma.jpeg',
    description: 'Traditional Rajasthani sweet made with wheat flour and jaggery',
    rating: 4.5
  },
  { 
    type: 'laddoo', 
    variant: 'moti boondi', 
    label: 'Moti Boondi Ladoo', 
    price: 300000, 
    mainPrice: 1500000,
    image: '/boondi-ladoo.jpg',
    description: 'Classic ladoo made with large boondi pearls and dry fruits',
    rating: 4.7
  },
  { 
    type: 'laddoo', 
    variant: 'barik boondi', 
    label: 'Barik Boondi Ladoo', 
    price: 30000, 
    mainPrice: 1500000,
    image: '/barik-boondi.jpg',
    description: 'Soft and melt-in-mouth ladoo with fine boondi texture',
    rating: 4.6
  },
  { 
    type: 'barfi', 
    variant: 'besan', 
    label: 'Besan Barfi', 
    price: 30000, 
    mainPrice: 1500000,
    image: '/besan-barfi.jpg',
    description: 'Aromatic gram flour barfi with pure ghee and cardamom',
    rating: 4.5
  },
  { 
    type: 'laddoo', 
    variant: 'besan', 
    label: 'Besan Ladoo', 
    price: 30000, 
    mainPrice: 1500000,
    image: '/besan-ladoo.jpg',
    description: 'Traditional gram flour ladoo with roasted nuts',
    rating: 4.4
  },
];

// Product Card Component
const ProductCard: React.FC<{ product: Product; onSelect: (product: Product) => void }> = ({ 
  product, 
  onSelect 
}) => {
  const formatMainPrice = (price: number): string => {
    return `₹${(price / 100).toLocaleString('en-IN')}`;
  };

  const formatPerKgPrice = (price: number): string => {
    return `₹${(price / 100).toFixed(0)} per kg`;
  };

  return (
    <div 
      className="bg-white rounded-2xl shadow-lg overflow-visible hover:shadow-2xl transition-all duration-300 border border-orange-100 transform hover:-translate-y-1 cursor-pointer"
      onClick={() => onSelect(product)}
    >
      {/* Product Image */}
      <div className="relative h-56 w-full overflow-hidden bg-gradient-to-br from-orange-100 to-orange-50">
        <Image
          src={product.image || "/placeholder-image.jpg"}
          alt={product.label}
          fill
          className="object-cover hover:scale-110 transition-transform duration-500"
        />
        {product.price >= 35000 && (
          <div className="absolute top-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
            Premium
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
      </div>

      {/* Product Details */}
      <div className="p-6 bg-gradient-to-br from-white to-orange-50/30">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-xl text-gray-800 line-clamp-1 text-center flex-1">
            {product.label}
          </h3>
          {product.rating && (
            <div className="flex items-center gap-1 ml-2">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600">{product.rating}</span>
            </div>
          )}
        </div>
        
        <p className="text-gray-600 text-sm mb-6 line-clamp-2 leading-relaxed text-center">
          {product.description}
        </p>

        {/* Price Display */}
        <div className="mb-6 text-center">
          {/* Main Price - Large and Bold */}
          <div className="text-3xl font-bold text-orange-600 mb-1">
            {formatMainPrice(product.mainPrice)}
          </div>
          {/* Per Kg Price - Smaller and Subtle */}
          <div className="text-sm text-gray-500 font-normal">
            {formatPerKgPrice(product.price)}
          </div>
        </div>

        {/* Order Button - Centered */}
        <div className="flex justify-center">
          <button
            type="button"
            className="w-full max-w-xs py-4 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 hover:shadow-xl transform hover:-translate-y-1 hover:scale-105"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
          >
            Order Now
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal Component
const Modal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  product: Product | null;
  children: React.ReactNode;
}> = ({ isOpen, onClose, product, children }) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Order {product.label}</h2>
              <p className="text-gray-600 text-sm">Complete your order details below</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

// Enhanced SawamaniForm wrapper component
const SawamaniFormWrapper: React.FC<{ product: Product; onClose: () => void }> = ({ 
  product, 
  onClose 
}) => {
  const formatMainPrice = (price: number): string => {
    return `₹${(price / 100).toLocaleString('en-IN')}`;
  };

  const formatPerKgPrice = (price: number): string => {
    return `₹${(price / 100).toFixed(0)}/kg`;
  };

  return (
    <div className="space-y-4">
      {/* Product Summary */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-lg border border-orange-200">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-200 to-amber-200 rounded-lg flex items-center justify-center">
            <Package className="w-8 h-8 text-orange-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{product.label}</h3>
            <p className="text-gray-600 text-sm">{product.description}</p>
            <div className="mt-1">
              <p className="text-orange-600 font-bold text-lg">{formatMainPrice(product.mainPrice)}</p>
              <p className="text-gray-500 text-sm">{formatPerKgPrice(product.price)}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Form */}
      <SawamaniForm 
        preSelectedProduct={{
          type: product.type,
          variant: product.variant,
          price: product.price
        }}
        onOrderSuccess={onClose}
      />
    </div>
  );
};

// Main Page Component
export default function SawamaniCollectionPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>(STATIC_PRODUCTS);
  
  // Get dynamic products from LatestSweet component
  const { data: latestSweetItems = [], isLoading } = useProducts();

  // Function to find matching product by name similarity
  const findMatchingLatestSweetImage = (sawamaniProduct: Product) => {
    if (!latestSweetItems.length) return null;

    // Create variations of the sawamani product name for matching
    const sawamaniName = sawamaniProduct.label.toLowerCase();
    const sawamaniWords = sawamaniName.split(' ');
    
    // Find matching product from LatestSweet
    const matchingProduct = latestSweetItems.find((latestItem: any) => {
      const latestName = latestItem.name.toLowerCase();
      
      // Direct name match
      if (latestName === sawamaniName) return true;
      
      // Check if all words from sawamani product exist in latest product name
      const latestWords = latestName.split(' ');
      const allWordsMatch: boolean = sawamaniWords.every((word: string) => 
        latestWords.some((latestWord: string) => 
          latestWord.includes(word) || word.includes(latestWord)
        )
      );
      
      if (allWordsMatch) return true;
      
      // Check for common sweet type matches
      if (sawamaniName.includes('besan barfi') && latestName.includes('besan barfi')) {
        return sawamaniWords.some(word => latestWords.includes(word));
      }
      if (sawamaniName.includes('ladoo') && latestName.includes('ladoo')) {
        return sawamaniWords.some(word => latestWords.includes(word));
      }
      if (sawamaniName.includes('peda') && latestName.includes('peda')) {
        return sawamaniWords.some(word => latestWords.includes(word));
      }
      
      return false;
    });

    return matchingProduct?.image || null;
  };

  // Update products with matching images from LatestSweet
  useEffect(() => {
    if (latestSweetItems.length > 0) {
      const updatedProducts = STATIC_PRODUCTS.map(product => {
        const matchingImage = findMatchingLatestSweetImage(product);
        return matchingImage ? { ...product, image: matchingImage } : product;
      });
      setProducts(updatedProducts);
    }
  }, [latestSweetItems]);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  // Show loading state while fetching latest sweet items
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
        <Navbar />
        <div className="flex justify-center items-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white mt-16 py-12">
      {/* Navbar */}
      <Navbar />
      
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Title */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Sawamani Collection</h2>
            <p className="text-gray-600 text-lg mb-4">Select any one item to place a Sawamani order</p>
            <div className="w-24 h-1 bg-orange-500 mx-auto rounded-full"></div>
          </div>

          {/* Products Count */}
          <div className="mb-6">
            <p className="text-gray-600">
              Showing <span className="font-semibold">{products.length}</span> products
            </p>
          </div>

          {/* Products Grid */}
          <div className="flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-8xl">
              {products.map((product, index) => (
                <ProductCard
                  key={`${product.type}-${product.variant}-${index}`}
                  product={product}
                  onSelect={handleProductSelect}
                />
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-12">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto border border-orange-100">
              <Package className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Fresh Sweets, Made to Order
              </h3>
              <p className="text-gray-600 mb-4">
                All our sweets are prepared fresh with premium ingredients and traditional recipes
              </p>
              <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>100% Pure Ingredients</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Made Fresh Daily</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Home Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        product={selectedProduct}
      >
        {selectedProduct && (
          <SawamaniFormWrapper 
            product={selectedProduct} 
            onClose={handleCloseModal}
          />
        )}
      </Modal>
    </div>
  );
}