"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import AddProducts from "@/components/AddProduct";
import { Package, Edit, Trash2, Plus, IndianRupee } from "lucide-react";

// Updated interfaces to match the new pricing structure
interface Pricing {
  quantity: number;
  unit: 'gm' | 'kg' | 'piece' | 'dozen';
  price: number;
}

interface ProductPayload {
  name: string;
  description: string;
  type: string;
  pricing: Pricing[];
  imageBase64?: string;
  image?: string;
}

interface Product {
  _id?: string;
  name: string;
  description: string;
  image?: string;
  imageBase64?: string;
  type?: string;
  pricing: Pricing[];
}

export default function AdminPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [product, setProduct] = useState<Product>({ 
    name: '', 
    description: '', 
    pricing: [{ quantity: 0, unit: 'gm', price: 0 }]
  });

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/product");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAdd = () => {
    setProduct({ 
      name: '', 
      description: '', 
      pricing: [{ quantity: 0, unit: 'gm', price: 0 }]
    });
    setModalOpen(true);
  };

  const handleEdit = (p: Product) => {
    setProduct({
      ...p,
      // Ensure pricing array exists, even for old products
      pricing: p.pricing && p.pricing.length > 0 
        ? p.pricing 
        : [{ quantity: 0, unit: 'gm', price: 0 }]
    });
    setModalOpen(true);
  };

  const handleDelete = async (_id?: string) => {
    if (!_id || !confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`/api/product?id=${_id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  const handleSubmit = async () => {
    try {
      // Validate that all pricing options have valid values
      const validPricing = product.pricing.filter(p => p.quantity > 0 && p.price > 0);
      
      if (validPricing.length === 0) {
        alert("Please add at least one valid pricing option with quantity and price greater than 0");
        return;
      }

      const method = product._id ? "PUT" : "POST";
      const url = product._id ? `/api/product/${product._id}` : "/api/product";

      const payload: ProductPayload = {
        name: product.name,
        description: product.description,
        type: product.type || "none",
        pricing: validPricing
      };

      if (product.imageBase64?.startsWith("data:image")) {
        payload.imageBase64 = product.imageBase64;
      } else if (product.image) {
        payload.image = product.image;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to save product");
      }

      setModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error(error);
      alert(`Failed to save product: ${error}`);
    }
  };

  // Helper function to format pricing display
  const formatPricingDisplay = (pricing: Pricing[]): string => {
    if (!pricing || pricing.length === 0) return 'No pricing set';
    
    if (pricing.length === 1) {
      const p = pricing[0];
      return `${p.quantity} ${p.unit} - ₹${p.price}`;
    }
    
    const minPrice = Math.min(...pricing.map(p => p.price));
    const maxPrice = Math.max(...pricing.map(p => p.price));
    
    if (minPrice === maxPrice) {
      return `₹${minPrice} (${pricing.length} options)`;
    }
    
    return `₹${minPrice} - ₹${maxPrice} (${pricing.length} options)`;
  };

  // Helper function to get the cheapest price for sorting
  const getCheapestPrice = (pricing: Pricing[]): number => {
    if (!pricing || pricing.length === 0) return 0;
    return Math.min(...pricing.map(p => p.price));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Management</h1>
            <p className="text-gray-600">Manage your sweet products and pricing</p>
          </div>
          <button
            onClick={handleAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-semibold text-gray-900">{products.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <IndianRupee className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Price Range</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {products.length > 0 ? (
                    `₹${Math.min(...products.map(p => getCheapestPrice(p.pricing)))} - ₹${Math.max(...products.flatMap(p => p.pricing?.map(pr => pr.price) || [0]))}`
                  ) : '₹0'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Edit className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {new Set(products.map(p => p.type)).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
            <p className="text-gray-500 mb-6">Get started by adding your first product</p>
            <button
              onClick={handleAdd}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Your First Product
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <div key={p._id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                {/* Product Image */}
                {p.image && (
                  <div className="aspect-square relative overflow-hidden rounded-t-lg">
                    <Image
                      src={p.image}
                      alt={p.name || "Product Image"}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="p-6">
                  {/* Product Info */}
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{p.name}</h3>
                      {p.type && p.type !== 'none' && (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          p.type === 'popular' ? 'bg-yellow-100 text-yellow-800' :
                          p.type === 'latest' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {p.type}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{p.description}</p>
                    
                    {/* Pricing Display */}
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Pricing Options:</p>
                      {p.pricing && p.pricing.length > 0 ? (
                        <div className="space-y-1">
                          {p.pricing.slice(0, 3).map((pricing, index) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">
                                {pricing.quantity} {pricing.unit}
                              </span>
                              <span className="font-semibold text-green-700">
                                ₹{pricing.price}
                              </span>
                            </div>
                          ))}
                          {p.pricing.length > 3 && (
                            <p className="text-xs text-gray-500">
                              +{p.pricing.length - 3} more options
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No pricing set</p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(p)}
                      className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Product Modal */}
        <AddProducts
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
          product={product}
          setProduct={setProduct}
        />
      </div>
    </div>
  );
}