import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    StatusBar,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import API, { DEFAULT_SERVER_IP, updateServerIp } from '../../config/api';
import CustomPickerModal from '../../components/CustomPickerModal';
import ScreenBackground from '../../components/ScreenBackground';
import AnimatedButton from '../../components/AnimatedButton';
import AnimatedCard from '../../components/AnimatedCard';
import { COLORS } from '../../theme/colors';

export const TMS_ROLES = [
    { value: 'SuperAdmin', label: 'SuperAdmin' },
    { value: 'User', label: 'User' },
    { value: 'Networking Staff', label: 'Networking Staff' },
    { value: 'Plumber', label: 'Plumber' },
    { value: 'Electrician', label: 'Electrician' },
    { value: 'Technician', label: 'Technician' },
    { value: 'Technical Staff', label: 'Technical Staff' },
];

const LoginScreen = () => {
    const { login } = useContext(AuthContext);
    const [email, setEmail] = useState('admin@tms.com');
    const [password, setPassword] = useState('admin123');
    const [showPassword, setShowPassword] = useState(false);
    const [roleOptions, setRoleOptions] = useState(TMS_ROLES);
    const [selectedRole, setSelectedRole] = useState('SuperAdmin');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Server IP Config Modal
    const [settingsVisible, setSettingsVisible] = useState(false);
    const [serverIpInput, setServerIpInput] = useState(DEFAULT_SERVER_IP);
    const [testingConnection, setTestingConnection] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState(null);

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const res = await API.get('/api/auth/roles');
            if (res.data && Array.isArray(res.data) && res.data.length > 0) {
                const fetched = res.data.map((r) => ({
                    value: r.roleName,
                    label: r.roleName,
                }));
                // Merge without duplicates
                const uniqueMap = new Map();
                [...TMS_ROLES, ...fetched].forEach((item) => {
                    uniqueMap.set(item.value, item);
                });
                setRoleOptions(Array.from(uniqueMap.values()));
            }
        } catch (err) {
            console.log('Using default TMS roles:', err.message);
        }
    };

    const handleLogin = async () => {
        setErrorMessage('');

        if (!selectedRole) {
            setErrorMessage('Please select your role / designation to continue.');
            return;
        }

        if (!email.trim() || !password.trim()) {
            setErrorMessage('Please enter your email and password.');
            return;
        }

        setIsSubmitting(true);

        const result = await login(email.trim(), password, selectedRole);
        if (!result.success) {
            setErrorMessage(result.error);
        }

        setIsSubmitting(false);
    };

    const handleTestAndSaveIp = async () => {
        setTestingConnection(true);
        setConnectionStatus(null);
        try {
            await updateServerIp(serverIpInput);
            const res = await API.get('/api/auth/roles', { timeout: 5000 });
            if (res.data && Array.isArray(res.data) && res.data.length > 0) {
                const fetched = res.data.map((r) => ({
                    value: r.roleName,
                    label: r.roleName,
                }));
                const uniqueMap = new Map();
                [...TMS_ROLES, ...fetched].forEach((item) => {
                    uniqueMap.set(item.value, item);
                });
                setRoleOptions(Array.from(uniqueMap.values()));
            }
            setConnectionStatus({
                success: true,
                message: `Connected successfully to http://${serverIpInput.trim()}:5000!`,
            });
            setTimeout(() => {
                setSettingsVisible(false);
            }, 1000);
        } catch (err) {
            setConnectionStatus({
                success: false,
                message: `Connection failed: ${err.message}. Check Wi-Fi / IP.`,
            });
        } finally {
            setTestingConnection(false);
        }
    };

    return (
        <ScreenBackground>
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.container}
                >
                    {/* Top Gear / Settings Bar */}
                    <View style={styles.topUtilityBar}>
                        <TouchableOpacity
                            style={styles.settingsIconBtn}
                            onPress={() => setSettingsVisible(true)}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="settings-outline" size={22} color={COLORS.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Header Brand Section */}
                        <View style={styles.header}>
                            <View style={styles.logoBadge}>
                                <Ionicons name="ticket" size={32} color="#ffffff" />
                            </View>
                            <Text style={styles.brandTitle}>TMS Pro</Text>
                            <Text style={styles.brandSubtitle}>
                                Advanced Ticket Management System
                            </Text>
                        </View>

                        {/* Card Form */}
                        <AnimatedCard delay={120} style={styles.card}>
                            <Text style={styles.cardTitle}>Sign In</Text>
                            <Text style={styles.cardSubtitle}>
                                Welcome back! Access your mobile workspace.
                            </Text>

                            {/* Error banner */}
                            {errorMessage ? (
                                <View style={styles.errorBanner}>
                                    <Ionicons
                                        name="alert-circle"
                                        size={18}
                                        color={COLORS.danger}
                                        style={styles.errorIcon}
                                    />
                                    <Text style={styles.errorText}>{errorMessage}</Text>
                                </View>
                            ) : null}

                            {/* Role Picker (Always Populated with TMS_ROLES) */}
                            <CustomPickerModal
                                label="Designation / Role *"
                                placeholder="Select your role"
                                options={roleOptions}
                                selectedValue={selectedRole}
                                onValueChange={setSelectedRole}
                                icon="person-circle-outline"
                            />

                            {/* Email Input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Email Address</Text>
                                <View style={styles.inputWrapper}>
                                    <Ionicons
                                        name="mail-outline"
                                        size={18}
                                        color={COLORS.textSecondary}
                                        style={styles.inputIcon}
                                    />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="e.g. admin@tms.com"
                                        placeholderTextColor={COLORS.textSecondary}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        value={email}
                                        onChangeText={setEmail}
                                    />
                                </View>
                            </View>

                            {/* Password Input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Password</Text>
                                <View style={styles.inputWrapper}>
                                    <Ionicons
                                        name="lock-closed-outline"
                                        size={18}
                                        color={COLORS.textSecondary}
                                        style={styles.inputIcon}
                                    />
                                    <TextInput
                                        style={[styles.input, { flex: 1 }]}
                                        placeholder="••••••••"
                                        placeholderTextColor={COLORS.textSecondary}
                                        secureTextEntry={!showPassword}
                                        value={password}
                                        onChangeText={setPassword}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowPassword(!showPassword)}
                                        style={styles.eyeButton}
                                    >
                                        <Ionicons
                                            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                            size={18}
                                            color={COLORS.textSecondary}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Animated Login Button */}
                            <AnimatedButton
                                title="Sign In"
                                icon="arrow-forward"
                                iconPosition="right"
                                variant="primary"
                                size="lg"
                                loading={isSubmitting}
                                onPress={handleLogin}
                                style={{ marginTop: 14 }}
                            />
                        </AnimatedCard>

                    {/* Quick Demo Fill Buttons */}
                    <View style={styles.quickFillContainer}>
                        <Text style={styles.quickFillLabel}>Quick Test Logins:</Text>
                        <View style={styles.quickFillRow}>
                            <TouchableOpacity
                                style={styles.quickFillPill}
                                onPress={() => {
                                    setSelectedRole('SuperAdmin');
                                    setEmail('admin@tms.com');
                                    setPassword('admin123');
                                }}
                            >
                                <Text style={styles.quickFillPillText}>Admin</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.quickFillPill}
                                onPress={() => {
                                    setSelectedRole('User');
                                    setEmail('user@tms.com');
                                    setPassword('admin123');
                                }}
                            >
                                <Text style={styles.quickFillPillText}>User</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.quickFillPill}
                                onPress={() => {
                                    setSelectedRole('Networking Staff');
                                    setEmail('network@tms.com');
                                    setPassword('admin123');
                                }}
                            >
                                <Text style={styles.quickFillPillText}>Tech Staff</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Footer Info */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            TMS Mobile Enterprise v1.0 • Node.js Backend
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Server Settings Modal */}
            <Modal
                visible={settingsVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setSettingsVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.settingsModalCard}>
                        <View style={styles.settingsModalHeader}>
                            <Text style={styles.settingsModalTitle}>Backend Connection</Text>
                            <TouchableOpacity onPress={() => setSettingsVisible(false)}>
                                <Ionicons name="close" size={24} color={COLORS.text} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.settingsModalDesc}>
                            Configure your computer's IP address (Port 5000):
                        </Text>

                        <View style={styles.ipInputWrapper}>
                            <Text style={styles.httpPrefix}>http://</Text>
                            <TextInput
                                style={styles.ipTextInput}
                                value={serverIpInput}
                                onChangeText={setServerIpInput}
                                placeholder="192.168.209.27"
                                placeholderTextColor={COLORS.textSecondary}
                                autoCapitalize="none"
                                keyboardType="numbers-and-punctuation"
                            />
                            <Text style={styles.httpSuffix}>:5000</Text>
                        </View>

                        {/* Quick Presets */}
                        <Text style={styles.presetLabel}>Detected IP Presets:</Text>
                        <View style={styles.presetRow}>
                            <TouchableOpacity
                                style={styles.presetBtn}
                                onPress={() => setServerIpInput(DEFAULT_SERVER_IP)}
                            >
                                <Text style={styles.presetBtnText}>Auto ({DEFAULT_SERVER_IP})</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.presetBtn}
                                onPress={() => setServerIpInput('10.32.115.242')}
                            >
                                <Text style={styles.presetBtnText}>Wi-Fi (10.32.115.242)</Text>
                            </TouchableOpacity>
                        </View>

                        {connectionStatus && (
                            <View
                                style={[
                                    styles.connectionBanner,
                                    connectionStatus.success
                                        ? styles.connectionSuccess
                                        : styles.connectionError,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.connectionStatusText,
                                        connectionStatus.success
                                            ? { color: COLORS.success }
                                            : { color: COLORS.danger },
                                    ]}
                                >
                                    {connectionStatus.message}
                                </Text>
                            </View>
                        )}

                        <TouchableOpacity
                            style={styles.testSaveBtn}
                            onPress={handleTestAndSaveIp}
                            disabled={testingConnection}
                        >
                            {testingConnection ? (
                                <ActivityIndicator size="small" color="#ffffff" />
                            ) : (
                                <Text style={styles.testSaveBtnText}>Test & Save Connection</Text>
                            )}
                        </TouchableOpacity>
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
        backgroundColor: COLORS.background,
    },
    container: {
        flex: 1,
    },
    topUtilityBar: {
        alignItems: 'flex-end',
        paddingHorizontal: 20,
        paddingTop: 8,
    },
    settingsIconBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: COLORS.cardBackground,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingBottom: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    logoBadge: {
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    brandTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: COLORS.secondary,
        letterSpacing: -0.5,
    },
    brandSubtitle: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginTop: 4,
        fontWeight: '500',
    },
    card: {
        backgroundColor: COLORS.cardBackground,
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.text,
    },
    cardSubtitle: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginTop: 4,
        marginBottom: 18,
    },
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.dangerLight,
        borderColor: '#fca5a5',
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
    },
    errorIcon: {
        marginRight: 8,
    },
    errorText: {
        flex: 1,
        color: COLORS.danger,
        fontSize: 13,
        fontWeight: '600',
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
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.cardBackground,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        borderRadius: 12,
        paddingHorizontal: 14,
        height: 48,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: COLORS.text,
    },
    eyeButton: {
        padding: 4,
    },
    loginButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        borderRadius: 14,
        height: 50,
        marginTop: 8,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    loginButtonDisabled: {
        opacity: 0.7,
    },
    loginButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
    },
    loginButtonIcon: {
        marginLeft: 8,
    },
    quickFillContainer: {
        marginTop: 18,
        alignItems: 'center',
    },
    quickFillLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginBottom: 8,
    },
    quickFillRow: {
        flexDirection: 'row',
        gap: 8,
    },
    quickFillPill: {
        backgroundColor: COLORS.cardBackground,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 16,
    },
    quickFillPillText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.primary,
    },
    footer: {
        marginTop: 18,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    settingsModalCard: {
        backgroundColor: COLORS.cardBackground,
        borderRadius: 20,
        padding: 22,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    settingsModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    settingsModalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
    },
    settingsModalDesc: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginBottom: 14,
    },
    ipInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
        marginBottom: 14,
    },
    httpPrefix: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: '600',
    },
    ipTextInput: {
        flex: 1,
        fontSize: 15,
        color: COLORS.text,
        paddingHorizontal: 4,
    },
    httpSuffix: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: '600',
    },
    presetLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginBottom: 6,
    },
    presetRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 14,
    },
    presetBtn: {
        backgroundColor: COLORS.primaryLight,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    presetBtnText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.primaryDark,
    },
    connectionBanner: {
        padding: 10,
        borderRadius: 10,
        marginBottom: 12,
    },
    connectionSuccess: {
        backgroundColor: COLORS.successLight,
    },
    connectionError: {
        backgroundColor: COLORS.dangerLight,
    },
    connectionStatusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    testSaveBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },
    testSaveBtnText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '700',
    },
});

export default LoginScreen;
