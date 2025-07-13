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
import {createRequest} from '../../apis/requestAPI'
import ImageViewing from 'react-native-image-viewing';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import socket from '../../../socket'; // Adjust if needed

export default function PostCard({ post, currentUserId, currentUserRole }) {
  const [visible, setVisible] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

/*  console.log(" Current userId:", currentUserId);
console.log(" Current userRole:", currentUserRole);
console.log(" Post createdBy:", post.createdBy);*/

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

  //  Open in Google Maps
  const openGoogleMaps = () => {
    if (!userLocation || !post.latitude || !post.longitude) {
      Alert.alert('Location Error', 'Location data missing.');

      return;
    }

    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${post.latitude},${post.longitude}&travelmode=driving`;
    Linking.openURL(url);
  };

  //  Check if post is available
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
      Alert.alert("Missing Info", "Post or user data is missing.");
      console.warn(" Missing post._id, post.createdBy, or currentUserId", {
        postId: post._id,
        createdBy: post.createdBy,
        currentUserId,
      });
      return;
    }

    console.log(" Sending API request to backend with:", {
      postId: post._id,
      requesterId: currentUserId,
      receiverId: post.createdBy,
    });

    const res = await createRequest({
      postId: post._id,
      requesterId: currentUserId,
      receiverId: post.createdBy,
    });

    console.log(" Request successfully saved in DB:", res);

    socket.emit("request_food", {
      postId: post._id,
      requesterId: currentUserId,
      receiverId: post.createdBy,
    });

    console.log(" Emitted request_food to socket:", {
      postId: post._id,
      requesterId: currentUserId,
      receiverId: post.createdBy,
    });

    Alert.alert("Request Sent", "Your food request has been sent.");
  } catch (err) {
    console.error(" Failed to create food request:", err.response?.data || err.message);
    Alert.alert("Error", "Something went wrong. Please try again.");
  }
};


  return (
    <View style={styles.card}>
      {/*  Post Image */}
      <TouchableOpacity onPress={() => setVisible(true)}>
        <Image
          source={{ uri: `http://192.168.20.131:3003/${post.images[0]}` }}
          style={styles.image}
        />
      </TouchableOpacity>

      <ImageViewing
        images={post.images.map(img => ({
          uri: `http://192.168.20.131:3003/${img}`,
        }))}
        imageIndex={0}
        visible={visible}
        onRequestClose={() => setVisible(false)}
      />

      {/*  Details */}
      <Text style={styles.detail}>User: {post.userName}</Text>
      <Text style={styles.detail}>Food Type: {post.foodType}</Text>
      <Text style={styles.detail}>Quantity: {post.quantity}</Text>
      <Text style={styles.detail}>Best Before: {post.bestBefore}</Text>
      <Text style={styles.detail}>
        Created At: {new Date(post.createdAt).toLocaleString()}
      </Text>

      {/*  Location Button */}
      <TouchableOpacity onPress={openGoogleMaps} style={styles.locationRow}>
        <MaterialIcons name="location-on" size={24} color="red" />
        <Text style={styles.trackText}>Track Location</Text>
      </TouchableOpacity>

      {/*  Request /  Picked */}
      {post.status === 'fulfilled' ? (
        <Text style={styles.pickedText}> Food Picked</Text>
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
