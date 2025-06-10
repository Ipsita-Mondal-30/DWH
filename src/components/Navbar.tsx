"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { FiUser, FiShoppingBag, FiSearch, FiX } from "react-icons/fi";
import { useCart } from '../app/context/CartContext';
import Link from "next/link"; 
import Image from "next/image";
import CartDrawer from "./CartDrawer";
import axios from "axios";

const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

// Define interfaces for search results
interface SearchProduct {
  _id?: string;
  name: string;
  description?: string;
  image?: string;
  pricing?: Array<{
    quantity: number;
    unit: 'gm' | 'kg' | 'piece' | 'dozen';
    price: number;
  }>;
  type?: string;
}

// Login Modal Component
const LoginModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with blur effect */}
      <div 
        className="fixed inset-0 bg-white bg-opacity-20 backdrop-blur-sm z-[100] transition-all"
        onClick={onClose}
      />
      
      {/* Popup */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all border border-orange-100">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-orange-100">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-2 rounded-xl">
                <FiUser className="h-5 w-5 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Sign In Required</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-orange-500 transition-colors p-1 rounded-lg hover:bg-orange-50"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-4 rounded-2xl">
                <FiShoppingBag className="h-8 w-8 text-orange-500" />
              </div>
            </div>
            
            <div className="text-center mb-6">
              <h4 className="text-xl font-semibold text-gray-800 mb-2">
                Please Sign In First
              </h4>
              <p className="text-gray-600 leading-relaxed">
                You need to be signed in to access your cart and continue shopping. Sign in to save your favorite items.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  signIn('google', { 
                    callbackUrl: window.location.href 
                  });
                  onClose();
                }}
                className="flex items-center justify-center w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 shadow-lg hover:shadow-xl"
              >
                <GoogleIcon />
                Continue with Google
              </button>
              <button
                onClick={onClose}
                className="w-full bg-gray-100 text-gray-600 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default function Navbar() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { cart } = useCart();
  const { data: session, status } = useSession();

  const toggleCart = () => {
    // Check if user is authenticated before opening cart
    if (status === "unauthenticated") {
      setShowLoginModal(true);
      return;
    }
    setIsCartOpen(!isCartOpen);
  };

  // Function to handle About Us scroll
  const handleAboutUsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const aboutSection = document.getElementById('AboutUs');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const [showDropdown, setShowDropdown] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const [allProducts, setAllProducts] = useState<SearchProduct[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);

  // Fetch both products and namkeens for search
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const [productsRes, namkeensRes] = await Promise.all([
          axios.get('/api/product'),
          axios.get('/api/namkeen')
        ]);
        
        const combined = [...productsRes.data, ...namkeensRes.data];
        setAllProducts(combined);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchAllProducts();
  }, []);

  // Close dropdown on outside click
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle search with debouncing
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchQuery && allProducts.length > 0) {
        setIsLoadingSearch(true);
        const filtered = allProducts
          .filter((product) =>
            product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .slice(0, 8);
        setSearchResults(filtered);
        setIsLoadingSearch(false);
      } else {
        setSearchResults([]);
        setIsLoadingSearch(false);
      }
    }, 300);
  
    return () => {
      clearTimeout(timeout);
      setIsLoadingSearch(false);
    };
  }, [searchQuery, allProducts]);
  
  // Handle product click
  const handleProductClick = (product: SearchProduct) => {
    console.log('Clicked product:', product);
    
    const searchParams = new URLSearchParams({
      _pos: '1',
      _psq: searchQuery.substring(0, 4),
      _ss: 'e',
      _v: '1.0'
    });
    
    if (!product._id) {
      console.error('Product ID is missing!');
      return;
    }
    
    const url = `/products/${product._id}?${searchParams.toString()}`;
    console.log('Navigating to URL:', url);
    
    // Navigate to product page
    window.location.href = url;
  };

  // Close search modal
  const closeSearchModal = () => {
    setShowSearchModal(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  // Get price display for search results
  const getPriceDisplay = (product: SearchProduct) => {
    if (product.pricing && product.pricing.length > 0) {
      return product.pricing[0].price;
    }
    return 0;
  };

  // Calculate total cart items
  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="relative">
      <div className="bg-gradient-to-r from-white via-orange-50/30 to-white shadow-lg border-b border-orange-100 fixed top-0 left-0 right-0 z-40">
        <div className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto">
          
          {/* Logo - Left Side */}
          <div className="flex items-center">
            <Link href="/">
              <Image
                src="/delwh.png"
                alt="Vaishnavi Logo"
                className="h-16 object-contain cursor-pointer hover:scale-105 transition-transform duration-300"
                width={120}
                height={64}
              />
            </Link>
          </div>

          {/* Navigation Links - Center */}
          <div className="flex items-center space-x-10">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-orange-600 font-semibold transition-colors relative group text-base py-2 px-3 rounded-lg hover:bg-gradient-to-br hover:from-orange-50 hover:to-orange-100"
            >
              Home
              <span className="absolute bottom-0 left-3 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-300 group-hover:w-[calc(100%-24px)] rounded-full"></span>
            </Link>
            
            <Link 
              href="/collections/sweets" 
              className="text-gray-700 hover:text-orange-600 font-semibold transition-colors relative group text-base py-2 px-3 rounded-lg hover:bg-gradient-to-br hover:from-orange-50 hover:to-orange-100"
            >
              Sweets
              <span className="absolute bottom-0 left-3 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-300 group-hover:w-[calc(100%-24px)] rounded-full"></span>
            </Link>
            
            <Link 
              href="/collections/savouries" 
              className="text-gray-700 hover:text-orange-600 font-semibold transition-colors relative group text-base py-2 px-3 rounded-lg hover:bg-gradient-to-br hover:from-orange-50 hover:to-orange-100"
            >
              Namkeen
              <span className="absolute bottom-0 left-3 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-300 group-hover:w-[calc(100%-24px)] rounded-full"></span>
            </Link>
            
            <Link
              href="/AboutUs"
              className="text-gray-700 hover:text-orange-600 font-semibold transition-colors relative group cursor-pointer text-base py-2 px-3 rounded-lg hover:bg-gradient-to-br hover:from-orange-50 hover:to-orange-100"
            >
              About us
              <span className="absolute bottom-0 left-3 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-300 group-hover:w-[calc(100%-24px)] rounded-full"></span>
            </Link>
          </div>

          {/* Right Side - Icons */}
          <div className="flex justify-end items-center space-x-2">
            {/* Icons Section */}
            <div className="flex items-center space-x-2">
              {/* Search Icon with Text */}
              <div 
                className="flex items-center space-x-2 p-3 hover:bg-gradient-to-br hover:from-orange-50 hover:to-orange-100 cursor-pointer transition-all duration-300 rounded-xl border border-transparent hover:border-orange-200 hover:shadow-lg"
                onClick={() => setShowSearchModal(true)}
              >
                <FiSearch className="text-xl text-gray-700 hover:text-orange-600 transition-colors" />
                <span className="text-sm font-semibold text-gray-700 hover:text-orange-600 transition-colors whitespace-nowrap">
                  Search
                </span>
              </div>
              
              {/* Cart Icon with Text - with login protection */}
              <div 
                className="flex items-center space-x-2 relative cursor-pointer p-3 hover:bg-gradient-to-br hover:from-orange-50 hover:to-orange-100 transition-all duration-300 rounded-xl border border-transparent hover:border-orange-200 hover:shadow-lg" 
                onClick={toggleCart}
              >
                <div className="relative">
                  <FiShoppingBag className="text-xl text-gray-700 hover:text-orange-600 transition-colors" />
                  {session && totalCartItems > 0 && (
                    <span className="absolute -top-1 -right-1 text-xs bg-gradient-to-r from-orange-500 to-orange-600 text-white w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-lg">
                      {totalCartItems}
                    </span>
                  )}
                  {!session && (
                    <span className="absolute -top-1 -right-1 text-xs bg-gray-400 text-white w-5 h-5 rounded-full flex items-center justify-center font-bold">
                      !
                    </span>
                  )}
                </div>
                <span className="text-sm font-semibold text-gray-700 hover:text-orange-600 transition-colors whitespace-nowrap">
                  Cart
                </span>
              </div>

              {/* User Icon with Text and Dropdown */}
              <div ref={dropdownRef} className="relative">
                <div
                  className="flex items-center space-x-2 p-3 hover:bg-gradient-to-br hover:from-orange-50 hover:to-orange-100 cursor-pointer transition-all duration-300 rounded-xl border border-transparent hover:border-orange-200 hover:shadow-lg"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <FiUser className="text-xl text-gray-700 hover:text-orange-600 transition-colors" />
                  <span className="text-sm font-semibold text-gray-700 hover:text-orange-600 transition-colors whitespace-nowrap">
                    {session ? 'Account' : 'Sign In'}
                  </span>
                </div>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-orange-200 rounded-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                    {session ? (
                      <div className="py-2">
                        {/* Welcome Section */}
                        <div className="px-4 py-4 bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200">
                          <div className="flex items-center space-x-3">
                            <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-2 rounded-xl">
                              <FiUser className="text-lg text-orange-600" />
                            </div>
                            <div>
                              <span className="text-sm font-semibold text-gray-800 block">Welcome!</span>
                              <span className="text-xs text-orange-600 font-medium">
                                {session.user?.name?.split(' ')[0] || session.user?.email?.split('@')[0]}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Menu Items */}
                        <div className="py-1">
                          <Link href="/account" className="block px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 hover:text-orange-600 transition-all duration-200">
                            My Account
                          </Link>
                          <Link href="/my-orders" className="block px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 hover:text-orange-600 transition-all duration-200">
                            My Orders
                          </Link>
                        </div>

                        {/* Sign Out Section */}
                        <div className="border-t border-orange-100 py-1">
                          <button
                            onClick={() => signOut()}
                            className="block w-full text-left px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 hover:text-orange-600 transition-all duration-200"
                          >
                            Sign Out
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3">
                        <button
                          onClick={() => signIn("google")}
                          className="flex items-center justify-center w-full px-6 py-4 text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 hover:text-orange-600 rounded-xl transition-all duration-200 font-semibold space-x-3 border border-orange-200 hover:border-orange-300 hover:shadow-lg"
                        >
                          <GoogleIcon />
                          <span>Sign in with Google</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>

            {/* Cart Drawer - only show if authenticated */}
            {session && (
              <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
            )}
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />

      {/* Full Screen Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-white bg-opacity-95 backdrop-blur-sm z-50 animate-in fade-in duration-300">
          <div className="flex flex-col h-full">
            
            {/* Search Header */}
            <div className="flex items-center justify-center py-8 border-b border-orange-200 bg-gradient-to-r from-orange-50/50 to-white">
              <div className="w-full max-w-2xl px-4">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
                  Search our site
                </h2>
                
                {/* Search Input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiSearch className="h-5 w-5 text-orange-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-12 pr-12 py-4 text-lg border-2 border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-gradient-to-r from-white to-orange-50/30 shadow-lg"
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
                      <FiX className="h-5 w-5 text-orange-400 hover:text-orange-600" />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Close Button */}
              <button
                onClick={closeSearchModal}
                className="absolute top-4 right-4 p-2 rounded-xl hover:bg-orange-100 transition-colors"
              >
                <FiX className="h-6 w-6 text-gray-600" />
              </button>
            </div>

            {/* Search Results */}
            <div className="flex-1 overflow-y-auto bg-gradient-to-br from-white to-orange-50/20">
              <div className="max-w-4xl mx-auto px-4 py-8">
                
                {searchQuery && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-800">Products</h3>
                      {searchResults.length > 0 && (
                        <button className="text-sm text-orange-600 hover:text-orange-800 font-semibold flex items-center">
                          View all →
                        </button>
                      )}
                    </div>
                    
                    {isLoadingSearch ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {searchResults.map((product: SearchProduct) => (
                          <div
                            key={product._id || Math.random()}
                            className="bg-white rounded-2xl border-2 border-orange-100 hover:shadow-2xl hover:border-orange-300 transition-all duration-300 cursor-pointer group overflow-hidden"
                            onClick={() => handleProductClick(product)}
                          >
                            {/* Product Image */}
                            <div className="aspect-square overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100 relative">
                              {product.image ? (
                                <Image
                                  src={product.image}
                                  alt={product.name}
                                  fill
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 25vw, 20vw"
                                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200">
                                  <span className="text-orange-400 text-sm font-semibold">No Image</span>
                                </div>
                              )}
                            </div>
                            
                            {/* Product Details */}
                            <div className="p-4 bg-gradient-to-br from-white to-orange-50/30">
                              <h4 className="font-bold text-gray-800 mb-2 line-clamp-2">
                                {product.name}
                              </h4>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500 line-through">
                                  Rs. {(getPriceDisplay(product) * 1.2).toFixed(2)}
                                </span>
                                <span className="font-bold text-orange-600">
                                  From Rs. {getPriceDisplay(product)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-500 font-semibold">
                          &quot; No products found for {searchQuery} &quot;
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {!searchQuery && (
                  <div className="text-center py-20">
                    <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-6 rounded-2xl inline-block mb-4">
                      <FiSearch className="h-16 w-16 text-orange-500 mx-auto" />
                    </div>
                    <p className="text-gray-500 text-lg font-semibold">
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