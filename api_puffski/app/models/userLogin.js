const mongoose = require('mongoose');

const userLoginSchema = new mongoose.Schema(
  {
    gcm_id: {
      type: String,
      trim: true,
    },
   device_type: {
  type: String,
  enum: ["Android", "IOS", "Web"],   // ADD THIS
  required: true
},

    device_token: {
      type: String,
      maxlength: 200,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to Users collection
      required: true,
    },
    access_token: {
      type: String,
      maxlength: 500,
      trim: true,
    },
  },
  {
    timestamps: true, 
    versionKey:false// Automatically adds createdAt and updatedAt
  }
);

module.exports = mongoose.model('UserLogin', userLoginSchema);
