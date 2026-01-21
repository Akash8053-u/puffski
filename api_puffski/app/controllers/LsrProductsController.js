const { ObjectId } = require('mongodb');
const LsrProduct = require('../models/lsrProduct');
const { LsrProductService } = require('../services/LsrProductService');

const searchProducts = (data, searchTerm) => {
    if (!searchTerm || !data || !Array.isArray(data)) {
        return data || [];
    }

    const lowerSearchTerm = searchTerm.toLowerCase();

    return data.filter(item => {
        const descriptionMatch = item.description
            ? item.description.toLowerCase().includes(lowerSearchTerm)
            : false;

        const nameMatch = item.name
            ? item.name.toLowerCase().includes(lowerSearchTerm)
            : false;

        const keywordsMatch = item.keywords && Array.isArray(item.keywords)
            ? item.keywords.some(keyword =>
                keyword && keyword.toLowerCase().includes(lowerSearchTerm)
            )
            : false;

        const businessNameMatch = item.addedBy && item.addedBy.businessName
            ? item.addedBy.businessName.toLowerCase().includes(lowerSearchTerm)
            : false;

        const brandMatch = item.brand && item.brand.name
            ? item.brand.name.toLowerCase().includes(lowerSearchTerm)
            : false;

        return descriptionMatch || keywordsMatch || businessNameMatch || nameMatch || brandMatch;
    });
};

const getUniqueCategoriesAndSubcategories = (products) => {
    const uniqueCategories = new Map();
    const uniqueSubcategories = new Map();

    products.forEach(product => {
        if (product.category && product.category.isDeleted === false) {
            uniqueCategories.set(product.category.name, product.category);
        }
        if (product.subcategory && product.category.isDeleted === false) {
            uniqueSubcategories.set(product.subcategory.name, product.subcategory);
        }
    });

    return {
        categories: Array.from(uniqueCategories.values()),
        subcategories: Array.from(uniqueSubcategories.values())
    };
};

module.exports = {
    save: async (req, res) => {
        try {
            const User = require('../models/users');
            const user = await User.findById(req.identity.id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: { code: 404, message: 'User not found' }
                });
            }

            // if (!user.isSellerApproved) {
            //     return res.status(403).json({
            //         success: false,
            //         error: {
            //             code: 403,
            //             message: 'Seller account is not approved yet. Please contact admin for approval.'
            //         }
            //     });
            // }
      
            const result = await LsrProductService.saveProduct(req.body, { identity: req.identity });

            if (!result.success) {
                return res.status(result.error.code || 400).json(result);
            }

            res.status(201).json(result);
        } catch (error) {
            console.error('Save product error:', error);
            res.status(500).json({
                success: false,
                error: { code: 500, message: error.message }
            });
        }
    },


    update: async (req, res) => {
        try {
            const data = { ...req.body, id: req.params.id };
                        const result = await LsrProductService.updateProduct(data, { identity: req.identity });

            if (!result.success) {
                return res.status(result.error.code || 400).json(result);
            }

            res.json(result);
        } catch (error) {
            console.error('Update product error:', error);
            res.status(500).json({
                success: false,
                error: { code: 500, message: error.message }
            });
        }
    },

    delete: async (req, res) => {
        try {
            const data = { id: req.params.id };
            const result = await LsrProductService.delete(data, { identity: req.identity });

            if (!result.success) {
                return res.status(result.error.code || 400).json(result);
            }

            res.json(result);
        } catch (error) {
            console.error('Delete product error:', error);
            res.status(500).json({
                success: false,
                error: { code: 500, message: error.message }
            });
        }
    },

    getProduct: async (req, res) => {
        try {
            const result = await LsrProductService.getProductById(req.params.id);

            if (!result.success) {
                return res.status(result.error.code || 404).json(result);
            }

            res.json(result);
        } catch (error) {
            console.error('Get product error:', error);
            res.status(500).json({
                success: false,
                error: { code: 500, message: error.message }
            });
        }
    },

    getAllProduct: async (req, res) => {
        try {
            const search = req.query.search;
            let sortBy = req.query.sortBy;
            const page = parseInt(req.query.page) || 1;
            const count = parseInt(req.query.count) || 10;
            const skipNo = (page - 1) * count;
            const categoryId = req.query.categoryId;
            const subcategoryId = req.query.subcategoryId;
            const brand = req.query.brand;
            const addedBy = req.query.addedBy;
            const userby = req.query.userby || req.identity?.id;
            const city = req.query.city;
            const status = req.query.status;
            const inStock = req.query.inStock;
            const isSellerApproved = req.query.isSellerApproved;

            const query = {};

            if (sortBy) {
                if (sortBy === "newest") { sortBy = '-createdAt'; }
                else if (sortBy === "price-low") { sortBy = 'price'; }
                else if (sortBy === "price-high") { sortBy = '-price'; }
                else if (sortBy === "best-selling") { sortBy = '-createdAt'; }
                else { sortBy = '-createdAt'; }
            } else {
                sortBy = '-createdAt';
            }

            query.isDeleted = false;

            if (categoryId) {
                query.category = categoryId;
            }
            if (subcategoryId) {
                query.subcategory = subcategoryId;
            }
            if (brand) {
                query.brand = brand;
            }
            if (addedBy) {
                query.addedBy = addedBy;
            }
            if (city) {
                query.city = city;
            }

            if (inStock) {
                if (inStock === "true") { query.inStock = true; }
                if (inStock === "false") { query.inStock = false; }
            }

            if (status) {
                if (status === "in-stock") { query.inStock = true; }
                if (status === "out-of-stock") { query.inStock = false; }
            }

            const total = await LsrProduct.countDocuments(query);

            const products = await LsrProduct.find(query)
                .populate("category")
                .populate("subcategory")
                .populate("brand")
                .populate("seller")
                .populate("addedBy")
                .sort(sortBy)
                .skip(skipNo)
                .limit(count);

            let allProducts = "";
            let flag = false;

            if (search) {
                allProducts = searchProducts(products, search);
                flag = true;
            } else {
                allProducts = products;
                flag = false;
            }

            // Process without whislist for now
            let allProductData = allProducts.map(product => {
                return { ...product.toObject(), isFavourite: false };
            });

            if (status === "low-stock") {
                allProductData = allProductData.filter(
                    (product) => product.lowStock != null && product.stock != null && product.lowStock >= product.stock
                );
            }

            if (isSellerApproved === "true") {
                allProductData = allProductData.filter(
                    (product) => product.addedBy?.isSellerApproved === true
                );
            } else if (isSellerApproved === "false") {
                allProductData = allProductData.filter(
                    (product) => product.addedBy?.isSellerApproved === false
                );
            }

            const filteredTotal = allProductData.length;
            const paginatedProducts = allProductData.slice(skipNo, skipNo + count);

            return res.json({
                success: true,
                message: "Products fetch successfully",
                data: paginatedProducts,
                total: filteredTotal,
            });

        } catch (err) {
            console.error(err);
            return res.status(400).json({
                success: false,
                error: { code: 400, message: err.message },
            });
        }
    },

    getMainCategory: async (req, res) => {
        try {
            const search = req.query.search;
            let sortBy = '-createdAt';
            const page = parseInt(req.query.page) || 1;
            const count = parseInt(req.query.count) || 10;
            const skipNo = (page - 1) * count;
            const categoryId = req.query.categoryId;
            const subcategoryId = req.query.subcategoryId;
            const brand = req.query.brand;
            const addedBy = req.query.addedBy;
            const userby = req.query.userby;
            const city = req.query.city;
            const status = req.query.status;
            const isDeleted = req.query.isDeleted;

            const query = {};

            if (categoryId) {
                query.category = categoryId;
            }
            if (subcategoryId) {
                query.subcategory = subcategoryId;
            }
            if (brand) {
                query.brand = brand;
            }
            if (addedBy) {
                query.addedBy = addedBy;
            }
            if (city) {
                query.city = city;
            }

            if (isDeleted) {
                query.isDeleted = isDeleted === "true";
            } else {
                query.isDeleted = false;
            }

            const total = await LsrProduct.countDocuments(query);

            const products = await LsrProduct.find(query)
                .populate("category")
                .populate("subcategory")
                .populate("brand")
                .sort(sortBy)
                .skip(skipNo)
                .limit(count);

            if (products && products.length > 0) {
                const result = getUniqueCategoriesAndSubcategories(products);
                return res.json({
                    success: true,
                    message: "Category fetch successfully",
                    data: result.categories,
                    total: result.categories.length
                });
            } else {
                return res.json({
                    success: true,
                    message: "Category fetch successfully",
                    total: 0,
                    data: [],
                });
            }
        } catch (err) {
            console.error(err);
            return res.status(400).json({
                success: false,
                error: { code: 400, message: '' + err },
            });
        }
    },

    getSubCategory: async (req, res) => {
        try {
            const search = req.query.search;
            let sortBy = '-createdAt';
            const page = parseInt(req.query.page) || 1;
            const count = parseInt(req.query.count) || 10;
            const skipNo = (page - 1) * count;
            const categoryId = req.query.categoryId;
            const subcategoryId = req.query.subcategoryId;
            const brand = req.query.brand;
            const addedBy = req.query.addedBy;
            const userby = req.query.userby;
            const city = req.query.city;
            const status = req.query.status;

            const query = { isDeleted: false };

            if (categoryId) {
                query.category = categoryId;
            }
            if (subcategoryId) {
                query.subcategory = subcategoryId;
            }
            if (brand) {
                query.brand = brand;
            }
            if (addedBy) {
                query.addedBy = addedBy;
            }
            if (city) {
                query.city = city;
            }

            const total = await LsrProduct.countDocuments(query);

            const products = await LsrProduct.find(query)
                .populate("category")
                .populate("subcategory")
                .populate("brand")
                .sort(sortBy)
                .skip(skipNo)
                .limit(count);

            if (products && products.length > 0) {
                const result = getUniqueCategoriesAndSubcategories(products);
                return res.json({
                    success: true,
                    message: "SubCategory fetch successfully",
                    total: result.subcategories.length,
                    data: result.subcategories,
                });
            } else {
                return res.json({
                    success: true,
                    message: "Sub Category fetch successfully",
                    total: 0,
                    data: [],
                });
            }
        } catch (err) {
            console.error(err);
            return res.status(400).json({
                success: false,
                error: { code: 400, message: '' + err },
            });
        }
    },
};