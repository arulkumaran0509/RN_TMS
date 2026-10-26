const express = require('express');
const router = express.Router();
const masterController = require('../controllers/masterController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All master routes require authentication
router.use(protect);

// Only SuperAdmin can modify master data
const authorizeAdmin = authorize('SuperAdmin');

router.get('/departments', masterController.getDepartments);
router.post('/departments', authorizeAdmin, masterController.createDepartment);
router.put('/departments/:id', authorizeAdmin, masterController.updateDepartment);
router.delete('/departments/:id', authorizeAdmin, masterController.deleteDepartment);

router.get('/programmes', masterController.getProgrammes);
router.post('/programmes', authorizeAdmin, masterController.createProgramme);
router.put('/programmes/:id', authorizeAdmin, masterController.updateProgramme);
router.delete('/programmes/:id', authorizeAdmin, masterController.deleteProgramme);

router.get('/blocks', masterController.getBlocks);
router.post('/blocks', authorizeAdmin, masterController.createBlock);
router.put('/blocks/:id', authorizeAdmin, masterController.updateBlock);
router.delete('/blocks/:id', authorizeAdmin, masterController.deleteBlock);

router.get('/rooms', masterController.getRooms);
router.post('/rooms', authorizeAdmin, masterController.createRoom);
router.put('/rooms/:id', authorizeAdmin, masterController.updateRoom);
router.delete('/rooms/:id', authorizeAdmin, masterController.deleteRoom);

router.get('/roles', masterController.getRoles);
router.post('/roles', authorizeAdmin, masterController.createRole);
router.put('/roles/:id', authorizeAdmin, masterController.updateRole);
router.delete('/roles/:id', authorizeAdmin, masterController.deleteRole);

router.get('/users', authorizeAdmin, masterController.getUsers);
router.post('/users', authorizeAdmin, masterController.createUser);
router.put('/users/:id', authorizeAdmin, masterController.updateUser);
router.delete('/users/:id', authorizeAdmin, masterController.deleteUser);

module.exports = router;
