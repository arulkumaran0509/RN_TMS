import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * AnimatedTabIcon:
 * Self-contained animated icon with smooth scale bounce on focus
 * and soft active highlight background, without clipping or layout overflow.
 */
const AnimatedTabIcon = ({ focused, iconName, color, size = 22 }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: focused ? 1.12 : 1.0,
            friction: 5,
            tension: 100,
            useNativeDriver: true,
        }).start();
    }, [focused]);

    return (
        <Animated.View
            style={[
                styles.wrapper,
                focused && styles.wrapperActive,
                { transform: [{ scale: scaleAnim }] },
            ]}
        >
            <Ionicons name={iconName} size={size} color={color} />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        width: 48,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    wrapperActive: {
        backgroundColor: 'rgba(99, 102, 241, 0.12)',
    },
});

export default AnimatedTabIcon;
