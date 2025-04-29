import React, { useState } from 'react';
import {
  View, Text, Image, FlatList, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const RProfileScreen = () => {
  const navigation = useNavigation(); // 
  const loggedInUserId = '1'; // Example for current user ID

  const profile = {
    _id: '1',
    userName: 'biryani_point',
    profileImage: 'https://i.pravatar.cc/150?img=12',
    subscribers: ['2', '3'],
  };

  const posts = [
    {
      _id: 'p1',
      foodType: 'Biryani',
      quantity: '4 people',
      bestBefore: '2025-05-01',
      description: 'Freshly cooked biryani.',
      images: ['https://kfoods.com/images1/newrecipeicon/chicken-biryani_3.jpg'],
    },
    {
      _id: 'p2',
      foodType: 'BBQ',
      quantity: '5 people',
      bestBefore: '2025-05-02',
      description: 'Delicious BBQ for pick-up.',
      images: ['https://www.shutterstock.com/image-photo/food-bar-b-q-pakistani-260nw-1885378774.jpg'],
    },
  ];

  // 📍 Navigate to EditPostScreen with selected post
  const handleEdit = (post) => {
    navigation.navigate('EditPostScreen', { post });
  };

  // 📍 Delete Post (API logic inside comment)
  const handleDelete = (postId) => {
    Alert.alert('Delete Post', 'Are you sure you want to delete?', [
      {
        text: 'Yes, Delete',
        onPress: () => {
          // axios.delete(`http://yourserver.com/api/posts/${postId}`)
          //   .then(res => console.log('Post deleted'))
          //   .catch(err => console.error(err));
        },
        style: 'destructive'
      },
      { text: 'Cancel', style: 'cancel' }
    ]);
  };

  // 📍 Navigate to ProfileDetails
  const handleViewDetails = () => {
    navigation.navigate('ViewProfileDetails', { userId: profile._id });
  };

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Image source={{ uri: profile.profileImage }} style={styles.profileImage} />
        <Text style={styles.userName}>{profile.userName}</Text>
        <Text>{profile.subscribers.length} Subscribers</Text>

        {/* View Full Details Button */}
        <TouchableOpacity onPress={handleViewDetails}>
          <Text style={styles.linkText}>View Full Details</Text>
        </TouchableOpacity>
      </View>

      {/* User's Posts */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.postCard}>
            <ScrollView horizontal>
              {item.images.map((img, idx) => (
                <Image key={idx} source={{ uri: img }} style={styles.postImage} />
              ))}
            </ScrollView>

            <View style={styles.postHeader}>
              <Text>{item.foodType} - {item.quantity}</Text>
              <TouchableOpacity
                onPress={() => Alert.alert('Options', '', [
                  { text: 'Edit', onPress: () => handleEdit(item) },
                  { text: 'Delete', onPress: () => handleDelete(item._id), style: 'destructive' },
                  { text: 'Cancel', style: 'cancel' },
                ])}
              >
                <Entypo name="dots-three-vertical" size={18} color="#444" />
              </TouchableOpacity>
            </View>

            <Text>{item.description}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  topSection: { alignItems: 'center', padding: 20 },
  profileImage: { width: 100, height: 100, borderRadius: 50 },
  userName: { fontSize: 20, fontWeight: 'bold', marginVertical: 8 },
  linkText: { color: 'blue', marginTop: 10 },
  postCard: { padding: 10, margin: 10, backgroundColor: '#eee', borderRadius: 10 },
  postImage: { width: 150, height: 100, borderRadius: 8, marginRight: 10 },
  postHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 },
});

export default RProfileScreen;
