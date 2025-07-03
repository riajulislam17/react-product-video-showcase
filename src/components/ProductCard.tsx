import React from "react";
import { mergeVideoConfig } from "../utils/videoConfig";
import { VideoPlayer } from "./VideoPlayer";
import { Product, VideoConfig } from "../types";
import { Maximize } from "../utils/icons";

interface Props {
  product: Product;
  slide?: boolean;
  contents?: React.ReactNode;
  buttons?: React.ReactNode;
  videoConfig?: Partial<VideoConfig>;
  expandCard?: boolean;
  onExpand: () => void;
}

export const ProductCard: React.FC<Props> = ({
  product,
  slide = false,
  contents,
  buttons,
  videoConfig,
  expandCard,
  onExpand,
}) => {
  const finalConfig = mergeVideoConfig(videoConfig);

  return (
    <div
      className={`rpvs-flex rpvs-flex-col rpvs-rounded rpvs-overflow-hidden ${
        slide ? "rpvs-min-w-[250px] rpvs-max-w-sm" : "rpvs-w-full"
      }`}
    >
      {/* Video area with aspect ratio */}
      <div className="rpvs-relative rpvs-aspect-[4/5] md:rpvs-aspect-[5/6] rpvs-w-full rpvs-bg-black rpvs-flex rpvs-items-center rpvs-justify-center">
        <VideoPlayer videoUrl={product.videoUrl} videoConfig={finalConfig} />

        {expandCard && (
          <button
            type="button"
            title="Expand"
            className="rpvs-absolute rpvs-top-0 rpvs-right-0 rpvs-text-white rpvs-p-1 rpvs-rounded rpvs-cursor-pointer"
            onClick={onExpand}
            aria-label="Expand video"
          >
            <Maximize className="rpvs-text-white rpvs-w-8 rpvs-h-8" />
          </button>
        )}
      </div>

      {/* Bottom Content */}
      <div className="rpvs-flex rpvs-flex-col">
        {contents && <div>{contents}</div>}
        {buttons && <div>{buttons}</div>}
      </div>
    </div>
  );
};
