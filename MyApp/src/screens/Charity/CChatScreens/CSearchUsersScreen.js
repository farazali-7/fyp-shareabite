import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import api from '../../../apis/requestAPI';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import debounce from 'lodash.debounce';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CSearchUsersScreen = ({ navigation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUserId = async () => {
      try {
        const id = await AsyncStorage.getItem('userId');
        if (id) {
          setCurrentUserId(id);
        } else {
          setError('User authentication required');
        }
      } catch (err) {
        setError('Failed to load user data');
      }
    };
    loadUserId();
  }, []);

  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      setError(null);

      try {
        const response = await api.get('/api/users/search', {
          params: { q: query },
        });

        const filtered = response.data
          .filter(user => user._id !== currentUserId)
          .map(user => ({
            ...user,
            roleDisplay: user.role === 'eatery' ? 'Restaurant' : 'Charity Organization'
          }));

        setResults(filtered);
      } catch (err) {
        setError('Search failed. Please try again.');
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500),
    [currentUserId]
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
    return () => debouncedSearch.cancel();
  }, [searchTerm, debouncedSearch]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setSearchTerm('');
        setResults([]);
      };
    }, [])
  );

  const startChat = async (user) => {
    try {
      const response = await api.post('/api/chats', {
        participantId: user._id,
        type: user.role === 'eatery' ? 'eatery' : 'charity',
      });

      navigation.navigate('Chat', {
        chatId: response.data._id,
        chatType: response.data.type,
        participant: user,
      });
    } catch (err) {
      Alert.alert(
        'Error',
        err.response?.data?.message || 'Failed to start chat. Please try again.'
      );
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => startChat(item)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.profilePicture || 'https://placehold.co/400' }}
        style={styles.userImage}
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.metaContainer}>
          <Text style={styles.userRole}>{item.roleDisplay}</Text>
          {item.rating && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
            </View>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or location..."
          placeholderTextColor="#999"
          value={searchTerm}
          onChangeText={setSearchTerm}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {searchTerm ? (
          <TouchableOpacity
            onPress={() => setSearchTerm('')}
            style={styles.clearButton}
          >
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        ) : null}
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={24} color="#ff3b30" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : isSearching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Searching users...</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContent}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name={searchTerm ? "search-outline" : "people-outline"}
                size={60}
                color="#ddd"
              />
              <Text style={styles.emptyText}>
                {searchTerm ? 'No matching users found' : 'Search for users to chat with'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchIcon: { marginRight: 10 },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clearButton: { marginLeft: 10 },
  userItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    alignItems: 'center',
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    backgroundColor: '#f5f5f5',
  },
  userInfo: { flex: 1 },
  userName: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 3,
    color: '#333',
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userRole: {
    color: '#666',
    fontSize: 14,
    marginRight: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#666',
    fontSize: 14,
    marginLeft: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#ffeeee',
    margin: 15,
    borderRadius: 8,
  },
  errorText: {
    color: '#ff3b30',
    marginLeft: 10,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
    marginTop: 15,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  listContent: {
    paddingBottom: 20,
  },
});

export default CSearchUsersScreen;
