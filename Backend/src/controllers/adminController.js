import User from '../models/user.js';

// GET users by status
export const getLicensesByStatus = async (req, res) => {
  try {
    const { status } = req.query;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status filter' });
    }

    const users = await User.find({ status }).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Approve license
export const approveLicense = async (req, res) => {
  const { userId } = req.params;
  const { adminNote } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.status = 'approved';
    user.approvedByAdmin = true;
    user.rejectionReason = null;

    user.approvalHistory.push({
      action: 'approved',
      adminNote,
      timestamp: new Date(),
    });

    await user.save();
    res.json({ message: 'User approved successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reject license
export const rejectLicense = async (req, res) => {
  const { userId } = req.params;
  const { reason } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.status = 'rejected';
    user.approvedByAdmin = false;
    user.rejectionReason = reason;

    user.approvalHistory.push({
      action: 'rejected',
      adminNote: reason,
      timestamp: new Date(),
    });

    await user.save();
    res.json({ message: 'User rejected successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/*// controllers/adminController.js
import User from '../models/user.js';

// Get users by status
export const getLicensesByStatus = async (req, res) => {
  try {
    const { status } = req.query;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status filter' });
    }

    const users = await User.find({ status }).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Approve license
export const approveLicense = async (req, res) => {
  const { userId } = req.params;
  const { adminNote } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.status = 'approved';
    user.approvedByAdmin = true;
    user.rejectionReason = null;

    user.approvalHistory.push({
      action: 'approved',
      adminNote,
      date: new Date(),
    });

    await user.save();
    res.json({ message: 'User approved successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
//  Reject License by licenseId
export const rejectLicense = async (req, res) => {
  const { licenseId } = req.params;
  const { reason } = req.body;

  try {
    const license = await License.findById(licenseId);
    if (!license) return res.status(404).json({ message: 'License not found' });

    license.status = 'rejected';
    license.rejectionReason = reason;

    await license.save();
    res.json({ message: 'License rejected successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
*/