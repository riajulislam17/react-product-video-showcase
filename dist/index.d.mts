import React from 'react';

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
interface Product {
    id: string;
    slug?: string;
    title: string;
    price: number;
    discountPrice?: number;
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
    expandCardSlide?: "vertical" | "horizontal";
}
declare const ProductGrid: React.FC<Props>;

export { type Layout, type Product, ProductGrid, type VideoConfig };
