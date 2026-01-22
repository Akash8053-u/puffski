const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const driverSchedulerSchema = new Schema({
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    startTime: {
        type: String
    },
    endTime: {
        type: String
    },
    morningStartTime: {
        type: String
    },
    morningEndTime: {
        type: String
    },
    afternoonStartTime: {
        type: String
    },
    afternoonEndTime: {
        type: String
    },
    eveningStartTime: {
        type: String
    },
    eveningEndTime: {
        type: String
    },
    morning: {
        type: Boolean,
        default: false
    },
    afternoon: {
        type: Boolean,
        default: false
    },
    evening: {
        type: Boolean,
        default: false
    },
    shiftingTiming: {
        type: Array,
        default: []
    },
    driverId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    store: {
        type: Schema.Types.ObjectId,
        ref: 'Item'
    },
    shiftType: {
        type: String
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    isCustom: {
        type: Boolean,
        default: false
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
        default: 'active'
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('DriverScheduler', driverSchedulerSchema);