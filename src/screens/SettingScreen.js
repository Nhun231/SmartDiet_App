import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function SettingScreen({ navigation }) {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('accessToken');
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };


  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Cơ bản</Text>
      <MenuItem
        icon="account"
        text="Cập nhật chỉ số trao đổi chất (BMR)"
        iconColor="#FF9800"
        onPress={() => navigation.navigate('BMREdit')}
      />
      <MenuItem
        icon="food"
        text="Cập nhật chỉ số dinh dưỡng"
        iconColor="#DAA520"
        onPress={() => navigation.navigate('NutritionSetting')}
      />
      <MenuItem icon="water" text="Tạo mới lịch uống nước" iconColor="#2196F3"
        onPress={() => navigation.navigate('WaterScheduleScreen')} />
      <MenuItem icon="cog" text="Cài đặt tài khoản" iconColor="#9C27B0"
        onPress={() => navigation.navigate('InitialCalculateScreen')} />
      <View style={styles.switchContainer}>
        <Text style={styles.switchText}>Màn hình tối (dark mode)</Text>
        <Switch
          value={darkMode}
          onValueChange={toggleDarkMode}
          trackColor={{ false: '#ccc', true: '#4CAF50' }}
          thumbColor={darkMode ? '#ffffff' : '#f4f3f4'}
        />
      </View>

      <TouchableOpacity onPress={logout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const MenuItem = ({ icon, text, iconColor, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <Text style={styles.menuText}>{text}</Text>
    <Icon name={icon} size={24} color={iconColor} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9', padding: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#4CAF50'
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  menuText: { fontSize: 16, color: '#333' },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#eee'
  },
  switchText: { fontSize: 16, color: '#333' },
  logoutButton: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#FF5252',
    alignItems: 'center'
  },
  logoutText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
