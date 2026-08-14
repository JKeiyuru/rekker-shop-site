/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
// pages/brands/CornellsBrand.jsx - Updated with deep burgundy theme (#7c2724) and background images
import { useState, useEffect, useRef } from "react";
import { 
  FaLeaf, 
  FaHeart, 
  FaGlobe, 
  FaUserFriends,
  FaFlask,
  FaMedal,
  FaStar,
  FaArrowRight,
  FaCheckCircle,
  FaShoppingCart,
  FaEye,
  FaSun,
  FaHandHoldingHeart ,
  FaSeedling,
  FaGem,
  FaBook,
  FaChevronLeft,
  FaChevronRight,
  FaExpand, 
  FaCompress
} from "react-icons/fa";


// Brochure Flipbook Component
const BrochureFlipbook = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [nextPage, setNextPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);
  const imageRef = useRef(null);

  const brochurePages = [
    {
      id: 0,
      title: "Bold & Beautiful Collection",
      image: "https://res.cloudinary.com/du9fhp5iq/image/upload/v1760262841/BOLD_AND_BEAUTIFUL_BLOG_km6ulb.png",
      description: "Body Lotions & Care",
      products: [
        "Bold & Beautiful Vanilla Lotion 400ml",
        "Bold & Beautiful Cocoa Butter Lotion 400ml",
        "Bold & Beautiful Shea Butter Lotion 400ml"
      ]
    },
    {
      id: 1,
      title: "Cute & Pretty Collection",
      image: "https://res.cloudinary.com/du9fhp5iq/image/upload/v1760262842/CUTE_AND_PRETTY_s_jfstan.png",
      description: "Kids & Family Care",
      products: [
        "Cute & Pretty Baby Lotion 200ml",
        "Cute & Pretty Kids Sunscreen SPF 50+ 100ml",
        "Cute & Pretty Baby Wash 250ml"
      ]
    },
    {
      id: 2,
      title: "Dark & Beautiful Collection",
      image: "https://res.cloudinary.com/du9fhp5iq/image/upload/v1760262843/DARK_AND_BEAUTIFUL_m0jazr.png",
      description: "Hair Care Excellence",
      products: [
        "Dark & Beautiful Hair Oil 250ml",
        "Dark & Beautiful Shampoo 400ml",
        "Dark & Beautiful Conditioner 400ml"
      ]
    },
    {
      id: 3,
      title: "Super Food Collection",
      image: "https://res.cloudinary.com/du9fhp5iq/image/upload/v1760262849/SUPER_FOOD_nfpfr7.png",
      description: "Nutritive Wellness",
      products: [
        "Super Food Vitamin C Serum 30ml",
        "Super Food Body Scrub 200ml",
        "Super Food Face Mask 150ml"
      ]
    }
  ];

  useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      handleNextPage();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentPage, autoPlay]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleMouseMove = (e) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleNextPage = () => {
    if (isFlipping) return;
    const next = (currentPage + 1) % brochurePages.length;
    setNextPage(next);
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentPage(next);
      setIsFlipping(false);
    }, 800);
  };

  const handlePrevPage = () => {
    if (isFlipping) return;
    const prev = (currentPage - 1 + brochurePages.length) % brochurePages.length;
    setNextPage(prev);
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentPage(prev);
      setIsFlipping(false);
    }, 800);
  };

  const goToPage = (pageIndex) => {
    if (isFlipping || pageIndex === currentPage) return;
    setNextPage(pageIndex);
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentPage(pageIndex);
      setIsFlipping(false);
    }, 800);
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  const PageContent = ({ page }) => (
    <div 
      ref={imageRef}
      className="aspect-[4/3] sm:aspect-[16/10] bg-cover bg-center relative cursor-pointer"
      style={{
        backgroundImage: `url(${page.image})`,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Interactive Ripple Effect */}
      {isHovering && (
        <>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute pointer-events-none"
              style={{
                left: mousePos.x,
                top: mousePos.y,
                width: '40px',
                height: '40px',
                border: `2px solid rgba(255, 255, 255, ${0.6 - i * 0.2})`,
                borderRadius: '50%',
                transform: `translate(-50%, -50%) scale(${1 + i * 0.5})`,
                transition: 'all 0.1s ease-out',
                animation: `ripple ${1 + i * 0.3}s infinite`
              }}
            />
          ))}
        </>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
      
      {/* Page Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 text-white">
        <h3 className="text-2xl sm:text-4xl font-bold mb-2 drop-shadow-lg">
          {page.title}
        </h3>
        <p className="text-base sm:text-xl text-red-200 mb-4 drop-shadow-md">
          {page.description}
        </p>
        
        <div className="grid sm:grid-cols-2 gap-2 sm:gap-3">
          {page.products.map((product, idx) => (
            <div key={idx} className="flex items-center space-x-2 text-xs sm:text-sm bg-black/30 backdrop-blur-sm rounded-lg p-2">
              <FaCheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-300 flex-shrink-0" />
              <span className="drop-shadow-sm">{product}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Page number */}
      <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-white font-bold text-sm">
        {page.id + 1}
      </div>
    </div>
  );

  return (
    <div 
      ref={containerRef}
      className={`relative mx-auto ${isFullscreen ? 'w-screen h-screen flex items-center justify-center bg-black p-8' : 'max-w-6xl'}`}
    >
      <style>{`
        @keyframes flipForward {
          0% {
            transform: perspective(2000px) rotateY(0deg);
          }
          100% {
            transform: perspective(2000px) rotateY(-180deg);
          }
        }
        
        @keyframes flipBackward {
          0% {
            transform: perspective(2000px) rotateY(180deg);
          }
          100% {
            transform: perspective(2000px) rotateY(0deg);
          }
        }
        
        .flip-forward {
          animation: flipForward 0.8s cubic-bezier(0.645, 0.045, 0.355, 1);
          transform-origin: left center;
        }
        
        .flip-backward {
          animation: flipBackward 0.8s cubic-bezier(0.645, 0.045, 0.355, 1);
          transform-origin: right center;
        }
        
        .page-shadow {
          box-shadow: 
            -10px 0 20px rgba(0, 0, 0, 0.2),
            10px 0 20px rgba(0, 0, 0, 0.2);
        }

        @keyframes ripple {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0.8;
          }
          100% {
            transform: translate(-50%, -50%) scale(4);
            opacity: 0;
          }
        }

        .ripple {
          animation: ripple 0.8s ease-out;
        }

        .page-back {
          transform: rotateY(180deg);
          backface-visibility: hidden;
        }

        .page-front {
          backface-visibility: hidden;
        }
      `}</style>

      <div className={`relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-2xl overflow-hidden ${isFullscreen ? 'w-full max-w-7xl h-full flex flex-col p-8' : 'p-4 sm:p-8'}`}>
        
        {/* Control Bar */}
        <div className="flex justify-between items-center mb-6 px-4 sm:px-0 flex-shrink-0">
          <button
            onClick={() => setAutoPlay(!autoPlay)}
            className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-semibold hover:bg-white transition-all duration-300 flex items-center space-x-2 z-10"
            style={{color: '#7c2724'}}
          >
            <span>{autoPlay ? '⏸️' : '▶️'}</span>
            <span className="hidden sm:inline">{autoPlay ? 'Pause' : 'Play'}</span>
          </button>

          <div className="flex items-center space-x-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-semibold text-gray-700">
              <FaBook className="inline mr-2" />
              Page {currentPage + 1} / {brochurePages.length}
            </div>
            
            <button
              onClick={toggleFullscreen}
              className="bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-all duration-300 z-10"
              style={{color: '#7c2724'}}
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <FaCompress className="w-4 h-4" /> : <FaExpand className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Book Container */}
        <div className={`relative ${isFullscreen ? 'flex-1 flex items-center justify-center min-h-0' : ''}`}>
          <div className="relative" style={{ perspective: '2000px' }}>
            {/* Base Page (visible when not flipping or after flip) */}
            <div className={`relative bg-white rounded-2xl page-shadow overflow-hidden ${isFlipping ? 'invisible' : 'visible'}`}>
              <PageContent page={brochurePages[currentPage]} />
            </div>

            {/* Flipping Page (visible during flip animation) */}
            {isFlipping && (
              <div 
                className="absolute inset-0 bg-white rounded-2xl page-shadow overflow-hidden flip-forward"
                style={{
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Front of flipping page (current page) */}
                <div className="absolute inset-0 page-front">
                  <PageContent page={brochurePages[currentPage]} />
                </div>
                
                {/* Back of flipping page (next page, mirrored) */}
                <div className="absolute inset-0 page-back">
                  <PageContent page={brochurePages[nextPage]} />
                </div>
              </div>
            )}

            {/* Book Spine Effect */}
            <div className="absolute left-0 top-0 bottom-0 w-4 sm:w-8 bg-gradient-to-r from-gray-900/80 via-gray-700/50 to-transparent pointer-events-none rounded-l-2xl z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-4 sm:w-8 bg-gradient-to-l from-gray-900/30 to-transparent pointer-events-none rounded-r-2xl z-10"></div>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between mt-6 gap-4 px-4 sm:px-0 flex-shrink-0">
          <button
            onClick={handlePrevPage}
            disabled={isFlipping}
            className="flex items-center space-x-2 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed px-4 sm:px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg z-10"
            style={{color: '#7c2724'}}
          >
            <FaChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <div className="flex space-x-2">
            {brochurePages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToPage(index)}
                className={`h-2 sm:h-3 rounded-full transition-all duration-300 ${
                  currentPage === index 
                    ? 'w-6 sm:w-8' 
                    : 'w-2 sm:w-3 hover:bg-white/70'
                }`}
                style={{
                  backgroundColor: currentPage === index ? '#7c2724' : 'rgba(255,255,255,0.5)'
                }}
                aria-label={`Go to page ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNextPage}
            disabled={isFlipping}
            className="flex items-center space-x-2 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed px-4 sm:px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg z-10"
            style={{color: '#7c2724'}}
          >
            <span className="hidden sm:inline">Next</span>
            <FaChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Collection Quick Links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mt-6 px-4 sm:px-0 flex-shrink-0">
          {brochurePages.map((page, index) => (
            <button
              key={page.id}
              onClick={() => goToPage(index)}
              className={`p-3 sm:p-4 rounded-xl text-left transition-all duration-300 ${
                currentPage === index
                  ? 'bg-white text-gray-900 shadow-lg transform scale-105'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <div className="text-xs sm:text-sm font-semibold mb-1 truncate">{page.title}</div>
              <div className="text-xs opacity-70 truncate">{page.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Brochure Download/Contact */}
      {!isFullscreen && (
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm mb-4">
            Want a full PDF brochure or need more information about specific products?
          </p>
          <a
            href="/contact"
            className="inline-flex items-center space-x-2 text-sm font-semibold hover:underline"
            style={{color: '#7c2724'}}
          >
            <span>Contact our sales team</span>
            <FaArrowRight className="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  );
};

const CornellsBrand = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeCollection, setActiveCollection] = useState(0);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Product Collections with background images and gradient fallbacks
  const productCollections = [
    {
      id: "bold-beautiful",
      name: "Bold & Beautiful",
      tagline: "Body Lotions & Care",
      description: "Deeply nourishing body lotions with Shea Butter and natural ingredients for ultra-rich, lightweight hydration.",
      color: "from-red-800 to-red-900",
      bgColor: "bg-red-50",
      backgroundImage: "/images/cornellscategoryimages/BOLD_AND_BEAUTIFUL_BLOG.jpg",
      overlay: "bg-black/40",
      products: [
        {
          name: "Bold & Beautiful Vanilla Lotion",
          size: "400ml",
          description: "Ultra-rich vanilla scented body lotion with Shea Butter",
          wholesalePrice: "KSh 280",
          moq: "24 units",
          keyBenefits: ["Shea Butter Enriched", "24hr Hydration", "Non-Greasy Formula", "Vanilla Fragrance"]
        },
        {
          name: "Bold & Beautiful Cocoa Butter Lotion", 
          size: "400ml",
          description: "Intensive moisture with natural cocoa butter for silky skin",
          wholesalePrice: "KSh 285",
          moq: "24 units", 
          keyBenefits: ["Cocoa Butter", "Deep Moisturizing", "Skin Repair", "Natural Fragrance"]
        }
      ]
    },
    {
      id: "cute-pretty",
      name: "Cute & Pretty",
      tagline: "Kids & Family Care",
      description: "Gentle, safe formulations designed specifically for children's delicate skin and family wellness.",
      color: "from-red-700 to-red-800",
      bgColor: "bg-red-50",
      backgroundImage: "/images/cornellscategoryimages/CUTE_AND_PRETTY_s.jpg",
      overlay: "bg-black/50",
      products: [
        {
          name: "Cute & Pretty Baby Lotion",
          size: "200ml",
          description: "Gentle moisturizing lotion for baby's sensitive skin",
          wholesalePrice: "KSh 180",
          moq: "36 units",
          keyBenefits: ["Pediatrician Tested", "Tear-Free Formula", "Hypoallergenic", "24hr Protection"]
        },
        {
          name: "Cute & Pretty Kids Sunscreen",
          size: "100ml", 
          description: "SPF 50+ protection specifically formulated for children",
          wholesalePrice: "KSh 320",
          moq: "24 units",
          keyBenefits: ["SPF 50+", "Water Resistant", "Kid-Safe Formula", "No White Residue"]
        }
      ]
    },
    {
      id: "dark-beautiful",
      name: "Dark & Beautiful",
      tagline: "Hair Care Excellence",
      description: "Professional hair care solutions celebrating natural beauty with nourishing ingredients for all hair types.",
      color: "from-red-800 to-red-900",
      bgColor: "bg-red-50",
      backgroundImage: "/images/cornellscategoryimages/DARK_AND_BEAUTIFUL.jpg",
      overlay: "bg-black/30",
      products: [
        {
          name: "Dark & Beautiful Hair Oil",
          size: "250ml",
          description: "Nourishing hair oil blend for strength and shine",
          wholesalePrice: "KSh 240", 
          moq: "30 units",
          keyBenefits: ["Natural Oils", "Hair Strengthening", "Shine Enhancement", "Scalp Nourishment"]
        },
        {
          name: "Dark & Beautiful Shampoo",
          size: "400ml",
          description: "Gentle cleansing shampoo for healthy, beautiful hair",
          wholesalePrice: "KSh 260",
          moq: "24 units",
          keyBenefits: ["Sulfate-Free", "Color Safe", "Natural Extracts", "pH Balanced"]
        }
      ]
    },
    {
      id: "super-food",
      name: "Super Food",
      tagline: "Nutritive Wellness",
      description: "Vitamin and nutrient-enriched personal care products inspired by nature's superfoods for optimal wellness.",
      color: "from-red-700 to-red-800",
      bgColor: "bg-red-50",
      backgroundImage: "/images/cornellscategoryimages/SUPER_FOOD.jpg",
      overlay: "bg-black/40",
      products: [
        {
          name: "Super Food Vitamin C Serum",
          size: "30ml",
          description: "Antioxidant-rich facial serum with natural vitamin C",
          wholesalePrice: "KSh 450",
          moq: "18 units",
          keyBenefits: ["Vitamin C", "Antioxidant Rich", "Anti-Aging", "Brightening Effect"]
        },
        {
          name: "Super Food Body Scrub",
          size: "200ml", 
          description: "Exfoliating scrub with superfood extracts and natural oils",
          wholesalePrice: "KSh 320",
          moq: "24 units",
          keyBenefits: ["Natural Exfoliation", "Superfood Extracts", "Skin Renewal", "Moisturizing"]
        }
      ]
    }
  ];

  // Global Stats matching official website
  const globalStats = [
    {
      icon: <FaGlobe className="w-8 h-8" />,
      number: "90+",
      label: "Countries",
      description: "Global Footprint"
    },
    {
      icon: <FaUserFriends className="w-8 h-8" />,
      number: "30M+",
      label: "Happy Customers",
      description: "Customer Joy"
    },
    {
      icon: <FaFlask className="w-8 h-8" />,
      number: "2000+",
      label: "Products",
      description: "Creative Innovations"
    },
    {
      icon: <FaHeart className="w-8 h-8" />,
      number: "0",
      label: "Animal Testing",
      description: "Ethics Upheld"
    }
  ];

  // Core Values with burgundy theme
  const coreValues = [
    {
      icon: <FaLeaf className="w-8 h-8" />,
      title: "Cruelty-Free Beauty",
      description: "Every product is meticulously created without any animal testing, upholding the highest ethical standards."
    },
    {
      icon: <FaSeedling className="w-8 h-8" />,
      title: "Responsibly Sourced",
      description: "Our 2000+ products are responsibly sourced, supporting sustainable and ethical beauty practices."
    },
    {
      icon: <FaSun className="w-8 h-8" />,
      title: "Innovation Driven",
      description: "Driving progress in the beauty industry with advanced facilities and cutting-edge formulations."
    },
    {
      icon: <FaHandHoldingHeart  className="w-8 h-8" />,
      title: "Global Impact",
      description: "Making a positive impact across 90+ countries, fostering connections and spreading beauty worldwide."
    }
  ];

  const testimonials = [
    {
      name: "Grace Wanjiru",
      business: "Beauty Haven, Westlands",
      rating: 5,
      comment: "Cornells products are genuine global quality. The Bold & Beautiful line is our top seller, customers absolutely love the Shea Butter formulation."
    },
    {
      name: "Michael Oduya", 
      business: "Oduya Pharmacy, Kisumu",
      rating: 5,
      comment: "The variety in Cornells range is incredible. From baby care to anti-aging, we stock the full collection. Excellent margins and customer satisfaction."
    },
    {
      name: "Sarah Mbugua",
      business: "Mbugua Beauty Store, Nakuru", 
      rating: 5,
      comment: "Cornells has transformed our skincare section. The global brand recognition and cruelty-free promise really resonate with our customers."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50/20">
      {/* Hero Section */}
      <div className={`relative min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 transition-all duration-1000 ${isLoaded ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`} style={{backgroundColor: '#7c2724'}}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-red-600/10 to-red-700/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10 flex items-center min-h-screen">
          <div className="grid lg:grid-cols-2 gap-16 items-center w-full">
            <div className="text-center lg:text-left">
              <div className="mb-8">
                <div className="inline-flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-6">
                  <FaGlobe className="w-5 h-5 text-red-300" />
                  <span className="text-red-100 font-medium">Global Beauty. Local Excellence.</span>
                </div>
                
                <h1 className="text-5xl sm:text-7xl font-bold text-white mb-6 leading-tight">
                  Cornells
                  <span className="block text-3xl sm:text-4xl font-light text-red-200 mt-2">Wellness</span>
                </h1>
                
                <div className="w-24 h-1 bg-gradient-to-r from-red-400 to-red-300 mb-8 mx-auto lg:mx-0"></div>
                
                <p className="text-lg sm:text-2xl text-red-100 leading-relaxed mb-8">
                  Experience the beauty of wellness with our globally trusted, 
                  <span className="font-semibold text-white"> cruelty-free products</span> now exclusively 
                  available in Kenya through Rekker.
                </p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
                {globalStats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{stat.number}</div>
                    <div className="text-red-200 text-xs sm:text-sm font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a
                  href="#product-brochure"
                  className="inline-flex items-center justify-center space-x-2 bg-white hover:bg-red-50 transition-all duration-300 transform hover:scale-105 shadow-xl px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg"
                  style={{color: '#7c2724'}}
                >
                  <FaBook className="w-5 h-5" />
                  <span>View Brochure</span>
                </a>
                <a
                  href="#collections"
                  className="inline-flex items-center justify-center space-x-2 border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-white hover:text-red-900 transition-all duration-300"
                >
                  <FaEye className="w-5 h-5" />
                  <span>Explore Collections</span>
                </a>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="aspect-square bg-gradient-to-br from-red-200 to-red-300 rounded-3xl shadow-2xl overflow-hidden">
                    <div className="h-full flex items-center justify-center p-6">
                      <div className="text-center">
                        <FaGem className="w-16 h-16 mx-auto mb-4" style={{color: '#7c2724'}} />
                        <h3 className="font-bold text-gray-800 text-lg">Bold & Beautiful</h3>
                        <p className="text-gray-600 text-sm">Body Care</p>
                      </div>
                    </div>
                  </div>
                  <div className="aspect-square bg-gradient-to-br from-red-200 to-red-300 rounded-3xl shadow-2xl overflow-hidden">
                    <div className="h-full flex items-center justify-center p-6">
                      <div className="text-center">
                        <FaLeaf className="w-16 h-16 mx-auto mb-4" style={{color: '#7c2724'}} />
                        <h3 className="font-bold text-gray-800 text-lg">Super Food</h3>
                        <p className="text-gray-600 text-sm">Wellness</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-6 pt-12">
                  <div className="aspect-square bg-gradient-to-br from-red-200 to-red-300 rounded-3xl shadow-2xl overflow-hidden">
                    <div className="h-full flex items-center justify-center p-6">
                      <div className="text-center">
                        <FaSun className="w-16 h-16 mx-auto mb-4" style={{color: '#7c2724'}} />
                        <h3 className="font-bold text-gray-800 text-lg">Cute & Pretty</h3>
                        <p className="text-gray-600 text-sm">Family Care</p>
                      </div>
                    </div>
                  </div>
                  <div className="aspect-square bg-gradient-to-br from-red-200 to-red-300 rounded-3xl shadow-2xl overflow-hidden">
                    <div className="h-full flex items-center justify-center p-6">
                      <div className="text-center">
                        <FaHeart className="w-16 h-16 mx-auto mb-4" style={{color: '#7c2724'}} />
                        <h3 className="font-bold text-gray-800 text-lg">Dark & Beautiful</h3>
                        <p className="text-gray-600 text-sm">Hair Care</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/70 animate-bounce">
          <div className="text-center">
            <div className="w-px h-16 bg-white/30 mx-auto mb-2"></div>
            <p className="text-sm font-medium">Discover More</p>
          </div>
        </div>
      </div>

      {/* Global Impact Section */}
      <section className="py-20 bg-white" id="global-impact">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">Global Beauty, Local Excellence</h2>
              <div className="w-24 h-1 bg-gradient-to-r mx-auto mb-8" style={{background: 'linear-gradient(to right, #7c2724, #a0312a)'}}></div>
              <p className="text-lg sm:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                With a presence in 90+ countries, we spread beauty and innovation worldwide, fostering connections and making a positive impact across diverse markets.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-16">
              {globalStats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300" style={{color: '#7c2724'}}>
                    {stat.icon}
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-base sm:text-lg font-semibold text-gray-700 mb-1">{stat.label}</div>
                  <div className="text-xs sm:text-sm text-gray-500">{stat.description}</div>
                </div>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {coreValues.map((value, index) => (
                <div key={index} className="bg-gradient-to-br from-gray-50 to-red-50/30 rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4" style={{color: '#7c2724'}}>
                    {value.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Product Brochure Section - REPLACES Best Sellers */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-red-50/30" id="product-brochure">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Interactive Product Brochure</h2>
              <div className="w-24 h-1 bg-gradient-to-r mx-auto mb-8" style={{background: 'linear-gradient(to right, #7c2724, #a0312a)'}}></div>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Explore our complete product range through our interactive digital brochure - just like flipping through a real catalog
              </p>
            </div>

            {/* Brochure Flipbook Component */}
            <BrochureFlipbook />

            {/* Call to Action Below Brochure */}
            <div className="mt-12 text-center">
              <p className="text-gray-600 mb-6 text-lg">Ready to stock these premium products in your store?</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/wholesale-request"
                  className="inline-flex items-center justify-center space-x-2 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  style={{background: 'linear-gradient(to right, #7c2724, #a0312a)'}}
                >
                  <FaShoppingCart className="w-5 h-5" />
                  <span>Request Wholesale Order</span>
                </a>
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center space-x-2 border-2 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:border-red-600 hover:text-red-600 transition-all duration-300"
                  style={{borderColor: '#7c2724'}}
                >
                  <span>Get Custom Quote</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Collections Section with Background Images */}
      <section className="py-20 bg-white" id="collections">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Product Collections</h2>
              <div className="w-24 h-1 bg-gradient-to-r mx-auto mb-8" style={{background: 'linear-gradient(to right, #7c2724, #a0312a)'}}></div>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Four distinct collections designed to meet every wellness and beauty need
              </p>
            </div>

            {/* Collection Navigation */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {productCollections.map((collection, index) => (
                <button
                  key={collection.id}
                  onClick={() => setActiveCollection(index)}
                  className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                    activeCollection === index
                      ? 'text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={activeCollection === index ? {background: 'linear-gradient(to right, #7c2724, #a0312a)'} : {}}
                >
                  {collection.name}
                </button>
              ))}
            </div>

            {/* Active Collection Details with Background Image */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-all duration-500 group min-h-96">
              <div 
                className={`absolute inset-0 bg-cover bg-center bg-no-repeat ${productCollections[activeCollection].backgroundImage ? '' : `bg-gradient-to-br ${productCollections[activeCollection].color}`}`}
                style={productCollections[activeCollection].backgroundImage ? 
                  { backgroundImage: `url(${productCollections[activeCollection].backgroundImage})` } : {}}
              />
              
              <div className={`absolute inset-0 ${productCollections[activeCollection].overlay} transition-all duration-300 group-hover:bg-black/60`} />
              
              <div className="relative z-10 p-8 lg:p-12 flex flex-col justify-between text-white min-h-96">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-4xl font-bold mb-4 drop-shadow-lg">
                        {productCollections[activeCollection].name}
                      </h3>
                      <p className="text-xl font-medium text-red-200 mb-4 drop-shadow-md">
                        {productCollections[activeCollection].tagline}
                      </p>
                      <p className="text-lg text-white/90 leading-relaxed drop-shadow-sm">
                        {productCollections[activeCollection].description}
                      </p>
                    </div>

                    <div className="space-y-6">
                      {productCollections[activeCollection].products.map((product, index) => (
                        <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="text-lg font-bold text-white drop-shadow-sm mb-2">{product.name}</h4>
                              <p className="text-white/80 mb-3">{product.description}</p>
                              <div className="text-sm text-red-200">Size: {product.size}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-white mb-1 drop-shadow-sm">{product.wholesalePrice}</div>
                              <div className="text-xs text-red-200">MOQ: {product.moq}</div>
                            </div>
                          </div>
                          
                          <div className="grid sm:grid-cols-2 gap-2">
                            {product.keyBenefits.map((benefit, idx) => (
                              <div key={idx} className="flex items-center space-x-2 text-sm">
                                <FaCheckCircle className="w-3 h-3 text-green-300" />
                                <span className="text-white/90 drop-shadow-sm">{benefit}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex space-x-4">
                      <a
                        href="/wholesale-request"
                        className="inline-flex items-center space-x-2 bg-white text-red-800 px-8 py-4 rounded-lg font-semibold hover:bg-red-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
                      >
                        <FaShoppingCart className="w-5 h-5" />
                        <span>Order Collection</span>
                        <FaArrowRight className="w-4 h-4" />
                      </a>
                      <a
                        href="/contact"
                        className="inline-flex items-center space-x-2 border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-red-800 transition-all duration-300"
                      >
                        <span>Get Quote</span>
                      </a>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                      <div className="text-center">
                        <div className="w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 bg-white/20 backdrop-blur-sm">
                          <FaGem className="w-16 h-16 text-white" />
                        </div>
                        <h4 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
                          {productCollections[activeCollection].name}
                        </h4>
                        <p className="text-red-200 drop-shadow-md">{productCollections[activeCollection].tagline}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-red-50/30">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Retail Partner Success Stories</h2>
              <div className="w-24 h-1 bg-gradient-to-r mx-auto mb-8" style={{background: 'linear-gradient(to right, #7c2724, #a0312a)'}}></div>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Beauty retailers across Kenya trust Cornells for premium quality and exceptional customer satisfaction
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="flex items-center space-x-1 mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <FaStar key={i} className="w-5 h-5 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic leading-relaxed text-lg">
                    "{testimonial.comment}"
                  </p>
                  <div className="border-t border-gray-100 pt-6">
                    <div className="font-bold text-gray-900 text-lg">{testimonial.name}</div>
                    <div className="font-medium" style={{color: '#7c2724'}}>{testimonial.business}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Exclusive Partnership Section */}
      <section className="py-20 bg-gradient-to-r from-red-100 via-red-50 to-red-100">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-full px-8 py-4 mb-8">
                <FaMedal className="w-6 h-6" style={{color: '#7c2724'}} />
                <span className="text-gray-800 font-bold text-lg">Exclusive Partnership</span>
              </div>
              
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Kenya's Official Cornells Distributor
              </h2>
              <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed mb-8">
                Rekker is proud to be the sole authorized distributor of Cornells wellness products in Kenya. 
                Every authentic Cornells product in the country comes through our exclusive partnership.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
                <div className="text-center mb-8">
                  <div className="text-sm text-gray-600 mb-2">Global Manufacturer</div>
                  <div className="text-3xl font-bold mb-4" style={{color: '#7c2724'}}>CORNELLS WELLNESS</div>
                  <div className="w-16 h-px bg-gray-300 mx-auto mb-4"></div>
                  <div className="text-sm text-gray-600 mb-2">Exclusive Kenya Distributor</div>
                  <div className="text-2xl font-bold text-gray-900">REKKER LIMITED</div>
                </div>
                
                <div className="space-y-4 text-center">
                  <div className="flex items-center justify-center space-x-2 text-green-600">
                    <FaCheckCircle className="w-5 h-5" />
                    <span className="font-medium">100% Authentic Products</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-green-600">
                    <FaCheckCircle className="w-5 h-5" />
                    <span className="font-medium">Direct from Manufacturer</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-green-600">
                    <FaCheckCircle className="w-5 h-5" />
                    <span className="font-medium">Full Product Range Available</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-green-600">
                    <FaCheckCircle className="w-5 h-5" />
                    <span className="font-medium">Competitive Wholesale Pricing</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Why Partner with Us?</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start space-x-3">
                      <FaCheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{color: '#7c2724'}} />
                      <span>Guaranteed authentic Cornells products with full manufacturer warranty</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <FaCheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{color: '#7c2724'}} />
                      <span>Competitive wholesale pricing with flexible MOQs for different business sizes</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <FaCheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{color: '#7c2724'}} />
                      <span>Full marketing support and product training for your team</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <FaCheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{color: '#7c2724'}} />
                      <span>Reliable supply chain with nationwide delivery coverage</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Global Quality, Local Service</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Experience the best of both worlds - internationally acclaimed Cornells quality 
                    backed by Rekker's local expertise and customer service excellence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20" style={{background: 'linear-gradient(to right, #7c2724, #a0312a, #7c2724)'}}>
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-5xl mx-auto">
            <div className="mb-12">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                Ready to Transform Your Beauty Business?
              </h2>
              <p className="text-xl sm:text-2xl text-red-100 leading-relaxed">
                Join Kenya's most successful beauty retailers who trust Cornells for premium quality, 
                global recognition, and exceptional profit margins.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <FaGlobe className="w-12 h-12 text-red-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">Global Brand Recognition</h3>
                <p className="text-red-200 text-sm">Trusted in 90+ countries with 30M+ happy customers worldwide</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <FaHeart className="w-12 h-12 text-red-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">Ethical & Cruelty-Free</h3>
                <p className="text-red-200 text-sm">100% cruelty-free products that resonate with conscious consumers</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <FaArrowRight className="w-12 h-12 text-red-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">Exclusive Access</h3>
                <p className="text-red-200 text-sm">Be the only authentic Cornells retailer in your area</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a
                href="/wholesale-request"
                className="inline-flex items-center justify-center space-x-3 bg-white px-10 py-5 rounded-xl font-bold text-xl hover:bg-red-50 transition-all duration-300 transform hover:scale-105 shadow-2xl"
                style={{color: '#7c2724'}}
              >
                <FaShoppingCart className="w-6 h-6" />
                <span>Start Wholesale Order</span>
                <FaArrowRight className="w-5 h-5" />
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center space-x-3 border-3 border-white text-white px-10 py-5 rounded-xl font-bold text-xl hover:bg-white hover:text-red-900 transition-all duration-300"
              >
                <span>Contact Sales Team</span>
              </a>
            </div>

            <div className="mt-8 text-red-200">
              <p className="text-sm">
                *Minimum order quantities apply. Special pricing available for established retailers.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CornellsBrand;