const express = require('express');
const router = express.Router();
const multer = require('multer');
const Product = require('../models/Product');
const path = require('path');

// Image upload karne ka logic (Multer Configuration)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Kis folder me save karna hai
  },
  filename: function (req, file, cb) {
    // Photo ka naam unique banane ke liye time jodh denge
    cb(null, Date.now() + path.extname(file.originalname)); 
  }
});
const upload = multer({ storage: storage });

// API 1: Naya Product Upload Karna (Seller Dashboard ke liye)
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { title, price, category, sellerId } = req.body; // <-- NAYA FIELD
    const imagePath = req.file.filename;

    const newProduct = new Product({ title, price, category, imagePath, sellerId }); // <-- ISME BHI JO DO
    await newProduct.save();

    res.status(201).json({ message: "Item added successfully!", product: newProduct });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// API 2: Saare Products Dikhana (Home Page ke liye)
router.get('/all', async (req, res) => {
  try {
    // Sabse naye products sabse pehle dikhenge
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// API 3: Live Search API (Smart Suggestions)
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(200).json([]);
    
    // Database mein title ko ignore-case ($options: 'i') karke dhoondhega
    const products = await Product.find({
      title: { $regex: query, $options: 'i' }
    }).limit(5); // Sirf top 5 suggestions dikhayega taaki screen na bhare
    
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});
module.exports = router;