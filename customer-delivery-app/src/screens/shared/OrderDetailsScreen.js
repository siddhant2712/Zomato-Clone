import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { ChevronLeft, Package, MapPin, Clock, CheckCircle2, Truck, Flame, Bike, Phone } from 'lucide-react-native';
import axios from 'axios';
import ENV from '../../config/env';
import { AuthContext } from '../../context/AuthContext';

const MIRCHI_RED = '#BC1010';
const MIRCHI_GREEN = '#00B14F';

export default function OrderDetailsScreen({ route, navigation }) {
    const { token } = useContext(AuthContext);
    const [order, setOrder] = useState(route.params.order);
    const [loading, setLoading] = useState(false);

    const fetchOrderUpdate = async () => {
        try {
            const res = await axios.get(`${ENV.API_BASE}/api/orders/${order._id}`, {
                headers: { 'x-auth-token': token }
            });
            setOrder(res.data);
        } catch (err) {
            console.log('Update fetch error:', err);
        }
    };

    useEffect(() => {
        const timer = setInterval(fetchOrderUpdate, 5000);
        return () => clearInterval(timer);
    }, []);

    const getStatusInfo = (status) => {
        switch (status) {
            case 'pending':
                return { label: 'Awaiting Confirmation', color: '#FF9500', icon: Clock, sub: 'Restaurant will confirm shortly' };
            case 'accepted':
                return { label: 'Order Accepted', color: '#5856D6', icon: CheckCircle2, sub: 'Restaurant has seen your order' };
            case 'preparing':
                return { label: 'Preparing Your Meal', color: '#AF52DE', icon: Flame, sub: 'Our chef is working on it' };
            case 'ready':
                return { label: 'Food is Ready!', color: '#007AFF', icon: Package, sub: 'Waiting for delivery partner' };
            case 'assigned':
                return { label: 'Partner Assigned', color: '#007AFF', icon: Bike, sub: 'Rider is headed to restaurant' };
            case 'picked':
                return { label: 'Out for Delivery', color: MIRCHI_GREEN, icon: Bike, sub: 'Partner is on the way' };
            case 'delivered':
                return { label: 'Delivered', color: MIRCHI_GREEN, icon: CheckCircle2, sub: 'Enjoy your meal!' };
            default:
                return { label: status, color: '#888', icon: Package, sub: '' };
        }
    };

    const statusInfo = getStatusInfo(order.status);
    const StatusIcon = statusInfo.icon;

    // Helper for stepper
    const isStepReached = (statuses) => statuses.includes(order.status);
    const isStepPassed = (targetOrder) => {
        const flow = ['pending', 'accepted', 'preparing', 'ready', 'assigned', 'picked', 'delivered'];
        return flow.indexOf(order.status) >= flow.indexOf(targetOrder);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft color="#333" size={28} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Live Tracking</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                
                {/* Main Status Hero */}
                <View style={[styles.statusCard, { backgroundColor: `${statusInfo.color}15` }]}>
                    <StatusIcon color={statusInfo.color} size={40} />
                    <View style={styles.statusInfo}>
                        <Text style={[styles.statusLabel, { color: statusInfo.color }]}>
                            {statusInfo.label}
                        </Text>
                        <Text style={styles.statusSubText}>{statusInfo.sub}</Text>
                        <Text style={styles.orderId}>Order #{order._id.slice(-6).toUpperCase()}</Text>
                    </View>
                </View>

                {/* Vertical Stepper */}
                <View style={styles.trackingCard}>
                    <View style={styles.stepperContainer}>
                        
                        {/* Step 1: Confirmed */}
                        <View style={styles.stepRow}>
                            <View style={styles.stepLeft}>
                                <View style={[styles.stepDot, isStepPassed('accepted') && styles.stepDotActive]} />
                                <View style={[styles.stepLine, isStepPassed('preparing') && styles.stepLineActive]} />
                            </View>
                            <View style={styles.stepRight}>
                                <Text style={[styles.stepTitle, isStepPassed('accepted') && styles.stepTitleActive]}>Order Confirmed</Text>
                                <Text style={styles.stepTime}>Just now</Text>
                            </View>
                        </View>

                        {/* Step 2: Preparing */}
                        <View style={styles.stepRow}>
                            <View style={styles.stepLeft}>
                                <View style={[styles.stepDot, isStepPassed('preparing') && styles.stepDotActive]} />
                                <View style={[styles.stepLine, isStepPassed('ready') && styles.stepLineActive]} />
                            </View>
                            <View style={styles.stepRight}>
                                <Text style={[styles.stepTitle, isStepPassed('preparing') && styles.stepTitleActive]}>Preparing Food</Text>
                                <Text style={styles.stepSub}>Chef is cooking your meal</Text>
                            </View>
                        </View>

                        {/* Step 3: Ready */}
                        <View style={styles.stepRow}>
                            <View style={styles.stepLeft}>
                                <View style={[styles.stepDot, isStepPassed('ready') && styles.stepDotActive]} />
                                <View style={[styles.stepLine, isStepPassed('assigned') && styles.stepLineActive]} />
                            </View>
                            <View style={styles.stepRight}>
                                <Text style={[styles.stepTitle, isStepPassed('ready') && styles.stepTitleActive]}>Food is Ready</Text>
                                <Text style={styles.stepSub}>Waiting for delivery partner</Text>
                            </View>
                        </View>

                        {/* Step 4: Assigned */}
                        <View style={styles.stepRow}>
                            <View style={styles.stepLeft}>
                                <View style={[styles.stepDot, isStepPassed('assigned') && styles.stepDotActive]} />
                                <View style={[styles.stepLine, isStepPassed('picked') && styles.stepLineActive]} />
                            </View>
                            <View style={styles.stepRight}>
                                <Text style={[styles.stepTitle, isStepPassed('assigned') && styles.stepTitleActive]}>Partner Assigned</Text>
                                <Text style={styles.stepSub}>Rider is picking up your order</Text>
                            </View>
                        </View>

                        {/* Step 5: Picked Up */}
                        <View style={styles.stepRow}>
                            <View style={styles.stepLeft}>
                                <View style={[styles.stepDot, isStepPassed('picked') && styles.stepDotActive]} />
                                <View style={[styles.stepLine, isStepPassed('delivered') && styles.stepLineActive]} />
                            </View>
                            <View style={styles.stepRight}>
                                <Text style={[styles.stepTitle, isStepPassed('picked') && styles.stepTitleActive]}>Out for Delivery</Text>
                                <Text style={styles.stepSub}>Partner is headed to you</Text>
                            </View>
                        </View>

                        {/* Step 5: Delivered */}
                        <View style={styles.stepRow}>
                            <View style={styles.stepLeft}>
                                <View style={[styles.stepDot, isStepPassed('delivered') && styles.stepDotActive]} />
                            </View>
                            <View style={styles.stepRight}>
                                <Text style={[styles.stepTitle, isStepPassed('delivered') && styles.stepTitleActive]}>Delivered</Text>
                            </View>
                        </View>

                    </View>
                </View>

                {/* Driver Info Card - Shows only when picked */}
                {order.deliveryId && (
                    <View style={styles.driverCard}>
                        <View style={styles.driverPhotoCircle}>
                            <Bike size={24} color="#666" />
                        </View>
                        <View style={styles.driverDetails}>
                            <Text style={styles.driverName}>{order.deliveryId?.name || 'Mirchi Delivery Partner'}</Text>
                            <Text style={styles.driverRating}>Verified Partner ★ 4.8</Text>
                        </View>
                        <TouchableOpacity style={styles.callBtn}>
                            <Phone size={20} color={MIRCHI_GREEN} fill={MIRCHI_GREEN} />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Summary Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Items</Text>
                    {order.items.map((item, idx) => (
                        <View key={idx} style={styles.itemRow}>
                            <Text style={styles.itemQty}>{item.quantity}x</Text>
                            <Text style={styles.itemName}>{item.name}</Text>
                            <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
                        </View>
                    ))}
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Grand Total</Text>
                        <Text style={styles.totalValue}>₹{order.totalAmount}</Text>
                    </View>
                </View>

                <View style={[styles.section, { marginBottom: 40 }]}>
                    <Text style={styles.sectionTitle}>Delivery Location</Text>
                    <View style={styles.infoRow}>
                        <MapPin size={20} color="#666" />
                        <Text style={styles.infoText}>123 Mirchi Lane, Industrial Area, Ballia</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
    },
    backBtn: { 
        backgroundColor: '#F5F5F5',
        width: 40, height: 40, borderRadius: 20,
        alignItems: 'center', justifyContent: 'center'
    },
    headerTitle: { fontSize: 18, fontWeight: '800', color: '#111' },
    content: { padding: 15 },
    statusCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 25,
        borderRadius: 24,
        marginBottom: 20,
    },
    statusInfo: { marginLeft: 20 },
    statusLabel: { fontSize: 22, fontWeight: '900' },
    statusSubText: { fontSize: 13, color: '#555', marginTop: 2, fontWeight: '600' },
    orderId: { fontSize: 11, color: '#777', marginTop: 6, fontWeight: '700' },
    
    trackingCard: { 
        backgroundColor: '#FAFAFA', 
        padding: 25, 
        borderRadius: 24, 
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#F0F0F0'
    },
    stepperContainer: {
        marginLeft: 5,
    },
    stepRow: {
        flexDirection: 'row',
        minHeight: 60,
    },
    stepLeft: {
        alignItems: 'center',
        width: 30,
    },
    stepDot: {
        width: 14, height: 14, borderRadius: 7, 
        backgroundColor: '#DDD',
        borderWidth: 3, borderColor: '#FAFAFA'
    },
    stepDotActive: {
        backgroundColor: MIRCHI_GREEN,
    },
    stepLine: {
        width: 2, flex: 1, 
        backgroundColor: '#EEE',
        marginVertical: 4,
    },
    stepLineActive: {
        backgroundColor: MIRCHI_GREEN,
    },
    stepRight: {
        marginLeft: 15,
        paddingBottom: 25,
    },
    stepTitle: {
        fontSize: 15, fontWeight: '700', color: '#AAA'
    },
    stepTitleActive: {
        color: '#111'
    },
    stepTime: { fontSize: 12, color: '#AAA', marginTop: 2 },
    stepSub: { fontSize: 12, color: '#888', marginTop: 2 },

    driverCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111',
        padding: 15,
        borderRadius: 20,
        marginBottom: 20,
    },
    driverPhotoCircle: {
        width: 50, height: 50, borderRadius: 25, backgroundColor: '#FFF',
        alignItems: 'center', justifyContent: 'center'
    },
    driverDetails: {
        flex: 1, marginLeft: 15,
    },
    driverName: { color: '#FFF', fontSize: 16, fontWeight: '800' },
    driverRating: { color: '#AAA', fontSize: 11, marginTop: 2 },
    callBtn: {
        width: 45, height: 45, borderRadius: 22, backgroundColor: 'rgba(0, 177, 79, 0.15)',
        alignItems: 'center', justifyContent: 'center'
    },

    section: { marginBottom: 30, paddingHorizontal: 10 },
    sectionTitle: { fontSize: 17, fontWeight: '800', color: '#111', marginBottom: 15 },
    itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    itemQty: { color: MIRCHI_RED, fontWeight: '800', width: 30 },
    itemName: { flex: 1, color: '#444', fontWeight: '500' },
    itemPrice: { fontWeight: '700', color: '#111' },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#EEE',
    },
    totalLabel: { fontSize: 18, fontWeight: '800', color: '#111' },
    totalValue: { fontSize: 20, fontWeight: '900', color: MIRCHI_GREEN },
    infoRow: { flexDirection: 'row', alignItems: 'center' },
    infoText: { marginLeft: 15, color: '#666', flex: 1, fontSize: 14, fontWeight: '500' },
});
