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

const RHomeScreen = () => {
  const navigation = useNavigation();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Appbar.Action 
          icon="chat" 
          onPress={() => navigation.navigate('RestaurantChatList')}
          color="white"
          size={24}
          style={styles.chatIcon}
        />
      ),
    });
  }, [navigation]);

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#356F59" />
      </View>
    );
  }

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


const styles = StyleSheet.create({
  container: {
    flex: 1,                        
    marginTop: 0,                
    backgroundColor: 'white',     
  },

  loadingContainer: {
    flex: 1,                      
    justifyContent: 'center',      
    alignItems: 'center',     },     
  listContent: {
    paddingHorizontal: 0,       
    paddingBottom: 0,           
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,                
  },

  emptyText: {
    fontSize: 20,                 
    color: 'white',
    backgroundColor:'#356F59',                 
    fontStyle: 'italic',         
  },

  
  fab: {
    position: 'absolute',          
    right: 20,                     
    bottom: 20,                   
    backgroundColor: '#356F59',    
    borderRadius: 30,              
    width: 60,
    height: 60,
    justifyContent: 'center',      
    alignItems: 'center',          
    elevation: 6,                 
    shadowOpacity: 0.2,            
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  chatIcon: {
    marginRight: 16,               
    backgroundColor: '#356F59',    
    padding: 8,                 
    borderRadius: 20,              
  },
});

export default RHomeScreen;
