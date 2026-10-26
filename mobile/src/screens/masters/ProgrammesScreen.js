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

const ProgrammesScreen = ({ navigation }) => {
    const [programmes, setProgrammes] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [modalVisible, setModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        programmeName: '',
        programmeShortName: '',
        deptId: '',
    });
    const [submitting, setSubmitting] = useState(false);

    const fetchData = async () => {
        try {
            const [pRes, dRes] = await Promise.all([
                API.get('/api/master/programmes'),
                API.get('/api/master/departments'),
            ]);
            setProgrammes(pRes.data);
            setDepartments(dRes.data);
        } catch (err) {
            console.error('Error fetching programmes:', err);
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
        setFormData({ programmeName: '', programmeShortName: '', deptId: departments[0]?._id || '' });
        setModalVisible(true);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setFormData({
            programmeName: item.programmeName || '',
            programmeShortName: item.programmeShortName || '',
            deptId: item.deptId?._id || item.deptId || '',
        });
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!formData.programmeName.trim() || !formData.programmeShortName.trim()) {
            Alert.alert('Validation Error', 'Please enter programme name and short name.');
            return;
        }
        if (!formData.deptId) {
            Alert.alert('Validation Error', 'Please select a department.');
            return;
        }

        setSubmitting(true);
        try {
            if (editingItem) {
                await API.put(`/api/master/programmes/${editingItem._id}`, formData);
                Alert.alert('Success', 'Programme updated successfully.');
            } else {
                await API.post('/api/master/programmes', formData);
                Alert.alert('Success', 'Programme created successfully.');
            }
            setModalVisible(false);
            fetchData();
        } catch (err) {
            console.error('Error saving programme:', err);
            const msg = err.response?.data?.message || err.message || 'Operation failed';
            Alert.alert('Error', msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (item) => {
        Alert.alert(
            'Confirm Delete',
            `Are you sure you want to delete ${item.programmeName}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await API.delete(`/api/master/programmes/${item._id}`);
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

    const filteredList = programmes.filter((p) => {
        const q = searchQuery.toLowerCase();
        return (
            p.programmeName?.toLowerCase().includes(q) ||
            p.programmeShortName?.toLowerCase().includes(q) ||
            p.deptId?.deptName?.toLowerCase().includes(q)
        );
    });

    if (loading) {
        return (
            <ScreenBackground>
                <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
                    <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
                    <AppLoader message="Loading programmes..." icon="school-outline" />
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
                                placeholder="Search programmes..."
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
                                    <Text style={styles.cardTitle}>{item.programmeName}</Text>
                                    <Text style={styles.cardSub}>
                                        {item.programmeShortName ? `Short: ${item.programmeShortName} • ` : ''}
                                        Dept: {item.deptId?.deptName || 'N/A'}
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
                                icon="school-outline"
                                title="No Programmes Found"
                                description={searchQuery ? 'No programmes match your search.' : 'No programmes have been added yet.'}
                                actionLabel={!searchQuery ? 'Add Programme' : undefined}
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
                                        {editingItem ? 'Edit Programme' : 'New Programme'}
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
                                        onValueChange={(val) => setFormData({ ...formData, deptId: val })}
                                        icon="business-outline"
                                    />

                                    <Text style={styles.formLabel}>Programme Name *</Text>
                                    <TextInput
                                        style={styles.formInput}
                                        placeholder="e.g. B.Tech Computer Science"
                                        placeholderTextColor={COLORS.textSecondary}
                                        value={formData.programmeName}
                                        onChangeText={(val) => setFormData({ ...formData, programmeName: val })}
                                    />

                                    <Text style={styles.formLabel}>Short Name *</Text>
                                    <TextInput
                                        style={styles.formInput}
                                        placeholder="e.g. BT-CSE"
                                        placeholderTextColor={COLORS.textSecondary}
                                        value={formData.programmeShortName}
                                        onChangeText={(val) => setFormData({ ...formData, programmeShortName: val })}
                                    />

                                    <AnimatedButton
                                        title={editingItem ? 'Update Programme' : 'Save Programme'}
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

export default ProgrammesScreen;
