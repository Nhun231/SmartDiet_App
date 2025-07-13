import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context'; // ✅ Thêm dòng này

import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import MainTabNavigator from './src/navigation/MainTabNavigator.js';
import AuthProvider from './src/context/AuthProvider';
import WeightDetailScreen from './src/screens/WeightDetailScreen';
import SmartDietChatbot from './src/screens/AIChatBotScreens.js';

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
      <SafeAreaProvider>
    <NavigationContainer>

      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
            <>
          <Stack.Screen 
            name="Main" 
            component={() => (
              <AuthProvider initialAuth={authData}>
                <MainTabNavigator />
              </AuthProvider>
            )} 
          />
            <Stack.Screen name="WeightDetailScreen" component={WeightDetailScreen} />
            <Stack.Screen
                name="ChatbotModal"
                component={SmartDietChatbot}
                options={{ presentation: 'modal' }}
            />
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
  );
}
