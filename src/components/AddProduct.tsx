"use client";

import { Dispatch, SetStateAction, ChangeEvent } from "react";
import Image from "next/image";

interface Product {
  _id?: string;
  name: string;
  description: string;
  image?: string;
  imageBase64?: string;
  type?: string;
  price?: number;
}

interface AddProductProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  product: Product;
  setProduct: Dispatch<SetStateAction<Product>>;
}

export default function AddProducts({
  isOpen,
  onClose,
  onSubmit,
  product,
  setProduct,
}: AddProductProps) {
  if (!isOpen) return null;

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // If price, cast to number
    if (name === "price") {
      setProduct((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setProduct((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProduct((prev) => ({ ...prev, imageBase64: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
        <h2 className="text-xl font-bold">
          {product?._id ? "Edit Product" : "Add Product"}
        </h2>

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

        <input
          name="price"
          type="number"
          value={product.price || ""}
          onChange={handleChange}
          placeholder="Price"
          className="border p-2 w-full"
          required
        />

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full"
        />

        {product.imageBase64 ? (
          <Image
            alt="Preview"
            width={200}
            height={200}
            src={product.imageBase64}
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
          <button
            onClick={onSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded"
            type="button"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}