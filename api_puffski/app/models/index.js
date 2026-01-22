const mongoose = require("mongoose");

const User = require('./users');
const Favourite = require('./Favourite');
const UpdatedPassword = require('./UpdatedPassword');
const Item = require('./item');
const wishList = require('./wishList');
const LsrProduct = require('./lsrProduct');
const LsrCategory = require('./lsrCategory');
const LsrBrands = require('./LsrBrands');
const PromoCodes = require('./PromoCodes');
const ReserveOrder = require('./ReserveOrders');
const UserLogin = require('./userLogin');
const UserActivity = require('./UserActivity');
const WebsiteViewed = require('./Websiteviewed');
const Subscribename = require('./Subscribename');
const Faq = require('./Faq');
const notifications = require('./Notifications');
const Blogs = require('./Blogs');
const Category = require('./category');
const cart = require('./cart');
const buiyProductAnalytics = require('./buyProductAnalytics');
const failedCards = require('./failedCards');
const itemCategory = require('./ItemCategory');
const itemProduct = require('./Itemproduct');
const LsrCart = require('./lsrCarts');
const LsrMerrcoCard = require('./lsrMerrecoCards');
const ErrorNotification = require('./ErrorNotification');
const db = {
    mongoose,
    User,
    Favourite,
    UpdatedPassword,
    Item,
    wishList,
    LsrProduct,
    LsrCategory,
    LsrBrands,
    PromoCodes,
    ReserveOrder,
    UserLogin,
    UserActivity,
    WebsiteViewed,
    Subscribename,
    Faq,
    notifications,
    Blogs,
    Category,
    cart,
    buiyProductAnalytics,
    failedCards,
    itemCategory,
    itemProduct,
    LsrMerrcoCard,
    LsrCart,
    ErrorNotification
};

module.exports = db;