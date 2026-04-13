const mongoose = require('mongoose');
const crypto = require('crypto');

function generateOrderId() {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `ORD-${datePart}-${randomPart}`;
}

const OrderItemSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: {
        type: [OrderItemSchema],
        required: true,
        validate: {
            validator: items => Array.isArray(items) && items.length > 0,
            message: 'Order must contain at least one item'
        }
    },
    totalPrice: { type: Number, required: true, min: 0 },
    address: { type: String, required: true, trim: true },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    orderStatus: {
        type: String,
        enum: ['pending', 'accepted', 'preparing', 'picked', 'delivered'],
        default: 'pending'
    }
}, {
    timestamps: true
});

OrderSchema.pre('validate', function() {
    if (!this.orderId) {
        this.orderId = generateOrderId();
    }
});

module.exports = mongoose.model('Order', OrderSchema);
