const express = require('express');
const router = express.Router();
const multer = require('multer');
const Product = require('../models/Product');
const path = require('path');

// 👇👇 CLOUDINARY SETUP START 👇👇
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// ⚠️ DHYAN DEIN: Yahan apni API keys paste karni hain!
cloudinary.config({ 
  cloud_name: 'duhokqw0j', // Tumhara Cloud Name (screenshot se liya maine)
  api_key: '736999584845369', 
  api_secret: 'rVgkQtDvgghhadMoQNoxuiw4bUI' 
});

// Image upload logic (Cloudinary Configuration)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'zippy_products', // Cloudinary mein is naam ke folder mein photos aayengi
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});
const upload = multer({ storage: storage });
// 👆👆 CLOUDINARY SETUP END 👆👆


// API 1: Upload New Product (For Seller Dashboard)
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { title, price, category, sellerId } = req.body; 
    
    // 🔥 YAHAN CHANGE HUA HAI: Ab file.filename nahi, balki file.path (live URL) save hoga
    const imagePath = req.file.path;

    const newProduct = new Product({ title, price, category, imagePath, sellerId }); 
    await newProduct.save();

    res.status(201).json({ message: "Item added successfully!", product: newProduct });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// API 2: Get All Products (For Home Page)
router.get('/all', async (req, res) => {
  try {
    // Newest products will appear first
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
    
    // Case-insensitive search by title
    const products = await Product.find({
      title: { $regex: query, $options: 'i' }
    }).limit(5); // Limit to top 5 suggestions to prevent UI clutter
    
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// ==========================================
// 💥 NEW FEATURES START HERE 💥
// ==========================================

// API 4: Delete Product (For Partner Dashboard)
router.delete('/delete/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Delete product from MongoDB
    const deletedProduct = await Product.findByIdAndDelete(productId);
    
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found!" });
    }
    
    res.status(200).json({ message: "Product deleted successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting product", error: error.message });
  }
});

// API 5: Edit / Update Product (For Partner Dashboard)
router.put('/edit/:id', upload.single('file'), async (req, res) => {
  try {
    const productId = req.params.id;
    const { title, price, category } = req.body;

    // Check if the product exists in the database
    let product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found!" });
    }

    // Update with new details (or keep existing if not provided)
    product.title = title || product.title;
    product.price = price || product.price;
    product.category = category || product.category;

    // 🔥 YAHAN CHANGE HUA HAI: 'filename' ki jagah Cloudinary ka 'path' aayega
    // Update image path if a new photo is uploaded
    if (req.file) {
      product.imagePath = req.file.path;
    }

    // Save the final updates
    await product.save();
    
    res.status(200).json({ message: "Product updated successfully!", product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating product", error: error.message });
  }
});

module.exports = router;