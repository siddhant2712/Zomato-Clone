import React, { useContext, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    TextInput,
} from 'react-native';
import { User, Mail, Shield, LogOut, ChevronRight, Package } from 'lucide-react-native';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import ENV from '../../config/env';

const MIRCHI_RED = '#BC1010';

export default function ProfileScreen({ navigation }) {
    const { user, token, logout, updateProfile, refreshProfile } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [address, setAddress] = useState(user?.location?.address || '');

    useEffect(() => {
        const load = async () => {
            await refreshProfile();
            try {
                await axios.get(`${ENV.API_BASE}/api/orders/history`, {
                    headers: { 'x-auth-token': token },
                });
            } catch (err) {
                console.log('Error fetching history:', err);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    useEffect(() => {
        setName(user?.name || '');
        setPhone(user?.phone || '');
        setAddress(user?.location?.address || '');
    }, [user]);

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: logout },
        ]);
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        const result = await updateProfile({
            name,
            phone,
            location: { address },
        });
        setSaving(false);

        if (!result.success) {
            Alert.alert('Save failed', result.msg);
            return;
        }

        Alert.alert('Profile updated', 'Your delivery details have been saved.');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Profile</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
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

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Delivery Details</Text>
                    <View style={styles.formCard}>
                        <Text style={styles.inputLabel}>Full Name</Text>
                        <TextInput value={name} onChangeText={setName} style={styles.input} />
                        <Text style={styles.inputLabel}>Phone Number</Text>
                        <TextInput
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            style={styles.input}
                        />
                        <Text style={styles.inputLabel}>Saved Address</Text>
                        <TextInput
                            value={address}
                            onChangeText={setAddress}
                            style={[styles.input, styles.addressInput]}
                            multiline
                        />
                        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile} disabled={saving}>
                            {saving ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.saveBtnText}>Save Details</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>My Activity</Text>
                    <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Orders')}>
                        <View style={[styles.menuIcon, { backgroundColor: '#E3F2FD' }]}>
                            <Package size={20} color="#1565C0" />
                        </View>
                        <Text style={styles.menuText}>Track My Orders</Text>
                        <ChevronRight size={20} color="#CCC" />
                    </TouchableOpacity>
                </View>

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

                {loading && <ActivityIndicator color={MIRCHI_RED} style={{ marginTop: 10 }} />}
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
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#333' },
    content: { padding: 20 },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 20,
        marginBottom: 25,
    },
    avatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: MIRCHI_RED,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userInfo: { marginLeft: 20, flex: 1 },
    userName: { fontSize: 20, fontWeight: '700', color: '#333' },
    contactRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    userEmail: { fontSize: 13, color: '#666', marginLeft: 5 },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        backgroundColor: '#FFEDED',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        alignSelf: 'flex-start',
    },
    roleText: { fontSize: 10, fontWeight: '700', color: MIRCHI_RED, marginLeft: 4 },
    section: { marginBottom: 30 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 15 },
    formCard: { backgroundColor: '#fff', padding: 16, borderRadius: 16 },
    inputLabel: { fontSize: 13, fontWeight: '700', color: '#444', marginBottom: 8 },
    input: {
        backgroundColor: '#F6F6F6',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 14,
        fontSize: 14,
        color: '#222',
    },
    addressInput: { minHeight: 80, textAlignVertical: 'top' },
    saveBtn: {
        backgroundColor: MIRCHI_RED,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    saveBtnText: { color: '#fff', fontWeight: '700' },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 15,
    },
    menuIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    menuText: { flex: 1, fontSize: 16, fontWeight: '600', color: '#333' },
});
