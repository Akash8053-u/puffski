const lsrCartService = require('../services/LsrCartService');

module.exports = {
  getCart: async (req, res) => {
    try {
      const result = await lsrCartService.getCart(req.identity.id);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }
  },

  getReservedCart: async (req, res) => {
    try {
      const result = await lsrCartService.getReservedCart(req.identity.id);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }
  },

  updateCart: async (req, res) => {
    try {
      const result = await lsrCartService.updateCart(req.body);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }
  },

  deleteCart: async (req, res) => {
    try {
      const result = await lsrCartService.deleteCart(req.query.id);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }
  },

  saveCart: async (req, res) => {
    try {
      const data = { ...req.body, addedBy: req.identity.id };
      const result = await lsrCartService.saveCart(data);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }
  },

  saveReserveCart: async (req, res) => {
    try {
      const data = { ...req.body, addedBy: req.identity.id };
      const result = await lsrCartService.saveReserveCart(data);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }
  },

  saveReserveCartMultiple: async (req, res) => {
    try {
      const data = req.body.data.map(item => ({ 
        ...item, 
        addedBy: req.identity.id 
      }));
      const result = await lsrCartService.saveReserveCartMultiple(data);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }
  },

  checkQuantityInCart: async (req, res) => {
    try {
      const result = await lsrCartService.checkQuantityInCart(req.params.id);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }
  },

  emptyCart: async (req, res) => {
    try {
      const result = await lsrCartService.emptyCart(req.identity.id);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }
  },

  checkReservedCart: async (req, res) => {
    try {
      const result = await lsrCartService.checkReservedCart(req.identity.id);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
};