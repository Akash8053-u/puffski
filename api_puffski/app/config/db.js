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