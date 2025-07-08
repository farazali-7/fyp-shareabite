// src/apis/userAPI.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from './axiosInstance';

// Check if user exists
export const checkUserExists = async ({ email, contactNumber }) => {
  try {
    const res = await axiosInstance.post('/users/check-user', {
      email,
      contactNumber,
    });
    return res.data.exists;
  } catch (err) {
    throw err.response?.data?.message || err.message || 'Something went wrong.';
  }
};

//  Register a new user
export const registerUser = async (formData) => {
  try {
    const config = {
      headers: { 'Content-Type': 'multipart/form-data' },
    };
    const res = await axiosInstance.post('/users/register', formData, config);
    return res.data;
  } catch (err) {
    const errorMessage =
      err.response?.data?.message || err.message || 'Something went wrong.';
    throw new Error(errorMessage); 
  }
};

//  Login user
export const loginUser = async ({ email, password, role }) => {
  try {
    const res = await axiosInstance.post('/users/login', {
      email,
      password,
      role,
    });
    console.log(" API Success (loginUser):", res.data);
    return res.data;
  } catch (err) {
    console.error(" API Login Error:", err);
    throw err.response?.data?.message || err.message || 'Login failed.';
  }
};

// Get profile & posts
export const getUserProfile = async () => {
  const storedUser = await AsyncStorage.getItem('user');
  const parsedUser = JSON.parse(storedUser);
  const token = parsedUser?.token;

  const res = await axiosInstance.get('/users/profile', {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
};


//Get Profile Details 
export const getUserDetailsById = async (userId) => {
  try {
    const res = await axiosInstance.get("/users/profile/details/" + userId);
    console.log(res)
    return res.data;
  } catch (err) {
    console.log(err)
    throw err.response?.data?.message || 'Failed to fetch user details';
  }
};



// Search Profiles 
export const searchUsers = async (query) => {
  try {
    const res = await axiosInstance.get(`/users/search/${query}`);
    return res.data; // array of users
  } catch (err) {
    throw err.response?.data?.message || 'Failed to search users';
  }
};

//subscribe and unsubscribe 

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


//Edit Profle 
// PUT user profile update with image
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
    console.log(err)
    throw err.response?.data?.message || 'Failed to create food post';
  }
};

//request food 
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

export const getCharityNotifications = async () => {
  try {
    const res = await axiosInstance.get('/users/charityNotifications');
    return res.data;
  } catch (err) {
    console.log(err)
    throw err.response?.data?.message || 'Failed to fetch charity notifications';
  }
};

//  Fetch all food posts for home screen
export const fetchAllFoodPosts = async () => {
  try {
    const res = await axiosInstance.get('/users/all');
    return res.data; 
  } catch (err) {
    console.error(" Failed to fetch food posts:", err);
    throw err.response?.data?.message || 'Failed to fetch food posts.';
  }
};
