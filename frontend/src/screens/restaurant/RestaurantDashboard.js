import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { Plus, Package, Clock, CheckCircle, LogOut } from 'lucide-react-native';
import axios from 'axios';

export default function RestaurantDashboard() {
    const { logout, user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const res = await axios.get('http://192.168.1.13:5000/api/orders');
            setOrders(res.data);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const updateStatus = async (orderId, newStatus) => {
        try {
            await axios.put(`http://192.168.1.13:5000/api/orders/${orderId}`, { status: newStatus });
            fetchOrders();
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.brandTitle}>Kitchen Hub</Text>
                    <Text style={styles.roleText}>Restaurant Panel</Text>
                </View>
                <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                    <LogOut size={20} color="#FF4B3A" />
                </TouchableOpacity>
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{orders.filter(o => o.status === 'pending').length}</Text>
                    <Text style={styles.statLabel}>Pending</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#FF4B3A' }]}>
                    <Text style={[styles.statNumber, { color: '#fff' }]}>{orders.filter(o => o.status === 'preparing').length}</Text>
                    <Text style={[styles.statLabel, { color: '#fff' }]}>In Prep</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{orders.filter(o => o.status === 'delivered').length}</Text>
                    <Text style={styles.statLabel}>Success</Text>
                </View>
            </View>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Orders</Text>
                <TouchableOpacity style={styles.addButton}>
                    <Plus size={20} color="#fff" />
                    <Text style={styles.addButtonText}>Add Item</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#FF4B3A" style={{ marginTop: 50 }} />
            ) : (
                <ScrollView contentContainerStyle={styles.orderList} showsVerticalScrollIndicator={false}>
                    {orders.map((order) => (
                        <View key={order._id} style={styles.orderCard}>
                            <View style={styles.orderCardHeader}>
                                <Text style={styles.orderId}>Order #{order._id.slice(-6)}</Text>
                                <View style={[styles.statusBadge, order.status === 'pending' && styles.pendingBadge]}>
                                    <Text style={[styles.statusText, order.status === 'pending' && styles.pendingText]}>
                                        {order.status.toUpperCase()}
                                    </Text>
                                </View>
                            </View>
                            
                            <Text style={styles.itemsLabel}>Items:</Text>
                            {order.items.map((item, idx) => (
                                <Text key={idx} style={styles.itemName}>• {item.name} x {item.quantity}</Text>
                            ))}

                            <View style={styles.orderFooter}>
                                <Text style={styles.totalAmount}>Total: ${order.totalAmount.toFixed(2)}</Text>
                                <View style={styles.actionButtons}>
                                    {order.status === 'pending' && (
                                        <TouchableOpacity 
                                            style={styles.actionButton}
                                            onPress={() => updateStatus(order._id, 'preparing')}
                                        >
                                            <Text style={styles.actionButtonText}>Accept</Text>
                                        </TouchableOpacity>
                                    )}
                                    {order.status === 'preparing' && (
                                        <TouchableOpacity 
                                            style={[styles.actionButton, { backgroundColor: '#111' }]}
                                            onPress={() => updateStatus(order._id, 'out_for_delivery')}
                                        >
                                            <Text style={styles.actionButtonText}>Ready</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        </View>
                    ))}
                    {orders.length === 0 && (
                        <Text style={styles.emptyText}>No orders yet. They'll show up here!</Text>
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FB',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        marginBottom: 20,
    },
    brandTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#111',
    },
    roleText: {
        fontSize: 14,
        color: '#FF4B3A',
        fontWeight: '600',
    },
    logoutButton: {
        padding: 10,
        backgroundColor: '#FFE8E5',
        borderRadius: 50,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    statCard: {
        backgroundColor: '#fff',
        width: '30%',
        padding: 15,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: '800',
        color: '#111',
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
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
        fontWeight: '700',
        color: '#111',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 12,
    },
    addButtonText: {
        color: '#fff',
        marginLeft: 6,
        fontWeight: '600',
    },
    orderList: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 3,
    },
    orderCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        paddingBottom: 10,
    },
    orderId: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
    },
    statusBadge: {
        backgroundColor: '#E5FFF2',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#00B14F',
    },
    pendingBadge: {
        backgroundColor: '#FFE8E5',
    },
    pendingText: {
        color: '#FF4B3A',
    },
    itemsLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 4,
    },
    itemName: {
        fontSize: 14,
        color: '#333',
        marginBottom: 2,
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 15,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111',
    },
    actionButtons: {
        flexDirection: 'row',
    },
    actionButton: {
        backgroundColor: '#FF4B3A',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 10,
    },
    actionButtonText: {
        color: '#fff',
        fontWeight: '700',
    },
    emptyText: {
        textAlign: 'center',
        color: '#999',
        marginTop: 40,
    }
});
