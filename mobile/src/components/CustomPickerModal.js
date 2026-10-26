import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    FlatList,
    StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

const CustomPickerModal = ({
    label,
    placeholder = 'Select an option',
    options = [],
    selectedValue,
    onValueChange,
    valueKey = 'value',
    labelKey = 'label',
    icon,
    disabled = false,
}) => {
    const [modalVisible, setModalVisible] = useState(false);

    const selectedOption = options.find(
        (opt) => (typeof opt === 'object' ? opt[valueKey] : opt) === selectedValue
    );

    const displayLabel = selectedOption
        ? typeof selectedOption === 'object'
            ? selectedOption[labelKey]
            : selectedOption
        : null;

    const handleSelect = (item) => {
        const val = typeof item === 'object' ? item[valueKey] : item;
        onValueChange(val);
        setModalVisible(false);
    };

    return (
        <View style={styles.container}>
            {label ? <Text style={styles.label}>{label}</Text> : null}

            <TouchableOpacity
                style={[
                    styles.selector,
                    disabled && styles.selectorDisabled,
                    modalVisible && styles.selectorActive,
                ]}
                onPress={() => !disabled && setModalVisible(true)}
                activeOpacity={0.7}
            >
                <View style={styles.selectorLeft}>
                    {icon && (
                        <Ionicons
                            name={icon}
                            size={18}
                            color={COLORS.textSecondary}
                            style={styles.icon}
                        />
                    )}
                    <Text
                        style={[
                            styles.selectorText,
                            !displayLabel && styles.placeholderText,
                        ]}
                        numberOfLines={1}
                    >
                        {displayLabel || placeholder}
                    </Text>
                </View>
                <Ionicons
                    name="chevron-down"
                    size={18}
                    color={COLORS.textSecondary}
                />
            </TouchableOpacity>

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
                                {label || placeholder}
                            </Text>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                style={styles.closeButton}
                            >
                                <Ionicons
                                    name="close"
                                    size={24}
                                    color={COLORS.text}
                                />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={options}
                            style={{ width: '100%' }}
                            contentContainerStyle={{ paddingVertical: 6 }}
                            keyExtractor={(item, index) =>
                                (typeof item === 'object'
                                    ? item[valueKey]
                                    : item) || index.toString()
                            }
                            renderItem={({ item }) => {
                                const val =
                                    typeof item === 'object'
                                        ? item[valueKey]
                                        : item;
                                const lbl =
                                    typeof item === 'object'
                                        ? item[labelKey]
                                        : item;
                                const itemIcon = typeof item === 'object' ? item.icon : null;
                                const itemDesc = typeof item === 'object' ? item.desc : null;
                                const isSelected = val === selectedValue;

                                return (
                                    <TouchableOpacity
                                        style={[
                                            styles.optionItem,
                                            isSelected && styles.optionItemSelected,
                                        ]}
                                        onPress={() => handleSelect(item)}
                                        activeOpacity={0.7}
                                    >
                                        {itemIcon && (
                                            <View
                                                style={[
                                                    styles.optionIconWrapper,
                                                    isSelected && styles.optionIconWrapperSelected,
                                                ]}
                                            >
                                                <Ionicons
                                                    name={itemIcon}
                                                    size={18}
                                                    color={isSelected ? COLORS.primary : COLORS.textSecondary}
                                                />
                                            </View>
                                        )}
                                        <View style={styles.optionTextGroup}>
                                            <Text
                                                style={[
                                                    styles.optionText,
                                                    isSelected && styles.optionTextSelected,
                                                ]}
                                                numberOfLines={1}
                                            >
                                                {lbl}
                                            </Text>
                                            {itemDesc ? (
                                                <Text
                                                    style={styles.optionDescText}
                                                    numberOfLines={1}
                                                >
                                                    {itemDesc}
                                                </Text>
                                            ) : null}
                                        </View>
                                        {isSelected && (
                                            <Ionicons
                                                name="checkmark-circle"
                                                size={22}
                                                color={COLORS.primary}
                                                style={{ marginLeft: 8 }}
                                            />
                                        )}
                                    </TouchableOpacity>
                                );
                            }}
                            ItemSeparatorComponent={() => (
                                <View style={styles.separator} />
                            )}
                            ListEmptyComponent={() => (
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.emptyText}>
                                        No options available
                                    </Text>
                                </View>
                            )}
                        />
                    </SafeAreaView>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 8,
    },
    selector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.cardBackground,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        minHeight: 48,
    },
    selectorActive: {
        borderColor: COLORS.primary,
    },
    selectorDisabled: {
        backgroundColor: COLORS.borderLight,
        opacity: 0.6,
    },
    selectorLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    icon: {
        marginRight: 10,
    },
    selectorText: {
        flex: 1,
        fontSize: 15,
        color: COLORS.text,
        fontWeight: '500',
        includeFontPadding: false,
    },
    placeholderText: {
        color: COLORS.textSecondary,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
        alignItems: 'stretch',
    },
    modalContent: {
        backgroundColor: COLORS.cardBackground,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '75%',
        paddingBottom: 24,
        width: '100%',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    modalTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: COLORS.text,
    },
    closeButton: {
        padding: 4,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 13,
        marginHorizontal: 12,
        marginVertical: 2,
        borderRadius: 12,
    },
    optionItemSelected: {
        backgroundColor: COLORS.primaryLight,
    },
    optionIconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: COLORS.background,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    optionIconWrapperSelected: {
        backgroundColor: '#ffffff',
        borderColor: COLORS.primary,
    },
    optionTextGroup: {
        flex: 1,
        justifyContent: 'center',
    },
    optionText: {
        fontSize: 15,
        color: COLORS.text,
        fontWeight: '600',
        includeFontPadding: false,
    },
    optionTextSelected: {
        color: COLORS.primaryDark,
        fontWeight: '700',
    },
    optionDescText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 2,
        includeFontPadding: false,
    },
    separator: {
        height: 1,
        backgroundColor: COLORS.borderLight,
        marginHorizontal: 16,
    },
    emptyContainer: {
        padding: 30,
        alignItems: 'center',
    },
    emptyText: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
});

export default CustomPickerModal;
