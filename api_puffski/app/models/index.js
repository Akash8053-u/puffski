const mongoose = require('mongoose');

// Import models
const User = require('./users');
const Favourite = require('./Favourite');
const UpdatedPassword = require('./UpdatedPassword');
const Item = require('./item');
const wishList = require('./wishList');
const LsrProduct = require('./lsrProduct');
const LsrCategory = require('./lsrCategory');
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

const db = {
    mongoose,
    User,
    Favourite,
    UpdatedPassword,
    Item,
    wishList,
    LsrProduct,
    LsrCategory,
    PromoCodes,
    ReserveOrder,
    UserLogin,
    UserActivity,
    WebsiteViewed,
    Subscribename,
    Faq,
    notifications,
    Blogs,
    Category
};

module.exports = db;