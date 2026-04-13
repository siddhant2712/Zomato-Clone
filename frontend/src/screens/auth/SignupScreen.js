import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { User, Mail, Lock, UserCheck, ArrowRight } from 'lucide-react-native';

const roles = [
    { label: 'Customer', value: 'customer' },
    { label: 'Restaurant', value: 'restaurant' },
    { label: 'Delivery', value: 'delivery' },
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
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>Join Us</Text>
                    <Text style={styles.subtitle}>Choose your journey with FoodFlow</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <User size={20} color="#666" style={styles.icon} />
                        <TextInput 
                            placeholder="Full Name"
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Mail size={20} color="#666" style={styles.icon} />
                        <TextInput 
                            placeholder="Email"
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Lock size={20} color="#666" style={styles.icon} />
                        <TextInput 
                            placeholder="Password (min 6 chars)"
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
                                <Text style={styles.buttonText}>Create Account</Text>
                                <ArrowRight size={20} color="#fff" />
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.linkText}>Already have an account? <Text style={styles.linkBold}>Login</Text></Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FB',
    },
    scrollContent: {
        padding: 24,
        paddingTop: 60,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 36,
        fontWeight: '800',
        color: '#111',
    },
    subtitle: {
        fontSize: 15,
        color: '#666',
        marginTop: 4,
    },
    form: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    icon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        height: 50,
        fontSize: 16,
        color: '#333',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
        marginTop: 8,
    },
    roleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    roleButton: {
        flex: 1,
        height: 44,
        borderRadius: 10,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    activeRoleButton: {
        backgroundColor: '#FFE8E5',
        borderColor: '#FF4B3A',
    },
    roleButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666',
    },
    activeRoleButtonText: {
        color: '#FF4B3A',
    },
    button: {
        backgroundColor: '#FF4B3A',
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        marginBottom: 16,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
        marginRight: 8,
    },
    errorText: {
        color: '#FF4B3A',
        marginBottom: 16,
        textAlign: 'center',
    },
    linkText: {
        color: '#666',
        textAlign: 'center',
        fontSize: 14,
    },
    linkBold: {
        color: '#FF4B3A',
        fontWeight: '700',
    }
});
