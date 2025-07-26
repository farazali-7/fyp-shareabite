import axiosInstance from './axiosInstance';

// Get users by license status
export const getPendingLicenses = async () => {
  const res = await axiosInstance.get('/admin/licenses?status=pending');
  return res.data;
};

export const getApprovedLicenses = async () => {
  const res = await axiosInstance.get('/admin/licenses?status=approved');
  return res.data;
};

export const getRejectedLicenses = async () => {
  const res = await axiosInstance.get('/admin/licenses?status=rejected');
  return res.data;
};

// Approve a license
export const approveLicense = async (userId, adminNote = '') => {
  const res = await axiosInstance.patch(`/admin/licenses/${userId}/approve`, {
    adminNote,
  });
  return res.data;
};

// Reject a license
export const rejectLicense = async (userId, reason) => {
  try {
    const res = await axiosInstance.patch(`/admin/licenses/${userId}/reject`, {
      reason,
    });
    return res.data;
  } catch (err) {
    console.error('Rejection failed:', err?.response?.data);
    throw new Error(err.response?.data?.message || 'Rejection failed');
  }
};
