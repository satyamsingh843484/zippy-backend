const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// API 1: Customer Order Place Karega (Checkout)
router.post('/place', async (req, res) => {
  try {
    // Frontend query URL me data bhej raha hai
    const customerName = req.query.customerName;
    const totalAmount = req.query.totalAmount;
    
    const newOrder = new Order({ customerName, totalAmount });
    await newOrder.save();
    
    res.status(201).json({ message: "Order placed successfully! ⚡", order: newOrder });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// API 2: Saare Orders Fetch Karna (Customer Account & Seller Dashboard ke liye)
router.get('/all', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }); // Latest order sabse upar
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// API 3: Order Status Update Karna (Seller Control Center ke liye)
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