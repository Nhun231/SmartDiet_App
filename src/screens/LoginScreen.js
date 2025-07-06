import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');

  const handleLogin = async () => {
    // Normally validate/login with API
    await AsyncStorage.setItem('token', 'dummy-token');
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] }); // go to main app
  };

  return (
    <View style={styles.container}>
      <Text>Login</Text>
      <TextInput value={email} onChangeText={setEmail} placeholder="Email" style={styles.input} />
      <Button title="Login" onPress={handleLogin} />
      <Button title="Go to Signup" onPress={() => navigation.navigate('Signup')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10 },
});
