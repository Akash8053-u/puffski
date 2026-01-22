const mongoose = require('mongoose');

const lsrBrandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Brand name is required'],
        trim: true
    },
    image: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['active', 'deactive'],
        default: 'active'
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
});


const LsrBrand = mongoose.model('LsrBrand', lsrBrandSchema);
module.exports = LsrBrand;