import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [restaurantId, setRestaurantId] = useState(null);

    const addToCart = (item) => {
        if (!item?.restaurantId) {
            return {
                success: false,
                msg: 'This item is missing restaurant information.',
            };
        }

        if (restaurantId && restaurantId !== item.restaurantId) {
            return {
                success: false,
                msg: 'You can only order from one restaurant at a time.',
            };
        }

        setCart((prevCart) => {
            const existingItem = prevCart.find((i) => i._id === item._id);
            if (existingItem) {
                return prevCart.map((i) =>
                    i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [...prevCart, { ...item, quantity: 1 }];
        });

        if (!restaurantId) {
            setRestaurantId(item.restaurantId);
        }

        return { success: true };
    };

    const removeFromCart = (itemId) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find((i) => i._id === itemId);
            if (!existingItem) {
                return prevCart;
            }
            if (existingItem.quantity === 1) {
                const nextCart = prevCart.filter((i) => i._id !== itemId);
                if (nextCart.length === 0) {
                    setRestaurantId(null);
                }
                return nextCart;
            }
            return prevCart.map((i) =>
                i._id === itemId ? { ...i, quantity: i.quantity - 1 } : i
            );
        });
    };

    const clearCart = () => {
        setCart([]);
        setRestaurantId(null);
    };

    const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider value={{ 
            cart, 
            restaurantId,
            addToCart, 
            removeFromCart, 
            clearCart, 
            cartTotal, 
            cartCount 
        }}>
            {children}
        </CartContext.Provider>
    );
};
