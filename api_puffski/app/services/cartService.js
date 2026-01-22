const mongoose = require('mongoose');
const cron = require('node-cron');
const redis = require('redis');
const request = require('request');
const constantObj = require('../utils/constants');

// Model imports
const Cart = require('../models/cart');
const Product = require('../models/product');
const Itemproduct = require('../models/Itemproduct');
const UserActivity = require('../models/UserActivity');
const StoreInfo = require('../models/StoreInfo');
const Item = require('../models/item');
const Itemproducer = require('../models/Itemproducer');

// Redis client initialization
let redisClient;
try {
  redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });
  
  redisClient.on('error', (err) => console.error('Redis Client Error:', err));
  redisClient.on('connect', () => console.log('Redis connected successfully'));
  
  redisClient.connect().catch(err => {
    console.error('Redis connection failed:', err.message);
  });
} catch (err) {
  console.error('Redis initialization error:', err);
}

// Setup cron job to clear cart daily
cron.schedule('0 2 * * *', function () {
  console.log('cron is running - clearing all carts');
  try {
    Cart.deleteMany({}).then(function (cart) { });
  } catch (err) {
    console.log('Cron error:', err);
  }
}, {
  timezone: 'UTC'
});

// Helper functions
function cleanProducts(products) {
  return products.map(product => {
    if (product.variants && product.variants.length > 0) {
      const filteredVariants = product.variants.filter(variant => variant.quantity >= 3);
      if (filteredVariants.length > 0) {
        product.variants = filteredVariants;
        const totalQuantity = filteredVariants.reduce((sum, variant) => sum + variant.quantity, 0);
        if (totalQuantity > 0) {
          product.quantity = totalQuantity;
        }
        return product;
      }
    } else {
      if (product.quantity > 2) {
        return product;
      }
    }
    return null;
  }).filter(product => product !== null);
}

// Redis helper function
async function updateExistingRecord(key, value) {
  if (!redisClient) {
    console.error("Redis client not initialized");
    return;
  }
  
  try {
    const cache = await redisClient.get(key);
    
    if (!cache) {
      let dataToAdd = { success: true, data: [value] };
      await redisClient.set(key, JSON.stringify(dataToAdd));
    } else {
      let data = JSON.parse(cache);

      if (data && data.data && data.data.length > 0) {
        data.data = data.data.filter(x => x != null);
        var foundIndex = data.data.findIndex(x => String(x.id) == String(value.id));
        if (foundIndex > -1) {
          if (value.quantity > 2) {
            data.data[foundIndex] = value;
            data.data = data.data.filter(x => x != null);
            await redisClient.set(key, JSON.stringify(data));
          } else {
            data.data.splice(foundIndex, 1);
            await redisClient.set(key, JSON.stringify(data));
          }
        } else {
          if (value.quantity > 2) {
            data.data.push(value);
            await redisClient.set(key, JSON.stringify(data));
          }
        }
      } else {
        console.log("Cache not found for updateExistingRecord:", key);
      }
    }
  } catch (err) {
    console.error("Redis error in updateExistingRecord:", err.message);
  }
}

// Cart Service Methods
const cartService = {
  // Get user's cart
  getCart: async (userId) => {
    const query = {
      addedBy: userId,
      cart_type: { $exists: false }
    };
    
    try {
      const data = await Cart.find(query).populate('product_id');
      return { success: true, data };
    } catch (err) {
      console.error('Error in getCart service:', err);
      return { success: false, error: err.message };
    }
  },

  // Get user's reserved cart
  getReservedCart: async (userId, dispensary_id = null) => {
    const query = {
      addedBy: userId,
      cart_type: 'reserved'
    };
    
    if (dispensary_id) {
      query.dispensary_id = dispensary_id;
    }
    
    try {
      const data = await Cart.find(query).populate('item_product_id');
      
      let flag = false;
      let dispensaryFlag = false;
      
      for await (const itm of data) {
        if (itm.item_product_id && itm.item_product_id._id) {
          if (itm && itm.item_product_id && itm.item_product_id.product_id) {
            let productData = await Product.findOne({ _id: itm.item_product_id.product_id });
            itm.item_product_id.product_id = productData;
          }

          let count = await Itemproduct.findOne({ _id: itm.item_product_id._id });
          
          if (itm.item_product_id.inResponse == false || (count && (count.quantity < 3 || count.quantity < itm.quantity))) {
            itm.isOutOfStock = true;
            flag = true;
          } else {
            itm.isOutOfStock = false;
          }
        } else {
          itm.isOutOfStock = false;
        }
        
        if (dispensary_id && (dispensary_id == itm.dispensary_id)) {
          dispensaryFlag = true;
        }
      }

      return { 
        success: true, 
        data, 
        isStore: dispensaryFlag, 
        isOutOfStock: flag 
      };
    } catch (err) {
      console.error('Error in getReservedCart service:', err);
      return { success: false, error: err.message };
    }
  },

  // Update cart item
  updateCart: async (cartId, updateData) => {
    try {
      if (parseInt(updateData.productQty) >= parseInt(updateData.quantity)) {
        const result = await Cart.findByIdAndUpdate(cartId, updateData, { new: true });
        return { success: true, data: result };
      } else {
        return { 
          success: false, 
          error: constantObj.cart.QUANTITY_OVER 
        };
      }
    } catch (err) {
      console.error('Error in updateCart service:', err);
      return { success: false, error: err.message };
    }
  },

  // Delete cart item
  deleteCartItem: async (cartItemId) => {
    try {
      const cart = await Cart.findByIdAndDelete(cartItemId);
      if (cart) {
        return { 
          success: true, 
          message: 'Item removed from cart' 
        };
      } else {
        return { 
          success: false, 
          error: 'Cart item not found' 
        };
      }
    } catch (err) {
      console.error('Error in deleteCartItem service:', err);
      return { success: false, error: err.message };
    }
  },

  // Save to cart (regular cart)
  saveCart: async (userId, cartData) => {
    try {
      const existingCart = await Cart.findOne({
        addedBy: userId,
        product_id: cartData.product_id,
      });

      if (existingCart) {
        const new_quantity = parseInt(cartData.quantity) + parseInt(existingCart.quantity);
        if (parseInt(cartData.productQty) >= new_quantity) {
          const updatedCart = await Cart.findOneAndUpdate(
            { addedBy: userId, product_id: cartData.product_id },
            { quantity: new_quantity },
            { new: true }
          );
          
          return { 
            success: true, 
            data: updatedCart, 
            message: constantObj.cart.UPDATED_CART 
          };
        } else {
          return { 
            success: false, 
            error: constantObj.cart.QUANTITY_OVER 
          };
        }
      } else {
        if (parseInt(cartData.productQty) >= parseInt(cartData.quantity)) {
          cartData.addedBy = userId;
          const newCart = await Cart.create(cartData);
          
          // Update Redis cache
          try {
            const productData = await Itemproduct.findOne({ _id: cartData.product_id })
              .populate("addedBy").populate("category_id").populate("producer_id")
              .populate("instaleaf_producerId").populate("instaleaf_categoryId");
            
            if (productData) {
              const redisObj = {
                "_id": productData._id,
                "id": productData._id,
                // Add other properties as needed
              };
              
              const redisKey = userId + "-AllCartLikedProduct";
              await updateExistingRecord(redisKey, redisObj);
            }
          } catch (redisErr) {
            console.error('Redis update error in saveCart:', redisErr);
          }

          return { 
            success: true, 
            data: newCart, 
            message: constantObj.cart.SAVED_ITEM 
          };
        } else {
          return { 
            success: false, 
            error: constantObj.cart.QUANTITY_OVER 
          };
        }
      }
    } catch (err) {
      console.error('Error in saveCart service:', err);
      return { success: false, error: err.message };
    }
  },

  // Save to reserved cart
  saveReserveCart: async (userId, cartData) => {
    try {
      const existingCart = await Cart.findOne({
        addedBy: userId,
        item_product_id: cartData.item_product_id,
      });

      if (existingCart) {
        const new_quantity = parseInt(cartData.quantity) + parseInt(existingCart.quantity);
        if (parseInt(cartData.productQty) >= new_quantity) {
          const updatedCart = await Cart.findOneAndUpdate(
            { addedBy: userId, item_product_id: cartData.item_product_id },
            { quantity: new_quantity },
            { new: true }
          );
          
          return { 
            success: true, 
            data: updatedCart, 
            message: constantObj.cart.UPDATED_CART 
          };
        } else {
          return { 
            success: false, 
            error: constantObj.cart.QUANTITY_OVER 
          };
        }
      } else {
        if (parseInt(cartData.productQty) >= parseInt(cartData.quantity)) {
          cartData.addedBy = userId;
          const newCart = await Cart.create(cartData);
          
          // Log user activity
          try {
            const dispensary_data = await Item.find({ _id: cartData.dispensary_id });
            const storeName = dispensary_data[0] ? dispensary_data[0].name : 'Unknown Store';

            const item_product = await Itemproduct.find({ _id: cartData.item_product_id });
            const sku = item_product[0] ? item_product[0].sku : '';
            const brandid = item_product[0] ? item_product[0].producer_id : null;

            if (brandid) {
              const branddata = await Itemproducer.find({ _id: brandid });

              const userActivityData = {
                sku,
                store: storeName,
                productName: item_product[0].name,
                brand: branddata[0] ? branddata[0].name : '',
                dispensary_id: cartData.dispensary_id,
                productId: cartData.item_product_id,
                quantity: cartData.quantity,
                variant_id: cartData.variant_id && cartData.variant_id.length > 0 ? cartData.variant_id.updatedprice : 0,
                addedBy: userId,
              };
              
              await UserActivity.create(userActivityData);
            }
          } catch (activityErr) {
            console.error('UserActivity creation error:', activityErr.message);
          }

          // Update Redis cache
          try {
            const productData = await Itemproduct.findOne({ _id: cartData.item_product_id })
              .populate("addedBy").populate("category_id").populate("producer_id")
              .populate("instaleaf_producerId").populate("instaleaf_categoryId");
            
            if (productData) {
              const redisObj = {
                "_id": productData._id,
                "id": productData._id,
                // Add other properties as needed
              };
              
              const redisKey = userId + "-AllCartLikedProduct";
              await updateExistingRecord(redisKey, redisObj);
            }
          } catch (redisErr) {
            console.error('Redis update error in saveReserveCart:', redisErr);
          }

          return { 
            success: true, 
            data: newCart, 
            message: constantObj.cart.SAVED_ITEM 
          };
        } else {
          return { 
            success: false, 
            error: constantObj.cart.QUANTITY_OVER 
          };
        }
      }
    } catch (err) {
      console.error('Error in saveReserveCart service:', err);
      return { success: false, error: err.message };
    }
  },

  // Save multiple items to reserved cart
  saveReserveCartMultiple: async (userId, itemsData) => {
    try {
      const cartProducts = await Cart.find({ addedBy: userId }).limit(1);
      
      if (cartProducts.length > 0) {
        if (cartProducts[0].dispensary_id != itemsData[0].dispensary_id) {
          return { 
            success: false, 
            error: 'You can only add product of one store in cart' 
          };
        }
      }

      for await (let itm of itemsData) {
        const cartQuery = {
          addedBy: userId,
          item_product_id: itm.item_product_id.id,
        };

        if (itm.variantId) {
          cartQuery.variantId = itm.variantId;
        }

        const existingCart = await Cart.findOne(cartQuery);
        if (existingCart) {
          const new_quantity = parseInt(itm.quantity) + parseInt(existingCart.quantity);
          if (parseInt(itm.productQty) >= new_quantity) {
            await Cart.findOneAndUpdate(
              { addedBy: userId, item_product_id: itm.item_product_id.id },
              { quantity: new_quantity },
              { new: true }
            );
          }
        } else {
          if (parseInt(itm.productQty) >= parseInt(itm.quantity)) {
            itm.item_product_id = itm.item_product_id.id;
            itm.addedBy = userId;
            await Cart.create(itm);
          }
        }
      }

      return { 
        success: true, 
        data: itemsData, 
        message: constantObj.cart.SAVED_ITEM 
      };
    } catch (err) {
      console.error('Error in saveReserveCartMultiple service:', err);
      return { success: false, error: err.message };
    }
  },

  // Check quantity of a product in all carts
  checkQuantityInCart: async (productId) => {
    try {
      const query = {
        item_product_id: productId,
        cart_type: 'reserved'
      };
      
      const cart = await Cart.find(query);
      let total = 0;
      
      if (cart && cart.length > 0) {
        for await (const itm of cart) {
          total += itm.quantity;
        }
      }

      return { success: true, total };
    } catch (err) {
      console.error('Error in checkQuantityInCart service:', err);
      return { success: false, error: err.message };
    }
  },

  // Check user's cart status
  checkInCart: async (userId) => {
    try {
      const query = {
        addedBy: userId,
        cart_type: 'reserved'
      };
      
      const cart = await Cart.find(query);
      let total = 0;
      let flag = false;
      let productData = [];
      
      if (cart && cart.length > 0) {
        for await (const itm of cart) {
          const item_productData = await Itemproduct.findOne({ _id: itm.item_product_id });
          
          if (item_productData && item_productData.quantity > itm.quantity) {
            const leftQuantity = Number(item_productData.quantity) - (itm.quantity);
            productData.push({ 
              id: itm.item_product_id, 
              productName: item_productData.name, 
              available: leftQuantity, 
              cartQuantity: itm.quantity, 
              isOutOfStock: false 
            });
          } else {
            flag = true;
            productData.push({ 
              id: itm.item_product_id, 
              productName: item_productData ? item_productData.name : 'Unknown Product', 
              available: item_productData ? item_productData.quantity : 0, 
              cartQuantity: itm.quantity, 
              isOutOfStock: true 
            });
          }
          total += itm.quantity;
        }

        return { 
          success: true, 
          isOutOfStock: flag, 
          cartTotal: total, 
          data: productData 
        };
      } else {
        return { success: true, total };
      }
    } catch (err) {
      console.error('Error in checkInCart service:', err);
      return { success: false, error: err.message };
    }
  },

  // Empty user's cart
  emptyCart: async (userId) => {
    try {
      const query = { addedBy: userId };
      await Cart.deleteMany(query);
      
      return { 
        success: true, 
        message: "Cart items removed successfully." 
      };
    } catch (err) {
      console.error('Error in emptyCart service:', err);
      return { success: false, error: err.message };
    }
  },

  // Check reserved cart with store API integration
  checkReservedCart: async (userId, dispensary_id) => {
    try {
      const stores = await StoreInfo.find({ dispensary_id: dispensary_id });
      
      if (stores && stores.length > 0) {
        const store = stores[0];
        
        return new Promise((resolve, reject) => {
          const options = {
            method: 'GET',
            url: store.url + '/company/' + store.company_id + '/location/' + store.location_id + '/posListings',
            headers: { 'x-api-key': store.auth_key, useQueryString: true },
          };
          
          request(options, async function (error, response, body) {
            if (error) {
              console.log('Store API error:', error.message);
              return resolve({ 
                success: false, 
                error: 'Store API error' 
              });
            }
            
            try {
              const responseData = JSON.parse(body);
              let productData = responseData.products;
              let products = cleanProducts(productData);
              products = products.flatMap(product => product.variants && product.variants.length > 0 ? product.variants : product);

              const query = {
                addedBy: userId,
                cart_type: 'reserved'
              };
              
              if (dispensary_id) { 
                query.dispensary_id = dispensary_id; 
              }
              
              const data = await Cart.find(query).populate('item_product_id');
              
              let flag = false;
              let dispensaryFlag = false;
              
              for await (const itm of data) {
                if (itm.item_product_id && itm.item_product_id._id) {
                  if (itm && itm.item_product_id && itm.item_product_id.product_id) {
                    let productData = await Product.findOne({ _id: itm.item_product_id.product_id });
                    itm.item_product_id.product_id = productData;
                  }
                  
                  const foundData = products.filter(x => { return x.id == itm.item_product_id.pos_product_id });
                  const foundDataCount = foundData[0] && foundData[0].quantity ? Number(foundData[0].quantity) : 0;
                  
                  if (foundDataCount < 3 || foundDataCount < itm.quantity) {
                    itm.isOutOfStock = true;
                    flag = true;
                  } else {
                    itm.isOutOfStock = false;
                  }
                } else {
                  itm.isOutOfStock = false;
                }
                
                if (dispensary_id && (dispensary_id == itm.dispensary_id)) {
                  dispensaryFlag = true;
                }
              }

              resolve({ 
                success: true, 
                isStore: dispensaryFlag, 
                isOutOfStock: flag, 
                data: data 
              });
            } catch (parseErr) {
              console.error('Parse error:', parseErr.message);
              resolve({ 
                success: false, 
                error: 'Store data parse error' 
              });
            }
          });
        });
      } else {
        return { 
          success: false, 
          error: 'No Store found' 
        };
      }
    } catch (err) {
      console.error('Error in checkReservedCart service:', err);
      return { success: false, error: err.message };
    }
  }
};

module.exports = cartService;