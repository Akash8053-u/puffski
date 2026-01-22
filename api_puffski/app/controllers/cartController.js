const cartService = require('../services/cartService');

// Helper function to get user ID from request
function getUserId(req) {
  return req.user?.id || req.identity?.id || req.body.userId || req.query.userId;
}

// Helper function to check authentication
function checkAuth(req, res) {
  const userId = getUserId(req);
  if (!userId) {
    return {
      error: res.status(401).json({
        success: false,
        error: {
          code: 401,
          message: 'User not authenticated'
        }
      })
    };
  }
  return { userId };
}

const cartController = {
  // Get user's cart
  getCart: async function (req, res) {
    const auth = checkAuth(req, res);
    if (auth.error) return auth.error;
    
    const userId = auth.userId;
    const result = await cartService.getCart(userId);
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        data: result.data,
      });
    } else {
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: result.error || 'Database error'
        }
      });
    }
  },

  // Get user's reserved cart
  getReservedCart: async function (req, res) {
    const auth = checkAuth(req, res);
    if (auth.error) return auth.error;
    
    const userId = auth.userId;
    const dispensary_id = req.query.dispensary_id || req.params.dispensary_id;
    
    const result = await cartService.getReservedCart(userId, dispensary_id);
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        isStore: result.isStore,
        isOutOfStock: result.isOutOfStock,
        data: result.data,
      });
    } else {
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: result.error || 'Database error'
        }
      });
    }
  },

  // Update cart item
  updateCart: async function (req, res) {
    const data = req.body;
    
    const result = await cartService.updateCart(data.id, data);
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        data: result.data,
      });
    } else {
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: result.error
        }
      });
    }
  },

  // Delete cart item
  delete: async function (req, res) {
    const cartItemId = req.query.id;
    
    const result = await cartService.deleteCartItem(cartItemId);
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        code: 200,
        data: {
          message: result.message,
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: result.error || 'Delete failed'
        }
      });
    }
  },

  // Save to cart (regular cart)
  saveCart: async function (req, res) {
    const auth = checkAuth(req, res);
    if (auth.error) return auth.error;
    
    const userId = auth.userId;
    const cartData = req.body;
    
    const result = await cartService.saveCart(userId, cartData);
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        data: result.data,
        message: result.message,
      });
    } else {
      return res.status(400).json({
        success: false,
        error: {
          code: result.error === 'QUANTITY_OVER' ? 200 : 400,
          message: result.error
        }
      });
    }
  },

  // Save to reserved cart
  saveReserveCart: async function (req, res) {
    const auth = checkAuth(req, res);
    if (auth.error) return auth.error;
    
    const userId = auth.userId;
    const cartData = req.body;
    
    const result = await cartService.saveReserveCart(userId, cartData);
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        data: result.data,
        message: result.message,
      });
    } else {
      const statusCode = result.error === 'QUANTITY_OVER' ? 200 : 400;
      return res.status(statusCode).json({
        success: false,
        error: {
          code: statusCode,
          message: result.error
        }
      });
    }
  },

  // Save multiple items to reserved cart
  saveReserveCartMultiple: async function (req, res) {
    const auth = checkAuth(req, res);
    if (auth.error) return auth.error;
    
    const userId = auth.userId;
    const itemsData = req.body.data;
    
    const result = await cartService.saveReserveCartMultiple(userId, itemsData);
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        data: result.data,
        message: result.message,
      });
    } else {
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: result.error || 'Server error'
        }
      });
    }
  },

  // Check quantity of a product in all carts
  checkQuantityInCart: async function (req, res) {
    try {
      const productId = req.query.id || req.params.id;
      
      const result = await cartService.checkQuantityInCart(productId);
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          total: result.total,
        });
      } else {
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: result.error || 'Server error'
          }
        });
      }
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: err.message || 'Server error'
        }
      });
    }
  },

  // Check user's cart status
  checkInCart: async function (req, res) {
    try {
      const userId = req.query.id || req.params.id;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: 'User ID required'
          }
        });
      }
      
      const result = await cartService.checkInCart(userId);
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          isOutOfStock: result.isOutOfStock,
          cartTotal: result.cartTotal,
          data: result.data,
        });
      } else {
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: result.error || 'Server error'
          }
        });
      }
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: err.message || 'Server error'
        }
      });
    }
  },

  // Empty user's cart
  emptyCart: async function (req, res) {
    const auth = checkAuth(req, res);
    if (auth.error) return auth.error;
    
    const userId = auth.userId;
    
    const result = await cartService.emptyCart(userId);
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } else {
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: result.error || "Server error"
        }
      });
    }
  },

  // Check reserved cart with store API integration
  checkReservedCart: async function (req, res) {
    const auth = checkAuth(req, res);
    if (auth.error) return auth.error;
    
    const userId = auth.userId;
    const dispensary_id = req.query.dispensary_id || req.params.dispensary_id;
    
    const result = await cartService.checkReservedCart(userId, dispensary_id);
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        isStore: result.isStore,
        isOutOfStock: result.isOutOfStock,
        data: result.data,
      });
    } else {
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: result.error || 'Server error'
        }
      });
    }
  }
};

module.exports = cartController;