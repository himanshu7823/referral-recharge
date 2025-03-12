const mongoose = require('mongoose');
require('../db');
const User = require('../models/User');

module.exports = async (req, res) => {
    try {
        // सेशन की जगह, हम userId को रिक्वेस्ट से ले सकते हैं (Vercel पर सेशन मैनेजमेंट अलग है)
        const userId = req.query.userId; // अस्थायी समाधान
        if (!userId) return res.status(401).json({ message: 'लॉगिन करें' });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'यूज़र नहीं मिला' });

        res.json({
            phone: user.phone,
            walletBalance: user.walletBalance,
            referralCode: user.referralCode || 'ID एक्टिवेट करें',
            activated: user.activated,
            activationPending: user.activationPending
        });
    } catch (error) {
        console.error('डैशबोर्ड त्रुटि:', error);
        res.status(500).json({ message: 'सर्वर त्रुटि' });
    }
};