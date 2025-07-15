import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FavouriteTipCard from "../components/FavouriteTipCard";
import FavouriteIngredientCard from "../components/FavouriteIngredientCard";
import { useNavigation } from '@react-navigation/native';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { useFocusEffect } from "@react-navigation/native";
import ExpandableFAB from "../components/ExpandableFAB";
import {PUBLIC_SERVER_ENDPOINT} from '@env'
export default function FavouriteScreen() {
    const [activeTab, setActiveTab] = useState("ingredients");
    const [isSearching, setIsSearching] = useState(false);
    const [searchText, setSearchText] = useState("");
    const navigation = useNavigation();

    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dishes, setDishes] = useState([]);

    // Dữ liệu mẫu


    const fetchIngredients = async () => {
        try {
            setLoading(true);
            console.log("Đang gọi API...");
            const token = await AsyncStorage.getItem("accessToken");
            console.log("token:", token)
            if (!token) return;

            const decoded = jwtDecode(token);
            console.log(decoded)
            const userId = decoded.id;
            console.log(userId)

            const response = await axios.get(`${PUBLIC_SERVER_ENDPOINT}/ingredients`);

            const allIngredients = response.data;

            const userIngredients = allIngredients.filter(ing => ing.userId === userId);

            setIngredients(userIngredients);
            console.log("Đã gọi xong API, dữ liệu trả về:", userIngredients);

        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu nguyên liệu:", error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchDishes = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("accessToken");
            if (!token) return;
            const decoded = jwtDecode(token);
            const userId = decoded.id;

            const response = await axios.get(`${PUBLIC_SERVER_ENDPOINT}/dish?userId=${userId}`);
            setDishes(response.data);
            console.log("Dishes fetched:", response.data);
        } catch (error) {
            console.error("Lỗi khi lấy dish:", error.message);
        } finally {
            setLoading(false);
        }
    };


    useFocusEffect(
        React.useCallback(() => {
            console.log("FavouriteScreen được focus!");
            fetchIngredients();
            fetchDishes();

        }, [])
    );

    const handleDelete = async (ingredientId) => {
        try {


            await axios.delete(`${PUBLIC_SERVER_ENDPOINT}/ingredients/${ingredientId}`);

            // Sau khi xóa thành công, cập nhật lại danh sách
            setIngredients((prev) => prev.filter((item) => item._id !== ingredientId));
            console.log("Xoá thành công nguyên liệu:", ingredientId);
        } catch (error) {
            console.error("Lỗi khi xoá nguyên liệu:", error.response?.data || error.message);
        }
    };
    const handleDeleteDish = async (dishId) => {
        try {


            await axios.delete(`${PUBLIC_SERVER_ENDPOINT}/dish/${dishId}`);

            // Sau khi xóa thành công, cập nhật lại danh sách
            setDishes((prev) => prev.filter((item) => item._id !== dishId));
            console.log("Xoá thành công nguyên liệu:", dishId);
        } catch (error) {
            console.error("Lỗi khi xoá nguyên liệu:", error.response?.data || error.message);
        }
    };

    const confirmDeleteDish = (dishId) => {
        Alert.alert(
            "Xác nhận xoá",
            "Bạn có chắc muốn xoá món ăn này khỏi danh sách?",
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Xoá",
                    onPress: () => handleDeleteDish(dishId),
                    style: "destructive",
                },
            ]
        );
    };

    const confirmDelete = (ingredientId) => {
        Alert.alert(
            "Xác nhận xoá",
            `Bạn có chắc muốn xoá thực phẩm này khỏi danh sách`,
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Xoá",
                    onPress: () => handleDelete(ingredientId),
                    style: "destructive",
                },
            ]
        );
    };




    const filteredIngredients = ingredients.filter(item =>
        item.name.toLowerCase().includes(searchText.toLowerCase())
    );
    const filteredDish = dishes.filter(item =>
        item.name.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                {isSearching ? (
                    <View style={styles.searchWrapper}>
                        <View style={styles.searchBar}>
                            <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Tìm kiếm mục yêu thích..."
                                placeholderTextColor="#888"
                                value={searchText}
                                onChangeText={setSearchText}
                            />
                        </View>
                        <TouchableOpacity
                            onPress={() => {
                                setIsSearching(false);
                                setSearchText("");
                            }}
                        >
                            <Text style={styles.cancelText}>Hủy</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <Text style={styles.headerText}>Mục yêu thích</Text>
                        <View style={styles.headerIcons}>
                            <TouchableOpacity
                                onPress={() => {
                                    if (activeTab === "ingredients") {
                                        navigation.navigate("CreateIngredient");
                                    } else if (activeTab === "dishs") {
                                        navigation.navigate("CreateDish");
                                    }
                                }}
                            >
                                <Ionicons name="add" size={24} color="#fff" style={styles.icon} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setIsSearching(true)}>
                                <Ionicons name="search" size={22} color="#fff" style={styles.icon} />
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
                <TouchableOpacity onPress={() => setActiveTab("ingredients")}>
                    <Text style={[styles.tabText, activeTab === "ingredients" && styles.activeTab]}>
                        Thực phẩm của tôi
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveTab("dishs")}>
                    <Text style={[styles.tabText, activeTab === "dishs" && styles.activeTab]}>
                        Món ăn của tôi
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView contentContainerStyle={styles.content}>
                {activeTab === "ingredients" ? (
                    loading ? (
                        <Text style={styles.noResult}>Đang tải...</Text>
                    ) : (isSearching ? filteredIngredients.length : ingredients.length) === 0 ? (
                        isSearching ? (
                            <Text style={styles.noResult}>Không tìm thấy kết quả</Text>
                        ) : (
                            <FavouriteTipCard
                                icon={require("../../assets/lightbulb.png")}
                                combo="NẤM + CÁ HỒI"
                                description={`Nấm cung cấp vitamin B3 giúp tăng cường chất chống viêm nhiễm của dầu cá trong cá hồi...`}
                            />
                        )
                    ) : (
                        (isSearching ? filteredIngredients : ingredients).map((ingredient) => (
                            <FavouriteIngredientCard
                                key={ingredient._id}
                                name={ingredient.name}
                                serving="100g"
                                calories={ingredient.caloriesPer100g}
                                onAdd={() => navigation.navigate("IngredientDetail", { ingredient })}
                                onDelete={() => confirmDelete(ingredient._id)}
                                onPress={() => navigation.navigate("IngredientDetail", { ingredient })}
                            />
                        ))
                    )
                ) : (
                    (isSearching ? filteredDish.length : dishes.length) === 0 ? (
                        isSearching ? (
                            <Text style={styles.noResult}>Không tìm thấy kết quả</Text>
                        ) : (
                            <FavouriteTipCard
                                icon={require("../../assets/lightbulb.png")}
                                combo="ỨC GÀ + GẠO LỨT"
                                description={`Ức gà giàu protein kết hợp với gạo lứt nhiều chất xơ là lựa chọn tốt cho bữa ăn lành mạnh.\n\nNhấn vào nút (+) góc trên bên phải để thêm món ăn yêu thích của bạn.`}
                            />
                        )
                    ) : (
                        (isSearching ? filteredDish : dishes).map((dishes) => (
                            <FavouriteIngredientCard
                                key={dishes._id}
                                name={dishes.name}
                                serving="1 phần ăn"
                                calories={dishes.totals?.calories}
                                onAdd={() => navigation.navigate("DishDetail", { dish: dishes })}
                                onDelete={() => confirmDeleteDish(dishes._id)}
                                onPress={() => navigation.navigate("DishDetail", { dish: dishes })}
                            />

                        ))
                    )
                )}
            </ScrollView>

            {/* FAB */}
            <ExpandableFAB
                onOptionPress={(mealType, label) =>
                    navigation.navigate('MealEntry', { mealType, label })
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        backgroundColor: "#4CD08D",
        paddingTop: 50,
        paddingBottom: 16,
        paddingHorizontal: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        height: 96,

    },
    headerText: {
        fontSize: 25,
        fontWeight: "bold",
        color: "#fff",
    },
    headerIcons: {
        flexDirection: "row",
    },
    icon: {
        marginLeft: 16,
    },
    tabs: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    tabText: {
        fontSize: 16,
        color: "#999",
    },
    activeTab: {
        color: "#4CD08D",
        fontWeight: "bold",
        borderBottomWidth: 2,
        borderBottomColor: "#4CD08D",
        paddingBottom: 4,
    },
    content: {
        padding: 16,
    },
    fab: {
        position: "absolute",
        bottom: 32,
        right: 24,
        backgroundColor: "#4CD08D",
        borderRadius: 30,
        width: 56,
        height: 56,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 6,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingHorizontal: 12,
        height: 40,
        marginRight: 12,
    },

    searchIcon: {
        marginRight: 8,
    },

    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    noResult: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#999",
        marginTop: 20,
        textAlign: "center",
    },
    searchWrapper: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        gap: 12,

    },


});
