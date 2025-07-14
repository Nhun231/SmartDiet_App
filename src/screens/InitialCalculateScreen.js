import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    TextInput,
    Alert,
    Modal,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Slider from '@react-native-community/slider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const BASE_URL = '172.24.192.1:8080/smartdiet';

const activityOptions = [
    { label: 'Ít', value: 'ít' },
    { label: 'Nhẹ', value: 'nhẹ' },
    { label: 'Vừa', value: 'vừa' },
    { label: 'Nhiều', value: 'nhiều' },
    { label: 'Cực nhiều', value: 'cực_nhiều' },
];

export default function InitialScreen({ navigation }) {
    const [gender, setGender] = useState('Nam');
    const [age, setAge] = useState(18);
    const [height, setHeight] = useState(170);
    const [weight, setWeight] = useState(60);
    const [activity, setActivity] = useState('vừa');
    const [modalVisible, setModalVisible] = useState(false);

    const saveInitialData = async () => {
        try {
            await axios.post(`${BASE_URL}/customer/calculate`, {
                gender,
                age,
                height,
                weight,
                activity,
            });

            Alert.alert('Thành công', 'Đã lưu dữ liệu thành công!');

            const accessToken = await AsyncStorage.getItem('accessToken');
            if (accessToken) {
                await axios.put(
                    `${BASE_URL}/users/update`,
                    {
                        gender,
                        age,
                        height,
                        weight,
                        activity,
                    }
                );
                console.log('Đã update hồ sơ user thành công!');
            }

            navigation.replace('TargetScreen');
        } catch (error) {
            Alert.alert('Lỗi', error.response?.data?.message || error.message);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Chỉ số trao đổi chất (BMR)</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardLabel}>Cường độ luyện tập</Text>
                    <TouchableOpacity style={styles.selectButton} onPress={() => setModalVisible(true)}>
                        <Text style={styles.selectButtonText}>
                            {activityOptions.find((item) => item.value === activity)?.label || 'Chọn'}
                        </Text>
                        <Icon name="chevron-down" size={24} color="#4CAF50" />
                    </TouchableOpacity>
                </View>

                <View style={styles.body}>
                    {/* Gender */}
                    <View style={styles.genderRow}>
                        <TouchableOpacity
                            style={[styles.genderButton, gender === 'Nam' && styles.genderSelected]}
                            onPress={() => setGender('Nam')}
                        >
                            <Icon name="gender-male" size={30} color="#fff" />
                            <Text style={styles.genderText}>Nam</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.genderButton, gender === 'Nữ' && styles.genderSelected]}
                            onPress={() => setGender('Nữ')}
                        >
                            <Icon name="gender-female" size={30} color="#fff" />
                            <Text style={styles.genderText}>Nữ</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Height */}
                    <View style={styles.row}>
                        <Text style={styles.label}>Chiều cao</Text>
                        <Text style={styles.value}>{height} cm</Text>
                    </View>
                    <Slider
                        minimumValue={100}
                        maximumValue={220}
                        step={1}
                        value={height}
                        onValueChange={setHeight}
                        minimumTrackTintColor="#4CAF50"
                        maximumTrackTintColor="#ccc"
                        thumbTintColor="#4CAF50"
                    />
                    <View style={styles.sliderRow}>
                        <TouchableOpacity onPress={() => setHeight(height - 1)}>
                            <Icon name="minus-circle" size={30} color="#4CAF50" />
                        </TouchableOpacity>
                        <TextInput
                            value={height.toString()}
                            onChangeText={(val) => setHeight(Number(val))}
                            keyboardType="numeric"
                            style={styles.input}
                        />
                        <TouchableOpacity onPress={() => setHeight(height + 1)}>
                            <Icon name="plus-circle" size={30} color="#4CAF50" />
                        </TouchableOpacity>
                    </View>

                    {/* Weight */}
                    <View style={styles.row}>
                        <Text style={styles.label}>Cân nặng</Text>
                        <Text style={styles.value}>{weight} kg</Text>
                    </View>
                    <Slider
                        minimumValue={30}
                        maximumValue={150}
                        step={0.5}
                        value={weight}
                        onValueChange={setWeight}
                        minimumTrackTintColor="#4CAF50"
                        maximumTrackTintColor="#ccc"
                        thumbTintColor="#4CAF50"
                    />
                    <View style={styles.sliderRow}>
                        <TouchableOpacity onPress={() => setWeight(weight - 0.5)}>
                            <Icon name="minus-circle" size={30} color="#4CAF50" />
                        </TouchableOpacity>
                        <TextInput
                            value={weight.toString()}
                            onChangeText={(val) => setWeight(Number(val))}
                            keyboardType="numeric"
                            style={styles.input}
                        />
                        <TouchableOpacity onPress={() => setWeight(weight + 0.5)}>
                            <Icon name="plus-circle" size={30} color="#4CAF50" />
                        </TouchableOpacity>
                    </View>

                    {/* Age */}
                    <View style={styles.row}>
                        <Text style={styles.label}>Tuổi</Text>
                        <Text style={styles.value}>{age} tuổi</Text>
                    </View>
                    <Slider
                        minimumValue={10}
                        maximumValue={100}
                        step={1}
                        value={age}
                        onValueChange={setAge}
                        minimumTrackTintColor="#4CAF50"
                        maximumTrackTintColor="#ccc"
                        thumbTintColor="#4CAF50"
                    />
                    <View style={styles.sliderRow}>
                        <TouchableOpacity onPress={() => setAge(age - 1)}>
                            <Icon name="minus-circle" size={30} color="#4CAF50" />
                        </TouchableOpacity>
                        <TextInput
                            value={age.toString()}
                            onChangeText={(val) => setAge(Number(val))}
                            keyboardType="numeric"
                            style={styles.input}
                        />
                        <TouchableOpacity onPress={() => setAge(age + 1)}>
                            <Icon name="plus-circle" size={30} color="#4CAF50" />
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={saveInitialData}>
                    <Text style={styles.saveButtonText}>Tiếp tục</Text>
                </TouchableOpacity>

                {/* Modal */}
                <Modal transparent visible={modalVisible} animationType="fade">
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.modalOverlay}
                    >
                        <View style={styles.modalContainer}>
                            {activityOptions.map((item) => (
                                <TouchableOpacity
                                    key={item.value}
                                    style={styles.modalOption}
                                    onPress={() => {
                                        setActivity(item.value);
                                        setModalVisible(false);
                                    }}
                                >
                                    <Text style={styles.modalOptionText}>{item.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </KeyboardAvoidingView>
                </Modal>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: '#F9F9F9', paddingBottom: 30 },
    header: {
        backgroundColor: '#4CAF50',
        paddingTop: 50,
        paddingBottom: 30,
        paddingHorizontal: 20,
        flexDirection: 'column',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
    card: { padding: 20, backgroundColor: '#fff', margin: 20, borderRadius: 20, elevation: 3 },
    cardLabel: { fontSize: 18, color: '#333', marginBottom: 10, fontWeight: '600' },
    selectButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 12,
    },
    selectButtonText: { fontSize: 16, color: '#333' },
    body: { paddingHorizontal: 20 },
    genderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    genderButton: { backgroundColor: '#ccc', padding: 20, borderRadius: 15, alignItems: 'center', flex: 1, marginHorizontal: 5 },
    genderSelected: { backgroundColor: '#4CAF50' },
    genderText: { color: '#fff', marginTop: 10, fontWeight: 'bold' },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 },
    label: { fontSize: 16, fontWeight: '600', color: '#333' },
    value: { fontSize: 16, fontWeight: '600', color: '#EF4444' },
    sliderRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
    input: {
        borderBottomWidth: 2,
        width: 80,
        textAlign: 'center',
        fontSize: 22,
        marginHorizontal: 15,
        borderColor: '#4CAF50',
        borderRadius: 8,
    },
    saveButton: { backgroundColor: '#FF6F00', paddingVertical: 15, borderRadius: 30, marginHorizontal: 80, marginVertical: 30 },
    saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, textAlign: 'center' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
    modalContainer: { backgroundColor: '#fff', padding: 20, borderRadius: 20, width: '80%' },
    modalOption: { padding: 15, borderBottomWidth: 1, borderColor: '#eee' },
    modalOptionText: { textAlign: 'center', fontSize: 17 },
});
