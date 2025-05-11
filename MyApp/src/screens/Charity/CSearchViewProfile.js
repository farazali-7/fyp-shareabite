import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { getUserDetailsById, subscribeToUser } from '../../apis/userAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CSearchViewProfileScreen = () => {
  const route = useRoute();
  const { userId } = route.params;

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loggedInUserId, setLoggedInUserId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setLoggedInUserId(parsedUser._id);
      }
      fetchUserProfile();
    };

    fetchData();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await getUserDetailsById(userId);
      setProfile(res.user);
      setPosts(res.posts || []);
    } catch (err) {
      console.error(' Failed to load user profile:', err);
      Alert.alert('Error', 'Unable to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribeToggle = async () => {
    if (!loggedInUserId || !userId) {
      Alert.alert('Error', 'User info missing');
      return;
    }

    try {
      await subscribeToUser(userId, loggedInUserId);
      fetchUserProfile(); // Refresh subscription state
    } catch (err) {
      console.error(' Subscribe Error:', err);
      Alert.alert('Error', 'Subscription update failed');
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#000099" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text>User not found.</Text>
      </View>
    );
  }

  const isSubscribed = profile.subscribers?.includes(loggedInUserId);
  const displayRole =
    profile.role === 'restaurant'
      ? 'Eatery'
      : profile.role === 'charity'
      ? 'Charity House'
      : 'Unknown';

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Image
          source={{ uri: profile.profileImage || 'https://i.pravatar.cc/150' }}
          style={styles.profileImage}
        />
        <Text style={styles.userName}>{profile.userName}</Text>
        <Text style={styles.roleText}>Role: {displayRole}</Text>
        <Text style={styles.subscriberText}>{profile.subscribers?.length || 0} Subscribers</Text>

        {userId !== loggedInUserId && (
          <TouchableOpacity style={styles.subscribeBtn} onPress={handleSubscribeToggle}>
            <Text style={styles.btnText}>
              {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.divider} />

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
        contentContainerStyle={{ paddingBottom: 30 }}
      />
    </View>
  );
};

export default CSearchViewProfileScreen;

const styles = StyleSheet.create({
  container: {
    marginTop:30,
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topSection: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: '#F5F9FF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 2,
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: '#00CCCC',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 12,
    color: '#000099',
  },
  roleText: {
    fontSize: 16,
    color: '#444',
    marginTop: 4,
  },
  subscriberText: {
    fontSize: 14,
    color: '#000',
    marginTop: 6,
  },
  subscribeBtn: {
    backgroundColor: '#00CCCC',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 24,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  divider: {
    height: 1,
    backgroundColor: '#00CCCC',
    marginHorizontal: 20,
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
    marginBottom: 12,
    color: '#000099',
  },
  postCard: {
    backgroundColor: '#F9F9F9',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E0F7FA',
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
    fontWeight: '600',
    color: '#000099',
    marginTop: 12,
  },
  description: {
    color: '#444',
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    color: '#888',
    fontSize: 15,
  },
});

