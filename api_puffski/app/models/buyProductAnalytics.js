const mongoose = require('mongoose');

const BuyProductAnalyticSchema = new mongoose.Schema({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ItemProduct'
    },
    productName: {
        type: String
    },
    sku: {
        type: String
    },
    dispensary: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item'
    },
    quantity: {
        type: Number,
        default: 0
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ReserveOrder'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('BuyProductAnalytic', BuyProductAnalyticSchema);