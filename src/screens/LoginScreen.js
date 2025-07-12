import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios"
import { jwtDecode } from "jwt-decode";

export default function LoginScreen({ navigation, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    // if (!email || !password) {
    //   Alert.alert("Error", "Please fill in all fields");
    //   return;
    // }

    setIsLoading(true);
    try {
      const response = await axios.post(`http://192.168.1.11:8080/smartdiet/auth/login`, {
        emailOrName: email,
        password: password
      });

      const { accessToken } = response.data;

      if (accessToken) {
        // Decode the token to get user info
        const decodedUser = jwtDecode(accessToken);

        // Save token to AsyncStorage
        await AsyncStorage.setItem("accessToken", accessToken);
        console.log("accessToken when login success", accessToken);
        // Call the callback to update parent state
        if (onLoginSuccess) {
          onLoginSuccess(accessToken, decodedUser);
        }

        // Navigate to main app
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }]
        });
      } else {
        Alert.alert("Error", "Login failed - no token received");
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error.response?.data?.message || "Login failed. Please try again.";
      Alert.alert("Login Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        style={styles.input}
        secureTextEntry
      />
      <Button
        title={isLoading ? "Logging in..." : "Login"}
        onPress={handleLogin}
        disabled={isLoading}
      />
      <Button
        title="Go to Signup"
        onPress={() => navigation.navigate('Signup')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10
  },
});
