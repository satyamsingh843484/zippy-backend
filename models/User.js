const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  /* 🔥 YAHAN CHANGE HUA HAI: Enum mein nayi roles add kar di hain 🔥 */
  role: { 
    type: String, 
    enum: ['CUSTOMER', 'PENDING_SELLER', 'SELLER', 'ADMIN'], 
    default: 'CUSTOMER' 
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);