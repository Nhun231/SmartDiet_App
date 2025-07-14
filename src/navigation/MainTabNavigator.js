import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import DiaryScreen from '../screens/DiaryScreen';
import SettingScreen from '../screens/SettingScreen';
import FavouriteScreen from '../screens/FavouriteScreen';
import PersonalScreen from "../screens/PersonalScreen";

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  return (
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
          } else if (route.name === 'Cá nhân') {
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
      <Tab.Screen
        name="Yêu thích"
        component={FavouriteScreen}
        options={{
          headerShown: false,
        }}
      />
        <Tab.Screen name="Cá nhân" component={PersonalScreen}
                    options={{
                        headerShown: false,
                    }}/>
      <Tab.Screen name="Cài đặt" component={SettingScreen}
                  options={{
                      headerShown: false,
                  }}/>

    </Tab.Navigator>
  );
}
