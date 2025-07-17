import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TouchableWithoutFeedback,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import FavouriteIngredientCard from '../components/FavouriteIngredientCard';
import {PUBLIC_SERVER_ENDPOINT} from "@env";

const allMealTypes = [
    { key: 'breakfast', label: 'Bữa sáng', icon: 'cafe' },
    { key: 'lunch', label: 'Bữa trưa', icon: 'pizza' },
    { key: 'dinner', label: 'Bữa tối', icon: 'restaurant' },
    { key: 'snack', label: 'Bữa phụ', icon: 'fast-food' },
];

export default function MealEntryScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const [selectedItem, setSelectedItem] = useState(null); // ingredient hoặc dish
    const [quantity, setQuantity] = useState(100); // mặc định 100g hoặc 1 phần
    const [quantityModalVisible, setQuantityModalVisible] = useState(false);

    const [modalVisible, setModalVisible] = useState(false);
    const [mealType, setMealType] = useState('breakfast');
    const [label, setLabel] = useState('Bữa sáng');
    const [searchText, setSearchText] = useState('');
    const [ingredients, setIngredients] = useState([]);
    const [dishes, setDishes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const { mealType: routeMealType, label: routeLabel } = route.params || {};
        if (routeMealType) {
            setMealType(routeMealType);
            const match = allMealTypes.find((m) => m.key === routeMealType);
            setLabel(routeLabel || match?.label || 'Bữa ăn');
        }
    }, [route.params]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) return;
            const decoded = jwtDecode(token);
            const userId = decoded.id;

            const [ingredientRes, dishRes] = await Promise.all([
                axios.get(`${PUBLIC_SERVER_ENDPOINT}/ingredients`),
                axios.get(`${PUBLIC_SERVER_ENDPOINT}/dish?userId=${userId}`)
            ]);

            const userIngredients = ingredientRes.data.filter(i => !i.userId || i.userId === userId);
            setIngredients(userIngredients);
            setDishes(dishRes.data);
        } catch (error) {
            console.log('Lỗi khi lấy dữ liệu:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = [...ingredients, ...dishes].filter(item =>
        item.name?.toLowerCase().includes(searchText.toLowerCase())
    );

    const handleGoBack = () => navigation.goBack();

    const handleSwitchMeal = (meal) => {
        setMealType(meal.key);
        setLabel(meal.label);
        setModalVisible(false);
    };

    const confirmAddToMeal = async () => {
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

            const res = await axios.get(`${PUBLIC_SERVER_ENDPOINT}/meals/by-date`, {
                params: { date: formattedDate, mealType, userId },
            });

            const existingMeal = res.data;

            const updatedIngredients = [...existingMeal.ingredients];
            const updatedDishes = [...existingMeal.dish];

            if (selectedItem.ingredients) {
                // Là Dish
                const index = updatedDishes.findIndex(d => d.dishId._id === selectedItem._id || d.dishId === selectedItem._id);
                if (index !== -1) {
                    updatedDishes[index].quantity = quantity;
                } else {
                    updatedDishes.push({ dishId: selectedItem._id, quantity });
                }
            } else {
                // Là Ingredient
                const index = updatedIngredients.findIndex(i => i.ingredientId._id === selectedItem._id || i.ingredientId === selectedItem._id);
                if (index !== -1) {
                    updatedIngredients[index].quantity = quantity;
                } else {
                    updatedIngredients.push({ ingredientId: selectedItem._id, quantity });
                }
            }

            console.log('Updating meal with:', { ingredients: updatedIngredients, dishes: updatedDishes });

            await axios.put(`${PUBLIC_SERVER_ENDPOINT}/meals/${existingMeal._id}`, {
                userId,
                mealType,
                date: formattedDate,
                ingredients: updatedIngredients.map(i => ({
                    ingredientId: i.ingredientId._id || i.ingredientId,
                    quantity: i.quantity,
                })),
                dish: updatedDishes.map(d => ({
                    dishId: d.dishId._id || d.dishId,
                    quantity: d.quantity,
                })),
            });

        } catch (err) {
            console.log('Error details:', err.response?.status, err.response?.data, err.message);
            if (err.response?.status === 404) {
                // Tạo mới meal
                const newMealData = {
                    userId,
                    mealType,
                    date: formattedDate,
                    ingredients: selectedItem.ingredients
                        ? []
                        : [{ ingredientId: selectedItem._id, quantity }],
                    dish: selectedItem.ingredients
                        ? [{ dishId: selectedItem._id, quantity }]
                        : [],
                };
                
                console.log('Creating new meal with:', newMealData);
                
                await axios.post(`${PUBLIC_SERVER_ENDPOINT}/meals`, newMealData);
                console.log('New meal created successfully');
            } else {
                console.log("Lỗi khi thêm vào meal:", err.message);
            }
        } finally {
            setQuantityModalVisible(false);
        }
    };


    return (
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleGoBack}>
                        <Ionicons name="close" size={28} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.mealTypeButton}>
                        <Text style={styles.mealTypeText}>{label}</Text>
                        <Ionicons name="chevron-down" size={20} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity>
                        <Ionicons name="ellipsis-vertical" size={20} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Search */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#999" />
                    <TextInput
                        placeholder="Tìm kiếm..."
                        style={styles.searchInput}
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                </View>

                {/* List */}
                {loading ? (
                    <ActivityIndicator size="large" color="#3ECF8C" style={{ marginTop: 30 }} />
                ) : filteredItems.length === 0 ? (
                    <Text style={styles.noResult}>Không tìm thấy kết quả</Text>
                ) : (
                    <FlatList
                        data={filteredItems}
                        keyExtractor={(item) => item._id}
                        renderItem={({ item }) => (
                            <FavouriteIngredientCard
                                hideDelete={true}
                                name={item.name}
                                serving={item.ingredients ? "1 phần ăn" : "100g"}
                                calories={item.totals?.calories || item.caloriesPer100g}
                                onAdd={() => {
                                    setSelectedItem(item);
                                    setQuantity(item.ingredients ? 1 : 100); // 1 khẩu phần hoặc 100g
                                    setQuantityModalVisible(true);
                                }}
                                onDelete={null}
                                onPress={() => {
                                    if (item.ingredients) {
                                        navigation.navigate("DishDetail", { dish: item, mealType });
                                    } else {
                                        navigation.navigate("IngredientDetail", { ingredient: item, mealType });
                                    }
                                }}
                            />
                        )}
                        contentContainerStyle={styles.listContainer}
                    />
                )}

                {/* Dropdown */}
                {modalVisible && (
                    <View style={styles.dropdownMenu}>
                        {allMealTypes.map((type) => (
                            <TouchableOpacity
                                key={type.key}
                                style={styles.menuItem}
                                onPress={() => handleSwitchMeal(type)}
                            >
                                <Ionicons name={type.icon} size={20} color="#444" style={{ marginRight: 10 }} />
                                <Text style={{ fontSize: 16 }}>{type.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {quantityModalVisible && (
                    <View style={styles.overlay}>
                        <View style={styles.modal}>
                            <Text style={styles.modalTitle}>
                                Nhập {selectedItem?.ingredients ? "số phần ăn" : "số gram"} cho {selectedItem?.name}
                            </Text>

                            <View style={styles.quantityRow}>
                                <TouchableOpacity onPress={() => setQuantity(q => Math.max(1, q - 1))}>
                                    <Ionicons name="remove-circle-outline" size={30} color="#3ECF8C" />
                                </TouchableOpacity>
                                <Text style={styles.quantityText}>{quantity}</Text>
                                <TouchableOpacity onPress={() => setQuantity(q => q + 1)}>
                                    <Ionicons name="add-circle-outline" size={30} color="#3ECF8C" />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity style={styles.confirmButton} onPress={confirmAddToMeal}>
                                <Text style={styles.confirmButtonText}>Xác nhận</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>


        </TouchableWithoutFeedback>

    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        flexDirection: 'row',
        backgroundColor: '#3ECF8C',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingBottom: 15,
        paddingHorizontal: 15,
        height: 96,
    },
    mealTypeButton: { flexDirection: 'row', alignItems: 'center' },
    mealTypeText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        marginRight: 5,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 15,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        paddingHorizontal: 10,
    },
    searchInput: { flex: 1, height: 40, marginLeft: 10 },
    listContainer: { paddingHorizontal: 15, paddingBottom: 30 },
    dropdownMenu: {
        position: 'absolute',
        top: 105,
        alignSelf: 'center',
        backgroundColor: 'white',
        borderRadius: 10,
        paddingVertical: 8,
        width: 180,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        zIndex: 10,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 10,
    },
    noResult: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
        marginTop: 20,
    },
    overlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    modal: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 20,
        alignItems: 'center',
        width: '80%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    quantityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        marginVertical: 20,
    },
    quantityText: {
        fontSize: 20,
        fontWeight: 'bold',
        minWidth: 40,
        textAlign: 'center',
    },
    confirmButton: {
        backgroundColor: '#3ECF8C',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
    },
    confirmButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },

});
