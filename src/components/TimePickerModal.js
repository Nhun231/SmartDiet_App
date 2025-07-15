// TimePickerModal.js - Dual ring hour picker + minute step picker with keyboard input and validation
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    Dimensions,
    Alert,
} from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');
const CLOCK_SIZE = 250;
const CENTER = CLOCK_SIZE / 2;
const HOUR_RADIUS = CENTER - 40;
const MINUTE_RADIUS = CENTER - 30;

const TimePickerModal = ({
    visible,
    initialTime,
    onTimeChange,
    onCancel,
    compareTime,
}) => {
    const [mode, setMode] = useState('hour');
    const [hours, setHours] = useState('12');
    const [minutes, setMinutes] = useState('00');
    const [showKeyboard, setShowKeyboard] = useState(false);

    useEffect(() => {
        if (initialTime) {
            const [h, m] = initialTime.split(':');
            setHours(h);
            setMinutes(m);
            setMode('hour');
        }
    }, [initialTime]);

    const handleHourSelect = (h) => {
        setHours(h.toString().padStart(2, '0'));
        setMode('minute');
    };

    const handleMinuteSelect = (m) => {
        const mm = m.toString().padStart(2, '0');
        const newTime = `${hours}:${mm}`;
        if (compareTime && !compareTime(newTime)) {
            Alert.alert('Lỗi', 'Giờ dậy phải sau giờ ngủ.');
            return;
        }
        onTimeChange(newTime);
    };

    const handleConfirmKeyboard = () => {
        const h = parseInt(hours);
        const m = parseInt(minutes);
        if (isNaN(h) || h < 0 || h > 23 || isNaN(m) || m < 0 || m > 59) {
            Alert.alert('Lỗi', 'Giờ không hợp lệ.');
            return;
        }
        const newTime = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
        if (compareTime && !compareTime(newTime)) {
            Alert.alert('Lỗi', 'Giờ dậy phải sau giờ ngủ.');
            return;
        }
        onTimeChange(newTime);
    };

    const renderHourClock = () => {
        const hourItems = [];
        for (let i = 0; i < 24; i++) {
            const isInner = i >= 12;
            const angle = (i % 12) * 30 - 90;
            const rad = (angle * Math.PI) / 180;
            const radius = isInner ? HOUR_RADIUS - 30 : HOUR_RADIUS;
            const x = CENTER + radius * Math.cos(rad);
            const y = CENTER + radius * Math.sin(rad);

            hourItems.push(
                <TouchableOpacity
                    key={i}
                    onPress={() => handleHourSelect(i)}
                    style={[
                        styles.clockNumber,
                        {
                            left: x - 15,
                            top: y - 15,
                            backgroundColor:
                                parseInt(hours) === i ? '#673AB7' : 'transparent',
                        },
                    ]}>
                    <Text
                        style={{
                            color: parseInt(hours) === i ? '#fff' : '#333',
                            fontWeight: 'bold',
                        }}>
                        {i}
                    </Text>
                </TouchableOpacity>
            );
        }
        return hourItems;
    };

    const renderMinuteClock = () => {
        const minuteItems = [];
        for (let i = 0; i < 60; i += 5) {
            const angle = i * 6 - 90;
            const rad = (angle * Math.PI) / 180;
            const x = CENTER + MINUTE_RADIUS * Math.cos(rad);
            const y = CENTER + MINUTE_RADIUS * Math.sin(rad);

            minuteItems.push(
                <TouchableOpacity
                    key={i}
                    onPress={() => handleMinuteSelect(i)}
                    style={[
                        styles.clockNumber,
                        {
                            left: x - 15,
                            top: y - 15,
                            backgroundColor:
                                parseInt(minutes) === i ? '#673AB7' : 'transparent',
                        },
                    ]}>
                    <Text
                        style={{
                            color: parseInt(minutes) === i ? '#fff' : '#333',
                            fontWeight: 'bold',
                        }}>
                        {i.toString().padStart(2, '0')}
                    </Text>
                </TouchableOpacity>
            );
        }
        return minuteItems;
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <Text style={styles.title}>
                        {showKeyboard
                            ? 'Nhập giờ'
                            : mode === 'hour'
                                ? 'Chọn giờ'
                                : 'Chọn phút'}
                    </Text>

                    <View style={styles.clockContainer}>
                        <View style={styles.timeDisplay}>
                            <TextInput
                                style={styles.timeInput}
                                value={hours}
                                onChangeText={setHours}
                                keyboardType="numeric"
                                maxLength={2}
                            />
                            <Text style={styles.separator}>:</Text>
                            <TextInput
                                style={styles.timeInput}
                                value={minutes}
                                onChangeText={setMinutes}
                                keyboardType="numeric"
                                maxLength={2}
                            />
                        </View>

                        {!showKeyboard && (
                            <View style={styles.clock}>
                                {mode === 'hour' ? renderHourClock() : renderMinuteClock()}
                                <View style={styles.clockCenter} />
                            </View>
                        )}
                    </View>

                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            onPress={() => setShowKeyboard(!showKeyboard)}
                            style={styles.iconButton}>
                            <Icon
                                name={showKeyboard ? 'access-time' : 'keyboard'}
                                size={24}
                                color="#666"
                            />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onCancel}>
                            <Text style={styles.cancelText}>Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                if (showKeyboard) {
                                    handleConfirmKeyboard();
                                } else {
                                    const newTime = `${hours.padStart(2, '0')}:${minutes.padStart(
                                        2,
                                        '0'
                                    )}`;
                                    if (compareTime && !compareTime(newTime)) {
                                        Alert.alert('Lỗi', 'Giờ dậy phải sau giờ ngủ.');
                                        return;
                                    }
                                    onTimeChange(newTime);
                                }
                            }}>
                            <Text
                                style={[
                                    styles.cancelText,
                                    { color: '#673AB7', fontWeight: 'bold' },
                                ]}>
                                OK
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        backgroundColor: '#f0e6ff',
        borderRadius: 20,
        padding: 20,
        width: width * 0.9,
        maxWidth: 350,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#333',
    },
    clockContainer: {
        alignItems: 'center',
    },
    timeDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    timeInput: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#673AB7',
        textAlign: 'center',
        minWidth: 80,
        borderBottomWidth: 2,
        borderBottomColor: '#673AB7',
    },
    separator: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#333',
        marginHorizontal: 10,
    },
    clock: {
        width: CLOCK_SIZE,
        height: CLOCK_SIZE,
        borderRadius: CLOCK_SIZE / 2,
        backgroundColor: '#fff',
        position: 'relative',
        marginBottom: 20,
    },
    clockNumber: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    clockCenter: {
        position: 'absolute',
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#673AB7',
        left: CENTER - 6,
        top: CENTER - 6,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    cancelText: {
        fontSize: 16,
        color: '#666',
    },
    iconButton: {
        padding: 10,
    },
});

export default TimePickerModal;
