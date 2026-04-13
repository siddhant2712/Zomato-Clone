import React, { useContext, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Linking,
    Platform,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import {
    MapPin,
    Navigation,
    CheckCircle2,
    LogOut,
    Flame,
    Package,
    User as UserIcon,
    Wallet,
} from 'lucide-react-native';
import axios from 'axios';
import ENV from '../../config/env';

const MIRCHI_RED = '#BC1010';
const MIRCHI_GREEN = '#00B14F';

export default function DeliveryDashboard({ navigation }) {
    const { logout, user, token } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const res = await axios.get(`${ENV.API_BASE}/api/orders/active`, {
                headers: { 'x-auth-token': token },
            });
            setOrders(res.data);
        } catch (err) {
            console.log('Delivery fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const timer = setInterval(fetchData, 8000);
        return () => clearInterval(timer);
    }, [token]);

    const openNavigation = (location) => {
        const address = location?.address || 'Mirchi Restaurant, Mumbai';
        const url = Platform.select({
            ios: `maps:0,0?q=${encodeURIComponent(address)}`,
            android: `geo:0,0?q=${encodeURIComponent(address)}`,
            default: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
        });
        Linking.openURL(url);
    };

    const updateStatus = async (orderId, newStatus) => {
        try {
            await axios.put(
                `${ENV.API_BASE}/api/orders/${orderId}`,
                { status: newStatus, deliveryId: user.id },
                { headers: { 'x-auth-token': token } }
            );
            Alert.alert('Status updated', `Order is now ${newStatus.replace(/_/g, ' ')}`);
            fetchData();
        } catch (err) {
            console.log('Delivery status error:', err);
            Alert.alert('Error', 'Failed to update status');
        }
    };

    const deliveredOrders = orders.filter((order) => order.status === 'delivered');
    const activeOrders = orders.filter((order) => order.status !== 'delivered');
    const earnings = (deliveredOrders.length * 40).toLocaleString();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                        <UserIcon color="#fff" size={24} />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Flame color="#fff" size={20} fill="#fff" />
                        <Text style={styles.headerText}>Mirchi Hero</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={logout}>
                    <LogOut size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.earningsCard}>
                    <View style={styles.earningsInfo}>
                        <Wallet color="#fff" size={24} />
                        <View style={styles.earningsText}>
                            <Text style={styles.earningsLabel}>Today's Earnings</Text>
                            <Text style={styles.earningsValue}>Rs. {earnings}</Text>
                        </View>
                    </View>
                    <View style={styles.statsDivider} />
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Deliveries</Text>
                        <Text style={styles.statValue}>{deliveredOrders.length}</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Active Deliveries</Text>

                {loading ? (
                    <ActivityIndicator color={MIRCHI_RED} size="large" style={{ marginTop: 50 }} />
                ) : activeOrders.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Package size={48} color="#CCC" />
                        <Text style={styles.emptyText}>No available orders right now</Text>
                    </View>
                ) : (
                    activeOrders.map((order) => (
                        <View key={order._id} style={styles.orderCard}>
                            <View style={styles.cardHeader}>
                                <View style={styles.statusBadge}>
                                    <View style={styles.statusDot} />
                                    <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
                                </View>
                                <Text style={styles.orderId}>#{order._id.slice(-6).toUpperCase()}</Text>
                            </View>

                            <View style={styles.locationContainer}>
                                <View style={styles.locationRow}>
                                    <MapPin size={18} color={MIRCHI_RED} />
                                    <View style={styles.locInfo}>
                                        <Text style={styles.locLabel}>From</Text>
                                        <Text style={styles.locText}>{order.restaurantId?.name || 'Restaurant'}</Text>
                                    </View>
                                </View>
                                <View style={styles.locationDivider} />
                                <View style={styles.locationRow}>
                                    <UserIcon size={18} color={MIRCHI_GREEN} />
                                    <View style={styles.locInfo}>
                                        <Text style={styles.locLabel}>To</Text>
                                        <Text style={styles.locText}>{order.customerId?.name || 'Customer'}</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.itemsSection}>
                                <Text style={styles.itemsTitle}>Items to Verify</Text>
                                {order.items.map((item, idx) => (
                                    <Text key={idx} style={styles.itemText}>
                                        • {item.quantity}x {item.name}
                                    </Text>
                                ))}
                            </View>

                            <View style={styles.cardActions}>
                                <TouchableOpacity
                                    style={styles.mapButton}
                                    onPress={() => openNavigation(order.restaurantId?.location)}
                                >
                                    <Navigation size={18} color={MIRCHI_RED} />
                                    <Text style={styles.mapButtonText}>Open Map</Text>
                                </TouchableOpacity>

                                {order.status === 'ready' ? (
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => updateStatus(order._id, 'assigned')}
                                    >
                                        <Text style={styles.actionButtonText}>Accept Delivery</Text>
                                    </TouchableOpacity>
                                ) : order.status === 'assigned' ? (
                                    <TouchableOpacity
                                        style={[styles.actionButton, { backgroundColor: '#333' }]}
                                        onPress={() => updateStatus(order._id, 'picked')}
                                    >
                                        <Text style={styles.actionButtonText}>Confirm Pick Up</Text>
                                    </TouchableOpacity>
                                ) : order.status === 'picked' ? (
                                    <TouchableOpacity
                                        style={[styles.actionButton, { backgroundColor: MIRCHI_GREEN }]}
                                        onPress={() => updateStatus(order._id, 'delivered')}
                                    >
                                        <CheckCircle2 color="#fff" size={18} />
                                        <Text style={[styles.actionButtonText, { marginLeft: 8 }]}>
                                            Mark as Delivered
                                        </Text>
                                    </TouchableOpacity>
                                ) : null}
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FCFCFC',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: MIRCHI_RED,
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: Platform.OS === 'ios' ? 10 : 40,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 12,
    },
    headerText: {
        fontSize: 20,
        fontWeight: '900',
        color: '#fff',
        marginLeft: 8,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    earningsCard: {
        backgroundColor: '#171717',
        marginTop: 20,
        padding: 24,
        borderRadius: 28,
        marginBottom: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
    },
    earningsInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    earningsText: {
        marginLeft: 12,
    },
    earningsLabel: {
        color: '#C7C7C7',
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    earningsValue: {
        color: MIRCHI_GREEN,
        fontSize: 32,
        fontWeight: '900',
        marginTop: 4,
    },
    statsDivider: {
        height: 1,
        backgroundColor: '#2E2E2E',
        marginVertical: 18,
    },
    statBox: {
        alignItems: 'center',
    },
    statLabel: {
        color: '#BDBDBD',
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 4,
    },
    statValue: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111',
        marginBottom: 15,
    },
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.04,
        shadowRadius: 15,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F4F4F4',
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
        backgroundColor: MIRCHI_GREEN,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#222',
    },
    orderId: {
        fontSize: 17,
        fontWeight: '900',
        color: '#111',
    },
    locationContainer: {
        backgroundColor: '#FAFAFA',
        borderRadius: 18,
        padding: 14,
        marginBottom: 25,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationDivider: {
        height: 1,
        backgroundColor: '#ECECEC',
        marginVertical: 12,
    },
    locInfo: {
        flex: 1,
        marginLeft: 12,
    },
    locLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#999',
    },
    locText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111',
        marginTop: 2,
    },
    itemsSection: {
        marginBottom: 18,
    },
    itemsTitle: {
        fontSize: 13,
        fontWeight: '800',
        color: '#444',
        marginBottom: 8,
    },
    itemText: {
        fontSize: 13,
        color: '#666',
        marginBottom: 4,
    },
    cardActions: {
        flexDirection: 'row',
    },
    mapButton: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 16,
        marginRight: 10,
    },
    mapButtonText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#111',
        marginLeft: 8,
    },
    actionButton: {
        flex: 2,
        backgroundColor: MIRCHI_RED,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 16,
    },
    actionButtonText: {
        color: '#fff',
        fontWeight: '800',
        fontSize: 14,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#111',
        marginTop: 15,
    },
});
