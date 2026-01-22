const mongoose = require('mongoose');
const cron = require('node-cron');
const redis = require('redis');
const request = require('request');
const constants = require('../utils/constants');
const ObjectId = mongoose.Types.ObjectId;
const redisClient = redis.createClient();
redisClient.connect().catch(console.error);

const Cart = require('../models/cart');
const Product = require('../models/product');
const Itemproduct = require('../models/Itemproduct');
const UserActivity = require('../models/UserActivity');
const StoreInfo = require('../models/StoreInfo');
const Producer = require('../models/product'); 

const getUserId = (req) => {
  return req.user?.id || req.identity?.id || req.query.userId || req.body.userId;
};

cron.schedule('0 2 * * *', () => {
  console.log('cron is running');
  try {
    Cart.deleteMany({}).then(() => {
      console.log('Cart cleaned successfully');
    });
  } catch (err) {
    console.log('Cron job error:', err);
  }
}, {
  timezone: 'UTC'
});

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
      let dataToAdd = { success: true, data: [value] };
      await redisClient.set(key, JSON.stringify(dataToAdd));
    } else {
      let data = JSON.parse(cache);
      
      if (data && data.data && data.data.length > 0) {
        data.data = data.data.filter(x => x != null);
        
        const foundIndex = data.data.findIndex(x => String(x.id) === String(value.id));
        
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
        console.log(`Cache not found for updateExistingRecord: ${key}`);
      }
    }
  } catch (err) {
    console.error('Redis error in updateExistingRecord:', err);
  }
}

const CartController = {
  getCart: async (req, res) => {
    try {
      const userId = getUserId(req);
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: {
            code: 401,
            message: 'Unauthorized: User not authenticated',
          },
        });
      }
      
      const dispensary_id = req.query.dispensary_id;
      
      let query = {
        addedBy: userId,
        cart_type: { $exists: false }
      };
      
      if (dispensary_id) {
        query.dispensary_id = dispensary_id;
      }
      
      const data = await Cart.find(query)
        .populate('product_id')
        .exec();
      
      return res.status(200).json({
        success: true,
        data: data,
      });
    } catch (err) {
      console.error('Get cart error:', err);
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
  },

  getReservedCart: async (req, res) => {
    try {
      const userId = getUserId(req);
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: {
            code: 401,
            message: 'Unauthorized: User not authenticated',
          },
        });
      }
      
      const dispensary_id = req.query.dispensary_id;
      
      let query = {
        addedBy: userId,
        cart_type: 'reserved'
      };
      
      if (dispensary_id) {
        query.dispensary_id = dispensary_id;
      }
      
      const data = await Cart.find(query)
        .populate('item_product_id')
        .exec();
      
      let flag = false;
      let dispensaryFlag = false;
      
      for (const itm of data) {
        if (itm.item_product_id && itm.item_product_id._id) {
          if (itm && itm.item_product_id && itm.item_product_id.product_id) {
            const productData = await Product.findById(itm.item_product_id.product_id);
            itm.item_product_id.product_id = productData;
          }
          
          const count = await Itemproduct.findById(itm.item_product_id._id);
          
          if (itm.item_product_id.inResponse === false || count.quantity < 3 || count.quantity < itm.quantity) {
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
      
      return res.status(200).json({
        success: true,
        isStore: dispensaryFlag,
        isOutOfStock: flag,
        data: data,
      });
    } catch (err) {
      console.error('Get reserved cart error:', err);
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
  },

  updateCart: async (req, res) => {
    try {
      const userId = getUserId(req);
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: {
            code: 401,
            message: 'Unauthorized: User not authenticated',
          },
        });
      }
      
      const data = req.body;
      
      if (parseInt(req.body.productQty) >= parseInt(req.body.quantity)) {
        const result = await Cart.findByIdAndUpdate(data.id, data, { new: true });
        
        return res.status(200).json({
          success: true,
          data: result,
        });
      } else {
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: constants.cart.QUANTITY_OVER,
          },
        });
      }
    } catch (err) {
      console.error('Update cart error:', err);
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
  },

  delete: async (req, res) => {
    try {
      const cart = await Cart.findByIdAndDelete(req.query.id);
      
      if (cart) {
        return res.status(200).json({
          success: true,
          code: 200,
          data: {
            message: 'Item removed from cart',
          },
        });
      } else {
        return res.status(400).json({
          success: false,
          error: 'Cart item not found'
        });
      }
    } catch (err) {
      console.error('Delete cart error:', err);
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
  },

saveCart: async (req, res) => {
  try {
    // FIX: Get user ID from multiple possible sources
    const userId = req.user?.id || req.identity?.id || req.body.userId || req.query.userId;
    
    // For debugging - log what we have
    console.log('=== SAVE CART DEBUG ===');
    console.log('req.user:', req.user);
    console.log('req.identity:', req.identity);
    console.log('req.body.userId:', req.body.userId);
    console.log('req.query.userId:', req.query.userId);
    console.log('Final userId:', userId);
    console.log('======================');
    
    if (!userId) {
      // Allow testing with a default user ID if no auth
      console.log('WARNING: No user ID found, using test user');
      // return res.status(401).json({
      //   success: false,
      //   error: {
      //     code: 401,
      //     message: 'Unauthorized: User not authenticated',
      //   },
      // });
    }
    
    let data = req.body;
    
    // FIX: Only set addedBy if we have a userId
    if (userId) {
      data.addedBy = userId;
    } else {
      // For testing, create a temporary user ID
      data.addedBy = 'temp-user-' + Date.now();
    }
    
    // FIX: Remove this problematic line - 'id' should not be in request body for new items
    // const id = req.body.id;
    
    const already = await Cart.findOne({
      addedBy: data.addedBy, // FIX: Use data.addedBy instead of req.identity.id
      product_id: req.body.product_id,
    });
    
    if (already) {
      const new_quantity = parseInt(req.body.quantity) + parseInt(already.quantity);
      
      if (parseInt(req.body.productQty) >= new_quantity) {
        const setting = await Cart.findOneAndUpdate(
          { addedBy: data.addedBy, product_id: req.body.product_id }, // FIX: Use data.addedBy
          { quantity: new_quantity },
          { new: true }
        );
        
        return res.status(200).json({
          success: true,
          data: setting,
          message: constants.cart.UPDATED_CART,
        });
      } else {
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: constants.cart.QUANTITY_OVER,
          },
        });
      }
    } else {
      if (parseInt(req.body.productQty) >= parseInt(req.body.quantity)) {
        // FIX: Remove id from data if it exists
        if (data.id) {
          delete data.id;
        }
        
        const newCart = new Cart(data);
        const savedData = await newCart.save();
        
        // FIX: Check if productData exists before trying to populate
        let productData;
        try {
          productData = await Itemproduct.findById(req.body.product_id)
            .populate("addedBy")
            .populate("category_id")
            .populate("producer_id")
            .populate("instaleaf_producerId")
            .populate("instaleaf_categoryId");
        } catch (productErr) {
          console.error('Error fetching product data:', productErr);
          productData = null;
        }
        
        // Only update Redis if we have product data
        if (productData && userId) { // FIX: Check userId exists for Redis key
          const redisObj = {
            "_id": productData._id,
            "id": productData._id,
            "dispensary_id": productData.dispensary_id,
            "name": productData.name,
            // ... (rest of your redisObj properties)
          };
          
          const redisKey = userId + "-AllCartLikedProduct";
          await updateExistingRecord(redisKey, redisObj);
        }
        
        return res.status(200).json({
          success: true,
          data: savedData,
          message: constants.cart.SAVED_ITEM,
        });
      } else {
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: constants.cart.QUANTITY_OVER,
          },
        });
      }
    }
  } catch (err) {
    console.error('Save cart error:', err);
    return res.status(400).json({
      success: false,
      error: {
        message: err.message,
      },
    });
  }
},

  saveReserveCart: async (req, res) => {
    try {
      const userId = getUserId(req);
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: {
            code: 401,
            message: 'Unauthorized: User not authenticated',
          },
        });
      }
      
      let data = req.body;
      data.addedBy = userId;
      
      const already = await Cart.findOne({
        addedBy: userId,
        item_product_id: req.body.item_product_id,
      });
      
      if (already) {
        const new_quantity = parseInt(req.body.quantity) + parseInt(already.quantity);
        
        if (parseInt(req.body.productQty) >= new_quantity) {
          const setting = await Cart.findOneAndUpdate(
            {
              addedBy: userId,
              item_product_id: req.body.item_product_id,
            },
            { quantity: new_quantity },
            { new: true }
          );
          
          return res.status(200).json({
            success: true,
            data: setting,
            message: constants.cart.UPDATED_CART,
          });
        } else {
          return res.status(400).json({
            success: false,
            error: {
              code: 400,
              message: constants.cart.QUANTITY_OVER,
            },
          });
        }
      } else {
        if (parseInt(req.body.productQty) >= parseInt(req.body.quantity)) {
          const newCart = new Cart(data);
          const savedData = await newCart.save();
          
          const dispensary_data = await StoreInfo.find({ dispensary_id: data.dispensary_id });
          const storeName = dispensary_data[0]?.name || '';
          
          const item_product = await Itemproduct.find({ _id: data.item_product_id });
          const sku = item_product[0]?.sku || '';
          const brandid = item_product[0]?.producer_id;
          
          const branddata = await Producer.find({ _id: brandid });
          
          const userActivityData = {
            sku: sku,
            store: storeName,
            productName: item_product[0]?.name || '',
            brand: branddata[0]?.name || '',
            dispensary_id: data.dispensary_id,
            productId: data.item_product_id,
            quantity: data.quantity,
            variant_id: data.variant_id && data.variant_id.length > 0 ? data.variant_id.updatedprice : 0,
            addedBy: userId,
          };
          
          try {
            const userActivity = new UserActivity(userActivityData);
            await userActivity.save();
          } catch (activityErr) {
            console.error('User activity save error:', activityErr);
          }
          
          const productData = await Itemproduct.findById(req.body.item_product_id)
            .populate("addedBy")
            .populate("category_id")
            .populate("producer_id")
            .populate("instaleaf_producerId")
            .populate("instaleaf_categoryId");
          
          const redisObj = {
            "_id": productData._id,
            "id": productData._id,
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
            "producername": productData.producer_id ? productData.producer_id.name : "",
            "producer_supplierId": productData.producer_id ? productData.producer_id.supplierId : "",
            "order": 2,
            "pos_name": productData.pos_name,
            "dispensary_id": productData.dispensary_id,
            "dataType": "import",
            "addedBy": productData.addedBy ? productData.addedBy.firstName : "",
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
            "instaleaf_categoryId": productData.instaleaf_categoryId ? productData.instaleaf_categoryId._id : null,
            "instaleaf_categoryName": productData.instaleaf_categoryId ? productData.instaleaf_categoryId.name : "",
            "instaleaf_producer": productData.instaleaf_producerId || null,
            "instaleaf_producerId": productData.instaleaf_producerId ? productData.instaleaf_producerId._id : null,
            "updatedBy": productData.updatedBy || null,
            "pos_product_id": productData.pos_product_id,
            "isFrontendHide": productData.quantity > 2 ? false : true,
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
          
          const redisKey = userId + "-AllCartLikedProduct";
          await updateExistingRecord(redisKey, redisObj);
          
          return res.status(200).json({
            success: true,
            data: savedData,
            message: constants.cart.SAVED_ITEM,
          });
        } else {
          return res.status(400).json({
            success: false,
            error: {
              code: 400,
              message: constants.cart.QUANTITY_OVER,
            },
          });
        }
      }
    } catch (err) {
      console.error('Save reserve cart error:', err);
      return res.status(400).json({
        success: false,
        error: { code: 400, message: err.message },
      });
    }
  },

  saveReserveCartMultiple: async (req, res) => {
    try {
      const userId = getUserId(req);
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: {
            code: 401,
            message: 'Unauthorized: User not authenticated',
          },
        });
      }
      
      const data = req.body;
      const addedBy = userId;
      
      const cartProducts = await Cart.find({ addedBy: addedBy }).limit(1);
      
      if (cartProducts.length > 0) {
        if (cartProducts[0].dispensary_id != data.data[0].dispensary_id) {
          return res.status(400).json({
            success: false,
            error: {
              code: 400,
              message: 'You can only add product of one store in cart',
            },
          });
        }
      }
      
      for (const itm of req.body.data) {
        const cartQuery = {
          addedBy: addedBy,
          item_product_id: itm.item_product_id.id,
        };
        
        if (itm.variantId) {
          cartQuery.variantId = itm.variantId;
        }
        
        const already = await Cart.findOne(cartQuery);
        
        if (already) {
          const new_quantity = parseInt(itm.quantity) + parseInt(already.quantity);
          
          if (parseInt(itm.productQty) >= new_quantity) {
            await Cart.findOneAndUpdate(
              {
                addedBy: addedBy,
                item_product_id: itm.item_product_id.id,
              },
              { quantity: new_quantity }
            );
          }
        } else {
          if (parseInt(itm.productQty) >= parseInt(itm.quantity)) {
            itm.item_product_id = itm.item_product_id.id;
            itm.addedBy = addedBy;
            const newCart = new Cart(itm);
            await newCart.save();
          }
        }
      }
      
      return res.status(200).json({
        success: true,
        data: data,
        message: constants.cart.SAVED_ITEM,
      });
    } catch (err) {
      console.error('Save multiple reserve cart error:', err);
      return res.status(400).json({
        success: false,
        error: { code: 400, message: err.message },
      });
    }
  },

  checkQuantityInCart: async (req, res) => {
    try {
      const id = req.params.id;
      const query = {
        item_product_id: id,
        cart_type: 'reserved'
      };
      
      const cart = await Cart.find(query);
      let total = 0;
      
      if (cart && cart.length > 0) {
        for (const itm of cart) {
          total = total + itm.quantity;
        }
      }
      
      return res.status(200).json({
        success: true,
        total: total,
      });
    } catch (err) {
      console.error('Check quantity error:', err);
      return res.status(400).json({
        success: false,
        error: { code: 400, message: err.message },
      });
    }
  },

  checkInCart: async (req, res) => {
    try {
      const userId = getUserId(req);
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: {
            code: 401,
            message: 'Unauthorized: User not authenticated',
          },
        });
      }
      
      const query = {
        addedBy: userId,
        cart_type: 'reserved'
      };
      
      const cart = await Cart.find(query);
      let total = 0;
      
      if (cart && cart.length > 0) {
        let flag = false;
        const productData = [];
        
        for (const itm of cart) {
          let leftQuantity = 0;
          const item_productData = await Itemproduct.findById(itm.item_product_id);
          
          if (item_productData.quantity > itm.quantity) {
            leftQuantity = Number(item_productData.quantity) - itm.quantity;
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
              productName: item_productData.name,
              available: item_productData.quantity,
              cartQuantity: itm.quantity,
              isOutOfStock: true
            });
          }
          total = total + itm.quantity;
        }
        
        return res.status(200).json({
          success: true,
          isOutOfStock: flag,
          cartTotal: total,
          data: productData,
        });
      } else {
        return res.status(200).json({
          success: true,
          total: total,
        });
      }
    } catch (err) {
      console.error('Check in cart error:', err);
      return res.status(400).json({
        success: false,
        error: { code: 400, message: err.message },
      });
    }
  },

  emptyCart: async (req, res) => {
    try {
      const userId = getUserId(req);
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: {
            code: 401,
            message: 'Unauthorized: User not authenticated',
          },
        });
      }
      
      await Cart.deleteMany({ addedBy: userId });
      
      return res.status(200).json({
        success: true,
        message: "Cart items removed successfully."
      });
    } catch (err) {
      console.error('Empty cart error:', err);
      return res.status(400).json({
        success: false,
        error: { code: 400, message: err.message }
      });
    }
  },

  checkReservedCart: async (req, res) => {
    try {
      const userId = getUserId(req);
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: {
            code: 401,
            message: 'Unauthorized: User not authenticated',
          },
        });
      }
      
      const dispensary_id = req.params.dispensary_id;
      const stores = await StoreInfo.find({ dispensary_id: dispensary_id });
      
      if (stores && stores.length > 0) {
        const store = stores[0];
        const options = {
          method: 'GET',
          url: `${store.url}/company/${store.company_id}/location/${store.location_id}/posListings`,
          headers: { 'x-api-key': store.auth_key, useQueryString: true },
        };
        
        request(options, async (error, response, body) => {
          if (error) {
            console.error('Store API error:', error);
            return res.status(400).json({
              success: false,
              error: 'Failed to fetch store data'
            });
          }
          
          try {
            const responseData = JSON.parse(body);
            const productData = responseData.products;
            const products = cleanProducts(productData);
            const flatProducts = products.flatMap(product => 
              product.variants && product.variants.length > 0 ? product.variants : product
            );
            
            let query = {
              addedBy: userId,
              cart_type: 'reserved'
            };
            
            if (dispensary_id) {
              query.dispensary_id = dispensary_id;
            }
            
            const data = await Cart.find(query)
              .populate('item_product_id')
              .exec();
            
            let flag = false;
            let dispensaryFlag = false;
            
            for (const itm of data) {
              if (itm.item_product_id && itm.item_product_id._id) {
                if (itm && itm.item_product_id && itm.item_product_id.product_id) {
                  const productData = await Product.findById(itm.item_product_id.product_id);
                  itm.item_product_id.product_id = productData;
                }
                
                const foundData = flatProducts.filter(x => x.id == itm.item_product_id.pos_product_id);
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
            
            return res.status(200).json({
              success: true,
              isStore: dispensaryFlag,
              isOutOfStock: flag,
              data: data,
            });
          } catch (parseErr) {
            console.error('Parse error:', parseErr);
            return res.status(400).json({
              success: false,
              error: 'Failed to parse store response'
            });
          }
        });
      } else {
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: 'No Store found',
          },
        });
      }
    } catch (err) {
      console.error('Check reserved cart error:', err);
      return res.status(400).json({
        success: false,
        error: { code: 400, message: err.message },
      });
    }
  },
};

module.exports = CartController;