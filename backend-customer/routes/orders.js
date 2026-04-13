const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const Menu = require('../models/Menu');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   POST api/orders
// @desc    Place an order (Customer only)
router.post('/', auth, async (req, res) => {
    if (req.user.role !== 'customer') return res.status(403).json({ msg: 'Unauthorized' });

    const {
        restaurantId,
        items,
        paymentMethod,
        deliveryAddress,
        specialInstructions,
        customerPhone
    } = req.body;

    if (!restaurantId || !Array.isArray(items) || items.length === 0 || !deliveryAddress?.trim()) {
        return res.status(400).json({ msg: 'Invalid order payload' });
    }

    try {
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ msg: 'Restaurant not found' });
        }

        // Enforce ONE active order constraint
        const activeOrder = await Order.findOne({ 
            customerId: req.user.id, 
            status: { $nin: ['delivered', 'cancelled'] }
        });
        if (activeOrder) {
            return res.status(400).json({ msg: 'A customer can only order once at a time. Please wait for your active order to be delivered.' });
        }

        const sanitizedItems = items.map((item) => ({
            menuId: item.menuId,
            quantity: Number(item.quantity) || 0
        }));

        if (sanitizedItems.some((item) => !item.menuId || item.quantity <= 0)) {
            return res.status(400).json({ msg: 'Invalid order items' });
        }

        const menuDocs = await Menu.find({
            _id: { $in: sanitizedItems.map((item) => item.menuId) },
            restaurantId,
            isAvailable: true
        });

        if (menuDocs.length !== sanitizedItems.length) {
            return res.status(400).json({ msg: 'One or more items are unavailable' });
        }

        const menuMap = new Map(menuDocs.map((item) => [item.id, item]));
        const orderItems = sanitizedItems.map((item) => {
            const menuItem = menuMap.get(item.menuId.toString());
            return {
                menuId: menuItem.id,
                name: menuItem.name,
                quantity: item.quantity,
                price: menuItem.price
            };
        });

        const totalAmount = orderItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        const newOrder = new Order({
            customerId: req.user.id,
            restaurantId,
            items: orderItems,
            totalAmount,
            paymentMethod: paymentMethod === 'online' ? 'online' : 'cod',
            deliveryAddress: deliveryAddress.trim(),
            specialInstructions: typeof specialInstructions === 'string' ? specialInstructions.trim() : '',
            customerPhone: typeof customerPhone === 'string' ? customerPhone.trim() : ''
        });

        const order = await newOrder.save();
        const populatedOrder = await Order.findById(order.id)
            .populate('restaurantId', 'name location logo')
            .populate('customerId', 'name phone location');

        res.json(populatedOrder);
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
            orders = await Order.find({ customerId: req.user.id })
                .populate('restaurantId', 'name location logo')
                .sort({ createdAt: -1 });
        } else if (req.user.role === 'restaurant') {
            // Shared Admin Data: Fetch by managedRestaurantId
            const user = await User.findById(req.user.id);
            if (!user.managedRestaurantId) return res.status(400).json({ msg: 'User not associated with a restaurant' });
            orders = await Order.find({ restaurantId: user.managedRestaurantId })
                .populate('customerId', 'name phone')
                .sort({ createdAt: -1 });
        } else if (req.user.role === 'delivery') {
            orders = await Order.find({ status: 'preparing' })
                .populate('restaurantId', 'name location');
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
        let query = { status: { $nin: ['delivered', 'cancelled'] } };
        
        if (req.user.role === 'customer') {
            query.customerId = req.user.id;
        } else if (req.user.role === 'restaurant') {
            const user = await User.findById(req.user.id);
            if (!user.managedRestaurantId) return res.status(400).json({ msg: 'User not associated with a restaurant' });
            query.restaurantId = user.managedRestaurantId;
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
        let query = { status: { $in: ['delivered', 'cancelled'] } };
        if (req.user.role === 'customer') query.customerId = req.user.id;
        else if (req.user.role === 'restaurant') {
            const user = await User.findById(req.user.id);
            if (!user.managedRestaurantId) return res.status(400).json({ msg: 'User not associated with a restaurant' });
            query.restaurantId = user.managedRestaurantId;
        }
        else if (req.user.role === 'delivery') query.deliveryId = req.user.id;

        const orders = await Order.find(query)
            .populate('restaurantId', 'name location logo')
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
    const { status } = req.body;

    try {
        let order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ msg: 'Order not found' });

        if (req.user.role === 'restaurant') {
            const user = await User.findById(req.user.id);
            if (!user?.managedRestaurantId || order.restaurantId.toString() !== user.managedRestaurantId.toString()) {
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

// @route   PATCH api/orders/:id/cancel
// @desc    Cancel order as customer while restaurant has not prepared it yet
router.patch('/:id/cancel', auth, async (req, res) => {
    if (req.user.role !== 'customer') {
        return res.status(403).json({ msg: 'Unauthorized' });
    }

    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ msg: 'Order not found' });

        if (order.customerId.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Unauthorized' });
        }

        if (!['pending', 'accepted'].includes(order.status)) {
            return res.status(400).json({ msg: 'This order can no longer be cancelled.' });
        }

        order.status = 'cancelled';
        await order.save();

        res.json(order);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
