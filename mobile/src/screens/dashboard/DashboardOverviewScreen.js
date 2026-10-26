import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    StatusBar,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../../context/AuthContext';
import API from '../../config/api';
import StatCard from '../../components/StatCard';
import AnimatedCard from '../../components/AnimatedCard';
import AnimatedButton from '../../components/AnimatedButton';
import ScreenBackground from '../../components/ScreenBackground';
import AppLoader from '../../components/AppLoader';
import { COLORS } from '../../theme/colors';

const DashboardOverviewScreen = ({ navigation }) => {
    const { user, roleName } = useContext(AuthContext);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Animated progress bar width
    const progressAnim = useRef(new Animated.Value(0)).current;

    const isStaff = [
        'SuperAdmin',
        'Networking Staff',
        'Plumber',
        'Electrician',
        'Technician',
        'Technical Staff',
    ].includes(roleName);
    const canRaise = !['Networking Staff', 'Plumber', 'Electrician', 'Technician', 'Technical Staff'].includes(roleName);

    const fetchStats = async () => {
        const startTime = Date.now();
        try {
            const res = await API.get('/api/complaints/stats');
            const data = res.data || {};
            const total = data.total ?? 0;
            const completed = data.completed ?? data.resolved ?? data.closed ?? 0;
            const inProgress = data.inProgress ?? data.assigned ?? 0;
            const pending = data.pending ?? 0;
            const rate = data.resolutionRate ?? (total > 0 ? Math.min(Math.round((completed / total) * 100), 100) : 0);

            setStats({
                total,
                pending,
                inProgress,
                completed,
            });

            Animated.timing(progressAnim, {
                toValue: rate,
                duration: 900,
                useNativeDriver: false, // width animation
            }).start();
        } catch (err) {
            console.error('Failed to fetch complaint stats:', err);
        } finally {
            const elapsed = Date.now() - startTime;
            const remaining = refreshing ? 0 : Math.max(0, 1000 - elapsed);
            setTimeout(() => {
                setLoading(false);
                setRefreshing(false);
            }, remaining);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchStats();
    }, []);

    const firstName = user?.userName ? user.userName.split(' ')[0] : 'User';
    const completedCount = stats.completed ?? stats.resolved ?? stats.closed ?? 0;
    const totalCount = stats.total || 0;
    const resolutionRate = totalCount > 0 ? Math.min(Math.round((completedCount / totalCount) * 100), 100) : 0;

    useEffect(() => {
        if (!loading) {
            Animated.timing(progressAnim, {
                toValue: resolutionRate,
                duration: 900,
                useNativeDriver: false,
            }).start();
        }
    }, [loading, resolutionRate]);

    if (loading && !refreshing) {
        return (
            <ScreenBackground>
                <SafeAreaView style={styles.safeArea}>
                    <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
                    <AppLoader message="Loading dashboard & ticket metrics..." icon="grid" />
                </SafeAreaView>
            </ScreenBackground>
        );
    }

    return (
        <ScreenBackground>
            <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
                <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
                <ScrollView
                    style={styles.container}
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[COLORS.primary]}
                        />
                    }
                    showsVerticalScrollIndicator={false}
                >
                    {/* Welcome Hero Card with Subtle Gradient */}
                    <AnimatedCard delay={0} style={styles.heroWrapper}>
                        <LinearGradient
                            colors={['#1e1b4b', '#0f172a']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.welcomeCard}
                        >
                            <View style={styles.welcomeTop}>
                                <View style={styles.welcomeTextGroup}>
                                    <View style={styles.roleBadgeWrapper}>
                                        <Text style={styles.welcomeRoleBadge}>
                                            {roleName.toUpperCase()}
                                        </Text>
                                    </View>
                                    <Text style={styles.welcomeTitle}>
                                        Welcome back, {firstName}! 👋
                                    </Text>
                                    <Text style={styles.welcomeSubtitle}>
                                        Real-time operational summary & active tickets.
                                    </Text>
                                </View>
                            </View>

                            {/* Quick Action Buttons */}
                            <View style={styles.welcomeActionRow}>
                                {canRaise && (
                                    <AnimatedButton
                                        title="New Ticket"
                                        icon="add-circle"
                                        size="sm"
                                        variant="primary"
                                        onPress={() => navigation.navigate('RaiseComplaint')}
                                    />
                                )}
                                {isStaff && (
                                    <AnimatedButton
                                        title="Manage All"
                                        icon="list-circle"
                                        size="sm"
                                        variant="secondary"
                                        style={{ backgroundColor: '#ffffff' }}
                                        onPress={() => navigation.navigate('ManageComplaints')}
                                    />
                                )}
                            </View>
                        </LinearGradient>
                    </AnimatedCard>

                    {/* Statistical Metric Cards */}
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionHeader}>Overview Metrics</Text>
                        <Text style={styles.sectionSubtitle}>Tap card to navigate</Text>
                    </View>

                    <View style={styles.statsGrid}>
                        <StatCard
                            title="Total Tickets"
                            value={stats.total}
                            icon="albums"
                            iconColor="#6366f1"
                            bgLightColor="#e0e7ff"
                            delay={40}
                            onPress={() => navigation.navigate('MyComplaints')}
                        />
                        <StatCard
                            title="Pending"
                            value={stats.pending}
                            icon="time"
                            iconColor="#ef4444"
                            bgLightColor="#fee2e2"
                            delay={100}
                            onPress={() => navigation.navigate('MyComplaints')}
                        />
                        <StatCard
                            title="In Progress"
                            value={stats.inProgress}
                            icon="construct"
                            iconColor="#f59e0b"
                            bgLightColor="#fef3c7"
                            delay={160}
                            onPress={() => navigation.navigate('MyComplaints')}
                        />
                        <StatCard
                            title="Resolved"
                            value={stats.completed}
                            icon="checkmark-done-circle"
                            iconColor="#10b981"
                            bgLightColor="#dcfce7"
                            delay={220}
                            onPress={() => navigation.navigate('MyComplaints')}
                        />
                    </View>

                    {/* Animated Resolution Rate Card */}
                    <AnimatedCard delay={260} style={styles.progressCard}>
                        <View style={styles.progressHeaderRow}>
                            <View style={styles.progressLeft}>
                                <Ionicons name="speedometer-outline" size={20} color={COLORS.primary} />
                                <Text style={styles.progressTitle}>Resolution Performance</Text>
                            </View>
                            <Text style={styles.progressPercentText}>{resolutionRate}%</Text>
                        </View>
                        <View style={styles.progressBarTrack}>
                            <Animated.View
                                style={[
                                    styles.progressBarFill,
                                    {
                                        width: progressAnim.interpolate({
                                            inputRange: [0, 100],
                                            outputRange: ['0%', '100%'],
                                        }),
                                    },
                                ]}
                            />
                        </View>
                        <Text style={styles.progressCaption}>
                            {completedCount} of {totalCount} total tickets successfully completed.
                        </Text>
                    </AnimatedCard>

                    {/* Quick Shortcuts */}
                    <Text style={styles.sectionHeader}>Quick Actions</Text>
                    <View style={styles.quickActionsContainer}>
                        {canRaise && (
                            <AnimatedCard
                                delay={300}
                                onPress={() => navigation.navigate('RaiseComplaint')}
                                style={styles.actionCard}
                            >
                                <View style={styles.actionInner}>
                                    <View style={[styles.actionIconWrapper, { backgroundColor: '#e0e7ff' }]}>
                                        <Ionicons name="create-outline" size={24} color={COLORS.primary} />
                                    </View>
                                    <View style={styles.actionTextGroup}>
                                        <Text style={styles.actionTitle}>Raise New Ticket</Text>
                                        <Text style={styles.actionDesc}>Submit an issue with optional photo</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                                </View>
                            </AnimatedCard>
                        )}

                        <AnimatedCard
                            delay={360}
                            onPress={() => navigation.navigate('MyComplaints')}
                            style={styles.actionCard}
                        >
                            <View style={styles.actionInner}>
                                <View style={[styles.actionIconWrapper, { backgroundColor: '#fef3c7' }]}>
                                    <Ionicons name="ticket-outline" size={24} color="#d97706" />
                                </View>
                                <View style={styles.actionTextGroup}>
                                    <Text style={styles.actionTitle}>Track My Tickets</Text>
                                    <Text style={styles.actionDesc}>View status & updates on your complaints</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                            </View>
                        </AnimatedCard>

                        {isStaff && (
                            <AnimatedCard
                                delay={420}
                                onPress={() => navigation.navigate('ManageComplaints')}
                                style={styles.actionCard}
                            >
                                <View style={styles.actionInner}>
                                    <View style={[styles.actionIconWrapper, { backgroundColor: '#dcfce7' }]}>
                                        <Ionicons name="cog-outline" size={24} color="#059669" />
                                    </View>
                                    <View style={styles.actionTextGroup}>
                                        <Text style={styles.actionTitle}>Manage Assigned Tickets</Text>
                                        <Text style={styles.actionDesc}>Assign, update status & resolve tickets</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                                </View>
                            </AnimatedCard>
                        )}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </ScreenBackground>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 36,
    },
    heroWrapper: {
        borderRadius: 22,
        marginBottom: 20,
        overflow: 'hidden',
    },
    welcomeCard: {
        borderRadius: 22,
        padding: 22,
    },
    welcomeTop: {
        marginBottom: 16,
    },
    welcomeTextGroup: {
        flex: 1,
    },
    roleBadgeWrapper: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 8,
        marginBottom: 8,
    },
    welcomeRoleBadge: {
        color: '#e0e7ff',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1,
    },
    welcomeTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#ffffff',
    },
    welcomeSubtitle: {
        fontSize: 13,
        color: '#94a3b8',
        marginTop: 4,
    },
    welcomeActionRow: {
        flexDirection: 'row',
        gap: 10,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        marginTop: 6,
    },
    sectionHeader: {
        fontSize: 17,
        fontWeight: '800',
        color: COLORS.text,
        letterSpacing: 0.2,
    },
    sectionSubtitle: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -6,
        marginBottom: 16,
    },
    progressCard: {
        padding: 16,
        marginBottom: 20,
    },
    progressHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    progressLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    progressTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.text,
    },
    progressPercentText: {
        fontSize: 15,
        fontWeight: '800',
        color: COLORS.primary,
    },
    progressBarTrack: {
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.borderLight,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
        backgroundColor: COLORS.primary,
    },
    progressCaption: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    quickActionsContainer: {
        gap: 10,
        marginTop: 10,
    },
    actionCard: {
        borderRadius: 18,
    },
    actionInner: {
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionIconWrapper: {
        width: 46,
        height: 46,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    actionTextGroup: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.text,
    },
    actionDesc: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
});

export default DashboardOverviewScreen;
