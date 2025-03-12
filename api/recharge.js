const mongoose = require('mongoose');
require('../db');
const User = require('../models/User');
const RechargeRequest = require('../models/RechargeRequest');

module.exports = async (req, res) => {
    try {
        const { mobileNumber, simCard, amount, userId } = req.body;
        const user = await User.findById(userId);
        if (!user.activated) return res.status(403).json({ message: 'ID एक्टिवेट करें' });
        if (user.walletBalance < amount) return res.status(400).json({ message: 'वॉलेट में पर्याप्त राशि नहीं' });

        user.walletBalance -= amount;
        await user.save();

        const recharge = new RechargeRequest({
            userId: user._id,
            mobileNumber,
            simCard,
            amount
        });
        await recharge.save();

        res.status(200).json({ message: 'रिचार्ज रिक्वेस्ट भेजी गई' });
    } catch (error) {
        console.error('रिचार्ज त्रुटि:', error);
        res.status(500).json({ message: 'सर्वर त्रुटि' });
    }
};