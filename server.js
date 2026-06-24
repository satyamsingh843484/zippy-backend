const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config(); // .env file ko read karne ke liye

const app = express();
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// Socket.io logic
io.on('connection', (socket) => {
  console.log('🟢 A user connected');
  
  // Jab customer payment karega, ye track-order event trigger hoga
  socket.on('track-order', (orderId) => {
    console.log(`Order ${orderId} placed successfully.`);
  });
});
const PORT = process.env.PORT || 8080;

// Middlewares
app.use(cors());
app.use(express.json());

// Upload folder ko public banana (Taki frontend me images dikh sake)
app.use('/uploads', express.static('uploads'));
// Routes Import
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// YAHAN NAYA ROUTE ADD KARO 👇
const productRoutes = require('./routes/products');
app.use('/api/products', productRoutes);

// YAHAN NAYA ORDERS ROUTE ADD KARO 👇
const orderRoutes = require('./routes/orders');
app.use('/api/orders', orderRoutes);

//PAYMENT ROUTE
const paymentRoutes = require('./routes/payment');
app.use('/api/payment', paymentRoutes);

//ADMIN ROUTE
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);
// ========================================

// ==========================================
// 1. MONGODB DATABASE CONNECTION
// ==========================================
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
      console.log('✅☁️ Cloud MongoDB Database Connected Successfully!');
  })
  .catch((error) => {
      console.log('❌ MongoDB Connection Error:', error.message);
  });

// ==========================================
// 2. BASIC ROUTE
// ==========================================
app.get('/', (req, res) => {
    res.send("Zippy Backend is Live with Database! 🚀");
});

// Server & WebSockets Start
server.listen(PORT, () => {
    console.log(`✅ Zippy Server & WebSockets running on http://localhost:${PORT}`);
});