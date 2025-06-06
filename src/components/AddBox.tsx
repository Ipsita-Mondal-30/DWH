"use client";

import { Dispatch, SetStateAction, ChangeEvent } from "react";
import Image from "next/image";

interface Box {
  _id?: string;
  name: string;
  description: string;
  image?: string;
  imageBase64?: string;
  price: number;
}

interface AddBoxProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  box: Box;
  setBox: Dispatch<SetStateAction<Box>>;
}

export default function AddBox({
  isOpen,
  onClose,
  onSubmit,
  box,
  setBox,
}: AddBoxProps) {
  if (!isOpen) return null;

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBox((prev) => ({ 
      ...prev, 
      [name]: name === 'price' ? Number(value) || 0 : value 
    }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setBox((prev) => ({ ...prev, imageBase64: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const isFormValid = () => {
    return (
      box.name.trim() !== '' &&
      box.description.trim() !== '' &&
      box.price > 0
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-4">
        <h2 className="text-xl font-bold">
          {box?._id ? "Edit Box" : "Add Box"}
        </h2>

        {/* Basic Box Info */}
        <div className="space-y-4">
          <input
            name="name"
            value={box.name || ""}
            onChange={handleChange}
            placeholder="Box Name"
            className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
          />

          <textarea
            name="description"
            value={box.description || ""}
            onChange={handleChange}
            placeholder="Box Description"
            className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            rows={3}
            required
          />

          <input
            name="price"
            type="number"
            value={box.price || ""}
            onChange={handleChange}
            placeholder="Price (₹)"
            className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            min="0"
            step="0.01"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Box Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full border border-gray-300 p-2 rounded-lg"
            />
          </div>

          {box.imageBase64 ? (
            <Image
              alt="Preview"
              width={200}
              height={200}
              src={box.imageBase64}
              className="mt-2 max-h-48 object-contain rounded-lg"
            />
          ) : box.image ? (
            <Image
              src={box.image}
              alt={box.name || "Box Image"}
              width={200}
              height={200}
              className="mt-2 object-contain rounded-lg"
            />
          ) : null}
        </div>

        {/* Price Preview */}
        {box.price > 0 && (
          <div className="text-sm text-gray-600 bg-orange-50 p-3 rounded-lg">
            <strong>Price Preview:</strong> ₹{box.price}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500 transition-colors"
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!isFormValid()}
            className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            type="button"
          >
            {box?._id ? "Update Box" : "Add Box"}
          </button>
        </div>

        {!isFormValid() && (
          <div className="text-sm text-red-600 text-center">
            Please fill in all required fields with valid values.
          </div>
        )}
      </div>
    </div>
  );
}