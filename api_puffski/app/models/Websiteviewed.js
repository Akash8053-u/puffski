const mongoose = require("mongoose");

const WebsiteViewedSchema = new mongoose.Schema(
  {
    ipAddress: {
      type: String,
      trim: true,
      index: true
    },
    type: {
      type: String,
      trim: true,
      index: true
    },
    domain: {
      type: String,
      trim: true,
      index: true
    }
  },
  {
    timestamps: true,   
    versionKey: false
  }
);

module.exports = mongoose.model("WebsiteViewed", WebsiteViewedSchema);
