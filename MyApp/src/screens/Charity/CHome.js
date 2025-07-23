import { FAB, Appbar } from 'react-native-paper';
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

  // Set up header with chat icon
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Appbar.Action 
          icon="chat" 
          onPress={() => navigation.navigate('CharityChatList')}
          color="#000099"
          size={24}
          style={styles.chatIcon}
        />
      ),
    });
  }, [navigation]);

  // Load current user ID and role
  const loadUserData = async () => {
    try {
      const userString = await AsyncStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        const id = user._id;
        const role = user.role;
        setCurrentUserId(id);
        setCurrentUserRole(role);
      } else {
        console.log('No user found in AsyncStorage.');
      }
    } catch (err) {
      console.error('Failed to load user data:', err);
    }
  };

  // Fetch all food posts
  const loadPosts = async () => {
    try {
      const data = await fetchAllFoodPosts();
      if (data.posts && data.posts.length > 0) {
        setPosts(data.posts);
      } else {
        setPosts([]);
      }
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Refresh data on screen focus
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

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000099" />
      </View>
    );
  }

  // Render food post list
  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            currentUserId={currentUserId}
            currentUserRole={currentUserRole}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No posts available yet.</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      <FAB 
        style={styles.fab} 
        icon="plus" 
        onPress={handleNewPost} 
        color="white"
      />
    </View>
  );
};

export default CHomeScreen;

const styles = StyleSheet.create({
  container: {
    marginTop:10,
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 80,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
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
  chatIcon: {
    marginRight: 30,
    backgroundColor:'#13bddbff',
  },
});