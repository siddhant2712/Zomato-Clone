import React, { useContext, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
    Alert,
    Image,
} from 'react-native';
import { ChevronLeft, ShoppingBag, MapPin } from 'lucide-react-native';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import axios from 'axios';
import ENV from '../../config/env';

const MIRCHI_RED = '#BC1010';
const MIRCHI_GREEN = '#00B14F';

export default function CartScreen({ navigation }) {
    const { token } = useContext(AuthContext);
    const { cart, removeFromCart, addToCart, cartTotal, clearCart, restaurantId } =
        useContext(CartContext);
    const [loading, setLoading] = useState(false);

    const handlePlaceOrder = async () => {
        if (cart.length === 0 || !restaurantId) {
            Alert.alert('Order failed', 'Your cart is missing restaurant information.');
            return;
        }

        setLoading(true);
        try {
            await axios.post(
                `${ENV.API_BASE}/api/orders`,
                {
                    items: cart.map((item) => ({
                        menuId: item._id,
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                    totalAmount: cartTotal,
                    restaurantId,
                    paymentMethod: 'cod',
                },
                {
                    headers: { 'x-auth-token': token },
                }
            );

            Alert.alert('Order placed', 'Your Mirchi meal is being prepared.', [
                {
                    text: 'Track Order',
                    onPress: () => {
                        clearCart();
                        navigation.navigate('CustomerMain');
                    },
                },
            ]);
        } catch (err) {
            console.log('Place order error:', err);
            Alert.alert('Order failed', 'Something went wrong while placing your order.');
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

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.addressCard}>
                    <MapPin color={MIRCHI_RED} size={20} />
                    <View style={styles.addressInfo}>
                        <Text style={styles.addressLabel}>Delivering to</Text>
                        <Text style={styles.addressText}>Your Current Location, Mumbai</Text>
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
                    style={styles.orderButton}
                    onPress={handlePlaceOrder}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.orderButtonText}>Place Order • Rs. {cartTotal}</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#fff',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
    },
    clearText: {
        color: MIRCHI_RED,
        fontWeight: '600',
    },
    scrollContent: {
        padding: 20,
    },
    addressCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 15,
        marginBottom: 25,
    },
    addressInfo: {
        marginLeft: 15,
    },
    addressLabel: {
        fontSize: 12,
        color: '#888',
    },
    addressText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        marginBottom: 15,
    },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 15,
        marginBottom: 12,
    },
    itemImage: {
        width: 60,
        height: 60,
        borderRadius: 10,
    },
    itemInfo: {
        flex: 1,
        marginLeft: 15,
    },
    itemName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
    itemPrice: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F0F0',
        borderRadius: 20,
        padding: 5,
    },
    qtyBtn: {
        width: 25,
        height: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    qtyBtnText: {
        fontSize: 18,
        color: '#333',
        fontWeight: '700',
    },
    qtyText: {
        paddingHorizontal: 10,
        fontWeight: '700',
    },
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
    billLabel: {
        color: '#666',
    },
    billValue: {
        fontWeight: '600',
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingTop: 10,
        marginTop: 5,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '700',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '800',
        color: MIRCHI_RED,
    },
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
    orderButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
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
    browseButtonText: {
        color: '#fff',
        fontWeight: '700',
    },
});
