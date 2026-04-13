import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { ChevronLeft, ShoppingBag } from 'lucide-react-native';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import axios from 'axios';
import ENV from '../../config/env';

const MIRCHI_RED = '#BC1010';
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';

export default function MenuScreen({ route, navigation }) {
    const { category } = route.params || { category: 'Main Course' };
    const { token } = useContext(AuthContext);
    const { cart, addToCart, removeFromCart, cartTotal, cartCount } = useContext(CartContext);

    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const res = await axios.get(`${ENV.API_BASE}/api/menu`, {
                    headers: { 'x-auth-token': token },
                    params: { availableOnly: true },
                });
                setMenuItems(res.data);
            } catch (err) {
                console.log('Menu fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchMenu();
    }, [token]);

    const filteredItems = menuItems.filter(
        (item) => item.category === category && item.isAvailable !== false
    );

    const getQuantity = (itemId) => {
        const item = cart.find((cartItem) => cartItem._id === itemId);
        return item ? item.quantity : 0;
    };

    const handleAddToCart = (item) => {
        const result = addToCart(item);
        if (result?.success === false) {
            Alert.alert('Cart update failed', result.msg);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ChevronLeft color="#333" size={28} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{category}</Text>
                <TouchableOpacity style={styles.cartBtn} onPress={() => navigation.navigate('Cart')}>
                    <ShoppingBag color="#333" size={24} />
                    {cartCount > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{cartCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {loading ? (
                    <ActivityIndicator color={MIRCHI_RED} size="large" style={styles.loader} />
                ) : filteredItems.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No dishes available in this category yet.</Text>
                    </View>
                ) : (
                    filteredItems.map((item) => (
                        <View key={item._id} style={styles.itemCard}>
                            <Image
                                source={{ uri: item.image || FALLBACK_IMAGE }}
                                style={styles.itemImage}
                            />
                            <View style={styles.itemInfo}>
                                <Text style={styles.itemName}>{item.name}</Text>
                                <Text style={styles.itemDesc} numberOfLines={2}>
                                    {item.description || 'Freshly prepared and ready to order.'}
                                </Text>
                                <Text style={styles.itemPrice}>Rs. {item.price}</Text>
                            </View>
                            {getQuantity(item._id) > 0 ? (
                                <View style={styles.quantityContainer}>
                                    <TouchableOpacity
                                        style={styles.qtyBtn}
                                        onPress={() => removeFromCart(item._id)}
                                    >
                                        <Text style={styles.qtyText}>-</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.qtyNumber}>{getQuantity(item._id)}</Text>
                                    <TouchableOpacity
                                        style={styles.qtyBtn}
                                        onPress={() => handleAddToCart(item)}
                                    >
                                        <Text style={styles.qtyText}>+</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    style={styles.addBtn}
                                    onPress={() => handleAddToCart(item)}
                                >
                                    <Text style={styles.addBtnText}>ADD</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ))
                )}
            </ScrollView>

            {cartCount > 0 && (
                <TouchableOpacity
                    style={styles.floatingCart}
                    onPress={() => navigation.navigate('Cart')}
                >
                    <View>
                        <Text style={styles.floatQty}>{cartCount} Items</Text>
                        <Text style={styles.floatPrice}>Rs. {cartTotal}</Text>
                    </View>
                    <View style={styles.floatRight}>
                        <Text style={styles.floatText}>View Cart</Text>
                        <ShoppingBag color="#fff" size={20} />
                    </View>
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9F9F9' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#333' },
    cartBtn: { position: 'relative' },
    badge: {
        position: 'absolute',
        right: -6,
        top: -6,
        backgroundColor: MIRCHI_RED,
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
    scrollContent: { padding: 20, paddingBottom: 120 },
    loader: { marginTop: 50 },
    itemCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 15,
        marginBottom: 15,
        alignItems: 'center',
    },
    itemImage: { width: 90, height: 90, borderRadius: 15 },
    itemInfo: { flex: 1, marginLeft: 15, marginRight: 12 },
    itemName: { fontSize: 16, fontWeight: '700', color: '#333' },
    itemDesc: { fontSize: 12, color: '#888', marginTop: 4 },
    itemPrice: { fontSize: 16, fontWeight: '700', color: MIRCHI_RED, marginTop: 8 },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F0F0',
        borderRadius: 20,
        padding: 5,
    },
    qtyBtn: {
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    qtyText: { fontSize: 20, fontWeight: '700' },
    qtyNumber: { marginHorizontal: 10, fontWeight: '700' },
    addBtn: {
        backgroundColor: '#FFEDED',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: MIRCHI_RED,
    },
    addBtnText: { color: MIRCHI_RED, fontWeight: '700' },
    floatingCart: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
        backgroundColor: MIRCHI_RED,
        padding: 18,
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    floatQty: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
    floatPrice: { color: '#fff', fontSize: 16, fontWeight: '700' },
    floatRight: { flexDirection: 'row', alignItems: 'center' },
    floatText: { color: '#fff', fontWeight: '700', fontSize: 16, marginRight: 10 },
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { color: '#666', fontSize: 16 },
});
