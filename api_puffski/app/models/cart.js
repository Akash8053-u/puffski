const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartSchema = new Schema({
    product_id: {
        type: Schema.Types.ObjectId,
        ref: 'Marketplaceproduct'
    },
    item_product_id: {
        type: Schema.Types.ObjectId,
        ref: 'Itemproduct'
    },
    quantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        default: 0.0
    },
    addedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    deletedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    cart_type: {
        type: String
    },
    dispensary_id: {
        type: Schema.Types.ObjectId,
        ref: 'Item'
    },
    variantId: {
        type: String
    },
    productQty: {
        type: Number
    },
    variant_id: {
        type: Object
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Cart', cartSchema);