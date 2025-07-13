import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SettingScreen from '../screens/SettingScreen';
import BMREditScreen from '../screens/BMREditScreen';
import ExerciseLevelScreen from '../screens/ExerciseLevelScreen';
import TargetScreen from '../screens/TargetScreen';
import NutritionSettingScreen from '../screens/NutritionSettingScreen'
import PersonalScreen from '../screens/PersonalScreen';
import InitialCalculateScreen from '../screens/InitialCalculateScreen'

const Stack = createNativeStackNavigator();

export default function SettingStackNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="SettingMain" component={SettingScreen} />
            <Stack.Screen name="BMREdit" component={BMREditScreen} />
            <Stack.Screen name="ExerciseLevelScreen" component={ExerciseLevelScreen} />
            <Stack.Screen name="TargetScreen" component={TargetScreen} />
            <Stack.Screen name="NutritionSetting" component={NutritionSettingScreen} />
            <Stack.Screen name="PersonalScreen" component={PersonalScreen} />
            <Stack.Screen name="InitialCalculateScreen" component={InitialCalculateScreen} />
        </Stack.Navigator>
    );
}
