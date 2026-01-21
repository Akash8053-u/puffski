const CouponModel = require('../models/Coupon');

module.exports = {
      checkCoupon: async (req, res) => {
        try {
            const { coupon_code } = req.query;
            
            if (!coupon_code) {
                return res.status(400).json({
                    success: false,
                    message: 'Coupon code is required'
                });
            }
            const coupon = await CouponModel.findOne({ 
                code: coupon_code,
                isDeleted: false,
                isActive: true 
            });

            if (!coupon) {
                return res.status(404).json({
                    success: false,
                    error: {
                        message: 'No Coupon Found.'
                    }
                });
            }

            if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Coupon has expired.'
                    }
                });
            }

            if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Coupon usage limit exceeded.'
                    }
                });
            }

            return res.status(200).json({
                success: true,
                data: coupon
            });

        } catch (error) {
            console.error('Error checking coupon:', error);
            return res.status(400).json({
                success: false,
                message: 'Error checking coupon'
            });
        }
    },
 saveCoupon: async (req, res) => {
        try {
             console.log('Request body:', req.body);
            
            const couponData = req.body;

                       if (!couponData.code || couponData.percentage === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'Code and percentage are required fields'
                });
            }

             if (typeof couponData.percentage === 'string') {
                couponData.percentage = parseFloat(couponData.percentage);
            }

             if (couponData.percentage < 0 || couponData.percentage > 100) {
                return res.status(400).json({
                    success: false,
                    message: 'Percentage must be between 0 and 100'
                });
            }

            const existingCoupon = await CouponModel.findOne({ 
                code: couponData.code.toUpperCase().trim(), 
                isDeleted: false 
            });

            if (existingCoupon) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Coupon code already exists.'
                    }
                });
            }
            couponData.code = couponData.code.toUpperCase().trim();
            
             delete couponData.createdAt;
            delete couponData.updatedAt;

            couponData.isDeleted = false;
            couponData.isActive = couponData.isActive !== undefined ? couponData.isActive : true;

             const newCoupon = new CouponModel(couponData);
            const savedCoupon = await newCoupon.save();

            return res.status(201).json({ 
                success: true,
                message: 'Coupon created successfully',
                data: savedCoupon
            });

        } catch (error) {
            console.error('Error saving coupon:', error);
            
            if (error.code === 11000 && error.keyPattern && error.keyPattern.code) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Coupon code already exists.'
                    }
                });
            }
            if (error.name === 'ValidationError') {
                const errors = Object.values(error.errors).map(err => err.message);
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Validation error',
                        details: errors
                    }
                });
            }

            return res.status(500).json({
                success: false,
                error: {
                    message: 'Error saving coupon',
                    details: error.message
                }
            });
        }
    }
};