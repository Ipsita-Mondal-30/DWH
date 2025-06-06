"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, Edit, Trash2, Package } from "lucide-react";
import AddNamkeen from "@/components/AddNamkeen";

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

export default function NamkeenPage() {
  const [namkeens, setNamkeens] = useState<Namkeen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingNamkeen, setEditingNamkeen] = useState<Namkeen | null>(null);
  const [currentNamkeen, setCurrentNamkeen] = useState<Namkeen>({
    name: "",
    description: "",
    type: "none",
    pricing: []
  });

  // Fetch namkeens from API
  const fetchNamkeens = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/namkeen");
      if (!response.ok) {
        throw new Error("Failed to fetch namkeens");
      }
      const data = await response.json();
      setNamkeens(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNamkeens();
  }, []);

  // Handle add namkeen
  const handleAddNamkeen = async () => {
    try {
      const response = await fetch("/api/namkeen", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(currentNamkeen),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add namkeen");
      }

      await fetchNamkeens(); // Refresh the list
      setShowAddModal(false);
      setCurrentNamkeen({
        name: "",
        description: "",
        type: "none",
        pricing: []
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add namkeen");
    }
  };

  // Handle edit namkeen
  const handleEditNamkeen = async () => {
    if (!editingNamkeen?._id) return;

    try {
      const response = await fetch(`/api/namkeen/${editingNamkeen._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(currentNamkeen),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update namkeen");
      }

      await fetchNamkeens(); // Refresh the list
      setShowAddModal(false);
      setEditingNamkeen(null);
      setCurrentNamkeen({
        name: "",
        description: "",
        type: "none",
        pricing: []
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update namkeen");
    }
  };

  // Handle delete namkeen
  const handleDeleteNamkeen = async (id: string) => {
    if (!confirm("Are you sure you want to delete this namkeen?")) {
      return;
    }

    try {
      const response = await fetch(`/api/namkeen?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete namkeen");
      }

      await fetchNamkeens(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete namkeen");
    }
  };

  // Open edit modal
  const openEditModal = (namkeen: Namkeen) => {
    setEditingNamkeen(namkeen);
    setCurrentNamkeen({...namkeen});
    setShowAddModal(true);
  };

  // Open add modal
  const openAddModal = () => {
    setEditingNamkeen(null);
    setCurrentNamkeen({
      name: "",
      description: "",
      type: "none",
      pricing: []
    });
    setShowAddModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowAddModal(false);
    setEditingNamkeen(null);
    setCurrentNamkeen({
      name: "",
      description: "",
      type: "none",
      pricing: []
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <Package className="w-8 h-8 text-orange-600" />
            <h1 className="text-3xl font-bold text-gray-800">Namkeen Collection</h1>
          </div>
          <button
            onClick={openAddModal}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-orange-700 transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Add Namkeen
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Namkeens Grid */}
        {namkeens.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Namkeens Found</h3>
            <p className="text-gray-500 mb-6">Start by adding your first namkeen to the collection.</p>
            <button
              onClick={openAddModal}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Add Your First Namkeen
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {namkeens.map((namkeen) => (
              <div key={namkeen._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  {namkeen.image || namkeen.imageBase64 ? (
                    <Image
                      src={namkeen.image || namkeen.imageBase64 || ''}
                      alt={namkeen.name}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                      <Package className="w-16 h-16 text-orange-400" />
                    </div>
                  )}
                  
                  {/* Type Badge */}
                  {namkeen.type && namkeen.type !== "none" && (
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        namkeen.type === 'popular' 
                          ? 'bg-red-100 text-red-800' 
                          : namkeen.type === 'seasonal'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {namkeen.type.charAt(0).toUpperCase() + namkeen.type.slice(1)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-800 mb-2">{namkeen.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{namkeen.description}</p>
                  
                  {/* Pricing */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Available Options:</h4>
                    <div className="space-y-1">
                      {namkeen.pricing.slice(0, 2).map((pricing, idx) => (
                        <div key={idx} className="text-sm text-gray-600 bg-orange-50 px-2 py-1 rounded">
                          {pricing.quantity} {pricing.unit} - ₹{pricing.price}
                        </div>
                      ))}
                      {namkeen.pricing.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{namkeen.pricing.length - 2} more options
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <button
                      onClick={() => openEditModal(namkeen)}
                      className="flex items-center gap-1 text-orange-600 hover:text-orange-800 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="text-sm">Edit</span>
                    </button>
                    <button
                      onClick={() => namkeen._id && handleDeleteNamkeen(namkeen._id)}
                      className="flex items-center gap-1 text-red-600 hover:text-red-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Namkeen Modal */}
        <AddNamkeen
          isOpen={showAddModal}
          onClose={closeModal}
          onSubmit={editingNamkeen ? handleEditNamkeen : handleAddNamkeen}
          namkeen={currentNamkeen}
          setNamkeen={setCurrentNamkeen}
        />
      </div>
    </div>
  );
}