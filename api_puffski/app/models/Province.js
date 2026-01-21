const mongoose = require('mongoose');

const provinceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
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
provinceSchema.index({ name: 1 });
provinceSchema.index({ status: 1, isDeleted: 1 });

const Province = mongoose.model('Province', provinceSchema);

module.exports = Province;