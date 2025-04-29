import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, Alert,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

const EditPostScreen = (navigation) => {
  const route = useRoute();
  const { post } = route.params;  // Safely received now

  // Prefilling with existing post data
  const [foodType, setFoodType] = useState(post?.foodType || '');
  const [quantity, setQuantity] = useState(post?.quantity || '');
  const [bestBefore, setBestBefore] = useState(post?.bestBefore || '');
  const [description, setDescription] = useState(post?.description || '');
  const [images, setImages] = useState(post?.images || []);

  // 📍 Pick a new image
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.cancelled) {
      setImages([...images, result.uri]);
    }
  };

  // 📍 Remove image by index
  const handleRemoveImage = (index) => {
    const updatedImages = images.filter((_, idx) => idx !== index);
    setImages(updatedImages);
  };

  const handleSave = () => {
    const updatedPost = {
      foodType,
      quantity,
      bestBefore,
      description,
      images,
    };

    // ✅ Update Post API (inside comment)
    {/* 
    axios.put(`http://yourserver.com/api/posts/${post._id}`, updatedPost)
      .then(res => {
        console.log('Post updated successfully');
        navigation.goBack();
      })
      .catch(err => console.error('Error updating post', err));
    */}

    Alert.alert('Post Updated', 'Changes saved successfully!', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Edit Post</Text>

      <TextInput
        placeholder="Food Type"
        style={styles.input}
        value={foodType}
        onChangeText={setFoodType}
      />

      <TextInput
        placeholder="Quantity"
        style={styles.input}
        value={quantity}
        onChangeText={setQuantity}
      />

      <TextInput
        placeholder="Best Before (YYYY-MM-DD)"
        style={styles.input}
        value={bestBefore}
        onChangeText={setBestBefore}
      />

      <TextInput
        placeholder="Description"
        style={[styles.input, { height: 100 }]}
        multiline
        value={description}
        onChangeText={setDescription}
      />

      <Text style={styles.subheading}>Images:</Text>

      <ScrollView horizontal>
        {images.map((img, idx) => (
          <View key={idx} style={{ marginRight: 10 }}>
            <Image source={{ uri: img }} style={styles.image} />
            <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveImage(idx)}>
              <Text style={{ color: 'red', fontWeight: 'bold' }}>X</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.addButton} onPress={pickImage}>
        <Text style={styles.addButtonText}>+ Add New Image</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  subheading: { fontSize: 16, fontWeight: '600', marginVertical: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 15 },
  image: { width: 100, height: 100, borderRadius: 8 },
  removeButton: { position: 'absolute', top: 2, right: 2, backgroundColor: '#fff', padding: 2, borderRadius: 10 },
  addButton: { backgroundColor: '#28a745', padding: 12, borderRadius: 10, alignItems: 'center', marginBottom: 20 },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  saveButton: { backgroundColor: '#007bff', padding: 15, borderRadius: 10, alignItems: 'center' },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default EditPostScreen;
