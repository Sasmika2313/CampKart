const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  category: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['available', 'sold'], default: 'available' },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
