import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
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
                <View style={styles.logoCircle}>
                    <Flame color="#fff" size={40} fill="#fff" />
                </View>
                <Text style={styles.title}>Mirchi Admin</Text>
                <Text style={styles.subtitle}>Restaurant Operations Portal</Text>
            </View>

            <View style={styles.form}>
                <View style={styles.inputContainer}>
                    <Mail size={20} color="#666" style={styles.icon} />
                    <TextInput 
                        placeholder="Business Email"
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Lock size={20} color="#666" style={styles.icon} />
                    <TextInput 
                        placeholder="Secret Key"
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
                        <>
                            <Text style={styles.buttonText}>Access Hub</Text>
                            <LogIn size={20} color="#fff" />
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                    <Text style={styles.linkText}>New owner? <Text style={styles.linkBold}>Register Hub</Text></Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FCFCFC',
        justifyContent: 'center',
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 50,
    },
    logoCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: MIRCHI_RED,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        shadowColor: MIRCHI_RED,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
    },
    title: {
        fontSize: 34,
        fontWeight: '900',
        color: '#1A1A1A',
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    form: {
        backgroundColor: '#fff',
        padding: 28,
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.08,
        shadowRadius: 25,
        elevation: 5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F8F8',
        borderRadius: 16,
        marginBottom: 16,
        paddingHorizontal: 16,
        height: 60,
    },
    icon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        fontWeight: '600',
    },
    button: {
        backgroundColor: MIRCHI_RED,
        height: 60,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        marginBottom: 20,
        shadowColor: MIRCHI_RED,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
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
        fontWeight: '700',
    },
    linkText: {
        color: '#666',
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '500',
    },
    linkBold: {
        color: MIRCHI_RED,
        fontWeight: '900',
    }
});
