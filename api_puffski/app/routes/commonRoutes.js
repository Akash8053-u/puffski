const express = require('express');
const router = express.Router();
const CommonController = require('../controllers/CommonController');
const cartController = require('../controllers/cartController');
// const { authenticate, authorize } = require('../middleware/authmiddleware');
const upload = require('../middleware/upload');

// ==================== PUBLIC ROUTES ====================

// Location & Address Routes
router.get('/getlocation', CommonController.onLoadLocation);
router.get('/updateCityLatlang', CommonController.updateCityLatlang);
router.get('/google/address', CommonController.googleAddress);
router.get('/google/address/lat/lng', CommonController.googleAddressLatLng);
router.get('/getHTMLFromURL', CommonController.getHTMLFromURL);
router.post('/calculate/distance', CommonController.calculateMultipleDistance);

// Geographic Data Routes
router.get('/allcities', CommonController.allcities);
router.get('/all/lower/cities', CommonController.allLowercities);
router.get('/allprovinces', CommonController.allprovince);
router.get('/searchCity', CommonController.searchCity);
router.get('/countries', CommonController.findAllCounrty);
router.get('/states', CommonController.findAllState);
router.get('/cities', CommonController.findAllCities);
router.get('/get/city', CommonController.getcityData);
router.get('/brandlist', CommonController.brandList);

// Store & Product Discovery Routes
router.get('/FeaturedData', CommonController.FeaturedData);
router.get('/feature/delivery/stores', CommonController.featuredDeliveryStores);
router.get('/reserve/pickup/stores', CommonController.reserveAheadStores);
router.post('/Search', CommonController.Search);
router.get('/mobFeaturedItem', CommonController.mobFeaturedItem);

// Store Integration Routes (External APIs)
router.get('/silver', CommonController.silverSpring);
router.get('/copper', CommonController.copper);
// router.get('/ogden', CommonController.ogden);
// router.get('/bow', CommonController.bow);
// router.get('/recordHigh', CommonController.recordHigh);
// router.get('/highlandbuds', CommonController.highlandbuds);
// router.get('/vibes', CommonController.vibes);

// Review & Analytics Routes
router.get('/itemProductReview', CommonController.ItemProductReview);
router.get('/ProductReview', CommonController.ProductReview);
router.get('/analyticReport', CommonController.analyticReport);
router.get('/productslugupdate', CommonController.getproductslugupdate);

// Website & Subscription Routes
router.post('/visit_website/:id', CommonController.visitWebsite);
router.post('/subscription', CommonController.subscription);

// ==================== PROTECTED ROUTES (Require Authentication) ====================

// Apply authentication middleware to all protected routes
// router.use(authenticate);

// User Profile & Activity Routes
router.get('/mobUserLiked', CommonController.mobUserLiked);
router.get('/totalreviews', CommonController.getReward);
router.get('/itemproducts', CommonController.dispensaryProducts);
router.get('/subscriptionTransactions', CommonController.subscriptionTransactions);
router.put('/revokedReview', CommonController.revokedReview);

// Banner Management Routes (Admin only)
// router.get('/bannerbytype', authorize(['admin']), CommonController.bannerByType);
// router.post('/banner', authorize(['admin']), CommonController.saveBanner);
// router.get('/allbanner', authorize(['admin']), CommonController.getAllBanners);
// router.get('/banner/:id', authorize(['admin']), CommonController.bannerDetail);
// router.put('/banner/:id', authorize(['admin']), CommonController.updatebanner);

// // Admin Management Routes
// router.get('/adminAllTxn', authorize(['admin']), CommonController.adminAllTxn);
// router.delete('/delete/:model/:id', authorize(['admin']), CommonController.delete);
// router.put('/changestatus/:model/:id/:status', authorize(['admin']), CommonController.changeStatus);

// // City Management Routes (Admin only)
// router.post('/city', authorize(['admin']), CommonController.addcities);
// router.put('/city/:id', authorize(['admin']), CommonController.updatecities);
// router.delete('/city/:id', authorize(['admin']), CommonController.deletecities);
// router.get('/getallcities', authorize(['admin']), CommonController.getAllCities);
router.get('/city/:id', CommonController.getcity);

// Image Upload Routes
router.post('/mobUploadImage', CommonController.mobUploadImage);
router.post('/upload', CommonController.uploadImages);
router.post('/upload/image', CommonController.uploadNormalImages);
router.post('/upload/normal/multiple/image', CommonController.uploadNormalMultipleImages);
router.post('/upload/multiple', CommonController.uploadMultipleImages);
router.post('/uploadpin', CommonController.uploadPinImage);

// Excel Import Routes (Admin only)
// router.post('/import/products', authorize(['admin']), upload.single('file'), CommonController.uploadProductFromExcel);
// router.post('/import/cova/products', authorize(['admin']), upload.single('file'), CommonController.uploadAGLCProductFromExcel);
// router.post('/import/aglc-sheet/products', authorize(['admin']), upload.single('file'), CommonController.uploadAGLCShopProductFromExcel);
// router.post('/import/city', authorize(['admin']), upload.single('file'), CommonController.uploadCityProductFromExcel);

// ==================== CART ROUTES ====================

// GET routes
router.get('/get-cart', cartController.getCart);
router.get('/get-reservedcart', cartController.getReservedCart);
router.get('/check-quantity', cartController.checkQuantityInCart);
router.get('/check-order-quantity', cartController.checkInCart);
router.get('/check-cart-quantity', cartController.checkReservedCart);

// POST routes
router.post('/add-cart', cartController.saveCart);
router.post('/add-reservecart', cartController.saveReserveCart);
router.post('/cart-multiple', cartController.saveReserveCartMultiple);

// PUT routes
router.put('/update-cart', cartController.updateCart);

// DELETE routes
router.delete('/delete-cart', cartController.delete);
router.delete('/destroy-cart', cartController.emptyCart);

module.exports = router;