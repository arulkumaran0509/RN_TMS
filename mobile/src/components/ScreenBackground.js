import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../theme/colors';

const ScreenBackground = ({
    children,
    style,
    gradientColors = ['#f8fafc', '#f1f5f9', '#eef2ff'],
    withDecorations = true,
}) => {
    return (
        <View style={[styles.container, style]}>
            <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
            />

            {withDecorations && (
                <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
                    {/* Soft decorative ambient circles */}
                    <View style={styles.topRightAura} />
                    <View style={styles.bottomLeftAura} />
                    <View style={styles.middleRightAura} />
                </View>
            )}

            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    topRightAura: {
        position: 'absolute',
        top: -80,
        right: -80,
        width: 260,
        height: 260,
        borderRadius: 130,
        backgroundColor: 'rgba(99, 102, 241, 0.06)', // Subtle Indigo tint
    },
    bottomLeftAura: {
        position: 'absolute',
        bottom: -40,
        left: -60,
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: 'rgba(59, 130, 246, 0.05)', // Subtle Blue tint
    },
    middleRightAura: {
        position: 'absolute',
        top: '40%',
        right: -50,
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: 'rgba(168, 85, 247, 0.04)', // Subtle Violet tint
    },
});

export default ScreenBackground;
