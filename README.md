# react-product-video-showcase

## A responsive, video product grid with smooth sliding, modal preview for Youtube and Facebook videos. Built for showcasing video based products with beautiful slide animations. Perfect for e-commerce, SaaS, landing pages, or product video showcase sections.

# Features

- For Youtube and Facebook videos
- Smart layout based on row × column
- Fully responsive (mobile, tablet, desktop)
- Slide on/off with forward / backward direction
- Expand selected product as modal with previous and next button to change card vertical or horizontal
- Built-in iframe-based video support
- Written in TypeScript and Tailwind
- Supports react >=17

# Installation

### `npm i react-product-video-showcase`

# or

### `yarn add react-product-video-slider`

# Usage

## `import { ProductGrid } from "react-product-video-showcase";"`

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
| `sectionHeader`   | `({ handleNext, handlePrev }) => ReactNode` | Optional header for title or next/prev buttons for slide |

# Layout Shape

| Property  | Type                              |
| --------- | --------------------------------- |
| `desktop` | `{ column: number; row: number }` |
| `tablet`  | `{ column: number; row: number }` |
| `mobile`  | `{ column: number; row: number }` |

# VideoConfig Shape

| Property                   | Type                                      | Description                                             |
| -------------------------- | ----------------------------------------- | ------------------------------------------------------- |
| `autoplay`                 | `boolean`                                 | Autoplay the video when loaded _(YouTube)_              |
| `mute`                     | `boolean`                                 | Mute the video _(YouTube)_                              |
| `controls`                 | `boolean`                                 | Show or hide player controls _(YouTube)_                |
| `modestbranding`           | `boolean`                                 | Minimizes YouTube logo in control bar _(YouTube)_       |
| `rel`                      | `boolean`                                 | Disable related videos at the end _(YouTube)_           |
| `loop`                     | `boolean`                                 | Loop the video _(YouTube; requires `playlist` to work)_ |
| `playlist`                 | `boolean`                                 | Indicates use of playlist for looping _(YouTube)_       |
| `cc_load_policy`           | `boolean`                                 | Show closed captions by default _(YouTube)_             |
| `disablekb`                | `boolean`                                 | Disable keyboard controls _(YouTube)_                   |
| `data-autoplay`            | `boolean`                                 | Autoplay the video _(Facebook)_                         |
| `data-show-text`           | `boolean`                                 | Show or hide post text/title _(Facebook)_               |
| `data-allowfullscreen`     | `boolean`                                 | Allow fullscreen mode _(Facebook)_                      |
| `data-show-captions`       | `boolean`                                 | Show captions if available _(Facebook)_                 |
| `data-allow-script-access` | `"always"` \| `"sameDomain"` \| `"never"` | Control script access in iframe _(Advanced; Facebook)_  |

# Product Shape

| Property         | Type     |
| ---------------- | -------- |
| `id`             | `string` |
| `slug?`          | `string` |
| `title`          | `string` |
| `price`          | `number` |
| `discountPrice?` | `number` |
| `category?`      | `string` |
| `videoUrl`       | `string` |
| `currency?`      | `string` |

## Live Demo

[View Demo](https://react-product-video-showcase.vercel.app/)

## NPM Package

[react-product-video-showcase](https://www.npmjs.com/package/react-product-video-showcase)

## Author

**Riajul Islam**  
[GitHub](https://github.com/riajulislam17/)  
[LinkedIn](https://www.linkedin.com/in/riajulislam17/)

# License

MIT © Riajul Islam
