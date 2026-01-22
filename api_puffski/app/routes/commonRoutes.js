const express = require('express');
const router = express.Router();
const CommonController = require('../controllers/CommonController');
const CsvExportController = require('../controllers/CsvExportController.js');
const cartController = require('../controllers/cartController');
const CountryController = require('../controllers/CountryController');
const CouponController = require('../controllers/CouponController.js');
const CultivatorsController = require('../controllers/CultivatorsController.js');
const DispensaryController = require('../controllers/DispensaryController.js');
const DriverController = require('../controllers/DriverController.js');
const DriverSchedulerController = require('../controllers/DriverSchedulerController.js');
const authenticate = require('../middleware/authmiddleware');

// ==================== COMMON CONTROLLER ROUTES ====================

router.get('/getlocation', CommonController.onLoadLocation);
router.get('/updateCityLatlang', CommonController.updateCityLatlang);
router.get('/google/address', CommonController.googleAddress);
router.get('/google/address/lat/lng', CommonController.googleAddressLatLng);
router.get('/getHTMLFromURL', CommonController.getHTMLFromURL);
router.post('/calculate/distance', CommonController.calculateMultipleDistance);

router.get('/allcities', CommonController.allcities);
router.get('/all/lower/cities', CommonController.allLowercities);
router.get('/allprovinces', CommonController.allprovince);
router.get('/searchCity', CommonController.searchCity);
router.get('/countries', CommonController.findAllCounrty);
router.get('/states', CommonController.findAllState);
router.get('/cities', CommonController.findAllCities);
router.get('/get/city', CommonController.getcityData);
router.get('/brandlist', CommonController.brandList);
router.get('/city/:id', CommonController.getcity);

router.get('/FeaturedData', CommonController.FeaturedData);
router.get('/feature/delivery/stores', CommonController.featuredDeliveryStores);
router.get('/reserve/pickup/stores', CommonController.reserveAheadStores);
router.post('/Search', CommonController.Search);
router.get('/mobFeaturedItem', CommonController.mobFeaturedItem);

router.get('/silver', CommonController.silverSpring);
router.get('/copper', CommonController.copper);

router.get('/itemProductReview', CommonController.ItemProductReview);
router.get('/ProductReview', CommonController.ProductReview);
router.get('/analyticReport', CommonController.analyticReport);
router.get('/productslugupdate', CommonController.getproductslugupdate);

router.post('/visit_website/:id', CommonController.visitWebsite);
router.post('/subscription', CommonController.subscription);

router.get('/mobUserLiked', authenticate, CommonController.mobUserLiked);
router.get('/totalreviews', authenticate, CommonController.getReward);
router.get('/itemproducts', authenticate, CommonController.dispensaryProducts);
router.get('/subscriptionTransactions', authenticate, CommonController.subscriptionTransactions);
router.put('/revokedReview', authenticate, CommonController.revokedReview);

router.post('/mobUploadImage', authenticate, CommonController.mobUploadImage);
router.post('/upload', authenticate, CommonController.uploadImages);
router.post('/upload/image', authenticate, CommonController.uploadNormalImages);
router.post('/upload/normal/multiple/image', authenticate, CommonController.uploadNormalMultipleImages);
router.post('/upload/multiple', authenticate, CommonController.uploadMultipleImages);
router.post('/uploadpin', authenticate, CommonController.uploadPinImage);

// ==================== CART CONTROLLER ROUTES (PROTECTED) ====================

router.get('/get-cart', authenticate, cartController.getCart);
router.get('/get-reservedcart', authenticate, cartController.getReservedCart);
router.get('/check-quantity', authenticate, cartController.checkQuantityInCart);
router.get('/check-order-quantity', authenticate, cartController.checkInCart);
router.get('/check-cart-quantity', authenticate, cartController.checkReservedCart);

router.post('/add-cart', authenticate, cartController.saveCart);
router.post('/add-reservecart', authenticate, cartController.saveReserveCart);
router.post('/cart-multiple', authenticate, cartController.saveReserveCartMultiple);

router.put('/update-cart', authenticate, cartController.updateCart);

router.delete('/delete-cart', authenticate, cartController.delete);
router.delete('/destroy-cart', authenticate, cartController.emptyCart);

// ==================== COUNTRY CONTROLLER ROUTES ====================

// Get all countries
router.get('/country', CountryController.getAllCountry);

router.post('/country', CountryController.save);

// router.put('/:id', authorize(['admin', 'superadmin']), CountryController.update);
router.put('/country/:id',  CountryController.update);

// router.delete('/:id', authorize(['admin', 'superadmin']), CountryController.delete);
router.delete('/deletecountry/:id', CountryController.delete);

router.get('/country/', CountryController.singleCountry);

router.get('/date/userExcel', CsvExportController.webdateuserExcel);
router.get('/webUserExcel', CsvExportController.webUserExcel);
router.get('/oneorder/user', CsvExportController.oneOrderUser);
router.get('/all/active-user', CsvExportController.activeUsers);
router.get('/appUserExcel', CsvExportController.appUserExcel);

router.get('/deliveredOrderExcel', CsvExportController.delieveredOrderExcel);
router.get('/reserveOrderExcel', CsvExportController.reserveOrderExcel);
router.get('/grossMargin/orderExcel', CsvExportController.grossMarginOrderExcel);

router.get('/favExcel', CsvExportController.favExcel);
router.get('/reviewExcel', CsvExportController.reviewExcel);

router.get('/websiteViewExcel', CsvExportController.websiteView);
router.get('/appDownloadExcel', CsvExportController.appDownloadExcel);
router.get('/appViewExcel', CsvExportController.appViewExcel);
router.get('/salesExcel', CsvExportController.salesExcel);

router.get('/productExcel', CsvExportController.productsExcel);
router.get('/normalProductsExcel', CsvExportController.normalProductsExcel);
router.get('/updatedProductsExcel', CsvExportController.updatedProductsExcel);
router.get('/export/products', CsvExportController.productsExcelAdmin);
router.get('/export/stores', CsvExportController.exportAllItems);

// ==================== COUPON CONTROLLER ROUTES ====================

router.get('/check_coupon', CouponController.checkCoupon);
router.post('/save_coupon', CouponController.saveCoupon);

// ==================== CULTIVATORS CONTROLLER ROUTES ====================

router.get('/cultivators', CultivatorsController.clutivatorsListing);
router.get('/cultivator', CultivatorsController.cultivatorDetail);

router.post('/cultivator', CultivatorsController.addCultivators);
router.put('/cultivator', CultivatorsController.updateCultivator);

// ==================== DISPENSARY CONTROLLER ROUTES ====================

router.get('/updateItemLocation', DispensaryController.updateItemLocation);
router.get('/dispensaryNearMe', DispensaryController.dispensaryNearMe);
router.get('/dispensaryForSlider', DispensaryController.dispensaryForSlider);
router.post('/itemSearchByLocation', DispensaryController.itemSearchByLocation);
router.post('/mobItemSearchByLocation', DispensaryController.mobItemSearchByLocation);
router.get('/itemLocator', DispensaryController.itemLocator);
router.get('/graphData', DispensaryController.graphData);

router.get('/dispensary_list', DispensaryController.getAllItems);
router.get('/alldespensary', DispensaryController.alldespensary);
router.get('/allmasterdispensary', DispensaryController.allmasterdispensary);
router.get('/subdispensary', DispensaryController.subdispensary);
router.get('/subdispensarybased_master', DispensaryController.subDispensaryMaster);
router.get('/mobDispensaryList', DispensaryController.mobDispensaryList);

router.get('/itemDetail', DispensaryController.itemDetail);
router.get('/store/itemDetail', DispensaryController.itemStoreDetail);
router.get('/item/detail/:id', DispensaryController.itemDetailUsingID);
router.get('/dispensary', DispensaryController.dispensary);
router.get('/itemFavorite', DispensaryController.itemFavorite);

router.get('/getfiteritem', DispensaryController.getfiteritem);
router.post('/getfilterproduct', DispensaryController.getfilterproduct);
router.post('/searchProduct', DispensaryController.searchProduct);

router.get('/dispensaryproducers', DispensaryController.getDispensaryProducerList);
router.get('/dispensarycategories', DispensaryController.getDispensaryCategoryList);
router.get('/customnposcategories', DispensaryController.getPOSnCustomCategoryList);
router.get('/getDispensaryMainCategoryList', DispensaryController.getDispensaryMainCategoryList);
router.get('/getDispensaryPosCategoryList', DispensaryController.getDispensaryPosCategoryList);
router.get('/getDispensaryPosCategoryListByName', DispensaryController.getDispensaryPosCategoryListByName);
router.get('/storepage/cat/list', DispensaryController.storePageCatListForProduct);
router.get('/desktop/storepage/cat/list', DispensaryController.storePageCatListForProductdesktop);
router.get('/type/list', DispensaryController.productTypeList);

router.get('/subdomaindispensary/:slug', DispensaryController.subdomaindispensary);
router.get('/subdomainstores/:slug', DispensaryController.getProducersStore);
router.get('/getFeaturedProducers', DispensaryController.getFeaturedProducers);

router.get('/delivery/charges/:id', DispensaryController.getDeliveryFee);

router.put('/addsubmaster', DispensaryController.updateSubmaster);

router.post('/add_dispensary', authenticate, DispensaryController.add);
router.put('/edit_dispensary/:id', authenticate, DispensaryController.edit);
router.post('/delete_dispensary/:id', authenticate, DispensaryController.delete);
router.get('/getDispensary', authenticate, DispensaryController.getDispensary);
// router.get('/getuserdispensary', authenticate, DispensaryController.getUserDispensary);
router.get('/storeid', authenticate, DispensaryController.storeId);
router.get('/mastersubdispensary', authenticate, DispensaryController.mastersubdispensary);

router.post('/bulkUpload', authenticate, DispensaryController.bulkUpload);
router.post('/addSlugDispensary', authenticate, DispensaryController.addSlugDispensary);

router.put('/update/store/:id', authenticate, DispensaryController.updateItem);

router.get('/store/planifo', authenticate, DispensaryController.itemPlanList);

// ====== DRIVER CONTROLLER ROUTES ========

router.post('/driver/siginin', DriverController.signinDriver);

router.get('/checkEmail1', DriverController.checkEmail1);

router.get('/check/notify', DriverController.sendNotify);


router.post('/add/driver', authenticate, DriverController.addDriver);
router.put('/driver', authenticate, DriverController.updateDriver);
router.get('/driver', authenticate, DriverController.driverDetail);

router.get('/store/drivers', authenticate, DriverController.getStoreDriver);

router.put('/driver/forgotpassword', authenticate, DriverController.driverFrorgotPassword);

router.post('/add/driver/sc', authenticate, DriverController.addDriverStatus);
router.put('/update/driver/sc', authenticate, DriverController.updateDriver);
router.get('/get/driver/sc', authenticate, DriverController.getDriverStatus);

router.get('/driver/pendingorders', authenticate, DriverController.getDriverPendingOrders);
router.get('/driver/acceptedorders', authenticate, DriverController.getDriverAcceptedOrders);
router.get('/driver/deliveredorders', authenticate, DriverController.getDriverDeliveredOrders);

router.put('/driver/acceptreject/order', authenticate, DriverController.acceptRejectOrder);
router.put('/order/index/change', authenticate, DriverController.orderStatusChange);
router.put('/driver/order/delivered', authenticate, DriverController.markAsDeliver);
router.put('/driver/order/update', authenticate, DriverController.updateOrderByDriver);
router.put('/driver/verify/customerid', authenticate, DriverController.verifyId);
router.put('/driver/decline/order', authenticate, DriverController.declineOrder);
router.put('/order/resend/driver', authenticate, DriverController.reSendOrderToDriver);

router.put('/assign/driver', authenticate, DriverController.assignOrder);
router.put('/assign/multiple/driver', authenticate, DriverController.assignMultipleOrder);
router.put('/change/driver', authenticate, DriverController.changeDriver);

router.put('/update/trip/bonus', authenticate, DriverController.updateOrderData);

router.get('/store/listing', authenticate, DriverController.getSotresList);

//============DRIVER SCHEDULER CONTROLLER ROUTES ====================

router.post('/driver/scheduler', authenticate, DriverSchedulerController.saveDriverScheduler);
router.post('/driver/scheduler/multiple', authenticate, DriverSchedulerController.saveDriverMultipleScheduler);
router.get('/driver/scheduler', authenticate, DriverSchedulerController.detail);
router.put('/driver/scheduler', authenticate, DriverSchedulerController.update);
router.get('/driver/schedulers', authenticate, DriverSchedulerController.getAllDriverScheduler);
// router.delete('/driver/scheduler', authenticate, DriverSchedulerController.deleteSeletectedSlot);

module.exports = router;