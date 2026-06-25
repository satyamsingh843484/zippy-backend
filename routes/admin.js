const express = require('express');
const router = express.Router();
const User = require('../models/User'); // User model ko import kar rahe hain
const Subscriber = require('../models/Subscriber');

// API 1: Saare Pending Sellers ki list lana (Admin Dashboard ke liye)
router.get('/pending-sellers', async (req, res) => {
  try {
    const pendingSellers = await User.find({ role: 'PENDING_SELLER' }).select('-password');
    res.status(200).json(pendingSellers);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// API 2: Kisi pending seller ko Approve karna (Active Seller banana)
router.put('/approve-seller/:id', async (req, res) => {
  try {
    const sellerId = req.params.id;
    
    // Role ko PENDING_SELLER se SELLER mein update kar rahe hain
    const updatedUser = await User.findByIdAndUpdate(
      sellerId, 
      { role: 'SELLER' }, 
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found!" });
    }

    res.status(200).json({ message: "Seller Approved Successfully!", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Error approving seller", error: error.message });
  }
});

// ==========================================
// SUBSCRIBE NEWSLETTER ROUTE
// ==========================================
router.post('/subscribe', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        // Check karo ki email pehle se to nahi hai
        const existing = await Subscriber.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: "You are already subscribed!" });
        }

        // Naya subscriber save karo
        const newSubscriber = new Subscriber({ email });
        await newSubscriber.save();
        
        res.status(200).json({ message: "Subscribed successfully!" });
    } catch (error) {
        console.error("Subscription Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});
module.exports = router;