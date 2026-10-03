// Starter FAQ answers. Admin can edit/delete all of them in Admin → Chat & FAQs.
// They only use facts the shop itself shows (checkout options, pages), so
// nothing here promises a delivery time, price or policy that isn't true.
module.exports = [
  { question: "How do I pay for my order?", keywords: ["pay", "payment", "mpesa", "m-pesa", "card", "visa", "airtel", "cash"],
    answer: "At checkout you can pay online with M-Pesa, card or Airtel Money, or choose Cash on Delivery and pay when your order arrives." },
  { question: "How much is delivery?", keywords: ["delivery", "deliver", "shipping", "fee", "cost", "free"],
    answer: "Delivery depends on where you are. Pick your county and area at checkout and the exact fee (or FREE delivery) is shown before you pay." },
  { question: "How do I track my order?", keywords: ["track", "tracking", "where", "order", "status", "arrive", "arrived"],
    answer: "Tap “Where's my order?” in this chat while logged in to see your latest orders and their status, or open My Account → Orders." },
  { question: "How do I use a discount code?", keywords: ["discount", "code", "promo", "coupon", "voucher", "influencer", "offer"],
    answer: "Add your items to the cart, go to checkout and type the code in the “Discount code” box, then tap Apply. Some codes only work on selected products." },
  { question: "Can I return or exchange a product?", keywords: ["return", "refund", "exchange", "damaged", "wrong", "faulty", "money back"],
    answer: "If something arrives damaged or isn't what you ordered, message us on WhatsApp with your order number and a photo and our team will sort it out." },
  { question: "Are your products original?", keywords: ["original", "authentic", "genuine", "fake", "real"],
    answer: "Yes. Rekker manufactures and distributes these brands in Kenya, so everything you order comes straight from us." },
  { question: "I want to buy in bulk / stock your products in my shop", keywords: ["wholesale", "bulk", "stockist", "retail", "reseller", "distributor", "trade", "supply"],
    answer: "We'd love to work with you. Fill in the short wholesale form and our trade team will contact you with pricing.", link: "/wholesale", linkLabel: "Open wholesale form" },
  { question: "Do you have bundle deals?", keywords: ["bundle", "deal", "deals", "pack", "set", "save", "cheaper"],
    answer: "Yes — our bundle deals let you buy products together for less than buying them separately.", link: "/deals", linkLabel: "See bundle deals" },
  { question: "How can I contact you?", keywords: ["contact", "phone", "call", "email", "reach", "speak", "human", "agent", "person", "talk"],
    answer: "Tap “Talk to a person” below to chat with our team on WhatsApp, or use the contact page.", link: "/contact", linkLabel: "Contact page" },
  { question: "Which brands do you sell?", keywords: ["brand", "brands", "cornells", "saffron", "bio saff", "biosaff", "rekker"],
    answer: "We sell Rekker, Saffron Milan, Cornells and Bio Saff. Use the Brand filter on the products page to browse each one.", link: "/products", linkLabel: "Browse products" },
];
