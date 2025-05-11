import React, { useState } from 'react';
import { View, FlatList, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { FAB } from 'react-native-paper';
import PostCard from './PostCard';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { fetchAllFoodPosts } from '../../apis/userAPI';

const RHomeScreen = () => {
  const navigation = useNavigation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPosts = async () => {
    try {
      const data = await fetchAllFoodPosts();
      console.log(data)
      setPosts(data.posts); // or just data if you return array directly
    } catch (err) {
      console.error('❌ Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadPosts(); // fetch on focus
    }, [])
  );

  const handleNewPost = () => {
    navigation.navigate('NewPost');
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#000099" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <PostCard post={item} />}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No posts yet.</Text>}
        />
      )}
      <FAB style={styles.fab} icon="plus" onPress={handleNewPost} />
    </View>
  );
};

export default RHomeScreen;

const styles = StyleSheet.create({
  container: {
    marginTop:30,
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    marginTop: 10,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 16,
    bottom: 16,
    backgroundColor: '#000099',
    borderRadius: 28,
    elevation: 4,
  },
});
