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

        // Naya user save karo
        user = new User({ name, email, password, role });
        await user.save();
        // YAHAN PRINT KARAO 👇
console.log("🔥 Hurrah! Naya user MongoDB me save ho gaya:", user);

        res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// LOGIN API (Pehle se bane account me login)
router.post('/login', async (req, res) => {
    try {
        // Frontend query URL me data bhej raha tha, isliye query aur body dono check karenge
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