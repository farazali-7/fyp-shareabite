import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
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
        if (!storedId) return;

        setUserId(storedId);
        const res = await getCharityNotifications(storedId);
        setNotifications(res || []);
        socket.emit('join_post_room', storedId);
      } catch (err) {
        console.error('Failed to load charity notifications', err);
      }
    };

    loadCharityNotifs();

    const handleAccepted = (data) => {
      setNotifications((prev) => [
        {
          _id: Date.now().toString(),
          type: 'accepted',
          post: { _id: data.postId },
          description: data.message,
          createdAt: new Date(),
        },
        ...prev,
      ]);
    };

    const handleRejected = (data) => {
      setNotifications((prev) => [
        {
          _id: Date.now().toString(),
          type: 'rejected',
          post: { _id: data.postId },
          description: data.message,
          createdAt: new Date(),
        },
        ...prev,
      ]);
    };

    socket.on('request_accepted', handleAccepted);
    socket.on('request_rejected', handleRejected);

    return () => {
      socket.off('request_accepted', handleAccepted);
      socket.off('request_rejected', handleRejected);
    };
  }, []);

  const Separator = () => <View style={styles.separator} />;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.container}>
        <Text style={styles.header}>Notifications</Text>
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <CharityNotificationCard notification={item} />}
          ItemSeparatorComponent={Separator}
          ListEmptyComponent={
            <Text style={styles.empty}>No notifications yet</Text>
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default CharityNotificationScreen;

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
