"use client";

import React, { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import EnquiryForm from './EnquiryForm';

export default function FloatingEnquiryButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={openModal}
          className="bg-gradient-to-r from-pink-500 to-orange-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 group"
        >
            <div className='flex gap-x-2'>
          <MessageSquare className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" /> 
          <span>Enquiry?</span>
          </div>
        </button>
        
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="bg-gray-800 text-white text-sm px-3 py-1 rounded-lg whitespace-nowrap">
            Quick Enquiry
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop with blur */}
          <div 
            className="fixed inset-0 bg-white bg-opacity-20 backdrop-blur-sm transition-all duration-300"
            onClick={closeModal}
          />
          
          {/* Modal Content */}
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
                {/* Close Button */}
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-gray-50"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
                
                {/* Enquiry Form */}
                <div className="p-0">
                  <EnquiryForm />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}