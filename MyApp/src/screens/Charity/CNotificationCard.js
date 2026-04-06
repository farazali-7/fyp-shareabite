import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const CharityNotificationCard = ({ notification }) => {
  const { post, createdAt, type, description } = notification;
  const isAccepted = type === 'accepted';

  return (
    <View style={styles.row}>
      {/* Status dot indicator */}
      <View style={[styles.iconBadge, isAccepted ? styles.iconAccepted : styles.iconRejected]}>
        <Text style={styles.iconText}>{isAccepted ? '✓' : '✕'}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.title}>
            {isAccepted ? 'Request Accepted' : 'Request Rejected'}
          </Text>
          <Text style={styles.time}>{timeAgo(createdAt)}</Text>
        </View>
        <Text style={styles.body} numberOfLines={2}>
          {description || 'Your food request status has been updated.'}
        </Text>
        {post?.foodType ? (
          <Text style={styles.food}>{post.foodType}{post.quantity ? ` · Qty ${post.quantity}` : ''}</Text>
        ) : null}
      </View>
    </View>
  );
};

export default CharityNotificationCard;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  iconAccepted: {
    backgroundColor: '#E8F1EE',
  },
  iconRejected: {
    backgroundColor: '#FEECEC',
  },
  iconText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
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
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  time: {
    fontSize: 12,
    color: '#ABABAB',
  },
  body: {
    fontSize: 13,
    color: '#6B6B6B',
    lineHeight: 18,
    marginBottom: 4,
  },
  food: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1C1C1E',
  },
});
