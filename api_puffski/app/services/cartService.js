// const db = require("../models");
// const redis = require("redis");
// const { CronJob } = require('cron');
// const request = require('request');

// // Initialize Redis client
// const redisClient = redis.createClient({
//   url: process.env.REDIS_URL || 'redis://localhost:6379'
// });

// redisClient.on('error', (err) => console.error('Redis Client Error', err));
// redisClient.connect();

// // Setup cron job for cart cleanup
// const cartCleanupJob = new CronJob(
//   '0 2 * * *',
//   async () => {
//     console.log('Cart cleanup cron is running');
//     try {
//       await db.Cart.deleteMany({});
//     } catch (err) {
//       console.error('Cart cleanup error:', err);
//     }
//   },
//   null,
//   true,
//   'UTC'
// );

// cartCleanupJob.start();

// class CartService {
//   // Helper function to clean products
//   cleanProducts(products) {
//     return products.map(product => {
//       if (product.variants && product.variants.length > 0) {
//         // Filter variants with quantity >= 3
//         const filteredVariants = product.variants.filter(variant => variant.quantity >= 3);

//         if (filteredVariants.length > 0) {
//           product.variants = filteredVariants;
//           const totalQuantity = filteredVariants.reduce((sum, variant) => sum + variant.quantity, 0);
          
//           if (totalQuantity > 0) {
//             product.quantity = totalQuantity;
//           }
//           return product;
//         }
//       } else {
//         if (product.quantity > 2) {
//           return product;
//         }
//       }
//       return null;
//     }).filter(product => product !== null);
//   }

//   // Get regular cart
//   async getCart(userId, dispensaryId = null) {
//     try {
//       const query = {
//         addedBy: userId,
//         cart_type: { $exists: false }
//       };
      
//       if (dispensaryId) {
//         query.dispensary_id = dispensaryId;
//       }

//       const cartItems = await db.Cart.find(query)
//         .populate({
//           path: 'product_id',
//           populate: [
//             { path: 'addedBy', select: 'firstName' },
//             { path: 'category_id' },
//             { path: 'producer_id' },
//             { path: 'instaleaf_producerId' },
//             { path: 'instaleaf_categoryId' }
//           ]
//         });

//       return {
//         success: true,
//         data: cartItems
//       };
//     } catch (error) {
//       console.error('Get cart error:', error);
//       return {
//         success: false,
//         error: { code: 500, message: 'Failed to fetch cart' }
//       };
//     }
//   }

//   // Get reserved cart
//   async getReservedCart(userId, dispensaryId = null) {
//     try {
//       const query = {
//         addedBy: userId,
//         cart_type: 'reserved'
//       };
      
//       if (dispensaryId) {
//         query.dispensary_id = dispensaryId;
//       }

//       const cartItems = await db.Cart.find(query)
//         .populate({
//           path: 'item_product_id',
//           populate: [
//             { path: 'addedBy', select: 'firstName' },
//             { path: 'category_id' },
//             { path: 'producer_id' },
//             { path: 'instaleaf_producerId' },
//             { path: 'instaleaf_categoryId' }
//           ]
//         });

//       // Check stock status for each item
//       let outOfStockFlag = false;
//       let storeFlag = false;

//       for (const item of cartItems) {
//         if (item.item_product_id && item.item_product_id._id) {
//           if (item.item_product_id.product_id) {
//             const productData = await db.Product.findById(item.item_product_id.product_id);
//             item.item_product_id.product_id = productData;
//           }

//           const count = await db.Itemproduct.findById(item.item_product_id._id);
          
//           if (!count || count.quantity < 3 || count.quantity < item.quantity) {
//             item.isOutOfStock = true;
//             outOfStockFlag = true;
//           } else {
//             item.isOutOfStock = false;
//           }
//         } else {
//           item.isOutOfStock = false;
//         }

//         if (dispensaryId && dispensaryId === item.dispensary_id?.toString()) {
//           storeFlag = true;
//         }
//       }

//       return {
//         success: true,
//         data: {
//           cartItems,
//           isStore: storeFlag,
//           isOutOfStock: outOfStockFlag
//         }
//       };
//     } catch (error) {
//       console.error('Get reserved cart error:', error);
//       return {
//         success: false,
//         error: { code: 500, message: 'Failed to fetch reserved cart' }
//       };
//     }
//   }

//   // Add to regular cart
//   async addToCart(data, userId) {
//     try {
//       const { product_id, quantity, productQty, price, cart_type } = data;
      
//       if (!productQty || !product_id) {
//         return {
//           success: false,
//           error: { code: 400, message: 'Missing required fields' }
//         };
//       }

//       // Check if quantity is valid
//       if (parseInt(productQty) < parseInt(quantity)) {
//         return {
//           success: false,
//           error: { code: 400, message: 'Quantity exceeds available stock' }
//         };
//       }

//       // Check if item already in cart
//       const existingCartItem = await db.Cart.findOne({
//         addedBy: userId,
//         product_id
//       });

//       if (existingCartItem) {
//         const newQuantity = parseInt(quantity) + parseInt(existingCartItem.quantity);
        
//         if (parseInt(productQty) < newQuantity) {
//           return {
//             success: false,
//             error: { code: 400, message: 'Total quantity exceeds available stock' }
//           };
//         }

//         const updatedItem = await db.Cart.findByIdAndUpdate(
//           existingCartItem._id,
//           { quantity: newQuantity },
//           { new: true }
//         );

//         return {
//           success: true,
//           data: updatedItem,
//           message: 'Cart updated successfully'
//         };
//       }

//       // Create new cart item
//       const cartData = {
//         ...data,
//         addedBy: userId
//       };

//       const newCartItem = await db.Cart.create(cartData);

//       // Update Redis cache
//       await this.updateCartCache(userId, data.product_id);

//       return {
//         success: true,
//         data: newCartItem,
//         message: 'Item added to cart'
//       };
//     } catch (error) {
//       console.error('Add to cart error:', error);
//       return {
//         success: false,
//         error: { code: 500, message: 'Failed to add item to cart' }
//       };
//     }
//   }

//   // Add to reserved cart
//   async addToReservedCart(data, userId) {
//     try {
//       const { item_product_id, quantity, productQty, dispensary_id, variantId } = data;
      
//       if (!productQty || !item_product_id) {
//         return {
//           success: false,
//           error: { code: 400, message: 'Missing required fields' }
//         };
//       }

//       // Check if quantity is valid
//       if (parseInt(productQty) < parseInt(quantity)) {
//         return {
//           success: false,
//           error: { code: 400, message: 'Quantity exceeds available stock' }
//         };
//       }

//       // Check store consistency
//       const existingCartItems = await db.Cart.find({ addedBy: userId, cart_type: 'reserved' }).limit(1);
      
//       if (existingCartItems.length > 0 && existingCartItems[0].dispensary_id !== dispensary_id) {
//         return {
//           success: false,
//           error: { code: 400, message: 'You can only add products from one store to cart' }
//         };
//       }

//       // Check if item already in cart
//       const query = {
//         addedBy: userId,
//         item_product_id
//       };
      
//       if (variantId) {
//         query.variantId = variantId;
//       }

//       const existingCartItem = await db.Cart.findOne(query);

//       if (existingCartItem) {
//         const newQuantity = parseInt(quantity) + parseInt(existingCartItem.quantity);
        
//         if (parseInt(productQty) < newQuantity) {
//           return {
//             success: false,
//             error: { code: 400, message: 'Total quantity exceeds available stock' }
//           };
//         }

//         const updatedItem = await db.Cart.findByIdAndUpdate(
//           existingCartItem._id,
//           { quantity: newQuantity },
//           { new: true }
//         );

//         return {
//           success: true,
//           data: updatedItem,
//           message: 'Cart updated successfully'
//         };
//       }

//       // Create new cart item
//       const cartData = {
//         ...data,
//         addedBy: userId,
//         cart_type: 'reserved'
//       };

//       const newCartItem = await db.Cart.create(cartData);

//       // Record user activity
//       await this.recordUserActivity(newCartItem, userId);

//       // Update Redis cache
//       await this.updateCartCache(userId, item_product_id);

//       return {
//         success: true,
//         data: newCartItem,
//         message: 'Item added to reserved cart'
//       };
//     } catch (error) {
//       console.error('Add to reserved cart error:', error);
//       return {
//         success: false,
//         error: { code: 500, message: 'Failed to add item to reserved cart' }
//       };
//     }
//   }

//   // Add multiple items to reserved cart
//   async addMultipleToReservedCart(items, userId) {
//     try {
//       const results = [];
//       const errors = [];

//       for (const item of items) {
//         try {
//           const result = await this.addToReservedCart(item, userId);
//           if (result.success) {
//             results.push(result.data);
//           } else {
//             errors.push({ item, error: result.error });
//           }
//         } catch (error) {
//           errors.push({ item, error: { message: error.message } });
//         }
//       }

//       if (errors.length > 0) {
//         return {
//           success: false,
//           data: results,
//           errors,
//           message: `Added ${results.length} items, ${errors.length} failed`
//         };
//       }

//       return {
//         success: true,
//         data: results,
//         message: 'All items added to cart successfully'
//       };
//     } catch (error) {
//       console.error('Add multiple to cart error:', error);
//       return {
//         success: false,
//         error: { code: 500, message: 'Failed to add items to cart' }
//       };
//     }
//   }

//   // Update cart item
//   async updateCartItem(itemId, data, userId) {
//     try {
//       const { productQty, quantity } = data;
      
//       if (parseInt(productQty) < parseInt(quantity)) {
//         return {
//           success: false,
//           error: { code: 400, message: 'Quantity exceeds available stock' }
//         };
//       }

//       const cartItem = await db.Cart.findOne({ _id: itemId, addedBy: userId });
      
//       if (!cartItem) {
//         return {
//           success: false,
//           error: { code: 404, message: 'Cart item not found' }
//         };
//       }

//       const updatedItem = await db.Cart.findByIdAndUpdate(
//         itemId,
//         data,
//         { new: true }
//       );

//       return {
//         success: true,
//         data: updatedItem,
//         message: 'Cart item updated successfully'
//       };
//     } catch (error) {
//       console.error('Update cart item error:', error);
//       return {
//         success: false,
//         error: { code: 500, message: 'Failed to update cart item' }
//       };
//     }
//   }

//   // Remove from cart
//   async removeFromCart(itemId, userId) {
//     try {
//       const deletedItem = await db.Cart.findOneAndDelete({
//         _id: itemId,
//         addedBy: userId
//       });

//       if (!deletedItem) {
//         return {
//           success: false,
//           error: { code: 404, message: 'Cart item not found' }
//         };
//       }

//       return {
//         success: true,
//         message: 'Item removed from cart successfully'
//       };
//     } catch (error) {
//       console.error('Remove from cart error:', error);
//       return {
//         success: false,
//         error: { code: 500, message: 'Failed to remove item from cart' }
//       };
//     }
//   }

//   // Empty cart
//   async emptyCart(userId) {
//     try {
//       await db.Cart.deleteMany({ addedBy: userId });
      
//       return {
//         success: true,
//         message: 'Cart emptied successfully'
//       };
//     } catch (error) {
//       console.error('Empty cart error:', error);
//       return {
//         success: false,
//         error: { code: 500, message: 'Failed to empty cart' }
//       };
//     }
//   }

//   // Check quantity in cart across all users
//   async checkProductQuantity(productId) {
//     try {
//       const cartItems = await db.Cart.find({
//         item_product_id: productId,
//         cart_type: 'reserved'
//       });

//       const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      
//       return {
//         success: true,
//         total: totalQuantity
//       };
//     } catch (error) {
//       console.error('Check product quantity error:', error);
//       return {
//         success: false,
//         error: { code: 500, message: 'Failed to check product quantity' }
//       };
//     }
//   }

//   // Check user's cart status
//   async checkUserCartStatus(userId) {
//     try {
//       const cartItems = await db.Cart.find({
//         addedBy: userId,
//         cart_type: 'reserved'
//       }).populate('item_product_id');

//       const productData = [];
//       let outOfStockFlag = false;
//       let totalQuantity = 0;

//       for (const item of cartItems) {
//         const itemProduct = await db.Itemproduct.findById(item.item_product_id);
        
//         if (itemProduct) {
//           const leftQuantity = Math.max(0, itemProduct.quantity - item.quantity);
//           const isOutOfStock = itemProduct.quantity < item.quantity;
          
//           if (isOutOfStock) {
//             outOfStockFlag = true;
//           }

//           productData.push({
//             id: item.item_product_id,
//             productName: itemProduct.name,
//             available: leftQuantity,
//             cartQuantity: item.quantity,
//             isOutOfStock
//           });

//           totalQuantity += item.quantity;
//         }
//       }

//       return {
//         success: true,
//         isOutOfStock: outOfStockFlag,
//         cartTotal: totalQuantity,
//         data: productData
//       };
//     } catch (error) {
//       console.error('Check user cart status error:', error);
//       return {
//         success: false,
//         error: { code: 500, message: 'Failed to check cart status' }
//       };
//     }
//   }

//   // Helper: Record user activity
//   async recordUserActivity(cartItem, userId) {
//     try {
//       const dispensary = await db.Item.findById(cartItem.dispensary_id);
//       const itemProduct = await db.Itemproduct.findById(cartItem.item_product_id);
//       const brand = itemProduct.producer_id ? await db.Itemproducer.findById(itemProduct.producer_id) : null;

//       const activityData = {
//         sku: itemProduct.sku,
//         store: dispensary?.name || '',
//         productName: itemProduct.name,
//         brand: brand?.name || '',
//         dispensary_id: cartItem.dispensary_id,
//         productId: cartItem.item_product_id,
//         quantity: cartItem.quantity,
//         variant_id: cartItem.variant_id?.updatedprice || 0,
//         addedBy: userId
//       };

//       await db.UserActivity.create(activityData);
//     } catch (error) {
//       console.error('Record user activity error:', error);
//     }
//   }

//   // Helper: Update Redis cache
//   async updateCartCache(userId, productId) {
//     try {
//       const productData = await db.Itemproduct.findById(productId)
//         .populate("addedBy")
//         .populate("category_id")
//         .populate("producer_id")
//         .populate("instaleaf_producerId")
//         .populate("instaleaf_categoryId");

//       if (!productData) return;

//       const redisObj = {
//         _id: productData._id.toString(),
//         id: productData._id.toString(),
//         dispensary_id: productData.dispensary_id,
//         name: productData.name,
//         parentProductName: productData.parentProductName || null,
//         description: productData.description,
//         sku: productData.sku,
//         slug: productData.slug,
//         barcode: productData.barcode,
//         imageUrl: productData.imageUrl || null,
//         price: productData.price,
//         categoryId: productData.categoryId,
//         categoryName: productData.parentCategoryName,
//         parentCategoryId: productData.parentCategoryId,
//         parentCategoryName: productData.parentCategoryName,
//         supplierId: productData.supplierId,
//         supplierName: productData.supplierName,
//         quantity: productData.quantity || 0,
//         weight: productData.weight || 0,
//         cannabisWeight: productData.cannabisWeight,
//         cannabisVolume: productData.cannabisVolume || null,
//         thc: productData.thc || 0,
//         cbd: productData.cbd || 0,
//         CBD_Content: productData.CBD_Content || 0,
//         CBD_Percent: productData.CBD_Percent || 0,
//         THC_Content: productData.THC_Content || 0,
//         THC_Percent: productData.THC_Percent || 0,
//         detail: productData.detail || "",
//         weightUnit: productData.weightUnit || "",
//         product_id: productData.product_id || null,
//         productQty: productData.quantity || 0,
//         specialPrice: productData.specialPrice || 0,
//         isFavourite: productData.isFavourite || "",
//         metaData: productData.metaData || {},
//         taxes: productData.taxes,
//         depositFee: productData.depositFee || null,
//         inStock: productData.inStock,
//         category_id: productData.category_id || null,
//         producer_id: productData.producer_id,
//         category_name: productData.category_name,
//         categeoryname: productData.category_name,
//         producername: productData.producer_id?.name || "",
//         producer_supplierId: productData.producer_id?.supplierId || "",
//         order: 2,
//         pos_name: productData.pos_name,
//         dataType: "import",
//         addedBy: productData.addedBy?.firstName || "",
//         createdBy: productData.createdBy,
//         pre_roll: productData.pre_roll || 0,
//         Eighth: productData.Eighth || 0,
//         quarter: productData.quarter || 0,
//         half: productData.half || 0,
//         ounce: productData.ounce || 0,
//         details: productData.details || "",
//         thc_max: productData.thc_max || 0,
//         thc_min: productData.thc_min || 0,
//         cbd_max: productData.cbd_max || 0,
//         cbd_min: productData.cbd_min || 0,
//         image: productData.image || "",
//         status: productData.status,
//         isDeleted: productData.isDeleted,
//         brand_name: productData.brand_name || "",
//         grams: productData.grams || 0,
//         isSpecial: "deactive",
//         isStaff: "deactive",
//         isStore: "deactive",
//         inResponse: productData.quantity > 2,
//         createdAt: productData.createdAt,
//         updatedAt: productData.updatedAt,
//         instaleaf_category: productData.instaleaf_categoryId || null,
//         instaleaf_categoryId: productData.instaleaf_categoryId?._id?.toString() || null,
//         instaleaf_categoryName: productData.instaleaf_categoryId?.name || "",
//         instaleaf_producer: productData.instaleaf_producerId || null,
//         instaleaf_producerId: productData.instaleaf_producerId?._id?.toString() || null,
//         updatedBy: productData.updatedBy || null,
//         pos_product_id: productData.pos_product_id,
//         isFrontendHide: productData.quantity <= 2,
//         discountPercent: productData.discountPercent || "",
//         discountPrice: productData.discountPrice || 0,
//         isOnSale: productData.isOnSale || false,
//         meta_title: productData.meta_title || "",
//         meta_name: productData.meta_name || "",
//         meta_desc: productData.meta_desc || "",
//         meta_keywords: productData.meta_keywords || "",
//         likeCount: productData.likeCount || 0,
//         dislikeCount: productData.dislikeCount || 0,
//       };

//       const redisKey = `${userId}-AllCartLikedProduct`;
//       await this.updateExistingRedisRecord(redisKey, redisObj);
//     } catch (error) {
//       console.error('Update cart cache error:', error);
//     }
//   }

//   // Helper: Update Redis record
//   async updateExistingRedisRecord(key, value) {
//     try {
//       const cache = await redisClient.get(key);
      
//       if (!cache) {
//         const dataToAdd = { success: true, data: [value] };
//         await redisClient.set(key, JSON.stringify(dataToAdd));
//       } else {
//         let data = JSON.parse(cache);
        
//         if (data && data.data && data.data.length > 0) {
//           data.data = data.data.filter(x => x !== null);
//           const foundIndex = data.data.findIndex(x => x.id === value.id);
          
//           if (foundIndex > -1) {
//             if (value.quantity > 2) {
//               data.data[foundIndex] = value;
//             } else {
//               data.data.splice(foundIndex, 1);
//             }
//           } else if (value.quantity > 2) {
//             data.data.push(value);
//           }
          
//           await redisClient.set(key, JSON.stringify(data));
//         }
//       }
//     } catch (error) {
//       console.error('Update Redis record error:', error);
//     }
//   }
// }

// module.exports = new CartService();