const { CronJob } = require('cron');
const LsrCart = require('../models/lsrCarts');
const Users = require('../models/users');
const constantObj = require('../utils/constants');

const cartCleanupJob = new CronJob(
  '0 2 * * *',
  async () => {
    console.log('Cart cleanup cron is running');
    try {
      await LsrCart.deleteMany({});
    } catch (err) {
      console.error('Cart cleanup error:', err);
    }
  },
  null,
  true,
  'UTC'
);


cartCleanupJob.start();

class LsrCartService {
  async getCart(userId) {
    try {
      const cartItems = await LsrCart.find({ addedBy: userId })
        .populate('product_id')
        .exec();
      
      return {
        success: true,
        data: cartItems
      };
    } catch (error) {
      throw new Error('Failed to fetch cart');
    }
  }

  async getReservedCart(userId) {
    try {
      const cartItems = await LsrCart.find({ addedBy: userId })
        .populate('product_id')
        .populate('addedBy')
        .exec();

      let flag = false;
      
      for (const item of cartItems) {
        if (item.product_id && item.product_id._id) {
          const storeData = await Users.findOne({ _id: item.product_id.addedBy });
          item.storeData = storeData;
          
          if (item.product_id.stock < 3 || item.product_id.stock < item.quantity) {
            item.isOutOfStock = true;
            flag = true;
          } else {
            item.isOutOfStock = false;
          }
        } else {
          item.isOutOfStock = false;
        }
      }

      return {
        success: true,
        isOutOfStock: flag,
        data: cartItems
      };
    } catch (error) {
      throw new Error('Failed to fetch reserved cart');
    }
  }

  async updateCart(data) {
    try {
      if (parseInt(data.productQty) >= parseInt(data.quantity)) {
        const updatedCart = await LsrCart.findByIdAndUpdate(
          data.id,
          data,
          { new: true }
        );
        
        return {
          success: true,
          data: updatedCart
        };
      } else {
        throw new Error(constantObj.lsrcart.QUANTITY_OVER);
      }
    } catch (error) {
      throw new Error('Failed to update cart');
    }
  }

  async deleteCart(cartId) {
    try {
      const deletedCart = await LsrCart.findByIdAndDelete(cartId);
      
      if (deletedCart) {
        return {
          success: true,
          code: 200,
          data: {
            message: 'Item removed from cart'
          }
        };
      } else {
        throw new Error('Cart item not found');
      }
    } catch (error) {
      throw new Error('Failed to delete cart item');
    }
  }

  async saveCart(data) {
    try {
      const existingCart = await LsrCart.findOne({
        addedBy: data.addedBy,
        product_id: data.product_id
      });

      if (existingCart) {
        const newQuantity = parseInt(data.quantity) + parseInt(existingCart.quantity);
        
        if (parseInt(data.productQty) >= newQuantity) {
          const updatedCart = await LsrCart.findOneAndUpdate(
            { addedBy: data.addedBy, product_id: data.product_id },
            { quantity: newQuantity },
            { new: true }
          );

          return {
            success: true,
            data: updatedCart,
            message: constantObj.lsrcart.UPDATED_CART
          };
        } else {
          throw new Error(constantObj.lsrcart.QUANTITY_OVER);
        }
      } else {
        if (parseInt(data.productQty) >= parseInt(data.quantity)) {
          const newCart = await LsrCart.create(data);
          
          return {
            success: true,
            data: newCart,
            message: constantObj.lsrcart.SAVED_ITEM
          };
        } else {
          throw new Error(constantObj.lsrcart.QUANTITY_OVER);
        }
      }
    } catch (error) {
      throw new Error(error.message || 'Failed to save cart');
    }
  }

  async saveReserveCart(data) {
    try {
      const existingCart = await LsrCart.findOne({
        addedBy: data.addedBy,
        product_id: data.product_id
      });

      if (existingCart) {
        const newQuantity = parseInt(data.quantity) + parseInt(existingCart.quantity);
        
        if (parseInt(data.productQty) >= newQuantity) {
          const updatedCart = await LsrCart.findOneAndUpdate(
            { addedBy: data.addedBy, product_id: data.product_id },
            { quantity: newQuantity },
            { new: true }
          );

          return {
            success: true,
            data: updatedCart,
            message: constantObj.lsrcart.UPDATED_CART
          };
        } else {
          throw new Error(constantObj.lsrcart.QUANTITY_OVER);
        }
      } else {
        if (parseInt(data.productQty) >= parseInt(data.quantity)) {
          const newCart = await LsrCart.create(data);
          
          return {
            success: true,
            data: newCart,
            message: constantObj.lsrcart.SAVED_ITEM
          };
        } else {
          throw new Error(constantObj.lsrcart.QUANTITY_OVER);
        }
      }
    } catch (error) {
      throw new Error(error.message || 'Failed to save reserve cart');
    }
  }

  async saveReserveCartMultiple(data) {
    try {
      for (const item of data) {
        const existingCart = await LsrCart.findOne({
          addedBy: item.addedBy,
          product_id: item.product_id?.id || item.product_id
        });

        if (existingCart) {
          const newQuantity = parseInt(item.quantity) + parseInt(existingCart.quantity);
          
          if (parseInt(item.productQty) >= newQuantity) {
            await LsrCart.findOneAndUpdate(
              { addedBy: item.addedBy, product_id: item.product_id?.id || item.product_id },
              { quantity: newQuantity }
            );
          }
        } else {
          if (parseInt(item.productQty) >= parseInt(item.quantity)) {
            const cartData = {
              ...item,
              product_id: item.product_id?.id || item.product_id,
              addedBy: item.addedBy
            };
            await LsrCart.create(cartData);
          }
        }
      }

      return {
        success: true,
        message: constantObj.lsrcart.SAVED_ITEM
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to save multiple cart items');
    }
  }

  async checkQuantityInCart(productId) {
    try {
      const cartItems = await LsrCart.find({ product_id: productId });
      
      let total = 0;
      for (const item of cartItems) {
        total += item.quantity;
      }

      return {
        success: true,
        total: total
      };
    } catch (error) {
      throw new Error('Failed to check quantity in cart');
    }
  }

  async emptyCart(userId) {
    try {
      await LsrCart.deleteMany({ addedBy: userId });
      
      return {
        success: true,
        message: "Cart items removed successfully."
      };
    } catch (error) {
      throw new Error('Failed to empty cart');
    }
  }

  async checkReservedCart(userId) {
    try {
      const cartItems = await LsrCart.find({ addedBy: userId })
        .populate('product_id')
        .exec();

      let flag = false;
      
      for (const item of cartItems) {
        if (item.product_id && item.product_id._id) {
          if (item.product_id.quantity < 3 || item.product_id.quantity < item.quantity) {
            item.isOutOfStock = true;
            flag = true;
          } else {
            item.isOutOfStock = false;
          }
        } else {
          item.isOutOfStock = false;
        }
      }

      return {
        success: true,
        isOutOfStock: flag,
        data: cartItems
      };
    } catch (error) {
      throw new Error('Failed to check reserved cart');
    }
  }
}

module.exports = new LsrCartService();