const mongoose = require('mongoose');

const FailedCardSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    dispensary_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item'
    },
    store_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    error: {
        type: String
    },
    client_id: {
        type: String,
        default: ''
    },
    client_secret: {
        type: String,
        default: ''
    },
    cardBrand: {
        type: String,
        default: ''
    },
    cardFunding: {
        type: String,
        default: ''
    },
    cardType: {
        type: String,
        default: ''
    },
    mainError: {
        type: String,
        default: ''
    },
    amount: {
        type: String,
        default: ''
    },
    card_lookup_id: {
        type: String,
        default: ''
    },
    code: {
        type: String
    },
    isoCode: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    platform: {
        type: String,
        default: 'puffski'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('FailedCard', FailedCardSchema);
