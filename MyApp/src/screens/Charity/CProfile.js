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
    return <ActivityIndicator size="large" color="#000099" style={{ marginTop: 50 }} />;
  }

  if (!profile) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No profile data found.</Text>
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

      <View style={styles.divider} />

      {profile.role === 'charity' && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Only eateries can create food posts. As a charity, you can request food but cannot post it.
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: 'gray',
    fontSize: 14,
  },
  infoBox: {
    marginHorizontal: 20,
    backgroundColor: '#fff3cd',
    borderColor: '#ffeeba',
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
  },
  infoText: {
    color: '#856404',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});

export default CProfileScreen;
