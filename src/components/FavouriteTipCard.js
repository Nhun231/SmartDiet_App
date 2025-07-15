// components/FavouriteCard.js
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

export default function FavouriteCard({ icon, combo, description }) {
    return (
        <View style={styles.card}>
            <Image source={icon} style={styles.iconImage} resizeMode="contain" />
            <Text style={styles.suggestionTitle}>Có thể bạn chưa biết?</Text>
            <Text style={styles.combo}>{combo}</Text>
            <Text style={styles.description}>{description}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fefefe",
        borderRadius: 12,
        padding: 20,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 3,
    },
    iconImage: {
        width: 60,
        height: 60,
        alignSelf: "center",
        marginBottom: 16,
    },
    suggestionTitle: {
        textAlign: "center",
        fontSize: 16,
        color: "#666",
        marginBottom: 8,
    },
    combo: {
        textAlign: "center",
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        color: "#555",
        lineHeight: 22,
    },
});
