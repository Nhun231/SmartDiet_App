import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import NutritionLabel from "../components/NutritionLabel";
import { jwtDecode } from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import {PUBLIC_SERVER_ENDPOINT} from "@env";
export default function CreateIngredientScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const existingIngredient = route.params?.ingredient;

    const [name, setName] = useState(existingIngredient?.name || "");
    const [description, setDescription] = useState(existingIngredient?.description || "");
    const [category, setCategory] = useState(existingIngredient?.category || "Thịt");
    const [calories, setCalories] = useState(existingIngredient?.caloriesPer100g?.toString() || "");
    const [fat, setFat] = useState(existingIngredient?.fatPer100g?.toString() || "");
    const [carbs, setCarbs] = useState(existingIngredient?.carbsPer100g?.toString() || "");
    const [protein, setProtein] = useState(existingIngredient?.proteinPer100g?.toString() || "");
    const [fiber, setFiber] = useState(existingIngredient?.fiberPer100g?.toString() || "");


    const categories = ["Thịt", "Hải sản", "Đậu", "Thực phẩm khác", "Rau củ", "Trái cây"];

    const handleSubmit = async () => {
        if (
            !name.trim() ||
            !description.trim() ||
            !calories.trim() ||
            !fat.trim() ||
            !carbs.trim() ||
            !protein.trim() ||
            !fiber.trim()
        ) {
            alert("Vui lòng điền đầy đủ thông tin bắt buộc.");
            return;
        }

        try {
            const token = await AsyncStorage.getItem("accessToken");
            const decoded = jwtDecode(token);
            const userId = decoded.id;

            const ingredient = {
                name: name.trim(),
                description: description.trim(),
                category,
                caloriesPer100g: +calories || 0,
                fatPer100g: +fat || 0,
                carbsPer100g: +carbs || 0,
                proteinPer100g: +protein || 0,
                fiberPer100g: +fiber || 0,
                userId: userId,
            };

            let res;
            if (existingIngredient?._id) {
                res = await axios.put(`${PUBLIC_SERVER_ENDPOINT}/ingredients/${existingIngredient._id}`, ingredient);
            } else {
                res = await axios.post(`${PUBLIC_SERVER_ENDPOINT}/ingredients`, ingredient);
            }

            navigation.goBack();
        } catch (error) {
            console.error("Lỗi khi lưu nguyên liệu:", error.response?.data || error.message);
        }
    };

    const nutritionData = {
        calories: +calories || 0,
        fat: +fat || 0,
        carbs: +carbs || 0,
        protein: +protein || 0,
        fiber: +fiber || 0,
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerText}>
                    {existingIngredient ? "Chỉnh sửa thực phẩm" : "Tạo thực phẩm mới"}
                </Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.subtitle}>Thông tin cơ bản</Text>
                <View style={styles.table}>
                    <TableRow label="Tên thực phẩm:" value={name} onChangeText={setName} required />
                    <TableRow label="Mô tả:" value={description} onChangeText={setDescription} required />
                </View>

                <Text style={styles.subtitle}>Loại nguyên liệu</Text>
                <View style={styles.categoryContainer}>
                    {categories.map((item) => (
                        <TouchableOpacity
                            key={item}
                            style={[
                                styles.categoryOption,
                                category === item && styles.categorySelected,
                            ]}
                            onPress={() => setCategory(item)}
                        >
                            <Text
                                style={[
                                    styles.categoryText,
                                    category === item && styles.categoryTextSelected,
                                ]}
                            >
                                {item}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <NutritionLabel data={nutritionData} />

                <View style={styles.rowInfo}>
                    <Text style={styles.subtitle}>Thông tin dinh dưỡng trung bình trên</Text>
                    <Text style={styles.unitText}>100g</Text>
                </View>

                <View style={styles.table}>
                    <NumericTableRow label="Kcal" value={calories} onChangeText={setCalories} required />
                    <NumericTableRow label="Chất béo" value={fat} onChangeText={setFat} required />
                    <NumericTableRow label="Carbs" value={carbs} onChangeText={setCarbs} required />
                    <NumericTableRow label="Chất đạm" value={protein} onChangeText={setProtein} required />
                    <NumericTableRow label="Chất xơ" value={fiber} onChangeText={setFiber} required />
                </View>
            </ScrollView>

            <TouchableOpacity style={styles.bottomButton} onPress={handleSubmit}>
                <Text style={styles.bottomButtonText}>Xong</Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    );
}

const TableRow = ({ label, value, onChangeText, required = false }) => (
    <View style={styles.tableRow}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
            style={styles.input}
            keyboardType="default"
            placeholder={required ? "bắt buộc" : "không bắt buộc"}
            value={value}
            onChangeText={onChangeText}
        />
    </View>
);

const NumericTableRow = ({ label, value, onChangeText, required = false }) => {
    const handleChange = (text) => {
        // Chỉ cho phép nhập số và dấu chấm, loại bỏ các ký tự khác
        let cleaned = text.replace(/[^0-9.]/g, '');

        // Chỉ giữ lại 1 dấu chấm (nếu có)
        const parts = cleaned.split('.');
        if (parts.length > 2) {
            cleaned = parts[0] + '.' + parts.slice(1).join('');
        }

        onChangeText(cleaned);
    };

    return (
        <View style={styles.tableRow}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder={required ? "bắt buộc" : "không bắt buộc"}
                value={value}
                onChangeText={handleChange}
            />
        </View>
    );
};


const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },
    header: {
        backgroundColor: "#4CD08D",
        paddingTop: 50,
        paddingBottom: 16,
        paddingHorizontal: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    headerText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#fff",
    },
    subtitle: {
        fontSize: 16,
        fontWeight: "600",
        marginTop: 16,
        marginBottom: 8,
    },
    unitText: { fontSize: 14, color: "#666" },
    rowInfo: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
        marginTop: 12,
    },
    table: {
        borderTopWidth: 1,
        borderColor: "#ddd",
        marginBottom: 16,
    },
    tableRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderColor: "#eee",
    },
    label: {
        flex: 1.2,
        fontSize: 15,
        color: "#333",
    },
    input: {
        flex: 2,
        borderWidth: 1,
        borderColor: "#ccc",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        fontSize: 15,
    },
    categoryContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 12,
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
    bottomButton: {
        position: "absolute",
        bottom: 50,
        alignSelf: "center",
        width: "26%",
        backgroundColor: "#4CD08D",
        paddingVertical: 10,
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
});
