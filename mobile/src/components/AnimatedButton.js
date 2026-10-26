import React, { useRef, useState } from 'react';
import {
    Text,
    StyleSheet,
    Animated,
    Pressable,
    ActivityIndicator,
    Platform,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

const AnimatedButton = ({
    title,
    children,
    onPress,
    variant = 'primary', // 'primary' | 'secondary' | 'danger' | 'success' | 'ghost'
    size = 'md', // 'sm' | 'md' | 'lg'
    icon,
    iconPosition = 'left',
    iconSize,
    loading = false,
    disabled = false,
    style,
    textStyle,
    activeScale = 0.96,
    accessibilityLabel,
}) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const [isHovered, setIsHovered] = useState(false);

    const handlePressIn = () => {
        if (disabled || loading) return;
        Animated.spring(scaleAnim, {
            toValue: activeScale,
            speed: 50,
            bounciness: 4,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            speed: 40,
            bounciness: 6,
            useNativeDriver: true,
        }).start();
    };

    const isDisabled = disabled || loading;

    // Get Variant Styles
    const getVariantStyles = () => {
        switch (variant) {
            case 'secondary':
                return {
                    container: [
                        styles.secondaryContainer,
                        isHovered && styles.secondaryHovered,
                    ],
                    text: styles.secondaryText,
                    iconColor: COLORS.primary,
                };
            case 'danger':
                return {
                    container: [
                        styles.dangerContainer,
                        isHovered && styles.dangerHovered,
                    ],
                    text: styles.dangerText,
                    iconColor: '#ffffff',
                };
            case 'success':
                return {
                    container: [
                        styles.successContainer,
                        isHovered && styles.successHovered,
                    ],
                    text: styles.successText,
                    iconColor: '#ffffff',
                };
            case 'ghost':
                return {
                    container: [
                        styles.ghostContainer,
                        isHovered && styles.ghostHovered,
                    ],
                    text: styles.ghostText,
                    iconColor: COLORS.primary,
                };
            case 'primary':
            default:
                return {
                    container: [
                        styles.primaryContainer,
                        isHovered && styles.primaryHovered,
                    ],
                    text: styles.primaryText,
                    iconColor: '#ffffff',
                };
        }
    };

    // Get Size Styles
    const getSizeStyles = () => {
        switch (size) {
            case 'sm':
                return {
                    container: styles.smContainer,
                    text: styles.smText,
                    iconSize: iconSize || 16,
                };
            case 'lg':
                return {
                    container: styles.lgContainer,
                    text: styles.lgText,
                    iconSize: iconSize || 20,
                };
            case 'md':
            default:
                return {
                    container: styles.mdContainer,
                    text: styles.mdText,
                    iconSize: iconSize || 18,
                };
        }
    };

    const variantConfig = getVariantStyles();
    const sizeConfig = getSizeStyles();

    return (
        <Animated.View
            style={[
                { transform: [{ scale: scaleAnim }] },
                isDisabled && styles.disabledContainer,
                style,
            ]}
        >
            <Pressable
                onPress={isDisabled ? undefined : onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onHoverIn={Platform.OS === 'web' ? () => setIsHovered(true) : undefined}
                onHoverOut={Platform.OS === 'web' ? () => setIsHovered(false) : undefined}
                disabled={isDisabled}
                accessibilityRole="button"
                accessibilityLabel={accessibilityLabel || (typeof title === 'string' ? title : 'Button')}
                accessibilityState={{ disabled: isDisabled, busy: loading }}
                style={[
                    styles.baseContainer,
                    sizeConfig.container,
                    variantConfig.container,
                ]}
            >
                {loading ? (
                    <View style={styles.loadingWrapper}>
                        <ActivityIndicator
                            size="small"
                            color={variant === 'secondary' || variant === 'ghost' ? COLORS.primary : '#ffffff'}
                        />
                        {title && (
                            <Text
                                style={[
                                    styles.baseText,
                                    sizeConfig.text,
                                    variantConfig.text,
                                    { marginLeft: 8 },
                                    textStyle,
                                ]}
                            >
                                Please wait...
                            </Text>
                        )}
                    </View>
                ) : (
                    <View style={styles.contentRow}>
                        {icon && iconPosition === 'left' && (
                            <Ionicons
                                name={icon}
                                size={sizeConfig.iconSize}
                                color={variantConfig.iconColor}
                                style={styles.leftIcon}
                            />
                        )}

                        {title ? (
                            <Text
                                style={[
                                    styles.baseText,
                                    sizeConfig.text,
                                    variantConfig.text,
                                    textStyle,
                                ]}
                            >
                                {title}
                            </Text>
                        ) : (
                            children
                        )}

                        {icon && iconPosition === 'right' && (
                            <Ionicons
                                name={icon}
                                size={sizeConfig.iconSize}
                                color={variantConfig.iconColor}
                                style={styles.rightIcon}
                            />
                        )}
                    </View>
                )}
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    baseContainer: {
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    disabledContainer: {
        opacity: 0.6,
    },
    contentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    baseText: {
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    leftIcon: {
        marginRight: 8,
    },
    rightIcon: {
        marginLeft: 8,
    },

    // Sizes
    smContainer: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
    },
    smText: {
        fontSize: 13,
    },
    mdContainer: {
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderRadius: 14,
    },
    mdText: {
        fontSize: 15,
    },
    lgContainer: {
        paddingVertical: 15,
        paddingHorizontal: 22,
        borderRadius: 16,
    },
    lgText: {
        fontSize: 16,
    },

    // Variants
    primaryContainer: {
        backgroundColor: COLORS.primary,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 3,
    },
    primaryHovered: {
        backgroundColor: COLORS.primaryDark,
        shadowOpacity: 0.35,
    },
    primaryText: {
        color: '#ffffff',
    },

    secondaryContainer: {
        backgroundColor: '#ffffff',
        borderWidth: 1.5,
        borderColor: COLORS.primary,
    },
    secondaryHovered: {
        backgroundColor: COLORS.primaryLight,
    },
    secondaryText: {
        color: COLORS.primary,
    },

    dangerContainer: {
        backgroundColor: COLORS.danger,
        shadowColor: COLORS.danger,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 3,
    },
    dangerHovered: {
        backgroundColor: '#dc2626',
        shadowOpacity: 0.35,
    },
    dangerText: {
        color: '#ffffff',
    },

    successContainer: {
        backgroundColor: COLORS.success,
        shadowColor: COLORS.success,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 3,
    },
    successHovered: {
        backgroundColor: '#059669',
        shadowOpacity: 0.35,
    },
    successText: {
        color: '#ffffff',
    },

    ghostContainer: {
        backgroundColor: 'transparent',
    },
    ghostHovered: {
        backgroundColor: COLORS.primaryLight,
    },
    ghostText: {
        color: COLORS.primary,
    },
});

export default AnimatedButton;
