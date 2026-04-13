import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthContext } from '../context/AuthContext';
import { View, ActivityIndicator, Text } from 'react-native';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import CustomerDashboard from '../screens/customer/CustomerDashboard';
import MenuScreen from '../screens/customer/MenuScreen';
import CartScreen from '../screens/customer/CartScreen';
import DeliveryDashboard from '../screens/delivery/DeliveryDashboard';
import ProfileScreen from '../screens/shared/ProfileScreen';
import OrderDetailsScreen from '../screens/shared/OrderDetailsScreen';

const Stack = createStackNavigator();

const MIRCHI_RED = '#BC1010';

export default function RootNavigator() {
    const { user, loading } = useContext(AuthContext);

    console.log("DEBUG: RootNavigator rendering (Connect App) - loading:", loading, "user:", !!user);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
                <ActivityIndicator size="large" color={MIRCHI_RED} />
                <Text style={{ marginTop: 10, color: MIRCHI_RED, fontWeight: '700' }}>Starting Mirchi Connect...</Text>
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: '#fff' } }}>
                {!user ? (
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Signup" component={SignupScreen} />
                    </>
                ) : (
                    <>
                        {user.role === 'customer' ? (
                            <>
                                <Stack.Screen name="CustomerMain" component={CustomerDashboard} />
                                <Stack.Screen name="MenuScreen" component={MenuScreen} />
                                <Stack.Screen name="Cart" component={CartScreen} />
                            </>
                        ) : (
                            <>
                                <Stack.Screen name="DeliveryMain" component={DeliveryDashboard} />
                            </>
                        )}
                        {/* Shared Screens */}
                        <Stack.Screen name="Profile" component={ProfileScreen} />
                        <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
