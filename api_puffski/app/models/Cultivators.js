const mongoose = require('mongoose');

const cultivatorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City'
    },
    province: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Province'
    },
    status: {
        type: String,
        enum: ['active', 'deactive'],
        default: 'active'
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true 
})
cultivatorSchema.index({ name: 1, isDeleted: 1 });
cultivatorSchema.index({ province: 1, status: 1 });

const Cultivator = mongoose.model('Cultivator', cultivatorSchema);
module.exports = Cultivator;