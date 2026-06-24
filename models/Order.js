const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  
  // 🔥 NAYE FIELDS: Multi-Vendor Logic ke liye
  sellerId: { type: String, required: true }, 
  items: { type: Array, default: [] }, 
  
  status: { type: String, enum: ['RECEIVED', 'PACKING', 'DISPATCHED', 'DELIVERED'], default: 'RECEIVED' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);