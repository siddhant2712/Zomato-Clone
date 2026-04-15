const express = require('express');
const router = express.Router();
const Menu = require('../models/Menu');
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   GET api/menu
// @desc    Get all menu items
router.get('/', async (req, res) => {
    try {
        const query = {};

        if (req.query.restaurantId) {
            query.restaurantId = req.query.restaurantId;
        }

        if (req.query.availableOnly === 'true') {
            query.isAvailable = true;
        }

        const menu = await Menu.find(query).sort({ _id: -1 });
        res.json(menu);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/menu
// @desc    Add menu item (Restaurant only)
router.post('/', auth, async (req, res) => {
    if (req.user.role !== 'restaurant') return res.status(403).json({ msg: 'Unauthorized' });

    const { name, description, price, image, category, isAvailable = true } = req.body;

    if (!name || typeof name !== 'string') {
        return res.status(400).json({ msg: 'Name is required' });
    }

    if (typeof price !== 'number' || price < 0) {
        return res.status(400).json({ msg: 'A valid price is required' });
    }

    if (!category || typeof category !== 'string') {
        return res.status(400).json({ msg: 'Category is required' });
    }

    if (typeof isAvailable !== 'boolean') {
        return res.status(400).json({ msg: 'isAvailable must be a boolean value' });
    }

    try {
        const user = await User.findById(req.user.id);
        if (!user || !user.managedRestaurantId) {
            return res.status(400).json({ msg: 'User not associated with a restaurant' });
        }

        const newItem = new Menu({
            restaurantId: user.managedRestaurantId,
            name: name.trim(),
            description: description ? description.trim() : '',
            price,
            image,
            category: category.trim(),
            isAvailable
        });

        const item = await newItem.save();
        res.status(201).json(item);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
