import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { User, Mail, Lock, ArrowRight, Flame } from 'lucide-react-native';

const MIRCHI_RED = '#BC1010';

export default function SignupScreen({ navigation }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
        const res = await register(name, email, password, 'restaurant');
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
                    <View style={styles.logoBadge}>
                        <Flame color={MIRCHI_RED} size={30} fill={MIRCHI_RED} />
                    </View>
                    <Text style={styles.title}>Register Hub</Text>
                    <Text style={styles.subtitle}>List your restaurant on Mirchi</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <User size={20} color="#666" style={styles.icon} />
                        <TextInput 
                            placeholder="Restaurant Legal Name"
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Mail size={20} color="#666" style={styles.icon} />
                        <TextInput 
                            placeholder="Official Business Email"
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Lock size={20} color="#666" style={styles.icon} />
                        <TextInput 
                            placeholder="Create Admin Password"
                            style={styles.input}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
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
                                <Text style={styles.buttonText}>Setup Business</Text>
                                <ArrowRight size={20} color="#fff" />
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.linkText}>Already registered? <Text style={styles.linkBold}>Login</Text></Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FCFCFC',
    },
    scrollContent: {
        padding: 24,
        paddingTop: Platform.OS === 'ios' ? 60 : 100,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoBadge: {
        width: 60,
        height: 60,
        borderRadius: 20,
        backgroundColor: '#FFE8E5',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: '#1A1A1A',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
        fontWeight: '500',
    },
    form: {
        backgroundColor: '#fff',
        padding: 26,
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F8F8',
        borderRadius: 16,
        marginBottom: 16,
        paddingHorizontal: 16,
        height: 56,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#333',
        fontWeight: '600',
    },
    button: {
        backgroundColor: '#111',
        height: 60,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        marginBottom: 15,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
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
        fontWeight: '600',
    },
    linkBold: {
        color: MIRCHI_RED,
        fontWeight: '900',
    }
});
