import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import DiaryScreen from '../screens/DiaryScreen';
import SettingScreen from '../screens/SettingScreen';
import FavouriteScreen from '../screens/FavouriteScreen';
import PersonalScreen from "../screens/PersonalScreen";

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Nhật kí" component={DiaryScreen} />
      <Tab.Screen name="Yêu thích" component={FavouriteScreen} />
        <Tab.Screen name="Cá nhân" component={PersonalScreen} />
      <Tab.Screen name="Cài đặt" component={SettingScreen} />
    </Tab.Navigator>
  );
}
