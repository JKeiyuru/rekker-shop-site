// pages/Services.jsx
import { useState, useEffect } from "react";
import { 
  FaCog, 
  FaIndustry, 
  FaTruck, 
  FaHandshake, 
  FaChartLine, 
  FaCertificate,
  FaUsers,
  FaGlobe,
  FaCheckCircle,
  FaArrowRight
} from "react-icons/fa";
import { Link } from "react-router-dom";

const Services = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeService, setActiveService] = useState(0);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const services = [
    {
      id: 1,
      icon: <FaIndustry className="w-8 h-8" />,
      title: "Manufacturing Services",
      subtitle: "Premium Product Manufacturing",
      description: "State-of-the-art manufacturing facilities producing high-quality products under our Saffron brand. ISO certified processes ensuring consistent quality and reliability.",
      features: [
        "ISO 9001:2015 Certified Manufacturing",
        "Quality Control at Every Stage",
        "Custom Formulation Development",
        "Flexible Production Volumes",
        "Private Label Manufacturing"
      ],
      image: "/manufacturing.jpg"
    },
    {
      id: 2,
      icon: <FaTruck className="w-8 h-8" />,
      title: "Distribution Network",
      subtitle: "Nationwide Distribution Excellence",
      description: "Comprehensive distribution network covering all major cities and towns in Kenya. Efficient logistics and warehousing solutions for timely delivery.",
      features: [
        "47 Counties Coverage",
        "Cold Chain Management",
        "Real-time Tracking",
        "Bulk Distribution",
        "Last Mile Delivery"
      ],
      image: "/distribution.jpg"
    },
    {
      id: 3,
      icon: <FaHandshake className="w-8 h-8" />,
      title: "Partnership Programs",
      subtitle: "Strategic Business Partnerships",
      description: "Exclusive partnership opportunities for retailers, wholesalers, and distributors. Comprehensive support and competitive margins.",
      features: [
        "Exclusive Territory Rights",
        "Marketing Support",
        "Training Programs",
        "Flexible Payment Terms",
        "Volume Incentives"
      ],
      image: "/partnership.jpg"
    },
    {
      id: 4,
      icon: <FaCog className="w-8 h-8" />,
      title: "Private Labeling",
      subtitle: "Custom Brand Solutions",
      description: "Complete private labeling services for businesses looking to launch their own product lines. From formulation to packaging.",
      features: [
        "Custom Formulation",
        "Brand Design Support",
        "Regulatory Compliance",
        "Minimum Order Flexibility",
        "Market Research Support"
      ],
      image: "/private-label.jpg"
    }
  ];

  const capabilities = [
    {
      icon: <FaChartLine className="w-6 h-6 text-blue-600" />,
      title: "Market Leadership",
      description: "Over 15 years of market experience with established brand presence"
    },
    {
      icon: <FaCertificate className="w-6 h-6 text-green-600" />,
      title: "Quality Certified",
      description: "ISO certified facilities ensuring international quality standards"
    },
    {
      icon: <FaUsers className="w-6 h-6 text-purple-600" />,
      title: "Expert Team",
      description: "Dedicated professionals with deep industry expertise"
    },
    {
      icon: <FaGlobe className="w-6 h-6 text-teal-600" />,
      title: "Regional Presence",
      description: "Strong distribution network across East Africa"
    }
  ];

  const processSteps = [
    {
      step: "01",
      title: "Consultation",
      description: "Initial consultation to understand your specific requirements and business goals."
    },
    {
      step: "02",
      title: "Solution Design",
      description: "Custom solution design tailored to your market needs and objectives."
    },
    {
      step: "03",
      title: "Implementation",
      description: "Professional implementation with dedicated project management support."
    },
    {
      step: "04",
      title: "Ongoing Support",
      description: "Continuous support and optimization to ensure long-term success."
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
            Professional Services
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-green-400 mx-auto mb-8"></div>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
            Comprehensive business solutions designed to help you succeed in the competitive market. 
            From manufacturing to distribution, we provide end-to-end services.
          </p>
        </div>
      </div>

      {/* Services Navigation */}
      <div className={`bg-white shadow-lg sticky top-0 z-40 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'}`}>
        <div className="container mx-auto px-6">
          <div className="flex overflow-x-auto scrollbar-hide">
            {services.map((service, index) => (
              <button
                key={service.id}
                onClick={() => setActiveService(index)}
                className={`flex-shrink-0 px-6 py-4 text-sm font-medium transition-all duration-300 border-b-2 ${
                  activeService === index
                    ? 'text-blue-600 border-blue-600 bg-blue-50'
                    : 'text-gray-600 border-transparent hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {service.icon}
                  <span className="whitespace-nowrap">{service.title}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Service Details */}
      <div className={`container mx-auto px-6 py-16 transition-all duration-700 delay-500 ${isLoaded ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Service Content */}
            <div className="space-y-8">
              <div>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-green-100 rounded-xl flex items-center justify-center text-blue-600">
                    {services[activeService].icon}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      {services[activeService].title}
                    </h2>
                    <p className="text-blue-600 font-medium">
                      {services[activeService].subtitle}
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {services[activeService].description}
                </p>
              </div>

              {/* Service Features */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Key Features</h3>
                <div className="space-y-4">
                  {services[activeService].features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <FaCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4">
                <Link
                  to="/wholesale-request"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  <span>Get Started</span>
                  <FaArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center space-x-2 border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold hover:border-blue-400 hover:text-blue-600 transition-all duration-300"
                >
                  <span>Learn More</span>
                </Link>
              </div>
            </div>

            {/* Service Image */}
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-blue-100 to-green-100 rounded-3xl overflow-hidden shadow-2xl">
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <FaIndustry className="w-24 h-24 mx-auto mb-4" />
                    <p className="text-lg">Service Image</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white rounded-2xl shadow-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">15+</div>
                  <div className="text-sm text-gray-600">Years Experience</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Capabilities Section */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Capabilities</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Leveraging years of experience and cutting-edge technology to deliver exceptional results
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {capabilities.map((capability, index) => (
                <div key={index} className="text-center p-6 rounded-xl hover:shadow-lg transition-all duration-300 group">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    {capability.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{capability.title}</h3>
                  <p className="text-gray-600">{capability.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Process Section */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Process</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                A systematic approach to ensure successful project delivery and long-term partnerships
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {processSteps.map((step, index) => (
                <div key={index} className="relative">
                  <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-lg mb-4">
                      {step.step}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                  {index < processSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <FaArrowRight className="w-6 h-6 text-gray-300" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-900 to-teal-800 py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Partner with Rekker?
            </h2>
            <p className="text-xl text-gray-200 mb-8">
              Join hundreds of successful businesses who trust Rekker for their manufacturing and distribution needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/wholesale-request"
                className="inline-flex items-center justify-center space-x-2 bg-white text-blue-900 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
              >
                <span>Start Partnership</span>
                <FaArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center space-x-2 border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-900 transition-all duration-300"
              >
                <span>Contact Us</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;