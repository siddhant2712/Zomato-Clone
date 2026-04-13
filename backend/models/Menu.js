const mongoose = require('mongoose');

const MenuSchema = new mongoose.Schema({
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    image: { type: String },
    category: { type: String },
    isAvailable: { type: Boolean, default: true }
});

module.exports = mongoose.model('Menu', MenuSchema);
