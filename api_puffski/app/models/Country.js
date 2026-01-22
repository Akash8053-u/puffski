const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CountrySchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['country', 'province', 'state', 'territory'],
    default: 'country'
  },
  code: {
    type: String,
    uppercase: true,
    sparse: true
  },
  flag: {
    type: String
  },
  currency: {
    type: String
  },
  currencySymbol: {
    type: String
  },
  phoneCode: {
    type: String
  },
  timezone: {
    type: String
  },
  status: {
    type: String,
    enum: ['active', 'deactive'],
    default: 'active'
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  addedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Users'
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Users'
  }
}, {
  timestamps: true
});

CountrySchema.index({ name: 1, type: 1, isDeleted: 1 });
CountrySchema.index({ code: 1, isDeleted: 1 });

module.exports = mongoose.model('Country', CountrySchema);