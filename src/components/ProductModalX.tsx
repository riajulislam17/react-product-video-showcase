import React, { useEffect, useRef, useState } from "react";
import { VideoPlayer } from "./VideoPlayer";
import { Product, VideoConfig } from "../types";
import { ArrowLeft, ArrowRight, Close, Minimize } from "../utils/icons";

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
      className="rpvs-fixed rpvs-inset-0 rpvs-z-50 rpvs-bg-black/90 rpvs-flex rpvs-justify-center rpvs-items-center rpvs-transition-opacity"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="rpvs-absolute rpvs-top-4 rpvs-left-4 rpvs-z-50 rpvs-p-3 rpvs-cursor-pointer"
        aria-label="Close modal"
      >
        <Minimize className="rpvs-w-6 rpvs-h-6 rpvs-text-white" />
        {/* <Close className="rpvs-w-6 rpvs-h-6 rpvs-text-white" /> */}
      </button>

      {/* Prev/Next buttons - md+ only */}
      <div className="rpvs-hidden md:rpvs-flex rpvs-flex-row rpvs-absolute rpvs-top-1/2 -rpvs-translate-y-1/2 rpvs-z-50 rpvs-justify-between rpvs-w-full rpvs-px-4">
        {index > 0 ? (
          <button
            onClick={() => setIndex(index - 1)}
            className="rpvs-p-3 rpvs-bg-white/60 rpvs-rounded-full hover:rpvs-bg-white/80 rpvs-cursor-pointer"
          >
            <ArrowLeft className="rpvs-w-6 rpvs-h-6 rpvs-text-black" />
          </button>
        ) : (
          <div />
        )}

        {index < products.length - 1 ? (
          <button
            onClick={() => setIndex(index + 1)}
            className="rpvs-p-3 rpvs-bg-white/60 rpvs-rounded-full hover:rpvs-bg-white/80 rpvs-cursor-pointer"
          >
            <ArrowRight className="rpvs-w-6 rpvs-h-6 rpvs-text-black" />
          </button>
        ) : (
          <div />
        )}
      </div>

      {/* Active Product Card */}
      <div className="rpvs-w-full rpvs-h-full rpvs-flex rpvs-justify-center rpvs-items-center rpvs-overflow-hidden">
        <div
          className={`rpvs-w-full rpvs-max-w-lg md:rpvs-max-w-2xl rpvs-h-screen rpvs-max-h-screen rpvs-flex rpvs-flex-col rpvs-items-center rpvs-bg-black rpvs-text-white rpvs-overflow-hidden rpvs-rounded rpvs-shadow-lg rpvs-transition-all rpvs-duration-300 rpvs-ease-in-out 
            ${
              animating
                ? "rpvs-scale-95 rpvs-opacity-50"
                : "rpvs-scale-100 rpvs-opacity-100"
            }`}
        >
          {/* Video */}
          <div className="rpvs-relative rpvs-flex-grow rpvs-w-full rpvs-flex rpvs-items-center rpvs-justify-center rpvs-bg-black">
            <VideoPlayer
              videoUrl={currentProduct.videoUrl}
              videoConfig={videoConfig}
            />
          </div>

          {/* Contents */}
          <div className="rpvs-p-4 rpvs-space-y-3 rpvs-w-full rpvs-bg-black/30">
            {contents && contents(currentProduct)}
            {buttons && buttons(currentProduct)}
          </div>
        </div>
      </div>
    </div>
  );
};
