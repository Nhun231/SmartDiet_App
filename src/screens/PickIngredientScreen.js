import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    KeyboardAvoidingView,
    Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import FavouriteIngredientCard from "../components/FavouriteIngredientCard";
import { useNavigation, useRoute } from "@react-navigation/native";
import {PUBLIC_SERVER_ENDPOINT} from "@env";

export default function PickIngredientScreen() {
    const [ingredients, setIngredients] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedIngredient, setSelectedIngredient] = useState(null);
    const [quantity, setQuantity] = useState("100");
    const [isModalVisible, setIsModalVisible] = useState(false);

    const navigation = useNavigation();
    const route = useRoute();
    const { onPick } = route.params || {};


    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const token = await AsyncStorage.getItem("accessToken");
                if (!token) return;
                const decoded = jwtDecode(token);
                const userId = decoded.id;

                const res = await axios.get(`${PUBLIC_SERVER_ENDPOINT}/ingredients`);
                const allIngredients = res.data;

                const filtered = allIngredients.filter(
                    (item) => item.userId === null || item.userId === userId
                );

                setIngredients(filtered);
            } catch (err) {
                console.log("Lỗi khi tải nguyên liệu:", err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredIngredients = ingredients.filter((item) =>
        item.name.toLowerCase().includes(searchText.toLowerCase())
    );

    const handleQuickAdd = (ingredient) => {
        const quantity = 100;
        const picked = {
            ...ingredient,
            quantity,
            calories: Math.round((ingredient.caloriesPer100g || 0) * quantity / 100),
            protein: (ingredient.proteinPer100g || 0) * quantity / 100,
            fat: (ingredient.fatPer100g || 0) * quantity / 100,
            carbs: (ingredient.carbsPer100g || 0) * quantity / 100,
            fiber: (ingredient.fiberPer100g || 0) * quantity / 100,
        };

        if (onPick) {
            onPick(picked);
            navigation.goBack();
        }
    };


    const handleOpenModal = (ingredient) => {
        setSelectedIngredient(ingredient);
        setQuantity("100");
        setIsModalVisible(true);
    };

    const handleConfirm = () => {
        if (!selectedIngredient) return;

        const qty = parseInt(quantity) || 100;
        const picked = {
            ...selectedIngredient,
            quantity: qty,
            calories: Math.round((selectedIngredient.caloriesPer100g || 0) * qty / 100),
            protein: (selectedIngredient.proteinPer100g || 0) * qty / 100,
            fat: (selectedIngredient.fatPer100g || 0) * qty / 100,
            carbs: (selectedIngredient.carbsPer100g || 0) * qty / 100,
            fiber: (selectedIngredient.fiberPer100g || 0) * qty / 100,
        };

        if (onPick) onPick(picked);
        setIsModalVisible(false);
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Chọn nguyên liệu</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Search bar */}
            <View style={styles.searchBar}>
                <Ionicons name="search" size={20} color="#888" />
                <TextInput
                    placeholder="Tìm nguyên liệu..."
                    placeholderTextColor="#888"
                    style={styles.searchInput}
                    value={searchText}
                    onChangeText={setSearchText}
                />
            </View>

            {/* Ingredient list */}
            <ScrollView contentContainerStyle={styles.content}>
                {loading ? (
                    <ActivityIndicator size="large" color="#4CD08D" />
                ) : filteredIngredients.length === 0 ? (
                    <Text style={styles.noResult}>Không tìm thấy nguyên liệu</Text>
                ) : (
                    filteredIngredients.map((ingredient) => (
                        <FavouriteIngredientCard
                            key={ingredient._id}
                            name={ingredient.name}
                            serving="100g"
                            calories={ingredient.caloriesPer100g}
                            onPress={() => handleOpenModal(ingredient)}
                            onAdd={() => handleQuickAdd(ingredient)}
                            hideDelete={true}
                        />
                    ))
                )}
            </ScrollView>

            {/* Modal chọn số lượng */}
            <Modal visible={isModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={styles.bottomSheet}
                    >
                        <View style={styles.modalHeader}>
                            <Text style={styles.ingredientName}>
                                {selectedIngredient?.name}
                            </Text>
                            <Text style={styles.ingredientSub}>
                                100g - {selectedIngredient?.caloriesPer100g || 0} calo
                            </Text>
                            <TouchableOpacity
                                style={styles.closeIcon}
                                onPress={() => setIsModalVisible(false)}
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
                                    setQuantity((q) => `${Math.max(1, parseInt(q) - 1)}`)
                                }
                            >
                                <Ionicons name="remove-circle-outline" size={30} color="#999" />
                            </TouchableOpacity>
                            <TextInput
                                style={styles.quantityInput}
                                keyboardType="numeric"
                                value={quantity}
                                onChangeText={setQuantity}
                            />
                            <TouchableOpacity
                                onPress={() =>
                                    setQuantity((q) => `${parseInt(q) + 1}`)
                                }
                            >
                                <Ionicons name="add-circle-outline" size={30} color="#4CD08D" />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.confirmButton}
                            onPress={handleConfirm}
                        >
                            <Text style={styles.confirmText}>Thêm thực phẩm</Text>
                        </TouchableOpacity>
                    </KeyboardAvoidingView>
                </View>
            </Modal >
        </View >
    );
}


const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
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
    searchBar: {
        flexDirection: "row",
        backgroundColor: "#f0f0f0",
        borderRadius: 20,
        margin: 16,
        paddingHorizontal: 12,
        alignItems: "center",
        height: 40,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
        color: "#333",
    },
    content: {
        padding: 16,
    },
    noResult: {
        textAlign: "center",
        marginTop: 20,
        color: "#888",
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "flex-end",
    },
    bottomSheet: {
        backgroundColor: "#fff",
        width: "100%",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: 70,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: -2 },
        shadowRadius: 5,
        elevation: 10,

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
    quantityText: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
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

});