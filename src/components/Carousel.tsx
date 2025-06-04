import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  useEffect(() => {
    const interval = setInterval(nextSlide, 3000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  const handleMouseEnter = () => {};
  const handleMouseLeave = () => {};

  return (
    <div className="relative w-full mx-auto bg-gradient-to-br from-red-900 to-red-800 overflow-hidden shadow-2xl">
      {/* Main carousel container */}
      <div
        className="relative h-[400px] overflow-hidden"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
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
                className="object-cover"
                fill
                priority={idx === 0}
                sizes="100vw"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110 group"
          aria-label="Previous slide"
        >
          <ChevronLeft size={24} className="group-hover:scale-110 transition-transform" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110 group"
          aria-label="Next slide"
        >
          <ChevronRight size={24} className="group-hover:scale-110 transition-transform" />
        </button>

        {/* Slide counter */}
        <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center items-center py-4 bg-gradient-to-r from-yellow-600 to-yellow-500">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            className={`mx-2 transition-all duration-300 rounded-full ${
              idx === currentIndex
                ? 'w-8 h-3 bg-gradient-to-r from-yellow-400 to-red-500 shadow-lg'
                : 'w-3 h-3 bg-white/40 hover:bg-white/60 hover:scale-125'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
        <div
          className="h-full bg-gradient-to-r from-yellow-400 to-red-500 transition-all duration-300"
          style={{
            width: `${((currentIndex + 1) / images.length) * 100}%`
          }}
        />
      </div>
    </div>
  );
};

export default Carousel;
