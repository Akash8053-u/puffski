const mongoose = require('mongoose')


const NotificationSchema = new mongoose. Schema(
  {
    review_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'productreviews',
    },

    message: {
      type: String,
      trim: true,
    },

    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
    },

    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
    },

    from: {
      type:mongoose.Schema.Types.ObjectId,
      ref: 'users',
    },

    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'reserveorders',
    },

    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'products',
    },

    notification: {
      type: String,
      trim: true,
    },

    readStatus: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, 
    versionKey: false,
  }
);

module.exports =  mongoose.model('notifications', NotificationSchema);
