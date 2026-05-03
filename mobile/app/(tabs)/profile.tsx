import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import axios from 'axios';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../src/config/api';

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        router.replace('/login');
        return;
      }
      
      // Fetch User Profile
      const response = await axios.get(`${API_BASE_URL}/api/users`);
      const savedRole = await AsyncStorage.getItem('role');
      const currentUser = response.data.find(u => u.role === savedRole) || response.data[0];
      setUser(currentUser);

      // Fetch Bookings
      if (currentUser && currentUser._id) {
        const bookingsRes = await axios.get(`${API_BASE_URL}/api/bookings/user/${currentUser._id}`);
        setBookings(bookingsRes.data);
      }

      // Fetch Inquiries
      if (currentUser && currentUser.email) {
        const inquiriesRes = await axios.get(`${API_BASE_URL}/api/inquiries/user/${currentUser.email}`);
        setInquiries(inquiriesRes.data);
      }

    } catch (error) {
      console.error('Error fetching profile data:', error);
      Alert.alert('Error', 'Failed to load profile details.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Log Out', 
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('role');
          router.replace('/login');
        }
      }
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centerContent}>
        <ActivityIndicator size="large" color="#d32f2f" />
      </View>
    );
  }

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'confirmed':
      case 'accepted':
      case 'replied':
      case 'completed': return '#34d399';
      case 'rejected':
      case 'cancelled': return '#d32f2f';
      case 'pending': return '#fbbf24';
      default: return '#aaa';
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.username?.charAt(0).toUpperCase() || 'U'}</Text>
        </View>
        <Text style={styles.name}>{user?.fullName || user?.username || 'User'}</Text>
        <Text style={styles.role}>{user?.role === 'admin' ? 'Administrator' : 'Premium Member'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{user?.email || 'Not provided'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Phone</Text>
          <Text style={styles.infoValue}>{user?.phone || 'Not provided'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Address</Text>
          <Text style={styles.infoValue}>{user?.address || 'Not provided'}</Text>
        </View>
      </View>

      {/* Bookings Dashboard */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Bookings</Text>
        {bookings.length === 0 ? (
          <Text style={styles.emptyText}>You have no rental bookings.</Text>
        ) : (
          bookings.map((booking) => (
            <View key={booking._id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>
                  {booking.vehicle?.make} {booking.vehicle?.model}
                </Text>
                <Text style={[styles.itemStatus, { color: getStatusColor(booking.status) }]}>
                  {booking.status}
                </Text>
              </View>
              <Text style={styles.itemDetail}>
                From: {new Date(booking.startDate).toLocaleDateString()}
              </Text>
              {booking.endDate && (
                <Text style={styles.itemDetail}>
                  To: {new Date(booking.endDate).toLocaleDateString()}
                </Text>
              )}
              <Text style={styles.itemPrice}>Rs. {booking.totalPrice?.toLocaleString()}</Text>
            </View>
          ))
        )}
      </View>

      {/* Inquiries Dashboard */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Inquiries</Text>
        {inquiries.length === 0 ? (
          <Text style={styles.emptyText}>You have no pending inquiries.</Text>
        ) : (
          inquiries.map((inquiry) => (
            <View key={inquiry._id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>
                  {inquiry.vehicleId?.make} {inquiry.vehicleId?.model}
                </Text>
                <Text style={[styles.itemStatus, { color: getStatusColor(inquiry.status) }]}>
                  {inquiry.status}
                </Text>
              </View>
              <Text style={styles.itemMessage}>"{inquiry.message}"</Text>
              {inquiry.replyMessage && (
                <View style={styles.replyBox}>
                  <Text style={styles.replyLabel}>Samarasinghe Motors replied:</Text>
                  <Text style={styles.replyText}>{inquiry.replyMessage}</Text>
                </View>
              )}
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Actions</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 50,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#d32f2f',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  name: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  role: {
    color: '#aaa',
    fontSize: 15,
  },
  section: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  infoLabel: {
    color: '#aaa',
    fontSize: 15,
    flex: 1,
  },
  infoValue: {
    color: '#fff',
    fontSize: 15,
    flex: 2,
    textAlign: 'right',
  },
  emptyText: {
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 10,
  },
  itemCard: {
    backgroundColor: '#222',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  itemStatus: {
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  itemDetail: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 2,
  },
  itemPrice: {
    color: '#34d399',
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 5,
  },
  itemMessage: {
    color: '#ccc',
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 5,
  },
  replyBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#34d399',
  },
  replyLabel: {
    color: '#34d399',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  replyText: {
    color: '#fff',
    fontSize: 14,
  },
  logoutButton: {
    backgroundColor: 'rgba(211, 47, 47, 0.1)',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d32f2f',
    alignItems: 'center',
  },
  logoutText: {
    color: '#d32f2f',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
