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
    ScrollView,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import API, { getImageUrl } from '../../config/api';
import CustomPickerModal from '../../components/CustomPickerModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import ScreenBackground from '../../components/ScreenBackground';
import AnimatedCard from '../../components/AnimatedCard';
import AnimatedButton from '../../components/AnimatedButton';
import AppLoader from '../../components/AppLoader';
import EmptyState from '../../components/EmptyState';
import { COLORS } from '../../theme/colors';

const UsersScreen = ({ navigation }) => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [programmes, setProgrammes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [modalVisible, setModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        userName: '',
        phoneNumber: '',
        email: '',
        password: '',
        roleName: '',
        deptId: '',
        programmeId: '',
        avatar: '',
    });
    const [submitting, setSubmitting] = useState(false);

    const fetchData = async () => {
        try {
            const [uRes, rRes, dRes, pRes] = await Promise.all([
                API.get('/api/master/users'),
                API.get('/api/master/roles'),
                API.get('/api/master/departments'),
                API.get('/api/master/programmes'),
            ]);
            setUsers(uRes.data);
            setRoles(rRes.data);
            setDepartments(dRes.data);
            setProgrammes(pRes.data);
        } catch (err) {
            console.error('Error fetching users master:', err);
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
            userName: '',
            phoneNumber: '',
            email: '',
            password: '',
            roleName: roles[0]?.roleName || '',
            deptId: '',
            programmeId: '',
            avatar: '',
        });
        setModalVisible(true);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setFormData({
            userName: item.userName || '',
            phoneNumber: item.phoneNumber || '',
            email: item.email || '',
            password: '',
            roleName: item.roleId?.roleName || item.roleName || '',
            deptId: item.deptId?._id || item.deptId || '',
            avatar: item.avatar || '',
            programmeId: item.programmeId?._id || item.programmeId || '',
        });
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!formData.userName.trim() || !formData.email.trim()) {
            Alert.alert('Validation Error', 'Full Name and Email Address are required.');
            return;
        }
        if (formData.phoneNumber && formData.phoneNumber.length !== 10) {
            Alert.alert('Validation Error', 'Phone number must be exactly 10 digits.');
            return;
        }
        if (!formData.roleName) {
            Alert.alert('Validation Error', 'Please select a role / designation.');
            return;
        }

        setSubmitting(true);
        try {
            const payload = { ...formData };
            if (!payload.password) delete payload.password;
            if (!payload.deptId) delete payload.deptId;
            if (!payload.programmeId) delete payload.programmeId;

            if (editingItem) {
                await API.put(`/api/master/users/${editingItem._id}`, payload);
                Alert.alert('Success', 'User updated successfully.');
            } else {
                await API.post('/api/auth/register', payload);
                Alert.alert('Success', 'User registered successfully.');
            }
            setModalVisible(false);
            fetchData();
        } catch (err) {
            console.error('Error saving user:', err);
            const msg = err.response?.data?.message || err.message || 'Operation failed';
            Alert.alert('Error', msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (item) => {
        Alert.alert(
            'Confirm Delete',
            `Are you sure you want to delete user ${item.userName}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await API.delete(`/api/master/users/${item._id}`);
                            fetchData();
                        } catch (err) {
                            Alert.alert('Error', err.response?.data?.message || 'Failed to delete');
                        }
                    },
                },
            ]
        );
    };

    const roleOptions = roles.map((r) => ({
        value: r.roleName,
        label: r.roleName,
    }));

    const departmentOptions = [
        { value: '', label: 'None (Optional)' },
        ...departments.map((d) => ({
            value: d._id,
            label: d.deptName,
        })),
    ];

    const availableProgrammes = [
        { value: '', label: 'None (Optional)' },
        ...programmes
            .filter((p) => {
                if (!formData.deptId) return true;
                const dId = p.deptId?._id || p.deptId;
                return dId === formData.deptId;
            })
            .map((p) => ({
                value: p._id,
                label: p.programmeName,
            })),
    ];

    const filteredList = users.filter((u) => {
        const q = searchQuery.toLowerCase();
        return (
            u.userName?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q) ||
            u.roleId?.roleName?.toLowerCase().includes(q) ||
            u.phoneNumber?.toLowerCase().includes(q)
        );
    });

    if (loading) {
        return (
            <ScreenBackground>
                <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
                    <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
                    <AppLoader message="Loading user directory..." icon="people-outline" />
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
                                placeholder="Search users by name, email, role..."
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
                                    <View style={styles.userRow}>
                                        {item.avatar ? (
                                            <Image
                                                source={{ uri: getImageUrl(item.avatar) }}
                                                style={styles.cardAvatar}
                                                resizeMode="cover"
                                            />
                                        ) : (
                                            <View style={styles.cardAvatarPlaceholder}>
                                                <Text style={styles.cardAvatarText}>
                                                    {(item.userName || 'U').charAt(0).toUpperCase()}
                                                </Text>
                                            </View>
                                        )}
                                        <View style={{ flex: 1 }}>
                                            <View style={styles.nameRow}>
                                        <Text style={styles.cardTitle}>{item.userName}</Text>
                                        <View style={styles.rolePill}>
                                            <Text style={styles.rolePillText}>
                                                {item.roleId?.roleName || 'User'}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={styles.cardSub}>
                                        {item.email} {item.phoneNumber ? `• ${item.phoneNumber}` : ''}
                                    </Text>
                                    {item.deptId && (
                                        <Text style={styles.deptText}>
                                            Dept: {item.deptId.deptName}
                                        </Text>
                                    )}
                                        </View>
                                    </View>
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
                                icon="people-outline"
                                title="No Users Found"
                                description={searchQuery ? 'No users match your search.' : 'No users have been registered yet.'}
                                actionLabel={!searchQuery ? 'Register User' : undefined}
                                onAction={openAddModal}
                                actionIcon="add"
                            />
                        }
                    />

                    {/* Add/Edit Modal */}
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
                                        {editingItem ? 'Edit User' : 'New User Registration'}
                                    </Text>
                                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                                        <Ionicons name="close" size={24} color={COLORS.text} />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView showsVerticalScrollIndicator={false}>
                                    <View style={styles.modalForm}>
                                        <Text style={styles.formLabel}>Full Name *</Text>
                                        <TextInput
                                            style={styles.formInput}
                                            placeholder="e.g. Dr. Rajesh Sharma"
                                            placeholderTextColor={COLORS.textSecondary}
                                            value={formData.userName}
                                            onChangeText={(val) => setFormData({ ...formData, userName: val })}
                                        />

                                        <Text style={styles.formLabel}>Phone (10 digits) *</Text>
                                        <TextInput
                                            style={styles.formInput}
                                            placeholder="e.g. 9876543210"
                                            placeholderTextColor={COLORS.textSecondary}
                                            keyboardType="numeric"
                                            maxLength={10}
                                            value={formData.phoneNumber}
                                            onChangeText={(val) => {
                                                const digitsOnly = val.replace(/\D/g, '');
                                                if (digitsOnly.length <= 10) {
                                                    setFormData({ ...formData, phoneNumber: digitsOnly });
                                                }
                                            }}
                                        />

                                        <Text style={styles.formLabel}>Email Address *</Text>
                                        <TextInput
                                            style={styles.formInput}
                                            placeholder="e.g. user@tms.com"
                                            placeholderTextColor={COLORS.textSecondary}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            value={formData.email}
                                            onChangeText={(val) => setFormData({ ...formData, email: val })}
                                        />

                                        <Text style={styles.formLabel}>
                                            {editingItem ? 'Password (leave blank to keep current)' : 'Password *'}
                                        </Text>
                                        <TextInput
                                            style={styles.formInput}
                                            placeholder="••••••••"
                                            placeholderTextColor={COLORS.textSecondary}
                                            secureTextEntry
                                            value={formData.password}
                                            onChangeText={(val) => setFormData({ ...formData, password: val })}
                                        />

                                        <CustomPickerModal
                                            label="Role / Designation *"
                                            placeholder="Select Role"
                                            options={roleOptions}
                                            selectedValue={formData.roleName}
                                            onValueChange={(val) => setFormData({ ...formData, roleName: val })}
                                            icon="shield-outline"
                                        />

                                        <CustomPickerModal
                                            label="Department (Optional)"
                                            placeholder="Select Department"
                                            options={departmentOptions}
                                            selectedValue={formData.deptId}
                                            onValueChange={(val) =>
                                                setFormData({ ...formData, deptId: val, programmeId: '' })
                                            }
                                            icon="business-outline"
                                        />

                                        <CustomPickerModal
                                            label="Programme (Optional)"
                                            placeholder="Select Programme"
                                            options={availableProgrammes}
                                            selectedValue={formData.programmeId}
                                            onValueChange={(val) => setFormData({ ...formData, programmeId: val })}
                                            icon="school-outline"
                                            disabled={!formData.deptId}
                                        />

                                        <AnimatedButton
                                            title={editingItem ? 'Update User' : 'Register User'}
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
                                            style={{ marginTop: 8, marginBottom: 20 }}
                                        />
                                    </View>
                                </ScrollView>
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
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    cardAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.borderLight,
    },
    cardAvatarPlaceholder: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardAvatarText: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.primaryDark,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
    },
    rolePill: {
        backgroundColor: COLORS.primaryLight,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    rolePillText: {
        fontSize: 11,
        fontWeight: '700',
        color: COLORS.primaryDark,
    },
    cardSub: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    deptText: {
        fontSize: 12,
        color: COLORS.primary,
        fontWeight: '500',
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
        maxHeight: '90%',
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
        marginBottom: 30,
    },
    saveBtnText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '700',
    },
});

export default UsersScreen;
