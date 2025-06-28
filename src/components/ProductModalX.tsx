import React, { useEffect, useRef, useState } from "react";
import { VideoPlayer } from "./VideoPlayer";
import { Product, VideoConfig } from "../types";
import { ArrowLeft, ArrowRight, Minimize } from "../utils/icons";

interface ExpandedProductModalProps {
  products: Product[];
  activeIndex: number;
  onClose: () => void;
  videoConfig?: Partial<VideoConfig>;
  contents?: (product: Product) => React.ReactNode;
  buttons?: (product: Product) => React.ReactNode;
}

export const ProductModalX: React.FC<ExpandedProductModalProps> = ({
  products,
  activeIndex,
  onClose,
  videoConfig,
  contents,
  buttons,
}) => {
  const [index, setIndex] = useState(activeIndex);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    document.body.classList.add("overflow-hidden");
    return () => document.body.classList.remove("overflow-hidden");
  }, []);

  useEffect(() => {
    setAnimating(true);
    const timer = setTimeout(() => setAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [index]);

  // Swipe gesture (horizontal)
  const touchStartX = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (deltaX > 50 && index > 0) setIndex(index - 1);
    else if (deltaX < -50 && index < products.length - 1) setIndex(index + 1);
    touchStartX.current = null;
  };

  const currentProduct = products[index];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex justify-center items-center transition-opacity"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 left-4 z-50 p-3 cursor-pointer"
        aria-label="Close modal"
      >
        <Minimize className="w-6 h-6 text-white" />
      </button>

      {/* Prev/Next buttons - md+ only */}
      <div className="hidden md:flex flex-row absolute top-1/2 -translate-y-1/2 z-50 justify-between w-full px-4">
        {index > 0 ? (
          <button
            onClick={() => setIndex(index - 1)}
            className="p-3 bg-white/60 rounded-full hover:bg-white/80 cursor-pointer"
          >
            <ArrowLeft className="w-6 h-6 text-black" />
          </button>
        ) : (
          <div />
        )}

        {index < products.length - 1 ? (
          <button
            onClick={() => setIndex(index + 1)}
            className="p-3 bg-white/60 rounded-full hover:bg-white/80 cursor-pointer"
          >
            <ArrowRight className="w-6 h-6 text-black" />
          </button>
        ) : (
          <div />
        )}
      </div>

      {/* Active Product Card */}
      <div className="w-full h-full flex justify-center items-center overflow-hidden">
        <div
          className={`w-full max-w-lg md:max-w-2xl h-screen max-h-screen flex flex-col items-center bg-black text-white overflow-hidden rounded shadow-lg transition-all duration-300 ease-in-out 
            ${animating ? "scale-95 opacity-50" : "scale-100 opacity-100"}`}
        >
          {/* Video */}
          <div className="relative flex-grow w-full flex items-center justify-center bg-black">
            <VideoPlayer
              videoUrl={currentProduct.videoUrl}
              videoConfig={videoConfig}
            />
          </div>

          {/* Contents */}
          <div className="p-4 space-y-3 w-full bg-black/30">
            {contents && contents(currentProduct)}
            {buttons && buttons(currentProduct)}
          </div>
        </div>
      </div>
    </div>
  );
};
