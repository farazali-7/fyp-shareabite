import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from './axiosInstance';

export const getUserStatus = async (userId) => {
  try {
    const res = await axiosInstance.get(`/users/${userId}/status`);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || 'Failed to fetch user status');
  }
};

export const checkUserExists = async ({ email, contactNumber }) => {
  try {
    const res = await axiosInstance.post('/users/check-user', { email, contactNumber });
    return res.data.exists;
  } catch (err) {
    throw err.response?.data?.message || err.message || 'Something went wrong.';
  }
};

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

export const loginUser = async ({ email, password, role }) => {
  try {
    const res = await axiosInstance.post('/users/login', { email, password, role });
    return res.data;
  } catch (err) {
    throw err.response?.data?.message || err.message || 'Login failed.';
  }
};

export const getUserProfile = async () => {
  const storedUser = await AsyncStorage.getItem('user');
  const parsedUser = JSON.parse(storedUser);
  const token = parsedUser?.token;

  const res = await axiosInstance.get('/users/profile', {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
};

export const getUserDetailsById = async (userId) => {
  try {
    const res = await axiosInstance.get(`/users/profile/details/${userId}`);
    return res.data;
  } catch (err) {
    throw err.response?.data?.message || 'Failed to fetch user details';
  }
};

export const searchUsers = async (query) => {
  try {
    const res = await axiosInstance.get(`/users/search/${query}`);
    return res.data;
  } catch (err) {
    throw err.response?.data?.message || 'Failed to search users';
  }
};

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

export const fetchAllFoodPosts = async () => {
  try {
    const res = await axiosInstance.get('/users/all');
    return res.data;
  } catch (err) {
    throw err.response?.data?.message || 'Failed to fetch food posts.';
  }
};
