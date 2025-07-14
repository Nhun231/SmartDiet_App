import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = "http://192.168.1.29:8080/smartdiet";

const MealHistory = ({ selectedDate }) => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const mealTypeTranslations = {
    'breakfast': 'Bữa sáng',
    'lunch': 'Bữa trưa',
    'dinner': 'Bữa tối',
    'snack': 'Bữa phụ',
  };

  const getMealsByDate = async () => {
    setLoading(true);
    setMeals([]);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        setError("Lỗi xác thực: Không tìm thấy token. Vui lòng đăng nhập lại.");
        setLoading(false);
        return;
      }

      let userId = null;
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        userId = decodedToken.id;
      } catch (decodeError) {
        setError("Lỗi xác thực: Token không hợp lệ hoặc bị hỏng.");
        setLoading(false);
        return;
      }

      if (!selectedDate) {
        setError("Lỗi: Vui lòng chọn một ngày để xem lịch sử bữa ăn.");
        setLoading(false);
        return;
      }

      const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
      const fetchedMeals = [];
      let hasSeriousError = false;

      for (const mealType of mealTypes) {
        try {
          const response = await axios.get(`${BASE_URL}/meals/by-date`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            params: {
              date: selectedDate,
              userId: userId,
              mealType: mealType
            }
          });

          if (response.status === 200 && response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
            const meal = response.data;
            // Kiểm tra cả dish và ingredients để đảm bảo có nội dung hợp lệ
            const hasValidContent =
              (meal.dish && meal.dish.length > 0 && meal.dish.some(d => d.dishId && d.dishId.name)) ||
              (meal.ingredients && meal.ingredients.length > 0 && meal.ingredients.some(i => i.ingredientId && i.ingredientId.name));

            if (hasValidContent) {
              fetchedMeals.push(meal);
            }
          }
        } catch (apiError) {
          if (apiError.response && apiError.response.status === 404) {
            console.log(`[INFO] Không tìm thấy bữa ăn cho loại ${mealType}, tiếp tục...`);
          } else {
            setError(`Lỗi từ máy chủ khi lấy bữa ăn loại ${mealType}: ${apiError.message}`);
            hasSeriousError = true;
            break;
          }
        }
      }

      if (!hasSeriousError) {
        setMeals(fetchedMeals);
        if (fetchedMeals.length === 0) {
          setError("Không có bữa ăn nào được ghi lại cho ngày này.");
        }
      }
      setLoading(false);
    } catch (overallError) {
      setError(`Đã xảy ra lỗi tổng quát: ${overallError.message}. Vui lòng thử lại.`);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      getMealsByDate();
    } else {
      setMeals([]);
      setLoading(false);
      setError("Vui lòng chọn một ngày để xem lịch sử bữa ăn.");
    }
  }, [selectedDate]);

  const handleDeleteDishFromMeal = async (mealId, dishEntryId) => {
    Alert.alert(
      "Xác nhận xóa món ăn",
      "Bạn có chắc chắn muốn xóa món ăn này khỏi bữa ăn không?",
      [
        {
          text: "Hủy",
          style: "cancel"
        },
        {
          text: "Xóa",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('accessToken');
              if (!token) {
                Alert.alert("Lỗi xác thực", "Không tìm thấy token truy cập.");
                return;
              }

              const currentMeal = meals.find(m => m._id === mealId);
              if (!currentMeal) {
                Alert.alert("Lỗi", "Không tìm thấy bữa ăn để cập nhật.");
                return;
              }

              const updatedDishArray = currentMeal.dish.filter(d => d._id !== dishEntryId);

              const payload = {
                mealType: currentMeal.mealType,
                date: currentMeal.date.split('T')[0],
                ingredients: currentMeal.ingredients, 
                dish: updatedDishArray, 
              };

              const response = await axios.put(`${BASE_URL}/meals/${mealId}`, payload, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });

              if (response.status === 200) {
                Alert.alert("Thành công", "Món ăn đã được xóa khỏi bữa ăn.");
                getMealsByDate(); 
              }
            } catch (deleteError) {
              console.error("Lỗi khi xóa món ăn:", deleteError);
              Alert.alert("Lỗi xóa món ăn", deleteError.message);
            }
          }
        }
      ]
    );
  };

  const handleDeleteIngredientFromMeal = async (mealId, ingredientEntryId) => {
    Alert.alert(
      "Xác nhận xóa thực phẩm",
      "Bạn có chắc chắn muốn xóa thực phẩm này khỏi bữa ăn không?",
      [
        {
          text: "Hủy",
          style: "cancel"
        },
        {
          text: "Xóa",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('accessToken');
              if (!token) {
                Alert.alert("Lỗi xác thực", "Không tìm thấy token truy cập.");
                return;
              }

              const currentMeal = meals.find(m => m._id === mealId);
              if (!currentMeal) {
                Alert.alert("Lỗi", "Không tìm thấy bữa ăn để cập nhật.");
                return;
              }

              const updatedIngredientsArray = currentMeal.ingredients.filter(i => i._id !== ingredientEntryId);

              // Prepare payload for update
              const payload = {
                mealType: currentMeal.mealType,
                date: currentMeal.date.split('T')[0],
                ingredients: updatedIngredientsArray, 
                dish: currentMeal.dish, 
              };

              const response = await axios.put(`${BASE_URL}/meals/${mealId}`, payload, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });

              if (response.status === 200) {
                Alert.alert("Thành công", "Thực phẩm đã được xóa khỏi bữa ăn.");
                getMealsByDate();
              }
            } catch (deleteError) {
              console.error("Lỗi khi xóa thực phẩm:", deleteError);
              Alert.alert("Lỗi xóa thực phẩm", deleteError.message);
            }
          }
        }
      ]
    );
  };

  const groupedMeals = meals.reduce((acc, meal) => {
    // Cập nhật điều kiện kiểm tra nội dung hợp lệ để bao gồm cả ingredients
    const hasValidContent =
      (meal.dish && meal.dish.length > 0 && meal.dish.some(d => d.dishId && d.dishId.name)) ||
      (meal.ingredients && meal.ingredients.length > 0 && meal.ingredients.some(i => i.ingredientId && i.ingredientId.name));

    if (hasValidContent) {
      if (!acc[meal.mealType]) {
        acc[meal.mealType] = [];
      }
      acc[meal.mealType].push(meal);
    }
    return acc;
  }, {});

  const orderedMealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

  return (
    <ScrollView style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00D4AA" />
          <Text style={styles.loadingText}>Đang tải dữ liệu bữa ăn...</Text>
        </View>
      ) : error && Object.keys(groupedMeals).length === 0 ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : Object.keys(groupedMeals).length > 0 ? (
        orderedMealTypes.map((mealType, index) => (
          groupedMeals[mealType] && groupedMeals[mealType].length > 0 && (
            <View key={index} style={styles.mealContainer}>
              {/* Translate meal type */}
              <Text style={styles.mealTitle}>{mealTypeTranslations[mealType] || mealType.charAt(0).toUpperCase() + mealType.slice(1)}</Text>
              {groupedMeals[mealType].map((meal, mealIndex) => (
                <View key={mealIndex} style={styles.mealItem}>
                  {/* Hiển thị món ăn */}
                  {meal.dish && meal.dish.length > 0 && (
                    <View>
                      <Text style={styles.sectionHeader}>Món ăn:</Text>
                      {meal.dish.map((dishItem, dishItemIndex) => (
                        dishItem.dishId && dishItem.dishId.name ? (
                          <View key={dishItemIndex} style={styles.dishEntryRow}>
                            <Text style={styles.mealName}>{dishItem.dishId.name}</Text>
                            <TouchableOpacity
                              style={styles.deleteButton}
                              onPress={() => handleDeleteDishFromMeal(meal._id, dishItem._id)}
                            >
                              <Text style={styles.deleteButtonText}>Xóa</Text>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <Text key={dishItemIndex} style={styles.itemErrorText}>Tên món ăn không có (Lỗi Populate)</Text>
                        )
                      ))}
                    </View>
                  )}

                  {/* Hiển thị nguyên liệu trực tiếp */}
                  {meal.ingredients && meal.ingredients.length > 0 && (
                    <View>
                      <Text style={styles.sectionHeader}>Thực phẩm:</Text> 
                      {meal.ingredients.map((ingredientItem, ingredientItemIndex) => (
                        ingredientItem.ingredientId && ingredientItem.ingredientId.name ? (
                          <View key={ingredientItemIndex} style={styles.dishEntryRow}>
                            <Text style={styles.mealName}>{ingredientItem.ingredientId.name} ({ingredientItem.quantity}g)</Text>
                            <TouchableOpacity
                              style={styles.deleteButton}
                              onPress={() => handleDeleteIngredientFromMeal(meal._id, ingredientItem._id)} 
                            >
                              <Text style={styles.deleteButtonText}>Xóa</Text>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <Text key={ingredientItemIndex} style={styles.itemErrorText}>Tên nguyên liệu không có (Lỗi Populate)</Text>
                        )
                      ))}
                    </View>
                  )}

                  {(!meal.dish || meal.dish.length === 0) && (!meal.ingredients || meal.ingredients.length === 0) && (
                    <Text style={styles.emptyMealContentText}>Bữa ăn này chưa có món ăn hoặc nguyên liệu nào.</Text>
                  )}

                  {/* Dòng Tổng Calo */}
                  {meal.totals && meal.totals.calories !== undefined && (
                    <Text style={styles.totalCaloriesText}>
                      Tổng Calo: {meal.totals.calories.toFixed(2)} kcal
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )
        ))
      ) : (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>Không có bữa ăn nào được ghi lại cho ngày này.</Text>
          <Text style={styles.noDataSubText}>Hãy thêm bữa ăn để theo dõi dinh dưỡng của bạn!</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
    backgroundColor: '#F7F9FC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    borderColor: '#EF5350',
    borderWidth: 1,
    borderRadius: 8,
    padding: 20,
    marginVertical: 20,
    alignItems: 'flex-start',
  },
  errorText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D32F2F',
    textAlign: 'left',
    marginBottom: 10,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  noDataText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#757575',
    marginBottom: 8,
  },
  noDataSubText: {
    fontSize: 14,
    color: '#9E9E9E',
    textAlign: 'center',
  },
  mealContainer: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    marginBottom: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 5,
    borderLeftWidth: 5,
    borderLeftColor: '#00D4AA',
  },
  mealTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF1',
    paddingBottom: 5,
  },
  mealItem: {
    backgroundColor: '#FDFDFD',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dishEntryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
    paddingRight: 5,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34495E',
    flex: 1,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#EF5350',
    borderWidth: 1,
  },
  deleteButtonText: {
    color: '#D32F2F',
    fontSize: 14,
    fontWeight: 'bold',
  },
  totalCaloriesText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#00D4AA',
    marginTop: 8,
    textAlign: 'right',
  },
  sectionHeader: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#4A6572',
    marginBottom: 8,
    marginTop: 5,
  },
  itemErrorText: {
    fontSize: 14,
    color: '#D32F2F',
    fontStyle: 'italic',
    marginBottom: 5,
  },
  emptyMealContentText: {
    fontSize: 14,
    color: '#757575',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 10,
  }
});

export default MealHistory;
