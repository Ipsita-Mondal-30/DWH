import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
const Carousel = () => {
  const images = [
    "https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=1200&h=400&fit=crop",
    "https://images.unsplash.com/photo-1571506165871-ee72a35bc9d4?w=1200&h=400&fit=crop",
    "https://images.unsplash.com/photo-1587334207582-d9be9a06ef1e?w=1200&h=400&fit=crop",
    "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=1200&h=400&fit=crop"
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const goToSlide = useCallback((index:number) => {
    setCurrentIndex(index);
  }, []);

  // Auto-slide every 3 seconds
  useEffect(() => {
    const interval = setInterval(nextSlide, 3000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  return (
    <div className="relative w-full mx-auto overflow-hidden shadow-2xl">
      {/* Main carousel container */}
      <div className="relative h-[600px] overflow-hidden">
        {/* Image container */}
        <div
          className="flex transition-transform duration-700 ease-in-out h-full"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((src, idx) => (
            <div key={idx} className="min-w-full h-full relative">
             <Image
  src={src}
  alt={`Slide ${idx + 1}`}
  width={1200}
  height={400}
  className="w-full h-full object-cover"
/>

            </div>
          ))}
        </div>

        {/* Navigation Arrows - Layered white and black chevrons */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-110"
          aria-label="Previous slide"
        >
          <div className="relative">
            <ChevronLeft size={65} className="text-white stroke-[3]" />
            <ChevronLeft size={90} className="text-black stroke-[1] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-110"
          aria-label="Next slide"
        >
          <div className="relative">
            <ChevronRight size={65} className="text-white stroke-[3]" />
            <ChevronRight size={90} className="text-black stroke-[1] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
        </button>

        {/* Dots indicator - Yellow dots with white outline for active */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex justify-center items-center">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`mx-1.5 transition-all duration-300 rounded-full ${
                idx === currentIndex
                  ? 'w-4 h-4 bg-yellow-400 border-2 border-white shadow-lg'
                  : 'w-4 h-4 bg-yellow-400 hover:scale-110'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Carousel;