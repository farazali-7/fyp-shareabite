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

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Appbar.Action 
          icon="chat" 
          onPress={() => navigation.navigate('CharityChatList')}
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

   
    </View>
  );
};

export default CHomeScreen;



const styles = StyleSheet.create({
  container: {
    flex: 1,                        
    marginTop: 0,                
    backgroundColor: '#e6e6e6',     
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
    fontSize: 16,                 
    color: 'white',
    backgroundColor:'#356F59',                 
    fontStyle: 'italic',         
  },



  chatIcon: {
    marginRight: 16,               
    backgroundColor: '#356F59',    
    padding: 8,                 
    borderRadius: 20,              
  },
});

