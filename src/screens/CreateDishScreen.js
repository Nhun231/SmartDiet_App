import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Modal,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import FavouriteIngredientCard from "../components/FavouriteIngredientCard";
import NutritionChart from "../components/DoughnutChart";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import {PUBLIC_SERVER_ENDPOINT} from "@env";

export default function CreateDishScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { dish } = route.params || {};
    const [description, setDescription] = useState(dish?.description || "");

    const [mealName, setMealName] = useState(dish?.name || "");
    const [ingredients, setIngredients] = useState(() => {
        if (!dish?.ingredients) return [];
        return dish.ingredients
            .filter(item => item.ingredientId)
            .map(item => {
                const base = item.ingredientId;
                const quantity = item.quantity || 0;
                return {
                    _id: base._id,
                    name: base.name,
                    quantity,
                    calories: (base.caloriesPer100g || 0) * quantity / 100,
                    protein: (base.proteinPer100g || 0) * quantity / 100,
                    fat: (base.fatPer100g || 0) * quantity / 100,
                    carbs: (base.carbsPer100g || 0) * quantity / 100,
                    fiber: (base.fiberPer100g || 0) * quantity / 100,
                    caloriesPer100g: base.caloriesPer100g || 0,
                    proteinPer100g: base.proteinPer100g || 0,
                    fatPer100g: base.fatPer100g || 0,
                    carbsPer100g: base.carbsPer100g || 0,
                    fiberPer100g: base.fiberPer100g || 0,
                };
            });
    });

    const [modalVisible, setModalVisible] = useState(false);
    const [editingIngredient, setEditingIngredient] = useState(null);
    const [editedQuantity, setEditedQuantity] = useState("100");

    const addIngredient = (ingredient) => {
        const alreadyExists = ingredients.some((i) => i._id === ingredient._id);
        if (!alreadyExists) {
            setIngredients((prev) => [...prev, ingredient]);
        }
    };

    useEffect(() => {
        const picked = route.params?.pickedIngredient;
        if (picked) {
            addIngredient(picked);
            navigation.setParams({ pickedIngredient: null });
        }
    }, [route.params?.pickedIngredient]);

    const handlePickIngredient = () => {
        navigation.navigate("PickIngredient", {
            onPick: (ingredient) => {
                setIngredients((prev) => [...prev, ingredient]);
            },
        });
    };

    const handleEditIngredient = (ingredient) => {
        setEditingIngredient(ingredient);
        setEditedQuantity(`${ingredient.quantity}`);
        setModalVisible(true);
    };

    const handleSaveQuantity = () => {
        const quantityNum = parseInt(editedQuantity);
        if (editingIngredient && !isNaN(quantityNum)) {
            setIngredients(prev => prev.map(item =>
                item._id === editingIngredient._id
                    ? {
                        ...item,
                        quantity: quantityNum,
                        calories: item.caloriesPer100g * quantityNum / 100,
                        protein: item.proteinPer100g * quantityNum / 100,
                        fat: item.fatPer100g * quantityNum / 100,
                        carbs: item.carbsPer100g * quantityNum / 100,
                        fiber: item.fiberPer100g * quantityNum / 100,
                    }
                    : item
            ));
        }
        setModalVisible(false);
    };

    const handleSaveDish = async () => {
        try {
            const token = await AsyncStorage.getItem("accessToken");
            if (!token) {
                console.error("Chưa đăng nhập");
                return;
            }

            const decoded = jwtDecode(token);
            const userId = decoded.id;

            const formattedIngredients = ingredients.map((ing) => ({
                ingredientId: ing._id,
                quantity: ing.quantity,
                calories: ing.calories,
                protein: ing.protein,
                fat: ing.fat,
                carbs: ing.carbs,
                fiber: ing.fiber,
            }));

            const payload = {
                name: mealName,
                description: description,
                ingredients: formattedIngredients,
                userId,
            };

            let response;
            if (dish?._id) {
                response = await axios.put(`${PUBLIC_SERVER_ENDPOINT}/dish/${dish._id}`, payload);
            } else {
                response = await axios.post(`${PUBLIC_SERVER_ENDPOINT}/dish`, payload);
            }

            navigation.goBack();
        } catch (error) {
            console.log("Lỗi khi lưu món ăn:", error.message);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerText}>{dish ? "Chỉnh sửa món ăn" : "Tạo mới món ăn"}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.label}>Nhập thông tin về món ăn</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Tên món"
                    placeholderTextColor="#999"
                    value={mealName}
                    onChangeText={setMealName}
                />

                <Text style={styles.label}>Mô tả</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Thông tin mô tả"
                    placeholderTextColor="#999"
                    value={description}
                    onChangeText={setDescription}
                />

                <Text style={styles.label}>Thành phần thực phẩm trong món ăn</Text>
                {ingredients.map((ingredient) => (
                    <FavouriteIngredientCard
                        key={ingredient._id}
                        hideAdd
                        name={ingredient.name}
                        serving={`${ingredient.quantity}g`}
                        calories={ingredient.calories}
                        onDelete={() =>
                            setIngredients((prev) =>
                                prev.filter((item) => item._id !== ingredient._id)
                            )
                        }
                        onPress={() => handleEditIngredient(ingredient)}
                    />
                ))}

                <TouchableOpacity style={styles.addIngredientBtn} onPress={handlePickIngredient}>
                    <Ionicons name="add" size={20} color="#39C" />
                    <Text style={styles.addIngredientText}>Thêm thực phẩm</Text>
                </TouchableOpacity>

                {ingredients.length > 0 && <NutritionChart ingredients={ingredients} />}
            </ScrollView>

            <TouchableOpacity style={styles.bottomButton} onPress={handleSaveDish}>
                <Text style={styles.bottomButtonText}>{dish ? "Lưu thay đổi" : "Tạo món ăn mới"}</Text>
            </TouchableOpacity>

            {/* Modal chỉnh sửa số lượng */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={{ width: "100%" }}
                    >
                        <View style={styles.bottomSheet}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.ingredientName}>
                                    {editingIngredient?.name}
                                </Text>
                                <Text style={styles.ingredientSub}>
                                    100g - {editingIngredient?.caloriesPer100g || 0} calo
                                </Text>
                                <TouchableOpacity
                                    style={styles.closeIcon}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Ionicons name="close" size={24} color="#333" />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.modalLabel}>Khẩu phần ăn</Text>
                            <View style={styles.unitBox}>
                                <Text style={styles.unitText}>g</Text>
                            </View>

                            <View style={styles.quantityPicker}>
                                <TouchableOpacity
                                    onPress={() =>
                                        setEditedQuantity((q) =>
                                            `${Math.max(1, parseInt(q) - 1)}`
                                        )
                                    }
                                >
                                    <Ionicons name="remove-circle-outline" size={30} color="#999" />
                                </TouchableOpacity>
                                <TextInput
                                    style={styles.quantityInput}
                                    keyboardType="numeric"
                                    value={String(editedQuantity)}
                                    onChangeText={setEditedQuantity}
                                />
                                <TouchableOpacity
                                    onPress={() =>
                                        setEditedQuantity((q) => `${parseInt(q) + 1}`)
                                    }
                                >
                                    <Ionicons name="add-circle-outline" size={30} color="#4CD08D" />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={styles.confirmButton}
                                onPress={handleSaveQuantity}
                            >
                                <Text style={styles.confirmText}>Lưu thay đổi</Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F9F9F9" },
    header: {
        backgroundColor: "#4CD08D",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 50,
        paddingHorizontal: 16,
        paddingBottom: 12,
        height: 96,
    },
    headerText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff",
    },
    content: {
        padding: 20,
        paddingBottom: 100,
    },
    label: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#222",
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    addIngredientBtn: {
        marginTop: 8,
        backgroundColor: "#fff",
        borderRadius: 999,
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    addIngredientText: {
        color: "#39C",
        fontWeight: "500",
        marginLeft: 6,
    },
    bottomButton: {
        position: "absolute",
        bottom: 50,
        alignSelf: "center",
        width: "60%",
        backgroundColor: "#4CD08D",
        paddingVertical: 12,
        borderRadius: 20,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.5,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 5,
        elevation: 10,
    },
    bottomButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "bold",
    },

    modalOverlay: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0,0,0,0.3)",

    },
    bottomSheet: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        padding: 20,
        paddingBottom: 40,
    },
    modalHeader: {
        alignItems: "center",
        marginBottom: 12,
    },
    ingredientName: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#222",
    },
    ingredientSub: {
        fontSize: 14,
        color: "#888",
    },
    closeIcon: {
        position: "absolute",
        top: 10,
        right: 10,
    },
    modalLabel: {
        marginTop: 10,
        fontWeight: "bold",
        fontSize: 14,
        color: "#333",
        marginBottom: 6,
    },
    unitBox: {
        backgroundColor: "#4CD08D",
        borderRadius: 20,
        paddingVertical: 6,
        paddingHorizontal: 12,
        alignSelf: "flex-start",
        marginBottom: 16,
    },
    unitText: {
        color: "#fff",
        fontWeight: "bold",
    },
    quantityPicker: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 40,
        marginBottom: 20,
    },
    quantityInput: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        textAlign: "center",
        borderBottomWidth: 1,
        borderColor: "#ccc",
        width: 80,
        paddingVertical: 4,
    },
    confirmButton: {
        backgroundColor: "#4CD08D",
        borderRadius: 20,
        paddingVertical: 12,
        alignItems: "center",

    },
    confirmText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
});
