import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen.js';
import MainTabNavigator from './src/navigation/MainTabNavigator.js';
import AuthProvider from './src/context/AuthProvider';

import MealEntryScreen from './src/screens/MealEntryScreen.js';

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
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <Stack.Screen
            name="MainTabNavigator"
            component={() => (
              <AuthProvider initialAuth={authData}>
                <MainTabNavigator />
              </AuthProvider>
            )}
          />
        ) : (
          <>
            <Stack.Screen
              name="LoginScreen"
              component={(props) => (
                <LoginScreen {...props} onLoginSuccess={handleLoginSuccess} />
              )}
            />
            <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
          </>
        )}

        <Stack.Screen name="MealEntry" component={MealEntryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
