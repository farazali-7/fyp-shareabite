import axiosInstance from './axiosInstance';

export const fulfillPost = async (postId) => {
  const res = await axiosInstance.patch(`/users/posts/${postId}/fulfill`);
  return res.data;
};

export const cancelPost = async (postId) => {
  const res = await axiosInstance.patch(`/users/posts/${postId}/cancel`);
  return res.data;
};

export const undoAcceptPost = async (postId) => {
  const res = await axiosInstance.patch(`/users/posts/${postId}/undo-accept`);
  return res.data;
};

export const getMyPostRequests = async () => {
  const res = await axiosInstance.get('/requests/my-post-requests');
  return res.data;
};

export const getMyRequests = async () => {
  const res = await axiosInstance.get('/requests/my-requests');
  return res.data;
};
