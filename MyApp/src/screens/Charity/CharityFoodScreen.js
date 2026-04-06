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
  TextInput,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { fetchAllFoodPosts } from '../../apis/userAPI';

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

const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : '?');

const PostRow = ({ post }) => {
  const navigation = useNavigation();
  const soon = isExpiringSoon(post.bestBefore);

  return (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.6}
      onPress={() => navigation.navigate('PostDetail', { post })}
    >
      <View style={styles.avatarWrap}>
        <Text style={styles.avatarText}>{getInitial(post.userName)}</Text>
      </View>
      <View style={styles.rowContent}>
        <View style={styles.rowTopRow}>
          <Text style={styles.foodType} numberOfLines={1}>{post.foodType}</Text>
          <Text style={[styles.timeText, soon && styles.timeUrgent]}>
            {timeRemaining(post.bestBefore)}
          </Text>
        </View>
        <Text style={styles.meta}>
          {post.quantity} {post.quantityUnit || 'servings'}
          {post.area ? `  ·  ${post.area}` : ''}
        </Text>
        <Text style={styles.donorName}>{post.userName}</Text>
      </View>
    </TouchableOpacity>
  );
};

const SectionHeader = ({ title }) => (
  <Text style={styles.sectionHeader}>{title}</Text>
);

const Separator = () => <View style={styles.separator} />;

export default function CharityFoodScreen() {
  const [allPosts, setAllPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filterArea, setFilterArea] = useState('');
  const [filterType, setFilterType] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await fetchAllFoodPosts();
      setAllPosts(data.posts || []);
    } catch (err) {
      console.error('Failed to load food:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const filtered = allPosts.filter(p => {
    const matchArea = filterArea.trim()
      ? (p.area || '').toLowerCase().includes(filterArea.toLowerCase())
      : true;
    const matchType = filterType.trim()
      ? (p.foodType || '').toLowerCase().includes(filterType.toLowerCase())
      : true;
    return matchArea && matchType;
  });

  const urgent = filtered.filter(p => isExpiringSoon(p.bestBefore));
  const regular = filtered.filter(p => !isExpiringSoon(p.bestBefore));

  // Build flat list data with section headers
  const listData = [];
  if (urgent.length > 0) {
    listData.push({ type: 'header', id: 'h1', title: 'Needs pickup soon' });
    urgent.forEach(p => listData.push({ type: 'post', id: p._id, post: p }));
  }
  if (regular.length > 0) {
    listData.push({ type: 'header', id: 'h2', title: 'Available' });
    regular.forEach(p => listData.push({ type: 'post', id: p._id, post: p }));
  }

  const renderItem = ({ item, index }) => {
    if (item.type === 'header') {
      return <SectionHeader title={item.title} />;
    }

    // Only show separator between posts, not after headers
    const prevItem = listData[index - 1];
    const showSep = prevItem && prevItem.type === 'post';

    return (
      <>
        {showSep && <Separator />}
        <PostRow post={item.post} />
      </>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <FlatList
        data={listData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(); }}
            tintColor="#356F59"
          />
        }
        ListHeaderComponent={
          <View>
            <View style={styles.screenHeader}>
              <Text style={styles.screenTitle}>Food</Text>
            </View>
            <View style={styles.filterRow}>
              <TextInput
                style={[styles.filterInput, { marginRight: 8 }]}
                placeholder="Area"
                placeholderTextColor="#ABABAB"
                value={filterArea}
                onChangeText={setFilterArea}
                autoCapitalize="none"
              />
              <TextInput
                style={styles.filterInput}
                placeholder="Food type"
                placeholderTextColor="#ABABAB"
                value={filterType}
                onChangeText={setFilterType}
                autoCapitalize="none"
              />
              {(filterArea || filterType) ? (
                <TouchableOpacity
                  style={styles.clearFilter}
                  onPress={() => { setFilterArea(''); setFilterType(''); }}
                >
                  <Text style={styles.clearFilterText}>Clear</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No food available right now.</Text>
            <Text style={styles.emptyHint}>Check back in a little while.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  screenHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  filterInput: {
    flex: 1,
    height: 38,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 14,
    color: '#1C1C1E',
  },
  clearFilter: {
    marginLeft: 8,
    paddingHorizontal: 8,
  },
  clearFilterText: {
    fontSize: 14,
    color: '#ABABAB',
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ABABAB',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 6,
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  avatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F1EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#356F59',
  },
  rowContent: { flex: 1 },
  rowTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  foodType: {
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
  timeUrgent: {
    color: '#E08B00',
    fontWeight: '500',
  },
  meta: {
    fontSize: 13,
    color: '#6B6B6B',
    marginBottom: 2,
  },
  donorName: {
    fontSize: 12,
    color: '#ABABAB',
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginLeft: 72,
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
  },
});
