const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
    menuId: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu' },
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 }
}, { _id: false });

const CartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: {
        type: [CartItemSchema],
        default: []
    },
    totalPrice: { type: Number, default: 0, min: 0 }
}, {
    timestamps: true
});

module.exports = mongoose.model('Cart', CartSchema);
