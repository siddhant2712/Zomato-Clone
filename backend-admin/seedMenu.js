const mongoose = require('mongoose');
const Menu = require('./models/Menu');
const User = require('./models/User');
require('dotenv').config();

const items = [
    // Starters
    { name: "Veg Sandwich", price: 70, category: "Starters", description: "Fresh mixed vegetables layered in bread." },
    { name: "Paneer Sandwich", price: 80, category: "Starters", description: "Cottage cheese filling layered with veggies." },
    { name: "Veg Cutlet", price: 95, category: "Starters", description: "Crispy fried vegetable patties." },
    { name: "Chhole Bhature", price: 100, category: "Starters", description: "Classic North Indian spicy chickpea curry with fried bread." },
    { name: "Veg Pakoda (8 pcs)", price: 80, category: "Starters", description: "Assorted vegetables deep fried in seasoned chickpea batter." },
    { name: "Paneer 65", price: 130, category: "Starters", description: "Spicy, deep-fried paneer cubes native to South India." },
    { name: "Hara Bhara Kabab", price: 160, category: "Starters", description: "Healthy and delicious veg kababs made with spinach and peas." },
    { name: "Soya Chaap", price: 130, category: "Starters", description: "Tandoori style grilled soya chaap chunks." },
    { name: "Paneer Tikka Dry", price: 300, category: "Starters", description: "Cubes of marinated paneer grilled in a tandoor." },
    { name: "Veg Spring Roll", price: 145, category: "Starters", description: "Crispy rolls wrapped with seasoned vegetables." },
    
    // Main Course
    { name: "Mirchi Sp. Paneer", price: 320, category: "Main Course", description: "Our house special spicy paneer curry." },
    { name: "Mutter Paneer", price: 270, category: "Main Course", description: "Green peas and paneer in a rich tomato gravy." },
    { name: "Paneer Butter Masala", price: 280, category: "Main Course", description: "Rich and creamy tomato-based paneer gravy." },
    { name: "Palak Paneer", price: 250, category: "Main Course", description: "Paneer cubes submerged in heavily cooked spinach." },
    { name: "Mix Veg", price: 210, category: "Main Course", description: "Assortment of fresh seasonal vegetables in a semi-dry gravy." },
    { name: "Dal Makhani", price: 150, category: "Main Course", description: "Slow-cooked black lentils and kidney beans with butter and cream." },
    { name: "Jeera Rice", price: 120, category: "Main Course", description: "Basmati rice cooked with cumin seeds." },
    { name: "Veg Biryani", price: 170, category: "Main Course", description: "Layered basmati rice with mixed vegetables and aromatic spices." },
    { name: "Paneer Biryani", price: 200, category: "Main Course", description: "Flavorful mixed rice with spiced paneer blocks." },
    
    // Breads / Combos
    { name: "Butter Naan", price: 60, category: "Combos", description: "Soft tandoor baked bread brushed with butter." },
    { name: "Garlic Naan", price: 100, category: "Combos", description: "Naan infused with minced garlic and cilantro." },
    { name: "Lachha Paratha", price: 50, category: "Combos", description: "Multi-layered flaky flatbread." },
    { name: "Puri Bhaji Custom Meal", price: 120, category: "Combos", description: "Traditional puri served with potato curry (bhaji)." },
    
    // Beverages
    { name: "Mint Mojito", price: 130, category: "Beverages", description: "Refreshing mocktail with fresh mint and lemon." },
    { name: "Cold Coffee with Ice-Cream", price: 105, category: "Beverages", description: "Thick cold coffee topped with a scoop of vanilla ice cream." },
    { name: "Chocolate Shake", price: 160, category: "Beverages", description: "Rich and creamy chocolate milk shake." },
    { name: "Lassi", price: 48, category: "Beverages", description: "Traditional yogurt based cold drink." }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB!");

        // Assuming there is at least one restaurant user
        const restaurantUser = await User.findOne({ role: 'restaurant' });
        if (!restaurantUser) {
            console.log("No restaurant user found. Run the app and sign up as a restaurant first.");
            process.exit(1);
        }

        const restaurantId = restaurantUser._id;

        // Clear existing menu for this restaurant if needed, or simply append
        // Let's just append for safety, or clear it to avoid massive duplicates if run multiple times
        await Menu.deleteMany({ restaurantId });

        const mappedItems = items.map(item => ({
            ...item,
            restaurantId,
            image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400", // Default generic food image
            isAvailable: true
        }));

        await Menu.insertMany(mappedItems);
        console.log(`Successfully added ${mappedItems.length} items to the Mirchi menu for ${restaurantUser.name}!`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seed();
