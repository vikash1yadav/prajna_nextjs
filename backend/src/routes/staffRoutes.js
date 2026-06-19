import express from 'express';
import StaffController from '../controllers/staffController.js';

const router = express.Router();
const controller = new StaffController();

// Staff endpoints
router.get('/staff', controller.getStaff);
router.get('/staff/:id/profile', controller.getStaffProfile);
router.post('/staff', controller.saveStaff);
router.delete('/staff/:id', controller.deleteStaff);

// Role endpoints
router.get('/roles', controller.getRoles);
router.post('/roles', controller.saveRole);
router.delete('/roles/:id', controller.deleteRole);

export default router;
