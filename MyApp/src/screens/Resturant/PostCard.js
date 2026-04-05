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
import ImageViewing from 'react-native-image-viewing';
import { createRequest, checkExistingRequest, cancelRequest } from '../../apis/requestAPI';
import * as Location from 'expo-location';
import socket from '../../../socket';

const PRIMARY   = '#356F59';
const TEXT_DARK = '#1C1C1E';
const TEXT_GREY = '#6B6B6B';
const TEXT_LIGHT = '#ABABAB';
const BORDER    = '#EFEFEF';
const ERROR     = '#D32F2F';

function timeAgo(dateString) {
  const diff = Date.now() - new Date(dateString).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function shortDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function PostCard({ post, currentUserId, currentUserRole }) {
  const [visible,      setVisible]      = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [hasRequested, setHasRequested] = useState(false);

  useEffect(() => {
    Location.requestForegroundPermissionsAsync().then(({ status }) => {
      if (status === 'granted') {
        Location.getCurrentPositionAsync({}).then(loc => setUserLocation(loc.coords));
      }
    });

    checkExistingRequest(post._id, currentUserId)
      .then(res => setHasRequested(res.exists))
      .catch(() => {});
  }, []);

  const isAvailable = () =>
    new Date() <= new Date(post.bestBefore) && post.status !== 'fulfilled';

  const canRequest =
    isAvailable() &&
    currentUserId !== post.createdBy &&
    currentUserRole === 'charity';

  const openMaps = () => {
    if (!userLocation || !post.latitude || !post.longitude) {
      Alert.alert('Location unavailable');
      return;
    }
    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${post.latitude},${post.longitude}&travelmode=driving`;
    Linking.openURL(url);
  };

  const handleRequest = async () => {
    try {
      const payload = { postId: post._id, requesterId: currentUserId, receiverId: post.createdBy };
      await createRequest(payload);
      socket.emit('request_food', payload);
      setHasRequested(true);
    } catch (err) {
      Alert.alert('Error', err.message || 'Request failed');
    }
  };

  const handleCancel = async () => {
    try {
      await cancelRequest({ postId: post._id, requesterId: currentUserId });
      setHasRequested(false);
    } catch (err) {
      Alert.alert('Error', err.message || 'Cancellation failed');
    }
  };

  const hasImages = Array.isArray(post.images) && post.images.length > 0;

  return (
    <View style={styles.row}>
      {/* Thumbnail */}
      <TouchableOpacity
        onPress={() => hasImages && setVisible(true)}
        activeOpacity={hasImages ? 0.8 : 1}
      >
        {hasImages ? (
          <Image source={{ uri: post.images[0] }} style={styles.thumb} />
        ) : (
          <View style={styles.thumbPlaceholder}>
            <Text style={styles.thumbEmoji}>🍱</Text>
          </View>
        )}
      </TouchableOpacity>

      {hasImages && (
        <ImageViewing
          images={post.images.map(uri => ({ uri }))}
          imageIndex={0}
          visible={visible}
          onRequestClose={() => setVisible(false)}
        />
      )}

      {/* Content */}
      <View style={styles.content}>
        {/* Top row */}
        <View style={styles.topRow}>
          <Text style={styles.userName} numberOfLines={1}>{post.userName}</Text>
          <Text style={styles.time}>{timeAgo(post.createdAt)}</Text>
        </View>

        {/* Detail line */}
        <Text style={styles.detail} numberOfLines={1}>
          {post.quantity} meals · {post.foodType}
        </Text>

        {/* Best before */}
        <Text style={styles.expiry}>
          Best before {shortDate(post.bestBefore)}
        </Text>

        {/* Action row */}
        <View style={styles.actionRow}>
          <TouchableOpacity onPress={openMaps} activeOpacity={0.7}>
            <Text style={styles.trackLink}>Track location</Text>
          </TouchableOpacity>

          {post.status === 'fulfilled' ? (
            <Text style={styles.fulfilledBadge}>Fulfilled</Text>
          ) : canRequest ? (
            <TouchableOpacity
              style={[styles.actionBtn, hasRequested && styles.cancelBtn]}
              onPress={hasRequested ? handleCancel : handleRequest}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBtnText}>
                {hasRequested ? 'Cancel' : 'Request'}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    backgroundColor: '#FFFFFF',
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 6,
    backgroundColor: '#F0F0F0',
  },
  thumbPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 6,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbEmoji: {
    fontSize: 26,
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT_DARK,
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
    color: TEXT_LIGHT,
  },
  detail: {
    fontSize: 13,
    color: TEXT_GREY,
    marginBottom: 2,
  },
  expiry: {
    fontSize: 12,
    color: TEXT_LIGHT,
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trackLink: {
    fontSize: 13,
    color: PRIMARY,
    fontWeight: '500',
  },
  actionBtn: {
    backgroundColor: PRIMARY,
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  cancelBtn: {
    backgroundColor: '#E5E5E5',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  fulfilledBadge: {
    fontSize: 12,
    color: TEXT_LIGHT,
    fontWeight: '500',
  },
});
