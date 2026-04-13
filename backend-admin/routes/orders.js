const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const auth = require('../middleware/auth');

const PAYMENT_STATUSES = ['pending', 'paid', 'failed'];
const ORDER_STATUSES = ['pending', 'accepted', 'preparing', 'picked', 'delivered'];
const NEXT_ORDER_STATUS = {
    pending: 'accepted',
    accepted: 'preparing',
    preparing: 'picked',
    picked: 'delivered',
    delivered: null
};

// @route   POST api/orders
// @desc    Create a new order
router.post('/', auth, async (req, res) => {
    const {
        items,
        totalPrice,
        address,
        paymentStatus = 'pending',
        orderStatus = 'pending'
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ msg: 'Items are required' });
    }

    if (typeof totalPrice !== 'number' || totalPrice < 0) {
        return res.status(400).json({ msg: 'A valid total price is required' });
    }

    if (!address || typeof address !== 'string') {
        return res.status(400).json({ msg: 'Address is required' });
    }

    if (!PAYMENT_STATUSES.includes(paymentStatus)) {
        return res.status(400).json({ msg: 'Invalid payment status' });
    }

    if (!ORDER_STATUSES.includes(orderStatus)) {
        return res.status(400).json({ msg: 'Invalid order status' });
    }

    if (orderStatus !== 'pending') {
        return res.status(400).json({ msg: 'New orders must start with pending status' });
    }

    const normalizedItems = items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
    }));

    const hasInvalidItem = normalizedItems.some(item =>
        !item.name ||
        typeof item.quantity !== 'number' ||
        item.quantity < 1 ||
        typeof item.price !== 'number' ||
        item.price < 0
    );

    if (hasInvalidItem) {
        return res.status(400).json({ msg: 'Each item must include a valid name, quantity, and price' });
    }

    try {
        const order = await Order.create({
            userId: req.user.id,
            items: normalizedItems,
            totalPrice,
            address: address.trim(),
            paymentStatus,
            orderStatus
        });

        const populatedOrder = await Order.findById(order._id).populate('userId', 'name email role');
        res.status(201).json(populatedOrder);
    } catch (err) {
        console.error('Create order error:', err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   GET api/orders
// @desc    Get all orders for the logged-in user
router.get('/', auth, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .populate('userId', 'name email role');

        res.json(orders);
    } catch (err) {
        console.error('Fetch orders error:', err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   GET api/orders/:id
// @desc    Get a single order owned by the logged-in user
router.get('/:id', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('userId', 'name email role');

        if (!order) {
            return res.status(404).json({ msg: 'Order not found' });
        }

        if (order.userId._id.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Unauthorized' });
        }

        res.json(order);
    } catch (err) {
        console.error('Fetch order error:', err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   PATCH api/orders/:id/status
// @desc    Update payment status and advance order status for an owned order
router.patch('/:id/status', auth, async (req, res) => {
    const { paymentStatus, orderStatus } = req.body;

    if (!paymentStatus && !orderStatus) {
        return res.status(400).json({ msg: 'At least one status field is required' });
    }

    if (paymentStatus && !PAYMENT_STATUSES.includes(paymentStatus)) {
        return res.status(400).json({ msg: 'Invalid payment status' });
    }

    if (orderStatus && !ORDER_STATUSES.includes(orderStatus)) {
        return res.status(400).json({ msg: 'Invalid order status' });
    }

    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ msg: 'Order not found' });
        }

        if (order.userId.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Unauthorized' });
        }

        if (paymentStatus) {
            order.paymentStatus = paymentStatus;
        }

        if (orderStatus) {
            const nextStatus = NEXT_ORDER_STATUS[order.orderStatus];

            if (!nextStatus) {
                return res.status(400).json({ msg: 'Order is already delivered and cannot be updated further' });
            }

            if (orderStatus !== nextStatus) {
                return res.status(400).json({
                    msg: `Invalid order status transition. Expected next status: ${nextStatus}`
                });
            }

            order.orderStatus = orderStatus;
        }

        await order.save();

        const populatedOrder = await Order.findById(order._id).populate('userId', 'name email role');
        res.json(populatedOrder);
    } catch (err) {
        console.error('Update order status error:', err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
