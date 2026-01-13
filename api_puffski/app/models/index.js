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

<<<<<<< HEAD
db.url= require('../config/db')
db.User=require('./users')
db.mongoose=mongoose
db.Favourite= require('./Favourite')
db.UpdatedPassword = require('./UpdatedPassword')
db.Item = require('./item')
db.wishList = require('./wishList')
db.LsrProduct = require('./lsrProduct')
db.PromoCodes= require('./PromoCodes')
db.ReserveOrder = require('./ReserveOrders')
db.UserLogin = require('./userLogin')
db.UserActivity=require('./UserActivity')
db.WebsiteViewed= require('./Websiteviewed')
db.Subscribename = require('./Subscribename')
db.Faq = require('./Faq')
db.notifications  = require('./Notifications')
db.Blogs = require('./Blogs')
db.Category = require('./category')
db.Itemcategory = require('./ItemCategory')
db.Itemproduct = require('./Itemproduct')
module.exports= db
=======
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
>>>>>>> origin/jiya_dev
