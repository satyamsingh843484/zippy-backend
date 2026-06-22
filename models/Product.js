const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  imagePath: { type: String, required: true },
  category: { type: String, required: true }, // <-- NAYA FIELD
  sellerId: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);