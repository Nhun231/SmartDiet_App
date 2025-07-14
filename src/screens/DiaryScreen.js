import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, StatusBar, ScrollView, TouchableOpacity, Modal, Dimensions, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar } from 'react-native-calendars';
import CircularTracker from '../components/CircularTracker';
import WaterGlassIcon from '../icons/WaterGlassIcon';
import CalendarIcon from '../icons/CalendarIcon';
import FloatingActionMenu from '../components/FloatingActionMenu';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import MealHistory from '../components/MealHistory';

const { width } = Dimensions.get('window');

const BASE_URL = "http://192.168.1.29:8080/smartdiet";

const calculateNutritionFromIngredients = (ingredients) => {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalFat = 0;
  let totalCarbs = 0;
  let totalFiber = 0;

  if (ingredients && ingredients.length > 0) {
    ingredients.forEach(item => {
      if (item.ingredientId && item.ingredientId.caloriesPer100g !== undefined && item.quantity !== undefined) {
        const ratio = item.quantity / 100;
        totalCalories += (item.ingredientId.caloriesPer100g * ratio);
        totalProtein += (item.ingredientId.proteinPer100g || 0) * ratio;
        totalFat += (item.ingredientId.fatPer100g || 0) * ratio;
        totalCarbs += (item.ingredientId.carbsPer100g || 0) * ratio;
        totalFiber += (item.ingredientId.fiberPer100g || 0) * ratio;
      }
    });
  }
  return { calories: totalCalories, protein: totalProtein, fat: totalFat, carbs: totalCarbs, fiber: totalFiber };
};

const calculateMealNutrition = (meal) => {
  let mealCalories = 0;
  let mealProtein = 0;
  let mealFat = 0;
  let mealCarbs = 0;
  let mealFiber = 0;

  if (meal.ingredients && meal.ingredients.length > 0) {
    const ingredientNutrition = calculateNutritionFromIngredients(meal.ingredients);
    mealCalories += ingredientNutrition.calories;
    mealProtein += ingredientNutrition.protein;
    mealFat += ingredientNutrition.fat;
    mealCarbs += ingredientNutrition.carbs;
    mealFiber += ingredientNutrition.fiber;
  }

  if (meal.dish && meal.dish.length > 0) {
    meal.dish.forEach(dishItem => {
      if (dishItem.dishId && dishItem.dishId.totals && dishItem.quantity !== undefined) {
        mealCalories += (dishItem.dishId.totals.calories || 0) * dishItem.quantity;
        mealProtein += (dishItem.dishId.totals.protein || 0) * dishItem.quantity;
        mealFat += (dishItem.dishId.totals.fat || 0) * dishItem.quantity;
        mealCarbs += (dishItem.dishId.totals.carbs || 0) * dishItem.quantity;
        mealFiber += (dishItem.dishId.totals.fiber || 0) * dishItem.quantity;
      }
    });
  }

  return {
    calories: mealCalories,
    protein: mealProtein,
    fat: mealFat,
    carbs: mealCarbs,
    fiber: mealFiber,
  };
};

export default function HealthTrackingScreen() {
  const [waterGlasses, setWaterGlasses] = useState([]);
  const [currentGlass, setCurrentGlass] = useState(0);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [dailyCaloriesTarget, setDailyCaloriesTarget] = useState(0);
  const [caloriesConsumed, setCaloriesConsumed] = useState(0);
  const [macrosConsumed, setMacrosConsumed] = useState({ carbs: 0, protein: 0, fat: 0, fiber: 0 });
  const [loading, setLoading] = useState(true);
  const [isWaterGoalModalVisible, setIsWaterGoalModalVisible] = useState(false);
  const [tempWaterGoalInput, setTempWaterGoalInput] = useState('');
  const [waterGoal, setWaterGoal] = useState(2000);
  const WATER_GLASS_VOLUME = 250;

  const [apiUserId, setApiUserId] = useState(null);

  const saveWaterTimeoutRef = useRef(null);

  const saveWaterData = async (userId, date, currentGlassesFilled, goal) => {
    if (!userId) {
      console.warn("User ID not available for saving water data.");
      return;
    }
    try {
      const dataToSave = JSON.stringify({
        glassesFilled: currentGlassesFilled,
        waterGoal: goal,
        lastUpdated: new Date().toISOString(),
      });
      await AsyncStorage.setItem(`@dailyWater:${userId}:${date}`, dataToSave);
      console.log(`Water data saved for ${userId} on ${date}: ${currentGlassesFilled} glasses, goal ${goal}ml`);
    } catch (e) {
      console.error("Error saving water data: ", e);
    }
  };

  const loadWaterData = async (userId, date) => {
    if (!userId) {
      console.warn("User ID not available for loading water data.");
      return;
    }
    try {
      const storedData = await AsyncStorage.getItem(`@dailyWater:${userId}:${date}`);
      if (storedData) {
        const data = JSON.parse(storedData);
        console.log(`Water data loaded for ${userId} on ${date}:`, data);
        setWaterGoal(data.waterGoal || 2000);
        setCurrentGlass(data.glassesFilled || 0);
      } else {
        console.log(`No water data found for ${userId} on ${date}. Using defaults.`);
        setWaterGoal(2000);
        setCurrentGlass(0);
      }
    } catch (e) {
      console.error("Error loading water data: ", e);
      setWaterGoal(2000);
      setCurrentGlass(0);
    }
  };

  useEffect(() => {
    if (selectedDate && apiUserId) {
      loadWaterData(apiUserId, selectedDate);
    }
  }, [selectedDate, apiUserId]);

  useEffect(() => {
    const maxGlasses = Math.ceil(waterGoal / WATER_GLASS_VOLUME);
    const newWaterGlasses = Array(maxGlasses).fill(false);
    for (let i = 0; i < currentGlass && i < maxGlasses; i++) {
      newWaterGlasses[i] = true;
    }
    setWaterGlasses(newWaterGlasses);

    if (saveWaterTimeoutRef.current) {
      clearTimeout(saveWaterTimeoutRef.current);
    }
    saveWaterTimeoutRef.current = setTimeout(() => {
      saveWaterData(apiUserId, selectedDate, currentGlass, waterGoal);
    }, 500);
  }, [waterGoal, currentGlass, selectedDate, apiUserId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) {
          console.error("Token không tồn tại.");
          setLoading(false);
          return;
        }

        try {
          const decodedToken = JSON.parse(atob(token.split('.')[1]));
          setApiUserId(decodedToken.id);
        } catch (decodeError) {
          console.error("Lỗi giải mã token:", decodeError);
          setLoading(false);
          return;
        }

        const response = await axios.get(`${BASE_URL}/customer/dietplan/get-current`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        });

        if (response.status === 200) {
          const data = response.data;
          setDailyCaloriesTarget(data.dailyCalories);
        }
      } catch (error) {
        console.error('Error fetching diet plan:', error);
      } finally {
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchMealsAndCalculateTotals = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token || !apiUserId || !selectedDate) {
          setLoading(false);
          return;
        }

        let totalCaloriesForDay = 0;
        let totalProteinForDay = 0;
        let totalFatForDay = 0;
        let totalCarbsForDay = 0;
        let totalFiberForDay = 0;

        const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
        for (const mealType of mealTypes) {
          try {
            const mealResponse = await axios.get(`${BASE_URL}/meals/by-date`, {
              headers: { 'Authorization': `Bearer ${token}` },
              params: { userId: apiUserId, date: selectedDate, mealType },
              timeout: 10000,
            });

            if (mealResponse.status === 200 && mealResponse.data) {
              const meal = mealResponse.data;
              const { calories, protein, fat, carbs, fiber } = calculateMealNutrition(meal);
              totalCaloriesForDay += calories;
              totalProteinForDay += protein;
              totalFatForDay += fat;
              totalCarbsForDay += carbs;
              totalFiberForDay += fiber;
            }
          } catch (mealError) {
            if (mealError.response && mealError.response.status === 404) {
            } else {
              console.error(`Error fetching meal type ${mealType}:`, mealError.response ? mealError.response.data : mealError.message);
            }
          }
        }

        setCaloriesConsumed(totalCaloriesForDay);
        setMacrosConsumed({
          carbs: totalCarbsForDay,
          protein: totalProteinForDay,
          fat: totalFatForDay,
          fiber: totalFiberForDay
        });

        // Removed targetMacros fetching as it's no longer used
      } catch (overallError) {
        console.error('Overall error in fetchMealsAndCalculateTotals:', overallError.response ? overallError.response.data : overallError.message);
        setCaloriesConsumed(0);
        setMacrosConsumed({ carbs: 0, protein: 0, fat: 0, fiber: 0 });
      } finally {
        setLoading(false);
      }
    };

    if (selectedDate && apiUserId) {
      fetchMealsAndCalculateTotals();
    }
  }, [selectedDate, dailyCaloriesTarget, apiUserId]); 

  const handleGlassClick = (index) => {
    const maxGlasses = Math.ceil(waterGoal / WATER_GLASS_VOLUME);
    let newCurrentGlass;

    if (index + 1 > currentGlass) {
      newCurrentGlass = index + 1;
    } else if (index + 1 === currentGlass) {
      newCurrentGlass = index;
    } else {
      newCurrentGlass = index + 1;
    }

    setCurrentGlass(Math.min(newCurrentGlass, maxGlasses));
  };

  const getDateLabel = () => {
    const today = new Date();
    const selected = new Date(selectedDate);
    const diffInDays = Math.floor(
      (selected.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) return 'Hôm nay';
    if (diffInDays === -1) return 'Hôm qua';
    if (diffInDays === 1) return 'Ngày mai';

    if (diffInDays < 0) {
      const absDays = Math.abs(diffInDays);
      if (absDays <= 6) return `${absDays} ngày trước`;
      if (absDays <= 13) return 'Tuần trước';
      if (absDays <= 20) return '2 tuần trước';
      if (absDays <= 27) return '3 tuần trước';

      const diffInMonths = today.getMonth() - selected.getMonth() + 12 * (today.getFullYear() - selected.getFullYear());
      if (diffInMonths === 1) return 'Tháng trước';
      if (diffInMonths === 2) return '2 tháng trước';
      if (diffInMonths >= 3 && diffInMonths < 12) return `${diffInMonths} tháng trước`;
      if (diffInMonths >= 12) return '1 năm trước';
    } else {
      if (diffInDays <= 1) return `${diffInDays} ngày tới`;
      return 'Thời gian tới';
    }

    return selected.toLocaleDateString('vi-VN');
  };

  const totalWaterConsumed = currentGlass * WATER_GLASS_VOLUME;

  const handleFloatingAction = (label) => {
    console.log('Selected:', label);
  };

  const handleSaveWaterGoal = () => {
    const newGoal = parseInt(tempWaterGoalInput);
    if (isNaN(newGoal) || newGoal < 1000 || newGoal > 2000) {
      Alert.alert("Lỗi", "Mục tiêu nước phải là số từ 1000ml đến 2000ml.");
      return;
    }
    setWaterGoal(newGoal);
    setIsWaterGoalModalVisible(false);
    const maxGlassesForNewGoal = Math.ceil(newGoal / WATER_GLASS_VOLUME);
    if (currentGlass > maxGlassesForNewGoal) {
      setCurrentGlass(maxGlassesForNewGoal);
    }
    saveWaterData(apiUserId, selectedDate, currentGlass, newGoal);
  };

  if (loading || !apiUserId) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const caloriesRemaining = Math.max(0, dailyCaloriesTarget - caloriesConsumed);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3ECF8C" />
      <ScrollView style={styles.scrollViewContent}>
        <LinearGradient colors={['#3ECF8C', '#3ECF8C']} style={styles.header}>
          <View style={styles.titleSection}>
            <View style={styles.titleRow}>
              <Text style={styles.titleText}>{getDateLabel()}</Text>
              <View style={styles.dateNavigation}>
                <TouchableOpacity
                  onPress={() => {
                    const prev = new Date(selectedDate);
                    prev.setDate(prev.getDate() - 1);
                    setSelectedDate(prev.toISOString().split('T')[0]);
                  }}
                >
                  <Text style={styles.navArrow}>‹</Text>
                </TouchableOpacity>

                <View style={styles.dateContainer}>
                  <TouchableOpacity onPress={() => setIsCalendarVisible(true)}>
                    <CalendarIcon size={20} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      const today = new Date().toISOString().split('T')[0];
                      if (selectedDate !== today) {
                        setSelectedDate(today);
                      }
                    }}
                  >
                    <Text style={styles.dateText}>
                      {new Date(selectedDate).getDate()} thg{' '}
                      {new Date(selectedDate).getMonth() + 1}
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    const next = new Date(selectedDate);
                    next.setDate(next.getDate() + 1);
                    setSelectedDate(next.toISOString().split('T')[0]);
                  }}
                >
                  <Text style={styles.navArrow}>›</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.sideInfo}>
              <Text style={styles.sideNumber}>{caloriesRemaining.toFixed(0)}</Text>
              <Text style={styles.sideLabel}>cần nạp</Text>
            </View>

            <View style={styles.circularProgress}>
              <CircularTracker
                currentValue={caloriesConsumed}
                targetValue={dailyCaloriesTarget}
                size={160}
              />
              <Text style={styles.caloriesRemainingText}>
                {caloriesConsumed.toFixed(0)} đã nạp
              </Text>
            </View>
          </View>

          <View style={styles.nutritionStats}>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>Tinh bột</Text>
              <Text style={styles.nutritionValue}>{macrosConsumed.carbs.toFixed(0)}</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>Chất đạm</Text>
              <Text style={styles.nutritionValue}>{macrosConsumed.protein.toFixed(0)}</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>Chất béo</Text>
              <Text style={styles.nutritionValue}>{macrosConsumed.fat.toFixed(0)}</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>Chất xơ</Text>
              <Text style={styles.nutritionValue}>{macrosConsumed.fiber.toFixed(0)}</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.waterSection}>
          <View style={styles.waterHeader}>
            <Text style={styles.waterTitle}>Bạn đã uống bao nhiêu nước</Text>
            <TouchableOpacity onPress={() => setIsWaterGoalModalVisible(true)}>
              <Text style={styles.waterAmount}>{totalWaterConsumed}/{waterGoal} ml</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.waterGlasses}>
            {waterGlasses.map((isFilled, index) => (
              <View key={index} style={styles.glassContainer}>
                <TouchableOpacity
                  style={styles.waterGlass}
                  onPress={() => handleGlassClick(index)}
                >
                  <WaterGlassIcon filled={index < currentGlass} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <MealHistory selectedDate={selectedDate} userId={apiUserId} />
      </ScrollView>

      <FloatingActionMenu onSelect={handleFloatingAction} />

      <Modal
        animationType="slide"
        transparent={true}
        visible={isCalendarVisible}
        onRequestClose={() => setIsCalendarVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              onPress={() => setIsCalendarVisible(false)}
              style={{ alignSelf: 'flex-end', marginBottom: 10 }}
            >
              <Text style={{ fontSize: 16, color: '#3ECF8C' }}>Đóng</Text>
            </TouchableOpacity>
            <Calendar
              current={selectedDate}
              onDayPress={(day) => {
                setSelectedDate(day.dateString);
                setIsCalendarVisible(false);
              }}
              markedDates={{
                [selectedDate]: { selected: true, selectedColor: '#3ECF8C' },
              }}
              theme={{
                selectedDayBackgroundColor: '#3ECF8C',
                todayTextColor: '#3ECF8C',
                arrowColor: '#3ECF8C',
              }}
            />
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={isWaterGoalModalVisible}
        onRequestClose={() => setIsWaterGoalModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.waterGoalModalContent}>
            <Text style={styles.waterGoalModalTitle}>Đặt mục tiêu nước hàng ngày (ml)</Text>
            <TextInput
              style={styles.waterGoalInput}
              keyboardType="numeric"
              placeholder="Nhập mục tiêu (1000 - 2000 ml)"
              value={tempWaterGoalInput}
              onChangeText={setTempWaterGoalInput}
              maxLength={4}
            />
            <View style={styles.waterGoalModalButtons}>
              <TouchableOpacity style={styles.waterGoalButtonCancel} onPress={() => setIsWaterGoalModalVisible(false)}>
                <Text style={styles.waterGoalButtonTextCancel}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.waterGoalButtonSave} onPress={handleSaveWaterGoal}>
                <Text style={styles.waterGoalButtonTextSave}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollViewContent: { 
    flex: 1,
    backgroundColor: '#f5f5f5', 
  },
  header: { 
    paddingTop: 15,
    paddingBottom: 40,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  titleSection: { paddingHorizontal: 20, marginBottom: 20 },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleText: { color: 'white', fontSize: 28, fontWeight: 'bold' },
  dateNavigation: { flexDirection: 'row', alignItems: 'center' },
  navArrow: {
    color: 'white', fontSize: 24, fontWeight: 'bold', paddingHorizontal: 15,
  },
  dateContainer: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  dateText: {
    color: 'white', fontSize: 18, fontWeight: '600', marginLeft: 8,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  sideInfo: { alignItems: 'center', marginLeft: 30 },
  sideNumber: { color: 'white', fontSize: 32, fontWeight: 'bold' },
  sideLabel: { color: 'white', fontSize: 14, marginTop: 5 },
  circularProgress: { alignItems: 'center', justifyContent: 'center' },
  caloriesRemainingText: {
    color: 'white',
    fontSize: 20, 
    fontWeight: '600',
    marginTop: 10,
  },
  nutritionStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  nutritionItem: { alignItems: 'center' },
  nutritionLabel: {
    color: 'white', fontSize: 16, fontWeight: '600', marginBottom: 8,
  },
  nutritionValue: { color: 'white', fontSize: 14, opacity: 0.9 },
  content: { flex: 1, backgroundColor: '#f5f5f5' },
  sectionDivider: { 
    height: 20, backgroundColor: '#f5f5f5', borderTopLeftRadius: 30,
    borderTopRightRadius: 30, marginTop: -20,
  },
  waterSection: {
    backgroundColor: 'white', margin: 20, padding: 20, borderRadius: 15,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  waterHeader: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20,
  },
  waterTitle: { fontSize: 16, fontWeight: '600', color: '#333', flex: 1 },
  waterAmount: {
    fontSize: 16, color: '#2394ED', textDecorationLine: 'underline',
  },
  waterGlasses: {
    flexDirection: 'row', justifyContent: 'space-between', marginTop: 10,
  },
  glassContainer: {
    width: 40, height: 60, alignItems: 'center', justifyContent: 'flex-end',
  },
  waterGlass: {
    width: 32, height: 50, alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  addGlassText: {
    position: 'absolute', top: 10, fontSize: 20, fontWeight: 'bold',
    color: '#26C6DA', zIndex: 1,
  },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center',
    alignItems: 'center', padding: 20,
  },
  modalContent: {
    backgroundColor: 'white', borderRadius: 20, padding: 20, width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  waterGoalModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  waterGoalModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  waterGoalInput: {
    width: '80%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 16,
  },
  waterGoalModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  waterGoalButtonSave: {
    backgroundColor: '#3ECF8C',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  waterGoalButtonTextSave: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  waterGoalButtonCancel: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  waterGoalButtonTextCancel: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
