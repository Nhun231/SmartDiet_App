import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PUBLIC_SERVER_ENDPOINT } from '@env';
const BASE_URL = PUBLIC_SERVER_ENDPOINT;

export default function StartupScreen({ navigation }) {
  useEffect(() => {
    const checkCalculateData = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const res = await axios.get(`${BASE_URL}/customer/calculate/newest`);
        if (res.data?.tdee) {
          navigation.replace('Main');
        } else {
          navigation.replace('InitialCalculateScreen');
        }
      } catch (error) {
        navigation.replace('InitialCalculateScreen');
      }
    };
    checkCalculateData();
  }, [navigation]);

  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#4CAF50" />
      <Text style={styles.loadingText}>Đang kiểm tra dữ liệu cá nhân...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#666' },
});
