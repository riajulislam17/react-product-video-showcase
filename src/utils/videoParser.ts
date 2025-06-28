const FACEBOOK_PATTERNS = [
  /facebook\.com\/[^/]+\/videos\/(\d+)/, // /Page/videos/123
  /facebook\.com\/watch\/?\?v=(\d+)/,    // /watch?v=123
  /facebook\.com\/video\.php\?v=(\d+)/,  // /video.php?v=123
];

export type EmbedResult =
  | { embedUrl: string; error?: undefined }
  | { embedUrl?: undefined; error: string };

export function extractYouTubeVideoId(url: string): string | null {
  const regex =
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([0-9A-Za-z_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export function extractFacebookVideoId(url: string): string | null {
  for (const pattern of FACEBOOK_PATTERNS) {
    const match = url.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }
  return null;
}

export function getCanonicalFacebookVideoUrl(
  url: string,
  videoId: string
): string {
  const pageMatch = url.match(/facebook\.com\/([^/?#]+)\/videos/);
  const pageSlug = pageMatch?.[1];
  return pageSlug
    ? `https://www.facebook.com/${pageSlug}/videos/${videoId}`
    : `https://www.facebook.com/video.php?v=${videoId}`;
}

export function getEmbedUrl(videoUrl: string): EmbedResult {
  const facebookAppId = process.env.REACT_FACEBOOK_APP_ID;

  // YouTube
  if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) {
    const videoId = extractYouTubeVideoId(videoUrl);
    if (videoId) {
      return { embedUrl: `https://www.youtube.com/embed/${videoId}` };
    } else {
      return { error: "Invalid YouTube URL format." };
    }
  }

  // Facebook
  if (videoUrl.includes("facebook.com")) {
    if (videoUrl.includes("/reel/")) {
      return { error: "Facebook Reels are not supported." };
    }

    const fbVideoId = extractFacebookVideoId(videoUrl);
    if (!fbVideoId) {
      return { error: "Facebook video is private or unsupported." };
    }

    const canonicalUrl = getCanonicalFacebookVideoUrl(videoUrl, fbVideoId);
    let embedUrl = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
      canonicalUrl
    )}`;

    if (facebookAppId) {
      embedUrl += `&appId=${facebookAppId}`;
    }

    return { embedUrl };
  }

  return { error: "Unsupported video platform." };
}
