// src/index.tsx
import React4 from "react";
import ReactDOM from "react-dom";

// src/components/ProductGrid.tsx
import { useEffect as useEffect5, useRef as useRef4, useState as useState5 } from "react";

// src/utils/videoConfig.ts
var defaultVideoConfig = {
  autoplay: false,
  //  Both YouTube & Facebook
  mute: true,
  // YouTube (limited support on Facebook)
  loop: false,
  // YouTube only
  // --- YouTube-specific options ---
  controls: false,
  //  YouTube (show/hide player controls)
  modestBranding: false,
  //  YouTube (removes YouTube logo)
  rel: false,
  //  YouTube (disable suggested videos at end)
  showInfo: false,
  //  YouTube (deprecated, use modestBranding + rel)
  // --- Facebook-specific options ---
  facebookAllowFullscreen: true,
  //  Facebook (enable fullscreen support)
  show_text: false
  //  Facebook (hide video caption text)
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
import { Fragment, jsx } from "react/jsx-runtime";
var VideoPlayer = ({
  videoUrl,
  videoConfig = {}
}) => {
  const [ref, isVisible] = useLazyLoad();
  const { platform, videoId, embedUrl, error } = useVideoPlatform(videoUrl);
  if (error) {
    return /* @__PURE__ */ jsx("div", { className: "text-red-500", children: error });
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
  const finalEmbedUrl = `${embedUrl}${embedUrl?.includes("?") ? "&" : "?"}${queryParams.toString()}`;
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(
    "div",
    {
      ref,
      className: "min-w-full min-h-[50vh] aspect-video bg-black relative rounded overflow-hidden",
      children: isVisible ? /* @__PURE__ */ jsx(
        "iframe",
        {
          title: `Embedded ${platform} video`,
          loading: "lazy",
          src: finalEmbedUrl,
          width: "100%",
          height: platform === "facebook" ? "500" : "100%",
          className: platform === "youtube" ? "w-full h-full" : "",
          allow: "autoplay; encrypted-media",
          allowFullScreen: platform === "facebook" ? videoConfig.facebookAllowFullscreen : true
        }
      ) : /* @__PURE__ */ jsx("div", { className: "w-full h-full bg-gray-600 relative", children: /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" }) }) })
    }
  ) });
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
import { Fragment as Fragment2, jsx as jsx3, jsxs } from "react/jsx-runtime";
var ProductCard = ({
  product,
  slide = false,
  contents,
  buttons,
  videoConfig,
  expandCard,
  onExpand
}) => {
  const finalConfig = mergeVideoConfig(videoConfig);
  return /* @__PURE__ */ jsx3(Fragment2, { children: /* @__PURE__ */ jsxs(
    "div",
    {
      className: `flex flex-col rounded overflow-hidden ${slide ? "min-w-[250px] max-w-sm" : "w-full"}`,
      children: [
        /* @__PURE__ */ jsxs("div", { className: "relative aspect-[4/5] md:aspect-[5/6] w-full bg-black flex items-center justify-center", children: [
          /* @__PURE__ */ jsx3(VideoPlayer, { videoUrl: product.videoUrl, videoConfig: finalConfig }),
          expandCard && /* @__PURE__ */ jsx3(
            "button",
            {
              type: "button",
              title: "Expand",
              className: "absolute top-0 right-0 text-white p-1 rounded cursor-pointer",
              onClick: onExpand,
              "aria-label": "Expand video",
              children: /* @__PURE__ */ jsx3(Maximize, { className: "text-white  w-8 h-8" })
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
          contents && /* @__PURE__ */ jsx3("div", { children: contents }),
          buttons && /* @__PURE__ */ jsx3("div", { children: buttons })
        ] })
      ]
    }
  ) });
};

// src/components/ProductModalY.tsx
import { useEffect as useEffect2, useRef as useRef2, useState as useState2 } from "react";
import { Fragment as Fragment3, jsx as jsx4, jsxs as jsxs2 } from "react/jsx-runtime";
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
        // behavior: "instant",
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
  return /* @__PURE__ */ jsx4(Fragment3, { children: /* @__PURE__ */ jsxs2(
    "div",
    {
      className: "fixed inset-0 z-50 bg-black/90 flex justify-center items-center transition-opacity",
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd,
      role: "dialog",
      "aria-modal": "true",
      children: [
        /* @__PURE__ */ jsx4(
          "button",
          {
            onClick: onClose,
            className: "absolute top-4 left-4 z-50 text-white cursor-pointer",
            children: /* @__PURE__ */ jsx4(Minimize, { "aria-label": "Close modal", className: "w-6 h-6 text-white" })
          }
        ),
        /* @__PURE__ */ jsxs2("div", { className: "hidden md:flex flex-col absolute right-4 top-1/2 -translate-y-1/2 z-50 space-y-3", children: [
          index > 0 ? /* @__PURE__ */ jsx4(
            "button",
            {
              onClick: () => setIndex(index - 1),
              className: "p-3 bg-white/60 rounded-full hover:bg-white/80 cursor-pointer",
              children: /* @__PURE__ */ jsx4(ArrowUp, { className: "w-6 h-6 text-black" })
            }
          ) : /* @__PURE__ */ jsx4("button", {}),
          index < products.length - 1 ? /* @__PURE__ */ jsx4(
            "button",
            {
              onClick: () => setIndex(index + 1),
              className: "p-3 bg-white/60 rounded-full hover:bg-white/80 cursor-pointer",
              children: /* @__PURE__ */ jsx4(ArrowDown, { className: "w-6 h-6 text-black" })
            }
          ) : /* @__PURE__ */ jsx4("button", {})
        ] }),
        /* @__PURE__ */ jsx4(
          "div",
          {
            ref: containerRef,
            className: "w-full h-full overflow-y-auto snap-y snap-mandatory scroll-smooth hide-scrollbar",
            children: products.map((product, i) => /* @__PURE__ */ jsx4(
              "div",
              {
                ref: (el) => {
                  cardRefs.current[i] = el;
                },
                className: "w-full min-h-screen snap-start flex justify-center items-center",
                children: /* @__PURE__ */ jsxs2(
                  "div",
                  {
                    className: `w-full max-w-lg md:max-w-2xl h-screen max-h-screen flex flex-col items-center bg-black text-white overflow-hidden rounded shadow-lg transition-all duration-300 ease-in-out 
                ${animating && i === index ? "scale-95 opacity-50" : "scale-100 opacity-100"}`,
                    children: [
                      /* @__PURE__ */ jsx4("div", { className: "relative flex-grow w-full flex items-center justify-center bg-black", children: /* @__PURE__ */ jsx4(
                        VideoPlayer,
                        {
                          videoUrl: product.videoUrl,
                          videoConfig
                        }
                      ) }),
                      /* @__PURE__ */ jsxs2("div", { className: "p-4 space-y-3 w-full bg-black/30", children: [
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
  ) });
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
      className: "fixed inset-0 z-50 bg-black/90 flex justify-center items-center transition-opacity",
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd,
      children: [
        /* @__PURE__ */ jsx5(
          "button",
          {
            onClick: onClose,
            className: "absolute top-4 left-4 z-50 p-3 cursor-pointer",
            "aria-label": "Close modal",
            children: /* @__PURE__ */ jsx5(Minimize, { className: "w-6 h-6 text-white" })
          }
        ),
        /* @__PURE__ */ jsxs3("div", { className: "hidden md:flex flex-row absolute top-1/2 -translate-y-1/2 z-50 justify-between w-full px-4", children: [
          index > 0 ? /* @__PURE__ */ jsx5(
            "button",
            {
              onClick: () => setIndex(index - 1),
              className: "p-3 bg-white/60 rounded-full hover:bg-white/80 cursor-pointer",
              children: /* @__PURE__ */ jsx5(ArrowLeft, { className: "w-6 h-6 text-black" })
            }
          ) : /* @__PURE__ */ jsx5("div", {}),
          index < products.length - 1 ? /* @__PURE__ */ jsx5(
            "button",
            {
              onClick: () => setIndex(index + 1),
              className: "p-3 bg-white/60 rounded-full hover:bg-white/80 cursor-pointer",
              children: /* @__PURE__ */ jsx5(ArrowRight, { className: "w-6 h-6 text-black" })
            }
          ) : /* @__PURE__ */ jsx5("div", {})
        ] }),
        /* @__PURE__ */ jsx5("div", { className: "w-full h-full flex justify-center items-center overflow-hidden", children: /* @__PURE__ */ jsxs3(
          "div",
          {
            className: `w-full max-w-lg md:max-w-2xl h-screen max-h-screen flex flex-col items-center bg-black text-white overflow-hidden rounded shadow-lg transition-all duration-300 ease-in-out 
            ${animating ? "scale-95 opacity-50" : "scale-100 opacity-100"}`,
            children: [
              /* @__PURE__ */ jsx5("div", { className: "relative flex-grow w-full flex items-center justify-center bg-black", children: /* @__PURE__ */ jsx5(
                VideoPlayer,
                {
                  videoUrl: currentProduct.videoUrl,
                  videoConfig
                }
              ) }),
              /* @__PURE__ */ jsxs3("div", { className: "p-4 space-y-3 w-full bg-black/30", children: [
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

// src/components/ProductGrid.tsx
import { Fragment as Fragment4, jsx as jsx6, jsxs as jsxs4 } from "react/jsx-runtime";
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
  expandCard = true,
  expandCardSlide = "vertical"
}) => {
  const device = useDeviceType();
  const { column, row } = layout[device];
  const [activeIndex, setActiveIndex] = useState5(null);
  const slicedProducts = products.slice(0, maxItems);
  const itemsPerPage = column * row;
  const totalPages = Math.ceil(slicedProducts.length / itemsPerPage);
  const containerRef = useRef4(null);
  const initialPage = sliderDirection === "backward" ? totalPages - 1 : 0;
  const [currentPage, setCurrentPage] = useState5(initialPage);
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
    if (!slide) return;
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
  return /* @__PURE__ */ jsxs4(Fragment4, { children: [
    /* @__PURE__ */ jsxs4("div", { children: [
      sectionHeader && /* @__PURE__ */ jsx6("div", { className: "mb-4", children: sectionHeader({
        handleNext,
        handlePrev,
        isSliding: slide
      }) }),
      /* @__PURE__ */ jsx6(
        "div",
        {
          ref: containerRef,
          className: "w-full overflow-x-auto snap-x scroll-smooth hide-scrollbar",
          style: { scrollSnapType: "x mandatory" },
          children: /* @__PURE__ */ jsx6("div", { className: "flex", children: [...Array(totalPages)].map((_, pageIndex) => {
            const pageItems = slicedProducts.slice(
              pageIndex * itemsPerPage,
              (pageIndex + 1) * itemsPerPage
            );
            return /* @__PURE__ */ jsx6(
              "div",
              {
                className: "w-full flex-shrink-0 snap-start px-2",
                style: { width: "100%" },
                children: /* @__PURE__ */ jsx6(
                  "div",
                  {
                    className: `grid gap-5 `,
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
                        onExpand: () => setActiveIndex(pageIndex * itemsPerPage + index)
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
    expandCard && activeIndex !== null && (expandCardSlide === "vertical" ? /* @__PURE__ */ jsx6(
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

// src/data/mockProducts.ts
var mockProducts = [
  {
    id: "1",
    title: "Sample YouTube Video 1",
    price: 99.99,
    discountPrice: 79.99,
    videoUrl: "https://www.youtube.com/watch?v=GMniyQIc1eU",
    currency: "BDT"
  },
  {
    id: "2",
    title: "Facebook Video 1",
    price: 49.99,
    videoUrl: "https://www.facebook.com/worldchampionshipsofperformingarts/videos/1024342002495478/",
    currency: "BDT"
  },
  {
    id: "3",
    title: "Sample YouTube Short 1",
    price: 99.99,
    discountPrice: 69.99,
    videoUrl: "https://www.facebook.com/RIARVG/videos/tom-and-jerry-classic-cartoon/554552160781061/",
    currency: "BDT"
  },
  {
    id: "4",
    title: "Sample YouTube Video 2",
    price: 99.99,
    discountPrice: 59.99,
    videoUrl: "https://www.youtube.com/watch?v=WHQguqyEtYc",
    currency: "BDT"
  },
  {
    id: "5",
    title: "Facebook Video 2",
    price: 99.99,
    discountPrice: 49.99,
    videoUrl: "https://www.facebook.com/100063942909772/videos/1977140266150386/?__so__=permalink",
    currency: "BDT"
  },
  {
    id: "6",
    title: "Sample YouTube Short 2",
    price: 99.99,
    discountPrice: 39.99,
    videoUrl: "https://www.youtube.com/shorts/gu1HAFFemWk",
    currency: "BDT"
  },
  {
    id: "7",
    title: "Sample YouTube Video 3",
    price: 99.99,
    discountPrice: 39.99,
    videoUrl: "https://www.youtube.com/watch?v=CPwdL44yLMg",
    currency: "BDT"
  },
  {
    id: "8",
    title: "Facebook Video 3",
    price: 99.99,
    discountPrice: 39.99,
    videoUrl: "https://www.facebook.com/100063942909772/videos/9716186258508922/?__so__=permalink",
    currency: "BDT"
  },
  {
    id: "9",
    title: "Sample Youtube Short 3",
    price: 99.99,
    discountPrice: 39.99,
    videoUrl: "https://www.youtube.com/shorts/I9rttzYnDmw",
    currency: "BDT"
  },
  {
    id: "10",
    title: "Sample YouTube Video 4",
    price: 99.99,
    discountPrice: 39.99,
    videoUrl: "https://www.youtube.com/watch?v=QYotv1aOK3g",
    currency: "BDT"
  },
  {
    id: "11",
    title: "Facebook Video 4",
    price: 99.99,
    discountPrice: 39.99,
    videoUrl: "https://www.facebook.com/100063942909772/videos/1264272745133478/?__so__=permalink",
    currency: "BDT"
  },
  {
    id: "12",
    title: "Sample Youtube Short 4",
    price: 99.99,
    discountPrice: 39.99,
    videoUrl: "https://www.youtube.com/shorts/L08GfrUOnPM",
    currency: "BDT"
  }
];

// src/App.tsx
import { Fragment as Fragment5, jsx as jsx7, jsxs as jsxs5 } from "react/jsx-runtime";
function App() {
  const renderSectionHeader = ({
    handleNext,
    handlePrev,
    isSliding
  }) => /* @__PURE__ */ jsxs5("div", { className: "flex justify-between items-center gap-4 my-4", children: [
    isSliding && /* @__PURE__ */ jsxs5("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsx7(
        "button",
        {
          className: "p-3 bg-gray-300 text-black cursor-pointer rounded-full",
          onClick: handlePrev,
          children: /* @__PURE__ */ jsx7(ArrowLeft, { className: "text-black w-6 h-5" })
        }
      ),
      /* @__PURE__ */ jsx7(
        "button",
        {
          className: "p-3 bg-gray-300 text-black cursor-pointer rounded-full",
          onClick: handleNext,
          children: /* @__PURE__ */ jsx7(ArrowRight, { className: "text-black w-6 h-5" })
        }
      )
    ] }),
    /* @__PURE__ */ jsxs5("h1", { className: "text-2xl font-bold text-center underline uppercase", children: [
      "Video Products ",
      /* @__PURE__ */ jsx7("small", { children: "(backward - horizontal)" })
    ] })
  ] });
  const renderContents = (product) => {
    return /* @__PURE__ */ jsxs5(Fragment5, { children: [
      /* @__PURE__ */ jsx7("div", { className: "hidden md:block", children: /* @__PURE__ */ jsxs5("div", { className: "flex justify-between items-center gap-3 w-full my-1.5", children: [
        /* @__PURE__ */ jsx7("h3", { className: "text-medium font-semibold text-primary", children: product.title }),
        /* @__PURE__ */ jsxs5("div", { className: " font-semibold text-primary flex items-center gap-1", children: [
          product.currency,
          " ",
          (product?.discountPrice ?? 0) > 0 && (product?.discountPrice ?? 0) < product.price ? /* @__PURE__ */ jsxs5("div", { children: [
            /* @__PURE__ */ jsx7("span", { className: "line-through text-gray-500 text-md", children: product.price }),
            /* @__PURE__ */ jsx7("span", { className: "text-gray-700 ml-2 text-xl", children: product.discountPrice })
          ] }) : /* @__PURE__ */ jsx7("span", { className: "text-gray-700 ml-2 text-xl", children: product.price })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs5("div", { className: "block md:hidden", children: [
        /* @__PURE__ */ jsx7("h3", { className: "text-medium font-semibold text-primary", children: product.title }),
        /* @__PURE__ */ jsxs5("div", { className: " font-semibold text-primary flex items-center gap-1", children: [
          product.currency,
          " ",
          (product?.discountPrice ?? 0) > 0 && (product?.discountPrice ?? 0) < product.price ? /* @__PURE__ */ jsxs5("div", { children: [
            /* @__PURE__ */ jsx7("span", { className: "line-through text-gray-500 text-md", children: product.price }),
            /* @__PURE__ */ jsx7("span", { className: "text-gray-700 ml-2 text-xl", children: product.discountPrice })
          ] }) : /* @__PURE__ */ jsx7("span", { className: "text-gray-700 ml-2 text-xl", children: product.price })
        ] })
      ] })
    ] });
  };
  const renderButtons = (product) => {
    return /* @__PURE__ */ jsxs5(Fragment5, { children: [
      /* @__PURE__ */ jsx7("div", { className: "hidden md:block", children: /* @__PURE__ */ jsxs5("div", { className: "flex justify-between items-center gap-3 w-full my-1.5", children: [
        /* @__PURE__ */ jsx7(
          "button",
          {
            className: "bg-gray-300 text-center py-2 w-[30%] text-md rounded cursor-pointer",
            onClick: () => console.log(`Add to Cart`, product.id),
            children: "Add to Cart"
          }
        ),
        /* @__PURE__ */ jsx7(
          "button",
          {
            className: "bg-gray-300 text-center py-2 w-[70%] text-md rounded cursor-pointer",
            onClick: () => console.log(`Buy Now`, product.id),
            children: "Buy Now"
          }
        )
      ] }) }),
      /* @__PURE__ */ jsx7("div", { className: "block md:hidden", children: /* @__PURE__ */ jsxs5("div", { className: "flex flex-col gap-3 w-full my-1.5", children: [
        /* @__PURE__ */ jsx7(
          "button",
          {
            className: "bg-gray-300 text-center py-2 text-md rounded cursor-pointer",
            onClick: () => console.log(`Add to Cart`, product.id),
            children: "Add to Cart"
          }
        ),
        /* @__PURE__ */ jsx7(
          "button",
          {
            className: "bg-gray-300 text-center py-2 text-md rounded cursor-pointer",
            onClick: () => console.log(`Buy Now`, product.id),
            children: "Buy Now"
          }
        )
      ] }) })
    ] });
  };
  return /* @__PURE__ */ jsx7(Fragment5, { children: /* @__PURE__ */ jsx7("div", { className: "", children: /* @__PURE__ */ jsx7("div", { className: "p-5 md:p-10 lg:px-20", children: /* @__PURE__ */ jsx7(
    ProductGrid,
    {
      products: mockProducts,
      layout: {
        desktop: { column: 4, row: 1 },
        tablet: { column: 3, row: 1 },
        mobile: { column: 2, row: 1 }
      },
      maxItems: 12,
      videoConfig: {
        autoplay: true,
        mute: true,
        loop: false,
        controls: true,
        modestBranding: false,
        rel: false,
        showInfo: false,
        facebookAllowFullscreen: true,
        show_text: false
      },
      sectionHeader: renderSectionHeader,
      contents: (product) => renderContents(product),
      buttons: (product) => renderButtons(product),
      slide: true,
      slideInterval: 5e3,
      sliderDirection: "backward",
      expandCard: true,
      expandCardSlide: "horizontal"
    }
  ) }) }) });
}
var App_default = App;

// src/reportWebVitals.ts
var reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import("web-vitals").then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};
var reportWebVitals_default = reportWebVitals;

// src/index.tsx
import { jsx as jsx8 } from "react/jsx-runtime";
ReactDOM.render(
  /* @__PURE__ */ jsx8(React4.StrictMode, { children: /* @__PURE__ */ jsx8(App_default, {}) }),
  document.getElementById("root")
);
reportWebVitals_default();
//# sourceMappingURL=index.mjs.map