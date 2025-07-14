import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import CreateIngredientScreen from './src/screens/CreateIngredientScreen.js';
import MainTabNavigator from './src/navigation/MainTabNavigator.js';
import AuthProvider from './src/context/AuthProvider';
import WeightDetailScreen from './src/screens/WeightDetailScreen';
import SmartDietChatbot from './src/screens/AIChatBotScreens.js';
import CreateDishScreen from './src/screens/CreateDishScreen.js';
import IngreDetailScreen from './src/screens/IngreDetailScreen.js';
import DishDetailScreen from './src/screens/DishDetailScreen.js';
import PickIngredientScreen from './src/screens/PickIngredientScreen.js'
import MealEntryScreen from './src/screens/MealEntryScreen'; // import mới
import InitialCalculateScreen from './src/screens/InitialCalculateScreen';
import StartupScreen from './src/screens/StartupScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [authData, setAuthData] = useState({ accessToken: null, user: null });

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem('accessToken');
      setIsLoggedIn(!!token);
    };
    checkLogin();
  }, []);

  const handleLoginSuccess = (accessToken, user) => {
    setAuthData({ accessToken, user });
    setIsLoggedIn(true);
  };

  if (isLoggedIn === null) return null;

  return (
    <AuthProvider>
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
                      <LoginScreen {...props} onLoginSuccess={handleLoginSuccess} />
                    )} 
                  />
                  <Stack.Screen name="Signup" component={SignupScreen} />
                </>
              )}
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </AuthProvider>
  );
}
