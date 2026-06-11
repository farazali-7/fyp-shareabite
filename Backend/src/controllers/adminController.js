import User from '../models/user.js';
import asyncHandler from '../utils/asyncHandler.js';
import { NotFoundError } from '../errors/NotFoundError.js';

export const getLicensesByStatus = asyncHandler(async (req, res) => {
  const { status } = req.query; // already validated as enum by validate middleware
  const users = await User.find({ status }).select('-password');
  res.json({ success: true, users });
});

export const approveLicense = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const { adminNote } = req.body;

  const user = await User.findById(userId);
  if (!user) return next(new NotFoundError('User'));

  user.status = 'approved';
  user.approvedByAdmin = true;
  user.rejectionReason = null;
  user.approvalHistory.push({ action: 'approved', adminNote, timestamp: new Date() });
  await user.save();

  res.json({ success: true, message: 'User approved successfully' });
});

export const rejectLicense = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const { reason } = req.body;

  const user = await User.findById(userId);
  if (!user) return next(new NotFoundError('User'));

  user.status = 'rejected';
  user.approvedByAdmin = false;
  user.rejectionReason = reason || null;
  user.approvalHistory.push({ action: 'rejected', adminNote: reason, timestamp: new Date() });
  await user.save();

  res.json({ success: true, message: 'User rejected successfully' });
});
