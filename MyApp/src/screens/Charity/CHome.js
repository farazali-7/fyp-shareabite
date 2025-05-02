import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllPosts, requestFood } from '../../apis/userAPI'; 
const CHomeScreen = () => {
  const [posts, setPosts] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      const parsedUser = JSON.parse(storedUser);
      setUserId(parsedUser?._id);
      setUserRole(parsedUser?.role);

      const response = await getAllPosts();
      setPosts(response.posts || []);
    } catch (err) {
      console.error(' Fetch error:', err);
      Alert.alert('Error', 'Unable to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRequest = async (postId, receiverId) => {
    try {
      await requestFood({
        postId,
        requesterId: userId,
        receiverId,
      });
      Alert.alert('Request Sent', 'Your food request has been sent successfully!');
    } catch (err) {
      console.error(' Request Error:', err);
      Alert.alert('Error', 'Failed to send food request.');
    }
  };

  const renderPost = ({ item }) => (
    <View style={styles.postCard}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {item.images.map((img, idx) => (
          <Image key={idx} source={{ uri: img }} style={styles.postImage} />
        ))}
      </ScrollView>

      <Text style={styles.foodType}>{item.foodType} - {item.quantity}</Text>
      <Text style={styles.createdBy}>By: {item.createdBy?.userName || 'Unknown'}</Text>
      <Text style={styles.description}>{item.description}</Text>
      <Text style={styles.bestBefore}>Best Before: {item.bestBefore}</Text>

      {userRole === 'charity' && userId !== item.createdBy?._id && (
        <TouchableOpacity
          style={styles.requestBtn}
          onPress={() => handleRequest(item._id, item.createdBy._id)}
        >
          <Text style={styles.requestText}>Request Food</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#000099" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item._id}
          renderItem={renderPost}
          ListEmptyComponent={<Text style={styles.emptyText}>No food posts available.</Text>}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      )}
    </View>
  );
};

export default CHomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    marginTop: 10,
  },
  postCard: {
    backgroundColor: '#F9F9F9',
    padding: 14,
    marginBottom: 16,
    borderRadius: 14,
    borderColor: '#E0F7FA',
    borderWidth: 1,
    elevation: 2,
  },
  postImage: {
    width: 160,
    height: 100,
    borderRadius: 10,
    marginRight: 10,
  },
  foodType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000099',
    marginTop: 10,
  },
  createdBy: {
    fontSize: 14,
    color: '#00CCCC',
    marginTop: 4,
  },
  description: {
    fontSize: 14,
    color: '#444',
    marginTop: 4,
  },
  bestBefore: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },
  requestBtn: {
    marginTop: 12,
    backgroundColor: '#00CCCC',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  requestText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#888',
    fontSize: 15,
  },
});
