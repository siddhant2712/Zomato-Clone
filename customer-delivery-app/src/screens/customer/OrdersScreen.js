import React, { useContext, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { Package, ChevronRight, Clock, CheckCircle } from 'lucide-react-native';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import ENV from '../../config/env';

const MIRCHI_RED = '#BC1010';

export default function OrdersScreen({ navigation }) {
    const { token } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchOrders = async () => {
        try {
            const res = await axios.get(`${ENV.API_BASE}/api/orders`, {
                headers: { 'x-auth-token': token },
            });
            setOrders(res.data);
        } catch (err) {
            console.log('Error fetching orders:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };

    const activeOrders = orders.filter((o) => !['delivered', 'cancelled'].includes(o.status));
    const pastOrders = orders.filter((o) => ['delivered', 'cancelled'].includes(o.status));

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return '#FFA500';
            case 'accepted':
            case 'preparing':
                return '#4169E1';
            case 'ready':
                return '#32CD32';
            case 'assigned':
            case 'picked':
                return '#9370DB';
            case 'delivered':
                return '#2E7D32';
            case 'cancelled':
                return '#B00020';
            default:
                return '#666';
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Orders</Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {loading ? (
                    <ActivityIndicator size="large" color={MIRCHI_RED} style={{ marginTop: 50 }} />
                ) : (
                    <>
                        {activeOrders.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Active Orders</Text>
                                {activeOrders.map((order) => (
                                    <TouchableOpacity
                                        key={order._id}
                                        style={styles.activeCard}
                                        onPress={() => navigation.navigate('OrderDetails', { order })}
                                    >
                                        <View style={styles.cardHeader}>
                                            <Package size={20} color={MIRCHI_RED} />
                                            <Text style={styles.restaurantName}>
                                                {order.restaurantId?.name || 'Mirchi Restaurant'}
                                            </Text>
                                            <View
                                                style={[
                                                    styles.statusBadge,
                                                    { backgroundColor: `${getStatusColor(order.status)}22` },
                                                ]}
                                            >
                                                <Text
                                                    style={[
                                                        styles.statusText,
                                                        { color: getStatusColor(order.status) },
                                                    ]}
                                                >
                                                    {order.status.toUpperCase()}
                                                </Text>
                                            </View>
                                        </View>
                                        <Text style={styles.itemSummary}>
                                            {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                                        </Text>
                                        <View style={styles.cardFooter}>
                                            <Text style={styles.amount}>Rs. {order.totalAmount}</Text>
                                            <View style={styles.trackContent}>
                                                <Text style={styles.trackText}>Track Order</Text>
                                                <ChevronRight size={16} color={MIRCHI_RED} />
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Order History</Text>
                            {pastOrders.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <Clock size={48} color="#ddd" />
                                    <Text style={styles.emptyText}>No past orders yet</Text>
                                </View>
                            ) : (
                                pastOrders.map((order) => (
                                    <TouchableOpacity
                                        key={order._id}
                                        style={styles.pastCard}
                                        onPress={() => navigation.navigate('OrderDetails', { order })}
                                    >
                                        <View style={styles.pastLeft}>
                                            <View style={styles.pastIconCircle}>
                                                <CheckCircle size={18} color="#888" />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.pastName} numberOfLines={1}>
                                                    {order.restaurantId?.name || 'Restaurant'}
                                                </Text>
                                                <Text style={styles.pastMeta}>
                                                    {new Date(order.createdAt).toLocaleDateString()} - Rs. {order.totalAmount}
                                                </Text>
                                            </View>
                                        </View>
                                        <ChevronRight size={20} color="#CCC" />
                                    </TouchableOpacity>
                                ))
                            )}
                        </View>
                        <View style={{ height: 100 }} />
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: {
        padding: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    headerTitle: { fontSize: 20, fontWeight: '900', color: '#1A1A1A' },
    scrollContent: { padding: 15, paddingBottom: 30 },
    section: { marginBottom: 25 },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: '#333', marginBottom: 15 },
    activeCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        marginBottom: 15,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    restaurantName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
        marginLeft: 10,
        flex: 1,
    },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    statusText: { fontSize: 10, fontWeight: '800' },
    itemSummary: { fontSize: 14, color: '#666', marginBottom: 15 },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingTop: 15,
    },
    amount: { fontSize: 16, fontWeight: '800', color: '#1A1A1A' },
    trackContent: { flexDirection: 'row', alignItems: 'center' },
    trackText: { fontSize: 14, fontWeight: '700', color: MIRCHI_RED, marginRight: 4 },
    pastCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 15,
        marginBottom: 10,
    },
    pastLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    pastIconCircle: {
        width: 35,
        height: 35,
        borderRadius: 18,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    pastName: { fontSize: 15, fontWeight: '600', color: '#333' },
    pastMeta: { fontSize: 12, color: '#888', marginTop: 2 },
    emptyState: { alignItems: 'center', marginTop: 30 },
    emptyText: { marginTop: 10, color: '#AAA', fontWeight: '600' },
});
