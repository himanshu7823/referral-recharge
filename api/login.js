const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('../db'); // MongoDB कनेक्शन
const User = require('../models/User');

module.exports = async (req, res) => {
    try {
        const { phone, password } = req.body;
        console.log('लॉगिन शुरू:', { phone, password });

        if (!phone || !password) {
            return res.status(400).json({ message: 'फोन नंबर और पासवर्ड भरें' });
        }

        const user = await User.findOne({ phone });
        if (!user) {
            console.log('यूज़र नहीं मिला:', phone);
            return res.status(401).json({ message: 'यह फोन नंबर रजिस्टर्ड नहीं है' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            console.log('पासवर्ड गलत:', phone);
            return res.status(401).json({ message: 'गलत पासवर्ड' });
        }

        // सेशन मैनेजमेंट Vercel पर सर्वरलेस फंक्शंस में अलग तरीके से करना पड़ता है
        // अभी के लिए, हम सेशन की जगह लॉगिन सफल होने की पुष्टि करेंगे
        console.log('लॉगिन सफल:', user.phone);
        res.status(200).json({ message: 'लॉगिन सफल', userId: user._id });
    } catch (error) {
        console.error('लॉगिन में त्रुटि:', error);
        res.status(500).json({ message: 'सर्वर में त्रुटि' });
    }
};