const mongoose = require('mongoose');

const { Schema } = mongoose;

const ItemProductSchema = new Schema(
  {
    meta_title: String,
    meta_name: String,
    meta_desc: String,
    meta_keywords: String,

    sortCBD: { type: Number, default: 0 },
    sortTHC: { type: Number, default: 0 },

    name: { type: String, required: true },

    product_id: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
    },

    pos_product_id: String,

    dispensary_id: {
      type: Schema.Types.ObjectId,
      ref: 'Item',
    },

    pre_roll: { type: Number, default: 0 },
    Eighth: { type: Number, default: 0 },
    quarter: { type: Number, default: 0 },
    half: { type: Number, default: 0 },
    ounce: { type: Number, default: 0 },

    likeCount: { type: Number, default: 0 },
    dislikeCount: { type: Number, default: 0 },

    producer_id: {
      type: Schema.Types.ObjectId,
      ref: 'ItemProducer',
    },

    producer_name: String,

    variants: { type: [Schema.Types.Mixed], default: [] },

    instaleaf_producerId: {
      type: Schema.Types.ObjectId,
      ref: 'Producer',
    },

    instaleaf_producerName: String,

    category_id: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },

    details: { type: String, default: '' },

    thc: String,
    thc_max: { type: Number, default: 0 },
    thc_min: { type: Number, default: 0 },

    cbd: String,
    cbd_max: { type: Number, default: 0 },
    cbd_min: { type: Number, default: 0 },

    image: { type: String, default: '' },
    dataType: { type: String, default: '' },

    price: { type: Number, default: 0 },
    quantity: { type: Number, default: 0 },

    isManualUpdated: { type: Boolean, default: false },

    status: {
      type: String,
      enum: ['active', 'deactive'],
      default: 'active',
    },

    isDeleted: { type: Boolean, default: false },

    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    brand_name: { type: String, default: '' },

    grams: { type: Number, default: 0 },

    isSpecial: {
      type: String,
      enum: ['active', 'deactive'],
      default: 'deactive',
    },

    isStaff: {
      type: String,
      enum: ['active', 'deactive'],
      default: 'deactive',
    },

    isStore: {
      type: String,
      enum: ['active', 'deactive'],
      default: 'deactive',
    },

    parentProductName: String,
    slug: String,
    sku: String,
    barcode: String,

    categoryId: String,
    categoryName: String,
    parentCategoryId: String,
    parentCategoryName: String,

    instaleaf_categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },

    instaleaf_categoryName: String,

    producer_category_id: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },

    producer_category_name: String,

    weight: Number,
    cannabisWeight: String,
    cannabisVolume: String,

    CBD_Content: String,
    CBD_Percent: String,
    THC_Content: String,
    THC_Percent: String,

    taxes: { type: [Schema.Types.Mixed], default: [] },

    inStock: { type: Boolean, default: false },

    discountPercent: String,
    discountPrice: { type: Number, default: 0 },

    isOnSale: { type: Boolean, default: false },

    addedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    inResponse: { type: Boolean, default: true },
    isFavourite: { type: Boolean, default: false },
    isFrontendHide: { type: Boolean, default: false },
  },
  {
    timestamps: true, 
    versionKey: false,
  }
);

module.exports = mongoose.model('ItemProduct', ItemProductSchema);
