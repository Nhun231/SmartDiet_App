import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const levels = [
    { label: 'ít', name: 'Rất ít', desc: 'Ít hoạt động, chỉ ăn đi làm về ngủ' },
    { label: 'nhẹ', name: 'Nhẹ', desc: 'Có tập nhẹ nhàng, tuần 1-3 buổi' },
    { label: 'vừa', name: 'Vừa', desc: 'Có vận động vừa 4-5 buổi' },
    { label: 'nhiều', name: 'Nhiều', desc: 'Vận động nhiều 6-7 buổi' },
    { label: 'cực_nhiều', name: 'Cực nhiều', desc: 'Vận động rất nhiều, ngày tập 2 lần' },
];

export default function ExerciseLevelScreen({ route, navigation }) {
    const { activity, setActivity } = route.params;

    const handleSelect = (level) => {
        setActivity(level);
        navigation.goBack();
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Cường độ luyện tập</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                {levels.map((level) => {
                    const isActive = activity === level.label;
                    return (
                        <TouchableOpacity
                            key={level.label}
                            style={[
                                styles.item,
                                isActive && styles.activeItem,
                            ]}
                            onPress={() => handleSelect(level.label)}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.label, isActive && styles.activeLabel]}>
                                {level.name}
                            </Text>
                            <Text style={styles.desc}>{level.desc}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F4F8' },
    header: {
        backgroundColor: '#4CAF50',
        paddingTop: 30,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
    backButton: {
        borderRadius: 30,
        padding: 8,
    },
    content: { padding: 20 },
    item: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: '#ddd',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    activeItem: {
        borderColor: '#4CAF50',
        transform: [{ scale: 1.02 }],
    },
    label: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: '#333', textAlign: 'center' },
    activeLabel: { color: '#4CAF50' },
    desc: { fontSize: 16, color: '#666', textAlign: 'center' },
});
