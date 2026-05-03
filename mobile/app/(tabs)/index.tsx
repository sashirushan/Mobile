import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground, Animated, Image } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import ChatBot from '../../components/ChatBot';

export default function HomeScreen() {
  const [chatVisible, setChatVisible] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  return (
    <ImageBackground 
      source={require('../../assets/images/sale_portal_bg.png')} 
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Image source={require('../../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.welcomeText}>Welcome back to</Text>
          <Text style={styles.title}>POWER MEETS PRECISION.</Text>
        </Animated.View>

        <Animated.View style={[styles.actionGrid, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
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
        </Animated.View>

        <Animated.View style={[styles.promoSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.promoTitle}>Why Choose Us?</Text>
          <View style={styles.promoItem}>
            <MaterialIcons name="check-circle" size={20} color="#34d399" />
            <Text style={styles.promoText}>Premium selection of verified vehicles</Text>
          </View>
          <View style={styles.promoItem}>
            <MaterialIcons name="check-circle" size={20} color="#34d399" />
            <Text style={styles.promoText}>Competitive pricing & easy financing</Text>
          </View>
          <View style={styles.promoItem}>
            <MaterialIcons name="check-circle" size={20} color="#34d399" />
            <Text style={styles.promoText}>24/7 dedicated customer support</Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Floating Action Button for Chatbot */}
      <Animated.View style={[styles.fabContainer, { opacity: fadeAnim }]}>
        <TouchableOpacity 
          style={styles.fab} 
          onPress={() => setChatVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="chatbubbles" size={28} color="#fff" />
          <View style={styles.fabBadge} />
        </TouchableOpacity>
      </Animated.View>

      <ChatBot visible={chatVisible} onClose={() => setChatVisible(false)} />
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
    backgroundColor: 'rgba(0,0,0,0.85)',
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  logo: {
    width: 250,
    height: 70,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: '#aaa',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    marginTop: 5,
    letterSpacing: 1,
    textAlign: 'center',
  },
  actionGrid: {
    flexDirection: 'column',
    gap: 15,
    marginBottom: 30,
  },
  actionCard: {
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    padding: 25,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 15,
  },
  cardSubtitle: {
    fontSize: 15,
    color: '#aaa',
    marginTop: 5,
  },
  promoSection: {
    backgroundColor: 'rgba(34, 34, 34, 0.7)',
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  promoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  promoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  promoText: {
    fontSize: 15,
    color: '#ccc',
    flex: 1,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 25,
    right: 25,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#d32f2f',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#d32f2f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  fabBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#34d399',
    borderWidth: 2,
    borderColor: '#d32f2f',
  }
});
