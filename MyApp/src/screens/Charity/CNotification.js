import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import socket from '../../../socket';
import { getCharityNotifications } from '../../apis/requestAPI';
import CharityNotificationCard from './CNotificationCard';

const CharityNotificationScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const loadCharityNotifs = async () => {
      try {
        const storedId = await AsyncStorage.getItem('userId');
        setUserId(storedId);

        if (!storedId) return;

        const res = await getCharityNotifications(storedId);
        setNotifications(res || []);

        socket.emit('join_post_room', storedId);
      } catch (err) {
        console.error('Failed to load charity notifications', err);
      }
    };

    loadCharityNotifs();

    socket.on('request_accepted', (data) => {
      const newNotif = {
        _id: Date.now().toString(),
        user: userId,
        type: 'accepted',
        post: { _id: data.postId },
        description: data.message,
        createdAt: new Date(),
      };
      setNotifications((prev) => [newNotif, ...prev]);
    });

    socket.on('request_rejected', (data) => {
      const newNotif = {
        _id: Date.now().toString(),
        user: userId,
        type: 'rejected',
        post: { _id: data.postId },
        description: data.message,
        createdAt: new Date(),
      };
      setNotifications((prev) => [newNotif, ...prev]);
    });

    return () => {
      socket.off('request_accepted');
      socket.off('request_rejected');
    };
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <CharityNotificationCard notification={item} />}
        ListEmptyComponent={
          <Text style={styles.empty}>No notifications yet.</Text>
        }
      />
    </View>
  );
};

export default CharityNotificationScreen;

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
