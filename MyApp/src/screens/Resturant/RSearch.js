import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { searchUsers } from '../../apis/userAPI';

const RSearchScreen = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (query.trim().length > 0) {
        handleSearch();
      } else {
        setResults([]);
      }
    }, 300); // Debounce for better performance

    return () => clearTimeout(delaySearch);
  }, [query]);

  const handleSearch = async () => {
    try {
      setLoading(true);
      const users = await searchUsers(query);
      setResults(users);
    } catch (err) {
      console.error(' Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('SearchViewProfileScreen', { userId: item._id })}
    >
      <Image
        source={{ uri: item.profileImage || 'https://i.pravatar.cc/150' }}
        style={styles.avatar}
      />
      <View>
        <Text style={styles.userName}>{item.userName}</Text>
        {/* Optional: Show role */}
        {/* <Text style={styles.roleText}>{item.role === 'restaurant' ? 'Eatery' : 'Charity'}</Text> */}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search users"
        placeholderTextColor="#999"
        style={styles.input}
        value={query}
        onChangeText={setQuery}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#000099" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          ListEmptyComponent={
            query.length > 0 ? <Text style={styles.emptyText}>No users found</Text> : null
          }
        />
      )}
    </View>
  );
};

export default RSearchScreen;

const styles = StyleSheet.create({
  container: {
    marginTop:25,
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
  },
  input: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: '#000099',
  },
  userName: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
  },
  roleText: {
    fontSize: 12,
    color: '#888',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
    fontSize: 16,
  },
});
