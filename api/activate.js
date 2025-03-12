const mongoose = require('mongoose');
require('../db');
const User = require('../models/User');

module.exports = async (req, res) => {
    try {
        const { utrNumber, userId } = req.body; // userId को रिक्वेस्ट से ले रहे हैं
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'यूज़र नहीं मिला' });

        user.utrNumber = utrNumber;
        user.activationPending = true;
        await user.save();

        res.status(200).json({ message: 'एक्टिवेशन रिक्वेस्ट भेजी गई, एडमिन अप्रूवल का इंतजार करें' });
    } catch (error) {
        console.error('एक्टिवेशन त्रुटि:', error);
        res.status(500).json({ message: 'सर्वर त्रुटि' });
    }
};