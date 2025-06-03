"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

// Custom Modal Component
function Modal({ isOpen, onClose, onSubmit, product, setProduct }) {
  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProduct((prev) => ({ ...prev, imageBase64: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
        <h2 className="text-xl font-bold">{product?._id ? "Edit" : "Add"} Product</h2>

        <input
          name="name"
          value={product.name || ""}
          onChange={handleChange}
          placeholder="Name"
          className="border p-2 w-full"
          required
        />

        <textarea
          name="description"
          value={product.description || ""}
          onChange={handleChange}
          placeholder="Description"
          className="border p-2 w-full"
        />

        <input type="file" accept="image/*" onChange={handleImageChange} className="w-full" />

        {product.imageBase64 ? (
          <img
            src={product.imageBase64}
            alt="Preview"
            className="mt-2 max-h-48 object-contain"
          />
        ) : product.image ? (
          <Image
            src={product.image}
            alt={product.name || "Product Image"}
            width={200}
            height={200}
            className="mt-2 object-contain"
          />
        ) : null}

        <select
          name="type"
          value={product.type || "none"}
          onChange={handleChange}
          className="border p-2 w-full"
        >
          <option value="none">None</option>
          <option value="popular">Popular</option>
          <option value="latest">Latest</option>
        </select>

        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="bg-gray-400 text-white px-4 py-2 rounded"
            type="button"
          >
            Cancel
          </button>
          <button onClick={onSubmit} className="bg-blue-600 text-white px-4 py-2 rounded" type="button">
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

// Admin Panel Component
export default function AdminPanel() {
  const [products, setProducts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [product, setProduct] = useState({});

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
    setProduct({});
    setModalOpen(true);
  };

  const handleEdit = (p) => {
    setProduct(p);
    setModalOpen(true);
  };

  const handleDelete = async (_id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      // Your backend DELETE expects query param ?id=xxx based on your code
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

      // Prepare payload with base64 image if new image selected
      const payload = {
        name: product.name,
        description: product.description,
        type: product.type || "none",
      };

      if (product.imageBase64 && product.imageBase64.startsWith("data:image")) {
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
        throw new Error("Failed to save product");
      }

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
            <p className="text-sm text-gray-500">{p.type}</p>

            <div className="flex justify-between">
              <button
                onClick={() => handleEdit(p)}
                className="bg-yellow-500 text-white px-2 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(p._id)}
                className="bg-red-600 text-white px-2 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        product={product}
        setProduct={setProduct}
      />
    </div>
  );
}
