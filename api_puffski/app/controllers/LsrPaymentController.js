const monerisService = require('../services/LsrPaymentService');
const { randomString } = require('../utils/helper');
const constants = require('../utils/constants');
const local = require('../config/local');

module.exports = {
  addCard: async (req, res) => {
    try {
      const result = await monerisService.addCard({
        ...req.body,
        userId: req.identity.id
      });
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: error.message }
      });
    }
  },

  getMonerisCards: async (req, res) => {
    try {
      const result = await monerisService.getMonerisCards({
        dispensary_id: req.query.dispensary_id,
        userId: req.identity.id
      });
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: error.message }
      });
    }
  },

  deleteCard: async (req, res) => {
    try {
      const result = await monerisService.deleteCard({
        id: req.params.id,
        userId: req.identity.id
      });
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: error.message }
      });
    }
  },

  monerisCheckout: async (req, res) => {
    try {
      const orderData = req.body;
      const userId = req.identity.id;
      
      // Generate order identifiers
      orderData.order_number = 'lsr_' + randomString(8, '#aA');
      orderData.invoice_number = randomString(8, '#aA');
      orderData.totalprice = parseFloat(orderData.price);
      orderData.order_date = new Date().toLocaleString('en-US', { timeZone: 'America/Edmonton' });
      orderData.addedBy = userId;
      orderData.createdAt = new Date().toLocaleString('en-US', { timeZone: 'America/Edmonton' });

      if (!orderData.card_lookupId) {
        return res.status(400).json({
          success: false,
          error: { code: 400, message: "Please select card" }
        });
      }

      const result = await monerisService.processMonerisCheckout(orderData);
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          data: result.data,
          response: 'Successful'
        });
      } else {
        return res.status(400).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Checkout error:', error);
      return res.status(400).json({
        success: false,
        error: { code: 400, message: error.message }
      });
    }
  }
};