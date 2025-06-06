'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Satellite, Map, Plus, Minus, Maximize2 } from 'lucide-react';

const GoogleMapsEmbed = () => {
  const [mapType, setMapType] = useState('roadmap');
  const [zoom, setZoom] = useState(15);

  const googleMapsUrl = "https://www.google.com/maps/place/Dehli+Wala+Halwai/@29.163054,75.7225149,17z/data=!3m1!4b1!4m6!3m5!1s0x391232d128591025:0x42f0273b025b3432!8m2!3d29.163054!4d75.7225149!16s%2Fg%2F1260wzvdq?entry=ttu";

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if ((event.metaKey || event.ctrlKey) && (event.key === '=' || event.key === '+')) {
        event.preventDefault();
        setZoom((prev) => Math.min(prev + 1, 20));
      } else if ((event.metaKey || event.ctrlKey) && event.key === '-') {
        event.preventDefault();
        setZoom((prev) => Math.max(prev - 1, 1));
      }

      if (event.key === '+' || event.key === '=') {
        if (!event.metaKey && !event.ctrlKey) {
          event.preventDefault();
          setZoom((prev) => Math.min(prev + 1, 20));
        }
      } else if (event.key === '-') {
        if (!event.metaKey && !event.ctrlKey) {
          event.preventDefault();
          setZoom((prev) => Math.max(prev - 1, 1));
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, []);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 1, 20));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 1, 1));
  const toggleMapType = () => setMapType((prev) => (prev === 'roadmap' ? 'satellite' : 'roadmap'));
  const openInGoogleMaps = () => window.open(googleMapsUrl, '_blank');

  return (
    <div className="w-full h-screen">
      <div className="bg-white h-full overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 p-3 border-b relative z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-semibold text-gray-800">Dehli Wala Halwai</h2>
            </div>
            <div className="text-sm text-gray-600">Hisar, Haryana</div>
          </div>
        </div>

        {/* Map Container */}
        <div className="relative h-full">
          {/* Map Type Toggle */}
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={toggleMapType}
              className="bg-white shadow-md rounded-lg p-2 hover:bg-gray-50 transition-colors"
              title={mapType === 'roadmap' ? 'Switch to Satellite View' : 'Switch to Street View'}
            >
              {mapType === 'roadmap' ? (
                <Satellite className="w-5 h-5 text-gray-700" />
              ) : (
                <Map className="w-5 h-5 text-gray-700" />
              )}
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="absolute bottom-20 right-4 z-10">
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <button
                onClick={handleZoomIn}
                className="block w-full p-3 hover:bg-gray-50 transition-colors border-b"
                title="Zoom In (Cmd/Ctrl + +)"
              >
                <Plus className="w-6 h-6 text-gray-700 mx-auto" />
              </button>
              <button
                onClick={handleZoomOut}
                className="block w-full p-3 hover:bg-gray-50 transition-colors"
                title="Zoom Out (Cmd/Ctrl + -)"
              >
                <Minus className="w-6 h-6 text-gray-700 mx-auto" />
              </button>
            </div>
          </div>

          {/* Open in Google Maps */}
          <div className="absolute bottom-4 right-4 z-10">
            <button
              onClick={openInGoogleMaps}
              className="bg-white shadow-md rounded-lg p-2 hover:bg-gray-50 transition-colors"
              title="View in Google Maps"
            >
              <Maximize2 className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          {/* Zoom Level Indicator */}
          <div className="absolute bottom-4 left-4 z-10 bg-black bg-opacity-70 text-white px-3 py-2 rounded text-sm">
            Zoom: {zoom}
          </div>

          {/* Map Type Indicator */}
          <div className="absolute top-4 left-4 z-10 bg-black bg-opacity-70 text-white px-3 py-2 rounded text-sm flex items-center space-x-2">
            {mapType === 'roadmap' ? (
              <>
                <Map className="w-4 h-4" />
                <span>Street View</span>
              </>
            ) : (
              <>
                <Satellite className="w-4 h-4" />
                <span>Satellite View</span>
              </>
            )}
          </div>

          {/* Google Maps Embed */}
          <iframe
            key={`${mapType}-${zoom}`}
            src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3465.2!2d75.7225149!3d29.163054!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391232d128591025%3A0x42f0273b025b3432!2sDehli%20Wala%20Halwai!5e${mapType === 'satellite' ? '1' : '0'}!3m2!1sen!2sin!4v1623456789!5m2!1sen!2sin&z=${zoom}&markers=29.163054,75.7225149`}
            width="100%"
            height="100%"
            style={{ border: 0, height: 'calc(100vh - 80px)' }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default GoogleMapsEmbed;
