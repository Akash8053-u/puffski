const mongoose = require('mongoose');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || "sk_test_51SmVgg21qf0VnpXm5VJETz7K456dWoI3xmP5J6aUhvA33eZsxCUuB4P1m9R5dYVpbfC4ZpAq7Ld2GzLqjqwdEaAA00nKHequbQ");
const { Moneryze } = require('moneryze');
const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID || local.TWILIO_INFO.ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN || local.TWILIO_INFO.AUTH_TOKEN);
const { WebClient } = require('@slack/web-api');
const redis = require('redis');
const nodemailer = require('nodemailer');
const constants = require('../utils/constants');
const local = require('../config/local');

// Initialize services
// const slackWebClient = new WebClient(process.env.SLACK_TOKEN || local.SLACK_TOKEN);
// const slackChannelId = process.env.SLACK_CHANNEL || local.SLACK_CHANNEL;


const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

(async () => {
  try {
    await redisClient.connect();
    console.log('✅ Redis connected for Moneris service');
  } catch (err) {
    console.error('❌ Redis connection failed:', err.message);
  }
})();


const transporter = nodemailer.createTransport({

  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: (process.env.SMTP_SECURE),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  }
});

// Models
const User = require('../models/users');
const LsrMerrcoCards = require('../models/lsrMerrecoCards');
const FailedCards = require('../models/failedCards');
const ReserveOrder = require('../models/ReserveOrders');
const LsrProduct = require('../models/lsrProduct');
const BuyProductAnalytic = require('../models/buyProductAnalytics');
const Notification = require('../models/Notifications');
const Cart = require('../models/lsrCarts');

class MonerisService {

    async addCard(data) {
      try {
        const { card_expiry_month, card_expiry_year, cvv2, card_number, dispensary_id, userId } = data;

        const cardNumber = String(card_number);
        const last4 = cardNumber.slice(cardNumber.length - 4);


        let cardBrand = "";
        let cardFunding = "";
        let cardType = "";

        try {
          const token = await stripe.tokens.create({
            card: {
              number: card_number,
              exp_month: card_expiry_month,
              exp_year: card_expiry_year,
              cvc: cvv2,
              name: data.ownerName || ""
            }
          });

          if (token && token.card) {
            cardBrand = token.card.brand;
            cardFunding = token.card.funding;
            cardType = token.type;
          }
        } catch (stripeErr) {
          console.log('Stripe validation warning:', stripeErr.message);
        }

        const existedCard = await LsrMerrcoCards.findOne({
          last4: last4,
          userId: userId,
          dispensary_id: dispensary_id,
          payment_gateway: 'Moneris'
        });

        if (existedCard) {
          throw new Error(constants.payhq?.ALREADY_EXIST || 'Card already exists');
        }


        const dispensary = await User.findById(dispensary_id);

  console.log('=== DISPENSARY DATA ===');
  console.log('Dispensary ID:', dispensary_id);
  console.log('Dispensary found:', dispensary ? 'YES' : 'NO');
  if (dispensary) {
    console.log('Dispensary name:', dispensary.name);
    console.log('Dispensary fields:', Object.keys(dispensary._doc || dispensary));
    console.log('moneris_storeId:', dispensary.moneris_storeId);
    console.log('moneris_token:', dispensary.moneris_token ? 'PRESENT (hidden)' : 'MISSING');
    console.log('All payment fields:');
    for (const [key, value] of Object.entries(dispensary._doc || dispensary)) {
      if (key.toLowerCase().includes('moneris') || key.toLowerCase().includes('store') || key.toLowerCase().includes('token')) {
        console.log(`  ${key}:`, typeof value === 'string' && value.length > 10 ? '***' + value.slice(-4) : value);
      }
    }
    console.log('=== END DISPENSARY DATA ===\n');
  }
        if (!dispensary || !dispensary.moneris_storeId || !dispensary.moneris_token) {
          await FailedCards.create({
            userId: userId,
            error: 'Moneris credentials not found for store.',
            store_id: dispensary_id,
            platform: "lsrshowroom"
          });
          throw new Error('Moneris credentials not found for store.');
        }


        const monerisInstance = new Moneryze({
          store_id: dispensary.moneris_storeId,
          api_token: dispensary.moneris_token,
          processing_country_code: 'CA',
          environment: 'prod' 
        });


        const last2Year = card_expiry_year.slice(-2);
        const expdate = last2Year + card_expiry_month.padStart(2, '0');


        console.log('Calling resAddCC with monerisInstance');
        const addedCard = await monerisInstance.resAddCC({
          pan: card_number,
          expdate: expdate
        });

        console.log('Moneris response:', addedCard);

        if (!addedCard || !addedCard.isSuccess) {
          await FailedCards.create({
            userId: userId,
            error: addedCard?.msg || 'Moneris card addition failed',
            store_id: dispensary_id,
            client_id: dispensary.moneris_storeId,
            client_secret: dispensary.moneris_token,
            cardBrand: cardBrand,
            cardFunding: cardFunding,
            cardType: cardType
          });

          throw new Error(addedCard?.msg || 'Failed to add card to payment gateway');
        }


        await LsrMerrcoCards.updateMany(
          {
            userId: userId,
            dispensary_id: dispensary_id,
            payment_gateway: 'Moneris'
          },
          { is_default: false }
        );


        const newCard = new LsrMerrcoCards({
          userId: userId,
          dispensary_id: dispensary_id,
          card_lookupId: addedCard.data?.dataKey || addedCard.token,
          last4: last4,
          card_expiry_month: card_expiry_month,
          card_expiry_year: card_expiry_year,
          is_default: true,
          payment_gateway: 'Moneris',
          address1: data.address,
          city: data.city,
          province: data.province,
          country: data.country,
          postal_code: data.postal_code,
          client_id: dispensary.store_id || dispensary._id,
          client_secret: dispensary.api_token || "",
          cardBrand: cardBrand,
          cardFunding: cardFunding,
          cardType: cardType,
          apartment: data.apartment || ""
        });

        await newCard.save();

        return {
          success: true,
          message: constants.payhq?.CARD_ADD_SUCCESS || 'Card added successfully',
          data: addedCard,
          createdCard: newCard
        };

      } catch (error) {
        console.error('Add card error:', error);

        await FailedCards.create({
          userId: data.userId,
          error: error.message,
          store_id: data.dispensary_id,
          platform: "lsrshowroom"
        });

        throw error;
      }
    }


  async getMonerisCards(data) {
    try {
      const { dispensary_id, userId } = data;

      if (!dispensary_id) {
        throw new Error('Dispensary ID is required');
      }

      const cards = await LsrMerrcoCards.find({
        userId: userId,
        dispensary_id: dispensary_id,
        payment_gateway: 'Moneris'
      })
        .sort({ is_default: -1, createdAt: -1 })
        .lean();

      return {
        success: true,
        data: cards
      };

    } catch (error) {
      console.error('Get cards error:', error);

      await FailedCards.create({
        userId: data.userId,
        error: error.message,
        store_id: data.dispensary_id
      });

      throw error;
    }
  }

  async deleteCard(data) {
    try {
      const { id, userId } = data;

      const card = await LsrMerrcoCards.findOne({
        _id: id,
        userId: userId
      });

      if (!card) {
        throw new Error('Card not found or unauthorized');
      }


      await LsrMerrcoCards.findByIdAndDelete(id);


      if (card.is_default) {
        const otherCard = await LsrMerrcoCards.findOne({
          userId: userId,
          dispensary_id: card.dispensary_id,
          _id: { $ne: id }
        });

        if (otherCard) {
          await LsrMerrcoCards.findByIdAndUpdate(
            otherCard._id,
            { is_default: true }
          );
        }
      }

      return {
        success: true,
        message: 'Card deleted successfully.'
      };

    } catch (error) {
      console.error('Delete card error:', error);

      await FailedCards.create({
        userId: data.userId,
        error: error.message
      });

      throw error;
    }
  }

  // async processMonerisCheckout(orderData) {
  //   try {
  //     const { card_lookupId, dispensary_id, totalprice, userId } = orderData;


  //     const dispensary = await User.findById(dispensary_id);

  //     if (!dispensary || !dispensary.moneris_storeId || !dispensary.moneris_token) {
  //       throw new Error('Store payment credentials not found');
  //     }


  //     const cardDetail = await LsrMerrcoCards.findOne({
  //       userId: userId,
  //       dispensary_id: dispensary_id,
  //       card_lookupId: card_lookupId
  //     }).lean();

  //     if (!cardDetail) {
  //       throw new Error('Card not found or unauthorized');
  //     }

  //     orderData.dispensary_user_id = dispensary.addedBy;


  //     const monerisInstance = new Moneryze({
  //       store_id: dispensary.moneris_storeId,
  //       api_token: dispensary.moneris_token,
  //       processing_country_code: 'CA',
  //       environment: 'prod'
  //     });


  //     const paymentResult = await monerisInstance.resPurchaseCC({
  //       token: card_lookupId,
  //       amount: parseFloat(totalprice),
  //       description: 'LSR purchase'
  //     });


  //   } catch (error) {

  //   }
  // }
async processMonerisCheckout(orderData) {
  try {
    const { card_lookupId, dispensary_id, totalprice, userId } = orderData;

    const dispensary = await User.findById(dispensary_id);
    
    const storeId = dispensary?._doc?.moneris_storeId || dispensary?.moneris_storeId;
    const apiToken = dispensary?._doc?.moneris_token || dispensary?.moneris_token;
    
    if (!dispensary || !storeId || !apiToken) {
      throw new Error('Store payment credentials not found');
    }

    const cardDetail = await LsrMerrcoCards.findOne({
      userId: userId,
      dispensary_id: dispensary_id,
      card_lookupId: card_lookupId
    }).lean();

    if (!cardDetail) {
      throw new Error('Card not found or unauthorized');
    }

    orderData.dispensary_user_id = dispensary.addedBy;

    const monerisInstance = new Moneryze({
      store_id: storeId,
      api_token: apiToken,
      processing_country_code: 'CA',
      environment: 'qa'
    });

    // Use send() method for purchase
    const paymentResult = await monerisInstance.send({
      type: 'res_purchase_cc',  // Purchase operation
      data_key: card_lookupId,   // Use the stored token
      amount: parseFloat(totalprice).toFixed(2), // Format to 2 decimal places
      order_id: `LSR-${Date.now()}`, // Generate unique order ID
      crypt_type: '7'
    });

    console.log('Payment result:', JSON.stringify(paymentResult, null, 2));
    
    // Check if payment was successful
    if (paymentResult && paymentResult.response_code <= 49) {
      console.log('✅ Payment successful!');
      return {
        success: true,
        data: paymentResult,
        transaction_id: paymentResult.transaction_id || paymentResult.receipt_id
      };
    } else {
      console.error('❌ Payment failed:', paymentResult?.message);
      throw new Error(paymentResult?.message || 'Payment failed');
    }
    
  } catch (error) {
    console.error('Process checkout error:', error);
    throw error;
  }
}
  async updateProduct(orderId) {
    try {
      const order = await ReserveOrder.findById(orderId);
      if (!order || !order.order_detail || !Array.isArray(order.order_detail)) {
        console.log('No order details found for update');
        return;
      }

      console.log(`Updating quantities for ${order.order_detail.length} order items`);

      for (const item of order.order_detail) {
        const productId = item.item_product_id?.id || item.item_product_id;

        if (!productId) {
          console.log('Skipping item without product ID');
          continue;
        }


        const product = await LsrProduct.findById(productId)
          .populate("addedBy")
          .populate("category_id")
          .populate("product_id")
          .populate("producer_id")
          .populate("instaleaf_categoryId");

        if (!product) {
          console.log(`Product not found: ${productId}`);
          continue;
        }

        const purchasequantity = item.quantity || 0;
        const productdata = product.quantity || 0;
        const updatedQuantity = Number(productdata) - Number(purchasequantity);

        console.log(`Updating product ${product.name}: ${productdata} - ${purchasequantity} = ${updatedQuantity}`);


        await BuyProductAnalytic.create({
          product_id: productId,
          productName: product.name,
          sku: product.sku || "",
          dispensary: String(order.dispensary_id),
          quantity: purchasequantity,
          addedBy: String(order.addedBy),
          orderId: orderId
        });


        if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
          const variantId = item.variantId;
          if (variantId) {
            const variantIndex = product.variants.findIndex(v =>
              String(v._id || v.id) === String(variantId)
            );

            if (variantIndex !== -1) {
              product.variants[variantIndex].quantity -= purchasequantity;


              if (product.variants[variantIndex].quantity < 3) {
                product.variants.splice(variantIndex, 1);
              }
            }
          }


          await LsrProduct.findByIdAndUpdate(productId, {
            variants: product.variants
          });
        }

        await LsrProduct.findByIdAndUpdate(productId, {
          quantity: updatedQuantity
        });

        // Update Redis caches
        await this.updateRedisCache(product, updatedQuantity, order);
      }

      console.log('✅ Product quantities updated successfully');

    } catch (error) {
      console.error('Update product error:', error);
      throw error;
    }
  }

  async updateRedisCache(product, updatedQuantity, order) {
    try {
      if (!redisClient.isReady) {
        console.log('Redis not connected, skipping cache update');
        return;
      }


      const value = {
        "_id": product._id,
        "id": product._id,
        "pos_product_id": product.pos_product_id,
        "dispensary_id": product.dispensary_id,
        "name": product.name,
        "pre_roll": product.pre_roll,
        "Eighth": product.Eighth,
        "quarter": product.quarter,
        "half": product.half,
        "ounce": product.ounce,
        "addedBy": product.addedBy?.name || "",
        "category_id": product.category_id,
        "details": product.details,
        "thc": product.thc || 0,
        "weight": product.weight ? Number(product.weight) : 0,
        "weightUnit": product.weightUnit,
        "grams": product.grams,
        "image": product.image,
        "isDeleted": false,
        "cbd": product.cbd || 0,
        "status": "active",
        "price": product.price,
        "brand_name": product.brand_name,
        "quantity": Number(updatedQuantity),
        "productQty": Number(updatedQuantity),
        "categeoryname": product.category_id?.name || product.categoryName,
        "producername": product.producer_id?.name || "",
        "category_name": product.category_name,
        "isSpecial": product.isSpecial,
        "isStaff": product.isStaff,
        "isStore": product.isStore,
        "pos_name": product.pos_name,
        "inResponse": Number(updatedQuantity) > 2 ? true : false,
        "thc_min": product.thc_min,
        "thc_max": product.thc_max,
        "cbd_min": product.cbd_min,
        "cbd_max": product.cbd_max,
        "instaleaf_category": product.instaleaf_categoryId,
        "instaleaf_categoryName": product.instaleaf_categoryId?.name,
        "CBD_Percent": product.CBD_Percent,
        "THC_Percent": product.THC_Percent,
        "description": product.description,
        "createdBy": product.createdBy,
        "createdAt": product.createdAt,
        "sku": product.sku,
        "barcode": product.barcode,
        "imageUrl": product.imageUrl || null,
        "categoryId": product.categoryId,
        "categoryName": product.parentCategoryName,
        "parentCategoryId": product.parentCategoryId,
        "parentCategoryName": product.parentCategoryName,
        "supplierId": product.supplierId,
        "supplierName": product.supplierName,
        "cannabisWeight": product.cannabisWeight,
        "cannabisVolume": product.cannabisVolume || null,
        "CBD_Content": product.CBD_Content || 0,
        "THC_Content": product.THC_Content || 0,
        "detail": product.detail || "",
        "product_id": product.product_id || null,
        "specialPrice": product.specialPrice || 0,
        "isFavourite": product.isFavourite || "",
        "metaData": product.metaData || {},
        "taxes": product.taxes,
        "depositFee": product.depositFee || null,
        "inStock": product.inStock,
        "category_id": product.category_id || null,
        "producer_id": product.producer_id,
        "producer_supplierId": product.producer_id?.supplierId || "",
        "order": 2,
        "dataType": "import",
        "instaleaf_categoryId": product.instaleaf_categoryId?.id || null,
        "instaleaf_producer": product.instaleaf_producerId,
        "instaleaf_producerId": product.instaleaf_producerId?.id || null,
        "updatedBy": product.updatedBy || null,
        "pos_product_id": product.pos_product_id,
        "covaId": product.covaId,
        "updatedAt": product.updatedAt,
        "isFrontendHide": product.isFrontendHide,
        "discountPercent": product.discountPercent || "",
        "discountPrice": product.discountPrice || 0,
        "isOnSale": product.isOnSale || false,
        "likeCount": product.likeCount || 0,
        "dislikeCount": product.dislikeCount || 0
      };


      let key = "";
      if (product.instaleaf_categoryName) {
        key = (product.instaleaf_categoryName).toLowerCase() + "-" + product.dispensary_id + "-thccbdEmpty";
      } else {
        key = "misc-" + product.dispensary_id + "-thccbdEmpty";
      }

      const cached = await redisClient.get(key);
      if (cached) {
        let data = JSON.parse(cached);
        data.data = data.data.filter(x => x != null);

        const foundIndex = data.data.findIndex(x => String(x.id) === String(value.id));
        if (foundIndex > -1) {
          if (value.quantity > 2) {
            data.data[foundIndex] = value;
          } else {
            delete data.data[foundIndex];
          }
          data.data = data.data.filter(x => x != null);
          await redisClient.set(key, JSON.stringify(data));
        }
      }

      // Update ordered products cache
      const redisKey = order.addedBy + "-AllOrderedproduct";
      const orderedCache = await redisClient.get(redisKey);
      if (orderedCache) {
        let data = JSON.parse(orderedCache);
        data.data = data.data.filter(x => x != null);

        const foundIndex = data.data.findIndex(x => String(x.id) === String(value.id));
        if (foundIndex > -1) {
          if (value.quantity > 2) {
            data.data[foundIndex] = value;
          } else {
            delete data.data[foundIndex];
          }
          data.data = data.data.filter(x => x != null);
          await redisClient.set(redisKey, JSON.stringify(data));
        }
      }

    } catch (redisErr) {
      console.error('Redis cache update error:', redisErr);
    }
  }

  async updateUserStats(userId, order) {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      const totalOrder = (user.totalOrder || 0) + 1;
      const totalSpend = (user.totalSpend || 0) + (order.price || 0);

      const updates = {
        totalSpend: totalSpend,
        totalOrder: totalOrder,
        lastOrderDate: order.createdAt || new Date()
      };

      if (totalOrder > 0) {
        updates.avgspend = totalSpend / totalOrder;
      }

      await User.findByIdAndUpdate(userId, updates);

      console.log(`✅ Updated user ${userId} stats: ${totalOrder} orders, $${totalSpend} total`);

    } catch (error) {
      console.error('Update user stats error:', error);
    }
  }

  async sendNotifications(order, dispensary) {
    try {
      // store notification messages
      let storeCallMessage = '';
      let storeSMSMessage = '';


      const storeId = dispensary._id.toString();
      if (storeId === "5f91e1905b82f11604748978") {

        storeCallMessage = '<Response><Say>Hello ! you have a new order on puffski from 13th floor cooper crossing. Thank you</Say></Response>';
        storeSMSMessage = 'Hello ! you have a new order on puffski from 13th floor cooper crossing. Thank you';
      } else if (storeId === "5f91e53d5b82f1160474897c") {

        storeCallMessage = '<Response><Say>Hello ! you have a new order on puffski from 13th floor silver springs . Thank you</Say></Response>';
        storeSMSMessage = 'Hello ! you have a new order on puffski from 13th floor silver springs . Thank you';
      } else {
        storeCallMessage = '<Response><Say>Hello ! you have a new order on puffski. Thank you</Say></Response>';
        storeSMSMessage = 'Hello ! you have a new order on puffski. Thank you';
      }


      const notifyNumbers = [];


      if (dispensary.mobile) {
        notifyNumbers.push(dispensary.mobile);
      }


      if (local.ADMIN_NUMBER) {
        notifyNumbers.push(local.ADMIN_NUMBER);
      }

      if (local.CARL_NUMBER) {
        notifyNumbers.push(local.CARL_NUMBER);
      }

      const twilioPhone = process.env.TWILIO_PHONE_NUMBER || '+19787407098';

      for (const number of notifyNumbers) {
        try {
          const call = await twilio.calls.create({
            twiml: storeCallMessage,
            to: number,
            from: twilioPhone
          });
          console.log(`Call initiated to ${number}: ${call.sid}`);
        } catch (callErr) {
          console.error(`Failed to call ${number}:`, callErr.message);
        }
      }

      const smsNumbers = [
        local.ADMIN_NUMBER,
        local.CARL_NUMBER,
        '+917814940060'
      ].filter(num => num);

      for (const number of smsNumbers) {
        try {
          const message = await twilio.messages.create({
            body: `${storeSMSMessage} - Order #${order.order_number}`,
            to: number,
            from: twilioPhone
          });
          console.log(`SMS sent to ${number}: ${message.sid}`);
        } catch (smsErr) {
          console.error(`Failed to send SMS to ${number}:`, smsErr.message);
        }
      }


      try {
        await slackWebClient.chat.postMessage({
          channel: slackChannelId,
          text: `Hello ! you have a new order on store : ${dispensary.name}. Order Number: ${order.order_number}, price: ${order.price} At ${new Date().toLocaleString()}`
        });
        console.log('Slack notification sent');
      } catch (slackErr) {
        console.error('Failed to send Slack notification:', slackErr.message);
      }

    } catch (error) {
      console.error('Send notifications error:', error);
    }
  }
}

module.exports = new MonerisService();