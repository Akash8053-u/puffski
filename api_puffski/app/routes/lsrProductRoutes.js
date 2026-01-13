const express = require('express');
const router = express.Router();
const lsrProductsController = require('../controllers/LsrProductsController');
const authMiddleware = require('../middleware/authmiddleware');

// Public routes
router.get('/products', lsrProductsController.getAllProduct);
router.get('/products/:id', lsrProductsController.getProduct);
router.get('/categories/main', lsrProductsController.getMainCategory);
router.get('/categories/sub', lsrProductsController.getSubCategory);

// Protected routes (require auth token)
router.post('/products', authMiddleware, lsrProductsController.save);
router.put('/products/:id', authMiddleware, lsrProductsController.update);
router.delete('/products/:id', authMiddleware, lsrProductsController.delete);

module.exports = router;