const Joi= require('joi')
const Validate = require('./Validate').Validate


exports.createUserValidation=async (req, res) => {    
      console.log(req.body);
  const schema = Joi.object({

    
    Username:Joi.string().min(3).required(),
    Email:Joi.string().regex(/[a-zA-Z0-9]{3,}[@]{1}[a-z]{3,}[.]{1}[a-zA-Z]{2,}/).required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}[@]{1}[0-9]{2,}$')),
       
    Phone:Joi.string().min(5).required(),
    Birthday:  Joi.string().required()
});
     return await Validate(schema,req)
}


exports.loginUserValidation=async (req, res) => {    
  const schema = Joi.object({
 
    Email:Joi.string().regex(/[a-zA-Z0-9]{3,}[@]{1}[a-z]{3,}[.]{1}[a-zA-Z]{2,}/).required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}[@]{1}[0-9]{2,}$')),
 

  });
     return await Validate(schema,req)
}


exports.updateUserValidation=async (req, res) => {    

 
 const schema = Joi.object({
   
  
  name:Joi.string().min(3).optional(),
    email:Joi.strAing().regex(/[a-zA-Z0-9]{3,}[@]{1}[a-z]{3,}[.]{1}[a-zA-Z]{2,}/).optional(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}[@]{1}[0-9]{2,}$')).optional(),
    role:Joi.string().optional()
 

  }); return await Validate(schema,req)
}

  exports.forgotPasswordValidation=async(req,res)=>{
  const schema = Joi.object({
        Email:Joi.string().regex(/[a-zA-Z0-9]{3,}[@]{1}[a-z]{3,}[.]{1}[a-zA-Z]{2,}/).required()
  })
   return await Validate(schema,req)
}
    