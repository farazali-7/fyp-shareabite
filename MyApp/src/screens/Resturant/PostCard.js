import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking, Alert } from 'react-native';
import ImageViewing from 'react-native-image-viewing';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';

export default function PostCard({ post, currentUserId }) {
  const [visible, setVisible] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      let loc = await Location.getCurrentPositionAsync({});
      setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    })();
  }, []);

  const openGoogleMaps = () => {
    if (!userLocation) {
      Alert.alert('Location not ready', 'Please wait for location to load.');
      return;
    }

    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${post.latitude},${post.longitude}&travelmode=driving`;
    Linking.openURL(url);
  };

  //check if post is still available
  const isAvailable = () => {
    const today = new Date();
    const bestBefore = new Date(post.bestBefore);
    return today <= bestBefore;
  };

  const canRequest = isAvailable() && currentUserId !== post.createdBy;

  return (
    <View style={styles.card}>
      {/* Image Section */}
      <TouchableOpacity onPress={() => setVisible(true)}>
        <Image source={{ uri: `http://192.168.20.131:3003/${post.images[0]}` }} style={styles.image} />
      </TouchableOpacity>

      <ImageViewing
        images={post.images.map(img => ({ uri: `http://192.168.20.131:3003/${img}` }))}
        imageIndex={0}
        visible={visible}
        onRequestClose={() => setVisible(false)}
      />

<Text style={styles.detail}>Food Type: {post.userName}</Text>

      <Text style={styles.detail}>Food Type: {post.foodType}</Text>
      <Text style={styles.detail}>Quantity: {post.quantity}</Text>
      <Text style={styles.detail}>Best Before: {post.bestBefore}</Text>
      <Text style={styles.detail}>Created At: {new Date(post.createdAt).toLocaleString()}</Text>

      <TouchableOpacity onPress={openGoogleMaps} style={styles.locationRow}>
        <MaterialIcons name="location-on" size={24} color="red" />
        <Text style={styles.trackText}>Track Location</Text>
      </TouchableOpacity>

      {canRequest && (
        <TouchableOpacity style={styles.requestButton}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Request Food</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.description}>{post.description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', margin: 12, padding: 16, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, elevation: 4 },
  image: { height: 180, width: '100%', borderRadius: 8, marginVertical: 10 },
  detail: { fontSize: 14, marginVertical: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  trackText: { marginLeft: 6, color: '#1e88e5', fontWeight: '600' },
  description: { marginTop: 6, fontStyle: 'italic', color: '#555' },
  requestButton: { backgroundColor: '#28a745', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 10 },
});
