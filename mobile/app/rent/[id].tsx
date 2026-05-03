import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import { API_BASE_URL } from '../../src/config/api';
import { Ionicons } from '@expo/vector-icons';

export default function RentVehicleDetails() {
  const { id } = useLocalSearchParams();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(new Date().setDate(new Date().getDate() + 1)));
  
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  useEffect(() => {
    fetchVehicle();
  }, [id]);

  const fetchVehicle = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/rentals/${id}`);
      setVehicle(response.data);
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      Alert.alert('Error', 'Failed to load vehicle details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = () => {
    if (vehicle.status !== 'Available') {
      Alert.alert('Not Available', `This vehicle is currently ${vehicle.status}.`);
      return;
    }

    if (endDate <= startDate) {
      Alert.alert('Invalid Dates', 'End date must be after start date.');
      return;
    }

    // Go to payment screen and pass stringified vehicle and dates
    router.push({
      pathname: '/payment',
      params: { 
        vehicleId: vehicle._id,
        vehicleString: JSON.stringify(vehicle),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    });
  };

  const formatPrice = (price) => {
    if (!price) return '0';
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const onChangeStart = (event, selectedDate) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (selectedDate) setStartDate(selectedDate);
  };

  const onChangeEnd = (event, selectedDate) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (selectedDate) setEndDate(selectedDate);
  };

  if (loading) {
    return (
      <View style={styles.centerContent}>
        <ActivityIndicator size="large" color="#d32f2f" />
      </View>
    );
  }

  if (!vehicle) return null;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: vehicle.image }} style={styles.image} resizeMode="cover" />
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={[styles.conditionBadge, { backgroundColor: vehicle.status === 'Available' ? '#34d399' : '#ef4444' }]}>
            <Text style={styles.conditionText}>{vehicle.status}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{vehicle.yearOfManufacture} {vehicle.make} {vehicle.model}</Text>
          <Text style={styles.price}>Rs. {formatPrice(vehicle.pricePerDay)} <Text style={styles.perDay}>/ day</Text></Text>

          <View style={styles.specsGrid}>
            <View style={styles.specItem}>
              <Ionicons name="people-outline" size={20} color="#34d399" />
              <Text style={styles.specLabel}>Seats</Text>
              <Text style={styles.specValue}>{vehicle.seats}</Text>
            </View>
            <View style={styles.specItem}>
              <Ionicons name="speedometer-outline" size={20} color="#34d399" />
              <Text style={styles.specLabel}>Daily Limit</Text>
              <Text style={styles.specValue}>{vehicle.dailyMileageLimit || 100} km</Text>
            </View>
            <View style={styles.specItem}>
              <Ionicons name="cash-outline" size={20} color="#34d399" />
              <Text style={styles.specLabel}>Extra Km</Text>
              <Text style={styles.specValue}>Rs. {vehicle.extraKmCharge || 50}</Text>
            </View>
            <View style={styles.specItem}>
              <Ionicons name="water-outline" size={20} color="#34d399" />
              <Text style={styles.specLabel}>Fuel Type</Text>
              <Text style={styles.specValue}>{vehicle.fuelType}</Text>
            </View>
            <View style={styles.specItem}>
              <Ionicons name="settings-outline" size={20} color="#34d399" />
              <Text style={styles.specLabel}>Transmission</Text>
              <Text style={styles.specValue}>{vehicle.transmission}</Text>
            </View>
            <View style={styles.specItem}>
              <Ionicons name="leaf-outline" size={20} color="#34d399" />
              <Text style={styles.specLabel}>Consumption</Text>
              <Text style={styles.specValue}>{vehicle.fuelConsumption} km/l</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{vehicle.description || 'No description provided.'}</Text>
          </View>

          <View style={styles.bookingCard}>
            <Text style={styles.sectionTitle}>Book this vehicle</Text>
            <Text style={styles.subtext}>Select your dates to proceed.</Text>

            <View style={styles.dateRow}>
              <View style={styles.dateInputContainer}>
                <Text style={styles.dateLabel}>Start Date</Text>
                <TouchableOpacity style={styles.dateButton} onPress={() => setShowStartPicker(true)}>
                  <Ionicons name="calendar-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.dateButtonText}>{startDate.toLocaleDateString()}</Text>
                </TouchableOpacity>
                {showStartPicker && (
                  <DateTimePicker
                    value={startDate}
                    mode="date"
                    minimumDate={new Date()}
                    display="default"
                    onChange={onChangeStart}
                  />
                )}
              </View>

              <View style={styles.dateInputContainer}>
                <Text style={styles.dateLabel}>End Date</Text>
                <TouchableOpacity style={styles.dateButton} onPress={() => setShowEndPicker(true)}>
                  <Ionicons name="calendar-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.dateButtonText}>{endDate.toLocaleDateString()}</Text>
                </TouchableOpacity>
                {showEndPicker && (
                  <DateTimePicker
                    value={endDate}
                    mode="date"
                    minimumDate={startDate}
                    display="default"
                    onChange={onChangeEnd}
                  />
                )}
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.submitButton, vehicle.status !== 'Available' && styles.disabledButton]} 
              onPress={handleBookingSubmit}
            >
              <Text style={styles.submitButtonText}>
                {vehicle.status === 'Available' ? 'Proceed to Payment' : 'Vehicle Unavailable'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
  },
  imageContainer: {
    position: 'relative',
    height: 300,
    width: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  conditionBadge: {
    position: 'absolute',
    bottom: -15,
    right: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  conditionText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  content: {
    padding: 20,
    paddingTop: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  price: {
    fontSize: 24,
    fontWeight: '900',
    color: '#34d399',
    marginBottom: 25,
  },
  perDay: {
    fontSize: 16,
    color: '#aaa',
    fontWeight: 'normal',
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  specItem: {
    width: '31%',
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  specLabel: {
    color: '#888',
    fontSize: 11,
    marginTop: 5,
    marginBottom: 2,
  },
  specValue: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  description: {
    color: '#aaa',
    fontSize: 15,
    lineHeight: 24,
  },
  bookingCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 30,
  },
  subtext: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 15,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dateInputContainer: {
    width: '48%',
  },
  dateLabel: {
    color: '#888',
    fontSize: 14,
    marginBottom: 5,
  },
  dateButton: {
    backgroundColor: '#222',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  dateButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#34d399',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#555',
  },
  submitButtonText: {
    color: '#111',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
