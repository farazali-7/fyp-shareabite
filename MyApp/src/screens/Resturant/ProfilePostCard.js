import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, Modal, Pressable, ScrollView } from 'react-native';
import { Entypo } from '@expo/vector-icons';

const ProfilePostCard = ({ post, currentUserId }) => {
  const [menuVisible, setMenuVisible] = useState(false);

  const handleEdit = () => {
    setMenuVisible(false);
    Alert.alert("Edit", `Edit post: ${post._id}`);
  };

  const handleDelete = () => {
    setMenuVisible(false);
    Alert.alert("Delete", `Delete post: ${post._id}`);
  };

  const isOwnPost = post.userId === currentUserId;

  return (
    <View style={styles.card}>
      <ScrollView horizontal>
        {post.images.map((img, idx) => (
          <Image key={idx} source={{ uri: img }} style={styles.image} />
        ))}
      </ScrollView>

      <View style={styles.header}>
        <Text style={styles.title}>{post.foodType} - {post.quantity}</Text>
        {isOwnPost && (
          <TouchableOpacity onPress={() => setMenuVisible(true)}>
            <Entypo name="dots-three-vertical" size={18} color="#000" />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.description}>{post.description}</Text>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menu}>
            <TouchableOpacity onPress={handleEdit}>
              <Text style={styles.menuItem}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete}>
              <Text style={styles.menuItem}>Delete</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default ProfilePostCard;

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    borderColor: '#00CCCC',
    borderWidth: 1,
  },
  image: {
    width: 120,
    height: 100,
    borderRadius: 10,
    marginRight: 8,
  },
  header: {
    marginTop: 8,
    marginBottom: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000099',
  },
  description: {
    fontSize: 14,
    color: '#555',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  menu: {
    backgroundColor: 'white',
    marginHorizontal: 100,
    padding: 16,
    borderRadius: 10,
    elevation: 5,
  },
  menuItem: {
    fontSize: 16,
    paddingVertical: 8,
    color: '#000',
  },
});
