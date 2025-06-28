import React, { useEffect, useRef, useState } from "react";
import { ProductCard } from "./ProductCard";
import { ProductModalY } from "./ProductModalY";
import { ProductModalX } from "./ProductModalX";
import { Product, VideoConfig } from "../types";
import { useDeviceType } from "../hooks/useDeviceType";

interface Props {
  products: Product[];
  layout: {
    desktop: { column: number; row: number };
    tablet: { column: number; row: number };
    mobile: { column: number; row: number };
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

export const ProductGrid: React.FC<Props> = ({
  products,
  layout,
  maxItems,
  videoConfig,
  sectionHeader,
  contents,
  buttons,
  slide = false,
  slideInterval = 3000,
  sliderDirection = "backward",
  expandCard = true,
  expandCardSlide = "vertical",
}) => {
  const device = useDeviceType();
  const { column, row } = layout[device];
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const slicedProducts = products.slice(0, maxItems);
  const itemsPerPage = column * row;
  const totalPages = Math.ceil(slicedProducts.length / itemsPerPage);

  const containerRef = useRef<HTMLDivElement>(null);
  const initialPage = sliderDirection === "backward" ? totalPages - 1 : 0;
  const [currentPage, setCurrentPage] = useState(initialPage);

  const scrollToPage = (page: number) => {
    if (containerRef.current) {
      const width = containerRef.current.clientWidth;
      containerRef.current.scrollTo({
        left: page * width,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
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

  useEffect(() => {
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

  useEffect(() => {
    if (activeIndex !== null && activeIndex >= slicedProducts.length) {
      setActiveIndex(null);
    }
  }, [slicedProducts, activeIndex]);

  return (
    <>
      <div>
        {sectionHeader && (
          <div className="mb-4">
            {sectionHeader({
              handleNext,
              handlePrev,
              isSliding: slide,
            })}
          </div>
        )}

        <div
          ref={containerRef}
          className="w-full overflow-x-auto snap-x scroll-smooth hide-scrollbar"
          style={{ scrollSnapType: "x mandatory" }}
        >
          <div className="flex">
            {[...Array(totalPages)].map((_, pageIndex) => {
              const pageItems = slicedProducts.slice(
                pageIndex * itemsPerPage,
                (pageIndex + 1) * itemsPerPage
              );

              return (
                <div
                  key={pageIndex}
                  className="w-full flex-shrink-0 snap-start px-2"
                  style={{ width: "100%" }}
                >
                  <div
                    className={`grid gap-5 `}
                    style={{
                      gridTemplateColumns: `repeat(${column}, minmax(0, 1fr))`,
                      gridTemplateRows: `repeat(${row}, minmax(0, 1fr))`,
                    }}
                  >
                    {pageItems.map((product, index) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        videoConfig={videoConfig}
                        contents={contents ? contents(product) : undefined}
                        buttons={buttons ? buttons(product) : undefined}
                        expandCard={expandCard}
                        onExpand={() =>
                          setActiveIndex(pageIndex * itemsPerPage + index)
                        }
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {expandCard &&
        activeIndex !== null &&
        (expandCardSlide === "vertical" ? (
          <ProductModalY
            products={slicedProducts}
            activeIndex={activeIndex}
            onClose={() => setActiveIndex(null)}
            contents={contents}
            buttons={buttons}
          />
        ) : (
          <ProductModalX
            products={slicedProducts}
            activeIndex={activeIndex}
            onClose={() => setActiveIndex(null)}
            contents={contents}
            buttons={buttons}
          />
        ))}
    </>
  );
};
