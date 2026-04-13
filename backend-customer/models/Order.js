const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    deliveryId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    customerPhone: { type: String },
    deliveryAddress: { type: String, required: true },
    specialInstructions: { type: String, default: '' },
    items: [
        {
            menuId: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu' },
            name: { type: String },
            quantity: { type: Number, default: 1 },
            price: { type: Number }
        }
    ],
    totalAmount: { type: Number, required: true },
    status: { 
        type: String, 
        enum: ['pending', 'accepted', 'preparing', 'ready', 'assigned', 'picked', 'delivered', 'cancelled'], 
        default: 'pending' 
    },
    paymentMethod: { type: String, enum: ['cod', 'online'], default: 'cod' },
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
