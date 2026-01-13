const express = require('express');
const router = express.Router();

router.use('/',require('./user.route'))
router.use('/api/products', require('./lsrProductRoutes'));
router.use('/api/categories', require('./lsrCategoryRoutes'));
router.get('/', (req, res) => {
    res.json({
        message: 'API Server is running',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports=router;