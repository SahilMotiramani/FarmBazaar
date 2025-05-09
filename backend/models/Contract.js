// models/Contract.js
const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  // Basic Crop Details
  cropName: {
    type: String,
    required: [true, 'Crop name is required']
  },
  cropVariety: String,
  cropCategory: {
    type: String,
    required: [true, 'Crop category is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required']
  },
  quantityUnit: {
    type: String,
    default: 'kg'
  },
  expectedYieldDate: {
    type: Date,
    required: [true, 'Expected yield date is required']
  },
  sowingDate: Date,
  
  // Location Details
  address: {
    type: String,
    required: [true, 'Address is required']
  },
  state: {
    type: String,
    required: [true, 'State is required']
  },
  district: {
    type: String,
    required: [true, 'District is required']
  },
  village: {
    type: String,
    required: [true, 'Village is required']
  },
  pinCode: {
    type: String,
    required: [true, 'Pin code is required']
  },
  farmArea: {
    type: Number,
    required: [true, 'Farm area is required']
  },
  areaUnit: {
    type: String,
    default: 'acres'
  },
  latitude: String,
  longitude: String,
  
  // Pricing & Contract Details
  expectedPrice: {
    type: Number,
    required: [true, 'Expected price is required']
  },
  minPrice: {
    type: Number,
    required: [true, 'Minimum price is required']
  },
  requiresAdvance: {
    type: Boolean,
    default: false
  },
  advanceAmount: {
    type: Number
  },
  paymentMode: {
    type: String,
    required: [true, 'Payment mode is required']
  },
  preferredBuyerType: {
    type: String,
    required: [true, 'Preferred buyer type is required']
  },
  
  // Contract Terms
  contractDuration: {
    type: String,
    required: [true, 'Contract duration is required']
  },
  deliveryResponsibility: {
    type: String,
    required: [true, 'Delivery responsibility is required']
  },
  deliveryLocation: {
    type: String,
    required: [true, 'Delivery location is required']
  },
  penaltyClauses: String,

  bankName: {
    type: String,
    required: [true, 'Bank name is required']
  },
  accountNumber: {
    type: String,
    required: [true, 'Account number is required']
  },
  accountHolderName: {
    type: String,
    required: [true, 'Account holder name is required']
  },
  ifscCode: {
    type: String,
    required: [true, 'IFSC code is required']
  },
  upiId: String,

  // Blockchain Smart Contract Details
  useSmartContract: {
    type: Boolean,
    default: false
  },
  walletAddress: {
    type: String,
    required: function() { return this.useSmartContract; }
  },
  preferredBlockchain: {
    type: String,
    enum: ['Polygon', 'Ethereum', 'Binance Smart Chain', 'Solana'],
    default: 'Polygon',
    required: function() { return this.useSmartContract; }
  },
  escrowRequired: {
    type: Boolean,
    default: false
  },
  escrowPercentage: {
    type: String,
    enum: ['10', '15', '20', '25'],
    default: '10',
    required: function() { return this.escrowRequired; }
  },
  automaticPayout: {
    type: Boolean,
    default: true
  },
  
  // Media
  images: [String],
  idProofDocument: {
    type: String,
    required: [true, 'ID proof document is required']
  },
  landProofDocument: String,
  
  // Status and Tracking
  status: {
    type: String,
    enum: ['Active', 'Pending', 'Completed', 'Cancelled'],
    default: 'Active'
  },
  
  // Relations
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Contract must belong to a user']
  },
  
  // Visibility
  allowVisibility: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Contract = mongoose.model('Contract', contractSchema);
module.exports = Contract;