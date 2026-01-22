// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    fullName: { type: String },
    gender: { type: String },
    birthday: { type: Date },
    email: { type: String, lowercase: true },
    username: { type: String, lowercase: true },
    username1: { type: String, unique: true, required: true },
    mobile: { type: String },
    password: { type: String, required: true },
    roles: {
      type: String,
      enum: ['SA', 'A', 'U', 'D', 'B', 'DR', 'DRIVER', 'STOREADMIN', 'P', 'EXPRESS'],
      default: 'U',
    },
    roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
    //userType: { type: String, enum: ['LSR', 'PUFFSKI'], default: 'PUFFSKI' },
    //Type: { type: String, required: true },
    store_slug: { type: String },
    date_verified: { type: Date },
    isVerified: { type: String, enum: ['Y', 'N'], default: 'N' },
    userVerified: { type: Boolean, default: true },
    ageVerifiedAt: { type: Date },
    otp: { type: Number, default: 0 },
    code: { type: Number, unique: true },
    lat: { type: String, default: '0' },
    lng: { type: String, default: '0' },
    isDeleted: { type: Boolean, default: false },
    isOnline: { type: Boolean, default: false },
    totalSpend: { type: Number, default: 0.0 },
    rewardPoint: { type: Number, default: 0 },
    totalOrder: { type: Number, default: 0 },
    avgspend: { type: Number, default: 0.0 },
    lastOrderDate: { type: Date },
    cityDriver: { type: [String], default: [] },
    cityDriverString: { type: String },
    delivery_address: { type: [String], default: [] },
    shippingDetail: { type: [String], default: [] },
    paymentMethod: { type: [String], default: [] },
    delivery_addresses: { type: [String], default: [] },
    delivery_notes: { type: mongoose.Schema.Types.Mixed },
    socialMedia: { type: mongoose.Schema.Types.Mixed },
    businessHours: { type: mongoose.Schema.Types.Mixed },
    communication: { type: mongoose.Schema.Types.Mixed },
    plan_id: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscribePackage' },
    status: { type: String, enum: ['active', 'deactive', 'inactive'], default: 'deactive' },
    date_registered: { type: Date },
    lastPasswordUpdated: { type: Date },
    deviceToken: { type: String },
    push_token: { type: String },
    push_token_array: { type: [String], default: [] },
    website: { type: String },
    contactEmail: { type: String },
    contactPhone: { type: String },
    business: { type: String },
    businessName: { type: String },
    description: { type: String },
    logo: { type: String },
    storeLogo: { type: String },
    storeBanner: { type: String },
    street: { type: String },
    zipCode: { type: String },
    notes: { type: String },
    commonCourier: { type: Boolean, default: false },
    isBomFestUser: { type: Boolean, default: false },
    isSellerApproved: { type: Boolean, default: false },
    isMaster: { type: Boolean, default: false },
    reviewStatus: { type: Boolean, default: true },
    start_date: { type: Date },
    exp_date: { type: Date },
    signupLocation: { type: String },
    // In User.js model, add these fields:
    moneris_storeId: {
      type: String,
      default: '',
      description: 'Moneris Store ID for LSR payments'
    },
    moneris_token: {
      type: String,
      default: '',
      description: 'Moneris API token for LSR payments'
    },
    isLSRStore: {
      type: Boolean,
      default: false,
      description: 'Flag to identify LSR stores'
    },
    //
    os: { type: String, enum: ['ANDROID', 'IOS'] },
    domain: { type: String, enum: ['web', 'ios', 'android'] },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ageVerifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, versionKey: false }
);

// ======================
// Pre-save hook
// ======================
// Async pre-save WITHOUT next()
userSchema.pre('save', async function () {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password.toLowerCase(), 10);
    this.lastPasswordUpdated = new Date();
  }

  if (this.firstName && this.lastName) {
    this.fullName = `${this.firstName} ${this.lastName}`;
  }

  if (this.cityDriver && this.cityDriver.length) {
    this.cityDriverString = this.cityDriver.map(item => item.toLowerCase()).join(', ');
  }
});

// ======================
// Compare password
// ======================
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// ======================
// Hide password in output
// ======================
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
