import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState('');

  const handleSignup = () => {
    // simulate signup
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <Text>Signup</Text>
      <TextInput value={email} onChangeText={setEmail} placeholder="Email" style={styles.input} />
      <Button title="Sign up" onPress={handleSignup} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10 },
});
