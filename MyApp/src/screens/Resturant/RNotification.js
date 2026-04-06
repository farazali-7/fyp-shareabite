import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNotificationCard from './NotificationCard';
import { getRequestedNotifications, acceptRequest, rejectRequest } from '../../apis/requestAPI';
import socket from '../../../socket';

const RNotificationScreen = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const storedId = await AsyncStorage.getItem('userId');
        if (!storedId) return;

        const data = await getRequestedNotifications(storedId);
        setNotifications(data || []);
        socket.emit('join_post_room', storedId);
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    };

    loadNotifications();

    const handleNewRequest = (data) => {
      setNotifications((prev) => {
        const isDuplicate = prev.some(
          (n) => n.post?._id === data.postId && n.requester?._id === data.requesterId
        );
        if (isDuplicate) return prev;

        const newNotification = {
          _id: Date.now().toString(),
          user: data.receiverId,
          requester: {
            _id: data.requesterId,
            userName: data.requesterName || 'Charity',
          },
          post: {
            _id: data.postId,
            foodType: data.foodType || 'Unknown',
            quantity: data.quantity || 1,
            createdAt: new Date(),
          },
          createdAt: new Date(),
        };
        return [newNotification, ...prev];
      });
    };

    socket.on('new_request', handleNewRequest);
    return () => socket.off('new_request', handleNewRequest);
  }, []);

  const handleAccept = async (notificationId) => {
    const acceptedNoti = notifications.find((n) => n._id === notificationId);
    if (!acceptedNoti) return;

    try {
      await acceptRequest({
        notificationId,
        postId: acceptedNoti.post._id,
        requesterId: acceptedNoti.requester._id,
      });

      setNotifications((prev) =>
        prev.map((n) => {
          if (n._id === notificationId) return { ...n, requestStatus: 'accepted' };
          if (n.post._id === acceptedNoti.post._id) return { ...n, requestStatus: 'rejected' };
          return n;
        })
      );
    } catch (err) {
      console.error('Accept failed:', err.message);
      Alert.alert('Error', 'Could not accept request.');
    }
  };

  const handleReject = async (notificationId) => {
    const noti = notifications.find((n) => n._id === notificationId);
    if (!noti) return;

    try {
      await rejectRequest({
        notificationId,
        postId: noti.post._id,
        requesterId: noti.requester._id,
      });

      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, requestStatus: 'rejected' } : n))
      );
    } catch (err) {
      console.error('Reject failed:', err.message);
      Alert.alert('Error', 'Could not reject request.');
    }
  };

  const Separator = () => <View style={styles.separator} />;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.container}>
        <Text style={styles.header}>Notifications</Text>
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <RNotificationCard
              notification={item}
              onAccept={handleAccept}
              onReject={handleReject}
            />
          )}
          ItemSeparatorComponent={Separator}
          ListEmptyComponent={
            <Text style={styles.empty}>No notifications yet</Text>
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default RNotificationScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C1C1E',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  separator: {
    height: 1,
    backgroundColor: '#EFEFEF',
    marginLeft: 72,
  },
  empty: {
    textAlign: 'center',
    color: '#ABABAB',
    fontSize: 14,
    marginTop: 48,
  },
});
