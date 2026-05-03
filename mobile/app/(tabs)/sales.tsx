import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TextInput, RefreshControl, ImageBackground, Image, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import axios from 'axios';
import { API_BASE_URL } from '../../src/config/api';
import VehicleCard from '../../components/VehicleCard';

export default function SalesScreen() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMake, setSelectedMake] = useState('All');
  const [selectedSort, setSelectedSort] = useState('Default');

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

  // Get unique makes for filter chips
  const makes = ['All', ...new Set(vehicles.map(v => v.make))];
  const sorts = ['Default', 'Price: Low-High', 'Price: High-Low', 'Year: Newest'];

  // Apply Filters and Sorting
  let filteredVehicles = vehicles.filter(v => {
    const matchesSearch = v.make.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          v.model.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMake = selectedMake === 'All' || v.make === selectedMake;
    return matchesSearch && matchesMake;
  });

  if (selectedSort === 'Price: Low-High') {
    filteredVehicles.sort((a, b) => a.price - b.price);
  } else if (selectedSort === 'Price: High-Low') {
    filteredVehicles.sort((a, b) => b.price - a.price);
  } else if (selectedSort === 'Year: Newest') {
    filteredVehicles.sort((a, b) => b.year - a.year);
  }

  return (
    <ImageBackground 
      source={require('../../assets/images/sale_portal_bg.png')} 
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <View style={styles.header}>
        <Image source={require('../../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.headerTitle}>Premium Sales</Text>
        <TextInput 
          style={styles.searchInput}
          placeholder="Search make or model..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        
        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Brand:</Text>
            {makes.map(make => (
              <TouchableOpacity 
                key={`make-${make}`} 
                style={[styles.chip, selectedMake === make && styles.chipActive]}
                onPress={() => setSelectedMake(make)}
              >
                <Text style={[styles.chipText, selectedMake === make && styles.chipTextActive]}>{make}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Sort:</Text>
            {sorts.map(sort => (
              <TouchableOpacity 
                key={`sort-${sort}`} 
                style={[styles.chip, selectedSort === sort && styles.chipActive]}
                onPress={() => setSelectedSort(sort)}
              >
                <Text style={[styles.chipText, selectedSort === sort && styles.chipTextActive]}>{sort}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#d32f2f" />
        </View>
      ) : filteredVehicles.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={styles.noDataText}>No vehicles match your filters</Text>
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
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
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
    color: '#34d399',
    marginBottom: 10,
  },
  logo: {
    width: 200,
    height: 50,
    marginBottom: 5,
  },
  searchInput: {
    backgroundColor: '#222',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
    marginBottom: 10,
  },
  filtersContainer: {
    marginBottom: 10,
  },
  filterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterLabel: {
    color: '#888',
    fontSize: 13,
    fontWeight: 'bold',
    marginRight: 5,
  },
  chip: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#222',
    borderWidth: 1,
    borderColor: '#333',
  },
  chipActive: {
    backgroundColor: 'rgba(211, 47, 47, 0.2)',
    borderColor: '#d32f2f',
  },
  chipText: {
    color: '#aaa',
    fontSize: 13,
  },
  chipTextActive: {
    color: '#d32f2f',
    fontWeight: 'bold',
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
