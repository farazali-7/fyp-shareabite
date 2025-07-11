import { FAB } from 'react-native-paper';
import PostCard from '../Resturant/PostCard';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { fetchAllFoodPosts } from '../../apis/userAPI';
import React, { useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet, 
  Text,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CHomeScreen = () => {
  const navigation = useNavigation();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);

  // 👤 Load current user ID and role
  const loadUserData = async () => {
    try {
      const userString = await AsyncStorage.getItem('user');

      if (userString) {
        const user = JSON.parse(userString);
      //  console.log('✅ Parsed user from AsyncStorage:', user);

        const id = user._id;
        const role = user.role;

        setCurrentUserId(id);
        setCurrentUserRole(role);


      } else {
        console.log(' No user found in AsyncStorage.');
      }
    } catch (err) {
      console.error(' Failed to load user data:', err);
    }
  };

  // 🍱 Fetch all food posts
  const loadPosts = async () => {
    try {
      const data = await fetchAllFoodPosts();

      console.log('📦 Fetched food posts:', data.posts?.length ?? 0);
      if (data.posts && data.posts.length > 0) {
      //  console.log('📝 First post sample:', data.posts[0]);
      }

      setPosts(data.posts);
    } catch (err) {
      console.error('❌ Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Refresh data on screen focus
  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        await loadUserData();
        await loadPosts();
      };
      fetchData();
    }, [])
  );

  const handleNewPost = () => {
    navigation.navigate('NewPost');
  };

  // ⏳ Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#000099" style={{ marginTop: 30 }} />
      </View>
    );
  }

  // ✅ Render food post list
  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
       /*   console.log('📤 Passing to PostCard → post:', item);
          console.log('📤 Passing to PostCard → currentUserId:', currentUserId);
          console.log('📤 Passing to PostCard → currentUserRole:', currentUserRole);*/
          return (
            <PostCard
              post={item}
              currentUserId={currentUserId}
              currentUserRole={currentUserRole}
            />
          );
        }}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 20 }}>
            No posts yet.
          </Text>
        }
      />

      <FAB style={styles.fab} icon="plus" onPress={handleNewPost} />
    </View>
  );
};

export default CHomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'green',
    paddingHorizontal: 10,
    marginTop: 32,
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
