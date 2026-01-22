const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const storeDriverSchema = new Schema({
    driver_id: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    addedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('StoreDriver', storeDriverSchema);