const mongoose = require('mongoose')

const subscribeSchema = new mongoose.Schema({
  	name: {
            type: String
        },
      
          user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
        ,
        isDeleted: {
            type: 'Boolean',
            defaultsTo: false
        }
},{timestamps:true})

module.exports=mongoose.model('Subscribename',subscribeSchema)