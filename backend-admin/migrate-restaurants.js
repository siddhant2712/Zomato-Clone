const mongoose = require('mongoose');
const User = require('./models/User');
const Restaurant = require('./models/Restaurant');
const Menu = require('./models/Menu');
require('dotenv').config();

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mirchi');
        console.log('Connected to MongoDB for migration...');

        const restaurantUsers = await User.find({ role: 'restaurant' });
        console.log(`Found ${restaurantUsers.length} restaurant users.`);

        for (const user of restaurantUsers) {
            if (!user.managedRestaurantId) {
                console.log(`Migrating user: ${user.name}`);
                
                // 1. Create Restaurant
                const newRestaurant = new Restaurant({
                    name: user.name + "'s Kitchen",
                    ownerId: user._id,
                    location: user.location
                });
                await newRestaurant.save();

                // 2. Link User
                user.managedRestaurantId = newRestaurant._id;
                await user.save();

                // 3. Update Menu Items
                const menuResult = await Menu.updateMany(
                    { restaurantId: user._id },
                    { $set: { restaurantId: newRestaurant._id } }
                );
                console.log(`- Updated ${menuResult.modifiedCount} menu items.`);

            } else {
                console.log(`User ${user.name} already has a managed restaurant.`);
            }
        }

        console.log('Migration complete!');
        process.exit(0);
    } catch (err) {
        console.error('Migration error:', err);
        process.exit(1);
    }
};

migrate();
