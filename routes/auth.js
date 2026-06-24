const express = require('express');
const router = express.Router();
const User = require('../models/User');

// REGISTER API (Naya account banana)
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists" });

        // 🔥 SECURITY PATCH: Admin Approval Logic 🔥
        let secureRole = 'CUSTOMER'; // Default sabko customer manenge
        
        if (role === 'SELLER') {
            // Agar koi seller banna chahta hai, toh usko seedha PENDING me daalo
            secureRole = 'PENDING_SELLER';
        } else if (role === 'ADMIN') {
            // Koi khud se hack karke Admin na ban jaye, isliye Customer bana do
            secureRole = 'CUSTOMER';
        } else if (role === 'CUSTOMER') {
            secureRole = 'CUSTOMER';
        }

        // Naya user secure role ke sath save karo
        user = new User({ name, email, password, role: secureRole });
        await user.save();
        
        // YAHAN PRINT KARAO 👇
        console.log("🔥 Hurrah! Naya secure user MongoDB me save ho gaya:", user);

        // Dhyan de: Response me bhi user.role bhejenge (taki frontend ko pata chale wo PENDING hai)
        res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// LOGIN API (Pehle se bane account me login)
router.post('/login', async (req, res) => {
    try {
        const email = req.query.email || req.body.email;
        const password = req.query.password || req.body.password;

        const user = await User.findOne({ email, password });
        if (!user) return res.status(401).json({ message: "Invalid credentials" });

        res.status(200).json({ id: user._id, name: user.name, email: user.email, role: user.role });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

module.exports = router;