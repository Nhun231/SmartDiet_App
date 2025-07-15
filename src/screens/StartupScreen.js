import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PUBLIC_SERVER_ENDPOINT } from '@env';
import { useAuth } from '../context/AuthProvider';
const BASE_URL = PUBLIC_SERVER_ENDPOINT;

export default function StartupScreen({ navigation }) {
  const { logout } = useAuth();

  useEffect(() => {
    const checkCalculateData = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const res = await axios.get(`${BASE_URL}/customer/calculate/newest`);
        console.log(res)
        if (res.data?.tdee) {
          navigation.replace('Main');
        } else {
          navigation.replace('InitialCalculateScreen');
        }
      } catch (error) {
        console.log(error)
        if (error.response && error.response.status === 401) {
          await logout();
        } else {
          navigation.replace('InitialCalculateScreen');
        }
    };
  }
    checkCalculateData();
  }, [navigation, logout]);

  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#3ECF8C" />
      <Text style={styles.loadingText}>Đang kiểm tra dữ liệu cá nhân...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#666' },
});
