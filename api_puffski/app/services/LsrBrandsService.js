const LsrBrand = require('../models/LsrBrands');
const { ObjectId } = require('mongodb');
const constants = require('../utils/constants')
class LsrBrandService {
    static async saveBrand(data, context) {
        try {
            // Validation
            if (!data.name || typeof data.name === 'undefined') {
                return {
                    success: false,
                    error: {
                        code: 400,
                        message: constants.LsrBrand.NAME_REQUIRED
                    }
                };
            }

          
            if (context && context.identity) {
                data.addedBy = context.identity.id;
            }

            
            const existingBrand = await LsrBrand.findOne({
                name: data.name,
                addedBy: data.addedBy,
                isDeleted: false
            });

            if (existingBrand) {
                return {
                    success: false,
                    error: {
                        code: 400,
                        message: constants.LsrBrand.BRANDS_ALREADY_EXIST
                    }
                };
            }

            if (!data.status) {
                data.status = 'active';
            }
            data.isDeleted = false;

            const brand = await LsrBrand.create(data);

            return {
                success: true,
                code: 201,
                message: constants.LsrBrand.BRANDS_SAVED,
                data: brand
            };

        } catch (error) {
            console.error('Save brand error:', error);
            return {
                success: false,
                error: {
                    code: 400,
                    message: error.message
                }
            };
        }
    }

    static async updateBrand(data, context) {
        try {
           
            if (!data.id) {
                return {
                    success: false,
                    error: {
                        code: 400,
                        message: 'Brand ID is required'
                    }
                };
            }

         
            const existingBrand = await LsrBrand.findOne({
                _id: data.id,
                isDeleted: false
            });

            if (!existingBrand) {
                return {
                    success: false,
                    error: {
                        code: 404,
                        message: constants.LsrBrand.BRAND_NOT_FOUND
                    }
                };
            }

          
            if (data.name) {
                const duplicateBrand = await LsrBrand.findOne({
                    _id: { $ne: data.id },
                    name: data.name,
                    addedBy: existingBrand.addedBy,
                    isDeleted: false
                });

                if (duplicateBrand) {
                    return {
                        success: false,
                        error: {
                            code: 400,
                            message: constants.LsrBrand.BRANDS_ALREADY_EXIST
                        }
                    };
                }
            }

            const updatedBrand = await LsrBrand.findByIdAndUpdate(
                data.id,
                data,
                { new: true, runValidators: true }
            );

            return {
                success: true,
                code: 200,
                message: constants.LsrBrand.UPDATED_BRANDS,
                data: updatedBrand
            };

        } catch (error) {
            console.error('Update brand error:', error);
            return {
                success: false,
                error: {
                    code: 400,
                    message: error.message || constants.LsrBrand.ISSUE_IN_UPDATE
                }
            };
        }
    }

    static async deleteBrand(data, context) {
        try {
            if (!data.id) {
                return {
                    success: false,
                    error: {
                        code: 400,
                        message: 'Brand ID is required'
                    }
                };
            }

            const brand = await LsrBrand.findByIdAndUpdate(
                data.id,
                { isDeleted: true },
                { new: true }
            );

            if (!brand) {
                return {
                    success: false,
                    error: {
                        code: 404,
                        message: constants.LsrBrand.BRAND_NOT_FOUND
                    }
                };
            }

            return {
                success: true,
                code: 200,
                message: 'Brand deleted successfully',
                data: brand
            };

        } catch (error) {
            console.error('Delete brand error:', error);
            return {
                success: false,
                error: {
                    code: 400,
                    message: error.message
                }
            };
        }
    }

    static async getBrandById(id) {
        try {
            if (!id) {
                return {
                    success: false,
                    error: {
                        code: 400,
                        message: 'Brand ID is required'
                    }
                };
            }

            const brand = await LsrBrand.findById(id)
                .populate('addedBy', 'name email businessName');

            if (!brand || brand.isDeleted) {
                return {
                    success: false,
                    error: {
                        code: 404,
                        message: constants.LsrBrand.BRAND_NOT_FOUND
                    }
                };
            }

            return {
                success: true,
                data: brand
            };

        } catch (error) {
            console.error('Get brand by ID error:', error);
            return {
                success: false,
                error: {
                    code: 400,
                    message: error.message
                }
            };
        }
    }

    static async saveBulkBrands(brandsData, context) {
        try {
            if (!brandsData || !Array.isArray(brandsData) || brandsData.length === 0) {
                return {
                    success: false,
                    error: {
                        code: 400,
                        message: 'Brands data is required'
                    }
                };
            }

            const errors = [];
            const savedBrands = [];

            for (const brandData of brandsData) {
                try {
                    
                    brandData.addedBy = context.identity.id;
                    
                    if (brandData.id) {
                        
                        const updatedBrand = await LsrBrand.findByIdAndUpdate(
                            brandData.id,
                            brandData,
                            { new: true, runValidators: true }
                        );
                        savedBrands.push(updatedBrand);
                    } else {
                       
                       
                        const existingBrand = await LsrBrand.findOne({
                            name: brandData.name,
                            addedBy: context.identity.id,
                            isDeleted: false
                        });

                        if (existingBrand) {
                    
                            const updatedBrand = await LsrBrand.findByIdAndUpdate(
                                existingBrand._id,
                                brandData,
                                { new: true, runValidators: true }
                            );
                            savedBrands.push(updatedBrand);
                        } else {
                         
                            const newBrand = await LsrBrand.create(brandData);
                            savedBrands.push(newBrand);
                        }
                    }
                } catch (error) {
                    errors.push({
                        brand: brandData.name || 'Unknown brand',
                        error: error.message
                    });
                }
            }

            return {
                success: true,
                message: `Processed ${savedBrands.length} brands successfully`,
                data: savedBrands,
                errors: errors.length > 0 ? errors : undefined
            };

        } catch (error) {
            console.error('Bulk save brands error:', error);
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

module.exports = { LsrBrandService };