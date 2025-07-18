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
    console.error(' Error creating request:', err.response?.data || err.message);
    throw err;
  }
};

export const getRequestedNotifications = async (userId) => {
  const res = await axiosInstance.get(`/requests/requested-notifications/${userId}`);
  return res.data;
};

// Accept a food request (restaurant accepts charity)
export const acceptRequest = async ({ postId, requesterId, notificationId }) => {
  const payload = { postId, requesterId, notificationId };
  console.log('Sending ACCEPT payload:', payload);  // <-- ADD THIS LINE
  const res = await axiosInstance.post('/requests/accept', payload);
  return res.data;
};

// Reject a food request
export const rejectRequest = async ({ postId, requesterId, notificationId }) => {
  const payload = { postId, requesterId, notificationId };
  console.log('Sending REJECT payload:', payload);  // <-- ADD THIS LINE
  const res = await axiosInstance.post('/requests/reject', payload);
  return res.data;
};


//get charity Notifications 
export const getCharityNotifications = async (userId) => {
  try {
    const res = await axiosInstance.get(`requests/notifications/charity/${userId}`);
    return res.data;
  } catch (err) {
    console.error("Charity notification fetch error", err);
    return [];
  }
};
