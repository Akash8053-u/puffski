const express = require('express');
const router = express.Router();

// Import all controllers
const lsrProductsController = require('../controllers/LsrProductsController');
const lsrCategoryController = require('../controllers/LsrCategoryController');
const lsrBrandController = require('../controllers/LsrBrandsController');
const lsrCartController = require('../controllers/LsrCartController'); // Add this
const lsrPaymentController = require('../controllers/LsrPaymentController'); // Add this
// const lsrWishlistController = require('../controllers/WhislistController'); // Add this
const authenticate = require('../middleware/authmiddleware');

// ===== PUBLIC ROUTES =====

// Products
router.get('/products', lsrProductsController.getAllProduct);
router.get('/products/:id', lsrProductsController.getProduct);

// Categories 
router.get('/categories', lsrCategoryController.getAllCategory);
router.get('/categories/:id', lsrCategoryController.getCategory);
router.get('/categories/subcategory/all', lsrCategoryController.getAllCategorySubcategory);

// Product Categories
router.get('/products/categories/main', lsrProductsController.getMainCategory);
router.get('/products/categories/sub', lsrProductsController.getSubCategory);

// Brands
router.get('/brands', lsrBrandController.getAllBrands);
router.get('/brands/dropdown', lsrBrandController.getBrandsDropdown);
router.get('/brands/:id', lsrBrandController.getBrand);

// ===== AUTHENTICATED ROUTES =====
router.use(authenticate);

// PRODUCT ROUTES
router.post('/products', lsrProductsController.save);
router.put('/products/:id', lsrProductsController.update);
router.delete('/products/:id', lsrProductsController.delete);

// CATEGORY ROUTES
router.post('/categories', lsrCategoryController.save);
router.put('/categories/:id', lsrCategoryController.update);
router.delete('/categories/:id', lsrCategoryController.delete);
router.post('/categories/bulk', lsrCategoryController.saveBulkCategory);
router.post('/categories/bulk/main', lsrCategoryController.saveBulkMainCategory);

// BRAND ROUTES
router.post('/brands', lsrBrandController.save);
router.put('/brands/:id', lsrBrandController.update);
router.delete('/brands/:id', lsrBrandController.delete);
router.post('/brands/bulk/main', lsrBrandController.saveBulkMainBrands);

// ===== CART ROUTES (All from Sails config) =====

// Regular cart routes (matching Sails endpoints)
router.get('/get_cart', lsrCartController.getCart);
router.get('/get_reservedcart', lsrCartController.getReservedCart);
router.post('/add_cart', lsrCartController.saveCart);
router.post('/add_reservecart', lsrCartController.saveReserveCart);
router.post('/cart/multiple', lsrCartController.saveReserveCartMultiple);
router.delete('/delete_cart', lsrCartController.deleteCart);
router.delete('/destroy/cart', lsrCartController.emptyCart);
router.put('/update_cart', lsrCartController.updateCart);
router.get('/check/quantity', lsrCartController.checkQuantityInCart);
router.get('/check/cart/quantity', lsrCartController.checkReservedCart);

// Additional Sails cart route
// router.get('/check/order/quantity', lsrCartController.checkInCart);

// LSR-specific cart routes (prefixed with /lsr/)
router.post('/add_reservecart', lsrCartController.saveReserveCart);
router.delete('/destroy/cart', lsrCartController.emptyCart);
router.delete('/delete_cart', lsrCartController.deleteCart);
router.put('/update_cart', lsrCartController.updateCart);
router.get('/get_reservedcart', lsrCartController.getReservedCart);

// ===== PAYMENT ROUTES =====
router.post('/payment/cards', lsrPaymentController.addCard);
router.get('/payment/cards', lsrPaymentController.getMonerisCards);
router.delete('/payment/cards/:id', lsrPaymentController.deleteCard);
router.post('/payment/checkout', lsrPaymentController.monerisCheckout);

// LSR-specific payment routes (alternative naming)
router.post('/add_card', lsrPaymentController.addCard);
router.get('/get_card', lsrPaymentController.getMonerisCards);
router.delete('/delete_card/:id', lsrPaymentController.deleteCard);
router.post('/checkout', lsrPaymentController.monerisCheckout);

// ===== WISHLIST ROUTES =====
// router.get('/wishlist', lsrWishlistController.whislistProducts);
// router.post('/wishlist/add', lsrWishlistController.whislistProduct);

// Additional route from Sails
// router.get('/whislist', lsrWishlistController.whislistProducts); // Note: Sails has 'whislist' typo
// router.post('/whislist/add', lsrWishlistController.whislistProduct); // Note: Sails has 'whislist' typo

module.exports = router;