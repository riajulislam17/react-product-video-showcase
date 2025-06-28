import { VideoConfig } from "../types";

export const defaultVideoConfig: VideoConfig = {
  autoplay: false, //  Both YouTube & Facebook
  mute: true, // YouTube (limited support on Facebook)
  loop: false, // YouTube only

  // --- YouTube-specific options ---
  controls: false, //  YouTube (show/hide player controls)
  modestBranding: false, //  YouTube (removes YouTube logo)
  rel: false, //  YouTube (disable suggested videos at end)
  showInfo: false, //  YouTube (deprecated, use modestBranding + rel)

  // --- Facebook-specific options ---
  facebookAllowFullscreen: true, //  Facebook (enable fullscreen support)
  show_text: false, //  Facebook (hide video caption text)
};

export function mergeVideoConfig(
  userConfig?: Partial<VideoConfig>
): VideoConfig {
  return {
    ...defaultVideoConfig,
    ...userConfig,
  };
}
