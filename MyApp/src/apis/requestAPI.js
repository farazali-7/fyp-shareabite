import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from './axiosInstance';


// Get all requests for a specific post (creator)
export const getRequestsByPost = async (postId) => {
  try {
    const res = await axiosInstance.get(`/requests/post/${postId}`);
    return res.data;
  } catch (err) {
    console.error('Error fetching post requests:', err);
    throw err;
  }
};

// Create a new food request (by charity)
export const createRequest = async ({ postId, requesterId, receiverId }) => {
  try {
    const res = await axiosInstance.post('/requests/create', {
      postId,
      requesterId,
      receiverId,
    });
    return res.data;
  } catch (err) {
    console.error(' Error creating request:', err.response?.data || err.message);
    throw err;
  }
};

export const getRequestedNotifications = async (userId) => {
  const res = await axiosInstance.get(`/requests/requested-notifications/${userId}`);
  return res.data;
};
