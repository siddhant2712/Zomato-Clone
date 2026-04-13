import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { ChevronLeft, Plus, Image as ImageIcon, IndianRupe } from 'lucide-react-native';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import ENV from '../../config/env';

import { SafeAreaView } from 'react-native-safe-area-context';
const MIRCHI_RED = '#BC1010';
const MIRCHI_GREEN = '#00B14F';

export default function AddItemScreen({ navigation }) {
    const { token } = useContext(AuthContext);
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('Main Course');
    const [image, setImage] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAddItem = async () => {
        if (!name || !price || !category) {
            Alert.alert('Missing Fields', 'Please fill at least name, price and category.');
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${ENV.API_BASE}/api/menu`, {
                name,
                price: parseFloat(price),
                category,
                image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
                description
            }, {
                headers: { 'x-auth-token': token }
            });
            Alert.alert('Success', 'Item added to your menu!');
            navigation.goBack();
        } catch (err) {
            console.log(err);
            Alert.alert('Error', 'Failed to add item. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add New Item</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Dish Name</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder="e.g. Paneer Butter Masala"
                        value={name}
                        onChangeText={setName}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Price (₹)</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder="e.g. 250"
                        keyboardType="numeric"
                        value={price}
                        onChangeText={setPrice}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Category</Text>
                    <View style={styles.categoryWrap}>
                        {['Starters', 'Main Course', 'Combos', 'Beverages'].map((cat) => (
                            <TouchableOpacity 
                                key={cat} 
                                style={[styles.catPill, category === cat && styles.activePill]}
                                onPress={() => setCategory(cat)}
                            >
                                <Text style={[styles.catText, category === cat && styles.activeCatText]}>{cat}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Image URL (Optional)</Text>
                    <View style={styles.urlInputContainer}>
                        <ImageIcon size={20} color="#999" style={{ marginRight: 10 }} />
                        <TextInput 
                            style={styles.urlInput} 
                            placeholder="https://image-link.com/..."
                            value={image}
                            onChangeText={setImage}
                            autoCapitalize="none"
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Description</Text>
                    <TextInput 
                        style={[styles.input, styles.textArea]} 
                        placeholder="Briefly describe the dish..."
                        multiline
                        numberOfLines={4}
                        value={description}
                        onChangeText={setDescription}
                    />
                </View>

                <TouchableOpacity 
                    style={styles.submitButton} 
                    onPress={handleAddItem}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitText}>Save Dish</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        height: 60,
        borderBottomWidth:1,
        borderBottomColor: '#EEE',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#111',
    },
    backButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
    },
    form: {
        padding: 24,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: '#666',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F8F8F8',
        height: 56,
        borderRadius: 16,
        paddingHorizontal: 16,
        fontSize: 16,
        fontWeight: '600',
        color: '#111',
        borderWidth: 1,
        borderColor: '#EEE',
    },
    categoryWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    catPill: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        marginRight: 10,
        marginBottom: 10,
    },
    activePill: {
        backgroundColor: MIRCHI_RED,
    },
    catText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#666',
    },
    activeCatText: {
        color: '#fff',
    },
    urlInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F8F8',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 56,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    urlInput: {
        flex: 1,
        fontSize: 14,
        color: '#111',
    },
    textArea: {
        height: 120,
        paddingTop: 16,
        textAlignVertical: 'top',
    },
    submitButton: {
        backgroundColor: MIRCHI_GREEN,
        height: 60,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        shadowColor: MIRCHI_GREEN,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 5,
    },
    submitText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '900',
    }
});
