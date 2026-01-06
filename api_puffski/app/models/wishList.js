const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'LsrProduct' },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
},{timestamps:true,versionKey:false});

module.exports = mongoose.model('Wishlist', wishlistSchema);
