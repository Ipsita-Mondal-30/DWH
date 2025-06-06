"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { FiUser, FiShoppingBag, FiSearch, FiChevronDown, FiX } from "react-icons/fi";
import { useCart } from '../app/context/CartContext';
import { useProducts } from '../hooks/useProducts';
import Link from "next/link"; 
import Image from "next/image";
import CartDrawer from "./CartDrawer";
import { Product } from "../models/Product"

// Helper function to create URL slug from product name
const createSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
};
// Import the Product type from useProducts
export default function Navbar() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cart } = useCart();

  const toggleCart = () => setIsCartOpen(!isCartOpen);

  const { data: session } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMoreDropdown, setShowMoreDropdown] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);

  // Get all products for search
  const { data: products = [], isLoading: isLoadingProducts } = useProducts();

  // Close dropdown on outside click
  const dropdownRef = useRef<HTMLDivElement>(null);
  const moreDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
      if (
        moreDropdownRef.current &&
        !moreDropdownRef.current.contains(event.target as Node)
      ) {
        setShowMoreDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle search with debouncing
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchQuery && products.length > 0) {
        const filtered = products
          .filter((product) =>
            product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .slice(0, 8);
        setSearchResults(filtered);
      } else {
        setSearchResults([]);
      }
    }, 300);
  
    return () => clearTimeout(timeout);
  }, [searchQuery, products]);
  
  
  // Handle product click
  const handleProductClick = (product: Product) => {
    const slug = createSlug(product.name);
    const searchParams = new URLSearchParams({
      _pos: '1',
      _psq: searchQuery.substring(0, 4),
      _ss: 'e',
      _v: '1.0'
    });
    
    // Navigate to product page
    window.location.href = `/products/${slug}?${searchParams.toString()}`;
  };

  // Close search modal
  const closeSearchModal = () => {
    setShowSearchModal(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <div className="relative">
      <div className="bg-white shadow-md border-b">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          
          {/* Logo - Left Side */}
          <div className="flex items-center">
            <Link href="/">
              <Image
                src="/delwh.png"
                alt="Vaishnavi Logo"
                className="h-16 object-contain cursor-pointer"
                width={120}
                height={64}
              />
            </Link>
          </div>

          {/* Navigation Links - Center */}
          <div className="flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors relative group"
            >
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            
            <Link 
              href="/collections/sweets" 
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors relative group"
            >
              Sweets
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            
            <Link 
              href="/collections/savouries" 
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors relative group"
            >
              Savouries
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            
            <Link 
              href="/pages/about-us" 
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors relative group"
            >
              About us
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            

            {/* More Dropdown */}
            <div ref={moreDropdownRef} className="relative">
              <button
                onClick={() => setShowMoreDropdown(!showMoreDropdown)}
                className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                <span>More</span>
                <FiChevronDown className={`text-sm transition-transform ${showMoreDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showMoreDropdown && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="py-1">
                    <a
                      href="https://api.whatsapp.com/send/?phone=919888484988&text&type=phone_number&app_absent=0"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Chat with Us
                    </a>
                    <a
                      href="https://your-order-track.shiprocket.co/tracking"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Track Your Order
                    </a>
                    <Link
                      href="/pages/contact-us"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Contact Us
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Icons */}
          <div className="flex justify-end items-center space-x-4">
            
            {/* Welcome Message when signed in */}
            {session && (
              <div className="text-sm text-gray-600">
                🎉 Welcome, {session.user?.name?.split(' ')[0] || session.user?.email?.split('@')[0]}!
              </div>
            )}

            {/* Icons Section */}
            <div className="flex items-center space-x-3">
              
              {/* Search Icon */}
              <div 
                className="p-2 hover:bg-gray-100 cursor-pointer transition-colors rounded"
                onClick={() => setShowSearchModal(true)}
              >
                <FiSearch className="text-lg text-gray-700" />
              </div>
              
              {/* User Icon with Dropdown */}
              <div ref={dropdownRef} className="relative">
                <div
                  className="p-2 hover:bg-gray-100 cursor-pointer transition-colors rounded"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <FiUser className="text-lg text-gray-700" />
                </div>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    {session ? (
                      <div className="py-2">
                        {/* Welcome Section */}
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="flex items-center space-x-2">
                            <FiUser className="text-lg text-gray-600" />
                            <span className="text-sm font-medium text-gray-800">
                              Welcome, {session.user?.name?.split(' ')[0] || session.user?.email?.split('@')[0]}
                            </span>
                          </div>
                        </div>
                        
                        {/* Menu Items */}
                        <div className="py-1">
                          <Link href="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            My Account
                          </Link>
                          <Link href="/wishlist" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            My Wish List
                          </Link>
                          <Link href="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            My Orders
                          </Link>
                        </div>

                        {/* Sign Out Section */}
                        <div className="border-t border-gray-100 py-1">
                          <button
                            onClick={() => signOut()}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            Sign Out
                          </button>
                          <div className="px-4 py-2 text-sm text-gray-700">
                            Reward Points
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2">
                        <button
                          onClick={() => signIn("google")}
                          className="flex items-center justify-center w-full px-6 py-4 text-gray-700 hover:bg-gray-50 rounded transition-colors font-medium space-x-3"
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-red-500 flex items-center justify-center">
                            <span className="text-white text-sm font-bold">G</span>
                          </div>
                          <span>Sign in with Google</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Cart Icon - always visible */}
              <div className="relative cursor-pointer p-2 hover:bg-gray-100 transition-colors rounded" onClick={toggleCart}>
                <FiShoppingBag className="text-lg text-gray-700" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 text-xs bg-red-500 text-white w-4 h-4 rounded-full flex items-center justify-center">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </div>
            </div>

            {/* Cart Drawer */}
            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
          </div>
        </div>
      </div>

      {/* Full Screen Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-white bg-opacity-95 backdrop-blur-sm z-50 animate-in fade-in duration-300">
          <div className="flex flex-col h-full">
            
            {/* Search Header */}
            <div className="flex items-center justify-center py-8 border-b border-gray-200">
              <div className="w-full max-w-2xl px-4">
                <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
                  Search our site
                </h2>
                
                {/* Search Input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-12 pr-12 py-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Search for products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    >
                      <FiX className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Close Button */}
              <button
                onClick={closeSearchModal}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <FiX className="h-6 w-6 text-gray-600" />
              </button>
            </div>

            {/* Search Results */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-4xl mx-auto px-4 py-8">
                
                {searchQuery && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">Products</h3>
                      {searchResults.length > 0 && (
                        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center">
                          View all →
                        </button>
                      )}
                    </div>
                    
                    {isLoadingProducts ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {searchResults.map((product: Product) => (
                          <div
                            key={product._id}
                            className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-200 cursor-pointer group"
                            onClick={() => handleProductClick(product)}
                          >
                            {/* Product Image */}
                            <div className="aspect-square overflow-hidden rounded-t-lg bg-gray-100 relative">
  {product.image ? (
    <Image
      src={product.image}
      alt={product.name}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 25vw, 20vw"
      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
    />
  ) : (
    <div className="w-full h-full flex items-center justify-center bg-gray-200">
      <span className="text-gray-400 text-sm">No Image</span>
    </div>
  )}
</div>
                            
                            {/* Product Details */}
                            <div className="p-4">
                              <h4 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                                {product.name}
                              </h4>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500 line-through">
                                  Rs. {(product.price * 1.2).toFixed(2)}
                                </span>
                                <span className="font-semibold text-red-600">
                                  From Rs. {product.price}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-500">
                        &quot; No products found for {searchQuery} &quot;
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {!searchQuery && (
                  <div className="text-center py-20">
                    <FiSearch className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">
                      Start typing to search for products...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}