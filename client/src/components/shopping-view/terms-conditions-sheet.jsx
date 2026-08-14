/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileTextIcon } from "lucide-react";

const TermsAndConditionsSheet = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <FileTextIcon className="w-4 h-4" />
          Terms & Conditions
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-[600px]">
        <SheetHeader>
          <SheetTitle>Terms and Conditions</SheetTitle>
          <SheetDescription>
            By using Rekker Limited's website and services, you agree to these terms and conditions.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-120px)] pr-4">
          <div className="space-y-6 text-sm">
            <section>
              <h3 className="font-semibold text-base mb-3">1. Acceptance of Terms</h3>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using this website, you accept and agree to be bound by these Terms and Conditions. 
                If you do not agree to abide by these terms, please do not use this service. Your continued use of 
                our website constitutes your acceptance of these terms and any modifications we may make to them.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">2. Company Information</h3>
              <p className="text-gray-700 leading-relaxed mb-2">
                This website is operated by <strong>Rekker Limited</strong>, a registered company in Kenya. We are 
                committed to providing quality products including stationery, school supplies, kitchenware, toys, 
                and premium branded products under our Saffron and Cornells brands.
              </p>
              <div className="bg-red-50 p-4 rounded-lg mt-3">
                <p className="text-gray-800 font-semibold mb-2">Contact Information:</p>
                <p className="text-gray-700">
                  <strong>Rekker Limited</strong><br/>
                  Factory Street, Industrial Area<br/>
                  Address: 01 Factory Street<br/>
                  Nairobi, Kenya<br/>
                  Email: info@rekker.co.ke
                </p>
              </div>
              <p className="text-gray-700 leading-relaxed mt-3">
                We comply with all applicable Kenyan laws and regulations, including the Consumer Protection Act, 2012, 
                and Data Protection Act, 2019.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">3. Product Information and Availability</h3>
              <p className="text-gray-700 leading-relaxed mb-2">
                We strive to ensure that all product information on our website is accurate. However, we do not 
                warrant that product descriptions or other content is error-free, complete, or current.
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Product availability is subject to change without notice</li>
                <li>We reserve the right to discontinue any product at any time</li>
                <li>Prices are subject to change without prior notice</li>
                <li>All prices are displayed in Kenyan Shillings (KES) unless otherwise stated</li>
                <li>Product images are for illustration purposes and may vary slightly from actual items</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">4. Orders and Payment</h3>
              <p className="text-gray-700 leading-relaxed mb-2">
                When you place an order, you are making an offer to purchase products subject to these terms:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>All orders are subject to acceptance and availability</li>
                <li>We reserve the right to refuse or cancel any order for any reason</li>
                <li>Payment must be made in full before dispatch of goods</li>
                <li>We accept various payment methods as displayed at checkout</li>
                <li>All transactions are processed securely through encrypted payment gateways</li>
                <li>You will receive an order confirmation email upon successful payment</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">5. Delivery and Shipping</h3>
              <p className="text-gray-700 leading-relaxed mb-2">
                Rekker Limited delivers within Kenya and strives to meet estimated delivery times:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Delivery times are estimates and not guaranteed</li>
                <li>We deliver to all 47 counties in Kenya</li>
                <li>Risk of loss passes to you upon delivery</li>
                <li>We are not liable for delays caused by third-party delivery services or unforeseen circumstances</li>
                <li>Delivery charges will be clearly displayed before order confirmation</li>
                <li>You must inspect goods upon delivery and report any damage immediately</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">6. Returns and Refunds</h3>
              <p className="text-gray-700 leading-relaxed mb-2">
                In accordance with the Consumer Protection Act, 2012, and Rekker Limited's commitment to customer satisfaction:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Contact us at info@rekker.co.ke for any return or refund requests</li>
                <li>We will assess each case individually and provide appropriate solutions</li>
                <li>Products must be in original condition and packaging for returns</li>
                <li>Defective or damaged items will be replaced or refunded at our discretion</li>
                <li>Custom or personalized items may not be returnable</li>
                <li>We are committed to resolving all customer concerns fairly and promptly</li>
              </ul>
              <div className="bg-red-50 p-4 rounded-lg mt-3">
                <p className="text-gray-700 font-medium">
                  For all return and refund inquiries, please contact us at <strong>info@rekker.co.ke</strong> 
                  with your order details. Our customer service team will work with you to find a satisfactory solution.
                </p>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">7. Data Protection and Privacy</h3>
              <p className="text-gray-700 leading-relaxed mb-2">
                In compliance with Kenya's Data Protection Act, 2019, Rekker Limited is committed to protecting your personal information:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>We collect and process personal data only as necessary for our services</li>
                <li>Your data is stored securely and not shared with third parties without consent</li>
                <li>You have the right to access, correct, or delete your personal data</li>
                <li>We use cookies to improve user experience</li>
                <li>Your payment information is processed through secure, encrypted channels</li>
                <li>We retain your data only for as long as necessary to fulfill our obligations</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">8. Intellectual Property</h3>
              <p className="text-gray-700 leading-relaxed mb-2">
                All content on this website is protected by intellectual property rights:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>The Rekker, Saffron, and Cornells brand names and logos are trademarks of Rekker Limited</li>
                <li>All text, graphics, images, and software are owned by Rekker Limited or our licensors</li>
                <li>You may not reproduce, distribute, or create derivative works without our express written permission</li>
                <li>Product images and descriptions are for display purposes only</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">9. User Conduct</h3>
              <p className="text-gray-700 leading-relaxed mb-2">
                You agree not to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Use the website for any unlawful purpose</li>
                <li>Attempt to gain unauthorized access to our systems or databases</li>
                <li>Interfere with the website's operation or security</li>
                <li>Upload malicious code, viruses, or harmful content</li>
                <li>Violate any applicable Kenyan laws or regulations</li>
                <li>Impersonate any person or entity</li>
                <li>Engage in fraudulent activities</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">10. Product Quality and Warranties</h3>
              <p className="text-gray-700 leading-relaxed mb-2">
                Rekker Limited is committed to quality:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Our Rekker-branded products meet Kenyan and international quality standards</li>
                <li>Saffron products are manufactured by Rekker Limited under strict quality control</li>
                <li>Cornells products are distributed by Rekker Limited and manufactured by Starling Parfums</li>
                <li>Manufacturer warranties apply where specified</li>
                <li>We stand behind the quality of our products</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">11. Limitation of Liability</h3>
              <p className="text-gray-700 leading-relaxed">
                Subject to applicable Kenyan law, our liability is limited to the maximum extent permitted. We are not 
                liable for indirect, incidental, or consequential damages arising from your use of our products or services. 
                Our total liability shall not exceed the amount you paid for the specific product or service in question.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">12. Age Restrictions</h3>
              <p className="text-gray-700 leading-relaxed">
                Our website is intended for users 18 years and older. Minors may use the website only with 
                parental supervision and consent. Parents are responsible for monitoring their children's 
                online activities and purchases.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">13. Governing Law and Dispute Resolution</h3>
              <p className="text-gray-700 leading-relaxed mb-2">
                These terms are governed by the laws of the Republic of Kenya:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Any disputes will be subject to the exclusive jurisdiction of Kenyan courts</li>
                <li>We encourage resolving disputes through direct communication first</li>
                <li>Contact info@rekker.co.ke with any concerns</li>
                <li>We comply with all applicable Kenyan consumer protection and data privacy laws</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">14. Changes to Terms</h3>
              <p className="text-gray-700 leading-relaxed">
                Rekker Limited reserves the right to modify these terms at any time. Changes will be posted on this page 
                with an updated effective date. Your continued use of the website after changes are posted 
                constitutes acceptance of the modified terms. We recommend reviewing these terms periodically.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">15. Contact Information</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                If you have any questions about these Terms and Conditions, or need assistance with orders, 
                returns, or any other matter, please contact us:
              </p>
              <div className="bg-gradient-to-r from-red-50 to-rose-50 p-5 rounded-lg border border-red-200">
                <p className="text-gray-800 font-bold mb-3 text-base">Rekker Limited</p>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Address:</strong> Factory Street, Industrial Area, Nairobi</p>
                  <p><strong>Physical Location:</strong> 01 Factory Street</p>
                  <p><strong>Email:</strong> <a href="mailto:info@rekker.co.ke" className="text-red-600 hover:underline font-semibold">info@rekker.co.ke</a></p>
                  <p><strong>Website:</strong> <a href="https://rekker.co.ke" className="text-red-600 hover:underline font-semibold">www.rekker.co.ke</a></p>
                </div>
                <p className="text-gray-600 text-sm mt-4 italic">
                  We are committed to addressing your concerns and ensuring compliance with all applicable laws.
                  Our customer service team will respond to your inquiries promptly.
                </p>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">16. Our Brands</h3>
              <div className="space-y-3">
                <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-600">
                  <p className="font-bold text-gray-900 mb-1">Rekker Products</p>
                  <p className="text-gray-700 text-sm">
                    Our core range includes stationery, school bags, toys, kitchenware, padlocks, party items, 
                    and educational supplies. All Rekker products are manufactured or sourced to meet high quality standards.
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-600">
                  <p className="font-bold text-gray-900 mb-1">Saffron Brand - Manufactured by Rekker</p>
                  <p className="text-gray-700 text-sm">
                    Our Saffron brand includes handwashes, dishwashing liquids, liquid detergents, shower gels, 
                    and after-shave products. All Saffron products are proudly manufactured in Kenya by Rekker Limited.
                  </p>
                </div>
                <div className="bg-rose-50 p-4 rounded-lg border-l-4 border-rose-600">
                  <p className="font-bold text-gray-900 mb-1">Cornells Brand - Distributed by Rekker</p>
                  <p className="text-gray-700 text-sm">
                    Rekker Limited is the exclusive distributor of Cornells products in Kenya. Cornells offers 
                    premium lotions, sunscreens, toners, and beauty care products manufactured by Starling Parfums.
                  </p>
                </div>
              </div>
            </section>

            <section className="border-t pt-6">
              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                <strong>Last Updated:</strong> January 2025<br/>
                <strong>Effective Date:</strong> January 2025<br/>
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 font-medium mb-2">
                  By continuing to use this website, you acknowledge that you have read, understood, and agree 
                  to be bound by these Terms and Conditions.
                </p>
                <p className="text-xs text-gray-600">
                  These terms constitute the entire agreement between you and Rekker Limited concerning your use 
                  of this website and supersede any prior agreements or understandings.
                </p>
              </div>
            </section>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default TermsAndConditionsSheet;