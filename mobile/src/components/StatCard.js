import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

const StatCard = ({
    title,
    value,
    icon,
    iconColor,
    bgLightColor,
    delay = 0,
    onPress,
}) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateYAnim = useRef(new Animated.Value(14)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                delay,
                useNativeDriver: true,
            }),
            Animated.spring(translateYAnim, {
                toValue: 0,
                delay,
                speed: 12,
                bounciness: 4,
                useNativeDriver: true,
            }),
        ]).start();
    }, [delay]);

    const handlePressIn = () => {
        if (!onPress) return;
        Animated.spring(scaleAnim, {
            toValue: 0.96,
            speed: 50,
            bounciness: 4,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        if (!onPress) return;
        Animated.spring(scaleAnim, {
            toValue: 1,
            speed: 40,
            bounciness: 6,
            useNativeDriver: true,
        }).start();
    };

    return (
        <Animated.View
            style={[
                styles.cardWrapper,
                {
                    opacity: fadeAnim,
                    transform: [
                        { translateY: translateYAnim },
                        { scale: scaleAnim },
                    ],
                },
            ]}
        >
            <Pressable
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={!onPress}
                style={styles.card}
            >
                <View
                    style={[
                        styles.iconWrapper,
                        { backgroundColor: bgLightColor || COLORS.primaryLight },
                    ]}
                >
                    <Ionicons
                        name={icon || 'stats-chart'}
                        size={22}
                        color={iconColor || COLORS.primary}
                    />
                </View>
                <View style={styles.content}>
                    <Text style={styles.value}>{value ?? 0}</Text>
                    <Text style={styles.title} numberOfLines={1}>{title}</Text>
                </View>
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    cardWrapper: {
        flex: 1,
        minWidth: '45%',
        margin: 6,
    },
    card: {
        backgroundColor: COLORS.cardBackground,
        borderRadius: 18,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    iconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    content: {
        flex: 1,
    },
    value: {
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.text,
    },
    title: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginTop: 2,
    },
});

export default StatCard;
