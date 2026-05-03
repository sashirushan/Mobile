import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform, Animated, Image } from 'react-native';
import axios from 'axios';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../src/config/api';

const HERO_IMAGES = [
  require('../assets/images/hero-car.png'),
  require('../assets/images/hero-car-2.png'),
  require('../assets/images/hero-car-3.png')
];

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Registration fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);

  // Animation values
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim1 = useRef(new Animated.Value(1)).current;
  const fadeAnim2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % HERO_IMAGES.length;
      
      // Crossfade logic
      Animated.timing(fadeAnim2, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();

      Animated.timing(fadeAnim1, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => {
        setCurrentIndex(nextIndex);
        fadeAnim1.setValue(1);
        fadeAnim2.setValue(0);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  const handleSubmit = async () => {
    if (isLogin) {
      if (!username || !password) {
        Alert.alert('Error', 'Please enter both username and password');
        return;
      }
    } else {
      if (!username || !password || !fullName || !email || !phone || !address || !confirmPassword) {
        Alert.alert('Error', 'Please fill in all fields for registration');
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }
    }

    setLoading(true);
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin 
        ? { username, password } 
        : { username, password, fullName, email, phone, address, confirmPassword };
        
      const response = await axios.post(`${API_BASE_URL}${endpoint}`, payload, {
        headers: {
          'Bypass-Tunnel-Reminder': 'true',
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        await AsyncStorage.setItem('token', response.data.token);
        if (response.data.user) {
          await AsyncStorage.setItem('username', response.data.user.username);
          await AsyncStorage.setItem('role', response.data.user.role || 'user');
        }
        router.replace('/(tabs)');
      }
    } catch (error) {
      Alert.alert(
        isLogin ? 'Login Failed' : 'Registration Failed',
        error.response?.data?.message || 'Unable to connect to the server. Please check your network connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setUsername('');
    setPassword('');
    setFullName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setConfirmPassword('');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Background Animation */}
      <View style={StyleSheet.absoluteFillObject}>
        <Animated.Image
          source={HERO_IMAGES[currentIndex]}
          style={[styles.bgImage, { opacity: fadeAnim1 }]}
          resizeMode="cover"
        />
        <Animated.Image
          source={HERO_IMAGES[(currentIndex + 1) % HERO_IMAGES.length]}
          style={[styles.bgImage, { opacity: fadeAnim2 }]}
          resizeMode="cover"
        />
        <View style={styles.overlay} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.brandContainer}>
          <Image 
            source={require('../assets/images/logo.png')} 
            style={styles.logo} 
            resizeMode="contain"
          />
          <Text style={styles.brandTitle}>POWER MEETS</Text>
          <Text style={styles.brandTitle}>PRECISION.</Text>
          <Text style={styles.brandSubtitle}>
            Experience the thrill of speed, design, and technology working seamlessly together.
          </Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>{isLogin ? 'Sign In' : 'Create Account'}</Text>
          
          {!isLogin && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#bbb"
                value={fullName}
                onChangeText={setFullName}
              />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="#bbb"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor="#bbb"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              <TextInput
                style={styles.input}
                placeholder="Address"
                placeholderTextColor="#bbb"
                value={address}
                onChangeText={setAddress}
              />
            </>
          )}
          
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#bbb"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#bbb"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {!isLogin && (
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#bbb"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          )}

          <TouchableOpacity 
            style={styles.button} 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{isLogin ? 'Enter Portal' : 'Register Now'}</Text>
            )}
          </TouchableOpacity>

          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </Text>
            <TouchableOpacity onPress={toggleAuthMode}>
              <Text style={styles.toggleLink}>{isLogin ? 'Register' : 'Sign In'}</Text>
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
    backgroundColor: '#000',
  },
  bgImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  brandContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  logo: {
    width: 250,
    height: 80,
    marginBottom: 20,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
    textAlign: 'center',
  },
  brandSubtitle: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 15,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  formContainer: {
    backgroundColor: 'rgba(20, 20, 20, 0.85)',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    color: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  button: {
    backgroundColor: '#d32f2f', 
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  toggleText: {
    color: '#aaa',
  },
  toggleLink: {
    color: '#d32f2f',
    fontWeight: 'bold',
  }
});
