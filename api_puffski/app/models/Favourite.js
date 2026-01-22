const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FavouriteSchema = new Schema(
  {
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },
    type: {
      type: String,
      enum: ["dispensary", "product"],
      required: true,
    },
    item_id: {
      type: Schema.Types.ObjectId,
      ref: "Item", 
    },
    product_id: {
      type: Schema.Types.ObjectId,
      ref: "Product", 
    },
    
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
    versionKey:false 
  }
);

FavouriteSchema.index({ addedBy: 1, type: 1, item_id: 1, product_id: 1 }, { unique: true });

module.exports = mongoose.model("Favourite", FavouriteSchema);
