import React, { useEffect, useRef, useState } from "react";
import { VideoPlayer } from "./VideoPlayer";
import { Product, VideoConfig } from "../types";
import { ArrowDown, ArrowUp, Minimize } from "../utils/icons";

interface ExpandedProductModalProps {
  products: Product[];
  activeIndex: number;
  onClose: () => void;
  videoConfig?: Partial<VideoConfig>;
  contents?: (product: Product) => React.ReactNode;
  buttons?: (product: Product) => React.ReactNode;
}

export const ProductModalY: React.FC<ExpandedProductModalProps> = ({
  products,
  activeIndex,
  onClose,
  videoConfig,
  contents,
  buttons,
}) => {
  const [index, setIndex] = useState(activeIndex);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    document.body.classList.add("overflow-hidden");
    return () => document.body.classList.remove("overflow-hidden");
  }, []);

  // Initial scroll to activeIndex
  useEffect(() => {
    if (containerRef.current && cardRefs.current[index]) {
      cardRefs.current[index]?.scrollIntoView({
        // behavior: "instant",
        block: "start",
      });
    }
  }, [index]);

  // Animate scroll & card transition on index change
  useEffect(() => {
    if (containerRef.current && cardRefs.current[index]) {
      setAnimating(true);
      cardRefs.current[index]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      const timer = setTimeout(() => setAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [index]);

  // Swipe gesture for mobile
  const touchStartY = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    if (deltaY > 50 && index > 0) setIndex(index - 1);
    else if (deltaY < -50 && index < products.length - 1) setIndex(index + 1);
    touchStartY.current = null;
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/90 flex justify-center items-center transition-opacity"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        role="dialog"
        aria-modal="true"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-50 text-white cursor-pointer"
        >
          <Minimize aria-label="Close modal" className="w-6 h-6 text-white" />
        </button>

        {/* Prev/Next buttons - only on md+ */}
        <div className="hidden md:flex flex-col absolute right-4 top-1/2 -translate-y-1/2 z-50 space-y-3">
          {index > 0 ? (
            <button
              onClick={() => setIndex(index - 1)}
              className="p-3 bg-white/60 rounded-full hover:bg-white/80 cursor-pointer"
            >
              <ArrowUp className="w-6 h-6 text-black" />
            </button>
          ) : (
            <button />
          )}
          {index < products.length - 1 ? (
            <button
              onClick={() => setIndex(index + 1)}
              className="p-3 bg-white/60 rounded-full hover:bg-white/80 cursor-pointer"
            >
              <ArrowDown className="w-6 h-6 text-black" />
            </button>
          ) : (
            <button />
          )}
        </div>

        {/* Scroll container */}
        <div
          ref={containerRef}
          className="w-full h-full overflow-y-auto snap-y snap-mandatory scroll-smooth hide-scrollbar"
        >
          {products.map((product, i) => (
            <div
             key={product.id}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className="w-full min-h-screen snap-start flex justify-center items-center"
            >
              <div
                className={`w-full max-w-lg md:max-w-2xl h-screen max-h-screen flex flex-col items-center bg-black text-white overflow-hidden rounded shadow-lg transition-all duration-300 ease-in-out 
                ${
                  animating && i === index
                    ? "scale-95 opacity-50"
                    : "scale-100 opacity-100"
                }`}
              >
                {/* Video */}
                <div className="relative flex-grow w-full flex items-center justify-center bg-black">
                  <VideoPlayer
                    videoUrl={product.videoUrl}
                    videoConfig={videoConfig}
                  />
                </div>

                {/* Contents */}
                <div className="p-4 space-y-3 w-full bg-black/30">
                  {contents && contents(product)}
                  {buttons && buttons(product)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
