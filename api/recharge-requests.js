const mongoose = require('mongoose');
require('../db');
const RechargeRequest = require('../models/RechargeRequest');

module.exports = async (req, res) => {
    try {
        const userId = req.query.userId; // अस्थायी समाधान
        if (!userId) return res.status(401).json({ message: 'लॉगिन करें' });

        const requests = await RechargeRequest.find({ userId });
        res.json(requests);
    } catch (error) {
        console.error('रिचार्ज रिक्वेस्ट त्रुटि:', error);
        res.status(500).json({ message: 'सर्वर त्रुटि' });
    }
};