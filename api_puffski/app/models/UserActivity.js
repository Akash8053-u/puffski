const mongoose = require("mongoose");

const UserActivitySchema = new mongoose.Schema(
  {
    productName: { type: String, trim: true, index: true },
    store: { type: String, trim: true, index: true },
    brand: { type: String, trim: true, index: true },
    sku: { type: String, trim: true, index: true },

    dispensary_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      index: true
    },

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ItemProduct",
      index: true
    },

    price: {
      type: String
    },

    quantity: {
      type: String
    },

    variant_id: {
      type: String
    },

    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    status: {
      type: String,
      enum: ["active", "deactive"],
      default: "active",
      index: true
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

UserActivitySchema.index({ isDeleted: 1, createdAt: -1 });

module.exports = mongoose.model("UserActivity", UserActivitySchema);
