# react-product-video-showcase

## A responsive, video product grid with smooth sliding, modal preview.

## Built for showcasing video based products with beautiful slide animations. Perfect for e-commerce, SaaS, landing pages, or product video showcase sections.

# Features
- Smart layout based on row × column
- Fully responsive (mobile, tablet, desktop)
- slide on/off with forward / backward direction
- expand selected product as modal with previous and next button to change card vertical or horizontal
- Built-in iframe-based video support
- Written in TypeScript and Tailwind
- supports react >=17

# Installation
### ```npm install react-product-video-slider```
# or
### ```yarn add react-product-video-slider```


# Usage
## ```import { ProductGrid } from "react-video-product-showcase"```

## Props
| Prop              | Type                                        | Description                                              |
| ----------------- | ------------------------------------------- | -------------------------------------------------------- |
| `products`        | `Product[]`                                 | Array of product data (must contain `videoUrl` and `id`) |
| `layout`          | `{ desktop, tablet, mobile }`               | Responsive layout: column & row per device               |
| `maxItems`        | `number`                                    | Max products to show                                     |
| `videoConfig`     | `Partial<VideoConfig>`                      | Video options (autoplay, mute, loop, etc.)               |
| `contents`        | `(product) => ReactNode`                    | Custom content section inside card                       |
| `buttons`         | `(product) => ReactNode`                    | Custom action buttons                                    |
| `slide`           | `boolean`                                   | Enable/disable auto-sliding                              |
| `slideInterval`   | `number`                                    | Time between slides (in ms)                              |
| `sliderDirection` | `"forward"` \| `"backward"`                 | Slide direction                                          |
| `modalCardSlide`  | `"vertical"` \| `"horizontal"`              | Modal animation direction                                |
| `sectionHeader`   | `({ handleNext, handlePrev }) => ReactNode` | Optional header for next/prev buttons                    |



# Product Shape
interface Product {
  id: string;
  slug?: string;
  title: string;
  price: number;
  discountPrice?: number;
  videoUrl: string;
  currency?: string;
}

# VideoConfig Shape
interface VideoConfig {
  autoplay?: boolean;
  mute?: boolean;
  loop?: boolean;
  controls?: boolean;
  modestBranding?: boolean;
  rel?: boolean;
  showInfo?: boolean;
  facebookAllowFullscreen?: boolean;
  show_text?: boolean;
}

# Layout Shape
interface Layout {
  desktop: { column: number; row: number };
  tablet: { column: number; row: number };
  mobile: { column: number; row: number };
}


# Live Demo

# 📄 License
MIT © Riajul Islam