import React from 'react';

interface VideoConfig {
    autoplay?: boolean;
    mute?: boolean;
    controls?: boolean;
    modestbranding?: boolean;
    rel?: boolean;
    loop?: boolean;
    playlist?: boolean;
    cc_load_policy?: boolean;
    disablekb?: boolean;
    "data-autoplay"?: boolean;
    "data-show-text"?: boolean;
    "data-allowfullscreen"?: boolean;
    "data-show-captions"?: boolean;
    "data-allow-script-access"?: "always" | "sameDomain" | "never";
}
interface Product {
    id: string;
    slug?: string;
    title: string;
    price: number;
    discountPrice?: number;
    category?: string;
    videoUrl: string;
    currency?: string;
}
interface Layout {
    desktop: {
        column: number;
        row: number;
    };
    tablet: {
        column: number;
        row: number;
    };
    mobile: {
        column: number;
        row: number;
    };
}

interface Props {
    products: Product[];
    layout: {
        desktop: {
            column: number;
            row: number;
        };
        tablet: {
            column: number;
            row: number;
        };
        mobile: {
            column: number;
            row: number;
        };
    };
    maxItems: number;
    videoConfig?: Partial<VideoConfig>;
    sectionHeader?: (params: {
        handleNext?: () => void;
        handlePrev?: () => void;
        isSliding?: boolean;
    }) => React.ReactNode;
    contents?: (product: Product) => React.ReactNode;
    buttons?: (product: Product) => React.ReactNode;
    slide?: boolean;
    slideInterval?: number;
    sliderDirection: "forward" | "backward";
    expandCard?: boolean;
    overlayExpandCard?: boolean;
    expandCardSlide?: "vertical" | "horizontal";
}
declare const ProductGrid: React.FC<Props>;

export { type Layout, type Product, ProductGrid, type VideoConfig };
