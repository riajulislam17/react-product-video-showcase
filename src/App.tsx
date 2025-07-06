import "./App.css";
import { ProductGrid } from "./components/ProductGrid";
import { mockProducts } from "./data/mockProducts";
import { Product } from "./types";
import { ArrowLeft, ArrowRight } from "./utils/icons";

function App() {
  const renderSectionHeader = ({
    handleNext,
    handlePrev,
    isSliding,
  }: {
    handleNext?: () => void;
    handlePrev?: () => void;
    isSliding?: boolean;
  }) => (
    <div className="rpvs-flex rpvs-justify-between rpvs-items-center rpvs-gap-4 rpvs-my-4 rpvs-p-2">
      {isSliding && (
        <div className="rpvs-flex rpvs-gap-2">
          <button
            className="rpvs-p-3 rpvs-bg-gray-300 rpvs-text-black rpvs-cursor-pointer rpvs-rounded-full"
            onClick={handlePrev}
          >
            <ArrowLeft className="rpvs-text-black rpvs-w-6 rpvs-h-5" />
          </button>
          <button
            className="rpvs-p-3 rpvs-bg-gray-300 rpvs-text-black rpvs-cursor-pointer rpvs-rounded-full"
            onClick={handleNext}
          >
            <ArrowRight className="rpvs-text-black rpvs-w-6 rpvs-h-5" />
          </button>
        </div>
      )}

      <h1 className="rpvs-text-2xl rpvs-font-bold rpvs-text-center rpvs-underline rpvs-uppercase">
        Video Products
      </h1>
    </div>
  );

  const renderContents = (product: Product) => {
    return (
      <>
        {/* md, lg */}
        <div className="rpvs-hidden rpvs-md:block">
          <div className="rpvs-flex rpvs-justify-between rpvs-items-center rpvs-gap-3 rpvs-w-full rpvs-my-1.5">
            <h3 className="rpvs-text-medium rpvs-font-semibold rpvs-text-primary">
              {product.title}
            </h3>
            <div className=" rpvs-font-semibold rpvs-text-primary rpvs-flex rpvs-items-center rpvs-gap-1">
              {product.currency}{" "}
              {(product?.discountPrice ?? 0) > 0 &&
              (product?.discountPrice ?? 0) < product.price ? (
                <div>
                  <span className="rpvs-line-through rpvs-text-gray-500 rpvs-text-md">
                    {product.price}
                  </span>
                  <span className="rpvs-text-gray-700 rpvs-ml-2 rpvs-text-xl">
                    {product.discountPrice}
                  </span>
                </div>
              ) : (
                <span className="rpvs-text-gray-700 rpvs-ml-2 rpvs-text-xl">
                  {product.price}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* sm */}
        <div className="rpvs-block rpvs-md:hidden">
          <h3 className="rpvs-text-medium rpvs-font-semibold rpvs-text-primary">
            {product.title}
          </h3>
          <div className=" rpvs-font-semibold rpvs-text-primary rpvs-flex rpvs-items-center rpvs-gap-1">
            {product.currency}{" "}
            {(product?.discountPrice ?? 0) > 0 &&
            (product?.discountPrice ?? 0) < product.price ? (
              <div>
                <span className="rpvs-line-through rpvs-text-gray-500 rpvs-text-md">
                  {product.price}
                </span>
                <span className="rpvs-text-gray-700 rpvs-ml-2 rpvs-text-xl">
                  {product.discountPrice}
                </span>
              </div>
            ) : (
              <span className="rpvs-text-gray-700 rpvs-ml-2 rpvs-text-xl">
                {product.price}
              </span>
            )}
          </div>
        </div>
      </>
    );
  };

  const renderButtons = (product: Product) => {
    return (
      <>
        {/* md, lg */}
        <div className="rpvs-hidden rpvs-md:block">
          <div className="rpvs-flex rpvs-justify-between rpvs-items-center rpvs-gap-3 rpvs-w-full rpvs-my-1.5">
            <button
              className="rpvs-bg-gray-300 rpvs-text-center rpvs-py-2 rpvs-w-[30%] rpvs-text-md rpvs-rounded rpvs-cursor-pointer"
              onClick={() => console.log(`Add to Cart`, product.id)}
            >
              Add to Cart
            </button>

            <button
              className="rpvs-bg-gray-300 rpvs-text-center rpvs-py-2 w-[70%] rpvs-text-md rpvs-rounded rpvs-cursor-pointer"
              onClick={() => console.log(`Buy Now`, product.id)}
            >
              Buy Now
            </button>
          </div>
        </div>

        {/* sm */}
        <div className="rpvs-block rpvs-md:hidden">
          <div className="rpvs-flex rpvs-flex-col rpvs-gap-3 rpvs-w-full rpvs-my-1.5">
            <button
              className="rpvs-bg-gray-300 rpvs-text-center rpvs-py-2 rpvs-text-md rpvs-rounded rpvs-cursor-pointer"
              onClick={() => console.log(`Add to Cart`, product.id)}
            >
              Add to Cart
            </button>

            <button
              className="rpvs-bg-gray-300 rpvs-text-center rpvs-py-2 rpvs-text-md rpvs-rounded rpvs-cursor-pointer"
              onClick={() => console.log(`Buy Now`, product.id)}
            >
              Buy Now
            </button>
          </div>
        </div>
      </>
    );
  };

  const videoConfig = {
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
    "data-allow-script-access": "never" as "never",
  };

  return (
    <>
      <div className="">
        <div className="rpvs-p-5 rpvs-md:p-10 rpvs-lg:px-20">
          <ProductGrid
            products={mockProducts}
            layout={{
              desktop: { column: 4, row: 1 },
              tablet: { column: 3, row: 1 },
              mobile: { column: 2, row: 1 },
            }}
            maxItems={12}
            videoConfig={videoConfig}
            sectionHeader={renderSectionHeader}
            contents={(product) => renderContents(product)}
            buttons={(product) => renderButtons(product)}
            slide={false}
            slideInterval={5000}
            sliderDirection={"forward"}
            expandCard={false}
            overlayExpandCard={true}
            expandCardSlide={"horizontal"}
          />
        </div>
      </div>
    </>
  );
}

export default App;
