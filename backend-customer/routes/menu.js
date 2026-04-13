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

module.exports = router;
