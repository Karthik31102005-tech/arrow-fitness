const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// POST /api/payments/create-order
router.post('/create-order', async (req, res) => {
    try {
        const { amount } = req.body; // amount in rupees, sent from frontend

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Valid amount is required' });
        }

        const options = {
            amount: amount * 100, // Razorpay expects amount in paise (₹1 = 100 paise)
            currency: 'INR',
            receipt: `receipt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);

        res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID // safe to send publicly, this is the public key
        });

    } catch (err) {
        console.error('Razorpay order creation error:', err);
        res.status(500).json({ error: 'Could not create payment order' });
    }
});

module.exports = router;