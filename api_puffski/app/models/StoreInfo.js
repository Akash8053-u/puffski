// models/StoreInfo.js
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const storeInfoSchema = new mongoose.Schema({
    dispensary_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true
    },
    api_url: {
        type: String
    },
    auth_key: {
        type: String
    },
    auth_value: {
        type: String
    },
    auth_token: {
        type: String
    },
    company_id: {
        type: Number
    },
    location_id: {
        type: Number
    },
    pos_name: {
        type: String,
        required: true
    },
    updatedByCron: {
        type: Date,
        default: null
    }
}, {
    timestamps: true, // Auto creates createdAt and updatedAt fields
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Add indexes for better performance
storeInfoSchema.index({ dispensary_id: 1 }, { unique: true }); // One store info per dispensary
storeInfoSchema.index({ pos_name: 1 });
storeInfoSchema.index({ company_id: 1 });
storeInfoSchema.index({ location_id: 1 });
storeInfoSchema.index({ updatedByCron: 1 });

// Add compound indexes for API queries
storeInfoSchema.index({ company_id: 1, location_id: 1 });

// Add pagination plugin
storeInfoSchema.plugin(mongoosePaginate);

// Virtual for full API URL (if needed)
storeInfoSchema.virtual('fullApiUrl').get(function() {
    if (!this.api_url) return null;
    
    // Add company and location to URL if not already present
    let url = this.api_url;
    if (this.company_id && this.location_id && !url.includes('/company/')) {
        url = `${url}/company/${this.company_id}/location/${this.location_id}`;
    }
    return url;
});

// Virtual for authentication headers
storeInfoSchema.virtual('authHeaders').get(function() {
    const headers = {};
    
    if (this.auth_key && this.auth_value) {
        headers[this.auth_key] = this.auth_value;
    }
    
    if (this.auth_token) {
        headers['Authorization'] = `Bearer ${this.auth_token}`;
    }
    
    return headers;
});

// Static methods
storeInfoSchema.statics.findByDispensary = function(dispensaryId) {
    return this.findOne({ dispensary_id: dispensaryId });
};

storeInfoSchema.statics.findByCompanyLocation = function(companyId, locationId) {
    return this.findOne({ company_id: companyId, location_id: locationId });
};

storeInfoSchema.statics.findByPosName = function(posName) {
    return this.findOne({ pos_name: { $regex: new RegExp(posName, 'i') } });
};

storeInfoSchema.statics.findNeedsCronUpdate = function() {
    // Find stores that haven't been updated by cron in the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return this.find({
        $or: [
            { updatedByCron: { $lt: oneDayAgo } },
            { updatedByCron: null }
        ]
    });
};

// Instance methods
storeInfoSchema.methods.updateCronTimestamp = function() {
    this.updatedByCron = new Date();
    return this.save();
};

storeInfoSchema.methods.getApiEndpoint = function(endpoint = '') {
    if (!this.api_url) return null;
    
    let baseUrl = this.api_url;
    if (!baseUrl.endsWith('/')) baseUrl += '/';
    
    if (this.company_id && this.location_id) {
        return `${baseUrl}company/${this.company_id}/location/${this.location_id}/${endpoint}`.replace(/\/\//g, '/');
    }
    
    return `${baseUrl}${endpoint}`;
};

storeInfoSchema.methods.testConnection = async function() {
    try {
        const axios = require('axios');
        const testUrl = this.getApiEndpoint('health') || `${this.api_url}/health`;
        
        const response = await axios.get(testUrl, {
            headers: this.authHeaders,
            timeout: 5000 // 5 second timeout
        });
        
        return {
            success: true,
            status: response.status,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            status: error.response?.status
        };
    }
};

storeInfoSchema.methods.getProducts = async function() {
    try {
        const axios = require('axios');
        const productsUrl = this.getApiEndpoint('posListings');
        
        if (!productsUrl) {
            throw new Error('API URL not configured');
        }
        
        const response = await axios.get(productsUrl, {
            headers: this.authHeaders,
            timeout: 10000 // 10 second timeout
        });
        
        return {
            success: true,
            data: response.data,
            timestamp: new Date()
        };
    } catch (error) {
        console.error(`Error fetching products for ${this.pos_name}:`, error.message);
        return {
            success: false,
            error: error.message,
            status: error.response?.status
        };
    }
};

// Pre-save middleware for validation
storeInfoSchema.pre('save', function(next) {
    // Ensure URLs are properly formatted
    if (this.isModified('api_url') && this.api_url) {
        // Remove trailing slashes
        this.api_url = this.api_url.replace(/\/+$/, '');
    }
    
    // Trim string fields
    if (this.isModified('pos_name')) {
        this.pos_name = this.pos_name.trim();
    }
    
    if (this.isModified('auth_key')) {
        this.auth_key = this.auth_key?.trim();
    }
    
    if (this.isModified('auth_value')) {
        this.auth_value = this.auth_value?.trim();
    }
    
    if (this.isModified('auth_token')) {
        this.auth_token = this.auth_token?.trim();
    }
    
    // Validate that either auth_key/auth_value OR auth_token is provided
    if (this.isModified('auth_key') || this.isModified('auth_value') || this.isModified('auth_token')) {
        const hasKeyValue = this.auth_key && this.auth_value;
        const hasToken = this.auth_token;
        
        if (!hasKeyValue && !hasToken) {
            console.warn('StoreInfo: No authentication method configured');
        }
    }
    
    next();
});

// Post-save middleware
storeInfoSchema.post('save', function(doc) {
    console.log(`StoreInfo for ${doc.pos_name} saved/updated for dispensary: ${doc.dispensary_id}`);
});

// Pre-remove middleware
storeInfoSchema.pre('remove', function(next) {
    console.log(`StoreInfo for ${this.pos_name} is being removed`);
    next();
});

// Check if model already exists to prevent overwrite errors
const StoreInfo = mongoose.models.StoreInfo || mongoose.model('StoreInfo', storeInfoSchema);

module.exports = StoreInfo;