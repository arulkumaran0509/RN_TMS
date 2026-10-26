import React, { useEffect, useRef, useState } from 'react';
import {
    StyleSheet,
    Animated,
    Pressable,
    Platform,
} from 'react-native';
import { COLORS } from '../theme/colors';

const AnimatedCard = ({
    children,
    style,
    onPress,
    delay = 0,
    activeScale = 0.98,
    accessible = true,
    accessibilityLabel,
}) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateYAnim = useRef(new Animated.Value(14)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const [isHovered, setIsHovered] = useState(false);

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
            toValue: activeScale,
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
                styles.card,
                isHovered && styles.cardHovered,
                {
                    opacity: fadeAnim,
                    transform: [
                        { translateY: translateYAnim },
                        { scale: scaleAnim },
                    ],
                },
                style,
            ]}
        >
            <Pressable
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onHoverIn={Platform.OS === 'web' && onPress ? () => setIsHovered(true) : undefined}
                onHoverOut={Platform.OS === 'web' && onPress ? () => setIsHovered(false) : undefined}
                accessible={accessible}
                accessibilityRole={onPress ? 'button' : undefined}
                accessibilityLabel={accessibilityLabel}
                style={styles.innerContent}
            >
                {children}
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.cardBackground,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHovered: {
        shadowOpacity: 0.12,
        shadowRadius: 14,
        borderColor: COLORS.border,
        transform: [{ translateY: -2 }],
    },
    innerContent: {
        borderRadius: 18,
    },
});

export default AnimatedCard;
