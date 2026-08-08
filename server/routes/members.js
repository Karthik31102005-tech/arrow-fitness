const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const { calculateEndDate, calculateAmount } = require('../utils/planCalculator');
const authCheck = require('../middleware/authCheck');

// POST /api/members/register - public, anyone can register
router.post('/register', async (req, res) => {
    try {
        const { name, whatsappNumber, email, planType } = req.body;

        if (!name || !whatsappNumber || !planType) {
            return res.status(400).json({ error: 'Name, WhatsApp number, and plan type are required' });
        }

        const validPlans = ['monthly', '3month', '6month', '12month'];
        if (!validPlans.includes(planType)) {
            return res.status(400).json({ error: 'Invalid plan type' });
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
            paymentStatus: 'pending'
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

// GET /api/members - PROTECTED, only logged-in admin can view
router.get('/', authCheck, async (req, res) => {
    try {
        const members = await Member.find().sort({ createdAt: -1 });
        res.json(members);
    } catch (err) {
        console.error('Fetch members error:', err);
        res.status(500).json({ error: 'Could not fetch members' });
    }
});

module.exports = router;