import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, SafeAreaView, Platform } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { Bell, HelpCircle, Menu, ChevronRight, LayoutGrid, History, MessageCircle, AlertCircle, TrendingUp, DollarSign, Package, PieChart } from 'lucide-react-native';
import axios from 'axios';
import ENV from '../../config/env';

const { width } = Dimensions.get('window');

// Palette
const BLACK_BG = '#000000';
const CARD_BG = '#121212';
const TEXT_MUTED = '#999999';
const ACCENT_BLUE = '#0066FF';
const GREEN_LIVE = '#1DB954';

export default function RestaurantHub({ navigation }) {
    const { logout, user, token } = useContext(AuthContext);
    const [stats, setStats] = useState({ sales: 0, orders: 0 });
    const [chartData, setChartData] = useState([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
    const [loading, setLoading] = useState(true);

    const calculateAnalytics = (orders) => {
        // Today's Date start
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Filter today's orders
        const todayOrders = orders.filter(o => new Date(o.createdAt) >= today);
        
        const totalSales = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
        const totalCount = todayOrders.length;

        // Group by 2-hour slots for chart (12 slots for 24 hours)
        // Screenshot shows ~15 bars. Let's group by 1.5 hours or just by hour and show last 15.
        const hourlyBuckets = new Array(24).fill(0);
        todayOrders.forEach(o => {
            const hour = new Date(o.createdAt).getHours();
            hourlyBuckets[hour] += 1; // Count of orders
        });

        // Normalize heights for the bars (max h = 80 in styles)
        const maxVal = Math.max(...hourlyBuckets, 1);
        const normalizedBars = hourlyBuckets.slice(8, 23).map(val => (val / maxVal) * 80); // 8am to 10pm

        setStats({ sales: totalSales, orders: totalCount });
        setChartData(normalizedBars);
    };

    const fetchData = async () => {
        try {
            const res = await axios.get(`${ENV.API_BASE}/api/orders`, { 
                headers: { 'x-auth-token': token } 
            });
            calculateAnalytics(res.data);
        } catch (err) {
            console.log('Hub fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const timer = setInterval(fetchData, 10000);
        return () => clearInterval(timer);
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerLabel}>SHOWING DATA FOR</Text>
                    <Text style={styles.restaurantName}>Mirchi Restaurant</Text>
                </View>
                <View style={styles.headerIcons}>
                    <TouchableOpacity style={styles.iconBtn}><Bell size={24} color="#fff" /></TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn}><HelpCircle size={24} color="#fff" /></TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn} onPress={logout}><Menu size={24} color="#fff" /></TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollArea} showsVerticalScrollIndicator={false}>
                
                {/* Categorical Tabs */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
                    {['My Feed', 'Sales', 'Funnel', 'Service quality'].map((tab, i) => (
                        <TouchableOpacity key={i} style={[styles.tabPill, i === 0 && styles.tabPillActive]}>
                            <Text style={[styles.tabPillText, i === 0 && styles.tabPillTextActive]}>{tab}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Professional Photo Banner */}
                <View style={styles.promoBanner}>
                    <View style={styles.promoTextContainer}>
                        <Text style={styles.promoTitle}>Professional photos in seconds</Text>
                        <Text style={styles.promoSub}>Click a photo of a prepared dish and enhance while you add it to menu</Text>
                        <TouchableOpacity style={styles.promoBtn}>
                            <TrendingUp size={16} color="#fff" style={{marginRight: 6}} />
                            <Text style={styles.promoBtnText}>Learn more</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.promoImageContainer}>
                        <Image 
                            source={{ uri: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&auto=format&fit=crop' }} 
                            style={styles.promoImg} 
                        />
                        <View style={styles.promoTimeTag}>
                            <Text style={styles.promoTimeText}>Just 30 seconds</Text>
                        </View>
                    </View>
                </View>

                {/* Dashboard Stats */}
                <View style={styles.statsHeader}>
                    <Text style={styles.sectionTitle}>Today so far</Text>
                </View>

                <View style={styles.statsCard}>
                    <View style={styles.statsRow}>
                        <View style={styles.statBox}>
                            <Text style={styles.statLabel}>Total sales</Text>
                            <Text style={styles.statValue}>₹{stats.sales.toLocaleString()}</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={styles.statLabel}>Total orders</Text>
                            <Text style={styles.statValue}>{stats.orders}</Text>
                        </View>
                        <View style={styles.liveBadge}>
                            <View style={styles.liveDot} />
                            <Text style={styles.liveText}>Live</Text>
                        </View>
                    </View>

                    {/* Custom Bar Chart */}
                    <View style={styles.chartContainer}>
                        <View style={styles.barsArea}>
                            {chartData.map((h, i) => (
                                <View key={i} style={styles.barWrapper}>
                                    <View style={[styles.bar, { height: h, backgroundColor: i === chartData.length - 1 ? ACCENT_BLUE : '#444' }]} />
                                </View>
                            ))}
                        </View>
                        <View style={styles.xAxis}>
                            <Text style={styles.xLabel}>12am</Text>
                            <Text style={styles.xLabel}>4am</Text>
                            <Text style={styles.xLabel}>8am</Text>
                            <Text style={styles.xLabel}>12pm</Text>
                            <Text style={styles.xLabel}>4pm</Text>
                            <Text style={styles.xLabel}>8pm</Text>
                        </View>
                    </View>
                </View>

                {/* Quick Links */}
                <Text style={styles.sectionTitle}>Quick links</Text>
                <View style={styles.linksGrid}>
                    <TouchableOpacity style={styles.linkCard}>
                        <View style={styles.linkIconBox}><Package size={28} color="#fff" /></View>
                        <Text style={styles.linkText}>Zomato manager</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.linkCard}>
                        <View style={styles.linkIconBox}><History size={28} color="#fff" /></View>
                        <Text style={styles.linkText}>Order history</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.linkCard}>
                        <View style={styles.linkIconBox}><MessageCircle size={28} color="#fff" /></View>
                        <Text style={styles.linkText}>Chat with us</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.linkCard}>
                        <View style={styles.linkIconBox}><AlertCircle size={28} color="#fff" /></View>
                        <Text style={styles.linkText}>Complaints</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Custom Bottom Nav */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('RestaurantMain')}>
                    <TrendingUp size={22} color={TEXT_MUTED} />
                    <Text style={styles.navText}>To Orders</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <View style={styles.activeNavHighlight}>
                        <PieChart size={22} color="#fff" />
                    </View>
                    <Text style={styles.navTextActive}>Hub</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <TrendingUp size={22} color={TEXT_MUTED} />
                    <Text style={styles.navText}>Growth</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('AddItem')}>
                    <LayoutGrid size={22} color={TEXT_MUTED} />
                    <Text style={styles.navText}>Menu</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <DollarSign size={22} color={TEXT_MUTED} />
                    <Text style={styles.navText}>Finance</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BLACK_BG,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 10 : 20,
        paddingBottom: 20,
    },
    headerLabel: {
        color: TEXT_MUTED,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
    },
    restaurantName: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '800',
        marginTop: 4,
    },
    headerIcons: {
        flexDirection: 'row',
    },
    iconBtn: {
        marginLeft: 20,
    },
    scrollArea: {
        paddingHorizontal: 15,
    },
    tabsContainer: {
        flexDirection: 'row',
        marginBottom: 25,
    },
    tabPill: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
        backgroundColor: '#222',
        marginRight: 10,
    },
    tabPillActive: {
        backgroundColor: '#fff',
    },
    tabPillText: {
        color: '#ccc',
        fontSize: 14,
        fontWeight: '700',
    },
    tabPillTextActive: {
        color: '#000',
    },
    promoBanner: {
        backgroundColor: '#002C66',
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        marginBottom: 30,
        overflow: 'hidden',
    },
    promoTextContainer: {
        flex: 1,
        zIndex: 2,
    },
    promoTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 8,
    },
    promoSub: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        lineHeight: 18,
        marginBottom: 15,
    },
    promoBtn: {
        backgroundColor: ACCENT_BLUE,
        alignSelf: 'flex-start',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    promoBtnText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '700',
    },
    promoImageContainer: {
        width: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    promoImg: {
        width: 80,
        height: 80,
        borderRadius: 15,
        transform: [{ rotate: '15deg' }],
    },
    promoTimeTag: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 5,
        position: 'absolute',
        top: 0,
        right: 0,
    },
    promoTimeText: {
        color: '#fff',
        fontSize: 8,
        fontWeight: '700',
    },
    statsHeader: {
        marginBottom: 15,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 15,
    },
    statsCard: {
        backgroundColor: '#1A1A1A',
        borderRadius: 24,
        padding: 24,
        marginBottom: 30,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 30,
    },
    statBox: {
        marginRight: 40,
    },
    statLabel: {
        color: TEXT_MUTED,
        fontSize: 12,
        fontWeight: '600',
    },
    statValue: {
        color: '#fff',
        fontSize: 26,
        fontWeight: '800',
        marginTop: 6,
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(29, 185, 84, 0.15)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        marginLeft: 'auto',
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: GREEN_LIVE,
        marginRight: 6,
    },
    liveText: {
        color: GREEN_LIVE,
        fontSize: 12,
        fontWeight: '700',
    },
    chartContainer: {
        marginTop: 10,
    },
    barsArea: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: 100,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        paddingBottom: 4,
    },
    barWrapper: {
        flex: 1,
        alignItems: 'center',
    },
    bar: {
        width: 8,
        borderRadius: 2,
    },
    xAxis: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    xLabel: {
        color: '#555',
        fontSize: 10,
        fontWeight: '600',
    },
    linksGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    linkCard: {
        backgroundColor: '#1A1A1A',
        width: '48%',
        aspectRatio: 1,
        borderRadius: 24,
        padding: 20,
        marginBottom: 15,
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    linkIconBox: {
        width: 50,
        height: 50,
        borderRadius: 15,
        backgroundColor: '#2A2A2A',
        alignItems: 'center',
        justifyContent: 'center',
    },
    linkText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
        lineHeight: 20,
    },
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 90,
        backgroundColor: '#121212',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingBottom: 25,
        borderTopWidth: 1,
        borderTopColor: '#222',
    },
    navItem: {
        alignItems: 'center',
        flex: 1,
    },
    activeNavHighlight: {
        backgroundColor: '#333',
        padding: 10,
        borderRadius: 12,
        marginBottom: 4,
    },
    navText: {
        color: TEXT_MUTED,
        fontSize: 10,
        fontWeight: '700',
        marginTop: 4,
    },
    navTextActive: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
        marginTop: 4,
    },
});
