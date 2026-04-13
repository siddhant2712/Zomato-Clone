import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Flat_List, ScrollView, Image, TouchableOpacity, TextInput, SafeAreaView } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { Search, ShoppingCart, User as UserIcon, LogOut } from 'lucide-react-native';
import axios from 'axios';

const categories = ['All', 'Pizza', 'Burger', 'Sushi', 'Drinks', 'Desserts'];

export default function CustomerDashboard() {
    const { logout, user } = useContext(AuthContext);
    const [menuItems, setMenuItems] = useState([]);
    const [activeCategory, setActiveCategory] = useState('All');

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const res = await axios.get('http://192.168.1.13:5000/api/menu');
                setMenuItems(res.data);
            } catch (err) {
                console.log(err);
            }
        };
        fetchMenu();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.topHeader}>
                <View>
                    <Text style={styles.welcomeText}>Hi, {user.name} 👋</Text>
                    <Text style={styles.locationText}>What are you eating today?</Text>
                </View>
                <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                    <LogOut size={20} color="#FF4B3A" />
                </TouchableOpacity>
            </View>

            <View style={styles.searchBar}>
                <Search size={20} color="#999" style={styles.searchIcon} />
                <TextInput placeholder="Search food..." style={styles.searchInput} />
            </View>

            <View style={styles.categoriesContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {categories.map((cat) => (
                        <TouchableOpacity 
                            key={cat} 
                            style={[styles.categoryPill, activeCategory === cat && styles.activeCategoryPill]}
                            onPress={() => setActiveCategory(cat)}
                        >
                            <Text style={[styles.categoryText, activeCategory === cat && styles.activeCategoryText]}>
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView contentContainerStyle={styles.menuContainer} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>Popular Dishes</Text>
                <View style={styles.grid}>
                    {menuItems.map((item) => (
                        <TouchableOpacity key={item._id} style={styles.foodCard}>
                            <View style={styles.foodImageContainer}>
                                <Image 
                                    source={{ uri: item.image || 'https://via.placeholder.com/150' }} 
                                    style={styles.foodImage} 
                                />
                                <TouchableOpacity style={styles.addIcon}>
                                    <Text style={styles.addIconText}>+</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.foodName}>{item.name}</Text>
                            <Text style={styles.foodPrice}>${item.price.toFixed(2)}</Text>
                        </TouchableOpacity>
                    ))}
                    {menuItems.length === 0 && (
                        <Text style={styles.emptyText}>No menu items found. Ask the restaurant to add some!</Text>
                    )}
                </View>
            </ScrollView>

            <View style={styles.floatingCart}>
                <TouchableOpacity style={styles.cartButton}>
                    <ShoppingCart size={24} color="#fff" />
                    <View style={styles.cartBadge}>
                        <Text style={styles.cartBadgeText}>0</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FB',
    },
    topHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    welcomeText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#666',
    },
    locationText: {
        fontSize: 24,
        fontWeight: '800',
        color: '#111',
    },
    logoutButton: {
        padding: 10,
        backgroundColor: '#FFE8E5',
        borderRadius: 50,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        margin: 20,
        paddingHorizontal: 15,
        height: 50,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    categoriesContainer: {
        paddingLeft: 20,
        marginBottom: 20,
    },
    categoryPill: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#E5E7EB',
        marginRight: 10,
    },
    activeCategoryPill: {
        backgroundColor: '#FF4B3A',
    },
    categoryText: {
        fontWeight: '600',
        color: '#333',
    },
    activeCategoryText: {
        color: '#fff',
    },
    menuContainer: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111',
        marginBottom: 15,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    foodCard: {
        backgroundColor: '#fff',
        width: '48%',
        borderRadius: 20,
        padding: 12,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 3,
    },
    foodImageContainer: {
        position: 'relative',
        marginBottom: 10,
    },
    foodImage: {
        width: '100%',
        height: 120,
        borderRadius: 15,
    },
    addIcon: {
        position: 'absolute',
        bottom: -5,
        right: -5,
        backgroundColor: '#FF4B3A',
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    addIconText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
    foodName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#333',
    },
    foodPrice: {
        fontSize: 16,
        color: '#FF4B3A',
        fontWeight: '800',
        marginTop: 4,
    },
    emptyText: {
        textAlign: 'center',
        color: '#999',
        marginTop: 20,
        width: '100%',
    },
    floatingCart: {
        position: 'absolute',
        bottom: 30,
        right: 30,
    },
    cartButton: {
        backgroundColor: '#111',
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    cartBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#FF4B3A',
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#111',
    },
    cartBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    }
});
