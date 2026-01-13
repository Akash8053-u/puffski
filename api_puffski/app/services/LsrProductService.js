const LsrProduct = require('../models/lsrProduct');
const LsrCategory = require('../models/lsrCategory');
const { constants } = require('../utils/constants');

// Fallback constants with safe access
const DEFAULT_MESSAGES = {
  NAME_REQUIRED: "Product name is required",
  CATEGORY_REQUIRED: "Category is required",
  SUBCATEGORY_REQUIRED: "Subcategory is required",
  ALREADY_EXIST: "Product already exists",
  SAVED: "Product saved successfully",
  UPDATED: "Product updated successfully",
  ISSUE_IN_UPDATE: "There was an issue updating the product"
};

// Helper function to safely get messages
function getMessage(key) {
  // Check if constants exists and has lsrproduct with the key
  if (constants && constants.lsrproduct && constants.lsrproduct[key]) {
    return constants.lsrproduct[key];
  }
  // Fallback to default messages
  return DEFAULT_MESSAGES[key] || key;
}

class LsrProductService {
    static async saveProduct(data, context) {
        // Check if identity exists
        if (!context || !context.identity) {
            return {
                success: false,
                error: {
                    code: 401,
                    message: "Authentication required"
                }
            };
        }
        
        const { identity } = context;
        
        // VALIDATION - Fixed error codes and messages
        if (!data.name || typeof data.name === 'undefined') {
            return {
                success: false,
                error: {
                    code: 400, // Changed from 404
                    message: getMessage('NAME_REQUIRED')
                }
            };
        }

        if (!data.category || typeof data.category === 'undefined') {
            return {
                success: false,
                error: {
                    code: 400, // Changed from 404
                    message: getMessage('CATEGORY_REQUIRED')
                }
            };
        }

        if (!data.subcategory || typeof data.subcategory === 'undefined') {
            return {
                success: false,
                error: {
                    code: 400, // Changed from 404
                    message: getMessage('SUBCATEGORY_REQUIRED')
                }
            };
        }

        // Check seller approval - Fixed: Changed code to 403 (Forbidden)
        if (identity.isSellerApproved === false) {
            return {
                success: false,
                error: {
                    code: 403, // Changed from 404 to 403
                    message: "Your seller account isn't approved yet"
                }
            };
        }

        // Check for existing product
        const query = {
            isDeleted: false,
            name: data.name,
            status: "active",
            addedBy: identity.id
        };

        // Only add sku to query if it exists
        if (data.sku) {
            query.sku = data.sku;
        }

        // Set inStock based on stock
        if (data.stock && (Number(data.stock) === 0)) {
            data.inStock = false;
        } else {
            data.inStock = true;
        }

        try {
            const existingProduct = await LsrProduct.findOne(query);
            
            if (existingProduct) {
                return {
                    success: false,
                    error: {
                        code: 400,
                        message: getMessage('ALREADY_EXIST')
                    }
                };
            }

            // Generate slug
            let catgeoryName = "";
            let subCategoryName = "";
            
            if (data.category && data.subcategory) {
                // Fetch category and subcategory details
                const category = await LsrCategory.findById(data.category);
                const subcategory = await LsrCategory.findById(data.subcategory);
                
                if (category) {
                    catgeoryName = category.name.toLowerCase().replace(/\W+(?!$)/g, '-');
                }
                
                if (subcategory) {
                    subCategoryName = subcategory.name.toLowerCase().replace(/\W+(?!$)/g, '-');
                }
                
                // Create slug using IDs (safer than names)
                data.slug = `cat-${data.category}-sub-${data.subcategory}-${data.name.toLowerCase().replace(/\W+(?!$)/g, '-')}-${Date.now()}`;
            } else {
                data.slug = data.name.toLowerCase().replace(/\W+(?!$)/g, '-') + 
                    '-' + Date.now();
            }

            // Add user context
            data.addedBy = identity.id;
            data.updatedBy = identity.id;
            
            // Ensure required fields
            data.status = data.status || "active";
            data.isDeleted = false;

            const product = await LsrProduct.create(data);
            
            return {
                success: true,
                code: 200,
                message: getMessage('SAVED'),
                data: product
            };

        } catch (error) {
            console.error('Save product error:', error);
            return {
                success: false,
                error: {
                    code: 400,
                    message: error.message
                }
            };
        }
    }

    static async updateProduct(data, context) {
        // Validate input
        if (!data || !data.id) {
            return {
                success: false,
                error: {
                    code: 400,
                    message: "Product ID is required"
                }
            };
        }
        
        // Check if identity exists
        if (!context || !context.identity) {
            return {
                success: false,
                error: {
                    code: 401,
                    message: "Authentication required"
                }
            };
        }

        // Set inStock based on stock
        if (data.stock && (Number(data.stock) === 0)) {
            data.inStock = false;
        } else {
            data.inStock = true;
        }

        try {
            // Add updatedBy field
            data.updatedBy = context.identity.id;
            
            const product = await LsrProduct.findByIdAndUpdate(
                data.id,
                data,
                { new: true, runValidators: true }
            );

            if (!product) {
                return {
                    success: false,
                    error: {
                        code: 404,
                        message: "Product not found"
                    }
                };
            }

            return {
                success: true,
                code: 200,
                message: getMessage('UPDATED'),
                data: product
            };

        } catch (error) {
            console.error('Update product error:', error);
            return {
                success: false,
                error: {
                    code: 400,
                    message: getMessage('ISSUE_IN_UPDATE')
                }
            };
        }
    }

    static async delete(data, context) {
        // Validate input
        if (!data || !data.id) {
            return {
                success: false,
                error: {
                    code: 400,
                    message: "Product ID is required"
                }
            };
        }
        
        // Check if identity exists
        if (!context || !context.identity) {
            return {
                success: false,
                error: {
                    code: 401,
                    message: "Authentication required"
                }
            };
        }

        try {
            const product = await LsrProduct.findByIdAndUpdate(
                data.id,
                { 
                    isDeleted: true,
                    updatedBy: context.identity.id 
                },
                { new: true }
            );

            if (!product) {
                return {
                    success: false,
                    error: {
                        code: 404,
                        message: "Product not found"
                    }
                };
            }

            return {
                success: true,
                code: 200,
                message: "Product deleted successfully",
                data: product
            };

        } catch (error) {
            console.error('Delete product error:', error);
            return {
                success: false,
                error: {
                    code: 400,
                    message: "There is some issue with the product deletion"
                }
            };
        }
    }

    static async getProductById(id) {
        // Validate input
        if (!id) {
            return {
                success: false,
                error: {
                    code: 400,
                    message: "Product ID is required"
                }
            };
        }

        try {
            const product = await LsrProduct.findById(id)
                .populate("category")
                .populate("subcategory")
                .populate("brand")
                .populate("seller")
                .populate("addedBy");

            if (!product) {
                return {
                    success: false,
                    error: {
                        code: 404,
                        message: "Product not found"
                    }
                };
            }

            return {
                success: true,
                data: product
            };

        } catch (error) {
            console.error('Get product error:', error);
            return {
                success: false,
                error: {
                    code: 400,
                    message: error.message
                }
            };
        }
    }
}

module.exports = { LsrProductService };