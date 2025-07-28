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
import { MaterialIcons } from '@expo/vector-icons';
import ImageViewing from 'react-native-image-viewing';
import { createRequest } from '../../apis/requestAPI';
import * as Location from 'expo-location';
import socket from '../../../socket';

export default function PostCard({ post, currentUserId, currentUserRole }) {
  const [visible, setVisible] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setUserLocation(loc.coords);
    })();
  }, []);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

  const formatShortDate = (dateString) =>
    new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

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
      const payload = {
        postId: post._id,
        requesterId: currentUserId,
        receiverId: post.createdBy,
      };
      await createRequest(payload);
      socket.emit('request_food', payload);
      Alert.alert('Request Sent', 'Your food request has been sent.');
    } catch (err) {
      Alert.alert('Error', err.message || 'Request failed');
    }
  };

  const hasImages = Array.isArray(post.images) && post.images.length > 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.userName}>{post.userName}</Text>
        <Text style={styles.timestamp}>{formatDate(post.createdAt)}</Text>
      </View>

      {hasImages && (
        <TouchableOpacity onPress={() => setVisible(true)}>
          <Image source={{ uri: post.images[0] }} style={styles.image} />
          <ImageViewing
            images={post.images.map((uri) => ({ uri }))}
            imageIndex={0}
            visible={visible}
            onRequestClose={() => setVisible(false)}
          />
        </TouchableOpacity>
      )}

      <Text style={styles.detail}>
        {post.quantity} {post.foodType} meals | Best before: {formatShortDate(post.bestBefore)}
      </Text>

      {post.description && (
        <Text style={styles.description}>Details: {post.description}</Text>
      )}

      <View style={styles.actionRow}>
        <TouchableOpacity onPress={openGoogleMaps} style={styles.locationRow}>
          <MaterialIcons name="location-on" size={20} color="red" />
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    marginVertical: 12,
    marginHorizontal:20,
    padding: 20,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#356F59',
    shadowColor: '#1E4635',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    color: '#356F59',
    fontSize: 18,
    fontWeight: '600',
  },
  timestamp: {
    color: 'black',
    fontSize: 13,
  },

  image: {
    height: 200,
    width: '100%',
    borderRadius: 12,
    marginVertical: 1,
    resizeMode: 'cover',
    backgroundColor: '#E0E0E0',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },

  detail: {
    fontSize: 15,
    marginVertical: 2,
    color: 'black',
    lineHeight: 22,
  },

  description: {
    marginTop: 0,
    paddingTop:6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    color: 'black',
    fontSize: 15,
    lineHeight: 18,
    fontStyle: 'italic',
  },

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackText: {
    marginLeft: 4,
    color: '#0080ff',
    fontWeight: '600',
    fontSize: 15,
    textDecorationLine: 'underline',
  },

  requestButton: {
    backgroundColor: '#00b300',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  requestText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.5,
  },

  pickedText: {
    color: 'red',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 18,
    textDecorationLine: 'line-through',
  },
});
