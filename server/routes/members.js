const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const { calculateEndDate, calculateAmount } = require('../utils/planCalculator');

// POST /api/members/register
router.post('/register', async (req, res) => {
    try {
        const { name, whatsappNumber, email, planType } = req.body;

        // Basic validation
        if (!name || !whatsappNumber || !planType) {
            return res.status(400).json({ error: 'Name, WhatsApp number, and plan type are required' });
        }

        const validPlans = ['monthly', '3month', '6month', '12month'];
        if (!validPlans.includes(planType)) {
            return res.status(400).json({ error: 'Invalid plan type' });
        }

        // Calculate dates and amount
        const startDate = new Date();
        const endDate = calculateEndDate(startDate, planType);
        const amount = calculateAmount(planType, true); // true = new member, includes joining fee

        // Create member record (payment status pending for now, no payment gateway yet)
        const newMember = new Member({
            name,
            whatsappNumber,
            email: email || '',
            planType,
            startDate,
            endDate,
            amountPaid: amount,
            paymentStatus: 'pending' // will become 'success' once Razorpay is added
        });

        const savedMember = await newMember.save();

        res.status(201).json({
            message: 'Member registered successfully',
            member: savedMember
        });

    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: 'Something went wrong during registration' });
    }
});

// GET /api/members - list all members (for admin dashboard later)
router.get('/', async (req, res) => {
    try {
        const members = await Member.find().sort({ createdAt: -1 });
        res.json(members);
    } catch (err) {
        console.error('Fetch members error:', err);
        res.status(500).json({ error: 'Could not fetch members' });
    }
});

module.exports = router;