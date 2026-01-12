const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema(
  {
    name: String,
    image: String,
    type: String,
    categoryId: String,

    isMaster: {
      type: Boolean,
      default: false,
    },

    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },

    instaleaf_producerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
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
  { timestamps: true }
);

module.exports = mongoose.model('Category', CategorySchema);
