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
import { Entypo } from '@expo/vector-icons';

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
    bestBefore: '',
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
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setEditForm({
      description: post.description || '',
      foodType: post.foodType || '',
      quantity: post.quantity ? post.quantity.toString() : '',
      bestBefore: post.bestBefore || '',
    });
    setEditModalVisible(true);
  };

  const handleFormChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const saveEditedPost = async () => {
    if (!editingPost) return;
    try {
      setIsEditing(true);
      await editPost(editingPost._id, {
        ...editForm,
        quantity: Number(editForm.quantity),
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
  {/* Header */}
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
        transparent
        onRequestClose={() => !isEditing && setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Post</Text>

            {['foodType', 'quantity', 'bestBefore', 'description'].map((field) => (
              <View key={field}>
                <Text style={styles.inputLabel}>{field.replace(/([A-Z])/g, ' $1')}</Text>
                <TextInput
                  style={[styles.editInput, field === 'description' && { minHeight: 100 }]}
                  multiline={field === 'description'}
                  keyboardType={field === 'quantity' ? 'numeric' : 'default'}
                  value={editForm[field]}
                  onChangeText={(text) => handleFormChange(field, text)}
                  placeholder={`Enter ${field}`}
                  editable={!isEditing}
                />
              </View>
            ))}

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
                {isEditing ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor:"#356F59",
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
    color: 'b;ack',
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
  },

  postsContainer: {
    backgroundColor:'#e6e6e6',
    paddingHorizontal: 1,
    paddingBottom: 24,
  },

  postsHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 10,
  },

  emptyText: {
    textAlign: 'center',
    color: 'gray',
    fontSize: 14,
    marginTop: 20,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 15,
    textAlign: 'center',
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },

  editInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 14,
  },

  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  modalButton: {
    padding: 12,
    borderRadius: 5,
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelButton: {
    backgroundColor: '#ccc',
  },

  saveButton: {
    backgroundColor: '#356F59',
  },

  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});


export default RProfileScreen;