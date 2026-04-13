import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { User, Mail, Shield, LogOut, ChevronRight, Clock, Package } from 'lucide-react-native';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import ENV from '../../config/env';

import { SafeAreaView } from 'react-native-safe-area-context';
const MIRCHI_RED = '#BC1010';

export default function ProfileScreen({ navigation }) {
    const { user, token, logout } = useContext(AuthContext);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get(`${ENV.API_BASE}/api/orders/history`, {
                    headers: { 'x-auth-token': token }
                });
                setHistory(res.data);
            } catch (err) {
                console.log("Error fetching history:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: logout }
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Profile</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* User Info Card */}
                <View style={styles.userCard}>
                    <View style={styles.avatar}>
                        <User color="#fff" size={40} />
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{user?.name || 'User'}</Text>
                        <View style={styles.contactRow}>
                            <Mail size={14} color="#666" />
                            <Text style={styles.userEmail}>{user?.email || 'email@example.com'}</Text>
                        </View>
                        <View style={styles.roleBadge}>
                            <Shield size={12} color={MIRCHI_RED} />
                            <Text style={styles.roleText}>{user?.role?.toUpperCase() || 'CUSTOMER'}</Text>
                        </View>
                    </View>
                </View>

                {/* Account Settings */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                        <View style={[styles.menuIcon, { backgroundColor: '#FFEDED' }]}>
                            <LogOut size={20} color={MIRCHI_RED} />
                        </View>
                        <Text style={styles.menuText}>Logout</Text>
                        <ChevronRight size={20} color="#CCC" />
                    </TouchableOpacity>
                </View>

                {/* Order History */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Order History</Text>
                        <Clock size={18} color="#666" />
                    </View>
                    
                    {loading ? (
                        <ActivityIndicator color={MIRCHI_RED} style={{ margin: 20 }} />
                    ) : history.length === 0 ? (
                        <View style={styles.emptyHistory}>
                            <Package size={40} color="#ddd" />
                            <Text style={styles.emptyHistoryText}>No past orders yet</Text>
                        </View>
                    ) : (
                        history.map((order) => (
                            <TouchableOpacity 
                                key={order._id} 
                                style={styles.historyCard}
                                onPress={() => navigation.navigate('OrderDetails', { order })}
                            >
                                <View style={styles.historyLeft}>
                                    <View style={styles.historyIcon}>
                                        <Package size={20} color={MIRCHI_RED} />
                                    </View>
                                    <View>
                                        <Text style={styles.historyRestaurant}>{order.restaurantId?.name || 'Mirchi Restaurant'}</Text>
                                        <Text style={styles.historyDate}>{new Date(order.createdAt).toLocaleDateString()}</Text>
                                    </View>
                                </View>
                                <View style={styles.historyRight}>
                                    <Text style={styles.historyAmount}>₹{order.totalAmount}</Text>
                                    <ChevronRight size={16} color="#BBB" />
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: { padding: 20, backgroundColor: '#fff', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#EEE' },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#333' },
    content: { padding: 20 },
    userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 20, borderRadius: 20, marginBottom: 25 },
    avatar: { width: 70, height: 70, borderRadius: 35, backgroundColor: MIRCHI_RED, justifyContent: 'center', alignItems: 'center' },
    userInfo: { marginLeft: 20, flex: 1 },
    userName: { fontSize: 20, fontWeight: '700', color: '#333' },
    contactRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    userEmail: { fontSize: 13, color: '#666', marginLeft: 5 },
    roleBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 8, backgroundColor: '#FFEDED', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, alignSelf: 'flex-start' },
    roleText: { fontSize: 10, fontWeight: '700', color: MIRCHI_RED, marginLeft: 4 },
    section: { marginBottom: 30 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#333' },
    menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 15 },
    menuIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    menuText: { flex: 1, fontSize: 16, fontWeight: '600', color: '#333' },
    historyCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 10 },
    historyLeft: { flexDirection: 'row', alignItems: 'center' },
    historyIcon: { width: 35, height: 35, borderRadius: 8, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    historyRestaurant: { fontSize: 14, fontWeight: '600', color: '#333' },
    historyDate: { fontSize: 12, color: '#888', marginTop: 2 },
    historyRight: { flexDirection: 'row', alignItems: 'center' },
    historyAmount: { fontSize: 14, fontWeight: '700', color: '#333', marginRight: 5 },
    emptyHistory: { alignItems: 'center', padding: 40 },
    emptyHistoryText: { marginTop: 10, color: '#AAA' }
});
