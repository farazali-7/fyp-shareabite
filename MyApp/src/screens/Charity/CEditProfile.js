import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getUserProfile, updateUserProfile } from '../../apis/userAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CEditProfileScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [userId, setUserId] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        const parsedUser = JSON.parse(storedUser);
        setUserId(parsedUser._id);

        const profile = await getUserProfile(); // API call
        console.log(profile)
        setFormData(profile.user);
      } catch (err) {
        Alert.alert('Error', 'Failed to load profile.');
      }
    };

    loadUser();
  }, []);

  const handleChange = (field, value) => {
    if (isEditing) {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleEdit = () => setIsEditing(true);

  const handleSave = async () => {
    try {
      const updatedForm = new FormData();
      updatedForm.append('userName', formData.userName);
      updatedForm.append('operatingHours', formData.operatingHours);
      if (formData.role === 'restaurant') {
        updatedForm.append('cuisineType', formData.cuisineType);
      }
      if (profileImageFile) {
        const filename = profileImageFile.split('/').pop();
        const type = `image/${filename.split('.').pop()}`;
        updatedForm.append('profileImage', {
          uri: profileImageFile,
          type,
          name: filename,
        });
      }

      await updateUserProfile(userId, updatedForm);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error(' Update error:', error);
      Alert.alert('Error', 'Failed to save changes.');
    }
  };

  const handleProfileImageUpload = async () => {
    if (!isEditing) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Access to media library is needed.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.cancelled) {
      setProfileImageFile(result.uri);
      setFormData(prev => ({ ...prev, profileImage: result.uri }));
    }
  };

  const handleLicenseView = () => {
    Alert.alert('License Image', 'License image view coming soon.');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>

      {/* Profile Image */}
      <TouchableOpacity onPress={handleProfileImageUpload} activeOpacity={0.7}>
        <Image
          source={{ uri: formData.profileImage }}
          style={styles.profileImage}
        />
        {isEditing && <Text style={styles.uploadText}>Change Profile Image</Text>}
      </TouchableOpacity>

     
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Role</Text>
        <TextInput
          style={[styles.input, styles.disabledInput]}
          value={formData.role}
          editable={false}
        />
      </View>

      {/* User Name */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>User Name</Text>
        <TextInput
          style={styles.input}
          value={formData.userName}
          onChangeText={(text) => handleChange('userName', text)}
          editable={isEditing}
        />
      </View>

      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email </Text>
        <TextInput
          style={[styles.input, styles.disabledInput]}
          value={formData.email}
          editable={false}
        />
      </View>

      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Contact Number </Text>
        <TextInput
          style={[styles.input, styles.disabledInput]}
          value={formData.contactNumber}
          editable={false}
        />
      </View>

     

      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Operating Hours</Text>
        <TextInput
          style={styles.input}
          value={formData.operatingHours}
          onChangeText={(text) => handleChange('operatingHours', text)}
          editable={isEditing}
        />
      </View>

      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Cuisine Type</Text>
        <TextInput
          style={styles.input}
          value={formData.cuisineType}
          onChangeText={(text) => handleChange('cuisineType', text)}
          editable={isEditing}
        />
      </View>

      {/* License Image */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>License Image (Click to View)</Text>
        <TouchableOpacity onPress={handleLicenseView} activeOpacity={0.8}>
          <View style={styles.licenseContainer}>
            <Image
              source={{ uri: formData.licenseImage }}
              style={styles.licenseImage}
            />
          </View>
        </TouchableOpacity>
      </View>

      
      {!isEditing ? (
        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.buttonText}>Save Changes</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
 
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 50,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#4CAF50',
    marginBottom: 10,
  },
  uploadText: {
    fontSize: 14,
    color: '#007bff',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 18,
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    fontWeight: '600',
    color: '#555',
  },
  input: {
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  disabledInput: {
    backgroundColor: '#e0e0e0',
    color: '#777',
  },
  licenseContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 10,
  },
  licenseImage: {
    width: 250,
    height: 160,
    resizeMode: 'contain',
    borderRadius: 8,
  },
  editButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 30,
    alignItems: 'center',
    width: '100%',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 30,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default  CEditProfileScreen;
 