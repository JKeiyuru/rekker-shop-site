/* eslint-disable react/no-unescaped-entities */
// pages/Distributors.jsx
import { useState, useEffect } from "react";
import { 
  FaMapMarkerAlt, 
  FaStore, 
  FaHandshake, 
  FaChartLine,
  FaUsers,
  FaTruck,
  FaGlobe,
  FaArrowRight,
  FaPhone,
  FaEnvelope,
  FaStar,
  FaAward
} from "react-icons/fa";
import { Link } from "react-router-dom";

const Distributors = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeRegion, setActiveRegion] = useState(0);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const regions = [
    {
      id: 1,
      name: "Nairobi & Central",
      coverage: "Nairobi, Kiambu, Murang'a, Nyeri, Kirinyaga",
      distributors: 15,
      outlets: 450,
      description: "Our primary distribution hub covering the capital and central Kenya region with the highest density of retail outlets."
    },
    {
      id: 2,
      name: "Coast Region",
      coverage: "Mombasa, Kilifi, Kwale, Lamu, Tana River",
      distributors: 8,
      outlets: 280,
      description: "Strategic coastal distribution network serving major tourist areas and local communities."
    },
    {
      id: 3,
      name: "Western Kenya",
      coverage: "Kisumu, Eldoret, Kakamega, Bungoma, Busia",
      distributors: 12,
      outlets: 320,
      description: "Comprehensive western Kenya coverage including major agricultural and commercial centers."
    },
    {
      id: 4,
      name: "Northern & Eastern",
      coverage: "Meru, Isiolo, Garissa, Wajir, Mandera",
      distributors: 6,
      outlets: 150,
      description: "Expanding network in northern and eastern regions with focus on growing urban centers."
    }
  ];

  const distributorBenefits = [
    {
      icon: <FaChartLine className="w-8 h-8" />,
      title: "Profitable Margins",
      description: "Competitive wholesale pricing with attractive profit margins for sustainable business growth."
    },
    {
      icon: <FaUsers className="w-8 h-8" />,
      title: "Marketing Support",
      description: "Comprehensive marketing materials, training programs, and promotional support."
    },
    {
      icon: <FaTruck className="w-8 h-8" />,
      title: "Logistics Support",
      description: "Efficient distribution network with reliable delivery schedules and inventory management."
    },
    {
      icon: <FaHandshake className="w-8 h-8" />,
      title: "Partnership Programs",
      description: "Flexible partnership models tailored to different business sizes and market requirements."
    }
  ];

  const topDistributors = [
    {
      name: "Metro Supplies Ltd",
      location: "Nairobi",
      yearsActive: 8,
      specialization: "Stationery & Office Supplies",
      rating: 4.9,
      outlets: 45
    },
    {
      name: "Coast Distribution Co",
      location: "Mombasa", 
      yearsActive: 6,
      specialization: "Personal Care & Household",
      rating: 4.8,
      outlets: 38
    },
    {
      name: "Western Traders",
      location: "Kisumu",
      yearsActive: 10,
      specialization: "General Merchandise",
      rating: 4.9,
      outlets: 52
    },
    {
      name: "Highland Distributors",
      location: "Eldoret",
      yearsActive: 5,
      specialization: "Educational & Toys",
      rating: 4.7,
      outlets: 29
    }
  ];

  const requirements = [
    {
      title: "Business Registration",
      description: "Valid business registration certificate and tax compliance documentation"
    },
    {
      title: "Minimum Investment",
      description: "Initial stock investment starting from KSh 500,000 depending on territory size"
    },
    {
      title: "Storage Facility",
      description: "Adequate warehouse space for inventory management and distribution"
    },
    {
      title: "Market Experience",
      description: "Proven track record in retail/wholesale distribution or related business"
    },
    {
      title: "Territory Commitment", 
      description: "Commitment to actively develop and serve the assigned territory"
    }
  ];

  const steps = [
    {
      step: "01",
      title: "Application",
      description: "Submit distributor application with required business documentation"
    },
    {
      step: "02", 
      title: "Evaluation",
      description: "Business assessment and territory analysis by our partnerships team"
    },
    {
      step: "03",
      title: "Agreement",
      description: "Finalize distribution agreement and territory allocation"
    },
    {
      step: "04",
      title: "Launch",
      description: "Initial stock delivery, training, and market launch support"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-green-50/20">
      {/* Hero Section */}
      <div className={`relative py-20 bg-gradient-to-r from-blue-900 via-teal-800 to-blue-900 transition-all duration-1000 ${isLoaded ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-green-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-teal-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <h1 className="text-5xl font-bold text-white mb-6">
            Distribution Network
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-green-400 mx-auto mb-8"></div>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed mb-8">
            Partner with Rekker's extensive distribution network spanning across Kenya. 
            Join our network of successful distributors and grow your business with us.
          </p>
          
          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">47</div>
              <div className="text-gray-200">Counties Covered</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">41</div>
              <div className="text-gray-200">Active Distributors</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">1,200+</div>
              <div className="text-gray-200">Retail Outlets</div>
            </div>
          </div>
        </div>
      </div>

      {/* Regional Coverage */}
      <div className={`container mx-auto px-6 py-20 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Regional Coverage</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Strategic distribution network ensuring nationwide reach and local market expertise
            </p>
          </div>

          {/* Region Selector */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {regions.map((region, index) => (
              <button
                key={region.id}
                onClick={() => setActiveRegion(index)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  activeRegion === index
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
                }`}
              >
                {region.name}
              </button>
            ))}
          </div>

          {/* Active Region Details */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  {regions[activeRegion].name}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {regions[activeRegion].description}
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <FaUsers className="w-6 h-6 text-blue-600" />
                    <span className="text-2xl font-bold text-gray-900">
                      {regions[activeRegion].distributors}
                    </span>
                  </div>
                  <div className="text-gray-600">Active Distributors</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <FaStore className="w-6 h-6 text-green-600" />
                    <span className="text-2xl font-bold text-gray-900">
                      {regions[activeRegion].outlets}
                    </span>
                  </div>
                  <div className="text-gray-600">Retail Outlets</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-gray-700">
                  <FaMapMarkerAlt className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">Coverage Areas:</span>
                </div>
                <p className="text-gray-600 pl-6">{regions[activeRegion].coverage}</p>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-blue-100 to-green-100 rounded-3xl overflow-hidden shadow-xl">
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <FaGlobe className="w-24 h-24 mx-auto mb-4" />
                    <p className="text-lg">Interactive Map</p>
                    <p className="text-sm">Coming Soon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Distributors */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Top Distributors</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Meet some of our most successful distribution partners across different regions
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {topDistributors.map((distributor, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaAward className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {distributor.name}
                    </h3>
                    <div className="flex items-center justify-center space-x-1 mb-2">
                      <FaMapMarkerAlt className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">{distributor.location}</span>
                    </div>
                    <div className="flex items-center justify-center space-x-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={`w-4 h-4 ${i < Math.floor(distributor.rating) ? 'text-yellow-400' : 'text-gray-300'}`} />
                      ))}
                      <span className="text-sm text-gray-600 ml-2">{distributor.rating}</span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Years Active:</span>
                        <span className="font-medium">{distributor.yearsActive}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Outlets:</span>
                        <span className="font-medium">{distributor.outlets}</span>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <span className="text-xs text-blue-600 font-medium">
                          {distributor.specialization}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Distributor Benefits */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Why Partner with Rekker?</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Join our network and benefit from our comprehensive support system designed for distributor success
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {distributorBenefits.map((benefit, index) => (
                <div key={index} className="bg-white rounded-xl p-8 text-center hover:shadow-lg transition-all duration-300 group">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-green-100 rounded-xl flex items-center justify-center mx-auto mb-6 text-blue-600 group-hover:scale-110 transition-transform duration-300">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{benefit.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Become a Distributor */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Become a Distributor</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Ready to join our successful distribution network? Here's what you need to know
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-16">
              {/* Requirements */}
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-8">Requirements</h3>
                <div className="space-y-6">
                  {requirements.map((requirement, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">{requirement.title}</h4>
                        <p className="text-gray-600">{requirement.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Process Steps */}
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-8">Application Process</h3>
                <div className="space-y-6">
                  {steps.map((step, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                        {step.step}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">{step.title}</h4>
                        <p className="text-gray-600">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center mt-16">
              <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h3>
                <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                  Submit your application today and our partnerships team will contact you within 48 hours
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/wholesale-request"
                    className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <span>Apply Now</span>
                    <FaArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/contact"
                    className="inline-flex items-center justify-center space-x-2 border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold hover:border-blue-400 hover:text-blue-600 transition-all duration-300"
                  >
                    <span>Contact Us</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-gradient-to-r from-blue-900 to-teal-800 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">Get in Touch</h2>
            <p className="text-xl text-gray-200 mb-12">
              Have questions about becoming a distributor? Our partnerships team is here to help
            </p>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center">
                <FaPhone className="w-8 h-8 text-white mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Phone</h3>
                <p className="text-gray-200">+254 700 123 456</p>
                <p className="text-gray-200">+254 711 987 654</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center">
                <FaEnvelope className="w-8 h-8 text-white mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Email</h3>
                <p className="text-gray-200">distributors@rekker.co.ke</p>
                <p className="text-gray-200">partnerships@rekker.co.ke</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Distributors;