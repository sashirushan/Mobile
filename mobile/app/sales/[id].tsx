import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../src/config/api';
import { Ionicons } from '@expo/vector-icons';

export default function SaleVehicleDetails() {
  const { id } = useLocalSearchParams();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inquiryMsg, setInquiryMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchVehicle();
  }, [id]);

  const fetchVehicle = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/sales/${id}`);
      setVehicle(response.data);
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      Alert.alert('Error', 'Failed to load vehicle details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleInquiry = async () => {
    if (!inquiryMsg.trim()) {
      Alert.alert('Validation', 'Please enter a message');
      return;
    }

    try {
      setSubmitting(true);
      const username = await AsyncStorage.getItem('username');
      if (!username) {
        Alert.alert('Authentication Required', 'Please log in to send an inquiry', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Log In', onPress: () => router.push('/login') }
        ]);
        return;
      }

      await axios.post(`${API_BASE_URL}/api/inquiries`, {
        vehicleId: id,
        username,
        message: inquiryMsg
      });

      Alert.alert('Success', 'Your inquiry has been sent successfully! Our team will contact you soon.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
      setInquiryMsg('');
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to send inquiry');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price) => {
    if (!price) return '0';
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: vehicle.image }} style={styles.image} resizeMode="cover" />
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.conditionBadge}>
            <Text style={styles.conditionText}>{vehicle.condition}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{vehicle.yearOfManufacture} {vehicle.make} {vehicle.model}</Text>
          <Text style={styles.price}>Rs. {formatPrice(vehicle.price)}</Text>

          <View style={styles.specsGrid}>
            <View style={styles.specItem}>
              <Ionicons name="car-outline" size={20} color="#d32f2f" />
              <Text style={styles.specLabel}>Body Type</Text>
              <Text style={styles.specValue}>{vehicle.vehicleType}</Text>
            </View>
            <View style={styles.specItem}>
              <Ionicons name="speedometer-outline" size={20} color="#d32f2f" />
              <Text style={styles.specLabel}>Mileage</Text>
              <Text style={styles.specValue}>{formatPrice(vehicle.mileage)} km</Text>
            </View>
            <View style={styles.specItem}>
              <Ionicons name="color-palette-outline" size={20} color="#d32f2f" />
              <Text style={styles.specLabel}>Trim</Text>
              <Text style={styles.specValue}>{vehicle.trimEdition || '-'}</Text>
            </View>
            <View style={styles.specItem}>
              <Ionicons name="water-outline" size={20} color="#d32f2f" />
              <Text style={styles.specLabel}>Fuel Type</Text>
              <Text style={styles.specValue}>{vehicle.fuelType}</Text>
            </View>
            <View style={styles.specItem}>
              <Ionicons name="settings-outline" size={20} color="#d32f2f" />
              <Text style={styles.specLabel}>Transmission</Text>
              <Text style={styles.specValue}>{vehicle.transmission}</Text>
            </View>
            <View style={styles.specItem}>
              <Ionicons name="hardware-chip-outline" size={20} color="#d32f2f" />
              <Text style={styles.specLabel}>Engine</Text>
              <Text style={styles.specValue}>{vehicle.engineCapacity || '-'}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{vehicle.description || 'No description provided.'}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Send Inquiry</Text>
            <Text style={styles.subtext}>Interested in this vehicle? Send us a message.</Text>
            <TextInput
              style={styles.textArea}
              placeholder="I'm interested in this vehicle..."
              placeholderTextColor="#888"
              multiline
              numberOfLines={4}
              value={inquiryMsg}
              onChangeText={setInquiryMsg}
              textAlignVertical="top"
            />
            <TouchableOpacity 
              style={styles.submitButton} 
              onPress={handleInquiry}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Send Inquiry</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    backgroundColor: '#d32f2f',
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
    color: '#d32f2f',
    marginBottom: 25,
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
  subtext: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 15,
  },
  textArea: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    minHeight: 120,
    marginBottom: 15,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#d32f2f',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
