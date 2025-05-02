import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getUserProfile } from '../../apis/userAPI';
import PostCard from './PostCard';

const RProfileScreen = () => {
  const navigation = useNavigation();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = async () => {
    try {
      const data = await getUserProfile();
      if (data?.user) {
        setProfile(data.user);
        setPosts(data.posts || []);
      } else {
        setProfile(null);
        setPosts([]);
      }
    } catch (err) {
      console.error(" Error fetching profile:", err);
      Alert.alert('Error', 'Failed to load profile.');
      setProfile(null);
      setPosts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProfile();
  }, []);

  const handleViewDetails = () => {
    if (profile?._id) {
      navigation.navigate('ViewProfileDetails', { userId: profile._id });
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#000099" style={{ marginTop: 50 }} />;
  }

  if (!profile) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'gray' }}>No profile data found.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.topSection}>
        <Image
          source={{ uri: profile?.profileImage || 'https://i.pravatar.cc/150?img=12' }}
          style={styles.profileImage}
        />
        <Text style={styles.userName}>{profile?.userName}</Text>
        <Text style={styles.roleText}>
          Role: {profile?.role === 'restaurant' ? 'Eatery' : 'Charity House'}
        </Text>
        <Text style={styles.subscriberText}>{profile?.subscribers?.length || 0} Subscribers</Text>
        <TouchableOpacity onPress={handleViewDetails}>
          <Text style={styles.linkText}>View Full Details</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

     
      {profile.role === 'restaurant' && (
        posts.length > 0 ? (
          <View style={styles.postsContainer}>
            <Text style={styles.postsHeader}>Your Posts</Text>
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={{
                  ...post,
                  images: post.foodImages || [],
                }}
                currentUserId={profile._id}
                currentUserRole={profile.role}
              />
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>You haven't posted anything yet.</Text>
        )
      )}
    </ScrollView>
  );
};

export default RProfileScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topSection: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: '#F5F9FF',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#00CCCC',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 12,
    color: '#000099',
  },
  roleText: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  subscriberText: {
    fontSize: 14,
    color: '#000',
    marginTop: 6,
  },
  linkText: {
    color: '#00CCCC',
    marginTop: 10,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#00CCCC',
    marginHorizontal: 20,
    marginVertical: 16,
  },
  postsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  postsHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000099',
    marginBottom: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: 'gray',
    fontSize: 14,
    marginTop: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
