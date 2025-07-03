import React from "react";
import { useLazyLoad } from "../hooks/useLazyLoad";
import { useVideoPlatform } from "../hooks/useVideoPlatform";

interface VideoConfig {
  autoplay?: boolean;
  mute?: boolean;
  loop?: boolean;
  controls?: boolean;
  modestBranding?: boolean;
  rel?: boolean;
  showInfo?: boolean;
  show_text?: boolean;
  facebookAllowFullscreen?: boolean;
}

interface Props {
  videoUrl: string;
  videoConfig?: Partial<VideoConfig>;
}

export const VideoPlayer: React.FC<Props> = ({
  videoUrl,
  videoConfig = {},
}) => {
  const [ref, isVisible] = useLazyLoad<HTMLDivElement>();
  const { platform, videoId, embedUrl, error } = useVideoPlatform(videoUrl);

  if (error) {
    return <div className="rpvs-text-red-500">{error}</div>;
  }

  const queryParams = new URLSearchParams();

  if (videoConfig.autoplay) queryParams.set("autoplay", "1");
  if (videoConfig.mute) queryParams.set("mute", "1");
  if (platform === "youtube" && videoConfig.loop && videoId) {
    queryParams.set("loop", "1");
    queryParams.set("playlist", videoId);
  }
  if (platform === "youtube") {
    queryParams.set("controls", videoConfig.controls ? "1" : "0");
    queryParams.set("modestbranding", videoConfig.modestBranding ? "1" : "0");
    queryParams.set("rel", videoConfig.rel ? "1" : "0");
  }
  if (platform === "facebook" && videoConfig.show_text === false) {
    queryParams.set("show_text", "false");
  }

  const finalEmbedUrl = `${embedUrl}${
    embedUrl?.includes("?") ? "&" : "?"
  }${queryParams.toString()}`;

  return (
    <div
      ref={ref}
      className="rpvs-min-w-full rpvs-min-h-[50vh] rpvs-aspect-video rpvs-bg-black rpvs-relative rpvs-rounded rpvs-overflow-hidden"
    >
      {isVisible ? (
        <iframe
          title={`Embedded ${platform} video`}
          loading="lazy"
          src={finalEmbedUrl}
          width="100%"
          height={platform === "facebook" ? "500" : "100%"}
          className={platform === "youtube" ? "rpvs-w-full rpvs-h-full" : ""}
          allow="autoplay; encrypted-media"
          allowFullScreen={
            platform === "facebook" ? videoConfig.facebookAllowFullscreen : true
          }
        />
      ) : (
        <div className="rpvs-w-full rpvs-h-full rpvs-bg-gray-600 rpvs-relative">
          <div className="rpvs-absolute rpvs-inset-0 rpvs-flex rpvs-items-center rpvs-justify-center">
            <div className="rpvs-w-12 rpvs-h-12 rpvs-border-4 rpvs-border-white rpvs-border-t-transparent rpvs-rounded-full rpvs-animate-spin" />
          </div>
        </div>
      )}
    </div>
  );
};
