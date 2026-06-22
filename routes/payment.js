const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Razorpay Instance (Apne Dashboard se Keys generate karke yahan daalna)
const razorpay = new Razorpay({
  key_id: 'rzp_test_T4Zw9v5VFk4BbP', // Ise apni Test Key ID se replace karna
  key_secret: 'Hi0pRW0yRzCHPGpt4S6tknhe',   // Ise apne Test Secret se replace karna
});

// API 1: Naya Order Create Karna
router.post('/create-order', async (req, res) => {
  try {
    const options = {
      amount: req.body.amount * 100, // Razorpay paise me kaam karta hai (₹1 = 100 paise)
      currency: "INR",
      receipt: "receipt_" + Math.random().toString(36).substring(7),
    };
    
    const order = await razorpay.orders.create(options);
    res.status(200).json(order);
  } catch (error) {
    console.error("Razorpay Error:", error);
    res.status(500).json({ message: "Payment initialization failed", error });
  }
});

// API 2: Payment Verify Karna
router.post('/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    // Security check - Signature verify karna
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto.createHmac("sha256", 'Hi0pRW0yRzCHPGpt4S6tknhe') // Yahan bhi apna Secret daalna
                               .update(sign.toString())
                               .digest("hex");

    if (razorpay_signature === expectedSign) {
      return res.status(200).json({ message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ message: "Invalid signature sent!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
});

module.exports = router;