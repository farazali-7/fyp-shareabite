import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from './axiosInstance';

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
    console.error('Error creating request:', err.response?.data || err.message);
    throw err;
  }
};



// Get notifications for sent requests (by charity)
export const getRequestedNotifications = async (userId) => {
  const res = await axiosInstance.get(`/requests/requested-notifications/${userId}`);
  return res.data;
};

// Accept a food request (restaurant accepts charity)
export const acceptRequest = async ({ postId, requesterId, notificationId }) => {
  const payload = { postId, requesterId, notificationId };
  const res = await axiosInstance.post('/requests/accept', payload);
  return res.data;
};

// Reject a food request
export const rejectRequest = async ({ postId, requesterId, notificationId }) => {
  const payload = { postId, requesterId, notificationId };
  const res = await axiosInstance.post('/requests/reject', payload);
  return res.data;
};

// Get notifications for a charity user
export const getCharityNotifications = async (userId) => {
  try {
    const res = await axiosInstance.get(`/requests/notifications/charity/${userId}`);
    return res.data;
  } catch (err) {
    console.error('Error fetching charity notifications:', err.response?.data || err.message);
    return [];
  }
};

export const checkExistingRequest = async (postId, requesterId) => {
  try {
    const res = await axiosInstance.get(`/requests/check/${postId}/${requesterId}`);
    return res.data; 
  } catch (err) {
    throw err;
  }
};

export const cancelRequest = async ({ postId, requesterId }) => {
  try {
    const res = await axiosInstance.post('/requests/cancel', {
      postId,
      requesterId,
    });
    return res.data;
  } catch (err) {
    throw err;
  }
};
