const mongoose = require('mongoose');

const { Schema } = mongoose;

const CategorySchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
    },

    image: {
      type: String,
    },

    type: {
      type: String,
    },

    categoryId: {
      type: String,
    },

    parentCategoryId: {
      type: String,
    },

    catName: {
      type: String,
    },

    dispensary_id: {
      type: Schema.Types.ObjectId,
      ref: 'Item',
    },


    instaleaf_categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },

    hideProducts: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ['active', 'deactive'],
      default: 'active',
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, 
    versionKey: false,
  }
);

module.exports =  mongoose.model('ItemCategory', CategorySchema);
