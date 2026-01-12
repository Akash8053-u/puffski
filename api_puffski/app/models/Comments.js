const mongoose = require('mongoose');
const { Schema } = mongoose;

const commentSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String },
  code: { type: Number, unique: true },
  message: { type: String, default: '' },
  news_id: { type: Schema.Types.ObjectId, ref: 'News' },
  comment_id: { type: Schema.Types.ObjectId, ref: 'Comments', default: null },
  shortUrl: { type: String, default: '' },
  originalUrl: { type: String, default: '' },
  status: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'Users' },
  addedBy: { type: Schema.Types.ObjectId, ref: 'Users' }
}, { timestamps: true });

module.exports = mongoose.model('Comments', commentSchema);
