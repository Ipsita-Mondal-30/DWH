import React from 'react';
import { X, User, ShoppingCart } from 'lucide-react';
import {  signIn } from "next-auth/react";

interface SignInPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn?: () => void;
}

const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

interface SignInPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn?: () => void;
}

export default function SignInPopup({ isOpen, onClose }: SignInPopupProps) {
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
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="bg-orange-100 p-2 rounded-full">
                <User className="h-5 w-5 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Sign In Required</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-orange-50 p-4 rounded-full">
                <ShoppingCart className="h-8 w-8 text-orange-500" />
              </div>
            </div>
            
            <div className="text-center mb-6">
              <h4 className="text-xl font-medium text-gray-800 mb-2">
                Please Sign In First
              </h4>
              <p className="text-gray-600 leading-relaxed">
                You need to be signed in to add items to your cart. Sign in to continue shopping and save your favorite items.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => signIn("google")}
                className="flex items-center justify-center w-full bg-white border-2 border-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-sm"
              >
                <GoogleIcon />
                Continue with Google
              </button>
              <button
                onClick={onClose}
                className="w-full bg-gray-100 text-gray-600 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}