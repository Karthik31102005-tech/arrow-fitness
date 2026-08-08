const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const Member = require('../models/Member');
const { calculateEndDate, calculateAmount } = require('../utils/planCalculator');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

router.post('/create-order', async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Valid amount is required' });
        }

        const options = {
            amount: amount * 100,
            currency: 'INR',
            receipt: `receipt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);

        res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID
        });

    } catch (err) {
        console.error('Razorpay order creation error:', err);
        res.status(500).json({ error: 'Could not create payment order' });
    }
});

router.post('/verify', async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            memberData
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !memberData) {
            return res.status(400).json({ error: 'Missing payment verification data' });
        }

        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        const isSignatureValid = expectedSignature === razorpay_signature;

        if (!isSignatureValid) {
            console.error('Payment signature mismatch - possible fraud attempt');
            return res.status(400).json({ error: 'Payment verification failed. Signature mismatch.' });
        }

        const { name, whatsappNumber, email, planType } = memberData;

        const validPlans = ['monthly', '3month', '6month', '12month'];
        if (!name || !whatsappNumber || !validPlans.includes(planType)) {
            return res.status(400).json({ error: 'Invalid member data' });
        }

        const startDate = new Date();
        const endDate = calculateEndDate(startDate, planType);
        const amount = calculateAmount(planType, true);

        const newMember = new Member({
            name,
            whatsappNumber,
            email: email || '',
            planType,
            startDate,
            endDate,
            amountPaid: amount,
            paymentStatus: 'success',
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id
        });

        const savedMember = await newMember.save();

        res.json({
            message: 'Payment verified and member registered successfully',
            member: savedMember
        });

    } catch (err) {
        console.error('Payment verification error:', err);
        res.status(500).json({ error: 'Something went wrong verifying payment' });
    }
});

module.exports = router;