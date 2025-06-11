"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from 'next-auth/react';
import Image from "next/image";
import Link from "next/link";
import { useCart } from '../app/context/CartContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SignInPopup from './SigninPopup'; // Import the popup component
import BhajiForm from './BhajiForm';

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
  const [selectedBox, setSelectedBox] = useState<Box | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchBoxes = async () => {
      try {
        const response = await fetch('/api/box');
        if (!response.ok) {
          throw new Error('Failed to fetch boxes');
        }
        const data = await response.json();
        setBoxes(data);
      } catch (error) {
        console.error("Error fetching bhaji boxes:", error);
      }
    };

    fetchBoxes();
  }, []);

  const handleBoxSelect = (box: Box) => {
    setSelectedBox(box);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedBox(null);
  };

  const handleAddToCart = async (item: Box) => {
    if (!item._id) return;
    
    // Check if user is authenticated
    if (!session) {
      console.log("User is not logged in - showing popup");
      setShowSignInPopup(true);
      return;
    }
    
    try {
      console.log('Adding bhaji box to cart:', { itemId: item._id }); // Debug log
      // For bhaji boxes, we use a simple pricing structure
      const pricing = {
        quantity: 1,
        unit: 'piece' as const,
        price: item.price
      };
      await addToCart(item._id, 1, pricing);
      console.log('Successfully added bhaji box to cart'); // Debug log
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert('Failed to add item to cart. Please try again.');
    }
  };

  const handleSignIn = () => {
    // Trigger Google sign-in using NextAuth
    signIn('google', { 
      callbackUrl: window.location.href // Redirect back to current page after sign-in
    });
  };

  const scrollLeft = () => {
    const container = document.getElementById('bhaji-carousel');
    if (container) {
      container.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const container = document.getElementById('bhaji-carousel');
    if (container) {
      container.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  // Show loading state while session is being determined
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
        
        {/* Carousel Container */}
        <div className="relative">
          {/* Left Arrow */}
          {boxes.length > 3 && (
            <button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-all duration-200 border border-gray-200"
              style={{ marginLeft: '-20px' }}
            >
              <ChevronLeft className="h-6 w-6 text-gray-600" />
            </button>
          )}

          {/* Right Arrow */}
          {boxes.length > 3 && (
            <button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-all duration-200 border border-gray-200"
              style={{ marginRight: '-20px' }}
            >
              <ChevronRight className="h-6 w-6 text-gray-600" />
            </button>
          )}

          {/* Scrollable Container */}
          <div
            id="bhaji-carousel"
            className="flex overflow-x-auto scrollbar-hide gap-8 pb-4"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {boxes.map((item) => {
              return (
                <div 
                  key={item._id} 
                  className="flex-none w-80 bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-orange-100 transform hover:-translate-y-1"
                >
                  {/* Product Image */}
                  <div className="relative h-56 w-full overflow-hidden bg-gradient-to-br from-orange-100 to-orange-50">
                    <Image
                      src={item.image || "/placeholder-image.jpg"}
                      alt={item.name}
                      fill
                      className="object-cover hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                      Bhaji Box
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                  </div>

                  {/* Product Details */}
                  <div className="p-6 bg-gradient-to-br from-white to-orange-50/30">
                    <h3 className="font-bold text-xl mb-3 text-gray-800 line-clamp-1 text-center">
                      {item.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-6 line-clamp-2 leading-relaxed text-center">
                      {item.description}
                    </p>

                    {/* Price Display */}
                    <div className="mb-6">
                      <div className="text-center">
                        <span className="text-3xl font-bold text-orange-600">
                          ₹{item.price}
                        </span>
                        <p className="text-sm text-gray-500 mt-1">Per Box</p>
                      </div>
                    </div>

                    {/* Action Buttons - Centered */}
                    <div className="flex justify-center space-x-3">
                     
                      <button
                        type="button"
                        className="flex-1 max-w-xs py-3 px-4 rounded-xl font-semibold transition-all duration-300 shadow-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 hover:shadow-xl transform hover:-translate-y-1 hover:scale-105"
                        onClick={() => handleAddToCart(item)}
                      >
                        Add to Cart
                      </button>
                    </div>

                    {/* Additional Info */}
                    <p className="text-xs text-orange-600 mt-3 text-center font-medium">
                      Fresh & Ready to Eat
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* View More Button */}
        {boxes.length > 0 && (
          <div className="flex justify-center mt-12">
            <Link href="/collections/bhaji">
              <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-10 py-4 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105">
                View All Bhaji Boxes
              </button>
            </Link>
          </div>
        )}
        
        {/* Sign In Popup */}
        <SignInPopup 
          isOpen={showSignInPopup}
          onClose={() => setShowSignInPopup(false)}
          onSignIn={handleSignIn}
        />

        {/* Bhaji Form Modal */}
        {showForm && selectedBox && (
          <BhajiForm
            isOpen={showForm}
            onClose={handleFormClose}
            box={selectedBox}
          />
        )}
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