import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Modal,
    Pressable,
    TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { KeyboardAvoidingView, Platform } from 'react-native';

const targets = [
    { label: 'Giảm cân', desc: 'Quản lý cân nặng bằng cách ăn uống thông minh hơn' },
    { label: 'Giữ nguyên cân nặng', desc: 'Tối ưu cho sức khoẻ và vóc dáng hiện tại' },
    { label: 'Tăng cân', desc: 'Tăng cân hiệu quả với chế độ eat clean' },
];

export default function TargetScreen({ navigation }) {
    const [selectedTarget, setSelectedTarget] = useState('Giữ nguyên cân nặng');
    const [modalVisible, setModalVisible] = useState(false);
    const [targetWeight, setTargetWeight] = useState(50);
    const [inputText, setInputText] = useState('50');

    const adjustWeight = (amount) => {
        const newWeight = targetWeight + amount;
        if (newWeight >= 20 && newWeight <= 200) {
            setTargetWeight(newWeight);
            setInputText(newWeight.toString());
        }
    };


    const handleSelect = (target) => {
        setSelectedTarget(target);
        if (target === 'Giảm cân' || target === 'Tăng cân') {
            setModalVisible(true);
        }
    };

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Mục tiêu</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Question */}
            <Text style={styles.question}>Mục tiêu của bạn là gì?</Text>

            {/* Options */}
            {targets.map((target) => {
                const isSelected = selectedTarget === target.label;
                return (
                    <TouchableOpacity
                        key={target.label}
                        style={[styles.option, isSelected && styles.optionSelected]}
                        onPress={() => handleSelect(target.label)}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.label, isSelected && styles.labelSelected]}>{target.label}</Text>
                        <Text style={styles.desc}>{target.desc}</Text>
                    </TouchableOpacity>
                );
            })}

            {/* Modal */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={modalStyles.modalOverlay}
                    keyboardVerticalOffset={Platform.OS === 'android' ? 20 : 0}
                >
                    <View style={modalStyles.modalContainer}>
                        <Text style={modalStyles.modalTitle}>Nhập cân nặng mục tiêu</Text>
                        <View style={modalStyles.weightRow}>
                            <TouchableOpacity onPress={() => adjustWeight(-1)} style={modalStyles.button}>
                                <Icon name="minus" size={24} color="#333" />
                            </TouchableOpacity>
                            <TextInput
                                style={modalStyles.inputField}
                                value={inputText}
                                onChangeText={(text) => setInputText(text.replace(/[^0-9]/g, ''))} // chỉ cho số
                                keyboardType="numeric"
                            />
                            <Text style={{ fontSize: 16, color: '#666', marginTop: 5 }}>kg</Text>
                            <TouchableOpacity onPress={() => adjustWeight(1)} style={modalStyles.button}>
                                <Icon name="plus" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>
                        <Pressable
                            style={modalStyles.saveButton}
                            onPress={() => {
                                const num = parseInt(inputText);
                                if (!isNaN(num) && num >= 20 && num <= 200) {
                                    setTargetWeight(num);
                                }
                                setModalVisible(false);
                            }}
                        >
                            <Text style={modalStyles.saveButtonText}>Lưu</Text>
                        </Pressable>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9F9F9' },
    header: {
        backgroundColor: '#4CAF50',
        paddingTop: 30,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    backButton: { padding: 8, borderRadius: 20 },
    headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
    question: {
        fontSize: 20,
        color: '#4CAF50',
        textAlign: 'center',
        marginVertical: 30,
        fontWeight: 'bold',
    },
    option: {
        backgroundColor: '#fff',
        padding: 19,
        borderRadius: 16,
        marginHorizontal: 22,
        marginBottom: 21,
        borderWidth: 1,
        borderColor: '#ddd',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    optionSelected: {
        borderColor: '#4CAF50',
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    label: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: '#333' },
    labelSelected: { color: '#4CAF50' },
    desc: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 8 },
});

// Styles riêng cho modal (không ảnh hưởng layout gốc)
const modalStyles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        padding: 20, // Giúp modal không sát mép
    },
    modalContainer: {
        width: '100%',
        maxWidth: 350,
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingVertical: 25,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    modalTitle: { fontSize: 19, fontWeight: 'bold', marginBottom: 20, color: '#4CAF50', textAlign: 'center' },
    weightRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
    },
    button: {
        backgroundColor: '#eee',
        padding: 10,
        borderRadius: 50,
        marginHorizontal: 15,
    },
    weightText: { fontSize: 24, fontWeight: 'bold', color: '#333', minWidth: 100, textAlign: 'center' },
    saveButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
    },
    saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    inputField: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 12,
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        minWidth: 100,
        textAlign: 'center',
        marginHorizontal: 10,
    },

});
