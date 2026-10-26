import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    TextInput,
    Image,
    Modal,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import API, { BACKEND_URL, getImageUrl } from '../../config/api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ScreenBackground from '../../components/ScreenBackground';
import AnimatedCard from '../../components/AnimatedCard';
import AnimatedButton from '../../components/AnimatedButton';
import AppLoader from '../../components/AppLoader';
import EmptyState from '../../components/EmptyState';
import { COLORS } from '../../theme/colors';

const MyComplaintsScreen = ({ navigation }) => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('All');
    const [selectedComplaint, setSelectedComplaint] = useState(null);

    const fetchComplaints = async () => {
        try {
            const res = await API.get('/api/complaints/my');
            setComplaints(res.data);
        } catch (err) {
            console.error('Error fetching user complaints:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchComplaints();
        });
        return unsubscribe;
    }, [navigation]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchComplaints();
    }, []);

    const filterOptions = ['All', 'Pending', 'In-Progress', 'Completed'];

    const filteredComplaints = complaints.filter((c) => {
        const normalizedItemStatus = String(c.status ?? '').trim().toLowerCase();
        const normalizedFilter = String(selectedFilter ?? '').trim().toLowerCase();
        const matchesFilter =
            selectedFilter === 'All' || normalizedItemStatus === normalizedFilter;
        const q = searchQuery.toLowerCase();
        const matchesSearch =
            !searchQuery ||
            c.complaintType?.toLowerCase().includes(q) ||
            c.complaintRemarks?.toLowerCase().includes(q) ||
            c.roomNumber?.toLowerCase().includes(q) ||
            c.blockId?.blockName?.toLowerCase().includes(q);
        return matchesFilter && matchesSearch;
    });

    const renderComplaintCard = ({ item, index }) => {
        const blockName = item.blockId?.blockName || 'N/A';
        const formattedDate = item.createdAt
            ? new Date(item.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
              })
            : '';

        return (
            <AnimatedCard
                delay={Math.min(index * 45, 360)}
                onPress={() => setSelectedComplaint(item)}
                style={styles.card}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                        <View style={styles.typeBadge}>
                            <Text style={styles.typeBadgeText}>
                                {item.complaintType || 'General'}
                            </Text>
                        </View>
                        <Text style={styles.dateText}>{formattedDate}</Text>
                    </View>
                    <StatusBadge status={item.status} />
                </View>

                <Text style={styles.remarksText} numberOfLines={2}>
                    {item.complaintRemarks}
                </Text>

                <View style={styles.cardFooter}>
                    <View style={styles.locationTag}>
                        <Ionicons
                            name="location-outline"
                            size={14}
                            color={COLORS.textSecondary}
                        />
                        <Text style={styles.locationText}>
                            {blockName} • Room {item.roomNumber || 'N/A'}
                        </Text>
                    </View>

                    {item.assignedTo ? (
                        <View style={styles.assignedTag}>
                            <Ionicons
                                name="person-outline"
                                size={14}
                                color={COLORS.primary}
                            />
                            <Text style={styles.assignedText}>
                                {item.assignedTo?.userName || 'Assigned'}
                            </Text>
                        </View>
                    ) : (
                        <Text style={styles.unassignedText}>Unassigned</Text>
                    )}
                </View>
            </AnimatedCard>
        );
    };

    if (loading && !refreshing) {
        return (
            <ScreenBackground>
                <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
                    <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
                    <AppLoader message="Fetching your tickets..." icon="ticket-outline" />
                </SafeAreaView>
            </ScreenBackground>
        );
    }

    return (
        <ScreenBackground>
            <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
                <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
            <View style={styles.container}>
                {/* Search and Filters */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <Ionicons
                            name="search-outline"
                            size={18}
                            color={COLORS.textSecondary}
                        />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search tickets by block, room, remarks..."
                            placeholderTextColor={COLORS.textSecondary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery ? (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons
                                    name="close-circle"
                                    size={18}
                                    color={COLORS.textSecondary}
                                />
                            </TouchableOpacity>
                        ) : null}
                    </View>

                    {/* Filter Pills */}
                    <View style={styles.filterRow}>
                        {filterOptions.map((f) => (
                            <TouchableOpacity
                                key={f}
                                style={[
                                    styles.filterPill,
                                    selectedFilter === f &&
                                        styles.filterPillActive,
                                ]}
                                onPress={() => setSelectedFilter(f)}
                            >
                                <Text
                                    style={[
                                        styles.filterPillText,
                                        selectedFilter === f &&
                                            styles.filterPillTextActive,
                                    ]}
                                >
                                    {f}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Complaint List */}
                <FlatList
                    data={filteredComplaints}
                    keyExtractor={(item) => item._id}
                    renderItem={renderComplaintCard}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[COLORS.primary]}
                        />
                    }
                    ListEmptyComponent={
                        <EmptyState
                            icon="ticket-outline"
                            title="No tickets found"
                            description={
                                searchQuery || selectedFilter !== 'All'
                                    ? 'No complaints match your current search/filter.'
                                    : "You haven't raised any tickets yet."
                            }
                            actionLabel={selectedFilter === 'All' && !searchQuery ? 'Raise a Complaint' : undefined}
                            onAction={() => navigation.navigate('RaiseComplaint')}
                            actionIcon="add"
                        />
                    }
                />

                {/* Complaint Details Modal */}
                {selectedComplaint && (
                    <Modal
                        visible={!!selectedComplaint}
                        animationType="slide"
                        transparent={true}
                        onRequestClose={() => setSelectedComplaint(null)}
                    >
                        <View style={styles.modalOverlay}>
                            <SafeAreaView style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>
                                        Ticket Details
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => setSelectedComplaint(null)}
                                        style={styles.closeBtn}
                                    >
                                        <Ionicons
                                            name="close"
                                            size={24}
                                            color={COLORS.text}
                                        />
                                    </TouchableOpacity>
                                </View>

                                <FlatList
                                    data={[1]}
                                    keyExtractor={() => 'details'}
                                    contentContainerStyle={{ padding: 20 }}
                                    renderItem={() => (
                                        <View>
                                            <View style={styles.detailRow}>
                                                <Text style={styles.detailLabel}>
                                                    Category:
                                                </Text>
                                                <Text style={styles.detailValue}>
                                                    {selectedComplaint.complaintType}
                                                </Text>
                                            </View>

                                            <View style={styles.detailRow}>
                                                <Text style={styles.detailLabel}>
                                                    Status:
                                                </Text>
                                                <StatusBadge
                                                    status={
                                                        selectedComplaint.status
                                                    }
                                                />
                                            </View>

                                            <View style={styles.detailRow}>
                                                <Text style={styles.detailLabel}>
                                                    Location:
                                                </Text>
                                                <Text style={styles.detailValue}>
                                                    {selectedComplaint.blockId
                                                        ?.blockName || 'N/A'}{' '}
                                                    • Room{' '}
                                                    {selectedComplaint.roomNumber}
                                                </Text>
                                            </View>

                                            <View style={styles.detailRow}>
                                                <Text style={styles.detailLabel}>
                                                    Assigned Staff:
                                                </Text>
                                                <Text style={styles.detailValue}>
                                                    {selectedComplaint.assignedTo
                                                        ?.userName ||
                                                        'Not yet assigned'}
                                                </Text>
                                            </View>

                                            <View style={styles.detailSection}>
                                                <Text style={styles.sectionHeading}>
                                                    Description & Remarks
                                                </Text>
                                                <Text style={styles.remarksBody}>
                                                    {
                                                        selectedComplaint.complaintRemarks
                                                    }
                                                </Text>
                                            </View>

                                            {selectedComplaint.attachment && (
                                                <View
                                                    style={
                                                        styles.detailSection
                                                    }
                                                >
                                                    <Text
                                                        style={
                                                            styles.sectionHeading
                                                        }
                                                    >
                                                        Attached Image
                                                    </Text>
                                                    <Image
                                                        source={{
                                                            uri: getImageUrl(selectedComplaint.attachment),
                                                        }}
                                                        style={
                                                            styles.attachmentImage
                                                        }
                                                        resizeMode="contain"
                                                    />
                                                </View>
                                            )}
                                        </View>
                                    )}
                                />
                                <View style={styles.modalFooter}>
                                    <AnimatedButton
                                        title="Close Details"
                                        onPress={() => setSelectedComplaint(null)}
                                        variant="secondary"
                                        size="medium"
                                    />
                                </View>
                            </SafeAreaView>
                        </View>
                    </Modal>
                )}
            </View>
        </SafeAreaView>
        </ScreenBackground>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 8,
        backgroundColor: COLORS.cardBackground,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 44,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
        color: COLORS.text,
    },
    filterRow: {
        flexDirection: 'row',
        marginTop: 10,
        gap: 8,
    },
    filterPill: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    filterPillActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    filterPillText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    filterPillTextActive: {
        color: '#ffffff',
    },
    listContent: {
        padding: 16,
        paddingBottom: 30,
    },
    card: {
        backgroundColor: COLORS.cardBackground,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    cardHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    typeBadge: {
        backgroundColor: COLORS.primaryLight,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    typeBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.primaryDark,
    },
    dateText: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    remarksText: {
        fontSize: 14,
        color: COLORS.text,
        lineHeight: 20,
        marginBottom: 12,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
        paddingTop: 10,
    },
    locationTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    locationText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    assignedTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    assignedText: {
        fontSize: 12,
        color: COLORS.primaryDark,
        fontWeight: '600',
    },
    unassignedText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontStyle: 'italic',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
        marginTop: 12,
    },
    emptyDesc: {
        fontSize: 13,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginTop: 4,
        marginBottom: 20,
    },
    raiseNowButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
        gap: 6,
    },
    raiseNowText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '700',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.cardBackground,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '85%',
    },
    modalFooter: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
        backgroundColor: COLORS.cardBackground,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
    },
    closeBtn: {
        padding: 4,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    detailLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
    },
    detailSection: {
        marginTop: 16,
    },
    sectionHeading: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 8,
    },
    remarksBody: {
        fontSize: 14,
        color: COLORS.text,
        lineHeight: 22,
        backgroundColor: COLORS.background,
        padding: 12,
        borderRadius: 12,
    },
    attachmentImage: {
        width: '100%',
        height: 220,
        borderRadius: 12,
        backgroundColor: '#000',
    },
});

export default MyComplaintsScreen;
