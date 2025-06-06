"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Plus, Minus } from "lucide-react";

interface Box {
  _id: string;
  name: string;
  description: string;
  image: string;
  price: number;
}

interface BhajiFormProps {
  isOpen: boolean;
  onClose: () => void;
  box: Box;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  quantity: number;
  specialInstructions: string;
}

export default function BhajiForm({ isOpen, onClose, box }: BhajiFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    quantity: 1,
    specialInstructions: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleQuantityChange = (change: number) => {
    setFormData(prev => ({
      ...prev,
      quantity: Math.max(1, prev.quantity + change)
    }));
  };

  const totalPrice = box.price * formData.quantity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log("Order submitted:", {
      ...formData,
      box: box,
      totalPrice: totalPrice
    });

    setSubmitted(true);
    setIsSubmitting(false);

    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        quantity: 1,
        specialInstructions: "",
      });
      onClose();
    }, 3000);
  };

  const isFormValid = () => {
    return (
      formData.name.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.phone.trim() !== "" &&
      formData.address.trim() !== "" &&
      formData.quantity > 0 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
      /^\d{10}$/.test(formData.phone.replace(/\D/g, ''))
    );
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="bg-white rounded-xl p-8 max-w-md w-full text-center">
          <div className="text-green-600 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Placed!</h2>
          <p className="text-gray-600 mb-4">
  Thank you for your order. We&apos;ll contact you soon with delivery details.
</p>

          <div className="text-sm text-gray-500">
            This window will close automatically...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Order {box.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Box Details */}
        <div className="bg-orange-50 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
              {box.image ? (
                <Image
                  src={box.image}
                  alt={box.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                  No Image
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800">{box.name}</h3>
              <p className="text-gray-600 text-sm">{box.description}</p>
              <p className="text-orange-600 font-bold text-lg">₹{box.price} per box</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter your phone number"
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delivery Address *
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter your complete delivery address"
              rows={3}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>

          {/* Quantity Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity
            </label>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => handleQuantityChange(-1)}
                className="bg-gray-200 text-gray-600 w-10 h-10 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
                disabled={formData.quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-xl font-semibold px-4">{formData.quantity}</span>
              <button
                type="button"
                onClick={() => handleQuantityChange(1)}
                className="bg-gray-200 text-gray-600 w-10 h-10 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Special Instructions (Optional)
            </label>
            <textarea
              name="specialInstructions"
              value={formData.specialInstructions}
              onChange={handleInputChange}
              placeholder="Any special instructions for your order"
              rows={2}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">Order Summary</h4>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">{box.name} × {formData.quantity}</span>
              <span className="font-semibold">₹{totalPrice}</span>
            </div>
            <div className="border-t pt-2 flex justify-between items-center">
              <span className="font-bold text-lg">Total:</span>
              <span className="font-bold text-lg text-orange-600">₹{totalPrice}</span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-400 text-white px-6 py-3 rounded-lg hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid() || isSubmitting}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Placing Order..." : "Place Order"}
            </button>
          </div>

          {!isFormValid() && (
            <div className="text-sm text-red-600 text-center mt-2">
              Please fill in all required fields with valid information.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}