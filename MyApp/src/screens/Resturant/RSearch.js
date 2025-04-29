import React, { useState, useEffect } from 'react';
import {
  View, TextInput, FlatList, TouchableOpacity, Text, Image, StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

export default function RSearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const navigation = useNavigation();

  // Live Search whnever Query Changes
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.trim() !== '') fetchResults();
      else setResults([]); 
    }, 300); 

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const fetchResults = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/users/search/${query}`);
      setResults(response.data);
    } catch (error) {
      console.error('Search error:', error.message);
    }
  };

  const visitProfile = (userId) => {
    navigation.navigate('SearchViewProfileScreen', { userId });
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search users..."
        value={query}
        onChangeText={setQuery}
        style={styles.searchInput}
      />
      <FlatList
        data={results}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => visitProfile(item._id)}>
            <Image source={{ uri: item.profileImage }} style={styles.avatar} />
            <View>
              <Text style={styles.userName}>{item.userName}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  searchInput: {
    height: 44,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    marginTop: 20,
    marginBottom: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
    gap: 10,
  },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  userName: { fontWeight: 'bold', fontSize: 16 },
});
