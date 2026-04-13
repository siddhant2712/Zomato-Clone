import React, { useContext, useEffect, useState, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, ActivityIndicator, Dimensions, Platform, Animated, Vibration, Alert } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import { Search, ShoppingCart, MapPin, User, ChevronRight, Flame, Clock, Truck, ChevronDown, Star, CheckCircle, Package } from 'lucide-react-native';
import axios from 'axios';
import ENV from '../../config/env';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const MIRCHI_RED = '#BC1010';
const MIRCHI_GREEN = '#257E3E';
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1546113165-1ad943729fc3?w=400';

export default function CustomerDashboard({ navigation }) {
    const { user, token, refreshProfile } = useContext(AuthContext);
    const { addToCart, cartCount } = useContext(CartContext);
    const [menuItems, setMenuItems] = useState([]);
    const [recommendedItems, setRecommendedItems] = useState([]);
    const [activeOrders, setActiveOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusUpdateAlert, setStatusUpdateAlert] = useState({ visible: false, status: '' });
    const [cartToastVisible, setCartToastVisible] = useState(false);
    const [search, setSearch] = useState('');
    
    const prevOrderStatus = useRef(null);
    const slideAnim = useRef(new Animated.Value(100)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const cartBounceAnim = useRef(new Animated.Value(1)).current;
    const toastAnim = useRef(new Animated.Value(-100)).current;

    useEffect(() => {
        if (cartCount > 0) {
            Animated.sequence([
                Animated.timing(cartBounceAnim, { toValue: 1.3, duration: 150, useNativeDriver: true }),
                Animated.spring(cartBounceAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
            ]).start();
        }
    }, [cartCount]);

    useEffect(() => {
        if (activeOrders.length > 0) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.15, duration: 1200, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
                ])
            ).start();
        }
    }, [activeOrders]);

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
            
            if (menuRes.data.length > 0) {
                setRecommendedItems(menuRes.data.slice(0, 5));
            }

            const newActiveOrders = activeRes.data;
            setActiveOrders(newActiveOrders);
            const currentOrder = newActiveOrders[0];

            if (currentOrder && prevOrderStatus.current && currentOrder.status !== prevOrderStatus.current && !loading) {
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
        refreshProfile();
        fetchData();
        const timer = setInterval(fetchData, 8000);
        return () => clearInterval(timer);
    }, []);

    const handleQuickAdd = (item) => {
        Vibration.vibrate(50);
        const result = addToCart(item);
        if (result?.success === false) {
            Alert.alert('Selection Issue', result.msg);
        } else {
            // Show toast
            setCartToastVisible(true);
            Animated.sequence([
                Animated.timing(toastAnim, { toValue: 20, duration: 400, useNativeDriver: true }),
                Animated.delay(1500),
                Animated.timing(toastAnim, { toValue: -100, duration: 400, useNativeDriver: true }),
            ]).start(() => setCartToastVisible(false));
        }
    };

    const filteredItems = useMemo(() => {
        const query = search.trim().toLowerCase();
        return menuItems.filter(item => 
            !query || 
            item.name?.toLowerCase().includes(query) || 
            item.category?.toLowerCase().includes(query)
        );
    }, [menuItems, search]);

    const activeOrder = activeOrders[0];

    return (
        <SafeAreaView style={styles.container}>
            {/* Cart Success Toast */}
            {cartToastVisible && (
                <Animated.View style={[styles.cartToast, { transform: [{ translateY: toastAnim }] }]}>
                    <CheckCircle size={16} color="#fff" />
                    <Text style={styles.cartToastText}>Item added to cart</Text>
                </Animated.View>
            )}

            {/* Premium Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity style={styles.locationDropdown}>
                        <MapPin size={18} color={MIRCHI_RED} />
                        <Text style={styles.locationActiveText} numberOfLines={1}>
                            {user?.location?.address || 'Add your address'}
                        </Text>
                        <ChevronDown size={14} color="#666" />
                    </TouchableOpacity>
                    <Text style={styles.greetingText}>
                        {new Date().getHours() < 12 ? 'Good Morning' : 'Good Evening'}, {user?.name?.split(' ')[0] || 'Gourmet'} 👋
                    </Text>
                </View>

                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Cart')}>
                        <Animated.View style={{ transform: [{ scale: cartBounceAnim }] }}>
                            <ShoppingCart size={22} color="#333" fill={cartCount > 0 ? "#333" : "none"} />
                        </Animated.View>
                        {cartCount > 0 && <View style={styles.navBadge}><Text style={styles.navBadgeText}>{cartCount}</Text></View>}
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Profile')}>
                        <User size={22} color="#333" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Search Bar */}
                <View style={styles.searchBar}>
                    <Search color="#999" size={18} />
                    <TextInput 
                        placeholder="Search for 'Butter Paneer'..." 
                        value={search}
                        onChangeText={setSearch}
                        style={styles.searchInput}
                        placeholderTextColor="#999"
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch('')}>
                            <Text style={styles.clearSearchText}>✕</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {!search ? (
                    <>
                        {/* Categories */}
                        <View style={styles.sectionHeaderRow}>
                            <Text style={styles.sectionTitleMain}>What are you craving?</Text>
                        </View>
                        <ScrollView 
                            horizontal 
                            showsHorizontalScrollIndicator={false} 
                            contentContainerStyle={styles.categoriesSection}
                            snapToInterval={width * 0.22 + 10}
                            decelerationRate="fast"
                        >
                            {[
                                { name: 'Starters', image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=200' },
                                { name: 'Main Course', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200' },
                                { name: 'Combos', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200' },
                                { name: 'Beverages', image: 'https://images.unsplash.com/photo-1544145945-f904253d0c7b?w=200' }
                            ].map((cat, index) => (
                                <TouchableOpacity 
                                    key={index} 
                                    style={styles.categoryCard}
                                    onPress={() => navigation.navigate('MenuScreen', { category: cat.name })}
                                >
                                    <Image source={{ uri: cat.image }} style={styles.categoryImg} />
                                    <Text style={styles.categoryLabel}>{cat.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Recommended Section */}
                        {recommendedItems.length > 0 && (
                            <View style={styles.promoSection}>
                                <View style={styles.sectionHeaderRow}>
                                    <Text style={styles.sectionTitleMain}>Recommended for you</Text>
                                    <TouchableOpacity><Text style={styles.seeAllText}>See all</Text></TouchableOpacity>
                                </View>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalItemsScroll}>
                                    {recommendedItems.map((item) => (
                                        <TouchableOpacity 
                                            key={`rec-${item._id}`} 
                                            style={styles.recommendationCard}
                                            onPress={() => handleQuickAdd(item)}
                                        >
                                            <Image source={{ uri: item.image || FALLBACK_IMAGE }} style={styles.recImage} />
                                            <View style={styles.recBadge}><Star size={8} color="#fff" fill="#fff" /><Text style={styles.recBadgeText}>4.8</Text></View>
                                            <Text style={styles.recName} numberOfLines={1}>{item.name}</Text>
                                            <View style={styles.recMetaRow}>
                                                <Clock size={10} color="#888" />
                                                <Text style={styles.recTime}>15-20 min</Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}
                    </>
                ) : null}

                {/* Popular Grid / Search Results */}
                <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitleMain}>
                        {search ? `Results for "${search}"` : 'Popular Items'}
                    </Text>
                </View>

                {loading ? (
                    <View style={styles.skeletonContainer}>
                        <ActivityIndicator size="large" color={MIRCHI_RED} />
                    </View>
                ) : (
                    <View style={styles.popularItemsGrid}>
                        {filteredItems.map((item) => (
                            <View key={item._id} style={styles.premiumFoodCard}>
                                <TouchableOpacity activeOpacity={0.9} style={styles.cardTouchArea}>
                                    <Image 
                                        source={{ uri: item.image || FALLBACK_IMAGE }} 
                                        style={styles.foodCardImage} 
                                    />
                                    <View style={styles.ratingTag}>
                                        <Star size={10} color="#fff" fill="#fff" />
                                        <Text style={styles.ratingText}>4.5</Text>
                                    </View>
                                </TouchableOpacity>
                                
                                <View style={styles.foodCardBody}>
                                    <View style={styles.foodMainInfo}>
                                        <Text style={styles.foodName} numberOfLines={1}>{item.name}</Text>
                                        <Text style={styles.foodMeta}>PURE VEG • 20 MIN</Text>
                                    </View>
                                    
                                    <View style={styles.foodActionRow}>
                                        <Text style={styles.foodPrice}>Rs. {item.price}</Text>
                                        <TouchableOpacity 
                                            style={styles.pillAddBtn}
                                            onPress={() => handleQuickAdd(item)}
                                        >
                                            <Text style={styles.pillAddText}>ADD +</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
                
                <View style={{ height: 120 }} />
            </ScrollView>

            <View style={styles.tabBar}>
                <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('CustomerMain')}>
                    <Flame size={22} color={MIRCHI_RED} fill={MIRCHI_RED} />
                    <Text style={[styles.tabText, { color: MIRCHI_RED, fontWeight: '900' }]}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Orders')}>
                    <Clock size={22} color="#666" />
                    <Text style={styles.tabText}>Orders</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Cart')}>
                    <ShoppingCart size={22} color="#666" fill={cartCount > 0 ? "#666" : "none"} />
                    <Text style={styles.tabText}>Cart</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Profile')}>
                    <User size={22} color="#666" />
                    <Text style={styles.tabText}>Profile</Text>
                </TouchableOpacity>
            </View>

            {/* Floating Order Tracker */}
            {activeOrder && (
                <Animated.View style={styles.floatingTrackerContainer}>
                    <TouchableOpacity 
                        style={styles.floatingTrackerCard}
                        onPress={() => navigation.navigate('OrderDetails', { order: activeOrder })}
                        activeOpacity={0.9}
                    >
                        <View style={styles.trackerRow}>
                            <Animated.View style={[styles.statusIconCircle, { transform: [{ scale: pulseAnim }] }]}>
                                {['picked', 'delivered'].includes(activeOrder.status) ? (
                                    <Truck color="#fff" size={20} />
                                ) : activeOrder.status === 'ready' ? (
                                    <Package color="#fff" size={20} />
                                ) : (
                                    <Clock color="#fff" size={20} />
                                )}
                            </Animated.View>
                            <View style={styles.trackerTextInfo}>
                                <Text style={styles.trackerStatusTitle}>
                                    {activeOrder.status === 'preparing' ? 'Preparing your meal' :
                                     activeOrder.status === 'ready' ? 'Ready for Pickup' :
                                     activeOrder.status === 'picked' ? 'Out for Delivery' : 'Order Received'}
                                </Text>
                                <Text style={styles.trackerArrivalText}>Estimated arrival: 25-30 mins</Text>
                            </View>
                            <ChevronRight color={MIRCHI_RED} size={20} />
                        </View>
                        <View style={styles.progressContainer}>
                            <View style={styles.progressBaseBar}>
                                <View style={[styles.progressFillBar, { 
                                    width: activeOrder.status === 'pending' ? '15%' :
                                           activeOrder.status === 'accepted' ? '30%' :
                                           activeOrder.status === 'preparing' ? '60%' :
                                           activeOrder.status === 'ready' ? '85%' : '100%'
                                }]} />
                            </View>
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            )}

            {/* Status Update Alert */}
            {statusUpdateAlert.visible && (
                <Animated.View style={[styles.statusUpdatePopup, { transform: [{ translateY: slideAnim }] }]}>
                    <TouchableOpacity 
                        style={styles.popupContent} 
                        onPress={() => navigation.navigate('OrderDetails', { order: activeOrder })}
                    >
                        <View style={styles.popupIconCircle}>
                            {statusUpdateAlert.status === 'picked' ? (
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
                                {statusUpdateAlert.status === 'picked' ? 'Your meal is out for delivery!' :
                                 statusUpdateAlert.status === 'preparing' ? 'Restaurant is preparing your food.' :
                                 statusUpdateAlert.status === 'delivered' ? 'Your order was delivered.' : 'Status updated.'}
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
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 15,
        paddingTop: Platform.OS === 'ios' ? 10 : 40,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerLeft: { flex: 1 },
    locationDropdown: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
    locationActiveText: { fontSize: 14, fontWeight: '900', color: '#1A1A1A', marginHorizontal: 4, maxWidth: width * 0.4 },
    greetingText: { fontSize: 12, color: '#666', fontWeight: '600' },
    headerRight: { flexDirection: 'row', alignItems: 'center' },
    iconBtn: { marginLeft: 18, position: 'relative' },
    navBadge: { position: 'absolute', top: -6, right: -6, backgroundColor: MIRCHI_RED, width: 16, height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    navBadgeText: { color: '#fff', fontSize: 10, fontWeight: '900' },
    scrollContent: { paddingBottom: 20 },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        marginHorizontal: 15,
        marginTop: 20,
        paddingHorizontal: 15,
        height: 52,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#EAEAEA',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
    },
    searchInput: { flex: 1, marginLeft: 12, fontSize: 15, color: '#333' },
    clearSearchText: { fontSize: 18, color: '#999', paddingHorizontal: 5, fontWeight: '600' },
    sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 30, marginBottom: 15 },
    sectionTitleMain: { fontSize: 22, fontWeight: '900', color: '#111', letterSpacing: -0.5 },
    seeAllText: { color: MIRCHI_RED, fontWeight: '800', fontSize: 13 },
    categoriesSection: { paddingLeft: 15, paddingBottom: 10 },
    categoryCard: { width: width * 0.22, alignItems: 'center', marginRight: 10 },
    categoryImg: { width: width * 0.18, height: width * 0.18, borderRadius: width * 0.09, backgroundColor: '#fff', borderWidth: 1, borderColor: '#F0F0F0' },
    categoryLabel: { marginTop: 10, fontSize: 11, fontWeight: '800', color: '#333', textAlign: 'center' },
    promoSection: { marginTop: 10 },
    horizontalItemsScroll: { paddingLeft: 20, paddingBottom: 10 },
    recommendationCard: { width: 140, marginRight: 15 },
    recImage: { width: 140, height: 140, borderRadius: 16, backgroundColor: '#eee' },
    recBadge: { position: 'absolute', top: 10, right: 10, backgroundColor: '#257E3E', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 },
    recBadgeText: { color: '#fff', fontSize: 10, fontWeight: '900', marginLeft: 3 },
    recName: { fontSize: 15, fontWeight: '800', color: '#1A1A1A', marginTop: 8 },
    recMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    recTime: { fontSize: 11, color: '#888', fontWeight: '600', marginLeft: 4 },
    popularItemsGrid: { paddingHorizontal: 15 },
    premiumFoodCard: { backgroundColor: '#fff', borderRadius: 20, marginBottom: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.08, shadowRadius: 20, elevation: 4, overflow: 'hidden' },
    cardTouchArea: { position: 'relative' },
    foodCardImage: { width: '100%', height: 200 },
    ratingTag: { position: 'absolute', bottom: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.6)', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    ratingText: { color: '#fff', fontSize: 12, fontWeight: '900', marginLeft: 4 },
    foodCardBody: { padding: 15 },
    foodMainInfo: { marginBottom: 10 },
    foodName: { fontSize: 20, fontWeight: '900', color: '#1A1A1A' },
    foodMeta: { fontSize: 12, color: '#888', fontWeight: '700', marginTop: 4 },
    foodActionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 },
    foodPrice: { fontSize: 22, fontWeight: '900', color: '#111' },
    pillAddBtn: { backgroundColor: MIRCHI_RED, paddingHorizontal: 25, paddingVertical: 10, borderRadius: 12, shadowColor: MIRCHI_RED, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10 },
    pillAddText: { color: '#fff', fontSize: 14, fontWeight: '900' },
    tabBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingBottom: 20, paddingHorizontal: 10 },
    tabItem: { alignItems: 'center', width: width * 0.2 },
    tabText: { fontSize: 11, color: '#888', fontWeight: '700', marginTop: 4 },
    floatingTrackerContainer: { position: 'absolute', bottom: 95, left: 15, right: 15, zIndex: 100 },
    floatingTrackerCard: { backgroundColor: 'rgba(255, 255, 255, 0.98)', borderRadius: 20, padding: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 15, borderWidth: 1, borderColor: '#EAEAEA' },
    trackerRow: { flexDirection: 'row', alignItems: 'center' },
    statusIconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: MIRCHI_RED, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    trackerStatusTitle: { fontSize: 17, fontWeight: '900', color: '#1A1A1A' },
    trackerArrivalText: { fontSize: 12, color: '#666', marginTop: 2, fontWeight: '600' },
    progressContainer: { marginTop: 15 },
    progressBaseBar: { height: 8, backgroundColor: '#F0F0F0', borderRadius: 4, overflow: 'hidden' },
    progressFillBar: { height: '100%', backgroundColor: MIRCHI_GREEN, borderRadius: 4 },
    statusUpdatePopup: { position: 'absolute', bottom: 100, left: 20, right: 20, backgroundColor: '#fff', borderRadius: 16, padding: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 10, borderWidth: 1, borderColor: '#EEE' },
    popupContent: { flexDirection: 'row', alignItems: 'center' },
    popupIconCircle: { width: 45, height: 45, borderRadius: 25, backgroundColor: MIRCHI_GREEN, justifyContent: 'center', alignItems: 'center' },
    popupTextContainer: { marginLeft: 15 },
    popupTitle: { color: '#111', fontSize: 16, fontWeight: '800' },
    popupSub: { color: '#666', fontSize: 12, marginTop: 2 },
    skeletonContainer: { paddingVertical: 50, alignItems: 'center' },
    cartToast: {
        position: 'absolute',
        top: 60,
        left: '20%',
        right: '20%',
        backgroundColor: '#257E3E',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 25,
        zIndex: 1000,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 10,
    },
    cartToastText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '800',
        marginLeft: 8,
    }
});
