// models/UpdatedPassword.js
const mongoose = require("mongoose");

const UpdatedPasswordSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    updatedPassword: {
      type: String,
      default: null
    },

    lastPassword: {
      type: String,
      default: null
    },

    lastPasswordUpdated: {
      type: Date,
      default: null
    },

    otp: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true,     // auto creates createdAt & updatedAt
    versionKey: false
  }
);




module.exports = mongoose.model("UpdatedPassword", UpdatedPasswordSchema);
