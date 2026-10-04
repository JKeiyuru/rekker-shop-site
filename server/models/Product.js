// shop/server/models/Product.js - Multi-brand Shop Rekker Product Model
const mongoose = require("mongoose");

const VariationSchema = new mongoose.Schema({
  image: {
    type: String,
    required: [true, "Variation image is required"],
    trim: true
  },
  label: {
    type: String,
    required: [true, "Variation label is required"],
    trim: true,
    maxlength: [100, "Variation label cannot exceed 100 characters"]
  }
}, {
  _id: true
});

// New-style rich variant used by the multi-brand catalogue (size/sku/price/stock)
const VariantSchema = new mongoose.Schema({
  name: { type: String, trim: true, default: "" },
  size: { type: String, trim: true, default: "" },
  sku: { type: String, trim: true, default: "" },
  price: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  image: { type: String, trim: true, default: null },
}, { _id: true });

const FaqSchema = new mongoose.Schema({
  q: { type: String, trim: true, required: true },
  a: { type: String, trim: true, required: true },
}, { _id: false });

const ProductSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      trim: true,
      default: null
    },
    images: {
      type: [String],
      default: []
    },
    videoUrl: {
      type: String,
      trim: true,
      default: null
    },
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"]
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
      index: true
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    shortDescription: {
      type: String,
      trim: true,
      default: ""
    },
    sku: {
      type: String,
      trim: true,
      default: null
    },
    // Legacy string brand kept for backward compatibility with existing data/UI
    brand: {
      type: String,
      required: [true, "Brand is required"],
      trim: true,
      lowercase: true
    },
    // New relational brand reference (multi-brand catalogue)
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      default: null,
      index: true
    },
    category: {
      type: String,
      required: [true, "Product category is required"],
      trim: true,
      lowercase: true
    },
    subcategory: {
      type: String,
      trim: true,
      lowercase: true,
      default: null
    },
    // New relational category references
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
      index: true
    },
    subcategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"]
    },
    salePrice: {
      type: Number,
      default: 0,
      min: [0, "Sale price cannot be negative"],
      validate: {
        validator: function(value) {
          if (!value) return true;
          // On findByIdAndUpdate (runValidators) `this` is the Query, not the document,
          // so `this.price` is undefined. Read the price from the update instead.
          let price;
          if (typeof this.getUpdate === "function") {
            const u = this.getUpdate() || {};
            price = u.price !== undefined ? u.price : u.$set && u.$set.price;
            if (price === undefined) return true; // price not being changed — nothing to compare
          } else {
            price = this.price;
          }
          return Number(value) <= Number(price);
        },
        message: "Sale price should be less than or equal to regular price"
      }
    },
    totalStock: {
      type: Number,
      required: [true, "Total stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 0
    },
    // New generic stock alias used by shop controllers, kept in sync with totalStock
    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock cannot be negative"]
    },
    status: {
      type: String,
      enum: ["draft", "active", "archived"],
      default: "active"
    },
    averageReview: {
      type: Number,
      default: 0,
      min: [0, "Average review cannot be negative"],
      max: [5, "Average review cannot exceed 5"]
    },
    variations: {
      type: [VariationSchema],
      default: []
    },
    variants: {
      type: [VariantSchema],
      default: []
    },
    ingredients: {
      type: String,
      trim: true,
      default: ""
    },
    usageInstructions: {
      type: String,
      trim: true,
      default: ""
    },
    safetyInfo: {
      type: String,
      trim: true,
      default: ""
    },
    benefits: {
      type: [String],
      default: []
    },
    faqs: {
      type: [FaqSchema],
      default: []
    },
    relatedProductIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product"
    }],
    seoTitle: { type: String, trim: true, default: "" },
    seoDescription: { type: String, trim: true, default: "" },
    ogImage: { type: String, trim: true, default: null },
    isNewArrival: { type: Boolean, default: false },
    salesCount: { type: Number, default: 0, min: 0 },
    // Optional "range" inside a brand (e.g. Cornells → "Super Foods",
    // "Dark & Beautiful"). Ranges used to be mistaken for categories; they are
    // now a plain label shown on the product, not a filter.
    productLine: { type: String, trim: true, default: "" },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        delete ret.__v;
        return ret;
      },
      virtuals: true
    },
    toObject: {
      virtuals: true
    }
  }
);

// Custom validation: Product must have either main image, images[], or variations
ProductSchema.pre('validate', function(next) {
  const hasMainImage = this.image && this.image.trim().length > 0;
  const hasImagesArray = this.images && this.images.length > 0;
  const hasVariations = this.variations && Array.isArray(this.variations) && this.variations.length > 0;

  if (!hasMainImage && !hasImagesArray && !hasVariations) {
    return next(new Error('Product must have either a main image, an images array, or at least one variation'));
  }

  next();
});

// Keep stock/totalStock in sync for backward compatibility
ProductSchema.pre('save', function(next) {
  if (this.isModified('totalStock') && !this.isModified('stock')) {
    this.stock = this.totalStock;
  } else if (this.isModified('stock') && !this.isModified('totalStock')) {
    this.totalStock = this.stock;
  }
  next();
});

// Virtual for display image
ProductSchema.virtual('displayImage').get(function() {
  if (this.image && this.image.trim().length > 0) return this.image;
  if (this.images && this.images.length > 0) return this.images[0];
  if (this.variations && this.variations.length > 0 && this.variations[0].image) {
    return this.variations[0].image;
  }
  return null;
});

// Friendly names, available whenever brandId/categoryId have been populated
ProductSchema.virtual('categoryName').get(function() {
  const c = this.categoryId;
  return c && typeof c === 'object' && c.name ? c.name : undefined;
});
ProductSchema.virtual('subcategoryName').get(function() {
  const c = this.subcategoryId;
  return c && typeof c === 'object' && c.name ? c.name : undefined;
});
ProductSchema.virtual('brandName').get(function() {
  const b = this.brandId;
  return b && typeof b === 'object' && b.name ? b.name : undefined;
});

// Virtual for brand display name
ProductSchema.virtual('brandDisplay').get(function() {
  const brandMap = {
    'rekker': 'Rekker',
    'saffron': 'Saffron Milan',
    'cornells': 'Cornells',
    'biosaff': 'Bio Saff'
  };
  return brandMap[this.brand] || this.brand;
});

// Indexes for better query performance
ProductSchema.index({ brand: 1, category: 1 });
ProductSchema.index({ brand: 1, category: 1, subcategory: 1 });
ProductSchema.index({ brandId: 1, categoryId: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ isNewArrival: 1 });
ProductSchema.index({ salesCount: -1 });
ProductSchema.index({ title: 'text', description: 'text' });
ProductSchema.index({ status: 1, categoryId: 1 });
ProductSchema.index({ status: 1, subcategoryId: 1 });
ProductSchema.index({ status: 1, brandId: 1 });

// Static method to get products by brand
ProductSchema.statics.findByBrand = function(brand) {
  return this.find({ brand: brand.toLowerCase() });
};

// Static method to get products by brand and category
ProductSchema.statics.findByBrandAndCategory = function(brand, category) {
  return this.find({
    brand: brand.toLowerCase(),
    category: category.toLowerCase()
  });
};

// Static method to get products by brand, category, and subcategory
ProductSchema.statics.findByFullCategory = function(brand, category, subcategory) {
  const query = {
    brand: brand.toLowerCase(),
    category: category.toLowerCase()
  };

  if (subcategory) {
    query.subcategory = subcategory.toLowerCase();
  }

  return this.find(query);
};

// Instance method to check if product is on sale
ProductSchema.methods.isOnSale = function() {
  return this.salePrice > 0 && this.salePrice < this.price;
};

// Instance method to get effective price
ProductSchema.methods.getEffectivePrice = function() {
  return this.isOnSale() ? this.salePrice : this.price;
};

// Instance method to check if product is in stock
ProductSchema.methods.isInStock = function() {
  return (this.totalStock || this.stock || 0) > 0;
};

// Instance method to check if product is low stock
ProductSchema.methods.isLowStock = function(threshold = 10) {
  const qty = this.totalStock || this.stock || 0;
  return qty > 0 && qty <= threshold;
};

module.exports = mongoose.model("Product", ProductSchema);
