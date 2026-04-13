import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthContext } from '../context/AuthContext';
import { View, ActivityIndicator, Text } from 'react-native';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import RestaurantDashboard from '../screens/restaurant/RestaurantDashboard';
import RestaurantHub from '../screens/restaurant/RestaurantHub';
import AddItemScreen from '../screens/restaurant/AddItemScreen';

const Stack = createStackNavigator();

const MIRCHI_RED = '#BC1010';

export default function RootNavigator() {
    const { user, loading } = useContext(AuthContext);

    console.log("DEBUG: RootNavigator rendering - loading:", loading, "user:", !!user);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
                <ActivityIndicator size="large" color={MIRCHI_RED} />
                <Text style={{ marginTop: 10, color: MIRCHI_RED, fontWeight: '700' }}>Starting Mirchi Admin...</Text>
            </View>
        );
    }

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
                        <Stack.Screen name="RestaurantMain" component={RestaurantDashboard} />
                        <Stack.Screen name="RestaurantHub" component={RestaurantHub} />
                        <Stack.Screen name="AddItem" component={AddItemScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
