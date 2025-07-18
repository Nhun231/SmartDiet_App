import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    SafeAreaView
} from 'react-native';
import * as Notifications from 'expo-notifications';
import TimePickerModal from '../components/TimePickerModal';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import WaterGlassImage from '../../assets/waterglass.png';
import { generateSchedule } from '../utils/generateSchedule';
import axios from "axios";
import { Image } from 'react-native';
import {PUBLIC_SERVER_ENDPOINT} from "@env";
const BASE_URL=PUBLIC_SERVER_ENDPOINT
const WaterScheduleScreen = ({ navigation }) => {
    const [wakeUpTime, setWakeUpTime] = useState('06:00');
    const [sleepTime, setSleepTime] = useState('23:00');
    const [reminderGap, setReminderGap] = useState(90);
    const [schedule, setSchedule] = useState([]);
    const [expoPushToken, setExpoPushToken] = useState(null);

    const [selectedIndex, setSelectedIndex] = useState(null);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [mode, setMode] = useState('schedule');

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                console.log("Fetching data...")
                const res = await axios.get(`${BASE_URL}/water-reminders/reminder-schedule`);
                const data = res.data;
                if (data) {
                    setWakeUpTime(data.wakeUpTime);
                    setSleepTime(data.sleepTime);
                    setReminderGap(data.reminderGap);
                    setSchedule(data.schedule);
                }
            } catch (err) {
                console.log('❌ Lỗi fetch schedule:', err);
                const defaultSchedule = generateSchedule(wakeUpTime, sleepTime, reminderGap);
                setSchedule(defaultSchedule);
            }
        };

        const registerForPushNotifications = async () => {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission denied for notifications');
                return;
            }
            const token = (await Notifications.getExpoPushTokenAsync()).data;
            setExpoPushToken(token);
            console.log('✅ Expo Push Token:', token);
        };

        fetchInitialData();
        registerForPushNotifications();

        const subscription = Notifications.addNotificationReceivedListener(notification => {
            console.log('🔔 Notification received in foreground:', notification);
            Alert.alert(
                notification.request.content.title || 'Thông báo',
                notification.request.content.body || 'Bạn có thông báo mới'
            );
        });

        return () => subscription.remove();
    }, []);

    const handleTimePress = (index) => {
        setSelectedIndex(index);
        setMode('schedule');
        setShowTimePicker(true);
    };

    const handleTimeChange = (newTime) => {
        if (mode === 'schedule' && selectedIndex !== null) {
            const updated = [...schedule];
            updated[selectedIndex].time = newTime;
            setSchedule(updated);
        } else if (mode === 'wakeUp') {
            setWakeUpTime(newTime);
            const updated = generateSchedule(newTime, sleepTime, reminderGap);
            setSchedule(updated);
        } else if (mode === 'sleep') {
            setSleepTime(newTime);
            const updated = generateSchedule(wakeUpTime, newTime, reminderGap);
            setSchedule(updated);
        }
        setShowTimePicker(false);
        setSelectedIndex(null);
    };

    const handleSave = async () => {
        if (!wakeUpTime || !sleepTime || !reminderGap || !Array.isArray(schedule) || schedule.length === 0 || !expoPushToken) {
            Alert.alert('Dữ liệu không hợp lệ', 'Vui lòng kiểm tra lại các trường thông tin!');
            return;
        }

        // Kiểm tra định dạng thời gian đơn giản (HH:mm)
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if (!timeRegex.test(wakeUpTime) || !timeRegex.test(sleepTime)) {
            Alert.alert('Thời gian không hợp lệ', 'Định dạng thời gian phải là HH:mm');
            return;
        }

        // Kiểm tra từng phần tử trong schedule
        const hasInvalidTime = schedule.some(item => !timeRegex.test(item.time));
        if (hasInvalidTime) {
            Alert.alert('Có giờ không hợp lệ trong lịch', 'Vui lòng kiểm tra lại các khung giờ');
            return;
        }

        try {
            await axios.post(`${BASE_URL}/water-reminders/reminder-setting`, {
                wakeUpTime,
                sleepTime,
                reminderGap,
                expoPushToken,
                schedule,
            });
            Alert.alert('✅ Đã lưu thành công!');
        } catch (err) {
            console.log('Lỗi lưu:', err);
            Alert.alert('Lỗi khi lưu dữ liệu');
        }
    };


    const renderWaterGlass = (item, realIndex) => (
        <View key={realIndex} style={styles.glassContainer}>
            <Image source={WaterGlassImage} style={styles.glassImage} />
            <Text style={styles.amount}>{item.amount}</Text>
            <TouchableOpacity onPress={() => handleTimePress(realIndex)}>
                <Text style={styles.time}>{item.time}</Text>
            </TouchableOpacity>
        </View>
    );


    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Cài đặt lịch uống nước</Text>
                <View style={{ width: 24 }} />
            </View>
            <View style={styles.headerSingleLine}>
                <Text style={styles.sleepLabel}>Lịch trình ngủ</Text>
                <View style={styles.sleepTimes}>
                    <TouchableOpacity onPress={() => { setMode('wakeUp'); setShowTimePicker(true); }}>
                        <Text style={styles.timeEditable}>{wakeUpTime}</Text>
                    </TouchableOpacity>
                    <Text style={styles.hyphen}>-</Text>
                    <TouchableOpacity onPress={() => { setMode('sleep'); setShowTimePicker(true); }}>
                        <Text style={styles.timeEditable}>{sleepTime}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.reminderSection}>
                <Text style={styles.reminderTitle}>Khoảng thời gian nhắc nhở</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {[60, 90, 120].map((gap) => (
                        <TouchableOpacity
                            key={gap}
                            onPress={() => {
                                setReminderGap(gap);
                                const updated = generateSchedule(wakeUpTime, sleepTime, gap);
                                setSchedule(updated);
                            }}
                            style={{
                                paddingHorizontal: 10,
                                paddingVertical: 5,
                                backgroundColor: reminderGap === gap ? '#3ECF8C' : '#ccc',
                                borderRadius: 10,
                                marginLeft: 10,
                            }}>
                            <Text style={{ color: '#fff' }}>{gap} phút</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <ScrollView style={styles.glassGrid}>
                {Array.from({ length: Math.ceil(schedule.length / 4) }).map((_, rowIndex) => (
                    <View key={rowIndex} style={styles.row}>
                        {schedule
                            .slice(rowIndex * 4, rowIndex * 4 + 4)
                            .map((item, i) => renderWaterGlass(item, rowIndex * 4 + i))}
                    </View>
                ))}
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Lưu</Text>
            </TouchableOpacity>
            </ScrollView>
            <TimePickerModal
                key={selectedIndex}
                visible={showTimePicker}
                initialTime={
                    mode === 'wakeUp' ? wakeUpTime :
                        mode === 'sleep' ? sleepTime :
                            (selectedIndex !== null && schedule[selectedIndex]) ? schedule[selectedIndex].time : '12:00'
                }
                onTimeChange={handleTimeChange}
                onCancel={() => setShowTimePicker(false)}
                compareTime={(newTime) => {
                    if (mode === 'wakeUp') return newTime < sleepTime;
                    if (mode === 'sleep') return newTime > wakeUpTime;
                    return true;
                }}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    header: {
        backgroundColor: '#3ECF8C',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    glassImage: {
        width: 40,
        height: 60,
        resizeMode: 'contain',
        marginBottom: 8,
    },
    headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
    headerSingleLine: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#fff',
    },
    sleepLabel: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    sleepTimes: { flexDirection: 'row', alignItems: 'center' },
    timeEditable: { fontSize: 16, fontWeight: 'bold', color: '#3ECF8C', textDecorationLine: 'underline' },
    hyphen: { fontSize: 16, marginHorizontal: 5, color: '#333' },
    reminderSection: {
        paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#fff',
        borderBottomWidth: 1, borderBottomColor: '#e0e0e0',
    },
    reminderTitle: { fontSize: 16, color: '#333' },
    glassGrid: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
    glassContainer: { alignItems: 'center', flex: 1 },
    glassIcon: {
        width: 60, height: 80, backgroundColor: '#e0f7fa',
        borderRadius: 8, marginBottom: 8, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 5,
    },
    water: { width: 50, height: 60, backgroundColor: '#00bcd4', borderRadius: 6 },
    amount: { fontSize: 14, color: '#333', marginBottom: 4 },
    time: { fontSize: 14, color: '#666', textDecorationLine: 'underline' },
    saveButton: {
        backgroundColor: '#3ECF8C', marginHorizontal: 20, marginVertical: 20,
        paddingVertical: 15, borderRadius: 25, alignItems: 'center',
    },
    saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default WaterScheduleScreen;
