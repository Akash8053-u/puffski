const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    sku: {
        type: String,
        trim: true
    },
    whyShopperLove: {
        type: String,
        trim: true
    },
    
    price: {
        type: Number,
        default: 0.0,
        min: 0
    },
    
 
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LsrCategory'
    },
    subcategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LsrCategory'
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LsrBrand'
    },
    
   
    image: {
        type: String
    },
    images: {
        type: [String],
        default: []
    },
    
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    city: {
        type: String,
        trim: true
    },
    
   
    stock: {
        type: Number,
        default: 0,
        min: 0
    },
    lowStock: {
        type: Number,
        default: 5,
        min: 0
    },
    inStock: {
        type: Boolean,
        default: false
    },
    
   
    keywords: {
        type: [String],
        default: []
    },
    keywordsString: {
        type: String,
        trim: true
    },
    
   
    ingredients: {
        type: String,
        trim: true
    },
    sellingPoints: {
        type: String,
        trim: true
    },
    
   
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    meta_desc: {
        type: String,
        trim: true
    },
    meta_name: {
        type: String,
        trim: true
    },
    meta_keywords: {
        type: String,
        trim: true
    },
    
  
    shipping: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    
 
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
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
    timestamps: {
        createdAt: 'created',
        updatedAt: 'updated'
    }
});

const LsrProduct = mongoose.model('lsrProduct', productSchema);

module.exports = LsrProduct;