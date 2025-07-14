import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const options = [
    { label: "Bữa sáng", icon: "cafe", color: "#FF7043", type: "breakfast" },
    { label: "Bữa trưa", icon: "pizza", color: "#FF8A65", type: "lunch" },
    { label: "Bữa tối", icon: "restaurant", color: "#66BB6A", type: "dinner" },
    { label: "Bữa phụ", icon: "fast-food", color: "#29B6F6", type: "snack" },
];

export default function ExpandableFAB({ onOptionPress }) {
    const [open, setOpen] = useState(false);
    const animations = useRef(options.map(() => new Animated.Value(0))).current;

    useEffect(() => {
        if (open) {
            Animated.stagger(50, animations.map(anim =>
                Animated.timing(anim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                })
            )).start();
        } else {
            Animated.parallel(animations.map(anim =>
                Animated.timing(anim, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                })
            )).start();
        }
    }, [open]);

    return (
        <View style={styles.container}>
            {options.map((option, index) => {
                const translateY = animations[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -(index + 1) * 65],
                });

                return (
                    <Animated.View
                        key={option.type}
                        style={[
                            styles.optionWrapper,
                            {
                                transform: [{ translateY }],
                                opacity: animations[index],
                            },
                        ]}
                    >
                        <TouchableOpacity
                            style={[styles.optionRow, { backgroundColor: option.color }]}
                            onPress={() => {
                                onOptionPress(option.type, option.label); // Gửi cả type và label
                                setOpen(false);
                            }}
                            activeOpacity={0.8}
                        >
                            <Ionicons name={option.icon} size={20} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.label}>{option.label}</Text>
                        </TouchableOpacity>
                    </Animated.View>
                );
            })}

            <TouchableOpacity
                style={[styles.fabMain, { backgroundColor: open ? "#aaa" : "#26C6DA" }]}
                onPress={() => setOpen(!open)}
            >
                <Ionicons name={open ? "close" : "calendar"} size={24} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 30,
        right: 20,
        alignItems: "flex-end",
    },
    fabMain: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        elevation: 8,
    },
    optionWrapper: {
        position: "absolute",
        right: 0,
    },
    optionRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 30,
        paddingVertical: 10,
        paddingHorizontal: 16,
        minWidth: 120,
        maxWidth: 180,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 3,
        elevation: 5,
    },
    label: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
        flexShrink: 0,
    },
});
