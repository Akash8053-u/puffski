// const express = require('express');
// const app = express();
// const validate = require('./api_puffski/app/middleware/authmiddleware')
// require('dotenv').config();

// const connectDb = require('./api_puffski/app/config/db');
// const errHandling = require('./api_puffski/app/middleware/errHandling');
// connectDb()




// app.use(express.json());
// app.use('/',require('./api_puffski/app/routes/index'))
// app.use(errHandling)

// app.listen(process.env.PORT, () => {
//   console.log(`Server is Listening on Port: ${process.env.PORT}`);
// });


const express = require('express');
const app = express();
<<<<<<< HEAD
const validate = require('./api_puffski/app/middleware/authmiddleware')
const auth = require('./api_puffski/app/middleware/authmiddleware')
=======
>>>>>>> origin/jiya_dev
require('dotenv').config();

const connectDb = require('./api_puffski/app/config/db');
const errHandling = require('./api_puffski/app/middleware/errHandling');
const indexRoutes = require('./api_puffski/app/routes/index');
const authmiddleware = require('./api_puffski/app/middleware/authmiddleware');
// Connect to database
connectDb();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api",authmiddleware);
// Routes
app.use('/', indexRoutes);

// Error handling middleware (must be after routes)
app.use(errHandling);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is Listening on Port: ${PORT}`);
    console.log(`Node.js version: ${process.version}`);
});