"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { useCart } from "../../context/CartContext";
import Link from "next/link";
import Navbar from "@/components/Navbar";

interface Box {
  _id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export default function BhajiCollection() {
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchBoxes = async () => {
      try {
        const res = await axios.get("/api/box");
        setBoxes(res.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching boxes:", error);
        setLoading(false);
      }
    };

    fetchBoxes();
  }, []);

  const handleAddToCart = async (box: Box, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!box._id) return;

    try {
      console.log('Adding bhaji box to cart:', { boxId: box._id });
      await addToCart(box._id, 1, {
        quantity: 1,
        unit: 'piece' as const,
        price: box.price
      });
      console.log('Successfully added bhaji box to cart');
    } catch (error) {
      console.error("Error adding bhaji box to cart:", error);
      alert('Failed to add item to cart. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white mt-10">
        <Navbar />
        <div className="flex justify-center items-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading bhaji collection...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white mt-16 py-12">
      <Navbar />

      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Bhaji Box Collection</h2>
            <p className="text-gray-600 text-lg mb-4">Explore our complete range of delicious bhaji boxes</p>
            <div className="w-24 h-1 bg-orange-500 mx-auto rounded-full"></div>
          </div>

          <div className="mb-6">
            <p className="text-gray-600">
              Showing <span className="font-semibold">{boxes.length}</span> products
            </p>
          </div>

          {boxes.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 text-6xl mb-4">🥘</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No bhaji boxes available</h3>
              <p className="text-gray-500">Check back later for new bhaji box arrivals!</p>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-8xl">
                {boxes.map((box, index) => (
                  <Link
                    key={box._id}
                    href={`/products/${box._id}?_pos=${index + 1}&_psq=bhaji&_ss=e&_v=1.0`}
                    className="block"
                  >
                    <div className="bg-white rounded-2xl shadow-lg overflow-visible hover:shadow-2xl transition-all duration-300 border border-orange-100 transform hover:-translate-y-1 cursor-pointer">
                      <div className="relative h-56 w-full overflow-hidden bg-gradient-to-br from-orange-100 to-orange-50">
                        <Image
                          src={box.image || "/placeholder-image.jpg"}
                          alt={box.name}
                          fill
                          className="object-cover hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                          Bhaji Box
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                      </div>

                      <div className="p-6 bg-gradient-to-br from-white to-orange-50/30">
                        <h3 className="font-bold text-xl mb-3 text-gray-800 line-clamp-1 text-center">
                          {box.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-6 line-clamp-2 leading-relaxed text-center">
                          {box.description}
                        </p>

                        <div className="mb-6 text-center">
                          <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                            <span className="text-sm font-semibold text-gray-700 block mb-1">
                              Price per box
                            </span>
                            <span className="text-2xl font-bold text-orange-600">
                              ₹{box.price}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3">
                          <button
                            type="button"
                            className="w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 hover:shadow-xl transform hover:-translate-y-1 hover:scale-105"
                            onClick={(e) => handleAddToCart(box, e)}
                          >
                            Add to Cart - ₹{box.price}
                          </button>
                        </div>

                        <p className="text-xs text-orange-600 mt-3 text-center font-medium">
                          Fresh & Hot Delivery
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
