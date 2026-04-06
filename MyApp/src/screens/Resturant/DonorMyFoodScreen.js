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
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getUserProfile } from '../../apis/userAPI';
import { fulfillPost, cancelPost } from '../../apis/postAPI';

const timeRemaining = (bestBefore) => {
  const diff = new Date(bestBefore) - new Date();
  if (diff <= 0) return 'Expired';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return `${h}h ${m}m left`;
  return `${m}m left`;
};

const isExpiringSoon = (bestBefore) => {
  const diff = new Date(bestBefore) - new Date();
  return diff > 0 && diff <= 7200000;
};

const STATUS_DOT = { active: '#ABABAB', accepted: '#356F59', available: '#ABABAB' };
const STATUS_LABEL = { active: 'Active', accepted: 'Accepted', available: 'Active' };

const PostRow = ({ post, onMarkFulfilled, onCancel }) => {
  const navigation = useNavigation();
  const soon = isExpiringSoon(post.bestBefore);
  const status = post.status;

  return (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('EditPostScreen', { post })}
    >
      <View style={styles.rowLeft}>
        <Text style={styles.foodType}>{post.foodType}</Text>
        <Text style={styles.meta}>
          {post.quantity} {post.quantityUnit || 'servings'}
          {post.area ? `  ·  ${post.area}` : ''}
        </Text>
        <Text style={[styles.timeText, soon && styles.timeUrgent]}>
          {timeRemaining(post.bestBefore)}
        </Text>
      </View>
      <View style={styles.rowRight}>
        <View style={styles.statusRow}>
          <View style={[styles.dot, { backgroundColor: STATUS_DOT[status] || '#ABABAB' }]} />
          <Text style={styles.statusLabel}>{STATUS_LABEL[status] || status}</Text>
        </View>
        {status === 'accepted' && (
          <TouchableOpacity
            style={styles.fulfillBtn}
            onPress={() => onMarkFulfilled(post._id)}
          >
            <Text style={styles.fulfillText}>Picked up</Text>
          </TouchableOpacity>
        )}
        {(status === 'active' || status === 'available') && (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => onCancel(post._id)}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function DonorMyFoodScreen() {
  const navigation = useNavigation();
  const [activePosts, setActivePosts] = useState([]);
  const [pastPosts, setPastPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showPast, setShowPast] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getUserProfile();
      const posts = data.posts || [];
      const active = posts.filter(p => ['active', 'available', 'accepted'].includes(p.status));
      const past = posts.filter(p => ['fulfilled', 'expired', 'cancelled'].includes(p.status));

      active.sort((a, b) => {
        const aExpiring = isExpiringSoon(a.bestBefore);
        const bExpiring = isExpiringSoon(b.bestBefore);
        if (aExpiring && !bExpiring) return -1;
        if (!aExpiring && bExpiring) return 1;
        return new Date(a.bestBefore) - new Date(b.bestBefore);
      });

      setActivePosts(active);
      setPastPosts(past);
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleMarkFulfilled = (postId) => {
    Alert.alert('Confirm pickup', 'Mark this food as picked up?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes, picked up',
        onPress: async () => {
          try {
            await fulfillPost(postId);
            load();
          } catch {
            Alert.alert('Error', 'Could not mark as fulfilled.');
          }
        },
      },
    ]);
  };

  const handleCancel = (postId) => {
    Alert.alert('Cancel post', 'Remove this post? Pending requesters will be notified.', [
      { text: 'Keep it', style: 'cancel' },
      {
        text: 'Cancel post',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelPost(postId);
            load();
          } catch {
            Alert.alert('Error', 'Could not cancel post.');
          }
        },
      },
    ]);
  };

  const Separator = () => <View style={styles.separator} />;

  const ListHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>My Food</Text>
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => navigation.navigate('PostForm')}
      >
        <Text style={styles.addBtnText}>+ Add Food</Text>
      </TouchableOpacity>
    </View>
  );

  const EmptyActive = () => (
    <View style={styles.emptyWrap}>
      <Text style={styles.emptyText}>No active posts.</Text>
      <Text style={styles.emptyHint}>Tap "+ Add Food" to share food with charities.</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <FlatList
        data={activePosts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <PostRow
            post={item}
            onMarkFulfilled={handleMarkFulfilled}
            onCancel={handleCancel}
          />
        )}
        ItemSeparatorComponent={Separator}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={EmptyActive}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(); }}
            tintColor="#356F59"
          />
        }
        ListFooterComponent={
          pastPosts.length > 0 ? (
            <View>
              <TouchableOpacity
                style={styles.pastToggle}
                onPress={() => setShowPast(v => !v)}
              >
                <Text style={styles.pastToggleText}>
                  {showPast ? 'Hide past posts' : `Past posts (${pastPosts.length})`}
                </Text>
              </TouchableOpacity>
              {showPast && pastPosts.map((post, i) => (
                <View key={post._id}>
                  <View style={styles.pastRow}>
                    <Text style={styles.pastFoodType}>{post.foodType}</Text>
                    <Text style={styles.pastStatus}>{post.status}</Text>
                  </View>
                  {i < pastPosts.length - 1 && <View style={styles.separator} />}
                </View>
              ))}
              <View style={{ height: 24 }} />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  addBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
    backgroundColor: '#356F59',
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'flex-start',
  },
  rowLeft: { flex: 1, marginRight: 12 },
  rowRight: { alignItems: 'flex-end', minWidth: 80 },
  foodType: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  meta: {
    fontSize: 13,
    color: '#6B6B6B',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#ABABAB',
  },
  timeUrgent: {
    color: '#E08B00',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 5,
  },
  statusLabel: {
    fontSize: 12,
    color: '#6B6B6B',
  },
  fulfillBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    backgroundColor: '#356F59',
  },
  fulfillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  cancelBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E2E2',
  },
  cancelText: {
    fontSize: 12,
    color: '#ABABAB',
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginLeft: 16,
  },
  emptyWrap: {
    paddingTop: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
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
  pastToggle: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 8,
    borderTopColor: '#F6F6F6',
  },
  pastToggleText: {
    fontSize: 14,
    color: '#ABABAB',
  },
  pastRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pastFoodType: {
    fontSize: 14,
    color: '#ABABAB',
  },
  pastStatus: {
    fontSize: 12,
    color: '#ABABAB',
    textTransform: 'capitalize',
  },
});
