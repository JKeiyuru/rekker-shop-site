/* eslint-disable react/no-unescaped-entities */
// pages/Contact.jsx - Updated with Red Theme
import { useState, useEffect } from "react";
import { 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope, 
  FaClock,
  FaBuilding,
  FaUsers,
  FaTruck,
  FaHandshake,
  FaPaperPlane,
  FaWhatsapp,
  FaLinkedin,
  FaTwitter
} from "react-icons/fa";

const Contact = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    subject: "",
    message: "",
    inquiryType: "general"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Thank you for your message. We'll get back to you within 24 hours.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        subject: "",
        message: "",
        inquiryType: "general"
      });
    }, 2000);
  };

  const contactInfo = [
    {
      icon: <FaMapMarkerAlt className="w-6 h-6" />,
      title: "Head Office",
      details: [
        "Rekker Limited",
        "Industrial Area, Nairobi",
        "P.O. Box 12345-00100",
        "Nairobi, Kenya"
      ]
    },
    {
      icon: <FaPhone className="w-6 h-6" />,
      title: "Phone Numbers",
      details: [
        "+254 115 766 838 (Main)",
        "+254 796 183 064 (Sales)",
        "+254 712 964 051 (Support)"
      ]
    },
    {
      icon: <FaEnvelope className="w-6 h-6" />,
      title: "Email Addresses",
      details: [
        "info@rekker.co.ke",
        "sales@rekker.co.ke",
        
      ]
    },
    {
      icon: <FaClock className="w-6 h-6" />,
      title: "Business Hours",
      details: [
        "Monday - Friday: 8:00 AM - 5:00 PM",
        "Saturday: 9:00 AM - 2:00 PM",
        "Sunday: Closed",
        "Public Holidays: Closed"
      ]
    }
  ];

  const departments = [
    {
      icon: <FaBuilding className="w-8 h-8 text-red-600" />,
      title: "General Inquiries",
      description: "Information about our company, products, and services",
      contact: "info@rekker.co.ke",
      phone: "+254 115 766 838"
    },
    {
      icon: <FaUsers className="w-8 h-8 text-rose-600" />,
      title: "Sales & Partnerships",
      description: "Wholesale orders, distribution partnerships, and bulk inquiries",
      contact: "sales@rekker.co.ke", 
      phone: "+254 796 183 064"
    },
    {
      icon: <FaTruck className="w-8 h-8 text-red-700" />,
      title: "Distribution Support",
      description: "Distributor support, logistics, and territory inquiries",
      contact: "distributors@rekker.co.ke",
      phone: "+254 712 964 051"
    },
    {
      icon: <FaHandshake className="w-8 h-8 text-rose-700" />,
      title: "Customer Support",
      description: "Product support, complaints, and customer service",
      contact: "support@rekker.co.ke",
      phone: "+254 712 964 051"
    }
  ];

  const inquiryTypes = [
    { value: "general", label: "General Inquiry" },
    { value: "sales", label: "Sales & Wholesale" },
    { value: "partnership", label: "Distribution Partnership" },
    { value: "support", label: "Customer Support" },
    { value: "careers", label: "Careers" },
    { value: "media", label: "Media & Press" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50/30 to-red-50/20">
      {/* Hero Section with Red Theme */}
      <div className={`relative py-20 bg-gradient-to-r from-red-900 via-rose-800 to-red-900 transition-all duration-1000 ${isLoaded ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-red-500/10 to-rose-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-rose-500/10 to-red-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <h1 className="text-5xl font-bold text-white mb-6">
            Contact Rekker
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-red-400 to-rose-400 mx-auto mb-8"></div>
          <p className="text-xl text-red-100 max-w-3xl mx-auto leading-relaxed">
            Ready to partner with Kenya's leading manufacturer and distributor? 
            Get in touch with our team for all your business needs.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-16">
            {/* Contact Form */}
            <div className={`lg:col-span-2 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-red-100">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-red-900 mb-4">Send us a Message</h2>
                  <p className="text-red-600">
                    Fill out the form below and our team will get back to you within 24 hours
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Inquiry Type */}
                  <div>
                    <label className="block text-red-800 font-medium mb-3">
                      Type of Inquiry
                    </label>
                    <select
                      name="inquiryType"
                      value={formData.inquiryType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      {inquiryTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Personal Information */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-red-800 font-medium mb-3">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-red-800 font-medium mb-3">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-red-800 font-medium mb-3">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="+254 700 123 456"
                      />
                    </div>
                    <div>
                      <label className="block text-red-800 font-medium mb-3">
                        Company/Organization
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Your company name"
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-red-800 font-medium mb-3">
                      Subject *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Brief subject of your inquiry"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-red-800 font-medium mb-3">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows="6"
                      className="w-full px-4 py-3 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-vertical"
                      placeholder="Please provide details about your inquiry..."
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-red-600 to-rose-600 text-white py-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <FaPaperPlane className="w-5 h-5" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Contact Information Sidebar */}
            <div className={`lg:col-span-1 space-y-8 transition-all duration-700 delay-500 ${isLoaded ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
              {/* Quick Contact */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-red-100">
                <h3 className="text-xl font-bold text-red-900 mb-6">Quick Contact</h3>
                <div className="space-y-6">
                  {contactInfo.map((info, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-red-600 flex-shrink-0">
                        {info.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-red-900 mb-2">{info.title}</h4>
                        <div className="space-y-1 text-sm text-red-600">
                          {info.details.map((detail, idx) => (
                            <p key={idx}>{detail}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-red-100">
                <h3 className="text-xl font-bold text-red-900 mb-6">Follow Us</h3>
                <div className="flex space-x-4">
                  <a href="#" className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 hover:bg-green-200 transition-colors">
                    <FaWhatsapp className="w-6 h-6" />
                  </a>
                  <a href="#" className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-blue-600 hover:bg-red-200 transition-colors">
                    <FaLinkedin className="w-6 h-6" />
                  </a>
                  <a href="#" className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-blue-700 hover:bg-red-200 transition-colors">
                    <FaTwitter className="w-6 h-6" />
                  </a>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-6 border border-red-200">
                <h3 className="text-xl font-bold text-red-900 mb-4">Emergency Contact</h3>
                <p className="text-red-600 mb-4">
                  For urgent matters outside business hours:
                </p>
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-red-900">+254 722 URGENT (864368)</p>
                  <p className="text-red-600">Available 24/7 for critical issues</p>
                </div>
              </div>
            </div>
          </div>

          {/* Departments Section */}
          <div className={`mt-20 transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-red-900 mb-6">Contact by Department</h2>
              <p className="text-xl text-red-600 max-w-3xl mx-auto">
                Connect directly with the right team for faster, more specialized assistance
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {departments.map((dept, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-center group border border-red-100">
                  <div className="w-16 h-16 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    {dept.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-red-900 mb-3">{dept.title}</h3>
                  <p className="text-red-600 text-sm mb-4">{dept.description}</p>
                  <div className="space-y-2 text-sm">
                    <a href={`mailto:${dept.contact}`} className="block text-red-600 hover:text-red-700">
                      {dept.contact}
                    </a>
                    <a href={`tel:${dept.phone}`} className="block text-red-700 hover:text-red-900">
                      {dept.phone}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Map Section */}
<div className="mt-20 bg-white rounded-2xl shadow-xl overflow-hidden border border-red-100">
  <div className="p-8">
    <h2 className="text-3xl font-bold text-red-900 mb-6 text-center">Find Our Office</h2>
    <div className="w-full rounded-lg overflow-hidden border border-red-100">
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.7968662808544!2d36.827142574737884!3d-1.2965215986911556!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f1117f519345f%3A0xa0cb226df575499f!2sCornells%20Brands!5e0!3m2!1sen!2ske!4v1771501944765!5m2!1sen!2ske"
        width="100%"
        height="450"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Cornells Brands Office Location"
        className="w-full"
      ></iframe>
    </div>
  </div>
</div>
        </div>
      </div>
    </div>
  );
};

export default Contact;