const express = require('express');
const router = express.Router();
const lsrCategoryController = require('../controllers/LsrCategoryController');
const authMiddleware = require('../middleware/authmiddleware');

// Protected routes (require auth token)
router.post('/categories', authMiddleware, lsrCategoryController.save);
router.put('/categories/:id', authMiddleware, lsrCategoryController.update);
router.delete('/categories/:id', authMiddleware, lsrCategoryController.delete);
router.post('/categories/bulk', authMiddleware, lsrCategoryController.saveBulkCategory);
router.post('/categories/bulk/main', authMiddleware, lsrCategoryController.saveBulkMainCategory);

// Public routes
router.get('/categories/:id', lsrCategoryController.getCategory);
router.get('/categories', lsrCategoryController.getAllCategory);
router.get('/categories/subcategory/all', lsrCategoryController.getAllCategorySubcategory);

module.exports = router;