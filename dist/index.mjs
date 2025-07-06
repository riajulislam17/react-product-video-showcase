// src/components/ProductGrid.tsx
import { useEffect as useEffect5, useRef as useRef4, useState as useState5 } from "react";

// src/utils/videoConfig.ts
var defaultVideoConfig = {
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
  "data-allow-script-access": "never"
};
function mergeVideoConfig(userConfig) {
  return {
    ...defaultVideoConfig,
    ...userConfig
  };
}

// src/hooks/useLazyLoad.ts
import { useEffect, useRef, useState } from "react";
function useLazyLoad() {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.25 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, isVisible];
}

// src/hooks/useVideoPlatform.ts
import { useMemo } from "react";
var FACEBOOK_PATTERNS = [
  /facebook\.com\/[^/]+\/videos\/(\d+)/,
  /facebook\.com\/watch\/?\?v=(\d+)/,
  /facebook\.com\/video\.php\?v=(\d+)/
];
function extractYouTubeVideoId(url) {
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
  } catch {
  }
  return null;
}
function getCanonicalFacebookUrl(originalUrl, videoId) {
  const pageMatch = originalUrl.match(/facebook\.com\/([^/?#]+)\/videos/);
  const pageSlug = pageMatch?.[1];
  return pageSlug ? `https://www.facebook.com/${pageSlug}/videos/${videoId}` : `https://www.facebook.com/video.php?v=${videoId}`;
}
function useVideoPlatform(url) {
  const facebookAppId = process.env.REACT_FACEBOOK_APP_ID;
  return useMemo(() => {
    if (!url) {
      return {
        platform: "unsupported",
        videoId: null,
        embedUrl: null,
        error: "Invalid URL"
      };
    }
    const videoId = extractYouTubeVideoId(url);
    if (videoId) {
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      return { platform: "youtube", videoId, embedUrl, error: null };
    }
    if (url.includes("facebook.com")) {
      if (url.includes("/reel/")) {
        return {
          platform: "facebook",
          videoId: null,
          embedUrl: null,
          error: "Facebook Reels not supported"
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
            error: null
          };
        }
      }
      return {
        platform: "facebook",
        videoId: null,
        embedUrl: null,
        error: "Facebook video unsupported or private"
      };
    }
    return {
      platform: "unsupported",
      videoId: null,
      embedUrl: null,
      error: "Unsupported platform"
    };
  }, [url, facebookAppId]);
}

// src/components/VideoPlayer.tsx
import { jsx } from "react/jsx-runtime";
var VideoPlayer = ({
  videoUrl,
  videoConfig = {}
}) => {
  const [ref, isVisible] = useLazyLoad();
  const { platform, videoId, embedUrl, error } = useVideoPlatform(videoUrl);
  if (error) {
    return /* @__PURE__ */ jsx("div", { className: "rpvs-text-red-500", children: error });
  }
  const queryParams = new URLSearchParams();
  if (platform === "youtube") {
    if (videoConfig.autoplay) queryParams.set("autoplay", "1");
    if (videoConfig.mute) queryParams.set("mute", "1");
    if (videoConfig.controls !== void 0)
      queryParams.set("controls", videoConfig.controls ? "1" : "0");
    if (videoConfig.modestbranding) queryParams.set("modestbranding", "1");
    if (videoConfig.rel !== void 0)
      queryParams.set("rel", videoConfig.rel ? "1" : "0");
    if (videoConfig.loop && videoId) {
      queryParams.set("loop", "1");
      queryParams.set("playlist", videoId);
    }
    if (videoConfig.cc_load_policy) queryParams.set("cc_load_policy", "1");
    if (videoConfig.disablekb) queryParams.set("disablekb", "1");
  }
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
  const finalEmbedUrl = `${embedUrl}${embedUrl?.includes("?") ? "&" : "?"}${queryParams.toString()}`;
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref,
      className: "rpvs-min-w-full rpvs-min-h-[50vh] rpvs-aspect-video rpvs-bg-black rpvs-relative rpvs-rounded rpvs-overflow-hidden",
      children: isVisible ? /* @__PURE__ */ jsx(
        "iframe",
        {
          title: `Embedded ${platform} video`,
          loading: "lazy",
          src: finalEmbedUrl,
          width: "100%",
          height: platform === "facebook" ? "500" : "100%",
          className: platform === "youtube" ? "rpvs-w-full rpvs-h-full" : "",
          allow: "autoplay; encrypted-media"
        }
      ) : /* @__PURE__ */ jsx("div", { className: "rpvs-w-full rpvs-h-full rpvs-bg-gray-600 rpvs-relative", children: /* @__PURE__ */ jsx("div", { className: "rpvs-absolute rpvs-inset-0 rpvs-flex rpvs-items-center rpvs-justify-center", children: /* @__PURE__ */ jsx("div", { className: "rpvs-w-12 rpvs-h-12 rpvs-border-4 rpvs-border-white rpvs-border-t-transparent rpvs-rounded-full rpvs-animate-spin" }) }) })
    }
  );
};

// src/utils/icons.tsx
import { jsx as jsx2 } from "react/jsx-runtime";
var Maximize = (props) => /* @__PURE__ */ jsx2("svg", { ...props, fill: "none", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ jsx2(
  "path",
  {
    d: "M8 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V8M8 21H7.8C6.11984 21 5.27976 21 4.63803 20.673C4.07354 20.3854 3.6146 19.9265 3.32698 19.362C3 18.7202 3 17.8802 3 16.2V16M21 8V7.8C21 6.11984 21 5.27976 20.673 4.63803C20.3854 4.07354 19.9265 3.6146 19.362 3.32698C18.7202 3 17.8802 3 16.2 3H16M21 16V16.2C21 17.8802 21 18.7202 20.673 19.362C20.3854 19.9265 19.9265 20.3854 19.362 20.673C18.7202 21 17.8802 21 16.2 21H16",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round"
  }
) });
var Minimize = (props) => /* @__PURE__ */ jsx2("svg", { ...props, fill: "none", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ jsx2(
  "path",
  {
    d: "M2.99988 8H3.19988C4.88004 8 5.72011 8 6.36185 7.67302C6.92634 7.3854 7.38528 6.92646 7.6729 6.36197C7.99988 5.72024 7.99988 4.88016 7.99988 3.2V3M2.99988 16H3.19988C4.88004 16 5.72011 16 6.36185 16.327C6.92634 16.6146 7.38528 17.0735 7.6729 17.638C7.99988 18.2798 7.99988 19.1198 7.99988 20.8V21M15.9999 3V3.2C15.9999 4.88016 15.9999 5.72024 16.3269 6.36197C16.6145 6.92646 17.0734 7.3854 17.6379 7.67302C18.2796 8 19.1197 8 20.7999 8H20.9999M15.9999 21V20.8C15.9999 19.1198 15.9999 18.2798 16.3269 17.638C16.6145 17.0735 17.0734 16.6146 17.6379 16.327C18.2796 16 19.1197 16 20.7999 16H20.9999",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round"
  }
) });
var ArrowUp = (props) => /* @__PURE__ */ jsx2(
  "svg",
  {
    ...props,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    viewBox: "0 0 24 24",
    xmlns: "http://www.w3.org/2000/svg",
    children: /* @__PURE__ */ jsx2("path", { d: "M12 19V5M5 12l7-7 7 7" })
  }
);
var ArrowDown = (props) => /* @__PURE__ */ jsx2(
  "svg",
  {
    ...props,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    viewBox: "0 0 24 24",
    xmlns: "http://www.w3.org/2000/svg",
    children: /* @__PURE__ */ jsx2("path", { d: "M12 5v14M19 12l-7 7-7-7" })
  }
);
var ArrowLeft = (props) => /* @__PURE__ */ jsx2(
  "svg",
  {
    ...props,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    viewBox: "0 0 24 24",
    xmlns: "http://www.w3.org/2000/svg",
    children: /* @__PURE__ */ jsx2("path", { d: "M19 12H5M12 5l-7 7 7 7" })
  }
);
var ArrowRight = (props) => /* @__PURE__ */ jsx2(
  "svg",
  {
    ...props,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    viewBox: "0 0 24 24",
    xmlns: "http://www.w3.org/2000/svg",
    children: /* @__PURE__ */ jsx2("path", { d: "M5 12h14M12 5l7 7-7 7" })
  }
);

// src/components/ProductCard.tsx
import { jsx as jsx3, jsxs } from "react/jsx-runtime";
var ProductCard = ({
  product,
  slide = false,
  contents,
  buttons,
  videoConfig,
  expandCard,
  overlayExpandCard,
  onExpand
}) => {
  const finalConfig = mergeVideoConfig(videoConfig);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: `rpvs-flex rpvs-flex-col rpvs-rounded rpvs-overflow-hidden ${slide ? "rpvs-min-w-[250px] rpvs-max-w-sm" : "rpvs-w-full"}`,
      children: [
        /* @__PURE__ */ jsxs("div", { className: "rpvs-relative rpvs-aspect-[4/5] md:rpvs-aspect-[5/6] rpvs-w-full rpvs-bg-black rpvs-flex rpvs-items-center rpvs-justify-center", children: [
          /* @__PURE__ */ jsx3(VideoPlayer, { videoUrl: product.videoUrl, videoConfig: finalConfig }),
          expandCard && /* @__PURE__ */ jsx3(
            "button",
            {
              type: "button",
              title: "Expand",
              className: "rpvs-absolute rpvs-top-0 rpvs-right-0 rpvs-text-white rpvs-p-1 rpvs-rounded rpvs-cursor-pointer",
              onClick: onExpand,
              "aria-label": "Expand video",
              children: /* @__PURE__ */ jsx3(Maximize, { className: "rpvs-text-white rpvs-w-8 rpvs-h-8" })
            }
          ),
          overlayExpandCard && /* @__PURE__ */ jsx3(
            "button",
            {
              type: "button",
              "aria-label": "Expand card",
              title: "Expand",
              className: "rpvs-absolute rpvs-inset-0 rpvs-z-10 rpvs-bg-transparent rpvs-cursor-pointer",
              onClick: onExpand
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rpvs-flex rpvs-flex-col", children: [
          contents && /* @__PURE__ */ jsx3("div", { children: contents }),
          buttons && /* @__PURE__ */ jsx3("div", { children: buttons })
        ] })
      ]
    }
  );
};

// src/components/ProductModalY.tsx
import { useEffect as useEffect2, useRef as useRef2, useState as useState2 } from "react";
import { jsx as jsx4, jsxs as jsxs2 } from "react/jsx-runtime";
var ProductModalY = ({
  products,
  activeIndex,
  onClose,
  videoConfig,
  contents,
  buttons
}) => {
  const [index, setIndex] = useState2(activeIndex);
  const containerRef = useRef2(null);
  const cardRefs = useRef2([]);
  const [animating, setAnimating] = useState2(false);
  useEffect2(() => {
    document.body.classList.add("overflow-hidden");
    return () => document.body.classList.remove("overflow-hidden");
  }, []);
  useEffect2(() => {
    if (containerRef.current && cardRefs.current[index]) {
      cardRefs.current[index]?.scrollIntoView({
        block: "start"
      });
    }
  }, [index]);
  useEffect2(() => {
    if (containerRef.current && cardRefs.current[index]) {
      setAnimating(true);
      cardRefs.current[index]?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
      const timer = setTimeout(() => setAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [index]);
  const touchStartY = useRef2(null);
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e) => {
    if (touchStartY.current === null) return;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    if (deltaY > 50 && index > 0) setIndex(index - 1);
    else if (deltaY < -50 && index < products.length - 1) setIndex(index + 1);
    touchStartY.current = null;
  };
  return /* @__PURE__ */ jsxs2(
    "div",
    {
      className: "rpvs-fixed rpvs-inset-0 rpvs-z-50 rpvs-bg-black/90 rpvs-flex rpvs-justify-center rpvs-items-center rpvs-transition-opacity",
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd,
      role: "dialog",
      "aria-modal": "true",
      children: [
        /* @__PURE__ */ jsx4(
          "button",
          {
            onClick: onClose,
            className: "rpvs-absolute rpvs-top-4 rpvs-left-4 rpvs-z-50 rpvs-text-white rpvs-cursor-pointer",
            "aria-label": "Close modal",
            children: /* @__PURE__ */ jsx4(Minimize, { className: "rpvs-w-6 rpvs-h-6 rpvs-text-white" })
          }
        ),
        /* @__PURE__ */ jsxs2("div", { className: "rpvs-hidden md:rpvs-flex rpvs-flex-col rpvs-absolute rpvs-right-4 rpvs-top-1/2 -rpvs-translate-y-1/2 rpvs-z-50 rpvs-space-y-3", children: [
          index > 0 ? /* @__PURE__ */ jsx4(
            "button",
            {
              onClick: () => setIndex(index - 1),
              className: "rpvs-p-3 rpvs-bg-white/60 rpvs-rounded-full hover:rpvs-bg-white/80 rpvs-cursor-pointer",
              children: /* @__PURE__ */ jsx4(ArrowUp, { className: "rpvs-w-6 rpvs-h-6 rpvs-text-black" })
            }
          ) : /* @__PURE__ */ jsx4("button", { disabled: true, className: "rpvs-opacity-0" }),
          index < products.length - 1 ? /* @__PURE__ */ jsx4(
            "button",
            {
              onClick: () => setIndex(index + 1),
              className: "rpvs-p-3 rpvs-bg-white/60 rpvs-rounded-full hover:rpvs-bg-white/80 rpvs-cursor-pointer",
              children: /* @__PURE__ */ jsx4(ArrowDown, { className: "rpvs-w-6 rpvs-h-6 rpvs-text-black" })
            }
          ) : /* @__PURE__ */ jsx4("button", { disabled: true, className: "rpvs-opacity-0" })
        ] }),
        /* @__PURE__ */ jsx4(
          "div",
          {
            ref: containerRef,
            className: "rpvs-w-full rpvs-h-full rpvs-overflow-y-auto rpvs-snap-y rpvs-snap-mandatory rpvs-scroll-smooth rpvs-hide-scrollbar",
            children: products.map((product, i) => /* @__PURE__ */ jsx4(
              "div",
              {
                ref: (el) => {
                  cardRefs.current[i] = el;
                },
                className: "rpvs-w-full rpvs-min-h-screen rpvs-snap-start rpvs-flex rpvs-justify-center rpvs-items-center",
                children: /* @__PURE__ */ jsxs2(
                  "div",
                  {
                    className: `rpvs-w-full rpvs-max-w-lg md:rpvs-max-w-2xl rpvs-h-screen rpvs-max-h-screen rpvs-flex rpvs-flex-col rpvs-items-center rpvs-bg-black rpvs-text-white rpvs-overflow-hidden rpvs-rounded rpvs-shadow-lg rpvs-transition-all rpvs-duration-300 rpvs-ease-in-out 
              ${animating && i === index ? "rpvs-scale-95 rpvs-opacity-50" : "rpvs-scale-100 rpvs-opacity-100"}`,
                    children: [
                      /* @__PURE__ */ jsx4("div", { className: "rpvs-relative rpvs-flex-grow rpvs-w-full rpvs-flex rpvs-items-center rpvs-justify-center rpvs-bg-black", children: /* @__PURE__ */ jsx4(
                        VideoPlayer,
                        {
                          videoUrl: product.videoUrl,
                          videoConfig
                        }
                      ) }),
                      /* @__PURE__ */ jsxs2("div", { className: "rpvs-p-4 rpvs-space-y-3 rpvs-w-full rpvs-bg-black/30", children: [
                        contents && contents(product),
                        buttons && buttons(product)
                      ] })
                    ]
                  }
                )
              },
              product.id
            ))
          }
        )
      ]
    }
  );
};

// src/components/ProductModalX.tsx
import { useEffect as useEffect3, useRef as useRef3, useState as useState3 } from "react";
import { jsx as jsx5, jsxs as jsxs3 } from "react/jsx-runtime";
var ProductModalX = ({
  products,
  activeIndex,
  onClose,
  videoConfig,
  contents,
  buttons
}) => {
  const [index, setIndex] = useState3(activeIndex);
  const [animating, setAnimating] = useState3(false);
  useEffect3(() => {
    document.body.classList.add("overflow-hidden");
    return () => document.body.classList.remove("overflow-hidden");
  }, []);
  useEffect3(() => {
    setAnimating(true);
    const timer = setTimeout(() => setAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [index]);
  const touchStartX = useRef3(null);
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (deltaX > 50 && index > 0) setIndex(index - 1);
    else if (deltaX < -50 && index < products.length - 1) setIndex(index + 1);
    touchStartX.current = null;
  };
  const currentProduct = products[index];
  return /* @__PURE__ */ jsxs3(
    "div",
    {
      className: "rpvs-fixed rpvs-inset-0 rpvs-z-50 rpvs-bg-black/90 rpvs-flex rpvs-justify-center rpvs-items-center rpvs-transition-opacity",
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd,
      children: [
        /* @__PURE__ */ jsx5(
          "button",
          {
            onClick: onClose,
            className: "rpvs-absolute rpvs-top-4 rpvs-left-4 rpvs-z-50 rpvs-p-3 rpvs-cursor-pointer",
            "aria-label": "Close modal",
            children: /* @__PURE__ */ jsx5(Minimize, { className: "rpvs-w-6 rpvs-h-6 rpvs-text-white" })
          }
        ),
        /* @__PURE__ */ jsxs3("div", { className: "rpvs-hidden md:rpvs-flex rpvs-flex-row rpvs-absolute rpvs-top-1/2 -rpvs-translate-y-1/2 rpvs-z-50 rpvs-justify-between rpvs-w-full rpvs-px-4", children: [
          index > 0 ? /* @__PURE__ */ jsx5(
            "button",
            {
              onClick: () => setIndex(index - 1),
              className: "rpvs-p-3 rpvs-bg-white/60 rpvs-rounded-full hover:rpvs-bg-white/80 rpvs-cursor-pointer",
              children: /* @__PURE__ */ jsx5(ArrowLeft, { className: "rpvs-w-6 rpvs-h-6 rpvs-text-black" })
            }
          ) : /* @__PURE__ */ jsx5("div", {}),
          index < products.length - 1 ? /* @__PURE__ */ jsx5(
            "button",
            {
              onClick: () => setIndex(index + 1),
              className: "rpvs-p-3 rpvs-bg-white/60 rpvs-rounded-full hover:rpvs-bg-white/80 rpvs-cursor-pointer",
              children: /* @__PURE__ */ jsx5(ArrowRight, { className: "rpvs-w-6 rpvs-h-6 rpvs-text-black" })
            }
          ) : /* @__PURE__ */ jsx5("div", {})
        ] }),
        /* @__PURE__ */ jsx5("div", { className: "rpvs-w-full rpvs-h-full rpvs-flex rpvs-justify-center rpvs-items-center rpvs-overflow-hidden", children: /* @__PURE__ */ jsxs3(
          "div",
          {
            className: `rpvs-w-full rpvs-max-w-lg md:rpvs-max-w-2xl rpvs-h-screen rpvs-max-h-screen rpvs-flex rpvs-flex-col rpvs-items-center rpvs-bg-black rpvs-text-white rpvs-overflow-hidden rpvs-rounded rpvs-shadow-lg rpvs-transition-all rpvs-duration-300 rpvs-ease-in-out 
            ${animating ? "rpvs-scale-95 rpvs-opacity-50" : "rpvs-scale-100 rpvs-opacity-100"}`,
            children: [
              /* @__PURE__ */ jsx5("div", { className: "rpvs-relative rpvs-flex-grow rpvs-w-full rpvs-flex rpvs-items-center rpvs-justify-center rpvs-bg-black", children: /* @__PURE__ */ jsx5(
                VideoPlayer,
                {
                  videoUrl: currentProduct.videoUrl,
                  videoConfig
                }
              ) }),
              /* @__PURE__ */ jsxs3("div", { className: "rpvs-p-4 rpvs-space-y-3 rpvs-w-full rpvs-bg-black/30", children: [
                contents && contents(currentProduct),
                buttons && buttons(currentProduct)
              ] })
            ]
          }
        ) })
      ]
    }
  );
};

// src/hooks/useDeviceType.ts
import { useEffect as useEffect4, useState as useState4 } from "react";
function useDeviceType() {
  const [device, setDevice] = useState4(
    "desktop"
  );
  useEffect4(() => {
    const updateDevice = () => {
      const width = window.innerWidth;
      if (width <= 640) setDevice("mobile");
      else if (width <= 1024) setDevice("tablet");
      else setDevice("desktop");
    };
    updateDevice();
    window.addEventListener("resize", updateDevice);
    return () => window.removeEventListener("resize", updateDevice);
  }, []);
  return device;
}

// src/lib/style-injector.ts
var injected = false;
function injectStyles() {
  if (injected || typeof document === "undefined") return;
  injected = true;
  const style = document.createElement("style");
  style.textContent = `*,:after,:before{--tw-border-spacing-x:0;--tw-border-spacing-y:0;--tw-translate-x:0;--tw-translate-y:0;--tw-rotate:0;--tw-skew-x:0;--tw-skew-y:0;--tw-scale-x:1;--tw-scale-y:1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness:proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-color:#3b82f680;--tw-ring-offset-shadow:0 0 #0000;--tw-ring-shadow:0 0 #0000;--tw-shadow:0 0 #0000;--tw-shadow-colored:0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x:0;--tw-border-spacing-y:0;--tw-translate-x:0;--tw-translate-y:0;--tw-rotate:0;--tw-skew-x:0;--tw-skew-y:0;--tw-scale-x:1;--tw-scale-y:1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness:proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-color:#3b82f680;--tw-ring-offset-shadow:0 0 #0000;--tw-ring-shadow:0 0 #0000;--tw-shadow:0 0 #0000;--tw-shadow-colored:0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }/*! tailwindcss v3.4.17 | MIT License | https://tailwindcss.com*/*,:after,:before{border:0 solid #e5e7eb;box-sizing:border-box}:after,:before{--tw-content:""}:host,html{-webkit-text-size-adjust:100%;font-feature-settings:normal;-webkit-tap-highlight-color:transparent;font-family:ui-sans-serif,system-ui,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;font-variation-settings:normal;line-height:1.5;tab-size:4}body{line-height:inherit;margin:0}hr{border-top-width:1px;color:inherit;height:0}abbr:where([title]){-webkit-text-decoration:underline dotted;text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,pre,samp{font-feature-settings:normal;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-size:1em;font-variation-settings:normal}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:initial}sub{bottom:-.25em}sup{top:-.5em}table{border-collapse:collapse;border-color:inherit;text-indent:0}button,input,optgroup,select,textarea{font-feature-settings:inherit;color:inherit;font-family:inherit;font-size:100%;font-variation-settings:inherit;font-weight:inherit;letter-spacing:inherit;line-height:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:initial;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:initial}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dd,dl,figure,h1,h2,h3,h4,h5,h6,hr,p,pre{margin:0}fieldset{margin:0}fieldset,legend{padding:0}menu,ol,ul{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{color:#9ca3af;opacity:1}[role=button],button{cursor:pointer}:disabled{cursor:default}audio,canvas,embed,iframe,img,object,svg,video{display:block;vertical-align:middle}img,video{height:auto;max-width:100%}[hidden]:where(:not([hidden=until-found])){display:none}.rpvs-fixed{position:fixed}.rpvs-absolute{position:absolute}.rpvs-relative{position:relative}.rpvs-inset-0{inset:0}.rpvs-left-4{left:1rem}.rpvs-right-0{right:0}.rpvs-right-4{right:1rem}.rpvs-top-0{top:0}.rpvs-top-1{top:.25rem}.rpvs-top-1\\/2{top:50%}.rpvs-top-4{top:1rem}.rpvs-z-10{z-index:10}.rpvs-z-50{z-index:50}.rpvs-my-1{margin-bottom:.25rem;margin-top:.25rem}.rpvs-my-1\\.5{margin-bottom:.375rem;margin-top:.375rem}.rpvs-my-4{margin-top:1rem}.rpvs-mb-4,.rpvs-my-4{margin-bottom:1rem}.rpvs-ml-2{margin-left:.5rem}.rpvs-block{display:block}.rpvs-flex{display:flex}.rpvs-grid{display:grid}.rpvs-hidden{display:none}.rpvs-aspect-\\[4\\/5\\]{aspect-ratio:4/5}.rpvs-aspect-video{aspect-ratio:16/9}.rpvs-h-12{height:3rem}.rpvs-h-5{height:1.25rem}.rpvs-h-6{height:1.5rem}.rpvs-h-8{height:2rem}.rpvs-h-full{height:100%}.rpvs-h-screen{height:100vh}.rpvs-max-h-screen{max-height:100vh}.rpvs-min-h-\\[50vh\\]{min-height:50vh}.rpvs-min-h-screen{min-height:100vh}.rpvs-w-12{width:3rem}.rpvs-w-6{width:1.5rem}.rpvs-w-8{width:2rem}.rpvs-w-\\[30\\%\\]{width:30%}.rpvs-w-full{width:100%}.rpvs-min-w-\\[250px\\]{min-width:250px}.rpvs-min-w-full{min-width:100%}.rpvs-max-w-lg{max-width:32rem}.rpvs-max-w-sm{max-width:24rem}.rpvs-flex-shrink-0{flex-shrink:0}.rpvs-flex-grow{flex-grow:1}.-rpvs-translate-y-1{--tw-translate-y:-0.25rem}.-rpvs-translate-y-1,.-rpvs-translate-y-1\\/2{transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.-rpvs-translate-y-1\\/2{--tw-translate-y:-50%}.rpvs-scale-100{--tw-scale-x:1;--tw-scale-y:1}.rpvs-scale-100,.rpvs-scale-95{transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.rpvs-scale-95{--tw-scale-x:.95;--tw-scale-y:.95}@keyframes rpvs-spin{to{transform:rotate(1turn)}}.rpvs-animate-spin{animation:rpvs-spin 1s linear infinite}.rpvs-cursor-pointer{cursor:pointer}.rpvs-snap-x{scroll-snap-type:x var(--tw-scroll-snap-strictness)}.rpvs-snap-y{scroll-snap-type:y var(--tw-scroll-snap-strictness)}.rpvs-snap-mandatory{--tw-scroll-snap-strictness:mandatory}.rpvs-snap-start{scroll-snap-align:start}.rpvs-flex-row{flex-direction:row}.rpvs-flex-col{flex-direction:column}.rpvs-items-center{align-items:center}.rpvs-justify-center{justify-content:center}.rpvs-justify-between{justify-content:space-between}.rpvs-gap-1{gap:.25rem}.rpvs-gap-2{gap:.5rem}.rpvs-gap-3{gap:.75rem}.rpvs-gap-4{gap:1rem}.rpvs-gap-5{gap:1.25rem}.rpvs-space-y-3>:not([hidden])~:not([hidden]){--tw-space-y-reverse:0;margin-bottom:calc(.75rem*var(--tw-space-y-reverse));margin-top:calc(.75rem*(1 - var(--tw-space-y-reverse)))}.rpvs-overflow-hidden{overflow:hidden}.rpvs-overflow-x-auto{overflow-x:auto}.rpvs-overflow-y-auto{overflow-y:auto}.rpvs-scroll-smooth{scroll-behavior:smooth}.rpvs-rounded{border-radius:.25rem}.rpvs-rounded-full{border-radius:9999px}.rpvs-border-4{border-width:4px}.rpvs-border-white{--tw-border-opacity:1;border-color:rgb(255 255 255/var(--tw-border-opacity,1))}.rpvs-border-t-transparent{border-top-color:#0000}.rpvs-bg-black{--tw-bg-opacity:1;background-color:rgb(0 0 0/var(--tw-bg-opacity,1))}.rpvs-bg-black\\/30{background-color:#0000004d}.rpvs-bg-black\\/90{background-color:#000000e6}.rpvs-bg-gray-300{--tw-bg-opacity:1;background-color:rgb(209 213 219/var(--tw-bg-opacity,1))}.rpvs-bg-gray-600{--tw-bg-opacity:1;background-color:rgb(75 85 99/var(--tw-bg-opacity,1))}.rpvs-bg-transparent{background-color:initial}.rpvs-bg-white{--tw-bg-opacity:1;background-color:rgb(255 255 255/var(--tw-bg-opacity,1))}.rpvs-bg-white\\/60{background-color:#fff9}.rpvs-p-1{padding:.25rem}.rpvs-p-2{padding:.5rem}.rpvs-p-3{padding:.75rem}.rpvs-p-4{padding:1rem}.rpvs-p-5{padding:1.25rem}.rpvs-px-2{padding-left:.5rem;padding-right:.5rem}.rpvs-px-4{padding-left:1rem;padding-right:1rem}.rpvs-py-2{padding-bottom:.5rem;padding-top:.5rem}.rpvs-text-center{text-align:center}.rpvs-text-2xl{font-size:1.5rem;line-height:2rem}.rpvs-text-xl{font-size:1.25rem;line-height:1.75rem}.rpvs-font-bold{font-weight:700}.rpvs-font-semibold{font-weight:600}.rpvs-uppercase{text-transform:uppercase}.rpvs-text-black{--tw-text-opacity:1;color:rgb(0 0 0/var(--tw-text-opacity,1))}.rpvs-text-gray-500{--tw-text-opacity:1;color:rgb(107 114 128/var(--tw-text-opacity,1))}.rpvs-text-gray-700{--tw-text-opacity:1;color:rgb(55 65 81/var(--tw-text-opacity,1))}.rpvs-text-red-500{--tw-text-opacity:1;color:rgb(239 68 68/var(--tw-text-opacity,1))}.rpvs-text-white{--tw-text-opacity:1;color:rgb(255 255 255/var(--tw-text-opacity,1))}.rpvs-underline{-webkit-text-decoration-line:underline;text-decoration-line:underline}.rpvs-line-through{-webkit-text-decoration-line:line-through;text-decoration-line:line-through}.rpvs-opacity-0{opacity:0}.rpvs-opacity-100{opacity:1}.rpvs-opacity-50{opacity:.5}.rpvs-shadow-lg{--tw-shadow:0 10px 15px -3px #0000001a,0 4px 6px -4px #0000001a;--tw-shadow-colored:0 10px 15px -3px var(--tw-shadow-color),0 4px 6px -4px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow)}.rpvs-transition-all{transition-duration:.15s;transition-property:all;transition-timing-function:cubic-bezier(.4,0,.2,1)}.rpvs-transition-opacity{transition-duration:.15s;transition-property:opacity;transition-timing-function:cubic-bezier(.4,0,.2,1)}.rpvs-duration-300{transition-duration:.3s}.rpvs-ease-in-out{transition-timing-function:cubic-bezier(.4,0,.2,1)}.rpvs-hide-scrollbar::-webkit-scrollbar{display:none}.rpvs-hide-scrollbar{-ms-overflow-style:none;scrollbar-width:none}.hover\\:rpvs-bg-white\\/80:hover{background-color:#fffc}@media (min-width:768px){.md\\:rpvs-flex{display:flex}.md\\:rpvs-aspect-\\[5\\/6\\]{aspect-ratio:5/6}.md\\:rpvs-max-w-2xl{max-width:42rem}}`;
  document.head.appendChild(style);
}

// src/components/ProductGrid.tsx
import { Fragment, jsx as jsx6, jsxs as jsxs4 } from "react/jsx-runtime";
var ProductGrid = ({
  products,
  layout,
  maxItems,
  videoConfig,
  sectionHeader,
  contents,
  buttons,
  slide = false,
  slideInterval = 3e3,
  sliderDirection = "backward",
  expandCard = false,
  overlayExpandCard = false,
  expandCardSlide = "vertical"
}) => {
  const device = useDeviceType();
  const { column, row } = layout[device];
  const [activeIndex, setActiveIndex] = useState5(null);
  const [modalOpen, setModalOpen] = useState5(false);
  const slicedProducts = products.slice(0, maxItems);
  const itemsPerPage = column * row;
  const totalPages = Math.ceil(slicedProducts.length / itemsPerPage);
  const containerRef = useRef4(null);
  const initialPage = sliderDirection === "backward" ? totalPages - 1 : 0;
  const [currentPage, setCurrentPage] = useState5(initialPage);
  useEffect5(() => {
    injectStyles();
  }, []);
  const scrollToPage = (page) => {
    if (containerRef.current) {
      const width = containerRef.current.clientWidth;
      containerRef.current.scrollTo({
        left: page * width,
        behavior: "smooth"
      });
    }
  };
  useEffect5(() => {
    if (sliderDirection === "backward") {
      setCurrentPage(totalPages - 1);
      scrollToPage(totalPages - 1);
    } else {
      setCurrentPage(0);
      scrollToPage(0);
    }
  }, [totalPages, sliderDirection]);
  const handleNext = () => {
    const nextPage = (currentPage + 1) % totalPages;
    setCurrentPage(nextPage);
    scrollToPage(nextPage);
  };
  const handlePrev = () => {
    const prevPage = (currentPage - 1 + totalPages) % totalPages;
    setCurrentPage(prevPage);
    scrollToPage(prevPage);
  };
  useEffect5(() => {
    if (!slide || modalOpen) return;
    const interval = setInterval(() => {
      if (sliderDirection === "forward") {
        handleNext();
      } else {
        handlePrev();
      }
    }, slideInterval);
    return () => clearInterval(interval);
  }, [slide, slideInterval, sliderDirection, currentPage]);
  useEffect5(() => {
    if (activeIndex !== null && activeIndex >= slicedProducts.length) {
      setActiveIndex(null);
    }
  }, [slicedProducts, activeIndex]);
  return /* @__PURE__ */ jsxs4(Fragment, { children: [
    /* @__PURE__ */ jsxs4("div", { children: [
      sectionHeader && /* @__PURE__ */ jsx6("div", { className: "rpvs-mb-4", children: sectionHeader({
        handleNext,
        handlePrev,
        isSliding: slide
      }) }),
      /* @__PURE__ */ jsx6(
        "div",
        {
          ref: containerRef,
          className: "rpvs-w-full rpvs-overflow-x-auto rpvs-snap-x rpvs-scroll-smooth rpvs-hide-scrollbar",
          style: {
            scrollSnapType: "x mandatory"
          },
          children: /* @__PURE__ */ jsx6("div", { className: "rpvs-flex", children: [...Array(totalPages)].map((_, pageIndex) => {
            const pageItems = slicedProducts.slice(
              pageIndex * itemsPerPage,
              (pageIndex + 1) * itemsPerPage
            );
            return /* @__PURE__ */ jsx6(
              "div",
              {
                className: "rpvs-w-full rpvs-flex-shrink-0 rpvs-snap-start rpvs-px-2",
                style: { width: "100%" },
                children: /* @__PURE__ */ jsx6(
                  "div",
                  {
                    className: "rpvs-grid rpvs-gap-5",
                    style: {
                      gridTemplateColumns: `repeat(${column}, minmax(0, 1fr))`,
                      gridTemplateRows: `repeat(${row}, minmax(0, 1fr))`
                    },
                    children: pageItems.map((product, index) => /* @__PURE__ */ jsx6(
                      ProductCard,
                      {
                        product,
                        videoConfig,
                        contents: contents ? contents(product) : void 0,
                        buttons: buttons ? buttons(product) : void 0,
                        expandCard,
                        overlayExpandCard,
                        onExpand: () => {
                          setActiveIndex(pageIndex * itemsPerPage + index);
                          setModalOpen(true);
                        }
                      },
                      product.id
                    ))
                  }
                )
              },
              pageIndex
            );
          }) })
        }
      )
    ] }),
    (expandCard || overlayExpandCard) && activeIndex !== null && (expandCardSlide === "vertical" ? /* @__PURE__ */ jsx6(
      ProductModalY,
      {
        products: slicedProducts,
        activeIndex,
        onClose: () => setActiveIndex(null),
        contents,
        buttons
      }
    ) : /* @__PURE__ */ jsx6(
      ProductModalX,
      {
        products: slicedProducts,
        activeIndex,
        onClose: () => setActiveIndex(null),
        contents,
        buttons
      }
    ))
  ] });
};
export {
  ProductGrid
};
//# sourceMappingURL=index.mjs.map