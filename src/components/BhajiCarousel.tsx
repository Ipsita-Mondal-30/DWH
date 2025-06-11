"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useSession, signIn } from 'next-auth/react';
import Image from "next/image";
import Link from "next/link";
import { useCart } from '../app/context/CartContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SignInPopup from './SigninPopup';

interface Box {
  _id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export default function BhajiCarousel() {
  const [boxes, setBoxes] = useState<Box[]>([]);
  const { data: session, status } = useSession();
  const [showSignInPopup, setShowSignInPopup] = useState(false);
  const { addToCart } = useCart();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchBoxes = async () => {
      try {
        const res = await axios.get("/api/box");
        setBoxes(res.data);
      } catch (error) {
        console.error("Error fetching boxes:", error);
      }
    };
    fetchBoxes();
  }, []);

  const handleAddToCart = async (box: Box) => {
    if (!box._id) return;

    if (!session) {
      console.log("User is not logged in - showing popup");
      setShowSignInPopup(true);
      return;
    }

    try {
      await addToCart(box._id, 1, {
        quantity: 1,
        unit: 'piece',
        price: box.price
      });
      console.log('Successfully added bhaji box to cart');
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert('Failed to add item to cart. Please try again.');
    }
  };

  

  const handleSignIn = () => {
    signIn('google', { callbackUrl: window.location.href });
  };

  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -300, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 300, behavior: 'smooth' });
  };

  if (status !== "authenticated" && status !== "unauthenticated") {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (boxes.length === 0) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading bhaji boxes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-gradient-to-br from-orange-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Fresh Bhaji Boxes</h2>
          <div className="w-24 h-1 bg-orange-500 mx-auto rounded-full"></div>
        </div>

        <div className="relative">
          {boxes.length > 3 && (
            <>
              <button
                onClick={scrollLeft}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg border hover:shadow-xl border-orange-200 hover:border-orange-400"
                style={{ marginLeft: '-20px' }}
              >
                <ChevronLeft className="h-6 w-6 text-orange-600" />
              </button>

              <button
                onClick={scrollRight}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg border hover:shadow-xl border-orange-200 hover:border-orange-400"
                style={{ marginRight: '-20px' }}
              >
                <ChevronRight className="h-6 w-6 text-orange-600" />
              </button>
            </>
          )}

          <div
            id="bhaji-carousel"
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {boxes.map((box) => (
              <div 
                key={box._id} 
                className="flex-none w-80 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-orange-100 transform hover:-translate-y-1"
              >
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
                  <h3 className="font-bold text-xl mb-3 text-gray-800 text-center line-clamp-1">{box.name}</h3>
                  <p className="text-gray-600 text-sm mb-6 text-center line-clamp-2 leading-relaxed">{box.description}</p>

                  <div className="mb-6 text-center">
                    <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                      <span className="text-sm font-semibold text-gray-700 block mb-1">Price per box</span>
                      <span className="text-2xl font-bold text-orange-600">₹{box.price}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      className="w-full py-3 px-6 rounded-xl font-semibold shadow-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 hover:shadow-xl transform hover:-translate-y-1 hover:scale-105"
                      onClick={() => handleAddToCart(box)}
                    >
                      Add to Cart - ₹{box.price}
                    </button>
                    {/* Uncomment if customize logic added */}
                
                  </div>

                  <p className="text-xs text-orange-600 mt-3 text-center font-medium">Fresh & Hot Delivery</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-12">
          <Link href="/collections/bhaji">
            <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-10 py-4 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105">
              View All Bhaji Boxes
            </button>
          </Link>
        </div>

        <SignInPopup 
          isOpen={showSignInPopup}
          onClose={() => setShowSignInPopup(false)}
          onSignIn={handleSignIn}
        />

       

      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
