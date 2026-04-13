const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const auth = require('../middleware/auth');

// @route   POST api/orders
// @desc    Place an order (Customer only)
router.post('/', auth, async (req, res) => {
    if (req.user.role !== 'customer') return res.status(403).json({ msg: 'Unauthorized' });

    const { restaurantId, items, totalAmount, paymentMethod } = req.body;

    if (!restaurantId || !Array.isArray(items) || items.length === 0 || !totalAmount) {
        return res.status(400).json({ msg: 'Invalid order payload' });
    }

    try {
        const newOrder = new Order({
            customerId: req.user.id,
            restaurantId,
            items,
            totalAmount,
            paymentMethod
        });

        const order = await newOrder.save();
        res.json(order);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/orders
// @desc    Get user orders (Filtered by role)
router.get('/', auth, async (req, res) => {
    try {
        let orders;
        if (req.user.role === 'customer') {
            orders = await Order.find({ customerId: req.user.id }).populate('restaurantId', 'name');
        } else if (req.user.role === 'restaurant') {
            orders = await Order.find({ restaurantId: req.user.id }).populate('customerId', 'name');
        } else if (req.user.role === 'delivery') {
            orders = await Order.find({ status: 'preparing' }).populate('restaurantId', 'name location');
        }
        res.json(orders);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/orders/active
// @desc    Get active orders (Not delivered)
router.get('/active', auth, async (req, res) => {
    try {
        let query = { status: { $ne: 'delivered' } };
        
        if (req.user.role === 'customer') {
            query.customerId = req.user.id;
        } else if (req.user.role === 'restaurant') {
            query.restaurantId = req.user.id;
        } else if (req.user.role === 'delivery') {
            // Delivery boy sees orders ready for pickup OR orders they have already accepted/picked up
            query = {
                $or: [
                    { status: 'ready' },
                    { deliveryId: req.user.id, status: { $in: ['assigned', 'picked'] } }
                ]
            };
        }

        const orders = await Order.find(query)
            .populate('restaurantId', 'name location')
            .populate('customerId', 'name')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/orders/history
// @desc    Get last 5 delivered orders
router.get('/history', auth, async (req, res) => {
    try {
        let query = { status: 'delivered' };
        if (req.user.role === 'customer') query.customerId = req.user.id;
        else if (req.user.role === 'restaurant') query.restaurantId = req.user.id;
        else if (req.user.role === 'delivery') query.deliveryId = req.user.id;

        const orders = await Order.find(query)
            .populate('restaurantId', 'name')
            .sort({ createdAt: -1 })
            .limit(5);
        res.json(orders);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/orders/:id
// @desc    Get order by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('restaurantId', 'name location')
            .populate('customerId', 'name location')
            .populate('deliveryId', 'name phone');
        
        if (!order) return res.status(404).json({ msg: 'Order not found' });
        
        // Ensure user is authorized to view this order
        if (req.user.role === 'customer' && order.customerId._id.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Unauthorized' });
        }
        
        res.json(order);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Order not found' });
        res.status(500).send('Server error');
    }
});

// @route   PUT api/orders/:id
// @desc    Update order status
router.put('/:id', auth, async (req, res) => {
    const { status, deliveryId } = req.body;

    try {
        let order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ msg: 'Order not found' });

        if (req.user.role === 'restaurant') {
            if (order.restaurantId.toString() !== req.user.id) {
                return res.status(403).json({ msg: 'Unauthorized' });
            }

            // Restaurant transitions: pending -> accepted -> preparing -> ready
            const allowedRestaurantStatuses = ['accepted', 'preparing', 'ready'];
            if (!status || !allowedRestaurantStatuses.includes(status)) {
                return res.status(400).json({ msg: 'Invalid restaurant status update' });
            }

            order.status = status;
        } else if (req.user.role === 'delivery') {
            // Delivery transitions: ready -> assigned -> picked -> delivered
            if (status === 'assigned') {
                if (order.status !== 'ready') {
                    return res.status(400).json({ msg: 'Order must be ready before assignment' });
                }
                if (order.deliveryId) {
                    return res.status(400).json({ msg: 'Order already assigned to another partner' });
                }
                order.deliveryId = req.user.id;
                order.status = 'assigned';
            } else if (status === 'picked') {
                if (order.status !== 'assigned') {
                    return res.status(400).json({ msg: 'Order must be assigned before pickup' });
                }
                if (order.deliveryId.toString() !== req.user.id) {
                    return res.status(403).json({ msg: 'Unauthorized' });
                }
                order.status = 'picked';
            } else if (status === 'delivered') {
                if (order.status !== 'picked') {
                    return res.status(400).json({ msg: 'Order must be picked up before delivery' });
                }
                if (order.deliveryId.toString() !== req.user.id) {
                    return res.status(403).json({ msg: 'Unauthorized' });
                }
                order.status = 'delivered';
            } else {
                return res.status(400).json({ msg: 'Invalid delivery status update' });
            }
        } else {
            return res.status(403).json({ msg: 'Unauthorized' });
        }

        await order.save();
        res.json(order);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
