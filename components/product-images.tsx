"use client"

import Image from "next/image";
import React, { useState, useEffect } from "react";

interface ProductImage {
  url: string;
  alt: string;
}

const ProductImages = ({ images }: { images: ProductImage[] }) => {
  console.log(images, "images");
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [isSliding, setIsSliding] = useState(false);

  const handleSlide = (direction: number) => {
    const newIndex =
      (mainImageIndex + images.length + direction) % images.length;
    setIsSliding(true);
    setMainImageIndex(newIndex);
    setTimeout(() => setIsSliding(false), 500); // Adjust animation duration as needed
  };

  return (
    <div className="flex mx-auto md:w-1/2 w-full flex-col gap-4 relative">
      <Image
        className={`w-64 h-80 rounded-lg object-cover mx-auto ${isSliding ? "animate-slide-out" : ""
          }`}
        width={300}
        height={400}
        src={images[mainImageIndex].url}
        alt={images[mainImageIndex].alt}
      />
      <div className="grid grid-cols-3 gap-2">
        {images.map((image, index) => (
          <Image
            key={index}
            className={`w-full h-24 rounded-lg object-cover cursor-pointer hover:opacity-75 ${index === mainImageIndex ? "opacity-50" : ""
              }`}
            width={200}
            height={200}
            src={image.url}
            alt={image.alt}
            onClick={() => setMainImageIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductImages;

      // <button
      //   type="button"
      //   className="absolute top-1/2 -translate-y-1/2 left-0 bg-transparent hover:bg-gray-200/20 rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
      //   onClick={() => handleSlide(-1)}
      // >
      //   <svg
      //     className="h-6 w-6 text-white"
      //     viewBox="0 0 24 24"
      //     fill="none"
      //     xmlns="http://www.w3.org/2000/svg"
      //   >
      //     <path
      //       d="M15 8L9 12L15 16"
      //       stroke="currentColor"
      //       strokeWidth="2"
      //       strokeLinecap="round"
      //       strokeLinejoin="round"
      //     />
      //   </svg>
      // </button>
      // <button
      //   type="button"
      //   className="absolute top-1/2 -translate-y-1/2 right-0 bg-transparent hover:bg-gray-200/20 rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
      //   onClick={() => handleSlide(1)}
      // >
      //   <svg
      //     className="h-6 w-6 text-white"
      //     viewBox="0 0 24 24"
      //     fill="none"
      //     xmlns="http://www.w3.org/2000/svg"
      //   >
      //     <path
      //       d="M9 8L15 12L9 16"
      //       stroke="currentColor"
      //       strokeWidth="2"
      //       strokeLinecap="round"
      //       strokeLinejoin="round"
      //     />
      //   </svg>
      // </button>
