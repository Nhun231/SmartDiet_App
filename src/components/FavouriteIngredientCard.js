import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";


const FavouriteIngredientCard = ({
    name,
    serving,
    calories,
    onAdd,
    onDelete,
    hideAdd,
    hideDelete,
    onPress,
}) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        <View style={styles.card}>
            <View style={styles.textContainer}>
                <Text style={styles.name}>{name}</Text>
                <Text style={styles.detail}>
                    {serving} - {calories} calo
                </Text>
            </View>
            <View style={styles.actions}>
                {!hideAdd && (
                    <TouchableOpacity onPress={onAdd} style={styles.iconButton}>
                        <Ionicons name="add" size={20} color="#333" />
                    </TouchableOpacity>
                )}
                {!hideDelete && (
                <TouchableOpacity onPress={onDelete} style={styles.iconButton}>
                    <Ionicons name="close" size={20} color="#333" />
                </TouchableOpacity>
                )}
            </View>
        </View>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ffffff",
        padding: 16,
        borderRadius: 20,
        marginBottom: 16,
        marginHorizontal: 4,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    textContainer: {
        flex: 1,
    },
    name: {
        fontSize: 17,
        fontWeight: "600",
        color: "#111",
        marginBottom: 4,
    },
    detail: {
        fontSize: 15,
        color: "#6e6e6e",
    },
    actions: {
        flexDirection: "row",
        alignItems: "center",
    },
    iconButton: {
        backgroundColor: "#F2F2F2",
        padding: 8,
        borderRadius: 20,
        marginLeft: 8,
    },
});

export default FavouriteIngredientCard;
