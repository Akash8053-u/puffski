const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ErrorNotificationSchema = new Schema({
    reason: {
        type: String,
    },
    store: {
        type: String,
    },
    addedBy: {
        type: Schema.Types.ObjectId,                
        ref: 'User',
    },
    updatedBy: {
        type: Schema.Types.ObjectId,                
        ref: 'User',
    },
    deletedBy: {
        type: Schema.Types.ObjectId,                
        ref: 'User',
    },
    status: {
        type: String,
        enum: ['active', 'deactive'],
        default: 'active',
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('ErrorNotification', ErrorNotificationSchema);