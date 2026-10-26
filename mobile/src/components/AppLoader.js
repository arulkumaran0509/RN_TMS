import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Easing,
    Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

const AppLoader = ({
    message = 'Loading tickets...',
    overlay = false,
    visible = true,
    compact = false,
    icon = 'ticket',
    duration = 5000,
    showProgress = true,
}) => {
    const spinAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const progressFillAnim = useRef(new Animated.Value(0)).current;

    // 3 animated bouncing dots
    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dot3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Fade in
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
        }).start();

        // 5-second progress fill animation
        Animated.timing(progressFillAnim, {
            toValue: 1,
            duration: duration,
            easing: Easing.linear,
            useNativeDriver: false,
        }).start();

        // Continuous Spinner Rotation
        const spinLoop = Animated.loop(
            Animated.timing(spinAnim, {
                toValue: 1,
                duration: 1300,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );
        spinLoop.start();

        // Pulsing Ticket Icon
        const pulseLoop = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.12,
                    duration: 650,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0.94,
                    duration: 650,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        );
        pulseLoop.start();

        // Bouncing dots sequence
        const createDotAnim = (dot, delay) => {
            return Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(dot, {
                        toValue: -6,
                        duration: 300,
                        easing: Easing.ease,
                        useNativeDriver: true,
                    }),
                    Animated.timing(dot, {
                        toValue: 0,
                        duration: 300,
                        easing: Easing.ease,
                        useNativeDriver: true,
                    }),
                    Animated.delay(600 - delay),
                ])
            );
        };

        const dot1Loop = createDotAnim(dot1, 0);
        const dot2Loop = createDotAnim(dot2, 180);
        const dot3Loop = createDotAnim(dot3, 360);

        dot1Loop.start();
        dot2Loop.start();
        dot3Loop.start();

        return () => {
            spinLoop.stop();
            pulseLoop.stop();
            dot1Loop.stop();
            dot2Loop.stop();
            dot3Loop.stop();
        };
    }, []);

    const spin = spinAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    if (!visible) return null;

    const content = (
        <Animated.View
            style={[
                compact ? styles.compactContainer : styles.container,
                { opacity: fadeAnim },
            ]}
        >
            <View style={styles.spinnerContainer}>
                {/* Rotating Gradient Arc / Track */}
                <Animated.View
                    style={[
                        styles.rotatingRing,
                        { transform: [{ rotate: spin }] },
                    ]}
                />

                {/* Pulsing Core Badge */}
                <Animated.View
                    style={[
                        styles.innerBadge,
                        { transform: [{ scale: pulseAnim }] },
                    ]}
                >
                    <Ionicons name={icon} size={22} color={COLORS.primary} />
                </Animated.View>
            </View>

            {/* Context Message */}
            <Text style={styles.messageText}>{message}</Text>

            {/* Bouncing Dots */}
            <View style={styles.dotsRow}>
                <Animated.View
                    style={[styles.dot, { transform: [{ translateY: dot1 }] }]}
                />
                <Animated.View
                    style={[styles.dot, { transform: [{ translateY: dot2 }] }]}
                />
                <Animated.View
                    style={[styles.dot, { transform: [{ translateY: dot3 }] }]}
                />
            </View>

            {/* 5-second progress bar indicator */}
            {showProgress && !compact && (
                <View style={styles.progressSection}>
                    <View style={styles.progressBarTrack}>
                        <Animated.View
                            style={[
                                styles.progressBarFill,
                                {
                                    width: progressFillAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ['0%', '100%'],
                                    }),
                                },
                            ]}
                        />
                    </View>
                    <Text style={styles.progressTimerCaption}>Synchronizing workspace...</Text>
                </View>
            )}
        </Animated.View>
    );

    if (overlay) {
        return (
            <Modal transparent visible={visible} animationType="none">
                <View style={styles.overlayBackdrop}>
                    <View style={styles.overlayCard}>{content}</View>
                </View>
            </Modal>
        );
    }

    return content;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    compactContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    overlayBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.45)', // Dark frosted backdrop
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    overlayCard: {
        backgroundColor: COLORS.cardBackground,
        borderRadius: 20,
        padding: 28,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 8,
        minWidth: 220,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    spinnerContainer: {
        width: 68,
        height: 68,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    rotatingRing: {
        position: 'absolute',
        width: 68,
        height: 68,
        borderRadius: 34,
        borderWidth: 3,
        borderColor: COLORS.primaryLight,
        borderTopColor: COLORS.primary,
        borderRightColor: COLORS.primary,
    },
    innerBadge: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    messageText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        textAlign: 'center',
        letterSpacing: 0.2,
        marginBottom: 8,
    },
    dotsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        height: 12,
    },
    dot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: COLORS.primary,
    },
    progressSection: {
        width: '100%',
        maxWidth: 200,
        marginTop: 18,
        alignItems: 'center',
    },
    progressBarTrack: {
        width: '100%',
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 2,
    },
    progressTimerCaption: {
        marginTop: 6,
        fontSize: 11,
        color: COLORS.textSecondary,
        fontWeight: '500',
        letterSpacing: 0.1,
    },
});

export default AppLoader;
