const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// API 1: Customer Order Place Karega (Checkout)
router.post('/place', async (req, res) => {
  try {
    // Ab frontend se body me poora cart aayega
    const { customerName, totalAmount, cart } = req.body;
    
    // Smart Logic: Cart me jitne alag-alag sellers hain, unke liye alag order banega
    const sellerOrders = {};

    cart.forEach(item => {
        // Agar item ka sellerId nahi hai (jaise cafe products), toh 'ADMIN' ko bhej do
        const sId = item.sellerId || 'ADMIN_CAFE'; 
        if (!sellerOrders[sId]) {
            sellerOrders[sId] = { items: [], total: 0 };
        }
        sellerOrders[sId].items.push(item);
        // Sirf usi seller ke items ka total calculate karo
        sellerOrders[sId].total += (item.price * item.quantity);
    });

    // Har seller ke liye alag order database me save karo
    for (const sId in sellerOrders) {
        const newOrder = new Order({
            customerName: customerName,
            totalAmount: sellerOrders[sId].total, // Us seller ka kitna bill hua
            sellerId: sId,
            items: sellerOrders[sId].items
        });
        await newOrder.save();
    }
    
    res.status(201).json({ message: "Multi-Vendor Order placed successfully! ⚡" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// API 2: Saare Orders Fetch Karna (Customer Account ke liye)
router.get('/all', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }); // Latest sabse upar
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// 🔥 API 3: NAYA ROUTE - Sirf specific seller ke orders lana
router.get('/seller/:sellerId', async (req, res) => {
  try {
    const orders = await Order.find({ sellerId: req.params.sellerId }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// API 4: Order Status Update Karna
router.post('/update', async (req, res) => {
  try {
    const orderId = req.query.orderId;
    const status = req.query.status;
    
    const updatedOrder = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
    res.status(200).json({ message: "Order status updated!", order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;