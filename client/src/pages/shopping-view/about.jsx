/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
// pages/About.jsx - Rekker About Page — black / red / white / green brand theme
import { useState, useEffect } from "react";
import {
  FaBuilding, FaIndustry, FaUsers, FaGlobe, FaAward, FaHandshake, FaTruck,
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
      title: "Bio Saff Launch",
      description: "Launched Bio Saff — our own premium cosmetics and body care brand",
      icon: FaLeaf
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

            <div className="bg-secondary rounded-2xl p-8 mb-8 border-l-4 border-primary">
              <h3 className="text-2xl font-bold text-ink mb-4">Why We Started</h3>
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
          <div className="bg-ink text-ink-foreground rounded-2xl p-8">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mb-6">
              <FaRocket className="w-8 h-8 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
            <p className="text-white/70 leading-relaxed">
              To manufacture and distribute high-quality products that enhance the lives of our customers while
              building sustainable partnerships that drive economic growth across Kenya. We are committed to
              excellence in everything we do, from product development to customer service.
            </p>
          </div>

          <div className="bg-ink text-ink-foreground rounded-2xl p-8">
            <div className="w-16 h-16 bg-accent rounded-xl flex items-center justify-center mb-6">
              <FaEye className="w-8 h-8 text-accent-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
            <p className="text-white/70 leading-relaxed">
              To be East Africa's leading manufacturer and distributor of quality consumer products, recognized
              for our innovation, reliability, and contribution to sustainable economic development. We envision
              a future where Kenyan-made products are the preferred choice in regional and international markets.
            </p>
          </div>
        </div>
      )
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className={`relative py-20 bg-ink transition-all duration-1000 ${isLoaded ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <h1 className="text-5xl font-bold text-white mb-6 tracking-wide">About Rekker</h1>
          <div className="w-24 h-1 bg-primary mx-auto mb-8"></div>
          <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
            Building Kenya's future through quality manufacturing, trusted distribution, and innovative partnerships
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-16">
        {/* Navigation Tabs */}
        <div className={`flex justify-center mb-12 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
          <div className="bg-secondary rounded-2xl p-2 inline-flex">
            {Object.keys(tabContent).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === tab
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'text-gray-600 hover:text-ink'
                }`}
              >
                {tabContent[tab].title}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className={`max-w-6xl mx-auto transition-all duration-700 delay-500 ${isLoaded ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
          <div className="bg-white rounded-3xl shadow-xl border border-border p-12">
            <h2 className="text-3xl font-bold text-ink mb-8 text-center">
              {tabContent[activeTab].title}
            </h2>
            {tabContent[activeTab].content}
          </div>
        </div>

        {/* Company Timeline */}
        {activeTab === 'story' && (
          <div className={`mt-20 transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-ink mb-6">Our Journey</h2>
              <div className="w-24 h-1 bg-primary mx-auto"></div>
            </div>

            <div className="relative">
              {/* Timeline Line */}
              <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-primary/20 rounded-full"></div>

              <div className="space-y-12 lg:space-y-16">
                {milestones.map((milestone, index) => (
                  <div
                    key={index}
                    className={`relative flex items-center ${
                      index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                    }`}
                  >
                    {/* Timeline Node */}
                    <div className="hidden lg:flex absolute left-1/2 transform -translate-x-1/2 w-12 h-12 bg-primary rounded-full items-center justify-center shadow-lg z-10">
                      <milestone.icon className="w-6 h-6 text-primary-foreground" />
                    </div>

                    {/* Content */}
                    <div className={`w-full lg:w-5/12 ${index % 2 === 0 ? 'lg:pr-16' : 'lg:pl-16'}`}>
                      <div className="bg-white rounded-2xl shadow-lg border border-border p-8 hover:shadow-xl hover:border-primary/30 transition-shadow duration-300">
                        <div className="flex items-center mb-4 lg:hidden">
                          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-4">
                            <milestone.icon className="w-5 h-5 text-primary-foreground" />
                          </div>
                          <span className="text-2xl font-bold text-primary">{milestone.year}</span>
                        </div>
                        <div className="hidden lg:block mb-4">
                          <span className="text-2xl font-bold text-primary">{milestone.year}</span>
                        </div>
                        <h3 className="text-xl font-bold text-ink mb-3">{milestone.title}</h3>
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
            <h2 className="text-3xl font-bold text-ink mb-6">Our Values</h2>
            <div className="w-24 h-1 bg-accent mx-auto mb-8"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These core values guide every decision we make and every relationship we build
            </p>
          </div>

          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg border border-border p-8 hover:shadow-xl hover:border-primary/30 transition-all duration-300 transform hover:-translate-y-2 text-center group"
              >
                <div className="w-16 h-16 bg-secondary rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                  <value.icon className="w-8 h-8 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-bold text-ink mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className={`mt-20 transition-all duration-1000 delay-1000 ${isLoaded ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-ink mb-6">Certifications & Standards</h2>
            <div className="w-24 h-1 bg-primary mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {certifications.map((cert, index) => (
              <div
                key={index}
                className="bg-secondary rounded-2xl p-8 text-center border border-border hover:shadow-lg hover:border-accent/40 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-accent rounded-xl flex items-center justify-center mx-auto mb-4">
                  <cert.icon className="w-8 h-8 text-accent-foreground" />
                </div>
                <h3 className="text-lg font-bold text-ink mb-2">{cert.name}</h3>
                <p className="text-gray-600 text-sm">{cert.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Closing CTA */}
        <div className={`mt-20 transition-all duration-1000 delay-1000 ${isLoaded ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
          <div className="rounded-3xl bg-ink p-10 md:p-14 text-center text-ink-foreground">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Let's build something together</h2>
            <p className="text-white/70 max-w-2xl mx-auto mb-8">
              Whether you're a retailer, distributor, or supermarket chain — Rekker is ready to supply, manufacture and partner with you.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 font-bold text-primary-foreground transition-all hover:scale-105"
            >
              Get in touch
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
