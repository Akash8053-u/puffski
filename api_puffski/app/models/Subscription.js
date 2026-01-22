const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subscriptionSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['active', 'deactive'],
        default: 'active'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Subscription', subscriptionSchema);