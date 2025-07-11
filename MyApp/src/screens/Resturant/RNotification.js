import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNotificationCard from './NotificationCard';
import { getRequestedNotifications } from '../../apis/requestAPI';
import socket from '../../../socket';

const RNotificationScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [userId, setUserId] = useState(null);
console.log("First line\nSecond line")
console.log(notifications)
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const storedId = await AsyncStorage.getItem('userId');
        console.log("📦 Loaded userId from AsyncStorage:", storedId);

        if (!storedId) {
          console.warn("⚠️ No userId found in AsyncStorage. Are you logged in?");
          return;
        }

        setUserId(storedId);

        console.log("📡 Fetching notifications for userId:", storedId);
        const data = await getRequestedNotifications(storedId);
        console.log("✅ Notifications fetched:", data);

        setNotifications(data || []);
        socket.emit("join_post_room", storedId);
      } catch (error) {
        console.error("❌ Error loading notifications:", error);
      }
    };

    loadNotifications();

    // Real-time socket listener
    const handleNewRequest = (data) => {
      console.log("📨 Real-time notification received:", data);

      const isDuplicate = notifications.some(
        (noti) =>
          noti.post?._id === data.postId &&
          noti.requester?._id === data.requesterId
      );

      if (!isDuplicate) {
        const newNotification = {
          _id: Date.now().toString(),
          user: data.receiverId,
          requester: { name: data.requesterName || "Unknown", _id: data.requesterId },
          post: {
            _id: data.postId,
            foodType: data.foodType,
            quantity: data.quantity,
            createdAt: new Date(),
          },
          createdAt: new Date(),
        };

        console.log("➕ Appending new notification:", newNotification);
        setNotifications((prev) => [newNotification, ...prev]);
      } else {
        console.log("⚠️ Skipped duplicate notification");
      }
    };

    socket.on("new_request", handleNewRequest);

    return () => {
      console.log("🧹 Removing socket listener");
      socket.off("new_request", handleNewRequest);
    };
  }, []);

  const handleAccept = (notificationId) => {
    console.log("✅ Accept clicked for:", notificationId);
    // TODO: Implement accept functionality
  };

  const handleReject = (notificationId) => {
    console.log("❌ Reject clicked for:", notificationId);
    // TODO: Implement reject functionality
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
    marginTop:30,
    flex: 1,
    padding: 12,
    backgroundColor: '#fff',
  },
  empty: {
    textAlign: 'center',
    marginTop: 30,
    color: '#999',
  },
});
