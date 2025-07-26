import express from 'express';
import {
  getLicensesByStatus,
  approveLicense,
  rejectLicense,
} from '../controllers/adminController.js';

const router = express.Router();

// GET /admin/licenses?status=pending|approved|rejected
router.get('/licenses', getLicensesByStatus);

// PATCH /admin/licenses/:userId/approve
router.patch('/licenses/:userId/approve', approveLicense);

// PATCH /admin/licenses/:userId/reject
router.patch('/licenses/:userId/reject', rejectLicense);

export default router;
