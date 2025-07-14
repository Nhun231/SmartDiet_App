import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const allMealTypes = [
  { key: 'breakfast', label: 'Bữa sáng', icon: 'cafe' },
  { key: 'lunch', label: 'Bữa trưa', icon: 'pizza' },
  { key: 'dinner', label: 'Bữa tối', icon: 'restaurant' },
  { key: 'snack', label: 'Bữa phụ', icon: 'fast-food' },
];

const foodData = {
  breakfast: [
    { name: 'Bánh mì', calories: 249 },
    { name: 'Chuối', calories: 90 },
  ],
  lunch: [
    { name: 'Cơm', calories: 130 },
    { name: 'Thịt gà', calories: 200 },
  ],
  dinner: [
    { name: 'Canh chua', calories: 150 },
    { name: 'Trứng', calories: 160 },
  ],
  snack: [
    { name: 'Khoai lang', calories: 178 },
    { name: 'Súc xích', calories: 250 },
  ],
};

export default function MealEntryScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { mealType = 'breakfast', label = 'Bữa sáng' } = route.params || {};

  const [modalVisible, setModalVisible] = useState(false);
  const currentMealType = mealType;

  const filteredMealTypes = allMealTypes.filter((m) => m.key !== currentMealType);

  const handleSwitchMeal = (meal) => {
    setModalVisible(false);
    navigation.replace('MealEntry', { mealType: meal.key, label: meal.label });
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const renderFoodItem = ({ item }) => (
    <View style={styles.foodItem}>
      <Text style={styles.foodName}>{item.name}</Text>
      <Text style={styles.calories}>{item.calories} calo</Text>
      <TouchableOpacity>
        <Ionicons name="add-circle-outline" size={24} color="gray" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
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

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" />
        <TextInput placeholder="Tìm kiếm..." style={styles.searchInput} />
      </View>

      <FlatList
        data={foodData[currentMealType] || []}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        renderItem={renderFoodItem}
        contentContainerStyle={styles.listContainer}
      />

      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setModalVisible(false)}
        >
          <View style={styles.modalMenu}>
            {filteredMealTypes.map((type) => (
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
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    backgroundColor: '#3ECF8C',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  mealTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
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
  searchInput: {
    flex: 1,
    height: 40,
    marginLeft: 10,
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  foodName: {
    fontSize: 16,
  },
  calories: {
    fontSize: 14,
    color: '#888',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  modalMenu: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    width: 200,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
});
