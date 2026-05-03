import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

export default function VehicleCard({ vehicle, isRental, onPress }) {
  const formatPrice = (price) => {
    if (!price) return '0';
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const getStatusColor = (status) => {
    if (status === 'Booked') return '#ef4444';
    if (status === 'Maintenance') return '#f59e0b';
    return '#34d399'; // Available
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: vehicle.image || 'https://via.placeholder.com/300x200?text=No+Image' }} 
          style={styles.image} 
          resizeMode="cover"
        />
        
        {isRental && vehicle.status ? (
          <View style={[styles.badge, { backgroundColor: getStatusColor(vehicle.status) }]}>
            <Text style={styles.badgeText}>{vehicle.status}</Text>
          </View>
        ) : (
          <View style={[styles.badge, { backgroundColor: '#d32f2f' }]}>
            <Text style={styles.badgeText}>{vehicle.condition || 'Used'}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.details}>
        <Text style={styles.title}>{vehicle.yearOfManufacture} {vehicle.make} {vehicle.model}</Text>
        
        <View style={styles.priceContainer}>
          <Text style={styles.price}>Rs. {formatPrice(isRental ? vehicle.pricePerDay : vehicle.price)}</Text>
          {isRental && <Text style={styles.perDay}> / day</Text>}
        </View>

        <View style={styles.specsRow}>
          {isRental ? (
            <>
              <View style={styles.specBadge}><Text style={styles.specText}>💺 {vehicle.seats} Seats</Text></View>
              <View style={styles.specBadge}><Text style={styles.specText}>⛽ {vehicle.fuelConsumption} km/l</Text></View>
            </>
          ) : (
            <>
              <View style={styles.specBadge}><Text style={styles.specText}>{vehicle.mileage ? formatPrice(vehicle.mileage) : 0} km</Text></View>
            </>
          )}
          <View style={styles.specBadge}><Text style={styles.specText}>{vehicle.transmission}</Text></View>
          <View style={styles.specBadge}><Text style={styles.specText}>{vehicle.fuelType}</Text></View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  imageContainer: {
    position: 'relative',
    height: 200,
    width: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  details: {
    padding: 15,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  price: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
  },
  perDay: {
    color: '#aaa',
    fontSize: 12,
    marginLeft: 4,
  },
  specsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specBadge: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#444'
  },
  specText: {
    color: '#ccc',
    fontSize: 12,
  }
});
