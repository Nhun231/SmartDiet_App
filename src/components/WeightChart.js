import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

// Helper to format date as dd/MM
function formatDateDM(date) {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
}

export default function WeightChart({ weightHistory }) {
    const chartData = weightHistory.map(item => ({
        x: new Date(item.createdAt),
        y: item.weight
    }));
    const weights = chartData.map(d => d.y);
    const hasWeights = weights.length > 0;

    let chartKitData;
    if (weights.length === 1) {
        // Single record: center the dot
        chartKitData = {
            labels: ["", formatDateDM(chartData[0].x), ""],
            datasets: [{ data: [null, weights[0], null] }]
        };
    } else if (weights.length > 1) {
        // Multiple records: show only first and last date
        const xLabels = chartData.map((d, i, arr) =>
            i === 0 || i === arr.length - 1 ? formatDateDM(d.x) : ""
        );
        chartKitData = {
            labels: xLabels,
            datasets: [{ data: weights }]
        };
    }

    return (
        <View style={{ height: 180, borderRadius: 8, overflow: 'hidden' }}>
            {hasWeights ? (
                <LineChart
                    data={chartKitData}
                    width={width - 80}
                    height={160}
                    fromZero={false}
                    chartConfig={{
                        backgroundColor: "#fff",
                        backgroundGradientFrom: "#fff",
                        backgroundGradientTo: "#fff",
                        decimalPlaces: 1,
                        color: (opacity = 1) => `rgba(34, 211, 238, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(31, 41, 55, ${opacity})`,
                        style: { borderRadius: 8 },
                        propsForDots: { r: "6", strokeWidth: "2", stroke: "#22d3ee" }
                    }}
                    style={{ borderRadius: 8 }}
                    segments={5}
                />
            ) : (
                <Text>No weight data available</Text>
            )}
        </View>
    );
}
