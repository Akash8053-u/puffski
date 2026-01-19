const mongoose = require('mongoose');

const LsrMerrcoCardSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    dispensary_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    customer_id: {
        type: String
    },
    card_lookupId: {
        type: String,
        required: true
    },
    last4: {
        type: String,
        required: true
    },
    card_expiry_month: {
        type: String,
        required: true
    },
    card_expiry_year: {
        type: String,
        required: true
    },
    apartment: {
        type: String,
        default: ''
    },
    payment_gateway: {
        type: String,
        default: 'Moneris'
    },
    is_default: {
        type: Boolean,
        default: false
    },
    cardToken: {
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
    address1: {
        type: String,
        default: ''
    },
    city: {
        type: String,
        default: ''
    },
    province: {
        type: String,
        default: ''
    },
    country: {
        type: String,
        default: ''
    },
    postal_code: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('LsrMerrcoCard', LsrMerrcoCardSchema);