export interface VideoConfig {
  //  for youtube
  autoplay?: boolean; // Automatically start video when the player loads
  mute?: boolean; //Mute the video (required for autoplay on most browsers)
  controls?: boolean; //Show/hide player controls <br/> 0: Hide, 1: Show, 2: Show with limited controls
  modestbranding?: boolean; //1: Minimizes YouTube logo in control bar (logo still appears on fullscreen/pause)
  rel?: boolean; //0: Disable related videos at end. Now shows only videos from same channel
  loop?: boolean; //Loops the video. Must include playlist=VIDEO_ID for it to work
  playlist?: boolean; //Used with loop=1 to specify what to loop
  cc_load_policy?: boolean; //Show closed captions by default
  disablekb?: boolean; //Disable keyboard controls

  // for facebook
  "data-autoplay"?: boolean; //Autoplay the video
  "data-show-text"?: boolean; //Show/hide post text (title, caption)
  "data-allowfullscreen"?: boolean; //Allow fullscreen mode
  "data-show-captions"?: boolean; //Show video captions (if available)
  "data-allow-script-access"?: "always" | "sameDomain" | "never"; //Advanced – controls script access to iframe (rarely needed)
}

export interface Product {
  id: string;
  slug?: string;
  title: string;
  price: number;
  discountPrice?: number;
  category?: string;
  videoUrl: string;
  currency?: string;
}

export interface Layout {
  desktop: { column: number; row: number };
  tablet: { column: number; row: number };
  mobile: { column: number; row: number };
}
