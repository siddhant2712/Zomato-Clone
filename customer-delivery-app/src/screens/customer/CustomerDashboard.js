import React, { useContext, useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, ActivityIndicator, Dimensions, Platform, Animated } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { Search, ShoppingCart, Menu as MenuIcon, MapPin, User, ChevronRight, Flame, Clock, Truck } from 'lucide-react-native';
import axios from 'axios';
import ENV from '../../config/env';

import { SafeAreaView } from 'react-native-safe-area-context';
const { width } = Dimensions.get('window');

const MIRCHI_RED = '#BC1010';
const MIRCHI_GREEN = '#00B14F';

export default function CustomerDashboard({ navigation }) {
    const { logout, user, token } = useContext(AuthContext);
    const [menuItems, setMenuItems] = useState([]);
    const [activeOrders, setActiveOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusUpdateAlert, setStatusUpdateAlert] = useState({ visible: false, status: '' });
    
    const prevOrderStatus = useRef(null);
    const slideAnim = useRef(new Animated.Value(100)).current;

    const triggerPopup = (newStatus) => {
        setStatusUpdateAlert({ visible: true, status: newStatus });
        Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            friction: 5
        }).start(() => {
            setTimeout(() => {
                Animated.timing(slideAnim, {
                    toValue: 100,
                    duration: 300,
                    useNativeDriver: true
                }).start(() => setStatusUpdateAlert(prev => ({ ...prev, visible: false })));
            }, 4000);
        });
    };

    const fetchData = async () => {
        try {
            const [menuRes, activeRes] = await Promise.all([
                axios.get(`${ENV.API_BASE}/api/menu`, { headers: { 'x-auth-token': token }, timeout: 10000 }),
                axios.get(`${ENV.API_BASE}/api/orders/active`, { headers: { 'x-auth-token': token }, timeout: 10000 })
            ]);
            setMenuItems(menuRes.data);
            
            const newActiveOrders = activeRes.data;
            setActiveOrders(newActiveOrders);
            const currentOrder = newActiveOrders[0];

            if (currentOrder && prevOrderStatus.current && currentOrder.status !== prevOrderStatus.current && !loading) {
                // Status changed!
                triggerPopup(currentOrder.status);
            }
            if (currentOrder) {
                prevOrderStatus.current = currentOrder.status;
            }
        } catch (err) {
            console.log("Fetch error details:", err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const timer = setInterval(fetchData, 8000); // Polling every 8s
        return () => clearInterval(timer);
    }, []);

    const activeOrder = activeOrders[0]; // Show the most recent active order

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                    <User size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Flame color="#fff" size={20} fill="#fff" />
                    <View>
                        <Text style={styles.headerText}>Mirchi</Text>
                        <Text style={styles.headerSubtext}>Pure Veg Delights</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
                    <ShoppingCart size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Active Order Banner */}
            {activeOrder && (
                <TouchableOpacity 
                    style={styles.activeOrderBanner}
                    onPress={() => navigation.navigate('OrderDetails', { order: activeOrder })}
                >
                    <View style={styles.activeOrderLeft}>
                        {['picked', 'delivered'].includes(activeOrder.status) ? (
                            <Truck color="#fff" size={20} />
                        ) : activeOrder.status === 'ready' ? (
                            <Package color="#fff" size={20} />
                        ) : (
                            <Clock color="#fff" size={20} />
                        )}
                        <View style={styles.activeOrderTextContainer}>
                            <Text style={styles.activeOrderTitle}>
                                {activeOrder.status === 'picked' ? 'Your Mirchi meal is on the way!' : 
                                 activeOrder.status === 'assigned' ? 'Rider is picking up your food.' :
                                 activeOrder.status === 'ready' ? 'Your food is ready & waiting.' :
                                 'Preparing your meal...'}
                            </Text>
                            <Text style={styles.activeOrderSub}>Order Status: {activeOrder.status.replace(/_/g, ' ').toUpperCase()}</Text>
                        </View>
                    </View>
                    <ChevronRight color="#fff" size={20} />
                </TouchableOpacity>
            )}

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* User Welcome Block */}
                <View style={styles.welcomeBlock}>
                    <View style={styles.welcomeInfo}>
                        <Text style={styles.welcomeTitle}>Hello, {user?.name?.split(' ')[0] || 'Gourmet'}!</Text>
                        <View style={styles.locationRow}>
                            <MapPin size={14} color={MIRCHI_RED} />
                            <Text style={styles.locationText}>Deliver to: Mirchi Lane, Mumbai</Text>
                        </View>
                    </View>
                </View>

                {/* Categories */}
                <Text style={[styles.sectionHeader, { marginTop: 20 }]}>What are you craving?</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesSection}>
                    {[
                        { name: 'Starters', image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=200' },
                        { name: 'Main Course', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200' },
                        { name: 'Combos', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200' },
                        { name: 'Beverages', image: 'https://images.unsplash.com/photo-1544145945-f904253d0c7b?w=200' }
                    ].map((cat, index) => (
                        <TouchableOpacity 
                            key={index} 
                            style={styles.categoryItem}
                            onPress={() => navigation.navigate('MenuScreen', { category: cat.name })}
                        >
                            <View style={styles.categoryCircle}>
                                <Image source={{ uri: cat.image }} style={styles.categoryImage} />
                            </View>
                            <Text style={styles.categoryName}>{cat.name}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Popular Items */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Popular Items</Text>
                    <TouchableOpacity style={styles.moreButton}>
                        <Text style={styles.moreText}>More</Text>
                        <ChevronRight size={16} color="#666" />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color={MIRCHI_RED} />
                ) : (
                    <View style={styles.popularGrid}>
                        {menuItems.map((item) => (
                            <TouchableOpacity key={item._id} style={styles.popularCard}>
                                <Image 
                                    source={{ uri: item.image || 'https://images.unsplash.com/photo-1546113165-1ad943729fc3?w=400' }} 
                                    style={styles.popularImage} 
                                />
                                <View style={styles.cardInfo}>
                                    <Text style={styles.popularName}>{item.name}</Text>
                                    <View style={styles.vegBadge}>
                                        <Text style={styles.vegText}>VEG</Text>
                                    </View>
                                    <Text style={styles.popularPrice}>₹{item.price}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
                
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Bottom Tab Simulation */}
            <View style={styles.tabBar}>
                <TouchableOpacity style={styles.tabItem}><User size={20} color={MIRCHI_RED} /><Text style={[styles.tabText, { color: MIRCHI_RED }]}>Home</Text></TouchableOpacity>
                <TouchableOpacity style={styles.tabItem}><MapPin size={20} color="#666" /><Text style={styles.tabText}>Offers</Text></TouchableOpacity>
                <TouchableOpacity style={styles.tabItem}><ShoppingCart size={20} color="#666" /><Text style={styles.tabText}>Cart</Text></TouchableOpacity>
                <TouchableOpacity style={styles.tabItem}><User size={20} color="#666" /><Text style={styles.tabText}>Profile</Text></TouchableOpacity>
            </View>

            {/* Bottom Floating Status Update Alert */}
            {statusUpdateAlert.visible && (
                <Animated.View style={[styles.statusUpdatePopup, { transform: [{ translateY: slideAnim }] }]}>
                    <TouchableOpacity 
                        style={styles.popupContent} 
                        onPress={() => navigation.navigate('OrderDetails', { order: activeOrder })}
                    >
                        <View style={styles.popupIconCircle}>
                            {statusUpdateAlert.status === 'out_for_delivery' ? (
                                <Truck color="#fff" size={24} />
                            ) : statusUpdateAlert.status === 'delivered' ? (
                                <CheckCircle color="#fff" size={24} />
                            ) : (
                                <Flame color="#fff" size={24} />
                            )}
                        </View>
                        <View style={styles.popupTextContainer}>
                            <Text style={styles.popupTitle}>Order Update!</Text>
                            <Text style={styles.popupSub}>
                                {statusUpdateAlert.status === 'out_for_delivery' 
                                    ? 'Your meal is out for delivery!' 
                                    : statusUpdateAlert.status === 'preparing'
                                    ? 'Restaurant is preparing your food.'
                                    : 'Your order was delivered.'}
                            </Text>
                        </View>
                        <ChevronRight color="#888" size={20} style={{ marginLeft: 'auto' }} />
                    </TouchableOpacity>
                </Animated.View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FCFCFC',
    },
    header: {
        backgroundColor: MIRCHI_RED,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: Platform.OS === 'ios' ? 10 : 40,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerTitleContainer: {
        alignItems: 'center',
    },
    headerText: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '900',
        letterSpacing: 1,
    },
    headerSubtext: {
        color: '#FFDE6D',
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    scrollContent: {
        paddingTop: 15,
    },
    welcomeBlock: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    welcomeInfo: {
        flex: 1,
    },
    welcomeTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#1A1A1A',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    locationText: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    heroImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: '#eee',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        marginHorizontal: 20,
        paddingHorizontal: 15,
        height: 50,
        borderRadius: 15,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 15,
    },
    categoriesSection: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 10,
        marginBottom: 30,
    },
    categoryItem: {
        alignItems: 'center',
    },
    categoryCircle: {
        width: 65,
        height: 65,
        borderRadius: 33,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#EEE',
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 5,
    },
    categoryImage: {
        width: '100%',
        height: '100%',
        borderRadius: 25,
    },
    categoryName: {
        marginTop: 8,
        fontSize: 11,
        color: '#333',
        fontWeight: '700',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#111',
    },
    moreButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    moreText: {
        fontSize: 13,
        color: '#666',
        fontWeight: '600',
    },
    popularGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 15,
        justifyContent: 'space-between',
    },
    popularCard: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    popularImage: {
        width: '100%',
        height: 120,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    cardInfo: {
        padding: 12,
    },
    popularName: {
        fontSize: 15,
        fontWeight: '800',
        color: '#111',
    },
    vegBadge: {
        borderWidth: 1,
        borderColor: MIRCHI_GREEN,
        paddingHorizontal: 4,
        paddingVertical: 1,
        width: 32,
        alignItems: 'center',
        marginTop: 4,
        marginBottom: 6,
    },
    vegText: {
        fontSize: 8,
        color: MIRCHI_GREEN,
        fontWeight: '900',
    },
    popularPrice: {
        fontSize: 16,
        fontWeight: '900',
        color: '#333',
    },
    tabBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 70,
        backgroundColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        paddingBottom: 15,
    },
    tabItem: {
        alignItems: 'center',
    },
    tabText: {
        fontSize: 10,
        color: '#666',
        fontWeight: '700',
        marginTop: 4,
    },
    statusUpdatePopup: {
        position: 'absolute',
        bottom: 80, // Above tab bar
        left: 20,
        right: 20,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 10,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    popupContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    popupIconCircle: {
        width: 45,
        height: 45,
        borderRadius: 25,
        backgroundColor: MIRCHI_GREEN,
        justifyContent: 'center',
        alignItems: 'center',
    },
    popupTextContainer: {
        marginLeft: 15,
    },
    popupTitle: {
        color: '#111',
        fontSize: 16,
        fontWeight: '800',
    },
    popupSub: {
        color: '#666',
        fontSize: 12,
        marginTop: 2,
    }
});
