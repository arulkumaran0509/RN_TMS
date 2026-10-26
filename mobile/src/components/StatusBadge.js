import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { STATUS_COLORS, COLORS } from '../theme/colors';

const getStatusConfig = (rawStatus) => {
    if (!rawStatus) {
        return {
            bg: COLORS.borderLight,
            text: COLORS.textSecondary,
            border: COLORS.border,
        };
    }

    if (STATUS_COLORS[rawStatus]) {
        return STATUS_COLORS[rawStatus];
    }

    const s = String(rawStatus).trim().toLowerCase();
    if (s === 'pending') return STATUS_COLORS['Pending'];
    if (s === 'completed' || s === 'closed' || s === 'resolved') return STATUS_COLORS['Completed'];
    if (s === 'rejected') return STATUS_COLORS['Rejected'];
    if (s === 'in-progress' || s === 'in progress' || s === 'inprogress') return STATUS_COLORS['In-Progress'];
    if (s === 'assigned') return STATUS_COLORS['Assigned'];
    if (s === 'onhold' || s === 'on hold') return STATUS_COLORS['Onhold'];

    return {
        bg: COLORS.borderLight,
        text: COLORS.textSecondary,
        border: COLORS.border,
    };
};

const StatusBadge = ({ status }) => {
    const config = getStatusConfig(status);

    return (
        <View
            style={[
                styles.badge,
                {
                    backgroundColor: config.bg,
                    borderColor: config.border,
                },
            ]}
        >
            <View style={[styles.dot, { backgroundColor: config.text }]} />
            <Text style={[styles.badgeText, { color: config.text }]}>
                {status || 'Unknown'}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
        alignSelf: 'flex-start',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'capitalize',
    },
});

export default StatusBadge;
