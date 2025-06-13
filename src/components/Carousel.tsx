import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from "next/image";


// Custom hook for media queries

const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    const media: MediaQueryList = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = (): void => setMatches(media.matches);
    window.addEventListener("resize", listener);
    return (): void => window.removeEventListener("resize", listener);
  }, [matches, query]);

  return matches;
};

const Carousel = () => {
  // Media query hooks
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px) and (min-width: 769px)');
  
  // Desktop images (your existing images)
  const desktopImages = [
    "/main.png",
    "/namkeen.png", 
    "/flavour.png",
    "/sweet.png"
  ];
  
  // Mobile images - replace these with your mobile-optimized image URLs
  const mobileImages = [
    "/main-mobile.png",
    "/namkeen-mobile.png", 
    "/flavour-mobile.png",
    "/sweet-mobile.png"
  ];
  
  // Tablet images - replace these with your tablet-optimized image URLs
  const tabletImages = [
    "/main-tablet.png",
    "/namkeen-tablet.png", 
    "/flavour-tablet.png",
    "/sweet-tablet.png"
  ];
  
  // Get current image set based on screen size
  const getCurrentImages = () => {
    if (isMobile) return mobileImages;
    if (isTablet) return tabletImages;
    return desktopImages;
  };
  
  const images = getCurrentImages();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Reset index when switching between image sets to prevent out of bounds
  useEffect(() => {
    if (currentIndex >= images.length) {
      setCurrentIndex(0);
    }
  }, [images.length, currentIndex]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const goToSlide = useCallback((index: number): void => {
    setCurrentIndex(index);
  }, []);

  // Auto-slide every 3 seconds
  useEffect(() => {
    const interval = setInterval(nextSlide, 3000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  // Get responsive height classes
  const getHeightClass = () => {
    if (isMobile) return 'h-[250px] sm:h-[300px]';
    if (isTablet) return 'h-[350px]';
    return 'h-[400px]';
  };

  // Get responsive arrow sizes
  const getArrowSizes = () => {
    if (isMobile) return { outer: 45, inner: 65 };
    if (isTablet) return { outer: 55, inner: 75 };
    return { outer: 65, inner: 90 };
  };

  const arrowSizes = getArrowSizes();

  return (
    <div className="relative w-full mx-auto overflow-hidden shadow-2xl">
      {/* Main carousel container */}
      <div className={`relative ${getHeightClass()} overflow-hidden`}>
        {/* Image container */}
        <div
          className="flex transition-transform duration-700 ease-in-out h-full"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((src, idx) => (
            <div key={idx} className="min-w-full h-full relative">
              <img
                src={src}
                alt={`Slide ${idx + 1}`}
                className="w-full h-full object-cover"
                loading={idx === 0 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </div>

        {/* Navigation Arrows - Responsive sizing */}
        <button
          onClick={prevSlide}
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-110 z-10"
          aria-label="Previous slide"
        >
          <div className="relative">
            <ChevronLeft size={arrowSizes.outer} className="text-white stroke-[3]" />
            <ChevronLeft size={arrowSizes.inner} className="text-black stroke-[1] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-110 z-10"
          aria-label="Next slide"
        >
          <div className="relative">
            <ChevronRight size={arrowSizes.outer} className="text-white stroke-[3]" />
            <ChevronRight size={arrowSizes.inner} className="text-black stroke-[1] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
        </button>

        {/* Dots indicator - Responsive sizing */}
        <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex justify-center items-center">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`mx-1 md:mx-1.5 transition-all duration-300 rounded-full ${
                idx === currentIndex
                  ? 'w-3 h-3 md:w-4 md:h-4 bg-yellow-400 border-2 border-white shadow-lg'
                  : 'w-3 h-3 md:w-4 md:h-4 bg-yellow-400 hover:scale-110'
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