import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRoute } from '@react-navigation/native';

const RSearchViewProfileScreen = () => {
  const route = useRoute();
  const userId = route?.params?.userId || '2'; // Visiting this profile
  const loggedInUserId = '1'; // Current user

  const profiles = [
    {
      _id: '1',
      userName: 'biryani_point',
      fullName: 'Biryani Point',
      profileImage: 'https://i.pravatar.cc/150?img=12',
      subscribers: ['2', '3'],
    },
    {
      _id: '2',
      userName: 'deserts_corner',
      fullName: 'Deserts Corner',
      profileImage: 'https://i.pravatar.cc/150?img=14',
      subscribers: ['1', '4'],
    },
    {
      _id: '3',
      userName: 'bbq_lounge',
      fullName: 'BBQ Lounge',
      profileImage: 'https://i.pravatar.cc/150?img=16',
      subscribers: [],
    },
  ];

  const dummyPosts = {
    '1': [
      {
        _id: 'p1',
        foodType: 'Biryani',
        quantity: '5 people',
        description: 'Hot and fresh chicken biryani!',
        images: ['https://kfoods.com/images1/newrecipeicon/chicken-biryani_3.jpg'],
      },
    ],
    '2': [
      {
        _id: 'p2',
        foodType: 'Desserts',
        quantity: '4 people',
        description: 'Chilled kheer and gulab jamun.',
        images: ['https://www.shutterstock.com/image-photo/indian-sweet-gulab-jamun-260nw-1086304916.jpg'],
      },
    ],
    '3': [],
  };

  const profile = profiles.find((p) => p._id === userId);
  const [subscribers, setSubscribers] = useState(profile?.subscribers || []);
  const [posts] = useState(dummyPosts[userId] || []);

  const isSubscribed = subscribers.includes(loggedInUserId);

  const handleSubscribe = () => {
    if (isSubscribed) {
      setSubscribers(subscribers.filter((id) => id !== loggedInUserId));
    } else {
      setSubscribers([...subscribers, loggedInUserId]);
    }
  };

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text>User not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Image source={{ uri: profile.profileImage }} style={styles.profileImage} />
        <Text style={styles.userName}>{profile.userName}</Text>
        <Text>{subscribers.length} Subscribers</Text>

        {userId !== loggedInUserId && (
          <TouchableOpacity style={styles.subscribeBtn} onPress={handleSubscribe}>
            <Text style={styles.btnText}>
              {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity>
          <Text style={styles.linkText}>View Full Details</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Posts</Text>

      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.postCard}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {item.images.map((img, idx) => (
                <Image key={idx} source={{ uri: img }} style={styles.postImage} />
              ))}
            </ScrollView>
            <Text style={styles.foodType}>{item.foodType} - {item.quantity}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No posts yet.</Text>}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  topSection: { alignItems: 'center', padding: 20 },
  profileImage: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: '#00CCCC' },
  userName: { fontSize: 22, fontWeight: 'bold', marginVertical: 8, color: '#000099' },
  subscribeBtn: { backgroundColor: '#00CCCC', padding: 10, borderRadius: 10, marginTop: 5 },
  btnText: { color: '#fff', fontWeight: 'bold' },
  linkText: { color: '#007BFF', marginTop: 10, textDecorationLine: 'underline' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 15, marginTop: 10, color: '#000099' },
  postCard: {
    padding: 12,
    margin: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    elevation: 2,
  },
  postImage: { width: 160, height: 100, borderRadius: 8, marginRight: 10 },
  foodType: { fontWeight: 'bold', fontSize: 16, color: '#000' },
  description: { color: '#555', marginTop: 4 },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#888' },
});

export default RSearchViewProfileScreen;
