"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import type { IProduct } from "../models/Product";
import { useCart } from '../app/context/CartContext';
import Image from "next/image";

export default function LatestProduct() {
  const [items, setItems] = useState<IProduct[]>([]);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchLatestItems = async () => {
      try {
        const productsRes = await axios.get("/api/product");

        const latestProducts = productsRes.data.filter(
          (p: IProduct) => p.type === "latest"
        );

        setItems(latestProducts);
      } catch (error) {
        console.error("Error fetching latest items:", error);
      }
    };

    fetchLatestItems();
  }, []);

  const handleAddToCart = (item: IProduct) => {
    if (!item._id) return;
    addToCart(item._id, 1);
  };

  if (items.length === 0) {
    return <div className="text-center py-8 text-gray-500">No latest products found.</div>;
  }

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Latest Products</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => (
          <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48 w-full">
              <Image
                src={item.image || "/placeholder-image.jpg"}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-green-600">
                  {item.pricing?.length > 0
                  ? `₹${item.pricing[0].price} per ${item.pricing[0].quantity}${item.pricing[0].unit}`
                  : "Price not available"}
                  </span>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                  onClick={() => handleAddToCart(item)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
