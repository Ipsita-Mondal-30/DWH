'use client';

import React, { useState } from 'react';
import { X, ShoppingBag, Star, Heart, Package } from 'lucide-react';
import Image from 'next/image';
import { SawamaniForm } from '@/components/SawamaniForm'; 

// Product interface
interface Product {
  type: string;
  variant: string;
  label: string;
  price: number;
  image: string;
  description?: string;
  rating?: number;
}

// Static product list
const PRODUCTS: Product[] = [
  { 
    type: 'barfi', 
    variant: 'mawa', 
    label: 'Mawa Barfi', 
    price: 19000, 
    image: '/images/mawa-barfi.jpg',
    description: 'Rich and creamy barfi made with pure mawa and cardamom',
    rating: 4.8
  },
  { 
    type: 'barfi', 
    variant: 'moong', 
    label: 'Moong Barfi', 
    price: 19000, 
    image: '/images/moong-barfi.jpg',
    description: 'Nutritious and delicious barfi made from yellow moong dal',
    rating: 4.7
  },
  { 
    type: 'laddoo', 
    variant: 'moong', 
    label: 'Moong Ladoo', 
    price: 19000, 
    image: '/images/moong-ladoo.jpg',
    description: 'Traditional ladoo prepared with roasted moong dal and ghee',
    rating: 4.6
  },
  { 
    type: 'barfi', 
    variant: 'dilkhushal', 
    label: 'Dilkhushal Barfi', 
    price: 17500, 
    image: '/images/dilkhushal.jpg',
    description: 'Special festive barfi with mixed nuts and aromatic spices',
    rating: 4.9
  },
  { 
    type: 'laddoo', 
    variant: 'motichoor', 
    label: 'Motichoor Ladoo', 
    price: 17500, 
    image: '/images/motichoor.jpg',
    description: 'Fine textured ladoo made with tiny boondi pearls',
    rating: 4.8
  },
  { 
    type: 'other', 
    variant: 'churma', 
    label: 'Churma', 
    price: 16000, 
    image: '/images/churma.jpg',
    description: 'Traditional Rajasthani sweet made with wheat flour and jaggery',
    rating: 4.5
  },
  { 
    type: 'laddoo', 
    variant: 'moti boondi', 
    label: 'Moti Boondi Ladoo', 
    price: 12000, 
    image: '/images/moti-boondi.jpg',
    description: 'Classic ladoo made with large boondi pearls and dry fruits',
    rating: 4.7
  },
  { 
    type: 'laddoo', 
    variant: 'barik boondi', 
    label: 'Barik Boondi Ladoo', 
    price: 12000, 
    image: '/images/barik-boondi.jpg',
    description: 'Soft and melt-in-mouth ladoo with fine boondi texture',
    rating: 4.6
  },
  { 
    type: 'barfi', 
    variant: 'besan', 
    label: 'Besan Barfi', 
    price: 12000, 
    image: '/images/besan-barfi.jpg',
    description: 'Aromatic gram flour barfi with pure ghee and cardamom',
    rating: 4.5
  },
  { 
    type: 'laddoo', 
    variant: 'besan', 
    label: 'Besan Ladoo', 
    price: 12000, 
    image: '/images/besan-ladoo.jpg',
    description: 'Traditional gram flour ladoo with roasted nuts',
    rating: 4.4
  },
];

// Product Card Component
const ProductCard: React.FC<{ product: Product; onSelect: (product: Product) => void }> = ({ 
  product, 
  onSelect 
}) => {
  const formatPrice = (price: number): string => {
    return `₹${(price / 100).toFixed(0)}`;
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 group"
      onClick={() => onSelect(product)}
    >
      <div className="relative overflow-hidden rounded-t-xl">
        <div className="h-48 bg-gradient-to-br from-orange-200 to-amber-200 flex items-center justify-center">
          <Package className="w-16 h-16 text-orange-500 opacity-50" />
        </div>
        
        {/* Favorite Icon */}
        <div className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Heart className="w-4 h-4 text-gray-400 hover:text-red-500 transition-colors" />
        </div>
        
        {/* Badge for premium items */}
        {product.price >= 17500 && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-2 py-1 rounded-full text-xs font-semibold">
            Premium
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">
            {product.label}
          </h3>
          {product.rating && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600">{product.rating}</span>
            </div>
          )}
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-orange-600">
            {formatPrice(product.price)}
            <span className="text-sm text-gray-500 font-normal">/kg</span>
          </div>
          <div className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-medium">
            Order Now
          </div>
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
            <p className="text-orange-600 font-bold text-lg">₹{(product.price / 100).toFixed(0)}/kg</p>
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

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ShoppingBag className="text-orange-500 w-10 h-10" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Sawamani Collection
            </h1>
            <ShoppingBag className="text-orange-500 w-10 h-10" />
          </div>
          
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mb-4">
              Select any one item to place a Sawamani order
            </h2>
            <p className="text-gray-600 text-lg">
              Tap on a card to continue with your order
            </p>
          </div>
          
          {/* Decorative line */}
          <div className="flex items-center justify-center mt-6">
            <div className="h-1 w-20 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full"></div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {PRODUCTS.map((product, index) => (
            <ProductCard
              key={`${product.type}-${product.variant}-${index}`}
              product={product}
              onSelect={handleProductSelect}
            />
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
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