"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Product } from '../../../models/Product';
import Image from 'next/image';

export default function ProductPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const productId = params.id as string;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        console.log('Fetching product with ID:', productId);
        setLoading(true);
        
        const response = await fetch(`/api/product/${productId}`);
        console.log('API Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const productData = await response.json();
        console.log('Product data received:', productData);
        setProduct(productData);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch product');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
          <p className="text-sm text-gray-400">ID: {productId}</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-2">{error || 'The product you are looking for does not exist.'}</p>
          <p className="text-sm text-gray-400">Product ID: {productId}</p>
          <button 
            onClick={() => window.history.back()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            
            {/* Product Image */}
            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 relative">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <span className="text-gray-400 text-lg">No Image Available</span>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                {product.name}
              </h1>
              
              {product.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {product.type && (
                <div className="mb-6">
                  <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                    {product.type}
                  </span>
                </div>
              )}

              {/* Pricing */}
              {product.pricing && product.pricing.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Pricing Options</h3>
                  <div className="space-y-2">
                    {product.pricing.map((price, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700">
                          {price.quantity} {price.unit}
                        </span>
                        <span className="font-semibold text-green-600">
                          ₹{price.price}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Default pricing if no pricing array */}
              {product.price && (!product.pricing || product.pricing.length === 0) && (
                <div className="mb-6">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl font-bold text-green-600">
                      From ₹{product.price}
                    </span>
                    <span className="text-lg text-gray-500 line-through">
                      ₹{(product.price * 1.2).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Add to Cart Button */}
              <div className="mt-auto">
                <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Debug Info - Remove in production */}
        {/* <div className="mt-4 p-4 bg-gray-100 rounded-lg text-sm text-gray-600">
          <h4 className="font-semibold mb-2">Debug Info:</h4>
          <p>Product ID: {productId}</p>
          <p>Search Position: {searchParams.get('_pos')}</p>
          <p>Search Query: {searchParams.get('_psq')}</p>
          <p>API URL: /api/product/{productId}</p>
        </div> */}
      </div>
    </div>
  );
}