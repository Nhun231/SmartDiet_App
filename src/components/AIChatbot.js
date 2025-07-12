import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SmartDietChatbot from '../components/AIChatbot';

export default function SmartDietChatbotScreen() {
    return (
        <View style={styles.container}>
            <SmartDietChatbot />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0fdf4' },
});
