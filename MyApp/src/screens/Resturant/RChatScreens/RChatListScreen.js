import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { useSocket } from '../../../context/SocketContext';
import { getUserChats, createChat, searchUsers } from '../../../apis/chatAPI';
import { Ionicons } from '@expo/vector-icons';
import debounce from 'lodash.debounce';
import { useFocusEffect } from '@react-navigation/native';

const RChatListScreen = ({ navigation }) => {
  const { socket } = useSocket();

  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchController = useRef(new AbortController());

  const fetchChats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getUserChats();
      if (Array.isArray(data)) {
        const sortedChats = data.sort((a, b) => {
          const dateA = new Date(a.updatedAt || a.createdAt);
          const dateB = new Date(b.updatedAt || b.createdAt);
          return dateB - dateA;
        });
        setChats(sortedChats);
      } else {
        setChats([]);
        throw new Error('Invalid chat data received');
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not load chats');
      setChats([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchChats();
  }, [fetchChats]);

  useEffect(() => {
    fetchChats();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchChats();
    }, [fetchChats])
  );

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      setChats((prevChats) => {
        const index = prevChats.findIndex((c) => c._id === message.chatId);
        if (index === -1) return prevChats;

        const updatedChats = [...prevChats];
        const updatedChat = {
          ...updatedChats[index],
          lastMessage: message,
          updatedAt: new Date().toISOString(),
          unreadCount: (updatedChats[index].unreadCount || 0) + 1,
        };

        updatedChats[index] = updatedChat;
        const [moved] = updatedChats.splice(index, 1);
        updatedChats.unshift(moved);

        return updatedChats;
      });
    };

    const handleChatCreated = (newChat) => {
      setChats((prevChats) => [newChat, ...prevChats]);
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('chatCreated', handleChatCreated);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('chatCreated', handleChatCreated);
    };
  }, [socket]);

  const debouncedSearch = useMemo(
    () =>
      debounce(async (query) => {
        const trimmed = query.trim();
        searchController.current.abort();
        searchController.current = new AbortController();

        if (!trimmed || trimmed.length < 2) {
          setSearchResults([]);
          setShowSearchResults(false);
          return;
        }

        try {
          setSearchLoading(true);
          const results = await searchUsers(trimmed, {
            signal: searchController.current.signal,
          });
          setSearchResults(results || []);
          setShowSearchResults(true);
        } catch (err) {
          if (err.name !== 'AbortError') {
            Alert.alert('Error', err.message || 'Search failed');
          }
        } finally {
          setSearchLoading(false);
        }
      }, 500),
    []
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
    return () => {
      debouncedSearch.cancel();
      searchController.current.abort();
    };
  }, [searchQuery]);

  const startNewChat = async (user) => {
    try {
      const existingChat = chats.find((chat) =>
        chat.participants.some((p) => p._id === user._id)
      );

      if (existingChat) {
        const otherUser = existingChat.participants.find((p) => p._id === user._id);
        navigation.navigate('RestaurantChat', {
          chatId: existingChat._id,
          participant: otherUser,
        });
      } else {
        const res = await createChat(user._id);
        navigation.navigate('RestaurantChat', {
          chatId: res._id,
          participant: user,
        });
      }
      setSearchQuery('');
      setShowSearchResults(false);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to create chat');
    }
  };

  const renderChatItem = ({ item }) => {
    const otherUser = item.participants.find((p) => !p.isCurrentUser);
    const lastMessageTime = item.lastMessage?.timestamp || item.updatedAt;

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() =>
          navigation.navigate('RestaurantChat', {
            chatId: item._id,
            participant: otherUser,
          })
        }
      >
        <Image
          source={{ uri: otherUser?.profilePicture || 'https://placehold.co/400' }}
          style={styles.profileImage}
        />
        <View style={styles.chatContent}>
          <Text style={styles.chatName}>{otherUser?.name || 'User'}</Text>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage?.content || 'No messages yet'}
          </Text>
        </View>
        <View style={styles.chatMeta}>
          {lastMessageTime && (
            <Text style={styles.timeText}>
              {new Date(lastMessageTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          )}
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCorrect={false}
        />
        {searchQuery ? (
          <TouchableOpacity
            onPress={() => {
              setSearchQuery('');
              setSearchResults([]);
              setShowSearchResults(false);
            }}
          >
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        ) : null}
      </View>

      {showSearchResults && (
        <FlatList
          data={searchResults}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => startNewChat(item)} style={styles.searchItem}>
              <Image
                source={{ uri: item.profilePicture || 'https://placehold.co/400' }}
                style={styles.searchProfileImage}
              />
              <View style={styles.searchContent}>
                <Text style={styles.searchName}>{item.name}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item._id}
        />
      )}

      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={<Text style={styles.sectionTitle}>Your Conversations</Text>}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>No conversations yet</Text>
              <Text style={styles.emptySubText}>Search for users to start a new chat</Text>
            </View>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 30, flex: 1, backgroundColor: '#fff' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 18, color: '#888', marginTop: 10 },
  emptySubText: { fontSize: 14, color: '#aaa', marginTop: 5 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: '#333' },
  searchItem: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f5f5f5',
  },
  searchProfileImage: { width: 40, height: 40, borderRadius: 20, marginRight: 15 },
  searchContent: { flex: 1 },
  searchName: { fontWeight: '600', fontSize: 16, color: '#333' },
  sectionTitle: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontWeight: '600',
    color: '#555',
    backgroundColor: '#f8f8f8',
  },
  chatItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  profileImage: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  chatContent: { flex: 1 },
  chatName: { fontWeight: 'bold', fontSize: 16, marginBottom: 3 },
  lastMessage: { color: '#666', fontSize: 14 },
  chatMeta: { alignItems: 'flex-end' },
  timeText: { color: '#999', fontSize: 12, marginBottom: 5 },
  unreadBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  listContent: { paddingBottom: 20, flexGrow: 1 },
});

export default RChatListScreen;
