import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function PersonalScreen({ navigation }) {
    const data = {
        bmi: 17.6,
        createdAt: '15 tháng 5 - 21:11',
        height: 160,
        weight: 45,
        waterIntake: 2364
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.userInfo}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>N</Text>
                    </View>
                    <View>
                        <Text style={styles.userName}>Nguyen Thuy Hang (K18 HL)</Text>
                    </View>
                </View>
            </View>

            {/* BMI Card */}
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Chỉ số khối cơ thể (BMI)</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('BMREdit')}>
                        <Icon name="dots-horizontal" size={24} color="#000" />
                    </TouchableOpacity>
                </View>

                <View style={styles.bmiSection}>
                    <View>
                        <Text style={styles.bmiLabel}>BMI</Text>
                        <Text style={styles.bmiValue}>{data.bmi}</Text>
                    </View>
                    <View>
                        <Text style={styles.bmiDate}><Icon name="clock-outline" size={14} /> {data.createdAt}</Text>
                        <TouchableOpacity>
                            <Text style={styles.updateLink}>Cập nhật cân nặng</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.bmiDetails}>
                    <Text style={styles.detailItem}>{data.height} cm</Text>
                    <Text style={styles.detailItem}>{data.weight} kg</Text>
                    <Text style={styles.detailStatus}>Thiếu cân</Text>
                </View>
            </View>

            {/* Water Card */}
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Bạn nên uống bao nhiêu nước</Text>
                    <TouchableOpacity>
                        <Icon name="dots-horizontal" size={24} color="#000" />
                    </TouchableOpacity>
                </View>

                <Text style={styles.waterValue}>{data.waterIntake} ml</Text>
                <Text style={styles.waterLabel}>Lượng nước bạn cần uống</Text>

                <View style={styles.waterControls}>
                    <TouchableOpacity style={styles.controlButton}>
                        <Icon name="plus" size={20} color="#333" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.controlButton}>
                        <Icon name="minus" size={20} color="#333" />
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9F9F9' },
    header: {
        backgroundColor: '#4CAF50',
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    userInfo: { flexDirection: 'row', alignItems: 'center' },
    avatar: {
        backgroundColor: '#FF7043',
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10
    },
    avatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    userName: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
    card: {
        backgroundColor: '#fff',
        margin: 15,
        borderRadius: 15,
        padding: 20,
        elevation: 3
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10
    },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    bmiSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    bmiLabel: { fontSize: 16, color: '#555' },
    bmiValue: { fontSize: 28, color: 'red', fontWeight: 'bold' },
    bmiDate: { color: '#666', fontSize: 12, marginTop: 4 },
    updateLink: { color: 'orange', fontSize: 13, marginTop: 4 },
    bmiDetails: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10
    },
    detailItem: { fontSize: 14, color: '#333' },
    detailStatus: { color: 'gray', fontSize: 14 },
    waterValue: { fontSize: 24, color: 'red', fontWeight: 'bold', marginBottom: 10 },
    waterLabel: { color: '#777', fontSize: 14 },
    waterControls: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 15
    },
    controlButton: {
        backgroundColor: '#eee',
        padding: 12,
        borderRadius: 30,
        marginHorizontal: 10
    }
});
