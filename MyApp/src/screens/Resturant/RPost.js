import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, Image, ScrollView, Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { v4 as uuidv4 } from 'uuid';

export default function RPost() {
  const navigation = useNavigation();
  const [images, setImages] = useState([]);
  const [foodType, setFoodType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [bestBefore, setBestBefore] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(null);


  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location access is required.');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    })();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.cancelled) {
      setImages([...images, result.uri]);
    }
  };

  const handleSave = () => {
   if (!foodType || !quantity /*|| !bestBefore || !description || images.length === 0 || !location*/) {
      Alert.alert('Missing Fields', 'Please fill all fields and add an image.');
      return;
    }
    console.log(images);
console.log(foodType);
console.log(quantity);
console.log(bestBefore);
console.log(description);
console.log(location);



    const newPost = {
    //  id: uuidv4(),
      userName: 'You',
      images,
      foodType,
      quantity,
      bestBefore,
      description,
      latitude: location.latitude,
      longitude: location.longitude,
      createdAt: new Date().toISOString(),
    };

    navigation.navigate('Home');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Create New Post</Text>

      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        <Text style={styles.imagePickerText}>+ Add Image</Text>
      </TouchableOpacity>

      <ScrollView horizontal>
        {images.map((img, index) => (
          <Image key={index} source={{ uri: img }} style={styles.previewImage} />
        ))}
      </ScrollView>

      <TextInput placeholder="Food Type" value={foodType} onChangeText={setFoodType} style={styles.input} />
      <TextInput placeholder="Quantity (e.g., 2 people)" value={quantity} onChangeText={setQuantity} style={styles.input} />
      <TextInput placeholder="Best Before (e.g., 2025-04-08)" value={bestBefore} onChangeText={setBestBefore} style={styles.input} />
      <TextInput placeholder="Description" value={description} onChangeText={setDescription} multiline style={[styles.input, { height: 100 }]} />

      <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Save Post</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' },
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, alignSelf: 'center' },
  input: { backgroundColor: '#f0f0f0', padding: 12, borderRadius: 10, marginBottom: 12 },
  imagePicker: { backgroundColor: '#e0e0e0', padding: 10, borderRadius: 8, marginBottom: 10, alignItems: 'center' },
  imagePickerText: { color: '#333', fontWeight: 'bold' },
  previewImage: { width: 100, height: 100, marginRight: 10, borderRadius: 8 },
  saveButton: { backgroundColor: '#4CAF50', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  saveButtonText: { color: '#fff', fontWeight: 'bold' },
});
