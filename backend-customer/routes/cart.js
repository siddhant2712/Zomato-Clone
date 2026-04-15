const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const auth = require('../middleware/auth');

function calculateTotal(items) {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// @route   GET api/cart
// @desc    Get the logged-in customer's cart
router.get('/', auth, async (req, res) => {
    if (req.user.role !== 'customer') {
        return res.status(403).json({ msg: 'Unauthorized' });
    }

    try {
        const cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) {
            return res.json({ userId: req.user.id, items: [], totalPrice: 0 });
        }

        res.json(cart);
    } catch (err) {
        console.error('Fetch cart error:', err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   POST api/cart
// @desc    Add an item to the logged-in customer's cart
router.post('/', auth, async (req, res) => {
    if (req.user.role !== 'customer') {
        return res.status(403).json({ msg: 'Unauthorized' });
    }

    const { menuId, name, quantity, price } = req.body;

    if (!name || typeof name !== 'string') {
        return res.status(400).json({ msg: 'Item name is required' });
    }

    if (typeof quantity !== 'number' || quantity < 1) {
        return res.status(400).json({ msg: 'A valid quantity is required' });
    }

    if (typeof price !== 'number' || price < 0) {
        return res.status(400).json({ msg: 'A valid price is required' });
    }

    try {
        let cart = await Cart.findOne({ userId: req.user.id });

        if (!cart) {
            cart = new Cart({
                userId: req.user.id,
                items: [],
                totalPrice: 0
            });
        }

        const existingItemIndex = cart.items.findIndex(item =>
            item.menuId?.toString() === menuId || (!menuId && item.name === name)
        );

        if (existingItemIndex >= 0) {
            cart.items[existingItemIndex].quantity += quantity;
            cart.items[existingItemIndex].price = price;
            cart.items[existingItemIndex].name = name.trim();
            if (menuId) {
                cart.items[existingItemIndex].menuId = menuId;
            }
        } else {
            cart.items.push({
                menuId,
                name: name.trim(),
                quantity,
                price
            });
        }

        cart.totalPrice = calculateTotal(cart.items);
        await cart.save();

        res.status(201).json(cart);
    } catch (err) {
        console.error('Add to cart error:', err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   PATCH api/cart
// @desc    Update quantity of an existing cart item
router.patch('/', auth, async (req, res) => {
    if (req.user.role !== 'customer') {
        return res.status(403).json({ msg: 'Unauthorized' });
    }

    const { menuId, quantity } = req.body;

    if (!menuId) {
        return res.status(400).json({ msg: 'menuId is required' });
    }

    if (typeof quantity !== 'number' || quantity < 1) {
        return res.status(400).json({ msg: 'A valid quantity is required' });
    }

    try {
        const cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) {
            return res.status(404).json({ msg: 'Cart not found' });
        }

        const item = cart.items.find(cartItem => cartItem.menuId?.toString() === menuId);
        if (!item) {
            return res.status(404).json({ msg: 'Cart item not found' });
        }

        item.quantity = quantity;
        cart.totalPrice = calculateTotal(cart.items);
        await cart.save();

        res.json(cart);
    } catch (err) {
        console.error('Update cart error:', err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   DELETE api/cart/:menuId
// @desc    Remove an item from the logged-in customer's cart
router.delete('/:menuId', auth, async (req, res) => {
    if (req.user.role !== 'customer') {
        return res.status(403).json({ msg: 'Unauthorized' });
    }

    try {
        const cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) {
            return res.status(404).json({ msg: 'Cart not found' });
        }

        const nextItems = cart.items.filter(item => item.menuId?.toString() !== req.params.menuId);
        if (nextItems.length === cart.items.length) {
            return res.status(404).json({ msg: 'Cart item not found' });
        }

        cart.items = nextItems;
        cart.totalPrice = calculateTotal(cart.items);
        await cart.save();

        res.json(cart);
    } catch (err) {
        console.error('Remove cart item error:', err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
