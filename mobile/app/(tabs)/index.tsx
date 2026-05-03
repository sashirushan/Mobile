import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back to</Text>
        <Text style={styles.title}>Samarasinghe Motors</Text>
      </View>

      <View style={styles.actionGrid}>
        <TouchableOpacity style={styles.actionCard} onPress={() => router.navigate('/(tabs)/sales')}>
          <MaterialIcons name="directions-car" size={40} color="#d32f2f" />
          <Text style={styles.cardTitle}>Buy a Car</Text>
          <Text style={styles.cardSubtitle}>Browse premium vehicles</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={() => router.navigate('/(tabs)/rentals')}>
          <MaterialIcons name="access-time" size={40} color="#d32f2f" />
          <Text style={styles.cardTitle}>Rent a Car</Text>
          <Text style={styles.cardSubtitle}>Flexible daily rentals</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.promoSection}>
        <Text style={styles.promoTitle}>Why Choose Us?</Text>
        <Text style={styles.promoText}>• Premium selection of vehicles</Text>
        <Text style={styles.promoText}>• Competitive pricing & easy financing</Text>
        <Text style={styles.promoText}>• 24/7 customer support</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 16,
    color: '#aaa',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 5,
  },
  actionGrid: {
    flexDirection: 'column',
    gap: 15,
    marginBottom: 30,
  },
  actionCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 15,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 5,
  },
  promoSection: {
    backgroundColor: '#222',
    padding: 20,
    borderRadius: 12,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  promoText: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 5,
    lineHeight: 22,
  }
});
