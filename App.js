import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen.js';
import CreateIngredientScreen from './src/screens/CreateIngredientScreen.js';
import MainTabNavigator from './src/navigation/MainTabNavigator.js';
import AuthProvider, { useAuth } from './src/context/AuthProvider';
import WeightDetailScreen from './src/screens/WeightDetailScreen';
import SmartDietChatbot from './src/screens/AIChatBotScreens.js';
import CreateDishScreen from './src/screens/CreateDishScreen.js';
import IngreDetailScreen from './src/screens/IngreDetailScreen.js';
import DishDetailScreen from './src/screens/DishDetailScreen.js';
import PickIngredientScreen from './src/screens/PickIngredientScreen.js'
import MealEntryScreen from './src/screens/MealEntryScreen.js'; // import mới
import InitialCalculateScreen from './src/screens/InitialCalculateScreen';
import StartupScreen from './src/screens/StartupScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <AppWithAuth />
    </AuthProvider>
  );
}

function AppWithAuth() {
  const { isLoggedIn, setIsLoggedIn } = useAuth();

  if (isLoggedIn === null) return null;

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isLoggedIn ? (
              <>
                <Stack.Screen name="Startup" component={StartupScreen} />
                <Stack.Screen name="Main">
                  {() => (
                      <MainTabNavigator />
                  )}
                </Stack.Screen>
                <Stack.Screen name="WeightDetailScreen" component={WeightDetailScreen} />
                <Stack.Screen
                    name="ChatbotModal"
                    component={SmartDietChatbot}
                    options={{ presentation: 'modal' }}
                />
                <Stack.Screen
                  name="DishDetail"
                  component={DishDetailScreen}
                  options={{ title: 'Chi tiết nguyên liệu' }}
                />
                <Stack.Screen name="PickIngredient" component={PickIngredientScreen} />
                <Stack.Screen name="MealEntry" component={MealEntryScreen} />
                <Stack.Screen
                    name="CreateIngredient"
                    component={CreateIngredientScreen}
                    options={{ title: "Tạo thực phẩm mới" }}
                />
                <Stack.Screen name="CreateDish" component={CreateDishScreen} />
                <Stack.Screen
                    name="IngredientDetail"
                    component={IngreDetailScreen}
                    options={{ title: 'Chi tiết nguyên liệu' }}
                />
                <Stack.Screen name="InitialCalculateScreen" component={InitialCalculateScreen} />
              </>
                ) : (
                  <>
                    <Stack.Screen 
                      name="Login" 
                      component={(props) => (
                        <LoginScreen {...props} onLoginSuccess={setIsLoggedIn} />
                      )} 
                    />
            <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
                  </>
                )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
