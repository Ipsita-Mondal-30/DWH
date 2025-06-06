"use client";

import { Dispatch, SetStateAction, ChangeEvent } from "react";
import Image from "next/image";
import { Plus, Trash2 } from "lucide-react";

interface Pricing {
  quantity: number;
  unit: 'gm' | 'kg' | 'piece' | 'dozen';
  price: number;
}

interface Namkeen {
  _id?: string;
  name: string;
  description: string;
  image?: string;
  imageBase64?: string;
  type?: string;
  pricing: Pricing[];
}

interface AddNamkeenProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  namkeen: Namkeen;
  setNamkeen: Dispatch<SetStateAction<Namkeen>>;
}

export default function AddNamkeen({
  isOpen,
  onClose,
  onSubmit,
  namkeen,
  setNamkeen,
}: AddNamkeenProps) {
  if (!isOpen) return null;

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNamkeen((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setNamkeen((prev) => ({ ...prev, imageBase64: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const addPricing = () => {
    setNamkeen((prev) => ({
      ...prev,
      pricing: [...prev.pricing, { quantity: 0, unit: 'gm', price: 0 }]
    }));
  };

  const removePricing = (index: number) => {
    setNamkeen((prev) => ({
      ...prev,
      pricing: prev.pricing.filter((_, i) => i !== index)
    }));
  };

  const updatePricing = (index: number, field: keyof Pricing, value: string | number) => {
    setNamkeen((prev) => ({
      ...prev,
      pricing: prev.pricing.map((pricing, i) => 
        i === index 
          ? { 
              ...pricing, 
              [field]: field === 'unit' ? value : Number(value) || 0 
            }
          : pricing
      )
    }));
  };

  const isFormValid = () => {
    return (
      namkeen.name.trim() !== '' &&
      namkeen.description.trim() !== '' &&
      namkeen.pricing.length > 0 &&
      namkeen.pricing.every(p => p.quantity > 0 && p.price > 0)
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-4">
        <h2 className="text-xl font-bold">
          {namkeen?._id ? "Edit Namkeen" : "Add Namkeen"}
        </h2>

        {/* Basic Namkeen Info */}
        <div className="space-y-4">
          <input
            name="name"
            value={namkeen.name || ""}
            onChange={handleChange}
            placeholder="Namkeen Name"
            className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
          />

          <textarea
            name="description"
            value={namkeen.description || ""}
            onChange={handleChange}
            placeholder="Namkeen Description"
            className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            rows={3}
            required
          />

          <select
            name="type"
            value={namkeen.type || "none"}
            onChange={handleChange}
            className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="none">None</option>
            <option value="popular">Popular</option>
            <option value="latest">Latest</option>
          </select>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Namkeen Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full border border-gray-300 p-2 rounded-lg"
            />
          </div>

          {namkeen.imageBase64 ? (
            <Image
              alt="Preview"
              width={200}
              height={200}
              src={namkeen.imageBase64}
              className="mt-2 max-h-48 object-contain rounded-lg"
            />
          ) : namkeen.image ? (
            <Image
              src={namkeen.image}
              alt={namkeen.name || "Namkeen Image"}
              width={200}
              height={200}
              className="mt-2 object-contain rounded-lg"
            />
          ) : null}
        </div>

        {/* Pricing Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Quantity & Pricing</h3>
            <button
              onClick={addPricing}
              className="bg-orange-600 text-white px-3 py-1 rounded-lg flex items-center gap-2 hover:bg-orange-700 transition-colors"
              type="button"
            >
              <Plus className="w-4 h-4" />
              Add Pricing
            </button>
          </div>

          {namkeen.pricing.length === 0 && (
            <div className="text-gray-500 text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
              No pricing options added. Click &quotAdd Pricing&quot to get started.
            </div>
          )}

          {namkeen.pricing.map((pricing, index) => (
            <div key={index} className="border border-gray-200 p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">Option {index + 1}</span>
                {namkeen.pricing.length > 1 && (
                  <button
                    onClick={() => removePricing(index)}
                    className="text-red-600 hover:text-red-800 p-1"
                    type="button"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={pricing.quantity || ""}
                    onChange={(e) => updatePricing(index, 'quantity', e.target.value)}
                    placeholder="Enter quantity"
                    className="border border-gray-300 p-2 w-full rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Unit
                  </label>
                  <select
                    value={pricing.unit}
                    onChange={(e) => updatePricing(index, 'unit', e.target.value)}
                    className="border border-gray-300 p-2 w-full rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="gm">Grams (gm)</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="piece">Piece</option>
                    <option value="dozen">Dozen</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    value={pricing.price || ""}
                    onChange={(e) => updatePricing(index, 'price', e.target.value)}
                    placeholder="Enter price"
                    className="border border-gray-300 p-2 w-full rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="text-sm text-gray-600 bg-orange-50 p-2 rounded">
                {pricing.quantity > 0 && pricing.price > 0 ? (
                  <span>
                    <strong>Preview:</strong> {pricing.quantity} {pricing.unit} - ₹{pricing.price}
                    {pricing.unit === 'gm' || pricing.unit === 'kg' ? (
                      <span className="ml-2 text-gray-500">
                        (₹{(pricing.price / pricing.quantity).toFixed(2)} per {pricing.unit})
                      </span>
                    ) : null}
                  </span>
                ) : (
                  <span className="text-gray-400">Enter quantity and price to see preview</span>
                )}
              </div>
            </div>
          ))}
        </div>

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
            {namkeen?._id ? "Update Namkeen" : "Add Namkeen"}
          </button>
        </div>

        {!isFormValid() && (
          <div className="text-sm text-red-600 text-center">
            Please fill in all required fields and add at least one pricing option.
          </div>
        )}
      </div>
    </div>
  );
}