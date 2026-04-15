const express = require('express');
const router = express.Router();
const Menu = require('../models/Menu');

function buildMenuQuery(queryParams) {
    const query = {};

    if (queryParams.restaurantId) {
        query.restaurantId = queryParams.restaurantId;
    }

    if (queryParams.availableOnly === 'true') {
        query.isAvailable = true;
    }

    if (queryParams.category) {
        query.category = queryParams.category;
    }

    if (queryParams.search) {
        query.$or = [
            { name: { $regex: queryParams.search, $options: 'i' } },
            { description: { $regex: queryParams.search, $options: 'i' } }
        ];
    }

    return query;
}

// @route   GET api/menu
// @desc    Get all menu items
router.get('/', async (req, res) => {
    try {
        const query = buildMenuQuery(req.query);

        const menu = await Menu.find(query).sort({ _id: -1 });
        res.json(menu);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/menu/browse
// @desc    Browse menu items for the customer app
router.get('/browse', async (req, res) => {
    try {
        const query = buildMenuQuery(req.query);
        const items = await Menu.find(query).sort({ category: 1, name: 1 });

        const categories = [...new Set(items.map(item => item.category).filter(Boolean))];
        const restaurantIds = [...new Set(items.map(item => item.restaurantId.toString()))];

        res.json({
            items,
            summary: {
                totalItems: items.length,
                categories,
                restaurantIds
            },
            filters: {
                restaurantId: req.query.restaurantId || null,
                category: req.query.category || null,
                search: req.query.search || null,
                availableOnly: req.query.availableOnly === 'true'
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
