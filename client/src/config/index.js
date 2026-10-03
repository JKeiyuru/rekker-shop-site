/* eslint-disable no-dupe-keys */
// client/src/config/index.js - Rekker Configuration with UNIQUE Subcategory IDs
export const registerFormControls = [
  {
    name: "userName",
    label: "User Name",
    placeholder: "Enter your user name",
    componentType: "input",
    type: "text",
  },
  {
    name: "email",
    label: "Email",
    placeholder: "Enter your email",
    componentType: "input",
    type: "email",
  },
  {
    name: "password",
    label: "Password",
    placeholder: "Enter your password",
    componentType: "input",
    type: "password",
  },
];

export const loginFormControls = [
  {
    name: "email",
    label: "Email",
    placeholder: "Enter your email",
    componentType: "input",
    type: "email",
  },
  {
    name: "password",
    label: "Password",
    placeholder: "Enter your password",
    componentType: "input",
    type: "password",
  },
];

// Brand Options
export const brandOptions = [
  { id: "rekker", label: "Rekker" },
  { id: "saffron", label: "Saffron" },
  { id: "cornells", label: "Cornells" },
  { id: "biosaff", label: "Bio Saff" },
];

// REKKER CATEGORIES - NO SUBCATEGORIES
export const rekkerCategories = [
  { id: "stationery", label: "Stationery" },
  { id: "bags-suitcases", label: "Bags & Suitcases" },
  { id: "toys", label: "Toys" },
  { id: "kitchenware", label: "Kitchenware" },
  { id: "padlocks", label: "Padlocks" },
  { id: "stuffed-toys", label: "Teddy Bears & Stuffed Toys" },
  { id: "party-items", label: "Party Items" },
  { id: "educational", label: "Educational Items" },
];

// SAFFRON CATEGORIES WITH SUBCATEGORIES - UNIQUE IDs
export const saffronCategories = [
  {
    id: "home-care-hygiene",
    label: "Home Care & Hygiene",
    subcategories: [
      { id: "home-care-hygiene-handwash", label: "Handwash" },
      { id: "home-care-hygiene-dishwashing", label: "Dishwashing Liquid" },
      { id: "home-care-hygiene-detergent", label: "Liquid Detergent" },
    ]
  },
  {
    id: "beauty-body-care", 
    label: "Beauty & Body Care",
    subcategories: [
      { id: "beauty-body-care-shower-gel", label: "Shower Gels" },
      { id: "beauty-body-care-aftershave", label: "After-Shave Anti-Bump" },
    ]
  },
];

// CORNELLS CATEGORIES WITH UNIQUE SUBCATEGORY IDs
export const cornellsCategories = [
  {
    id: "super-foods",
    label: "Super Foods",
    subcategories: [
      { id: "super-foods-shampoo", label: "Shampoo" },
      { id: "super-foods-conditioner", label: "Conditioner" },
      { id: "super-foods-hair-mask", label: "Hair Mask" },
      { id: "super-foods-hair-serum", label: "Hair Serum" },
      { id: "super-foods-shower-gel", label: "Shower Gel" },
      { id: "super-foods-body-lotion", label: "Body Lotion" },
      { id: "super-foods-body-scrub", label: "Body Scrub" },
      { id: "super-foods-facial-scrub", label: "Facial Scrub" },
      { id: "super-foods-facial-mask", label: "Facial Mask" },
      { id: "super-foods-face-wash", label: "Face Wash" },
      { id: "super-foods-facial-cream", label: "Facial Cream" },
      { id: "super-foods-baby-care", label: "Baby Care" },
      { id: "super-foods-gift-sets", label: "Gift Sets" },
    ]
  },
  {
    id: "dark-beautiful",
    label: "Dark & Beautiful",
    subcategories: [
      { id: "dark-beautiful-shampoo", label: "Shampoo" },
      { id: "dark-beautiful-conditioner", label: "Conditioner" },
      { id: "dark-beautiful-styling-products", label: "Styling Products" },
      { id: "dark-beautiful-hair-treatments", label: "Hair Treatments" },
      { id: "dark-beautiful-oils-serums", label: "Oils & Serums" },
      { id: "dark-beautiful-kids-hair-care", label: "Kids Hair Care" },
    ]
  },
  {
    id: "bold-beautiful",
    label: "Bold & Beautiful", 
    subcategories: [
      { id: "bold-beautiful-shampoo", label: "Shampoo" },
      { id: "bold-beautiful-conditioner", label: "Conditioner" },
      { id: "bold-beautiful-body-cream", label: "Body Cream" },
      { id: "bold-beautiful-body-lotion", label: "Body Lotion" },
      { id: "bold-beautiful-shower-gel", label: "Shower Gel" },
      { id: "bold-beautiful-body-scrub", label: "Body Scrub" },
      { id: "bold-beautiful-shower-scrub", label: "Shower Scrub" },
      { id: "bold-beautiful-hand-body-lotion", label: "Hand & Body Lotion" },
      { id: "bold-beautiful-body-butter", label: "Body Butter" },
      { id: "bold-beautiful-body-oil", label: "Body Oil" },
      { id: "bold-beautiful-moisturizer", label: "Moisturizer" },
      { id: "bold-beautiful-sugar-scrub", label: "Sugar Scrub" },
      { id: "bold-beautiful-facial-care", label: "Facial Care" },
      { id: "bold-beautiful-serums", label: "Serums" },
      { id: "bold-beautiful-deodorant", label: "Anti-Perspirant" },
      { id: "bold-beautiful-day-night-cream", label: "Day & Night Cream" },
    ]
  },
  {
    id: "cute-pretty",
    label: "Cute & Pretty",
    subcategories: [
      { id: "cute-pretty-shampoo", label: "Shampoo" },
      { id: "cute-pretty-conditioner", label: "Conditioner" },
      { id: "cute-pretty-baby-wash-shampoo", label: "Baby Wash & Shampoo" },
      { id: "cute-pretty-baby-lotion", label: "Baby Lotion" },
      { id: "cute-pretty-baby-oil", label: "Baby Oil" },
      { id: "cute-pretty-baby-cream", label: "Baby Cream" },
      { id: "cute-pretty-nappy-rash-cream", label: "Nappy Rash Cream" },
      { id: "cute-pretty-kids-shampoo", label: "Kids Shampoo" },
      { id: "cute-pretty-kids-conditioner", label: "Kids Conditioner" },
      { id: "cute-pretty-kids-styling", label: "Kids Styling Products" },
      { id: "cute-pretty-kids-treatments", label: "Kids Hair Treatments" },
    ]
  },
];

// BIO SAFF CATEGORIES - NO SUBCATEGORIES
export const biosaffCategories = [
  { id: "hair-mousse", label: "Hair Mousse & Styling" },
  { id: "braid-edge-care", label: "Braid & Edge Care" },
  { id: "shampoos-treatments", label: "Shampoos & Treatments" },
  { id: "body-mists", label: "Body Mists" },
  { id: "hair-mists", label: "Hair Mists" },
  { id: "curl-activator", label: "Curl Activator" },
  { id: "leave-in-conditioners", label: "Leave-In Conditioners" },
];

// HELPER FUNCTION: Get categories by brand
export function getCategoriesByBrand(brand) {
  if (brand === "rekker") {
    return rekkerCategories;
  } else if (brand === "saffron") {
    return saffronCategories;
  } else if (brand === "cornells") {
    return cornellsCategories;
  } else if (brand === "biosaff") {
    return biosaffCategories;
  }
  return [];
}

// HELPER FUNCTION: Get subcategories by brand and category
export function getSubcategories(brand, category) {
  if (brand === "saffron") {
    const cat = saffronCategories.find(c => c.id === category);
    return cat ? cat.subcategories : [];
  } else if (brand === "cornells") {
    const cat = cornellsCategories.find(c => c.id === category);
    return cat ? cat.subcategories : [];
  }
  return [];
}

// Add Product Form Elements
export const addProductFormElements = [
  {
    label: "Brand",
    name: "brand",
    componentType: "combo",
    options: brandOptions,
    placeholder: "Select an existing brand, or type a new one",
    required: true,
  },
  {
    label: "Title",
    name: "title",
    componentType: "input",
    type: "text",
    placeholder: "Enter product title",
    required: true,
  },
  {
    label: "Description",
    name: "description",
    componentType: "textarea",
    placeholder: "Enter product description",
  },
  {
    label: "Category",
    name: "category",
    componentType: "select-dynamic",
    options: [],
    placeholder: "Select an existing category, or type a new one",
    required: true,
  },
  {
    label: "Subcategory",
    name: "subcategory",
    componentType: "select-dynamic",
    options: [],
    placeholder: "Optional — select or type a new subcategory",
  },
  {
    label: "Price",
    name: "price",
    componentType: "input",
    type: "number",
    placeholder: "Enter product price (KES)",
    required: true,
  },
  {
    label: "Sale Price",
    name: "salePrice",
    componentType: "input",
    type: "number",
    placeholder: "Enter sale price (optional)",
  },
  {
    label: "Total Stock",
    name: "totalStock",
    componentType: "input",
    type: "number",
    placeholder: "Enter total stock",
    required: true,
  },
];

// Shopping View Header Menu Items
export const shoppingViewHeaderMenuItems = [
  {
    id: "home",
    label: "Home",
    path: "/",
  },
  {
    id: "about",
    label: "About",
    path: "/about",
  },
  {
    id: "deals",
    label: "Deals",
    path: "/deals",
  },
  {
    id: "wholesale",
    label: "Wholesale",
    path: "/wholesale",
  },
  {
    id: "services",
    label: "Services",
    path: "/services",
  },
  {
    id: "contact",
    label: "Contact",
    path: "/contact",
  },
];

// CATEGORY OPTIONS MAP
export const categoryOptionsMap = {
  // Standard shop categories (brand-independent)
  "hair-care": "Hair Care",
  "body-care": "Body Care",
  "face-skin-care": "Face & Skin Care",
  "baby-kids": "Baby & Kids",
  "home-care-hygiene": "Home Care & Hygiene",
  "mens-care": "Men's Care",
  "gift-sets": "Gift Sets",
  "stationery": "Stationery & School",
  "toys-games": "Toys & Games",
  "kitchenware": "Kitchen & Dining",
  "bags-luggage": "Bags & Luggage",
  "hardware-security": "Hardware & Security",
  "party-items": "Party & Celebration",
  "uncategorised": "Uncategorised",
  // Rekker
  "stationery": "Stationery",
  "bags-suitcases": "Bags & Suitcases", 
  "toys": "Toys",
  "kitchenware": "Kitchenware",
  "padlocks": "Padlocks",
  "stuffed-toys": "Teddy Bears & Stuffed Toys",
  "party-items": "Party Items",
  "educational": "Educational Items",
  
  // Saffron
  "home-care-hygiene": "Home Care & Hygiene",
  "beauty-body-care": "Beauty & Body Care",
  
  // Cornells
  "super-foods": "Super Foods",
  "dark-beautiful": "Dark & Beautiful",
  "bold-beautiful": "Bold & Beautiful", 
  "cute-pretty": "Cute & Pretty",

  // Bio Saff
  "hair-mousse": "Hair Mousse & Styling",
  "braid-edge-care": "Braid & Edge Care",
  "shampoos-treatments": "Shampoos & Treatments",
  "body-mists": "Body Mists",
  "hair-mists": "Hair Mists",
  "curl-activator": "Curl Activator",
  "leave-in-conditioners": "Leave-In Conditioners",
};

// SUBCATEGORY OPTIONS MAP - UNIQUE IDs WITH CATEGORY CONTEXT
export const subcategoryOptionsMap = {
  // Standard shop subcategories
  "shampoo": "Shampoo",
  "conditioners": "Conditioner & Leave-In",
  "hair-treatments": "Hair Treatments & Masks",
  "hair-styling": "Styling, Mousse & Edge Care",
  "hair-oils-serums": "Hair Oils, Serums & Mists",
  "body-lotions-creams": "Body Lotions & Creams",
  "body-butter-oils": "Body Butter & Oils",
  "shower-gels-scrubs": "Shower Gels & Scrubs",
  "deodorants": "Deodorants & Anti-Perspirants",
  "body-mists-fragrance": "Body Mists & Fragrance",
  "face-wash": "Face Wash & Cleansers",
  "face-moisturizers": "Face Moisturisers & Creams",
  "face-masks-scrubs": "Face Masks & Scrubs",
  "face-serums": "Face Serums & Treatments",
  "baby-wash-shampoo": "Baby Wash & Shampoo",
  "baby-lotions-creams": "Baby Lotions, Oils & Creams",
  "nappy-rash-care": "Nappy Rash Care",
  "kids-hair-care": "Kids Hair Care",
  "hand-wash": "Hand Wash",
  "dishwashing": "Dishwashing Liquid",
  "laundry-detergent": "Laundry Detergent",
  "toilet-bathroom-cleaners": "Toilet & Bathroom Cleaners",
  "aftershave": "After-Shave",
  "soft-toys": "Soft Toys & Teddy Bears",
  "educational-toys": "Educational Toys",
  "padlocks": "Padlocks",
  // Saffron - Home Care & Hygiene
  "home-care-hygiene-handwash": "Handwash",
  "home-care-hygiene-dishwashing": "Dishwashing Liquid", 
  "home-care-hygiene-detergent": "Liquid Detergent",
  
  // Saffron - Beauty & Body Care
  "beauty-body-care-shower-gel": "Shower Gels",
  "beauty-body-care-aftershave": "After-Shave Anti-Bump",
  
  // Cornells - Super Foods
  "super-foods-shampoo": "Shampoo",
  "super-foods-conditioner": "Conditioner",
  "super-foods-hair-mask": "Hair Mask",
  "super-foods-hair-serum": "Hair Serum",
  "super-foods-shower-gel": "Shower Gel",
  "super-foods-body-lotion": "Body Lotion",
  "super-foods-body-scrub": "Body Scrub",
  "super-foods-facial-scrub": "Facial Scrub",
  "super-foods-facial-mask": "Facial Mask",
  "super-foods-face-wash": "Face Wash",
  "super-foods-facial-cream": "Facial Cream",
  "super-foods-baby-care": "Baby Care",
  "super-foods-gift-sets": "Gift Sets",
  
  // Cornells - Dark & Beautiful
  "dark-beautiful-shampoo": "Shampoo",
  "dark-beautiful-conditioner": "Conditioner",
  "dark-beautiful-styling-products": "Styling Products",
  "dark-beautiful-hair-treatments": "Hair Treatments", 
  "dark-beautiful-oils-serums": "Oils & Serums",
  "dark-beautiful-kids-hair-care": "Kids Hair Care",
  
  // Cornells - Bold & Beautiful
  "bold-beautiful-shampoo": "Shampoo",
  "bold-beautiful-conditioner": "Conditioner",
  "bold-beautiful-body-cream": "Body Cream",
  "bold-beautiful-body-lotion": "Body Lotion",
  "bold-beautiful-shower-gel": "Shower Gel",
  "bold-beautiful-body-scrub": "Body Scrub",
  "bold-beautiful-shower-scrub": "Shower Scrub",
  "bold-beautiful-hand-body-lotion": "Hand & Body Lotion",
  "bold-beautiful-body-butter": "Body Butter",
  "bold-beautiful-body-oil": "Body Oil",
  "bold-beautiful-moisturizer": "Moisturizer",
  "bold-beautiful-sugar-scrub": "Sugar Scrub",
  "bold-beautiful-facial-care": "Facial Care",
  "bold-beautiful-serums": "Serums",
  "bold-beautiful-deodorant": "Anti-Perspirant",
  "bold-beautiful-day-night-cream": "Day & Night Cream",
  
  // Cornells - Cute & Pretty
  "cute-pretty-shampoo": "Shampoo",
  "cute-pretty-conditioner": "Conditioner",
  "cute-pretty-baby-wash-shampoo": "Baby Wash & Shampoo",
  "cute-pretty-baby-lotion": "Baby Lotion",
  "cute-pretty-baby-oil": "Baby Oil",
  "cute-pretty-baby-cream": "Baby Cream",
  "cute-pretty-nappy-rash-cream": "Nappy Rash Cream",
  "cute-pretty-kids-shampoo": "Kids Shampoo",
  "cute-pretty-kids-conditioner": "Kids Conditioner",
  "cute-pretty-kids-styling": "Kids Styling Products",
  "cute-pretty-kids-treatments": "Kids Hair Treatments",
};

// Brand Display Map
export const brandOptionsMap = {
  "rekker": "Rekker",
  "saffron": "Saffron",
  "cornells": "Cornells",
  "biosaff": "Bio Saff",
};

// Filter Options
export const filterOptions = {
  brand: [
    { id: "rekker", label: "Rekker" },
    { id: "saffron", label: "Saffron" },
    { id: "cornells", label: "Cornells" },
    { id: "biosaff", label: "Bio Saff" },
  ],
};

// Sort Options
export const sortOptions = [
  { id: "newest", label: "Newest first" },
  { id: "bestsellers", label: "Best sellers" },
  { id: "price-lowtohigh", label: "Price: Low to High" },
  { id: "price-hightolow", label: "Price: High to Low" },
  { id: "title-atoz", label: "Title: A to Z" },
  { id: "title-ztoa", label: "Title: Z to A" },
];

// Address Form Controls
export const addressFormControls = [
  {
    label: "Address",
    name: "address",
    componentType: "input",
    type: "text",
    placeholder: "Enter your address",
  },
  {
    label: "City",
    name: "city",
    componentType: "input",
    type: "text",
    placeholder: "Enter your city",
  },
  {
    label: "Pincode",
    name: "pincode",
    componentType: "input",
    type: "text",
    placeholder: "Enter your pincode",
  },
  {
    label: "Phone",
    name: "phone",
    componentType: "input",
    type: "text",
    placeholder: "Enter your phone number",
  },
  {
    label: "Notes",
    name: "notes",
    componentType: "textarea",
    placeholder: "Enter any additional notes",
  },
];

// Helper function to get full product category display
export const getProductCategoryDisplay = (brand, category, subcategory) => {
  let display = brandOptionsMap[brand] || brand;
  
  if (category) {
    display += ` - ${categoryOptionsMap[category] || category}`;
  }
  
  if (subcategory) {
    display += ` - ${subcategoryOptionsMap[subcategory] || subcategory}`;
  }
  
  return display;
};

// Helper function to extract category from subcategory ID
export function getCategoryFromSubcategory(subcategoryId) {
  if (!subcategoryId) return null;
  
  // For Saffron subcategories
  if (subcategoryId.startsWith('home-care-hygiene-')) return 'home-care-hygiene';
  if (subcategoryId.startsWith('beauty-body-care-')) return 'beauty-body-care';
  
  // For Cornells subcategories
  if (subcategoryId.startsWith('super-foods-')) return 'super-foods';
  if (subcategoryId.startsWith('dark-beautiful-')) return 'dark-beautiful';
  if (subcategoryId.startsWith('bold-beautiful-')) return 'bold-beautiful';
  if (subcategoryId.startsWith('cute-pretty-')) return 'cute-pretty';
  
  return null;
}

// Helper function to get display name for subcategory
export function getSubcategoryDisplayName(subcategoryId) {
  return subcategoryOptionsMap[subcategoryId] || subcategoryId;
}