import React, { useState, useEffect, useContext, useCallback } from 'react';
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
    Alert,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import API, { BACKEND_URL, getImageUrl } from '../../config/api';
import StatusBadge from '../../components/StatusBadge';
import CustomPickerModal from '../../components/CustomPickerModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import ScreenBackground from '../../components/ScreenBackground';
import AnimatedCard from '../../components/AnimatedCard';
import AnimatedButton from '../../components/AnimatedButton';
import AppLoader from '../../components/AppLoader';
import EmptyState from '../../components/EmptyState';
import { COLORS } from '../../theme/colors';

const STATUS_OPTIONS = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Assigned', label: 'Assigned' },
    { value: 'In-Progress', label: 'In-Progress' },
    { value: 'Onhold', label: 'Onhold' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Rejected', label: 'Rejected' },
];

const ManageComplaintsScreen = ({ navigation }) => {
    const { roleName, user } = useContext(AuthContext);
    const [complaints, setComplaints] = useState([]);
    const [staffUsers, setStaffUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');

    // Manage Modal State
    const [activeComplaint, setActiveComplaint] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [newAssignedUser, setNewAssignedUser] = useState('');
    const [updating, setUpdating] = useState(false);

    const isSuperAdmin = roleName === 'SuperAdmin';

    const fetchData = async () => {
        try {
            const [cRes, uRes] = await Promise.allSettled([
                API.get('/api/complaints'),
                API.get('/api/auth/users'),
            ]);
            if (cRes.status === 'fulfilled') {
                setComplaints(cRes.value.data);
            } else {
                console.warn('Error fetching complaints:', cRes.reason?.message);
            }
            if (uRes.status === 'fulfilled') {
                setStaffUsers(uRes.value.data);
            } else {
                console.warn('Error fetching staff users:', uRes.reason?.message);
            }
        } catch (err) {
            console.error('Error fetching complaints or users:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
        const unsubscribe = navigation.addListener('focus', () => {
            fetchData();
        });
        return unsubscribe;
    }, [navigation]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, []);

    const handleOpenManageModal = (complaint) => {
        setActiveComplaint(complaint);
        setNewStatus(complaint.status);
        setNewAssignedUser(complaint.assignedTo?._id || '');
    };

    const handleSaveUpdates = async () => {
        if (!activeComplaint) return;
        setUpdating(true);

        try {
            // Assign Staff first if SuperAdmin & changed
            if (isSuperAdmin && newAssignedUser !== (activeComplaint.assignedTo?._id || '')) {
                await API.patch(`/api/complaints/${activeComplaint._id}/assign`, {
                    assignedTo: newAssignedUser,
                });
            }

            // Update Status if changed
            if (newStatus && newStatus !== activeComplaint.status) {
                await API.patch(`/api/complaints/${activeComplaint._id}/status`, {
                    status: newStatus,
                });
            }

            Alert.alert('Success', 'Complaint updated successfully.');
            setActiveComplaint(null);
            fetchData();
        } catch (err) {
            console.error('Error updating complaint:', err);
            const msg = err.response?.data?.message || err.message || 'Failed to update';
            Alert.alert('Error', msg);
        } finally {
            setUpdating(false);
        }
    };

    const staffOptions = staffUsers.map((u) => ({
        value: u._id,
        label: `${u.userName} (${u.roleId?.roleName || 'Staff'})`,
    }));

    const filteredComplaints = complaints.filter((c) => {
        const normalizedItemStatus = String(c.status ?? '').trim().toLowerCase();
        const normalizedFilter = String(selectedStatusFilter ?? '').trim().toLowerCase();
        const matchesStatus =
            selectedStatusFilter === 'All' || normalizedItemStatus === normalizedFilter;
        const q = searchQuery.toLowerCase();
        const matchesSearch =
            !searchQuery ||
            c.complaintType?.toLowerCase().includes(q) ||
            c.complaintRemarks?.toLowerCase().includes(q) ||
            c.roomNumber?.toLowerCase().includes(q) ||
            c.blockId?.blockName?.toLowerCase().includes(q) ||
            c.userId?.userName?.toLowerCase().includes(q);
        return matchesStatus && matchesSearch;
    });

    const filterOptions = ['All', 'Pending', 'In-Progress', 'Completed'];

    const renderItem = ({ item, index }) => {
        const blockName = item.blockId?.blockName || 'N/A';
        const raisedBy = item.userId?.userName || 'User';

        const normalizedStatus = String(item.status ?? '')
            .trim()
            .toLowerCase();
        const isCompleted = normalizedStatus === 'completed';

        return (
            <AnimatedCard
                delay={Math.min(index * 45, 360)}
                style={styles.card}
            >
                <View style={styles.cardTop}>
                    <View style={styles.cardTopLeft}>
                        <View style={styles.typeBadge}>
                            <Text style={styles.typeBadgeText}>
                                {item.complaintType}
                            </Text>
                        </View>
                        <Text style={styles.raisedByText}>by {raisedBy}</Text>
                    </View>
                    <StatusBadge status={item.status} />
                </View>

                <Text style={styles.remarksText} numberOfLines={2}>
                    {item.complaintRemarks}
                </Text>

                <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                        <Ionicons name="business-outline" size={14} color={COLORS.textSecondary} />
                        <Text style={styles.metaText}>{blockName} • Room {item.roomNumber}</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Ionicons name="person-outline" size={14} color={COLORS.textSecondary} />
                        <Text style={styles.metaText}>
                            {item.assignedTo?.userName || 'Unassigned'}
                        </Text>
                    </View>
                </View>

                {!isCompleted && (
                    <AnimatedButton
                        title={isSuperAdmin ? 'Assign & Update Status' : 'Update Status'}
                        icon="create-outline"
                        variant="outline"
                        size="small"
                        onPress={() => handleOpenManageModal(item)}
                    />
                )}
            </AnimatedCard>
        );
    };

    if (loading) {
        return (
            <ScreenBackground>
                <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
                    <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
                    <AppLoader message="Loading complaints queue..." icon="albums-outline" />
                </SafeAreaView>
            </ScreenBackground>
        );
    }

    return (
        <ScreenBackground>
            <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
                <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
                <View style={styles.container}>
                    {/* Search & Filters */}
                    <View style={styles.headerControls}>
                        <View style={styles.searchBar}>
                            <Ionicons name="search-outline" size={18} color={COLORS.textSecondary} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search by user, block, room, remarks..."
                                placeholderTextColor={COLORS.textSecondary}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                            {searchQuery ? (
                                <TouchableOpacity onPress={() => setSearchQuery('')}>
                                    <Ionicons name="close-circle" size={18} color={COLORS.textSecondary} />
                                </TouchableOpacity>
                            ) : null}
                        </View>

                        <View style={styles.filterRow}>
                            {filterOptions.map((status) => (
                                <TouchableOpacity
                                    key={status}
                                    style={[
                                        styles.filterPill,
                                        selectedStatusFilter === status && styles.filterPillActive,
                                    ]}
                                    onPress={() => setSelectedStatusFilter(status)}
                                >
                                    <Text
                                        style={[
                                            styles.filterPillText,
                                            selectedStatusFilter === status && styles.filterPillTextActive,
                                        ]}
                                    >
                                        {status}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Complaints FlatList */}
                    <FlatList
                        data={filteredComplaints}
                        keyExtractor={(item) => item._id}
                        renderItem={renderItem}
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
                                icon="albums-outline"
                                title="No Complaints Found"
                                description="There are no tickets matching your current filter."
                            />
                        }
                    />

                {/* Manage Complaint Modal */}
                {activeComplaint && (
                    <Modal
                        visible={!!activeComplaint}
                        animationType="slide"
                        transparent={true}
                        onRequestClose={() => setActiveComplaint(null)}
                    >
                        <View style={styles.modalOverlay}>
                            <SafeAreaView style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Manage Ticket</Text>
                                    <TouchableOpacity
                                        onPress={() => setActiveComplaint(null)}
                                        style={styles.closeBtn}
                                    >
                                        <Ionicons name="close" size={24} color={COLORS.text} />
                                    </TouchableOpacity>
                                </View>

                                <FlatList
                                    data={[1]}
                                    keyExtractor={() => 'modal-body'}
                                    contentContainerStyle={{ padding: 20 }}
                                    renderItem={() => (
                                        <View>
                                            <View style={styles.modalTicketSummary}>
                                                <Text style={styles.summaryTitle}>
                                                    {activeComplaint.complaintType} Issue
                                                </Text>
                                                <Text style={styles.summaryLoc}>
                                                    {activeComplaint.blockId?.blockName || 'Block'} • Room {activeComplaint.roomNumber}
                                                </Text>
                                                <Text style={styles.summaryRemarks}>
                                                    "{activeComplaint.complaintRemarks}"
                                                </Text>
                                            </View>

                                            {/* Status Dropdown */}
                                            <CustomPickerModal
                                                label="Ticket Status *"
                                                options={STATUS_OPTIONS}
                                                selectedValue={newStatus}
                                                onValueChange={setNewStatus}
                                                icon="flag-outline"
                                            />

                                            {/* Staff Assignment (SuperAdmin only) */}
                                            {isSuperAdmin && (
                                                <CustomPickerModal
                                                    label="Assign to Staff / Technician"
                                                    placeholder="Select technician"
                                                    options={staffOptions}
                                                    selectedValue={newAssignedUser}
                                                    onValueChange={setNewAssignedUser}
                                                    icon="person-add-outline"
                                                />
                                            )}

                                            {/* Attachment Preview if exists */}
                                            {activeComplaint.attachment && (
                                                <View style={styles.imageSection}>
                                                    <Text style={styles.imageSectionLabel}>
                                                        Attachment:
                                                    </Text>
                                                    <Image
                                                        source={{
                                                            uri: getImageUrl(activeComplaint.attachment),
                                                        }}
                                                        style={styles.modalImage}
                                                        resizeMode="contain"
                                                    />
                                                </View>
                                            )}

                                            {/* Save & Cancel Buttons */}
                                            <View style={styles.modalActions}>
                                                <AnimatedButton
                                                    title="Save Changes"
                                                    onPress={handleSaveUpdates}
                                                    loading={updating}
                                                    disabled={updating}
                                                    icon="checkmark-circle-outline"
                                                    variant="primary"
                                                    size="medium"
                                                />
                                                <AnimatedButton
                                                    title="Cancel"
                                                    onPress={() => setActiveComplaint(null)}
                                                    variant="ghost"
                                                    size="medium"
                                                    style={{ marginTop: 8 }}
                                                />
                                            </View>
                                        </View>
                                    )}
                                />
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
    headerControls: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 10,
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
    cardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    cardTopLeft: {
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
    raisedByText: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    remarksText: {
        fontSize: 14,
        color: COLORS.text,
        lineHeight: 20,
        marginBottom: 12,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primaryLight,
        paddingVertical: 10,
        borderRadius: 10,
        gap: 6,
    },
    actionButtonText: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.primaryDark,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
        marginTop: 12,
    },
    emptySubtitle: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginTop: 4,
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
    modalTicketSummary: {
        backgroundColor: COLORS.background,
        padding: 14,
        borderRadius: 14,
        marginBottom: 16,
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
    },
    summaryLoc: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    summaryRemarks: {
        fontSize: 13,
        color: COLORS.text,
        marginTop: 6,
        fontStyle: 'italic',
    },
    imageSection: {
        marginVertical: 12,
    },
    imageSectionLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 6,
    },
    modalImage: {
        width: '100%',
        height: 180,
        borderRadius: 10,
        backgroundColor: '#000',
    },
    saveButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    saveButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
    },
});

export default ManageComplaintsScreen;
