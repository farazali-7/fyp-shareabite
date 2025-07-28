import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const CharityNotificationCard = ({ notification }) => {
  const { post, createdAt, type, description } = notification;
  const [status, setStatus] = useState(type);

  useEffect(() => {
    setStatus(type);
  }, [type]);

  const dateObj = new Date(createdAt);
  const notificationDate = dateObj.toLocaleDateString();
  const notificationTime = dateObj.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {status === 'accepted' ? ' Request Accepted' : ' Request Rejected'}
        </Text>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{notificationTime}</Text>
          <Text style={styles.dateText}>{notificationDate}</Text>
        </View>
      </View>

      <Text style={styles.body}>{description || 'Your food request status has been updated.'}</Text>
      <Text style={styles.foodDetails}>
        {post?.foodType} (Qty: {post?.quantity})
      </Text>

      <Text
        style={[
          styles.statusText,
          { color: status === 'accepted' ? 'green' : 'red' },
        ]}
      >
        {status === 'accepted' ? ' Accepted' : ' Rejected'}
      </Text>
    </View>
  );
};

export default CharityNotificationCard;

const styles = StyleSheet.create({
  card: {
    padding: 16,
    backgroundColor: '#fff',
    marginVertical: 8,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#333',
  },
  timeContainer: {
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  dateText: {
    fontSize: 12,
    color: 'black',
  },
  body: {
    fontSize: 14,
    color: 'black',
    marginBottom: 3,
  },
  foodDetails: {
    fontSize: 15,
    fontWeight: '600',
    color: '#444',
  },
  statusText: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
