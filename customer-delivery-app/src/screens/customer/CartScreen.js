import React, { useContext, useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Image,
    TextInput,
    Vibration,
} from 'react-native';
import { ChevronLeft, ShoppingBag, MapPin } from 'lucide-react-native';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import ENV from '../../config/env';

const MIRCHI_RED = '#BC1010';
const MIRCHI_GREEN = '#00B14F';

export default function CartScreen({ navigation }) {
    const { token, user, updateProfile } = useContext(AuthContext);
    const { cart, removeFromCart, addToCart, cartTotal, clearCart, restaurantId } =
        useContext(CartContext);
    const [loading, setLoading] = useState(false);
    const [deliveryAddress, setDeliveryAddress] = useState(user?.location?.address || '');
    const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
    const [specialInstructions, setSpecialInstructions] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [hasActiveOrder, setHasActiveOrder] = useState(false);
    const [checkingOrder, setCheckingOrder] = useState(true);

    const checkActiveOrder = useCallback(async () => {
        if (!token) return;
        try {
            const res = await axios.get(`${ENV.API_BASE}/api/orders/active`, {
                headers: { 'x-auth-token': token }
            });
            setHasActiveOrder(res.data.length > 0);
        } catch (err) {
            console.log('Error checking active orders:', err.message);
        } finally {
            setCheckingOrder(false);
        }
    }, [token]);

    useFocusEffect(
        useCallback(() => {
            checkActiveOrder();
        }, [checkActiveOrder])
    );

    const handlePlaceOrder = async () => {
        if (cart.length === 0 || !restaurantId) {
            Alert.alert('Order failed', 'Your cart is missing restaurant information.');
            return;
        }

        if (!deliveryAddress.trim()) {
            Alert.alert('Address required', 'Please add your delivery address before ordering.');
            return;
        }

        setLoading(true);
        try {
            await updateProfile({
                phone: customerPhone,
                location: { address: deliveryAddress },
            });

            await axios.post(
                `${ENV.API_BASE}/api/orders`,
                {
                    items: cart.map((item) => ({
                        menuId: item._id,
                        quantity: item.quantity,
                    })),
                    restaurantId,
                    deliveryAddress,
                    paymentMethod,
                    specialInstructions,
                    customerPhone,
                },
                {
                    headers: { 'x-auth-token': token },
                }
            );

            Vibration.vibrate([0, 50, 50, 50]); // A small "double pop" feel
            
            Alert.alert('Order placed', 'Your Mirchi meal is being prepared.', [
                {
                    text: 'Track Order',
                    onPress: () => {
                        clearCart();
                        navigation.navigate('Orders');
                    },
                },
            ]);
        } catch (err) {
            console.log('Place order error:', err?.response?.data || err.message);
            Alert.alert(
                'Order failed',
                err.response?.data?.msg || 'Something went wrong while placing your order.'
            );
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <ChevronLeft color="#333" size={28} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>My Cart</Text>
                    <View style={{ width: 28 }} />
                </View>
                <View style={styles.emptyContainer}>
                    <ShoppingBag size={80} color="#ccc" />
                    <Text style={styles.emptyText}>Your cart is empty</Text>
                    <TouchableOpacity
                        style={styles.browseButton}
                        onPress={() => navigation.navigate('CustomerMain')}
                    >
                        <Text style={styles.browseButtonText}>Browse Menu</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ChevronLeft color="#333" size={28} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Cart</Text>
                <TouchableOpacity onPress={clearCart}>
                    <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
            </View>

            {hasActiveOrder && (
                <View style={styles.activeOrderNotice}>
                    <Text style={styles.activeOrderNoticeText}>
                        You have an active order. Please wait for it to be delivered before placing a new one.
                    </Text>
                </View>
            )}

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.addressCard}>
                    <MapPin color={MIRCHI_RED} size={20} />
                    <View style={styles.addressInfo}>
                        <Text style={styles.addressLabel}>Delivering to</Text>
                        <TextInput
                            value={deliveryAddress}
                            onChangeText={setDeliveryAddress}
                            placeholder="House no, street, landmark"
                            placeholderTextColor="#999"
                            style={styles.addressInput}
                            multiline
                        />
                    </View>
                </View>

                <View style={styles.formCard}>
                    <Text style={styles.inputLabel}>Phone Number</Text>
                    <TextInput
                        value={customerPhone}
                        onChangeText={setCustomerPhone}
                        placeholder="Enter contact number"
                        placeholderTextColor="#999"
                        keyboardType="phone-pad"
                        style={styles.input}
                    />
                    <Text style={styles.inputLabel}>Delivery Notes</Text>
                    <TextInput
                        value={specialInstructions}
                        onChangeText={setSpecialInstructions}
                        placeholder="Gate code, floor, or nearby landmark"
                        placeholderTextColor="#999"
                        style={[styles.input, styles.notesInput]}
                        multiline
                    />
                    <Text style={styles.inputLabel}>Payment Method</Text>
                    <View style={styles.paymentRow}>
                        {[
                            { key: 'cod', label: 'Cash on Delivery' },
                            { key: 'online', label: 'Pay Online' },
                        ].map((option) => (
                            <TouchableOpacity
                                key={option.key}
                                style={[
                                    styles.paymentChip,
                                    paymentMethod === option.key && styles.paymentChipActive,
                                ]}
                                onPress={() => setPaymentMethod(option.key)}
                            >
                                <Text
                                    style={[
                                        styles.paymentChipText,
                                        paymentMethod === option.key && styles.paymentChipTextActive,
                                    ]}
                                >
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Order Summary</Text>
                {cart.map((item) => (
                    <View key={item._id} style={styles.itemCard}>
                        <Image source={{ uri: item.image }} style={styles.itemImage} />
                        <View style={styles.itemInfo}>
                            <Text style={styles.itemName}>{item.name}</Text>
                            <Text style={styles.itemPrice}>Rs. {item.price}</Text>
                        </View>
                        <View style={styles.quantityContainer}>
                            <TouchableOpacity
                                style={styles.qtyBtn}
                                onPress={() => removeFromCart(item._id)}
                            >
                                <Text style={styles.qtyBtnText}>-</Text>
                            </TouchableOpacity>
                            <Text style={styles.qtyText}>{item.quantity}</Text>
                            <TouchableOpacity style={styles.qtyBtn} onPress={() => addToCart(item)}>
                                <Text style={styles.qtyBtnText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}

                <View style={styles.billCard}>
                    <View style={styles.billRow}>
                        <Text style={styles.billLabel}>Item Total</Text>
                        <Text style={styles.billValue}>Rs. {cartTotal}</Text>
                    </View>
                    <View style={styles.billRow}>
                        <Text style={styles.billLabel}>Delivery Fee</Text>
                        <Text style={[styles.billValue, { color: MIRCHI_GREEN }]}>FREE</Text>
                    </View>
                    <View style={[styles.billRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Amount to Pay</Text>
                        <Text style={styles.totalValue}>Rs. {cartTotal}</Text>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.orderButton, 
                        (loading || hasActiveOrder) && styles.orderButtonDisabled
                    ]}
                    onPress={handlePlaceOrder}
                    disabled={loading || hasActiveOrder}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.orderButtonText}>
                            {hasActiveOrder ? 'Order in Progress' : `Place Order - Rs. ${cartTotal}`}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#fff',
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
    clearText: { color: MIRCHI_RED, fontWeight: '600' },
    scrollContent: { padding: 20 },
    addressCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 15,
        marginBottom: 20,
    },
    addressInfo: { marginLeft: 15, flex: 1 },
    addressLabel: { fontSize: 12, color: '#888' },
    addressInput: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginTop: 4,
        minHeight: 48,
        textAlignVertical: 'top',
    },
    formCard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 15,
        marginBottom: 25,
    },
    inputLabel: { fontSize: 13, fontWeight: '700', color: '#444', marginBottom: 8 },
    input: {
        backgroundColor: '#F6F6F6',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 14,
        color: '#222',
        marginBottom: 14,
    },
    notesInput: { minHeight: 80, textAlignVertical: 'top' },
    paymentRow: { flexDirection: 'row', flexWrap: 'wrap' },
    paymentChip: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 22,
        paddingHorizontal: 14,
        paddingVertical: 10,
        marginRight: 10,
        marginBottom: 10,
    },
    paymentChipActive: { backgroundColor: '#FFEDED', borderColor: MIRCHI_RED },
    paymentChipText: { color: '#555', fontWeight: '600' },
    paymentChipTextActive: { color: MIRCHI_RED },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 15 },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 15,
        marginBottom: 12,
    },
    itemImage: { width: 60, height: 60, borderRadius: 10 },
    itemInfo: { flex: 1, marginLeft: 15 },
    itemName: { fontSize: 15, fontWeight: '600', color: '#333' },
    itemPrice: { fontSize: 14, color: '#666', marginTop: 2 },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F0F0',
        borderRadius: 20,
        padding: 5,
    },
    qtyBtn: { width: 25, height: 25, justifyContent: 'center', alignItems: 'center' },
    qtyBtnText: { fontSize: 18, color: '#333', fontWeight: '700' },
    qtyText: { paddingHorizontal: 10, fontWeight: '700' },
    billCard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 15,
        marginTop: 15,
        marginBottom: 30,
    },
    billRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    billLabel: { color: '#666' },
    billValue: { fontWeight: '600' },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingTop: 10,
        marginTop: 5,
    },
    totalLabel: { fontSize: 16, fontWeight: '700' },
    totalValue: { fontSize: 18, fontWeight: '800', color: MIRCHI_RED },
    footer: {
        backgroundColor: '#fff',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#EEE',
    },
    orderButton: {
        backgroundColor: MIRCHI_RED,
        paddingVertical: 18,
        borderRadius: 15,
        alignItems: 'center',
    },
    orderButtonDisabled: {
        backgroundColor: '#CCC',
    },
    orderButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    activeOrderNotice: {
        backgroundColor: '#FFFBEB',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#FEF3C7',
    },
    activeOrderNoticeText: {
        color: '#92400E',
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyText: {
        marginTop: 20,
        fontSize: 18,
        color: '#888',
        fontWeight: '600',
    },
    browseButton: {
        marginTop: 25,
        backgroundColor: MIRCHI_RED,
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
    },
    browseButtonText: { color: '#fff', fontWeight: '700' },
});
