import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Text,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons, Entypo } from '@expo/vector-icons';
import PostCard from './PostCard';

const ProfilePostCard = ({ post, currentUserId, onDelete, onEdit, ...props }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const isCurrentUserPost = post.createdBy === currentUserId;

  const handleEdit = () => {
    setMenuVisible(false);
    onEdit(post);
  };

  const handleDelete = async () => {
    setMenuVisible(false);
    setLoading(true);
    try {
      await onDelete(post._id);
    } catch (error) {
      Alert.alert('Error', 'Failed to delete post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <PostCard post={post} currentUserId={currentUserId} {...props} />

      {isCurrentUserPost && (
        <>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setMenuVisible(true)}
            disabled={loading}
          >
            <Entypo name="dots-three-vertical" size={20} color="#666" />
          </TouchableOpacity>

          <Modal
            visible={menuVisible}
            transparent
            animationType="fade"
            onRequestClose={() => !loading && setMenuVisible(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPressOut={() => !loading && setMenuVisible(false)}
            >
              <View style={styles.menuContainer}>
                <TouchableOpacity
                  style={styles.menuOption}
                  onPress={handleEdit}
                  disabled={loading}
                >
                  <MaterialIcons name="edit" size={20} color="#000099" />
                  <Text style={styles.menuOptionText}>Edit Post</Text>
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity
                  style={styles.menuOption}
                  onPress={handleDelete}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#ff4444" />
                  ) : (
                    <>
                      <MaterialIcons name="delete" size={20} color="#ff4444" />
                      <Text style={styles.menuOptionText}>Delete Post</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: 20,
  },
  menuButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
    zIndex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  menuContainer: {
    width: 200,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  menuOptionText: {
    marginLeft: 15,
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginHorizontal: 10,
  },
});

export default ProfilePostCard;
