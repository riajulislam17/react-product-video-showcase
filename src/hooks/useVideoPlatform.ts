import { useMemo } from "react";

type Platform = "youtube" | "facebook" | "unsupported";

interface Result {
  platform: Platform;
  videoId: string | null;
  embedUrl: string | null;
  error: string | null;
}

const FACEBOOK_PATTERNS = [
  /facebook\.com\/[^/]+\/videos\/(\d+)/,
  /facebook\.com\/watch\/?\?v=(\d+)/,
  /facebook\.com\/video\.php\?v=(\d+)/,
];

function extractYouTubeVideoId(url: string): string | null {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname.includes("youtu.be")) {
      return parsedUrl.pathname.substring(1);
    }
    if (parsedUrl.hostname.includes("youtube.com")) {
      const searchParams = parsedUrl.searchParams;
      if (searchParams.get("v")) return searchParams.get("v");

      const pathSegments = parsedUrl.pathname.split("/");
      if (pathSegments.includes("embed") || pathSegments.includes("shorts")) {
        return pathSegments[pathSegments.length - 1];
      }
    }
  } catch {}
  return null;
}

function getCanonicalFacebookUrl(originalUrl: string, videoId: string): string {
  const pageMatch = originalUrl.match(/facebook\.com\/([^/?#]+)\/videos/);
  const pageSlug = pageMatch?.[1];
  return pageSlug
    ? `https://www.facebook.com/${pageSlug}/videos/${videoId}`
    : `https://www.facebook.com/video.php?v=${videoId}`;
}

export function useVideoPlatform(url: string): Result {
  const facebookAppId = process.env.REACT_FACEBOOK_APP_ID;

  return useMemo(() => {
    if (!url) {
      return {
        platform: "unsupported",
        videoId: null,
        embedUrl: null,
        error: "Invalid URL",
      };
    }

    // YouTube
    const videoId = extractYouTubeVideoId(url);
    if (videoId) {
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      return { platform: "youtube", videoId, embedUrl, error: null };
    }

    // Facebook
    if (url.includes("facebook.com")) {
      if (url.includes("/reel/")) {
        return {
          platform: "facebook",
          videoId: null,
          embedUrl: null,
          error: "Facebook Reels not supported",
        };
      }

      for (const pattern of FACEBOOK_PATTERNS) {
        const match = url.match(pattern);
        if (match?.[1]) {
          const fbVideoId = match[1];
          const canonicalUrl = getCanonicalFacebookUrl(url, fbVideoId);
          let embedUrl = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
            canonicalUrl
          )}`;
          if (facebookAppId) {
            embedUrl += `&appId=${facebookAppId}`;
          }
          return {
            platform: "facebook",
            videoId: fbVideoId,
            embedUrl,
            error: null,
          };
        }
      }

      return {
        platform: "facebook",
        videoId: null,
        embedUrl: null,
        error: "Facebook video unsupported or private",
      };
    }

    return {
      platform: "unsupported",
      videoId: null,
      embedUrl: null,
      error: "Unsupported platform",
    };
  }, [url, facebookAppId]);
}
