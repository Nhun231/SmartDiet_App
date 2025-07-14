import React, { useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    StyleSheet,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    StatusBar,
} from "react-native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const BASE_URL = "10.10.2.150:8080/smartdiet/ai/chats";

export default function SmartDietChatbot({ navigation }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollViewRef = useRef(null);

    const scrollToBottom = () => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    };

    useEffect(() => {
        if (messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg?.role === 'assistant') {
                scrollToBottom();
            }
        }
    }, [messages]);


    const handleSendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = {
            id: Date.now().toString(),
            role: "user",
            parts: [{ type: "text", text: input }],
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const res = await axios.post(BASE_URL, { prompt: input });
            const replyText = res.data || "I didn't understand that, please try again.";
            const reply = {
                id: Date.now().toString() + "-bot",
                role: "assistant",
                parts: [{ type: "text", text: replyText }],
            };
            setMessages((prev) => [...prev, reply]);
        } catch (err) {
            console.error("Error sending message:", err.message);
            const errorReply = {
                id: Date.now().toString() + "-error",
                role: "assistant",
                parts: [
                    {
                        type: "text",
                        text:
                            "⚠️ Sorry, I couldn't process your request. Please try again later.\n\n" +
                            (err.response?.data?.message || err.message || "Unknown error"),
                    },
                ],
            };
            setMessages((prev) => [...prev, errorReply]);
        } finally {
            setIsLoading(false);
        }
    };

    const suggestedQuestions = [
        "What should I eat for breakfast?",
        "How many calories should I consume daily?",
        "Can you suggest a healthy meal plan?",
        "What are good protein sources for vegetarians?",
    ];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#16a34a" />
            <KeyboardAvoidingView
                style={styles.wrapper}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="close" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Smart Diet Assistant</Text>
                </View>

                <ScrollView
                    ref={scrollViewRef}
                    style={styles.chatBox}
                    contentContainerStyle={styles.chatContent}
                    showsVerticalScrollIndicator={false}
                >
                    {messages.length === 0 && (
                        <View style={styles.welcomeBox}>
                            <Ionicons name="nutrition" size={48} color="#22c55e" />
                            <Text style={styles.welcomeTitle}>Welcome to your Smart Diet Assistant!</Text>
                            <Text style={styles.welcomeText}>
                                I'm here to help you with nutrition advice, meal planning, and healthy eating tips.
                            </Text>

                            <View style={styles.suggestedBox}>
                                {suggestedQuestions.map((q, i) => (
                                    <TouchableOpacity
                                        key={i}
                                        style={styles.suggestedButton}
                                        onPress={() => {
                                            setInput(q);
                                            setTimeout(() => handleSendMessage(), 100);
                                        }}
                                    >
                                        <Text style={styles.suggestedText}>{q}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {messages.map((msg) => (
                        <View
                            key={msg.id}
                            style={[
                                styles.messageRow,
                                msg.role === "user" ? styles.rightAlign : styles.leftAlign,
                            ]}
                        >
                            {msg.role === "assistant" && (
                                <View style={styles.botAvatar}>
                                    <Ionicons name="nutrition" size={16} color="#fff" />
                                </View>
                            )}
                            <View
                                style={[
                                    styles.bubble,
                                    msg.role === "user" ? styles.userBubble : styles.botBubble,
                                ]}
                            >
                                {msg.parts.map((p, idx) => (
                                    <Text
                                        key={idx}
                                        style={msg.role === "user" ? styles.userText : styles.botText}
                                    >
                                        {p.text}
                                    </Text>
                                ))}
                            </View>
                            {msg.role === "user" && (
                                <View style={styles.userAvatar}>
                                    <Ionicons name="person" size={16} color="#fff" />
                                </View>
                            )}
                        </View>
                    ))}

                    {isLoading && (
                        <View style={styles.typingRow}>
                            <View style={styles.botAvatar}>
                                <Ionicons name="nutrition" size={16} color="#fff" />
                            </View>
                            <View style={styles.typingBubble}>
                                <ActivityIndicator size="small" color="#22c55e" />
                            </View>
                        </View>
                    )}
                </ScrollView>

                <View style={styles.inputRow}>
                    <TextInput
                        style={styles.input}
                        value={input}
                        onChangeText={setInput}
                        placeholder="Ask me about nutrition..."
                        multiline
                    />
                    <TouchableOpacity
                        onPress={handleSendMessage}
                        disabled={!input.trim() || isLoading}
                        style={[
                            styles.sendButton,
                            (!input.trim() || isLoading) && { backgroundColor: "#ccc" },
                        ]}
                    >
                        <Ionicons name="send" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f0fdf4" },
    wrapper: { flex: 1 },
    header: {
        backgroundColor: "#16a34a",
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    headerTitle: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    chatBox: { flex: 1 },
    chatContent: { padding: 16, paddingBottom: 80 },
    welcomeBox: { alignItems: "center", paddingVertical: 24 },
    welcomeTitle: { fontSize: 18, fontWeight: "bold", color: "#166534", marginVertical: 8 },
    welcomeText: { textAlign: "center", color: "#16a34a", paddingHorizontal: 20 },
    suggestedBox: { width: "100%", marginTop: 16 },
    suggestedButton: {
        backgroundColor: "#fff",
        borderColor: "#bbf7d0",
        borderWidth: 1,
        borderRadius: 20,
        padding: 12,
        marginBottom: 8,
        alignItems: "center",
    },
    suggestedText: { color: "#166534", fontWeight: "500" },
    messageRow: { flexDirection: "row", marginBottom: 12, alignItems: "flex-end" },
    leftAlign: { justifyContent: "flex-start" },
    rightAlign: { justifyContent: "flex-end" },
    bubble: { maxWidth: width * 0.75, padding: 12, borderRadius: 20 },
    botBubble: {
        backgroundColor: "#fff",
        borderColor: "#bbf7d0",
        borderWidth: 1,
        marginLeft: 8,
    },
    userBubble: { backgroundColor: "#16a34a", marginRight: 8 },
    botText: { color: "#166534" },
    userText: { color: "#fff" },
    botAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#22c55e",
        alignItems: "center",
        justifyContent: "center",
    },
    userAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#16a34a",
        alignItems: "center",
        justifyContent: "center",
    },
    typingRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
    typingBubble: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#bbf7d0",
        padding: 12,
        borderRadius: 20,
        marginLeft: 8,
    },
    inputRow: {
        flexDirection: "row",
        padding: 10,
        borderTopWidth: 1,
        borderColor: "#bbf7d0",
        backgroundColor: "#dcfce7",
    },
    input: { flex: 1, padding: 12, backgroundColor: "#fff", borderRadius: 20, fontSize: 16 },
    sendButton: {
        backgroundColor: "#16a34a",
        borderRadius: 20,
        marginLeft: 8,
        padding: 12,
        alignItems: "center",
        justifyContent: "center",
    },
});