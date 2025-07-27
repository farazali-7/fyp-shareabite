import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { createRequest } from '../../apis/requestAPI';
import ImageViewing from 'react-native-image-viewing';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import socket from '../../../socket';

export default function PostCard({ post, currentUserId, currentUserRole }) {
  const [visible, setVisible] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.');
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
      setUserLocation(coords);
    })();
  }, []);

  const openGoogleMaps = () => {
    if (!userLocation || !post.latitude || !post.longitude) {
      Alert.alert('Location Error', 'Location data missing.');
      return;
    }
    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${post.latitude},${post.longitude}&travelmode=driving`;
    Linking.openURL(url);
  };

  const isAvailable = () => {
    const today = new Date();
    const bestBefore = new Date(post.bestBefore);
    return today <= bestBefore && post.status !== 'fulfilled';
  };

  const canRequest =
    isAvailable() &&
    currentUserId !== post.createdBy &&
    currentUserRole === 'charity';

  const handleRequest = async () => {
    try {
      if (!post._id || !post.createdBy || !currentUserId) {
        Alert.alert('Missing Info', 'Post or user data is missing.');
        return;
      }

      const payload = {
        postId: post._id,
        requesterId: currentUserId,
        receiverId: post.createdBy,
      };

      await createRequest(payload);
      socket.emit('request_food', payload);
      Alert.alert('Request Sent', 'Your food request has been sent.');
    } catch (err) {
      Alert.alert('Error', 'You already requested this post.');
    }
  };

  const hasImages = Array.isArray(post.images) && post.images.length > 0;

  return (
    <View style={styles.card}>
      {hasImages && (
        <TouchableOpacity onPress={() => setVisible(true)}>
          <Image source={{ uri: post.images[0] }} style={styles.image} />
        </TouchableOpacity>
      )}

      {hasImages && (
        <ImageViewing
          images={post.images.map((uri) => ({ uri }))}
          imageIndex={0}
          visible={visible}
          onRequestClose={() => setVisible(false)}
        />
      )}

      <Text style={styles.detail}>User: {post.userName}</Text>
      <Text style={styles.detail}>Food Type: {post.foodType}</Text>
      <Text style={styles.detail}>Quantity: {post.quantity}</Text>
      <Text style={styles.detail}>Best Before: {post.bestBefore}</Text>
      <Text style={styles.detail}>
        Created At: {new Date(post.createdAt).toLocaleString()}
      </Text>

      <TouchableOpacity onPress={openGoogleMaps} style={styles.locationRow}>
        <MaterialIcons name="location-on" size={24} color="red" />
        <Text style={styles.trackText}>Track Location</Text>
      </TouchableOpacity>

      {post.status === 'fulfilled' ? (
        <Text style={styles.pickedText}>Food Picked</Text>
      ) : (
        canRequest && (
          <TouchableOpacity style={styles.requestButton} onPress={handleRequest}>
            <Text style={styles.requestText}>Request Food</Text>
          </TouchableOpacity>
        )
      )}

      <Text style={styles.description}>{post.description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    margin: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  image: {
    height: 180,
    width: '100%',
    borderRadius: 8,
    marginVertical: 10,
  },
  detail: {
    fontSize: 14,
    marginVertical: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  trackText: {
    marginLeft: 6,
    color: '#1e88e5',
    fontWeight: '600',
  },
  description: {
    marginTop: 6,
    fontStyle: 'italic',
    color: '#555',
  },
  requestButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  requestText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  pickedText: {
    marginTop: 10,
    color: '#d9534f',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});
