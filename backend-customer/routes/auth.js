const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const auth = require('../middleware/auth');

const serializeUser = (user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    role: user.role,
    managedRestaurantId: user.managedRestaurantId || null,
    location: user.location || {}
});

// @route   POST api/auth/register
router.post('/register', async (req, res) => {
    const { name, email, password, role, phone, location } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ msg: 'Please fill all fields' });
    }
    if (password.length < 6) {
        return res.status(400).json({ msg: 'Password must be at least 6 characters' });
    }
    if (!['customer', 'restaurant', 'delivery'].includes(role)) {
        return res.status(400).json({ msg: 'Invalid role' });
    }

    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        user = new User({ name, email, password, role, phone, location });
        await user.save();

        // If the role is restaurant, automatically create a Restaurant entry
        if (role === 'restaurant') {
            const newRestaurant = new Restaurant({
                name: `${name}'s Kitchen`,
                ownerId: user.id
            });
            await newRestaurant.save();
            user.managedRestaurantId = newRestaurant.id;
            await user.save();
        }

        const payload = { user: { id: user.id, role: user.role } };
        const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
        res.json({ token, user: serializeUser(user) });
    } catch (err) {
        console.error('Register error:', err.message);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

// @route   POST api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ msg: 'Please fill all fields' });
    }

    try {
        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        const payload = { user: { id: user.id, role: user.role } };
        const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
        res.json({ token, user: serializeUser(user) });
    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

// @route   GET api/auth/me
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json({ user: serializeUser(user) });
    } catch (err) {
        console.error('Fetch profile error:', err.message);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

// @route   PUT api/auth/me
router.put('/me', auth, async (req, res) => {
    const { name, phone, location } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        if (typeof name === 'string' && name.trim()) {
            user.name = name.trim();
        }

        if (typeof phone === 'string') {
            user.phone = phone.trim();
        }

        if (location && typeof location === 'object') {
            user.location = {
                ...user.location,
                ...location,
                address: typeof location.address === 'string' ? location.address.trim() : user.location?.address
            };
        }

        await user.save();
        res.json({ user: serializeUser(user) });
    } catch (err) {
        console.error('Update profile error:', err.message);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

module.exports = router;
