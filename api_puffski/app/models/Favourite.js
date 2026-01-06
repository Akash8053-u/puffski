// models/Favourite.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FavouriteSchema = new Schema(
  {
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: "User", // Reference to User model
      required: true,
    },
    type: {
      type: String,
      enum: ["dispensary", "product"],
      required: true,
    },
    item_id: {
      type: Schema.Types.ObjectId,
      ref: "Item", // Reference to Item (for dispensary)
    },
    product_id: {
      type: Schema.Types.ObjectId,
      ref: "Product", // Reference to Product
    },
    // Optional notes or metadata
    notes: {
      type: String,
      default: "",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey:false // automatically adds createdAt and updatedAt
  }
);

// Optional: Index to avoid duplicate favourites for same user & type
FavouriteSchema.index({ addedBy: 1, type: 1, item_id: 1, product_id: 1 }, { unique: true });

module.exports = mongoose.model("Favourite", FavouriteSchema);
