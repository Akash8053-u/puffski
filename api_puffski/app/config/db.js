// 'use strict';
// const dotenv = require('dotenv');
// const assert = require('assert');
 
// dotenv.config({ debug: false });
 
// const { DB_PORT, DB_HOST, DB_USER, DB_PASSWORD, DB } = process.env;
 
// assert(DB_PORT, 'PORT is required');
// assert(DB_HOST, 'HOST is required');
// module.exports = {
//   url: `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB}`,
// };



const mongoose = require('mongoose')
require('dotenv').config()


const connectDb=async()=>{
    await mongoose.connect(process.env.DB_URL).then(()=>{
   console.log('mongo db connected Successfully');
   
    }).catch(()=>{
        console.log('Error COnnecting Db');
        
    })
}
module.exports=connectDb