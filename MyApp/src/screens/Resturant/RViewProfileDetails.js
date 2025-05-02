import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { getUserDetailsById } from '../../apis/userAPI'; 

export default function RViewProfileDetails() {
  const route = useRoute();
  const { userId } = route.params;

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const response = await getUserDetailsById(userId);
      setUserData(response.user);
    } catch (error) {
      console.error(' Failed to load user profile:', error);
      Alert.alert('Error', 'Failed to load user profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId){
      fetchUser();
    }
  }, [userId]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.loaderContainer}>
        <Text>No user data found.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Image
          source={{ uri: userData.profileImage || 'https://i.pravatar.cc/150?img=12' }}
          style={styles.profileImage}
        />

        <Text style={styles.role}>{userData.role?.toUpperCase()}</Text>

        <View style={styles.detailsContainer}>
          <Text style={styles.label}>User Name</Text>
          <Text style={styles.value}>{userData.userName}</Text>

          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{userData.email}</Text>

          <Text style={styles.label}>Contact Number</Text>
          <Text style={styles.value}>{userData.contactNumber}</Text>

          {userData.operatingHours && (
            <>
              <Text style={styles.label}>Operating Hours</Text>
              <Text style={styles.value}>{userData.operatingHours}</Text>
            </>
          )}

          {userData.cuisineType && (
            <>
              <Text style={styles.label}>Cuisine Type</Text>
              <Text style={styles.value}>{userData.cuisineType}</Text>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    marginTop: 14,
    padding: 20,
    alignItems: 'center',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#00CCCC',
  },
  role: {
    fontSize: 18,
    color: '#00CCCC',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  detailsContainer: {
    width: '100%',
  },
  label: {
    fontWeight: 'bold',
    marginTop: 12,
    fontSize: 16,
    color: '#000099',
  },
  value: {
    marginBottom: 8,
    fontSize: 18,
    color: '#00CCCC',
  },
});
