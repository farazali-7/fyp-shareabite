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
  Modal,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getUserProfile, deletePost, editPost } from '../../apis/userAPI';
import ProfilePostCard from './RProfilePostCard';

const RProfileScreen = () => {
  const navigation = useNavigation();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [editForm, setEditForm] = useState({
    description: '',
    foodType: '',
    quantity: '',
    bestBefore: ''
  });

  const fetchProfile = async () => {
    try {
      const data = await getUserProfile();
      if (data?.user) {
        setProfile(data.user);
        setPosts(data.posts || []);
      } else {
        setProfile(null);
        setPosts([]);
      }
    } catch {
      Alert.alert('Error', 'Failed to load profile.');
      setProfile(null);
      setPosts([]);
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

  const handleDeletePost = async (postId) => {
    if (isDeleting) return;
    try {
      Alert.alert(
        'Confirm Delete',
        'Are you sure you want to delete this post?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            onPress: async () => {
              setIsDeleting(true);
              try {
                await deletePost(postId);
                await fetchProfile();
              } catch {
                Alert.alert('Error', 'Failed to delete post.');
              } finally {
                setIsDeleting(false);
              }
            },
            style: 'destructive',
          },
        ]
      );
    } catch {
      Alert.alert('Error', 'Failed to delete post.');
      setIsDeleting(false);
    }
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setEditForm({
      description: post.description || '',
      foodType: post.foodType || '',
      quantity: post.quantity ? post.quantity.toString() : '',
      bestBefore: post.bestBefore || ''
    });
    setEditModalVisible(true);
  };

  const handleFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveEditedPost = async () => {
    if (!editingPost) return;
    try {
      setIsEditing(true);
      await editPost(editingPost._id, {
        ...editForm,
        quantity: Number(editForm.quantity)
      });
      setEditModalVisible(false);
      await fetchProfile();
    } catch {
      Alert.alert('Error', 'Failed to update post.');
    } finally {
      setIsEditing(false);
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
        <Text style={styles.userName}>{profile?.userName}</Text>
        <Text style={styles.roleText}>
          Role: {profile?.role === 'restaurant' ? 'Eatery' : 'Charity House'}
        </Text>
        <TouchableOpacity onPress={handleViewDetails}>
          <Text style={styles.linkText}>View Full Details</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {profile.role === 'restaurant' && (
        posts.length > 0 ? (
          <View style={styles.postsContainer}>
            <Text style={styles.postsHeader}>Your Posts</Text>
            {posts.map((post) => (
              <ProfilePostCard
                key={post._id}
                post={{ ...post, images: post.foodImages || [] }}
                currentUserId={profile._id}
                currentUserRole={profile.role}
                onDelete={handleDeletePost}
                onEdit={handleEditPost}
                isDeleting={isDeleting}
              />
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>You haven't posted anything yet.</Text>
        )
      )}

      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => !isEditing && setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Post</Text>

            <Text style={styles.inputLabel}>Food Type</Text>
            <TextInput
              style={styles.editInput}
              value={editForm.foodType}
              onChangeText={(text) => handleFormChange('foodType', text)}
              placeholder="Enter food type"
              editable={!isEditing}
            />

            <Text style={styles.inputLabel}>Quantity</Text>
            <TextInput
              style={styles.editInput}
              value={editForm.quantity}
              onChangeText={(text) => handleFormChange('quantity', text)}
              placeholder="Enter quantity"
              keyboardType="numeric"
              editable={!isEditing}
            />

            <Text style={styles.inputLabel}>Best Before</Text>
            <TextInput
              style={styles.editInput}
              value={editForm.bestBefore}
              onChangeText={(text) => handleFormChange('bestBefore', text)}
              placeholder="Enter best before date"
              editable={!isEditing}
            />

            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.editInput, { minHeight: 100 }]}
              multiline
              value={editForm.description}
              onChangeText={(text) => handleFormChange('description', text)}
              placeholder="Enter description"
              editable={!isEditing}
            />

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => !isEditing && setEditModalVisible(false)}
                disabled={isEditing}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveEditedPost}
                disabled={isEditing}
              >
                {isEditing ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 2, borderColor: '#00CCCC',
  },
  userName: { fontSize: 22, fontWeight: 'bold', marginTop: 12, color: '#000099' },
  roleText: { fontSize: 14, color: '#555', marginTop: 4 },
  linkText: { color: '#00CCCC', marginTop: 10, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#00CCCC', marginHorizontal: 20, marginVertical: 16 },
  postsContainer: { paddingHorizontal: 16, paddingBottom: 24 },
  postsHeader: { fontSize: 18, fontWeight: 'bold', color: '#000099', marginBottom: 10 },
  emptyText: { textAlign: 'center', color: 'gray', fontSize: 14, marginTop: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%', backgroundColor: 'white',
    borderRadius: 10, padding: 20, maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18, fontWeight: 'bold',
    color: '#000099', marginBottom: 15, textAlign: 'center',
  },
  inputLabel: { fontSize: 14, fontWeight: '600', marginBottom: 5, color: '#333' },
  editInput: {
    borderWidth: 1, borderColor: '#ddd',
    borderRadius: 5, padding: 10, marginBottom: 15, fontSize: 14,
  },
  modalButtonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  modalButton: {
    padding: 12, borderRadius: 5, width: '48%',
    alignItems: 'center', justifyContent: 'center',
  },
  cancelButton: { backgroundColor: '#ccc' },
  saveButton: { backgroundColor: '#000099' },
  buttonText: { color: 'white', fontWeight: 'bold' },
});

export default RProfileScreen;
