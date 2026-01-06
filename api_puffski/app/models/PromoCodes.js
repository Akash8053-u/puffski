// models/PromoCodes.js
const mongoose = require('mongoose');

const PromoCodesSchema = new mongoose.Schema(
  {
    name: { type: String },
    code: { type: String },
    discount: { type: Number, default: 0 },
    quantity: { type: Number, default: 0 },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    freeDelivery: { type: Boolean, default: false },
    newAccount: { type: Boolean, default: false },
    specificUser: { type: Boolean, default: false },
    allUser: { type: Boolean, default: false },
    oneTime: { type: Boolean, default: false },
    redeemed: { type: Number, default: 0 },
    startDate: { type: Date },
    endDate: { type: Date },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true,versionKey:false } // replaces autoCreatedAt & autoUpdatedAt
);

module.exports = mongoose.model('PromoCodes', PromoCodesSchema);
