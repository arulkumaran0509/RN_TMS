import React, { useContext, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { COLORS } from '../theme/colors';
import { getImageUrl } from '../config/api';

const CustomDrawerContent = ({ navigation, state }) => {
    const { user, roleName, logout } = useContext(AuthContext);
    const [systemMasterExpanded, setSystemMasterExpanded] = useState(true);
    const [avatarError, setAvatarError] = useState(false);
    const avatarUri = getImageUrl(user?.avatar || user?.profileImage);
    const insets = useSafeAreaInsets();

    const isSuperAdmin = roleName === 'SuperAdmin';
    const isStaff = [
        'SuperAdmin',
        'Networking Staff',
        'Plumber',
        'Electrician',
        'Technician',
        'Technical Staff',
    ].includes(roleName);
    const canRaise = ![
        'Networking Staff',
        'Plumber',
        'Electrician',
        'Technician',
        'Technical Staff',
    ].includes(roleName);

    // Identify current active route
    const currentRouteName = (() => {
        if (!state) return '';
        const currentRoute = state.routes[state.index];
        if (currentRoute?.name === 'MainTabs' && currentRoute.state) {
            const nested = currentRoute.state.routes[currentRoute.state.index];
            return nested?.name || 'OverviewTab';
        }
        return currentRoute?.name || '';
    })();

    const handleLogout = () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out of TMS Pro?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out',
                style: 'destructive',
                onPress: async () => {
                    navigation.closeDrawer();
                    await logout();
                },
            },
        ]);
    };

    const firstLetter = user?.userName ? user.userName.charAt(0).toUpperCase() : 'U';

    const isOverviewActive = currentRouteName === 'OverviewTab' || currentRouteName === 'MainTabs';
    const isRaiseActive = currentRouteName === 'RaiseComplaint';
    const isMyTicketsActive = currentRouteName === 'MyComplaints';
    const isManageActive = currentRouteName === 'ManageComplaints';
    const isProfileActive = currentRouteName === 'Profile';

    return (
        <View
            style={[
                styles.container,
                {
                    paddingTop: Math.max(insets.top, 12),
                    paddingBottom: Math.max(insets.bottom, 12),
                },
            ]}
        >
            {/* Drawer Header with Brand & User Info */}
            <View style={styles.headerContainer}>
                <View style={styles.brandRow}>
                    <View style={styles.brandIconWrapper}>
                        <Ionicons name="construct" size={20} color="#ffffff" />
                    </View>
                    <View style={styles.brandTitleGroup}>
                        <Text style={styles.brandTitle}>TMS Pro</Text>
                        <Text style={styles.brandSubtitle}>Workspace Navigation</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => navigation.closeDrawer()}
                        style={styles.closeButton}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        accessibilityLabel="Close drawer"
                    >
                        <Ionicons name="close" size={20} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* User Info Bar */}
                <View style={styles.userCard}>
                    {avatarUri && !avatarError ? (
                        <Image
                            source={{ uri: avatarUri }}
                            style={styles.avatarImage}
                            onError={() => setAvatarError(true)}
                        />
                    ) : (
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{firstLetter}</Text>
                        </View>
                    )}
                    <View style={styles.userTextGroup}>
                        <Text style={styles.userName} numberOfLines={1}>
                            {user?.userName || 'User'}
                        </Text>
                        <Text style={styles.userEmail} numberOfLines={1}>
                            {user?.email || ''}
                        </Text>
                    </View>
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleBadgeText}>{roleName}</Text>
                    </View>
                </View>
            </View>

            {/* Scrollable Navigation Items */}
            <ScrollView
                style={styles.scrollArea}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                {/* 1. Overview */}
                <TouchableOpacity
                    style={[styles.menuItem, isOverviewActive && styles.menuItemActive]}
                    onPress={() => {
                        navigation.navigate('MainTabs', { screen: 'OverviewTab' });
                        navigation.closeDrawer();
                    }}
                    activeOpacity={0.7}
                >
                    <View
                        style={[
                            styles.menuIconWrapper,
                            isOverviewActive ? styles.menuIconActive : styles.menuIconInactive,
                        ]}
                    >
                        <Ionicons
                            name={isOverviewActive ? 'grid' : 'grid-outline'}
                            size={18}
                            color={isOverviewActive ? COLORS.primary : COLORS.textSecondary}
                        />
                    </View>
                    <Text
                        style={[
                            styles.menuLabel,
                            isOverviewActive && styles.menuLabelActive,
                        ]}
                    >
                        Overview
                    </Text>
                    {isOverviewActive && <View style={styles.activePill} />}
                </TouchableOpacity>

                {/* 2. Raise Ticket */}
                {canRaise && (
                    <TouchableOpacity
                        style={[styles.menuItem, isRaiseActive && styles.menuItemActive]}
                        onPress={() => {
                            navigation.navigate('MainTabs', { screen: 'RaiseComplaint' });
                            navigation.closeDrawer();
                        }}
                        activeOpacity={0.7}
                    >
                        <View
                            style={[
                                styles.menuIconWrapper,
                                isRaiseActive ? styles.menuIconActive : styles.menuIconInactive,
                            ]}
                        >
                            <Ionicons
                                name={isRaiseActive ? 'add-circle' : 'add-circle-outline'}
                                size={19}
                                color={isRaiseActive ? COLORS.primary : COLORS.textSecondary}
                            />
                        </View>
                        <Text
                            style={[
                                styles.menuLabel,
                                isRaiseActive && styles.menuLabelActive,
                            ]}
                        >
                            Raise Ticket
                        </Text>
                        {isRaiseActive && <View style={styles.activePill} />}
                    </TouchableOpacity>
                )}

                {/* 3. My Tickets */}
                <TouchableOpacity
                    style={[styles.menuItem, isMyTicketsActive && styles.menuItemActive]}
                    onPress={() => {
                        navigation.navigate('MainTabs', { screen: 'MyComplaints' });
                        navigation.closeDrawer();
                    }}
                    activeOpacity={0.7}
                >
                    <View
                        style={[
                            styles.menuIconWrapper,
                            isMyTicketsActive ? styles.menuIconActive : styles.menuIconInactive,
                        ]}
                    >
                        <Ionicons
                            name={isMyTicketsActive ? 'ticket' : 'ticket-outline'}
                            size={18}
                            color={isMyTicketsActive ? COLORS.primary : COLORS.textSecondary}
                        />
                    </View>
                    <Text
                        style={[
                            styles.menuLabel,
                            isMyTicketsActive && styles.menuLabelActive,
                        ]}
                    >
                        My Tickets
                    </Text>
                    {isMyTicketsActive && <View style={styles.activePill} />}
                </TouchableOpacity>

                {/* 4. Manage */}
                {isStaff && (
                    <TouchableOpacity
                        style={[styles.menuItem, isManageActive && styles.menuItemActive]}
                        onPress={() => {
                            navigation.navigate('MainTabs', { screen: 'ManageComplaints' });
                            navigation.closeDrawer();
                        }}
                        activeOpacity={0.7}
                    >
                        <View
                            style={[
                                styles.menuIconWrapper,
                                isManageActive ? styles.menuIconActive : styles.menuIconInactive,
                            ]}
                        >
                            <Ionicons
                                name={isManageActive ? 'build' : 'build-outline'}
                                size={18}
                                color={isManageActive ? COLORS.primary : COLORS.textSecondary}
                            />
                        </View>
                        <Text
                            style={[
                                styles.menuLabel,
                                isManageActive && styles.menuLabelActive,
                            ]}
                        >
                            Manage
                        </Text>
                        {isManageActive && <View style={styles.activePill} />}
                    </TouchableOpacity>
                )}

                {/* 5. System Master Section */}
                {isSuperAdmin && (
                    <View style={styles.masterSectionContainer}>
                        <TouchableOpacity
                            style={styles.masterHeaderButton}
                            onPress={() => setSystemMasterExpanded(!systemMasterExpanded)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.masterHeaderLeft}>
                                <View style={styles.masterHeaderIconWrapper}>
                                    <Ionicons name="cube-outline" size={18} color={COLORS.primary} />
                                </View>
                                <Text style={styles.masterHeaderTitle}>System Master</Text>
                            </View>
                            <Ionicons
                                name={systemMasterExpanded ? 'chevron-down' : 'chevron-forward'}
                                size={16}
                                color={COLORS.textSecondary}
                            />
                        </TouchableOpacity>

                        {/* Sub-items in exact order */}
                        {systemMasterExpanded && (
                            <View style={styles.masterSubList}>
                                {/* Departments */}
                                <TouchableOpacity
                                    style={[
                                        styles.subMenuItem,
                                        currentRouteName === 'Departments' && styles.subMenuItemActive,
                                    ]}
                                    onPress={() => {
                                        navigation.navigate('Departments');
                                        navigation.closeDrawer();
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.subIconWrapper, { backgroundColor: '#eff6ff' }]}>
                                        <Ionicons name="business" size={16} color="#2563eb" />
                                    </View>
                                    <Text
                                        style={[
                                            styles.subItemLabel,
                                            currentRouteName === 'Departments' && styles.subItemLabelActive,
                                        ]}
                                    >
                                        Departments
                                    </Text>
                                    {currentRouteName === 'Departments' && <View style={styles.subActiveDot} />}
                                </TouchableOpacity>

                                {/* Programmes */}
                                <TouchableOpacity
                                    style={[
                                        styles.subMenuItem,
                                        currentRouteName === 'Programmes' && styles.subMenuItemActive,
                                    ]}
                                    onPress={() => {
                                        navigation.navigate('Programmes');
                                        navigation.closeDrawer();
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.subIconWrapper, { backgroundColor: '#f5f3ff' }]}>
                                        <Ionicons name="school" size={16} color="#7c3aed" />
                                    </View>
                                    <Text
                                        style={[
                                            styles.subItemLabel,
                                            currentRouteName === 'Programmes' && styles.subItemLabelActive,
                                        ]}
                                    >
                                        Programmes
                                    </Text>
                                    {currentRouteName === 'Programmes' && <View style={styles.subActiveDot} />}
                                </TouchableOpacity>

                                {/* Blocks */}
                                <TouchableOpacity
                                    style={[
                                        styles.subMenuItem,
                                        currentRouteName === 'Blocks' && styles.subMenuItemActive,
                                    ]}
                                    onPress={() => {
                                        navigation.navigate('Blocks');
                                        navigation.closeDrawer();
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.subIconWrapper, { backgroundColor: '#fdf2f8' }]}>
                                        <Ionicons name="cube" size={16} color="#db2777" />
                                    </View>
                                    <Text
                                        style={[
                                            styles.subItemLabel,
                                            currentRouteName === 'Blocks' && styles.subItemLabelActive,
                                        ]}
                                    >
                                        Blocks
                                    </Text>
                                    {currentRouteName === 'Blocks' && <View style={styles.subActiveDot} />}
                                </TouchableOpacity>

                                {/* Rooms */}
                                <TouchableOpacity
                                    style={[
                                        styles.subMenuItem,
                                        currentRouteName === 'Rooms' && styles.subMenuItemActive,
                                    ]}
                                    onPress={() => {
                                        navigation.navigate('Rooms');
                                        navigation.closeDrawer();
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.subIconWrapper, { backgroundColor: '#ecfdf5' }]}>
                                        <Ionicons name="key" size={16} color="#059669" />
                                    </View>
                                    <Text
                                        style={[
                                            styles.subItemLabel,
                                            currentRouteName === 'Rooms' && styles.subItemLabelActive,
                                        ]}
                                    >
                                        Rooms
                                    </Text>
                                    {currentRouteName === 'Rooms' && <View style={styles.subActiveDot} />}
                                </TouchableOpacity>

                                {/* Roles */}
                                <TouchableOpacity
                                    style={[
                                        styles.subMenuItem,
                                        currentRouteName === 'Roles' && styles.subMenuItemActive,
                                    ]}
                                    onPress={() => {
                                        navigation.navigate('Roles');
                                        navigation.closeDrawer();
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.subIconWrapper, { backgroundColor: '#fff7ed' }]}>
                                        <Ionicons name="shield-checkmark" size={16} color="#ea580c" />
                                    </View>
                                    <Text
                                        style={[
                                            styles.subItemLabel,
                                            currentRouteName === 'Roles' && styles.subItemLabelActive,
                                        ]}
                                    >
                                        Roles
                                    </Text>
                                    {currentRouteName === 'Roles' && <View style={styles.subActiveDot} />}
                                </TouchableOpacity>

                                {/* Users */}
                                <TouchableOpacity
                                    style={[
                                        styles.subMenuItem,
                                        currentRouteName === 'Users' && styles.subMenuItemActive,
                                    ]}
                                    onPress={() => {
                                        navigation.navigate('Users');
                                        navigation.closeDrawer();
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.subIconWrapper, { backgroundColor: '#e0e7ff' }]}>
                                        <Ionicons name="people" size={16} color="#4f46e5" />
                                    </View>
                                    <Text
                                        style={[
                                            styles.subItemLabel,
                                            currentRouteName === 'Users' && styles.subItemLabelActive,
                                        ]}
                                    >
                                        Users
                                    </Text>
                                    {currentRouteName === 'Users' && <View style={styles.subActiveDot} />}
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>

            {/* Bottom Section: Logout and Profile (Profile as the final item at the bottom) */}
            <View style={styles.bottomSection}>
                {/* 6. Logout */}
                <TouchableOpacity
                    style={styles.logoutItem}
                    onPress={handleLogout}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="Logout"
                >
                    <View style={styles.logoutIconWrapper}>
                        <Ionicons name="log-out-outline" size={18} color={COLORS.danger} />
                    </View>
                    <Text style={styles.logoutLabel}>Logout</Text>
                </TouchableOpacity>

                {/* 7. Profile (Last item at the bottom of the drawer) */}
                <TouchableOpacity
                    style={[styles.profileItem, isProfileActive && styles.profileItemActive]}
                    onPress={() => {
                        navigation.navigate('Profile');
                        navigation.closeDrawer();
                    }}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="Profile"
                >
                    <View
                        style={[
                            styles.profileIconWrapper,
                            isProfileActive ? styles.profileIconActive : styles.profileIconInactive,
                        ]}
                    >
                        <Ionicons
                            name={isProfileActive ? 'person' : 'person-outline'}
                            size={18}
                            color={isProfileActive ? '#ffffff' : COLORS.primary}
                        />
                    </View>
                    <View style={styles.profileTextGroup}>
                        <Text style={[styles.profileLabel, isProfileActive && styles.profileLabelActive]}>
                            Profile
                        </Text>
                        <Text style={styles.profileSubLabel} numberOfLines={1}>
                            {user?.userName || 'Account details'}
                        </Text>
                    </View>
                    <Ionicons
                        name="chevron-forward"
                        size={16}
                        color={isProfileActive ? COLORS.primary : COLORS.textSecondary}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.cardBackground,
        height: '100%',
    },
    headerContainer: {
        paddingHorizontal: 16,
        paddingTop: 4,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
        backgroundColor: COLORS.cardBackground,
    },
    brandRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    brandIconWrapper: {
        width: 34,
        height: 34,
        borderRadius: 9,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 2,
    },
    brandTitleGroup: {
        flex: 1,
    },
    brandTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.text,
        letterSpacing: 0.3,
    },
    brandSubtitle: {
        fontSize: 11,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    closeButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.background,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        borderRadius: 12,
        padding: 8,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    avatarImage: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 10,
        backgroundColor: COLORS.borderLight,
    },
    avatar: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    avatarText: {
        fontSize: 15,
        fontWeight: '800',
        color: '#ffffff',
    },
    userTextGroup: {
        flex: 1,
    },
    userName: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.text,
    },
    userEmail: {
        fontSize: 11,
        color: COLORS.textSecondary,
        marginTop: 1,
    },
    roleBadge: {
        backgroundColor: COLORS.primaryLight,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    roleBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: COLORS.primaryDark,
    },
    scrollArea: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
        marginBottom: 3,
    },
    menuItemActive: {
        backgroundColor: COLORS.primaryLight,
    },
    menuIconWrapper: {
        width: 30,
        height: 30,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    menuIconActive: {
        backgroundColor: '#ffffff',
    },
    menuIconInactive: {
        backgroundColor: COLORS.background,
    },
    menuLabel: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
    },
    menuLabelActive: {
        color: COLORS.primary,
        fontWeight: '700',
    },
    activePill: {
        width: 4,
        height: 16,
        borderRadius: 2,
        backgroundColor: COLORS.primary,
    },
    masterSectionContainer: {
        marginTop: 4,
        marginBottom: 4,
    },
    masterHeaderButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        marginBottom: 3,
    },
    masterHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    masterHeaderIconWrapper: {
        width: 30,
        height: 30,
        borderRadius: 8,
        backgroundColor: COLORS.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    masterHeaderTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.text,
    },
    masterSubList: {
        paddingLeft: 10,
        paddingTop: 1,
    },
    subMenuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 7,
        paddingHorizontal: 10,
        borderRadius: 8,
        marginBottom: 2,
    },
    subMenuItemActive: {
        backgroundColor: COLORS.primaryLight,
    },
    subIconWrapper: {
        width: 26,
        height: 26,
        borderRadius: 7,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    subItemLabel: {
        flex: 1,
        fontSize: 13,
        fontWeight: '500',
        color: COLORS.text,
    },
    subItemLabelActive: {
        color: COLORS.primary,
        fontWeight: '700',
    },
    subActiveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.primary,
    },
    bottomSection: {
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
        paddingHorizontal: 12,
        paddingTop: 8,
        backgroundColor: COLORS.cardBackground,
    },
    logoutItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
        marginBottom: 6,
    },
    logoutIconWrapper: {
        width: 30,
        height: 30,
        borderRadius: 8,
        backgroundColor: '#fee2e2',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    logoutLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.danger,
    },
    profileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    profileItemActive: {
        backgroundColor: COLORS.primaryLight,
        borderColor: COLORS.primaryLight,
    },
    profileIconWrapper: {
        width: 30,
        height: 30,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    profileIconActive: {
        backgroundColor: COLORS.primary,
    },
    profileIconInactive: {
        backgroundColor: COLORS.cardBackground,
    },
    profileTextGroup: {
        flex: 1,
    },
    profileLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.text,
    },
    profileLabelActive: {
        color: COLORS.primaryDark,
    },
    profileSubLabel: {
        fontSize: 11,
        color: COLORS.textSecondary,
        marginTop: 1,
    },
});

export default CustomDrawerContent;
