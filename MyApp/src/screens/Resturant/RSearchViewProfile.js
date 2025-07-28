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
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#356F59" />
      </View>
    );
  }

  const displayRole = profile.role === 'restaurant' ? 'Eatery' : 'Charity House';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.backgroundWrapper}>
        <View style={styles.topBackground} />
        <View style={styles.bottomBackground} />
      </View>

      <View style={styles.topSection}>
        <Image
          source={{ uri: profile.profileImage || 'https://i.pravatar.cc/150' }}
          style={styles.profileImage}
        />
        <Text style={styles.userName}>{profile.userName}</Text>
        <Text style={styles.roleText}>{displayRole}</Text>

        <TouchableOpacity style={styles.infoRow} onPress={() => setShowEmail(!showEmail)}>
          <MaterialIcons name="email" size={20} color="#356F59" />
          <Text style={styles.linkText}>{showEmail ? profile.email : 'Tap to view email'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.infoRow} onPress={() => setShowContact(!showContact)}>
          <MaterialIcons name="phone" size={20} color="#356F59" />
          <Text style={styles.linkText}>{showContact ? profile.contactNumber : 'Tap to view contact'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {profile.role === 'restaurant' ? (
        posts.length > 0 ? (
          <View style={{ paddingHorizontal: 16 }}>
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
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          </View>
        ) : (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>No food posts available</Text>
          </View>
        )
      ) : (
        <View style={styles.infoBox}>
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
    backgroundColor: 'white',
  },
  backgroundWrapper: {
    position: 'relative',
    backgroundColor: '#356F59',
  },
  topBackground: {
    backgroundColor: 'white',
    height: 200,
    borderBottomLeftRadius: 200,
    borderBottomRightRadius: 200,
  },
  bottomBackground: {
    position: 'absolute',
    top: 175,
    left: 0,
    right: 0,
    height: 180,
    backgroundColor: 'white',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  topSection: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 16,
    marginTop: -140,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'white',
    backgroundColor: '#fff',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 8,
    color: 'black',
  },
  roleText: {
    fontSize: 14,
    color: 'black',
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 6,
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    width: '80%',
    justifyContent: 'center',
  },
  linkText: {
    color: '#356F59',
    marginLeft: 6,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  divider: {
    height: 4,
    backgroundColor: 'green',
    marginHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  infoBox: {
    marginVertical: 20,
    marginHorizontal: 20,
    backgroundColor: '#356F59',
    borderColor: '#356F59',
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
  },
  infoText: {
    color: 'white',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
