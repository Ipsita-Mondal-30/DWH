"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import AddProducts from "@/components/AddProduct";
import AddBox from "@/components/AddBox";
import AddNamkeen from "@/components/AddNamkeen";
import { Package, Edit, Trash2, Plus, IndianRupee, Box, Cookie } from "lucide-react";
import { useRouter } from "next/navigation";

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
interface BoxPayload {
  name: string;
  description: string;
  type: string;
  pricing: Pricing[];
  price: number;
  imageBase64?: string;
  image?: string;
}

interface BoxItem {
  _id?: string;
  name: string;
  description: string;
  image?: string;
  imageBase64?: string;
  price: number;
}

interface Namkeen {
  _id?: string;
  name: string;
  description: string;
  image?: string;
  imageBase64?: string;
  type?: string;
  pricing: Pricing[];
}



export default function AdminPanel() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [boxes, setBoxes] = useState<BoxItem[]>([]);
  const [namkeens, setNamkeens] = useState<Namkeen[]>([]);
  
  // Modal states
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [boxModalOpen, setBoxModalOpen] = useState(false);
  const [namkeenModalOpen, setNamkeenModalOpen] = useState(false);
  
  // Current items being edited
  const [product, setProduct] = useState<Product>({ 
    name: '', 
    description: '', 
    pricing: [{ quantity: 0, unit: 'gm', price: 0 }]
  });
  const [box, setBox] = useState<BoxItem>({ 
    name: '', 
    description: '', 
    price: 0
  });
  const [namkeen, setNamkeen] = useState<Namkeen>({ 
    name: '', 
    description: '', 
    pricing: [{ quantity: 0, unit: 'gm', price: 0 }]
  });

  // Fetch functions
  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/product");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
  };

  const fetchBoxes = async () => {
    try {
      const res = await fetch("/api/box");
      const data = await res.json();
      setBoxes(data);
    } catch (err) {
      console.error("Failed to fetch boxes", err);
    }
  };

  const fetchNamkeens = async () => {
    try {
      const res = await fetch("/api/namkeen");
      const data = await res.json();
      setNamkeens(data);
    } catch (err) {
      console.error("Failed to fetch namkeens", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchBoxes();
    fetchNamkeens();
  }, []);

  // Add handlers
  const handleAddProduct = () => {
    setProduct({ 
      name: '', 
      description: '', 
      pricing: [{ quantity: 0, unit: 'gm', price: 0 }]
    });
    setProductModalOpen(true);
  };

  const handleAddBox = () => {
    setBox({ 
      name: '', 
      description: '', 
      price: 0
    });
    setBoxModalOpen(true);
  };

  const handleAddNamkeen = () => {
    setNamkeen({ 
      name: '', 
      description: '', 
      pricing: [{ quantity: 0, unit: 'gm', price: 0 }]
    });
    setNamkeenModalOpen(true);
  };

  // Edit handlers
  const handleEditProduct = (p: Product) => {
    setProduct({
      ...p,
      pricing: p.pricing && p.pricing.length > 0 
        ? p.pricing 
        : [{ quantity: 0, unit: 'gm', price: 0 }]
    });
    setProductModalOpen(true);
  };

  const handleEditBox = (b: BoxItem) => {
    setBox(b);
    setBoxModalOpen(true);
  };

  const handleEditNamkeen = (n: Namkeen) => {
    setNamkeen({
      ...n,
      pricing: n.pricing && n.pricing.length > 0 
        ? n.pricing 
        : [{ quantity: 0, unit: 'gm', price: 0 }]
    });
    setNamkeenModalOpen(true);
  };

  // Delete handlers
  const handleDeleteProduct = async (_id?: string) => {
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

  const handleDeleteBox = async (_id?: string) => {
    if (!_id || !confirm("Are you sure you want to delete this box?")) return;

    try {
      const res = await fetch(`/api/box?id=${_id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      fetchBoxes();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  const handleDeleteNamkeen = async (_id?: string) => {
    if (!_id || !confirm("Are you sure you want to delete this namkeen?")) return;

    try {
      const res = await fetch(`/api/namkeen?id=${_id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      fetchNamkeens();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  // Submit handlers
  const handleSubmitProduct = async () => {
    try {
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

      setProductModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error(error);
      alert(`Failed to save product: ${error}`);
    }
  };

  const handleSubmitBox = async () => {
    try {
      if (!box.name.trim() || !box.description.trim() || box.price <= 0) {
        alert("Please fill in all required fields");
        return;
      }

      const method = box._id ? "PUT" : "POST";
      const url = box._id ? `/api/box/${box._id}` : "/api/box";

      const payload: BoxPayload = {
        name: box.name,
        description: box.description,
        price: box.price,
        type: "default", // Add a default type value
        pricing: [{ quantity: 0, unit: "piece", price: 0 }] // Add a default pricing array
      };

      if (box.imageBase64?.startsWith("data:image")) {
        payload.imageBase64 = box.imageBase64;
      } else if (box.image) {
        payload.image = box.image;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to save box");
      }

      setBoxModalOpen(false);
      fetchBoxes();
    } catch (error) {
      console.error(error);
      alert(`Failed to save box: ${error}`);
    }
  };

  const handleSubmitNamkeen = async () => {
    try {
      const validPricing = namkeen.pricing.filter(p => p.quantity > 0 && p.price > 0);
      
      if (validPricing.length === 0) {
        alert("Please add at least one valid pricing option with quantity and price greater than 0");
        return;
      }

      const method = namkeen._id ? "PUT" : "POST";
      const url = namkeen._id ? `/api/namkeen/${namkeen._id}` : "/api/namkeen";

      const payload: Partial<Namkeen> = {
        name: namkeen.name,
        description: namkeen.description,
        type: namkeen.type || "none",
        pricing: validPricing
      };

      if (namkeen.imageBase64?.startsWith("data:image")) {
        payload.imageBase64 = namkeen.imageBase64;
      } else if (namkeen.image) {
        payload.image = namkeen.image;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to save namkeen");
      }

      setNamkeenModalOpen(false);
      fetchNamkeens();
    } catch (error) {
      console.error(error);
      alert(`Failed to save namkeen: ${error}`);
    }
  };


  const totalProducts = products.length + boxes.length + namkeens.length;
  const allPrices = [
    ...products.flatMap(p => p.pricing?.map(pr => pr.price) || [0]),
    ...boxes.map(b => b.price),
    ...namkeens.flatMap(n => n.pricing?.map(pr => pr.price) || [0])
  ].filter(price => price > 0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0;
  const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : 0;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">

<div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Management</h1>
          <p className="text-gray-600">Manage your sweets, boxes, and namkeens</p>
        </div>

        {/* Desktop Buttons */}
        <div className="hidden md:flex gap-x-2">
          <button
            onClick={handleAddProduct}
            className="bg-blue-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Sweet
          </button>
          <button
            onClick={handleAddBox}
            className="bg-blue-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Box className="w-5 h-5" />
            Add Box
          </button>
          <button
            onClick={handleAddNamkeen}
            className="bg-blue-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Cookie className="w-5 h-5" />
            Add Namkeen
          </button>
          <button 
            onClick={() => router.push('/admin/enquiries')}
            className="bg-blue-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
          >
            Enquiries
          </button>
          <button 
            onClick={() => router.push('/admin/sawamani')}
            className="bg-blue-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
          >
            Sawamani Orders
          </button>
        </div>
      </div>

      {/* Mobile Floating Button */}
      <div className="md:hidden">
        <button
          onClick={() => setDrawerOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg z-50"
        >
          <Plus className="w-6 h-6" />
        </button>

        {/* Drawer */}
        <div
          className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ${
            drawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex justify-end p-4">
            <button onClick={() => setDrawerOpen(false)} className="text-gray-600 hover:text-black text-2xl">
              x
            </button>
          </div>
          <div className="flex flex-col gap-4 p-4">
            <button
              onClick={() => {
                handleAddProduct();
                setDrawerOpen(false);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Sweet
            </button>
            <button
              onClick={() => {
                handleAddBox();
                setDrawerOpen(false);
              }}
              className="bg-blue-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Box className="w-5 h-5" />
              Add Box
            </button>
            <button
              onClick={() => {
                handleAddNamkeen();
                setDrawerOpen(false);
              }}
              className="bg-blue-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Cookie className="w-5 h-5" />
              Add Namkeen
            </button>
            <button
              onClick={() => {
                router.push("/admin/enquiries");
                setDrawerOpen(false);
              }}
              className="bg-blue-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              Enquiries
            </button>
            <button
              onClick={() => {
                router.push("/admin/sawamani");
                setDrawerOpen(false);
              }}
              className="bg-blue-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              Sawamani Orders
            </button>
          </div>
        </div>
      </div>

        {/* Stats */}
{/* Stats */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
  <div className="bg-white p-6 rounded-lg shadow-sm border">
    <div className="flex items-center">
      <div className="p-2 bg-blue-100 rounded-lg">
        <Package className="w-6 h-6 text-blue-600" />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">Total Products</p>
        <p className="text-2xl font-semibold text-gray-900">{totalProducts}</p>
      </div>
    </div>
  </div>

  <div className="bg-white p-6 rounded-lg shadow-sm border">
    <div className="flex items-center">
      <div className="p-2 bg-blue-100 rounded-lg">
        <Package className="w-6 h-6 text-blue-600" />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">Sweets</p>
        <p className="text-2xl font-semibold text-gray-900">{products.length}</p>
      </div>
    </div>
  </div>

  <div className="bg-white p-6 rounded-lg shadow-sm border">
    <div className="flex items-center">
      <div className="p-2 bg-orange-100 rounded-lg">
        <Box className="w-6 h-6 text-orange-600" />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">Boxes</p>
        <p className="text-2xl font-semibold text-gray-900">{boxes.length}</p>
      </div>
    </div>
  </div>

  <div className="bg-white p-6 rounded-lg shadow-sm border">
    <div className="flex items-center">
      <div className="p-2 bg-green-100 rounded-lg">
        <Cookie className="w-6 h-6 text-green-600" />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">Namkeens</p>
        <p className="text-2xl font-semibold text-gray-900">{namkeens.length}</p>
      </div>
    </div>
  </div>
</div>

{/* Price Range Stats */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
  <div className="bg-white p-6 rounded-lg shadow-sm border">
    <div className="flex items-center">
      <div className="p-2 bg-green-100 rounded-lg">
        <IndianRupee className="w-6 h-6 text-green-600" />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">Price Range</p>
        <p className="text-2xl font-semibold text-gray-900">
          {totalProducts > 0 ? `₹${minPrice} - ₹${maxPrice}` : '₹0'}
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
          {new Set([...products.map(p => p.type), ...namkeens.map(n => n.type)].filter(Boolean)).size}
        </p>
      </div>
    </div>
  </div>
</div>


        {/* Products Section */}
        {totalProducts === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
            <p className="text-gray-500 mb-6">Get started by adding your first product</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleAddProduct}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Sweet
              </button>
              <button
                onClick={handleAddBox}
                className="bg-blue-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Box className="w-5 h-5" />
                Add Box
              </button>
              <button
                onClick={handleAddNamkeen}
                className="bg-blue-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Cookie className="w-5 h-5" />
                Add Namkeen
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Sweets Section */}
            {products.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Sweets ({products.length})</h2>
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((p) => (
                  <div
                    key={p._id}
                    className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow w-full sm:max-w-sm mx-auto"
                  >
                    {p.image && (
                      <div className="relative overflow-hidden rounded-t-lg h-48 sm:h-64">
                        <Image
                          src={p.image}
                          alt={p.name || "Product Image"}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    <div className="p-4 sm:p-6">
                      <div className="mb-3 sm:mb-4">
                        <div className="flex items-start justify-between mb-1 sm:mb-2">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2">
                            {p.name}
                          </h3>
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

                        <p className="text-gray-600 text-sm mb-2 sm:mb-3 line-clamp-2">{p.description}</p>

                        <div className="mb-3 sm:mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-1 sm:mb-2">Pricing Options:</p>
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

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditProduct(p)}
                          className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg flex items-center justify-center gap-1 sm:gap-2 transition-colors text-sm sm:text-base"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p._id)}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg flex items-center justify-center gap-1 sm:gap-2 transition-colors text-sm sm:text-base"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                </div>
              </div>
            )}

            {/* Boxes Section */}
            {boxes.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Boxes ({boxes.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {boxes.map((b) => (
                  <div
                    key={b._id}
                    className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow w-full sm:max-w-sm mx-auto"
                  >
                    {b.image && (
                      <div className="relative overflow-hidden rounded-t-lg h-48 sm:h-64">
                        <Image
                          src={b.image}
                          alt={b.name || "Box Image"}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    <div className="p-4 sm:p-6">
                      <div className="mb-3 sm:mb-4">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
                          {b.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2 sm:mb-3 line-clamp-2">
                          {b.description}
                        </p>
                        <div className="text-xl sm:text-2xl font-bold text-orange-600">
                          ₹{b.price}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditBox(b)}
                          className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg flex items-center justify-center gap-1 sm:gap-2 transition-colors text-sm sm:text-base"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteBox(b._id)}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg flex items-center justify-center gap-1 sm:gap-2 transition-colors text-sm sm:text-base"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                </div>
              </div>
            )}

            {/* Namkeens Section */}
            {namkeens.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Namkeens ({namkeens.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {namkeens.map((n) => (
                  <div
                    key={n._id}
                    className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow w-full sm:max-w-sm mx-auto"
                  >
                    {n.image && (
                      <div className="relative overflow-hidden rounded-t-lg h-48 sm:h-64">
                        <Image
                          src={n.image}
                          alt={n.name || "Namkeen Image"}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    <div className="p-4 sm:p-6">
                      <div className="mb-3 sm:mb-4">
                        <div className="flex items-start justify-between mb-1 sm:mb-2">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2">
                            {n.name}
                          </h3>
                          {n.type && n.type !== 'none' && (
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              n.type === 'popular' ? 'bg-yellow-100 text-yellow-800' :
                              n.type === 'latest' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {n.type}
                            </span>
                          )}
                        </div>

                        <p className="text-gray-600 text-sm mb-2 sm:mb-3 line-clamp-2">{n.description}</p>

                        <div className="mb-3 sm:mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-1 sm:mb-2">Pricing Options:</p>
                          {n.pricing && n.pricing.length > 0 ? (
                            <div className="space-y-1">
                              {n.pricing.slice(0, 3).map((pricing, index) => (
                                <div key={index} className="flex justify-between items-center text-sm">
                                  <span className="text-gray-600">
                                    {pricing.quantity} {pricing.unit}
                                  </span>
                                  <span className="font-semibold text-green-700">
                                    ₹{pricing.price}
                                  </span>
                                </div>
                              ))}
                              {n.pricing.length > 3 && (
                                <p className="text-xs text-gray-500">
                                  +{n.pricing.length - 3} more options
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">No pricing set</p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditNamkeen(n)}
                          className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg flex items-center justify-center gap-1 sm:gap-2 transition-colors text-sm sm:text-base"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteNamkeen(n._id)}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg flex items-center justify-center gap-1 sm:gap-2 transition-colors text-sm sm:text-base"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                </div>
              </div>
            )}
          </div>
        )}

        {/* Modals */}
        <AddProducts
          isOpen={productModalOpen}
          onClose={() => setProductModalOpen(false)}
          onSubmit={handleSubmitProduct}
          product={product}
          setProduct={setProduct}
        />

        <AddBox
          isOpen={boxModalOpen}
          onClose={() => setBoxModalOpen(false)}
          onSubmit={handleSubmitBox}
          box={box}
          setBox={setBox}
        />

        <AddNamkeen
          isOpen={namkeenModalOpen}
          onClose={() => setNamkeenModalOpen(false)}
          onSubmit={handleSubmitNamkeen}
          namkeen={namkeen}
          setNamkeen={setNamkeen}
        />
      </div>
    </div>
  );
}