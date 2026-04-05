import React, { useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import PostCard from '../Resturant/PostCard';
import { fetchAllFoodPosts } from '../../apis/userAPI';

const PRIMARY   = '#356F59';
const TEXT_DARK = '#1C1C1E';
const TEXT_GREY = '#6B6B6B';
const BORDER    = '#E2E2E2';
const BG        = '#FFFFFF';

export default function CHomeScreen() {
  const navigation = useNavigation();

  const [posts,         setPosts]         = useState([]);
  const [filtered,      setFiltered]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [refreshing,    setRefreshing]    = useState(false);
  const [search,        setSearch]        = useState('');
  const [userName,      setUserName]      = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentRole,   setCurrentRole]   = useState(null);

  React.useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const loadUser = async () => {
    const raw = await AsyncStorage.getItem('user');
    if (!raw) return;
    const user = JSON.parse(raw);
    setCurrentUserId(user._id);
    setCurrentRole(user.role);
    setUserName(user.userName || user.email?.split('@')[0] || 'there');
  };

  const loadPosts = async () => {
    try {
      const data = await fetchAllFoodPosts();
      const list = data.posts ?? [];
      setPosts(list);
      setFiltered(list);
    } catch (_) {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);
      Promise.all([loadUser(), loadPosts()]);
    }, [])
  );

  const handleSearch = (text) => {
    setSearch(text);
    if (!text.trim()) { setFiltered(posts); return; }
    const q = text.toLowerCase();
    setFiltered(posts.filter(p =>
      p.foodType?.toLowerCase().includes(q) ||
      p.userName?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    ));
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const ListHeader = () => (
    <View style={styles.header}>
      <View style={styles.greetRow}>
        <View>
          <Text style={styles.greeting}>{greeting()}, {userName}</Text>
          <Text style={styles.subGreeting}>Request available food</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('CharityChatList')}
          style={styles.chatBtn}
        >
          <Text style={styles.chatBtnText}>Chat</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.search}
        placeholder="Search food type, donor..."
        placeholderTextColor="#ABABAB"
        value={search}
        onChangeText={handleSearch}
        returnKeyType="search"
      />

      <Text style={styles.sectionLabel}>
        {filtered.length} {filtered.length === 1 ? 'post' : 'posts'} available
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="small" color={PRIMARY} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      <FlatList
        data={filtered}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            currentUserId={currentUserId}
            currentUserRole={currentRole}
          />
        )}
        ListHeaderComponent={<ListHeader />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No food posts available right now.</Text>
          </View>
        }
        refreshing={refreshing}
        onRefresh={() => { setRefreshing(true); loadPosts(); }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BG,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 8,
    backgroundColor: BG,
  },
  greetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  subGreeting: {
    fontSize: 13,
    color: TEXT_GREY,
    marginTop: 2,
  },
  chatBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
  },
  chatBtnText: {
    fontSize: 13,
    fontWeight: '500',
    color: TEXT_DARK,
  },
  search: {
    height: 44,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: TEXT_DARK,
    backgroundColor: BG,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    color: TEXT_GREY,
    fontWeight: '500',
    marginBottom: 4,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  empty: {
    paddingTop: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: TEXT_GREY,
  },
});
