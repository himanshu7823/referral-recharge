const mongoose = require('mongoose');
const User = require('../models/User');
require('../db');
module.exports = async (req, res) => {
    try {
        if (!req.session.userId) return res.status(401).json({ message: 'लॉगिन करें' });
        const user = await User.findById(req.session.userId);
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