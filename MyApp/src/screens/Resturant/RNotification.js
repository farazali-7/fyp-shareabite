 import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNotificationCard from './NotificationCard';
import { getRequestedNotifications , acceptRequest , rejectRequest} from '../../apis/requestAPI';
import socket from '../../../socket';
import { Alert } from 'react-native';

const RNotificationScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [userId, setUserId] = useState(null);
  console.log(notifications)


  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const storedId = await AsyncStorage.getItem('userId');
        console.log(" Loaded userId from AsyncStorage:", storedId);

        if (!storedId) {
          console.warn(" No userId found in AsyncStorage. Are you logged in?");
          return;
        }

        setUserId(storedId);

        console.log(" Fetching notifications for userId:", storedId);
        const data = await getRequestedNotifications(storedId);
        //  console.log(" Notifications fetched:", data);

        setNotifications(data || []);
        socket.emit("join_post_room", storedId);
      } catch (error) {
        console.error(" Error loading notifications:", error);
      }
    };

    loadNotifications();

    // Real-time socket listener
    const handleNewRequest = (data) => {
      // console.log(" Real-time notification received:", data);

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

       // console.log(" Appending new notification:", newNotification);
        setNotifications((prev) => [newNotification, ...prev]);
      } else {
        console.log(" Skipped duplicate notification");
      }
    };

    socket.on("new_request", handleNewRequest);

    return () => {
      console.log(" Removing socket listener");
      socket.off("new_request", handleNewRequest);
    };
  }, []);


  const handleAccept = async (notificationId) => {
    const acceptedNoti = notifications.find(n => n._id === notificationId);
    if (!acceptedNoti) return;
console.log("Post id ",acceptedNoti.post._id)
console.log("Requester ID" ,acceptedNoti.requester._id )
    try {
      const res = await acceptRequest({
        notificationId,
        postId: acceptedNoti.post._id,
        requesterId: acceptedNoti.requester._id,
      });

      // Update state: mark accepted, reject others of same post
      const updated = notifications.map((n) => {
        if (n._id === notificationId) {
          return { ...n, status: 'accepted' };
        } else if (n.post._id === acceptedNoti.post._id) {
          return { ...n, status: 'rejected' };
        }
        return n;
      });

      setNotifications(updated);
      Alert.alert("Accepted", "You have accepted this request. All others are rejected.");
    } catch (err) {
      console.error("Accept failed:", err.message);
      Alert.alert("Error", "Could not accept request.");
    }
  };

  const handleReject = async (notificationId) => {
    const noti = notifications.find(n => n._id === notificationId);
    if (!noti) return;
console.log("Rejected -Post id ",noti.post._id)
console.log("Rejeted -requester id ",noti.post._id)

    try {
      const res = await rejectRequest({
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
