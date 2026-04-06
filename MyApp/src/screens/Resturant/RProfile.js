import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserProfile, deletePost, editPost } from '../../apis/userAPI';
import ProfilePostCard from './RProfilePostCard';
import socket from '../../../socket';

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

  useEffect(() => { fetchProfile(); }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProfile();
  }, []);

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.multiRemove(['token', 'user', 'userId']);
          socket.disconnect();
          navigation.reset({ index: 0, routes: [{ name: 'AuthStack' }] });
        },
      },
    ]);
  };

  const handleDeletePost = async (postId) => {
    if (isDeleting) return;
    Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
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
      },
    ]);
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

  const saveEditedPost = async () => {
    if (!editingPost) return;
    try {
      setIsEditing(true);
      await editPost(editingPost._id, { ...editForm, quantity: Number(editForm.quantity) });
      setEditModalVisible(false);
      await fetchProfile();
    } catch {
      Alert.alert('Error', 'Failed to update post.');
    } finally {
      setIsEditing(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator size="small" color="#356F59" style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.emptyText}>No profile data found.</Text>
      </SafeAreaView>
    );
  }

  const initial = profile.userName ? profile.userName.charAt(0).toUpperCase() : '?';

  const ACCOUNT_ROWS = [
    { label: 'Edit Profile',     onPress: () => navigation.navigate('EditProfile') },
    { label: 'Search Users',     onPress: () => navigation.navigate('Search') },
    { label: 'Post History',     onPress: () => navigation.navigate('History') },
  ];

  const SUPPORT_ROWS = [
    { label: 'Contact Us',       onPress: () => navigation.navigate('ContactUs') },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#356F59" />}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar + identity */}
        <View style={styles.profileSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <Text style={styles.userName}>{profile.userName}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>Eatery</Text>
          </View>
          {profile.email ? <Text style={styles.subText}>{profile.email}</Text> : null}
          {profile.contactNumber ? <Text style={styles.subText}>{profile.contactNumber}</Text> : null}
        </View>

        {/* Account section */}
        <View style={styles.sectionDivider} />
        <Text style={styles.sectionLabel}>Account</Text>
        {ACCOUNT_ROWS.map((item, i) => (
          <TouchableOpacity
            key={item.label}
            style={[styles.row, i < ACCOUNT_ROWS.length - 1 && styles.rowBorder]}
            activeOpacity={0.6}
            onPress={item.onPress}
          >
            <Text style={styles.rowLabel}>{item.label}</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}

        {/* Support section */}
        <View style={styles.sectionDivider} />
        <Text style={styles.sectionLabel}>Support</Text>
        {SUPPORT_ROWS.map((item, i) => (
          <TouchableOpacity
            key={item.label}
            style={[styles.row, i < SUPPORT_ROWS.length - 1 && styles.rowBorder]}
            activeOpacity={0.6}
            onPress={item.onPress}
          >
            <Text style={styles.rowLabel}>{item.label}</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}

        {/* Posts section */}
        <View style={styles.sectionDivider} />
        <Text style={styles.sectionLabel}>
          Your Posts{posts.length > 0 ? `  ${posts.length}` : ''}
        </Text>
        {posts.length > 0 ? (
          posts.map((post) => (
            <ProfilePostCard
              key={post._id}
              post={{ ...post, images: post.foodImages || [] }}
              currentUserId={profile._id}
              currentUserRole={profile.role}
              onDelete={handleDeletePost}
              onEdit={handleEditPost}
              isDeleting={isDeleting}
            />
          ))
        ) : (
          <Text style={styles.emptyText}>No posts yet.</Text>
        )}

        {/* Logout */}
        <View style={styles.sectionDivider} />
        <TouchableOpacity style={styles.logoutRow} onPress={handleLogout} activeOpacity={0.6}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Edit Post Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => !isEditing && setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Edit Post</Text>
            {(['foodType', 'quantity', 'bestBefore', 'description']).map((field) => (
              <View key={field} style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>
                  {field === 'foodType' ? 'Food Type'
                    : field === 'bestBefore' ? 'Best Before'
                    : field.charAt(0).toUpperCase() + field.slice(1)}
                </Text>
                <TextInput
                  style={[styles.fieldInput, field === 'description' && { minHeight: 80 }]}
                  multiline={field === 'description'}
                  keyboardType={field === 'quantity' ? 'numeric' : 'default'}
                  value={editForm[field]}
                  onChangeText={(text) => setEditForm((p) => ({ ...p, [field]: text }))}
                  placeholder={`Enter ${field}`}
                  placeholderTextColor="#ABABAB"
                  editable={!isEditing}
                />
              </View>
            ))}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => !isEditing && setEditModalVisible(false)}
                disabled={isEditing}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={saveEditedPost}
                disabled={isEditing}
              >
                {isEditing
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.saveBtnText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default RProfileScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  scroll: { flex: 1, backgroundColor: '#fff' },
  profileSection: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F1EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: '#356F59' },
  userName: { fontSize: 20, fontWeight: '700', color: '#1C1C1E', marginBottom: 6 },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: '#E8F1EE',
    marginBottom: 6,
  },
  roleBadgeText: { fontSize: 12, fontWeight: '600', color: '#356F59' },
  subText: { fontSize: 13, color: '#ABABAB', marginTop: 2 },
  sectionDivider: { height: 8, backgroundColor: '#F6F6F6' },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ABABAB',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  rowLabel: { flex: 1, fontSize: 15, color: '#1C1C1E' },
  chevron: { fontSize: 20, color: '#C7C7CC', lineHeight: 24 },
  emptyText: { textAlign: 'center', color: '#ABABAB', fontSize: 14, marginTop: 16, marginBottom: 8 },
  logoutRow: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  logoutText: { fontSize: 15, color: '#E53935', fontWeight: '500' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 17, fontWeight: '700', color: '#1C1C1E',
    marginBottom: 16, textAlign: 'center',
  },
  fieldWrap: { marginBottom: 12 },
  fieldLabel: { fontSize: 13, fontWeight: '500', color: '#6B6B6B', marginBottom: 4 },
  fieldInput: {
    borderWidth: 1, borderColor: '#E2E2E2', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: '#1C1C1E',
  },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: {
    flex: 1, height: 44, borderRadius: 8, borderWidth: 1,
    borderColor: '#E2E2E2', alignItems: 'center', justifyContent: 'center',
  },
  cancelBtnText: { fontSize: 15, color: '#1C1C1E', fontWeight: '500' },
  saveBtn: {
    flex: 1, height: 44, borderRadius: 8,
    backgroundColor: '#356F59', alignItems: 'center', justifyContent: 'center',
  },
  saveBtnText: { fontSize: 15, color: '#fff', fontWeight: '600' },
});
