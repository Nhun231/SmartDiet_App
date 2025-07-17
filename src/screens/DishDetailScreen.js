import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Modal, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NutritionChart from '../components/DoughnutChart';
import FavouriteIngredientCard from '../components/FavouriteIngredientCard';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { jwtDecode } from 'jwt-decode';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {PUBLIC_SERVER_ENDPOINT} from "@env";

export default function DishDetailScreen({ route, navigation }) {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedMeal, setSelectedMeal] = useState('');
    const mealTypeToUse = mealType || selectedMeal;

    const [quantity, setQuantity] = useState(1); // 1 khẩu phần mặc định

    const { dish, mealType } = route.params || {};
    const [dishData, setDishData] = useState(null);
    useEffect(() => {
        if (mealType) {
            setSelectedMeal(mealType);
        }
    }, [mealType]);

    const addDishToDiary = async () => {
        const mealType = mealTypeToUse;
        console.log("addDishToDiary called", { mealType, dishData });
        if (!mealType || !dishData) {
            console.log("Missing mealType or dishData");
            return;
        }

        try {
            const token = await AsyncStorage.getItem("accessToken");
            const decoded = jwtDecode(token);
            const userId = decoded.id;

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const formattedDate =
                today.getFullYear() +
                '-' +
                String(today.getMonth() + 1).padStart(2, '0') +
                '-' +
                String(today.getDate()).padStart(2, '0');

            const newDish = {
                dishId: dishData._id,
                quantity: quantity,
            };

            try {
                // Kiểm tra meal hiện có
                const res = await axios.get(`${PUBLIC_SERVER_ENDPOINT}/meals/by-date`, {
                    params: { date: formattedDate, mealType, userId },
                });

                const existingMeal = res.data;

                const updatedDishes = [...existingMeal.dish];
                const index = updatedDishes.findIndex(d => d.dishId._id === dishData._id || d.dishId === dishData._id);

                if (index !== -1) {
                    updatedDishes[index].quantity = quantity;
                } else {
                    updatedDishes.push(newDish);
                }

                await axios.put(`${PUBLIC_SERVER_ENDPOINT}/meals/${existingMeal._id}`, {
                    mealType,
                    date: formattedDate,
                    userId,
                    ingredients: existingMeal.ingredients.map(i => ({
                        ingredientId: i.ingredientId._id || i.ingredientId,
                        quantity: i.quantity,
                    })),
                    dish: updatedDishes.map(d => ({
                        dishId: d.dishId._id || d.dishId,
                        quantity: d.quantity,
                    })),
                });

                console.log("Đã cập nhật món ăn vào nhật ký!");
            } catch (err) {
                
                if (err.response?.status === 404) {
                    // Tạo meal mới nếu chưa có
                    await axios.post(`${PUBLIC_SERVER_ENDPOINT}/meals`, {
                        mealType,
                        date: formattedDate,
                        userId,
                        ingredients: [],
                        dish: [newDish],
                    });
                    console.log("Đã tạo nhật ký mới với món ăn!");
                } else {
                    console.log("Lỗi khi thêm dish:", err.message);
                }
            }

            navigation.goBack();
        } catch (err) {
            console.log("Lỗi khi lấy token:", err.message);
        }
    };


    const fetchDishDetail = async () => {
        try {
            const response = await axios.get(`${PUBLIC_SERVER_ENDPOINT}/dish/${dish._id}`);
            setDishData(response.data);
        } catch (error) {
            console.log("Lỗi khi lấy chi tiết món ăn:", error.message);
        }
    };

    useFocusEffect(
        useCallback(() => {
            if (dish) fetchDishDetail();
        }, [dish])
    );

    if (!dishData) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Đang tải món ăn...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.title}>Chi tiết món ăn</Text>
                <TouchableOpacity onPress={() => {
                    navigation.navigate("CreateDish", { dish: dishData });
                }}>
                    <Ionicons name="create-outline" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Nội dung */}
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.label}>Thông tin món ăn</Text>
                <View style={styles.card}>
                    <Text style={styles.name}>{dishData.name}</Text>
                </View>

                <Text style={styles.label}>Mô tả món ăn</Text>
                <View style={styles.card}>
                    <Text style={styles.name}>{dishData.description || 'Không có mô tả.'}</Text>
                </View>

                <Text style={styles.label}>Thành phần thực phẩm</Text>
                {dishData.ingredients?.length > 0 ? (
                    dishData.ingredients.map((item, index) => {
                        if (!item.ingredientId) {
                            return (
                                <Text key={index} style={{ color: 'red', fontStyle: 'italic' }}>
                                    * Nguyên liệu không còn trong hệ thống.
                                </Text>
                            );
                        }
                        return (
                            <FavouriteIngredientCard
                                hideAdd
                                hideDelete
                                key={item._id || index}
                                name={item.ingredientId.name}
                                serving={`${item.quantity}g`}
                                calories={item.ingredientId.caloriesPer100g * item.quantity / 100}
                            />
                        );
                    })
                ) : (
                    <Text style={{ color: '#999', fontStyle: 'italic' }}>Chưa có thành phần.</Text>
                )}

                <Text style={styles.label}>Tổng dinh dưỡng</Text>
                {dishData.totals && (
                    <NutritionChart
                        ingredients={[{
                            caloriesPer100g: dishData.totals.calories || 0,
                            proteinPer100g: dishData.totals.protein || 0,
                            fatPer100g: dishData.totals.fat || 0,
                            carbsPer100g: dishData.totals.carbs || 0,
                            fiberPer100g: dishData.totals.fiber || 0,
                        }]}
                    />
                )}
            </ScrollView>
            <TouchableOpacity
                style={styles.bottomButton}
                onPress={() =>{
                        setModalVisible(true);
                    
                }}
            >
                <Text style={styles.bottomButtonText}>Thêm vào nhật ký</Text>
            </TouchableOpacity>


            <Modal visible={modalVisible} transparent animationType="slide">
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === "ios" ? "padding" : "height"}
                            style={{ width: "100%" }}
                        >
                            <TouchableWithoutFeedback onPress={() => {}}>
                                <View style={styles.bottomSheet}>
                                    <View style={styles.modalHeader}>
                                        <Text style={styles.modalTitle}>Chọn bữa</Text>
                                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                                            <Ionicons name="close" size={24} color="#333" />
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.categoryContainer}>
                                        {["breakfast", "lunch", "dinner", "snack"].map(meal => (
                                            <TouchableOpacity
                                                key={meal}
                                                onPress={() => setSelectedMeal(meal)}
                                                style={[
                                                    styles.categoryOption,
                                                    selectedMeal === meal && styles.categorySelected,
                                                ]}
                                            >
                                                <Text style={[
                                                    styles.categoryText,
                                                    selectedMeal === meal && styles.categoryTextSelected,
                                                ]}>
                                                    {meal === 'breakfast' ? 'Bữa sáng' :
                                                        meal === 'lunch' ? 'Bữa trưa' :
                                                            meal === 'dinner' ? 'Bữa tối' : 'Bữa phụ'}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 10 }}>
                                        Số khẩu phần
                                    </Text>
                                    <View style={styles.quantityContainer}>
                                        <TouchableOpacity
                                            onPress={() => setQuantity(prev => Math.max(1, prev - 1))}
                                            style={styles.quantityButton}
                                        >
                                            <Ionicons name="remove" size={20} color="#333" />
                                        </TouchableOpacity>
                                        <Text style={styles.quantityText}>{quantity}</Text>
                                        <TouchableOpacity
                                            onPress={() => setQuantity(prev => prev + 1)}
                                            style={styles.quantityButton}
                                        >
                                            <Ionicons name="add" size={20} color="#333" />
                                        </TouchableOpacity>
                                    </View>

                                    <TouchableOpacity
                                        style={styles.confirmButton}
                                        onPress={() => {
                                            console.log("Xác nhận button pressed - direct call");
                                            addDishToDiary();
                                            setModalVisible(false);
                                            
                                        }}
                                    >
                                        <Text style={styles.confirmButtonText}>Xác nhận</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableWithoutFeedback>
                        </KeyboardAvoidingView>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9f9f9' },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    card: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 20,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 4,
    },
    content: { padding: 16 },
    title: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#222',
        marginTop: 16,
        marginBottom: 8,
    },
    name: {
        fontSize: 16,
        color: '#333',
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
    quantityContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
        gap: 20,
    },

    quantityButton: {
        backgroundColor: "#eee",
        borderRadius: 20,
        padding: 10,
    },

    quantityText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        minWidth: 40,
        textAlign: "center",
    },

});
