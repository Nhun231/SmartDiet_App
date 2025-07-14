import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NutritionChart from '../components/DoughnutChart'; // Biểu đồ Doughnut
import { useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import {PUBLIC_SERVER_ENDPOINT} from "@env";

import axios from "axios";
export default function IngredientDetailScreen({ route, navigation }) {
    const { ingredient, mealType = '' } = route.params;
    const [servingGram, setServingGram] = useState(100); // mặc định 100g
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedMeal, setSelectedMeal] = useState('');

    const allMealTypes = [
        { key: "breakfast", label: "Bữa sáng" },
        { key: "lunch", label: "Bữa trưa" },
        { key: "dinner", label: "Bữa tối" },
        { key: "snack", label: "Bữa phụ" },
    ];

    useEffect(() => {
        if (mealType) {
            setSelectedMeal(mealType);
        }
    }, [mealType]);

    const addToDiary = async () => {
        const mealTypeToUse = mealType || selectedMeal;

        try {
            const token = await AsyncStorage.getItem("accessToken");
            if (!token) return;
            const decoded = jwtDecode(token);
            const userId = decoded.id;

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const formattedDate = today.toISOString().split("T")[0];

            // Lấy meal hiện tại (nếu có)
            const mealRes = await axios.get(`${PUBLIC_SERVER_ENDPOINT}/meals/by-date`, {
                params: {
                    date: formattedDate,
                    mealType: mealTypeToUse,
                    userId,
                },
            });

            const existingMeal = mealRes.data; // nếu không có sẽ throw catch do status 404

            const newIngredient = {
                ingredientId: data._id,
                quantity: servingGram,
            };

            // Nếu meal đã tồn tại → update
            if (existingMeal && existingMeal._id) {
                const updatedIngredients = [...existingMeal.ingredients];
                const index = updatedIngredients.findIndex(i => i.ingredientId._id === data._id || i.ingredientId === data._id);

                if (index !== -1) {
                    updatedIngredients[index].quantity = servingGram;
                } else {
                    updatedIngredients.push(newIngredient);
                }

                await axios.put(`${PUBLIC_SERVER_ENDPOINT}/meals/${existingMeal._id}`, {
                    mealType: mealTypeToUse,
                    date: formattedDate,
                    userId,
                    ingredients: updatedIngredients.map(i => ({
                        ingredientId: i.ingredientId._id || i.ingredientId,
                        quantity: i.quantity,
                    })),
                    dish: existingMeal.dish.map(d => ({
                        dishId: d.dishId._id || d.dishId,
                        quantity: d.quantity,
                    })),
                });

                console.log("Đã cập nhật nhật ký!");
            }
        } catch (err) {
            // Nếu meal chưa tồn tại (404) thì tạo mới
            if (err.response?.status === 404) {
                try {
                    const token = await AsyncStorage.getItem("accessToken");
                    const decoded = jwtDecode(token);
                    const userId = decoded.id;

                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const formattedDate = today.toISOString().split("T")[0];

                    const newMeal = {
                        mealType: mealTypeToUse,
                        date: formattedDate,
                        userId,
                        ingredients: [{ ingredientId: data._id, quantity: servingGram }],
                        dish: [],
                    };

                    await axios.post(`${PUBLIC_SERVER_ENDPOINT}/meals`, newMeal);
                    console.log("Đã tạo nhật ký mới!");
                } catch (createErr) {
                    console.error("Lỗi khi tạo nhật ký:", createErr.message);
                }
            } else {
                console.error("Lỗi khi kiểm tra meal:", err.message);
            }
        }

        navigation.goBack();
    };



    const [data, setData] = useState(ingredient);

    const fetchUpdatedIngredient = async () => {
        try {
            const res = await axios.get(`${PUBLIC_SERVER_ENDPOINT}/ingredients/${ingredient._id}`);
            setData(res.data);
        } catch (err) {
            console.error("Lỗi fetch lại nguyên liệu:", err.message);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchUpdatedIngredient();
        }, [])
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.title}>{data.name}</Text>
                <TouchableOpacity onPress={() => {
                    navigation.navigate("CreateIngredient", { ingredient: data });
                }}>
                    <Ionicons name="create-outline" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Nội dung */}
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.label}>Thành phần dinh dưỡng</Text>
                <View style={styles.servingRow}>
                    {/* Nhập số gram */}
                    <TextInput
                        style={styles.servingInput}
                        keyboardType="numeric"
                        placeholder="100"
                        value={servingGram.toString()}
                        onChangeText={(text) => {
                            const num = parseInt(text);
                            if (!isNaN(num)) setServingGram(num);
                            else setServingGram(0);
                        }}
                    />

                    {/* Chọn đơn vị đo (dropdown giả lập tạm thời) */}
                    <TouchableOpacity style={styles.unitBox}>
                        <Text style={styles.unitText}>g</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.chartContainer}>
                    <NutritionChart
                        ingredients={[
                            {
                                ...data,
                                caloriesPer100g: data.caloriesPer100g * servingGram / 100,
                                proteinPer100g: data.proteinPer100g * servingGram / 100,
                                fatPer100g: data.fatPer100g * servingGram / 100,
                                carbsPer100g: data.carbsPer100g * servingGram / 100,
                                fiberPer100g: data.fiberPer100g * servingGram / 100,
                            }
                        ]}
                    />
                </View>

                {/* Nếu có thêm mục tiêu: */}
                {/* <Text style={styles.goalTitle}>Mục tiêu hàng ngày</Text> */}
                {/* <ProgressBar ... /> */}
            </ScrollView>

            {/* Nút Thêm vào nhật ký */}
            <TouchableOpacity
                style={styles.bottomButton}
                onPress={() => {
                    if (!mealType || !selectedMeal) {
                        setModalVisible(true); // chưa chọn bữa → hiện modal
                    } else {
                        addToDiary(); // có mealType → thêm vào nhật ký luôn
                    }
                }}
            >
                <Text style={styles.bottomButtonText}>Thêm vào nhật ký</Text>
            </TouchableOpacity>

            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={{ width: "100%" }}
                    >
                        <View style={styles.bottomSheet}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Chọn bữa</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <Ionicons name="close" size={24} color="#333" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.categoryContainer}>
                                {allMealTypes.map((meal) => (
                                    <TouchableOpacity
                                        key={meal.key}
                                        style={[
                                            styles.categoryOption,
                                            selectedMeal === meal.key && styles.categorySelected,
                                        ]}
                                        onPress={() => {
                                            setSelectedMeal(meal.key);
                                        }}
                                    >
                                        <Text
                                            style={[
                                                styles.categoryText,
                                                selectedMeal === meal.key && styles.categoryTextSelected,
                                            ]}
                                        >
                                            {meal.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TouchableOpacity
                                style={styles.confirmButton}
                                onPress={() => {
                                    if (!selectedMeal) {
                                        Alert.alert("Chưa chọn bữa ăn", "Vui lòng chọn một loại bữa trước khi xác nhận.");
                                        return;
                                    }
                                    setModalVisible(false);
                                    setTimeout(() => {
                                        addToDiary(); // gọi ngay sau khi chọn bữa
                                    }, 200); // delay nhỏ để tránh modal chưa đóng
                                }}
                            >
                                <Text style={styles.confirmButtonText}>Xác nhận</Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>


        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    header: {
        backgroundColor: '#4CD08D',
        paddingTop: 48,
        paddingHorizontal: 16,
        paddingBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 96,

    },
    title: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    content: {
        padding: 16,
    },
    servingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    servingBox: {
        backgroundColor: '#eee',
        borderRadius: 12,
        padding: 12,
        marginRight: 8,
    },
    servingValue: {
        fontSize: 16,
    },
    unitText: {
        fontSize: 16,
    },
    chartContainer: {
        marginBottom: 24,
    },
    goalTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    bottomButton: {
        position: 'absolute',
        bottom: 50,
        alignSelf: 'center',
        width: '50%',
        backgroundColor: '#4CD08D',
        paddingVertical: 10,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.5,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 5,
        elevation: 10,
    },

    bottomButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    label: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#222",
        marginBottom: 8,
        marginTop: 2,
    },
    servingInput: {
        width: 60,
        marginTop: 8,
        backgroundColor: "#fff",
        borderRadius: 999,
        paddingVertical: 15,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
        fontSize: 16,       // thêm fontSize để dễ đọc
        color: "#111",      // thêm màu chữ cho rõ
        textAlign: "center",
        marginLeft: 10
        // căn giữa số
    },
    unitBox: {
        width: '80%',
        marginTop: 8,
        backgroundColor: "#fff",
        borderRadius: 999,
        paddingVertical: 15,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
        marginLeft: 10
    },

    modalOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
    },
    modalContent: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 24,
        width: "80%",
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 16,
    },
    categoryContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 20,
        justifyContent: "center",
    },
    categoryOption: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#ccc",
        marginRight: 8,
        marginBottom: 8,
        backgroundColor: "#f9f9f9",
    },
    categorySelected: {
        backgroundColor: "#4CD08D",
        borderColor: "#4CD08D",
    },
    categoryText: { fontSize: 14, color: "#333" },
    categoryTextSelected: { color: "#fff", fontWeight: "bold" },

    modalOverlay: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0,0,0,0.3)",
    },

    bottomSheet: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 24,
        paddingBottom: 40,
        alignItems: "center",
    },

    modalHeader: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },

    confirmButton: {
        backgroundColor: "#4CD08D",
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 20,
        alignItems: "center",
        marginTop: 10,
    },

    confirmButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },

});
