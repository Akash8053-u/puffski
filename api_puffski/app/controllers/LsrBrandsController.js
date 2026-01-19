
const { LsrBrandService } = require('../services/LsrBrandsService');

module.exports = {
    // Save single brand
    save: async (req, res) => {
        try {
            const result = await LsrBrandService.saveBrand(req.body, { 
                identity: req.identity 
            });
            
            if (!result.success) {
                return res.status(result.error.code || 400).json(result);
            }
            
            res.status(201).json(result);
        } catch (error) {
            console.error('Save brand controller error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 500,
                    message: error.message
                }
            });
        }
    },

    // Update brand
    update: async (req, res) => {
        try {
            const data = { ...req.body, id: req.params.id };
            const result = await LsrBrandService.updateBrand(data, { 
                identity: req.identity 
            });
            
            if (!result.success) {
                return res.status(result.error.code || 400).json(result);
            }
            
            res.json(result);
        } catch (error) {
            console.error('Update brand controller error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 500,
                    message: error.message
                }
            });
        }
    },

    // Delete brand
    delete: async (req, res) => {
        try {
            const data = { id: req.params.id };
            const result = await LsrBrandService.deleteBrand(data, { 
                identity: req.identity 
            });
            
            if (!result.success) {
                return res.status(result.error.code || 400).json(result);
            }
            
            res.json(result);
        } catch (error) {
            console.error('Delete brand controller error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 500,
                    message: error.message
                }
            });
        }
    },

    // Get single brand
    getBrand: async (req, res) => {
        try {
            const result = await LsrBrandService.getBrandById(req.params.id);
            
            if (!result.success) {
                return res.status(result.error.code || 404).json(result);
            }
            
            res.json(result);
        } catch (error) {
            console.error('Get brand controller error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 500,
                    message: error.message
                }
            });
        }
    },

    // Get all brands with
    getAllBrands: async (req, res) => {
        try {
            const {
                search,
                sortBy = 'createdAt_desc',
                page = 1,
                count = 10,
                addedBy,
                status
            } = req.query;
            
            const skipNo = (parseInt(page) - 1) * parseInt(count);
            const query = { isDeleted: false };
            
           
            if (addedBy) {
                query.addedBy = addedBy;
            } else if (req.identity?.id) {
                   query.addedBy = req.identity.id;
            }
            
            if (status) {
                query.status = status;
            }
        
            if (search) {
                query.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ];
            }
            
            
            const sortOptions = {
                'createdAt_desc': { createdAt: -1 },
                'createdAt_asc': { createdAt: 1 },
                'name_asc': { name: 1 },
                'name_desc': { name: -1 }
            };
            
            const sort = sortOptions[sortBy] || { createdAt: -1 };
            
            
            const [brands, total] = await Promise.all([
                LsrBrand.find(query)
                    .populate('addedBy', 'name email businessName')
                    .sort(sort)
                    .skip(skipNo)
                    .limit(parseInt(count)),
                LsrBrand.countDocuments(query)
            ]);
            
            res.json({
                success: true,
                message: "Brands fetched successfully",
                data: brands,
                pagination: {
                    page: parseInt(page),
                    count: parseInt(count),
                    total,
                    pages: Math.ceil(total / parseInt(count))
                }
            });
            
        } catch (error) {
            console.error('Get all brands controller error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 500,
                    message: error.message
                }
            });
        }
    },

    // Bulk save brands
    saveBulkMainBrands: async (req, res) => {
        try {
            const { data } = req.body;
            
            if (!data || !Array.isArray(data) || data.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 400,
                        message: 'Brands data is required'
                    }
                });
            }
            
            const result = await LsrBrandService.saveBulkBrands(data, {
                identity: req.identity
            });
            
            if (!result.success) {
                return res.status(result.error.code || 400).json(result);
            }
            
            res.json(result);
            
        } catch (error) {
            console.error('Bulk save brands controller error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 500,
                    message: error.message
                }
            });
        }
    },


    getBrandsDropdown: async (req, res) => {
        try {
            const brands = await LsrBrand.find({
                isDeleted: false,
                status: 'active',
                addedBy: req.identity?.id
            })
            .select('name _id image')
            .sort({ name: 1 });
            
            res.json({
                success: true,
                message: "Brands dropdown fetched successfully",
                data: brands
            });
            
        } catch (error) {
            console.error('Get brands dropdown controller error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 500,
                    message: error.message
                }
            });
        }
    }
};