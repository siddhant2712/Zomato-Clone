import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { User, Mail, Lock, ArrowRight, Flame } from 'lucide-react-native';

const MIRCHI_RED = '#BC1010';

const roles = [
    { label: 'Hungry Customer', value: 'customer' },
    { label: 'Delivery Partner', value: 'delivery' },
];

export default function SignupScreen({ navigation }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('customer');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const { register } = useContext(AuthContext);

    const handleSignup = async () => {
        if (!name || !email || !password) {
            setError('Please fill all fields');
            return;
        }
        setLoading(true);
        setError('');
        const res = await register(name, email, password, role);
        setLoading(false);
        if (!res.success) {
            setError(res.msg);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.redHeader}>
                 <View style={styles.logoBadge}>
                    <Flame color={MIRCHI_RED} size={28} fill={MIRCHI_RED} />
                </View>
                <Text style={styles.headerTitle}>Join Mirchi</Text>
                <Text style={styles.headerSubtitle}>Pure Veg Delights Await</Text>
            </View>

            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <User size={18} color="#999" style={styles.icon} />
                            <TextInput 
                                placeholder="Full Name"
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Mail size={18} color="#999" style={styles.icon} />
                            <TextInput 
                                placeholder="Email"
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Lock size={18} color="#999" style={styles.icon} />
                            <TextInput 
                                placeholder="Password"
                                style={styles.input}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        <Text style={styles.label}>Register As:</Text>
                        <View style={styles.roleContainer}>
                            {roles.map((r) => (
                                <TouchableOpacity 
                                    key={r.value}
                                    style={[
                                        styles.roleButton, 
                                        role === r.value && styles.activeRoleButton
                                    ]}
                                    onPress={() => setRole(r.value)}
                                >
                                    <View style={[styles.roleDot, role === r.value && styles.activeRoleDot]} />
                                    <Text style={[
                                        styles.roleButtonText,
                                        role === r.value && styles.activeRoleButtonText
                                    ]}>{r.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {error ? <Text style={styles.errorText}>{error}</Text> : null}

                        <TouchableOpacity 
                            style={styles.button} 
                            onPress={handleSignup}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Text style={styles.buttonText}>Get Started</Text>
                                    <ArrowRight size={20} color="#fff" />
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.linkText}>Member already? <Text style={styles.linkBold}>Login</Text></Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FCFCFC',
    },
    redHeader: {
        backgroundColor: MIRCHI_RED,
        paddingTop: Platform.OS === 'ios' ? 60 : 80,
        paddingBottom: 60,
        alignItems: 'center',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    logoBadge: {
        width: 54,
        height: 54,
        borderRadius: 18,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#FFDE6D',
        fontWeight: '800',
        textTransform: 'uppercase',
        marginTop: 4,
        letterSpacing: 1,
    },
    keyboardView: {
        flex: 1,
        marginTop: -40,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    form: {
        backgroundColor: '#fff',
        padding: 26,
        borderRadius: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F8F8',
        borderRadius: 16,
        marginBottom: 16,
        paddingHorizontal: 16,
        height: 56,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#111',
        fontWeight: '600',
    },
    label: {
        fontSize: 13,
        fontWeight: '800',
        color: '#333',
        marginBottom: 12,
        marginTop: 8,
        textTransform: 'uppercase',
    },
    roleContainer: {
        marginBottom: 24,
    },
    roleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        borderRadius: 12,
        backgroundColor: '#F7F7F7',
        paddingHorizontal: 15,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    activeRoleButton: {
        backgroundColor: '#FFF1F0',
        borderColor: MIRCHI_RED,
    },
    roleDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#CCC',
        marginRight: 12,
    },
    activeRoleDot: {
        borderColor: MIRCHI_RED,
        backgroundColor: MIRCHI_RED,
    },
    roleButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#666',
    },
    activeRoleButtonText: {
        color: MIRCHI_RED,
    },
    button: {
        backgroundColor: '#111',
        height: 60,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '900',
        marginRight: 10,
    },
    errorText: {
        color: MIRCHI_RED,
        marginBottom: 16,
        textAlign: 'center',
        fontWeight: '800',
    },
    linkText: {
        color: '#666',
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '600',
    },
    linkBold: {
        color: MIRCHI_RED,
        fontWeight: '900',
    }
});
