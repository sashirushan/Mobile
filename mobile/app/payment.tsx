import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput, Image } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../src/config/api';
import { Ionicons } from '@expo/vector-icons';

export default function PaymentScreen() {
  const { vehicleId, vehicleString, startDate, endDate } = useLocalSearchParams();
  const [vehicle, setVehicle] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [receiptImage, setReceiptImage] = useState(null);
  
  // Promo code state
  const [promoCode, setPromoCode] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [applyingPromo, setApplyingPromo] = useState(false);

  useEffect(() => {
    if (vehicleString) {
      setVehicle(JSON.parse(vehicleString));
    }
  }, [vehicleString]);

  if (!vehicle) return null;

  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Calculate days (minimum 1 day)
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const totalDays = diffDays > 0 ? diffDays : 1;
  const baseAmount = totalDays * vehicle.pricePerDay;
  const discountAmount = (baseAmount * discountPercentage) / 100;
  const finalAmount = baseAmount - discountAmount;

  const handleApplyPromo = async () => {
    if (!promoCode) return;
    setApplyingPromo(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/promotions/verify/${promoCode}`);
      if (res.data.success) {
        setDiscountPercentage(res.data.discountPercentage);
        Alert.alert('Success', `Promo code applied! ${res.data.discountPercentage}% OFF`);
      } else {
        setDiscountPercentage(0);
        Alert.alert('Invalid Code', res.data.message || 'Invalid or expired promo code');
      }
    } catch (err) {
      setDiscountPercentage(0);
      Alert.alert('Error', 'Failed to verify promo code');
    } finally {
      setApplyingPromo(false);
    }
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      setReceiptImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const handlePaymentSubmit = async () => {
    if (!receiptImage) {
      Alert.alert('Receipt Required', 'Please upload the bank receipt image to continue.');
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      
      // Since our web app doesn't save userId in local storage during login in its current state,
      // we need to fetch the users and find the logged in one by username.
      const resUsers = await axios.get(`${API_BASE_URL}/api/users`);
      const loggedInUsername = await AsyncStorage.getItem('username');
      let currentUser = null;
      
      if (loggedInUsername) {
        currentUser = resUsers.data.find(u => u.username === loggedInUsername);
      }
      if (!currentUser) {
        currentUser = resUsers.data[0];
      }

      if (!currentUser) {
        Alert.alert('Auth Error', 'Please log in again to book a vehicle');
        router.replace('/login');
        return;
      }
      
      await axios.post(`${API_BASE_URL}/api/bookings`, {
        userId: currentUser._id,
        vehicleId: vehicle._id,
        startDate,
        endDate,
        receipt: receiptImage,
        totalPrice: finalAmount
      });
      
      Alert.alert('Booking Confirmed', 'Thank you for your booking! We will review your receipt and confirm your rental soon.', [
        { text: 'View Profile', onPress: () => router.push('/profile') }
      ]);
      
    } catch (err) {
      console.error(err);
      Alert.alert('Payment Failed', err.response?.data?.message || 'Failed to process payment. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#34d399" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complete Payment</Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.sectionTitle}>Booking Summary</Text>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Vehicle:</Text>
          <Text style={styles.summaryValue}>{vehicle.make} {vehicle.model}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Rental Period:</Text>
          <Text style={styles.summaryValue}>{start.toLocaleDateString()} to {end.toLocaleDateString()}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Duration:</Text>
          <Text style={styles.summaryValue}>{totalDays} {totalDays === 1 ? 'day' : 'days'}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Rate:</Text>
          <Text style={styles.summaryValue}>Rs. {vehicle.pricePerDay.toLocaleString()} / day</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.promoSection}>
          <Text style={styles.promoLabel}>Have a Promo Code?</Text>
          <View style={styles.promoInputRow}>
            <TextInput
              style={styles.promoInput}
              placeholder="Enter code"
              placeholderTextColor="#888"
              value={promoCode}
              onChangeText={(text) => setPromoCode(text.toUpperCase())}
              editable={discountPercentage === 0}
            />
            <TouchableOpacity 
              style={[styles.promoButton, discountPercentage > 0 && styles.promoRemoveButton]} 
              onPress={discountPercentage > 0 ? () => { setDiscountPercentage(0); setPromoCode(''); } : handleApplyPromo}
              disabled={applyingPromo || (!promoCode && discountPercentage === 0)}
            >
              <Text style={styles.promoButtonText}>
                {applyingPromo ? '...' : discountPercentage > 0 ? 'Remove' : 'Apply'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {discountPercentage > 0 && (
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: '#34d399' }]}>Discount ({discountPercentage}%):</Text>
            <Text style={[styles.summaryValue, { color: '#34d399' }]}>- Rs. {discountAmount.toLocaleString()}</Text>
          </View>
        )}

        <View style={styles.divider} />
        
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total Amount:</Text>
          <Text style={styles.totalValue}>Rs. {finalAmount.toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.uploadCard}>
        <Text style={styles.sectionTitle}>Bank Transfer Details</Text>
        <View style={styles.bankDetails}>
          <Text style={styles.bankName}>Samarasinghe Motors</Text>
          <Text style={styles.bankAcc}>82469272</Text>
          <Text style={styles.bankDesc}>People's Bank Kandy</Text>
        </View>
        
        <Text style={styles.uploadInstructions}>Please transfer the total amount and upload the receipt image below to confirm your booking.</Text>
        
        <TouchableOpacity style={styles.uploadArea} onPress={pickImage}>
          {receiptImage ? (
            <Image source={{ uri: receiptImage }} style={styles.receiptPreview} resizeMode="cover" />
          ) : (
            <View style={styles.uploadPlaceholder}>
              <Ionicons name="cloud-upload-outline" size={40} color="#34d399" />
              <Text style={styles.uploadText}>Tap to select image</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.submitButton, loading && styles.disabledButton]} 
        onPress={handlePaymentSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#111" />
        ) : (
          <Text style={styles.submitButtonText}>Confirm Booking & Upload Receipt</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    padding: 10,
    marginRight: 10,
    marginLeft: -10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#34d399',
  },
  summaryCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    color: '#aaa',
    fontSize: 15,
  },
  summaryValue: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 15,
  },
  promoSection: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  promoLabel: {
    color: '#888',
    fontSize: 13,
    marginBottom: 8,
  },
  promoInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  promoInput: {
    flex: 1,
    backgroundColor: '#222',
    color: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  promoButton: {
    backgroundColor: '#34d399',
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  promoRemoveButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#d32f2f',
  },
  promoButtonText: {
    color: '#111',
    fontWeight: 'bold',
  },
  totalLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    color: '#34d399',
    fontSize: 20,
    fontWeight: '900',
  },
  uploadCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#333',
  },
  bankDetails: {
    backgroundColor: 'rgba(52, 211, 153, 0.05)',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.2)',
    marginBottom: 15,
  },
  bankName: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  bankAcc: {
    color: '#34d399',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 5,
  },
  bankDesc: {
    color: '#aaa',
    fontSize: 14,
  },
  uploadInstructions: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 15,
    lineHeight: 20,
  },
  uploadArea: {
    height: 150,
    borderWidth: 2,
    borderColor: '#333',
    borderStyle: 'dashed',
    borderRadius: 12,
    overflow: 'hidden',
  },
  uploadPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: {
    color: '#34d399',
    marginTop: 10,
    fontSize: 14,
  },
  receiptPreview: {
    width: '100%',
    height: '100%',
  },
  submitButton: {
    backgroundColor: '#34d399',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
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
