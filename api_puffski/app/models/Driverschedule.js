const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const driverScheduleSchema = new Schema({
    driver_id: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    replace_driver_id: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    schedule_date: {
        type: Date
    },
    schedule_time_to: {
        type: String
    },
    schedule_time_from: {
        type: String
    },
    openshift_time_to: {
        type: String
    },
    openshift_time_from: {
        type: String
    },
    availability_time_to: {
        type: String
    },
    availability_time_from: {
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
    deletedBy: {
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

module.exports = mongoose.model('DriverSchedule', driverScheduleSchema);