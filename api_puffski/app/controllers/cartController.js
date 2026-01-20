// controllers/CartController.js
const { CronJob } = require('cron');
const { createClient } = require('redis');
const request = require('request');
const mongoose = require('mongoose');
const constants = require('../utils/constants.js');

// Redis client setup
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

// Initialize Redis connection 
(async () => {
  try {
    await redisClient.connect();
    console.log('Redis connected successfully');
  } catch (err) {
    console.error('Redis connection error:', err);
  }
})();

// Initialize cron job
new CronJob(
  '0 2 * * *',
  async () => {
    console.log('cron is running');
    try {
      await Cart.deleteMany({});
    } catch (err) {
      console.error('Cron error:', err);
    }
  },
  null,
  true,
  'UTC'
);

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

async function updateExistingRecord(key, value) {
  try {
    const cache = await redisClient.get(key);
    
    if (!cache) {
      const dataToAdd = { success: true, data: [value] };
      await redisClient.set(key, JSON.stringify(dataToAdd));
      return;
    }
    
    let data = JSON.parse(cache);
    
    if (data && data.data && data.data.length > 0) {
      data.data = data.data.filter(x => x !== null);
      const foundIndex = data.data.findIndex(x => String(x.id) === String(value.id));
      
      if (foundIndex > -1) {
        if (value.quantity > 2) {
          data.data[foundIndex] = value;
          data.data = data.data.filter(x => x !== null);
        } else {
          data.data.splice(foundIndex, 1);
        }
      } else {
        if (value.quantity > 2) {
          data.data.push(value);
        }
      }
      
      await redisClient.set(key, JSON.stringify(data));
    } else {
      const dataToAdd = { success: true, data: [value] };
      await redisClient.set(key, JSON.stringify(dataToAdd));
    }
  } catch (err) {
    console.error('Redis update error:', err);
  }
}

function createRedisObject(productData) {
  return {
    "_id": productData._id || productData.id,
    "id": productData._id || productData.id,
    "dispensary_id": productData.dispensary_id,
    "name": productData.name,
    "parentProductName": productData.parentProductName || null,
    "description": productData.description,
    "sku": productData.sku,
    "slug": productData.slug,
    "barcode": productData.barcode,
    "imageUrl": productData.imageUrl || null,
    "price": productData.price,
    "categoryId": productData.categoryId,
    "categoryName": productData.parentCategoryName,
    "parentCategoryId": productData.parentCategoryId,
    "parentCategoryName": productData.parentCategoryName,
    "supplierId": productData.supplierId,
    "supplierName": productData.supplierName,
    "quantity": productData.quantity || 0,
    "weight": productData.weight || 0,
    "cannabisWeight": productData.cannabisWeight,
    "cannabisVolume": productData.cannabisVolume || null,
    "thc": productData.thc || 0,
    "cbd": productData.cbd || 0,
    "CBD_Content": productData.CBD_Content || 0,
    "CBD_Percent": productData.CBD_Percent || 0,
    "THC_Content": productData.THC_Content || 0,
    "THC_Percent": productData.THC_Percent || 0,
    "detail": productData.detail || "",
    "weightUnit": productData.weightUnit || "",
    "product_id": productData.product_id || null,
    "productQty": productData.quantity || 0,
    "specialPrice": productData.specialPrice || 0,
    "isFavourite": productData.isFavourite || "",
    "metaData": productData.metaData || {},
    "taxes": productData.taxes,
    "depositFee": productData.depositFee || null,
    "inStock": productData.inStock,
    "category_id": productData.category_id || null,
    "producer_id": productData.producer_id,
    "category_name": productData.category_name,
    "categeoryname": productData.category_name,
    "producername": productData.producer_id?.name || "",
    "producer_supplierId": productData.producer_id?.supplierId || "",
    "order": 2,
    "pos_name": productData.pos_name,
    "dispensary_id": productData.dispensary_id,
    "dataType": "import",
    "addedBy": productData.addedBy?.firstName || "",
    "createdBy": productData.createdBy,
    "pre_roll": productData.pre_roll || 0,
    "Eighth": productData.Eighth || 0,
    "quarter": productData.quarter || 0,
    "half": productData.half || 0,
    "ounce": productData.ounce || 0,
    "details": productData.details || "",
    "thc_max": productData.thc_max || 0,
    "thc_min": productData.thc_min || 0,
    "cbd_max": productData.cbd_max || 0,
    "cbd_min": productData.cbd_min || 0,
    "image": productData.image || "",
    "status": productData.status,
    "isDeleted": productData.isDeleted,
    "brand_name": productData.brand_name || "",
    "grams": productData.grams || 0,
    "isSpecial": "deactive",
    "isStaff": "deactive",
    "isStore": "deactive",
    "inResponse": productData.quantity > 2,
    "createdAt": productData.createdAt,
    "updatedAt": productData.updatedAt,
    "instaleaf_category": productData.instaleaf_categoryId || null,
    "instaleaf_categoryId": productData.instaleaf_categoryId?._id || productData.instaleaf_categoryId?.id || null,
    "instaleaf_categoryName": productData.instaleaf_categoryId?.name || "",
    "instaleaf_producer": productData.instaleaf_producerId || null,
    "instaleaf_producerId": productData.instaleaf_producerId?._id || productData.instaleaf_producerId?.id || null,
    "updatedBy": productData.updatedBy || null,
    "pos_product_id": productData.pos_product_id,
    "isFrontendHide": productData.quantity <= 2,
    "discountPercent": productData.discountPercent || "",
    "discountPrice": productData.discountPrice || 0,
    "isOnSale": productData.isOnSale || false,
    "meta_title": productData.meta_title || "",
    "meta_name": productData.meta_name || "",
    "meta_desc": productData.meta_desc || "",
    "meta_keywords": productData.meta_keywords || "",
    "likeCount": productData.likeCount || 0,
    "dislikeCount": productData.dislikeCount || 0,
  };
}

// Import models
const Cart = require('../models/cart.js');
const Itemproduct = require('../models/Itemproduct.js');
const Product = require('../models/product.js');
const Item = require('../models/item.js');
const Itemproducer = require('../models/Itemproducer.js');
const UserActivity = require('../models/UserActivity.js');
const StoreInfo = require('../models/StoreInfo.js');

class CartController {
  // Get cart items
  async getCart(req, res) {
    try {
      const userId = req.user.id || req.identity.id;
      const { dispensary_id } = req.query;
      
      const query = {
        addedBy: userId,
        cart_type: { $exists: false }
      };
      
      if (dispensary_id) {
        query.dispensary_id = dispensary_id;
      }
      
      const cartItems = await Cart.find(query)
        .populate('product_id');
      
      return res.status(200).json({
        success: true,
        data: cartItems
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }

  // Get reserved cart
  async getReservedCart(req, res) {
    try {
      const userId = req.user.id || req.identity.id;
      const { dispensary_id } = req.query;
      
      const query = {
        addedBy: userId,
        cart_type: 'reserved'
      };
      
      if (dispensary_id) {
        query.dispensary_id = dispensary_id;
      }
      
      const cartItems = await Cart.find(query)
        .populate({
          path: 'item_product_id',
          populate: [
            { path: 'addedBy' },
            { path: 'category_id' },
            { path: 'producer_id' },
            { path: 'instaleaf_producerId' },
            { path: 'instaleaf_categoryId' }
          ]
        });
      
      let flag = false;
      let dispensaryFlag = false;
      
      for (const item of cartItems) {
        const itemProductId = item.item_product_id?._id || item.item_product_id?.id;
        
        if (itemProductId) {
          // If product_id exists in item_product_id, populate it
          if (item.item_product_id?.product_id) {
            const productData = await Product.findById(item.item_product_id.product_id);
            if (productData) {
              item.item_product_id.product_id = productData;
            }
          }
          
          // Check quantity
          const count = await Itemproduct.findById(itemProductId);
          
          if (!item.item_product_id?.inResponse || count?.quantity < 3 || count?.quantity < item.quantity) {
            item.isOutOfStock = true;
            flag = true;
          } else {
            item.isOutOfStock = false;
          }
        } else {
          item.isOutOfStock = false;
        }
        
        if (dispensary_id && dispensary_id === item.dispensary_id?.toString()) {
          dispensaryFlag = true;
        }
      }
      
      return res.status(200).json({
        success: true,
        isStore: dispensaryFlag,
        isOutOfStock: flag,
        data: cartItems
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }

  // Update cart item
  async updateCart(req, res) {
    try {
      const data = req.body;
      
      if (parseInt(data.productQty) >= parseInt(data.quantity)) {
        const result = await Cart.findByIdAndUpdate(
          data.id,
          data,
          { new: true }
        );
        
        if (!result) {
          return res.status(404).json({
            success: false,
            error: 'Cart item not found'
          });
        }
        
        return res.status(200).json({
          success: true,
          data: result
        });
      } else {
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: constants.cart?.QUANTITY_OVER || 'Requested quantity is not available'
          }
        });
      }
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }

  // Delete cart item
  async delete(req, res) {
    try {
      const { id } = req.query;
      
      const cart = await Cart.findByIdAndDelete(id);
      
      if (cart) {
        return res.status(200).json({
          success: true,
          code: 200,
          data: {
            message: 'Item removed from cart'
          }
        });
      } else {
        return res.status(400).json({
          success: false,
          error: 'Cart item not found'
        });
      }
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }

  // Save to cart
  async saveCart(req, res) {
    try {
      const userId = req.user.id || req.identity.id;
      const data = req.body;
      data.addedBy = userId;
      
      const existingCart = await Cart.findOne({
        addedBy: userId,
        product_id: data.product_id
      });
      
      if (existingCart) {
        const new_quantity = parseInt(data.quantity) + parseInt(existingCart.quantity);
        
        if (parseInt(data.productQty) >= new_quantity) {
          const updatedCart = await Cart.findByIdAndUpdate(
            existingCart._id,
            { quantity: new_quantity },
            { new: true }
          );
          
          return res.status(200).json({
            success: true,
            data: updatedCart,
            message: constants.cart?.UPDATED_CART || 'Cart updated successfully'
          });
        } else {
          return res.status(400).json({
            success: false,
            error: {
              code: 400,
              message: constants.cart?.QUANTITY_OVER || 'Requested quantity is not available'
            }
          });
        }
      } else {
        console.log(
          'Creating new cart item',
          data.productQty,
          '================>',
          data.quantity,
          'id',
          data.product_id,
          'price',
          data.price,
          'cart_type',
          data.cart_type
        );
        
        if (parseInt(data.productQty) >= parseInt(data.quantity)) {
          const createdCart = await Cart.create(data);
          
          // Update Redis cache
          try {
            const productData = await Itemproduct.findById(data.product_id)
              .populate("addedBy")
              .populate("category_id")
              .populate("producer_id")
              .populate("instaleaf_producerId")
              .populate("instaleaf_categoryId");
            
            if (productData) {
              const redisObj = createRedisObject(productData);
              const redisKey = `${userId}-AllCartLikedProduct`;
              await updateExistingRecord(redisKey, redisObj);
            }
          } catch (redisErr) {
            console.error('Redis update error:', redisErr);
          }
          
          return res.status(200).json({
            success: true,
            data: createdCart,
            message: constants.cart?.SAVED_ITEM || 'Item added to cart successfully'
          });
        } else {
          return res.status(400).json({
            success: false,
            error: {
              code: 400,
              message: constants.cart?.QUANTITY_OVER || 'Requested quantity is not available'
            }
          });
        }
      }
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: {
          message: err.message
        }
      });
    }
  }

  // Save reserved cart
  async saveReserveCart(req, res) {
    try {
      const userId = req.user.id || req.identity.id;
      const data = req.body;
      data.addedBy = userId;
      
      const existingCart = await Cart.findOne({
        addedBy: userId,
        item_product_id: data.item_product_id
      });
      
      if (existingCart) {
        const new_quantity = parseInt(data.quantity) + parseInt(existingCart.quantity);
        
        if (parseInt(data.productQty) >= new_quantity) {
          const updatedCart = await Cart.findByIdAndUpdate(
            existingCart._id,
            { quantity: new_quantity },
            { new: true }
          );
          
          return res.status(200).json({
            success: true,
            data: updatedCart,
            message: constants.cart?.UPDATED_CART || 'Cart updated successfully'
          });
        } else {
          return res.status(400).json({
            success: false,
            error: {
              code: 400,
              message: constants.cart?.QUANTITY_OVER || 'Requested quantity is not available'
            }
          });
        }
      } else {
        if (parseInt(data.productQty) >= parseInt(data.quantity)) {
          const createdCart = await Cart.create(data);
          
          // Create user activity log
          try {
            const dispensaryData = await Item.findById(data.dispensary_id);
            const itemProduct = await Itemproduct.findById(data.item_product_id);
            
            if (dispensaryData && itemProduct) {
              const brandData = await Itemproducer.findById(itemProduct.producer_id);
              
              const userActivityData = {
                sku: itemProduct.sku,
                store: dispensaryData.name,
                productName: itemProduct.name,
                brand: brandData?.name || '',
                dispensary_id: data.dispensary_id,
                productId: data.item_product_id,
                quantity: data.quantity,
                variant_id: data.variant_id && data.variant_id.length > 0 ? data.variant_id.updatedprice : 0,
                addedBy: userId
              };
              
              await UserActivity.create(userActivityData);
            }
          } catch (activityErr) {
            console.error('User activity creation error:', activityErr);
          }
          
          // Update Redis cache
          try {
            const productData = await Itemproduct.findById(data.item_product_id)
              .populate("addedBy")
              .populate("category_id")
              .populate("producer_id")
              .populate("instaleaf_producerId")
              .populate("instaleaf_categoryId");
            
            if (productData) {
              const redisObj = createRedisObject(productData);
              const redisKey = `${userId}-AllCartLikedProduct`;
              await updateExistingRecord(redisKey, redisObj);
            }
          } catch (redisErr) {
            console.error('Redis update error:', redisErr);
          }
          
          return res.status(200).json({
            success: true,
            data: createdCart,
            message: constants.cart?.SAVED_ITEM || 'Item added to cart successfully'
          });
        } else {
          return res.status(400).json({
            success: false,
            error: {
              code: 400,
              message: constants.cart?.QUANTITY_OVER || 'Requested quantity is not available'
            }
          });
        }
      }
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: err.message }
      });
    }
  }

  // Save multiple items to reserved cart
  async saveReserveCartMultiple(req, res) {
    try {
      const userId = req.user.id || req.identity.id;
      const { data: cartItems } = req.body;
      
      // Check if user already has items from different store
      const existingCarts = await Cart.find({ addedBy: userId }).limit(1);
      
      if (existingCarts.length > 0 && 
          cartItems.length > 0 && 
          existingCarts[0].dispensary_id?.toString() !== cartItems[0].dispensary_id) {
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: 'You can only add product of one store in cart'
          }
        });
      }
      
      for (const item of cartItems) {
        item.addedBy = userId;
        
        const existingCart = await Cart.findOne({
          addedBy: userId,
          item_product_id: item.item_product_id?.id || item.item_product_id
        });
        
        if (existingCart) {
          const new_quantity = parseInt(item.quantity) + parseInt(existingCart.quantity);
          
          if (parseInt(item.productQty) >= new_quantity) {
            await Cart.findByIdAndUpdate(
              existingCart._id,
              { quantity: new_quantity }
            );
          }
        } else {
          if (parseInt(item.productQty) >= parseInt(item.quantity)) {
            const cartData = {
              ...item,
              item_product_id: item.item_product_id?.id || item.item_product_id,
              addedBy: userId
            };
            await Cart.create(cartData);
          }
        }
      }
      
      return res.status(200).json({
        success: true,
        message: constants.cart?.SAVED_ITEM || 'Items added to cart successfully'
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: err.message }
      });
    }
  }

  // Check quantity of a product in all users' carts
  async checkQuantityInCart(req, res) {
    try {
      const { id } = req.query;
      
      const cartItems = await Cart.find({
        item_product_id: id,
        cart_type: 'reserved'
      });
      
      let total = 0;
      if (cartItems && cartItems.length > 0) {
        total = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      }
      
      return res.status(200).json({
        success: true,
        total
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: err.message }
      });
    }
  }

  // Check if user has items in cart
  async checkInCart(req, res) {
    try {
      const { id } = req.query;
      
      const cartItems = await Cart.find({
        addedBy: id,
        cart_type: 'reserved'
      });
      
      let total = 0;
      let flag = false;
      const productData = [];
      
      if (cartItems && cartItems.length > 0) {
        for (const item of cartItems) {
          const itemProduct = await Itemproduct.findById(item.item_product_id);
          
          if (itemProduct) {
            const leftQuantity = Number(itemProduct.quantity) - item.quantity;
            
            if (itemProduct.quantity > item.quantity) {
              productData.push({
                id: item.item_product_id,
                productName: itemProduct.name,
                available: leftQuantity,
                cartQuantity: item.quantity,
                isOutOfStock: false
              });
            } else {
              flag = true;
              productData.push({
                id: item.item_product_id,
                productName: itemProduct.name,
                available: itemProduct.quantity,
                cartQuantity: item.quantity,
                isOutOfStock: true
              });
            }
            total += item.quantity;
          }
        }
      }
      
      return res.status(200).json({
        success: true,
        isOutOfStock: flag,
        cartTotal: total,
        data: productData
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: err.message }
      });
    }
  }

  // Empty cart
  async emptyCart(req, res) {
    try {
      const userId = req.user.id || req.identity.id;
      await Cart.deleteMany({ addedBy: userId });
      
      return res.status(200).json({
        success: true,
        message: "Cart items removed successfully."
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: err.message }
      });
    }
  }

  // Check reserved cart against external API
  async checkReservedCart(req, res) {
    try {
      const userId = req.user.id || req.identity.id;
      const { dispensary_id } = req.query;
      
      const stores = await StoreInfo.find({ dispensary_id });
      
      if (stores && stores.length > 0) {
        const store = stores[0];
        
        const options = {
          method: 'GET',
          url: `${store.url}/company/${store.company_id}/location/${store.location_id}/posListings`,
          headers: { 'x-api-key': store.auth_key, useQueryString: true },
        };
        
        return new Promise((resolve) => {
          request(options, async (error, response, body) => {
            if (error) {
              console.error('API request error:', error);
              return res.status(400).json({
                success: false,
                error: error.message
              });
            }
            
            try {
              const responseData = JSON.parse(body);
              let products = responseData.products || [];
              products = cleanProducts(products);
              products = products.flatMap(product => 
                product.variants && product.variants.length > 0 ? product.variants : product
              );
              
              const query = {
                addedBy: userId,
                cart_type: 'reserved'
              };
              
              if (dispensary_id) {
                query.dispensary_id = dispensary_id;
              }
              
              const cartItems = await Cart.find(query)
                .populate({
                  path: 'item_product_id',
                  populate: { path: 'product_id' }
                });
              
              let flag = false;
              let dispensaryFlag = false;
              
              for (const item of cartItems) {
                const itemProductId = item.item_product_id?._id || item.item_product_id?.id;
                
                if (itemProductId) {
                  // If product_id exists in item_product_id, populate it
                  if (item.item_product_id?.product_id) {
                    const productData = await Product.findById(item.item_product_id.product_id);
                    if (productData) {
                      item.item_product_id.product_id = productData;
                    }
                  }
                  
                  // Check against external API data
                  const foundData = products.filter(x => x.id == item.item_product_id?.pos_product_id);
                  const foundDataCount = foundData[0]?.quantity ? Number(foundData[0].quantity) : 0;
                  
                  if (foundDataCount < 3 || foundDataCount < item.quantity) {
                    item.isOutOfStock = true;
                    flag = true;
                  } else {
                    item.isOutOfStock = false;
                  }
                } else {
                  item.isOutOfStock = false;
                }
                
                if (dispensary_id && dispensary_id === item.dispensary_id?.toString()) {
                  dispensaryFlag = true;
                }
              }
              
              return res.status(200).json({
                success: true,
                isStore: dispensaryFlag,
                isOutOfStock: flag,
                data: cartItems
              });
            } catch (parseErr) {
              console.error('Parse error:', parseErr);
              return res.status(400).json({
                success: false,
                error: parseErr.message
              });
            }
          });
        });
      } else {
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: 'No Store found'
          }
        });
      }
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: err.message }
      });
    }
  }
}

// Create controller instance
const cartController = new CartController();

// Export for CommonJS
module.exports = cartController;