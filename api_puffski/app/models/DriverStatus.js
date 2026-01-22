const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const driverStatusSchema = new Schema({
    scheduleDate: {
        type: String
    },
    scheduleStatus: {
        type: String
    },
    addedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
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
});

module.exports = mongoose.model('DriverStatus', driverStatusSchema);