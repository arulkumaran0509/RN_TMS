import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    Modal,
    Alert,
    RefreshControl,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import API from '../../config/api';
import CustomPickerModal from '../../components/CustomPickerModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import ScreenBackground from '../../components/ScreenBackground';
import AnimatedCard from '../../components/AnimatedCard';
import AnimatedButton from '../../components/AnimatedButton';
import AppLoader from '../../components/AppLoader';
import EmptyState from '../../components/EmptyState';
import { COLORS } from '../../theme/colors';

const RoomsScreen = ({ navigation }) => {
    const [rooms, setRooms] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [programmes, setProgrammes] = useState([]);
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [modalVisible, setModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        deptId: '',
        programmeId: '',
        blockId: '',
        roomNumber: '',
    });
    const [submitting, setSubmitting] = useState(false);

    const fetchData = async () => {
        try {
            const [rRes, dRes, pRes, bRes] = await Promise.all([
                API.get('/api/master/rooms'),
                API.get('/api/master/departments'),
                API.get('/api/master/programmes'),
                API.get('/api/master/blocks'),
            ]);
            setRooms(rRes.data);
            setDepartments(dRes.data);
            setProgrammes(pRes.data);
            setBlocks(bRes.data);
        } catch (err) {
            console.error('Error fetching rooms data:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, []);

    const openAddModal = () => {
        setEditingItem(null);
        setFormData({
            deptId: departments[0]?._id || '',
            programmeId: '',
            blockId: '',
            roomNumber: '',
        });
        setModalVisible(true);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setFormData({
            deptId: item.deptId?._id || item.deptId || '',
            programmeId: item.programmeId?._id || item.programmeId || '',
            blockId: item.blockId?._id || item.blockId || '',
            roomNumber: item.roomNumber || '',
        });
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!formData.deptId) {
            Alert.alert('Validation Error', 'Please select a department.');
            return;
        }
        if (!formData.programmeId) {
            Alert.alert('Validation Error', 'Please select a programme.');
            return;
        }
        if (!formData.blockId) {
            Alert.alert('Validation Error', 'Please select a block.');
            return;
        }
        if (!formData.roomNumber.trim()) {
            Alert.alert('Validation Error', 'Please enter a room number.');
            return;
        }

        setSubmitting(true);
        try {
            if (editingItem) {
                await API.put(`/api/master/rooms/${editingItem._id}`, formData);
                Alert.alert('Success', 'Room updated successfully.');
            } else {
                await API.post('/api/master/rooms', formData);
                Alert.alert('Success', 'Room created successfully.');
            }
            setModalVisible(false);
            fetchData();
        } catch (err) {
            console.error('Error saving room:', err);
            const msg = err.response?.data?.message || err.message || 'Operation failed';
            Alert.alert('Error', msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (item) => {
        Alert.alert(
            'Confirm Delete',
            `Are you sure you want to delete Room ${item.roomNumber}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await API.delete(`/api/master/rooms/${item._id}`);
                            fetchData();
                        } catch (err) {
                            Alert.alert('Error', err.response?.data?.message || 'Failed to delete');
                        }
                    },
                },
            ]
        );
    };

    const departmentOptions = departments.map((d) => ({
        value: d._id,
        label: d.deptName,
    }));

    const availableProgrammes = programmes
        .filter((p) => {
            const dId = p.deptId?._id || p.deptId;
            return dId === formData.deptId;
        })
        .map((p) => ({
            value: p._id,
            label: p.programmeName,
        }));

    const availableBlocks = blocks
        .filter((b) => {
            const pId = b.programmeId?._id || b.programmeId;
            return pId === formData.programmeId;
        })
        .map((b) => ({
            value: b._id,
            label: b.blockName,
        }));

    const filteredList = rooms.filter((r) => {
        const q = searchQuery.toLowerCase();
        return (
            r.roomNumber?.toLowerCase().includes(q) ||
            r.deptId?.deptName?.toLowerCase().includes(q) ||
            r.blockId?.blockName?.toLowerCase().includes(q)
        );
    });

    if (loading) {
        return (
            <ScreenBackground>
                <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
                    <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
                    <AppLoader message="Loading rooms..." icon="key-outline" />
                </SafeAreaView>
            </ScreenBackground>
        );
    }

    return (
        <ScreenBackground>
            <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
                <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
                <View style={styles.container}>
                    <View style={styles.topBar}>
                        <View style={styles.searchBox}>
                            <Ionicons name="search-outline" size={18} color={COLORS.textSecondary} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search rooms..."
                                placeholderTextColor={COLORS.textSecondary}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>
                        <AnimatedButton
                            title="Add"
                            icon="add"
                            size="small"
                            onPress={openAddModal}
                        />
                    </View>

                    <FlatList
                        data={filteredList}
                        keyExtractor={(item) => item._id}
                        contentContainerStyle={styles.listContent}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
                        }
                        renderItem={({ item, index }) => (
                            <AnimatedCard delay={Math.min(index * 35, 300)} style={styles.card}>
                                <View style={styles.cardLeft}>
                                    <Text style={styles.cardTitle}>Room {item.roomNumber}</Text>
                                    <Text style={styles.cardSub}>
                                        Dept: {item.deptId?.deptName || 'N/A'} • Block: {item.blockId?.blockName || 'N/A'}
                                    </Text>
                                </View>
                                <View style={styles.cardActions}>
                                    <TouchableOpacity
                                        style={styles.actionIconBtn}
                                        onPress={() => openEditModal(item)}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="pencil" size={18} color={COLORS.primary} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.actionIconBtn}
                                        onPress={() => handleDelete(item)}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="trash" size={18} color={COLORS.danger} />
                                    </TouchableOpacity>
                                </View>
                            </AnimatedCard>
                        )}
                        ListEmptyComponent={
                            <EmptyState
                                icon="key-outline"
                                title="No Rooms Found"
                                description={searchQuery ? 'No rooms match your search.' : 'No rooms have been added yet.'}
                                actionLabel={!searchQuery ? 'Add Room' : undefined}
                                onAction={openAddModal}
                                actionIcon="add"
                            />
                        }
                    />

                    <Modal
                        visible={modalVisible}
                        animationType="slide"
                        transparent={true}
                        onRequestClose={() => setModalVisible(false)}
                    >
                        <View style={styles.modalOverlay}>
                            <SafeAreaView style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>
                                        {editingItem ? 'Edit Room' : 'New Room'}
                                    </Text>
                                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                                        <Ionicons name="close" size={24} color={COLORS.text} />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.modalForm}>
                                    <CustomPickerModal
                                        label="Department *"
                                        placeholder="Select Department"
                                        options={departmentOptions}
                                        selectedValue={formData.deptId}
                                        onValueChange={(val) =>
                                            setFormData({
                                                ...formData,
                                                deptId: val,
                                                programmeId: '',
                                                blockId: '',
                                            })
                                        }
                                        icon="business-outline"
                                    />

                                    <CustomPickerModal
                                        label="Programme *"
                                        placeholder={formData.deptId ? 'Select Programme' : 'Select Department First'}
                                        options={availableProgrammes}
                                        selectedValue={formData.programmeId}
                                        onValueChange={(val) =>
                                            setFormData({ ...formData, programmeId: val, blockId: '' })
                                        }
                                        icon="school-outline"
                                        disabled={!formData.deptId}
                                    />

                                    <CustomPickerModal
                                        label="Block *"
                                        placeholder={formData.programmeId ? 'Select Block' : 'Select Programme First'}
                                        options={availableBlocks}
                                        selectedValue={formData.blockId}
                                        onValueChange={(val) =>
                                            setFormData({ ...formData, blockId: val })
                                        }
                                        icon="cube-outline"
                                        disabled={!formData.programmeId}
                                    />

                                    <Text style={styles.formLabel}>Room Number *</Text>
                                    <TextInput
                                        style={styles.formInput}
                                        placeholder="e.g. 101, Lab-2, LH-3"
                                        placeholderTextColor={COLORS.textSecondary}
                                        value={formData.roomNumber}
                                        onChangeText={(val) => setFormData({ ...formData, roomNumber: val })}
                                    />

                                    <AnimatedButton
                                        title={editingItem ? 'Update Room' : 'Save Room'}
                                        onPress={handleSave}
                                        loading={submitting}
                                        disabled={submitting}
                                        icon="checkmark-circle-outline"
                                        style={{ marginTop: 20 }}
                                    />
                                    <AnimatedButton
                                        title="Cancel"
                                        onPress={() => setModalVisible(false)}
                                        variant="ghost"
                                        size="medium"
                                        style={{ marginTop: 8 }}
                                    />
                                </View>
                            </SafeAreaView>
                        </View>
                    </Modal>
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
    topBar: {
        flexDirection: 'row',
        padding: 16,
        gap: 10,
        backgroundColor: COLORS.cardBackground,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    searchBox: {
        flex: 1,
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
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        paddingHorizontal: 16,
        gap: 4,
    },
    addButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '700',
    },
    listContent: {
        padding: 16,
        paddingBottom: 30,
    },
    card: {
        backgroundColor: COLORS.cardBackground,
        borderRadius: 14,
        padding: 16,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    cardLeft: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
    },
    cardSub: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    cardActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionIconBtn: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: COLORS.background,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: COLORS.textSecondary,
        fontSize: 14,
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
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
    },
    modalForm: {
        paddingTop: 8,
    },
    formLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 6,
        marginTop: 6,
    },
    formInput: {
        backgroundColor: COLORS.cardBackground,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        borderRadius: 12,
        paddingHorizontal: 14,
        height: 48,
        fontSize: 14,
        color: COLORS.text,
        marginBottom: 10,
    },
    saveBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 14,
        marginBottom: 10,
    },
    saveBtnText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '700',
    },
});

export default RoomsScreen;
