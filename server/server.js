const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const membersRoute = require('./routes/members');
const paymentsRoute = require('./routes/payments');
const authRoute = require('./routes/auth');
const mediaRoute = require('./routes/media');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch((err) => console.error('MongoDB connection error:', err));

app.get('/api/health', (req, res) => {
    res.json({ status: 'Arrow Fitness backend is running', timestamp: new Date() });
});

app.use('/api/members', membersRoute);
app.use('/api/payments', paymentsRoute);
app.use('/api/auth', authRoute);
app.use('/api/media', mediaRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));