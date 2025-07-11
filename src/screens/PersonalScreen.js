import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Dimensions,
    StatusBar,
    Modal,
    Pressable,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Rect, Polyline } from 'react-native-svg';
import axios from "axios";
import { LineChart } from 'react-native-chart-kit';
import { PUBLIC_SERVER_ENDPOINT } from '@env';
import WeightChart from '../components/WeightChart';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const BASE_URL = PUBLIC_SERVER_ENDPOINT;

export default function PersonalScreen() {
    const [waterIntake, setWaterIntake] = useState(0);
    const [currentBMI, setCurrentBMI] = useState({});
    const [weightHistory, setWeightHistory] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [newWeight, setNewWeight] = useState(currentBMI.weight);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigation = useNavigation();

    const incrementWater = () => setWaterIntake((prev) => prev + 250);
    const decrementWater = () => setWaterIntake((prev) => Math.max(0, prev - 250));

    useEffect(() => {
        const fetchWeightHistory = async () => {
            console.log(`${BASE_URL}/customer/calculate/history`);
            try {
                const res = await axios.get(`${BASE_URL}/customer/calculate/history`);
                
                if (res.data.report && res.data.report.length > 0) {
                    setWeightHistory(res.data.report);
                    setCurrentBMI(res.data.report[res.data.report.length - 1]);
                    setWaterIntake((res.data.report[res.data.report.length - 1].waterIntake)*1000)
                }
            } catch (error) {
                console.log('Error fetching weight history:', error);
            }
        };
        fetchWeightHistory();
    }, []);

    // Helper to format date as dd/MM
    function formatDateDM(date) {
        const d = new Date(date);
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        return `${day}/${month}`;
    }

    const openWeightModal = () => {
        setNewWeight(currentBMI.weight);
        setModalVisible(true);
    };
    const closeWeightModal = () => setModalVisible(false);

    const incrementNewWeight = () => setNewWeight(w => parseFloat((w + 0.1).toFixed(1)));
    const decrementNewWeight = () => setNewWeight(w => Math.max(0, parseFloat((w - 0.1).toFixed(1))));

    // Remove handleUnitChange
    // const handleUnitChange = (unit) => setWeightUnit(unit);

    const handleUpdateWeight = async () => {
        setIsSubmitting(true);
        try {
            const weightNum = parseFloat(newWeight);
            if (isNaN(weightNum) || weightNum <= 0) {
                setIsSubmitting(false);
                return;
            }
            // Fetch newest calculation for required fields
            const newestRes = await axios.get(`${BASE_URL}/customer/calculate/newest`);
            const newest = newestRes.data;
            // Use newest calculation fields, but update weight
            const payload = {
                gender: newest.gender,
                age: newest.age,
                height: newest.height,
                weight: weightNum,
                activity: newest.activity,
            };
            await axios.post(`${BASE_URL}/customer/calculate`, payload);
            setModalVisible(false);
            // Refresh weight history
            const res = await axios.get(`${BASE_URL}/customer/calculate/history`);
            setWeightHistory(res.data.report);
            //rsetCurrentBMI(weightNum);
        } catch (error) {
            console.log('Error updating weight:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#10b981' }}>
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
                            <Text style={styles.bmiValue}>{currentBMI.bmi ?? '--'}</Text>
                            <View style={styles.timestampRow}>
                                <Ionicons name="time-outline" size={16} color="#9ca3af" />
                                <Text style={styles.timestampText}>
                                    {currentBMI.createdAt ? new Date(currentBMI.createdAt).toLocaleString() : '--'}
                                </Text>
                            </View>
                            <Text style={styles.updateText}>Cập nhật cân nặng</Text>
                        </View>

                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{currentBMI.height ?? '--'} cm</Text>
                                <Text style={styles.statLabel}>Chiều cao</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{currentBMI.weight ?? '--'} kg</Text>
                                <Text style={styles.statLabel}>Cân nặng</Text>
                            </View>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{currentBMI.tdee ?? '--'}</Text>
                            <Text style={styles.statLabel}>TDEE</Text>
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
                        {/*<Text style={styles.suggestionText}>(gợi ý) 55.62 kg</Text>*/}
                    </View>

                    <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('WeightDetailScreen')}>
                        <View style={styles.card}>
                            <View style={styles.goalHeader}>
                                <Text style={styles.goalTitle}>Cân nặng</Text>
                                <TouchableOpacity style={styles.addButton} activeOpacity={0.7} onPress={openWeightModal}>
                                    <Ionicons name="add" size={16} color="#374151" />
                                </TouchableOpacity>
                            </View>

                            {/* Weight Chart */}
                            <View style={styles.chartContainer}>
                                <WeightChart weightHistory={weightHistory} />
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Floating Action Button */}
            <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
                <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
            {/* Weight Update Modal */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={closeWeightModal}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1, justifyContent: 'flex-end' }}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                            <View style={{ backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
                                <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 }}>Cập nhật cân nặng</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                                    <TouchableOpacity onPress={decrementNewWeight} style={{ padding: 16 }}>
                                        <Ionicons name="remove" size={24} color="#10b981" />
                                    </TouchableOpacity>
                                    <TextInput
                                        style={{ fontSize: 32, fontWeight: 'bold', marginHorizontal: 16, textAlign: 'center', minWidth: 60 }}
                                        value={String(newWeight)}
                                        onChangeText={text => {
                                            const cleaned = text.replace(/[^0-9.]/g, '');
                                            setNewWeight(cleaned === '' ? 0 : parseFloat(cleaned));
                                        }}
                                        keyboardType="numeric"
                                        maxLength={6}
                                    />
                                    <TouchableOpacity onPress={incrementNewWeight} style={{ padding: 16 }}>
                                        <Ionicons name="add" size={24} color="#10b981" />
                                    </TouchableOpacity>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 16 }}>
                                    <Text style={{ fontWeight: 'bold', color: '#10b981' }}>kg</Text>
                                </View>
                                <TouchableOpacity
                                    style={{ backgroundColor: '#10b981', borderRadius: 24, paddingVertical: 12, alignItems: 'center', marginBottom: 8 }}
                                    onPress={handleUpdateWeight}
                                    disabled={isSubmitting}
                                >
                                    <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>{isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}</Text>
                                </TouchableOpacity>
                                <Pressable onPress={closeWeightModal} style={{ alignItems: 'center', marginTop: 8 }}>
                                    <Text style={{ color: '#6b7280' }}>Hủy</Text>
                                </Pressable>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </Modal>
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
        paddingTop: 0, // flush with top
        paddingBottom: 12,
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
        backgroundColor: '#f9fafb',
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
        height: 180,
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
