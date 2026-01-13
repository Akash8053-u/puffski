const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true
    },
    image: {
        type: String
    },
    description: {
        type: String,
        trim: true
    },
    type: {
        type: String
    },
    isMaster: {
        type: Boolean,
        default: false
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LsrCategory'
    },
    status: {
        type: String,
        enum: ['active', 'deactive'],
        default: 'active'
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const LsrCategory = mongoose.model('LsrCategory', categorySchema);
module.exports = LsrCategory;