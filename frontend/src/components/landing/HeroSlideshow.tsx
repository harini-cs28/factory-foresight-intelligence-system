import React, { useState, useEffect } from "react";
import existingFactoryImage from "../../assets/images/hero-factory.jpg";

interface HeroSlideshowProps {
  children?: React.ReactNode;
}

export const HeroSlideshow: React.FC<HeroSlideshowProps> = ({ children }) => {
  // Exactly 4 Hero Images in required sequence
  const heroImages = [
    {
      id: "slide-1",
      src: existingFactoryImage,
      alt: "FFIS Textile Machinery - Spinning and Carding Line",
    },
    {
      id: "slide-2",
      src: "https://images.moneycontrol.com/static-mcnews/2026/09/20260930122007_tex.png",
      alt: "Automated Textile Plant Operations",
    },
    {
      id: "slide-3",
      src: "https://knnindia.co.in/uploads/newsfiles/TEXTILE-24-7-2026.jpg",
      alt: "Industrial Textile Manufacturing & Loom Processing",
    },
    {
      id: "slide-4",
      src: "https://static.vecteezy.com/system/resources/thumbnails/035/317/577/small/ai-generated-material-production-business-manufacture-bobbin-work-fiber-craft-fashion-machine-photo.jpg",
      alt: "Textile Yarn Bobbin Manufacture and Production",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({ 0: true });

  // Preload all 4 images on component mount
  useEffect(() => {
    heroImages.forEach((img, index) => {
      const imageLoader = new Image();
      imageLoader.src = img.src;
      imageLoader.onload = () => {
        setLoadedImages((prev) => ({ ...prev, [index]: true }));
      };
      imageLoader.onerror = () => {
        console.warn(`[FFIS Slideshow] External image failed to load at index ${index}: ${img.src}`);
      };
    });
  }, []);

  // Automatic slide rotation every 2 seconds (2000ms)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 2000);

    return () => clearInterval(timer);
  }, [heroImages.length]);

  return (
    <div className="w-full h-full relative overflow-hidden flex items-center m-0 p-0 border-0 rounded-none shadow-none">
      {/* 4 Background Images with Smooth Crossfade (700ms) */}
      {heroImages.map((image, idx) => {
        const isActive = idx === currentIndex;
        return (
          <div
            key={image.id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out pointer-events-none ${
              isActive ? "opacity-100 z-0" : "opacity-0 -z-10"
            }`}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover object-center brightness-[0.97] contrast-[1.04]"
              onError={(e) => {
                // Fallback to existing factory image if external link is blocked
                (e.target as HTMLImageElement).src = existingFactoryImage;
              }}
            />
          </div>
        );
      })}

      {/* Light-to-Dark Industrial Gradient Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none z-1" 
        style={{
          background: "linear-gradient(90deg, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.55) 30%, rgba(0,0,0,0.20) 65%, rgba(0,0,0,0.58) 100%)"
        }}
      />

      {/* Fixed Hero Overlay Content (Children) */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        {children}
      </div>
    </div>
  );
};
