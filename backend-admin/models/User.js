const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['customer', 'restaurant', 'delivery'], default: 'customer' },
    location: {
        latitude: { type: Number },
        longitude: { type: Number },
        address: { type: String }
    },
    managedRestaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
    createdAt: { type: Date, default: Date.now }
});

// Mongoose 9 compatible pre-save hook (no next callback)
UserSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', UserSchema);
