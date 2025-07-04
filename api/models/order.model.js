import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
    _id: {
      type: String,
      required: true, // Change from default ObjectId to String
    },
    orderItems: [
      {
        name: { type: String, required: true },
        description: { type: String },
        price: { type: Number, required: true },
        type: { type: String, required: true }, // Item type (e.g., "Clothing & Wearables", "Paintings & Drawings")
        quantity: { type: Number, required: true, min: 1 },
        
        // For clothing items
        selectedSize: { 
          type: String,
          validate: {
            validator: function(v) {
              // Only required if type is "Clothing & Wearables"
              if (this.type === 'Clothing & Wearables') {
                return v && v.length > 0;
              }
              return true;
            },
            message: 'Selected size is required for clothing items'
          }
        },
        
        // For non-clothing items
        dimensions: { 
          type: String,
          enum: ['2D', '3D'],
          validate: {
            validator: function(v) {
              // Only required if type is NOT "Clothing & Wearables"
              if (this.type !== 'Clothing & Wearables') {
                return v && v.length > 0;
              }
              return true;
            },
            message: 'Dimensions are required for non-clothing items'
          }
        },
        width: { 
          type: Number,
          validate: {
            validator: function(v) {
              // Only required if type is NOT "Clothing & Wearables"
              if (this.type !== 'Clothing & Wearables') {
                return v && v > 0;
              }
              return true;
            },
            message: 'Width is required for non-clothing items'
          }
        },
        height: { 
          type: Number,
          validate: {
            validator: function(v) {
              // Only required if type is NOT "Clothing & Wearables"
              if (this.type !== 'Clothing & Wearables') {
                return v && v > 0;
              }
              return true;
            },
            message: 'Height is required for non-clothing items'
          }
        },
        depth: { 
          type: Number,
          validate: {
            validator: function(v) {
              // Only required if dimensions is "3D" and type is NOT "Clothing & Wearables"
              if (this.type !== 'Clothing & Wearables' && this.dimensions === '3D') {
                return v && v > 0;
              }
              return true;
            },
            message: 'Depth is required for 3D non-clothing items'
          }
        },
        
        sellerInfo: {
          username: { type: String, required: true }, // Derived from userRef
          email: { type: String, required: true },
          phoneNumber: { type: String, required: true },
          city: { type: String, required: true },
          district: { type: String, required: true },
          address: { type: String, required: true },
          contactPreference: { type: String, required: true },
        },
        profit: { type: Number, required: true }, // Seller Profit
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true }, // Refers to the listing
        statusChecks: {
          itemReceived: { type: Boolean, default: false },
          itemVerified: { type: Boolean, default: false },
          itemPacked: { type: Boolean, default: false },
          readyForShipment: { type: Boolean, default: false }
        }
      },
    ],
    status: {
      type: String,
      enum: ['placed', 'out for delivery', 'delivered', 'cancelled'],
      default: 'placed',
    },
    customerInfo: {
      name: { type: String, required: true },
      phoneNumber: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      district: { type: String, required: true }, // NEW FIELD
      paymentMethod: {
        type: String,
        enum: ['cash', 'instapay'],
        default: 'cash',
      },
    },
    shipmentFees: {
      type: Number,
      default: 85, // Fixed fee
    },
    totalPrice: {
      type: Number,
      required: true, // Total + Fees
    },
    cadreProfit: {
      type: Number,
      required: true, // 10% of (Total - Shipment Fees)
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });
  
  export default mongoose.model('Order', OrderSchema);