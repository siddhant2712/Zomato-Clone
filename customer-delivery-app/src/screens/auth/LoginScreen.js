import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, ImageBackground } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { Mail, Lock, LogIn, Flame } from 'lucide-react-native';

const MIRCHI_RED = '#BC1010';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const { login } = useContext(AuthContext);

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Please fill all fields');
            return;
        }
        setLoading(true);
        setError('');
        const res = await login(email, password);
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
            <View style={styles.header}>
                <View style={[styles.logoCircle, { backgroundColor: '#fff' }]}>
                    <Flame color={MIRCHI_RED} size={40} fill={MIRCHI_RED} />
                </View>
                <Text style={styles.title}>Mirchi</Text>
                <Text style={styles.subtitle}>Pure Veg Delights</Text>
            </View>

            <View style={styles.form}>
                <View style={styles.inputContainer}>
                    <Mail size={18} color="#999" style={styles.icon} />
                    <TextInput 
                        placeholder="Email Address"
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

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <TouchableOpacity 
                    style={styles.button} 
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Login</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                    <Text style={styles.linkText}>Don't have an account? <Text style={styles.linkBold}>Sign Up</Text></Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: MIRCHI_RED,
        justifyContent: 'center',
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 50,
    },
    logoCircle: {
        width: 90,
        height: 90,
        borderRadius: 45,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 8,
    },
    title: {
        fontSize: 38,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 12,
        color: '#FFDE6D',
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    form: {
        backgroundColor: '#fff',
        padding: 28,
        borderRadius: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.2,
        shadowRadius: 30,
        elevation: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7F7F7',
        borderRadius: 16,
        marginBottom: 16,
        paddingHorizontal: 16,
        height: 60,
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
    button: {
        backgroundColor: MIRCHI_RED,
        height: 60,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '900',
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
