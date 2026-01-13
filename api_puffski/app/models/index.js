const mongoose = require('mongoose');
const db = {}
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



