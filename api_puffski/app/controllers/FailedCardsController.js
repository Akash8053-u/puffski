// In your controller
const FailedCardsService = require('../services/FailedCardsService');

module.exports = {
    listing: async (req, res) => {
        try {
            const result = await FailedCardsService.listing(req.query);
            return res.json(result);
        } catch (err) {
            return res.status(500).json({
                success: false,
                error: { code: 500, message: err.message }
            });
        }
    },
    
    detail: async (req, res) => {
        try {
            const result = await FailedCardsService.detail(req.params.id);
            return res.json(result);
        } catch (err) {
            return res.status(400).json({
                success: false,
                error: { code: 400, message: err.message }
            });
        }
    }
};