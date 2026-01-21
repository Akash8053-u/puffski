const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    percentage: {
        type: Number,
        default: 0,
        required: true,
        min: 0,
        max: 100
    },
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    description: {
        type: String,
        trim: true
    },
    expiryDate: {
        type: Date
    },
    usageLimit: {
        type: Number,
        default: 1
    },
    usageCount: {
        type: Number,
        default: 0
    },
    minimumOrderAmount: {
        type: Number,
        default: 0
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

couponSchema.index({ code: 1, isDeleted: 1, isActive: 1 });
couponSchema.index({ isActive: 1, isDeleted: 1, expiryDate: 1 });

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;