import React from "react";
import { useLazyLoad } from "../hooks/useLazyLoad";
import { useVideoPlatform } from "../hooks/useVideoPlatform";
import { VideoConfig } from "../types";

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

  //  YouTube Parameters
  if (platform === "youtube") {
    if (videoConfig.autoplay) queryParams.set("autoplay", "1");
    if (videoConfig.mute) queryParams.set("mute", "1");
    if (videoConfig.controls !== undefined)
      queryParams.set("controls", videoConfig.controls ? "1" : "0");
    if (videoConfig.modestbranding) queryParams.set("modestbranding", "1");
    if (videoConfig.rel !== undefined)
      queryParams.set("rel", videoConfig.rel ? "1" : "0");
    if (videoConfig.loop && videoId) {
      queryParams.set("loop", "1");
      queryParams.set("playlist", videoId);
    }
    if (videoConfig.cc_load_policy) queryParams.set("cc_load_policy", "1");
    if (videoConfig.disablekb) queryParams.set("disablekb", "1");
  }

  //  Facebook Parameters (these are `data-*` in HTML, but must be added to iframe as query)
  if (platform === "facebook") {
    if (videoConfig["data-autoplay"]) queryParams.set("autoplay", "true");
    if (videoConfig["data-show-text"] === false)
      queryParams.set("show_text", "false");
    if (videoConfig["data-allowfullscreen"])
      queryParams.set("allowfullscreen", "true");
    if (videoConfig["data-show-captions"])
      queryParams.set("show_captions", "true");
    if (videoConfig["data-allow-script-access"])
      queryParams.set(
        "allowScriptAccess",
        videoConfig["data-allow-script-access"]
      );
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
