import express from 'express';
import HRController from '../controllers/hrController.js';

const router = express.Router();
const controller = new HRController();

// Departments
router.get('/departments', controller.getDepartments);
router.post('/departments', controller.saveDepartment);
router.delete('/departments/:id', controller.deleteDepartment);

// Designations
router.get('/designations', controller.getDesignations);
router.post('/designations', controller.saveDesignation);
router.delete('/designations/:id', controller.deleteDesignation);

// Leave Types
router.get('/leave-types', controller.getLeaveTypes);
router.post('/leave-types', controller.saveLeaveType);
router.delete('/leave-types/:id', controller.deleteLeaveType);

// Staff Leaves
router.get('/staff-leaves', controller.getLeaveRequests);
router.post('/staff-leaves', controller.saveLeaveRequest);
router.delete('/staff-leaves/:id', controller.deleteLeaveRequest);

// Staff Attendance
router.get('/staff-attendance', controller.getStaffAttendance);
router.post('/staff-attendance', controller.saveStaffAttendance);

// Staff Ratings
router.get('/staff-ratings', controller.getStaffRatings);
router.put('/staff-ratings/:id/status', controller.toggleRatingStatus);

// Payroll
router.get('/payroll', controller.getPayroll);
router.post('/payroll', controller.savePayslip);

export default router;
