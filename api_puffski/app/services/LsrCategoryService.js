const LsrCategory = require('../models/lsrCategory');
const { constants } = require('../utils/constants');
const { ObjectId } = require('mongodb');


class LsrCategoryService {
    static async saveCategory(data, context) {
        if (!data.name || typeof data.name === 'undefined') {
            return {
                success: false,
                error: {
                    code: 404,
                
                    message: 'Category name is required'
                }
            };
        }

        const query = {
            isDeleted: false,
            name: data.name,
            addedBy: data.addedBy,
            status: "active"
        };

        try {
            const existingCategory = await LsrCategory.findOne(query);
            if (existingCategory) {
                return {
                    success: false,
                    error: {
                        code: 400,
                        message: 'Category already exists'
                        
                    }
                };
            }

            const category = await LsrCategory.create(data);
            return {
                success: true,
                code: 200,
                data: { category, 
                    message: 'Category created successfully'
                     
                }
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 400,
                    message: error.message
                }
            };
        }
    }

    static async updateCategory(data, context) {
        const query = {
            name: data.name,
            _id: { $ne: new ObjectId(data.id) },
            isDeleted: false
        };

        try {
            const existingCategory = await LsrCategory.findOne(query);
            if (existingCategory) {
                return {
                    success: false,
                    error: {
                        code: 400,
                        message: constants.category.CATEGORY_ALREADY_EXIST
                    }
                };
            }

            const category = await LsrCategory.findByIdAndUpdate(
                data.id,
                data,
                { new: true, runValidators: true }
            );

            return {
                success: true,
                code: 200,
                data: { category, message: constants.category.UPDATED_CATEGORY }
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 400,
                    message: error.message
                }
            };
        }
    }

    static async delete(data, context) {
        try {
            const category = await LsrCategory.findByIdAndUpdate(
                data.id,
                { isDeleted: true },
                { new: true }
            );

            if (!category) {
                return {
                    success: false,
                    error: {
                        code: 404,
                        message: "Category not found"
                    }
                };
            }

            return {
                success: true,
                code: 200,
                message: "Category deleted successfully",
                data: category
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 400,
                    message: "There is some issue with the category deletion"
                }
            };
        }
    }
}

module.exports = { LsrCategoryService };