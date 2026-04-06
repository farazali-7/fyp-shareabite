import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { searchUsers } from '../../apis/userAPI';

const RSearchScreen = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef(null);
  const navigation = useNavigation();

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length > 0) {
        handleSearch();
      } else {
        setResults([]);
        setSearched(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = async () => {
    try {
      setLoading(true);
      setSearched(true);
      const users = await searchUsers(query);
      setResults(users || []);
    } catch (err) {
      console.error('Search failed:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : '?');

  const getRoleLabel = (role) => {
    if (role === 'restaurant') return 'Eatery';
    if (role === 'charity') return 'Charity House';
    return role || '';
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.6}
      onPress={() => navigation.navigate('SearchViewProfileScreen', { userId: item._id })}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{getInitial(item.userName)}</Text>
      </View>
      <View style={styles.rowText}>
        <Text style={styles.name}>{item.userName}</Text>
        <Text style={styles.role}>{getRoleLabel(item.role)}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );

  const Separator = () => <View style={styles.separator} />;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Search eateries or charity houses"
            placeholderTextColor="#ABABAB"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Results */}
        {loading ? (
          <ActivityIndicator size="small" color="#356F59" style={{ marginTop: 32 }} />
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            ItemSeparatorComponent={Separator}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                {searched ? 'No results found' : 'Search for eateries or charity houses'}
              </Text>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default RSearchScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    height: 44,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  searchIcon: {
    fontSize: 18,
    color: '#ABABAB',
    marginRight: 8,
    lineHeight: 22,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1C1C1E',
    paddingVertical: 0,
  },
  clearBtn: {
    fontSize: 14,
    color: '#ABABAB',
    paddingLeft: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  avatar: {
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
  rowText: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  role: {
    fontSize: 13,
    color: '#ABABAB',
    marginTop: 2,
  },
  chevron: {
    fontSize: 20,
    color: '#C7C7CC',
    lineHeight: 24,
  },
  separator: {
    height: 1,
    backgroundColor: '#EFEFEF',
    marginLeft: 72,
  },
  emptyText: {
    textAlign: 'center',
    color: '#ABABAB',
    fontSize: 14,
    marginTop: 48,
  },
});
