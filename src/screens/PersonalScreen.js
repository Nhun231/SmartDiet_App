import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Rect, Polyline } from 'react-native-svg';
import axios from "axios";
import { LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

const BASE_URL = process.env.PUBLIC_SERVER_ENDPOINT;

export default function PersonalScreen() {
    const [waterIntake, setWaterIntake] = useState(2364);
    const [currentWeight, setCurrentWeight] = useState(55);
    const [weightHistory, setWeightHistory] = useState([]);

    const incrementWater = () => setWaterIntake((prev) => prev + 250);
    const decrementWater = () => setWaterIntake((prev) => Math.max(0, prev - 250));

    useEffect(() => {
        const fetchWeightHistory = async () => {
            console.log(`${BASE_URL}/customer/calculate/history`);
            try {
                const res = await axios.get(`${BASE_URL}/customer/calculate/history`);

                // The backend returns { report: [ ... ] }
                setWeightHistory(res.data.report);
            } catch (error) {
                console.log('Error fetching weight history:', error);
            }
        };
        fetchWeightHistory();
    }, []);

    const chartData = weightHistory.map(item => ({
        x: new Date(item.createdAt), // or format as needed
        y: item.weight
    }));

    // Prepare data for chart-kit
    const chartKitData = {
        labels: chartData.map(d => d.x.toLocaleDateString()), // or format as needed
        datasets: [
            {
                data: chartData.map(d => d.y),
            },
        ],
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View style={styles.profileAvatar}>
                        <Ionicons name="person" size={24} color="#10b981" />
                    </View>
                    <View style={styles.headerRight}>
                        <Ionicons name="settings-outline" size={24} color="white" />
                        <Text style={styles.headerText}>Cài đặt</Text>
                    </View>
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* BMI Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Chỉ số khối cơ thể (BMI)</Text>
                        <Ionicons name="ellipsis-horizontal" size={20} color="#9ca3af" />
                    </View>

                    <View style={styles.card}>
                        <View style={styles.bmiCenter}>
                            <Text style={styles.bmiLabel}>BMI</Text>
                            <Text style={styles.bmiValue}>21.8</Text>
                            <View style={styles.timestampRow}>
                                <Ionicons name="time-outline" size={16} color="#9ca3af" />
                                <Text style={styles.timestampText}>5 tháng 7 - 21:09</Text>
                            </View>
                            <Text style={styles.updateText}>Cập nhật cần nâng</Text>
                        </View>

                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>159 cm</Text>
                                <Text style={styles.statLabel}>Chiều cao</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>55 kg</Text>
                                <Text style={styles.statLabel}>Cân nặng tốt</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Water Intake Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Bạn nên uống bao nhiều nước</Text>
                        <Ionicons name="ellipsis-horizontal" size={20} color="#9ca3af" />
                    </View>

                    <View style={styles.card}>
                        <View style={styles.waterCenter}>
                            <View style={styles.waterValueRow}>
                                <Text style={styles.waterValue}>{waterIntake}</Text>
                                <Text style={styles.waterUnit}>ml</Text>
                            </View>
                            <Text style={styles.waterLabel}>Lượng nước bạn cần uống</Text>

                            <View style={styles.waterControls}>
                                <TouchableOpacity
                                    style={styles.waterButton}
                                    onPress={decrementWater}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="remove" size={20} color="#06b6d4" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.waterButton}
                                    onPress={incrementWater}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="add" size={20} color="#06b6d4" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.waterInfo}>
                            <View style={styles.infoRow}>
                                <Ionicons name="time-outline" size={16} color="#9ca3af" />
                                <Text style={styles.infoText}>Lần cuối cùng</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Ionicons name="notifications-outline" size={16} color="#f59e0b" />
                                <Text style={[styles.infoText, { color: '#f59e0b' }]}>
                                    Bật tính năng thông báo
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Goals Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Mục tiêu</Text>
                        <Text style={styles.suggestionText}>(gợi ý) 55.62 kg</Text>
                    </View>

                    <View style={styles.card}>
                        <View style={styles.goalHeader}>
                            <Text style={styles.goalTitle}>Cân nặng</Text>
                            <TouchableOpacity style={styles.addButton} activeOpacity={0.7}>
                                <Ionicons name="add" size={16} color="#374151" />
                            </TouchableOpacity>
                        </View>

                        {/* Weight Chart */}
                        <View style={styles.chartContainer}>
                            <LineChart
                                data={chartKitData}
                                width={width - 80}
                                height={120}
                                chartConfig={{
                                    backgroundColor: "#a7f3d0",
                                    backgroundGradientFrom: "#a7f3d0",
                                    backgroundGradientTo: "#67e8f9",
                                    decimalPlaces: 1,
                                    color: (opacity = 1) => `rgba(34, 211, 238, ${opacity})`,
                                    labelColor: (opacity = 1) => `rgba(31, 41, 55, ${opacity})`,
                                    style: { borderRadius: 8 },
                                    propsForDots: { r: "4", strokeWidth: "2", stroke: "#22d3ee" }
                                }}
                                bezier
                                style={{ borderRadius: 8 }}
                            />
                            <View style={styles.chartLabels}>
                                <Text style={[styles.chartLabel, { top: 8 }]}>60</Text>
                                <Text style={[styles.chartLabel, { top: 32 }]}>57.5</Text>
                                <Text style={[styles.chartLabel, { bottom: 32 }]}>55</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Floating Action Button */}
            <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
                <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    header: {
        backgroundColor: '#10b981',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
    },
    profileAvatar: {
        width: 48,
        height: 48,
        backgroundColor: 'white',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerText: {
        color: 'white',
        fontSize: 14,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1f2937',
    },
    suggestionText: {
        fontSize: 14,
        color: '#3b82f6',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    bmiCenter: {
        alignItems: 'center',
        marginBottom: 24,
    },
    bmiLabel: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    bmiValue: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#ef4444',
        marginBottom: 8,
    },
    timestampRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    timestampText: {
        fontSize: 14,
        color: '#9ca3af',
    },
    updateText: {
        fontSize: 14,
        color: '#f59e0b',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    statLabel: {
        fontSize: 14,
        color: '#9ca3af',
        marginTop: 4,
    },
    waterCenter: {
        alignItems: 'center',
        marginBottom: 24,
    },
    waterValueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 4,
    },
    waterValue: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#ef4444',
    },
    waterUnit: {
        fontSize: 18,
        color: '#9ca3af',
        marginLeft: 4,
    },
    waterLabel: {
        fontSize: 14,
        color: '#9ca3af',
        marginBottom: 24,
    },
    waterControls: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 24,
    },
    waterButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#06b6d4',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    waterInfo: {
        gap: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    infoText: {
        fontSize: 14,
        color: '#9ca3af',
    },
    goalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    goalTitle: {
        fontSize: 18,
        fontWeight: '500',
        color: '#1f2937',
    },
    addButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#d1d5db',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    chartContainer: {
        position: 'relative',
        height: 120,
        borderRadius: 8,
        overflow: 'hidden',
    },
    chartLabels: {
        position: 'absolute',
        left: 16,
        top: 0,
        bottom: 0,
        justifyContent: 'space-between',
    },
    chartLabel: {
        fontSize: 14,
        color: '#4b5563',
        position: 'absolute',
    },
    fab: {
        position: 'absolute',
        bottom: 80,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#06b6d4',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
});