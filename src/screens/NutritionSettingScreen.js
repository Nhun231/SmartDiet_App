import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert
} from 'react-native';
import Slider from '@react-native-community/slider';
import PieChart from 'react-native-pie-chart';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const BASE_URL = 'http://192.168.1.202:8080/smartdiet';

export default function NutritionSettingScreen({ navigation }) {
    const [carbs, setCarbs] = useState(35);
    const [protein, setProtein] = useState(35);
    const [fat, setFat] = useState(25);
    const [fiber, setFiber] = useState(5);
    const [tdee, setTdee] = useState(2000);

    useFocusEffect(
        useCallback(() => {
            const fetchData = async () => {
                try {
                    const token = await AsyncStorage.getItem('accessToken');
                    const res = await axios.get(`${BASE_URL}/customer/calculate/newest`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    const data = res.data;
                    setCarbs(data.nutrition?.carbPercent || 35);
                    setProtein(data.nutrition?.proteinPercent || 35);
                    setFat(data.nutrition?.fatPercent || 25);
                    setFiber(data.nutrition?.fiberPercent || 5);
                    setTdee(data.tdee || 2000);
                } catch (err) {
                    console.error(err);
                    Alert.alert('Lỗi', 'Không thể tải dữ liệu dinh dưỡng');
                }
            };
            fetchData();
        }, [])
    );

    const handleSave = async () => {
        const totalPercent = Math.round(carbs + protein + fat + fiber);
        if (totalPercent !== 100) {
            Alert.alert('Lỗi', `Tổng phần trăm phải bằng 100% (hiện tại: ${totalPercent}%)`);
            return;
        }
        try {
            const token = await AsyncStorage.getItem('accessToken');
            await axios.patch(`${BASE_URL}/customer/calculate/update-nutrition`, {
                carbPercent: carbs,
                proteinPercent: protein,
                fatPercent: fat,
                fiberPercent: fiber,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            Alert.alert('Thành công', 'Đã lưu cài đặt dinh dưỡng', [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } catch (err) {
            console.error(err);
            Alert.alert('Lỗi', err.response?.data?.message || 'Lỗi khi lưu cài đặt');
        }
    };

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Cài đặt dinh dưỡng</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Pie Chart */}
            <Text style={styles.sectionTitle}>Sơ đồ phân bổ dinh dưỡng</Text>
            <View style={styles.chartContainer}>
                <PieChart
                    widthAndHeight={220}
                    series={[carbs, protein, fat, fiber]}
                    sliceColor={['#2196F3', '#FFC107', '#9C27B0', '#4CAF50']}
                    coverRadius={0.45}
                    coverFill={'#FFF'}
                />
                <Text style={styles.chartCenterText}>{carbs + protein + fat + fiber}%</Text>
            </View>

            {/* Sliders */}
            <MacroSlider name="Tinh bột" value={carbs} onValueChange={setCarbs} color="#2196F3" totalCalories={tdee} />
            <MacroSlider name="Chất đạm" value={protein} onValueChange={setProtein} color="#FFC107" totalCalories={tdee} />
            <MacroSlider name="Chất béo" value={fat} onValueChange={setFat} color="#9C27B0" totalCalories={tdee} />
            <MacroSlider name="Chất xơ" value={fiber} onValueChange={setFiber} color="#4CAF50" totalCalories={tdee} />

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Lưu</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

function MacroSlider({ name, value, onValueChange, color, totalCalories }) {
    const grams = Math.round((totalCalories * value) / 100 / 4);
    const calories = Math.round((totalCalories * value) / 100);

    const adjustValue = (amount) => {
        const newValue = value + amount;
        if (newValue >= 0 && newValue <= 100) {
            onValueChange(newValue);
        }
    };

    return (
        <View style={styles.sliderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.dot, { backgroundColor: color }]} />
                <Text style={styles.macroName}>{name}</Text>
            </View>
            <View style={styles.macroNumbers}>
                <Text>{grams} g</Text>
                <Text>{value}%</Text>
                <Text>{calories} Kcal</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => adjustValue(-1)}>
                    <Icon name="minus-circle" size={28} color={color} />
                </TouchableOpacity>
                <Slider
                    style={{ flex: 1, marginHorizontal: 10 }}
                    minimumValue={0}
                    maximumValue={100}
                    step={1}
                    value={value}
                    onValueChange={onValueChange}
                    minimumTrackTintColor={color}
                    thumbTintColor={color}
                />
                <TouchableOpacity onPress={() => adjustValue(1)}>
                    <Icon name="plus-circle" size={28} color={color} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9F9F9' },
    header: {
        backgroundColor: '#4CAF50',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4CAF50',
        textAlign: 'center',
        marginTop: 20,
    },
    chartContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 15,
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 15,
        marginHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    chartCenterText: { position: 'absolute', fontSize: 24, fontWeight: 'bold', color: 'red' },
    sliderRow: {
        marginHorizontal: 20,
        marginVertical: 15,
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    dot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
    macroName: { fontWeight: 'bold', fontSize: 16 },
    macroNumbers: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        marginBottom: 10,
    },
    saveButton: {
        backgroundColor: 'orange',
        alignSelf: 'center',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        marginVertical: 20,
    },
    saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
