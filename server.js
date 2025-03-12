const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const cors = require('cors'); // CORS पैकेज इम्पोर्ट
require('dotenv').config();

const app = express();

// CORS Middleware
app.use(cors({
    origin: 'https://referral-recharge-6421.vercel.app', // Vercel URL की अनुमति
    credentials: true
}));

// Middleware
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB से कनेक्ट हो गया'))
    .catch(err => console.error('MongoDB कनेक्शन में त्रुटि:', err));

// Schemas
const UserSchema = new mongoose.Schema({
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    referralCode: { type: String },
    referredBy: { type: String },
    walletBalance: { type: Number, default: 0 },
    activated: { type: Boolean, default: false },
    activationPending: { type: Boolean, default: false },
    utrNumber: { type: String }
});

const RechargeRequestSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    mobileNumber: { type: String, required: true },
    simCard: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

const CounterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
});

const User = mongoose.model('User', UserSchema);
const RechargeRequest = mongoose.model('RechargeRequest', RechargeRequestSchema);
const Counter = mongoose.model('Counter', CounterSchema);

// Get Next Referral Code
const getNextReferralCode = async () => {
    const counter = await Counter.findByIdAndUpdate(
        'referralCode',
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );
    return String(counter.seq).padStart(5, '0');
};

// Referral Commission Levels
const commissionLevels = [25, 15, 10, 5, 4, 3, 2, 1];

// Registration
app.post('/register', async (req, res) => {
    try {
        const { phone, password, referralCode } = req.body;
        console.log('रजिस्ट्रेशन शुरू:', { phone, password, referralCode });

        if (!phone || !password || !referralCode) {
            console.log('फील्ड्स अधूरी हैं');
            return res.status(400).json({ message: 'सभी फील्ड्स भरें' });
        }

        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            console.log('यह फोन नंबर पहले से मौजूद है:', phone);
            return res.status(400).json({ message: 'यह फोन नंबर पहले से रजिस्टर्ड है' });
        }

        let referrer = null;
        if (referralCode !== 'REFSTART') {
            referrer = await User.findOne({ referralCode });
            if (!referrer) {
                console.log('गलत रेफर कोड:', referralCode);
                return res.status(400).json({ message: 'गलत रेफर कोड' });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            phone,
            password: hashedPassword,
            referredBy: referralCode
        });
        const savedUser = await newUser.save();
        console.log('यूज़र सफलतापूर्वक सेव हुआ:', savedUser);

        if (referrer) {
            let currentReferrer = referrer;
            let level = 0;

            while (currentReferrer && level < commissionLevels.length) {
                const commission = commissionLevels[level];
                currentReferrer.walletBalance += commission;
                await currentReferrer.save();
                console.log(`लेवल ${level + 1} कमीशन ${commission} रुपये दिया गया: ${currentReferrer.phone}`);

                if (currentReferrer.referredBy && currentReferrer.referredBy !== 'REFSTART') {
                    currentReferrer = await User.findOne({ referralCode: currentReferrer.referredBy });
                } else {
                    currentReferrer = null;
                }
                level++;
            }
        }

        res.status(201).json({ message: 'रजिस्ट्रेशन सफल' });
    } catch (error) {
        console.error('रजिस्ट्रेशन में त्रुटि:', error.message, error.stack);
        res.status(500).json({ message: 'सर्वर में त्रुटि' });
    }
});

// User Login
app.post('/login', async (req, res) => {
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

        req.session.userId = user._id;
        console.log('लॉगिन सफल:', user.phone);
        res.status(200).json({ message: 'लॉगिन सफल' });
    } catch (error) {
        console.error('लॉगिन में त्रुटि:', error);
        res.status(500).json({ message: 'सर्वर में त्रुटि' });
    }
});

// Admin Login
app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        req.session.isAdmin = true;
        res.status(200).json({ message: 'एडमिन लॉगिन सफल' });
    } else {
        res.status(401).json({ message: 'गलत यूज़रनेम या पासवर्ड' });
    }
});

// Middleware to check admin session
const isAdmin = (req, res, next) => {
    if (!req.session.isAdmin) {
        return res.status(403).json({ message: 'एडमिन लॉगिन करें' });
    }
    next();
};

// Activate ID Request
app.post('/activate', async (req, res) => {
    try {
        const { utrNumber } = req.body;
        const user = await User.findById(req.session.userId);
        if (!user) return res.status(404).json({ message: 'यूज़र नहीं मिला' });

        user.utrNumber = utrNumber;
        user.activationPending = true;
        await user.save();

        res.status(200).json({ message: 'एक्टिवेशन रिक्वेस्ट भेजी गई, एडमिन अप्रूवल का इंतजार करें' });
    } catch (error) {
        console.error('एक्टिवेशन त्रुटि:', error);
        res.status(500).json({ message: 'सर्वर त्रुटि' });
    }
});

// Approve Activation
app.post('/admin/activate/:id/approve', isAdmin, async (req, res) => {
    const user = await User.findById(req.params.id);
    user.activated = true;
    user.activationPending = false;
    user.referralCode = await getNextReferralCode();
    await user.save();
    res.json({ message: 'ID एक्टिवेट हो गई' });
});

// Recharge Request
app.post('/recharge', async (req, res) => {
    try {
        const { mobileNumber, simCard, amount } = req.body;
        const user = await User.findById(req.session.userId);
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
});

// Dashboard Data
app.get('/dashboard-data', async (req, res) => {
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
});

// Recharge Requests for User
app.get('/recharge-requests', async (req, res) => {
    try {
        if (!req.session.userId) return res.status(401).json({ message: 'लॉगिन करें' });
        const requests = await RechargeRequest.find({ userId: req.session.userId });
        res.json(requests);
    } catch (error) {
        console.error('रिचार्ज रिक्वेस्ट त्रुटि:', error);
        res.status(500).json({ message: 'सर्वर त्रुटि' });
    }
});

// Admin Routes
app.get('/admin/activations', isAdmin, async (req, res) => {
    const pending = await User.find({ activationPending: true });
    res.json(pending);
});

app.post('/admin/activate/:id/reject', isAdmin, async (req, res) => {
    const user = await User.findById(req.params.id);
    user.utrNumber = null;
    user.activationPending = false;
    await user.save();
    res.json({ message: 'एक्टिवेशन रिक्वेस्ट रद्द की गई' });
});

app.get('/admin/recharges', isAdmin, async (req, res) => {
    const requests = await RechargeRequest.find().populate('userId', 'phone');
    res.json(requests);
});

app.post('/admin/recharge/:id/success', isAdmin, async (req, res) => {
    const request = await RechargeRequest.findById(req.params.id);
    request.status = 'successful';
    await request.save();
    res.json({ message: 'रिचार्ज सफल' });
});

app.post('/admin/recharge/:id/cancel', isAdmin, async (req, res) => {
    const request = await RechargeRequest.findById(req.params.id);
    const user = await User.findById(request.userId);
    user.walletBalance += request.amount;
    request.status = 'cancelled';
    await Promise.all([user.save(), request.save()]);
    res.json({ message: 'रिचार्ज रद्द, राशि वापस की गई' });
});

app.listen(3000, () => {
    console.log('सर्वर 3000 पर चल रहा है');
});