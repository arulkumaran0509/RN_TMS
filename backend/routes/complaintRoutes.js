const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// Dashboard stats (All roles can see)
router.get('/stats', complaintController.getDashboardStats);

// List complaints (Role/Dept based logic inside controller)
router.get('/', complaintController.getComplaints);

// Fetch only current user's complaints
router.get('/my', complaintController.getMyComplaints);

const upload = require('../middleware/uploadMiddleware');

// Raise complaint
router.post('/', upload.single('attachment'), complaintController.createComplaint);

// SuperAdmin: Assign complaint
router.patch('/:id/assign', authorize('SuperAdmin'), complaintController.assignComplaint);

// Staff/Admin: Update status (Mark as Completed)
router.patch('/:id/status', complaintController.updateComplaintStatus);

module.exports = router;
