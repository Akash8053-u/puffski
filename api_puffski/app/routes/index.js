const route = require('express').Router()


route.use('/',require('./user.route'))



module.exports=route