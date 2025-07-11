import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

const RNotificationCard = ({ notification, onAccept, onReject }) => {
  const { requester, post, createdAt } = notification;
  
  // Format the time (e.g., "2:30 PM")
  const notificationTime = new Date(createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Format the date (e.g., "Jul 11")
  const notificationDate = new Date(createdAt).toLocaleDateString([], {
    month: 'short',
    day: 'numeric'
  });

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          {requester?.profileImage && (
            <Image 
              source={{ uri: requester.profileImage }} 
              style={styles.profileImage}
            />
          )}
          <Text style={styles.requesterName}>
            {requester?.userName || "Unknown User"}
          </Text>
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{notificationTime}</Text>
          <Text style={styles.dateText}>{notificationDate}</Text>
        </View>
      </View>
      
      <Text style={styles.body}>Requested your food post:</Text>
      <Text style={styles.foodDetails}>{post?.foodType} (Quantity: {post?.quantity})</Text>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.acceptBtn}
          onPress={() => onAccept(notification._id)}
        >
          <Text style={styles.btnText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.rejectBtn}
          onPress={() => onReject(notification._id)}
        >
          <Text style={styles.btnText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RNotificationCard;

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
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#f0f0f0', // Fallback color
  },
  requesterName: {
    fontWeight: 'bold',
    fontSize: 16,
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
    color: '#999',
  },
  body: {
    color: '#555',
    marginBottom: 6,
    fontSize: 14,
  },
  foodDetails: {
    color: '#444',
    fontWeight: '600',
    marginBottom: 12,
    fontSize: 15,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  acceptBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  rejectBtn: {
    backgroundColor: '#F44336',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: '500',
  },
});