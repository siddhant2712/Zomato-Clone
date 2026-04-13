import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Linking, Platform } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { Truck, MapPin, Navigation, CheckCircle2, LogOut } from 'lucide-react-native';
import axios from 'axios';

export default function DeliveryDashboard() {
    const { logout, user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);

    const fetchOrders = async () => {
        try {
            const res = await axios.get('http://192.168.1.13:5000/api/orders');
            setOrders(res.data);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const openNavigation = (lat, lng) => {
        const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
        const latLng = `${lat},${lng}`;
        const label = 'Delivery Location';
        const url = Platform.select({
            ios: `${scheme}${label}@${latLng}`,
            android: `${scheme}${latLng}(${label})`
        });
        Linking.openURL(url);
    };

    const updateStatus = async (orderId, newStatus) => {
        try {
            await axios.put(`http://192.168.1.13:5000/api/orders/${orderId}`, { status: newStatus, deliveryId: user.id });
            fetchOrders();
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.brandTitle}>On The Road</Text>
                    <Text style={styles.roleText}>Delivery Partner</Text>
                </View>
                <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                    <LogOut size={20} color="#FF4B3A" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>Available for Pickup</Text>
                
                {orders.filter(o => o.status === 'out_for_delivery' || o.status === 'preparing').map((order) => (
                    <View key={order._id} style={styles.deliveryCard}>
                        <View style={styles.cardHeader}>
                            <Truck size={24} color="#FF4B3A" />
                            <Text style={styles.orderNumber}>Order #{order._id.slice(-6)}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <MapPin size={18} color="#666" />
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoLabel}>Restaurant</Text>
                                <Text style={styles.infoValue}>{order.restaurantId?.name || 'Local Kitchen'}</Text>
                            </View>
                        </View>

                        <View style={styles.detailsContainer}>
                            <Text style={styles.detailsLabel}>Delivery Address:</Text>
                            <Text style={styles.detailsValue}>{order.customerId?.name}'s Location</Text>
                        </View>

                        <View style={styles.buttonGroup}>
                            <TouchableOpacity 
                                style={styles.navButton}
                                onPress={() => openNavigation(40.7128, -74.0060)} // Dummy coords
                            >
                                <Navigation size={18} color="#fff" />
                                <Text style={styles.buttonText}>Navigate</Text>
                            </TouchableOpacity>

                            {order.status === 'out_for_delivery' ? (
                                <TouchableOpacity 
                                    style={styles.doneButton}
                                    onPress={() => updateStatus(order._id, 'delivered')}
                                >
                                    <CheckCircle2 size={18} color="#fff" />
                                    <Text style={styles.buttonText}>Delivered</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity 
                                    style={[styles.doneButton, { backgroundColor: '#111' }]}
                                    onPress={() => updateStatus(order._id, 'out_for_delivery')}
                                >
                                    <Text style={styles.buttonText}>Start Delivery</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                ))}

                {orders.length === 0 && (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Sit tight! No orders to deliver right now.</Text>
                    </View>
                )}
            </ScrollView>
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
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111',
        marginBottom: 15,
    },
    deliveryCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    orderNumber: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111',
        marginLeft: 10,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    infoTextContainer: {
        marginLeft: 12,
    },
    infoLabel: {
        fontSize: 12,
        color: '#999',
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    detailsContainer: {
        backgroundColor: '#F3F4F6',
        padding: 15,
        borderRadius: 15,
        marginBottom: 20,
    },
    detailsLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    detailsValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111',
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    navButton: {
        flex: 1,
        backgroundColor: '#111',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 14,
        marginRight: 10,
    },
    doneButton: {
        flex: 1,
        backgroundColor: '#FF4B3A',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 14,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 15,
        marginLeft: 8,
    },
    emptyContainer: {
        marginTop: 60,
        alignItems: 'center',
    },
    emptyText: {
        color: '#999',
        fontSize: 16,
    }
});
