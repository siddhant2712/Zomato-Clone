import React, { useContext, useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Animated, Dimensions, Platform } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { 
    Search, Printer, Volume2, MoreVertical, ChevronDown, CheckCircle, Package, 
    MessageSquare, Plus, Bike, FileText, TrendingUp, PieChart, LayoutGrid, DollarSign, ChevronRight
} from 'lucide-react-native';
import axios from 'axios';
import ENV from '../../config/env';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Swiggy Dark Palette
const BLACK_BG = '#000000';
const CARD_BG = '#202020';
const GREEN_DOT = '#2E7D32'; 
const WARNING_YELLOW = '#B26A00';
const BORDER_COLOR = '#333333';
const TEXT_MUTED = '#999999';

export default function RestaurantDashboard({ navigation }) {
    const { logout, user, token } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Active horizontal pill filter
    const [activeFilter, setActiveFilter] = useState('Preparing');
    const [expandedOrders, setExpandedOrders] = useState({});

    const toggleAccordion = (id) => {
        setExpandedOrders(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const fetchData = async () => {
        try {
            const ordersRes = await axios.get(`${ENV.API_BASE}/api/orders`, { headers: { 'x-auth-token': token } });
            setOrders(ordersRes.data);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const timer = setInterval(fetchData, 10000);
        return () => clearInterval(timer);
    }, []);

    const updateStatus = async (orderId, newStatus) => {
        try {
            await axios.put(`${ENV.API_BASE}/api/orders/${orderId}`, 
                { status: newStatus },
                { headers: { 'x-auth-token': token } }
            );
            fetchData();
        } catch (err) {
            console.log(err);
        }
    };

    // Filter Logic
    const preparingOrders = orders.filter(o => ['pending', 'accepted', 'preparing'].includes(o.status));
    const readyOrders = orders.filter(o => o.status === 'ready');
    const dispatchOrders = orders.filter(o => ['picked', 'delivered'].includes(o.status));

    let displayOrders = preparingOrders;
    if (activeFilter === 'Ready') displayOrders = readyOrders;
    if (activeFilter === 'Out for delivery') displayOrders = dispatchOrders;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            
            {/* Top Fixed Area */}
            <View style={styles.topFixedBlock}>
                {/* Header Row */}
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.restaurantName}>Mirchi Restaurant</Text>
                        <View style={styles.locationRow}>
                            <View style={styles.greenCircleTiny} />
                            <Text style={styles.locationText}>Ballia Locality</Text>
                        </View>
                    </View>
                    
                    <View style={styles.headerRight}>
                        <View style={styles.onlinePill}>
                            <Text style={styles.onlineText}>online</Text>
                            <ChevronRight size={12} color={GREEN_DOT} />
                        </View>
                        <TouchableOpacity style={styles.iconCircle}><Text style={styles.qrIcon}>QR</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.iconCircle}><Search size={20} color="#fff" /></TouchableOpacity>
                        <TouchableOpacity style={styles.iconCircle} onPress={logout}><MoreVertical size={20} color="#fff" /></TouchableOpacity>
                    </View>
                </View>

                {/* Warning Strip */}
                <View style={styles.warningStrip}>
                    <Text style={styles.warningText}>App notifications are disabled. <Text style={styles.warningLink}>Troubleshoot</Text></Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollArea} showsVerticalScrollIndicator={false}>
                
                {/* Feedback Banner */}
                <View style={styles.bannerArea}>
                    <View style={styles.bannerCard}>
                        <View style={{flex: 1}}>
                            <Text style={styles.bannerTitle}>Help us understand you better!</Text>
                            <Text style={styles.bannerSub}>Let us know what more we can do to support your business</Text>
                            <TouchableOpacity style={styles.bannerBtn}>
                                <Text style={styles.bannerBtnText}>Share feedback</Text>
                            </TouchableOpacity>
                        </View>
                        {/* Mock Image shape */}
                        <View style={styles.bannerImgBox}>
                            <Image 
                                source={{uri: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&auto=format&fit=crop'}}
                                style={styles.bannerImg}
                            />
                        </View>
                    </View>
                </View>

                {/* Pill Filters */}
                <View style={styles.filterTabsRow}>
                    <TouchableOpacity onPress={() => setActiveFilter('Preparing')} style={[styles.filterPill, activeFilter === 'Preparing' && styles.filterPillActive]}>
                        <Text style={[styles.filterPillText, activeFilter === 'Preparing' && styles.filterPillTextActive]}>Preparing</Text>
                        <View style={[styles.pillBadge, activeFilter === 'Preparing' && styles.pillBadgeActive]}>
                            <Text style={[styles.pillBadgeText, activeFilter === 'Preparing' && styles.pillBadgeTextActive]}>{preparingOrders.length}</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setActiveFilter('Ready')} style={[styles.filterPill, activeFilter === 'Ready' && styles.filterPillActive]}>
                        <Text style={[styles.filterPillText, activeFilter === 'Ready' && styles.filterPillTextActive]}>Ready</Text>
                        {readyOrders.length > 0 && <View style={[styles.pillBadge, activeFilter === 'Ready' && styles.pillBadgeActive]}><Text style={styles.pillBadgeText}>{readyOrders.length}</Text></View>}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setActiveFilter('Out for delivery')} style={[styles.filterPill, activeFilter === 'Out for delivery' && styles.filterPillActive]}>
                        <Text style={[styles.filterPillText, activeFilter === 'Out for delivery' && styles.filterPillTextActive]}>Out for delivery</Text>
                        <View style={[styles.pillBadge, activeFilter === 'Out for delivery' && styles.pillBadgeActive]}>
                            <Text style={[styles.pillBadgeText, activeFilter === 'Out for delivery' && styles.pillBadgeTextActive]}>{dispatchOrders.length}</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Orders Mapping */}
                {displayOrders.length === 0 ? (
                    <Text style={{color: TEXT_MUTED, textAlign: 'center', marginTop: 40}}>No current orders in this view.</Text>
                ) : (
                    displayOrders.map(order => {
                        const dateString = new Date(order.createdAt).toLocaleString('en-US', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

                        return (
                            <View key={order._id} style={styles.orderCard}>
                                
                                {/* Card Header */}
                                <View style={styles.cardHeader}>
                                    <View>
                                        <View style={styles.idRow}>
                                            <Text style={styles.orderIdText}>#{order._id.slice(-6).toUpperCase()}</Text>
                                            <FileText size={16} color="#888" style={{marginLeft: 8}} />
                                        </View>
                                        <Text style={styles.originText}>Mirchi Restaurant , Ballia Locality</Text>
                                    </View>
                                    <View style={styles.cardHeaderIcons}>
                                        <TouchableOpacity style={styles.actionRoundBtn}><Printer size={18} color="#fff" /></TouchableOpacity>
                                        <TouchableOpacity style={styles.actionRoundBtn}><Volume2 size={18} color="#fff" /></TouchableOpacity>
                                        <TouchableOpacity style={styles.actionRoundBtn}><MoreVertical size={18} color="#fff" /></TouchableOpacity>
                                    </View>
                                </View>

                                {/* Customer Context */}
                                <View style={styles.customerContextRow}>
                                    <Text style={styles.customerNameText}>{order.customerId?.name || "Guest"}'s order</Text>
                                    <Text style={styles.timeText}>{dateString}</Text>
                                </View>

                                {/* Details Box */}
                                <View style={styles.detailsBlock}>
                                    <TouchableOpacity style={styles.detailsHeader} onPress={() => toggleAccordion(order._id)}>
                                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                            <Package size={16} color="#bbb" />
                                            <Text style={styles.detailsTitle}>Details</Text>
                                        </View>
                                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                            <Text style={styles.itemsCountText}>{order.items.length} item{order.items.length > 1 ? 's' : ''}</Text>
                                            <ChevronDown 
                                                size={16} 
                                                color="#fff" 
                                                style={{marginLeft: 5, transform: [{ rotate: expandedOrders[order._id] ? '180deg' : '0deg' }] }}
                                            />
                                        </View>
                                    </TouchableOpacity>
                                    
                                    {!expandedOrders[order._id] && order.items.map((item, idx) => (
                                        <View key={idx} style={styles.itemRow}>
                                            <View style={styles.vegIcon}><View style={styles.vegInner}/></View>
                                            <View>
                                                <Text style={styles.itemString}>
                                                    <Text style={styles.itemQty}>{item.quantity} x </Text>
                                                    <Text style={styles.itemNameDashed}>{item.name}</Text>
                                                </Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>

                                {/* Cutlery Box */}
                                <View style={styles.cutleryBox}>
                                    <View style={styles.cutleryIconCircle}><CheckCircle size={14} color={GREEN_DOT}/></View>
                                    <Text style={styles.cutleryText}>Send cutlery</Text>
                                </View>

                                {/* Bill Box */}
                                <View style={styles.billBox}>
                                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                        <FileText size={18} color="#bbb" />
                                        <Text style={styles.billTitleText}>Total bill</Text>
                                    </View>
                                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                        <Text style={styles.billAmountText}>₹{order.totalAmount}</Text>
                                        <ChevronDown size={16} color="#fff" style={{marginLeft: 5}}/>
                                    </View>
                                </View>

                                {/* Rider Info */}
                                <View style={styles.riderRow}>
                                    <Bike size={18} color="#ccc" />
                                    <Text style={styles.riderText}>5 riders nearby, assigning one soon</Text>
                                </View>

                                {/* Massive White Action Button */}
                                {order.status === 'pending' && (
                                    <TouchableOpacity style={styles.giantWhiteBtn} onPress={() => updateStatus(order._id, 'preparing')}>
                                        <Text style={styles.giantWhiteBtnText}>Accept & Prepare</Text>
                                    </TouchableOpacity>
                                )}
                                {order.status === 'preparing' && (
                                    <TouchableOpacity style={styles.giantWhiteBtn} onPress={() => updateStatus(order._id, 'ready')}>
                                        <Text style={styles.giantWhiteBtnText}>Order Ready (14:15)</Text>
                                    </TouchableOpacity>
                                )}
                                {order.status === 'ready' && (
                                    <View style={[styles.giantWhiteBtn, { backgroundColor: '#333' }]}>
                                        <Text style={[styles.giantWhiteBtnText, { color: '#888' }]}>Awaiting Delivery Pickup</Text>
                                    </View>
                                )}
                                {order.status === 'picked' && (
                                    <View style={[styles.giantWhiteBtn, { backgroundColor: '#333' }]}>
                                        <Text style={[styles.giantWhiteBtnText, { color: '#888' }]}>Order Picked Up</Text>
                                    </View>
                                )}
                                {order.status === 'delivered' && (
                                    <View style={[styles.giantWhiteBtn, { backgroundColor: '#333' }]}>
                                        <Text style={[styles.giantWhiteBtnText, { color: '#888' }]}>Delivered Successfully</Text>
                                    </View>
                                )}

                            </View>
                        );
                    })
                )}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Absolute Bottom Navigation bar matching image */}
            <View style={styles.bottomNavMock}>
                <TouchableOpacity style={styles.navItem}>
                    <View style={styles.activeNavHighlight}>
                        <TrendingUp size={22} color="#fff" />
                    </View>
                    <Text style={styles.navItemTextActive}>Orders</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('RestaurantHub')}>
                    <PieChart size={22} color={TEXT_MUTED} />
                    <Text style={styles.navItemText}>Hub</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <TrendingUp size={22} color={TEXT_MUTED} />
                    <Text style={styles.navItemText}>Growth</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('AddItem')}>
                    <LayoutGrid size={22} color={TEXT_MUTED} />
                    <Text style={styles.navItemText}>Menu</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <DollarSign size={22} color={TEXT_MUTED} />
                    <Text style={styles.navItemText}>Finance</Text>
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
    topFixedBlock: {
        backgroundColor: BLACK_BG,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 15,
    },
    restaurantName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    greenCircleTiny: {
        width: 6, height: 6, borderRadius: 3, backgroundColor: GREEN_DOT, marginRight: 5
    },
    locationText: {
        color: '#ccc',
        fontSize: 12,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    onlinePill: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: GREEN_DOT,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        marginRight: 10,
    },
    onlineText: {
        color: GREEN_DOT,
        fontSize: 12,
        fontWeight: '600',
        marginRight: 4,
    },
    iconCircle: {
        marginLeft: 15,
    },
    qrIcon: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '800'
    },
    warningStrip: {
        backgroundColor: WARNING_YELLOW,
        width: '100%',
        paddingVertical: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    warningText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '500',
    },
    warningLink: {
        textDecorationLine: 'underline',
        fontWeight: '600',
    },
    
    scrollArea: {
        paddingTop: 10,
        paddingHorizontal: 12,
    },
    bannerArea: {
        marginBottom: 15,
    },
    bannerCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        flexDirection: 'row',
    },
    bannerTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#000',
        marginBottom: 4,
    },
    bannerSub: {
        fontSize: 12,
        color: '#444',
        marginBottom: 12,
        paddingRight: 10,
    },
    bannerBtn: {
        backgroundColor: '#333',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
    },
    bannerBtnText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '700',
    },
    bannerImgBox: {
        width: 80, height: 80, borderRadius: 10, overflow: 'hidden'
    },
    bannerImg: { width: '100%', height: '100%' },

    filterTabsRow: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    filterPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2A2A2A',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginRight: 10,
    },
    filterPillActive: {
        backgroundColor: '#fff',
    },
    filterPillText: {
        color: '#ccc',
        fontSize: 13,
        fontWeight: '600',
    },
    filterPillTextActive: {
        color: '#000',
    },
    pillBadge: {
        backgroundColor: '#444',
        width: 18, height: 18, borderRadius: 9,
        justifyContent: 'center', alignItems: 'center',
        marginLeft: 8,
    },
    pillBadgeActive: {
        backgroundColor: '#000',
    },
    pillBadgeText: {
        color: '#eee', fontSize: 10, fontWeight: '700'
    },
    pillBadgeTextActive: {
        color: '#fff'
    },

    orderCard: {
        backgroundColor: CARD_BG,
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    idRow: {
        flexDirection: 'row', alignItems: 'center', marginBottom: 4,
    },
    orderIdText: {
        color: '#fff', fontSize: 18, fontWeight: '800'
    },
    originText: {
        color: TEXT_MUTED, fontSize: 12,
    },
    cardHeaderIcons: {
        flexDirection: 'row',
    },
    actionRoundBtn: {
        width: 36, height: 36, borderRadius: 18, backgroundColor: '#333', marginLeft: 8,
        alignItems: 'center', justifyContent: 'center'
    },

    customerContextRow: {
        flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20,
    },
    customerNameText: {
        color: '#fff', fontSize: 14, fontWeight: '500',
    },
    timeText: {
        color: '#bbb', fontSize: 13,
    },

    detailsBlock: {
        marginBottom: 12,
    },
    detailsHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
    },
    detailsTitle: {
        color: '#fff', fontSize: 15, fontWeight: 'mormal', marginLeft: 8,
    },
    itemsCountText: {
        color: '#fff', fontSize: 14,
    },
    itemRow: {
        flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12,
    },
    vegIcon: {
        width: 14, height: 14, borderWidth: 1, borderColor: GREEN_DOT, borderRadius: 2, 
        justifyContent: 'center', alignItems: 'center', marginTop: 2, marginRight: 10,
    },
    vegInner: {
        width: 6, height: 6, borderRadius: 3, backgroundColor: GREEN_DOT,
    },
    itemString: {
        color: '#fff', fontSize: 15,
    },
    itemQty: { color: GREEN_DOT, fontWeight: '700' },
    itemNameDashed: { 
        textDecorationLine: 'underline',
        textDecorationStyle: 'dashed',
        color: '#fff',
    },

    cutleryBox: {
        backgroundColor: '#383838',
        borderRadius: 8,
        padding: 12,
        flexDirection: 'row', alignItems: 'center',
        marginBottom: 20,
    },
    cutleryIconCircle: {
        width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(46, 125, 50, 0.2)',
        alignItems: 'center', justifyContent: 'center', marginRight: 10,
    },
    cutleryText: {
        color: '#fff', fontSize: 12, fontWeight: '500',
    },

    billBox: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderTopWidth: 1, borderBottomWidth: 1, borderColor: BORDER_COLOR,
        paddingVertical: 12, marginBottom: 15,
    },
    billTitleText: { color: '#ccc', fontSize: 14, marginLeft: 10 },
    billAmountText: { color: '#fff', fontSize: 16, fontWeight: '700' },

    riderRow: {
        flexDirection: 'row', alignItems: 'center', marginBottom: 20,
    },
    riderText: { color: '#bbb', fontSize: 13, marginLeft: 10 },

    giantWhiteBtn: {
        backgroundColor: '#ffffff',
        width: '100%',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center', justifyContent: 'center',
    },
    giantWhiteBtnText: {
        color: '#000', fontSize: 18, fontWeight: '800',
    },

    bottomNavMock: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        backgroundColor: '#121212',
        flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
        height: 90, borderTopWidth: 1, borderTopColor: '#222', paddingBottom: 25,
    },
    navItem: { alignItems: 'center', flex: 1 },
    navItemText: { color: TEXT_MUTED, fontSize: 10, marginTop: 4, fontWeight: '700' },
    navItemTextActive: { color: '#fff', fontSize: 10, marginTop: 4, fontWeight: '700' },
    activeNavHighlight: {
        backgroundColor: '#333',
        padding: 10,
        borderRadius: 12,
        marginBottom: 4,
    },

});
