import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createFoodPost } from '../../apis/userAPI';

export default function RPost({ navigation }) {
  const [images, setImages] = useState([]);
  const [foodType, setFoodType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [bestBefore, setBestBefore] = useState('');
  const [description, setDescription] = useState('');

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Denied', 'Permission to access gallery is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const selectedUris = result.assets.map((asset) => asset.uri);
      setImages((prev) => [...prev, ...selectedUris]);
    }
  };

  const handleSave = async () => {
    if (!foodType || !quantity || !bestBefore || !description || images.length === 0) {
      Alert.alert('Error', 'All fields and at least one image are required.');
      return;
    }

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to post.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const storedUser = await AsyncStorage.getItem('user');
      const parsedUser = JSON.parse(storedUser);

      const formData = new FormData();
      formData.append('foodType', foodType);
      formData.append('quantity', quantity);
      formData.append('bestBefore', bestBefore);
      formData.append('description', description);
      formData.append('createdBy', parsedUser._id);
      formData.append('latitude', latitude);
      formData.append('longitude', longitude);

      images.forEach((uri) => {
        const fileName = uri.split('/').pop();
        const fileType = fileName.split('.').pop().toLowerCase();

        formData.append('images', {
          uri: uri.startsWith('file://') ? uri : `file://${uri}`,
          name: fileName,
          type: `image/${fileType}`,
        });
      });

      await createFoodPost(formData);
      Alert.alert('Success', 'Food post created!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to create food post.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Create Food Post</Text>

      <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
        <Text style={styles.uploadButtonText}>Select Images</Text>
      </TouchableOpacity>

      {images.length > 0 && (
        <View style={styles.imageGallery}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {images.map((img, index) => (
              <Image key={index} source={{ uri: img }} style={styles.previewImage} />
            ))}
          </ScrollView>
        </View>
      )}

      <TextInput
        placeholder="Food Type (e.g., Biryani, BBQ)"
        value={foodType}
        onChangeText={setFoodType}
        style={styles.input}
        placeholderTextColor="#888"
      />

      <TextInput
        placeholder="Quantity (e.g., 5 people)"
        value={quantity}
        onChangeText={setQuantity}
        style={styles.input}
        placeholderTextColor="#888"
      />

      <TextInput
        placeholder="Best Before (YYYY-MM-DD)"
        value={bestBefore}
        onChangeText={setBestBefore}
        style={styles.input}
        placeholderTextColor="#888"
      />

      <TextInput
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        style={[styles.input, styles.textArea]}
        placeholderTextColor="#888"
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Post</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 25,
    padding: 16,
    backgroundColor: '#FFFFFF',
    flexGrow: 1,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#000099',
  },
  uploadButton: {
    backgroundColor: '#00CCCC',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageGallery: {
    marginBottom: 16,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 10,
  },
  input: {
    backgroundColor: '#F0F0F0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 15,
    color: '#000',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#000099',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
