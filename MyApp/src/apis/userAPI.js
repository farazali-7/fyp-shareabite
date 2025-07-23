// src/apis/userAPI.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from './axiosInstance';

// Check if user exists
export const checkUserExists = async ({ email, contactNumber }) => {
  try {
    const res = await axiosInstance.post('/users/check-user', { email, contactNumber });
    return res.data.exists;
  } catch (err) {
    throw err.response?.data?.message || err.message || 'Something went wrong.';
  }
};

// Register a new user
export const registerUser = async (formData) => {
  try {
    const config = {
      headers: { 'Content-Type': 'multipart/form-data' },
    };
    const res = await axiosInstance.post('/users/register', formData, config);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || err.message || 'Something went wrong.');
  }
};

// Login user
export const loginUser = async ({ email, password, role }) => {
  try {
    const res = await axiosInstance.post('/users/login', { email, password, role });
    return res.data;
  } catch (err) {
    throw err.response?.data?.message || err.message || 'Login failed.';
  }
};

// Get current user's profile & posts
export const getUserProfile = async () => {
  const storedUser = await AsyncStorage.getItem('user');
  const parsedUser = JSON.parse(storedUser);
  const token = parsedUser?.token;

  const res = await axiosInstance.get('/users/profile', {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
};

// Get another user's profile details by ID
export const getUserDetailsById = async (userId) => {
  try {
    const res = await axiosInstance.get(`/users/profile/details/${userId}`);
    return res.data;
  } catch (err) {
    throw err.response?.data?.message || 'Failed to fetch user details';
  }
};

// Search user profiles
export const searchUsers = async (query) => {
  try {
    const res = await axiosInstance.get(`/users/search/${query}`);
    return res.data;
  } catch (err) {
    throw err.response?.data?.message || 'Failed to search users';
  }
};

// Subscribe or unsubscribe to a user
export const subscribeToUser = async (targetId, currentUserId) => {
  try {
    const res = await axiosInstance.post(`/users/subscribe/${targetId}`, {
      currentUserId,
    });
    return res.data;
  } catch (err) {
    throw err.response?.data?.message || 'Failed to subscribe/unsubscribe';
  }
};

// Update user profile with image
export const updateUserProfile = async (userId, formData) => {
  try {
    const res = await axiosInstance.put(`/users/updateProfile/${userId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  } catch (err) {
    throw err.response?.data?.message || 'Failed to update profile';
  }
};

// Create food post
export const createFoodPost = async (formData) => {
  try {
    const storedUser = await AsyncStorage.getItem('user');
    const parsedUser = JSON.parse(storedUser);
    const token = parsedUser?.token;

    const res = await axiosInstance.post('/users/create', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    return res.data;
  } catch (err) {
    throw err.response?.data?.message || 'Failed to create food post';
  }
};

// Request food post
export const requestFoodPost = async ({ postId, requesterId, receiverId }) => {
  try {
    const res = await axiosInstance.post('/requests/request', {
      postId,
      requesterId,
      receiverId,
    });
    return res.data;
  } catch (err) {
    throw err.response?.data?.message || 'Failed to send request.';
  }
};

// Fetch all food posts for home screen
export const fetchAllFoodPosts = async () => {
  try {
    const res = await axiosInstance.get('/users/all');
    return res.data;
  } catch (err) {
    throw err.response?.data?.message || 'Failed to fetch food posts.';
  }
};
