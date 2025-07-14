import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PersonalScreen() {
  return (
    <View style={styles.container}>
      <Text>Personal Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
