import React, { useContext, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    StatusBar,
    Image,
    TouchableOpacity,
    Modal,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../../context/AuthContext';
import API, { getImageUrl, currentBaseUrl } from '../../config/api';
import ScreenBackground from '../../components/ScreenBackground';
import AnimatedCard from '../../components/AnimatedCard';
import AnimatedButton from '../../components/AnimatedButton';
import { COLORS } from '../../theme/colors';

const ProfileScreen = ({ navigation }) => {
    const { user, roleName, logout, refreshUser } = useContext(AuthContext);
    const [avatarError, setAvatarError] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [avatarInputUrl, setAvatarInputUrl] = useState('');
    const [updatingAvatar, setUpdatingAvatar] = useState(false);

    const avatarUri = getImageUrl(user?.avatar || user?.profileImage);

    const handleLogout = () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out of TMS Pro?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out',
                style: 'destructive',
                onPress: async () => {
                    await logout();
                },
            },
        ]);
    };

    const handleSaveAvatarUrl = async (urlToSave) => {
        const finalUrl = (urlToSave || avatarInputUrl).trim();
        if (!finalUrl) {
            Alert.alert('Error', 'Please provide a valid image URL');
            return;
        }

        setUpdatingAvatar(true);
        try {
            await API.put('/api/auth/profile', { avatar: finalUrl });
            await refreshUser();
            setAvatarError(false);
            setModalVisible(false);
            setAvatarInputUrl('');
            Alert.alert('Success 🎉', 'Profile picture updated successfully!');
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Failed to update avatar';
            Alert.alert('Update Failed', msg);
        } finally {
            setUpdatingAvatar(false);
        }
    };

    const handlePickFromGallery = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Camera roll permissions are required to select photos.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const selectedUri = result.assets[0].uri;
                await handleSaveAvatarUrl(selectedUri);
            }
        } catch (err) {
            console.error('Error picking avatar image:', err);
            Alert.alert('Error', 'Failed to pick image from library');
        }
    };

    const openAvatarModal = () => {
        setAvatarInputUrl(user?.avatar || '');
        setModalVisible(true);
    };

    const firstLetter = user?.userName ? user.userName.charAt(0).toUpperCase() : 'U';

    return (
        <ScreenBackground>
            <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
                <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
                <ScrollView
                    style={styles.container}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Profile Header Card */}
                    <AnimatedCard delay={0} style={styles.profileHeaderCard}>
                        <View style={styles.avatarWrapper}>
                            {avatarUri && !avatarError ? (
                                <Image
                                    source={{ uri: avatarUri }}
                                    style={styles.avatarImage}
                                    resizeMode="cover"
                                    onError={() => setAvatarError(true)}
                                />
                            ) : (
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>{firstLetter}</Text>
                                </View>
                            )}
                            <TouchableOpacity
                                style={styles.editAvatarBadge}
                                onPress={openAvatarModal}
                                activeOpacity={0.8}
                                accessibilityLabel="Change profile picture"
                            >
                                <Ionicons name="camera" size={16} color="#ffffff" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.userName}>{user?.userName || 'User Name'}</Text>
                        <Text style={styles.userEmail}>{user?.email || 'user@domain.com'}</Text>
                        <View style={styles.roleBadge}>
                            <Text style={styles.roleBadgeText}>{roleName}</Text>
                        </View>
                    </AnimatedCard>

                    {/* Account Details Card */}
                    <Text style={styles.sectionTitle}>Account Details</Text>
                    <AnimatedCard delay={100} style={styles.detailsCard}>
                        <View style={styles.infoRow}>
                            <View style={styles.infoLeft}>
                                <Ionicons name="person-outline" size={18} color={COLORS.primary} />
                                <Text style={styles.infoLabel}>Full Name</Text>
                            </View>
                            <Text style={styles.infoValue}>{user?.userName || 'N/A'}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <View style={styles.infoLeft}>
                                <Ionicons name="mail-outline" size={18} color={COLORS.primary} />
                                <Text style={styles.infoLabel}>Email</Text>
                            </View>
                            <Text style={styles.infoValue}>{user?.email || 'N/A'}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <View style={styles.infoLeft}>
                                <Ionicons name="call-outline" size={18} color={COLORS.primary} />
                                <Text style={styles.infoLabel}>Mobile Number</Text>
                            </View>
                            <Text style={styles.infoValue}>{user?.phoneNumber || 'Not provided'}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <View style={styles.infoLeft}>
                                <Ionicons name="shield-outline" size={18} color={COLORS.primary} />
                                <Text style={styles.infoLabel}>Role</Text>
                            </View>
                            <Text style={styles.infoValue}>{roleName}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <View style={styles.infoLeft}>
                                <Ionicons name="business-outline" size={18} color={COLORS.primary} />
                                <Text style={styles.infoLabel}>Department</Text>
                            </View>
                            <Text style={styles.infoValue}>
                                {user?.deptId?.deptName || user?.departmentId?.departmentName || 'General'}
                            </Text>
                        </View>
                    </AnimatedCard>

                    {/* System Settings & Actions */}
                    <Text style={styles.sectionTitle}>System</Text>
                    <AnimatedCard delay={200} style={styles.detailsCard}>
                        <View style={styles.infoRow}>
                            <View style={styles.infoLeft}>
                                <Ionicons name="hardware-chip-outline" size={18} color={COLORS.primary} />
                                <Text style={styles.infoLabel}>App Version</Text>
                            </View>
                            <Text style={styles.infoValue}>v1.0.0 (React Native)</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <View style={styles.infoLeft}>
                                <Ionicons name="server-outline" size={18} color={COLORS.primary} />
                                <Text style={styles.infoLabel}>Backend Status</Text>
                            </View>
                            <Text style={[styles.infoValue, { color: COLORS.success }]}>Connected</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <View style={styles.infoLeft}>
                                <Ionicons name="link-outline" size={18} color={COLORS.primary} />
                                <Text style={styles.infoLabel}>Server URL</Text>
                            </View>
                            <Text style={[styles.infoValue, { fontSize: 12 }]}>{currentBaseUrl}</Text>
                        </View>
                    </AnimatedCard>

                    {/* Sign Out Button */}
                    <AnimatedButton
                        title="Sign Out"
                        icon="log-out-outline"
                        variant="danger"
                        size="large"
                        onPress={handleLogout}
                        style={{ marginTop: 10, marginBottom: 20 }}
                    />
                </ScrollView>

                {/* Edit Avatar Modal */}
                <Modal
                    visible={modalVisible}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalCard}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Update Profile Picture</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <Ionicons name="close" size={22} color={COLORS.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.modalSubtitle}>
                                Enter a Cloudinary URL or pick a new photo from your gallery.
                            </Text>

                            <TextInput
                                style={styles.modalInput}
                                placeholder="https://res.cloudinary.com/..."
                                placeholderTextColor={COLORS.textSecondary}
                                value={avatarInputUrl}
                                onChangeText={setAvatarInputUrl}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />

                            <View style={styles.modalActionButtons}>
                                <TouchableOpacity
                                    style={styles.galleryButton}
                                    onPress={handlePickFromGallery}
                                    disabled={updatingAvatar}
                                >
                                    <Ionicons name="images-outline" size={18} color={COLORS.primary} />
                                    <Text style={styles.galleryButtonText}>Choose from Gallery</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.saveButton, updatingAvatar && styles.disabledButton]}
                                    onPress={() => handleSaveAvatarUrl()}
                                    disabled={updatingAvatar}
                                >
                                    {updatingAvatar ? (
                                        <ActivityIndicator color="#ffffff" size="small" />
                                    ) : (
                                        <Text style={styles.saveButtonText}>Save Picture</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
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
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    profileHeaderCard: {
        backgroundColor: COLORS.cardBackground,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        marginBottom: 20,
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: 12,
    },
    avatarImage: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: COLORS.borderLight,
        borderWidth: 3,
        borderColor: '#ffffff',
    },
    avatar: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    editAvatarBadge: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        backgroundColor: COLORS.primary,
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    avatarText: {
        fontSize: 34,
        fontWeight: '800',
        color: '#ffffff',
    },
    userName: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.text,
    },
    userEmail: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    roleBadge: {
        backgroundColor: COLORS.primaryLight,
        paddingHorizontal: 14,
        paddingVertical: 4,
        borderRadius: 20,
        marginTop: 10,
    },
    roleBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.primaryDark,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 10,
        marginLeft: 4,
    },
    detailsCard: {
        backgroundColor: COLORS.cardBackground,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        marginBottom: 20,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    infoLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    infoLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 14,
        color: COLORS.text,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    modalCard: {
        backgroundColor: COLORS.cardBackground,
        borderRadius: 18,
        padding: 20,
        width: '100%',
        maxWidth: 380,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    modalTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: COLORS.text,
    },
    modalSubtitle: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginBottom: 14,
        lineHeight: 18,
    },
    modalInput: {
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        borderRadius: 10,
        padding: 12,
        fontSize: 14,
        color: COLORS.text,
        backgroundColor: COLORS.background,
        marginBottom: 16,
    },
    modalActionButtons: {
        gap: 10,
    },
    galleryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primaryLight,
        gap: 8,
    },
    galleryButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.primary,
    },
    saveButton: {
        backgroundColor: COLORS.primary,
        padding: 13,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    disabledButton: {
        opacity: 0.6,
    },
    saveButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#ffffff',
    },
});

export default ProfileScreen;
