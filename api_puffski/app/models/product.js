// models/Category.js
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const categorySchema = new mongoose.Schema({
    name: {
        type: String
    },
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item'
    },
    sku: {
        type: String
    },
    type: {
        type: String,
        default: ''
    },
    reward_type: {
        type: String,
        default: ''
    },
    slug: {
        type: String,
        required: true
    },
    meta_desc: {
        type: String
    },
    meta_name: {
        type: String
    },
    meta_keywords: {
        type: String
    },
    producer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Itemproducer'
    },
    second_name: {
        type: String,
        default: ''
    },
    dispensary_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item'
    },
    category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    subCatgeory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    subCatgeory_Name: {
        type: String
    },
    product_category: {
        type: [String],
        default: []
    },
    product_subcategory: {
        type: [String],
        default: []
    },
    product_subcategoryname: {
        type: [String],
        default: []
    },
    terpene_profile: {
        type: [String],
        default: []
    },
    city: {
        type: String,
        default: ''
    },
    cities: {
        type: [String],
        default: []
    },

    // New fields start
    thc_min: {
        type: Number,
        default: 0.0
    },
    thc_max: {
        type: Number,
        default: 0.0
    },
    thc_unit: {
        type: String,
        default: ''
    },
    cbd_min: {
        type: Number,
        default: 0.0
    },
    cbd_max: {
        type: Number,
        default: 0.0
    },
    unit: {
        type: String,
        default: ''
    },
    eachesPerCase: {
        type: Number,
        default: 0
    },
    newSKUThisWeek: {
        type: Boolean,
        default: false
    },
    sellPricePerCase: {
        type: Number,
        default: 0.0
    },
    orginalPricePerCase: {
        type: Number,
        default: 0.0
    },
    sellPricePerUnit: {
        type: Number,
        default: 0.0
    },
    msrp: {
        type: Number,
        default: 0.0
    },
    recycleFeesPerCase: {
        type: Number,
        default: 0.0
    },
    depositFeePerCase: {
        type: Number,
        default: 0.0
    },
    companyName: {
        type: String,
        default: ''
    },
    strain: {
        type: String,
        default: ''
    },
    regionOfProduct: {
        type: String,
        default: ''
    },
    extractionProcess: {
        type: String,
        default: ''
    },
    dominantTerpene1: {
        type: String,
        default: ''
    },
    dominantTerpene1ContentPercentage: {
        type: Number,
        default: 0.0
    },
    dominantTerpene2: {
        type: String,
        default: ''
    },
    dominantTerpene2ContentPercentage: {
        type: Number,
        default: 0.0
    },
    dominantTerpene3: {
        type: String,
        default: ''
    },
    dominantTerpene3ContentPercentage: {
        type: Number,
        default: 0.0
    },
    otherTerpenesList: {
        type: String,
        default: ''
    },
    netContent: {
        type: Number,
        default: 0
    },
    contentUOM: {
        type: String,
        default: ''
    },
    piecNetContent1eQty: {
        type: Number,
        default: 0
    },
    pieceSize: {
        type: Number,
        default: 0
    },
    dceg: {
        type: Number,
        default: 0.0
    },
    masterCaseHeightCM: {
        type: Number,
        default: 0.0
    },
    masterCaseLengthCM: {
        type: Number,
        default: 0.0
    },
    masterCaseWidthCM: {
        type: Number,
        default: 0.0
    },
    externalPackagingMaterial: {
        type: String,
        default: ''
    },
    eachInnerHeightCM: {
        type: Number,
        default: 0.0
    },
    eachInnerLengthCM: {
        type: Number,
        default: 0.0
    },
    eachInnerWidthCM: {
        type: Number,
        default: 0.0
    },
    eachInnerWeightGrams: {
        type: Number,
        default: 0
    },
    gtin: {
        type: Number,
        default: 0
    },
    masterCaseGTIN: {
        type: Number,
        default: 0
    },
    isImported: {
        type: Boolean,
        default: false
    },
    // New fields end
    
    thc: {
        type: String
    },
    thcrange: {
        type: Number,
        default: 0.0
    },
    cbd: {
        type: String
    },
    cbdrange: {
        type: Number,
        default: 0.0
    },
    cbg: {
        type: Number,
        default: 0.0
    },
    cbgrange: {
        type: Number,
        default: 0.0
    },
    cbn: {
        type: Number,
        default: 0.0
    },
    cbnrange: {
        type: Number,
        default: 0.0
    },
    cba: {
        type: Number,
        default: 0.0
    },
    cbarange: {
        type: Number,
        default: 0.0
    },
    thc_type: {
        type: String
    },
    cbd_type: {
        type: String
    },
    sortCBD: {
        type: Number,
        default: 0
    },
    sortTHC: {
        type: Number,
        default: 0
    },
    user_visits: {
        type: Number,
        default: 0
    },
    detail: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        default: 0
    },
    dataType: {
        type: String,
        default: ''
    },
    quantity: {
        type: Number,
        default: 0
    },
    image: {
        type: String,
        default: ''
    },
    imageUrl: {
        type: String,
        default: ''
    },
    totalReviews: {
        type: Number,
        default: 0
    },
    totalRating: {
        type: Number,
        default: 0.0
    },
    staffRating: {
        type: Number,
        default: 0
    },
    storeLayoutRating: {
        type: Number,
        default: 0
    },
    cultivator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cultivator'
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    inResponse: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['active', 'deactive'],
        default: 'active'
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    isForDelivery: {
        type: Boolean,
        default: false
    },
    isAGLC: {
        type: Boolean,
        default: false
    },
    instaleaf_pick: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    isSpecial: {
        type: Boolean,
        default: false
    },
    isStaff: {
        type: Boolean,
        default: false
    },
    isStore: {
        type: Boolean,
        default: false
    },
    lineage: {
        type: [String],
        default: []
    },
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    variant: {
        type: [mongoose.Schema.Types.Mixed],
        default: []
    },
    likeCount: {
        type: Number,
        default: 0
    },
    dislikeCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true, // Auto creates createdAt and updatedAt fields
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Add indexes for better performance
categorySchema.index({ slug: 1 });
categorySchema.index({ status: 1 });
categorySchema.index({ isDeleted: 1 });
categorySchema.index({ dispensary_id: 1 });
categorySchema.index({ category_id: 1 });
categorySchema.index({ addedBy: 1 });

// Add pagination plugin
categorySchema.plugin(mongoosePaginate);

// Virtuals (if needed)
categorySchema.virtual('fullName').get(function() {
    return `${this.name} ${this.second_name || ''}`.trim();
});

// Static methods
categorySchema.statics.findActive = function() {
    return this.find({ status: 'active', isDeleted: false });
};

categorySchema.statics.findBySlug = function(slug) {
    return this.findOne({ slug, isDeleted: false });
};

categorySchema.statics.findByDispensary = function(dispensaryId) {
    return this.find({ dispensary_id: dispensaryId, isDeleted: false });
};

// Instance methods
categorySchema.methods.softDelete = function(userId) {
    this.isDeleted = true;
    this.deletedBy = userId;
    return this.save();
};

categorySchema.methods.restore = function() {
    this.isDeleted = false;
    this.deletedBy = null;
    return this.save();
};

categorySchema.methods.incrementLikeCount = function() {
    this.likeCount += 1;
    return this.save();
};

categorySchema.methods.decrementLikeCount = function() {
    this.likeCount = Math.max(0, this.likeCount - 1);
    return this.save();
};

categorySchema.methods.incrementDislikeCount = function() {
    this.dislikeCount += 1;
    return this.save();
};

categorySchema.methods.decrementDislikeCount = function() {
    this.dislikeCount = Math.max(0, this.dislikeCount - 1);
    return this.save();
};

categorySchema.methods.incrementUserVisits = function() {
    this.user_visits += 1;
    return this.save();
};

// Pre-save middleware for slug generation or validation
categorySchema.pre('save', function(next) {
    // Ensure slug is URL-friendly
    if (this.isModified('slug')) {
        this.slug = this.slug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    
    // Calculate sortCBD and sortTHC if thc/cbd are strings
    if (this.isModified('thc') && typeof this.thc === 'string') {
        const thcMatch = this.thc.match(/(\d+(\.\d+)?)/);
        this.sortTHC = thcMatch ? parseFloat(thcMatch[1]) : 0;
    }
    
    if (this.isModified('cbd') && typeof this.cbd === 'string') {
        const cbdMatch = this.cbd.match(/(\d+(\.\d+)?)/);
        this.sortCBD = cbdMatch ? parseFloat(cbdMatch[1]) : 0;
    }
    
    next();
});

// Post-save middleware (example)
categorySchema.post('save', function(doc) {
    console.log(`Category ${doc.name} saved with ID: ${doc._id}`);
});

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
module.exports = Category;