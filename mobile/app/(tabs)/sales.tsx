import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TextInput, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import axios from 'axios';
import { API_BASE_URL } from '../../src/config/api';
import VehicleCard from '../../components/VehicleCard';

export default function SalesScreen() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchVehicles = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/sales`);
      setVehicles(response.data);
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchVehicles();
  };

  const filteredVehicles = vehicles.filter(v => 
    v.make.toLowerCase().includes(searchQuery.toLowerCase()) || 
    v.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Premium Sales</Text>
        <TextInput 
          style={styles.searchInput}
          placeholder="Search make or model..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#d32f2f" />
        </View>
      ) : filteredVehicles.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={styles.noDataText}>No vehicles found</Text>
        </View>
      ) : (
        <FlatList 
          data={filteredVehicles}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <VehicleCard 
              vehicle={item} 
              isRental={false} 
              onPress={() => router.push(`/sales/${item._id}`)} 
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  header: {
    padding: 20,
    paddingTop: 10,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: '#222',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  listContent: {
    padding: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    color: '#aaa',
    fontSize: 16,
  }
});
