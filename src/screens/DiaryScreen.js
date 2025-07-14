import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://10.10.2.150:8080/smartdiet';

export default function DailyScreen({ navigation }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkCalculateData = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const res = await axios.get(`${BASE_URL}/customer/calculate/newest`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (res.data?.tdee) {
          // Có dữ liệu → tiếp tục ở Daily Screen
          setLoading(false);
        } else {
          // Chưa có dữ liệu → điều hướng sang màn nhập chỉ số
          navigation.replace('InitialCalculateScreen');
        }
      } catch (error) {
        console.error('Lỗi khi kiểm tra dữ liệu:', error.message);
        // Gặp lỗi vẫn điều hướng sang màn nhập chỉ số
        navigation.replace('InitialCalculateScreen');
      }
    };

    checkCalculateData();
  }, [navigation]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Đang kiểm tra dữ liệu cá nhân...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chào mừng bạn đến Nhật ký Hằng Ngày</Text>
      <Text style={styles.subtitle}>Thông tin của bạn đã được lưu.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#666' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#4CAF50', textAlign: 'center' },
  subtitle: { marginTop: 12, fontSize: 16, color: '#555', textAlign: 'center' },
});
