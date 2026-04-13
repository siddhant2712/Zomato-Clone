import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Text } from 'react-native';
import { Flame } from 'lucide-react-native';

const MIRCHI_RED = '#BC1010';

const MirchiLoader = ({ text = "Loading..." }) => {
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.2,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [pulseAnim]);

    return (
        <View style={styles.container}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <Flame size={60} color={MIRCHI_RED} fill={MIRCHI_RED} />
            </Animated.View>
            <Text style={styles.text}>{text}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    text: {
        marginTop: 20,
        fontSize: 16,
        color: MIRCHI_RED,
        fontWeight: '700',
        letterSpacing: 1,
    },
});

export default MirchiLoader;
