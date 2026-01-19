const express = require("express");
const router = express.Router();

// Controllers
const UsersController = require("../controllers/userController");
const UserActivityController = require("../controllers/UserActivityController");
const visitController = require("../controllers/visitController");
const FaqController = require("../controllers/faqController");
const SubscribenameController = require("../controllers/SubscribenameController");
const NotificationController = require("../controllers/NotificationController");
const BlogsController = require("../controllers/BlogsController");
const CategoryController = require("../controllers/categoryController");
// const OAuthController = require("../controllers/OAuthController");
// const CommonController = require("../controllers/commonController");

// -------------------------
// AUTH & SIGNUP
// -------------------------
router.post("/register", UsersController.register);
router.post("/lsr/register", UsersController.lsrRegisterUser);

router.get("/verify/:email", UsersController.verify);
router.get("/lsr/verify/:email", UsersController.lsrVerify);

router.post("/userVerification", UsersController.userVerification);

router.post("/signin", UsersController.signin);
router.post("/signinUser", UsersController.signinUser);
router.post("/signinsocial", UsersController.signinSocial);
router.post("/autologin", UsersController.autoLogin);

// router.post("/oauth/token", OAuthController.token);

// // -------------------------
// // PASSWORD & PROFILE
// // -------------------------
router.put("/changepassword", UsersController.changePassword);
router.put("/updateprofile", UsersController.updateProfile);
router.put("/resetPassword", UsersController.resetPassword);

// // -------------------------
// // USER INFO
// // -------------------------
// router.get("/getuserdetail", UsersController.0.);
router.get("/getUserInfo", UsersController.getUserInfo);
router.get("/dashboard", UsersController.getDashboardData);
router.get("/showRoom/:id", UsersController.showRoom);

// // -------------------------
// // CONTACT & FEEDBACK
// // -------------------------
router.post("/contactus", UsersController.contactUs);
router.post("/lsr-contactus", UsersController.lsrContactUs);
router.post("/feedback", UsersController.feedback);

// // -------------------------
// // DELETE ACCOUNT
// // -------------------------
router.delete("/account/:id", UsersController.deleteAccount);

// // -------------------------
// // FCM TOKEN
// // -------------------------
router.put("/update/token/data", UsersController.updateFCMData);

// // -------------------------
// // OTP
// // -------------------------
router.post("/otp/send", UsersController.otpSend);
router.post("/common/otp/send", UsersController.commonOTPSend);
router.post("/lsr/common/otp/send", UsersController.lsrCommonOTPSend);
router.post("/otp/verify", UsersController.otpVerify);

// // -------------------------
// // STORE PASSWORD
// // -------------------------
router.put("/setpassword/stores", UsersController.setPasswordForStores);

// // -------------------------
// // USER CRUD
// // -------------------------
router.get("/user", UsersController.getAllUsers);
router.get("/user/new", UsersController.getAllUsersNew);
router.get("/update/user/info", UsersController.getAllUsersUpdate);

router.get("/user/:id", UsersController.userProfileData);
router.put("/user/:id", UsersController.updateUser);

router.post("/user", UsersController.index);
router.post("/updateusername", UsersController.updateUsername);

// // -------------------------
// // SUBSCRIPTION
// // -------------------------
// router.post("/subscription", CommonController.subscription);

// // -------------------------
// // LOCATION
// // -------------------------
// router.get("/getlocation", CommonController.onLoadLocation);
// router.get("/updateCityLatlang", CommonController.updateCityLatlang);

// // -------------------------
// // COMMUNITY
// // -------------------------
router.post("/community-connect", UsersController.communityConnect);
router.post("/community_contact_us", UsersController.communityContactUS);

// // -------------------------
// // QUESTIONS & STRAIN
// // -------------------------
router.post("/ask/question", UsersController.askQuestion);
router.post("/addStrainRequest", UsersController.addStrainRequest);

// // -------------------------
// // VERIFICATION FLOW
// // -------------------------
router.post("/verify/request", UsersController.verifyRequest);

router.put("/approve/user", UsersController.verifyUserAccount);
router.get("/approve/user", UsersController.ageVerification);

router.get("/verified/users", UsersController.getVerifiedAccounts);

// // -------------------------
// // USERNAME SEARCH
// // -------------------------
router.get("/username/detail", UsersController.detailByUsername);

// // -------------------------
// // IMPORT (EXCEL UPLOAD)
// // -------------------------
// router.post("/import/products", CommonController.uploadProductFromExcel);
// router.post("/import/cova/products", CommonController.uploadAGLCProductFromExcel);
// router.post("/import/aglc-sheet/products", CommonController.uploadAGLCShopProductFromExcel);

//User Activity Controller Routes

router.post("/add/useractivity", UserActivityController.saveUserActivity);
router.get("/all/useractivity", UserActivityController.getAllUserActivity);
router.get("/useractivity", UserActivityController.detail);

//visit controller

router.post("/visit_website/:id", visitController.visitWebsite);

//Subscribe Name routes

router.post("/subscribename", SubscribenameController.saveName);
router.get("/subscribename", SubscribenameController.getName);
router.get("/subscribenameall", SubscribenameController.getAllName);
router.get("/subscribename/:id", SubscribenameController.getNameDetails);
router.put("/subscribename", SubscribenameController.updateName);

router.post("/faq", FaqController.create); // Create FAQ
router.put("/faq", FaqController.update); // Update FAQ
router.get("/faq", FaqController.detail); // Get single FAQ (query param ?id=)
router.get("/faq/all", FaqController.listing);

//Notifications
router.get("/getAllNotifications", NotificationController.getAllNotifications);
router.put("/updateReadStatus/:id", NotificationController.updateReadStatus);

router.post("/blog", BlogsController.save);

router.get("/blog", BlogsController.getAllBlog);

router.put("/editblogs/:id", BlogsController.edit);

router.post("/addcomment", BlogsController.addComment);

router.get("/singleblog", BlogsController.getSingleBlog);

router.get("/blogdetail/:id", BlogsController.blogdetail);

router.get("/topblogs", BlogsController.getTop3Blogs);

router.get("/dispensaryblogs/:id", BlogsController.dispensaryblogs);

//category controller
router.post("/category", CategoryController.create);
router.put("/category", CategoryController.update);
router.get("/allcategory", CategoryController.getAll);
router.delete("/deletecat/:id", CategoryController.delete);
router.get("/categoryList", CategoryController.list);
router.get("/categorybytype/:type", CategoryController.categoryByType);
 router.get("/itemCategoryList", CategoryController.itemCategoryList);

 router.get(
  "/mainCategoryWithSubcategory",
CategoryController.mainCategoryWithSubcategory
 );
 router.put("/updateMasterCategory", CategoryController.updateMasterCategory);
 router.get("/masterCategoriesList", CategoryController.masterCategoriesList);
 router.get("/getProducerCategories", CategoryController.getProducerCategories);
 // router.put("/mergePosCategory", categoryController.mergePosCategory);
router.get(
  "/product/category/producer",
   CategoryController.getProducerCategoriesWithProduct
 );
// router.get(
//   "/producer/products",
//   categoryController.getProducerCategoryProducts
// );
// router.get(
//   "/producer/products/stores",
//   producerController.getStoreWithProducerProducts
// );
// router.put(
//   "/removeDulicateCatStore",
//   categoryController.removeDulicateCatStore
// );
// router.put("/update/itemcategory", categoryController.updateItemCategory);

module.exports = router;
