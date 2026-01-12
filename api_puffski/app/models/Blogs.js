const mongoose = require('mongoose');
const { Schema } = mongoose;

const blogSchema = new Schema({
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  dispensary_id: { type: Schema.Types.ObjectId, ref: 'Item' },
  description: { type: String, required: true },
  slug: { type: String },
  image: { type: String },
  status: { type: String, enum: ['active', 'deactive'], default: 'active' },
  isDeleted: { type: Boolean, default: false },
  deletedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Blogs', blogSchema);
