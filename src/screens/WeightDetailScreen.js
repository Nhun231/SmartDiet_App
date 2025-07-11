import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import WeightChart from '../components/WeightChart';
import { PUBLIC_SERVER_ENDPOINT } from '@env';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

const FILTER_OPTIONS = [
  { label: '7 ngày', value: 'week' },
  { label: '30 ngày', value: 'month' },
  { label: '365 ngày', value: 'year' },
];

export default function WeightDetailScreen({ navigation, route }) {
  const [weightHistory, setWeightHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('week');
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${PUBLIC_SERVER_ENDPOINT}/customer/calculate/history?filter=${filter}`);
        setWeightHistory(res.data.report);
      } catch (e) {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [filter]);

  if (loading) return <Text>Loading...</Text>;
  if (!weightHistory.length) return <Text>No data</Text>;

  const startWeight = weightHistory[0].weight;
  const currentWeight = weightHistory[weightHistory.length - 1].weight;
  const weightChange = (currentWeight - startWeight).toFixed(1);
  const goalWeight = 50; // You can make this dynamic if needed

  // Sort history by newest first
  const sortedHistory = [...weightHistory].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#10b981' }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerLeft}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Theo dõi cân nặng</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => setShowPicker(!showPicker)} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.filterTextSmall}>{FILTER_OPTIONS.find(opt => opt.value === filter)?.label || '7 ngày'}</Text>
            <Ionicons name="chevron-down" size={14} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      {showPicker && (
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={filter}
            onValueChange={value => {
              setFilter(value);
              setShowPicker(false);
            }}
            style={{ color: '#10b981', backgroundColor: 'white' }}
            dropdownIconColor="#10b981"
          >
            {FILTER_OPTIONS.map(opt => (
              <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
            ))}
          </Picker>
        </View>
      )}
      <ScrollView style={[styles.content, { flex: 1, minHeight: '100%' }]} contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {/* Summary Card */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.sectionTitle}>{FILTER_OPTIONS.find(opt => opt.value === filter)?.label || '7 ngày'} gần đây</Text>
            <Ionicons name="share-social-outline" size={22} color="#374151" />
          </View>
          <View style={{ marginTop: 12 }}>
            <View style={styles.summaryRow}>
              <Ionicons name="checkmark" size={18} color="#10b981" style={{ marginRight: 8 }} />
              <Text style={styles.summaryText}>Cân nặng khởi điểm: <Text style={styles.boldText}>{startWeight} kg</Text></Text>
            </View>
            <View style={styles.summaryRow}>
              <Ionicons name="checkmark" size={18} color="#10b981" style={{ marginRight: 8 }} />
              <Text style={styles.summaryText}>Mục tiêu: <Text style={{ color: '#f59e0b', fontWeight: 'bold' }}>{goalWeight} kg</Text></Text>
            </View>
            <View style={styles.summaryRow}>
              <Ionicons name="checkmark" size={18} color="#10b981" style={{ marginRight: 8 }} />
              <Text style={styles.summaryText}>Cân nặng hiện tại: <Text style={styles.boldText}>{currentWeight} kg</Text></Text>
            </View>
            <View style={styles.summaryRow}>
              <Ionicons name="checkmark" size={18} color="#10b981" style={{ marginRight: 8 }} />
              <Text style={styles.summaryText}>Cân nặng thay đổi: <Text style={styles.boldText}>{weightChange} kg</Text></Text>
            </View>
          </View>
        </View>
        {/* Chart */}
        <View style={styles.card}>
          <WeightChart weightHistory={weightHistory} />
        </View>
        {/* History Card */}
        <View style={styles.card}>
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Lịch sử</Text>
          {sortedHistory.map((item, idx) => (
            <View key={idx} style={styles.historyRow}>
              <Text style={styles.historyDate}>{new Date(item.createdAt).toLocaleString()}</Text>
              <Text style={styles.historyWeight}>{item.weight} kg</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 36,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerLeft: {
    width: 40,
    alignItems: 'flex-start',
  },
  headerText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  filterText: {
    color: 'white',
    fontSize: 16,
    marginRight: 4,
  },
  filterTextSmall: {
    color: 'white',
    fontSize: 13,
    marginRight: 2,
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    marginHorizontal: 16,
    marginTop: -8,
    zIndex: 10,
  },
  content: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9fafb',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  summaryText: {
    fontSize: 15,
    color: '#374151',
  },
  boldText: {
    fontWeight: 'bold',
    color: '#374151',
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  historyDate: {
    color: '#6b7280',
    fontSize: 14,
  },
  historyWeight: {
    color: '#1f2937',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
