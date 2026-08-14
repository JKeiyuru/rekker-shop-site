/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
// pages/About.jsx - Professional Rekker About Page
import { useState, useEffect } from "react";
import { 
  FaBuilding, FaIndustry, FaUsers, FaGlobe, FaAward, FaHandshake,FaTruck,
  FaRocket, FaEye, FaHeart, FaTrophy, FaChartLine, FaShieldAlt,
  FaLeaf, FaRecycle, FaCertificate, FaTools
} from "react-icons/fa";

const About = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('story');

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Company milestones
  const milestones = [
    {
      year: "2010",
      title: "Company Founded",
      description: "Rekker established as a quality-focused manufacturer and distributor",
      icon: FaBuilding
    },
    {
      year: "2015",
      title: "Saffron Brand Launch",
      description: "Introduced our premium cleaning and personal care product line",
      icon: FaRocket
    },
    {
      year: "2018",
      title: "Distribution Expansion",
      description: "Expanded distribution network across all 47 counties in Kenya",
      icon: FaTruck
    },
    {
      year: "2020",
      title: "Cornells Partnership",
      description: "Became exclusive distributor of Cornells beauty products in Kenya",
      icon: FaHandshake
    },
    {
      year: "2023",
      title: "Sustainability Initiative",
      description: "Launched eco-friendly packaging and sustainable manufacturing practices",
      icon: FaLeaf
    }
  ];

  // Leadership team
  const leadership = [
    {
      name: "John Kamau",
      position: "Chief Executive Officer",
      image: "/api/placeholder/300/400",
      bio: "Over 15 years of experience in manufacturing and distribution across East Africa"
    },
    {
      name: "Sarah Wanjiku",
      position: "Chief Operations Officer", 
      image: "/api/placeholder/300/400",
      bio: "Expert in supply chain management and quality assurance with international certifications"
    },
    {
      name: "David Ochieng",
      position: "Head of Sales & Distribution",
      image: "/api/placeholder/300/400",
      bio: "Proven track record in building distribution networks and strategic partnerships"
    },
    {
      name: "Grace Mutua",
      position: "Quality Assurance Manager",
      image: "/api/placeholder/300/400",
      bio: "Certified quality professional ensuring all products meet international standards"
    }
  ];

  // Company values
  const values = [
    {
      icon: FaAward,
      title: "Quality Excellence",
      description: "We maintain the highest standards in manufacturing and sourcing, ensuring every product meets international quality benchmarks."
    },
    {
      icon: FaUsers,
      title: "Customer First",
      description: "Our customers' success is our priority. We provide exceptional service and build lasting partnerships."
    },
    {
      icon: FaShieldAlt,
      title: "Integrity",
      description: "Transparency, honesty, and ethical business practices guide all our operations and relationships."
    },
    {
      icon: FaLeaf,
      title: "Sustainability",
      description: "We're committed to environmentally responsible practices and contributing to a sustainable future."
    },
    {
      icon: FaRocket,
      title: "Innovation",
      description: "Continuously improving our products and processes to meet evolving market needs."
    },
    {
      icon: FaHandshake,
      title: "Partnership",
      description: "Building strong relationships with suppliers, distributors, and customers for mutual growth."
    }
  ];

  // Certifications and achievements
  const certifications = [
    {
      name: "ISO 9001:2015",
      description: "Quality Management Systems",
      icon: FaCertificate
    },
    {
      name: "KEBS Standards",
      description: "Kenya Bureau of Standards Certified",
      icon: FaAward
    },
    {
      name: "HACCP Certified",
      description: "Food Safety Management",
      icon: FaShieldAlt
    },
    {
      name: "Green Business",
      description: "Sustainability Certification",
      icon: FaLeaf
    }
  ];

  const tabContent = {
    story: {
      title: "Our Story",
      content: (
        <div className="space-y-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              Founded in 2010, Rekker began as a vision to provide Kenya with quality products that meet international standards 
              while remaining accessible to local markets. What started as a small manufacturing operation has grown into one of 
              Kenya's most trusted names in product distribution and private label manufacturing.
            </p>
            
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              Our journey has been marked by continuous growth, strategic partnerships, and an unwavering commitment to quality. 
              Today, we serve over 1,000 clients across all 47 counties in Kenya, from small retailers to major supermarket chains, 
              providing them with reliable products and exceptional service.
            </p>

            <div className="bg-blue-50 rounded-2xl p-8 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Why We Started</h3>
              <p className="text-gray-600 leading-relaxed">
                We recognized a gap in the Kenyan market for high-quality, affordable products that could compete with international 
                brands. Our mission was to bridge this gap by combining local manufacturing expertise with global quality standards, 
                creating products that Kenyans could be proud to use and businesses could confidently sell.
              </p>
            </div>
          </div>
        </div>
      )
    },
    mission: {
      title: "Mission & Vision",
      content: (
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center mb-6">
              <FaRocket className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
            <p className="text-gray-600 leading-relaxed">
              To manufacture and distribute high-quality products that enhance the lives of our customers while 
              building sustainable partnerships that drive economic growth across Kenya. We are committed to 
              excellence in everything we do, from product development to customer service.
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center mb-6">
              <FaEye className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
            <p className="text-gray-600 leading-relaxed">
              To be East Africa's leading manufacturer and distributor of quality consumer products, recognized 
              for our innovation, reliability, and contribution to sustainable economic development. We envision 
              a future where Kenyan-made products are the preferred choice in regional and international markets.
            </p>
          </div>
        </div>
      )
    },
    leadership: {
      title: "Leadership Team",
      content: (
        <div className="space-y-8">
          <p className="text-xl text-gray-600 leading-relaxed text-center max-w-3xl mx-auto">
            Our leadership team combines decades of experience in manufacturing, distribution, and business development. 
            Together, they guide Rekker's strategic vision and operational excellence.
          </p>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {leadership.map((leader, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="aspect-w-3 aspect-h-2">
                  <img
                    src={leader.image}
                    alt={leader.name}
                    className="w-full h-64 object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{leader.name}</h3>
                  <p className="text-blue-600 font-semibold mb-3">{leader.position}</p>
                  <p className="text-gray-600 leading-relaxed">{leader.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-green-50/10">
      {/* Hero Section */}
      <div className={`relative py-20 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 transition-all duration-1000 ${isLoaded ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-green-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <h1 className="text-5xl font-bold text-white mb-6 tracking-wide">About Rekker</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-green-400 mx-auto mb-8"></div>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Building Kenya's future through quality manufacturing, trusted distribution, and innovative partnerships
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-16">
        {/* Navigation Tabs */}
        <div className={`flex justify-center mb-12 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
          <div className="bg-white rounded-2xl shadow-lg p-2 inline-flex">
            {Object.keys(tabContent).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tabContent[tab].title}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className={`max-w-6xl mx-auto transition-all duration-700 delay-500 ${isLoaded ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
          <div className="bg-white rounded-3xl shadow-xl p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              {tabContent[activeTab].title}
            </h2>
            {tabContent[activeTab].content}
          </div>
        </div>

        {/* Company Timeline */}
        {activeTab === 'story' && (
          <div className={`mt-20 transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Journey</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-green-500 mx-auto"></div>
            </div>

            <div className="relative">
              {/* Timeline Line */}
              <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-500 to-green-500 rounded-full"></div>

              <div className="space-y-12 lg:space-y-16">
                {milestones.map((milestone, index) => (
                  <div
                    key={index}
                    className={`relative flex items-center ${
                      index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                    }`}
                  >
                    {/* Timeline Node */}
                    <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center shadow-lg z-10">
                      <milestone.icon className="w-6 h-6 text-white" />
                    </div>

                    {/* Content */}
                    <div className={`w-full lg:w-5/12 ${index % 2 === 0 ? 'lg:pr-16' : 'lg:pl-16'}`}>
                      <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-center mb-4 lg:hidden">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mr-4">
                            <milestone.icon className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-2xl font-bold text-blue-600">{milestone.year}</span>
                        </div>
                        <div className="hidden lg:block mb-4">
                          <span className="text-2xl font-bold text-blue-600">{milestone.year}</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">{milestone.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{milestone.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Company Values */}
        <div className={`mt-20 transition-all duration-1000 delay-900 ${isLoaded ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Values</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-green-500 mx-auto mb-8"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These core values guide every decision we make and every relationship we build
            </p>
          </div>

          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-center group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-green-100 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <value.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className={`mt-20 transition-all duration-1000 delay-1000 ${isLoaded ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Certifications & Standards</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-green-500 mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {certifications.map((cert, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-8 text-center hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <cert.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{cert.name}</h3>
                <p className="text-gray-600 text-sm">{cert.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;