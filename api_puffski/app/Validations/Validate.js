




exports.Validate = async(schema,req)=>
{
 const { error } = schema.validate(req.body);
    const valid = error == null;
 
    if (valid) {
        console.log('validate successful');
        
        return {
            success: true,
            message: ""
        }
    } else {
        const { details } = error;
   console.log(details);
   
     
        return {
            success: false,
            error:error
         
        }
    }
}