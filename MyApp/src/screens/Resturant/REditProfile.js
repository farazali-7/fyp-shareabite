import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker'; 
// import axios from 'axios'; 
// import AsyncStorage from '@react-native-async-storage/async-storage';

const  REditProfileScreen = ({ navigation }) => {
  const dummyUserData = {
    _id: '123456',
    role: 'restaurant',
    userName: 'Faraz Bhatti',
    email: 'faraz@example.com',
    contactNumber: '03001234567',
    password: '',
    profileImage: 'https://i.pravatar.cc/300',
    licenseImage: 'https://via.placeholder.com/300x200',
    profileCompleted: true,
    status: 'approved',
    approvedByAdmin: true,
    location: 'Lahore, Pakistan',
    operatingHours: '10 AM - 10 PM',
    cuisineType: 'Pakistani, BBQ',
  };

  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setFormData(dummyUserData);
  }, []);

  const handleChange = (field, value) => {
    if (isEditing) {
      setFormData(prevState => ({
        ...prevState,
        [field]: value,
      }));
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setIsEditing(false);
      // const token = await AsyncStorage.getItem('token');
      // await axios.put('your-server-url/api/users/update', formData, { headers: { Authorization: `Bearer ${token}` } });

      Alert.alert('Saved', 'Profile updated successfully (Dummy for now)');
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save changes.');
    }
  };

  const handleProfileImageUpload = async () => {
    if (!isEditing) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need permission to access your photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.cancelled) {
      setFormData(prevState => ({
        ...prevState,
        profileImage: result.uri,
      }));
    }
  };

  const handleLicenseView = () => {
    Alert.alert('License Image', 'License image full preview coming soon.');
    // Later: Open full screen image view modal
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

export default  REditProfileScreen;
