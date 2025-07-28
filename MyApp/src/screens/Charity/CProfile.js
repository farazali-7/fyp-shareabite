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
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { Entypo } from '@expo/vector-icons';

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

  const handleOpenDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#356F59" style={{ marginTop: 50 }} />;
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
  <View style={styles.headerContainer}>
    <Text style={styles.headerTitle}></Text>
    <TouchableOpacity onPress={() => navigation.openDrawer()}>
      <Entypo name="dots-three-vertical" size={22} color="#356F59" />
    </TouchableOpacity>
  </View>

  <View style={styles.backgroundWrapper}>
    <View style={styles.topBackground} />
    <View style={styles.bottomBackground} />

    <View style={styles.topSection}>
      <Image
        source={{ uri: profile?.profileImage || 'https://i.pravatar.cc/150?img=12' }}
        style={styles.profileImage}
      />
      <Text style={styles.userName}>{profile?.userName}</Text>
      <Text style={styles.roleText}>
        Role: {profile?.role === 'restaurant' ? 'Eatery' : 'Charity House'}
      </Text>
      <TouchableOpacity onPress={handleViewDetails}>
        <Text style={styles.linkText}>View Full Details</Text>
      </TouchableOpacity>
    </View>
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
  container: {
marginTop:10,
    flex: 1,
    backgroundColor: 'white',
  },

  headerContainer: {
    marginTop: 20,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },

  backgroundWrapper: {
    position: 'relative',
    backgroundColor: "#356F59",
  },

  topBackground: {
    backgroundColor: 'white',
    height: 180,
    borderBottomLeftRadius: 200,
    borderBottomRightRadius: 200,
  },

  bottomBackground: {
    position: 'absolute',
    top: 125,
    left: 0,
    right: 0,
    height: 180,
    backgroundColor: 'white',
    borderTopLeftRadius: 200,
    borderTopRightRadius: 200,
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
    marginBottom: 0,
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

  linkText: {
    color: '#356F59',
    marginTop: 10,
    fontStyle: 'italic',
    textDecorationLine: 'underline',
  },

  divider: {
    height: 4,
    backgroundColor: 'green',
    marginHorizontal: 20,
    marginTop: 20,
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
  emptyText: {
    textAlign: 'center',
    color: 'gray',
    fontSize: 14,
    marginTop: 20,
  },
});

export default CProfileScreen;
