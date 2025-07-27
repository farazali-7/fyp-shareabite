import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import { getProfileAndPostsById } from '../../apis/userAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import PostCard from './PostCard';

const { width } = Dimensions.get('window');

const RSearchViewProfileScreen = () => {
  const route = useRoute();
  const { userId } = route.params;

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [showContact, setShowContact] = useState(false);
  const [showEmail, setShowEmail] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        if (isFetching) return;
        setIsFetching(true);
        try {
          const storedUser = await AsyncStorage.getItem('user');
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setCurrentUserId(parsedUser._id);
            setCurrentUserRole(parsedUser.role);
          }

          const res = await getProfileAndPostsById(userId);
          if (!res || !res.user) {
            setProfile(null);
            setPosts([]);
          } else {
            setProfile(res.user);
            setPosts(res.posts || []);
          }
        } catch (err) {
          Alert.alert('Error', 'Unable to load user profile and posts');
        } finally {
          setLoading(false);
          setIsFetching(false);
        }
      };

      fetchData();
    }, [userId])
  );

  if (loading || !profile) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  const displayRole = profile.role === 'restaurant' ? 'Eatery' : 'Charity House';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <Image
          source={{ uri: profile.profileImage || 'https://i.pravatar.cc/150' }}
          style={styles.profileImage}
        />
        <Text style={styles.userName}>{profile.userName}</Text>

        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{displayRole}</Text>
        </View>

        <TouchableOpacity
          style={styles.infoRow}
          onPress={() => setShowEmail(!showEmail)}
        >
          <MaterialIcons name="email" size={20} color="#4A90E2" />
          <Text style={styles.infoText}>
            {showEmail ? profile.email : 'Tap to view email'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.infoRow}
          onPress={() => setShowContact(!showContact)}
        >
          <MaterialIcons name="phone" size={20} color="#4A90E2" />
          <Text style={styles.infoText}>
            {showContact ? profile.contactNumber : 'Tap to view contact'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {profile.role === 'restaurant' ? (
        posts.length > 0 ? (
          <View style={styles.postsContainer}>
            <Text style={styles.sectionTitle}>Available Food Posts</Text>
            <FlatList
              data={posts.filter(post => post.status === 'available')}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <PostCard
                  post={item}
                  currentUserId={currentUserId}
                  currentUserRole={currentUserRole}
                  userProfileImage={profile.profileImage}
                  userName={profile.userName}
                />
              )}
              scrollEnabled={false}
              contentContainerStyle={styles.listContent}
            />
          </View>
        ) : (
          <View style={styles.infoContainer}>
            <MaterialIcons name="info-outline" size={24} color="#4A90E2" />
            <Text style={styles.infoText}>No food posts available</Text>
          </View>
        )
      ) : (
        <View style={styles.infoContainer}>
          <MaterialIcons name="info-outline" size={24} color="#4A90E2" />
          <Text style={styles.infoText}>Only eateries can create food posts</Text>
        </View>
      )}
    </ScrollView>
  );
};

export default RSearchViewProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    padding: 25,
    backgroundColor: '#F0F8FF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileImage: {
    marginTop: 30,
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: '#4A90E2',
    marginBottom: 10,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 4,
  },
  roleBadge: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  roleText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 1,
    width: '80%',
    justifyContent: 'center',
  },
  infoText: {
    fontSize: 16,
    color: '#4A90E2',
    marginLeft: 6,
    textDecorationLine: 'underline',
  },
  divider: {
    height: 1,
    backgroundColor: '#4A90E2',
    marginVertical: 16,
    marginHorizontal: 20,
    opacity: 0.3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginLeft: 16,
    marginBottom: 10,
  },
  postsContainer: {
    paddingHorizontal: 16,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 20,
    backgroundColor: '#F0F8FF',
    borderRadius: 10,
    marginHorizontal: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
});
