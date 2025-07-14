import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function NutritionLabel({ data }) {
    return (
        <View style={styles.container}>
            <Text style={styles.header}>Thông tin dinh dưỡng</Text>
            <View style={styles.subHeaderWithLine}>
                <Text style={styles.subHeader}>Kích thước phục vụ 100.0g</Text>
                <View style={styles.separator} />
            </View>
            <Text style={styles.sectionLabel}>Khối lượng mỗi khẩu phần</Text>
            <Text style={styles.energyRow}>
                <Text style={styles.energyLabel}>Giá trị năng lượng</Text>
                <Text> {safeFixed(data?.calories)} kcal</Text>
            </Text>

            <View style={styles.tableHeader}>
                <Text style={styles.left}> </Text>
                <Text style={styles.right}>% thông số hàng ngày*</Text>
            </View>

            {renderRow('Chất béo', data?.fat)}
            {renderRow('Carbohydrate', data?.carbs)}
            {renderRow(' Chất xơ', data?.fiber)}
            {renderRow('Chất đạm', data?.protein)}

            <View style={styles.separator} />
            <Text style={styles.footer}>
                *Phần trăm dựa trên thông tin dinh dưỡng hàng ngày 2533.91 calories diet.
            </Text>
        </View>
    );
}

const safeFixed = (val, digits = 1) =>
    typeof val === 'number' ? val.toFixed(digits) : '0.0';

const renderRow = (label, value) => {
    const safeValue = typeof value === 'number' ? value : 0;
    const percent = ((safeValue / 2533.91) * 100).toFixed(2);
    return (
        <View style={styles.row} key={label}>
            <Text style={styles.label}>
                <Text style={styles.bold}>{label}</Text> {safeFixed(safeValue)}g
            </Text>
            <Text style={styles.percent}>{percent}%</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderWidth: 2.5,
        borderColor: '#000',
        paddingHorizontal: 2,
        backgroundColor: '#fff',
        alignSelf: 'stretch',
        marginVertical: 16,
    },
    header: {
        fontSize: 27,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subHeader: {
        fontSize: 14,
        marginBottom: -3,
    },
    sectionLabel: {
        fontWeight: 'bold',
        marginBottom: 6,
    },
    energyRow: {
        fontSize: 15,
        marginBottom: 10,
    },
    energyLabel: {
        fontWeight: 'bold',
        fontSize: 15,
    },
    tableHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
        borderBottomWidth: 2,
        borderColor: '#000',
        paddingBottom: 4,
    },
    left: {
        flex: 1.5,
    },
    right: {
        flex: 0.8,
        fontSize: 12,
        textAlign: 'right',
        fontWeight: 'bold',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 3,
        borderBottomWidth: 2,
        borderColor: '#000',
    },
    label: {
        flex: 1.5,
        fontSize: 14,
    },
    percent: {
        flex: 0.8,
        fontSize: 14,
        textAlign: 'right',
    },
    bold: {
        fontWeight: 'bold',
    },
    separator: {
        borderBottomWidth: 5,
        borderColor: '#000',
        marginVertical: 6,
    },
    footer: {
        fontSize: 11,
        marginTop: 10,
        fontStyle: 'italic',
        color: '#333',
    },
});
