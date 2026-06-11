import express from 'express';
import { getLicensesByStatus, approveLicense, rejectLicense } from '../controllers/adminController.js';
import protect, { isAdmin } from '../middlewares/authMiddleware.js';
import validate from '../middlewares/validate.js';
import {
  getLicensesSchema,
  approveLicenseSchema,
  rejectLicenseSchema,
} from '../validation/admin.validation.js';

const router = express.Router();

// Order: protect → isAdmin → validate → controller
router.get('/licenses',                 protect, isAdmin, validate(getLicensesSchema),    getLicensesByStatus);
router.patch('/licenses/:userId/approve', protect, isAdmin, validate(approveLicenseSchema), approveLicense);
router.patch('/licenses/:userId/reject',  protect, isAdmin, validate(rejectLicenseSchema),  rejectLicense);

export default router;
