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
    <>
      <div
        className={`flex flex-col rounded overflow-hidden ${
          slide ? "min-w-[250px] max-w-sm" : "w-full"
        }`}
      >
        {/* Video area with aspect ratio */}
        <div className="relative aspect-[4/5] md:aspect-[5/6] w-full bg-black flex items-center justify-center">
          <VideoPlayer videoUrl={product.videoUrl} videoConfig={finalConfig} />

          {expandCard && (
            <button
              type="button"
              title="Expand"
              className="absolute top-0 right-0 text-white p-1 rounded cursor-pointer"
              onClick={onExpand}
              aria-label="Expand video"
            >
              <Maximize className="text-white  w-8 h-8" />
            </button>
          )}
        </div>

        {/* Bottom Content */}
        <div className="flex flex-col">
          {contents && <div>{contents}</div>}
          {buttons && <div>{buttons}</div>}
        </div>
      </div>
    </>
  );
};
