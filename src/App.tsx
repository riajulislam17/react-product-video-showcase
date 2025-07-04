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
    <div className="flex justify-between items-center gap-4 my-4">
      {isSliding && (
        <div className="flex gap-2">
          <button
            className="p-3 bg-gray-300 text-black cursor-pointer rounded-full"
            onClick={handlePrev}
          >
            <ArrowLeft className="text-black w-6 h-5" />
          </button>
          <button
            className="p-3 bg-gray-300 text-black cursor-pointer rounded-full"
            onClick={handleNext}
          >
            <ArrowRight className="text-black w-6 h-5" />
          </button>
        </div>
      )}

      <h1 className="text-2xl font-bold text-center underline uppercase">
        Video Products <small>(backward - horizontal)</small>
      </h1>
    </div>
  );

  const renderContents = (product: Product) => {
    return (
      <>
        {/* md, lg */}
        <div className="hidden md:block">
          <div className="flex justify-between items-center gap-3 w-full my-1.5">
            <h3 className="text-medium font-semibold text-primary">
              {product.title}
            </h3>
            <div className=" font-semibold text-primary flex items-center gap-1">
              {product.currency}{" "}
              {(product?.discountPrice ?? 0) > 0 &&
              (product?.discountPrice ?? 0) < product.price ? (
                <div>
                  <span className="line-through text-gray-500 text-md">
                    {product.price}
                  </span>
                  <span className="text-gray-700 ml-2 text-xl">
                    {product.discountPrice}
                  </span>
                </div>
              ) : (
                <span className="text-gray-700 ml-2 text-xl">
                  {product.price}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* sm */}
        <div className="block md:hidden">
          <h3 className="text-medium font-semibold text-primary">
            {product.title}
          </h3>
          <div className=" font-semibold text-primary flex items-center gap-1">
            {product.currency}{" "}
            {(product?.discountPrice ?? 0) > 0 &&
            (product?.discountPrice ?? 0) < product.price ? (
              <div>
                <span className="line-through text-gray-500 text-md">
                  {product.price}
                </span>
                <span className="text-gray-700 ml-2 text-xl">
                  {product.discountPrice}
                </span>
              </div>
            ) : (
              <span className="text-gray-700 ml-2 text-xl">
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
        <div className="hidden md:block">
          <div className="flex justify-between items-center gap-3 w-full my-1.5">
            <button
              className="bg-gray-300 text-center py-2 w-[30%] text-md rounded cursor-pointer"
              onClick={() => console.log(`Add to Cart`, product.id)}
            >
              Add to Cart
            </button>

            <button
              className="bg-gray-300 text-center py-2 w-[70%] text-md rounded cursor-pointer"
              onClick={() => console.log(`Buy Now`, product.id)}
            >
              Buy Now
            </button>
          </div>
        </div>

        {/* sm */}
        <div className="block md:hidden">
          <div className="flex flex-col gap-3 w-full my-1.5">
            <button
              className="bg-gray-300 text-center py-2 text-md rounded cursor-pointer"
              onClick={() => console.log(`Add to Cart`, product.id)}
            >
              Add to Cart
            </button>

            <button
              className="bg-gray-300 text-center py-2 text-md rounded cursor-pointer"
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
        <div className="p-5 md:p-10 lg:px-20">
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
            slide={true}
            slideInterval={5000}
            sliderDirection={"backward"}
            expandCard={true}
            expandCardSlide={"horizontal"}
          />
        </div>
      </div>
    </>
  );
}

export default App;
