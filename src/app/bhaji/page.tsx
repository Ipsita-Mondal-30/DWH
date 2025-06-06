"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import BhajiForm from "../../components/BhajiForm";

interface Box {
  _id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export default function BhajiPage() {
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBox, setSelectedBox] = useState<Box | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchBoxes();
  }, []);

  const fetchBoxes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/box');
      
      if (!response.ok) {
        throw new Error('Failed to fetch boxes');
      }
      
      const data = await response.json();
      setBoxes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleBoxSelect = (box: Box) => {
    setSelectedBox(box);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedBox(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading boxes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchBoxes}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Bhaji Boxes</h1>
          <p className="text-gray-600">Choose from our delicious variety of bhaji boxes</p>
        </div>

        {boxes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">No boxes available</div>
            <p className="text-gray-400">Check back later for new additions!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {boxes.map((box) => (
              <div
                key={box._id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                onClick={() => handleBoxSelect(box)}
              >
                <div className="relative h-48 bg-gray-200">
                  {box.image ? (
                    <Image
                      src={box.image}
                      alt={box.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <span>No Image</span>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">
                    {box.name}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {box.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-orange-600">
                      ₹{box.price}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBoxSelect(box);
                      }}
                      className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                    >
                      Select
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bhaji Form Modal */}
        {showForm && selectedBox && (
          <BhajiForm
            isOpen={showForm}
            onClose={handleFormClose}
            box={selectedBox}
          />
        )}
      </div>
    </div>
  );
}