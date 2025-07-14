import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

export default function CircularTracker({ currentValue = 0, targetValue = 0, size = 160 }) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate percentage
  const percentage = targetValue > 0 ? (currentValue / targetValue) * 100 : 0;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Debugging logs
  console.log('[CircularTracker] Received currentValue:', currentValue);
  console.log('[CircularTracker] Received targetValue:', targetValue);
  console.log('[CircularTracker] Calculated percentage:', percentage.toFixed(2) + '%');


  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          stroke="#D0D0D0" 
          strokeWidth={strokeWidth}
          fill="none"
          cx={center}
          cy={center}
          r={radius}
        />
        
        <Circle
          stroke="#f4f5f5ff" 
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          cx={center}
          cy={center}
          r={radius}
          rotation="-90" 
          origin={`${center}, ${center}`}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFillObject, styles.centerContent]}>
        <Text style={styles.valueText}>{percentage.toFixed(0)}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 28,
    color: 'white', 
    fontWeight: 'bold',
  },
});
