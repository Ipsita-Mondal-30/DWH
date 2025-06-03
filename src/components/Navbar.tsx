"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { FiUser, FiHeart, FiShoppingBag, FiSearch } from "react-icons/fi";
import images from "@/public/dwh.png"; // Adjust the path as necessary

export default function Navbar() {
  const { data: session } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !(dropdownRef.current as any).contains(event.target)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-gradient-to-r from-white via-amber-50 to-white shadow-lg border-b-4 border-amber-400">
      <div className="flex items-center justify-between px-4 py-2 max-w-7xl mx-auto">
        {/* Search Bar */}
        <div className="flex items-center w-1/3">
          <div className="relative w-full group max-w-sm">
            <input
              type="text"
              placeholder="Search delicious treats..."
              className="w-full px-4 py-2 text-gray-700 bg-white/80 backdrop-blur-sm rounded-full border border-amber-200 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100 transition-all duration-300 placeholder-gray-500 shadow-sm text-sm"
            />
            <button className="absolute right-0 top-0 px-4 py-2 text-white bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 rounded-r-full transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 border border-amber-500">
              <FiSearch className="text-sm" />
            </button>
          </div>
        </div>

        {/* Logo */}
        <div className="w-1/3 flex justify-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            <img
              src="/dwh.png"
              alt="Haldiram's Logo"
              className="relative h-12 object-contain filter drop-shadow-md hover:drop-shadow-lg transition-all duration-300 transform hover:scale-105"
            />
          </div>
        </div>

        {/* Icons + Dropdown */}
        <div className="w-1/3 flex justify-end space-x-4 relative items-center">
          <div ref={dropdownRef} className="relative">
          <div 
              className="p-2 rounded-full bg-gradient-to-br from-amber-100 to-yellow-100 hover:from-amber-200 hover:to-yellow-200 cursor-pointer transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-110 border border-amber-200"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <FiUser className="text-lg text-amber-700" />
            </div>
            {showDropdown && (
              <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-md border border-amber-200 rounded-2xl shadow-2xl z-10 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                {session ? (
                  <div className="px-6 py-5 bg-gradient-to-br from-amber-50 to-yellow-50">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
                        <FiUser className="text-white text-lg" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Welcome back!</p>
                        <p className="font-semibold text-gray-800 truncate">{session.user?.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => signOut()}
                      className="w-full px-4 py-3 text-white bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="p-2">
                    <button
                      onClick={() => signIn("google")}
                      className="flex items-center justify-center w-full px-6 py-4 text-gray-700 hover:bg-gradient-to-r hover:from-amber-50 hover:to-yellow-50 rounded-xl transition-all duration-300 font-medium space-x-3 group"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-red-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <span className="text-white text-sm font-bold">G</span>
                      </div>
                      <span>Sign in with Google</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-2 rounded-full bg-gradient-to-br from-pink-100 to-red-100 hover:from-pink-200 hover:to-red-200 cursor-pointer transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-110 border border-pink-200 group">
            <FiHeart className="text-lg text-pink-600 group-hover:fill-current transition-all duration-300" />
          </div>

          <div className="p-2 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 hover:from-green-200 hover:to-emerald-200 cursor-pointer transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-110 border border-green-200 relative group">
            <FiShoppingBag className="text-lg text-green-600" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">3</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}