import { VideoConfig } from "../types";

export const defaultVideoConfig: VideoConfig = {
  //  for youtube
  autoplay: false,
  mute: false,
  controls: false,
  modestbranding: false,
  rel: false,
  loop: false,
  playlist: false,
  cc_load_policy: false,
  disablekb: false,

  // for facebook
  "data-autoplay": false,
  "data-show-text": false,
  "data-allowfullscreen": false,
  "data-show-captions": false,
  "data-allow-script-access": "never",
};

export function mergeVideoConfig(
  userConfig?: Partial<VideoConfig>
): VideoConfig {
  return {
    ...defaultVideoConfig,
    ...userConfig,
  };
}
