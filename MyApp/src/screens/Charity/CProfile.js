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

const CProfileScreen = () => {
  const navigation = useNavigation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = async () => {
    try {
      const data = await getUserProfile();

      if (data && data.user) {
        setProfile(data.user);
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      Alert.alert('Error', err.toString());
      setProfile(null);
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
    return <ActivityIndicator size="large" color="blue" style={{ marginTop: 50 }} />;
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
        <Text style={styles.userName}>{profile?.userName || 'User Name'}</Text>

        <Text style={styles.roleText}>
          Role: {profile?.role === 'restaurant' ? 'Eatery' : profile?.role === 'charity' ? 'Charity House' : 'Unknown'}
        </Text>

        <Text>{profile?.subscribers?.length || 0} Subscribers</Text>

        <TouchableOpacity onPress={handleViewDetails}>
          <Text style={styles.linkText}>View Full Details</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  topSection: { alignItems: 'center', padding: 20 },
  profileImage: { width: 100, height: 100, borderRadius: 50 },
  userName: { fontSize: 20, fontWeight: 'bold', marginVertical: 8 },
  roleText: { fontSize: 14, color: 'gray', marginTop: 4 },
  linkText: { color: 'blue', marginTop: 10 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CProfileScreen;
