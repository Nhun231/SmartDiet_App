import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

export default function FloatingActionMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const navigation = useNavigation();

  const actions = [
    { label: 'Bữa phụ', icon: 'fast-food', screen: 'MealEntry', mealType: 'snack', color: '#4BC1FF' },
    { label: 'Bữa tối', icon: 'restaurant', screen: 'MealEntry', mealType: 'dinner', color: '#7AC37E' },
    { label: 'Bữa trưa', icon: 'pizza', screen: 'MealEntry', mealType: 'lunch', color: '#FD8369' },
    { label: 'Bữa sáng', icon: 'cafe', screen: 'MealEntry', mealType: 'breakfast', color: '#F86735' },
  ];

  return (
    <View style={styles.absoluteContainer}>
      {isOpen && (
        <View style={styles.actionsWrapper}>
          {actions.map((action, index) => (
            <View key={index} style={[styles.actionRow, { bottom: 15 + index * 50 }]}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: action.color }]}
                onPress={() => {
                  setIsOpen(false);
                  if (action.screen === 'MealEntry') {
                    navigation.navigate(action.screen, { mealType: action.mealType, label: action.label });
                  } else {
                    navigation.navigate(action.screen);
                  }
                }}
              >
                <Ionicons name={action.icon} size={20} color="white" />
              </TouchableOpacity>
              <View style={[styles.labelContainer, { backgroundColor: action.color }]}>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
      <TouchableOpacity style={styles.fab} onPress={() => setIsOpen((prev) => !prev)}>
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  absoluteContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: width,
    height: height,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  fab: {
    backgroundColor: '#4CC4D3',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
  actionsWrapper: {
    position: 'absolute',
    right: 20,
    bottom: 70,
    alignItems: 'flex-end',
  },
  actionRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    position: 'absolute',
    right: 0,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  labelContainer: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 10,
  },
  actionLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});
