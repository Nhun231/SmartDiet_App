import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, TextInput, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import { PUBLIC_SERVER_ENDPOINT } from '@env';
const BASE_URL = PUBLIC_SERVER_ENDPOINT;

export default function BMREditScreen({ navigation }) {
    const [gender, setGender] = useState('Nữ');
    const [age, setAge] = useState('21');
    const [height, setHeight] = useState('160');
    const [weight, setWeight] = useState('45');
    const [activity, setActivity] = useState('Vừa');
    const [tdee, setTdee] = useState('');

    const [modalVisible, setModalVisible] = useState(false);
    const [modalField, setModalField] = useState('');
    const [modalValue, setModalValue] = useState('');
    const [modalUnit, setModalUnit] = useState('');

    // Auto fetch data khi mở màn
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = await AsyncStorage.getItem('accessToken');
                const res = await axios.get(`${BASE_URL}/customer/calculate/newest`);
                const data = res.data;
                setGender(data.gender || 'Nữ');
                setAge(String(data.age || ''));
                setHeight(String(data.height || ''));
                setWeight(String(data.weight || ''));
                setActivity(data.activity || 'Vừa');
                setTdee(data.tdee || '');
            } catch (error) {
                console.error('Error fetching user data:', error);
                Alert.alert('Lỗi', 'Không thể lấy dữ liệu hồ sơ.');
            }
        };

        fetchUserData();
    }, []);

    const handleSave = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            const res = await axios.post(
                `${BASE_URL}/customer/calculate`,
                {
                    gender,
                    age: Number(age),
                    height: Number(height),
                    weight: Number(weight),
                    activity: activity.toLowerCase(),
                }
            );

            const data = res.data;
            setTdee(data.tdee);

            await axios.put(
                `${BASE_URL}/users/update`,
                {
                    gender,
                    age,
                    height,
                    weight,
                    activity,
                    tdee: data.tdee,
                }
            );

            Alert.alert('Thành công', 'Đã lưu hồ sơ thành công!');
        } catch (error) {
            console.error('API error:', error);
            Alert.alert('Lỗi', error.response?.data?.message || error.message);
        }
    };

    const handleOpenModal = (field, value) => {
        setModalField(field);
        setModalValue(value);
        let unit = '';
        if (field === 'Chiều cao') unit = 'cm';
        else if (field === 'Cân nặng') unit = 'kg';
        else if (field === 'Tuổi') unit = 'tuổi';
        setModalUnit(unit);
        setModalVisible(true);
    };

    const handleSaveModal = () => {
        if (modalField === 'Chiều cao') setHeight(modalValue);
        else if (modalField === 'Cân nặng') setWeight(modalValue);
        else if (modalField === 'Tuổi') setAge(modalValue);
        setModalVisible(false);
    };

    const handleOpenGenderModal = () => {
        setModalField('Giới tính');
        setModalVisible(true);
    };

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Icon name="arrow-left" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Cập nhật BMR</Text>
                    <View style={{ width: 24 }} />
                </View>
                <TouchableOpacity style={styles.targetButton} onPress={() => navigation.navigate('TargetScreen')}>
                    <Text style={styles.targetButtonText}>Đặt mục tiêu</Text>
                </TouchableOpacity>
            </View>

            {/* Body */}
            <View style={styles.content}>
                {/* Kcal fixed */}
                <TouchableOpacity style={styles.inputRow} activeOpacity={1}>
                    <Text style={styles.inputLabel}>Kcal/ngày</Text>
                    <Text style={styles.inputValue}>{tdee ? tdee : '--'}</Text>
                </TouchableOpacity>

                {/* Editable fields */}
                {[
                    { label: 'Chiều cao', value: height },
                    { label: 'Cân nặng', value: weight },
                    { label: 'Tuổi', value: age },
                ].map((item) => (
                    <TouchableOpacity
                        key={item.label}
                        style={styles.inputRow}
                        onPress={() => handleOpenModal(item.label, item.value)}
                    >
                        <Text style={styles.inputLabel}>{item.label}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.inputValue}>{item.value}</Text>
                            <Icon name="chevron-right" size={24} color="#999" />
                        </View>
                    </TouchableOpacity>
                ))}

                {/* Gender Modal */}
                <TouchableOpacity style={styles.inputRow} onPress={handleOpenGenderModal}>
                    <Text style={styles.inputLabel}>Giới tính</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.inputValue}>{gender}</Text>
                        <Icon name="chevron-right" size={24} color="#999" />
                    </View>
                </TouchableOpacity>

                {/* Exercise Level */}
                <TouchableOpacity
                    style={styles.inputRow}
                    onPress={() => navigation.navigate('ExerciseLevelScreen', { activity, setActivity })}
                >
                    <Text style={styles.inputLabel}>Cường độ luyện tập</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.inputValue}>{activity}</Text>
                        <Icon name="chevron-right" size={24} color="#999" />
                    </View>
                </TouchableOpacity>
            </View>

            {/* Save Button at Bottom */}
            <TouchableOpacity style={[styles.targetButton, { backgroundColor: '#3ECF8C' }]} onPress={handleSave}>
                <Text style={[styles.targetButtonText, { color: '#fff' }]}>Lưu</Text>
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback onPress={() => {}}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Cập nhật {modalField}</Text>

                                {modalField === 'Giới tính' ? (
                                    <>
                                        <TouchableOpacity
                                            style={styles.genderOption}
                                            onPress={() => {
                                                setGender('Nam');
                                                setModalVisible(false);
                                            }}
                                        >
                                            <Text style={styles.genderText}>Nam</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.genderOption}
                                            onPress={() => {
                                                setGender('Nữ');
                                                setModalVisible(false);
                                            }}
                                        >
                                            <Text style={styles.genderText}>Nữ</Text>
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <>
                                        <View style={styles.inputRowModal}>
                                            <TouchableOpacity
                                                onPress={() => setModalValue((+modalValue - 1).toString())}
                                                style={styles.adjustButton}
                                            >
                                                <Icon name="minus" size={22} color="#4CAF50" />
                                            </TouchableOpacity>
                                            <TextInput
                                                style={styles.modalInput}
                                                value={modalValue}
                                                onChangeText={setModalValue}
                                                keyboardType="numeric"
                                            />
                                            <TouchableOpacity
                                                onPress={() => setModalValue((+modalValue + 1).toString())}
                                                style={styles.adjustButton}
                                            >
                                                <Icon name="plus" size={22} color="#4CAF50" />
                                            </TouchableOpacity>
                                        </View>
                                        {modalUnit ? <Text style={styles.unitText}>{modalUnit}</Text> : null}
                                        <TouchableOpacity style={styles.saveButton} onPress={handleSaveModal}>
                                            <Text style={styles.saveButtonText}>Cập nhật</Text>
                                        </TouchableOpacity>
                                    </>
                                )}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9F9F9' },
    header: {
        backgroundColor: '#3ECF8C',
        paddingTop: 50,
        paddingBottom: 15,
        paddingHorizontal: 20,
        flexDirection: 'column',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },

    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
    content: { padding: 20 },
    targetButton: {
        backgroundColor: '#fff',
        borderColor: '#3ECF8C',
        borderWidth: 1,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 20,
        alignSelf: 'center',
        marginBottom: 10,
        marginTop: 20,
    },
    targetButtonText: { color: '#3ECF8C', fontWeight: 'bold', fontSize: 16 },
    inputRow: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        elevation: 2,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    inputLabel: { fontSize: 16, color: '#333', fontWeight: '600' },
    inputValue: { fontSize: 16, color: '#333', fontWeight: '500' },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 25,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 25,
        color: '#3ECF8C',
    },
    inputRowModal: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
    },
    adjustButton: {
        backgroundColor: '#e8f5e9',
        padding: 15,
        borderRadius: 50,
        marginHorizontal: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    modalInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 12,
        textAlign: 'center',
        fontSize: 20,
        width: 100,
    },
    unitText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#888',
        marginBottom: 10,
    },
    saveButton: {
        backgroundColor: '#3ECF8C',
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 15,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    genderOption: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 12,
        backgroundColor: '#f1f8e9',
        marginBottom: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    genderText: {
        fontSize: 18,
        color: '#3ECF8C',
        fontWeight: '600',
    },
});
