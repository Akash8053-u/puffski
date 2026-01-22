// models/Producer.js
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const producerSchema = new mongoose.Schema({
    name: {
        type: String
    },
    city: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City'
    },
    dispensary_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item'
    },
    supplierId: {
        type: Number
    },
    instaleaf_producerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Producer'
    },
    dataType: {
        type: String,
        default: ''
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
    timestamps: true, // Replaces autoCreatedAt and autoUpdatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Add indexes for better performance
producerSchema.index({ name: 1 });
producerSchema.index({ status: 1 });
producerSchema.index({ isDeleted: 1 });
producerSchema.index({ dispensary_id: 1 });
producerSchema.index({ supplierId: 1 });

// Add pagination plugin
producerSchema.plugin(mongoosePaginate);

// Static methods
producerSchema.statics.findActive = function() {
    return this.find({ status: 'active', isDeleted: false });
};

producerSchema.statics.findByDispensary = function(dispensaryId) {
    return this.find({ dispensary_id: dispensaryId, isDeleted: false });
};

producerSchema.statics.findBySupplierId = function(supplierId) {
    return this.findOne({ supplierId, isDeleted: false });
};

// Instance methods
producerSchema.methods.softDelete = function() {
    this.isDeleted = true;
    return this.save();
};

producerSchema.methods.restore = function() {
    this.isDeleted = false;
    return this.save();
};

producerSchema.methods.activate = function() {
    this.status = 'active';
    return this.save();
};

producerSchema.methods.deactivate = function() {
    this.status = 'deactive';
    return this.save();
};

// Pre-save middleware for validation
producerSchema.pre('save', function(next) {
    // Ensure dataType is trimmed
    if (this.isModified('dataType')) {
        this.dataType = this.dataType.trim();
    }
    
    // Ensure name is trimmed
    if (this.isModified('name')) {
        this.name = this.name.trim();
    }
    
    next();
});

// Post-save middleware for logging
producerSchema.post('save', function(doc) {
    console.log(`Producer ${doc.name} saved with ID: ${doc._id}`);
});

// Check if model already exists to prevent overwrite errors
const Producer = mongoose.models.Producer || mongoose.model('Producer', producerSchema);

module.exports = Producer;