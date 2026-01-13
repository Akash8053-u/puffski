const { ObjectId } = require('mongodb');
const LsrCategory = require('../models/lsrCategory');
const { LsrCategoryService } = require('../services/LsrCategoryService');

const groupCategoriesByParent = (categories) => {
    const grouped = {};
    categories.forEach(item => {
        if (item.parentId && item.parentId !== undefined) {
            const parentKey = item.parentId.id || item.parentId._id;
            if (!grouped[parentKey]) {
                grouped[parentKey] = {
                    name: item.parentId.name,
                    addedBy: item.parentId.addedBy,
                    isMaster: item.parentId.isMaster,
                    status: item.parentId.status,
                    isDeleted: item.parentId.isDeleted,
                    id: item.parentId.id || item.parentId._id,
                    subcategories: []     
                };
            }
            const { parentId, ...subcategoryItem } = item.toObject ? item.toObject() : item;
            grouped[parentKey].subcategories.push(subcategoryItem);
        }
    });
    return Object.values(grouped);
};

const arrangeCategories = (categories, addedById) => {
    const result = [];
    const masterCategories = categories.filter(cat => cat.isMaster);
    masterCategories.forEach(master => {
        const arrangedMaster = { ...master.toObject(), subcategories: [] };
        categories.forEach(sub => {
            if (sub.parentId && 
                (sub.parentId.id === master.id || sub.parentId._id.toString() === master._id.toString()) && 
                !sub.isMaster && 
                sub.addedBy.toString() === addedById) {
                arrangedMaster.subcategories.push({
                    addedBy: sub.addedBy,
                    name: sub.name,
                    isMaster: sub.isMaster,
                    status: sub.status,
                    isDeleted: sub.isDeleted,
                    createdAt: sub.createdAt,
                    updatedAt: sub.updatedAt,
                    id: sub.id || sub._id
                });
            }
        });
        result.push(arrangedMaster);
    });
    return result;
};

module.exports = {
    save: async (req, res) => {
        try {
            const result = await LsrCategoryService.saveCategory(req.body, { identity: req.identity });
            if (!result.success) return res.status(result.error.code || 400).json(result);
            res.status(201).json(result);
        } catch (error) {
            res.status(500).json({ success: false, error: { code: 500, message: error.message } });
        }
    },

    update: async (req, res) => {
        try {
            const data = { ...req.body, id: req.params.id };
            const result = await LsrCategoryService.updateCategory(data, { identity: req.identity });
            if (!result.success) return res.status(result.error.code || 400).json(result);
            res.json(result);
        } catch (error) {
            res.status(500).json({ success: false, error: { code: 500, message: error.message } });
        }
    },

    delete: async (req, res) => {
        try {
            const data = { id: req.params.id };
            const result = await LsrCategoryService.delete(data, { identity: req.identity });
            if (!result.success) return res.status(result.error.code || 400).json(result);
            res.json(result);
        } catch (error) {
            res.status(500).json({ success: false, error: { code: 500, message: error.message } });
        }
    },

    getCategory: async (req, res) => {
        try {
            const id = req.params.id;
            const category = await LsrCategory.findById(id);
            if (category) {
                return res.json({ success: true, message: "Data fetch successfully", data: category });
            } else {
                return res.status(400).json({ success: false, error: { code: 400, message: 'Category not found' } });
            }
        } catch (err) {
            return res.status(400).json({ success: false, error: { code: 400, message: err.message } });
        }
    },

    saveBulkCategory: async (req, res) => {
        try {
            const data = req.body.data;
            if (!data || !Array.isArray(data) || data.length === 0) {
                return res.status(400).json({ success: false, error: { code: 400, message: 'Categories not found' } });
            }

            const errorMainMessage = [];
            const errorSubMessage = [];

            for (const singleResult of data) {
                try {
                    if (singleResult.id) {
                        await LsrCategory.findByIdAndUpdate(singleResult.id, singleResult, { new: true });
                        
                        if (singleResult.subcategories && singleResult.subcategories.length > 0) {
                            for (const subSingleResult of singleResult.subcategories) {
                                try {
                                    if (subSingleResult.id) {
                                        await LsrCategory.findByIdAndUpdate(subSingleResult.id, subSingleResult);
                                    } else {
                                        subSingleResult.parentId = singleResult.id;
                                        subSingleResult.addedBy = req.identity.id;
                                        subSingleResult.isMaster = false;
                                        
                                        const existing = await LsrCategory.findOne({
                                            addedBy: req.identity.id,
                                            name: subSingleResult.name,
                                            parentId: singleResult.id,
                                            isMaster: false
                                        });
                                        if (!existing) {
                                            await LsrCategory.create(subSingleResult);
                                        }
                                    }
                                } catch (subErr) {
                                    errorSubMessage.push(subErr.message);
                                }
                            }
                        }
                    } else {
                        singleResult.addedBy = req.identity.id;
                        singleResult.isMaster = true;
                        
                        const already = await LsrCategory.findOne({
                            addedBy: req.identity.id,
                            name: singleResult.name,
                            isMaster: true
                        });
                        
                        if (!already) {
                            const newCategory = await LsrCategory.create(singleResult);
                            
                            if (singleResult.subcategories && singleResult.subcategories.length > 0) {
                                for (const subSingleResult of singleResult.subcategories) {
                                    try {
                                        subSingleResult.parentId = newCategory._id;
                                        subSingleResult.addedBy = req.identity.id;
                                        subSingleResult.isMaster = false;
                                        
                                        const subAlready = await LsrCategory.findOne({
                                            addedBy: req.identity.id,
                                            name: subSingleResult.name,
                                            isMaster: false
                                        });
                                        if (!subAlready) {
                                            await LsrCategory.create(subSingleResult);
                                        }
                                    } catch (subErr) {
                                        errorSubMessage.push(subErr.message);
                                    }
                                }
                            }
                        } else {
                            await LsrCategory.findByIdAndUpdate(already._id, singleResult);
                            
                            if (singleResult.subcategories && singleResult.subcategories.length > 0) {
                                for (const subSingleResult of singleResult.subcategories) {
                                    try {
                                        subSingleResult.parentId = already._id;
                                        subSingleResult.addedBy = req.identity.id;
                                        subSingleResult.isMaster = false;
                                        
                                        const subAlready = await LsrCategory.findOne({
                                            addedBy: req.identity.id,
                                            name: subSingleResult.name,
                                            parentId: already._id,
                                            isMaster: false
                                        });
                                        if (!subAlready) {
                                            await LsrCategory.create(subSingleResult);
                                        }
                                    } catch (subErr) {
                                        errorSubMessage.push(subErr.message);
                                    }
                                }
                            }
                        }
                    }
                } catch (err) {
                    errorMainMessage.push(err.message);
                }
            }

            return res.json({
                success: true,
                message: "Data processed successfully",
                mainCategoryError: errorMainMessage,
                subCategoryError: errorSubMessage
            });
        } catch (err) {
            return res.status(400).json({ success: false, error: { code: 400, message: err.message } });
        }
    },

    saveBulkMainCategory: async (req, res) => {
        try {
            const data = req.body.data;
            if (!data || !Array.isArray(data) || data.length === 0) {
                return res.status(400).json({ success: false, error: { code: 400, message: 'Categories not found' } });
            }

            const errorMainMessage = [];

            for (const singleResult of data) {
                try {
                    if (singleResult.id) {
                        await LsrCategory.findByIdAndUpdate(singleResult.id, singleResult, { new: true });
                    } else {
                        singleResult.addedBy = req.identity.id;
                        singleResult.isMaster = true;
                        
                        const already = await LsrCategory.findOne({
                            name: singleResult.name,
                            isMaster: true
                        });
                        
                        if (!already) {
                            await LsrCategory.create(singleResult);
                        } else {
                            await LsrCategory.findByIdAndUpdate(already._id, singleResult);
                        }
                    }
                } catch (err) {
                    errorMainMessage.push(err.message);
                }
            }

            return res.json({
                success: true,
                message: "Data processed successfully",
                mainCategoryError: errorMainMessage
            });
        } catch (err) {
            return res.status(400).json({ success: false, error: { code: 400, message: err.message } });
        }
    },

    getAllCategory: async (req, res) => {
        try {
            const { search, sortBy = 'createdAt_desc', page = 1, count = 10, isMaster, categoryId, addedBy } = req.query;
            const skipNo = (parseInt(page) - 1) * parseInt(count);
            const query = { isDeleted: false };

            if (isMaster) query.isMaster = isMaster === 'true';
            if (categoryId) query.parentId = categoryId;
            if (addedBy) query.addedBy = new ObjectId(addedBy);
            
            if (search) {
                query.$or = [{ name: { $regex: search, $options: 'i' } }];
            }

            const sortMap = {
                'createdAt_desc': { createdAt: -1 },
                'createdAt_asc': { createdAt: 1 },
                'name_asc': { name: 1 },
                'name_desc': { name: -1 }
            };
            const sort = sortMap[sortBy] || { createdAt: -1 };

            const [categories, total] = await Promise.all([
                LsrCategory.find(query)
                    .populate('parentId')
                    .sort(sort)
                    .skip(skipNo)
                    .limit(parseInt(count)),
                LsrCategory.countDocuments(query)
            ]);

            return res.json({
                success: true,
                data: { category: categories, total }
            });
        } catch (err) {
            return res.status(400).json({ success: false, error: { code: 400, message: err.message } });
        }
    },

    getAllCategorySubcategory: async (req, res) => {
        try {
            const { search, sortBy = 'createdAt_desc', page = 1, count = 10, isMaster, categoryId } = req.query;
            const addedBy = req.query.addedBy || req.identity?.id;
            const skipNo = (parseInt(page) - 1) * parseInt(count);
            const query = { isDeleted: false };

            if (isMaster) query.isMaster = isMaster === 'true';
            if (categoryId) query.parentId = categoryId;

            if (search) {
                query.$or = [{ name: { $regex: search, $options: 'i' } }];
            }

            const sortMap = {
                'createdAt_desc': { createdAt: -1 },
                'createdAt_asc': { createdAt: 1 },
                'name_asc': { name: 1 },
                'name_desc': { name: -1 }
            };
            const sort = sortMap[sortBy] || { createdAt: -1 };

            const categories = await LsrCategory.find(query)
                .populate('parentId')
                .sort(sort)
                .skip(skipNo)
                .limit(parseInt(count));

            let categoryData = categories;
            if (categories && categories.length > 0 && addedBy) {
                categoryData = arrangeCategories(categories, addedBy);
            }

            return res.json({
                success: true,
                data: {
                    category: categoryData,
                    total: categoryData.length
                }
            });
        } catch (err) {
            return res.status(400).json({ success: false, error: { code: 400, message: err.message } });
        }
    }
};