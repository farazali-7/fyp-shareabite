import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : '?');

const RNotificationCard = ({ notification, onAccept, onReject }) => {
  const { requester, post, createdAt, requestStatus } = notification;
  const [localStatus, setLocalStatus] = useState(requestStatus);

  useEffect(() => {
    setLocalStatus(requestStatus);
  }, [requestStatus]);

  return (
    <View style={styles.row}>
      {/* Avatar */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{getInitial(requester?.userName)}</Text>
        {!localStatus && <View style={styles.unreadDot} />}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>
            {requester?.userName || 'Unknown'}
          </Text>
          <Text style={styles.time}>{timeAgo(createdAt)}</Text>
        </View>
        <Text style={styles.body} numberOfLines={2}>
          Requested{' '}
          <Text style={styles.food}>{post?.foodType}</Text>
          {post?.quantity ? ` · Qty ${post.quantity}` : ''}
        </Text>

        {!localStatus || localStatus === 'pending' ? (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.acceptBtn}
              activeOpacity={0.7}
              onPress={() => {
                setLocalStatus('accepted');
                onAccept(notification._id);
              }}
            >
              <Text style={styles.acceptText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.rejectBtn}
              activeOpacity={0.7}
              onPress={() => {
                setLocalStatus('rejected');
                onReject(notification._id);
              }}
            >
              <Text style={styles.rejectText}>Reject</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={[styles.statusLabel, localStatus === 'accepted' ? styles.accepted : styles.rejected]}>
            {localStatus === 'accepted' ? 'Accepted' : 'Rejected'}
          </Text>
        )}
      </View>
    </View>
  );
};

export default RNotificationCard;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F1EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  avatarText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#356F59',
  },
  unreadDot: {
    position: 'absolute',
    top: 1,
    right: 1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#356F59',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
    color: '#ABABAB',
  },
  body: {
    fontSize: 13,
    color: '#6B6B6B',
    lineHeight: 18,
    marginBottom: 8,
  },
  food: {
    fontWeight: '600',
    color: '#1C1C1E',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptBtn: {
    height: 30,
    paddingHorizontal: 16,
    borderRadius: 4,
    backgroundColor: '#356F59',
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#fff',
  },
  rejectBtn: {
    height: 30,
    paddingHorizontal: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#E53935',
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  accepted: {
    color: '#356F59',
  },
  rejected: {
    color: '#E53935',
  },
});
