/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  FaGlobe, FaAward, FaCertificate, FaIndustry, 
  FaLeaf, FaHeart, FaFlask, FaStar, FaUsers,
  FaChevronDown, FaMapMarkerAlt, FaChartLine
} from "react-icons/fa";

const BrandsOverview = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const saffronRef = useRef(null);
  const cornellsRef = useRef(null);

  useEffect(() => {
    setIsLoaded(true);
    
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalScroll) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const brandSlides = [
    {
      brand: "Saffron",
      tagline: "French Design. Kenyan Excellence.",
      description: "State-of-the-art cleaning and personal care solutions combining European innovation with local manufacturing prowess",
      color: "from-amber-600 via-orange-500 to-red-500"
    },
    {
      brand: "Cornells", 
      tagline: "Global Beauty. Trusted Wellness.",
      description: "Premium beauty and wellness products from Starling Parfums, reaching 90+ countries worldwide",
      color: "from-purple-600 via-pink-500 to-rose-500"
    }
  ];

  const saffronStory = {
    hero: {
      title: "Saffron",
      subtitle: "Where French Design Meets Kenyan Craftsmanship",
      description: "Born from a vision to bring world-class cleaning and personal care solutions to the African market, Saffron represents the perfect marriage of European design excellence and Kenyan manufacturing capability."
    },
    pillars: [
      {
        icon: FaFlask,
        title: "French Innovation",
        description: "Products designed in France using cutting-edge formulations and European beauty standards"
      },
      {
        icon: FaIndustry,
        title: "Kenyan Manufacturing",
        description: "Manufactured locally with state-of-the-art machinery, supporting local employment and economic growth"
      },
      {
        icon: FaChartLine,
        title: "Rapid Growth",
        description: "Exponentially expanding product catalogue with new innovations launched regularly"
      },
      {
        icon: FaLeaf,
        title: "Sustainable Practices",
        description: "Committed to environmentally responsible manufacturing and sustainable sourcing"
      }
    ],
    categories: [
      {
        name: "Premium Handwash",
        description: "Antibacterial formulas with luxury fragrances",
        gradient: "from-orange-400 to-red-400"
      },
      {
        name: "Dishwashing Solutions",
        description: "Powerful yet gentle liquid soaps",
        gradient: "from-amber-400 to-orange-400"
      },
      {
        name: "Liquid Detergents",
        description: "High-efficiency cleaning for all fabrics",
        gradient: "from-red-400 to-pink-400"
      },
      {
        name: "Shower Gels",
        description: "Luxurious bathing experiences",
        gradient: "from-orange-500 to-amber-500"
      },
      {
        name: "Men's Grooming",
        description: "After-shave and anti-bump solutions",
        gradient: "from-red-500 to-orange-500"
      }
    ],
    commitment: "Every Saffron product undergoes rigorous quality testing and meets international standards. Our manufacturing facility employs advanced technology and maintains strict quality control protocols to ensure consistency and excellence in every bottle."
  };

  const cornellsStory = {
    hero: {
      title: "Cornells",
      subtitle: "Global Beauty Standards, Exclusively in Kenya",
      description: "As the exclusive distributor of Cornells Wellness by Starling Parfums, Rekker brings world-renowned beauty and wellness products to the Kenyan market. Trusted by over 30 million customers across 90+ countries."
    },
    globalStats: [
      {
        icon: FaGlobe,
        number: "90+",
        label: "Countries Worldwide",
        description: "Global presence across diverse markets"
      },
      {
        icon: FaUsers,
        number: "30M+",
        label: "Happy Customers",
        description: "Trust built through quality and innovation"
      },
      {
        icon: FaStar,
        number: "2000+",
        label: "Product Innovations",
        description: "Cruelty-free, responsibly sourced solutions"
      },
      {
        icon: FaIndustry,
        number: "100K",
        label: "Metric Tons Capacity",
        description: "Advanced production facilities"
      }
    ],
    values: [
      {
        icon: FaHeart,
        title: "Cruelty-Free",
        description: "0% animal testing - Every product is ethically created without any animal testing"
      },
      {
        icon: FaLeaf,
        title: "Sustainable Sourcing",
        description: "Responsibly sourced ingredients ensuring environmental stewardship"
      },
      {
        icon: FaAward,
        title: "Quality Assurance",
        description: "Dermatologically tested and approved for all skin types"
      },
      {
        icon: FaFlask,
        title: "Innovation First",
        description: "Cutting-edge formulations backed by scientific research"
      }
    ],
    ranges: [
      {
        name: "Hair Care",
        description: "Food for Your Hair - Nourishing treatments and styling solutions",
        highlight: "Bold & Beautiful, Cute & Pretty, Dark & Lovely Collections"
      },
      {
        name: "Skincare",
        description: "Premium lotions, toners, and facial care products",
        highlight: "Deep moisturizing and anti-aging solutions"
      },
      {
        name: "Sun Protection",
        description: "Broad-spectrum sunscreens for daily protection",
        highlight: "SPF 30-50, water-resistant formulations"
      },
      {
        name: "Body Care",
        description: "Complete wellness range for total body care",
        highlight: "Hydrating and rejuvenating treatments"
      }
    ],
    partnership: "Rekker's exclusive partnership with Starling Parfums brings these globally celebrated products to Kenya, ensuring authentic quality, competitive pricing, and reliable distribution across all 47 counties."
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % brandSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [brandSlides.length]);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-100 z-50">
        <div 
          className="h-full bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 transition-all duration-300"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Hero Section - Minimalist & Elegant */}
      <div className={`relative h-screen transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute inset-0 overflow-hidden">
          {brandSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === activeSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${slide.color}`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_25%,rgba(255,255,255,0.05)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.05)_75%)] bg-[length:60px_60px]" />
              </div>
            </div>
          ))}
        </div>

        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto text-center text-white">
              <div className="mb-8 animate-fade-in">
                <div className="inline-block mb-4">
                  <span className="text-sm font-semibold tracking-[0.3em] uppercase opacity-90">
                    Two Brands. One Promise.
                  </span>
                </div>
                <h1 className="text-7xl md:text-8xl font-bold mb-6 tracking-tight leading-none">
                  {brandSlides[activeSlide].brand}
                </h1>
                <p className="text-2xl md:text-3xl font-light mb-4 tracking-wide">
                  {brandSlides[activeSlide].tagline}
                </p>
                <p className="text-lg md:text-xl opacity-90 max-w-3xl mx-auto leading-relaxed font-light">
                  {brandSlides[activeSlide].description}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
                <button
                  onClick={() => scrollToSection(saffronRef)}
                  className="group px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-full font-medium transition-all duration-300 hover:bg-white hover:text-gray-900 min-w-[200px]"
                >
                  Discover Saffron
                </button>
                <button
                  onClick={() => scrollToSection(cornellsRef)}
                  className="group px-8 py-4 bg-white text-gray-900 rounded-full font-medium transition-all duration-300 hover:bg-white/90 hover:scale-105 min-w-[200px]"
                >
                  Explore Cornells
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex flex-col items-center gap-2 text-white animate-bounce">
            <span className="text-sm font-light tracking-wider">Scroll to explore</span>
            <FaChevronDown className="w-5 h-5" />
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-30">
          {brandSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveSlide(index)}
              className={`transition-all duration-300 ${
                index === activeSlide 
                  ? 'w-12 h-1.5 bg-white rounded-full' 
                  : 'w-1.5 h-1.5 bg-white/40 rounded-full hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Introduction Section */}
      <section className="py-32 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block text-sm font-semibold tracking-[0.3em] uppercase text-gray-500 mb-4">
              Our Brand Portfolio
            </span>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight">
              Excellence Through<br />Diversity
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 mx-auto mb-10" />
            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed font-light">
              Rekker's brand portfolio represents our commitment to bringing the finest products to the Kenyan market. 
              From manufacturing excellence to exclusive distribution partnerships, each brand tells a unique story of 
              quality, innovation, and trust.
            </p>
          </div>
        </div>
      </section>

      {/* Saffron Brand Section */}
      <section ref={saffronRef} className="py-32 bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            {/* Saffron Hero */}
            <div className="text-center mb-20">
              <div className="inline-flex items-center justify-center gap-4 mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <FaFlask className="w-10 h-10 text-white" />
                </div>
              </div>
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
                {saffronStory.hero.title}
              </h2>
              <p className="text-2xl text-orange-600 font-medium mb-6">
                {saffronStory.hero.subtitle}
              </p>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                {saffronStory.hero.description}
              </p>
            </div>

            {/* Core Pillars */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
              {saffronStory.pillars.map((pillar, index) => (
                <div
                  key={index}
                  className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <pillar.icon className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {pillar.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Product Categories */}
            <div className="mb-20">
              <div className="text-center mb-12">
                <h3 className="text-4xl font-bold text-gray-900 mb-4">Product Range</h3>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  A growing collection of premium cleaning and personal care solutions
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {saffronStory.categories.map((category, index) => (
                  <div
                    key={index}
                    className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg hover:shadow-2xl transition-all duration-500"
                  >
                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${category.gradient}`} />
                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                      {category.name}
                    </h4>
                    <p className="text-gray-600">
                      {category.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Commitment Statement */}
            <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-3xl p-12 md:p-16 text-white text-center shadow-2xl">
              <FaAward className="w-16 h-16 mx-auto mb-6 opacity-90" />
              <h3 className="text-3xl font-bold mb-6">Our Quality Commitment</h3>
              <p className="text-xl leading-relaxed max-w-4xl mx-auto opacity-95">
                {saffronStory.commitment}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-32 bg-gradient-to-b from-red-50 to-purple-50" />

      {/* Cornells Brand Section */}
      <section ref={cornellsRef} className="py-32 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            {/* Cornells Hero */}
            <div className="text-center mb-20">
              <div className="inline-flex items-center justify-center gap-4 mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <FaHeart className="w-10 h-10 text-white" />
                </div>
              </div>
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
                {cornellsStory.hero.title}
              </h2>
              <p className="text-2xl text-purple-600 font-medium mb-6">
                {cornellsStory.hero.subtitle}
              </p>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                {cornellsStory.hero.description}
              </p>
            </div>

            {/* Global Stats */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
              {cornellsStory.globalStats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white rounded-3xl p-8 shadow-lg text-center hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="text-4xl font-bold text-purple-600 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-lg font-semibold text-gray-900 mb-2">
                    {stat.label}
                  </div>
                  <p className="text-sm text-gray-600">
                    {stat.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Core Values */}
            <div className="mb-20">
              <div className="text-center mb-12">
                <h3 className="text-4xl font-bold text-gray-900 mb-4">Our Values</h3>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Ethical beauty backed by science and sustainability
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {cornellsStory.values.map((value, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-3xl p-10 shadow-lg hover:shadow-2xl transition-all duration-500"
                  >
                    <div className="flex items-start gap-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <value.icon className="w-8 h-8 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="text-2xl font-bold text-gray-900 mb-3">
                          {value.title}
                        </h4>
                        <p className="text-gray-600 leading-relaxed">
                          {value.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Ranges */}
            <div className="mb-20">
              <div className="text-center mb-12">
                <h3 className="text-4xl font-bold text-gray-900 mb-4">Product Collections</h3>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Comprehensive beauty and wellness solutions for every need
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {cornellsStory.ranges.map((range, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
                  >
                    <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500" />
                    <div className="p-10">
                      <h4 className="text-2xl font-bold text-gray-900 mb-3">
                        {range.name}
                      </h4>
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        {range.description}
                      </p>
                      <div className="inline-block bg-purple-50 rounded-full px-6 py-2">
                        <p className="text-sm text-purple-700 font-medium">
                          {range.highlight}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Partnership Statement */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-12 md:p-16 text-white text-center shadow-2xl">
              <FaGlobe className="w-16 h-16 mx-auto mb-6 opacity-90" />
              <h3 className="text-3xl font-bold mb-6">Exclusive Partnership</h3>
              <p className="text-xl leading-relaxed max-w-4xl mx-auto opacity-95">
                {cornellsStory.partnership}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA Section */}
      <section className="py-32 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05),transparent_50%)]" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl md:text-6xl font-bold mb-8">
              Experience Our Brands
            </h2>
            <p className="text-xl md:text-2xl opacity-90 mb-12 leading-relaxed">
              Whether you're looking for locally manufactured excellence or globally trusted beauty solutions, 
              our brands deliver uncompromising quality and value.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                to="/contact"
                className="px-10 py-5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl min-w-[220px]"
              >
                Contact Us
              </Link>
              {/* <Link
                to="/about"
                className="px-10 py-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full font-bold text-lg transition-all duration-300 hover:bg-white hover:text-gray-900 min-w-[220px]"
              >
                Learn More
              </Link> */}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BrandsOverview;