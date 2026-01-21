const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    province: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Province',
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

citySchema.index({ name: 1 });
citySchema.index({ province: 1 });
citySchema.index({ status: 1, isDeleted: 1 });
citySchema.index({ name: 1, province: 1 }); 

const City = mongoose.model('City', citySchema);
module.exports = City;