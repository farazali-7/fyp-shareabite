import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNotificationCard from './NotificationCard';
import { getRequestedNotifications, acceptRequest, rejectRequest } from '../../apis/requestAPI';
import socket from '../../../socket';

const RNotificationScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const storedId = await AsyncStorage.getItem('userId');
        if (!storedId) {
          console.warn("No userId found in AsyncStorage.");
          return;
        }

        setUserId(storedId);
        const data = await getRequestedNotifications(storedId);
        setNotifications(data || []);
        socket.emit("join_post_room", storedId);
      } catch (error) {
        console.error("Error loading notifications:", error);
      }
    };

    loadNotifications();

    // Socket listener for real-time requests
    const handleNewRequest = (data) => {
      const isDuplicate = notifications.some(
        (noti) =>
          noti.post?._id === data.postId &&
          noti.requester?._id === data.requesterId
      );

      if (isDuplicate) return;

      const newNotification = {
        _id: Date.now().toString(),
        user: data.receiverId,
        requester: {
          _id: data.requesterId,
          userName: data.requesterName || "Charity",
        },
        post: {
          _id: data.postId,
          foodType: data.foodType || "Unknown",
          quantity: data.quantity || 1,
          createdAt: new Date(),
        },
        createdAt: new Date(),
      };

      setNotifications((prev) => [newNotification, ...prev]);
    };

    socket.on("new_request", handleNewRequest);

    return () => {
      socket.off("new_request", handleNewRequest);
    };
  }, []);

  const handleAccept = async (notificationId) => {
    const acceptedNoti = notifications.find(n => n._id === notificationId);
    if (!acceptedNoti) return;

    try {
      await acceptRequest({
        notificationId,
        postId: acceptedNoti.post._id,
        requesterId: acceptedNoti.requester._id,
      });

      const updated = notifications.map((n) => {
        if (n._id === notificationId) {
          return { ...n, status: 'accepted' };
        } else if (n.post._id === acceptedNoti.post._id) {
          return { ...n, status: 'rejected' };
        }
        return n;
      });

      setNotifications(updated);
      Alert.alert("Accepted", "You have accepted this request.");
    } catch (err) {
      console.error("Accept failed:", err.message);
      Alert.alert("Error", "Could not accept request.");
    }
  };

  const handleReject = async (notificationId) => {
    const noti = notifications.find(n => n._id === notificationId);
    if (!noti) return;

    try {
      await rejectRequest({
        notificationId,
        postId: noti.post._id,
        requesterId: noti.requester._id,
      });

      const updated = notifications.map((n) =>
        n._id === notificationId ? { ...n, status: 'rejected' } : n
      );

      setNotifications(updated);
      Alert.alert("Rejected", "Request has been rejected.");
    } catch (err) {
      console.error("Reject failed:", err.message);
      Alert.alert("Error", "Could not reject request.");
    }
  };

  return (
    <View style={styles.container}>
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
        ListEmptyComponent={
          <Text style={styles.empty}>No notifications yet.</Text>
        }
      />
    </View>
  );
};

export default RNotificationScreen;

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    flex: 1,
    padding: 12,
    backgroundColor: '#356F59',
  },
  empty: {
    textAlign: 'center',
    marginTop: 30,
    color: '#999',
  },
});
