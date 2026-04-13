const express = require('express');
const router = express.Router();
const Menu = require('../models/Menu');
const auth = require('../middleware/auth');

// @route   GET api/menu
// @desc    Get all menu items
router.get('/', async (req, res) => {
    try {
        const query = {};
        const sort = {};

        if (req.query.restaurantId) {
            query.restaurantId = req.query.restaurantId;
        }

        if (req.query.category) {
            query.category = { $regex: new RegExp(`^${req.query.category}$`, 'i') };
        }

        if (req.query.availableOnly === 'true') {
            query.isAvailable = true;
        }

        if (req.query.q) {
            const regex = new RegExp(req.query.q.trim(), 'i');
            query.$or = [
                { name: regex },
                { description: regex },
                { category: regex }
            ];
        }

        if (req.query.minPrice || req.query.maxPrice) {
            query.price = {};
            if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
            if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
        }

        if (req.query.sort === 'priceAsc') sort.price = 1;
        else if (req.query.sort === 'priceDesc') sort.price = -1;
        else sort._id = -1;

        console.log('Menu query:', query);
        const menu = await Menu.find(query)
            .populate('restaurantId', 'name location logo')
            .sort(sort);
        console.log(`Returning ${menu.length} menu items.`);
        res.json(menu);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
