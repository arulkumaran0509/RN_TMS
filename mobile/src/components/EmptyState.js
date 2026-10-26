import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import AnimatedButton from './AnimatedButton';

const EmptyState = ({
    icon = 'albums-outline',
    title = 'No Records Found',
    message = 'There are no active items to display at this moment.',
    actionLabel,
    onAction,
    style,
}) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                speed: 15,
                bounciness: 6,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <Animated.View
            style={[
                styles.container,
                { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
                style,
            ]}
        >
            <View style={styles.iconCircle}>
                <Ionicons name={icon} size={36} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>

            {actionLabel && onAction && (
                <AnimatedButton
                    title={actionLabel}
                    onPress={onAction}
                    variant="primary"
                    size="sm"
                    style={styles.actionBtn}
                />
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        paddingHorizontal: 24,
    },
    iconCircle: {
        width: 76,
        height: 76,
        borderRadius: 38,
        backgroundColor: COLORS.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 2,
    },
    title: {
        fontSize: 17,
        fontWeight: '700',
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: 6,
    },
    message: {
        fontSize: 13,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 19,
        maxWidth: 280,
    },
    actionBtn: {
        marginTop: 18,
    },
});

export default EmptyState;
