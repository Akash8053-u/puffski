const express = require('express');
const app = express();
const validate = require('./api_puffski/app/middleware/authmiddleware')
require('dotenv').config();

const connectDb = require('./api_puffski/app/config/db');
const errHandling = require('./api_puffski/app/middleware/errHandling');
connectDb()
// console.log(db.url);
// mongoose.connect(url.url)
// .then(()=>{
//   console.log('monogdb connected successfully');
  
// }).catch(()=>{
//   console.log('error coneecting db');
  
// })

app.use(express.json());
app.use('/',require('./api_puffski/app/routes/index'))
app.use(errHandling)

app.listen(process.env.PORT, () => {
  console.log(`Server is Listening on Port: ${process.env.PORT}`);
});


