"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import AddProducts from "@/components/AddProduct"

interface Product {
  _id?: string;
  name: string;
  description: string;
  image?: string;
  imageBase64?: string;
  type?: string;
  price?: number;
}

export default function AdminPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [product, setProduct] = useState<Product>({ name: '', description: '' });

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
    setProduct({ name: '', description: '' });
    setModalOpen(true);
  };

  const handleEdit = (p: Product) => {
    setProduct(p);
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
      const method = product._id ? "PUT" : "POST";
      const url = product._id ? `/api/product/${product._id}` : "/api/product";

      const payload: any = {
        name: product.name,
        description: product.description,
        type: product.type || "none",
        price: product.price || 0,
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

      if (!res.ok) throw new Error("Failed to save product");

      setModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error(error);
      alert("Failed to save product");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      <button
        onClick={handleAdd}
        className="bg-green-600 text-white px-4 py-2 rounded mb-4"
      >
        Add Product
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map((p) => (
          <div key={p._id} className="border rounded p-4 space-y-2">
            {p.image && (
              <Image
                src={p.image}
                alt={p.name || "Product Image"}
                width={200}
                height={200}
                className="object-cover"
              />
            )}
            <h2 className="text-lg font-bold">{p.name}</h2>
            <p>{p.description}</p>
            <p className="text-sm text-gray-500 capitalize">{p.type}</p>
            <p className="text-sm font-semibold text-green-700">₹ {p.price?.toFixed(2)}</p>

            <div className="flex justify-between mt-2">
              <button
                onClick={() => handleEdit(p)}
                className="bg-yellow-500 text-white px-3 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(p._id)}
                className="bg-red-600 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <AddProducts
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        product={product}
        setProduct={setProduct}
      />
    </div>
  );
}
