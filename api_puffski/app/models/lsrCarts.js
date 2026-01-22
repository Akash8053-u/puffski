// models/LsrCart.js - Minimal version
const mongoose = require('mongoose');

const lsrCartSchema = new mongoose.Schema({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LsrProduct',
        required: true
    },
    quantity: {
        type: Number,
        default: 0,
        min: 0
    },
    price: {
        type: Number,
        default: 0.0,
        min: 0
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
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
    }
}, {
    timestamps: true 
});

const LsrCart = mongoose.model('LsrCart', lsrCartSchema);
module.exports = LsrCart;