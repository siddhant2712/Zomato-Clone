const express = require('express');
const router = express.Router();
const Menu = require('../models/Menu');
const auth = require('../middleware/auth');

// @route   GET api/menu
// @desc    Get all menu items
router.get('/', async (req, res) => {
    try {
        const query = {};

        if (req.query.restaurantId) {
            query.restaurantId = req.query.restaurantId;
        }

        if (req.query.category) {
            query.category = { $regex: new RegExp(`^${req.query.category}$`, 'i') };
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

    const { name, description, price, image, category } = req.body;

    try {
        const newItem = new Menu({
            restaurantId: req.user.managedRestaurantId || req.user.id,
            name,
            description,
            price,
            image,
            category
        });

        const item = await newItem.save();
        res.json(item);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
