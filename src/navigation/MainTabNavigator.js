import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect } from 'react';
import FavouriteScreen from '../screens/FavouriteScreen';
import PersonalScreen from "../screens/PersonalScreen";
import DiaryScreen from "../screens/DiaryScreen";
import FloatingChatbotButton from "../components/FloatingChatbotButton";
import SettingNavigator from './SettingNavigator';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  const navigation = useNavigation();
  const route = useRoute();

  useEffect(() => {
    if (route.params?.initialTab === 'Cá nhân') {
      const timer = setTimeout(() => {
        navigation.navigate('Cá nhân', {
          plan: route.params?.planData
        });
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [route.params]);
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Nhật kí') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Yêu thích') {
              iconName = focused ? 'heart' : 'heart-outline';
            } else if (route.name === 'Cài đặt') {
              iconName = focused ? 'settings' : 'settings-outline';
            } else if (route.name === 'PersonalTab') {
              iconName = focused ? 'person' : 'person-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#4CD08D',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
        })}
      >
        <Tab.Screen name="Nhật kí" component={DiaryScreen} />
        <Tab.Screen name="Yêu thích" component={FavouriteScreen} />
        <Tab.Screen
          name="PersonalTab"
          component={PersonalScreen}
          options={{ tabBarLabel: 'Cá nhân' }} // vẫn hiện tiếng Việt
        />
        <Tab.Screen name="Cài đặt" component={SettingNavigator} />
      </Tab.Navigator>
      <FloatingChatbotButton />
    </View>
  );
}
