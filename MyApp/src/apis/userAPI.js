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
  // Authorization header is added automatically by the axios interceptor
  const res = await axiosInstance.get('/users/profile');
  return res.data;
};

export const getProfileAndPostsById = async (userId) => {
  try {
    const res = await axiosInstance.get(`/users/profile/${userId}`);
    return res.data;
  } catch (err) {
    throw err.response?.data?.message || 'Failed to fetch profile and posts';
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
    // Authorization header is added automatically by the axios interceptor
    const res = await axiosInstance.post('/users/create', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
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

export const deletePost = async (postId) => {
  try {
    // Authorization header is added automatically by the axios interceptor
    const res = await axiosInstance.delete(`/users/${postId}`);
    return res.data;
  } catch (err) {
    throw err.response?.data?.message || 'Failed to delete post';
  }
};

export const editPost = async (postId, updatedFields) => {
  try {
    const res = await axiosInstance.put(`/users/${postId}`, updatedFields);
    return res.data;
  } catch (err) {
    throw err.response?.data?.message || 'Failed to update post';
  }
};

// Step 1 of forgot-password flow: called immediately after Firebase OTP verification.
// The server confirms the phone exists in DB and issues a short-lived reset token.
export const issueResetToken = async (contactNumber) => {
  try {
    const res = await axiosInstance.post('/users/issue-reset-token', { contactNumber });
    return res.data; // { resetToken }
  } catch (err) {
    throw new Error(err.response?.data?.message || 'Failed to issue reset token');
  }
};

// Step 2 of forgot-password flow: submit the reset token + new password.
export const resetUserPassword = async ({ resetToken, newPassword }) => {
  try {
    const res = await axiosInstance.post('/users/reset-password', { resetToken, newPassword });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || 'Failed to reset password');
  }
};

