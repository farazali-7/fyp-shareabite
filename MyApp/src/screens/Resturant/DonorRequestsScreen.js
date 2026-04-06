import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getMyPostRequests } from '../../apis/postAPI';
import { acceptRequest, rejectRequest } from '../../apis/requestAPI';
import { undoAcceptPost } from '../../apis/postAPI';
import socket from '../../../socket';

const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : '?');

export default function DonorRequestsScreen() {
  const navigation = useNavigation();
  const [postGroups, setPostGroups] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [undoBanner, setUndoBanner] = useState(null); // { postId, charityName, timerId }
  const undoTimerRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const data = await getMyPostRequests();
      setPostGroups(data.posts || []);
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();

      const handleNewRequest = () => load();
      socket.on('new_request', handleNewRequest);
      return () => socket.off('new_request', handleNewRequest);
    }, [load])
  );

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    };
  }, []);

  const handleAccept = async (postId, requesterId, notificationId, charityName) => {
    try {
      await acceptRequest({ postId, requesterId, notificationId });
      load();

      // Show undo banner for 5 minutes
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      const timerId = setTimeout(() => setUndoBanner(null), 300000);
      undoTimerRef.current = timerId;
      setUndoBanner({ postId, charityName });
    } catch {
      Alert.alert('Error', 'Could not accept request.');
    }
  };

  const handleReject = async (postId, requesterId, notificationId) => {
    try {
      await rejectRequest({ postId, requesterId, notificationId });
      load();
    } catch {
      Alert.alert('Error', 'Could not reject request.');
    }
  };

  const handleUndo = async () => {
    if (!undoBanner) return;
    try {
      await undoAcceptPost(undoBanner.postId);
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      setUndoBanner(null);
      load();
    } catch {
      Alert.alert('Error', 'Undo period has expired.');
    }
  };

  const handleMessageCharity = (requesterId) => {
    navigation.navigate('DonorChatSearch');
  };

  const Separator = () => <View style={styles.separator} />;

  const renderRequest = (req, postId) => {
    const { _id, requester, status, createdAt, notificationId } = req;
    const requesterId = requester?._id;
    const charityName = requester?.userName || 'Unknown';

    return (
      <View key={_id} style={styles.requestRow}>
        <View style={styles.avatarSmall}>
          <Text style={styles.avatarSmallText}>{getInitial(charityName)}</Text>
        </View>
        <View style={styles.requestContent}>
          <View style={styles.requestTopRow}>
            <Text style={styles.charityName}>{charityName}</Text>
            <Text style={styles.reqTime}>{timeAgo(createdAt)}</Text>
          </View>

          {status === 'pending' && (
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.acceptBtn}
                onPress={() => handleAccept(postId, requesterId, notificationId, charityName)}
              >
                <Text style={styles.acceptText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.declineBtn}
                onPress={() => handleReject(postId, requesterId, notificationId)}
              >
                <Text style={styles.declineText}>Decline</Text>
              </TouchableOpacity>
            </View>
          )}

          {status === 'accepted' && (
            <View style={styles.actionRow}>
              <Text style={styles.statusAccepted}>Accepted</Text>
              <TouchableOpacity
                style={styles.msgBtn}
                onPress={() => handleMessageCharity(requesterId)}
              >
                <Text style={styles.msgText}>Message</Text>
              </TouchableOpacity>
            </View>
          )}

          {status === 'rejected' && (
            <Text style={styles.statusUnavailable}>Declined</Text>
          )}
        </View>
      </View>
    );
  };

  const renderPostGroup = ({ item }) => {
    const { post, requests } = item;
    if (!requests || requests.length === 0) return null;

    return (
      <View style={styles.postGroup}>
        <View style={styles.postGroupHeader}>
          <Text style={styles.postGroupTitle}>{post.foodType}</Text>
          <Text style={styles.postGroupMeta}>
            {post.quantity} {post.quantityUnit || 'servings'}
            {post.area ? `  ·  ${post.area}` : ''}
          </Text>
        </View>
        {requests.map(req => renderRequest(req, post._id))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {undoBanner && (
        <View style={styles.undoBanner}>
          <Text style={styles.undoBannerText}>
            Accepted {undoBanner.charityName}.
          </Text>
          <TouchableOpacity onPress={handleUndo}>
            <Text style={styles.undoBannerUndo}>Undo</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={postGroups.filter(g => g.requests && g.requests.length > 0)}
        keyExtractor={(item) => item.post._id}
        renderItem={renderPostGroup}
        ItemSeparatorComponent={() => <View style={styles.groupSeparator} />}
        ListHeaderComponent={
          <Text style={styles.screenTitle}>Requests</Text>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No pending requests.</Text>
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
  undoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  undoBannerText: {
    fontSize: 14,
    color: '#fff',
  },
  undoBannerUndo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#356F59',
  },
  postGroup: {
    paddingBottom: 4,
  },
  postGroupHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  postGroupTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B6B6B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  postGroupMeta: {
    fontSize: 12,
    color: '#ABABAB',
  },
  requestRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  avatarSmall: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E8F1EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarSmallText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#356F59',
  },
  requestContent: { flex: 1 },
  requestTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  charityName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  reqTime: {
    fontSize: 12,
    color: '#ABABAB',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  declineBtn: {
    height: 30,
    paddingHorizontal: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineText: {
    fontSize: 13,
    color: '#ABABAB',
  },
  statusAccepted: {
    fontSize: 13,
    fontWeight: '500',
    color: '#356F59',
    marginRight: 8,
  },
  statusUnavailable: {
    fontSize: 13,
    color: '#ABABAB',
  },
  msgBtn: {
    height: 30,
    paddingHorizontal: 14,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#356F59',
    alignItems: 'center',
    justifyContent: 'center',
  },
  msgText: {
    fontSize: 13,
    color: '#356F59',
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginLeft: 66,
  },
  groupSeparator: {
    height: 8,
    backgroundColor: '#F6F6F6',
  },
  emptyText: {
    textAlign: 'center',
    color: '#ABABAB',
    fontSize: 14,
    marginTop: 48,
  },
});
