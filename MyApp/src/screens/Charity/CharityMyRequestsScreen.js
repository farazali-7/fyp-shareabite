import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getMyRequests } from '../../apis/postAPI';
import { createChat } from '../../apis/chatAPI';
import socket from '../../../socket';

const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const STATUS_CONFIG = {
  pending:  { dot: '#ABABAB', label: 'Pending',     labelStyle: 'labelPending' },
  accepted: { dot: '#356F59', label: 'Accepted',    labelStyle: 'labelAccepted' },
  rejected: { dot: null,      label: 'Unavailable', labelStyle: 'labelUnavailable' },
};

const RequestRow = ({ item, onMessageDonor, onBrowseFood }) => {
  const { post, status, createdAt, donorId } = item;
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const foodLabel = post?.foodType || 'Food post';
  const donorName = post?.createdBy?.userName || 'Donor';

  return (
    <View style={styles.row}>
      {/* Status icon */}
      <View style={[
        styles.iconBadge,
        status === 'accepted' ? styles.iconAccepted
          : status === 'rejected' ? styles.iconRejected
          : styles.iconPending,
      ]}>
        <Text style={styles.iconText}>
          {status === 'accepted' ? '✓' : status === 'rejected' ? '✕' : '·'}
        </Text>
      </View>

      <View style={styles.rowContent}>
        <View style={styles.rowTop}>
          <Text style={styles.foodName} numberOfLines={1}>{foodLabel}</Text>
          <Text style={styles.timeText}>{timeAgo(createdAt)}</Text>
        </View>

        <Text style={styles.donorText}>
          {post?.area ? `${post.area}  ·  ` : ''}{donorName}
        </Text>

        <View style={styles.rowBottom}>
          {config.dot && (
            <View style={[styles.dot, { backgroundColor: config.dot }]} />
          )}
          <Text style={[styles.statusLabel, styles[config.labelStyle]]}>
            {config.label}
          </Text>

          {status === 'accepted' && (
            <TouchableOpacity
              style={styles.inlineBtn}
              onPress={() => onMessageDonor(donorId, donorName)}
            >
              <Text style={styles.inlineBtnText}>Message Donor</Text>
            </TouchableOpacity>
          )}

          {status === 'rejected' && (
            <TouchableOpacity onPress={onBrowseFood}>
              <Text style={styles.browseLink}>Browse Food</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const Separator = () => <View style={styles.separator} />;

export default function CharityMyRequestsScreen() {
  const navigation = useNavigation();
  const [requests, setRequests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getMyRequests();
      setRequests(data.requests || []);
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();

      const handleNotif = (data) => {
        if (data.type === 'accepted' || data.type === 'rejected') load();
      };
      socket.on('charity_notification', handleNotif);
      return () => socket.off('charity_notification', handleNotif);
    }, [load])
  );

  const handleMessageDonor = async (donorId, donorName) => {
    try {
      const chat = await createChat(donorId);
      navigation.navigate('CharityChat', {
        chatId: chat._id || chat.chat?._id,
        recipientName: donorName,
      });
    } catch (err) {
      console.error('Failed to open chat:', err);
    }
  };

  const handleBrowseFood = () => {
    navigation.navigate('Food');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <FlatList
        data={requests}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <RequestRow
            item={item}
            onMessageDonor={handleMessageDonor}
            onBrowseFood={handleBrowseFood}
          />
        )}
        ItemSeparatorComponent={Separator}
        ListHeaderComponent={
          <Text style={styles.screenTitle}>My Requests</Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No requests yet.</Text>
            <Text style={styles.emptyHint}>
              Browse available food and tap Request to get started.
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(); }}
            tintColor="#356F59"
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C1C1E',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'flex-start',
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  iconAccepted: { backgroundColor: '#E8F1EE' },
  iconRejected: { backgroundColor: '#FEECEC' },
  iconPending:  { backgroundColor: '#F6F6F6' },
  iconText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  rowContent: { flex: 1 },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  foodName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#ABABAB',
  },
  donorText: {
    fontSize: 13,
    color: '#6B6B6B',
    marginBottom: 6,
  },
  rowBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  labelPending:     { color: '#ABABAB' },
  labelAccepted:    { color: '#356F59' },
  labelUnavailable: { color: '#ABABAB' },
  inlineBtn: {
    marginLeft: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#356F59',
  },
  inlineBtnText: {
    fontSize: 13,
    color: '#356F59',
    fontWeight: '500',
  },
  browseLink: {
    fontSize: 13,
    color: '#356F59',
    marginLeft: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginLeft: 68,
  },
  emptyWrap: {
    paddingTop: 64,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 15,
    color: '#1C1C1E',
    fontWeight: '500',
    marginBottom: 6,
  },
  emptyHint: {
    fontSize: 13,
    color: '#ABABAB',
    textAlign: 'center',
    lineHeight: 20,
  },
});
