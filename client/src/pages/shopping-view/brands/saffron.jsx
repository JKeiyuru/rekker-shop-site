/* eslint-disable react/prop-types */
/* eslint-disable react/no-unescaped-entities */
// client/src/pages/shopping-view/brands/saffron.jsx - Updated Saffron Brand Page
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaLeaf, 
  FaShieldAlt, 
  FaAward, 
  FaRecycle,
  FaFlask,
  FaMedal,
  FaHeart,
  FaArrowRight,
  FaCheckCircle,
  FaStar,
  FaHandsWash,
  FaUtensils,
  FaShower,
  FaSpa,
  FaSprayCan
} from "react-icons/fa";

// Interactive 3D Product Carousel Component
const ProductCarousel3D = ({ products, activeProduct, setActiveProduct }) => {
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startX;
    setRotation(prev => prev + deltaX * 0.5);
    setStartX(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleProductClick = (index) => {
    setActiveProduct(index);
    const angle = (360 / products.length) * index;
    setRotation(-angle);
  };

  return (
    <div className="relative w-full h-[500px] perspective-1000">
      <div
        className="relative w-full h-full"
        style={{
          transform: `rotateY(${rotation}deg)`,
          transformStyle: 'preserve-3d',
          transition: isDragging ? 'none' : 'transform 0.5s ease-out',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {products.map((product, index) => {
          const angle = (360 / products.length) * index;
          const isActive = index === activeProduct;
          const ProductIcon = product.icon;
          
          return (
            <div
              key={product.id}
              className={`absolute top-1/2 left-1/2 cursor-pointer transition-all duration-300 ${
                isActive ? 'z-20' : 'z-10'
              }`}
              style={{
                transform: `
                  translate(-50%, -50%)
                  rotateY(${angle}deg)
                  translateZ(${isActive ? '350px' : '300px'})
                  scale(${isActive ? '1.2' : '0.9'})
                `,
                transformStyle: 'preserve-3d',
              }}
              onClick={() => handleProductClick(index)}
            >
              <div className={`bg-white rounded-2xl p-6 shadow-2xl border-4 transition-all duration-300 ${
                isActive ? 'border-orange-500' : 'border-gray-200'
              }`} style={{ width: '250px', backfaceVisibility: 'hidden' }}>
                <div className={`w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-4 ${
                  isActive ? 'scale-110' : ''
                } transition-transform duration-300`}>
                  <ProductIcon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 text-center mb-2">{product.name}</h3>
                <p className="text-sm text-gray-600 text-center">{product.category}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {products.map((_, index) => (
          <button
            key={index}
            onClick={() => handleProductClick(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === activeProduct 
                ? 'bg-orange-600 w-8' 
                : 'bg-gray-300 hover:bg-orange-400'
            }`}
          />
        ))}
      </div>

      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
};

const SaffronBrand = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeProduct, setActiveProduct] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const products = [
    {
      id: 1,
      name: "Premium Handwash",
      category: "Personal Care",
      icon: FaHandsWash,
      description: "Antibacterial handwash with natural moisturizing agents and fresh fragrance. Gentle on hands while providing superior cleaning.",
      keyFeatures: [
        "99.9% Germ Protection",
        "Natural Moisturizers",
        "Pleasant Fragrance",
        "pH Balanced Formula"
      ],
      sizes: ["250ml", "500ml", "1L", "5L"],
      wholesalePrice: "From KSh 85/unit",
      moq: "50 units"
    },
    {
      id: 2,
      name: "Dishwashing Liquid",
      category: "Kitchen Care",
      icon: FaUtensils,
      description: "Concentrated dishwashing liquid that cuts through grease effectively while being gentle on hands. Long-lasting formula for excellent value.",
      keyFeatures: [
        "Superior Grease Cutting",
        "Gentle on Hands",
        "Concentrated Formula",
        "Fresh Lemon Scent"
      ],
      sizes: ["500ml", "1L", "2L", "5L"],
      wholesalePrice: "From KSh 120/unit",
      moq: "40 units"
    },
    {
      id: 3,
      name: "Liquid Detergent",
      category: "Laundry Care",
      icon: FaSprayCan,
      description: "High-performance liquid detergent suitable for all fabric types. Removes tough stains while protecting fabric colors and texture.",
      keyFeatures: [
        "Deep Stain Removal",
        "Color Protection",
        "Fabric Softening",
        "All Fabric Types"
      ],
      sizes: ["1L", "2L", "5L", "20L"],
      wholesalePrice: "From KSh 180/unit",
      moq: "30 units"
    },
    {
      id: 4,
      name: "Shower Gel",
      category: "Personal Care",
      icon: FaShower,
      description: "Luxurious shower gel with moisturizing properties and invigorating fragrance. Leaves skin feeling soft, smooth, and refreshed.",
      keyFeatures: [
        "Deep Moisturizing",
        "Rich Lather",
        "Invigorating Scent",
        "Dermatologist Tested"
      ],
      sizes: ["250ml", "500ml", "1L"],
      wholesalePrice: "From KSh 150/unit",
      moq: "36 units"
    },
    {
      id: 5,
      name: "Anti-Bump After-Shave",
      category: "Men's Care",
      icon: FaSpa,
      description: "Specially formulated after-shave lotion for men that prevents razor bumps and soothes skin. Provides long-lasting freshness.",
      keyFeatures: [
        "Prevents Razor Bumps",
        "Soothes Irritation",
        "Long-lasting Freshness",
        "Quick Absorption"
      ],
      sizes: ["100ml", "200ml", "500ml"],
      wholesalePrice: "From KSh 200/unit",
      moq: "24 units"
    }
  ];

  const brandValues = [
    {
      icon: <FaLeaf className="w-8 h-8" />,
      title: "Natural Ingredients",
      description: "We use carefully selected natural ingredients that are gentle on skin and environmentally friendly."
    },
    {
      icon: <FaShieldAlt className="w-8 h-8" />,
      title: "Quality Assurance",
      description: "Every product undergoes rigorous testing to ensure consistent quality and effectiveness."
    },
    {
      icon: <FaRecycle className="w-8 h-8" />,
      title: "Eco-Conscious",
      description: "Committed to sustainable manufacturing practices and environmentally responsible packaging."
    },
    {
      icon: <FaHeart className="w-8 h-8" />,
      title: "Family Safe",
      description: "All our products are formulated to be safe for the entire family with gentle, non-toxic formulations."
    }
  ];

  const certifications = [
    {
      icon: <FaAward className="w-6 h-6" />,
      title: "ISO 9001:2015",
      description: "Quality Management System"
    },
    {
      icon: <FaFlask className="w-6 h-6" />,
      title: "KEBS Certified",
      description: "Kenya Bureau of Standards"
    },
    {
      icon: <FaMedal className="w-6 h-6" />,
      title: "Halal Certified",
      description: "Islamic Certification"
    },
    {
      icon: <FaShieldAlt className="w-6 h-6" />,
      title: "Dermatologically Tested",
      description: "Skin Safety Approved"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Kimani",
      business: "Kimani Supermarket, Nakuru",
      rating: 5,
      comment: "Saffron products have been bestsellers in our store. Customers love the quality and keep coming back for more."
    },
    {
      name: "John Mwangi",
      business: "Mwangi Distributors, Eldoret",
      rating: 5,
      comment: "As a distributor, I appreciate Saffron's consistent quality and competitive pricing. Great profit margins too!"
    },
    {
      name: "Grace Wanjiku",
      business: "Grace Mini Market, Thika",
      rating: 5,
      comment: "The anti-bump after-shave is particularly popular with our male customers. Quality product at affordable prices."
    }
  ];

  const handleExploreSaffron = () => {
    sessionStorage.setItem("filters", JSON.stringify({ brand: ["saffron"] }));
    navigate("/products?brand=saffron");
  };

  const handleContactClick = () => {
    navigate("/contact");
  };

  const handleGetQuote = () => {
    navigate("/contact?inquiry=quote&product=saffron");
  };

  // Get the active product icon component
  const ActiveProductIcon = products[activeProduct]?.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50/30 to-orange-100/20">
      {/* Hero Section */}
      <div className={`relative py-20 bg-gradient-to-r from-red-900 via-orange-900 to-red-800 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-orange-600/10 to-red-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-red-700/10 to-orange-700/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start space-x-3 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-2xl">
                  <FaLeaf className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2 drop-shadow-2xl">Saffron</h1>
                  <p className="text-orange-200 text-sm sm:text-base">Manufactured by Rekker</p>
                </div>
              </div>
              <div className="w-24 h-1 bg-gradient-to-r from-orange-400 to-red-500 mb-8 mx-auto lg:mx-0 shadow-lg"></div>
              <p className="text-lg sm:text-xl text-orange-100 leading-relaxed mb-8 drop-shadow-lg max-w-2xl">
                Premium household and personal care products crafted with natural ingredients 
                and advanced formulations for the modern Kenyan family.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={handleExploreSaffron}
                  className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-bold shadow-2xl hover:from-orange-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
                >
                  <span>Shop Saffron</span>
                  <FaArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={handleContactClick}
                  className="inline-flex items-center justify-center space-x-2 border-2 border-orange-300 text-orange-100 px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-bold hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all duration-300 text-sm sm:text-base"
                >
                  <span>Contact Us</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-gradient-to-br from-orange-600/20 to-red-700/20 backdrop-blur-sm rounded-xl p-4 sm:p-6 text-center border border-orange-400/30 shadow-xl">
                  <div className="text-2xl sm:text-3xl font-bold text-white mb-2">15+</div>
                  <div className="text-orange-200 text-xs sm:text-sm">Years Manufacturing</div>
                </div>
                <div className="bg-gradient-to-br from-red-600/20 to-orange-700/20 backdrop-blur-sm rounded-xl p-4 sm:p-6 text-center border border-red-400/30 shadow-xl">
                  <div className="text-2xl sm:text-3xl font-bold text-white mb-2">5</div>
                  <div className="text-orange-200 text-xs sm:text-sm">Product Categories</div>
                </div>
              </div>
              <div className="space-y-4 sm:space-y-6 pt-8 sm:pt-12">
                <div className="bg-gradient-to-br from-orange-700/20 to-red-600/20 backdrop-blur-sm rounded-xl p-4 sm:p-6 text-center border border-orange-500/30 shadow-xl">
                  <div className="text-2xl sm:text-3xl font-bold text-white mb-2">500+</div>
                  <div className="text-orange-200 text-xs sm:text-sm">Retail Partners</div>
                </div>
                <div className="bg-gradient-to-br from-red-700/20 to-orange-600/20 backdrop-blur-sm rounded-xl p-4 sm:p-6 text-center border border-red-500/30 shadow-xl">
                  <div className="text-2xl sm:text-3xl font-bold text-white mb-2">47</div>
                  <div className="text-orange-200 text-xs sm:text-sm">Counties Served</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Values */}
      <div className={`container mx-auto px-4 sm:px-6 py-16 sm:py-20 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">Why Choose Saffron?</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-orange-600 to-red-700 mx-auto mb-6 sm:mb-8 shadow-lg"></div>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Built on a foundation of quality, sustainability, and care for every family
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {brandValues.map((value, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 sm:p-8 text-center shadow-2xl hover:shadow-orange-200/50 transition-all duration-300 group transform hover:-translate-y-2 border border-orange-100/50">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 text-white group-hover:scale-110 transition-transform duration-300 shadow-xl">
                  {value.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive 3D Product Showcase */}
      <div className="bg-gradient-to-br from-white via-orange-50/30 to-red-50/30 py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">Interactive Product Showcase</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-orange-600 to-red-700 mx-auto mb-6 sm:mb-8 shadow-lg"></div>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
                Drag to rotate and explore our complete product range in 3D
              </p>
            </div>

            {/* 3D Carousel */}
            <div className="hidden lg:block">
              <ProductCarousel3D 
                products={products} 
                activeProduct={activeProduct} 
                setActiveProduct={setActiveProduct} 
              />
            </div>

            {/* Mobile Product Selector */}
            <div className="lg:hidden grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
              {products.map((product, index) => {
                const ProductIcon = product.icon;
                return (
                  <button
                    key={product.id}
                    onClick={() => setActiveProduct(index)}
                    className={`bg-white rounded-xl p-4 text-center shadow-lg border-2 transition-all duration-300 ${
                      index === activeProduct ? 'border-orange-500 scale-105' : 'border-gray-200'
                    }`}
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center mx-auto mb-2 ${
                      index === activeProduct ? 'scale-110' : ''
                    } transition-transform duration-300`}>
                      <ProductIcon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1">{product.name}</h3>
                    <p className="text-xs text-gray-600">{product.category}</p>
                  </button>
                );
              })}
            </div>

            {/* Active Product Details */}
            <div className="mt-8 lg:mt-16 grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
              <div className="space-y-6 lg:space-y-8">
                <div>
                  <div className="inline-block px-3 py-1 sm:px-4 sm:py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full text-xs sm:text-sm font-bold mb-4 sm:mb-6 shadow-xl">
                    {products[activeProduct].category}
                  </div>
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                    Saffron {products[activeProduct].name}
                  </h3>
                  <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                    {products[activeProduct].description}
                  </p>
                </div>

                <div>
                  <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Key Features</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    {products[activeProduct].keyFeatures.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2 sm:space-x-3">
                        <FaCheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700 text-sm sm:text-base">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 sm:p-8 shadow-xl border border-orange-200/50">
                  <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Wholesale Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <div className="text-xs sm:text-sm text-gray-600 mb-2">Wholesale Price</div>
                      <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-700 bg-clip-text text-transparent">
                        {products[activeProduct].wholesalePrice}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm text-gray-600 mb-2">Minimum Order</div>
                      <div className="text-xl sm:text-2xl font-bold text-gray-900">
                        {products[activeProduct].moq}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-6">
                    <div className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">Available Sizes</div>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {products[activeProduct].sizes.map((size, index) => (
                        <span key={index} className="px-3 py-1 sm:px-4 sm:py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full text-xs sm:text-sm font-bold shadow-lg">
                          {size}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <button
                    onClick={handleExploreSaffron}
                    className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-600 to-red-700 text-white px-6 sm:px-10 py-3 sm:py-5 rounded-2xl font-bold text-base sm:text-lg hover:from-orange-700 hover:to-red-800 shadow-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    <span>Shop Now</span>
                    <FaArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button
                    onClick={handleGetQuote}
                    className="inline-flex items-center justify-center space-x-2 border-2 border-orange-300 text-orange-700 px-6 sm:px-10 py-3 sm:py-5 rounded-2xl font-bold text-base sm:text-lg hover:border-orange-500 hover:text-orange-800 hover:shadow-lg transition-all duration-300"
                  >
                    <span>Get Quote</span>
                  </button>
                </div>
              </div>

              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-orange-100 via-red-100 to-orange-200 rounded-3xl overflow-hidden shadow-2xl border-4 border-orange-300">
                  <div className="w-full h-full bg-gradient-to-br from-orange-200/50 to-red-200/50 flex items-center justify-center backdrop-blur-sm">
                    <div className="text-center text-gray-600">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-2xl">
                        {ActiveProductIcon && <ActiveProductIcon className="w-12 h-12 sm:w-16 sm:h-16 text-white" />}
                      </div>
                      <p className="text-lg sm:text-xl font-bold text-gray-800">Saffron {products[activeProduct].name}</p>
                      <p className="text-sm text-gray-600 mt-2">{products[activeProduct].category}</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 sm:-bottom-8 sm:-right-8 bg-gradient-to-r from-orange-600 to-red-700 rounded-2xl shadow-2xl p-4 sm:p-6 border-4 border-white">
                  <div className="text-center">
                    <div className="text-xs sm:text-sm text-orange-100 mb-1">Manufactured by</div>
                    <div className="text-lg sm:text-2xl font-bold text-white">REKKER</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Certifications */}
      <div className="bg-gradient-to-br from-gray-50 to-orange-50/50 py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">Quality Certifications</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-orange-600 to-red-700 mx-auto mb-6 sm:mb-8 shadow-lg"></div>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
                Our commitment to quality is backed by international certifications and standards
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {certifications.map((cert, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 sm:p-8 text-center shadow-2xl hover:shadow-orange-200/50 transition-all duration-300 transform hover:-translate-y-2 border border-orange-100/50">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-white shadow-xl">
                    {cert.icon}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">{cert.title}</h3>
                  <p className="text-gray-600 text-xs sm:text-sm">{cert.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Testimonials */}
      <div className="bg-gradient-to-br from-white via-orange-50/30 to-red-50/30 py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">What Our Partners Say</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-orange-600 to-red-700 mx-auto mb-6 sm:mb-8 shadow-lg"></div>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
                Hear from our retail and distribution partners across Kenya
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 sm:p-8 hover:shadow-2xl hover:shadow-orange-200/30 transition-all duration-300 transform hover:-translate-y-2 border border-orange-100/50">
                  <div className="flex items-center space-x-1 mb-4 sm:mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <FaStar key={i} className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 sm:mb-6 italic leading-relaxed text-base sm:text-lg">
                    "{testimonial.comment}"
                  </p>
                  <div className="border-t border-orange-100 pt-4 sm:pt-6">
                    <div className="font-bold text-gray-900 text-base sm:text-lg">{testimonial.name}</div>
                    <div className="text-xs sm:text-sm bg-gradient-to-r from-orange-600 to-red-700 bg-clip-text text-transparent font-semibold">{testimonial.business}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-red-900 via-orange-900 to-red-800 py-16 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-600/20 to-red-700/20"></div>
          <div className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-orange-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-red-700/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 sm:mb-8 drop-shadow-2xl">
              Partner with Saffron Today
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-orange-100 mb-8 sm:mb-12 drop-shadow-lg px-4">
              Join hundreds of successful retailers and distributors who trust Saffron for quality products and profitable partnerships
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
              <button
                onClick={handleExploreSaffron}
                className="inline-flex items-center justify-center space-x-2 sm:space-x-3 bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 sm:px-12 py-4 sm:py-6 rounded-2xl font-bold text-lg sm:text-xl hover:from-orange-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-2xl"
              >
                <span>Shop Saffron Products</span>
                <FaArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <button
                onClick={handleContactClick}
                className="inline-flex items-center justify-center space-x-2 sm:space-x-3 border-2 sm:border-3 border-orange-300 text-orange-100 px-8 sm:px-12 py-4 sm:py-6 rounded-2xl font-bold text-lg sm:text-xl hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all duration-300"
              >
                <span>Contact Sales Team</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaffronBrand;