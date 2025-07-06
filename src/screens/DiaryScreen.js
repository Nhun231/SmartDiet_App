import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DiaryScreen() {
  return (
    <View style={styles.container}>
      <Text>Diary Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
