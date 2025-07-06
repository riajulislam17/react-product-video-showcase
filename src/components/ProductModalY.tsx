import React, { useEffect, useRef, useState } from "react";
import { VideoPlayer } from "./VideoPlayer";
import { Product, VideoConfig } from "../types";
import { ArrowDown, ArrowUp, Close, Minimize } from "../utils/icons";

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

  useEffect(() => {
    if (containerRef.current && cardRefs.current[index]) {
      cardRefs.current[index]?.scrollIntoView({
        block: "start",
      });
    }
  }, [index]);

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
    <div
      className="rpvs-fixed rpvs-inset-0 rpvs-z-50 rpvs-bg-black/90 rpvs-flex rpvs-justify-center rpvs-items-center rpvs-transition-opacity"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="dialog"
      aria-modal="true"
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="rpvs-absolute rpvs-top-4 rpvs-left-4 rpvs-z-50 rpvs-text-white rpvs-cursor-pointer"
        aria-label="Close modal"
      >
        <Minimize className="rpvs-w-6 rpvs-h-6 rpvs-text-white" />
        {/* <Close className="rpvs-w-6 rpvs-h-6 rpvs-text-white" /> */}
      </button>

      {/* Prev/Next buttons (vertical navigation) */}
      <div className="rpvs-hidden md:rpvs-flex rpvs-flex-col rpvs-absolute rpvs-right-4 rpvs-top-1/2 -rpvs-translate-y-1/2 rpvs-z-50 rpvs-space-y-3">
        {index > 0 ? (
          <button
            onClick={() => setIndex(index - 1)}
            className="rpvs-p-3 rpvs-bg-white/60 rpvs-rounded-full hover:rpvs-bg-white/80 rpvs-cursor-pointer"
          >
            <ArrowUp className="rpvs-w-6 rpvs-h-6 rpvs-text-black" />
          </button>
        ) : (
          <button disabled className="rpvs-opacity-0" />
        )}
        {index < products.length - 1 ? (
          <button
            onClick={() => setIndex(index + 1)}
            className="rpvs-p-3 rpvs-bg-white/60 rpvs-rounded-full hover:rpvs-bg-white/80 rpvs-cursor-pointer"
          >
            <ArrowDown className="rpvs-w-6 rpvs-h-6 rpvs-text-black" />
          </button>
        ) : (
          <button disabled className="rpvs-opacity-0" />
        )}
      </div>

      {/* Scrollable container */}
      <div
        ref={containerRef}
        className="rpvs-w-full rpvs-h-full rpvs-overflow-y-auto rpvs-snap-y rpvs-snap-mandatory rpvs-scroll-smooth rpvs-hide-scrollbar"
      >
        {products.map((product, i) => (
          <div
            key={product.id}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className="rpvs-w-full rpvs-min-h-screen rpvs-snap-start rpvs-flex rpvs-justify-center rpvs-items-center"
          >
            <div
              className={`rpvs-w-full rpvs-max-w-lg md:rpvs-max-w-2xl rpvs-h-screen rpvs-max-h-screen rpvs-flex rpvs-flex-col rpvs-items-center rpvs-bg-black rpvs-text-white rpvs-overflow-hidden rpvs-rounded rpvs-shadow-lg rpvs-transition-all rpvs-duration-300 rpvs-ease-in-out 
              ${
                animating && i === index
                  ? "rpvs-scale-95 rpvs-opacity-50"
                  : "rpvs-scale-100 rpvs-opacity-100"
              }`}
            >
              {/* Video */}
              <div className="rpvs-relative rpvs-flex-grow rpvs-w-full rpvs-flex rpvs-items-center rpvs-justify-center rpvs-bg-black">
                <VideoPlayer
                  videoUrl={product.videoUrl}
                  videoConfig={videoConfig}
                />
              </div>

              {/* Contents */}
              <div className="rpvs-p-4 rpvs-space-y-3 rpvs-w-full rpvs-bg-black/30">
                {contents && contents(product)}
                {buttons && buttons(product)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
