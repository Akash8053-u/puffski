const monerisService = require('../services/LsrPaymentService');
const { randomString } = require('../utils/helper');
const constants = require('../utils/constants');

module.exports = {
  addCard: async (req, res) => {
    try {
      console.log('📝 Add card request received:', {
        userId: req.identity.id,
        body: { ...req.body, card_number: '***' + (req.body.card_number || '').slice(-4) }
      });

      const requiredFields = [
        'card_number', 
        'card_expiry_month', 
        'card_expiry_year', 
        'cvv2', 
        'dispensary_id'
      ];
      
      const missingFields = requiredFields.filter(field => !req.body[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `Missing required fields: ${missingFields.join(', ')}`
          }
        });
      }

      const data = {
        ...req.body,
        userId: req.identity.id
      };

      const result = await monerisService.addCard(data);
      
      return res.status(200).json(result);
      
    } catch (error) {
      console.error('Controller error (addCard):', error.message);
      
      return res.status(400).json({
        success: false,
        error: {
          code: 'ADD_CARD_FAILED',
          message: error.message || 'Failed to add card'
        }
      });
    }
  },

  getMonerisCards: async (req, res) => {
    try {
      console.log('📋 Get cards request:', {
        userId: req.identity.id,
        query: req.query
      });

      if (!req.query.dispensary_id) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_STORE_ID',
            message: 'dispensary_id query parameter is required'
          }
        });
      }

      const result = await monerisService.getMonerisCards({
        dispensary_id: req.query.dispensary_id,
        userId: req.identity.id
      });
      
      return res.status(200).json(result);
      
    } catch (error) {
      console.error('Controller error (getCards):', error.message);
      
      return res.status(400).json({
        success: false,
        error: {
          code: 'GET_CARDS_FAILED',
          message: error.message || 'Failed to retrieve cards'
        }
      });
    }
  },

  deleteCard: async (req, res) => {
    try {
      console.log('🗑️ Delete card request:', {
        userId: req.identity.id,
        cardId: req.params.id
      });

      if (!req.params.id) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_CARD_ID',
            message: 'Card ID is required'
          }
        });
      }

      const result = await monerisService.deleteCard({
        id: req.params.id,
        userId: req.identity.id
      });
      
      return res.status(200).json(result);
      
    } catch (error) {
      console.error('Controller error (deleteCard):', error.message);
      
      return res.status(400).json({
        success: false,
        error: {
          code: 'DELETE_CARD_FAILED',
          message: error.message || 'Failed to delete card'
        }
      });
    }
  },

  monerisCheckout: async (req, res) => {
    try {
      const orderData = req.body;
      const userId = req.identity.id;
      
      if (!orderData.dispensary_id) {
        return res.status(400).json({
          success: false,
          error: { code: 400, message: "Dispensary ID is required" }
        });
      }

      if (!orderData.card_lookupId) {
        return res.status(400).json({
          success: false,
          error: { code: 400, message: "Please select a card" }
        });
      }

      if (!orderData.price || orderData.price <= 0) {
        return res.status(400).json({
          success: false,
          error: { code: 400, message: "Valid price is required" }
        });
      }

      orderData.order_number = 'lsr_' + randomString(8, '#aA');
      orderData.invoice_number = randomString(8, '#aA');
      orderData.totalprice = parseFloat(orderData.price);
      orderData.order_date = new Date();
      orderData.addedBy = userId;

      const result = await monerisService.processMonerisCheckout(orderData);
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          data: result.data,
          message: 'Payment successful',
          transaction_id: result.transaction_id
        });
      } else {
        return res.status(400).json({
          success: false,
          error: result.error || { code: 400, message: 'Payment failed' }
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