import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import ENV from '../config/env';

const API_BASE = ENV.API_BASE;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            console.log("DEBUG: AuthContext Initializing...");
            try {
                const storedUser = await AsyncStorage.getItem('user');
                const storedToken = await AsyncStorage.getItem('token');
                if (storedUser && storedToken) {
                    setUser(JSON.parse(storedUser));
                    setToken(storedToken);
                    console.log("DEBUG: Session restored for", JSON.parse(storedUser).name);
                }
            } catch (e) {
                console.log("DEBUG: Initialization error:", e);
            } finally {
                setLoading(false);
            }
        };
        loadUser();
    }, []);

    const login = async (email, password) => {
        try {
            const res = await axios.post(`${API_BASE}/api/auth/login`, { email, password });
            const userData = res.data.user;
            const userToken = res.data.token;
            
            if (userData.role !== 'restaurant') {
                return { success: false, msg: 'This app is for Restaurants only.' };
            }

            setUser(userData);
            setToken(userToken);
            await AsyncStorage.setItem('user', JSON.stringify(userData));
            await AsyncStorage.setItem('token', userToken);
            return { success: true };
        } catch (err) {
            return { success: false, msg: err.response?.data?.msg || 'Login failed' };
        }
    };

    const register = async (name, email, password, role) => {
        try {
            if (role !== 'restaurant') {
                return { success: false, msg: 'Role must be Restaurant for this app.' };
            }
            const res = await axios.post(`${API_BASE}/api/auth/register`, { name, email, password, role });
            const userData = res.data.user;
            const userToken = res.data.token;

            setUser(userData);
            setToken(userToken);
            await AsyncStorage.setItem('user', JSON.stringify(userData));
            await AsyncStorage.setItem('token', userToken);
            return { success: true };
        } catch (err) {
            return { success: false, msg: err.response?.data?.msg || 'Registration failed' };
        }
    };

    const logout = async () => {
        setUser(null);
        setToken(null);
        await AsyncStorage.removeItem('user');
        await AsyncStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
