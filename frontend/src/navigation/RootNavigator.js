import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthContext } from '../context/AuthContext';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';

// Dashboards
import CustomerDashboard from '../screens/customer/CustomerDashboard';
import RestaurantDashboard from '../screens/restaurant/RestaurantDashboard';
import DeliveryDashboard from '../screens/delivery/DeliveryDashboard';

const Stack = createStackNavigator();

export default function RootNavigator() {
    const { user, loading } = useContext(AuthContext);

    if (loading) return null; // Or a splash screen

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!user ? (
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Signup" component={SignupScreen} />
                    </>
                ) : (
                    <>
                        {user.role === 'customer' && (
                            <Stack.Screen name="CustomerHome" component={CustomerDashboard} />
                        )}
                        {user.role === 'restaurant' && (
                            <Stack.Screen name="RestaurantHome" component={RestaurantDashboard} />
                        )}
                        {user.role === 'delivery' && (
                            <Stack.Screen name="DeliveryHome" component={DeliveryDashboard} />
                        )}
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
