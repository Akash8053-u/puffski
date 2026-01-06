const mongoose = require('mongoose')

const subscribeSchema = new mongoose.Schema({
  	name: {
            type: String
        },
        addedBy : {
            model:'users'
        },
        isDeleted: {
            type: 'Boolean',
            defaultsTo: false
        }
},{timestamps:true})

module.exports=mongoose.model('Subscribename',subscribeSchema)