const mongoose = require('mongoose');
// const mongoosePaginate = require('mongoose-paginate-v2');

const cartSchema = new mongoose.Schema({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Marketplaceproduct'
    },
    item_product_id: {
        type: mongoose.Schema.Types.ObjectId,
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
    // cart_type: {
    //     type: String,
    //     enum: ['reserved', 'regular'],
    //     default: 'regular'
    // },
    // dispensary_id: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Item'
    // },
    variant_id: String,
    variantId: String,
    isOutOfStock: {
        type: Boolean,
        default: false
    },
    productQty: Number,
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
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
cartSchema.index({ addedBy: 1, product_id: 1 });
cartSchema.index({ addedBy: 1, item_product_id: 1 });
cartSchema.index({ cart_type: 1 });
cartSchema.index({ dispensary_id: 1 });
cartSchema.index({ isDeleted: 1 });

// Add pagination plugin
// cartSchema.plugin(mongoosePaginate);

// Pre-save middleware
cartSchema.pre('save', function (next) {
    if (this.isModified('quantity') && this.quantity < 0) {
        this.quantity = 0;
    }
    next();
});

// Virtual for total price
cartSchema.virtual('totalPrice').get(function () {
    return this.quantity * this.price;
});

// Static methods
cartSchema.statics.findByUser = function (userId) {
    return this.find({ addedBy: userId, isDeleted: false });
};

cartSchema.statics.findReservedByUser = function (userId, dispensaryId) {
    const query = { addedBy: userId, cart_type: 'reserved', isDeleted: false };
    if (dispensaryId) {
        query.dispensary_id = dispensaryId;
    }
    return this.find(query);
};

// Instance methods
cartSchema.methods.incrementQuantity = function (amount) {
    this.quantity += amount;
    return this.save();
};

cartSchema.methods.decrementQuantity = function (amount) {
    this.quantity = Math.max(0, this.quantity - amount);
    return this.save();
};

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;