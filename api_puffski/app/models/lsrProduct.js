const mongoose = require('mongoose');

const lsrProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  sku: { type: String },
  whyShopperLove: { type: String },
  price: { type: Number, default: 0.0 },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'LsrCategory' },
  subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'LsrCategory' },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'LsrBrands' },
  image: { type: String },
  images: { type: [String] },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
  city: { type: String },
  stock: { type: Number, default: 0 },
  lowStock: { type: Number, default: 5 },
  keywords: { type: [String] },
  keywordsString: { type: String },
  ingredients: { type: String },
  sellingPoints: { type: String },
  inStock: { type: Boolean, default: false },
  slug: { type: String, required: true },
  meta_desc: { type: String },
  meta_name: { type: String },
  meta_keywords: { type: String },
  shipping: { type: mongoose.Schema.Types.Mixed },
  status: { type: String, enum: ['active', 'deactive'], default: 'active' },
  isDeleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
},{timestamps:true,versionKey:false});

module.exports = mongoose.model('LsrProduct', lsrProductSchema);
