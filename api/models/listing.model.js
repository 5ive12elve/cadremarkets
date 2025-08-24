import mongoose from 'mongoose';

const ListingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 62,
    minlength: 4, // Updated minimum length to 4 as per your request
  },
  description: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    match: [/^\d{10,15}$/, 'Please provide a valid phone number'], // Validates phone number
  },
  city: {
    type: String,
    required: true,
  },
  district: {
    type: String,
    required: function () {
      return this.city === 'Cairo'; // District is required only for Cairo
    },
  },
  type: {
    type: String,
    required: true,
    enum: [
      'Paintings & Drawings',
      'Sculptures & 3D Art',
      'Antiques & Collectibles',
      'Clothing & Wearables',
      'Home Décor',
      'Accessories',
      'Prints & Posters',
    ],
  },
  dimensions: {
    type: String,
    required: function() {
      return this.type !== 'Clothing & Wearables'; // Not required for clothing
    },
    enum: ['2D', '3D'], // Options for 2D or 3D
  },
  width: {
    type: Number,
    required: function() {
      return this.type !== 'Clothing & Wearables'; // Not required for clothing
    },
    min: 1, // Minimum width
  },
  height: {
    type: Number,
    required: function() {
      return this.type !== 'Clothing & Wearables'; // Not required for clothing
    },
    min: 1, // Minimum height
  },
  depth: {
    type: Number,
    required: function () {
      return this.dimensions === '3D' && this.type !== 'Clothing & Wearables'; // Depth is required only if dimensions is 3D and not clothing
    },
    min: 1, // Minimum depth for 3D items
  },
  // New fields for clothing sizes
  availableSizes: {
    type: [String],
    required: function() {
      return this.type === 'Clothing & Wearables'; // Required only for clothing
    },
    validate: {
      validator: function (val) {
        if (this.type !== 'Clothing & Wearables') return true; // Skip validation for non-clothing items
        return val && val.length > 0 && val.length <= 10; // At least 1 size, max 10 sizes
      },
      message: 'Clothing items must have at least 1 size and no more than 10 sizes.',
    },
    enum: {
      values: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '32', '34', '36', '38', '40', '42', '44', '46', '48', '50', 'One Size'],
      message: 'Invalid size. Available sizes: XS, S, M, L, XL, XXL, XXXL, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, One Size'
    }
  },
  price: {
    type: Number,
    required: true,
    min: [100, 'Price must be at least 100 EGP'], // Updated to match frontend and controller
  },
  cadreProfit: {
    type: Number,
    required: true,
    default: function() {
      return this.price * 0.10; // 10% of the price
    }
  },
  contactPreference: {
    type: String,
    required: true,
    enum: ['Phone Number', 'Email'], // Options for contact preference
  },
  imageUrls: {
    type: [String],
    validate: {
      validator: function (val) {
        return val.length <= 6;
      },
      message: 'You can upload a maximum of 6 images.',
    },
  },
  userRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Refers to the user creating the listing
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

  // ✅ New Fields Added
  status: {
    type: String,
    enum: ['Pending', 'For Sale', 'Confirmed', 'SFS', 'Cancelled', 'Sold'], // Status options
    default: 'Pending', // Default to Pending
  },
  cadremarketsService: {
    type: Boolean,
    default: false, // Default to not requesting Cadremarkets service
  },
  // New fields for listing type management
  listingType: {
    type: String,
    enum: ['unique', 'stock'],
    required: true,
    default: function() {
      return this.initialQuantity === 1 ? 'unique' : 'stock';
    }
  },
  initialQuantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  currentQuantity: {
    type: Number,
    required: true,
    min: 0,
    default: function() {
      return this.initialQuantity;
    },
    validate: {
      validator: function(value) {
        return value <= this.initialQuantity;
      },
      message: 'Current quantity cannot exceed initial quantity'
    }
  },
  soldQuantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
    validate: {
      validator: function(value) {
        return value >= 0 && value <= this.initialQuantity;
      },
      message: 'Sold quantity must be between 0 and initial quantity'
    }
  }
});

// Pre-save middleware to ensure listing type and cadre profit are set correctly
ListingSchema.pre('save', function(next) {
  this.listingType = this.initialQuantity === 1 ? 'unique' : 'stock';
  this.cadreProfit = this.price * 0.10; // 10% of the price
  next();
});

export default mongoose.model('Listing', ListingSchema);

// Add database indexes for better performance
ListingSchema.index({ status: 1, cadremarketsService: 1 });
ListingSchema.index({ type: 1, status: 1 });
ListingSchema.index({ name: 'text', description: 'text' });
ListingSchema.index({ createdAt: -1 });
ListingSchema.index({ price: 1 });
ListingSchema.index({ city: 1, district: 1 });