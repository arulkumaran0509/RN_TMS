import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Image,
    ActivityIndicator,
    Alert,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import API from '../../config/api';
import CustomPickerModal from '../../components/CustomPickerModal';
import ScreenBackground from '../../components/ScreenBackground';
import AnimatedButton from '../../components/AnimatedButton';
import AnimatedCard from '../../components/AnimatedCard';
import AppLoader from '../../components/AppLoader';
import { COLORS } from '../../theme/colors';

const COMPLAINT_TYPES = [
    {
        value: 'PC Hardware',
        label: 'PC Hardware',
        icon: 'desktop-outline',
        desc: 'CPU, monitor, mouse, keyboard & physical faults',
    },
    {
        value: 'PC Software',
        label: 'PC Software',
        icon: 'code-slash-outline',
        desc: 'OS, drivers, updates & local system errors',
    },
    {
        value: 'Application Issues',
        label: 'Application Issues',
        icon: 'apps-outline',
        desc: 'TMS portals, college software & browser errors',
    },
    {
        value: 'Network',
        label: 'Network',
        icon: 'wifi-outline',
        desc: 'Wi-Fi, LAN cable, routing & internet connection',
    },
    {
        value: 'Electronics',
        label: 'Electronics',
        icon: 'flash-outline',
        desc: 'Power switches, lights, projectors, fans & UPS',
    },
    {
        value: 'Plumbing',
        label: 'Plumbing',
        icon: 'water-outline',
        desc: 'Water taps, pipelines, drainage & washroom leaks',
    },
    {
        value: 'Other',
        label: 'Other',
        icon: 'ellipsis-horizontal-circle-outline',
        desc: 'General, furniture & miscellaneous facility issues',
    },
];

const ComplaintRaiseScreen = ({ navigation }) => {
    const [blocks, setBlocks] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [formData, setFormData] = useState({
        blockId: '',
        roomNumber: '',
        complaintType: '',
        complaintRemarks: '',
    });
    const [attachment, setAttachment] = useState(null);
    const [loadingInit, setLoadingInit] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [bRes, rRes] = await Promise.all([
                API.get('/api/master/blocks'),
                API.get('/api/master/rooms'),
            ]);
            setBlocks(bRes.data);
            setRooms(rRes.data);
        } catch (err) {
            console.error('Error fetching block & room masters:', err);
            setStatusMessage({
                type: 'error',
                text: 'Failed to load building blocks and rooms.',
            });
        } finally {
            setLoadingInit(false);
        }
    };

    // Filter rooms according to selected block
    const availableRooms = rooms
        .filter((r) => {
            if (!formData.blockId) return true;
            const bId = r.blockId?._id || r.blockId;
            return bId === formData.blockId;
        })
        .map((r) => ({
            value: r.roomNumber,
            label: `${r.roomNumber} - ${r.roomType || 'Room'}`,
        }));

    const blockOptions = blocks.map((b) => ({
        value: b._id,
        label: `${b.blockName} (${b.blockCode || 'Block'})`,
    }));

    const complaintTypeOptions = COMPLAINT_TYPES;

    const pickImageFromGallery = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Camera roll permissions are required to select photos.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setAttachment(result.assets[0]);
        }
    };

    const takePhotoWithCamera = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Camera permission is required to capture photos.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setAttachment(result.assets[0]);
        }
    };

    const handleRemoveImage = () => {
        setAttachment(null);
    };

    const handleSubmit = async () => {
        setStatusMessage({ type: '', text: '' });

        if (!formData.blockId) {
            setStatusMessage({ type: 'error', text: 'Please select a block.' });
            return;
        }
        if (!formData.roomNumber) {
            setStatusMessage({ type: 'error', text: 'Please select or specify a room number.' });
            return;
        }
        if (!formData.complaintType) {
            setStatusMessage({ type: 'error', text: 'Please select a complaint type category.' });
            return;
        }
        if (!formData.complaintRemarks.trim()) {
            setStatusMessage({ type: 'error', text: 'Please enter a description / remarks of the problem.' });
            return;
        }

        setIsSubmitting(true);

        try {
            const data = new FormData();
            data.append('blockId', formData.blockId);
            data.append('roomNumber', formData.roomNumber);
            data.append('complaintType', formData.complaintType);
            data.append('complaintRemarks', formData.complaintRemarks.trim());

            if (attachment) {
                const localUri = attachment.uri;
                const filename = localUri.split('/').pop() || 'ticket_attachment.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image/jpeg`;

                data.append('attachment', {
                    uri: Platform.OS === 'android' ? localUri : localUri.replace('file://', ''),
                    name: filename,
                    type: type,
                });
            }

            await API.post('/api/complaints', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setStatusMessage({
                type: 'success',
                text: 'Ticket raised successfully! Our team will address it shortly.',
            });

            // Reset form
            setFormData({
                blockId: '',
                roomNumber: '',
                complaintType: '',
                complaintRemarks: '',
            });
            setAttachment(null);

            Alert.alert(
                'Success 🎉',
                'Your ticket has been submitted successfully!',
                [
                    {
                        text: 'Track Ticket',
                        onPress: () => navigation.navigate('MyComplaints'),
                    },
                    { text: 'Raise Another', style: 'cancel' },
                ]
            );
        } catch (err) {
            console.error('Error submitting complaint:', err);
            const msg = err.response?.data?.message || err.message || 'Failed to submit complaint';
            setStatusMessage({ type: 'error', text: msg });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loadingInit) {
        return (
            <ScreenBackground>
                <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
                    <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
                    <AppLoader message="Loading building blocks & rooms..." icon="create-outline" />
                </SafeAreaView>
            </ScreenBackground>
        );
    }

    return (
        <ScreenBackground>
            <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
                <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.container}
                >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.header}>
                        <Text style={styles.title}>Raise a Complaint</Text>
                        <Text style={styles.subtitle}>
                            Please provide precise details and optionally attach a photo.
                        </Text>
                    </View>

                    {/* Status Alert Banner */}
                    {statusMessage.text ? (
                        <View
                            style={[
                                styles.banner,
                                statusMessage.type === 'error'
                                    ? styles.bannerError
                                    : styles.bannerSuccess,
                            ]}
                        >
                            <Ionicons
                                name={
                                    statusMessage.type === 'error'
                                        ? 'alert-circle'
                                        : 'checkmark-circle'
                                }
                                size={20}
                                color={
                                    statusMessage.type === 'error'
                                        ? COLORS.danger
                                        : COLORS.success
                                }
                            />
                            <Text
                                style={[
                                    styles.bannerText,
                                    {
                                        color:
                                            statusMessage.type === 'error'
                                                ? COLORS.danger
                                                : COLORS.success,
                                    },
                                ]}
                            >
                                {statusMessage.text}
                            </Text>
                        </View>
                    ) : null}

                    {/* Form Card */}
                    <AnimatedCard delay={100} style={styles.card}>
                        {/* Block Selector */}
                        <CustomPickerModal
                            label="Block / Building *"
                            placeholder="Select Block"
                            options={blockOptions}
                            selectedValue={formData.blockId}
                            onValueChange={(val) =>
                                setFormData({ ...formData, blockId: val, roomNumber: '' })
                            }
                            icon="cube-outline"
                        />

                        {/* Room Selector */}
                        <CustomPickerModal
                            label="Room Number *"
                            placeholder={
                                formData.blockId
                                    ? 'Select Room'
                                    : 'Select a block first'
                            }
                            options={availableRooms}
                            selectedValue={formData.roomNumber}
                            onValueChange={(val) =>
                                setFormData({ ...formData, roomNumber: val })
                            }
                            icon="key-outline"
                            disabled={!formData.blockId}
                        />

                        {/* Complaint Type */}
                        <CustomPickerModal
                            label="Category / Issue Type *"
                            placeholder="Select Category"
                            options={complaintTypeOptions}
                            selectedValue={formData.complaintType}
                            onValueChange={(val) =>
                                setFormData({ ...formData, complaintType: val })
                            }
                            icon="construct-outline"
                        />

                        {/* Remarks Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Problem Description *</Text>
                            <TextInput
                                style={styles.textArea}
                                placeholder="Describe the problem in detail (e.g. AC cooling malfunction, light switch sparking, water leakage)..."
                                placeholderTextColor={COLORS.textSecondary}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                                value={formData.complaintRemarks}
                                onChangeText={(val) =>
                                    setFormData({ ...formData, complaintRemarks: val })
                                }
                            />
                        </View>

                        {/* Photo Attachment Section */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Photo Evidence (Optional)</Text>

                            {attachment ? (
                                <View style={styles.imagePreviewContainer}>
                                    <Image
                                        source={{ uri: attachment.uri }}
                                        style={styles.imagePreview}
                                    />
                                    <TouchableOpacity
                                        style={styles.removeImageBtn}
                                        onPress={handleRemoveImage}
                                    >
                                        <Ionicons name="trash" size={16} color="#ffffff" />
                                        <Text style={styles.removeImageText}>Remove</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={styles.photoActionRow}>
                                    <TouchableOpacity
                                        style={styles.photoButton}
                                        onPress={takePhotoWithCamera}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="camera" size={20} color={COLORS.primary} />
                                        <Text style={styles.photoButtonText}>Take Photo</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.photoButton}
                                        onPress={pickImageFromGallery}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="images" size={20} color={COLORS.primary} />
                                        <Text style={styles.photoButtonText}>Choose from Gallery</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        {/* Animated Submit Button */}
                        <AnimatedButton
                            title="Submit Ticket"
                            icon="paper-plane"
                            iconPosition="right"
                            variant="primary"
                            size="lg"
                            loading={isSubmitting}
                            onPress={handleSubmit}
                            style={{ marginTop: 10 }}
                        />
                    </AnimatedCard>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
        </ScreenBackground>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    container: {
        flex: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.text,
    },
    subtitle: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    banner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        gap: 8,
    },
    bannerError: {
        backgroundColor: COLORS.dangerLight,
        borderColor: '#fca5a5',
    },
    bannerSuccess: {
        backgroundColor: COLORS.successLight,
        borderColor: '#86efac',
    },
    bannerText: {
        flex: 1,
        fontSize: 13,
        fontWeight: '600',
    },
    card: {
        backgroundColor: COLORS.cardBackground,
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 8,
    },
    textArea: {
        backgroundColor: COLORS.cardBackground,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        borderRadius: 12,
        padding: 14,
        fontSize: 14,
        color: COLORS.text,
        minHeight: 100,
    },
    photoActionRow: {
        flexDirection: 'row',
        gap: 10,
    },
    photoButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primaryLight,
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 12,
        gap: 6,
    },
    photoButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.primaryDark,
    },
    imagePreviewContainer: {
        position: 'relative',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    imagePreview: {
        width: '100%',
        height: 180,
        resizeMode: 'cover',
    },
    removeImageBtn: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: 'rgba(239, 68, 68, 0.9)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 4,
    },
    removeImageText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '700',
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        borderRadius: 14,
        height: 50,
        marginTop: 8,
        gap: 8,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 3,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
    },
});

export default ComplaintRaiseScreen;
